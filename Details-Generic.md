# Psychotherapy Website - Project Documentation

## Overview

A professional psychotherapy website with CMS capabilities, appointment booking, and multi-language support.

**Tech Stack:**
- Next.js 16+ (App Router, TypeScript)
- Material UI (MUI) v5
- Firebase (Firestore, Auth, Storage)
- SendGrid (Email)
- Google Calendar API (Booking)
- TipTap (Rich Text Editor)
- next-intl (i18n)

---

## 1. Public Website

| Page | Route (RO) | Route (EN) | Description |
|------|------------|------------|-------------|
| Home | `/ro` | `/en` | Hero section, about preview, services preview, CTA |
| About | `/ro/despre-mine` | `/en/about` | Therapist bio, approach, credentials |
| Services | `/ro/servicii` | `/en/services` | List of therapy services offered |
| Pricing | `/ro/tarife` | `/en/pricing` | Session prices and packages |
| Contact | `/ro/contact` | `/en/contact` | Contact form (saves to Firestore) |
| Booking | `/ro/programare` | `/en/booking` | 4-step appointment wizard |

### Built-in Features

- **Light/Dark theme toggle** - Persists in localStorage
- **Language switcher** - Romanian/English with localized URLs
- **Responsive design** - Mobile drawer navigation
- **SEO-ready structure** - Server-side rendering support

---

## 2. Admin Panel

| Route | Purpose |
|-------|---------|
| `/admin/login` | Firebase Auth login |
| `/admin/dashboard` | Overview stats (bookings, messages) |
| `/admin/pages/[slug]` | Edit page content with TipTap editor |
| `/admin/services` | CRUD for services |
| `/admin/pricing` | CRUD for pricing items |
| `/admin/bookings` | View/manage appointments |
| `/admin/settings` | Site-wide configuration |

---

## 3. Content Management (CMS)

### How Admin Customizes Pages

```
┌─────────────────────────────────────────────────────────┐
│                    Admin Panel                          │
│  ┌───────────────────────────────────────────────────┐  │
│  │  Page Editor (TipTap)                             │  │
│  │  ┌─────────────────────────────────────────────┐  │  │
│  │  │  [RO] [EN] tabs                             │  │  │
│  │  │                                             │  │  │
│  │  │  Rich text toolbar:                         │  │  │
│  │  │  B I U | H1 H2 H3 | • ◦ | Link Image       │  │  │
│  │  │                                             │  │  │
│  │  │  ┌─────────────────────────────────────┐   │  │  │
│  │  │  │  Content area...                    │   │  │  │
│  │  │  │  Type your content here             │   │  │  │
│  │  │  └─────────────────────────────────────┘   │  │  │
│  │  │                                             │  │  │
│  │  │  [Preview] [Save Draft] [Publish]          │  │  │
│  │  └─────────────────────────────────────────────┘  │  │
│  └───────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────┘
```

### Editable Content Per Page

- **Title** (RO/EN)
- **Body content** (RO/EN) - Rich text with TipTap
- **Images** - Uploaded to Firebase Storage

---

## 4. Firestore Data Structure

```
firestore/
├── pages/
│   ├── home
│   ├── despre-mine
│   ├── servicii
│   ├── tarife
│   └── contact
│
├── services/
│   ├── {serviceId}
│   │   ├── title: { ro, en }
│   │   ├── description: { ro, en }
│   │   ├── image: string
│   │   └── order: number
│
├── pricing/
│   ├── {pricingId}
│   │   ├── title: { ro, en }
│   │   ├── duration: string
│   │   ├── price: number
│   │   ├── currency: string
│   │   ├── type: 'session' | 'package'
│   │   └── order: number
│
├── bookings/
│   ├── {bookingId}
│   │   ├── clientName, clientEmail, clientPhone
│   │   ├── serviceId
│   │   ├── datetime: Timestamp
│   │   ├── status: 'pending' | 'confirmed' | 'cancelled'
│   │   └── googleEventId (optional)
│
├── contacts/
│   ├── {contactId}
│   │   ├── name, email, phone, message
│   │   ├── createdAt: Timestamp
│   │   └── read: boolean
│
└── settings/
    └── global
        ├── siteName, logo, contactEmail
        ├── phone, address
        ├── defaultTheme: 'light' | 'dark'
        ├── defaultLanguage: 'ro' | 'en'
        ├── socialLinks: { whatsapp, facebook, instagram }
        └── calendar: { workingDays, workingHours, sessionDuration, bufferTime }
```

---

## 5. Settings Panel Options

| Setting | Description | Example |
|---------|-------------|---------|
| **Site Name** | Brand name in header/footer | "Cabinet Psihoterapie" |
| **Logo** | Upload logo image | logo.png |
| **Contact Email** | Where form submissions go | contact@example.com |
| **Phone** | Display phone number | +40 700 000 000 |
| **Address** | Physical location | Str. Exemplu, Bucuresti |
| **Default Theme** | Initial theme for visitors | light / dark |
| **Default Language** | Initial language | ro / en |
| **Social Links** | WhatsApp, Facebook, Instagram, LinkedIn | URLs |
| **Working Days** | Days available for booking | Mon-Fri (1-5) |
| **Working Hours** | Available time range | 09:00 - 18:00 |
| **Session Duration** | Default appointment length | 50 minutes |
| **Buffer Time** | Gap between sessions | 10 minutes |

---

## 6. Booking System Flow

```
Client                          System                         Admin
  │                               │                              │
  ├─── Select Service ──────────►│                              │
  ├─── Select Date/Time ────────►│◄─── Available slots from ────┤
  │                               │     Google Calendar          │
  ├─── Enter Details ───────────►│                              │
  ├─── Confirm ─────────────────►│                              │
  │                               │                              │
  │                               ├─── Save to Firestore ───────►│
  │                               ├─── Create Calendar Event ───►│
  │◄── Confirmation Email ───────┤─── Notification Email ──────►│
  │                               │                              │
```

### Booking States

| Status | Description |
|--------|-------------|
| `pending` | New booking, awaiting confirmation |
| `confirmed` | Admin confirmed the appointment |
| `cancelled` | Appointment was cancelled |

---

## 7. Project Structure

```
src/
├── app/
│   ├── [locale]/
│   │   ├── layout.tsx              # Main layout with Header/Footer
│   │   ├── page.tsx                # Home page
│   │   ├── despre-mine/page.tsx    # About page
│   │   ├── servicii/page.tsx       # Services page
│   │   ├── tarife/page.tsx         # Pricing page
│   │   ├── contact/page.tsx        # Contact form
│   │   └── programare/page.tsx     # Booking wizard
│   ├── admin/                      # Admin panel (Phase 3)
│   └── api/
│       ├── contact/route.ts        # Contact form submission
│       └── bookings/route.ts       # Booking CRUD
├── components/
│   ├── layout/
│   │   ├── Header.tsx
│   │   ├── Footer.tsx
│   │   └── LanguageSwitcher.tsx
│   ├── ui/
│   │   └── ThemeToggle.tsx
│   ├── admin/                      # Admin components (Phase 3)
│   └── booking/                    # Booking components (Phase 4)
├── lib/
│   ├── firebase.ts                 # Firebase initialization
│   └── firestore.ts                # Firestore helpers
├── i18n/
│   ├── config.ts                   # Locale configuration
│   ├── request.ts                  # next-intl request config
│   └── messages/
│       ├── ro.json                 # Romanian translations
│       └── en.json                 # English translations
├── theme/
│   ├── lightTheme.ts               # MUI light theme
│   ├── darkTheme.ts                # MUI dark theme
│   └── ThemeProvider.tsx           # Theme context
└── types/
    └── index.ts                    # TypeScript types
```

---

## 8. Environment Variables

```env
# Firebase (Client-side)
NEXT_PUBLIC_FIREBASE_API_KEY=
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=
NEXT_PUBLIC_FIREBASE_PROJECT_ID=
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=
NEXT_PUBLIC_FIREBASE_APP_ID=
NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID=

# Firebase Admin (Server-side)
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

## 9. Implementation Status

| Feature | Status | Phase |
|---------|--------|-------|
| Project setup (Next.js, MUI, Firebase) | Done | 1 |
| Theme system (Light/Dark) | Done | 1 |
| i18n (RO/EN) | Done | 1 |
| Public layout (Header, Footer, Nav) | Done | 1 |
| Home page | Done | 1 |
| About page | Done | 1 |
| Services page | Done | 1 |
| Pricing page | Done | 1 |
| Contact form | Done | 1 |
| Booking wizard | Done | 1 |
| API routes | Done | 1 |
| Firestore helpers | Done | 1 |
| Connect pages to Firestore | Pending | 2 |
| SendGrid email integration | Pending | 2 |
| Firebase Auth (Admin) | Pending | 3 |
| Admin dashboard | Pending | 3 |
| TipTap page editor | Pending | 3 |
| Image upload | Pending | 3 |
| Google Calendar integration | Pending | 4 |
| Booking confirmation emails | Pending | 4 |
| Docker + Cloud Run deployment | Pending | 5 |

---

## 10. Development

### Running Locally

```bash
cd psychotherapy-site
npm install
npm run dev
```

Open http://localhost:3000 (redirects to `/ro`)

### Building for Production

```bash
npm run build
npm start
```

### Firebase Setup Required

1. **Firebase Console:**
   - Enable Firestore Database
   - Enable Authentication (Email/Password)
   - Enable Cloud Storage

2. **Google Cloud Console:**
   - Enable Google Calendar API
   - Enable Cloud Run API (for deployment)

3. **SendGrid:**
   - Create account and get API key
   - Verify sender domain

---

## 11. Deployment (Phase 5)

Target: **Google Cloud Run**

```dockerfile
# Dockerfile will be created in Phase 5
FROM node:20-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY . .
RUN npm run build
EXPOSE 3000
CMD ["npm", "start"]
```

---

## 12. Future Enhancements

- [ ] Blog/Articles section
- [ ] Testimonials management
- [ ] Newsletter subscription
- [ ] Analytics dashboard
- [ ] Appointment reminders (SMS)
- [ ] Online payment integration
- [ ] Video consultation booking
