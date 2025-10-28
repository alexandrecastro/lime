# 🍋 LIME Application - Quick Start Guide

Get up and running in 5 minutes!

## Prerequisites

- ✅ Docker Desktop installed and running
- ✅ 4GB free RAM
- ✅ Ports 3000 and 5174 available

## Step 1: Start the Application

### Option A: Using Startup Scripts (Recommended)

**macOS/Linux:**
```bash
./start.sh
```

**Windows:**
```cmd
start.bat
```

Select option `1` for Production mode.

### Option B: Manual Docker Command

```bash
docker-compose up --build -d
```

## Step 2: Access the Application

Once the containers are running (takes 2-3 minutes for first build):

🌐 **Frontend**: http://localhost:5174  
🔧 **Backend API**: http://localhost:3000/api/v1  
📦 **Widget JS**: http://localhost:5174/widget/lime-widget.iife.js

## Step 3: Login

Use the default super admin credentials:

```
Email:    lime@example.com
Password: 123456
```

## Step 4: Create Your First Tenant

1. After login, you'll be on the Admin Dashboard
2. Click **"Manage Tenants"** button
3. Click **"Create New Tenant"**
4. Fill in:
   - **Name**: Your Company Name
   - **Logo**: Upload or drag-drop a logo image
5. Click **"Create Tenant"**
6. **Copy the Tenant ID** (you'll need this for the widget)

## Step 5: Configure Your Form

1. Go back to the Admin Dashboard
2. In the **"Configuration"** tab, you'll see a JSON editor
3. Customize your claim form fields:
   - Add/remove steps
   - Add/remove fields
   - Change field types (STRING, NUMBER, DATE, AMOUNT, etc.)
   - Make fields required/optional
4. Changes are saved automatically

Example configuration:
```json
{
  "version": "1.0.0",
  "claimForm": {
    "steps": [
      {
        "id": "personal-info",
        "title": "Personal Information",
        "fields": [
          {
            "id": "fullName",
            "type": "STRING",
            "label": "Full Name",
            "required": true
          }
        ]
      }
    ]
  }
}
```

## Step 6: Embed the Widget

Add this code to any website:

```html
<!-- Include the widget -->
<script src="http://localhost:5174/widget/lime-widget.iife.js"></script>

<!-- Initialize the widget -->
<script>
  ClaimWidget.createModal({
    apiUrl: 'http://localhost:3000/api/v1',
    apiKey: 'YOUR_TENANT_ID',  // From Step 4
    userId: 'user123',         // Your external user ID
    onSuccess: function(claimId) {
      alert('Claim created: ' + claimId);
    },
    onError: function(error) {
      alert('Error: ' + error);
    }
  });
</script>
```

## Step 7: Test the Widget

1. Open `frontend/example.html` in your browser
2. Enter your **Tenant ID** (from Step 4)
3. Enter any **User ID** (e.g., "test-user-1")
4. Click **"Open Claim Form"**
5. Fill out the form and submit

The widget will automatically:
- Fetch your custom form configuration
- Create a user if they don't exist
- Submit the claim
- Call your success callback

## Step 8: View Claims

1. Go back to the Admin Dashboard
2. Click the **"Claims"** tab
3. You'll see all submitted claims
4. You can:
   - View claim details
   - Change claim status (OPEN, IN_REVIEW, CLOSED)
   - Filter by user or status

## Next Steps

### For Development

If you want to make changes to the code:

```bash
# Stop production containers
docker-compose down

# Start in development mode (with hot-reload)
docker-compose -f docker-compose.dev.yml up --build -d
```

Now any changes to the code will automatically reload!

### For Production Deployment

1. ⚠️ **Change the JWT_SECRET** in `docker-compose.yml`
2. Set up a reverse proxy (nginx/traefik) with SSL/TLS
3. Configure proper CORS origins in the backend
4. Use a persistent database (PostgreSQL/MySQL)
5. Set up monitoring and logging
6. Configure automated backups

See [DOCKER.md](DOCKER.md) for detailed production deployment instructions.

## Common Commands

```bash
# View logs
docker-compose logs -f

# Stop services
docker-compose down

# Restart services
docker-compose restart

# View running containers
docker-compose ps

# Clean up everything
docker-compose down --rmi all -v
```

## Troubleshooting

### "Cannot connect to Docker daemon"
**Solution**: Start Docker Desktop

### "Port already in use"
**Solution**: Change ports in `docker-compose.yml` or stop conflicting services

### Widget not loading
**Solution**: 
1. Check containers are running: `docker-compose ps`
2. Check logs: `docker-compose logs frontend`
3. Verify URL: http://localhost:5174/widget/lime-widget.iife.js

### Claims not showing up
**Solution**:
1. Check you're logged in as admin or super_admin
2. Check the tenant ID matches
3. View backend logs: `docker-compose logs backend`

## Architecture Overview

```
┌─────────────────┐      ┌─────────────────┐
│   Your Website  │      │  Admin Panel    │
│                 │      │  (React App)    │
│  + Widget JS    │      │                 │
└────────┬────────┘      └────────┬────────┘
         │                        │
         │ HTTP                   │ HTTP
         │                        │
         ▼                        ▼
    ┌────────────────────────────────┐
    │       Frontend Container       │
    │          (Nginx)               │
    │  - Serves React app            │
    │  - Serves widget JS            │
    │  Port: 5174                    │
    └────────────────┬───────────────┘
                     │
                     │ REST API
                     │
                     ▼
    ┌────────────────────────────────┐
    │       Backend Container        │
    │         (NestJS)               │
    │  - REST API                    │
    │  - gRPC API                    │
    │  - JWT Auth                    │
    │  - Multi-tenancy               │
    │  Port: 3000, 50051             │
    └────────────────────────────────┘
```

## Features Overview

✨ **Multi-Tenancy**: Separate data and configuration per tenant  
🔐 **Authentication**: JWT-based with roles (user, admin, super_admin)  
📝 **Dynamic Forms**: Configure claim forms via JSON  
🎨 **Embeddable Widget**: Single JS file, no dependencies  
🔄 **Hot Reload**: Development mode with instant updates  
🌐 **REST + gRPC**: Two API options  
📊 **Admin Dashboard**: Manage claims, users, and configuration  
🎯 **Role-Based Access**: Different views for different user types

## Resources

- 📖 **Full Documentation**: [README.md](README.md)
- 🐳 **Docker Guide**: [DOCKER.md](DOCKER.md)
- 🔧 **Setup Summary**: [DOCKER_SETUP_SUMMARY.md](DOCKER_SETUP_SUMMARY.md)
- 🧪 **Example HTML**: [frontend/example.html](frontend/example.html)

## Support

Having issues? Check:
1. [DOCKER.md](DOCKER.md) - Troubleshooting section
2. [DOCKER_SETUP_SUMMARY.md](DOCKER_SETUP_SUMMARY.md) - Technical details
3. Container logs: `docker-compose logs -f`

## What You've Built

🎉 Congratulations! You now have:

- ✅ A fully functional LIME management system
- ✅ Multi-tenant support with isolated data
- ✅ Role-based access control
- ✅ Embeddable widget for any website
- ✅ Admin dashboard for managing everything
- ✅ RESTful and gRPC APIs
- ✅ Docker-based deployment

Ready for customization and production deployment! 🚀

