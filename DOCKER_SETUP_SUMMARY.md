# Docker Setup Summary

This document summarizes the Docker setup created for the LIME application.

## Files Created

### Docker Configuration Files

1. **`docker-compose.yml`** - Production Docker Compose configuration
   - Builds and runs backend on port 3000
   - Builds and runs frontend on port 5174
   - Serves widget at `/widget/lime-widget.iife.js`
   - Configurable environment variables

2. **`docker-compose.dev.yml`** - Development Docker Compose configuration
   - Hot-reload enabled for both backend and frontend
   - Frontend on port 5173, backend on port 3000
   - Volume mounts for source code

3. **`backend/Dockerfile`** - Backend production image
   - Based on Node.js 18 Alpine
   - Multi-stage build (not used yet, but ready for optimization)
   - Installs dependencies and builds the application
   - Exposes port 3000

4. **`backend/.dockerignore`** - Backend Docker ignore file
   - Excludes node_modules, dist, logs, etc.

5. **`frontend/Dockerfile`** - Frontend production image
   - Multi-stage build:
     - Stage 1: Build React app and widget
     - Stage 2: Serve with Nginx
   - Copies built files to Nginx
   - Exposes port 80 (mapped to 5174)

6. **`frontend/Dockerfile.dev`** - Frontend development image
   - Based on Node.js 18 Alpine
   - Runs Vite dev server with hot-reload
   - Exposes port 5173

7. **`frontend/nginx.conf`** - Nginx configuration
   - Serves main app from root
   - Serves widget from `/widget/` path
   - CORS headers for widget
   - Cache settings for static assets

8. **`frontend/.dockerignore`** - Frontend Docker ignore file
   - Excludes node_modules, dist, build artifacts, etc.

### Helper Scripts

9. **`start.sh`** - Unix/Linux/macOS startup script
   - Interactive menu for starting/stopping services
   - Production and development modes
   - View logs
   - Clean up containers/images

10. **`start.bat`** - Windows startup script
    - Same functionality as start.sh for Windows users

### Documentation

11. **`DOCKER.md`** - Comprehensive Docker documentation
    - Prerequisites and quick start
    - Architecture explanation
    - Common commands and troubleshooting
    - Production deployment guide
    - Security checklist
    - Advanced usage (scaling, monitoring, backup)

12. **`README.md`** - Updated with Docker instructions
    - Quick start section at the top
    - Docker deployment section
    - Updated project structure
    - Architecture explanation

## How It Works

### Production Mode

```bash
docker-compose up --build -d
```

1. **Backend Container**:
   - Installs dependencies
   - Builds TypeScript to JavaScript
   - Starts the NestJS application
   - Exposes REST API on port 3000
   - Exposes gRPC API on port 50051

2. **Frontend Container**:
   - Installs dependencies
   - Builds React application (`npm run build`)
   - Builds widget (`npm run build:widget`)
   - Serves everything via Nginx on port 80 (mapped to 5174)
   - Main app accessible at `/`
   - Widget JS accessible at `/widget/lime-widget.iife.js`

### Development Mode

```bash
docker-compose -f docker-compose.dev.yml up --build -d
```

1. **Backend Container**:
   - Source code mounted as volume
   - Runs `npm run start:dev` with hot-reload
   - Changes reflect immediately

2. **Frontend Container**:
   - Source code mounted as volume
   - Runs Vite dev server
   - Hot module replacement (HMR) enabled
   - Changes reflect immediately

## Widget Deployment

The widget is automatically built and served in production:

**Widget URL**: `http://your-domain:5174/widget/lime-widget.iife.js`

### Usage in External Sites

```html
<script src="http://your-domain:5174/widget/lime-widget.iife.js"></script>
<script>
  ClaimWidget.createModal({
    apiUrl: 'http://your-domain:3000/api/v1',
    apiKey: 'TENANT_ID',
    userId: 'EXTERNAL_USER_ID',
    onSuccess: function(claimId) {
      alert('Claim created: ' + claimId);
    },
    onError: function(error) {
      alert('Error: ' + error);
    }
  });
</script>
```

## Environment Variables

Configure in `docker-compose.yml`:

```yaml
environment:
  - NODE_ENV=production
  - JWT_SECRET=your-secret-key  # CHANGE THIS IN PRODUCTION!
```

## Network Architecture

```
┌─────────────────────────────────────┐
│          Docker Host                │
│                                     │
│  ┌──────────────┐  ┌─────────────┐ │
│  │   Backend    │  │  Frontend   │ │
│  │   (Node.js)  │  │   (Nginx)   │ │
│  │              │  │             │ │
│  │  Port 3000   │  │  Port 5174  │ │
│  │  Port 50051  │  │             │ │
│  └──────┬───────┘  └──────┬──────┘ │
│         │                  │        │
│         └──────────────────┘        │
│           lime-network              │
└─────────────────────────────────────┘
         │                │
    External            External
    REST API            Users
```

## Security Considerations

### Current Setup (Development/Demo)
- In-memory SQLite database
- Simple JWT secret
- No SSL/TLS
- CORS allows all origins for widget

### Production Requirements
✅ **Must Do:**
- Change `JWT_SECRET` to a strong random string
- Use persistent database (PostgreSQL/MySQL)
- Set up reverse proxy with SSL/TLS
- Configure proper CORS origins
- Set up firewall rules
- Implement rate limiting
- Add monitoring and logging
- Regular backups

## Scaling Considerations

### Horizontal Scaling
For higher load, you can:
1. Scale backend instances: `docker-compose up -d --scale backend=3`
2. Add load balancer (nginx/traefik) in front
3. Use external database (not in-memory SQLite)
4. Use Redis for session storage

### Vertical Scaling
Adjust Docker resource limits in docker-compose.yml:
```yaml
services:
  backend:
    deploy:
      resources:
        limits:
          cpus: '2'
          memory: 2G
```

## Monitoring

### Built-in
- View logs: `docker-compose logs -f`
- Monitor resources: `docker stats`

### Recommended
- Prometheus + Grafana for metrics
- ELK Stack for log aggregation
- Health check endpoints
- APM tools (Datadog, New Relic)

## Backup Strategy

### Development
Data is in-memory and not persisted.

### Production
Implement:
1. Database backups (automated daily)
2. Volume backups for persistent data
3. Configuration backups
4. Disaster recovery plan

## Troubleshooting Quick Reference

| Issue | Solution |
|-------|----------|
| Port in use | Change port mapping in docker-compose.yml |
| Build fails | Run `docker-compose build --no-cache` |
| Widget not loading | Check nginx logs: `docker-compose logs frontend` |
| Database errors | Restart services: `docker-compose restart` |
| Out of disk | Clean up: `docker system prune -a` |

## Performance Optimization

1. **Multi-stage builds**: Already implemented for frontend
2. **Layer caching**: Optimize Dockerfile order
3. **Image size**: Use Alpine base images (already done)
4. **Build cache**: Use BuildKit for faster builds
5. **CDN**: Serve widget from CDN in production

## Next Steps

1. **Set up CI/CD**: Automate building and deployment
2. **Add health checks**: Monitor container health
3. **Implement logging**: Centralized log management
4. **Set up monitoring**: Prometheus + Grafana
5. **Configure SSL**: Use Let's Encrypt with certbot
6. **Database migration**: Move to PostgreSQL/MySQL
7. **Add tests**: Integration tests in Docker
8. **Documentation**: API documentation with Swagger

## Testing the Setup

1. Start the application:
   ```bash
   ./start.sh  # or start.bat on Windows
   ```

2. Access the frontend:
   ```
   http://localhost:5174
   ```

3. Login with default credentials:
   - Email: `lime@example.com`
   - Password: `123456`

4. Test the widget:
   - Open `frontend/example.html` in a browser
   - Enter a tenant ID (get from admin dashboard)
   - Enter a user ID
   - Click "Open Claim Form"

5. Verify widget JS is accessible:
   ```
   http://localhost:5174/widget/lime-widget.iife.js
   ```

6. Check backend API:
   ```
   http://localhost:3000/api/v1/config/w
   ```
   (with API-Key header)

## Support

For issues or questions:
1. Check DOCKER.md for detailed troubleshooting
2. Review docker-compose logs
3. Check Docker container status: `docker-compose ps`
4. Verify network connectivity: `docker network inspect lime_lime-network`

