# Backend Changes Required for Data Filtering

## Overview

Currently, the frontend implements client-side filtering for agents to only see their own data. However, for **security** and **performance** reasons, the backend should implement server-side filtering based on the authenticated user's role and ID.

## Current Implementation (Frontend)

- Agents fetch all sales and stock requests from the API
- Frontend filters data client-side based on `created_by_id` or `requested_by_id`
- This approach works but has security and performance implications

## Recommended Backend Changes

### 1. Sales API - Role-Based Filtering

#### Endpoint: `GET /api/sales`

**Current Behavior:**
- Returns all sales from all users

**Recommended Behavior:**
- Filter based on authenticated user's role:
  - **Agent**: Return only sales where `created_by_id = current_user.id`
  - **Account**: Return all sales (from all agents)
  - **Admin**: Return sales from their agents only (where `created_by_id` IN (agent_ids created by this admin))
  - **Super-Admin**: Return all sales (optional, for reporting)

**Implementation Example:**
```javascript
// In your sales controller
router.get('/sales', authenticate, async (req, res) => {
  try {
    const user = req.user; // From JWT token
    
    let whereClause = {};
    
    if (user.role === 'agent') {
      // Agents only see their own sales
      whereClause.created_by_id = user.id;
    } else if (user.role === 'admin') {
      // Admins see sales from their agents only
      const myAgents = await User.findAll({
        where: {
          role: 'agent',
          $or: [
            { created_by_id: user.id },
            { admin_id: user.id }
          ]
        }
      });
      const agentIds = myAgents.map(agent => agent.id);
      whereClause.created_by_id = { [Op.in]: agentIds };
    } else if (user.role === 'account') {
      // Account role sees all sales
      // No filter - return all sales
    } else if (user.role === 'super-admin') {
      // Super-admin sees all sales
      // No filter - return all sales
    }
    
    const sales = await Sale.findAll({
      where: whereClause,
      include: [
        { model: User, as: 'createdBy', attributes: ['id', 'name', 'username'] },
        { model: Product, through: SaleItem }
      ],
      order: [['created_at', 'DESC']]
    });
    
    res.json(sales);
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});
```

### 2. Stock Requests API - Role-Based Filtering

#### Endpoint: `GET /api/stock-requests`

**Current Behavior:**
- Returns all stock requests

**Recommended Behavior:**
- Filter based on authenticated user's role:
  - **Agent**: Return only requests where `requested_by_id = current_user.id`
  - **Admin**: 
    - Requests from their agents: `requested_from = "admin"` AND `requested_by_id` IN (agent_ids)
    - Their own requests to super-admin: `requested_from = "super-admin"` AND `requested_by_id = current_user.id`
    - Admin-to-admin transfers: Handle based on `requested_from` and `requested_by_id`
  - **Super-Admin**: 
    - Requests from admins: `requested_from = "super-admin"`
    - All stock returns from admins
  - **Account**: Return all requests (optional, for oversight)

**Implementation Example:**
```javascript
// In your stock requests controller
router.get('/stock-requests', authenticate, async (req, res) => {
  try {
    const user = req.user;
    const { status, requested_from } = req.query;
    
    let whereClause = {};
    
    if (user.role === 'agent') {
      // Agents only see their own requests
      whereClause.requested_by_id = user.id;
    } else if (user.role === 'admin') {
      // Get agents created by this admin
      const myAgents = await User.findAll({
        where: {
          role: 'agent',
          $or: [
            { created_by_id: user.id },
            { admin_id: user.id }
          ]
        }
      });
      const agentIds = myAgents.map(agent => agent.id);
      
      // Admin sees:
      // 1. Requests from their agents
      // 2. Their own requests to super-admin
      // 3. Admin-to-admin transfers (incoming and outgoing)
      whereClause = {
        [Op.or]: [
          { requested_from: 'admin', requested_by_id: { [Op.in]: agentIds } },
          { requested_from: 'super-admin', requested_by_id: user.id },
          { requested_from: user.id }, // Incoming transfers
          { requested_by_id: user.id, requested_from: { [Op.ne]: 'super-admin' } } // Outgoing transfers
        ]
      };
    } else if (user.role === 'super-admin') {
      // Super-admin sees requests from admins
      whereClause.requested_from = 'super-admin';
    } else if (user.role === 'account') {
      // Account sees all requests
      // No filter
    }
    
    if (status) {
      whereClause.status = status;
    }
    
    const requests = await StockRequest.findAll({
      where: whereClause,
      include: [
        { model: User, as: 'requestedBy', attributes: ['id', 'name', 'username'] },
        { model: Product, through: StockRequestItem }
      ],
      order: [['created_at', 'DESC']]
    });
    
    res.json(requests);
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});
```

### 3. Users/Agents API - Role-Based Filtering

#### Endpoint: `GET /api/users/agents` or `GET /api/users?role=agent`

**Current Behavior:**
- May return all agents

**Recommended Behavior:**
- **Admin**: Return only agents where `created_by_id = current_user.id` OR `admin_id = current_user.id`
- **Account**: Return all agents (can see all agent data)
- **Super-Admin**: Return all agents (for user management)
- **Agent**: Should not have access to this endpoint (403 Forbidden)

**Implementation Example:**
```javascript
router.get('/users/agents', authenticate, async (req, res) => {
  try {
    const user = req.user;
    
    if (user.role === 'agent') {
      return res.status(403).json({ error: 'Access denied' });
    }
    
    let whereClause = {
      role: 'agent',
      is_active: true // Only active agents
    };
    
    if (user.role === 'admin') {
      // Admins only see their own agents
      whereClause = {
        ...whereClause,
        [Op.or]: [
          { created_by_id: user.id },
          { admin_id: user.id }
        ]
      };
    }
    // Account and Super-Admin see all agents (no additional filter)
    
    const agents = await User.findAll({
      where: whereClause,
      attributes: ['id', 'username', 'name', 'role', 'is_active', 'created_at', 'created_by_id', 'admin_id'],
      order: [['created_at', 'DESC']]
    });
    
    res.json(agents);
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});
```

### 4. Stock Returns API - Role-Based Filtering

#### Endpoint: `GET /api/stock-returns`

**Current Behavior:**
- May return all stock returns

**Recommended Behavior:**
- **Agent**: Return returns where `agent_id = current_user.id` OR `created_by_id = current_user.id`
- **Admin**: 
  - Returns from their agents: `admin_id = current_user.id` AND `status = "pending"`
  - Their own returns to super-admin: `admin_id = current_user.id` AND `requested_from = "super-admin"`
- **Super-Admin**: 
  - All pending returns from admins: `status = "pending"` AND `admin_id` IS NOT NULL
- **Account**: Return all returns (optional)

**Implementation Example:**
```javascript
router.get('/stock-returns', authenticate, async (req, res) => {
  try {
    const user = req.user;
    
    let whereClause = {};
    
    if (user.role === 'agent') {
      whereClause = {
        [Op.or]: [
          { agent_id: user.id },
          { created_by_id: user.id }
        ]
      };
    } else if (user.role === 'admin') {
      // Returns from agents to this admin
      whereClause.admin_id = user.id;
    } else if (user.role === 'super-admin') {
      // All pending returns from admins
      whereClause.status = 'pending';
      // Filter only admin returns (not agent returns)
      // You may need to check if the return is from an admin
    }
    
    const returns = await StockReturn.findAll({
      where: whereClause,
      include: [
        { model: User, as: 'admin', attributes: ['id', 'name'] },
        { model: Product }
      ],
      order: [['created_at', 'DESC']]
    });
    
    res.json(returns);
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});
```

## Security Benefits

1. **Data Privacy**: Agents cannot access other agents' data even if they modify frontend code
2. **Performance**: Reduces data transfer by filtering at the database level
3. **Consistency**: Ensures data filtering rules are centralized on the server
4. **API Security**: Prevents unauthorized data access at the API level

## Performance Benefits

1. **Reduced Data Transfer**: Only necessary data is sent to the client
2. **Database Optimization**: Database queries can use indexes for filtering
3. **Lower Memory Usage**: Less data to process on both server and client

## Implementation Priority

1. **High Priority**: Sales API and Stock Requests API filtering (most critical for data privacy)
2. **Medium Priority**: Users/Agents API filtering
3. **Low Priority**: Stock Returns API filtering (if already working correctly)

## Testing Checklist

After implementing backend filtering:

- [ ] Agent can only fetch their own sales
- [ ] Agent can only fetch their own stock requests
- [ ] Admin can fetch sales from their agents only
- [ ] Admin can fetch requests from their agents only
- [ ] Account can fetch all sales from all agents
- [ ] Account can fetch all agent information
- [ ] Super-admin can fetch all data
- [ ] API returns 403 Forbidden for unauthorized access attempts

## Notes

- The frontend filtering can remain as a **secondary safety layer**
- Backend filtering is the **primary security measure**
- This ensures data security even if frontend code is modified
- Backend filtering should be implemented in the middleware or controller level

