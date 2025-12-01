# Quick Fix for Login Issues

## Verification Checklist

1. ✅ **API Server Running**
   - Tested: API is responding correctly at `http://localhost:3001/api`
   - Login endpoint works: `POST /api/auth/login`

2. ✅ **Environment Configuration**
   - `.env.local` file exists with: `NEXT_PUBLIC_API_URL=http://localhost:3001/api`

3. ✅ **Login Page Component**
   - Uses API authentication (username/password)
   - Properly imports `authApi` and `authService`
   - Error handling in place

4. ✅ **App Page Component**
   - Expects `onLogin(user: User, token: string)` callback
   - Checks for existing auth on load

## Common Issues & Solutions

### Issue 1: "Network error" or "Unable to connect to server"

**Solution:**
- Ensure your API server is running on port 3001
- Check `.env.local` has: `NEXT_PUBLIC_API_URL=http://localhost:3001/api`
- **Restart your Next.js dev server** after changing `.env.local`

### Issue 2: "Invalid username or password"

**Solution:**
- Verify credentials match your database
- Default superadmin: username `superadmin`, password `admin123`
- Check user account is active in database

### Issue 3: Login form not submitting

**Check:**
1. Open browser console (F12)
2. Look for any JavaScript errors
3. Check Network tab to see if request is being sent
4. Verify the form is inside a `<form>` tag with `onSubmit` handler

### Issue 4: Login succeeds but user not logged in

**Check:**
1. Verify `localStorage` has `auth_token` and `auth_user`
2. Check browser console for any errors after login
3. Ensure `onLogin` callback is being called correctly

## Testing Steps

1. **Test API directly:**
   ```bash
   curl -X POST http://localhost:3001/api/auth/login \
     -H "Content-Type: application/json" \
     -d '{"username":"superadmin","password":"admin123"}'
   ```
   Should return: `{"message":"Login successful","token":"...","user":{...}}`

2. **Check Browser Console:**
   - Open DevTools (F12)
   - Go to Console tab
   - Look for "API URL:" log message on page load
   - Try logging in and check for any errors

3. **Check Network Tab:**
   - Open DevTools (F12)
   - Go to Network tab
   - Try logging in
   - Look for request to `/api/auth/login`
   - Check status code (should be 200)
   - Check response body

4. **Check localStorage:**
   - After login attempt
   - Open DevTools → Application → Local Storage
   - Check for `auth_token` and `auth_user` keys

## Debug Information

The login page logs detailed error information to the console. After a failed login attempt, check the browser console for:
- "Login error details:" with full error object
- API URL being used
- Network errors or status codes

## Quick Reset

If login is stuck:
1. Clear browser localStorage:
   - Open DevTools (F12)
   - Application → Local Storage → Clear All
2. Hard refresh the page (Ctrl+Shift+R or Cmd+Shift+R)
3. Try logging in again

## Still Not Working?

Share these details:
1. Error message shown on login page
2. Browser console errors (F12 → Console)
3. Network request details (F12 → Network → find `/auth/login` request)
4. API server logs (if available)

