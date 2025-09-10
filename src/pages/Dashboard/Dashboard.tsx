import { 
  Container, 
  Grid, 
  Card, 
  Text, 
  Title, 
  Stack,
  Button,
  Group,
  Badge,
  LoadingOverlay,
  Alert,
  Progress,
  ActionIcon,
  Tooltip,
  NumberFormatter
} from '@mantine/core'
import { 
  IconCalendarEvent, 
  IconUsers, 
  IconShirt, 
  IconPlus, 
  IconRefresh,
  IconTrendingUp,
  IconCurrencyPound,
  IconAlertTriangle,
  IconEye,
  IconMapPin,
  IconClock
} from '@tabler/icons-react'
import { useNavigate } from 'react-router-dom'
import { useDashboard } from '../../hooks/useDashboard'
import { ROUTES } from '../../constants/routes'

export function Dashboard() {
  const navigate = useNavigate()
  const {
    kpis,
    todaysFunctions,
    upcomingFunctions,
    recentActivity,
    loading,
    error,
    refresh,
    clearError
  } = useDashboard({ 
    autoFetch: true,
    refreshInterval: 5 * 60 * 1000 // Refresh every 5 minutes
  })

  const handleNewOrder = () => {
    navigate(ROUTES.ORDER_CREATE)
  }

  const handleViewOrder = (orderId: string) => {
    navigate(`${ROUTES.ORDERS}/${orderId}`)
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString('en-GB', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    })
  }

  const formatTime = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleTimeString('en-GB', {
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const getProgressColor = (actual: number, total: number) => {
    if (total === 0) return 'gray'
    const percentage = (actual / total) * 100
    if (percentage >= 100) return 'green'
    if (percentage >= 75) return 'yellow'
    if (percentage >= 50) return 'orange'
    return 'red'
  }

  if (error) {
    return (
      <Container size="xl">
        <Alert 
          color="red" 
          title="Error Loading Dashboard"
          onClose={clearError}
          withCloseButton
        >
          {error}
        </Alert>
      </Container>
    )
  }

  return (
    <Container size="xl" style={{ position: 'relative' }}>
      <LoadingOverlay visible={loading} overlayProps={{ radius: "sm", blur: 2 }} />
      
      <Stack gap="xl">
        <Group justify="space-between" align="center">
          <Title order={1}>Dashboard</Title>
          <Group>
            <Tooltip label="Refresh Dashboard">
              <ActionIcon
                variant="light"
                size="lg"
                onClick={refresh}
                loading={loading}
              >
                <IconRefresh size={20} />
              </ActionIcon>
            </Tooltip>
            <Button 
              leftSection={<IconPlus size={16} />} 
              variant="filled"
              onClick={handleNewOrder}
            >
              New Order
            </Button>
          </Group>
        </Group>

        {/* KPI Cards */}
        <Grid>
          <Grid.Col span={{ base: 12, sm: 6, md: 3 }}>
            <Card withBorder padding="lg">
              <Group justify="space-between">
                <div>
                  <Text size="sm" c="dimmed">Total Orders</Text>
                  <NumberFormatter
                    value={kpis?.totalOrders || 0}
                    size="xl"
                    style={{ fontWeight: 700 }}
                    thousandSeparator
                  />
                </div>
                <IconShirt size={32} color="var(--mantine-color-blue-6)" />
              </Group>
            </Card>
          </Grid.Col>

          <Grid.Col span={{ base: 12, sm: 6, md: 3 }}>
            <Card withBorder padding="lg">
              <Group justify="space-between">
                <div>
                  <Text size="sm" c="dimmed">Active Customers</Text>
                  <NumberFormatter
                    value={kpis?.activeCustomers || 0}
                    size="xl"
                    style={{ fontWeight: 700 }}
                    thousandSeparator
                  />
                </div>
                <IconUsers size={32} color="var(--mantine-color-green-6)" />
              </Group>
            </Card>
          </Grid.Col>

          <Grid.Col span={{ base: 12, sm: 6, md: 3 }}>
            <Card withBorder padding="lg">
              <Group justify="space-between">
                <div>
                  <Text size="sm" c="dimmed">Today's Functions</Text>
                  <NumberFormatter
                    value={todaysFunctions.length}
                    size="xl"
                    style={{ fontWeight: 700 }}
                    thousandSeparator
                  />
                </div>
                <IconCalendarEvent size={32} color="var(--mantine-color-orange-6)" />
              </Group>
            </Card>
          </Grid.Col>

          <Grid.Col span={{ base: 12, sm: 6, md: 3 }}>
            <Card withBorder padding="lg">
              <Group justify="space-between">
                <div>
                  <Text size="sm" c="dimmed">Pending Fittings</Text>
                  <NumberFormatter
                    value={kpis?.pendingFittings || 0}
                    size="xl"
                    style={{ fontWeight: 700 }}
                    thousandSeparator
                  />
                </div>
                <IconAlertTriangle size={32} color="var(--mantine-color-red-6)" />
              </Group>
            </Card>
          </Grid.Col>
        </Grid>

        {/* Additional KPI Cards */}
        <Grid>
          <Grid.Col span={{ base: 12, sm: 6, md: 4 }}>
            <Card withBorder padding="lg">
              <Group justify="space-between">
                <div>
                  <Text size="sm" c="dimmed">Revenue This Month</Text>
                  <Group gap="xs" align="baseline">
                    <NumberFormatter
                      value={kpis?.revenueThisMonth || 0}
                      size="xl"
                      style={{ fontWeight: 700 }}
                      prefix="£"
                      thousandSeparator
                    />
                    <Text size="xs" c="dimmed">est.</Text>
                  </Group>
                </div>
                <IconCurrencyPound size={32} color="var(--mantine-color-green-6)" />
              </Group>
            </Card>
          </Grid.Col>

          <Grid.Col span={{ base: 12, sm: 6, md: 4 }}>
            <Card withBorder padding="lg">
              <Group justify="space-between">
                <div>
                  <Text size="sm" c="dimmed">Completed This Month</Text>
                  <NumberFormatter
                    value={kpis?.completedOrdersThisMonth || 0}
                    size="xl"
                    style={{ fontWeight: 700 }}
                    thousandSeparator
                  />
                </div>
                <IconTrendingUp size={32} color="var(--mantine-color-blue-6)" />
              </Group>
            </Card>
          </Grid.Col>

          <Grid.Col span={{ base: 12, sm: 6, md: 4 }}>
            <Card withBorder padding="lg">
              <Group justify="space-between">
                <div>
                  <Text size="sm" c="dimmed">Upcoming Functions</Text>
                  <NumberFormatter
                    value={upcomingFunctions.length}
                    size="xl"
                    style={{ fontWeight: 700 }}
                    thousandSeparator
                  />
                  <Text size="xs" c="dimmed">next 7 days</Text>
                </div>
                <IconCalendarEvent size={32} color="var(--mantine-color-orange-6)" />
              </Group>
            </Card>
          </Grid.Col>
        </Grid>

        <Grid>
          {/* Today's Functions */}
          <Grid.Col span={{ base: 12, lg: 8 }}>
            <Card withBorder padding="lg" h="100%">
              <Stack gap="md">
                <Group justify="space-between">
                  <Title order={3}>Today's Functions</Title>
                  <Badge color="orange" variant="light">
                    {todaysFunctions.length} Today
                  </Badge>
                </Group>
                
                {todaysFunctions.length > 0 ? (
                  <Stack gap="sm">
                    {todaysFunctions.map((func) => (
                      <Card key={func.id} withBorder padding="md">
                        <Group justify="space-between">
                          <div style={{ flex: 1 }}>
                            <Group justify="space-between" mb="xs">
                              <Text fw={600}>{func.customer_name}</Text>
                              <Badge size="sm" color="blue" variant="light">
                                {func.order_number}
                              </Badge>
                            </Group>
                            
                            <Group gap="md" mb="xs">
                              {func.wedding_venue && (
                                <Group gap={4}>
                                  <IconMapPin size={14} />
                                  <Text size="sm" c="dimmed">{func.wedding_venue}</Text>
                                </Group>
                              )}
                              <Group gap={4}>
                                <IconUsers size={14} />
                                <Text size="sm" c="dimmed">
                                  {func.actual_members}/{func.total_members} members
                                </Text>
                              </Group>
                            </Group>
                            
                            <Progress 
                              value={(func.actual_members / func.total_members) * 100}
                              color={getProgressColor(func.actual_members, func.total_members)}
                              size="sm"
                            />
                          </div>
                          
                          <Group gap="xs">
                            <Tooltip label="View Order">
                              <ActionIcon
                                variant="light"
                                color="blue"
                                onClick={() => handleViewOrder(func.id)}
                              >
                                <IconEye size={16} />
                              </ActionIcon>
                            </Tooltip>
                          </Group>
                        </Group>
                      </Card>
                    ))}
                  </Stack>
                ) : (
                  <Stack align="center" py="xl">
                    <IconCalendarEvent size={48} color="gray" />
                    <Text c="dimmed" ta="center">No functions scheduled for today</Text>
                    <Text size="sm" c="dimmed" ta="center">
                      Check the upcoming functions for this week's schedule
                    </Text>
                  </Stack>
                )}
              </Stack>
            </Card>
          </Grid.Col>

          {/* Recent Activity */}
          <Grid.Col span={{ base: 12, lg: 4 }}>
            <Card withBorder padding="lg" h="100%">
              <Stack gap="md">
                <Group justify="space-between">
                  <Title order={3}>Recent Activity</Title>
                  <Badge color="gray" variant="light">
                    Latest {recentActivity.length}
                  </Badge>
                </Group>
                
                {recentActivity.length > 0 ? (
                  <Stack gap="sm">
                    {recentActivity.map((activity) => (
                      <Card key={activity.id} withBorder padding="sm">
                        <Stack gap={4}>
                          <Group justify="space-between">
                            <Text size="sm" fw={500}>{activity.action}</Text>
                            <Group gap={4}>
                              <IconClock size={12} />
                              <Text size="xs" c="dimmed">
                                {formatTime(activity.created_at)}
                              </Text>
                            </Group>
                          </Group>
                          <Text size="xs" c="dimmed">{activity.description}</Text>
                          <Text size="xs" c="blue">{activity.user_name}</Text>
                        </Stack>
                      </Card>
                    ))}
                  </Stack>
                ) : (
                  <Stack align="center" py="xl">
                    <IconClock size={32} color="gray" />
                    <Text c="dimmed" ta="center" size="sm">No recent activity</Text>
                  </Stack>
                )}
              </Stack>
            </Card>
          </Grid.Col>
        </Grid>

        {/* Upcoming Functions This Week */}
        {upcomingFunctions.length > 0 && (
          <Card withBorder padding="lg">
            <Stack gap="md">
              <Group justify="space-between">
                <Title order={3}>Upcoming Functions (Next 7 Days)</Title>
                <Badge color="blue" variant="light">
                  {upcomingFunctions.length} Coming Up
                </Badge>
              </Group>
              
              <Grid>
                {upcomingFunctions.slice(0, 6).map((func) => (
                  <Grid.Col key={func.id} span={{ base: 12, sm: 6, lg: 4 }}>
                    <Card withBorder padding="sm">
                      <Stack gap="xs">
                        <Group justify="space-between">
                          <Text fw={500} size="sm">{func.customer_name}</Text>
                          <Badge size="xs" color="gray" variant="light">
                            {func.order_number}
                          </Badge>
                        </Group>
                        
                        <Group gap={4}>
                          <IconCalendarEvent size={14} />
                          <Text size="xs" c="dimmed">{formatDate(func.wedding_date)}</Text>
                        </Group>
                        
                        {func.wedding_venue && (
                          <Group gap={4}>
                            <IconMapPin size={14} />
                            <Text size="xs" c="dimmed" truncate>
                              {func.wedding_venue}
                            </Text>
                          </Group>
                        )}
                        
                        <Group justify="space-between">
                          <Group gap={4}>
                            <IconUsers size={12} />
                            <Text size="xs" c="dimmed">
                              {func.actual_members}/{func.total_members}
                            </Text>
                          </Group>
                          <ActionIcon
                            size="xs"
                            variant="light"
                            onClick={() => handleViewOrder(func.id)}
                          >
                            <IconEye size={12} />
                          </ActionIcon>
                        </Group>
                      </Stack>
                    </Card>
                  </Grid.Col>
                ))}
              </Grid>
            </Stack>
          </Card>
        )}
      </Stack>
    </Container>
  )
}