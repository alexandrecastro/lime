# 🚀 Production Deployment Checklist

Use this checklist to ensure that the LIME application is production-ready.

---

## Pre-Deployment

### Security

- [ ] **Change JWT Secret**: Update `JWT_SECRET` in `docker-compose.yml` to a strong random string (min 32 characters).
- [ ] **Remove Default Admin**: Delete or change password for `lime@example.com` account.
- [ ] **Configure CORS**: Update backend CORS settings to allow only your domain.
- [ ] **Environment Variables**: Move secrets to environment variables (not hardcoded).
- [ ] **SSL/TLS Certificates**: Obtain SSL certificates (Let's Encrypt recommended).
- [ ] **Firewall Rules**: Configure firewall to allow only necessary ports.
- [ ] **API Rate Limiting**: Implement rate limiting on backend API.
- [ ] **Input Validation**: Verify all inputs are validated and sanitized.
- [ ] **Security Headers**: Configure nginx security headers (CSP, HSTS, etc.).

### Database

- [ ] **Use Persistent Database**: Replace in-memory SQLite with PostgreSQL.
- [ ] **Database Credentials**: Use strong passwords, store securely.
- [ ] **Connection Pooling**: Configure appropriate connection pool size.
- [ ] **Backup Strategy**: Set up automated daily backups.
- [ ] **Database Encryption**: Enable encryption at rest.
- [ ] **Migration Scripts**: Prepare database migration scripts.
- [ ] **Test Restore**: Verify backup restoration works.

### Infrastructure

- [ ] **Domain Name**: Register and configure domain name.
- [ ] **DNS Records**: Set up A/AAAA records pointing to your server.
- [ ] **Reverse Proxy**: Configure nginx/traefik for SSL termination.
- [ ] **CDN Setup**: Consider CDN for widget JS file (CloudFlare, CloudFront).
- [ ] **Server Resources**: Ensure adequate CPU, RAM, disk space.
- [ ] **Load Balancing**: Set up load balancer if scaling horizontally.
- [ ] **Container Orchestration**: Consider Kubernetes/Docker Swarm for scaling.

### Monitoring & Logging

- [ ] **Application Logs**: Configure centralized logging (ELK, CloudWatch).
- [ ] **Error Tracking**: Set up error monitoring (Sentry, Rollbar).
- [ ] **Performance Monitoring**: Configure APM (Datadog, New Relic).
- [ ] **Uptime Monitoring**: Set up uptime checks (UptimeRobot, Pingdom).
- [ ] **Alerting**: Configure alerts for critical issues.
- [ ] **Log Rotation**: Set up log rotation to manage disk space.
- [ ] **Metrics Dashboard**: Create a dashboard for key metrics.

### Configuration

- [ ] **Widget URL**: Update widget URL in documentation and examples.
- [ ] **API URL**: Configure the correct API URL in the frontend.
- [ ] **Email Configuration**: Set up SMTP for email notifications (if needed).
- [ ] **Storage**: Configure file storage (S3, Azure Blob, etc.) for uploads.
- [ ] **Timezone**: Set the correct timezone for the application.
- [ ] **Localization**: Configure language/locale settings.

### Testing

- [ ] **Load Testing**: Perform load testing to verify capacity.
- [ ] **Security Testing**: Run security scan (OWASP ZAP, Burp Suite).
- [ ] **Penetration Testing**: Consider professional penetration testing.
- [ ] **Backup/Restore Test**: Test complete backup and restore procedure.
- [ ] **Failover Testing**: Test failover mechanisms.
- [ ] **Widget Testing**: Test widget on various browsers and devices.
- [ ] **Mobile Testing**: Verify responsive design on mobile devices.

---

## Post-Deployment

### Verification

- [ ] **Test Login**: Verify admin login works.
- [ ] **Test Widget**: Load widget on external site.
- [ ] **Test API**: Make test API calls.
- [ ] **Check SSL**: Verify SSL certificate is valid (SSL Labs test).
- [ ] **Test Mobile**: Verify responsive design.
- [ ] **Performance Test**: Run a basic load test.
- [ ] **Security Scan**: Run a basic security scan.

### Documentation

- [ ] **Update Widget URL**: Update all documentation with production URL.
- [ ] **API Documentation**: Publish API documentation.
- [ ] **User Guide**: Create user guide for customers.
- [ ] **Admin Guide**: Create admin guide for team.
- [ ] **Troubleshooting**: Document common issues and solutions.
- [ ] **Changelog**: Maintain changelog for updates.

### Maintenance

- [ ] **Update Schedule**: Plan regular update schedule.
- [ ] **Backup Verification**: Regularly test backup restoration.
- [ ] **Security Updates**: Subscribe to security advisories.
- [ ] **Performance Monitoring**: Regular performance reviews.
- [ ] **Log Review**: Regular log review for issues.
- [ ] **Capacity Planning**: Monitor and plan for scaling.

---

## Scaling Checklist

When you need to scale:

- [ ] **Horizontal Scaling**: Add more backend instances.
- [ ] **Load Balancer**: Configure load balancer.
- [ ] **Session Management**: Use Redis for sessions.
- [ ] **File Storage**: Move to S3/Azure Blob.
- [ ] **Database Scaling**: Use read replicas.
- [ ] **CDN**: Serve static assets from CDN.
- [ ] **Caching**: Implement Redis caching.
- [ ] **Container Orchestration**: Move to Kubernetes.

---

## Compliance Checklist

Depending on your industry:

- [ ] **GDPR**: Implement data privacy requirements.
- [ ] **HIPAA**: Healthcare data compliance (if applicable).
- [ ] **SOC 2**: Security compliance (if applicable).
- [ ] **PCI DSS**: Payment card compliance (if applicable).
- [ ] **Data Retention**: Implement data retention policies.
- [ ] **Privacy Policy**: Create and publish privacy policy.
- [ ] **Terms of Service**: Create and publish ToS.

---

## Success Metrics

Define and monitor:

- [ ] Uptime percentage (target: 99.9%).
- [ ] Average response time (target: < 200ms).
- [ ] Error rate (target: < 0.1%).
- [ ] Peak concurrent users.
- [ ] Database query performance.
- [ ] Widget load time.
- [ ] API success rate.

---

**Remember**: Production deployment is an ongoing process. Regular updates, monitoring, and maintenance are essential for a healthy application.

*If life gives you limes, make margaritas.* — Your LIME Team

<img src="frontend/public/lime.svg" alt="LIME" width="24">

---