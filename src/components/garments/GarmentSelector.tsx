import { useState } from 'react'
import {
  Stack,
  Group,
  Text,
  Card,
  Grid,
  Badge,
  Button,
  ActionIcon,
  Tooltip,
  Select,
  NumberInput,
  Alert,
  LoadingOverlay,
  Modal,
  Textarea
} from '@mantine/core'
import {
  IconPlus,
  IconMinus,
  IconShirt,
  IconCheck,
  IconInfoCircle
} from '@tabler/icons-react'
import { useDisclosure } from '@mantine/hooks'
import { useGarments, useGarmentCategories } from '../../hooks/useGarments'
import type { Garment, GarmentCategory } from '../../types/database.types'

interface GarmentSelectorProps {
  onGarmentSelect: (garment: Garment, quantity: number, isRental: boolean, notes?: string) => void
  selectedGarments?: {
    garment: Garment
    quantity: number
    isRental: boolean
    notes?: string
  }[]
  disabled?: boolean
  showPricing?: boolean
}

interface GarmentWithSelection extends Garment {
  category: GarmentCategory
  selectedQuantity: number
  selectedIsRental: boolean
  selectedNotes?: string
}

export function GarmentSelector({ 
  onGarmentSelect, 
  selectedGarments = [], 
  disabled = false, 
  showPricing = true 
}: GarmentSelectorProps) {
  const [selectedCategory, setSelectedCategory] = useState<string>('')
  const [detailsOpened, { open: openDetails, close: closeDetails }] = useDisclosure(false)
  const [selectedGarmentDetails, setSelectedGarmentDetails] = useState<GarmentWithSelection | null>(null)

  const { categories, loading: categoriesLoading } = useGarmentCategories()
  const { garments, loading: garmentsLoading, setFilters } = useGarments({
    filters: selectedCategory ? { category_id: selectedCategory, active: true } : { active: true },
    limit: 100
  })

  // Create a map of selected garments for quick lookup
  const selectedGarmentsMap = new Map(
    selectedGarments.map(sg => [sg.garment.id, sg])
  )

  // Enhance garments with selection state
  const enhancedGarments: GarmentWithSelection[] = garments.map(garment => {
    const selected = selectedGarmentsMap.get(garment.id)
    return {
      ...garment,
      selectedQuantity: selected?.quantity || 0,
      selectedIsRental: selected?.isRental ?? true,
      selectedNotes: selected?.notes || ''
    }
  })

  const handleCategoryChange = (categoryId: string | null) => {
    setSelectedCategory(categoryId || '')
    setFilters(categoryId ? { category_id: categoryId, active: true } : { active: true })
  }

  const handleQuantityChange = (garment: GarmentWithSelection, quantity: number) => {
    if (quantity > 0) {
      onGarmentSelect(garment, quantity, garment.selectedIsRental, garment.selectedNotes)
    } else {
      // Remove selection if quantity is 0
      onGarmentSelect(garment, 0, garment.selectedIsRental, garment.selectedNotes)
    }
  }

  const handleRentalToggle = (garment: GarmentWithSelection) => {
    const newIsRental = !garment.selectedIsRental
    if (garment.selectedQuantity > 0) {
      onGarmentSelect(garment, garment.selectedQuantity, newIsRental, garment.selectedNotes)
    }
  }

  const handleShowDetails = (garment: GarmentWithSelection) => {
    setSelectedGarmentDetails(garment)
    openDetails()
  }

  const handleNotesUpdate = (notes: string) => {
    if (selectedGarmentDetails && selectedGarmentDetails.selectedQuantity > 0) {
      onGarmentSelect(
        selectedGarmentDetails, 
        selectedGarmentDetails.selectedQuantity, 
        selectedGarmentDetails.selectedIsRental, 
        notes
      )
    }
    closeDetails()
  }

  const formatPrice = (price: number | null) => {
    if (!price) return 'N/A'
    return `£${price.toFixed(2)}`
  }

  const categoryOptions = categories.map(cat => ({
    value: cat.id,
    label: cat.name
  }))

  return (
    <Stack gap="md">
      <LoadingOverlay 
        visible={categoriesLoading || garmentsLoading} 
        overlayProps={{ radius: "sm", blur: 2 }} 
      />

      <Group justify="space-between">
        <Text size="lg" fw={600}>Select Garments</Text>
        {selectedGarments.length > 0 && (
          <Badge color="blue" size="lg">
            {selectedGarments.reduce((sum, sg) => sum + sg.quantity, 0)} items selected
          </Badge>
        )}
      </Group>

      <Select
        label="Filter by Category"
        placeholder="All categories"
        data={[{ value: '', label: 'All Categories' }, ...categoryOptions]}
        value={selectedCategory}
        onChange={handleCategoryChange}
        disabled={disabled || categoriesLoading}
      />

      {enhancedGarments.length === 0 && !garmentsLoading && (
        <Alert color="gray" icon={<IconInfoCircle size={16} />}>
          No garments found in the selected category.
        </Alert>
      )}

      <Grid>
        {enhancedGarments.map((garment) => {
          const isSelected = garment.selectedQuantity > 0

          return (
            <Grid.Col key={garment.id} span={{ base: 12, sm: 6, md: 4, lg: 3 }}>
              <Card
                shadow="sm"
                padding="md"
                radius="md"
                withBorder
                style={{
                  borderColor: isSelected ? 'var(--mantine-color-blue-6)' : undefined,
                  borderWidth: isSelected ? 2 : 1
                }}
              >
                <Stack gap="sm">
                  {/* Garment Image Placeholder */}
                  <div
                    style={{
                      height: 120,
                      backgroundColor: 'var(--mantine-color-gray-1)',
                      borderRadius: 'var(--mantine-radius-sm)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center'
                    }}
                  >
                    <IconShirt size={48} color="var(--mantine-color-gray-5)" />
                  </div>

                  {/* Garment Details */}
                  <Stack gap="xs">
                    <Text fw={500} size="sm" lineClamp={2}>
                      {garment.name}
                    </Text>

                    <Group justify="space-between">
                      <Badge size="xs" color="gray">
                        {garment.category.name}
                      </Badge>
                      {garment.color && (
                        <Badge size="xs" variant="light">
                          {garment.color}
                        </Badge>
                      )}
                    </Group>

                    {showPricing && (
                      <Group justify="space-between" gap="xs">
                        <Text size="xs" c="dimmed">
                          Rental: {formatPrice(garment.rental_price)}
                        </Text>
                        <Text size="xs" c="dimmed">
                          Purchase: {formatPrice(garment.purchase_price)}
                        </Text>
                      </Group>
                    )}

                    {garment.description && (
                      <Text size="xs" c="dimmed" lineClamp={2}>
                        {garment.description}
                      </Text>
                    )}
                  </Stack>

                  {/* Selection Controls */}
                  <Stack gap="xs">
                    <Group justify="space-between">
                      <Group gap="xs">
                        <ActionIcon
                          variant="light"
                          color="red"
                          size="sm"
                          onClick={() => handleQuantityChange(garment, Math.max(0, garment.selectedQuantity - 1))}
                          disabled={disabled || garment.selectedQuantity === 0}
                        >
                          <IconMinus size={16} />
                        </ActionIcon>

                        <NumberInput
                          value={garment.selectedQuantity}
                          onChange={(value) => handleQuantityChange(garment, Number(value) || 0)}
                          min={0}
                          max={10}
                          size="xs"
                          style={{ width: 60 }}
                          disabled={disabled}
                        />

                        <ActionIcon
                          variant="light"
                          color="blue"
                          size="sm"
                          onClick={() => handleQuantityChange(garment, garment.selectedQuantity + 1)}
                          disabled={disabled}
                        >
                          <IconPlus size={16} />
                        </ActionIcon>
                      </Group>

                      <Tooltip label="More details">
                        <ActionIcon
                          variant="light"
                          color="gray"
                          size="sm"
                          onClick={() => handleShowDetails(garment)}
                        >
                          <IconInfoCircle size={16} />
                        </ActionIcon>
                      </Tooltip>
                    </Group>

                    {isSelected && (
                      <Group justify="space-between">
                        <Button
                          variant={garment.selectedIsRental ? "filled" : "light"}
                          color="green"
                          size="xs"
                          leftSection={garment.selectedIsRental ? <IconCheck size={14} /> : null}
                          onClick={() => handleRentalToggle(garment)}
                          disabled={disabled}
                        >
                          Rental
                        </Button>
                        <Button
                          variant={!garment.selectedIsRental ? "filled" : "light"}
                          color="blue"
                          size="xs"
                          leftSection={!garment.selectedIsRental ? <IconCheck size={14} /> : null}
                          onClick={() => handleRentalToggle(garment)}
                          disabled={disabled}
                        >
                          Purchase
                        </Button>
                      </Group>
                    )}
                  </Stack>
                </Stack>
              </Card>
            </Grid.Col>
          )
        })}
      </Grid>

      <Modal
        opened={detailsOpened}
        onClose={closeDetails}
        title="Garment Details"
        size="md"
        centered
      >
        {selectedGarmentDetails && (
          <Stack gap="md">
            <Group justify="space-between">
              <Text fw={600} size="lg">
                {selectedGarmentDetails.name}
              </Text>
              <Badge color="blue">
                {selectedGarmentDetails.category.name}
              </Badge>
            </Group>

            {selectedGarmentDetails.description && (
              <Text size="sm">
                {selectedGarmentDetails.description}
              </Text>
            )}

            <Grid>
              {selectedGarmentDetails.color && (
                <Grid.Col span={6}>
                  <Text size="sm" fw={500}>Color:</Text>
                  <Text size="sm" c="dimmed">{selectedGarmentDetails.color}</Text>
                </Grid.Col>
              )}
              {selectedGarmentDetails.material && (
                <Grid.Col span={6}>
                  <Text size="sm" fw={500}>Material:</Text>
                  <Text size="sm" c="dimmed">{selectedGarmentDetails.material}</Text>
                </Grid.Col>
              )}
              {selectedGarmentDetails.brand && (
                <Grid.Col span={6}>
                  <Text size="sm" fw={500}>Brand:</Text>
                  <Text size="sm" c="dimmed">{selectedGarmentDetails.brand}</Text>
                </Grid.Col>
              )}
              {selectedGarmentDetails.sku && (
                <Grid.Col span={6}>
                  <Text size="sm" fw={500}>SKU:</Text>
                  <Text size="sm" c="dimmed">{selectedGarmentDetails.sku}</Text>
                </Grid.Col>
              )}
            </Grid>

            {showPricing && (
              <Group justify="space-between">
                <div>
                  <Text size="sm" fw={500}>Rental Price:</Text>
                  <Text size="sm" c="dimmed">{formatPrice(selectedGarmentDetails.rental_price)}</Text>
                </div>
                <div>
                  <Text size="sm" fw={500}>Purchase Price:</Text>
                  <Text size="sm" c="dimmed">{formatPrice(selectedGarmentDetails.purchase_price)}</Text>
                </div>
              </Group>
            )}

            {selectedGarmentDetails.selectedQuantity > 0 && (
              <Stack gap="xs">
                <Text size="sm" fw={500}>Special Notes:</Text>
                <Textarea
                  placeholder="Add any special notes for this garment..."
                  value={selectedGarmentDetails.selectedNotes || ''}
                  onChange={(e) => setSelectedGarmentDetails({
                    ...selectedGarmentDetails,
                    selectedNotes: e.currentTarget.value
                  })}
                  rows={3}
                />
                <Group justify="flex-end">
                  <Button
                    variant="light"
                    onClick={closeDetails}
                  >
                    Cancel
                  </Button>
                  <Button
                    onClick={() => handleNotesUpdate(selectedGarmentDetails.selectedNotes || '')}
                  >
                    Save Notes
                  </Button>
                </Group>
              </Stack>
            )}
          </Stack>
        )}
      </Modal>
    </Stack>
  )
}