# Project Structure

## Root Directory

```
black-tie-tool/
├── src/
│   ├── components/
│   │   ├── common/
│   │   ├── auth/
│   │   ├── dashboard/
│   │   ├── customers/
│   │   ├── orders/
│   │   ├── garments/
│   │   └── layout/
│   ├── pages/
│   │   ├── Auth/
│   │   ├── Dashboard/
│   │   ├── Customers/
│   │   ├── Orders/
│   │   ├── WeddingGroups/
│   │   └── Settings/
│   ├── hooks/
│   ├── services/
│   ├── store/
│   ├── types/
│   ├── utils/
│   ├── constants/
│   └── assets/
├── docs/
├── public/
├── tests/
├── supabase/
├── config/
└── deployment/
```

## Detailed Structure

### `/src` - Source Code Directory

The main application source code organized by functionality and concerns.

#### `/src/components` - Reusable Components

- **`/common`** - Generic, reusable components used across the application
  - `Button/` - Custom button variants
  - `Input/` - Form input components
  - `Modal/` - Modal dialogs and overlays
  - `Table/` - Data table components
  - `SearchBar/` - Search functionality
  - `LoadingSpinner/` - Loading states
  - `ErrorBoundary/` - Error handling components

- **`/auth`** - Authentication-related components
  - `PinLogin/` - PIN entry form
  - `SessionTimeout/` - Session management
  - `ProtectedRoute/` - Route protection wrapper

- **`/dashboard`** - Dashboard-specific components
  - `FunctionDates/` - Today's and upcoming function dates
  - `ActivityLog/` - Recent activity display
  - `KPIWidgets/` - Key performance indicators
  - `QuickActions/` - Dashboard shortcuts

- **`/customers`** - Customer management components
  - `CustomerList/` - Customer listing with search/filter
  - `CustomerCard/` - Customer summary card
  - `CustomerForm/` - Add/edit customer form
  - `CustomerDetail/` - Detailed customer view

- **`/orders`** - Order management components
  - `OrderWizard/` - Multi-step order creation
  - `GroomForm/` - Groom appointment form
  - `OutfitBuilder/` - Outfit configuration
  - `MemberForm/` - Wedding party member form
  - `OrderDetail/` - Complete order view
  - `OrderStatus/` - Status management

- **`/garments`** - Garment and sizing components
  - `GarmentSelector/` - Garment category selection
  - `SizeForm/` - Size measurement forms
  - `OutfitPreview/` - Visual outfit display

- **`/layout`** - Layout and navigation components
  - `AppShell/` - Main application shell
  - `Navigation/` - Navigation menu
  - `Header/` - Application header
  - `Breadcrumbs/` - Navigation breadcrumbs

#### `/src/pages` - Page Components

- **`/Auth`** - Authentication pages
  - `Login.tsx` - PIN login page
  - `Unauthorized.tsx` - Access denied page

- **`/Dashboard`** - Dashboard pages
  - `Dashboard.tsx` - Main dashboard view

- **`/Customers`** - Customer management pages
  - `CustomerList.tsx` - Customer listing page
  - `CustomerDetail.tsx` - Customer detail page
  - `CustomerCreate.tsx` - New customer creation

- **`/Orders`** - Order management pages
  - `OrderList.tsx` - Order listing page
  - `OrderDetail.tsx` - Order detail page
  - `OrderCreate.tsx` - New order creation (groom appointment)
  - `MemberAdd.tsx` - Add wedding party member

- **`/WeddingGroups`** - Wedding group pages
  - `GroupDetail.tsx` - Wedding group overview
  - `GroupManagement.tsx` - Group member management

- **`/Settings`** - Application settings
  - `Settings.tsx` - General settings page
  - `About.tsx` - About and version information

#### `/src/hooks` - Custom React Hooks

- `useAuth.ts` - Authentication state management
- `useCustomers.ts` - Customer data operations
- `useOrders.ts` - Order data operations
- `useSearch.ts` - Search functionality
- `useActivityLog.ts` - Activity logging
- `useLocalStorage.ts` - Local storage utilities
- `useDebounce.ts` - Input debouncing
- `useBreakpoint.ts` - Responsive breakpoint detection

#### `/src/services` - External Service Integrations

- `supabase.ts` - Supabase client configuration
- `auth.service.ts` - Simplified PIN-based authentication service
- `customers.service.ts` - Customer data service
- `orders.service.ts` - Order data service
- `garments.service.ts` - Garment data service
- `activity.service.ts` - Activity logging service
- `analytics.service.ts` - Analytics integration

#### `/src/store` - State Management

- `index.ts` - Store configuration
- `authStore.ts` - Authentication state
- `customerStore.ts` - Customer data state
- `orderStore.ts` - Order data state
- `uiStore.ts` - UI state (modals, notifications)

#### `/src/types` - TypeScript Definitions

- `auth.types.ts` - Authentication types
- `customer.types.ts` - Customer entity types
- `order.types.ts` - Order and wedding group types
- `garment.types.ts` - Garment and size types
- `activity.types.ts` - Activity logging types
- `api.types.ts` - API response types
- `ui.types.ts` - UI component types

#### `/src/utils` - Utility Functions

- `validation.ts` - Form validation helpers
- `formatting.ts` - Data formatting utilities
- `constants.ts` - Application constants
- `helpers.ts` - General helper functions
- `date.utils.ts` - Date manipulation utilities
- `search.utils.ts` - Search and filter utilities

#### `/src/constants` - Application Constants

- `garments.ts` - Garment categories and options
- `sizes.ts` - Size categories and options
- `status.ts` - Order status definitions
- `routes.ts` - Application routes
- `config.ts` - Environment configuration

#### `/src/assets` - Static Assets

- `images/` - Image files and icons
- `styles/` - Global CSS and theme files
- `fonts/` - Custom font files (if any)

### `/docs` - Documentation

- `Implementation.md` - Implementation plan
- `project_structure.md` - This file
- `UI_UX_doc.md` - UI/UX documentation
- `Bug_tracking.md` - Known issues and solutions
- `API.md` - API documentation
- `deployment.md` - Deployment instructions

### `/public` - Public Assets

- `index.html` - Main HTML template
- `favicon.ico` - Application icon
- `manifest.json` - Web app manifest
- `robots.txt` - SEO robots file

### `/tests` - Test Files

- `__mocks__/` - Mock files for testing
- `unit/` - Unit tests
- `integration/` - Integration tests
- `e2e/` - End-to-end tests
- `test-utils.ts` - Testing utilities
- `setup.ts` - Test environment setup

### `/supabase` - Supabase Configuration

- `migrations/` - Database migration files
- `functions/` - Edge functions
- `seed.sql` - Database seed data
- `config.toml` - Supabase configuration

### `/config` - Configuration Files

- `.env.local` - Local environment variables
- `.env.production` - Production environment variables
- `vite.config.ts` - Vite build configuration
- `tsconfig.json` - TypeScript configuration
- `eslint.config.js` - ESLint rules
- `prettier.config.js` - Code formatting rules

### `/deployment` - Deployment Assets

- `vercel.json` - Vercel deployment configuration
- `nginx.conf` - Server configuration (if needed)
- `docker/` - Docker configuration files
- `scripts/` - Deployment scripts

## File Naming Conventions

### Components
- Use PascalCase for component files: `CustomerList.tsx`
- Use PascalCase for component directories: `CustomerList/`
- Include `index.ts` for clean imports from directories

### Hooks
- Prefix with `use` and use camelCase: `useCustomers.ts`

### Services
- Use camelCase with `.service` suffix: `auth.service.ts`

### Types
- Use camelCase with `.types` suffix: `customer.types.ts`

### Utilities
- Use camelCase with descriptive names: `validation.ts`

### Constants
- Use camelCase for files, SCREAMING_SNAKE_CASE for exports

## Module Organization Patterns

### Barrel Exports
Use `index.ts` files to create clean import paths:

```typescript
// src/components/customers/index.ts
export { CustomerList } from './CustomerList/CustomerList'
export { CustomerCard } from './CustomerCard/CustomerCard'
export { CustomerForm } from './CustomerForm/CustomerForm'
```

### Component Structure
Each component should have its own directory with:
- `ComponentName.tsx` - Main component file
- `ComponentName.module.css` - Scoped styles (if needed)
- `ComponentName.test.tsx` - Component tests
- `index.ts` - Barrel export

### Service Pattern
Services should export a single default object with methods:

```typescript
// customers.service.ts
export default {
  getAll: () => Promise<Customer[]>,
  getById: (id: string) => Promise<Customer>,
  create: (data: CreateCustomer) => Promise<Customer>,
  update: (id: string, data: UpdateCustomer) => Promise<Customer>,
  delete: (id: string) => Promise<void>
}
```

## Environment-Specific Configurations

### Development
- Hot reload enabled
- Detailed error messages
- Development analytics disabled
- Local Supabase instance

### Staging
- Production build
- Error monitoring enabled
- Limited analytics
- Staging Supabase instance

### Production
- Optimized build
- Full error monitoring
- Complete analytics
- Production Supabase instance
- Service worker enabled

## Build and Deployment Structure

### Build Output (`/dist`)
- `assets/` - Bundled CSS, JS, and images
- `index.html` - Main HTML file
- Static assets copied from `/public`

### Deployment Artifacts
- Built application files
- Environment configurations
- Database migration files
- Server configuration files

This structure ensures maintainability, scalability, and clear separation of concerns while supporting the responsive, iPad-first design requirements of the Black Tie Menswear internal web application.