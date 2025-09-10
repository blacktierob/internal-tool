# API Documentation

**Project:** Black Tie Menswear Internal Web App  
**Last Updated:** September 8, 2025  
**Database:** Supabase PostgreSQL (UK Region)  
**API Client:** Supabase JavaScript Client

## 🗄️ Database Schema

### Core Tables

#### `customers`
Primary table for customer information.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | UUID | Primary Key | Unique customer identifier |
| first_name | VARCHAR(100) | NOT NULL | Customer first name |
| last_name | VARCHAR(100) | NOT NULL | Customer last name |
| email | VARCHAR(255) | UNIQUE | Customer email address |
| phone | VARCHAR(20) | | Customer phone number |
| address_line_1 | VARCHAR(255) | | Primary address |
| address_line_2 | VARCHAR(255) | | Secondary address |
| city | VARCHAR(100) | | City |
| county | VARCHAR(100) | | County |
| postcode | VARCHAR(20) | | UK postcode |
| country | VARCHAR(100) | DEFAULT 'United Kingdom' | Country |
| notes | TEXT | | Additional customer notes |
| created_at | TIMESTAMPTZ | DEFAULT NOW() | Creation timestamp |
| updated_at | TIMESTAMPTZ | DEFAULT NOW() | Last update timestamp |

**Indexes:**
- `idx_customers_name` - (first_name, last_name)
- `idx_customers_email` - (email)
- `idx_customers_phone` - (phone)
- `idx_customers_created_at` - (created_at)

#### `orders`
Order/wedding information with full-text search.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | UUID | Primary Key | Unique order identifier |
| customer_id | UUID | Foreign Key → customers(id) | Associated customer |
| order_number | VARCHAR(50) | UNIQUE | Auto-generated order number (BT2025-001) |
| wedding_date | DATE | | Wedding/event date |
| wedding_venue | VARCHAR(255) | | Venue name |
| wedding_time | TIME | | Event time |
| function_type | VARCHAR(100) | DEFAULT 'Wedding' | Type of event |
| status | order_status | DEFAULT 'draft' | Order status enum |
| total_members | INTEGER | DEFAULT 1 | Expected number of members |
| special_requirements | TEXT | | Special requirements |
| internal_notes | TEXT | | Internal staff notes |
| created_at | TIMESTAMPTZ | DEFAULT NOW() | Creation timestamp |
| updated_at | TIMESTAMPTZ | DEFAULT NOW() | Last update timestamp |
| completed_at | TIMESTAMPTZ | | Completion timestamp |
| search_vector | TSVECTOR | GENERATED | Full-text search index |

**Indexes:**
- `idx_orders_customer_id` - (customer_id)
- `idx_orders_status` - (status)
- `idx_orders_wedding_date` - (wedding_date)
- `idx_orders_search_vector` - GIN index for full-text search

#### `order_members`
Wedding party members within orders.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | UUID | Primary Key | Unique member identifier |
| order_id | UUID | Foreign Key → orders(id) CASCADE | Associated order |
| first_name | VARCHAR(100) | NOT NULL | Member first name |
| last_name | VARCHAR(100) | NOT NULL | Member last name |
| role | member_role | NOT NULL | Role in wedding party |
| email | VARCHAR(255) | | Member email |
| phone | VARCHAR(20) | | Member phone |
| sort_order | INTEGER | DEFAULT 1 | Order within group |
| measurements_taken | BOOLEAN | DEFAULT FALSE | Measurement status |
| outfit_assigned | BOOLEAN | DEFAULT FALSE | Outfit assignment status |
| fitting_completed | BOOLEAN | DEFAULT FALSE | Fitting completion status |
| notes | TEXT | | Member-specific notes |
| created_at | TIMESTAMPTZ | DEFAULT NOW() | Creation timestamp |
| updated_at | TIMESTAMPTZ | DEFAULT NOW() | Last update timestamp |

**Constraints:**
- UNIQUE(order_id, sort_order)

#### `garment_categories`
Organizational categories for garments.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | UUID | Primary Key | Unique category identifier |
| name | VARCHAR(100) | UNIQUE NOT NULL | Category name |
| description | TEXT | | Category description |
| sort_order | INTEGER | DEFAULT 0 | Display order |
| active | BOOLEAN | DEFAULT TRUE | Category status |
| created_at | TIMESTAMPTZ | DEFAULT NOW() | Creation timestamp |

**Default Categories:**
- Jackets, Trousers, Waistcoats, Shirts, Accessories, Footwear, Other

#### `garments`
Available garments for rental/purchase.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | UUID | Primary Key | Unique garment identifier |
| category_id | UUID | Foreign Key → garment_categories(id) | Category |
| name | VARCHAR(200) | NOT NULL | Garment name |
| description | TEXT | | Detailed description |
| color | VARCHAR(100) | | Garment color |
| material | VARCHAR(100) | | Material/fabric |
| brand | VARCHAR(100) | | Brand name |
| sku | VARCHAR(100) | UNIQUE | Stock keeping unit |
| rental_price | DECIMAL(10,2) | | Rental price |
| purchase_price | DECIMAL(10,2) | | Purchase price |
| active | BOOLEAN | DEFAULT TRUE | Availability status |
| sort_order | INTEGER | DEFAULT 0 | Display order |
| created_at | TIMESTAMPTZ | DEFAULT NOW() | Creation timestamp |
| updated_at | TIMESTAMPTZ | DEFAULT NOW() | Last update timestamp |

#### `member_garments`
Garment assignments to wedding party members.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | UUID | Primary Key | Unique assignment identifier |
| member_id | UUID | Foreign Key → order_members(id) CASCADE | Associated member |
| garment_id | UUID | Foreign Key → garments(id) | Assigned garment |
| quantity | INTEGER | DEFAULT 1 | Number of items |
| is_rental | BOOLEAN | DEFAULT TRUE | Rental vs purchase |
| notes | TEXT | | Assignment notes |
| created_at | TIMESTAMPTZ | DEFAULT NOW() | Creation timestamp |

**Constraints:**
- UNIQUE(member_id, garment_id)

#### `member_sizes`
Size measurements for wedding party members.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | UUID | Primary Key | Unique measurement identifier |
| member_id | UUID | Foreign Key → order_members(id) CASCADE | Associated member |
| size_type | size_type | NOT NULL | Type of measurement |
| measurement | VARCHAR(20) | NOT NULL | Measurement value |
| measurement_unit | VARCHAR(10) | | Unit of measurement |
| notes | TEXT | | Measurement notes |
| measured_at | TIMESTAMPTZ | DEFAULT NOW() | Measurement timestamp |
| measured_by | VARCHAR(100) | | Staff member name |

**Constraints:**
- UNIQUE(member_id, size_type, measured_at)

#### `activity_logs`
Complete audit trail of all system activities.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | UUID | Primary Key | Unique log identifier |
| user_identifier | VARCHAR(50) | NOT NULL | User PIN/ID |
| user_name | VARCHAR(100) | | Display name |
| action | activity_action | NOT NULL | Action performed |
| entity_type | VARCHAR(50) | NOT NULL | Affected entity type |
| entity_id | UUID | | Affected entity ID |
| entity_name | VARCHAR(200) | | Human-readable entity name |
| description | TEXT | NOT NULL | Activity description |
| details | JSONB | | Additional structured data |
| ip_address | INET | | Client IP address |
| user_agent | TEXT | | Client user agent |
| session_id | VARCHAR(255) | | Session identifier |
| created_at | TIMESTAMPTZ | DEFAULT NOW() | Activity timestamp |

### Custom Types (Enums)

#### `order_status`
Valid order statuses for workflow management.
```sql
'draft' | 'confirmed' | 'in_progress' | 'ready' | 'completed' | 'cancelled'
```

#### `member_role`
Roles within wedding party.
```sql
'groom' | 'best_man' | 'groomsman' | 'father_of_bride' | 'father_of_groom' | 'usher' | 'page_boy' | 'other'
```

#### `activity_action`
Types of activities logged.
```sql
'create' | 'update' | 'delete' | 'view' | 'login' | 'logout'
```

#### `size_type`
Types of measurements collected.
```sql
'chest' | 'waist' | 'inside_leg' | 'trouser_waist' | 'jacket_length' | 'shirt_collar' | 'shoe_size' | 'height' | 'weight'
```

### Database Views

#### `order_summary`
Optimized view for order listings with customer information.
```sql
SELECT 
    o.id, o.order_number, o.status, o.wedding_date, o.wedding_venue, o.function_type,
    c.first_name || ' ' || c.last_name as customer_name,
    c.email as customer_email, c.phone as customer_phone,
    o.total_members, COUNT(om.id) as actual_members,
    o.created_at, o.updated_at
FROM orders o
JOIN customers c ON o.customer_id = c.id
LEFT JOIN order_members om ON o.id = om.order_id
GROUP BY o.id, c.id
```

#### `member_details`
Detailed member information with garment and size counts.
```sql
SELECT 
    om.id, om.order_id,
    om.first_name || ' ' || om.last_name as member_name,
    om.role, om.email, om.phone, om.sort_order,
    om.measurements_taken, om.outfit_assigned, om.fitting_completed,
    COUNT(mg.id) as assigned_garments,
    COUNT(ms.id) as recorded_measurements
FROM order_members om
LEFT JOIN member_garments mg ON om.id = mg.member_id
LEFT JOIN member_sizes ms ON om.id = ms.member_id
GROUP BY om.id
```

### Database Functions

#### `generate_order_number()`
Generates sequential order numbers in format BT{YEAR}-{001}.
```sql
RETURNS TEXT
```

#### `log_activity(...)`
Logs user activities for audit trail.
```sql
RETURNS UUID
```

## 🔌 Service Layer API

### Customer Service (`customerService`)

#### Methods

**`getAll(page, limit, filters)`**
- **Purpose:** Retrieve paginated customers with optional filtering
- **Parameters:**
  - `page` (number): Page number (1-based)
  - `limit` (number): Items per page (default: 50)
  - `filters` (CustomerSearchFilters): Search and filter criteria
- **Returns:** `Promise<CustomerListResponse>`
- **Filters:**
  - `search` - Name, email, or phone search
  - `email` - Email filter
  - `phone` - Phone filter
  - `city` - City filter
  - `county` - County filter
  - `postcode` - Postcode filter

**`getById(id)`**
- **Purpose:** Retrieve single customer by ID
- **Parameters:** `id` (string): Customer UUID
- **Returns:** `Promise<Customer>`

**`create(customerData)`**
- **Purpose:** Create new customer
- **Parameters:** `customerData` (CustomerInsert)
- **Returns:** `Promise<Customer>`

**`update(id, customerData)`**
- **Purpose:** Update existing customer
- **Parameters:** 
  - `id` (string): Customer UUID
  - `customerData` (CustomerUpdate)
- **Returns:** `Promise<Customer>`

**`delete(id)`**
- **Purpose:** Delete customer (with constraint checks)
- **Parameters:** `id` (string): Customer UUID
- **Returns:** `Promise<void>`

**`search(query, limit)`**
- **Purpose:** Quick search across customer fields
- **Parameters:**
  - `query` (string): Search term
  - `limit` (number): Max results (default: 10)
- **Returns:** `Promise<Customer[]>`

### Order Service (`orderService`)

#### Methods

**`getAll(page, limit, filters)`**
- **Purpose:** Retrieve paginated orders using order_summary view
- **Parameters:**
  - `page` (number): Page number
  - `limit` (number): Items per page (default: 50)
  - `filters` (OrderSearchFilters): Search criteria
- **Returns:** `Promise<OrderListResponse>`
- **Filters:**
  - `search` - Order number, customer name, venue
  - `status` - Order status filter
  - `customer_id` - Specific customer filter
  - `wedding_date_from/to` - Date range filters
  - `function_type` - Event type filter

**`getById(id)`**
- **Purpose:** Retrieve single order by ID
- **Parameters:** `id` (string): Order UUID
- **Returns:** `Promise<Order>`

**`getOrderWithMembers(id)`**
- **Purpose:** Retrieve order with complete member details
- **Parameters:** `id` (string): Order UUID
- **Returns:** Promise with nested customer and member data

**`create(orderData)`**
- **Purpose:** Create new order with auto-generated number
- **Parameters:** `orderData` (OrderInsert)
- **Returns:** `Promise<Order>`

**`update(id, orderData)`**
- **Purpose:** Update existing order
- **Parameters:**
  - `id` (string): Order UUID
  - `orderData` (OrderUpdate)
- **Returns:** `Promise<Order>`

**Order Member Management:**
- `addMember(memberData)` - Add wedding party member
- `updateMember(id, memberData)` - Update member details
- `deleteMember(id)` - Remove member
- `getOrderMembers(orderId)` - List order members

### Garment Service (`garmentService`)

#### Category Management
- `getAllCategories()` - List all garment categories
- `createCategory(categoryData)` - Add new category

#### Garment Management
- `getAll(page, limit, filters)` - Paginated garment listing
- `getById(id)` - Single garment details
- `getByCategory(categoryId)` - Garments in specific category
- `create(garmentData)` - Add new garment
- `update(id, garmentData)` - Update garment

#### Member Garment Assignments
- `assignGarmentToMember(assignmentData)` - Assign garment to member
- `updateGarmentAssignment(id, assignmentData)` - Update assignment
- `removeGarmentFromMember(id)` - Remove assignment
- `getMemberGarments(memberId)` - List member's garments

#### Size Management
- `addMemberSize(sizeData)` - Record new measurement
- `updateMemberSize(id, sizeData)` - Update measurement
- `getMemberSizes(memberId)` - All measurements for member
- `getLatestMemberSizes(memberId)` - Latest measurement per type

## 🎣 React Hooks API

### Customer Hooks

#### `useCustomers(options)`
Returns customer list management with CRUD operations.
```typescript
interface UseCustomersReturn {
  customers: Customer[]
  total: number
  loading: boolean
  error: string | null
  fetchCustomers: () => Promise<void>
  createCustomer: (data: CustomerInsert) => Promise<Customer>
  updateCustomer: (id: string, data: CustomerUpdate) => Promise<Customer>
  deleteCustomer: (id: string) => Promise<void>
  // ... pagination and filtering
}
```

#### `useCustomer(options)`
Returns single customer management.
```typescript
interface UseCustomerReturn {
  customer: Customer | null
  loading: boolean
  error: string | null
  fetchCustomer: () => Promise<void>
  updateCustomer: (data: CustomerUpdate) => Promise<Customer>
  deleteCustomer: () => Promise<void>
}
```

### Order Hooks

#### `useOrders(options)`
Returns order list management with filtering.

#### `useOrder(options)`
Returns single order management with member operations.

### Garment Hooks

#### `useGarments(options)`
Returns garment list with category filtering.

#### `useGarmentCategories()`
Returns garment category management.

#### `useMemberGarments(options)`
Returns member-specific garment assignments.

#### `useMemberSizes(options)`
Returns member measurement management.

## 🔐 Authentication

### Current Implementation
- **Method:** PIN-based authentication
- **Storage:** Local session storage
- **Test Credentials:** PIN 1234
- **Protection:** All routes protected except `/login`

### API Integration
All service methods automatically include:
- User identification for activity logging
- Session validation (basic)
- Error handling with user feedback

## 📊 Error Handling

### Service Layer
- Comprehensive try-catch blocks
- Structured error messages
- Activity logging for failures
- User-friendly error transformation

### Frontend Components
- Loading states for all async operations
- Error alerts with dismiss functionality
- Form validation with inline feedback
- Graceful degradation for network issues

## 🚀 Performance Features

### Database Optimizations
- Strategic indexing on search columns
- Full-text search with generated vectors
- Efficient JOIN queries in views
- Pagination to limit result sets

### Frontend Optimizations
- React hooks for efficient re-renders
- Debounced search inputs
- Optimistic UI updates where appropriate
- Minimal API calls with smart caching

The API layer provides a complete, type-safe interface to all business operations needed for the Black Tie Menswear workflow! 🎯