# 🚀 Production Deployment Checklist

Use this checklist to ensure your LIME application is production-ready.

## Pre-Deployment

### Security

- [ ] **Change JWT Secret**: Update `JWT_SECRET` in `docker-compose.yml` to a strong random string (min 32 characters)
- [ ] **Remove Default Admin**: Delete or change password for `lime@example.com` account
- [ ] **Configure CORS**: Update backend CORS settings to allow only your domain
- [ ] **Environment Variables**: Move secrets to environment variables (not hardcoded)
- [ ] **SSL/TLS Certificates**: Obtain SSL certificates (Let's Encrypt recommended)
- [ ] **Firewall Rules**: Configure firewall to allow only necessary ports
- [ ] **API Rate Limiting**: Implement rate limiting on backend API
- [ ] **Input Validation**: Verify all inputs are validated and sanitized
- [ ] **Security Headers**: Configure nginx security headers (CSP, HSTS, etc.)

### Database

- [ ] **Use Persistent Database**: Replace in-memory SQLite with PostgreSQL/MySQL
- [ ] **Database Credentials**: Use strong passwords, store securely
- [ ] **Connection Pooling**: Configure appropriate connection pool size
- [ ] **Backup Strategy**: Set up automated daily backups
- [ ] **Database Encryption**: Enable encryption at rest
- [ ] **Migration Scripts**: Prepare database migration scripts
- [ ] **Test Restore**: Verify backup restoration works

### Infrastructure

- [ ] **Domain Name**: Register and configure domain name
- [ ] **DNS Records**: Set up A/AAAA records pointing to your server
- [ ] **Reverse Proxy**: Configure nginx/traefik for SSL termination
- [ ] **CDN Setup**: Consider CDN for widget JS file (CloudFlare, CloudFront)
- [ ] **Server Resources**: Ensure adequate CPU, RAM, disk space
- [ ] **Load Balancing**: Set up load balancer if scaling horizontally
- [ ] **Container Orchestration**: Consider Kubernetes/Docker Swarm for scaling

### Monitoring & Logging

- [ ] **Application Logs**: Configure centralized logging (ELK, CloudWatch)
- [ ] **Error Tracking**: Set up error monitoring (Sentry, Rollbar)
- [ ] **Performance Monitoring**: Configure APM (Datadog, New Relic)
- [ ] **Uptime Monitoring**: Set up uptime checks (UptimeRobot, Pingdom)
- [ ] **Alerting**: Configure alerts for critical issues
- [ ] **Log Rotation**: Set up log rotation to manage disk space
- [ ] **Metrics Dashboard**: Create dashboard for key metrics

### Configuration

- [ ] **Widget URL**: Update widget URL in documentation and examples
- [ ] **API URL**: Configure correct API URL in frontend
- [ ] **Email Configuration**: Set up SMTP for email notifications (if needed)
- [ ] **Storage**: Configure file storage (S3, Azure Blob, etc.) for uploads
- [ ] **Timezone**: Set correct timezone for application
- [ ] **Localization**: Configure language/locale settings

### Testing

- [ ] **Load Testing**: Perform load testing to verify capacity
- [ ] **Security Testing**: Run security scan (OWASP ZAP, Burp Suite)
- [ ] **Penetration Testing**: Consider professional penetration testing
- [ ] **Backup/Restore Test**: Test complete backup and restore procedure
- [ ] **Failover Testing**: Test failover mechanisms
- [ ] **Widget Testing**: Test widget on various browsers and devices
- [ ] **Mobile Testing**: Verify responsive design on mobile devices

## Docker Configuration

### docker-compose.yml Updates

```yaml
services:
  backend:
    image: your-registry/lime-backend:latest
    restart: always
    environment:
      - NODE_ENV=production
      - JWT_SECRET=${JWT_SECRET}  # From environment
      - DATABASE_URL=${DATABASE_URL}
      - LOG_LEVEL=info
    logging:
      driver: "json-file"
      options:
        max-size: "10m"
        max-file: "3"
    deploy:
      resources:
        limits:
          cpus: '2'
          memory: 2G
    healthcheck:
      test: ["CMD", "wget", "--quiet", "--tries=1", "--spider", "http://localhost:3000/health"]
      interval: 30s
      timeout: 10s
      retries: 3

  frontend:
    image: your-registry/lime-frontend:latest
    restart: always
    logging:
      driver: "json-file"
      options:
        max-size: "10m"
        max-file: "3"
    deploy:
      resources:
        limits:
          cpus: '1'
          memory: 1G
```

### Reverse Proxy Configuration

Example nginx configuration:

```nginx
# SSL Configuration
ssl_certificate /etc/letsencrypt/live/your-domain.com/fullchain.pem;
ssl_certificate_key /etc/letsencrypt/live/your-domain.com/privkey.pem;
ssl_protocols TLSv1.2 TLSv1.3;
ssl_ciphers HIGH:!aNULL:!MD5;

# Security Headers
add_header X-Frame-Options "SAMEORIGIN" always;
add_header X-Content-Type-Options "nosniff" always;
add_header X-XSS-Protection "1; mode=block" always;
add_header Strict-Transport-Security "max-age=31536000; includeSubDomains" always;

# Rate Limiting
limit_req_zone $binary_remote_addr zone=api_limit:10m rate=10r/s;

server {
    listen 443 ssl http2;
    server_name your-domain.com;

    # Frontend
    location / {
        proxy_pass http://localhost:5174;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }

    # Backend API with rate limiting
    location /api/ {
        limit_req zone=api_limit burst=20 nodelay;
        proxy_pass http://localhost:3000/api/;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }

    # Widget (with CORS)
    location /widget/ {
        proxy_pass http://localhost:5174/widget/;
        add_header Access-Control-Allow-Origin * always;
        add_header Access-Control-Allow-Methods "GET, OPTIONS" always;
        add_header Access-Control-Allow-Headers "Content-Type, API-Key" always;
        
        # Cache widget files
        expires 1d;
        add_header Cache-Control "public, immutable";
    }
}

# Redirect HTTP to HTTPS
server {
    listen 80;
    server_name your-domain.com;
    return 301 https://$server_name$request_uri;
}
```

## Deployment Steps

### 1. Prepare Server

```bash
# Update system
sudo apt update && sudo apt upgrade -y

# Install Docker
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh

# Install Docker Compose
sudo curl -L "https://github.com/docker/compose/releases/latest/download/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
sudo chmod +x /usr/local/bin/docker-compose

# Configure firewall
sudo ufw allow 22/tcp
sudo ufw allow 80/tcp
sudo ufw allow 443/tcp
sudo ufw enable
```

### 2. Clone Repository

```bash
git clone https://github.com/your-org/lime.git
cd lime
```

### 3. Configure Environment

```bash
# Create .env file
cat > .env << EOF
NODE_ENV=production
JWT_SECRET=$(openssl rand -hex 32)
DATABASE_URL=postgresql://user:password@localhost:5432/lime
EOF

# Secure .env file
chmod 600 .env
```

### 4. Update Configuration

```bash
# Update docker-compose.yml with your settings
nano docker-compose.yml

# Update backend CORS settings
nano backend/src/main.ts

# Update widget URL in frontend
nano frontend/src/pages/AdminDashboard.tsx
```

### 5. Build and Deploy

```bash
# Build images
docker-compose build

# Start services
docker-compose up -d

# Verify containers are running
docker-compose ps

# Check logs
docker-compose logs -f
```

### 6. Configure SSL

```bash
# Install certbot
sudo apt install certbot python3-certbot-nginx

# Obtain certificate
sudo certbot --nginx -d your-domain.com

# Auto-renewal
sudo certbot renew --dry-run
```

### 7. Set Up Backups

```bash
# Create backup script
cat > /home/user/backup.sh << 'EOF'
#!/bin/bash
DATE=$(date +%Y%m%d_%H%M%S)
BACKUP_DIR=/home/user/backups

# Backup database
docker-compose exec -T backend pg_dump -U user lime > $BACKUP_DIR/db_$DATE.sql

# Backup uploaded files (if using volumes)
docker run --rm -v lime_uploads:/data -v $BACKUP_DIR:/backup alpine tar czf /backup/files_$DATE.tar.gz -C /data .

# Keep only last 7 days
find $BACKUP_DIR -type f -mtime +7 -delete
EOF

# Make executable
chmod +x /home/user/backup.sh

# Add to crontab (daily at 2 AM)
(crontab -l 2>/dev/null; echo "0 2 * * * /home/user/backup.sh") | crontab -
```

### 8. Set Up Monitoring

```bash
# Install monitoring tools
docker run -d --name=prometheus -p 9090:9090 prom/prometheus
docker run -d --name=grafana -p 3001:3000 grafana/grafana

# Configure alerts
# (Implement based on your monitoring solution)
```

## Post-Deployment

### Verification

- [ ] **Test Login**: Verify admin login works
- [ ] **Test Widget**: Load widget on external site
- [ ] **Test API**: Make test API calls
- [ ] **Check SSL**: Verify SSL certificate is valid (SSL Labs test)
- [ ] **Test Mobile**: Verify responsive design
- [ ] **Performance Test**: Run basic load test
- [ ] **Security Scan**: Run basic security scan

### Documentation

- [ ] **Update Widget URL**: Update all documentation with production URL
- [ ] **API Documentation**: Publish API documentation
- [ ] **User Guide**: Create user guide for customers
- [ ] **Admin Guide**: Create admin guide for team
- [ ] **Troubleshooting**: Document common issues and solutions
- [ ] **Changelog**: Maintain changelog for updates

### Maintenance

- [ ] **Update Schedule**: Plan regular update schedule
- [ ] **Backup Verification**: Regularly test backup restoration
- [ ] **Security Updates**: Subscribe to security advisories
- [ ] **Performance Monitoring**: Regular performance reviews
- [ ] **Log Review**: Regular log review for issues
- [ ] **Capacity Planning**: Monitor and plan for scaling

## Rollback Plan

If deployment fails:

```bash
# Stop new containers
docker-compose down

# Restore from backup
# (Implement based on your backup strategy)

# Start previous version
docker-compose -f docker-compose.previous.yml up -d

# Verify service is restored
curl -f https://your-domain.com/api/v1/health
```

## Scaling Checklist

When you need to scale:

- [ ] **Horizontal Scaling**: Add more backend instances
- [ ] **Load Balancer**: Configure load balancer
- [ ] **Session Management**: Use Redis for sessions
- [ ] **File Storage**: Move to S3/Azure Blob
- [ ] **Database Scaling**: Use read replicas
- [ ] **CDN**: Serve static assets from CDN
- [ ] **Caching**: Implement Redis caching
- [ ] **Container Orchestration**: Move to Kubernetes

## Maintenance Commands

```bash
# View logs
docker-compose logs -f

# Restart services
docker-compose restart

# Update application
git pull
docker-compose build
docker-compose up -d

# View resource usage
docker stats

# Clean up old images
docker image prune -a

# Backup database
docker-compose exec backend pg_dump -U user lime > backup.sql

# Restore database
docker-compose exec -T backend psql -U user lime < backup.sql
```

## Emergency Contacts

Document these for your team:

- **DevOps Lead**: [Contact info]
- **Security Team**: [Contact info]
- **Hosting Provider Support**: [Contact info]
- **Database Administrator**: [Contact info]
- **On-Call Engineer**: [Contact info]

## Compliance Checklist

Depending on your industry:

- [ ] **GDPR**: Implement data privacy requirements
- [ ] **HIPAA**: Healthcare data compliance (if applicable)
- [ ] **SOC 2**: Security compliance (if applicable)
- [ ] **PCI DSS**: Payment card compliance (if applicable)
- [ ] **Data Retention**: Implement data retention policies
- [ ] **Privacy Policy**: Create and publish privacy policy
- [ ] **Terms of Service**: Create and publish ToS

## Success Metrics

Define and monitor:

- Uptime percentage (target: 99.9%)
- Average response time (target: < 200ms)
- Error rate (target: < 0.1%)
- Peak concurrent users
- Database query performance
- Widget load time
- API success rate

---

**Remember**: Production deployment is an ongoing process. Regular updates, monitoring, and maintenance are essential for a healthy application.

