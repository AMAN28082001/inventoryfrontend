# Password Management Features

This document describes the password management features implemented in the application.

## Overview

Three password management features have been implemented:

1. **Forgot Password** - Users can request a password reset token
2. **Reset Password** - Users can reset their password using a reset token
3. **Change Password** - Logged-in users can change their password

## Components Created

### 1. Forgot Password Modal (`components/modals/forgot-password-modal.tsx`)

**Features:**
- Users enter their username
- System generates a reset token
- Shows success message with token (for development/testing)
- In production, token would be sent via email

**Usage:**
```tsx
import ForgotPasswordModal from "@/components/modals/forgot-password-modal"

const [showForgotPassword, setShowForgotPassword] = useState(false)

{showForgotPassword && (
  <ForgotPasswordModal
    onClose={() => setShowForgotPassword(false)}
    onSuccess={(resetToken) => {
      // Handle success, optionally show reset password modal
      if (resetToken) {
        // Open reset password modal with token
      }
    }}
  />
)}
```

### 2. Reset Password Modal (`components/modals/reset-password-modal.tsx`)

**Features:**
- Users enter reset token (can be pre-filled)
- Users enter new password (min. 6 characters)
- Users confirm new password
- Password visibility toggle
- Validates password match and minimum length

**Usage:**
```tsx
import ResetPasswordModal from "@/components/modals/reset-password-modal"

const [showResetPassword, setShowResetPassword] = useState(false)
const [resetToken, setResetToken] = useState<string | null>(null)

{showResetPassword && (
  <ResetPasswordModal
    resetToken={resetToken || undefined} // Optional pre-filled token
    onClose={() => setShowResetPassword(false)}
    onSuccess={() => {
      // Handle success, e.g., redirect to login
    }}
  />
)}
```

### 3. Change Password Modal (`components/modals/change-password-modal.tsx`)

**Features:**
- Users enter current password
- Users enter new password (min. 6 characters)
- Users confirm new password
- Password visibility toggles for all fields
- Validates that new password is different from current
- Validates password match and minimum length

**Usage in Dashboards:**
```tsx
import ChangePasswordModal from "@/components/modals/change-password-modal"
import { Key } from "lucide-react"

// In your dashboard component:
const [showChangePassword, setShowChangePassword] = useState(false)

// Add a button in your header/settings:
<Button
  onClick={() => setShowChangePassword(true)}
  variant="outline"
  size="sm"
  className="border-slate-600 text-slate-300 hover:bg-slate-700"
>
  <Key className="w-4 h-4 mr-2" />
  Change Password
</Button>

// Add the modal:
{showChangePassword && (
  <ChangePasswordModal
    onClose={() => setShowChangePassword(false)}
    onSuccess={() => {
      // Optionally logout user or show success message
      console.log("Password changed successfully")
    }}
  />
)}
```

## Integration in Login Page

The login page (`components/auth/login-page.tsx`) has been updated with:

1. **Forgot Password Link** - Below the password field
2. **Modal Integration** - Opens Forgot Password modal on click
3. **Flow Control** - Automatically opens Reset Password modal after token is received

## API Endpoints Used

All components use the `authApi` from `lib/api.ts`:

- `authApi.forgotPassword(username)` - POST `/auth/forgot-password`
- `authApi.resetPassword(resetToken, newPassword)` - POST `/auth/reset-password`
- `authApi.changePassword(currentPassword, newPassword)` - POST `/auth/change-password`

## Error Handling

All modals include comprehensive error handling for:
- Network errors
- Invalid credentials
- Expired tokens
- Password validation errors
- Server errors

## Responsive Design

All modals are responsive:
- Mobile: `max-w-[95%]` with `p-3`
- Desktop: `max-w-md` with `p-4`
- Scrollable content for smaller screens
- Touch-friendly button sizes

## Security Features

1. **Password Visibility Toggles** - Users can show/hide passwords
2. **Token Security** - Reset tokens expire after 1 hour
3. **Validation** - Client-side validation before API calls
4. **Error Messages** - Generic error messages to prevent information disclosure

## Testing

### Forgot Password Flow:
1. Click "Forgot Password?" on login page
2. Enter username
3. Receive reset token (shown in modal for development)
4. Token automatically opens Reset Password modal

### Reset Password Flow:
1. Enter reset token (or use from Forgot Password)
2. Enter new password (min. 6 characters)
3. Confirm new password
4. Submit to reset

### Change Password Flow:
1. Open Change Password modal (from dashboard)
2. Enter current password
3. Enter new password (must be different)
4. Confirm new password
5. Submit to change

## Future Enhancements

- Email integration for reset tokens (currently shown in modal)
- Password strength indicator
- Password history (prevent reusing recent passwords)
- Two-factor authentication option

