# User Dropdown Menu Implementation

## Overview
This document describes the implementation of a user dropdown menu feature in the top navbar of the Electron POS application. The feature allows users to access their profile, navigate to settings, and logout.

## Features Implemented

### 1. User Dropdown Menu
**Location:** `/src/renderer/components/user/user-dropdown-menu.tsx`

A dropdown menu component that displays when clicking the user's name/avatar in the navbar. Includes:
- User avatar with initials
- User name and role display
- Three menu options:
  - Profile - Opens profile dialog
  - Settings - Navigates to /settings page
  - Logout - Logs out and redirects to login page

### 2. User Profile Dialog
**Location:** `/src/renderer/components/user/user-profile-dialog.tsx`

A comprehensive profile management dialog with two tabs:

#### Profile Information Tab
- **Full Name** (editable) - User's display name
- **Email** (editable) - User's email address
- **Phone Number** (editable) - User's phone number (new field)
- **Username** (read-only) - Cannot be changed
- **Role** (read-only) - User's role in the system

Features:
- Form validation for required fields
- Email format validation
- Real-time form updates
- Success/error toast notifications
- Automatic user context refresh after updates

#### Change Password Tab
- **Current Password** - Required for verification
- **New Password** - Must be at least 6 characters
- **Confirm Password** - Must match new password

Features:
- Password visibility toggle for all fields
- Comprehensive validation:
  - All fields required
  - Minimum 6 characters for new password
  - Passwords must match
  - New password must differ from current password
- Clear form on successful password change
- Password requirements display

### 3. Database Schema Updates
**Location:** `/src/main/db/schemas/users.ts`

Added `phone` field to the users table:
```typescript
phone: text('phone')
```

### 4. Migration Script
**Location:** `/src/main/db/migrations/add_phone_to_users.ts`

Automatic migration that:
- Checks if phone column already exists
- Adds phone column if missing
- Safe to run multiple times (idempotent)

Integrated into the main migration flow in `/src/main/db/migrate.ts`

### 5. Type System Updates

Updated type definitions to include phone field:
- **SessionUser** interface in `/src/shared/types/index.ts`
- **SessionData** interface in `/src/main/ipc/auth-ipc.ts`
- User session creation to include phone field

### 6. Auth Context Enhancement
**Location:** `/src/renderer/contexts/auth-context.tsx`

Added `refreshUser()` method to the auth context:
- Allows refreshing user data without page reload
- Called after profile updates to sync UI
- Maintains user session state

### 7. Header Component Integration
**Location:** `/src/renderer/components/layout/header.tsx`

Replaced the old logout button with the new UserDropdownMenu:
- Removed direct logout button
- Integrated UserDropdownMenu component
- Added toast notification system for user feedback
- Cleaner, more modern UI

## Usage

### For End Users

1. **Accessing the Dropdown:**
   - Click on your name/avatar in the top right corner of the navbar
   - The dropdown menu will appear with three options

2. **Editing Profile:**
   - Click "Profile" from the dropdown
   - Update your name, email, or phone number
   - Click "Save Changes"
   - A success message will appear and your profile will update automatically

3. **Changing Password:**
   - Click "Profile" from the dropdown
   - Switch to the "Change Password" tab
   - Enter current password, new password, and confirm new password
   - Click "Change Password"
   - A success message will appear

4. **Navigating to Settings:**
   - Click "Settings" from the dropdown
   - You'll be redirected to the application settings page

5. **Logging Out:**
   - Click "Logout" from the dropdown
   - You'll be logged out and redirected to the login page

### For Developers

#### Using the Components

```tsx
import { UserDropdownMenu } from '@/components/user'

// In your component
<UserDropdownMenu
  onShowToast={(message, type) => {
    // Optional: Custom toast handler
  }}
/>
```

#### Extending the Profile Dialog

To add new fields to the profile:

1. Update the user schema in `/src/main/db/schemas/users.ts`
2. Create a migration script
3. Update SessionUser type in `/src/shared/types/index.ts`
4. Update SessionData in `/src/main/ipc/auth-ipc.ts`
5. Add the field to the profile dialog form
6. Include the field in the update API call

## Files Created/Modified

### New Files
- `/src/renderer/components/user/user-dropdown-menu.tsx`
- `/src/renderer/components/user/user-profile-dialog.tsx`
- `/src/renderer/components/user/index.ts`
- `/src/main/db/migrations/add_phone_to_users.ts`

### Modified Files
- `/src/renderer/components/layout/header.tsx` - Integrated dropdown menu
- `/src/main/db/schemas/users.ts` - Added phone field
- `/src/main/db/migrate.ts` - Added phone migration
- `/src/main/ipc/auth-ipc.ts` - Updated session data
- `/src/shared/types/index.ts` - Updated SessionUser type
- `/src/renderer/contexts/auth-context.tsx` - Added refreshUser method

## Technical Details

### Component Architecture

```
Header
  └── UserDropdownMenu
        ├── DropdownMenu (Radix UI)
        │   ├── Profile MenuItem
        │   ├── Settings MenuItem
        │   └── Logout MenuItem
        └── UserProfileDialog
              ├── Tabs
              │   ├── Profile Information
              │   │   ├── Username (read-only)
              │   │   ├── Full Name (editable)
              │   │   ├── Email (editable)
              │   │   ├── Phone (editable)
              │   │   └── Role (read-only)
              │   └── Change Password
              │       ├── Current Password
              │       ├── New Password
              │       └── Confirm Password
              └── Toast Notifications
```

### Data Flow

1. User clicks dropdown trigger
2. Menu options displayed
3. User selects "Profile"
4. Profile dialog opens with current user data
5. User edits fields and saves
6. API call to `window.api.users.update()`
7. Backend validates and updates database
8. Success response returned
9. `refreshUser()` called to update context
10. UI updates automatically
11. Toast notification displayed

### Security Considerations

- Passwords are hashed using bcrypt with salt rounds of 12
- Current password verification required for password changes
- Username is read-only to prevent authentication issues
- Role changes can only be done by administrators through user management
- All sensitive data excluded from audit logs

## Testing Recommendations

1. **Profile Updates:**
   - Test updating each field individually
   - Test updating multiple fields at once
   - Verify validation works for invalid email formats
   - Check that username and role cannot be changed

2. **Password Changes:**
   - Test with incorrect current password
   - Test with passwords that don't match
   - Test with password less than 6 characters
   - Test successful password change
   - Verify ability to login with new password

3. **Navigation:**
   - Verify Settings menu item navigates correctly
   - Verify Logout works and redirects to login

4. **UI/UX:**
   - Test on different screen sizes
   - Verify toast notifications appear and disappear
   - Check keyboard navigation (Tab, Enter, Escape)
   - Test with screen readers for accessibility

## Future Enhancements

Potential improvements for future iterations:

1. **Avatar Upload:**
   - Allow users to upload profile pictures
   - Store in local filesystem or cloud storage

2. **Two-Factor Authentication:**
   - Add 2FA setup in profile
   - QR code generation for authenticator apps

3. **Activity Log:**
   - Show recent login history
   - Display last password change date

4. **Notification Preferences:**
   - Email notifications toggle
   - System notifications settings

5. **Theme Preferences:**
   - Personal theme selection
   - Custom color schemes

6. **Language Settings:**
   - User interface language preference
   - Date/time format preference

## Support

For issues or questions regarding this implementation:
1. Check the component source files for inline documentation
2. Review the type definitions for proper usage
3. Check browser/Electron console for error messages
4. Verify database migrations ran successfully

## Changelog

### Version 1.0.0 (2026-01-12)
- Initial implementation
- Added user dropdown menu
- Created profile dialog with two tabs
- Implemented phone field with migration
- Added password change functionality
- Integrated with existing auth system
