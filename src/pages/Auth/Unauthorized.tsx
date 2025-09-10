import { Container, Paper, Title, Text, Button, Stack } from '@mantine/core'
import { Link } from 'react-router-dom'
import { ROUTES } from '../../constants/routes'

export function Unauthorized() {
  return (
    <Container size="xs" style={{ height: '100vh' }}>
      <Paper withBorder shadow="md" p="xl" radius="md" style={{ width: '100%', marginTop: '20vh' }}>
        <Stack gap="md" align="center">
          <Title order={3}>Access Denied</Title>
          <Text c="dimmed" ta="center">You do not have permission to view this page.</Text>
          <Button component={Link} to={ROUTES.LOGIN} variant="light">
            Go to Login
          </Button>
        </Stack>
      </Paper>
    </Container>
  )
}

export default Unauthorized

