import { useState } from 'react'
import {
  TextInput,
  Textarea,
  Button,
  Stack,
  Grid,
  Group,
  Card,
  Title,
  Alert,
  LoadingOverlay,
  Select,
  NumberInput
} from '@mantine/core'
import { DateInput, TimeInput } from '@mantine/dates'
import { useForm } from '@mantine/form'
import { IconCheck, IconAlertCircle, IconClock } from '@tabler/icons-react'
import type { Order, OrderInsert, OrderUpdate, Customer, OrderStatus } from '../../types/database.types'

interface OrderFormProps {
  order?: Order | null
  customer?: Customer | null
  onSubmit: (data: OrderInsert | OrderUpdate) => Promise<void>
  onCancel?: () => void
  loading?: boolean
  title?: string
  isGroomAppointment?: boolean
}

const ORDER_STATUS_OPTIONS = [
  { value: 'draft', label: 'Draft' },
  { value: 'confirmed', label: 'Confirmed' },
  { value: 'in_progress', label: 'In Progress' },
  { value: 'ready', label: 'Ready' },
  { value: 'completed', label: 'Completed' },
  { value: 'cancelled', label: 'Cancelled' }
]

const FUNCTION_TYPE_OPTIONS = [
  { value: 'Wedding', label: 'Wedding' },
  { value: 'Corporate Event', label: 'Corporate Event' },
  { value: 'Formal Event', label: 'Formal Event' },
  { value: 'Black Tie Event', label: 'Black Tie Event' },
  { value: 'Military Event', label: 'Military Event' },
  { value: 'Other', label: 'Other' }
]

export function OrderForm({
  order,
  customer,
  onSubmit,
  onCancel,
  loading = false,
  title,
  isGroomAppointment = false
}: OrderFormProps) {
  const [submitError, setSubmitError] = useState<string | null>(null)
  const [submitSuccess, setSubmitSuccess] = useState(false)

  const form = useForm({
    initialValues: {
      customer_id: customer?.id || order?.customer_id || '',
      wedding_date: order?.wedding_date ? new Date(order.wedding_date) : null,
      wedding_venue: order?.wedding_venue || '',
      wedding_time: order?.wedding_time || '',
      function_type: order?.function_type || 'Wedding',
      status: order?.status || 'draft' as OrderStatus,
      total_members: order?.total_members || 1,
      special_requirements: order?.special_requirements || '',
      internal_notes: order?.internal_notes || ''
    },
    validate: {
      customer_id: (value) => 
        !value ? 'Customer selection is required' : null,
      wedding_venue: (value) => 
        isGroomAppointment && !value?.trim() ? 'Wedding venue is required' : null,
      wedding_date: (value) => 
        isGroomAppointment && !value ? 'Wedding date is required' : null,
      total_members: (value) => 
        value < 1 ? 'Total members must be at least 1' : null
    }
  })

  const handleSubmit = async (values: typeof form.values) => {
    setSubmitError(null)
    setSubmitSuccess(false)
    
    try {
      // Format the data for submission
      const submitData = {
        ...values,
        wedding_date: values.wedding_date ? values.wedding_date.toISOString().split('T')[0] : null,
        // Clean up empty strings to null for optional fields
        wedding_venue: values.wedding_venue?.trim() || null,
        wedding_time: values.wedding_time?.trim() || null,
        special_requirements: values.special_requirements?.trim() || null,
        internal_notes: values.internal_notes?.trim() || null
      }

      await onSubmit(submitData as OrderInsert | OrderUpdate)
      setSubmitSuccess(true)
      
      // Reset form if creating new order
      if (!order) {
        form.reset()
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to save order'
      setSubmitError(errorMessage)
    }
  }

  const displayTitle = title || (order ? 'Edit Order' : isGroomAppointment ? 'Create New Order - Groom Appointment' : 'Create New Order')

  return (
    <Card shadow="sm" padding="lg" radius="md" withBorder>
      <LoadingOverlay visible={loading} overlayProps={{ radius: "sm", blur: 2 }} />
      
      <Stack gap="md">
        <Title order={3}>{displayTitle}</Title>

        {customer && (
          <Alert color="blue" title="Selected Customer">
            {customer.first_name} {customer.last_name}
            {customer.email && ` • ${customer.email}`}
            {customer.phone && ` • ${customer.phone}`}
          </Alert>
        )}

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

        {submitSuccess && (
          <Alert 
            icon={<IconCheck size={16} />} 
            color="green" 
            title="Success"
            onClose={() => setSubmitSuccess(false)}
            withCloseButton
          >
            Order {order ? 'updated' : 'created'} successfully!
          </Alert>
        )}

        <form onSubmit={form.onSubmit(handleSubmit)}>
          <Stack gap="md">
            {/* Function Details Section */}
            <Title order={4} c="blue">Function Details</Title>
            
            <Grid>
              <Grid.Col span={6}>
                <Select
                  label="Function Type"
                  placeholder="Select function type"
                  data={FUNCTION_TYPE_OPTIONS}
                  required={isGroomAppointment}
                  {...form.getInputProps('function_type')}
                />
              </Grid.Col>
              <Grid.Col span={6}>
                <DateInput
                  label="Function Date"
                  placeholder="Select date"
                  required={isGroomAppointment}
                  {...form.getInputProps('wedding_date')}
                />
              </Grid.Col>
            </Grid>

            <Grid>
              <Grid.Col span={8}>
                <TextInput
                  label="Venue"
                  placeholder="Wedding venue or event location"
                  required={isGroomAppointment}
                  {...form.getInputProps('wedding_venue')}
                />
              </Grid.Col>
              <Grid.Col span={4}>
                <TimeInput
                  label="Time"
                  placeholder="Event time"
                  leftSection={<IconClock size={16} />}
                  {...form.getInputProps('wedding_time')}
                />
              </Grid.Col>
            </Grid>

            {/* Order Details Section */}
            <Title order={4} c="blue" mt="md">Order Details</Title>
            
            <Grid>
              <Grid.Col span={6}>
                <NumberInput
                  label="Total Members"
                  placeholder="Number of people in the wedding party"
                  min={1}
                  max={50}
                  required
                  {...form.getInputProps('total_members')}
                />
              </Grid.Col>
              <Grid.Col span={6}>
                <Select
                  label="Status"
                  data={ORDER_STATUS_OPTIONS}
                  {...form.getInputProps('status')}
                />
              </Grid.Col>
            </Grid>

            <Textarea
              label="Special Requirements"
              placeholder="Any special requirements or preferences"
              rows={3}
              {...form.getInputProps('special_requirements')}
            />

            <Textarea
              label="Internal Notes"
              placeholder="Internal notes for staff (not visible to customer)"
              rows={3}
              {...form.getInputProps('internal_notes')}
            />

            <Group justify="flex-end" mt="md">
              {onCancel && (
                <Button 
                  variant="light" 
                  color="gray" 
                  onClick={onCancel}
                  disabled={loading}
                >
                  Cancel
                </Button>
              )}
              <Button 
                type="submit" 
                loading={loading}
                disabled={!form.isDirty() && !isGroomAppointment}
              >
                {order ? 'Update Order' : 'Create Order'}
              </Button>
            </Group>
          </Stack>
        </form>
      </Stack>
    </Card>
  )
}