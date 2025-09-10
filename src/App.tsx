import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import { LoadingOverlay } from '@mantine/core'
import { Suspense, lazy } from 'react'
import { motion } from 'framer-motion'
import { useAuth } from './hooks/useAuth'
import { ProtectedRoute } from './components/auth/ProtectedRoute'
import { AppLayout } from './components/layout/AppLayout'
import { ROUTES } from './constants/routes'

// Lazy load components for better performance
const Login = lazy(() => import('./pages/Auth/Login').then(module => ({ default: module.Login })))
const Unauthorized = lazy(() => import('./pages/Auth/Unauthorized').then(module => ({ default: module.Unauthorized })))
const Dashboard = lazy(() => import('./pages/Dashboard/Dashboard').then(module => ({ default: module.Dashboard })))
const CustomerList = lazy(() => import('./components/customers/CustomerList').then(module => ({ default: module.CustomerList })))
const CustomerDetail = lazy(() => import('./components/customers/CustomerDetailView').then(module => ({ default: module.CustomerDetailView })))
const OrderList = lazy(() => import('./components/orders/OrderList').then(module => ({ default: module.OrderList })))
const OrderCreate = lazy(() => import('./pages/Orders/OrderCreate').then(module => ({ default: module.OrderCreate })))
const OrderDetail = lazy(() => import('./components/orders/OrderDetailView').then(module => ({ default: module.OrderDetailView })))
const Settings = lazy(() => import('./pages/Settings/Settings').then(module => ({ default: module.Settings })))

// Import PageContainer
import { PageContainer } from './components/common/PageContainer'

// Loading fallback component with animation
const PageLoader = () => (
  <motion.div
    initial={{ opacity: 0 }}
    animate={{ opacity: 1 }}
    exit={{ opacity: 0 }}
    transition={{ duration: 0.2 }}
  >
    <LoadingOverlay visible={true} overlayProps={{ radius: 'sm', blur: 2 }} />
  </motion.div>
)

// Page transition wrapper
const PageTransition = ({ children }: { children: React.ReactNode }) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    exit={{ opacity: 0, y: -20 }}
    transition={{ duration: 0.3, ease: 'easeInOut' }}
  >
    {children}
  </motion.div>
)

function App() {
  const { loading, isAuthenticated } = useAuth()

  if (loading) {
    return <LoadingOverlay visible={true} />
  }

  return (
    <Router>
      <Routes>
        {/* Root route redirect */}
        <Route 
          path="/" 
          element={
            isAuthenticated ? (
              <ProtectedRoute isAuthenticated={isAuthenticated}>
                <AppLayout>
                  <Suspense fallback={<PageLoader />}>
                    <PageTransition>
                      <Dashboard />
                    </PageTransition>
                  </Suspense>
                </AppLayout>
              </ProtectedRoute>
            ) : (
              <Navigate to={ROUTES.LOGIN} replace />
            )
          } 
        />

        {/* Public routes */}
        <Route 
          path={ROUTES.LOGIN} 
          element={
            isAuthenticated ? (
              <Navigate to={ROUTES.DASHBOARD} replace />
            ) : (
              <Suspense fallback={<PageLoader />}>
                <Login onLogin={() => Promise.resolve()} />
              </Suspense>
            )
          } 
        />
        <Route path={ROUTES.UNAUTHORIZED} element={
          <Suspense fallback={<PageLoader />}>
            <Unauthorized />
          </Suspense>
        } />

        {/* Protected routes */}
        <Route 
          path="/customers" 
          element={
            <ProtectedRoute isAuthenticated={isAuthenticated}>
              <AppLayout>
                <Suspense fallback={<PageLoader />}>
                  <PageContainer>
                    <CustomerList />
                  </PageContainer>
                </Suspense>
              </AppLayout>
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/customers/:id" 
          element={
            <ProtectedRoute isAuthenticated={isAuthenticated}>
              <AppLayout>
                <Suspense fallback={<PageLoader />}>
                  <CustomerDetail />
                </Suspense>
              </AppLayout>
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/orders" 
          element={
            <ProtectedRoute isAuthenticated={isAuthenticated}>
              <AppLayout>
                <Suspense fallback={<PageLoader />}>
                  <PageContainer>
                    <OrderList />
                  </PageContainer>
                </Suspense>
              </AppLayout>
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/orders/create" 
          element={
            <ProtectedRoute isAuthenticated={isAuthenticated}>
              <AppLayout>
                <Suspense fallback={<PageLoader />}>
                  <OrderCreate />
                </Suspense>
              </AppLayout>
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/orders/:id" 
          element={
            <ProtectedRoute isAuthenticated={isAuthenticated}>
              <AppLayout>
                <Suspense fallback={<PageLoader />}>
                  <OrderDetail />
                </Suspense>
              </AppLayout>
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/settings" 
          element={
            <ProtectedRoute isAuthenticated={isAuthenticated}>
              <AppLayout>
                <Suspense fallback={<PageLoader />}>
                  <Settings />
                </Suspense>
              </AppLayout>
            </ProtectedRoute>
          } 
        />

        {/* Catch all - redirect to login if not authenticated, dashboard if authenticated */}
        <Route 
          path="*" 
          element={
            isAuthenticated ? (
              <Navigate to={ROUTES.DASHBOARD} replace />
            ) : (
              <Navigate to={ROUTES.LOGIN} replace />
            )
          } 
        />
      </Routes>
    </Router>
  )
}

export default App
