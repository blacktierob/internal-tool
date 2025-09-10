import { useState } from 'react'
import { 
  Container, 
  Paper, 
  Title, 
  Text, 
  PinInput, 
  Button, 
  Stack,
  Center
} from '@mantine/core'
import { showSuccess, showError } from '../../utils/notifications'
import { useAuth } from '../../hooks/useAuth'

interface LoginProps {
  onLogin: (pin: string) => Promise<void>
}

export function Login({ onLogin: _onLogin }: LoginProps) {
  const { loginWithPin } = useAuth()
  const [pin, setPin] = useState('')
  const [loading, setLoading] = useState(false)

  const handlePinSubmit = async () => {
    if (pin.length !== 4) {
      showError('Invalid PIN', 'Please enter a 4-digit PIN')
      return
    }

    setLoading(true)
    try {
      await loginWithPin(pin)
      showSuccess('Login Successful', 'Welcome back!')
      // Force navigation to dashboard
      window.location.href = '/'
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'Invalid PIN. Please try again.'
      showError('Login Failed', message)
      setPin('')
    } finally {
      setLoading(false)
    }
  }

  return (
    <Container size="xs" style={{ height: '100vh' }}>
      <Center style={{ height: '100%' }}>
        <Paper 
          withBorder 
          shadow="md" 
          p="xl" 
          radius="md" 
          style={{ width: '100%' }}
          role="main"
          aria-labelledby="login-title"
        >
          <Stack gap="lg">
            <Stack gap="sm" align="center">
              <Title id="login-title" order={2} ta="center">Black Tie Menswear</Title>
              <Text c="dimmed" size="sm" ta="center" role="banner">
                Enter your 4-digit PIN to access the system
              </Text>
            </Stack>

            <Stack gap="md" align="center" role="form" aria-label="PIN login form">
              <Text size="sm" c="dimmed" ta="center" id="pin-instructions">
                Enter your PIN
              </Text>
              <PinInput
                size="lg"
                length={4}
                type="number"
                value={pin}
                onChange={setPin}
                onComplete={handlePinSubmit}
                placeholder="•"
                aria-label="Enter 4-digit PIN"
                aria-describedby="pin-instructions"
                autoFocus
              />
              
              <Button
                fullWidth
                size="md"
                onClick={handlePinSubmit}
                loading={loading}
                disabled={pin.length !== 4}
                aria-label={`Login with PIN ${loading ? '(Loading...)' : ''}`}
                type="button"
              >
                Login with PIN
              </Button>
            </Stack>
          </Stack>
        </Paper>
      </Center>
    </Container>
  )
}

