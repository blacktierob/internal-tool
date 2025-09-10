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
  Badge,
  Pagination,
  Grid,
  Modal,
  Alert,
  LoadingOverlay,
  Tooltip,
  Select
} from '@mantine/core'
import {
  IconSearch,
  IconPlus,
  IconCalendar,
  IconRefresh,
  IconX
} from '@tabler/icons-react'
import { useDisclosure } from '@mantine/hooks'
import { modals } from '@mantine/modals'
import { notifications } from '@mantine/notifications'
import { useNavigate } from 'react-router-dom'
import { useOrders } from '../../hooks/useOrders'
import type { OrderSearchFilters } from '../../services/orders.service'
import { OrderCreationWizard } from './OrderCreationWizard'
import { ROUTES } from '../../constants/routes'
import type { OrderSummary, OrderStatus } from '../../types/database.types'

interface OrderListProps {
  onOrderSelect?: (order: OrderSummary) => void
  selectable?: boolean
}

const ORDER_STATUS_OPTIONS = [
  { value: 'active', label: 'Active' },
  { value: 'no_deposit', label: 'No Deposit' },
  { value: 'past', label: 'Past' },
  { value: '', label: 'All' }
]

const STATUS_COLORS: Record<string, string> = {
  'no_deposit': 'red',
  'active': 'green',
  'past': 'gray'
}

export function OrderList({ onOrderSelect, selectable = false }: OrderListProps) {
  const navigate = useNavigate()
  const [searchQuery, setSearchQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState('')
  const [filters, setFilters] = useState<OrderSearchFilters>({})
  const [wizardOpened, { open: openWizard, close: closeWizard }] = useDisclosure(false)

  const {
    orders,
    total,
    page,
    limit,
    loading,
    error,
    fetchOrders,
    deleteOrder,
    setPage,
    setFilters: updateFilters,
    clearError
  } = useOrders({
    page: 1,
    limit: 25,
    filters,
    autoFetch: true
  })

  const handleSearch = () => {
    const newFilters: OrderSearchFilters = {
      search: searchQuery.trim() || undefined,
      status: statusFilter || undefined
    }
    setFilters(newFilters)
    updateFilters(newFilters)
  }

  const handleClearFilters = () => {
    setSearchQuery('')
    setStatusFilter('')
    setFilters({})
    updateFilters({})
  }

  const handleDeleteOrder = (order: OrderSummary) => {
    modals.openConfirmModal({
      title: 'Delete Order',
      children: (
        <Text>
          Are you sure you want to delete order <strong>{order.order_number}</strong> for{' '}
          <strong>{order.customer_name}</strong>? This action cannot be undone and will also 
          delete all associated wedding party members and their measurements.
        </Text>
      ),
      labels: { confirm: 'Delete', cancel: 'Cancel' },
      confirmProps: { color: 'red' },
      onConfirm: async () => {
        try {
          await deleteOrder(order.id)
          notifications.show({
            title: 'Order Deleted',
            message: `Order ${order.order_number} has been deleted`,
            color: 'green'
          })
        } catch (error) {
          notifications.show({
            title: 'Error',
            message: error instanceof Error ? error.message : 'Failed to delete order',
            color: 'red'
          })
        }
      }
    })
  }

  const handleOrderCreated = (orderId: string) => {
    closeWizard()
    fetchOrders() // Refresh the list
    notifications.show({
      title: 'Success',
      message: 'Order created successfully. You can now add wedding party members.',
      color: 'green'
    })
    // Navigate to the new order detail page
    navigate(ROUTES.ORDER_DETAIL.replace(':id', orderId))
  }

  const goToOrder = (order: OrderSummary) => {
    navigate(ROUTES.ORDER_DETAIL.replace(':id', order.id))
  }

  const handleEditOrder = (order: OrderSummary) => {
    // For now, navigate to the order detail page where editing can be done
    navigate(ROUTES.ORDER_DETAIL.replace(':id', order.id))
  }

  const formatDate = (dateString: string | null) => {
    if (!dateString) return 'Not set'
    const date = new Date(dateString)
    const weekday = date.toLocaleDateString('en-GB', { weekday: 'long' })
    const day = date.getDate()
    const month = date.toLocaleDateString('en-GB', { month: 'long' })
    
    // Add ordinal suffix to day
    const ordinal = (n: number) => {
      if (n > 3 && n < 21) return 'th'
      switch (n % 10) {
        case 1: return 'st'
        case 2: return 'nd'
        case 3: return 'rd'
        default: return 'th'
      }
    }
    
    return `${weekday} ${day}${ordinal(day)} ${month}`
  }

  const formatSimpleDate = (dateString: string | null) => {
    if (!dateString) return 'Not set'
    return new Date(dateString).toLocaleDateString('en-GB', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    })
  }

  const rows = orders.map((order) => (
    <Table.Tr
      key={order.id}
      style={{ cursor: 'pointer', minHeight: '56px' }}
      onClick={() => {
        if (selectable) {
          onOrderSelect?.(order)
        } else {
          goToOrder(order)
        }
      }}
    >
      <Table.Td style={{ verticalAlign: 'middle', padding: '10px 12px' }}>
        <Group justify="space-between" align="center" gap="sm" wrap="nowrap">
          <Group gap={8} wrap="nowrap" style={{ minWidth: 0, flex: 1 }}>
            <Text fw={600} size="sm" style={{ minWidth: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
              {order.customer_name}
            </Text>
            <Group gap={4} wrap="nowrap" c="dimmed" style={{ flex: '0 0 auto' }}>
              <IconCalendar size={14} />
              <Text size="sm">{formatSimpleDate(order.wedding_date)}</Text>
            </Group>
          </Group>
          <Tooltip label="Delete order">
            <ActionIcon
              color="red"
              variant="subtle"
              size="md"
              onClick={(e) => { e.stopPropagation(); handleDeleteOrder(order) }}
              aria-label="Delete order"
            >
              <IconX size={16} />
            </ActionIcon>
          </Tooltip>
        </Group>
      </Table.Td>
    </Table.Tr>
  ))

  return (
    <Stack gap="md">
      <Card shadow="sm" padding="md" radius="md" withBorder>
        <LoadingOverlay visible={loading} overlayProps={{ radius: "sm", blur: 2 }} />
        
        {error && (
          <Alert 
            color="red" 
            title="Error Loading Orders"
            onClose={clearError}
            withCloseButton
            mb="md"
          >
            {error}
          </Alert>
        )}

        <Group justify="space-between" mb="md" wrap="wrap">
          <Text size="lg" fw={600}>
            Orders ({total})
          </Text>
          {!selectable && (
            <Group>
              <Button
                leftSection={<IconRefresh size={18} />}
                variant="light"
                onClick={fetchOrders}
                disabled={loading}
                size="md"
                style={{ minHeight: '44px' }}
              >
                Refresh
              </Button>
              <Button
                leftSection={<IconPlus size={18} />}
                onClick={openWizard}
                size="md"
                style={{ minHeight: '44px' }}
              >
                Create Order
              </Button>
            </Group>
          )}
        </Group>

        <Grid mb="md">
          <Grid.Col span={{ base: 12, md: 5 }}>
            <TextInput
              placeholder="Search orders by number, customer name, or venue..."
              leftSection={<IconSearch size={16} />}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.currentTarget.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
              size="md"
              style={{ minHeight: '48px' }}
            />
          </Grid.Col>
          <Grid.Col span={{ base: 12, sm: 6, md: 3 }}>
            <Select
              placeholder="Filter by status"
              data={ORDER_STATUS_OPTIONS}
              value={statusFilter}
              onChange={(value) => setStatusFilter(value || '')}
              size="md"
              style={{ minHeight: '48px' }}
            />
          </Grid.Col>
          <Grid.Col span={{ base: 12, sm: 6, md: 4 }}>
            <Group gap="sm">
              <Button 
                onClick={handleSearch} 
                disabled={loading}
                size="md"
                style={{ minHeight: '48px', flex: 1 }}
              >
                Search
              </Button>
              {(Object.keys(filters).length > 0 || searchQuery || statusFilter) && (
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
              <Table.Th style={{ minHeight: '48px', verticalAlign: 'middle' }}>Order</Table.Th>
            </Table.Tr>
          </Table.Thead>
          <Table.Tbody>
            {rows.length > 0 ? (
              rows
            ) : (
              <Table.Tr>
                <Table.Td colSpan={1} style={{ minHeight: '120px', verticalAlign: 'middle' }}>
                  <Text ta="center" c="dimmed" py="xl" size="md">
                    {loading ? 'Loading orders...' : 'No orders found'}
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
        opened={wizardOpened}
        onClose={closeWizard}
        title="Create New Order"
        size="xl"
        centered
        closeOnClickOutside={false}
      >
        <OrderCreationWizard
          onOrderCreated={handleOrderCreated}
          onCancel={closeWizard}
        />
      </Modal>
    </Stack>
  )
}
