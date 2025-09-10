import { Container } from '@mantine/core'
import { ReactNode } from 'react'

interface PageContainerProps {
  children: ReactNode
  size?: string
}

export function PageContainer({ children, size = "xl" }: PageContainerProps) {
  return (
    <Container size={size} py="md">
      {children}
    </Container>
  )
}