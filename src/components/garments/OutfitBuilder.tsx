import { useState } from 'react'
import {
  Stack,
  Group,
  Text,
  Card,
  Tabs,
  Badge,
  Button,
  Alert,
  LoadingOverlay,
  Title,
  Divider,
} from '@mantine/core'
import {
  IconShirt,
  IconRuler,
  IconCheck,
  IconAlertCircle,
  IconShoppingCart
} from '@tabler/icons-react'
import { notifications } from '@mantine/notifications'
import { modals } from '@mantine/modals'
import { GarmentSelector } from './GarmentSelector'
import { SizeForm } from './SizeForm'
import { useMemberGarments } from '../../hooks/useGarments'
import type { Garment, OrderMember, MemberSize } from '../../types/database.types'

interface OutfitBuilderProps {
  member: OrderMember
  onOutfitComplete?: (member: OrderMember) => void
  disabled?: boolean
}

interface SelectedGarment {
  garment: Garment
  quantity: number
  isRental: boolean
  notes?: string
}

export function OutfitBuilder({ member, onOutfitComplete, disabled = false }: OutfitBuilderProps) {
  const [activeTab, setActiveTab] = useState<string>('garments')
  const [selectedGarments, setSelectedGarments] = useState<SelectedGarment[]>([])
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false)

  const {
    memberGarments,
    loading: garmentLoading,
    assignGarment,
    updateAssignment,
    removeGarment,
    fetchMemberGarments
  } = useMemberGarments({ memberId: member.id })

  // Convert member garments to selected garments format
  const convertToSelectedGarments = (): SelectedGarment[] => {
    return memberGarments.map(mg => ({
      garment: mg.garment,
      quantity: mg.quantity,
      isRental: mg.is_rental,
      notes: mg.notes || undefined
    }))
  }

  // Initialize selected garments from existing assignments
  useState(() => {
    if (memberGarments.length > 0 && selectedGarments.length === 0) {
      setSelectedGarments(convertToSelectedGarments())
    }
  })

  const handleGarmentSelect = (garment: Garment, quantity: number, isRental: boolean, notes?: string) => {
    setSelectedGarments(prev => {
      const existingIndex = prev.findIndex(sg => sg.garment.id === garment.id)
      
      if (quantity === 0) {
        // Remove garment if quantity is 0
        if (existingIndex >= 0) {
          setHasUnsavedChanges(true)
          return prev.filter((_, index) => index !== existingIndex)
        }
        return prev
      }
      
      const newSelection: SelectedGarment = {
        garment,
        quantity,
        isRental,
        notes
      }
      
      if (existingIndex >= 0) {
        // Update existing selection
        const updated = [...prev]
        updated[existingIndex] = newSelection
        setHasUnsavedChanges(true)
        return updated
      } else {
        // Add new selection
        setHasUnsavedChanges(true)
        return [...prev, newSelection]
      }
    })
  }

  const handleSaveOutfit = async () => {
    try {
      // Get current assignments to compare
      const currentAssignments = memberGarments
      const selectedGarmentIds = selectedGarments.map(sg => sg.garment.id)
      const currentGarmentIds = currentAssignments.map(mg => mg.garment.id)

      // Remove assignments that are no longer selected
      const toRemove = currentAssignments.filter(mg => !selectedGarmentIds.includes(mg.garment.id))
      for (const assignment of toRemove) {
        await removeGarment(assignment.id)
      }

      // Add or update assignments
      for (const selected of selectedGarments) {
        const existing = currentAssignments.find(mg => mg.garment.id === selected.garment.id)
        
        if (existing) {
          // Update existing assignment if changed
          if (existing.quantity !== selected.quantity || 
              existing.is_rental !== selected.isRental || 
              existing.notes !== selected.notes) {
            await updateAssignment(existing.id, {
              quantity: selected.quantity,
              is_rental: selected.isRental,
              notes: selected.notes || null
            })
          }
        } else {
          // Create new assignment
          await assignGarment({
            member_id: member.id,
            garment_id: selected.garment.id,
            quantity: selected.quantity,
            is_rental: selected.isRental,
            notes: selected.notes || null
          })
        }
      }

      setHasUnsavedChanges(false)
      
      notifications.show({
        title: 'Outfit Saved',
        message: `Outfit for ${member.first_name} ${member.last_name} has been saved`,
        color: 'green'
      })

      // Refresh member garments
      await fetchMemberGarments()
      
    } catch (error) {
      notifications.show({
        title: 'Error',
        message: error instanceof Error ? error.message : 'Failed to save outfit',
        color: 'red'
      })
    }
  }

  const handleDiscardChanges = () => {
    modals.openConfirmModal({
      title: 'Discard Changes',
      children: (
        <Text>
          Are you sure you want to discard your unsaved changes? This action cannot be undone.
        </Text>
      ),
      labels: { confirm: 'Discard', cancel: 'Keep Changes' },
      confirmProps: { color: 'red' },
      onConfirm: () => {
        setSelectedGarments(convertToSelectedGarments())
        setHasUnsavedChanges(false)
      }
    })
  }

  const handleSizeAdded = (size: MemberSize) => {
    // Could trigger outfit completion check or other logic
    console.log('Size added:', size)
  }

  const getTotalItems = () => {
    return selectedGarments.reduce((sum, sg) => sum + sg.quantity, 0)
  }

  const getRentalItems = () => {
    return selectedGarments.filter(sg => sg.isRental).reduce((sum, sg) => sum + sg.quantity, 0)
  }

  const getPurchaseItems = () => {
    return selectedGarments.filter(sg => !sg.isRental).reduce((sum, sg) => sum + sg.quantity, 0)
  }

  return (
    <Stack gap="md">
      <LoadingOverlay visible={garmentLoading} overlayProps={{ radius: "sm", blur: 2 }} />

      <Card shadow="sm" padding="lg" radius="md" withBorder>
        <Stack gap="md">
          <Group justify="space-between">
            <Title order={3}>
              Outfit Builder - {member.first_name} {member.last_name}
            </Title>
            <Group>
              <Badge color={member.role === 'groom' ? 'gold' : 'blue'}>
                {member.role.replace('_', ' ').toUpperCase()}
              </Badge>
              {member.measurements_taken && (
                <Badge color="green" leftSection={<IconCheck size={14} />}>
                  Measured
                </Badge>
              )}
              {member.outfit_assigned && (
                <Badge color="blue" leftSection={<IconShirt size={14} />}>
                  Outfit Assigned
                </Badge>
              )}
            </Group>
          </Group>

          {hasUnsavedChanges && (
            <Alert color="yellow" icon={<IconAlertCircle size={16} />}>
              <Group justify="space-between">
                <Text size="sm">You have unsaved changes to this outfit.</Text>
                <Group gap="xs">
                  <Button size="xs" variant="light" onClick={handleDiscardChanges}>
                    Discard
                  </Button>
                  <Button size="xs" onClick={handleSaveOutfit}>
                    Save Changes
                  </Button>
                </Group>
              </Group>
            </Alert>
          )}

          {selectedGarments.length > 0 && (
            <Card withBorder p="sm" style={{ backgroundColor: 'var(--mantine-color-blue-0)' }}>
              <Group justify="space-between">
                <Group>
                  <Group gap="xs">
                    <IconShoppingCart size={16} />
                    <Text fw={500} size="sm">{getTotalItems()} items selected</Text>
                  </Group>
                  <Divider orientation="vertical" />
                  <Text size="sm" c="dimmed">
                    {getRentalItems()} rental • {getPurchaseItems()} purchase
                  </Text>
                </Group>
                {hasUnsavedChanges && (
                  <Button size="xs" onClick={handleSaveOutfit}>
                    Save Outfit
                  </Button>
                )}
              </Group>
            </Card>
          )}

          <Tabs value={activeTab} onChange={setActiveTab}>
            <Tabs.List>
              <Tabs.Tab 
                value="garments" 
                leftSection={<IconShirt size={16} />}
              >
                Garments ({selectedGarments.length})
              </Tabs.Tab>
              <Tabs.Tab 
                value="measurements" 
                leftSection={<IconRuler size={16} />}
              >
                Measurements
              </Tabs.Tab>
            </Tabs.List>

            <Tabs.Panel value="garments" pt="md">
              <GarmentSelector
                onGarmentSelect={handleGarmentSelect}
                selectedGarments={selectedGarments}
                disabled={disabled}
                showPricing={true}
              />
            </Tabs.Panel>

            <Tabs.Panel value="measurements" pt="md">
              <SizeForm
                memberId={member.id}
                memberName={`${member.first_name} ${member.last_name}`}
                onSizeAdded={handleSizeAdded}
                disabled={disabled}
              />
            </Tabs.Panel>
          </Tabs>

          {selectedGarments.length > 0 && (
            <Group justify="flex-end" mt="md">
              {hasUnsavedChanges ? (
                <Group>
                  <Button variant="light" color="gray" onClick={handleDiscardChanges}>
                    Discard Changes
                  </Button>
                  <Button onClick={handleSaveOutfit}>
                    Save Outfit
                  </Button>
                </Group>
              ) : (
                <Button 
                  variant="light" 
                  color="green" 
                  leftSection={<IconCheck size={16} />}
                  onClick={() => onOutfitComplete?.(member)}
                >
                  Outfit Complete
                </Button>
              )}
            </Group>
          )}
        </Stack>
      </Card>
    </Stack>
  )
}