# Authentication System Documentation

**Last Updated:** September 9, 2025  
**Project:** Black Tie Menswear Internal Web App  
**System:** Simplified PIN-based Authentication

## Overview

The Black Tie Menswear application uses a simplified PIN-based authentication system that allows staff members to quickly access the system using unique 4-digit PIN codes.

## System Architecture

### Database Schema

**Users Table (`users`):**
```sql
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email TEXT UNIQUE NOT NULL,
    first_name TEXT NOT NULL,
    last_name TEXT NOT NULL,
    pin_code VARCHAR(4) UNIQUE,
    role TEXT NOT NULL DEFAULT 'staff' CHECK (role IN ('admin', 'staff')),
    is_active BOOLEAN DEFAULT true,
    last_pin_login TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);
```

### Current Users

| PIN Code | Name | Email | Role |
|----------|------|--------|------|
| 1234 | Admin User | info@blacktiemenswear.co.uk | admin |
| 5678 | Senior Staff | senior@blacktiemenswear.co.uk | staff |
| 9012 | Staff Member 1 | staff1@blacktiemenswear.co.uk | staff |
| 3456 | Staff Member 2 | staff2@blacktiemenswear.co.uk | staff |

## Authentication Flow

### 1. User Access
- User navigates to the application
- If not authenticated, redirected to `/login`
- Login screen shows PIN input interface

### 2. PIN Entry
- User enters 4-digit PIN
- PIN input validates length (must be exactly 4 digits)
- On complete PIN entry, authentication request is triggered

### 3. Database Validation
```typescript
// Authentication query
const { data: userData, error } = await supabase
  .from('users')
  .select('id, email, first_name, last_name, role, pin_code')
  .eq('pin_code', pin)
  .eq('is_active', true)
  .single()
```

### 4. Session Creation
- Valid PIN creates user session object
- User data stored in localStorage
- `last_pin_login` timestamp updated in database
- User automatically redirected to dashboard

### 5. Session Management
- User session persists in localStorage as JSON
- `isAuthenticated` state managed by useAuth hook
- Logout clears localStorage session data

## Code Implementation

### Auth Service (`src/services/auth.service.ts`)

```typescript
export const authService = {
  // PIN-based authentication
  async loginWithPin(pin: string): Promise<{ user: AuthUser | null; error: string | null }> {
    try {
      // Find user by PIN code
      const { data: userData, error: userError } = await supabase
        .from('users')
        .select('id, email, first_name, last_name, role, pin_code')
        .eq('pin_code', pin)
        .eq('is_active', true)
        .single()

      if (userError || !userData) {
        return { user: null, error: 'Invalid PIN' }
      }

      // Update last PIN login
      await supabase
        .from('users')
        .update({ last_pin_login: new Date().toISOString() })
        .eq('id', userData.id)

      const user: AuthUser = {
        id: userData.id,
        email: userData.email,
        firstName: userData.first_name,
        lastName: userData.last_name,
        role: userData.role,
        lastLogin: new Date()
      }

      return { user, error: null }
    } catch (error) {
      console.error('PIN login error:', error)
      return { user: null, error: 'Login failed' }
    }
  }
}
```

### Auth Hook (`src/hooks/useAuth.ts`)

```typescript
export function useAuth() {
  const [user, setUser] = useState<AuthUser | null>(null)
  const [loading, setLoading] = useState(true)

  const loginWithPin = useCallback(async (pin: string) => {
    setLoading(true)
    try {
      const { user, error } = await authService.loginWithPin(pin)
      if (error) {
        throw new Error(error)
      }
      if (user) {
        await authService.saveUserSession(user)
        setUser(user)
      }
    } catch (error) {
      console.error('PIN login error:', error)
      throw error
    } finally {
      setLoading(false)
    }
  }, [])

  return {
    user,
    loading,
    loginWithPin,
    logout,
    isAuthenticated: !!user
  }
}
```

## Security Features

### Data Protection
- Row Level Security (RLS) enabled on users table
- PIN codes stored in plaintext for simplicity (consider hashing for production)
- Database queries use parameterized statements to prevent SQL injection
- HTTPS enforcement for all communications

### Access Control
- Only active users (`is_active = true`) can authenticate
- Role-based access control (admin vs staff)
- Session validation on protected routes

### Audit Trail
- `last_pin_login` timestamp tracked for each authentication
- Activity logging system records all user actions
- Database logs maintain query history

## Error Handling

### Invalid PIN
- Database returns no results for invalid PIN
- User sees "Invalid PIN" error message
- PIN input field is cleared for retry

### Database Errors
- Connection errors result in "Login failed" message
- Errors are logged to console for debugging
- User can retry authentication

### Network Issues
- Supabase client handles connection retries
- Loading states provide user feedback
- Graceful degradation for offline scenarios

## User Experience

### Login Interface
- Clean, minimal PIN entry screen
- Large PIN input with number type
- Immediate feedback on PIN completion
- Clear error messages for invalid attempts

### Navigation
- Automatic redirect after successful authentication
- Protected routes require authentication
- Logout returns user to login screen

### Session Persistence
- User remains logged in across browser sessions
- Manual logout required to clear session
- Simple session management without complex expiry

## Maintenance

### Adding New Users
1. Insert new record into users table with unique PIN
2. Ensure `is_active = true` and appropriate role
3. Test authentication with new PIN code

### Updating PIN Codes
1. Update `pin_code` field in users table
2. Ensure uniqueness across all users
3. Notify user of PIN change

### Troubleshooting
- Check database connectivity to Supabase
- Verify RLS policies allow user queries
- Confirm user records are active
- Review browser console for error messages

## Future Enhancements

### Security Improvements
- Implement PIN hashing for production
- Add rate limiting for failed attempts
- Consider two-factor authentication options
- Implement session timeout functionality

### User Management
- Admin interface for managing users and PINs
- Bulk user operations
- User activity reporting
- PIN change workflows

### Monitoring
- Authentication success/failure metrics
- User session analytics
- Security audit logging
- Performance monitoring

---

**Note:** This authentication system is designed for internal use with a small team of trusted staff members. For production deployment with external users, consider implementing additional security measures such as PIN hashing, rate limiting, and session expiration.