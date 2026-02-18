# Admin Panel Guide

## How to Access Admin

1. Go to: `https://your-site.run.app/admin/login`
2. Log in with your Firebase Auth credentials (email/password)
3. You'll be redirected to the dashboard

## Prerequisites

Before using the admin panel:

### 1. Enable Firebase Authentication
1. Go to: https://console.firebase.google.com/project/intro-with-contact/authentication
2. Click **"Get started"**
3. Click **"Email/Password"**
4. Enable **"Email/Password"** toggle
5. Click **"Save"**

### 2. Create Admin User
1. Go to: https://console.firebase.google.com/project/intro-with-contact/authentication/users
2. Click **"Add user"**
3. Enter:
   - Email: your admin email
   - Password: a secure password
4. Click **"Add user"**

### 3. Set Environment Variables in Cloud Run
Make sure these are set in Cloud Run:
- `FIREBASE_ADMIN_CLIENT_EMAIL`
- `FIREBASE_ADMIN_PRIVATE_KEY`

---

## Admin Sections

### Dashboard (`/admin/dashboard`)
- View pending bookings count
- View confirmed bookings count
- View unread contact messages

### Pages (`/admin/pages`)
- List of all editable pages
- Click a page to edit

### Page Editor (`/admin/pages/[slug]`)
- **Two language tabs:** Romanian (RO) and English (EN)
- **Rich text editor (TipTap)** with:
  - Bold, Italic, Strikethrough
  - Headings (H1, H2, H3)
  - Bullet and numbered lists
  - Links
  - Images
- Click **"Save"** to store content in Firestore

### Services (`/admin/services`)
- View all services
- **Add new service:** Click "Add Service"
- **Edit service:** Click on a service
- **Delete service:** Click delete icon
- Each service has:
  - Title (RO/EN)
  - Description (RO/EN)
  - Image URL
  - Display order

### Pricing (`/admin/pricing`)
- View all pricing packages
- **Add new package:** Click "Add Package"
- **Edit package:** Click on a package
- **Delete package:** Click delete icon
- Each package has:
  - Title (RO/EN)
  - Duration
  - Price and currency
  - Type (session/package)
  - Display order

### Bookings (`/admin/bookings`)
- View all appointment bookings
- **Filter by status:** All, Pending, Confirmed, Cancelled
- **Confirm booking:** Click confirm button
- **Cancel booking:** Click cancel button
- Booking details:
  - Client name, email, phone
  - Service requested
  - Date and time
  - Status

### Settings (`/admin/settings`)
- **General:** Site name, contact email, phone, address
- **Theme:** Default theme (light/dark)
- **Language:** Default language (RO/EN)
- **Social Links:** WhatsApp, Facebook, Instagram URLs
- **Calendar:** Working days, hours, session duration, buffer time

---

## How Content Editing Works

1. Admin edits content in the admin panel
2. Content is saved to Firestore database
3. Public pages fetch content from Firestore
4. If no content exists, default fallback content is shown

### Firestore Collections

| Collection | Purpose |
|------------|---------|
| `pages` | Page content (title, body) per language |
| `services` | Service items |
| `pricing` | Pricing packages |
| `bookings` | Appointment bookings |
| `contacts` | Contact form submissions |
| `settings` | Site-wide settings |

---

## Quick Start Checklist

- [ ] Enable Firebase Authentication
- [ ] Create admin user in Firebase
- [ ] Set FIREBASE_ADMIN_* env vars in Cloud Run
- [ ] Log in to admin panel
- [ ] Update site settings
- [ ] Add/edit services
- [ ] Add/edit pricing
- [ ] Edit page content
