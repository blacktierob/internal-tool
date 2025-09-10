import { Container, Stack, Group, Title, ActionIcon, Tooltip } from '@mantine/core'
import { IconChevronLeft } from '@tabler/icons-react'
import { useNavigate } from 'react-router-dom'
import { OrderCreationWizard } from '../../components/orders/OrderCreationWizard'
import { ROUTES } from '../../constants/routes'

export function OrderCreate() {
  const navigate = useNavigate()

  const handleBack = () => {
    navigate(ROUTES.ORDERS)
  }

  const handleOrderCreated = (orderId: string) => {
    navigate(`${ROUTES.ORDERS}/${orderId}`)
  }

  return (
    <Container size="xl">
      <Stack gap="xl">
        <Group justify="space-between" align="center">
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
            <Title order={1}>Create New Order</Title>
          </Group>
        </Group>

        <OrderCreationWizard
          onOrderCreated={handleOrderCreated}
          onCancel={handleBack}
        />
      </Stack>
    </Container>
  )
}