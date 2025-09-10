import { type ReactNode } from 'react'
import { 
  AppShell, 
  Text, 
  NavLink, 
  Group,
  Burger,
  Button,
  rem
} from '@mantine/core'
import { useDisclosure, useMediaQuery } from '@mantine/hooks'
import { 
  IconDashboard, 
  IconUsers, 
  IconShirt,
  IconSettings,
  IconLogout
} from '@tabler/icons-react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { ROUTES } from '../../constants/routes'
import { useAuth } from '../../hooks/useAuth'

interface AppLayoutProps {
  children: ReactNode
}

export function AppLayout({ children }: AppLayoutProps) {
  const [opened, { toggle }] = useDisclosure()
  const location = useLocation()
  const isBurgerMenuActive = useMediaQuery('(max-width: 1024px)')
  const navigate = useNavigate()
  const { logout } = useAuth()

  const navItems = [
    { 
      icon: IconDashboard, 
      label: 'Dashboard', 
      href: ROUTES.DASHBOARD 
    },
    { 
      icon: IconUsers, 
      label: 'Customers', 
      href: ROUTES.CUSTOMERS 
    },
    { 
      icon: IconShirt, 
      label: 'Orders', 
      href: ROUTES.ORDERS 
    }
  ]

  return (
    <AppShell
      header={{ height: 60 }}
      navbar={{ 
        width: 300, 
        breakpoint: 'md', 
        collapsed: { mobile: !opened } 
      }}
      padding="md"
    >
      <AppShell.Header>
        <Group h="100%" px="md" justify="space-between">
          <Group>
            <Burger
              opened={opened}
              onClick={toggle}
              hiddenFrom="md"
              size="md"
            />
            <Text size="lg" fw={600}>
              Black Tie Menswear
            </Text>
          </Group>
          <Group>
            <Button
              component={Link}
              to={ROUTES.SETTINGS}
              variant={location.pathname === ROUTES.SETTINGS ? 'filled' : 'subtle'}
              size="sm"
              leftSection={<IconSettings style={{ width: rem(16), height: rem(16) }} />}
            >
              Settings
            </Button>
            <Button
              variant="light"
              color="red"
              size="sm"
              leftSection={<IconLogout style={{ width: rem(16), height: rem(16) }} />}
              onClick={async () => {
                await logout()
                navigate(ROUTES.LOGIN, { replace: true })
              }}
            >
              Logout
            </Button>
          </Group>
        </Group>
      </AppShell.Header>

      <AppShell.Navbar p="md">
        {navItems.map((item) => (
          <NavLink
            key={item.href}
            component={Link}
            to={item.href}
            label={item.label}
            leftSection={<item.icon style={{ width: rem(20), height: rem(20) }} />}
            active={location.pathname === item.href}
            onClick={() => {
              // Close menu only when burger menu is active (mobile/tablet)
              if (isBurgerMenuActive) {
                toggle()
              }
            }}
            style={{ minHeight: '44px' }}
          />
        ))}
      </AppShell.Navbar>

      <AppShell.Main>
        {children}
      </AppShell.Main>
    </AppShell>
  )
}
