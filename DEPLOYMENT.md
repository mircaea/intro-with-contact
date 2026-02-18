# Deployment Guide - Psychotherapy Website

This guide covers deploying the psychotherapy website to Google Cloud Run.

## Prerequisites

1. **Google Cloud Account** with billing enabled
2. **Google Cloud SDK (gcloud)** installed locally
3. **Docker** installed locally (for local testing)
4. **Firebase Project** already configured (see `.env.example`)

## Quick Start

### Option 1: Deploy with Cloud Build (Recommended)

1. **Connect Repository to Cloud Build:**
   ```bash
   # Navigate to Google Cloud Console > Cloud Build > Triggers
   # Connect your GitHub/GitLab repository
   # Create a trigger using cloudbuild.yaml
   ```

2. **Set Environment Variables in Cloud Run:**
   After the first deployment, configure environment variables:
   ```bash
   gcloud run services update psychotherapy-site \
     --region=europe-west1 \
     --set-env-vars="NEXT_PUBLIC_FIREBASE_API_KEY=xxx" \
     --set-env-vars="NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=xxx" \
     --set-env-vars="NEXT_PUBLIC_FIREBASE_PROJECT_ID=xxx" \
     --set-env-vars="NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=xxx" \
     --set-env-vars="NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=xxx" \
     --set-env-vars="NEXT_PUBLIC_FIREBASE_APP_ID=xxx" \
     --set-env-vars="FIREBASE_ADMIN_PROJECT_ID=xxx" \
     --set-env-vars="FIREBASE_ADMIN_CLIENT_EMAIL=xxx" \
     --set-env-vars="FIREBASE_ADMIN_PRIVATE_KEY=xxx" \
     --set-env-vars="SENDGRID_API_KEY=xxx" \
     --set-env-vars="GOOGLE_CALENDAR_CLIENT_ID=xxx" \
     --set-env-vars="GOOGLE_CALENDAR_CLIENT_SECRET=xxx" \
     --set-env-vars="GOOGLE_CALENDAR_REFRESH_TOKEN=xxx" \
     --set-env-vars="GOOGLE_CALENDAR_ID=xxx"
   ```

### Option 2: Manual Deployment

1. **Authenticate with Google Cloud:**
   ```bash
   gcloud auth login
   gcloud config set project YOUR_PROJECT_ID
   ```

2. **Enable Required APIs:**
   ```bash
   gcloud services enable run.googleapis.com
   gcloud services enable cloudbuild.googleapis.com
   gcloud services enable containerregistry.googleapis.com
   ```

3. **Build and Push Docker Image:**
   ```bash
   # Build the image
   docker build -t gcr.io/YOUR_PROJECT_ID/psychotherapy-site:latest .
   
   # Configure Docker for GCR
   gcloud auth configure-docker
   
   # Push to Container Registry
   docker push gcr.io/YOUR_PROJECT_ID/psychotherapy-site:latest
   ```

4. **Deploy to Cloud Run:**
   ```bash
   gcloud run deploy psychotherapy-site \
     --image gcr.io/YOUR_PROJECT_ID/psychotherapy-site:latest \
     --region europe-west1 \
     --platform managed \
     --allow-unauthenticated \
     --memory 512Mi \
     --cpu 1 \
     --min-instances 0 \
     --max-instances 10
   ```

## Custom Domain Setup

1. **Verify Domain Ownership:**
   ```bash
   gcloud domains verify YOUR_DOMAIN.com
   ```

2. **Map Domain to Cloud Run Service:**
   ```bash
   gcloud run domain-mappings create \
     --service psychotherapy-site \
     --domain YOUR_DOMAIN.com \
     --region europe-west1
   ```

3. **Configure DNS Records:**
   Add the DNS records shown in the Cloud Console to your domain registrar:
   - For apex domain: A records pointing to Cloud Run IPs
   - For www subdomain: CNAME record pointing to ghs.googlehosted.com

4. **SSL Certificate:**
   Google Cloud automatically provisions and manages SSL certificates for custom domains. This process may take up to 24 hours.

## Environment Variables

### Required Variables

| Variable | Description |
|----------|-------------|
| `NEXT_PUBLIC_FIREBASE_API_KEY` | Firebase Web API Key |
| `NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN` | Firebase Auth Domain |
| `NEXT_PUBLIC_FIREBASE_PROJECT_ID` | Firebase Project ID |
| `NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET` | Firebase Storage Bucket |
| `NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID` | Firebase Sender ID |
| `NEXT_PUBLIC_FIREBASE_APP_ID` | Firebase App ID |
| `FIREBASE_ADMIN_PROJECT_ID` | Firebase Admin Project ID |
| `FIREBASE_ADMIN_CLIENT_EMAIL` | Service Account Email |
| `FIREBASE_ADMIN_PRIVATE_KEY` | Service Account Private Key |
| `SENDGRID_API_KEY` | SendGrid API Key |
| `GOOGLE_CALENDAR_CLIENT_ID` | Google Calendar OAuth Client ID |
| `GOOGLE_CALENDAR_CLIENT_SECRET` | Google Calendar OAuth Secret |
| `GOOGLE_CALENDAR_REFRESH_TOKEN` | Google Calendar Refresh Token |
| `GOOGLE_CALENDAR_ID` | Google Calendar ID |

### Setting Environment Variables

**Using Secret Manager (Recommended for sensitive values):**
```bash
# Create a secret
echo -n "your-secret-value" | gcloud secrets create SECRET_NAME --data-file=-

# Grant Cloud Run access
gcloud secrets add-iam-policy-binding SECRET_NAME \
  --member="serviceAccount:YOUR_PROJECT_NUMBER-compute@developer.gserviceaccount.com" \
  --role="roles/secretmanager.secretAccessor"

# Reference in Cloud Run
gcloud run services update psychotherapy-site \
  --region europe-west1 \
  --set-secrets="SENDGRID_API_KEY=sendgrid-api-key:latest"
```

## Local Testing with Docker

```bash
# Build the image
docker build -t psychotherapy-site .

# Run with environment variables
docker run -p 3000:3000 \
  -e NEXT_PUBLIC_FIREBASE_API_KEY=xxx \
  -e NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=xxx \
  # ... other env vars
  psychotherapy-site

# Or use an env file
docker run -p 3000:3000 --env-file .env.local psychotherapy-site
```

## Monitoring and Logs

**View Logs:**
```bash
gcloud run services logs read psychotherapy-site --region europe-west1
```

**Stream Logs:**
```bash
gcloud run services logs tail psychotherapy-site --region europe-west1
```

**View in Console:**
Navigate to Cloud Console > Cloud Run > psychotherapy-site > Logs

## Scaling Configuration

The default configuration in `cloudbuild.yaml`:
- **Min instances:** 0 (scales to zero when idle, saves costs)
- **Max instances:** 10 (handles traffic spikes)
- **Memory:** 512Mi
- **CPU:** 1

Adjust based on your traffic needs:
```bash
gcloud run services update psychotherapy-site \
  --region europe-west1 \
  --min-instances 1 \  # Keep warm (no cold starts)
  --max-instances 50   # Higher capacity
```

## Cost Optimization

1. **Scale to Zero:** Keep `min-instances=0` for low-traffic periods
2. **Right-size Resources:** Start with 512Mi memory, increase if needed
3. **Use Committed Use Discounts:** For predictable workloads
4. **Monitor Usage:** Set up billing alerts in Cloud Console

## Troubleshooting

### Build Fails
- Check Docker build locally: `docker build -t test .`
- Ensure all dependencies are in `package.json`
- Check `.dockerignore` isn't excluding necessary files

### Cold Start Issues
- Increase `min-instances` to 1 or more
- Optimize bundle size with Next.js analyzer

### Environment Variable Issues
- Verify all required variables are set
- Check for special characters in values (may need escaping)
- Use Secret Manager for sensitive values

### CORS Issues
- Configure CORS in API routes if needed
- Check Next.js headers configuration

## Rollback

```bash
# List revisions
gcloud run revisions list --service psychotherapy-site --region europe-west1

# Rollback to specific revision
gcloud run services update-traffic psychotherapy-site \
  --region europe-west1 \
  --to-revisions REVISION_NAME=100
```

## CI/CD Best Practices

1. **Branch Strategy:**
   - `main` → Production
   - `develop` → Staging (create separate Cloud Run service)

2. **Automatic Deployments:**
   - Configure Cloud Build trigger on push to `main`
   - Use branch filters for staging environments

3. **Testing Before Deploy:**
   - Add build step for running tests in `cloudbuild.yaml`
