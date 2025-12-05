# Frontend Updates for Backend Role-Based Filtering

## Summary

The frontend has been updated to work with the backend's role-based filtering system. The backend now handles all data filtering based on authenticated user roles, so redundant client-side filtering has been removed or simplified.

## Changes Made

### 1. Agent Dashboard (`components/dashboards/agent-dashboard.tsx`)

**Removed:**
- Client-side filtering of sales by `created_by_id`
- Client-side filtering of stock requests by `requested_by_id`

**Updated:**
- Comments now indicate that backend automatically filters data
- Direct use of `sales.sales` and `requests.requests` since backend returns pre-filtered data
- Search and sort functionality remains for user experience (filtering already-filtered data)

**Backend Behavior:**
- Agents receive only their own sales (`created_by_id = current_user.id`)
- Agents receive only their own stock requests (`requested_by_id = current_user.id`)

### 2. Admin Dashboard (`components/dashboards/admin-dashboard.tsx`)

**Removed:**
- Manual filtering of agents by `created_by_id` or `admin_id`
- Manual filtering of stock requests by agent IDs, admin transfers, etc.

**Updated:**
- Agents list: Backend returns only agents created by this admin
- Stock requests: Backend returns all relevant requests (from agents, own requests, transfers)
- Stock returns: Removed redundant `admin_id` parameter (backend filters automatically)

**Backend Behavior:**
- Admins receive only agents they created (`created_by_id = current_user.id`)
- Admins receive stock requests from their agents, their own requests, and admin-to-admin transfers
- Admins receive stock returns with `admin_id = current_user.id`

### 3. Super Admin Dashboard (`components/dashboards/super-admin-dashboard.tsx`)

**Removed:**
- Client-side filtering of stock requests by `requested_from === "super-admin"`

**Updated:**
- Comments indicate backend filters requests automatically
- Stock returns: Backend returns all pending returns from admins
- Direct use of `requests.requests` since backend returns pre-filtered data

**Backend Behavior:**
- Super-admins receive requests where `requested_from = "super-admin"`
- Super-admins receive all pending stock returns from admins

### 4. Account Dashboard (`components/dashboards/account-dashboard.tsx`)

**Updated:**
- Comments updated to reflect backend filtering
- Sales: Backend returns all sales from all agents for account role
- Agents: Backend returns all agents for account role

**Backend Behavior:**
- Account role receives all sales from all agents
- Account role receives all agents

### 5. API Hooks (`hooks/use-api-data.ts`)

**Added Documentation:**
- Comments explaining that backend automatically filters based on user role
- Role-specific filtering behavior documented in hook comments

**Backend Behavior:**
- `useSales()`: Returns pre-filtered sales based on role
- `useStockRequests()`: Returns pre-filtered requests based on role

## Backend Filtering Rules (Summary)

### Sales API (`GET /api/sales`)
- **Agent**: `created_by_id = current_user.id`
- **Admin**: `created_by_id IN [admin.id, agents created by admin]`
- **Account**: All sales
- **Super-Admin**: All sales

### Stock Requests API (`GET /api/stock-requests`)
- **Agent**: `requested_by_id = current_user.id`
- **Admin**: Requests from their agents + own requests + admin transfers
- **Super-Admin**: `requested_from = "super-admin"`
- **Account**: All requests

### Users/Agents API (`GET /api/users?role=agent`)
- **Admin**: Only agents where `created_by_id = current_user.id`
- **Account**: All agents
- **Super-Admin**: All agents
- **Agent**: 403 Forbidden

### Stock Returns API (`GET /api/stock-returns`)
- **Admin**: `admin_id = current_user.id`
- **Super-Admin**: All pending returns from admins
- **Account**: All returns
- **Agent**: 403 Forbidden (no listing allowed)

## Benefits

1. **Security**: Data filtering happens server-side, preventing unauthorized access even if frontend code is modified
2. **Performance**: Less data transferred over the network
3. **Consistency**: Centralized filtering logic on the server
4. **Maintainability**: Single source of truth for access control

## Client-Side Filtering (Still Used)

The frontend still performs client-side filtering for:
- **Search queries**: User-entered search terms
- **Sorting**: Date sorting (newest first)
- **UI filters**: Status filters, type filters, etc.

These filters operate on the already-filtered data from the backend, providing a better user experience without compromising security.

## Testing Checklist

- [x] Agent dashboard shows only agent's own sales
- [x] Agent dashboard shows only agent's own requests
- [x] Admin dashboard shows only their created agents
- [x] Admin dashboard shows requests from their agents + own requests
- [x] Super-admin dashboard shows requests from admins
- [x] Account dashboard shows all agents and all sales
- [x] Search and sort functionality still works
- [x] No redundant API calls or filtering logic

## Notes

- The frontend no longer needs to worry about role-based access control for data fetching
- All data returned from APIs is already filtered appropriately
- Client-side filtering is only for user experience (search, sort, UI filters)
- Backend filtering ensures data security at the API level

