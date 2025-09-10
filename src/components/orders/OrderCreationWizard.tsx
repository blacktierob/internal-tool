import { useState, useEffect } from 'react'
import {
  Stepper,
  Button,
  Group,
  Stack,
  Card,
  Title,
  Text,
  Alert,
  Divider,
  TextInput,
  Select,
  NumberInput,
  Grid,
  Badge,
  ActionIcon,
  Tooltip,
  Checkbox,
  SimpleGrid,
  Box
} from '@mantine/core'
import { 
  IconUser, 
  IconShirt, 
  IconRuler, 
  IconCheck, 
  IconAlertCircle,
  IconSearch,
  IconUserPlus,
  IconCalendar,
  IconMapPin,
  IconPlus,
  IconTrash,
  IconEdit
} from '@tabler/icons-react'
import { useForm } from '@mantine/form'
import { DatePickerInput } from '@mantine/dates'
import { notifications } from '@mantine/notifications'
import { useCustomers } from '../../hooks/useCustomers'
import { useOrders } from '../../hooks/useOrders'
import { useGarments, useGarmentCategories } from '../../hooks/useGarments'
import type { 
  Customer, 
  CustomerInsert, 
  OrderInsert, 
  Garment,
  GarmentCategory 
} from '../../types/database.types'

interface OrderCreationWizardProps {
  onOrderCreated?: (orderId: string) => void
  onCancel?: () => void
}

interface OutfitTemplate {
  id: string
  name: string
  roles: string[]
  garments: {
    categoryId: string
    garmentId: string | null
    hire: boolean
  }[]
}

interface SizeMeasurement {
  type: string
  value: number
  unit: string
  required: boolean
}

const MEMBER_ROLES = [
  { value: 'groom', label: 'Groom' },
  { value: 'best_man', label: 'Best Man' },
  { value: 'groomsman', label: 'Groomsman' },
  { value: 'usher', label: 'Usher' },
  { value: 'father_groom', label: 'Father of Groom' },
  { value: 'father_bride', label: 'Father of Bride' },
  { value: 'pageboy', label: 'Page Boy' },
  { value: 'other', label: 'Other' }
]

const SIZE_TYPES = [
  { type: 'chest', label: 'Chest', unit: 'inches', required: true },
  { type: 'waist', label: 'Waist', unit: 'inches', required: true },
  { type: 'inside_leg', label: 'Inside Leg', unit: 'inches', required: true },
  { type: 'collar', label: 'Collar', unit: 'inches', required: false },
  { type: 'sleeve', label: 'Sleeve', unit: 'inches', required: false },
  { type: 'shoe_size', label: 'Shoe Size', unit: 'UK', required: false },
  { type: 'height', label: 'Height', unit: 'feet/inches', required: false }
]

export function OrderCreationWizard({ onOrderCreated, onCancel }: OrderCreationWizardProps) {
  const [currentStep, setCurrentStep] = useState(0)
  const [loading, setLoading] = useState(false)

  // Step 1: Customer & Function Details
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null)
  const [showNewCustomerForm, setShowNewCustomerForm] = useState(false)
  const [customerSearchQuery, setCustomerSearchQuery] = useState('')
  const [searchResults, setSearchResults] = useState<Customer[]>([])
  const [searchLoading, setSearchLoading] = useState(false)

  // Step 2: Outfit Builder
  const [outfitTemplates, setOutfitTemplates] = useState<OutfitTemplate[]>([])
  const [expectedMembers, setExpectedMembers] = useState(4)

  // Step 3: Groom Sizes
  const [groomSizes, setGroomSizes] = useState<SizeMeasurement[]>([])

  const { searchCustomers, createCustomer } = useCustomers({ autoFetch: false })
  const { createOrder } = useOrders({ autoFetch: false })
  const { categories } = useGarmentCategories()
  const { garments } = useGarments({ autoFetch: true })

  // Function details form
  const functionForm = useForm({
    initialValues: {
      wedding_date: null,
      wedding_venue: '',
      function_type: 'wedding',
      notes: ''
    },
    validate: {
      wedding_date: (value) => (!value ? 'Wedding date is required' : null)
    }
  })

  // New customer form
  const customerForm = useForm<CustomerInsert>({
    initialValues: {
      first_name: '',
      last_name: '',
      email: '',
      phone: '',
      address: ''
    },
    validate: {
      first_name: (value) => (value.trim().length < 2 ? 'First name must be at least 2 characters' : null),
      last_name: (value) => (value.trim().length < 2 ? 'Last name must be at least 2 characters' : null),
      email: (value) => {
        if (!value.trim()) return null
        return /^\S+@\S+$/.test(value) ? null : 'Invalid email format'
      }
    }
  })

  // Initialize outfit templates and sizes
  useEffect(() => {
    if (categories.length > 0) {
      // Initialize with a default groom outfit
      const groomOutfit: OutfitTemplate = {
        id: 'groom-outfit',
        name: 'Groom Outfit',
        roles: ['groom'],
        garments: categories.map(cat => ({
          categoryId: cat.id,
          garmentId: null,
          hire: true
        }))
      }
      setOutfitTemplates([groomOutfit])
    }

    // Initialize groom sizes
    const sizes = SIZE_TYPES.map(sizeType => ({
      type: sizeType.type,
      value: 0,
      unit: sizeType.unit,
      required: sizeType.required
    }))
    setGroomSizes(sizes)
  }, [categories])

  // Customer search with debounce
  useEffect(() => {
    const performSearch = async () => {
      if (customerSearchQuery.length >= 2) {
        setSearchLoading(true)
        try {
          const results = await searchCustomers(customerSearchQuery, 10)
          setSearchResults(results)
        } catch (error) {
          console.error('Search error:', error)
          setSearchResults([])
        } finally {
          setSearchLoading(false)
        }
      } else {
        setSearchResults([])
      }
    }

    const debounceTimer = setTimeout(performSearch, 300)
    return () => clearTimeout(debounceTimer)
  }, [customerSearchQuery, searchCustomers])

  const handleCustomerSearch = (query: string) => {
    setCustomerSearchQuery(query)
  }

  const handleCustomerSelect = (customer: Customer) => {
    setSelectedCustomer(customer)
    setShowNewCustomerForm(false)
    setCustomerSearchQuery('')
    setSearchResults([])
  }

  const handleShowNewCustomerForm = () => {
    setSelectedCustomer(null)
    setShowNewCustomerForm(true)
    setCustomerSearchQuery('')
    setSearchResults([])
  }

  const handleCreateNewCustomer = async () => {
    if (!customerForm.isValid()) {
      customerForm.validate()
      return
    }

    setLoading(true)
    try {
      const newCustomer = await createCustomer(customerForm.values)
      setSelectedCustomer(newCustomer)
      setShowNewCustomerForm(false)
      customerForm.reset()
      notifications.show({
        title: 'Customer Created',
        message: `${newCustomer.first_name} ${newCustomer.last_name} has been created`,
        color: 'green'
      })
    } catch (error) {
      notifications.show({
        title: 'Error',
        message: error instanceof Error ? error.message : 'Failed to create customer',
        color: 'red'
      })
    } finally {
      setLoading(false)
    }
  }

  const handleBackToSearch = () => {
    setSelectedCustomer(null)
    setShowNewCustomerForm(false)
  }

  const addOutfitTemplate = () => {
    const newOutfit: OutfitTemplate = {
      id: `outfit-${Date.now()}`,
      name: 'New Outfit',
      roles: ['groomsman'],
      garments: categories.map(cat => ({
        categoryId: cat.id,
        garmentId: null,
        hire: true
      }))
    }
    setOutfitTemplates([...outfitTemplates, newOutfit])
  }

  const removeOutfitTemplate = (outfitId: string) => {
    if (outfitTemplates.length > 1) {
      setOutfitTemplates(outfitTemplates.filter(outfit => outfit.id !== outfitId))
    }
  }

  const updateOutfitTemplate = (outfitId: string, updates: Partial<OutfitTemplate>) => {
    setOutfitTemplates(outfits => 
      outfits.map(outfit => 
        outfit.id === outfitId ? { ...outfit, ...updates } : outfit
      )
    )
  }

  const updateOutfitGarment = (outfitId: string, categoryId: string, garmentId: string | null, hire: boolean) => {
    setOutfitTemplates(outfits =>
      outfits.map(outfit => 
        outfit.id === outfitId 
          ? {
              ...outfit,
              garments: outfit.garments.map(garment =>
                garment.categoryId === categoryId 
                  ? { ...garment, garmentId, hire }
                  : garment
              )
            }
          : outfit
      )
    )
  }

  const handleSizeChange = (sizeType: string, value: number) => {
    setGroomSizes(sizes =>
      sizes.map(size =>
        size.type === sizeType ? { ...size, value } : size
      )
    )
  }

  const toggleOutfitRole = (outfitId: string, role: string, checked: boolean) => {
    setOutfitTemplates(outfits =>
      outfits.map(outfit => 
        outfit.id === outfitId 
          ? {
              ...outfit,
              roles: checked 
                ? [...outfit.roles, role]
                : outfit.roles.filter(r => r !== role)
            }
          : outfit
      )
    )
  }

  const handleStepNext = () => {
    if (currentStep === 0) {
      // Validate customer and function details
      if (!selectedCustomer) {
        notifications.show({
          title: 'Customer Required',
          message: 'Please select or create a customer',
          color: 'orange'
        })
        return
      }
      if (!functionForm.isValid()) {
        functionForm.validate()
        return
      }
    } else if (currentStep === 1) {
      // Validate outfit templates
      const hasValidOutfits = outfitTemplates.some(outfit => 
        outfit.garments.some(garment => garment.garmentId)
      )
      if (!hasValidOutfits) {
        notifications.show({
          title: 'Outfits Required',
          message: 'Please configure at least one outfit with garments',
          color: 'orange'
        })
        return
      }
    }
    
    setCurrentStep(prev => Math.min(prev + 1, 2))
  }

  const handleStepBack = () => {
    setCurrentStep(prev => Math.max(prev - 1, 0))
  }

  const handleSubmit = async () => {
    setLoading(true)
    
    try {
      if (!selectedCustomer) throw new Error('No customer selected')
      
      // Create the order
      const orderData: OrderInsert = {
        customer_id: selectedCustomer.id,
        wedding_date: functionForm.values.wedding_date?.toISOString().split('T')[0] || null,
        wedding_venue: functionForm.values.wedding_venue || null,
        function_type: functionForm.values.function_type,
        notes: functionForm.values.notes || null,
        total_members: expectedMembers,
        actual_members: 0,
        status: 'draft'
      }

      const newOrder = await createOrder(orderData)

      // TODO: Save outfit templates and groom sizes to database
      // This will require additional service methods

      notifications.show({
        title: 'Order Created Successfully',
        message: `Order ${newOrder.order_number} has been created for ${selectedCustomer.first_name} ${selectedCustomer.last_name}`,
        color: 'green'
      })

      onOrderCreated?.(newOrder.id)
    } catch (error) {
      notifications.show({
        title: 'Error',
        message: error instanceof Error ? error.message : 'Failed to create order',
        color: 'red'
      })
    } finally {
      setLoading(false)
    }
  }

  const getGarmentsForCategory = (categoryId: string) => {
    return garments.filter(g => g.category_id === categoryId && g.active)
  }

  return (
    <Stack gap="md">
      {/* Progress Stepper */}
      <Stepper active={currentStep} size="sm" breakpoint="sm">
        <Stepper.Step 
          icon={<IconUser size={18} />} 
          label="Customer & Function"
          description="Select customer and function details"
        />
        <Stepper.Step 
          icon={<IconShirt size={18} />} 
          label="Outfit Builder"
          description="Create outfit templates"
        />
        <Stepper.Step 
          icon={<IconRuler size={18} />} 
          label="Groom Sizes"
          description="Collect groom measurements"
        />
      </Stepper>

      <Divider />

      {/* Step Content */}
      <div style={{ minHeight: '500px' }}>
        {/* Step 0: Customer & Function Details */}
        {currentStep === 0 && (
          <Stack gap="md">
            <Title order={3}>Customer & Function Details</Title>
            
            {/* Customer Selection */}
            {!selectedCustomer && !showNewCustomerForm && (
              <>
                <Alert color="blue" icon={<IconSearch size={16} />}>
                  Search for an existing customer or create a new one for this order.
                </Alert>
                
                <TextInput
                  placeholder="Search by name, email, or phone..."
                  value={customerSearchQuery}
                  onChange={(e) => handleCustomerSearch(e.currentTarget.value)}
                  leftSection={<IconSearch size={16} />}
                  rightSection={
                    customerSearchQuery && (
                      <Button 
                        size="xs" 
                        variant="light"
                        onClick={() => setCustomerSearchQuery('')}
                      >
                        Clear
                      </Button>
                    )
                  }
                />
                
                {searchLoading && (
                  <Text ta="center" c="dimmed">Searching customers...</Text>
                )}
                
                {searchResults.length > 0 && customerSearchQuery && (
                  <Card withBorder padding="md">
                    <Text fw={500} mb="sm">Found {searchResults.length} customer{searchResults.length !== 1 ? 's' : ''}</Text>
                    <Stack gap="xs">
                      {searchResults.slice(0, 5).map((customer) => (
                        <Card key={customer.id} withBorder padding="sm" style={{ cursor: 'pointer' }}
                          onClick={() => handleCustomerSelect(customer)}
                        >
                          <Group justify="space-between">
                            <div>
                              <Text fw={500}>{customer.first_name} {customer.last_name}</Text>
                              <Text size="sm" c="dimmed">
                                {customer.email && `${customer.email} • `}
                                {customer.phone || 'No phone'}
                              </Text>
                            </div>
                            <Button size="xs" variant="light">Select</Button>
                          </Group>
                        </Card>
                      ))}
                    </Stack>
                  </Card>
                )}
                
                {!searchLoading && customerSearchQuery.length >= 2 && searchResults.length === 0 && (
                  <Alert color="yellow" icon={<IconSearch size={16} />}>
                    No customers found matching "{customerSearchQuery}". You can create a new customer below.
                  </Alert>
                )}
                
                <Group justify="center">
                  <Button
                    leftSection={<IconUserPlus size={16} />}
                    variant="light"
                    onClick={handleShowNewCustomerForm}
                  >
                    Create New Customer
                  </Button>
                </Group>
              </>
            )}

            {/* Selected Customer Display */}
            {selectedCustomer && (
              <Alert color="green" icon={<IconCheck size={16} />}>
                Selected customer: <strong>{selectedCustomer.first_name} {selectedCustomer.last_name}</strong>
                {selectedCustomer.email && ` (${selectedCustomer.email})`}
                <Button 
                  size="xs" 
                  variant="light" 
                  ml="md"
                  onClick={handleBackToSearch}
                >
                  Change
                </Button>
              </Alert>
            )}

            {/* New Customer Form */}
            {showNewCustomerForm && (
              <Card withBorder padding="md">
                <Group justify="space-between" mb="md">
                  <Text fw={600} size="lg">Create New Customer</Text>
                  <Button 
                    size="xs" 
                    variant="light"
                    onClick={handleBackToSearch}
                  >
                    Back to Search
                  </Button>
                </Group>
                
                <form>
                  <Grid>
                    <Grid.Col span={{ base: 12, sm: 6 }}>
                      <TextInput
                        label="First Name"
                        placeholder="Enter first name"
                        required
                        {...customerForm.getInputProps('first_name')}
                      />
                    </Grid.Col>
                    <Grid.Col span={{ base: 12, sm: 6 }}>
                      <TextInput
                        label="Last Name"
                        placeholder="Enter last name"
                        required
                        {...customerForm.getInputProps('last_name')}
                      />
                    </Grid.Col>
                    <Grid.Col span={{ base: 12, sm: 6 }}>
                      <TextInput
                        label="Email"
                        placeholder="Enter email (optional)"
                        type="email"
                        {...customerForm.getInputProps('email')}
                      />
                    </Grid.Col>
                    <Grid.Col span={{ base: 12, sm: 6 }}>
                      <TextInput
                        label="Phone"
                        placeholder="Enter phone number (optional)"
                        {...customerForm.getInputProps('phone')}
                      />
                    </Grid.Col>
                    <Grid.Col span={12}>
                      <TextInput
                        label="Address"
                        placeholder="Enter address (optional)"
                        {...customerForm.getInputProps('address')}
                      />
                    </Grid.Col>
                  </Grid>
                  
                  <Group justify="flex-end" mt="md">
                    <Button onClick={handleCreateNewCustomer} loading={loading}>
                      Create Customer
                    </Button>
                  </Group>
                </form>
              </Card>
            )}

            {/* Function Details Form */}
            {selectedCustomer && (
              <Card withBorder padding="md">
                <Text fw={600} size="lg" mb="md">Function Details</Text>
                
                <form>
                  <Grid>
                    <Grid.Col span={{ base: 12, sm: 6 }}>
                      <DatePickerInput
                        label="Wedding Date"
                        placeholder="Select wedding date"
                        required
                        leftSection={<IconCalendar size={16} />}
                        {...functionForm.getInputProps('wedding_date')}
                      />
                    </Grid.Col>
                    <Grid.Col span={{ base: 12, sm: 6 }}>
                      <Select
                        label="Function Type"
                        placeholder="Select function type"
                        data={[
                          { value: 'wedding', label: 'Wedding' },
                          { value: 'prom', label: 'Prom' },
                          { value: 'formal', label: 'Formal Event' },
                          { value: 'other', label: 'Other' }
                        ]}
                        {...functionForm.getInputProps('function_type')}
                      />
                    </Grid.Col>
                    <Grid.Col span={12}>
                      <TextInput
                        label="Wedding Venue"
                        placeholder="Enter venue name (optional)"
                        leftSection={<IconMapPin size={16} />}
                        {...functionForm.getInputProps('wedding_venue')}
                      />
                    </Grid.Col>
                    <Grid.Col span={12}>
                      <TextInput
                        label="Notes"
                        placeholder="Any additional notes (optional)"
                        {...functionForm.getInputProps('notes')}
                      />
                    </Grid.Col>
                  </Grid>
                </form>
              </Card>
            )}
          </Stack>
        )}

        {/* Step 1: Outfit Builder */}
        {currentStep === 1 && (
          <Stack gap="md">
            <Group justify="space-between">
              <Title order={3}>Outfit Builder</Title>
              <Group>
                <NumberInput
                  label="Expected Wedding Party Size"
                  placeholder="Total members"
                  value={expectedMembers}
                  onChange={(value) => setExpectedMembers(Number(value) || 4)}
                  min={1}
                  max={50}
                  w={200}
                />
                <Button
                  leftSection={<IconPlus size={16} />}
                  onClick={addOutfitTemplate}
                >
                  Add Outfit Type
                </Button>
              </Group>
            </Group>

            <Alert color="blue" icon={<IconShirt size={16} />}>
              Create outfit templates for different roles (e.g., Groom, Best Man, Groomsmen). 
              These will be used when adding wedding party members.
            </Alert>

            <Stack gap="lg">
              {outfitTemplates.map((outfit, index) => (
                <Card key={outfit.id} withBorder padding="md">
                  <Group justify="space-between" mb="md">
                    <Group>
                      <TextInput
                        value={outfit.name}
                        onChange={(e) => updateOutfitTemplate(outfit.id, { name: e.currentTarget.value })}
                        placeholder="Outfit name"
                        fw={600}
                        variant="unstyled"
                        size="lg"
                      />
                      <Group gap="xs">
                        {outfit.roles.map(role => (
                          <Badge key={role} color="blue" size="sm">
                            {MEMBER_ROLES.find(r => r.value === role)?.label || role}
                          </Badge>
                        ))}
                      </Group>
                    </Group>
                    <Group gap="xs">
                      {outfitTemplates.length > 1 && (
                        <ActionIcon
                          color="red"
                          variant="light"
                          onClick={() => removeOutfitTemplate(outfit.id)}
                        >
                          <IconTrash size={16} />
                        </ActionIcon>
                      )}
                    </Group>
                  </Group>

                  {/* Role Selection Checkboxes */}
                  <Box mb="md">
                    <Text size="sm" fw={500} mb="xs">Assign to Roles:</Text>
                    <SimpleGrid cols={{ base: 2, sm: 3, md: 4 }} spacing="xs">
                      {MEMBER_ROLES.map(role => (
                        <Checkbox
                          key={role.value}
                          label={role.label}
                          size="sm"
                          checked={outfit.roles.includes(role.value)}
                          onChange={(e) => 
                            toggleOutfitRole(outfit.id, role.value, e.currentTarget.checked)
                          }
                        />
                      ))}
                    </SimpleGrid>
                  </Box>

                  <Grid>
                    {categories.map(category => {
                      const garmentSelection = outfit.garments.find(g => g.categoryId === category.id)
                      const categoryGarments = getGarmentsForCategory(category.id)

                      return (
                        <Grid.Col key={category.id} span={{ base: 12, sm: 6, md: 4 }}>
                          <Stack gap="xs">
                            <Text fw={500} size="sm">{category.name}</Text>
                            <Select
                              placeholder={`Select ${category.name.toLowerCase()}`}
                              data={categoryGarments.map(g => ({
                                value: g.id,
                                label: `${g.name} - £${g.hire_price}/${g.purchase_price}`
                              }))}
                              value={garmentSelection?.garmentId || null}
                              onChange={(value) => 
                                updateOutfitGarment(
                                  outfit.id, 
                                  category.id, 
                                  value, 
                                  garmentSelection?.hire || true
                                )
                              }
                              searchable
                              clearable
                            />
                            {garmentSelection?.garmentId && (
                              <Checkbox
                                label="Hire"
                                checked={garmentSelection.hire}
                                onChange={(e) =>
                                  updateOutfitGarment(
                                    outfit.id,
                                    category.id,
                                    garmentSelection.garmentId,
                                    e.currentTarget.checked
                                  )
                                }
                              />
                            )}
                          </Stack>
                        </Grid.Col>
                      )
                    })}
                  </Grid>
                </Card>
              ))}
            </Stack>
          </Stack>
        )}

        {/* Step 2: Groom Sizes */}
        {currentStep === 2 && (
          <Stack gap="md">
            <Title order={3}>Groom Size Measurements</Title>

            <Alert color="orange" icon={<IconRuler size={16} />}>
              Collect the groom's measurements. These can be updated later if needed.
            </Alert>

            <Card withBorder padding="md">
              <Grid>
                {groomSizes.map(size => (
                  <Grid.Col key={size.type} span={{ base: 12, sm: 6, md: 4 }}>
                    <NumberInput
                      label={`${size.type.replace('_', ' ').toUpperCase()} ${size.required ? '*' : ''}`}
                      placeholder={`Enter ${size.type.replace('_', ' ')}`}
                      value={size.value || ''}
                      onChange={(value) => handleSizeChange(size.type, Number(value) || 0)}
                      min={0}
                      max={size.type === 'shoe_size' ? 15 : 100}
                      step={0.5}
                      suffix={` ${size.unit}`}
                      precision={size.type === 'shoe_size' ? 1 : 0.5}
                    />
                  </Grid.Col>
                ))}
              </Grid>
            </Card>
          </Stack>
        )}
      </div>

      <Divider />

      {/* Navigation Buttons */}
      <Group justify="space-between">
        <Group>
          {currentStep > 0 && (
            <Button variant="light" onClick={handleStepBack}>
              Back
            </Button>
          )}
          <Button variant="light" onClick={onCancel}>
            Cancel
          </Button>
        </Group>

        <Group>
          {currentStep < 2 ? (
            <Button onClick={handleStepNext}>
              Next
            </Button>
          ) : (
            <Button 
              onClick={handleSubmit}
              loading={loading}
              leftSection={<IconCheck size={16} />}
            >
              Create Order
            </Button>
          )}
        </Group>
      </Group>
    </Stack>
  )
}