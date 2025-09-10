import { useState, useEffect, useCallback } from 'react'
import {
  Stack,
  Group,
  Text,
  Card,
  Badge,
  Divider,
  Alert,
  LoadingOverlay,
  Tabs,
  Grid,
  ActionIcon,
  Tooltip,
  Table,
  Paper,
  Timeline,
  ThemeIcon
} from '@mantine/core'
import {
  IconChevronLeft,
  IconEdit,
  IconPhone,
  IconMail,
  IconMapPin,
  IconUser,
  IconCalendar,
  IconEye,
  IconUsers,
  IconCrown,
  IconCheck,
  IconClock
} from '@tabler/icons-react'
import { useNavigate, useParams } from 'react-router-dom'
import { customerService } from '../../services/customers.service'
import { ROUTES } from '../../constants/routes'
import type { Customer, OrderStatus, Order } from '../../types/database.types'

const STATUS_COLORS: Record<OrderStatus, string> = {
  draft: 'gray',
  confirmed: 'blue',
  in_progress: 'yellow',
  ready: 'orange',
  completed: 'green',
  cancelled: 'red'
}

const ROLE_ICONS = {
  groom: IconCrown,
  best_man: IconUser,
  groomsman: IconUsers,
  father_of_groom: IconUser,
  father_of_bride: IconUser,
  usher: IconUser,
  page_boy: IconUser,
  other: IconUser
}

interface CustomerOrderHistory {
  customer: Customer
  ownOrders: Order[]
  memberOrders: Order[]
}

export function CustomerDetailView() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const [activeTab, setActiveTab] = useState<string>('overview')
  const [orderHistory, setOrderHistory] = useState<CustomerOrderHistory | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const fetchCustomerHistory = useCallback(async () => {
    if (!id) return

    setLoading(true)
    setError(null)

    try {
      const history = await customerService.getCustomerOrderHistory(id)
      setOrderHistory(history)
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch customer'
      setError(errorMessage)
      console.error('Error fetching customer history:', err)
    } finally {
      setLoading(false)
    }
  }, [id])

  useEffect(() => {
    if (id) {
      fetchCustomerHistory()
    }
  }, [id, fetchCustomerHistory])

  const handleBack = () => {
    navigate(ROUTES.CUSTOMERS)
  }

  const handleViewOrder = (orderId: string) => {
    navigate(ROUTES.ORDER_DETAIL.replace(':id', orderId))
  }

  const formatDate = (dateString: string | null) => {
    if (!dateString) return 'Not set'
    return new Date(dateString).toLocaleDateString('en-GB', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    })
  }

  const formatAddress = (customer: Customer) => {
    const addressParts = [
      customer.address_line_1,
      customer.address_line_2,
      customer.city,
      customer.county,
      customer.postcode
    ].filter(Boolean)
    
    return addressParts.length > 0 ? addressParts.join(', ') : 'No address provided'
  }

  if (!id) {
    return (
      <Alert color="red" title="Invalid Customer">
        No customer ID provided
      </Alert>
    )
  }

  if (loading) {
    return <LoadingOverlay visible={true} />
  }

  if (error || !orderHistory) {
    return (
      <Alert 
        color="red" 
        title="Error Loading Customer"
        withCloseButton
        onClose={() => setError(null)}
      >
        {error || 'Customer not found'}
      </Alert>
    )
  }

  const { customer, ownOrders, memberOrders } = orderHistory
  const totalOrders = ownOrders.length + memberOrders.length

  return (
    <Stack gap="md">
      {/* Header with Back Button and Customer Name */}
      <Group justify="space-between">
        <Group>
          <Tooltip label="Back to Customers">
            <ActionIcon
              variant="light"
              size="lg"
              onClick={handleBack}
            >
              <IconChevronLeft size={20} />
            </ActionIcon>
          </Tooltip>
          <div>
            <Text size="2xl" fw={600}>
              {customer.first_name} {customer.last_name}
            </Text>
            <Text size="sm" c="dimmed">
              Customer since {formatDate(customer.created_at)}
            </Text>
          </div>
        </Group>
        
        <Group>
          <Tooltip label="Edit Customer">
            <ActionIcon
              variant="light"
              color="blue"
            >
              <IconEdit size={16} />
            </ActionIcon>
          </Tooltip>
        </Group>
      </Group>

      {/* Customer Summary Cards */}
      <Grid>
        <Grid.Col span={{ base: 12, md: 8 }}>
          <Card shadow="sm" padding="md" radius="md" withBorder>
            <Text size="lg" fw={600} mb="md">Contact Information</Text>
            
            <Stack gap="sm">
              {customer.email && (
                <Group gap="sm">
                  <ThemeIcon variant="light" color="blue" size="sm">
                    <IconMail size={14} />
                  </ThemeIcon>
                  <div>
                    <Text size="sm" c="dimmed">Email</Text>
                    <Text fw={500}>{customer.email}</Text>
                  </div>
                </Group>
              )}
              
              {customer.phone && (
                <Group gap="sm">
                  <ThemeIcon variant="light" color="green" size="sm">
                    <IconPhone size={14} />
                  </ThemeIcon>
                  <div>
                    <Text size="sm" c="dimmed">Phone</Text>
                    <Text fw={500}>{customer.phone}</Text>
                  </div>
                </Group>
              )}
              
              <Group gap="sm" align="flex-start">
                <ThemeIcon variant="light" color="orange" size="sm">
                  <IconMapPin size={14} />
                </ThemeIcon>
                <div>
                  <Text size="sm" c="dimmed">Address</Text>
                  <Text fw={500}>{formatAddress(customer)}</Text>
                </div>
              </Group>
              
              {customer.notes && (
                <div>
                  <Text size="sm" c="dimmed" mb={4}>Notes</Text>
                  <Paper p="sm" bg="gray.0" radius="sm">
                    <Text size="sm">{customer.notes}</Text>
                  </Paper>
                </div>
              )}
            </Stack>
          </Card>
        </Grid.Col>

        <Grid.Col span={{ base: 12, md: 4 }}>
          <Card shadow="sm" padding="md" radius="md" withBorder>
            <Text size="lg" fw={600} mb="md">Order Summary</Text>
            
            <Stack gap="sm">
              <Group justify="space-between">
                <Text size="sm" c="dimmed">Own Orders:</Text>
                <Badge size="lg" variant="filled" color="blue">
                  {ownOrders.length}
                </Badge>
              </Group>
              
              <Group justify="space-between">
                <Text size="sm" c="dimmed">Member Of:</Text>
                <Badge size="lg" variant="filled" color="green">
                  {memberOrders.length}
                </Badge>
              </Group>
              
              <Divider />
              
              <Group justify="space-between">
                <Text fw={500}>Total Orders:</Text>
                <Badge size="lg" variant="filled" color="dark">
                  {totalOrders}
                </Badge>
              </Group>
            </Stack>
          </Card>
        </Grid.Col>
      </Grid>

      {/* Main Content Tabs */}
      <Tabs value={activeTab} onChange={setActiveTab}>
        <Tabs.List>
          <Tabs.Tab value="overview" leftSection={<IconUser size={16} />}>
            Overview
          </Tabs.Tab>
          <Tabs.Tab value="own-orders" leftSection={<IconCrown size={16} />}>
            Own Orders ({ownOrders.length})
          </Tabs.Tab>
          <Tabs.Tab value="member-orders" leftSection={<IconUsers size={16} />}>
            Member Of ({memberOrders.length})
          </Tabs.Tab>
          <Tabs.Tab value="activity" leftSection={<IconClock size={16} />}>
            Activity
          </Tabs.Tab>
        </Tabs.List>

        {/* Overview Tab */}
        <Tabs.Panel value="overview" pt="md">
          <Grid>
            <Grid.Col span={12}>
              <Card shadow="sm" padding="md" radius="md" withBorder>
                <Text size="lg" fw={600} mb="md">Recent Activity</Text>
                
                <Timeline bulletSize={24} lineWidth={2}>
                  {ownOrders.slice(0, 3).map((order: any) => (
                    <Timeline.Item 
                      key={order.id}
                      bullet={<IconCrown size={12} />} 
                      title={`Created Order ${order.order_number}`}
                      color="blue"
                    >
                      <Text c="dimmed" size="sm">
                        Wedding at {order.wedding_venue} on {formatDate(order.wedding_date)}
                      </Text>
                      <Text c="dimmed" size="xs">
                        {formatDate(order.created_at)}
                      </Text>
                    </Timeline.Item>
                  ))}
                  
                  {memberOrders.slice(0, 2).map((memberOrder: any) => {
                    const RoleIcon = ROLE_ICONS[memberOrder.role as keyof typeof ROLE_ICONS] || IconUser
                    return (
                      <Timeline.Item 
                        key={memberOrder.id}
                        bullet={<RoleIcon size={12} />} 
                        title={`Joined as ${memberOrder.role.replace('_', ' ')}`}
                        color="green"
                      >
                        <Text c="dimmed" size="sm">
                          Order {memberOrder.order.order_number} by {memberOrder.order.customer.first_name} {memberOrder.order.customer.last_name}
                        </Text>
                        <Text c="dimmed" size="xs">
                          Wedding on {formatDate(memberOrder.order.wedding_date)}
                        </Text>
                      </Timeline.Item>
                    )
                  })}
                  
                  <Timeline.Item 
                    bullet={<IconCheck size={12} />} 
                    title="Customer Account Created"
                    color="gray"
                  >
                    <Text c="dimmed" size="sm">
                      Joined Black Tie Menswear
                    </Text>
                    <Text c="dimmed" size="xs">
                      {formatDate(customer.created_at)}
                    </Text>
                  </Timeline.Item>
                </Timeline>
              </Card>
            </Grid.Col>
          </Grid>
        </Tabs.Panel>

        {/* Own Orders Tab */}
        <Tabs.Panel value="own-orders" pt="md">
          <Card shadow="sm" padding="md" radius="md" withBorder>
            <Group justify="space-between" mb="md">
              <Text size="lg" fw={600}>Orders as Primary Customer</Text>
            </Group>

            {ownOrders.length > 0 ? (
              <Table striped highlightOnHover>
                <Table.Thead>
                  <Table.Tr>
                    <Table.Th>Order</Table.Th>
                    <Table.Th>Status</Table.Th>
                    <Table.Th>Wedding Details</Table.Th>
                    <Table.Th>Members</Table.Th>
                    <Table.Th>Actions</Table.Th>
                  </Table.Tr>
                </Table.Thead>
                <Table.Tbody>
                  {ownOrders.map((order: any) => (
                    <Table.Tr key={order.id}>
                      <Table.Td>
                        <div>
                          <Text fw={500}>{order.order_number}</Text>
                          <Text size="sm" c="dimmed">
                            Created {formatDate(order.created_at)}
                          </Text>
                        </div>
                      </Table.Td>
                      
                      <Table.Td>
                        <Badge color={STATUS_COLORS[order.status]} size="sm">
                          {order.status.replace('_', ' ').toUpperCase()}
                        </Badge>
                      </Table.Td>
                      
                      <Table.Td>
                        <div>
                          <Group gap={4}>
                            <IconCalendar size={14} />
                            <Text size="sm">{formatDate(order.wedding_date)}</Text>
                          </Group>
                          {order.wedding_venue && (
                            <Group gap={4} mt={2}>
                              <IconMapPin size={14} />
                              <Text size="xs" c="dimmed">{order.wedding_venue}</Text>
                            </Group>
                          )}
                        </div>
                      </Table.Td>
                      
                      <Table.Td>
                        <Text size="sm">
                          {order.order_members?.[0]?.count || 0} / {order.total_members}
                        </Text>
                      </Table.Td>
                      
                      <Table.Td>
                        <Tooltip label="View Order Details">
                          <ActionIcon
                            variant="light"
                            color="blue"
                            onClick={() => handleViewOrder(order.id)}
                          >
                            <IconEye size={16} />
                          </ActionIcon>
                        </Tooltip>
                      </Table.Td>
                    </Table.Tr>
                  ))}
                </Table.Tbody>
              </Table>
            ) : (
              <Paper p="xl" ta="center">
                <IconCrown size={48} color="gray" style={{ margin: '0 auto 16px' }} />
                <Text size="lg" fw={500} mb="xs">No Orders Found</Text>
                <Text size="sm" c="dimmed">
                  This customer hasn't placed any orders yet.
                </Text>
              </Paper>
            )}
          </Card>
        </Tabs.Panel>

        {/* Member Orders Tab */}
        <Tabs.Panel value="member-orders" pt="md">
          <Card shadow="sm" padding="md" radius="md" withBorder>
            <Group justify="space-between" mb="md">
              <Text size="lg" fw={600}>Wedding Party Memberships</Text>
            </Group>

            {memberOrders.length > 0 ? (
              <Table striped highlightOnHover>
                <Table.Thead>
                  <Table.Tr>
                    <Table.Th>Order</Table.Th>
                    <Table.Th>Role</Table.Th>
                    <Table.Th>Primary Customer</Table.Th>
                    <Table.Th>Wedding Details</Table.Th>
                    <Table.Th>Actions</Table.Th>
                  </Table.Tr>
                </Table.Thead>
                <Table.Tbody>
                  {memberOrders.map((memberOrder: any) => {
                    const RoleIcon = ROLE_ICONS[memberOrder.role as keyof typeof ROLE_ICONS] || IconUser
                    return (
                      <Table.Tr key={memberOrder.id}>
                        <Table.Td>
                          <Text fw={500}>{memberOrder.order.order_number}</Text>
                        </Table.Td>
                        
                        <Table.Td>
                          <Group gap="xs">
                            <ThemeIcon variant="light" size="sm">
                              <RoleIcon size={14} />
                            </ThemeIcon>
                            <Badge variant="light" size="sm">
                              {memberOrder.role.replace('_', ' ')}
                            </Badge>
                          </Group>
                        </Table.Td>
                        
                        <Table.Td>
                          <Text size="sm">
                            {memberOrder.order.customer.first_name} {memberOrder.order.customer.last_name}
                          </Text>
                        </Table.Td>
                        
                        <Table.Td>
                          <div>
                            <Group gap={4}>
                              <IconCalendar size={14} />
                              <Text size="sm">{formatDate(memberOrder.order.wedding_date)}</Text>
                            </Group>
                            {memberOrder.order.wedding_venue && (
                              <Group gap={4} mt={2}>
                                <IconMapPin size={14} />
                                <Text size="xs" c="dimmed">{memberOrder.order.wedding_venue}</Text>
                              </Group>
                            )}
                          </div>
                        </Table.Td>
                        
                        <Table.Td>
                          <Tooltip label="View Order Details">
                            <ActionIcon
                              variant="light"
                              color="blue"
                              onClick={() => handleViewOrder(memberOrder.order.id)}
                            >
                              <IconEye size={16} />
                            </ActionIcon>
                          </Tooltip>
                        </Table.Td>
                      </Table.Tr>
                    )
                  })}
                </Table.Tbody>
              </Table>
            ) : (
              <Paper p="xl" ta="center">
                <IconUsers size={48} color="gray" style={{ margin: '0 auto 16px' }} />
                <Text size="lg" fw={500} mb="xs">No Memberships Found</Text>
                <Text size="sm" c="dimmed">
                  This customer hasn't been a member of any wedding parties yet.
                </Text>
              </Paper>
            )}
          </Card>
        </Tabs.Panel>

        {/* Activity Tab */}
        <Tabs.Panel value="activity" pt="md">
          <Card shadow="sm" padding="md" radius="md" withBorder>
            <Text size="lg" fw={600} mb="md">Customer Activity Timeline</Text>
            
            <Timeline bulletSize={24} lineWidth={2}>
              {/* Recent orders first */}
              {[...ownOrders, ...memberOrders]
                .sort((a, b) => new Date(b.created_at || b.order?.created_at).getTime() - new Date(a.created_at || a.order?.created_at).getTime())
                .slice(0, 10)
                .map((item: any) => {
                  const isOwnOrder = 'order_number' in item
                  const order = isOwnOrder ? item : item.order
                  const Icon = isOwnOrder ? IconCrown : ROLE_ICONS[item.role as keyof typeof ROLE_ICONS] || IconUser
                  
                  return (
                    <Timeline.Item 
                      key={isOwnOrder ? item.id : item.id}
                      bullet={<Icon size={12} />} 
                      title={isOwnOrder ? `Created Order ${order.order_number}` : `Joined as ${item.role.replace('_', ' ')}`}
                      color={isOwnOrder ? 'blue' : 'green'}
                    >
                      <Text c="dimmed" size="sm">
                        {isOwnOrder ? 
                          `Wedding at ${order.wedding_venue} on ${formatDate(order.wedding_date)}` :
                          `Order ${order.order_number} by ${order.customer.first_name} ${order.customer.last_name}`
                        }
                      </Text>
                      <Text c="dimmed" size="xs">
                        {formatDate(order.created_at)}
                      </Text>
                    </Timeline.Item>
                  )
                })}
              
              <Timeline.Item 
                bullet={<IconCheck size={12} />} 
                title="Customer Account Created"
                color="gray"
              >
                <Text c="dimmed" size="sm">
                  Joined Black Tie Menswear
                </Text>
                <Text c="dimmed" size="xs">
                  {formatDate(customer.created_at)}
                </Text>
              </Timeline.Item>
            </Timeline>
          </Card>
        </Tabs.Panel>
      </Tabs>
    </Stack>
  )
}