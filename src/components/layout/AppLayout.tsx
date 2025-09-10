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
  const isMobile = useMediaQuery('(max-width: 768px)')
  const isPhone = useMediaQuery('(max-width: 767px)')
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
      header={{ height: isMobile ? 56 : 64 }}
      navbar={{ 
        width: isMobile ? 280 : 300, 
        breakpoint: 'md', 
        collapsed: { mobile: !opened } 
      }}
      padding={isMobile ? 'xs' : 'md'}
    >
      <AppShell.Header>
        <Group 
          h="100%" 
          px={isMobile ? 'sm' : 'md'} 
          justify="space-between"
          wrap="nowrap"
        >
          <Group gap={isMobile ? 'xs' : 'sm'} wrap="nowrap">
            <Burger
              opened={opened}
              onClick={toggle}
              hiddenFrom="md"
              size={isMobile ? 'sm' : 'md'}
            />
            <Text size={isMobile ? 'md' : 'lg'} fw={600} style={{ whiteSpace: 'nowrap' }}>
              {isMobile ? 'Black Tie' : 'Black Tie Menswear'}
            </Text>
          </Group>
          <Group gap={isMobile ? 'xs' : 'sm'} wrap="nowrap">
            <Button
              component={Link}
              to={ROUTES.SETTINGS}
              variant={location.pathname === ROUTES.SETTINGS ? 'filled' : 'subtle'}
              size={isMobile ? 'xs' : 'sm'}
              leftSection={!isMobile ? <IconSettings style={{ width: rem(16), height: rem(16) }} /> : undefined}
            >
              {isMobile ? <IconSettings style={{ width: rem(18), height: rem(18) }} /> : 'Settings'}
            </Button>
            <Button
              variant="light"
              color="red"
              size={isMobile ? 'xs' : 'sm'}
              leftSection={!isMobile ? <IconLogout style={{ width: rem(16), height: rem(16) }} /> : undefined}
              onClick={async () => {
                await logout()
                navigate(ROUTES.LOGIN, { replace: true })
              }}
            >
              {isMobile ? <IconLogout style={{ width: rem(18), height: rem(18) }} /> : 'Logout'}
            </Button>
          </Group>
        </Group>
      </AppShell.Header>

      <AppShell.Navbar p={isMobile ? 'sm' : 'md'}>
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
            style={{ 
              minHeight: isMobile ? '48px' : '44px',
              fontSize: isMobile ? '16px' : '14px',
              borderRadius: '8px',
              marginBottom: isMobile ? '4px' : '2px'
            }}
          />
        ))}
      </AppShell.Navbar>

      <AppShell.Main>
        {children}
      </AppShell.Main>

      {/* Bottom navigation for phones */}
      {isPhone && (
        <AppShell.Footer>
          <Group h={56} px="md" justify="space-around">
            <Button
              component={Link}
              to={ROUTES.DASHBOARD}
              variant={location.pathname === ROUTES.DASHBOARD ? 'filled' : 'subtle'}
              leftSection={<IconDashboard style={{ width: rem(18), height: rem(18) }} />}
              size="xs"
            >
              Dashboard
            </Button>
            <Button
              component={Link}
              to={ROUTES.CUSTOMERS}
              variant={location.pathname === ROUTES.CUSTOMERS ? 'filled' : 'subtle'}
              leftSection={<IconUsers style={{ width: rem(18), height: rem(18) }} />}
              size="xs"
            >
              Customers
            </Button>
            <Button
              component={Link}
              to={ROUTES.ORDERS}
              variant={location.pathname === ROUTES.ORDERS ? 'filled' : 'subtle'}
              leftSection={<IconShirt style={{ width: rem(18), height: rem(18) }} />}
              size="xs"
            >
              Orders
            </Button>
            <Button
              component={Link}
              to={ROUTES.SETTINGS}
              variant={location.pathname === ROUTES.SETTINGS ? 'filled' : 'subtle'}
              leftSection={<IconSettings style={{ width: rem(18), height: rem(18) }} />}
              size="xs"
            >
              Settings
            </Button>
          </Group>
        </AppShell.Footer>
      )}
    </AppShell>
  )
}
