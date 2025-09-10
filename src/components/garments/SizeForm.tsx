import { useState } from 'react'
import {
  Stack,
  Group,
  Text,
  Card,
  Grid,
  TextInput,
  Select,
  Button,
  Alert,
  LoadingOverlay,
  Badge,
  ActionIcon,
  Tooltip,
  Title
} from '@mantine/core'
import { useForm } from '@mantine/form'
import {
  IconRuler,
  IconAlertCircle,
  IconEdit,
  IconPlus
} from '@tabler/icons-react'
import { notifications } from '@mantine/notifications'
import { useMemberSizes } from '../../hooks/useGarments'
import type { MemberSize, MemberSizeInsert, SizeType } from '../../types/database.types'

interface SizeFormProps {
  memberId: string
  memberName: string
  onSizeAdded?: (size: MemberSize) => void
  disabled?: boolean
}

const SIZE_TYPE_OPTIONS = [
  { value: 'chest', label: 'Chest', unit: 'inches' },
  { value: 'waist', label: 'Waist', unit: 'inches' },
  { value: 'inside_leg', label: 'Inside Leg', unit: 'inches' },
  { value: 'trouser_waist', label: 'Trouser Waist', unit: 'inches' },
  { value: 'jacket_length', label: 'Jacket Length', unit: 'inches' },
  { value: 'shirt_collar', label: 'Shirt Collar', unit: 'inches' },
  { value: 'shoe_size', label: 'Shoe Size', unit: 'UK' },
  { value: 'height', label: 'Height', unit: 'feet/inches' },
  { value: 'weight', label: 'Weight', unit: 'stones/lbs' }
]

const MEASUREMENT_UNITS = [
  { value: 'inches', label: 'Inches' },
  { value: 'cm', label: 'Centimeters' },
  { value: 'UK', label: 'UK Size' },
  { value: 'EU', label: 'EU Size' },
  { value: 'US', label: 'US Size' },
  { value: 'feet/inches', label: 'Feet & Inches' },
  { value: 'stones/lbs', label: 'Stones & Pounds' }
]

export function SizeForm({ memberId, memberName, onSizeAdded, disabled = false }: SizeFormProps) {
  const [showAddForm, setShowAddForm] = useState(false)
  const [editingSizeId, setEditingSizeId] = useState<string | null>(null)
  const [submitError, setSubmitError] = useState<string | null>(null)

  const {
    sizes,
    latestSizes,
    loading,
    error,
    addSize,
    updateSize,
    fetchSizes
  } = useMemberSizes({ memberId })

  const form = useForm<MemberSizeInsert>({
    initialValues: {
      member_id: memberId,
      size_type: 'chest' as SizeType,
      measurement: '',
      measurement_unit: 'inches',
      notes: '',
      measured_by: ''
    },
    validate: {
      measurement: (value) => 
        !value?.trim() ? 'Measurement is required' : null,
      measured_by: (value) => 
        !value?.trim() ? 'Measured by is required' : null
    }
  })

  const handleSubmit = async (values: MemberSizeInsert) => {
    setSubmitError(null)
    
    try {
      const newSize = await addSize(values)
      
      notifications.show({
        title: 'Size Added',
        message: `${values.size_type} measurement added successfully`,
        color: 'green'
      })

      form.reset()
      setShowAddForm(false)
      onSizeAdded?.(newSize)
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to add size'
      setSubmitError(errorMessage)
    }
  }

  const handleEdit = (size: MemberSize) => {
    form.setValues({
      member_id: memberId,
      size_type: size.size_type,
      measurement: size.measurement,
      measurement_unit: size.measurement_unit || 'inches',
      notes: size.notes || '',
      measured_by: size.measured_by || ''
    })
    setEditingSizeId(size.id)
    setShowAddForm(true)
  }

  const handleUpdate = async (values: MemberSizeInsert) => {
    if (!editingSizeId) return
    
    setSubmitError(null)
    
    try {
      await updateSize(editingSizeId, {
        measurement: values.measurement,
        measurement_unit: values.measurement_unit,
        notes: values.notes,
        measured_by: values.measured_by
      })
      
      notifications.show({
        title: 'Size Updated',
        message: `${values.size_type} measurement updated successfully`,
        color: 'green'
      })

      form.reset()
      setShowAddForm(false)
      setEditingSizeId(null)
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to update size'
      setSubmitError(errorMessage)
    }
  }

  const handleCancel = () => {
    form.reset()
    setShowAddForm(false)
    setEditingSizeId(null)
    setSubmitError(null)
  }

  const getSizeTypeLabel = (sizeType: string) => {
    return SIZE_TYPE_OPTIONS.find(opt => opt.value === sizeType)?.label || sizeType
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-GB', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  return (
    <Stack gap="md">
      <LoadingOverlay visible={loading} overlayProps={{ radius: "sm", blur: 2 }} />

      <Group justify="space-between">
        <Title order={4}>
          <Group gap="sm">
            <IconRuler size={20} />
            Size Measurements - {memberName}
          </Group>
        </Title>
        {!showAddForm && (
          <Button
            leftSection={<IconPlus size={16} />}
            onClick={() => setShowAddForm(true)}
            disabled={disabled || loading}
          >
            Add Measurement
          </Button>
        )}
      </Group>

      {error && (
        <Alert 
          color="red" 
          title="Error Loading Sizes"
          icon={<IconAlertCircle size={16} />}
        >
          {error}
        </Alert>
      )}

      {showAddForm && (
        <Card shadow="sm" padding="lg" radius="md" withBorder>
          <Stack gap="md">
            <Text fw={500}>
              {editingSizeId ? 'Update' : 'Add New'} Measurement
            </Text>

            {submitError && (
              <Alert 
                icon={<IconAlertCircle size={16} />} 
                color="red" 
                title="Error"
                onClose={() => setSubmitError(null)}
                withCloseButton
              >
                {submitError}
              </Alert>
            )}

            <form onSubmit={form.onSubmit(editingSizeId ? handleUpdate : handleSubmit)}>
              <Stack gap="md">
                <Grid>
                  <Grid.Col span={6}>
                    <Select
                      label="Measurement Type"
                      data={SIZE_TYPE_OPTIONS}
                      {...form.getInputProps('size_type')}
                      disabled={editingSizeId !== null} // Can't change type when editing
                    />
                  </Grid.Col>
                  <Grid.Col span={3}>
                    <TextInput
                      label="Measurement"
                      placeholder="Enter measurement"
                      required
                      {...form.getInputProps('measurement')}
                    />
                  </Grid.Col>
                  <Grid.Col span={3}>
                    <Select
                      label="Unit"
                      data={MEASUREMENT_UNITS}
                      {...form.getInputProps('measurement_unit')}
                    />
                  </Grid.Col>
                </Grid>

                <Grid>
                  <Grid.Col span={6}>
                    <TextInput
                      label="Measured By"
                      placeholder="Staff member name"
                      required
                      {...form.getInputProps('measured_by')}
                    />
                  </Grid.Col>
                  <Grid.Col span={6}>
                    <TextInput
                      label="Notes"
                      placeholder="Additional notes (optional)"
                      {...form.getInputProps('notes')}
                    />
                  </Grid.Col>
                </Grid>

                <Group justify="flex-end">
                  <Button 
                    variant="light" 
                    onClick={handleCancel}
                    disabled={loading}
                  >
                    Cancel
                  </Button>
                  <Button 
                    type="submit"
                    loading={loading}
                  >
                    {editingSizeId ? 'Update' : 'Add'} Measurement
                  </Button>
                </Group>
              </Stack>
            </form>
          </Stack>
        </Card>
      )}

      {/* Current Measurements */}
      <Card shadow="sm" padding="lg" radius="md" withBorder>
        <Stack gap="md">
          <Text fw={500}>Current Measurements</Text>
          
          {Object.keys(latestSizes).length === 0 ? (
            <Text c="dimmed" ta="center" py="xl">
              No measurements recorded yet
            </Text>
          ) : (
            <Grid>
              {Object.entries(latestSizes).map(([sizeType, size]) => (
                <Grid.Col key={sizeType} span={{ base: 12, sm: 6, md: 4 }}>
                  <Card withBorder padding="sm">
                    <Stack gap="xs">
                      <Group justify="space-between">
                        <Text fw={500} size="sm">
                          {getSizeTypeLabel(sizeType)}
                        </Text>
                        <Group gap="xs">
                          <Tooltip label="Edit">
                            <ActionIcon
                              variant="light"
                              color="blue"
                              size="sm"
                              onClick={() => handleEdit(size)}
                              disabled={disabled}
                            >
                              <IconEdit size={14} />
                            </ActionIcon>
                          </Tooltip>
                        </Group>
                      </Group>
                      
                      <Group justify="space-between">
                        <Text size="lg" fw={600}>
                          {size.measurement}
                        </Text>
                        <Badge size="xs" variant="light">
                          {size.measurement_unit}
                        </Badge>
                      </Group>
                      
                      <Text size="xs" c="dimmed">
                        Measured by {size.measured_by}
                      </Text>
                      
                      <Text size="xs" c="dimmed">
                        {formatDate(size.measured_at)}
                      </Text>
                      
                      {size.notes && (
                        <Text size="xs" c="dimmed" style={{ fontStyle: 'italic' }}>
                          {size.notes}
                        </Text>
                      )}
                    </Stack>
                  </Card>
                </Grid.Col>
              ))}
            </Grid>
          )}
        </Stack>
      </Card>

      {/* Size History */}
      {sizes.length > Object.keys(latestSizes).length && (
        <Card shadow="sm" padding="lg" radius="md" withBorder>
          <Stack gap="md">
            <Text fw={500}>Measurement History</Text>
            <Text size="sm" c="dimmed">
              Previous measurements for reference
            </Text>
            
            <Stack gap="xs">
              {sizes
                .filter(size => size.id !== latestSizes[size.size_type]?.id)
                .map((size) => (
                  <Group key={size.id} justify="space-between" p="sm" 
                         style={{ backgroundColor: 'var(--mantine-color-gray-0)', borderRadius: 4 }}>
                    <Group>
                      <Text size="sm" fw={500}>
                        {getSizeTypeLabel(size.size_type)}
                      </Text>
                      <Text size="sm">
                        {size.measurement} {size.measurement_unit}
                      </Text>
                      <Text size="xs" c="dimmed">
                        by {size.measured_by}
                      </Text>
                    </Group>
                    <Text size="xs" c="dimmed">
                      {formatDate(size.measured_at)}
                    </Text>
                  </Group>
                ))}
            </Stack>
          </Stack>
        </Card>
      )}
    </Stack>
  )
}