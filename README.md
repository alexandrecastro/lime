# LIME Application

A comprehensive LIME management system with both backend and frontend components, featuring an embeddable widget for easy integration into any website.

---

**📚 New to LIME?** Start here: [QUICKSTART.md](QUICKSTART.md) - Get up and running in 5 minutes!

---

## Quick Start with Docker

### Using Startup Scripts (Recommended)

The easiest way to get started:

**macOS/Linux:**
```bash
./start.sh
```

**Windows:**
```cmd
start.bat
```

The script will guide you through starting the application in production or development mode.

### Manual Docker Commands

Alternatively, use Docker Compose directly:

```bash
# Build and start all services
docker-compose up --build -d

# Or for development with hot-reload
docker-compose -f docker-compose.dev.yml up --build -d
```

Once running:
- **Frontend**: http://localhost:5174
- **Backend API**: http://localhost:3000/api/v1
- **Widget JS**: http://localhost:5174/widget/lime-widget.iife.js

Default super admin credentials:
- Email: `lime@example.com`
- Password: `123456`

To stop the services:
```bash
docker-compose down
```

For detailed Docker instructions, see [DOCKER.md](DOCKER.md).

## Features

### Backend (NestJS)
- **REST API** with versioning (`/api/v1`)
- **gRPC API** for high-performance communication
- **JWT Authentication** with role-based access control
- **In-memory SQLite database** for development
- **Configurable claim forms** via JSON configuration
- **User and Claims CRUD operations**
- **Admin panel** for managing all claims and configuration

### Frontend (React + Vite + Tailwind)
- **Modern React 18** with TypeScript
- **Responsive design** with Tailwind CSS
- **Authentication flow** with login/register
- **Dynamic claim wizard** with configurable steps and fields
- **Admin panel** for claim management and configuration
- **Embeddable widget** as a single JS file
- **A/B testing** for file upload methods (drag-drop vs dialog)

### Widget Features
- **Single JS file** for easy embedding
- **Floating button** that opens a modal
- **Configurable form fields** (STRING, NUMBER, AMOUNT, DATE, BOOLEAN, FILE)
- **Drag-and-drop file upload** with A/B testing
- **Form validation** and step-by-step wizard
- **Responsive modal interface**

## Project Structure

```
lime/
├── backend/                   # NestJS backend
│   ├── src/
│   │   ├── auth/             # Authentication module
│   │   ├── users/            # User management
│   │   ├── claims/           # LIME management
│   │   ├── config/           # Configuration system
│   │   ├── tenants/          # Multi-tenancy
│   │   └── grpc/             # gRPC services
│   ├── proto/                # Protocol buffer definitions
│   ├── Dockerfile            # Production Docker image
│   ├── .dockerignore
│   └── package.json
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

## Manual Setup (Development)

If you prefer to run the application without Docker:

### Prerequisites
- Node.js 18+ 
- npm or yarn

### Backend Setup

1. **Navigate to backend directory:**
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

1. **Navigate to frontend directory:**
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

   The frontend will be available at `http://localhost:5173`

### Build Embeddable Widget

1. **Build the widget:**
   ```bash
   npm run build:widget
   ```

2. **Test the widget:**
   Open `example.html` in your browser to see the embeddable widget in action.

## API Endpoints

### Authentication
- `POST /api/v1/auth/login` - User login
- `POST /api/v1/auth/register` - User registration
- `GET /api/v1/auth/profile` - Get user profile (protected)

### Users (Protected)
- `GET /api/v1/users` - List all users
- `GET /api/v1/users/:id` - Get user by ID
- `POST /api/v1/users` - Create user
- `PATCH /api/v1/users/:id` - Update user
- `DELETE /api/v1/users/:id` - Delete user

### Claims (Protected)
- `GET /api/v1/claims` - List user's claims (or all if admin)
- `GET /api/v1/claims/:id` - Get claim by ID
- `POST /api/v1/claims` - Create new claim
- `PATCH /api/v1/claims/:id` - Update claim
- `DELETE /api/v1/claims/:id` - Delete claim

### Configuration (Protected)
- `GET /api/v1/config` - Get full configuration
- `GET /api/v1/config/claim-form` - Get claim form steps
- `GET /api/v1/config/file-upload-method` - Get file upload method
- `POST /api/v1/config` - Update configuration (admin only)

## gRPC Services

The backend also exposes gRPC services on port 50051:

### Claims Service
- `CreateClaim` - Create a new claim
- `GetClaim` - Get claim by ID
- `UpdateClaim` - Update claim
- `DeleteClaim` - Delete claim
- `ListClaims` - List claims

### Users Service
- `CreateUser` - Create a new user
- `GetUser` - Get user by ID
- `UpdateUser` - Update user
- `DeleteUser` - Delete user
- `ListUsers` - List users

## Configuration System

The application uses a JSON configuration file (`app-config.json`) to define:

- **Form steps and fields** - Dynamic form generation
- **Field types** - STRING, NUMBER, AMOUNT, DATE, BOOLEAN, FILE
- **A/B testing** - File upload method (drag-drop vs dialog)
- **Validation rules** - Field validation requirements

### Example Configuration

```json
{
  "version": "1.0.0",
  "claimForm": {
    "steps": [
      {
        "id": "personal-info",
        "title": "Personal Information",
        "description": "Please provide your personal details",
        "fields": [
          {
            "id": "fullName",
            "type": "STRING",
            "label": "Full Name",
            "required": true,
            "placeholder": "Enter your full name"
          },
          {
            "id": "email",
            "type": "STRING",
            "label": "Email Address",
            "required": true,
            "placeholder": "Enter your email"
          }
        ]
      }
    ]
  }
}
```

## Embedding the Widget

### Production Deployment

When using Docker, the widget is automatically built and served at:
```
http://your-domain:5174/widget/lime-widget.iife.js
```

### Basic Usage

1. **Include the widget script in your HTML:**
   ```html
   <script src="http://localhost:5174/widget/lime-widget.iife.js"></script>
   ```

2. **Initialize the widget:**
   ```javascript
   <script>
     ClaimWidget.createModal({
       apiUrl: 'http://localhost:3000/api/v1',
       apiKey: 'YOUR_TENANT_ID',
       userId: 'EXTERNAL_USER_ID',
       onSuccess: function(claimId) {
         alert('Claim submitted successfully! ID: ' + claimId);
       },
       onError: function(error) {
         alert('Error: ' + error);
       }
     });
   </script>
   ```

### Widget Parameters

- **apiUrl**: Backend API URL (e.g., `http://localhost:3000/api/v1`)
- **apiKey**: Your tenant ID (get it from the admin dashboard)
- **userId**: External user identifier from your system
- **onSuccess**: Callback function when claim is submitted successfully
- **onError**: Callback function when an error occurs


## Admin Features

### Admin Panel Access
- Login with an admin account
- Navigate to `/admin` route
- Manage all claims from all users
- Update claim statuses
- Edit application configuration

### Admin Capabilities
- **View all claims** from all users
- **Change claim status** (OPEN, IN_REVIEW, CLOSED)
- **Edit configuration** via JSON editor
- **Real-time configuration updates** without redeployment

## Development

### Docker Development Mode

Run the application in development mode with hot-reload:

```bash
# Start development environment
docker-compose -f docker-compose.dev.yml up --build

# Or run in detached mode
docker-compose -f docker-compose.dev.yml up -d --build

# View logs
docker-compose -f docker-compose.dev.yml logs -f

# Stop services
docker-compose -f docker-compose.dev.yml down
```

### Local Development (Without Docker)

#### Backend Development
```bash
cd backend
npm run start:dev  # Start with hot reload
npm run build     # Build for production
npm run start:prod # Start production build
```

#### Frontend Development
```bash
cd frontend
npm run dev       # Start development server
npm run build     # Build for production
npm run build:widget # Build embeddable widget
```

### Database
The application uses an in-memory SQLite database for development. Data is not persisted between restarts. For production, consider using a persistent database like PostgreSQL or MySQL.

## Security Features

- **JWT Authentication** with expiration
- **Role-based access control** (user/admin)
- **Protected routes** and endpoints
- **Input validation** with class-validator
- **CORS configuration** for frontend integration

## Testing

### Backend Testing
```bash
cd backend
npm run test      # Run unit tests
npm run test:e2e  # Run end-to-end tests
```

### Frontend Testing
```bash
cd frontend
npm run test     # Run tests
```

## Deployment

### Docker Deployment (Recommended)

The easiest way to deploy the application is using Docker Compose:

```bash
# Production deployment
docker-compose up -d --build
```

The application will be available at:
- Frontend & Widget: Port 5174
- Backend API: Port 3000
- Widget JS: `http://your-domain:5174/widget/lime-widget.iife.js`

**Important Notes:**
- Change the `JWT_SECRET` in `docker-compose.yml` for production
- Configure a reverse proxy (nginx/traefik) for SSL/TLS
- Consider using persistent storage for production databases
- Update CORS settings in the backend for your domain

### Manual Deployment

#### Backend Deployment
1. Build the application: `npm run build`
2. Start production server: `npm run start:prod`
3. Configure environment variables for production

#### Frontend Deployment
1. Build the application: `npm run build`
2. Build the widget: `npm run build:widget`
3. Deploy the `dist` folder to your hosting service
4. Deploy the `dist-widget` folder so the widget JS is accessible

## Troubleshooting

### Docker Issues

**Problem**: `Cannot connect to the Docker daemon`
- **Solution**: Make sure Docker Desktop is running

**Problem**: Port already in use
- **Solution**: Change the port mapping in `docker-compose.yml` or stop the conflicting service

**Problem**: Changes not reflecting in development mode
- **Solution**: Restart the containers with `docker-compose -f docker-compose.dev.yml restart`

### Widget Issues

**Problem**: Widget not loading
- **Solution**: Check that the widget JS file path is correct and accessible
- **Solution**: Check browser console for CORS errors

**Problem**: Widget shows "API Key is required"
- **Solution**: Make sure you're passing the `apiKey` parameter with your tenant ID

**Problem**: Claims not being created
- **Solution**: Verify the backend API is running and accessible
- **Solution**: Check the browser console for error messages

### Backend Issues

**Problem**: Database errors on startup
- **Solution**: Delete the in-memory database and restart (data will be lost)
- **Solution**: Check that the `app-config.json` file exists

**Problem**: JWT authentication failing
- **Solution**: Make sure `JWT_SECRET` is set in environment variables
- **Solution**: Clear browser cookies and login again

## Architecture

### Multi-Tenancy
- Each tenant has isolated configuration and data
- Users belong to a tenant
- Claims are filtered by tenant
- Widget uses `API-Key` header for tenant identification

### Roles
- **user**: Can only view and create their own claims
- **admin**: Can view all claims from their tenant and edit tenant configuration
- **super_admin**: Can view all claims from all tenants and manage tenants

### Widget Architecture
- Built as IIFE (Immediately Invoked Function Expression)
- No dependencies on external libraries
- Self-contained with inline styles
- Communicates with backend via REST API
- Uses `API-Key` header for tenant authentication
- Automatically creates users if they don't exist (by external ID)

## API Documentation

Full API documentation is available via Swagger/OpenAPI at:
```
http://localhost:3000/api
```

(Note: Swagger documentation needs to be added to the backend)

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## License

This project is licensed under the MIT License.
