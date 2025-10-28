# Docker Setup Guide

This guide provides detailed instructions for running the LIME application using Docker.

## Prerequisites

- Docker Desktop installed and running
- Docker Compose (included with Docker Desktop)
- At least 4GB of available RAM
- Ports 3000 and 5174 available

## Quick Start

### Production Build

Build and run the entire application in production mode:

```bash
docker-compose up --build -d
```

Access the application:
- **Frontend**: http://localhost:5174
- **Backend API**: http://localhost:3000/api/v1
- **Widget JS**: http://localhost:5174/widget/lime-widget.iife.js
- **gRPC API**: localhost:50051

Default credentials:
- Email: `lime@example.com`
- Password: `123456`

### Development Build

Run with hot-reload for development:

```bash
docker-compose -f docker-compose.dev.yml up --build -d
```

Access the application:
- **Frontend**: http://localhost:5173
- **Backend API**: http://localhost:3000/api/v1

## Docker Architecture

### Services

#### Backend Service
- **Image**: Node.js 18 Alpine
- **Port**: 3000
- **Exposed APIs**:
  - REST API: Port 3000
  - gRPC API: Port 50051
- **Environment Variables**:
  - `NODE_ENV`: production/development
  - `JWT_SECRET`: Secret key for JWT tokens

#### Frontend Service
- **Image**: Nginx Alpine (production) / Node.js 18 Alpine (development)
- **Port**: 5174 (production) / 5173 (development)
- **Serves**:
  - Main React application at `/`
  - Widget JS file at `/widget/lime-widget.iife.js`

### Network

Both services run on a shared Docker network (`lime-network`) for internal communication.

## Common Commands

### Start Services
```bash
# Production
docker-compose up -d

# Development
docker-compose -f docker-compose.dev.yml up -d
```

### Stop Services
```bash
# Production
docker-compose down

# Development
docker-compose -f docker-compose.dev.yml down
```

### View Logs
```bash
# All services
docker-compose logs -f

# Specific service
docker-compose logs -f backend
docker-compose logs -f frontend

# Last 100 lines
docker-compose logs --tail=100 -f
```

### Rebuild Services
```bash
# Rebuild everything
docker-compose up --build -d

# Rebuild specific service
docker-compose up --build -d backend
```

### Restart Services
```bash
# Restart all
docker-compose restart

# Restart specific service
docker-compose restart backend
```

### Execute Commands in Container
```bash
# Backend
docker-compose exec backend sh
docker-compose exec backend npm run build

# Frontend
docker-compose exec frontend sh
```

### Remove Everything
```bash
# Stop and remove containers, networks
docker-compose down

# Also remove volumes
docker-compose down -v

# Remove all images
docker-compose down --rmi all
```

## Configuration

### Environment Variables

Edit `docker-compose.yml` to change environment variables:

```yaml
services:
  backend:
    environment:
      - NODE_ENV=production
      - JWT_SECRET=your-secret-key-here  # Change this!
```

### Port Mapping

Change ports by editing `docker-compose.yml`:

```yaml
services:
  backend:
    ports:
      - "3001:3000"  # Change 3001 to your desired port
  
  frontend:
    ports:
      - "8080:80"  # Change 8080 to your desired port
```

### Volume Mounting

For persistent data or development, add volumes:

```yaml
services:
  backend:
    volumes:
      - ./backend/src:/app/src  # Mount source code
      - backend-data:/app/data  # Persistent storage

volumes:
  backend-data:
```

## Production Deployment

### Security Checklist

- [ ] Change `JWT_SECRET` to a strong random string
- [ ] Configure CORS to allow only your domain
- [ ] Set up SSL/TLS with reverse proxy
- [ ] Use environment variables for sensitive data
- [ ] Configure firewall rules
- [ ] Set up monitoring and logging
- [ ] Regular backups of data
- [ ] Use persistent database (PostgreSQL/MySQL) instead of in-memory SQLite

### Reverse Proxy Setup (Nginx)

Example nginx configuration for production:

```nginx
server {
    listen 80;
    server_name your-domain.com;

    # Frontend
    location / {
        proxy_pass http://localhost:5174;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }

    # Backend API
    location /api/ {
        proxy_pass http://localhost:3000/api/;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }

    # Widget
    location /widget/ {
        proxy_pass http://localhost:5174/widget/;
        add_header Access-Control-Allow-Origin *;
    }
}
```

### Docker Compose Production Example

```yaml
services:
  backend:
    build:
      context: ./backend
      dockerfile: Dockerfile
    ports:
      - "3000:3000"
    environment:
      - NODE_ENV=production
      - JWT_SECRET=${JWT_SECRET}
      - DATABASE_URL=${DATABASE_URL}
    restart: always
    logging:
      driver: "json-file"
      options:
        max-size: "10m"
        max-file: "3"
    networks:
      - lime-network

  frontend:
    build:
      context: ./frontend
      dockerfile: Dockerfile
    ports:
      - "5174:80"
    depends_on:
      - backend
    restart: always
    logging:
      driver: "json-file"
      options:
        max-size: "10m"
        max-file: "3"
    networks:
      - lime-network

networks:
  lime-network:
    driver: bridge
```

## Troubleshooting

### Container Won't Start

Check logs:
```bash
docker-compose logs backend
docker-compose logs frontend
```

Common issues:
- Port already in use: Change port mapping
- Build error: Delete images and rebuild
- Permission error: Check file permissions

### Port Conflicts

If ports are already in use:

```bash
# Find process using port
lsof -i :3000  # macOS/Linux
netstat -ano | findstr :3000  # Windows

# Kill process or change port in docker-compose.yml
```

### Out of Disk Space

Clean up Docker:
```bash
# Remove unused containers
docker container prune

# Remove unused images
docker image prune -a

# Remove unused volumes
docker volume prune

# Remove everything unused
docker system prune -a --volumes
```

### Build Fails

Clear cache and rebuild:
```bash
docker-compose build --no-cache
docker-compose up -d
```

### Widget Not Loading

1. Check if frontend container is running:
   ```bash
   docker-compose ps
   ```

2. Check if widget file exists:
   ```bash
   docker-compose exec frontend ls /usr/share/nginx/html/widget
   ```

3. Check nginx configuration:
   ```bash
   docker-compose exec frontend cat /etc/nginx/conf.d/default.conf
   ```

### Database Connection Issues

For production with external database:

1. Check environment variables
2. Ensure database is accessible from Docker network
3. Check firewall rules
4. Verify connection string format

### Performance Issues

- Allocate more resources in Docker Desktop settings
- Check container logs for errors
- Monitor resource usage:
  ```bash
  docker stats
  ```

## Advanced Usage

### Multi-Stage Builds

The Dockerfiles use multi-stage builds for optimization:

- Build stage: Compile and build the application
- Production stage: Only runtime dependencies

This reduces the final image size significantly.

### Health Checks

Add health checks to docker-compose.yml:

```yaml
services:
  backend:
    healthcheck:
      test: ["CMD", "wget", "--quiet", "--tries=1", "--spider", "http://localhost:3000/health"]
      interval: 30s
      timeout: 10s
      retries: 3
```

### Scaling

Scale services for load balancing:

```bash
docker-compose up -d --scale backend=3
```

Note: You'll need to set up a load balancer (nginx) in front.

### Docker Swarm / Kubernetes

For production at scale, consider:
- Docker Swarm for orchestration
- Kubernetes for advanced orchestration
- Use managed services (AWS ECS, Google Cloud Run, Azure Container Instances)

## Monitoring

### Container Logs

View logs in real-time:
```bash
# All services
docker-compose logs -f

# Specific service with timestamps
docker-compose logs -f --timestamps backend
```

### Resource Usage

Monitor resource consumption:
```bash
docker stats
```

### External Monitoring Tools

Consider integrating:
- Prometheus + Grafana for metrics
- ELK Stack for log aggregation
- Datadog, New Relic for APM

## Backup and Restore

### Backup Data

If using volumes for persistence:

```bash
# Backup volume
docker run --rm -v lime_backend-data:/data -v $(pwd):/backup alpine tar czf /backup/backup.tar.gz -C /data .

# Backup database
docker-compose exec backend pg_dump -U user database > backup.sql
```

### Restore Data

```bash
# Restore volume
docker run --rm -v lime_backend-data:/data -v $(pwd):/backup alpine tar xzf /backup/backup.tar.gz -C /data

# Restore database
docker-compose exec -T backend psql -U user database < backup.sql
```

## CI/CD Integration

### GitHub Actions Example

```yaml
name: Build and Deploy

on:
  push:
    branches: [ main ]

jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      
      - name: Build images
        run: docker-compose build
      
      - name: Run tests
        run: docker-compose run backend npm test
      
      - name: Push to registry
        run: |
          docker-compose push
```

## Additional Resources

- [Docker Documentation](https://docs.docker.com/)
- [Docker Compose Documentation](https://docs.docker.com/compose/)
- [Best Practices for Writing Dockerfiles](https://docs.docker.com/develop/develop-images/dockerfile_best-practices/)
- [Docker Security](https://docs.docker.com/engine/security/)

