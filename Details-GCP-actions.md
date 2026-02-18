# Google Cloud Console Setup Guide

This guide covers all the configurations needed in Google Cloud Console before deploying the psychotherapy website.

## 1. Create/Select Project

- Go to [console.cloud.google.com](https://console.cloud.google.com)
- Create a new project or select existing one
- Note the **Project ID** (you'll need it for deployment)

## 2. Enable Required APIs

Navigate to **APIs & Services > Library** and enable:

| API | Purpose |
|-----|---------|
| **Cloud Run API** | Host the website |
| **Cloud Build API** | Build Docker images |
| **Container Registry API** | Store Docker images |
| **Secret Manager API** | Store sensitive env vars (optional but recommended) |

## 3. Firebase Setup

In [Firebase Console](https://console.firebase.google.com):

### 3.1 Create Firebase Project
- Create Firebase project (or link existing GCP project)

### 3.2 Enable Firestore Database
- Go to Firestore Database > Create database
- Start in production mode
- Choose region (e.g., `europe-west1`)

### 3.3 Enable Authentication
- Go to Authentication > Sign-in method
- Enable **Email/Password**

### 3.4 Create Admin User
- Go to Authentication > Users > Add user
- Add email/password for admin login

### 3.5 Get Firebase Config
- Go to Project Settings > General > Your apps
- Add a Web app if not exists
- Copy the config values for `.env.local`

### 3.6 Create Service Account
- Go to Project Settings > Service accounts
- Generate new private key (downloads JSON)
- Use values for `FIREBASE_ADMIN_*` env vars

## 4. Google Calendar API Setup

In Google Cloud Console:

### 4.1 Enable Google Calendar API
- APIs & Services > Library > Search "Google Calendar API" > Enable

### 4.2 Create OAuth Credentials
- APIs & Services > Credentials > Create Credentials > OAuth client ID
- Application type: **Web application**
- Authorized redirect URIs: `https://developers.google.com/oauthplayground`
- Save **Client ID** and **Client Secret**

### 4.3 Get Refresh Token

Using OAuth Playground:

1. Go to [OAuth Playground](https://developers.google.com/oauthplayground/)
2. Click gear icon (settings) > Check "Use your own OAuth credentials"
3. Enter your Client ID and Client Secret
4. In Step 1: Select `https://www.googleapis.com/auth/calendar`
5. Click "Authorize APIs" > Sign in with the Google account that has the calendar
6. In Step 2: Click "Exchange authorization code for tokens"
7. Copy the **Refresh Token**

### 4.4 Get Calendar ID
- Go to [Google Calendar](https://calendar.google.com)
- Settings > Select your calendar > Integrate calendar
- Copy **Calendar ID** (usually your email or a long string)

## 5. SendGrid Setup

At [sendgrid.com](https://sendgrid.com):

### 5.1 Create Account
- Free tier: 100 emails/day

### 5.2 Create API Key
- Go to **Settings > API Keys > Create API Key**
- Name: `psychotherapy-site`
- Permissions: Full Access (or Restricted with Mail Send)
- Copy the API key (shown only once!)

### 5.3 Verify Sender Identity
- Settings > Sender Authentication
- Either verify a single sender email OR authenticate your domain

## 6. Cloud Run Environment Variables

After first deployment, in Cloud Console:

1. Go to **Cloud Run > psychotherapy-site > Edit & Deploy New Revision**
2. Click **Variables & Secrets** tab
3. Add all environment variables:

```
NEXT_PUBLIC_FIREBASE_API_KEY=xxx
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=xxx
NEXT_PUBLIC_FIREBASE_PROJECT_ID=xxx
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=xxx
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=xxx
NEXT_PUBLIC_FIREBASE_APP_ID=xxx
FIREBASE_ADMIN_PROJECT_ID=xxx
FIREBASE_ADMIN_CLIENT_EMAIL=xxx
FIREBASE_ADMIN_PRIVATE_KEY=xxx (paste entire key including -----BEGIN/END-----)
SENDGRID_API_KEY=xxx
GOOGLE_CALENDAR_CLIENT_ID=xxx
GOOGLE_CALENDAR_CLIENT_SECRET=xxx
GOOGLE_CALENDAR_REFRESH_TOKEN=xxx
GOOGLE_CALENDAR_ID=xxx
```

**For sensitive values (recommended):** Use "Reference a Secret" instead of plain text.

## 7. Custom Domain (Optional)

In Cloud Run:

1. Go to **Cloud Run > psychotherapy-site > Integrations** tab
2. Click **Custom domains > Add mapping**
3. Verify domain ownership
4. Add DNS records at your domain registrar:
   - **A records** for apex domain (e.g., `example.com`)
   - **CNAME** for www pointing to `ghs.googlehosted.com`
5. SSL certificate is auto-provisioned (takes up to 24 hours)

---

## Summary Checklist

| Step | Status |
|------|--------|
| GCP Project created | ☐ |
| Cloud Run API enabled | ☐ |
| Cloud Build API enabled | ☐ |
| Container Registry API enabled | ☐ |
| Firebase project created | ☐ |
| Firestore database created | ☐ |
| Firebase Auth enabled | ☐ |
| Firebase admin user created | ☐ |
| Firebase service account key downloaded | ☐ |
| Google Calendar API enabled | ☐ |
| OAuth credentials created | ☐ |
| Calendar refresh token obtained | ☐ |
| SendGrid account created | ☐ |
| SendGrid API key created | ☐ |
| SendGrid sender verified | ☐ |
| Environment variables configured in Cloud Run | ☐ |
| Custom domain configured (optional) | ☐ |
