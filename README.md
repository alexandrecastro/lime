# <img src="frontend/public/lime.svg" alt="LIME" width="26"> LIME Claims

*If life gives you limes, make margaritas.*

**LIME Claims** is a tenant-based claim management system. It allows the tenant to customize steps and fields of the claim form and then embed it to its own website. Tenant's customers can easily submit claims via the tenant's website itself.

---

**Interested in the LIME Architecture?** See [ARCHITECTURE.md](ARCHITECTURE.md).

---

## Screenshots

Login Page

<img src="screenshots/screenshot-001-login.png" alt="LIME" height="400">

Create Account Page

<img src="screenshots/screenshot-002-create-account.png" alt="LIME" height="400">

Tenant Management Page

<img src="screenshots/screenshot-004-tenants.png" alt="LIME" width="400">

Create Tenant Modal

<img src="screenshots/screenshot-005-create-tenants.png" alt="LIME" height="400">

Create Tenant Modal

<img src="screenshots/screenshot-006-create-tenants.png" alt="LIME" height="400">

Admin Dashboard

<img src="screenshots/screenshot-007-admin-dashboard.png" alt="LIME" width="400">

Claim Steps

<img src="screenshots/screenshot-008-steps.png" alt="LIME" width="400">

Claim Fields

<img src="screenshots/screenshot-009-fields.png" alt="LIME" width="400">

JSON Configuration

<img src="screenshots/screenshot-010-json-configuration.png" alt="LIME" width="400">

Widget Configuration

<img src="screenshots/screenshot-011-widget.png" alt="LIME" width="400">

Example of Tenant Website (ADAC)

<img src="screenshots/screenshot-012-tenant-website.png" alt="LIME" width="400">

<img src="screenshots/screenshot-013-tenant-website.png" alt="LIME" width="400">

<img src="screenshots/screenshot-014-widget.png" alt="LIME" width="400">

<img src="screenshots/screenshot-015-widget.png" alt="LIME" width="400">

Admin Dashboard

<img src="screenshots/screenshot-016-claims.png" alt="LIME" width="400">

Claim Details

<img src="screenshots/screenshot-017-claim-details.png" alt="LIME" width="400">

<img src="screenshots/screenshot-018-claim-details.png" alt="LIME" width="400">

Admin Dashboard (another tenant)

<img src="screenshots/screenshot-019-tenant-website.png" alt="LIME" width="400">

Example of Tenant Website (Allianz)

<img src="screenshots/screenshot-020-tenant-website.png" alt="LIME" width="400">

---

## Quick Start with Docker

### Using Startup Scripts (RECOMMENDED)

The script will guide you, no worries, just execute it and follow the instructions.

**macOS/Linux:**
```bash
./start.sh
```

**Windows:**
```cmd
start.bat
```

### Using Docker Commands Manually

Alternatively, use Docker Compose directly.

```bash
# Build and start all services
docker-compose up --build -d

# Or for development with hot-reload
docker-compose -f docker-compose.dev.yml up --build -d
```

Once running:
- **Frontend**: http://localhost:5173
- **Backend API**: http://localhost:3000/api/v1
- **Embeddable Widget**: http://localhost:5173/lime-widget.iife.js

Default **super admin** credentials:
- Email: `lime@example.com`
- Password: `123456`

To stop the services:
```bash
docker-compose down
```

For detailed Docker instructions, see [DOCKER.md](DOCKER.md).

---

## Features

- Dynamic claim form creation.
- Multi-tenant support with isolated data.
- Role-based access control.
- Embeddable widget for any website.
- Admin dashboard for managing everything.
- RESTful and gRPC APIs.
- Docker-based deployment.


### Backend (NestJS)
- **REST API** with versioning (`/api/v1`).
- **gRPC API** for high-performance communication.
- **JWT Authentication** with role-based access control.
- **In-memory SQLite database** for CRUD operations.
- **Multi-tenancy** with isolated configuration and data.
- **Configurable claim forms** via UI or JSON configuration.
- **Admin Dashboard** for managing all claims and configuration.

### Frontend (React + Vite + Tailwind)
- **Modern React 18** with TypeScript.
- **Responsive design** with Tailwind CSS.
- **Authentication flow** with login/register.
- **Dynamic claim wizard** with configurable steps and fields.
  **Configurable form fields** (`STRING`, `NUMBER`, `AMOUNT`, `DATE`, `BOOLEAN`, `FILE`)
- **Admin Dashboard** for claim management and configuration
- **Embeddable widget** as a single JS file.
- **A/B testing** for file upload methods (drag-drop vs dialog).

### Widget Features
- **Single JS file** for easy embedding.
- **Button** that opens a modal with the claim form.
- **Drag-and-drop file upload** with A/B testing.
- **Form validation** and step-by-step wizard.
- **Responsive modal interface.**

---

## Project Structure

```
lime/
├── backend/                  # NestJS backend
│   ├── src/
│   │   ├── auth/             # Authentication module
│   │   ├── users/            # User module
│   │   ├── claims/           # Claim module
│   │   ├── config/           # Configuration module
│   │   ├── tenants/          # Multi-tenancy module
│   │   └── grpc/             # gRPC module
│   ├── proto/                # Protocol buffer definitions
│   ├── Dockerfile            # Production Docker image
│   ├── .dockerignore
│   ├── package.json
│   └── app-config.json       # Initial configuration
├── frontend/                 # React frontend
│   ├── src/
│   │   ├── pages/            # Page components
│   │   ├── components/       # Reusable components
│   │   ├── contexts/         # React contexts
│   │   └── ClaimWidget.tsx   # Embeddable widget
│   ├── dist-widget/          # Built widget files
│   ├── Dockerfile            # Production Docker image
│   ├── Dockerfile.dev        # Development Docker image
│   ├── nginx.conf            # Nginx configuration
│   ├── .dockerignore
│   └── package.json
├── docker-compose.yml        # Production Docker Compose
├── docker-compose.dev.yml    # Development Docker Compose
├── start.sh                  # Startup script (Unix)
├── start.bat                 # Startup script (Windows)
├── README.md                 # This file
└── DOCKER.md                 # Detailed Docker documentation
```

---

## Manual Setup (Development)

If you prefer to run the application without Docker.

### Prerequisites
- Node.js 
- npm

### Backend Setup

1. **Navigate to the backend directory:**
   ```bash
   cd backend
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Start the backend server:**
   ```bash
   npm run start:dev
   ```

The backend will be available at:
- REST API: `http://localhost:3000/api/v1`
- gRPC API: `localhost:50051`

### Frontend Setup

1. **Navigate to the frontend directory:**
   ```bash
   cd frontend
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Start the development server:**
   ```bash
   npm run dev
   ```

The frontend will be available at:
- `http://localhost:5173`

### Build Embeddable Widget

1. **Navigate to the frontend directory:**
   ```bash
   cd frontend
   ```

2. **Build the widget:**
   ```bash
   npm run build:widget
   ```

3. **Test the widget:**

   Open [example.html](frontend/example.html) in your browser, provide the API-Key (tenant id) and User-ID (any id) and click on the button to open the claim form.

---

## API Endpoints

All REST API endpoints are prefixed with `/api/v1`.

### Authentication

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| `POST` | `/auth/login` | User login | No |
| `POST` | `/auth/register` | User registration | No |
| `GET` | `/auth/profile` | Get current user profile | Yes |

**Login Request Body:**
```json
{
  "email": "user@example.com",
  "password": "password123"
}
```

**Register Request Body:**
```json
{
  "email": "user@example.com",
  "password": "password123",
  "name": "User Name",
  "tenantId": "tenant-id",
  "externalId": "optional-external-id"
}
```

### Admin Management

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| `POST` | `/admin/create-admin` | Create or promote user to admin | Yes |
| `POST` | `/admin/make-admin/:email` | Promote existing user to admin by email | Yes |

**Create Admin Request Body:**
```json
{
  "email": "admin@example.com",
  "password": "password123",
  "name": "Admin Name",
  "tenantId": "optional-tenant-id",
  "externalId": "optional-external-id"
}
```

### Users

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| `GET` | `/users` | List all users | Yes |
| `GET` | `/users/:id` | Get user by ID | Yes |
| `POST` | `/users` | Create new user | Yes |
| `PATCH` | `/users/:id` | Update user | Yes |
| `DELETE` | `/users/:id` | Delete user | Yes |

### Tenants

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| `GET` | `/tenants` | List all tenants (public) | No |
| `GET` | `/tenants/w` | Get tenant for widget (requires `API-Key` header) | No |
| `GET` | `/tenants/:id` | Get tenant by ID | Yes |
| `POST` | `/tenants` | Create new tenant | Yes |
| `PATCH` | `/tenants/:id` | Update tenant | Yes |
| `DELETE` | `/tenants/:id` | Delete tenant | Yes |

**Tenant Widget Endpoint:**
- Requires `API-Key` header with tenant ID

### Claims

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| `POST` | `/claims/w` | Create claim via widget (requires `API-Key` and `User-ID` headers) | No |
| `GET` | `/claims` | List claims (filtered by user role) | Yes |
| `GET` | `/claims/:id` | Get claim by ID | Yes |
| `POST` | `/claims` | Create new claim | Yes |
| `PATCH` | `/claims/:id` | Update claim | Yes |
| `DELETE` | `/claims/:id` | Delete claim | Yes |

**Widget Claim Creation:**
- Requires `API-Key` header with tenant ID
- Requires `User-ID` header with external user ID
- Automatically creates user if doesn't exist

**Create Claim Request Body:**
```json
{
  "identificationNumber": "optional-id",
  "status": "OPEN",
  "data": {
    "field1": "value1",
    "field2": "value2"
  }
}
```

**Role-based Access:**
- **user**: Can only view/modify their own claims
- **admin**: Can view/modify all claims from their tenant, can change claim status
- **super_admin**: Can view/modify all claims from all tenants

### Configuration

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| `GET` | `/config/w` | Get config for widget (requires `API-Key` header) | No |
| `GET` | `/config` | Get current tenant configuration | Yes |
| `GET` | `/config/claim-form` | Get claim form steps | Yes |
| `POST` | `/config` | Update configuration (admin only) | Yes |

**Configuration Widget Endpoint:**
- Requires `API-Key` header with tenant ID

## gRPC Services

The backend also exposes gRPC services on port `50051`. All proto definitions are in `backend/proto/`.

### Claims Service

| Method | Description | Request |
|--------|-------------|---------|
| `CreateClaim` | Create a new claim | `CreateClaimRequest` |
| `CreateClaimForWidget` | Create claim via widget (public) | `CreateClaimForWidgetRequest` |
| `GetClaim` | Get claim by ID | `GetClaimRequest` (includes optional `user_id`, `role` for auth) |
| `UpdateClaim` | Update claim | `UpdateClaimRequest` (includes optional `user_id`, `role` for auth) |
| `DeleteClaim` | Delete claim | `DeleteClaimRequest` (includes optional `user_id`, `role` for auth) |
| `ListClaims` | List claims | `ListClaimsRequest` (includes `user_id`, `role`, `tenant_id` for filtering) |

### Users Service

| Method | Description | Request |
|--------|-------------|---------|
| `CreateUser` | Create a new user | `CreateUserRequest` |
| `GetUser` | Get user by ID | `GetUserRequest` |
| `UpdateUser` | Update user | `UpdateUserRequest` |
| `DeleteUser` | Delete user | `DeleteUserRequest` |
| `ListUsers` | List all users | `ListUsersRequest` |

### Auth Service

| Method | Description | Request |
|--------|-------------|---------|
| `Login` | User login | `LoginRequest` |
| `Register` | User registration | `RegisterRequest` (includes `external_id`) |
| `GetProfile` | Get user profile | `GetProfileRequest` |

### Config Service

| Method | Description | Request |
|--------|-------------|---------|
| `GetConfig` | Get configuration for tenant | `GetConfigRequest` |
| `GetConfigForWidget` | Get configuration for widget | `GetConfigForWidgetRequest` (uses `api_key` instead of `tenant_id`) |
| `GetClaimFormSteps` | Get claim form steps | `GetClaimFormStepsRequest` |
| `UpdateConfig` | Update configuration | `UpdateConfigRequest` |

### Tenants Service

| Method | Description | Request |
|--------|-------------|---------|
| `CreateTenant` | Create a new tenant | `CreateTenantRequest` |
| `GetTenant` | Get tenant by ID | `GetTenantRequest` |
| `GetTenantForWidget` | Get tenant for widget | `GetTenantForWidgetRequest` (uses `api_key` instead of `tenant_id`) |
| `UpdateTenant` | Update tenant | `UpdateTenantRequest` |
| `DeleteTenant` | Delete tenant | `DeleteTenantRequest` |
| `ListTenants` | List all tenants | `ListTenantsRequest` |

### Admin Service

| Method | Description | Request |
|--------|-------------|---------|
| `CreateAdmin` | Create or promote user to admin | `CreateAdminRequest` |
| `MakeAdmin` | Promote existing user to admin by email | `MakeAdminRequest` |

---

## Default Configuration

The application uses a JSON configuration file ([app-config.json](backend/app-config.json)) as default:

---

## Embedding the Widget

When using Docker, the widget is automatically built and served at:
```
http://localhost:5173/lime-widget.iife.js
```

### Basic Usage

1. **Include the widget script in your HTML:**
   ```html
   <script src="http://localhost:5173/lime-widget.iife.js"></script>
   ```

2. **Initialize the widget:**
   ```javascript
   <script>
     ClaimWidget.createModal({
       apiUrl: 'http://localhost:3000/api/v1',
       apiKey: 'YOUR_TENANT_ID',
       userId: 'YOUR_USER_ID',
       onSuccess: function(claimId) {
         alert('Claim successfuly created! ID: ' + claimId);
       },
       onError: function(error) {
         alert('Oops... error: ' + error);
       }
     });
   </script>
   ```

### Widget Parameters

- **apiUrl**: Backend API URL (*e.g.* `http://localhost:3000/api/v1`)
- **apiKey**: Your tenant ID (get it from the Admin Dashboard).
- **userId**: User identifier from your system.
- **onSuccess**: Callback function when a claim is successfully submitted.
- **onError**: Callback function when an error occurs.

---

## Admin Features

- Login with an admin account.
- Navigate to `/admin` route.
- **Manage all claims** from all users in the same tenant.
- **Update claim statuses** (`OPEN`, `IN_REVIEW`, `CLOSED`).
- **Edit configuration** via JSON editor.
- **Real-time configuration updates** without redeployment.

---

## Development

For Prettier see [PRETTIER.md](PRETTIER.md).

### Docker Development Mode

Run the application in development mode with hot-reload:

**Start development environment**

```bash
docker-compose -f docker-compose.dev.yml up --build
```

**Or run in detached mode**

```bash
docker-compose -f docker-compose.dev.yml up -d --build
```

**View logs**

```bash
docker-compose -f docker-compose.dev.yml logs -f
```

**Stop services**
```bash
docker-compose -f docker-compose.dev.yml down
```

### Database
The application uses an **in-memory SQLite database** for development. Data is not persisted between restarts. For production, consider using a persistent database like PostgreSQL.

---

## Security Features

- **JWT Authentication** with expiration.
- **Role-based access control** (user/admin).
  - `user`: Can only view and create their own claims.
  - `admin`: Can view all claims from their tenant and edit tenant configuration.
  - `super_admin`: Can view all claims from all tenants and manage tenants.
- **Protected routes** and endpoints.
- **Input validation** with class-validator.
- **CORS configuration** for frontend integration.
- **Multi-tenancy** with isolated configuration and data.
  - Each tenant has isolated configuration and data.
  - Users belong to a tenant.
  - Claims are filtered by tenant.
  - Widget uses `API-Key` header for tenant identification.

---

## Testing

### Backend Testing

```bash
cd backend
npm run test        # RUN ALL TESTS
npm run test:watch  # WATCH MODE
npm run test:cov    # WITH COVERAGE REPORT
```

All test files follow NestJS testing patterns and use Jest with `@nestjs/testing` utilities.


### Frontend Testing

```bash
cd frontend
npm run test           # RUN TESTS
npm run test:ui        # INTERACTIVE UI MODE
npm run test:coverage  # WITH COVERAGE REPORT
```

---

## License

This project was created by Castro using some help from AI, and it is licensed under the MIT License.

---

*If life gives you limes, make margaritas.* — Your LIME Team

<img src="frontend/public/lime.svg" alt="LIME" width="24">

---