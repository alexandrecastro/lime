# LIME Claims Application Architecture

This document describes the architecture of the LIME application and how all components work together.

## High-Level Architecture

```
┌──────────────────────────────────────────────────────────────────┐
│                        EXTERNAL USERS                            │
│                                                                  │
│ ┌──────────────────┐  ┌──────────────────┐  ┌──────────────────┐ │
│ │ TENANT WEBSITE A │  │ TENANT WEBSITE B │  │ TENANT WEBSITE C │ │
│ │ + lime-widget.js │  │ + lime-widget.js │  │ + lime-widget.js │ │
│ └────────┬─────────┘  └─────────┬────────┘  └─────────┬────────┘ │
│          │                      │                     │          │
└──────────┼──────────────────────┼─────────────────────┼──────────┘
           │                      │                     │
           │ HTTP GET             │ HTTP GET [API-KEY]  │ HTTP POST [API-KEY]
           │ lime-widget.js       │ (TENANT CONFIG)     │ (SUBMIT CLAIM)
           │                      │                     │
           │                      │                     │
           ▼                      ▼                     ▼
┌──────────────────────────────────────────────────────────────────┐
│                           LOAD BALANCER                          │
│                              (NGINX)                             │
└──────────────────────────────────────────────────────────────────┘
           │                      │                     │
           ▼                      ▼                     ▼
┌──────────────────────────────────────────────────────────────────┐
│                           DOCKER NETWORK                         │
│                           (LIME NETWORK)                         │
│                                                                  │
│  ┌────────────────────────────────────────────────────────────┐  │
│  │                FRONTEND CONTAINER (NGINX)                  │  │
│  │                                                            │  │
│  │  ┌────────────┐  ┌──────────────┐  ┌────────────────┐      │  │
│  │  │React Admin │  │ React User   │  │ Widget JS File │      │  │
│  │  │ Dashboard  │  │  Dashboard   │  │ (lime-widget   │      │  │
│  │  │            │  │              │  │   .iife.js)    │      │  │
│  │  └────────────┘  └──────────────┘  └────────────────┘      │  │
│  │                                                            │  │
│  │                 PORT 80 (MAPPED TO 5173)                   │  │
│  └──────────────────────────────┬─────────────────────────────┘  │
│                                 │                                │
│                                 │ REST API CALLS [JWT TOKEN]     │
│                                 │                                │
│                                 ▼                                │
│  ┌────────────────────────────────────────────────────────────┐  │
│  │                 BACKEND CONTAINER (NODE.JS)                │  │
│  │                                                            │  │
│  │  ┌──────────────────────────────────────────────────────┐  │  │
│  │  │                   NestJS APPLICATION                 │  │  │
│  │  │                                                      │  │  │
│  │  │      ┌──────────┐  ┌──────────┐  ┌───────────┐       │  │  │
│  │  │      │   AUTH   │  │  CLAIMS  │  │   CONFIG  │       │  │  │
│  │  │      │  MODULE  │  │  MODULE  │  │   MODULE  │       │  │  │
│  │  │      └──────────┘  └──────────┘  └───────────┘       │  │  │
│  │  │                                                      │  │  │
│  │  │      ┌──────────┐  ┌───────────┐  ┌──────────┐       │  │  │
│  │  │      │  USERS   │  │  TENANTS  │  │   gRPC   │       │  │  │
│  │  │      │  MODULE  │  │  MODULE   │  │  MODULE  │       │  │  │
│  │  │      └──────────┘  └───────────┘  └──────────┘       │  │  │
│  │  │                                                      │  │  │
│  │  └───────────────────────────┬──────────────────────────┘  │  │
│  │                              │                             │  │
│  │                              ▼                             │  │
│  │  ┌──────────────────────────────────────────────────────┐  │  │
│  │  │               IN-MEMORY SQLITE DATABASE              │  │  │
│  │  │                                                      │  │  │
│  │  │        TABLES: users, claims, config, tenants        │  │  │
│  │  └──────────────────────────────────────────────────────┘  │  │
│  │                                                            │  │
│  │             PORT 3000 (REST) / PORT 50051 (gRPC)           │  │
│  └────────────────────────────────────────────────────────────┘  │
│                                                                  │
└──────────────────────────────────────────────────────────────────┘
```

## Component Details

### 1. Frontend Container (nginx)

**Production Image**: `nginx:alpine`

**Responsibilities**:
- Serve React Admin Dashboard
- Serve React User Dashboard  
- Serve Widget JS file
- Static asset caching

**Endpoints**:
- `/` – Main React application (SPA)
- `/lime-widget.iife.js` – Embeddable widget
- `/assets/*` – Static assets (CSS, JS, images)

**Configuration**: `frontend/nginx.conf`

### 2. Backend Container (NestJS)

**Production Image**: `node:20-alpine`

**Responsibilities**:
- REST API endpoints
- gRPC API endpoints
- JWT authentication
- Multi-tenant data isolation
- Business logic
- Database operations (CRUD)

**Modules**:

#### Auth Module
- Login (`POST /api/v1/auth/login`)
- Register (`POST /api/v1/auth/register`)
- JWT token generation and validation

#### Claims Module
- Create claim (`POST /api/v1/claims`)
- List claims (`GET /api/v1/claims`)
- Update claim (`PATCH /api/v1/claims/:id`)
- Delete claim (`DELETE /api/v1/claims/:id`)

#### Config Module
- Get config (`GET /api/v1/config`)
- Update config (`POST /api/v1/config`)
- Get config for widget (`GET /api/v1/config/w` with API-Key header)
- Get claim form steps (`GET /api/v1/config/claim-form`)

#### Tenants Module
- List tenants (`GET /api/v1/tenants`)
- Get tenant (`GET /api/v1/tenants/:id`)
- Get tenant for widget (`GET /api/v1/tenants/w` with API-Key header)
- Create tenant (`POST /api/v1/tenants`)
- Update tenant (`PATCH /api/v1/tenants/:id`)
- Delete tenant (`DELETE /api/v1/tenants/:id`)

#### Users Module
- List users (`GET /api/v1/users`)
- Get user (`GET /api/v1/users/:id`)
- Create user (`POST /api/v1/users`)
- Update user (`PATCH /api/v1/users/:id`)
- Delete user (`DELETE /api/v1/users/:id`)

#### gRPC Module
- Exposes all REST endpoints via gRPC protocol
- Port 50051
- Protocol buffers defined in `backend/proto/`

### 3. Database (SQLite In-Memory)

**Development**: In-memory SQLite  
**Production**: PostgreSQL (recommended)

**Schema**:

```sql
-- Users table
users (
  id UUID PRIMARY KEY,
  email VARCHAR UNIQUE,
  password VARCHAR (hashed),
  name VARCHAR,
  role VARCHAR (user/admin/super_admin),
  tenantId UUID,
  externalId VARCHAR,
  createdAt TIMESTAMP,
  updatedAt TIMESTAMP
)

-- Claims table
claims (
  id UUID PRIMARY KEY,
  identificationNumber VARCHAR UNIQUE,
  userId UUID (FK to users),
  status VARCHAR (OPEN/IN_REVIEW/CLOSED),
  data JSON,
  createdAt TIMESTAMP,
  updatedAt TIMESTAMP
)

-- Config table
config (
  id UUID PRIMARY KEY,
  tenantId UUID,
  data JSON,
  createdAt TIMESTAMP,
  updatedAt TIMESTAMP
)

-- Tenants table
tenants (
  id UUID PRIMARY KEY,
  name VARCHAR,
  logo TEXT (base64),
  createdAt TIMESTAMP,
  updatedAt TIMESTAMP
)
```

## Data Flow

### User Login Flow

```
1. User enters credentials on LoginPage
2. Frontend sends POST /api/v1/auth/login
3. Backend validates credentials
4. Backend generates JWT token with user information
5. Frontend stores token in localStorage
6. Frontend redirects based on user role:
   - admin/super_admin → /admin
   - user → /dashboard
```

### Widget Submission Flow

```
1. External website includes widget JS (lime-widget.iife.js)
2. Widget calls createModal() with API-Key and User-ID
3. Widget fetches config: GET /api/v1/config/w (with API-Key header)
4. Widget displays form based on config
5. User fills form and submits
6. Widget sends POST /api/v1/claims with data
7. Backend checks if user exists (by externalId + tenantId)
8. If not exists, backend creates user
9. Backend creates claim with userId
10. Widget calls onSuccess callback with claim id
```

### Admin Viewing Claims Flow

```
1. Admin logs in and navigates to /admin
2. Frontend fetches claims: GET /api/v1/claims (with JWT)
3. Backend extracts user info from JWT token
4. Backend filters claims based on role:
   - super_admin: all claims
   - admin: claims from same tenant
   - user: only own claims
5. Frontend displays claims in table
```

### Configuration Update Flow

```
1. Admin edits config in JSON editor
2. Frontend sends POST /api/v1/config (with JWT)
3. Backend extracts tenantId from JWT
4. Backend updates config for tenant
7. Config immediately available for widget
```

## Multi-Tenancy Architecture

### Tenant Isolation

Each tenant has:
- **Isolated Configuration**: custom claim form fields
- **Isolated Data**: can only see their own users and claims
- **Isolated Users**: users belong to one tenant
- **Isolated Claims**: claims filtered by tenant

### Tenant Identification

**Admin/User Access**:
- JWT token contains `tenantId`
- Extracted by `JwtAuthGuard`
- Available in `req.user.tenantId`

**Widget Access**:
- HTTP header `API-Key` contains `tenantId`
- Public endpoints (no JWT required)
- Used for: config and tenant info

### Role-Based Access Control (RBAC)

**Roles**:

1. **user**:
   - Can create own claims
   - Can view own claims
   - Cannot access Admin Panel

2. **admin**:
   - Can view all claims from their tenant
   - Can update claim status
   - Can edit tenant configuration
   - Can access Admin Panel

3. **super_admin**:
   - Can view all claims from all tenants
   - Can manage tenants
   - Can create admin users
   - Can access all admin features

## Widget Architecture

### Build Process

```
1. Source: frontend/src/ClaimWidget.tsx
2. Build command: npm run build:widget
3. Vite config: vite.config.widget.ts
4. Output: frontend/public/lime-widget.iife.js
5. Format: IIFE (Immediately Invoked Function Expression)
6. Global variable: window.ClaimWidget
```

### Widget API

```javascript
ClaimWidget.createModal({
  apiUrl: 'http://your-api.com/api/v1',   // Backend URL
  apiKey: 'tenant-id-here',               // Tenant ID
  userId: 'external-user-id',             // External user ID
  onSuccess: function(claimId) {          // Success callback
    console.log('Claim created:', claimId);
  },
  onError: function(error) {              // Error callback
    console.error('Error:', error);
  }
});
```

### Widget Features

- **No Dependencies**: Self-contained, no React runtime needed
- **Inline Styles**: No external CSS files
- **Modal Interface**: Overlay with close button
- **Dynamic Form**: Fetches configuration from backend
- **Step Wizard**: Multi-step form if configured
- **Field Types**: STRING, NUMBER, AMOUNT, DATE, BOOLEAN, FILE, LIST
- **Validation**: Client-side validation
- **Auto-User-Creation**: Creates user if doesn't exist

## Security Architecture

### Authentication

```
1. User logs in with email/password
2. Backend validates credentials
3. Backend generates JWT token:
   {
     sub: userId,
     email: userEmail,
     role: userRole,
     tenantId: userTenantId,
     iat: timestamp,
     exp: timestamp + 24h
   }
4. Frontend includes token in Authorization header:
   Authorization: Bearer <token>
5. Backend validates token on protected routes
```

### Authorization

```
@UseGuards(JwtAuthGuard)  // Requires valid JWT
@Get()
async getProtectedResource(@Request() req) {
  const user = req.user;  // Extracted from JWT
  // Check permissions based on user.role
}
```

### Widget Security

- **No Authentication**: Widget endpoints are public
- **Tenant Isolation**: Via API-Key header
- **Rate Limiting**: Should be added in production
- **CORS**: Configured to allow all origins (restrictable)

## Performance Considerations

### Caching Strategy

**Frontend**:
- Static assets: 1 year cache
- Widget JS: 1 day cache (configurable)
- HTML: No cache (SPA)

**Backend**:
- Config: Could be cached per tenant
- User lookups: Could be cached
- Database queries: Use indexes

### Scalability

**Horizontal Scaling**:
```
1. Add more backend instances
2. Use load balancer (nginx/HAProxy)
3. Use external database (not in-memory)
4. Use Redis for session/cache
5. Use CDN for widget JS
```

**Vertical Scaling**:
```
1. Increase container resources
2. Optimize database queries
3. Add database indexes
4. Use connection pooling
```

## Development vs Production

### Development Mode

```yaml
# docker-compose.dev.yml
- Hot reload enabled (nodemon, Vite HMR)
- Source code mounted as volumes
- Debug logging enabled
- CORS allows all origins
- Ports: 3000 (backend), 5173 (frontend)
```

### Production Mode

```yaml
# docker-compose.yml
- Compiled/built code only
- No source code access
- Optimized builds
- Nginx serves static files
- Production logging
- Ports: 3000 (backend), 5174 (frontend)
```

## Monitoring & Observability

### Logging

```
Docker logs: docker-compose logs -f
Backend logs: Structured JSON logging
Frontend logs: Browser console errors
nginx logs: access and error logs
```

### Metrics (To Implement)

- Request rate
- Response time
- Error rate
- Active connections
- Database query time
- Memory usage
- CPU usage

### Health Checks (To Implement)

```javascript
// Backend health endpoint
@Get('health')
healthCheck() {
  return {
    status: 'ok',
    database: 'connected',
    timestamp: new Date()
  };
}
```

## Future Enhancements

### Short Term
- [ ] Swagger/OpenAPI documentation
- [ ] Health check endpoints
- [ ] Rate limiting
- [ ] Enhanced logging
- [ ] Email notifications
- [ ] Test cases

### Medium Term
- [ ] Webhook support for events
- [ ] Advanced analytics
- [ ] Export/import functionality
- [ ] Advanced search/filtering
- [ ] File storage (cloud)

### Long Term
- [ ] Mobile app
- [ ] Advanced workflow engine
- [ ] AI-powered features

## Technology Stack Summary

**Backend**:
- NestJS (Node.js framework)
- TypeScript
- TypeORM (ORM)
- SQLite (dev) / PostgreSQL (prod)
- JWT for authentication
- gRPC for RPC calls

**Frontend**:
- React 18
- TypeScript
- Vite (build tool)
- Tailwind CSS
- Axios (HTTP client)
- React Router (routing)

**Infrastructure**:
- Docker & Docker Compose
- nginx (web server)
- Node.js 18 (runtime)
- Alpine Linux (base images)

**Widget**:
- Pure TypeScript
- No external dependencies
- IIFE bundle format
- Inline styles

