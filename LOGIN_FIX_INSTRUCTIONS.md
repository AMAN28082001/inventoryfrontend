# Login System - Fix Instructions

## Status
✅ Login page is correctly configured with API integration
✅ API server is responding at http://localhost:3001/api
✅ Environment variable is set correctly

## Steps to Fix Login

### Step 1: Restart Next.js Dev Server
Environment variables are only loaded when the server starts. If you changed `.env.local`, you MUST restart:

```bash
# Stop the current server (Ctrl+C)
# Then restart:
npm run dev
# or
pnpm dev
```

### Step 2: Clear Browser Cache
1. Open DevTools (F12)
2. Right-click the refresh button
3. Select "Empty Cache and Hard Reload"
4. Or clear localStorage: Application → Local Storage → Clear All

### Step 3: Test Login
Use these credentials (or your actual credentials):
- **Username:** `superadmin`
- **Password:** `admin123`

### Step 4: Check for Errors
1. Open Browser Console (F12 → Console)
2. Look for:
   - "API URL: http://localhost:3001/api" (should appear on page load)
   - Any red error messages
   - "Login error details:" if login fails

3. Check Network Tab (F12 → Network):
   - Try logging in
   - Find the `/auth/login` request
   - Check status code (should be 200)
   - Check response body

## What Should Happen

1. You enter username and password
2. Click "Login to Dashboard"
3. Loading spinner appears
4. On success:
   - Token saved to localStorage
   - User data saved
   - Dashboard loads based on role
5. On error:
   - Error message appears in red box
   - Detailed error logged to console

## Common Errors

### "Unable to connect to server"
- API server not running
- Wrong port (should be 3001)
- CORS issue (check API server CORS config)

### "Invalid username or password"
- Wrong credentials
- User account inactive
- Check API response for specific error

### Login button doesn't do anything
- Check browser console for JavaScript errors
- Verify form submission (network tab)
- Check if API endpoint is accessible

## Verification Checklist

- [ ] Next.js dev server restarted after .env.local changes
- [ ] API server running on port 3001
- [ ] Browser console shows "API URL: http://localhost:3001/api"
- [ ] No JavaScript errors in console
- [ ] Network request to `/auth/login` appears
- [ ] Response status is 200 (or check error message)

## Still Not Working?

1. Check browser console for errors
2. Check Network tab for failed requests
3. Verify API server is accessible: http://localhost:3001/api/auth/login
4. Share the exact error message you see

The login system is fully configured and should work after restarting the dev server!

