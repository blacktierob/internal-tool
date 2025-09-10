import { useState, useEffect } from 'react'
import {
  Stack,
  Group,
  Text,
  Button,
  TextInput,
  Select,
  Card,
  Grid,
  Stepper,
  Divider,
  Alert,
  LoadingOverlay,
  NumberInput,
  Checkbox,
  Badge
} from '@mantine/core'
import {
  IconUser,
  IconShirt,
  IconRuler,
  IconCheck,
  IconAlertTriangle,
  IconSearch,
  IconUserPlus
} from '@tabler/icons-react'
import { useForm } from '@mantine/form'
import { notifications } from '@mantine/notifications'
import { useGarments, useGarmentCategories } from '../../hooks/useGarments'
import { useCustomers } from '../../hooks/useCustomers'
import { orderService } from '../../services/orders.service'
import type { 
  OrderMemberInsert, 
  OrderMember, 
  MemberSizeInsert,
  Customer 
} from '../../types/database.types'

interface MemberAdditionFormProps {
  orderId: string
  onMemberAdded: (member: OrderMember) => void
  onCancel: () => void
}

interface OutfitSelection {
  categoryId: string
  garmentId: string | null
  hire: boolean
  required: boolean
}

interface SizeMeasurement {
  sizeType: string
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

export function MemberAdditionForm({ orderId, onMemberAdded, onCancel }: MemberAdditionFormProps) {
  const [currentStep, setCurrentStep] = useState(0)
  const [loading, setLoading] = useState(false)
  const [outfitSelections, setOutfitSelections] = useState<OutfitSelection[]>([])
  const [sizeMeasurements, setSizeMeasurements] = useState<SizeMeasurement[]>([])
  
  // Customer search states
  const [customerSearchQuery, setCustomerSearchQuery] = useState('')
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null)
  const [showNewCustomerForm, setShowNewCustomerForm] = useState(false)
  const [searchResults, setSearchResults] = useState<Customer[]>([])
  const [searchLoading, setSearchLoading] = useState(false)

  const { categories, loading: categoriesLoading } = useGarmentCategories()
  const { garments, loading: garmentsLoading } = useGarments({ autoFetch: true })
  const { searchCustomers } = useCustomers({ autoFetch: false })

  // Member details form
  const memberForm = useForm<Omit<OrderMemberInsert, 'orderId'>>({
    initialValues: {
      first_name: '',
      last_name: '',
      email: '',
      phone: '',
      role: '',
      sort_order: 1
    },
    validate: {
      first_name: (value) => (value.trim().length < 2 ? 'First name must be at least 2 characters' : null),
      last_name: (value) => (value.trim().length < 2 ? 'Last name must be at least 2 characters' : null),
      email: (value) => {
        if (!value.trim()) return null // Email is optional
        return /^\S+@\S+$/.test(value) ? null : 'Invalid email format'
      },
      role: (value) => (!value ? 'Please select a role' : null)
    }
  })

  // Initialize outfit selections and size measurements
  useEffect(() => {
    if (categories.length > 0) {
      const selections = categories.map(category => ({
        categoryId: category.id,
        garmentId: null,
        hire: true,
        required: ['jacket', 'trousers', 'shirt'].includes(category.name.toLowerCase())
      }))
      setOutfitSelections(selections)
    }

    const measurements = SIZE_TYPES.map(sizeType => ({
      sizeType: sizeType.type,
      value: 0,
      unit: sizeType.unit,
      required: sizeType.required
    }))
    setSizeMeasurements(measurements)
  }, [categories])

  // Search customers when query changes
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

  const handleStepNext = () => {
    if (currentStep === 0) {
      // Ensure customer is selected or new customer form is filled
      if (!selectedCustomer && !showNewCustomerForm) {
        notifications.show({
          title: 'Customer Required',
          message: 'Please search for an existing customer or create a new one',
          color: 'orange'
        })
        return
      }
      
      // If showing new customer form or have selected customer, validate member details
      if (selectedCustomer || showNewCustomerForm) {
        if (!memberForm.isValid()) {
          memberForm.validate()
          return
        }
      }
    } else if (currentStep === 1) {
      // Validate outfit selections - at least one required category must be selected
      const requiredSelections = outfitSelections.filter(s => s.required)
      const hasRequiredSelections = requiredSelections.every(s => s.garmentId)
      
      if (!hasRequiredSelections) {
        notifications.show({
          title: 'Outfit Selection Required',
          message: 'Please select garments for all required categories (Jacket, Trousers, Shirt)',
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

  const handleOutfitChange = (categoryId: string, field: keyof OutfitSelection, value: any) => {
    setOutfitSelections(prev => 
      prev.map(selection => 
        selection.categoryId === categoryId 
          ? { ...selection, [field]: value }
          : selection
      )
    )
  }

  const handleSizeChange = (sizeType: string, value: number) => {
    setSizeMeasurements(prev => 
      prev.map(measurement => 
        measurement.sizeType === sizeType 
          ? { ...measurement, value }
          : measurement
      )
    )
  }

  const handleCustomerSearch = (query: string) => {
    setCustomerSearchQuery(query)
  }

  const handleCustomerSelect = (customer: Customer) => {
    setSelectedCustomer(customer)
    setShowNewCustomerForm(false)
    
    // Pre-populate form with customer data
    memberForm.setValues({
      first_name: customer.first_name,
      last_name: customer.last_name,
      email: customer.email || '',
      phone: customer.phone || '',
      role: '',
      sort_order: 1
    })
  }

  const handleShowNewCustomerForm = () => {
    setSelectedCustomer(null)
    setShowNewCustomerForm(true)
    setCustomerSearchQuery('')
    
    // Clear form
    memberForm.reset()
  }

  const handleBackToSearch = () => {
    setSelectedCustomer(null)
    setShowNewCustomerForm(false)
  }

  const handleSubmit = async () => {
    setLoading(true)
    
    try {
      // Prepare member data
      const memberData: OrderMemberInsert = {
        ...memberForm.values,
        order_id: orderId
      }

      // Add member through the order service
      const newMember = await orderService.addMember(memberData)

      // Add garments if any are selected
      const selectedOutfits = outfitSelections.filter(s => s.garmentId)
      if (selectedOutfits.length > 0) {
        for (const outfit of selectedOutfits) {
          await orderService.addMemberGarment({
            member_id: newMember.id,
            garment_id: outfit.garmentId!,
            hire: outfit.hire
          })
        }
      }

      // Add measurements if any are provided
      const validMeasurements = sizeMeasurements.filter(m => m.value > 0)
      if (validMeasurements.length > 0) {
        for (const measurement of validMeasurements) {
          await orderService.addMemberSize({
            member_id: newMember.id,
            size_type: measurement.sizeType,
            value: measurement.value,
            unit: measurement.unit
          })
        }
      }

      notifications.show({
        title: 'Member Added Successfully',
        message: `${memberForm.values.first_name} ${memberForm.values.last_name} has been added to the wedding party`,
        color: 'green'
      })

      onMemberAdded(newMember)
    } catch (error) {
      notifications.show({
        title: 'Error',
        message: error instanceof Error ? error.message : 'Failed to add member',
        color: 'red'
      })
    } finally {
      setLoading(false)
    }
  }

  const getStepTitle = (step: number) => {
    switch (step) {
      case 0: return 'Member Details'
      case 1: return 'Outfit Selection'
      case 2: return 'Size Measurements'
      default: return ''
    }
  }

  const getGarmentsForCategory = (categoryId: string) => {
    return garments.filter(g => g.category_id === categoryId && g.active)
  }

  return (
    <div style={{ position: 'relative' }}>
      <LoadingOverlay visible={loading} overlayProps={{ radius: "sm", blur: 2 }} />
      
      <Stack gap="md">
        {/* Progress Stepper */}
        <Stepper active={currentStep} size="sm" breakpoint="sm">
          <Stepper.Step 
            icon={<IconUser size={18} />} 
            label="Details"
            description="Member information"
          />
          <Stepper.Step 
            icon={<IconShirt size={18} />} 
            label="Outfit"
            description="Garment selection"
          />
          <Stepper.Step 
            icon={<IconRuler size={18} />} 
            label="Measurements"
            description="Size collection"
          />
        </Stepper>

        <Divider />

        {/* Step Content */}
        <div style={{ minHeight: '400px' }}>
          <Text size="lg" fw={600} mb="md">
            {getStepTitle(currentStep)}
          </Text>

          {/* Step 0: Member Details */}
          {currentStep === 0 && (
            <Stack gap="md">
              {!selectedCustomer && !showNewCustomerForm && (
                <>
                  <Alert color="blue" icon={<IconSearch size={16} />}>
                    Search for an existing customer or create a new one for this wedding party member.
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
              
              {(selectedCustomer || showNewCustomerForm) && (
                <form>
                  {selectedCustomer && (
                    <Alert color="green" icon={<IconCheck size={16} />} mb="md">
                      Using existing customer: <strong>{selectedCustomer.first_name} {selectedCustomer.last_name}</strong>
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
                  
                  <Grid>
                    <Grid.Col span={{ base: 12, sm: 6 }}>
                      <TextInput
                        label="First Name"
                        placeholder="Enter first name"
                        required
                        {...memberForm.getInputProps('first_name')}
                      />
                    </Grid.Col>
                    <Grid.Col span={{ base: 12, sm: 6 }}>
                      <TextInput
                        label="Last Name"
                        placeholder="Enter last name"
                        required
                        {...memberForm.getInputProps('last_name')}
                      />
                    </Grid.Col>
                    <Grid.Col span={{ base: 12, sm: 6 }}>
                      <TextInput
                        label="Email"
                        placeholder="Enter email (optional)"
                        type="email"
                        {...memberForm.getInputProps('email')}
                      />
                    </Grid.Col>
                    <Grid.Col span={{ base: 12, sm: 6 }}>
                      <TextInput
                        label="Phone"
                        placeholder="Enter phone number (optional)"
                        {...memberForm.getInputProps('phone')}
                      />
                    </Grid.Col>
                    <Grid.Col span={12}>
                      <Select
                        label="Role in Wedding"
                        placeholder="Select role"
                        required
                        data={MEMBER_ROLES}
                        {...memberForm.getInputProps('role')}
                      />
                    </Grid.Col>
                  </Grid>
                </form>
              )}
            </Stack>
          )}

          {/* Step 1: Outfit Selection */}
          {currentStep === 1 && (
            <Stack gap="md">
              {categoriesLoading || garmentsLoading ? (
                <Text ta="center" c="dimmed">Loading garment categories...</Text>
              ) : (
                <>
                  <Alert color="blue" icon={<IconShirt size={16} />}>
                    Select garments for each category. Required categories are marked with a badge.
                  </Alert>
                  
                  {categories.map(category => {
                    const selection = outfitSelections.find(s => s.categoryId === category.id)
                    const categoryGarments = getGarmentsForCategory(category.id)
                    
                    return (
                      <Card key={category.id} padding="md" withBorder>
                        <Group justify="space-between" mb="sm">
                          <Group>
                            <Text fw={500}>{category.name}</Text>
                            {selection?.required && (
                              <Badge size="sm" color="red">Required</Badge>
                            )}
                          </Group>
                          {selection && (
                            <Checkbox
                              label="Hire"
                              checked={selection.hire}
                              onChange={(e) => 
                                handleOutfitChange(category.id, 'hire', e.currentTarget.checked)
                              }
                            />
                          )}
                        </Group>
                        
                        <Select
                          placeholder={`Select ${category.name.toLowerCase()}`}
                          data={categoryGarments.map(g => ({
                            value: g.id,
                            label: `${g.name} - £${g.hire_price}/${g.purchase_price}`
                          }))}
                          value={selection?.garmentId || null}
                          onChange={(value) => 
                            handleOutfitChange(category.id, 'garmentId', value)
                          }
                          searchable
                          clearable={!selection?.required}
                        />
                      </Card>
                    )
                  })}
                </>
              )}
            </Stack>
          )}

          {/* Step 2: Size Measurements */}
          {currentStep === 2 && (
            <Stack gap="md">
              <Alert color="orange" icon={<IconRuler size={16} />}>
                Enter measurements for the selected garments. Required measurements are marked with *.
              </Alert>
              
              <Grid>
                {sizeMeasurements.map(measurement => (
                  <Grid.Col key={measurement.sizeType} span={{ base: 12, sm: 6, md: 4 }}>
                    <NumberInput
                      label={`${measurement.sizeType.replace('_', ' ').toUpperCase()} ${measurement.required ? '*' : ''}`}
                      placeholder={`Enter ${measurement.sizeType.replace('_', ' ')}`}
                      value={measurement.value || ''}
                      onChange={(value) => 
                        handleSizeChange(measurement.sizeType, Number(value) || 0)
                      }
                      min={0}
                      max={measurement.sizeType === 'shoe_size' ? 15 : 100}
                      step={0.5}
                      suffix={` ${measurement.unit}`}
                      precision={measurement.sizeType === 'shoe_size' ? 1 : 0.5}
                    />
                  </Grid.Col>
                ))}
              </Grid>
              
              <Alert color="gray" icon={<IconAlertTriangle size={16} />}>
                Measurements can be updated later if needed. Focus on getting the essential measurements first.
              </Alert>
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
                Add Member
              </Button>
            )}
          </Group>
        </Group>
      </Stack>
    </div>
  )
}