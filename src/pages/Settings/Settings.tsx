import { Container, Title, Text, Stack, Card, Group, Badge } from '@mantine/core'
import { useAuth } from '../../hooks/useAuth'

export function Settings() {
  const { user } = useAuth()

  return (
    <Container size="md">
      <Title order={1} mb="lg">Settings</Title>
      
      <Stack gap="xl">
        {/* User Information */}
        <Card withBorder shadow="sm" radius="md" p="lg">
          <Title order={3} mb="md">User Information</Title>
          <Stack gap="sm">
            <Group>
              <Text fw={500}>Name:</Text>
              <Text>{user?.firstName} {user?.lastName}</Text>
            </Group>
            <Group>
              <Text fw={500}>Email:</Text>
              <Text>{user?.email}</Text>
            </Group>
            <Group>
              <Text fw={500}>Role:</Text>
              <Badge color={user?.role === 'admin' ? 'blue' : 'gray'} variant="light">
                {user?.role?.toUpperCase()}
              </Badge>
            </Group>
          </Stack>
        </Card>

        {/* Application Information */}
        <Card withBorder shadow="sm" radius="md" p="lg">
          <Title order={3} mb="md">Application Information</Title>
          <Stack gap="sm">
            <Group>
              <Text fw={500}>Version:</Text>
              <Text>1.0.0 (Stage 3 Development)</Text>
            </Group>
            <Group>
              <Text fw={500}>Environment:</Text>
              <Badge color="yellow" variant="light">Development</Badge>
            </Group>
            <Group>
              <Text fw={500}>Database:</Text>
              <Text>Supabase PostgreSQL (UK Region)</Text>
            </Group>
            <Group>
              <Text fw={500}>Authentication:</Text>
              <Text>PIN-based authentication</Text>
            </Group>
          </Stack>
        </Card>
      </Stack>
    </Container>
  )
}
