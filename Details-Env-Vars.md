# Environment Variables Setup Guide

## Overview

This project uses environment variables to manage configuration for Firebase, SendGrid, and Google Calendar. This guide explains how to obtain and configure each variable.

---

## Quick Reference

| Variable | Required | Type | Purpose |
|----------|----------|------|---------|
| `NEXT_PUBLIC_FIREBASE_*` | Yes | Client | Firebase client SDK |
| `FIREBASE_ADMIN_*` | Yes | Server | Firebase admin operations |
| `SENDGRID_API_KEY` | Phase 2 | Server | Email sending |
| `GOOGLE_CALENDAR_*` | Phase 4 | Server | Booking calendar sync |

---

## 1. Firebase Client SDK (Public)

These are safe to expose in the browser (prefixed with `NEXT_PUBLIC_`).

### How to Get

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Select your project → Project Settings (gear icon)
3. Scroll to "Your apps" → Select web app
4. Copy the config values

### Variables

```env
NEXT_PUBLIC_FIREBASE_API_KEY=your-api-key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your-project-id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your-project.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=123456789
NEXT_PUBLIC_FIREBASE_APP_ID=1:123456789:web:abcdef
NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID=G-XXXXXXXXXX
```

---

## 2. Firebase Admin SDK (Server-side)

Used for server-side operations (API routes). **Never expose these publicly.**

### How to Get

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Project Settings → Service Accounts tab
3. Click "Generate new private key"
4. Download the JSON file
5. Extract values from the JSON:

```json
{
  "project_id": "→ FIREBASE_ADMIN_PROJECT_ID",
  "client_email": "→ FIREBASE_ADMIN_CLIENT_EMAIL",
  "private_key": "→ FIREBASE_ADMIN_PRIVATE_KEY"
}
```

### Variables

```env
FIREBASE_ADMIN_PROJECT_ID=your-project-id
FIREBASE_ADMIN_CLIENT_EMAIL=firebase-adminsdk-xxxxx@your-project.iam.gserviceaccount.com
FIREBASE_ADMIN_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\nMIIE...your-key...\n-----END PRIVATE KEY-----\n"
```

> **Important:** The private key must be wrapped in quotes and keep the `\n` characters.

---

## 3. SendGrid (Email Service)

Used for sending contact form notifications and booking confirmations.

### How to Get

1. Create account at [SendGrid](https://sendgrid.com/)
2. Go to Settings → API Keys
3. Click "Create API Key"
4. Choose "Full Access" or "Restricted Access" with Mail Send permission
5. Copy the key (shown only once!)

### Variables

```env
SENDGRID_API_KEY=SG.xxxxxxxxxxxxxxxxxxxx
```

### Additional Setup

- Verify your sender email/domain in SendGrid
- Configure sender identity under Settings → Sender Authentication

---

## 4. Google Calendar API

Used for booking system to check availability and create appointments.

### How to Get

#### Step 1: Enable API
1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Select your project (or create one linked to Firebase)
3. Go to APIs & Services → Enable APIs
4. Search for "Google Calendar API" and enable it

#### Step 2: Create OAuth Credentials
1. Go to APIs & Services → Credentials
2. Click "Create Credentials" → OAuth client ID
3. Application type: Web application
4. Add authorized redirect URI: `http://localhost:3000/api/auth/callback/google`
5. Copy Client ID and Client Secret

#### Step 3: Get Refresh Token
1. Use the [OAuth 2.0 Playground](https://developers.google.com/oauthplayground/)
2. Click gear icon → Check "Use your own OAuth credentials"
3. Enter your Client ID and Secret
4. Select scope: `https://www.googleapis.com/auth/calendar`
5. Authorize and exchange for tokens
6. Copy the Refresh Token

#### Step 4: Get Calendar ID
1. Go to [Google Calendar](https://calendar.google.com/)
2. Click on your calendar → Settings
3. Scroll to "Integrate calendar"
4. Copy the Calendar ID (usually your email or a long string)

### Variables

```env
GOOGLE_CALENDAR_CLIENT_ID=xxxxx.apps.googleusercontent.com
GOOGLE_CALENDAR_CLIENT_SECRET=GOCSPX-xxxxxxxxxx
GOOGLE_CALENDAR_REFRESH_TOKEN=1//xxxxxxxxxx
GOOGLE_CALENDAR_ID=your-email@gmail.com
```

---

## File Locations

### Local Development
Create `.env.local` in project root:
```
psychotherapy-site/
├── .env.local      ← Your environment variables
├── .env.example    ← Template (safe to commit)
└── ...
```

### Production (Cloud Run)
Set variables in Google Cloud Console:
1. Go to Cloud Run → Your Service
2. Edit & Deploy New Revision
3. Go to "Variables & Secrets" tab
4. Add each variable

---

## Template File (.env.example)

Create this file to help other developers:

```env
# Firebase Client SDK
NEXT_PUBLIC_FIREBASE_API_KEY=
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=
NEXT_PUBLIC_FIREBASE_PROJECT_ID=
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=
NEXT_PUBLIC_FIREBASE_APP_ID=
NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID=

# Firebase Admin SDK
FIREBASE_ADMIN_PROJECT_ID=
FIREBASE_ADMIN_CLIENT_EMAIL=
FIREBASE_ADMIN_PRIVATE_KEY=

# SendGrid
SENDGRID_API_KEY=

# Google Calendar
GOOGLE_CALENDAR_CLIENT_ID=
GOOGLE_CALENDAR_CLIENT_SECRET=
GOOGLE_CALENDAR_REFRESH_TOKEN=
GOOGLE_CALENDAR_ID=
```

---

## Security Checklist

- [ ] `.env.local` is in `.gitignore` (auto-added by Next.js)
- [ ] Never commit actual credentials to Git
- [ ] Use different credentials for dev/staging/prod
- [ ] Rotate keys periodically
- [ ] Restrict API key permissions where possible

---

## Current Status

Your `.env.local` already has:
- [x] Firebase Client SDK variables (populated)
- [ ] Firebase Admin SDK variables (need service account)
- [ ] SendGrid API key (Phase 2)
- [ ] Google Calendar credentials (Phase 4)
