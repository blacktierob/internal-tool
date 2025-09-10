# UI/UX Documentation

## Design System Specifications

### Brand Identity & Visual Style

#### Color Palette
- **Primary Colors:**
  - Black: `#000000` - Header backgrounds, primary text
  - White: `#FFFFFF` - Backgrounds, contrast text
  - Deep Blue: `#1a237e` - Primary actions, links
  - Silver: `#c0c0c0` - Secondary elements, borders

- **Functional Colors:**
  - Success: `#4caf50` - Completed orders, positive actions
  - Warning: `#ff9800` - Pending states, cautions
  - Error: `#f44336` - Errors, deletions
  - Info: `#2196f3` - Information, neutral states

- **Neutral Palette:**
  - Gray 100: `#f5f5f5` - Background surfaces
  - Gray 200: `#eeeeee` - Dividers, disabled states
  - Gray 300: `#e0e0e0` - Borders, inactive elements
  - Gray 500: `#9e9e9e` - Secondary text
  - Gray 700: `#616161` - Primary text on light backgrounds
  - Gray 900: `#212121` - Headers, emphasis text

#### Typography
- **Primary Font:** Inter (system fallback: -apple-system, BlinkMacSystemFont, 'Segoe UI')
- **Font Weights:**
  - Regular: 400 (body text)
  - Medium: 500 (labels, captions)
  - Semibold: 600 (subheadings)
  - Bold: 700 (headings, emphasis)

- **Font Scales:**
  - `xs`: 12px - Captions, metadata
  - `sm`: 14px - Body text, form inputs
  - `md`: 16px - Default body, button text
  - `lg`: 18px - Subheadings, important text
  - `xl`: 20px - Card titles, section headers
  - `2xl`: 24px - Page titles
  - `3xl`: 32px - Main headings

#### Visual Elements
- **Border Radius:** 8px standard, 12px for cards, 4px for small elements
- **Shadows:**
  - Light: `0 1px 3px rgba(0, 0, 0, 0.1)`
  - Medium: `0 4px 6px rgba(0, 0, 0, 0.1)`
  - Strong: `0 10px 15px rgba(0, 0, 0, 0.1)`
- **Spacing Scale:** 4px base unit (4, 8, 12, 16, 20, 24, 32, 40, 48, 64px)

### Responsive Design Requirements

#### Breakpoints
- **Mobile (xs):** 0-767px - iPhone Safari support
- **Tablet (sm):** 768-1023px - iPad primary target
- **Desktop (md):** 1024-1439px - Desktop browsers
- **Large (lg):** 1440px+ - Large desktop screens

#### Device-Specific Optimizations

##### iPad (Primary Target)
- **Touch Targets:** Minimum 44px touch targets for all interactive elements
- **Gesture Support:** 
  - Swipe gestures for navigation
  - Tap and hold for context menus
  - Pull-to-refresh on lists
- **Orientation:** Support both portrait and landscape orientations
- **Layout:** Two-column layouts in landscape, single column in portrait

##### iPhone (Secondary)
- **Navigation:** Bottom navigation tabs for primary sections
- **Forms:** Stack form fields vertically with generous spacing
- **Modals:** Full-screen modals on small screens
- **Typography:** Slightly larger font sizes for readability

##### Desktop (Tertiary)
- **Keyboard Navigation:** Full keyboard accessibility
- **Mouse Interactions:** Hover states and context menus
- **Multi-panel:** Sidebar navigation with main content area
- **Shortcuts:** Keyboard shortcuts for common actions

## UI Component Guidelines

### Always use Mantine UI components when available

### Form Components

#### Input Fields
- **Styling:** Mantine TextInput with custom theme
- **States:** Default, focused, error, disabled
- **Labels:** Always visible, positioned above input
- **Validation:** Real-time validation with clear error messages
- **Touch Optimization:** Large touch targets, adequate spacing

#### Buttons
- **Primary:** Solid background for main actions (Create Order, Save)
- **Secondary:** Outlined style for secondary actions (Cancel, Edit)
- **Danger:** Red styling for destructive actions (Delete)
- **Ghost:** Text-only buttons for tertiary actions
- **Sizing:** Large (44px min) for touch, standard for desktop

#### Form Layouts
- **Mobile:** Single column, full width inputs
- **Tablet:** Two-column forms for related fields
- **Desktop:** Multi-column forms with logical grouping

### Navigation Components

#### Header
- **Fixed Position:** Always visible at top of screen
- **Content:** App title, user info, quick actions
- **Search:** Global search bar on larger screens
- **Height:** 60px consistent across all devices

#### Sidebar Navigation (Desktop/Tablet Landscape)
- **Collapsible:** Can expand/collapse to save space
- **Icons:** Clear iconography with labels
- **Active States:** Clear indication of current page
- **Width:** 240px expanded, 64px collapsed

#### Bottom Navigation (Mobile)
- **Fixed Position:** Always visible at bottom
- **Tabs:** 4-5 primary sections maximum
- **Icons:** Touch-optimized with labels
- **Height:** 60px with safe area considerations

### Data Display Components

#### Tables
- **Responsive:** Horizontal scroll on mobile, stacked layout option
- **Sorting:** Clickable column headers with sort indicators
- **Filtering:** Quick filters above table, advanced in sidebar/modal
- **Selection:** Checkbox selection with bulk actions
- **Pagination:** Load more or numbered pagination based on context

#### Cards
- **Consistent Layout:** Header, body, actions structure
- **Spacing:** 16px internal padding, 8px between elements
- **Actions:** Right-aligned button group in header
- **States:** Default, hover, selected, loading

#### Lists
- **Item Height:** 64px minimum for touch optimization
- **Avatars/Icons:** 40px size with 16px margin
- **Actions:** Swipe actions on mobile, hover actions on desktop
- **Dividers:** Subtle lines between items

## User Experience Flow Documentation

### Authentication Flow
1. **PIN Entry Screen**
   - Large numeric keypad optimized for touch
   - Visual feedback for PIN entry
   - Error handling with retry attempts
   - Auto-lock after inactivity

2. **Session Management**
   - 15-minute idle timeout
   - Warning before session expiry
   - Quick re-authentication option

### Dashboard User Journey
1. **Landing Experience**
   - Today's function dates prominently displayed
   - Recent activity summary
   - Quick action buttons for common tasks
   - KPI widgets with at-a-glance metrics

2. **Navigation Patterns**
   - Clear visual hierarchy
   - Breadcrumb navigation for context
   - Consistent back button behavior
   - Search accessible from any screen

### Order Creation Flow (Stage 1 - Groom Appointment)
1. **Customer Selection**
   - Search existing customers
   - Quick customer creation option
   - Auto-complete functionality

2. **Groom Details**
   - Personal information form
   - Function date picker with validation
   - Order type selection

3. **Groom Outfit Configuration**
   - Category-by-category selection
   - Visual preview of selections
   - Size measurement forms
   - Hire/purchase toggle for each item

4. **Additional Outfits**
   - Dynamic outfit creation
   - Copy from groom option
   - Expected party size entry
   - Save and continue workflow

### Order Management Flow (Stage 2 - Member Fittings)
1. **Order Lookup**
   - Search by groom name + function date
   - Recent orders quick access
   - Filter by status and date range

2. **Member Addition**
   - Personal details form
   - Outfit assignment from predefined options
   - Size measurement collection
   - Progress tracking against expected party size

3. **Order Overview**
   - Visual progress indicators
   - Member list with status
   - Activity timeline
   - Edit capabilities

### Search and Filter Patterns
1. **Global Search**
   - Persistent search bar
   - Recent searches
   - Filter by type (customers, orders)
   - Real-time results

2. **Advanced Filtering**
   - Collapsible filter panels
   - Date range pickers
   - Status multi-select
   - Clear all filters option

## Accessibility Standards

### WCAG AA Compliance

#### Color Contrast
- **Text:** Minimum 4.5:1 contrast ratio for normal text
- **Large Text:** Minimum 3:1 contrast ratio for 18pt+ text
- **Interactive Elements:** Clear focus indicators with 3:1 contrast

#### Keyboard Navigation
- **Tab Order:** Logical tab sequence through interactive elements
- **Focus Management:** Visible focus indicators, focus trapping in modals
- **Shortcuts:** Alt+key combinations for major functions
- **Skip Links:** Skip to main content option

#### Screen Reader Support
- **Semantic HTML:** Proper heading hierarchy, landmarks, labels
- **ARIA Labels:** Descriptive labels for complex components
- **Live Regions:** Announcements for dynamic content changes
- **Form Labels:** All inputs properly labeled and associated

#### Touch Accessibility
- **Target Size:** 44px minimum touch targets
- **Spacing:** 8px minimum between touch targets
- **Gestures:** Alternative access methods for gesture-based interactions

## Style Guide and Branding

### Logo Usage
- **Primary:** Full color logo on white backgrounds
- **Reversed:** White logo on dark backgrounds
- **Monogram:** "BT" monogram for small spaces
- **Clear Space:** Minimum spacing equal to the height of the "B" in logo

### Visual Hierarchy
1. **Page Titles:** 2xl font, semibold weight, primary color
2. **Section Headers:** xl font, semibold weight, gray-700
3. **Card Titles:** lg font, medium weight, gray-900
4. **Body Text:** md font, regular weight, gray-700
5. **Captions:** sm font, regular weight, gray-500

### Iconography
- **Style:** Tabler Icons for consistency with Mantine
- **Size:** 16px, 20px, 24px standard sizes
- **Usage:** Functional icons for actions, decorative icons sparingly
- **Color:** Match text color, use accent colors for status

### Animation Guidelines
- **Duration:** 200ms for micro-interactions, 300ms for page transitions
- **Easing:** Smooth ease-out curves for natural feeling
- **Purpose:** Provide feedback, guide attention, show relationships
- **Performance:** 60fps target, optimize for mobile devices

## Component Library Organization

### Atomic Design Structure
1. **Atoms:** Basic HTML elements (buttons, inputs, labels)
2. **Molecules:** Simple UI components (search bar, card header)
3. **Organisms:** Complex UI sections (navigation, data tables)
4. **Templates:** Page layouts and structure
5. **Pages:** Complete page implementations

### Design Tokens
- **Colors:** Centralized color palette
- **Spacing:** Consistent spacing scale
- **Typography:** Font sizes, weights, line heights
- **Shadows:** Elevation system
- **Breakpoints:** Responsive design breakpoints

### Component Documentation
- **Storybook:** Interactive component library
- **Props Documentation:** TypeScript interfaces with descriptions
- **Usage Examples:** Common use cases and patterns
- **Do's and Don'ts:** Guidelines for proper usage

## Responsive Layout Patterns

### Mobile-First Approach
1. **Base Styles:** Mobile styles as default
2. **Progressive Enhancement:** Add complexity for larger screens
3. **Touch Optimization:** Thumb-friendly interaction zones
4. **Performance:** Optimize for slower mobile connections

### Layout Grid System
- **Columns:** 12-column grid system
- **Gutters:** 16px on mobile, 24px on tablet, 32px on desktop
- **Margins:** 16px on mobile, 32px on tablet, 64px on desktop
- **Containers:** Max-width containers for content readability

### Content Prioritization
1. **Mobile:** Essential content and actions only
2. **Tablet:** Secondary content and features
3. **Desktop:** Full feature set and detailed information
4. **Progressive Disclosure:** Show more details as space allows

This comprehensive UI/UX documentation ensures that the Black Tie Menswear internal web application will provide an intuitive, accessible, and visually appealing experience across all target devices, with particular optimization for iPad use in a retail environment.