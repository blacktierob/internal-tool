import { useState } from 'react'
import {
  Table,
  Group,
  Text,
  ActionIcon,
  Card,
  TextInput,
  Button,
  Stack,
  Pagination,
  Grid,
  Modal,
  Alert,
  LoadingOverlay,
  Tooltip
} from '@mantine/core'
import {
  IconSearch,
  IconPlus,
  IconEdit,
  IconTrash,
  IconEye,
  IconPhone,
  IconMail,
  IconMapPin,
  IconRefresh
} from '@tabler/icons-react'
import { useDisclosure } from '@mantine/hooks'
import { modals } from '@mantine/modals'
import { notifications } from '@mantine/notifications'
import { useNavigate } from 'react-router-dom'
import { useCustomers } from '../../hooks/useCustomers'
import type { CustomerSearchFilters } from '../../services/customers.service'
import { CustomerForm } from './CustomerForm'
import { ROUTES } from '../../constants/routes'
import type { Customer } from '../../types/database.types'

interface CustomerListProps {
  onCustomerSelect?: (customer: Customer) => void
  selectable?: boolean
}

export function CustomerList({ onCustomerSelect, selectable = false }: CustomerListProps) {
  const navigate = useNavigate()
  const [searchQuery, setSearchQuery] = useState('')
  const [filters, setFilters] = useState<CustomerSearchFilters>({})
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null)
  const [formOpened, { open: openForm, close: closeForm }] = useDisclosure(false)
  const [editMode, setEditMode] = useState(false)

  const {
    customers,
    total,
    page,
    limit,
    loading,
    error,
    fetchCustomers,
    createCustomer,
    updateCustomer,
    deleteCustomer,
    setPage,
    setFilters: updateFilters,
    clearError
  } = useCustomers({
    page: 1,
    limit: 25,
    filters,
    autoFetch: true
  })

  const handleSearch = () => {
    const newFilters: CustomerSearchFilters = {
      search: searchQuery.trim() || undefined
    }
    setFilters(newFilters)
    updateFilters(newFilters)
  }

  const handleClearFilters = () => {
    setSearchQuery('')
    setFilters({})
    updateFilters({})
  }

  const handleAddCustomer = () => {
    setSelectedCustomer(null)
    setEditMode(false)
    openForm()
  }

  const handleViewCustomer = (customer: Customer) => {
    navigate(ROUTES.CUSTOMER_DETAIL.replace(':id', customer.id))
  }

  const handleEditCustomer = (customer: Customer) => {
    setSelectedCustomer(customer)
    setEditMode(true)
    openForm()
  }

  const handleDeleteCustomer = (customer: Customer) => {
    modals.openConfirmModal({
      title: 'Delete Customer',
      children: (
        <Text>
          Are you sure you want to delete <strong>{customer.first_name} {customer.last_name}</strong>? 
          This action cannot be undone.
        </Text>
      ),
      labels: { confirm: 'Delete', cancel: 'Cancel' },
      confirmProps: { color: 'red' },
      onConfirm: async () => {
        try {
          await deleteCustomer(customer.id)
          notifications.show({
            title: 'Customer Deleted',
            message: `${customer.first_name} ${customer.last_name} has been deleted`,
            color: 'green'
          })
        } catch (error) {
          notifications.show({
            title: 'Error',
            message: error instanceof Error ? error.message : 'Failed to delete customer',
            color: 'red'
          })
        }
      }
    })
  }

  const handleFormSubmit = async (data: Customer) => {
    if (editMode && selectedCustomer) {
      await updateCustomer(selectedCustomer.id, data)
      notifications.show({
        title: 'Customer Updated',
        message: `${data.first_name} ${data.last_name} has been updated`,
        color: 'green'
      })
    } else {
      await createCustomer(data)
      notifications.show({
        title: 'Customer Created',
        message: `${data.first_name} ${data.last_name} has been created`,
        color: 'green'
      })
    }
    closeForm()
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-GB', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    })
  }

  const rows = customers.map((customer) => (
    <Table.Tr 
      key={customer.id}
      style={{ cursor: selectable ? 'pointer' : 'default', minHeight: '64px' }}
      onClick={() => selectable && onCustomerSelect?.(customer)}
    >
      <Table.Td style={{ minHeight: '64px', verticalAlign: 'middle', padding: '12px' }}>
        <Group gap="sm">
          <div>
            <Text fw={500} size="md">{customer.first_name} {customer.last_name}</Text>
            {customer.email && (
              <Group gap={4}>
                <IconMail size={14} color="gray" />
                <Text size="sm" c="dimmed">{customer.email}</Text>
              </Group>
            )}
            {/* Show phone on mobile when phone column is hidden */}
            <Group gap={4} hiddenFrom="sm">
              {customer.phone && (
                <>
                  <IconPhone size={14} color="gray" />
                  <Text size="sm">{customer.phone}</Text>
                </>
              )}
            </Group>
          </div>
        </Group>
      </Table.Td>
      
      <Table.Td style={{ minHeight: '64px', verticalAlign: 'middle', padding: '12px' }} visibleFrom="sm">
        {customer.phone && (
          <Group gap={4}>
            <IconPhone size={14} color="gray" />
            <Text size="sm">{customer.phone}</Text>
          </Group>
        )}
      </Table.Td>
      
      <Table.Td style={{ minHeight: '64px', verticalAlign: 'middle', padding: '12px' }} visibleFrom="md">
        {(customer.city || customer.county || customer.postcode) && (
          <Group gap={4}>
            <IconMapPin size={14} color="gray" />
            <Text size="sm">
              {[customer.city, customer.county, customer.postcode]
                .filter(Boolean)
                .join(', ')}
            </Text>
          </Group>
        )}
      </Table.Td>
      
      <Table.Td style={{ minHeight: '64px', verticalAlign: 'middle', padding: '12px' }} visibleFrom="lg">
        <Text size="sm" c="dimmed">
          {formatDate(customer.created_at)}
        </Text>
      </Table.Td>
      
      {!selectable && (
        <Table.Td style={{ minHeight: '64px', verticalAlign: 'middle', padding: '12px' }}>
          <Group gap="xs">
            <Tooltip label="View Customer Details">
              <ActionIcon
                variant="light"
                color="green"
                onClick={() => handleViewCustomer(customer)}
                size="lg"
                style={{ minWidth: '44px', minHeight: '44px' }}
              >
                <IconEye size={18} />
              </ActionIcon>
            </Tooltip>
            <Tooltip label="Edit Customer">
              <ActionIcon
                variant="light"
                color="blue"
                onClick={() => handleEditCustomer(customer)}
                size="lg"
                style={{ minWidth: '44px', minHeight: '44px' }}
              >
                <IconEdit size={18} />
              </ActionIcon>
            </Tooltip>
            <Tooltip label="Delete Customer">
              <ActionIcon
                variant="light"
                color="red"
                onClick={() => handleDeleteCustomer(customer)}
                size="lg"
                style={{ minWidth: '44px', minHeight: '44px' }}
              >
                <IconTrash size={18} />
              </ActionIcon>
            </Tooltip>
          </Group>
        </Table.Td>
      )}
    </Table.Tr>
  ))

  return (
    <Stack gap="md">
      <Card shadow="sm" padding="md" radius="md" withBorder>
        <LoadingOverlay visible={loading} overlayProps={{ radius: "sm", blur: 2 }} />
        
        {error && (
          <Alert 
            color="red" 
            title="Error Loading Customers"
            onClose={clearError}
            withCloseButton
            mb="md"
          >
            {error}
          </Alert>
        )}

        <Group justify="space-between" mb="md">
          <Text size="lg" fw={600}>
            Customers ({total})
          </Text>
          {!selectable && (
            <Group>
              <Button
                leftSection={<IconRefresh size={18} />}
                variant="light"
                onClick={fetchCustomers}
                disabled={loading}
                size="md"
                style={{ minHeight: '44px' }}
              >
                Refresh
              </Button>
              <Button
                leftSection={<IconPlus size={18} />}
                onClick={handleAddCustomer}
                size="md"
                style={{ minHeight: '44px' }}
              >
                Add Customer
              </Button>
            </Group>
          )}
        </Group>

        <Grid mb="md">
          <Grid.Col span={{ base: 12, md: 8 }}>
            <TextInput
              placeholder="Search customers by name, email, or phone..."
              leftSection={<IconSearch size={16} />}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.currentTarget.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
              size="md"
              style={{ minHeight: '48px' }}
            />
          </Grid.Col>
          <Grid.Col span={{ base: 12, md: 4 }}>
            <Group gap="sm">
              <Button 
                onClick={handleSearch} 
                disabled={loading}
                size="md"
                style={{ minHeight: '48px', flex: 1 }}
              >
                Search
              </Button>
              {Object.keys(filters).length > 0 && (
                <Button 
                  variant="light" 
                  color="gray" 
                  onClick={handleClearFilters}
                  disabled={loading}
                  size="md"
                  style={{ minHeight: '48px' }}
                >
                  Clear
                </Button>
              )}
            </Group>
          </Grid.Col>
        </Grid>

        <Table striped highlightOnHover style={{ minWidth: '100%' }}>
          <Table.Thead>
            <Table.Tr style={{ minHeight: '48px' }}>
              <Table.Th style={{ minHeight: '48px', verticalAlign: 'middle' }}>Name & Email</Table.Th>
              <Table.Th style={{ minHeight: '48px', verticalAlign: 'middle' }} visibleFrom="sm">Phone</Table.Th>
              <Table.Th style={{ minHeight: '48px', verticalAlign: 'middle' }} visibleFrom="md">Location</Table.Th>
              <Table.Th style={{ minHeight: '48px', verticalAlign: 'middle' }} visibleFrom="lg">Created</Table.Th>
              {!selectable && <Table.Th style={{ minHeight: '48px', verticalAlign: 'middle' }}>Actions</Table.Th>}
            </Table.Tr>
          </Table.Thead>
          <Table.Tbody>
            {rows.length > 0 ? (
              rows
            ) : (
              <Table.Tr>
                <Table.Td colSpan={selectable ? 4 : 5} style={{ minHeight: '120px', verticalAlign: 'middle' }}>
                  <Text ta="center" c="dimmed" py="xl" size="md">
                    {loading ? 'Loading customers...' : 'No customers found'}
                  </Text>
                </Table.Td>
              </Table.Tr>
            )}
          </Table.Tbody>
        </Table>

        {total > limit && (
          <Group justify="center" mt="md">
            <Pagination
              value={page}
              onChange={setPage}
              total={Math.ceil(total / limit)}
              disabled={loading}
            />
          </Group>
        )}
      </Card>

      <Modal
        opened={formOpened}
        onClose={closeForm}
        title={editMode ? 'Edit Customer' : 'Add New Customer'}
        size="lg"
        centered
      >
        <CustomerForm
          customer={selectedCustomer}
          onSubmit={handleFormSubmit}
          onCancel={closeForm}
          loading={loading}
        />
      </Modal>
    </Stack>
  )
}