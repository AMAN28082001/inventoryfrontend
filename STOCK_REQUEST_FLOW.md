# Complete Stock Request Flow Implementation Guide

## Overview

This document describes the complete stock request flow implementation with the hierarchy: **Super Admin → Admins → Agents**.

## Flow Architecture

```
Super Admin
    ↓
  Admins (multiple)
    ↓
  Agents (mapped to each admin)
```

## Components Created

### 1. Agent Stock Request Modal (`components/modals/agent-stock-request-modal.tsx`)
- Supports B2B and B2C request types
- B2B fields: customer name, company name, GST number, contact person, email, phone, billing/delivery addresses
- B2C fields: customer name, email, phone, billing/delivery addresses
- Multiple products selection
- Notes field

### 2. Admin Stock Request Modal (`components/modals/admin-stock-request-modal.tsx`)
- Request stock from Super Admin
- Transfer stock to another Admin
- Multiple products selection
- Notes field

### 3. Enhanced Request Approval Modal (`components/modals/enhanced-request-approval-modal.tsx`)
- Shows request details (items, requester, notes)
- Dispatch image upload (optional but recommended)
- Approve & Dispatch button
- Reject with reason

### 4. Stock Confirmation Modal (`components/modals/stock-confirmation-modal.tsx`)
- Shows dispatched items
- Shows dispatch image (if uploaded)
- Confirmation image upload (required)
- Confirm receipt button

## Complete Flows

### Flow 1: Agent → Admin Request Flow

1. **Agent creates request:**
   - Opens "New Stock Request" from agent dashboard
   - Selects B2B or B2C
   - Fills all required customer details based on type
   - Adds products with quantities
   - Submits request

2. **Admin receives request:**
   - Sees request in "Agent Requests" section
   - Opens request to review details
   - Can approve or reject

3. **Admin dispatches (if approved):**
   - Uploads dispatch image (optional)
   - Clicks "Approve & Dispatch"
   - Request status changes to "dispatched"

4. **Agent confirms receipt:**
   - Sees dispatched request in "My Requests"
   - Opens confirmation modal
   - Views dispatch image
   - Uploads confirmation image
   - Clicks "Confirm Receipt"
   - Request status changes to "confirmed"

### Flow 2: Admin → Super Admin Request Flow

1. **Admin creates request:**
   - Opens "Request Stock from Super Admin"
   - Adds products with quantities
   - Adds notes (optional)
   - Submits request

2. **Super Admin receives request:**
   - Sees request in "Admin Requests" section
   - Opens request to review
   - Can approve or reject

3. **Super Admin dispatches (if approved):**
   - Uploads dispatch image (optional)
   - Clicks "Approve & Dispatch"
   - Request status changes to "dispatched"

4. **Admin confirms receipt:**
   - Sees dispatched request
   - Opens confirmation modal
   - Uploads confirmation image
   - Clicks "Confirm Receipt"
   - Request status changes to "confirmed"

### Flow 3: Admin → Admin Transfer Flow

1. **Admin creates transfer:**
   - Opens "Transfer Stock to Admin"
   - Selects target admin
   - Adds products with quantities
   - Adds notes (optional)
   - Submits transfer request

2. **Target Admin receives request:**
   - Sees request in "Transfer Requests" section
   - Reviews and dispatches with image
   - Target admin confirms receipt

## API Integration

### Creating Stock Requests

```typescript
// Agent creates request to admin
await stockRequestsApi.create({
  requested_from: "admin",
  items: [
    { product_id: "1", quantity: 50 },
    { product_id: "2", quantity: 20 }
  ],
  notes: "B2B request for GreenEnergy Corp..."
})

// Admin creates request to super-admin
await stockRequestsApi.create({
  requested_from: "super-admin",
  items: [{ product_id: "1", quantity: 100 }],
  notes: "Stock request from admin..."
})
```

### Dispatching Requests

```typescript
// Approve and dispatch with image
await stockRequestsApi.dispatch(requestId, {
  dispatch_image: imageFile // File object
})

// Reject with reason
await stockRequestsApi.dispatch(requestId, {
  rejection_reason: "Insufficient stock"
})
```

### Confirming Receipt

```typescript
await stockRequestsApi.confirm(requestId, confirmationImageFile)
```

## Dashboard Updates Needed

### Agent Dashboard
- **Tab 1: Stock Requests**
  - Show agent's own requests
  - Filter by status (pending, dispatched, confirmed, rejected)
  - For "dispatched" requests: Show "Confirm Receipt" button
  - For "confirmed" requests: Show confirmation status

- **Tab 2: Sales** (existing)

### Admin Dashboard
- **Tab 1: Agent Requests**
  - Show requests FROM agents (where `requested_from = "admin"`)
  - Filter by status (pending, dispatched, confirmed, rejected)
  - For "pending" requests: Show "Review & Dispatch" button
  - For "dispatched" requests: Show confirmation status

- **Tab 2: My Requests to Super Admin**
  - Show requests TO super-admin
  - Filter by status
  - For "dispatched" requests: Show "Confirm Receipt" button

- **Tab 3: Admin Transfers**
  - Show incoming transfer requests from other admins
  - Show outgoing transfer requests to other admins
  - Dispatch and confirmation flows

### Super Admin Dashboard
- **Tab 1: Admin Requests**
  - Show requests FROM admins (where `requested_from = "super-admin"`)
  - Filter by status
  - For "pending" requests: Show "Review & Dispatch" button

- **Tab 2: All Requests** (existing overview)
- **Tab 3: Products** (existing)

## Implementation Steps

### Step 1: Update Agent Dashboard

1. Add "Stock Requests" section
2. Use `useStockRequests` hook with filter: `requested_by_id = current_user.id`
3. Show "New Request" button that opens `AgentStockRequestModal`
4. For dispatched requests, show "Confirm Receipt" button
5. Integrate `StockConfirmationModal` for confirmation

### Step 2: Update Admin Dashboard

1. Add tabs: "Agent Requests", "My Requests", "Transfers"
2. **Agent Requests tab:**
   - Filter: `requested_from = "admin"` AND `requested_by_id` IN (agent_ids mapped to this admin)
   - Use `EnhancedRequestApprovalModal` for approval/dispatch
3. **My Requests tab:**
   - Filter: `requested_from = "super-admin"` AND `requested_by_id = current_user.id`
   - Show confirmation option for dispatched requests
4. **Transfers tab:**
   - Show incoming: `requested_from = "admin"` AND `requested_by_id` IN (other admin ids)
   - Show outgoing: `requested_from = "admin"` AND `requested_by_id = current_user.id`

### Step 3: Update Super Admin Dashboard

1. Add "Admin Requests" section
2. Filter: `requested_from = "super-admin"`
3. Use `EnhancedRequestApprovalModal` for approval/dispatch

### Step 4: Add Request Filtering Logic

The API should support filtering by:
- `requested_from`: "super-admin" | "admin"
- `requested_by_id`: User ID
- `status`: "pending" | "dispatched" | "confirmed" | "rejected"

For admin to see agent requests, you may need:
- API endpoint: `/api/stock-requests?requested_from=admin&admin_id=<current_admin_id>`
- This returns all requests from agents mapped to that admin

## Key Features

✅ **B2B/B2C Support**: Agents can specify request type with appropriate fields
✅ **Image Uploads**: Dispatch and confirmation images
✅ **Multi-product Requests**: Add multiple products in one request
✅ **Status Tracking**: pending → dispatched → confirmed
✅ **Rejection Handling**: Admins can reject with reasons
✅ **Transfer Support**: Admin-to-admin stock transfers

## Testing Checklist

- [ ] Agent can create B2B request with all fields
- [ ] Agent can create B2C request with all fields
- [ ] Admin sees agent requests
- [ ] Admin can dispatch with image upload
- [ ] Agent can confirm receipt with image upload
- [ ] Admin can request from super-admin
- [ ] Super-admin can dispatch to admin
- [ ] Admin can confirm receipt from super-admin
- [ ] Admin can transfer to another admin
- [ ] Transfer recipient can dispatch and confirm
- [ ] All status transitions work correctly
- [ ] Images display correctly
- [ ] Error handling works

## Next Steps

1. Update dashboards to integrate new modals
2. Add API filtering for agent-admin mapping
3. Implement request fetching based on user role
4. Add image preview and display functionality
5. Test complete flows end-to-end

