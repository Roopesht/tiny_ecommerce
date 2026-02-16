# Observability, Monitoring & Troubleshooting

This guide covers monitoring, logging, debugging, and maintaining the e-commerce platform.

## Overview

Observability in this system includes:
- **Logging**: Structured JSON logs from backend
- **Monitoring**: Metrics from Google Cloud
- **Error Reporting**: Exception tracking
- **Tracing**: Request flow tracking (future)
- **Analytics**: User behavior tracking (Firebase)

## Part 1: Backend Logging

### 1.1 Structured Logging Format

All backend logs are JSON-formatted for easy parsing:

```json
{
  "timestamp": "2024-01-15T10:30:45.123Z",
  "severity": "INFO",
  "type": "api_request",
  "endpoint": "/products",
  "method": "GET",
  "status_code": 200,
  "duration_ms": 45.2,
  "user_id": "firebase_uid"
}
```

### 1.2 Log Types

**API Request Logs**:
- Endpoint accessed
- HTTP method
- Response status
- Request duration
- User ID (if authenticated)

**Error Logs**:
- Error type
- Error message
- Stack trace
- Context data
- User ID
- Request information

**Database Logs**:
- Operation (GET, ADD, UPDATE)
- Collection
- Document ID
- Execution time

**Auth Logs**:
- Login/logout events
- Token verification
- Permission checks

### 1.3 Log Levels

| Level | Use Case | Example |
|-------|----------|---------|
| INFO | Normal operation | "User registered successfully" |
| WARNING | Potential issues | "Slow query detected" |
| ERROR | Recoverable errors | "Product not found" |
| CRITICAL | System failures | "Firestore connection failed" |

## Part 2: Google Cloud Logging

### 2.1 Access Cloud Logging

1. Go to **Google Cloud Console**
2. Go to **Cloud Logging** → **Logs Explorer**
3. Select resource: **Cloud Run**
4. Select service: **ecommerce-backend**

### 2.2 Common Log Queries

**View all requests**:
```
resource.service.name="ecommerce-backend"
resource.labels.service_name="ecommerce-backend"
```

**View errors only**:
```
resource.service.name="ecommerce-backend"
severity="ERROR"
```

**View slow requests** (>1 second):
```
resource.service.name="ecommerce-backend"
jsonPayload.duration_ms > 1000
```

**View specific user activity**:
```
resource.service.name="ecommerce-backend"
jsonPayload.user_id="USER_UID"
```

**View authentication errors**:
```
resource.service.name="ecommerce-backend"
jsonPayload.type="auth"
severity="ERROR"
```

### 2.3 Create Log Sinks

Export logs to BigQuery for analysis:

```bash
gcloud logging sinks create bigquery-sink \
  bigquery.googleapis.com/projects/test-99u1b3/datasets/ecommerce_logs \
  --log-filter='resource.service.name="ecommerce-backend"'
```

## Part 3: Cloud Monitoring

### 3.1 View Metrics

In **Cloud Monitoring** → **Metrics Explorer**:

**Available Metrics**:
- `cloud.run/request_count` - Total requests
- `cloud.run/request_latencies` - Response times
- `cloud.run/cpu_allocations` - CPU usage
- `cloud.run/memory_allocations` - Memory usage

### 3.2 Create Monitoring Dashboard

1. Go to **Cloud Monitoring** → **Dashboards**
2. Click **Create Dashboard**
3. Add charts for:

**Request Rate**:
- Metric: `cloud.run/request_count`
- Group by: `response_code`
- Aggregation: Sum

**Latency**:
- Metric: `cloud.run/request_latencies`
- Percentiles: p50, p95, p99

**Error Rate**:
- Metric: `cloud.run/request_count` where status="500"
- Aggregation: Sum

**Resource Usage**:
- CPU: `cloud.run/cpu_allocations`
- Memory: `cloud.run/memory_allocations`

### 3.3 Sample Dashboard Queries

**Request Success Rate** (% of 2xx responses):
```
100 * (
  cloud.run/request_count{response_code=~"2.."}
  / cloud.run/request_count
)
```

**Uptime Check**:
```
Boolean(cloud.run/request_count{response_code="200"})
```

## Part 4: Error Reporting

### 4.1 Setup Error Reporting

Errors are automatically captured in **Cloud Logging**. To view in **Error Reporting**:

1. Go to **Error Reporting**
2. Filter by service: **ecommerce-backend**
3. View error frequency and trends

### 4.2 Common Errors

**401 Unauthorized**:
- Invalid Firebase token
- Missing Authorization header
- Token expired
- Solution: Verify token freshness on frontend

**404 Not Found**:
- Product doesn't exist
- Typo in product ID
- Product was deleted
- Solution: Verify product ID

**500 Internal Server Error**:
- Database connection issue
- Firestore timeout
- Code exception
- Solution: Check backend logs for details

### 4.3 Error Analysis

In Error Reporting, for each error group:
- View occurrence count
- See affected users
- Check error timeline
- Review stack traces

## Part 5: Debugging Techniques

### 5.1 Backend Debugging

**Enable debug logging**:
```python
# In config.py
if settings.environment == "development":
    logging.basicConfig(level=logging.DEBUG)
```

**Check specific user requests**:
```
jsonPayload.user_id="uid_xyz"
severity >= ERROR
```

**Firestore query performance**:
```
jsonPayload.type="database"
jsonPayload.duration_ms > 100
```

### 5.2 Frontend Debugging

**Browser Console**:
- Check for JavaScript errors
- Firebase auth errors
- Network request details
- API response payloads

**Network Tab**:
- Verify Authorization header present
- Check response status codes
- Look for CORS errors
- Monitor response times

**Application Tab**:
- Check localStorage (if using)
- Firebase config values
- Session storage

### 5.3 Firebase Console Debugging

**Authentication**:
- View registered users
- Check email verification status
- Check custom claims

**Firestore**:
- Browse collections and documents
- Check data structure
- Run test queries

## Part 6: API Validation & Testing

### 6.1 API Validation Document

Location: `ecommerce-backend/docs/api-validation.json`

Contains:
- All endpoints with methods
- Request/response examples
- Authentication requirements
- Error scenarios
- cURL test commands

### 6.2 Test with cURL

**Health check**:
```bash
curl -X GET https://ecommerce-backend-xxx.run.app/health
```

**List products**:
```bash
curl -X GET https://ecommerce-backend-xxx.run.app/products
```

**Get current user** (requires token):
```bash
curl -X GET \
  -H "Authorization: Bearer YOUR_TOKEN" \
  https://ecommerce-backend-xxx.run.app/auth/me
```

**Add to cart**:
```bash
curl -X POST \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"product_id": "prod_1", "quantity": 1}' \
  https://ecommerce-backend-xxx.run.app/cart/add
```

### 6.3 Test with Postman

1. Import API collection from `docs/api-validation.json`
2. Create environment variables:
   - `base_url` = Cloud Run URL
   - `token` = Firebase ID token (get from browser)
3. Run request tests
4. Check response codes and bodies

### 6.4 Automated Testing

**Health check script** (`test-health.sh`):
```bash
#!/bin/bash
BACKEND_URL="https://ecommerce-backend-xxx.run.app"
RESPONSE=$(curl -s -o /dev/null -w "%{http_code}" $BACKEND_URL/health)
if [ $RESPONSE -eq 200 ]; then
  echo "✓ Backend health check passed"
else
  echo "✗ Backend health check failed: $RESPONSE"
  exit 1
fi
```

## Part 7: Performance Monitoring

### 7.1 Track Key Metrics

**Backend Performance**:
- Request latency (p50, p95, p99)
- Throughput (requests/second)
- Error rate (%)
- Database query time

**Frontend Performance**:
- Page load time
- Time to interactive
- Largest contentful paint (LCP)
- Cumulative layout shift (CLS)

### 7.2 Identify Bottlenecks

**Slow Endpoints**:
```
jsonPayload.duration_ms > 1000
```

**Firestore Slow Queries**:
```
jsonPayload.type="database"
jsonPayload.duration_ms > 500
```

**High Memory Usage**:
```
cloud.run/memory_allocations > 400Mi
```

### 7.3 Optimization Tips

**Database**:
- Add Firestore indexes for complex queries
- Use pagination for large result sets
- Cache frequently accessed data
- Batch operations

**Backend**:
- Connection pooling
- Response compression
- Optimize dependencies
- Use async operations

**Frontend**:
- Code splitting
- Image optimization
- Lazy loading
- Browser caching

## Part 8: Alerts & Notifications

### 8.1 Create Alert Policies

In **Cloud Monitoring** → **Alert policies**:

**Alert: High Error Rate**
- Condition: Error rate > 5% for 5 minutes
- Notification: Email or Slack

**Alert: High Latency**
- Condition: p95 latency > 2000ms
- Notification: Email

**Alert: Service Down**
- Condition: Response code != 200 for 2 minutes
- Notification: PagerDuty or Email

**Alert: High Memory Usage**
- Condition: Memory > 450Mi
- Notification: Email

### 8.2 Setup Notification Channels

1. Go to **Monitoring** → **Notification channels**
2. Add channel:
   - Email
   - Slack
   - PagerDuty
   - SMS (paid)

3. Link to alert policies

## Part 9: Incident Response

### 9.1 Incident Runbook

**When backend is down**:

1. Check Cloud Console status
2. View recent logs for errors
3. Check Cloud Run service status
4. Check Firestore connection
5. If in code, check recent deployments
6. Rollback if necessary
7. Document incident

**Command to check status**:
```bash
gcloud run services describe ecommerce-backend \
  --region asia-south1 \
  --format="value(status)"
```

### 9.2 Quick Rollback

```bash
# View recent revisions
gcloud run revisions list \
  --service ecommerce-backend \
  --region asia-south1

# Rollback to previous revision
gcloud run deploy ecommerce-backend \
  --region asia-south1 \
  --revision [previous_revision_name]
```

### 9.3 View Deployment History

```bash
gcloud run releases list \
  --service ecommerce-backend \
  --region asia-south1
```

## Part 10: User Monitoring

### 10.1 Firebase Analytics

In Firebase Console → **Analytics**:
- Real-time active users
- Session duration
- User retention
- Device information
- Geographic distribution

### 10.2 Custom Events

Track important user actions:

**Frontend logging**:
```javascript
import { logEvent } from 'firebase/analytics';

// Track purchase
logEvent(analytics, 'purchase', {
  value: totalAmount,
  currency: 'INR',
  items: cartItems
});
```

**Events to track**:
- user_signup
- user_login
- view_product
- add_to_cart
- remove_from_cart
- purchase
- view_orders

### 10.3 Cohort Analysis

Identify user segments:
- New vs returning users
- Users by device type
- Users by location
- Power users (frequent purchases)

## Part 11: Maintenance

### 11.1 Regular Tasks

**Daily**:
- Check error logs
- Monitor uptime
- Review performance metrics

**Weekly**:
- Review slow queries
- Check resource usage
- Analyze user trends

**Monthly**:
- Optimize code based on metrics
- Review and adjust alerts
- Plan improvements

### 11.2 Database Maintenance

**Firestore**:
- Monitor collection sizes
- Clean up old documents
- Create necessary indexes
- Review security rules

**BigQuery** (if using):
- Manage dataset size
- Archive old logs
- Create reports

### 11.3 Security Audits

Check:
- No hardcoded credentials
- Service accounts have least privilege
- API keys properly restricted
- CORS properly configured
- Firestore security rules enforced

## Part 12: Troubleshooting Guide

### Issue: Requests Hanging

**Symptoms**: API requests timeout
**Cause**: Firestore connection, slow query, network issue
**Solution**:
```
1. Check Cloud Logging for slow queries
2. Check Firestore performance
3. Review recent code changes
4. Check network connectivity
```

### Issue: High Error Rate

**Symptoms**: Many 5xx errors
**Cause**: Firestore down, code bug, resource limit
**Solution**:
```
1. Check Cloud Status dashboard
2. Review error logs for pattern
3. Check resource limits (memory, CPU)
4. Review recent deployments
5. Rollback if recent change
```

### Issue: CORS Errors

**Symptoms**: Browser blocks requests
**Cause**: Frontend origin not in CORS_ORIGINS
**Solution**:
```
1. Get frontend URL
2. Update CORS_ORIGINS env variable
3. Redeploy backend
4. Clear browser cache
5. Verify in browser dev tools
```

### Issue: Authentication Failing

**Symptoms**: 401 errors on protected routes
**Cause**: Invalid token, expired token, wrong format
**Solution**:
```
1. Check Authorization header format
2. Verify token is fresh
3. Check Firebase config on frontend
4. Check backend token verification logic
5. Check if user still exists
```

### Issue: Products Not Loading

**Symptoms**: Empty product list
**Cause**: No products in Firestore, query error
**Solution**:
```
1. Check Firebase Console > Firestore > products
2. Verify import_products.py ran successfully
3. Check product schema matches expected
4. Review backend logs for query errors
```

## Part 13: Monitoring Checklist

Regular checks to ensure system health:

**Weekly**:
- [ ] Review error logs
- [ ] Check request latency
- [ ] Verify uptime > 99%
- [ ] Check no security warnings

**Monthly**:
- [ ] Review analytics data
- [ ] Optimize slow queries
- [ ] Update dependencies
- [ ] Test rollback procedure
- [ ] Review security rules
- [ ] Backup data

**Quarterly**:
- [ ] Capacity planning
- [ ] Security audit
- [ ] Disaster recovery test
- [ ] Performance baseline review

## Useful Commands Reference

```bash
# View logs
gcloud run logs read ecommerce-backend --limit 100

# View specific errors
gcloud logging read \
  "resource.service.name=ecommerce-backend AND severity=ERROR" \
  --limit 50

# Check service status
gcloud run services describe ecommerce-backend

# View metrics
gcloud monitoring metrics list

# View alerts
gcloud alpha monitoring policies list

# Check recent deployments
gcloud run revisions list --service ecommerce-backend
```

## Useful URLs

- **Cloud Logging**: https://console.cloud.google.com/logs
- **Cloud Monitoring**: https://console.cloud.google.com/monitoring
- **Error Reporting**: https://console.cloud.google.com/errors
- **Cloud Run**: https://console.cloud.google.com/run
- **Firebase Console**: https://console.firebase.google.com
- **Firestore**: https://console.cloud.google.com/firestore
- **Cloud Status**: https://status.cloud.google.com

## Additional Resources

- [Google Cloud Logging Docs](https://cloud.google.com/logging/docs)
- [Cloud Monitoring Guide](https://cloud.google.com/monitoring/doc)
- [Error Reporting Guide](https://cloud.google.com/error-reporting/docs)
- [Firebase Analytics](https://firebase.google.com/docs/analytics)
- [Cloud Run Troubleshooting](https://cloud.google.com/run/docs/troubleshooting)
