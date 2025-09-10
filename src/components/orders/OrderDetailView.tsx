import { useState, useEffect } from 'react'
import {
  Stack,
  Group,
  Text,
  Button,
  Card,
  Badge,
  Divider,
  Alert,
  LoadingOverlay,
  Tabs,
  Grid,
  ActionIcon,
  Tooltip,
  Modal,
  Table,
  Avatar,
  Paper,
  Timeline,
  Progress,
  NumberInput,
  Select
} from '@mantine/core'
import {
  IconEdit,
  IconUsers,
  IconCalendar,
  IconMapPin,
  IconPhone,
  IconMail,
  IconPlus,
  IconTrash,
  IconEye,
  IconShirt,
  IconRuler,
  IconClock,
  IconChevronLeft,
  IconCheck,
  IconAlertTriangle,
  IconUser
} from '@tabler/icons-react'
import { useDisclosure } from '@mantine/hooks'
import { modals } from '@mantine/modals'
import { notifications } from '@mantine/notifications'
import { useNavigate, useParams } from 'react-router-dom'
import { useOrder } from '../../hooks/useOrders'
import { MemberAdditionForm } from './MemberAdditionForm'
import { ROUTES } from '../../constants/routes'
import type { OrderStatus, OrderMember, MemberGarment } from '../../types/database.types'

const STATUS_COLORS: Record<OrderStatus, string> = {
  draft: 'gray',
  confirmed: 'blue',
  in_progress: 'yellow',
  ready: 'orange',
  completed: 'green',
  cancelled: 'red'
}

const STATUS_OPTIONS = [
  { value: 'draft', label: 'Draft' },
  { value: 'confirmed', label: 'Confirmed' },
  { value: 'in_progress', label: 'In Progress' },
  { value: 'ready', label: 'Ready' },
  { value: 'completed', label: 'Completed' },
  { value: 'cancelled', label: 'Cancelled' }
]

export function OrderDetailView() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const [activeTab, setActiveTab] = useState<string>('overview')
  const [statusEditMode, setStatusEditMode] = useState(false)
  const [newStatus, setNewStatus] = useState<OrderStatus>('draft')
  const [memberFormOpened, { open: openMemberForm, close: closeMemberForm }] = useDisclosure(false)
  const [memberDetailOpened, { open: openMemberDetail, close: closeMemberDetail }] = useDisclosure(false)
  const [selectedMember, setSelectedMember] = useState<OrderMember | null>(null)

  const {
    orderWithMembers,
    members,
    loading,
    error,
    fetchOrderWithMembers,
    updateOrder,
    addMember,
    deleteMember,
    clearError
  } = useOrder({
    id: id!,
    includeMembers: true,
    autoFetch: true
  })

  useEffect(() => {
    if (orderWithMembers) {
      setNewStatus(orderWithMembers.status as OrderStatus)
    }
  }, [orderWithMembers])

  const handleBack = () => {
    navigate(ROUTES.ORDERS)
  }

  const handleStatusUpdate = async () => {
    if (!orderWithMembers || newStatus === orderWithMembers.status) {
      setStatusEditMode(false)
      return
    }

    try {
      await updateOrder({ status: newStatus })
      notifications.show({
        title: 'Status Updated',
        message: `Order status updated to ${newStatus.replace('_', ' ')}`,
        color: 'green'
      })
      setStatusEditMode(false)
      fetchOrderWithMembers() // Refresh data
    } catch (error) {
      notifications.show({
        title: 'Error',
        message: error instanceof Error ? error.message : 'Failed to update status',
        color: 'red'
      })
    }
  }

  const handleDeleteMember = (member: OrderMember) => {
    modals.openConfirmModal({
      title: 'Remove Wedding Party Member',
      children: (
        <Text>
          Are you sure you want to remove <strong>{member.first_name} {member.last_name}</strong> 
          from this order? This will also remove all their measurements and outfit assignments.
        </Text>
      ),
      labels: { confirm: 'Remove', cancel: 'Cancel' },
      confirmProps: { color: 'red' },
      onConfirm: async () => {
        try {
          await deleteMember(member.id)
          notifications.show({
            title: 'Member Removed',
            message: `${member.first_name} ${member.last_name} has been removed from the order`,
            color: 'green'
          })
        } catch (error) {
          notifications.show({
            title: 'Error',
            message: error instanceof Error ? error.message : 'Failed to remove member',
            color: 'red'
          })
        }
      }
    })
  }

  const handleMemberAdded = (member: OrderMember) => {
    closeMemberForm()
    fetchOrderWithMembers() // Refresh to show the new member
    notifications.show({
      title: 'Member Added',
      message: `${member.first_name} ${member.last_name} has been added to the wedding party`,
      color: 'green'
    })
  }

  const handleViewMemberDetail = (member: OrderMember) => {
    setSelectedMember(member)
    openMemberDetail()
  }

  const formatDate = (dateString: string | null) => {
    if (!dateString) return 'Not set'
    return new Date(dateString).toLocaleDateString('en-GB', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    })
  }

  const getProgressColor = (actual: number, total: number) => {
    const percentage = total > 0 ? (actual / total) * 100 : 0
    if (percentage >= 100) return 'green'
    if (percentage >= 75) return 'yellow'
    if (percentage >= 50) return 'orange'
    return 'red'
  }

  // Validate UUID format
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i
  
  if (!id) {
    return (
      <Alert color="red" title="Invalid Order">
        No order ID provided
      </Alert>
    )
  }

  if (!uuidRegex.test(id)) {
    return (
      <Alert color="red" title="Invalid Order ID">
        The order ID format is invalid. Please check the URL and try again.
      </Alert>
    )
  }

  if (loading) {
    return <LoadingOverlay visible={true} />
  }

  if (error) {
    return (
      <Alert 
        color="red" 
        title="Error Loading Order"
        onClose={clearError}
        withCloseButton
      >
        {error}
      </Alert>
    )
  }

  if (!orderWithMembers) {
    return (
      <Alert color="yellow" title="Order Not Found">
        The requested order could not be found.
      </Alert>
    )
  }

  const progressPercentage = orderWithMembers.total_members > 0 
    ? (orderWithMembers.actual_members / orderWithMembers.total_members) * 100 
    : 0

  return (
    <Stack gap="md">
      {/* Header with Back Button and Title */}
      <Group justify="space-between">
        <Group>
          <Tooltip label="Back to Orders">
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
              Order {orderWithMembers.order_number}
            </Text>
            <Text size="sm" c="dimmed">
              {orderWithMembers.customer_name}
            </Text>
          </div>
        </Group>
        
        <Group>
          {statusEditMode ? (
            <Group>
              <Select
                data={STATUS_OPTIONS}
                value={newStatus}
                onChange={(value) => setNewStatus(value as OrderStatus)}
                size="sm"
                w={150}
              />
              <Button size="sm" onClick={handleStatusUpdate}>
                Save
              </Button>
              <Button 
                size="sm" 
                variant="light" 
                onClick={() => setStatusEditMode(false)}
              >
                Cancel
              </Button>
            </Group>
          ) : (
            <Group>
              <Badge 
                color={STATUS_COLORS[orderWithMembers.status as OrderStatus]} 
                size="lg"
                onClick={() => setStatusEditMode(true)}
                style={{ cursor: 'pointer' }}
              >
                {orderWithMembers.status.replace('_', ' ').toUpperCase()}
              </Badge>
              <Tooltip label="Edit Status">
                <ActionIcon
                  variant="light"
                  color="blue"
                  onClick={() => setStatusEditMode(true)}
                >
                  <IconEdit size={16} />
                </ActionIcon>
              </Tooltip>
            </Group>
          )}
        </Group>
      </Group>

      {/* Order Progress Card */}
      <Card shadow="sm" padding="md" radius="md" withBorder>
        <Group justify="space-between" mb="md">
          <Text size="lg" fw={600}>Wedding Party Progress</Text>
          <Group gap="xs">
            <IconUsers size={20} color="gray" />
            <Text fw={500}>
              {orderWithMembers.actual_members} / {orderWithMembers.total_members} members
            </Text>
          </Group>
        </Group>
        
        <Progress 
          value={progressPercentage} 
          color={getProgressColor(orderWithMembers.actual_members, orderWithMembers.total_members)}
          size="lg"
          mb="xs"
        />
        
        <Text size="sm" c="dimmed" ta="center">
          {progressPercentage.toFixed(0)}% Complete
        </Text>
      </Card>

      {/* Main Content Tabs */}
      <Tabs value={activeTab} onChange={setActiveTab}>
        <Tabs.List>
          <Tabs.Tab value="overview" leftSection={<IconEye size={16} />}>
            Overview
          </Tabs.Tab>
          <Tabs.Tab value="members" leftSection={<IconUsers size={16} />}>
            Wedding Party ({members.length})
          </Tabs.Tab>
          <Tabs.Tab value="activity" leftSection={<IconClock size={16} />}>
            Activity
          </Tabs.Tab>
        </Tabs.List>

        {/* Overview Tab */}
        <Tabs.Panel value="overview" pt="md">
          <Grid>
            <Grid.Col span={{ base: 12, md: 6 }}>
              <Card shadow="sm" padding="md" radius="md" withBorder>
                <Text size="lg" fw={600} mb="md">Order Details</Text>
                
                <Stack gap="sm">
                  <Group justify="space-between">
                    <Text size="sm" c="dimmed">Order Number:</Text>
                    <Text fw={500}>{orderWithMembers.order_number}</Text>
                  </Group>
                  
                  <Group justify="space-between">
                    <Text size="sm" c="dimmed">Customer:</Text>
                    <Text fw={500}>{orderWithMembers.customer_name}</Text>
                  </Group>
                  
                  <Group justify="space-between">
                    <Text size="sm" c="dimmed">Wedding Date:</Text>
                    <Group gap={4}>
                      <IconCalendar size={14} />
                      <Text>{formatDate(orderWithMembers.wedding_date)}</Text>
                    </Group>
                  </Group>
                  
                  {orderWithMembers.wedding_venue && (
                    <Group justify="space-between">
                      <Text size="sm" c="dimmed">Venue:</Text>
                      <Group gap={4}>
                        <IconMapPin size={14} />
                        <Text>{orderWithMembers.wedding_venue}</Text>
                      </Group>
                    </Group>
                  )}
                  
                  <Group justify="space-between">
                    <Text size="sm" c="dimmed">Created:</Text>
                    <Text>{formatDate(orderWithMembers.created_at)}</Text>
                  </Group>
                </Stack>
              </Card>
            </Grid.Col>

            <Grid.Col span={{ base: 12, md: 6 }}>
              <Card shadow="sm" padding="md" radius="md" withBorder>
                <Text size="lg" fw={600} mb="md">Wedding Party Status</Text>
                
                <Stack gap="sm">
                  <Group justify="space-between">
                    <Text size="sm" c="dimmed">Expected Members:</Text>
                    <Text fw={500}>{orderWithMembers.total_members}</Text>
                  </Group>
                  
                  <Group justify="space-between">
                    <Text size="sm" c="dimmed">Added Members:</Text>
                    <Text fw={500}>{orderWithMembers.actual_members}</Text>
                  </Group>
                  
                  <Group justify="space-between">
                    <Text size="sm" c="dimmed">Remaining:</Text>
                    <Text fw={500} c={orderWithMembers.total_members - orderWithMembers.actual_members > 0 ? 'orange' : 'green'}>
                      {orderWithMembers.total_members - orderWithMembers.actual_members}
                    </Text>
                  </Group>
                  
                  <Divider my="xs" />
                  
                  <Group justify="space-between">
                    <Text size="sm" c="dimmed">Progress:</Text>
                    <Text fw={500} c={getProgressColor(orderWithMembers.actual_members, orderWithMembers.total_members)}>
                      {progressPercentage.toFixed(0)}%
                    </Text>
                  </Group>
                </Stack>
              </Card>
            </Grid.Col>
          </Grid>
        </Tabs.Panel>

        {/* Wedding Party Members Tab */}
        <Tabs.Panel value="members" pt="md">
          <Card shadow="sm" padding="md" radius="md" withBorder>
            <Group justify="space-between" mb="md">
              <Text size="lg" fw={600}>Wedding Party Members</Text>
              <Button
                leftSection={<IconPlus size={16} />}
                onClick={openMemberForm}
              >
                Add Member
              </Button>
            </Group>

            {members.length > 0 ? (
              <Table striped highlightOnHover>
                <Table.Thead>
                  <Table.Tr>
                    <Table.Th>Member</Table.Th>
                    <Table.Th>Role</Table.Th>
                    <Table.Th>Contact</Table.Th>
                    <Table.Th>Outfits</Table.Th>
                    <Table.Th>Measurements</Table.Th>
                    <Table.Th>Actions</Table.Th>
                  </Table.Tr>
                </Table.Thead>
                <Table.Tbody>
                  {members.map((member) => (
                    <Table.Tr key={member.id}>
                      <Table.Td>
                        <Group gap="sm">
                          <Avatar size="sm" color="blue">
                            <IconUser size={16} />
                          </Avatar>
                          <div>
                            <Text fw={500} size="sm">
                              {member.first_name} {member.last_name}
                            </Text>
                            <Text size="xs" c="dimmed">
                              Added {formatDate(member.created_at)}
                            </Text>
                          </div>
                        </Group>
                      </Table.Td>
                      
                      <Table.Td>
                        <Badge size="sm" variant="light">
                          {member.role || 'Member'}
                        </Badge>
                      </Table.Td>
                      
                      <Table.Td>
                        <Stack gap={2}>
                          {member.email && (
                            <Group gap={4}>
                              <IconMail size={12} />
                              <Text size="xs">{member.email}</Text>
                            </Group>
                          )}
                          {member.phone && (
                            <Group gap={4}>
                              <IconPhone size={12} />
                              <Text size="xs">{member.phone}</Text>
                            </Group>
                          )}
                        </Stack>
                      </Table.Td>
                      
                      <Table.Td>
                        <Group gap={4}>
                          <IconShirt size={14} />
                          <Text size="sm">
                            {member.member_garments?.length || 0} items
                          </Text>
                          {(member.member_garments?.length || 0) > 0 && (
                            <Badge size="xs" color="green">Assigned</Badge>
                          )}
                        </Group>
                      </Table.Td>
                      
                      <Table.Td>
                        <Group gap={4}>
                          <IconRuler size={14} />
                          <Text size="sm">
                            {member.member_sizes?.length || 0} measurements
                          </Text>
                          {(member.member_sizes?.length || 0) > 0 ? (
                            <Badge size="xs" color="green">Measured</Badge>
                          ) : (
                            <Badge size="xs" color="orange">Pending</Badge>
                          )}
                        </Group>
                      </Table.Td>
                      
                      <Table.Td>
                        <Group gap="xs">
                          <Tooltip label="View Details">
                            <ActionIcon
                              variant="light"
                              color="blue"
                              size="sm"
                              onClick={() => handleViewMemberDetail(member)}
                            >
                              <IconEye size={14} />
                            </ActionIcon>
                          </Tooltip>
                          <Tooltip label="Edit Member">
                            <ActionIcon
                              variant="light"
                              color="orange"
                              size="sm"
                            >
                              <IconEdit size={14} />
                            </ActionIcon>
                          </Tooltip>
                          <Tooltip label="Remove Member">
                            <ActionIcon
                              variant="light"
                              color="red"
                              size="sm"
                              onClick={() => handleDeleteMember(member)}
                            >
                              <IconTrash size={14} />
                            </ActionIcon>
                          </Tooltip>
                        </Group>
                      </Table.Td>
                    </Table.Tr>
                  ))}
                </Table.Tbody>
              </Table>
            ) : (
              <Paper p="xl" ta="center">
                <IconUsers size={48} color="gray" style={{ margin: '0 auto 16px' }} />
                <Text size="lg" fw={500} mb="xs">No Wedding Party Members</Text>
                <Text size="sm" c="dimmed" mb="md">
                  Start by adding the first wedding party member to begin outfit fittings.
                </Text>
                <Button leftSection={<IconPlus size={16} />} onClick={openMemberForm}>
                  Add First Member
                </Button>
              </Paper>
            )}
          </Card>
        </Tabs.Panel>

        {/* Activity Tab */}
        <Tabs.Panel value="activity" pt="md">
          <Card shadow="sm" padding="md" radius="md" withBorder>
            <Text size="lg" fw={600} mb="md">Order Activity</Text>
            
            <Timeline bulletSize={24} lineWidth={2}>
              <Timeline.Item 
                bullet={<IconCheck size={12} />} 
                title="Order Created"
                color="green"
              >
                <Text c="dimmed" size="sm">
                  Order {orderWithMembers.order_number} was created on {formatDate(orderWithMembers.created_at)}
                </Text>
              </Timeline.Item>
              
              {orderWithMembers.status !== 'draft' && (
                <Timeline.Item 
                  bullet={<IconCheck size={12} />} 
                  title="Order Confirmed"
                  color="blue"
                >
                  <Text c="dimmed" size="sm">
                    Order status changed to confirmed
                  </Text>
                </Timeline.Item>
              )}
              
              {members.length > 0 && (
                <Timeline.Item 
                  bullet={<IconUsers size={12} />} 
                  title="Wedding Party Members Added"
                  color="blue"
                >
                  <Text c="dimmed" size="sm">
                    {members.length} wedding party member{members.length !== 1 ? 's' : ''} added to the order
                  </Text>
                </Timeline.Item>
              )}
              
              <Timeline.Item 
                bullet={<IconAlertTriangle size={12} />} 
                title="Pending Actions"
                color="orange"
              >
                <Text c="dimmed" size="sm">
                  {orderWithMembers.total_members - orderWithMembers.actual_members} member{orderWithMembers.total_members - orderWithMembers.actual_members !== 1 ? 's' : ''} still need to be added
                </Text>
              </Timeline.Item>
            </Timeline>
          </Card>
        </Tabs.Panel>
      </Tabs>

      {/* Member Detail Modal */}
      <Modal
        opened={memberDetailOpened}
        onClose={closeMemberDetail}
        title={selectedMember ? `${selectedMember.first_name} ${selectedMember.last_name} - Details` : 'Member Details'}
        size="xl"
        centered
      >
        {selectedMember && (
          <Stack gap="md">
            {/* Member Information */}
            <Card withBorder padding="md">
              <Text size="lg" fw={600} mb="md">Personal Information</Text>
              <Grid>
                <Grid.Col span={6}>
                  <Text size="sm" c="dimmed">Name:</Text>
                  <Text fw={500}>{selectedMember.first_name} {selectedMember.last_name}</Text>
                </Grid.Col>
                <Grid.Col span={6}>
                  <Text size="sm" c="dimmed">Role:</Text>
                  <Badge>{selectedMember.role || 'Member'}</Badge>
                </Grid.Col>
                {selectedMember.email && (
                  <Grid.Col span={6}>
                    <Text size="sm" c="dimmed">Email:</Text>
                    <Text>{selectedMember.email}</Text>
                  </Grid.Col>
                )}
                {selectedMember.phone && (
                  <Grid.Col span={6}>
                    <Text size="sm" c="dimmed">Phone:</Text>
                    <Text>{selectedMember.phone}</Text>
                  </Grid.Col>
                )}
              </Grid>
            </Card>

            {/* Garments */}
            <Card withBorder padding="md">
              <Text size="lg" fw={600} mb="md">Assigned Garments</Text>
              {selectedMember.member_garments && selectedMember.member_garments.length > 0 ? (
                <Table striped>
                  <Table.Thead>
                    <Table.Tr>
                      <Table.Th>Item</Table.Th>
                      <Table.Th>Type</Table.Th>
                      <Table.Th>Price</Table.Th>
                      <Table.Th>Status</Table.Th>
                    </Table.Tr>
                  </Table.Thead>
                  <Table.Tbody>
                    {selectedMember.member_garments.map((garment) => (
                      <Table.Tr key={garment.id}>
                        <Table.Td>
                          <Text fw={500}>{garment.garment?.name}</Text>
                        </Table.Td>
                        <Table.Td>
                          <Badge size="sm" variant="light">
                            {garment.hire ? 'Hire' : 'Purchase'}
                          </Badge>
                        </Table.Td>
                        <Table.Td>
                          £{garment.hire ? garment.garment?.hire_price : garment.garment?.purchase_price}
                        </Table.Td>
                        <Table.Td>
                          <Badge size="sm" color="blue">Assigned</Badge>
                        </Table.Td>
                      </Table.Tr>
                    ))}
                  </Table.Tbody>
                </Table>
              ) : (
                <Text c="dimmed" ta="center" py="xl">No garments assigned yet</Text>
              )}
            </Card>

            {/* Measurements */}
            <Card withBorder padding="md">
              <Text size="lg" fw={600} mb="md">Measurements</Text>
              {selectedMember.member_sizes && selectedMember.member_sizes.length > 0 ? (
                <Grid>
                  {selectedMember.member_sizes.map((size) => (
                    <Grid.Col span={4} key={size.id}>
                      <Text size="sm" c="dimmed">{size.size_type.replace('_', ' ').toUpperCase()}:</Text>
                      <Text fw={500}>
                        {size.value} {size.unit}
                      </Text>
                    </Grid.Col>
                  ))}
                </Grid>
              ) : (
                <Text c="dimmed" ta="center" py="xl">No measurements taken yet</Text>
              )}
            </Card>
          </Stack>
        )}
      </Modal>

      {/* Member Addition Modal */}
      <Modal
        opened={memberFormOpened}
        onClose={closeMemberForm}
        title="Add Wedding Party Member"
        size="xl"
        centered
        closeOnClickOutside={false}
      >
        <MemberAdditionForm
          orderId={id}
          onMemberAdded={handleMemberAdded}
          onCancel={closeMemberForm}
        />
      </Modal>
    </Stack>
  )
}