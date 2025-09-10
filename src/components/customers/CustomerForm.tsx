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
  LoadingOverlay
} from '@mantine/core'
import { useForm } from '@mantine/form'
import { IconCheck, IconAlertCircle } from '@tabler/icons-react'
import type { Customer, CustomerInsert, CustomerUpdate } from '../../types/database.types'

interface CustomerFormProps {
  customer?: Customer | null
  onSubmit: (data: CustomerInsert | CustomerUpdate) => Promise<void>
  onCancel?: () => void
  loading?: boolean
  title?: string
}

export function CustomerForm({
  customer,
  onSubmit,
  onCancel,
  loading = false,
  title
}: CustomerFormProps) {
  const [submitError, setSubmitError] = useState<string | null>(null)
  const [submitSuccess, setSubmitSuccess] = useState(false)

  const form = useForm({
    initialValues: {
      first_name: customer?.first_name || '',
      last_name: customer?.last_name || '',
      email: customer?.email || '',
      phone: customer?.phone || '',
      address_line_1: customer?.address_line_1 || '',
      address_line_2: customer?.address_line_2 || '',
      city: customer?.city || '',
      county: customer?.county || '',
      postcode: customer?.postcode || '',
      country: customer?.country || 'United Kingdom',
      notes: customer?.notes || ''
    },
    validate: {
      first_name: (value) => 
        value.trim().length < 1 ? 'First name is required' : null,
      last_name: (value) => 
        value.trim().length < 1 ? 'Last name is required' : null,
      email: (value) => 
        value && !/^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}$/.test(value) 
          ? 'Invalid email format' : null,
      phone: (value) => 
        value && value.length < 10 ? 'Phone number must be at least 10 digits' : null,
      postcode: (value) => 
        value && !/^[A-Z]{1,2}[0-9R][0-9A-Z]?\s?[0-9][A-Z]{2}$/i.test(value.replace(/\s/g, '')) 
          ? 'Invalid UK postcode format' : null
    }
  })

  const handleSubmit = async (values: typeof form.values) => {
    setSubmitError(null)
    setSubmitSuccess(false)
    
    try {
      // Clean up empty strings to null for optional fields
      const cleanedData = Object.fromEntries(
        Object.entries(values).map(([key, value]) => [
          key, 
          typeof value === 'string' && value.trim() === '' ? null : value
        ])
      )

      await onSubmit(cleanedData as CustomerInsert | CustomerUpdate)
      setSubmitSuccess(true)
      
      // Reset form if creating new customer
      if (!customer) {
        form.reset()
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to save customer'
      setSubmitError(errorMessage)
    }
  }

  const displayTitle = title || (customer ? 'Edit Customer' : 'Add New Customer')

  return (
    <Card shadow="sm" padding="lg" radius="md" withBorder>
      <LoadingOverlay visible={loading} overlayProps={{ radius: "sm", blur: 2 }} />
      
      <Stack gap="md">
        <Title order={3}>{displayTitle}</Title>

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
            Customer {customer ? 'updated' : 'created'} successfully!
          </Alert>
        )}

        <form onSubmit={form.onSubmit(handleSubmit)}>
          <Stack gap="md">
            <Grid>
              <Grid.Col span={{ base: 12, sm: 6 }}>
                <TextInput
                  label="First Name"
                  placeholder="Enter first name"
                  required
                  size="md"
                  style={{ minHeight: '56px' }}
                  {...form.getInputProps('first_name')}
                />
              </Grid.Col>
              <Grid.Col span={{ base: 12, sm: 6 }}>
                <TextInput
                  label="Last Name"
                  placeholder="Enter last name"
                  required
                  size="md"
                  style={{ minHeight: '56px' }}
                  {...form.getInputProps('last_name')}
                />
              </Grid.Col>
            </Grid>

            <Grid>
              <Grid.Col span={{ base: 12, sm: 6 }}>
                <TextInput
                  label="Email"
                  placeholder="customer@example.com"
                  type="email"
                  size="md"
                  style={{ minHeight: '56px' }}
                  {...form.getInputProps('email')}
                />
              </Grid.Col>
              <Grid.Col span={{ base: 12, sm: 6 }}>
                <TextInput
                  label="Phone"
                  placeholder="07123 456789"
                  type="tel"
                  size="md"
                  style={{ minHeight: '56px' }}
                  {...form.getInputProps('phone')}
                />
              </Grid.Col>
            </Grid>

            <TextInput
              label="Address Line 1"
              placeholder="Street address"
              size="md"
              style={{ minHeight: '56px' }}
              {...form.getInputProps('address_line_1')}
            />

            <TextInput
              label="Address Line 2"
              placeholder="Apartment, suite, etc. (optional)"
              size="md"
              style={{ minHeight: '56px' }}
              {...form.getInputProps('address_line_2')}
            />

            <Grid>
              <Grid.Col span={{ base: 12, xs: 6, sm: 4 }}>
                <TextInput
                  label="City"
                  placeholder="City"
                  size="md"
                  style={{ minHeight: '56px' }}
                  {...form.getInputProps('city')}
                />
              </Grid.Col>
              <Grid.Col span={{ base: 12, xs: 6, sm: 4 }}>
                <TextInput
                  label="County"
                  placeholder="County"
                  size="md"
                  style={{ minHeight: '56px' }}
                  {...form.getInputProps('county')}
                />
              </Grid.Col>
              <Grid.Col span={{ base: 12, xs: 12, sm: 4 }}>
                <TextInput
                  label="Postcode"
                  placeholder="SW1A 1AA"
                  size="md"
                  style={{ minHeight: '56px' }}
                  {...form.getInputProps('postcode')}
                />
              </Grid.Col>
            </Grid>

            <TextInput
              label="Country"
              placeholder="Country"
              size="md"
              style={{ minHeight: '56px' }}
              {...form.getInputProps('country')}
            />

            <Textarea
              label="Notes"
              placeholder="Additional notes about the customer"
              rows={4}
              size="md"
              style={{ minHeight: '120px' }}
              {...form.getInputProps('notes')}
            />

            <Group justify="flex-end" gap="md" mt="lg">
              {onCancel && (
                <Button 
                  variant="light" 
                  color="gray" 
                  onClick={onCancel}
                  disabled={loading}
                  size="lg"
                  style={{ minHeight: '48px', minWidth: '120px' }}
                >
                  Cancel
                </Button>
              )}
              <Button 
                type="submit" 
                loading={loading}
                disabled={!form.isDirty()}
                size="lg"
                style={{ minHeight: '48px', minWidth: '160px' }}
              >
                {customer ? 'Update Customer' : 'Create Customer'}
              </Button>
            </Group>
          </Stack>
        </form>
      </Stack>
    </Card>
  )
}