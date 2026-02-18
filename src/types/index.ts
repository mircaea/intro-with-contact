import { Timestamp } from 'firebase/firestore';

// Localized content
export interface LocalizedContent {
  ro: string;
  en: string;
}

// Pages
export interface Page {
  slug: string;
  title: LocalizedContent;
  content: LocalizedContent; // TipTap JSON string
  sections?: Section[];
  updatedAt: Timestamp;
}

export interface Section {
  id: string;
  type: 'hero' | 'text' | 'image' | 'cards' | 'cta';
  title?: LocalizedContent;
  content?: LocalizedContent;
  image?: string;
  order: number;
}

// Services
export interface Service {
  id: string;
  title: LocalizedContent;
  description: LocalizedContent;
  image?: string;
  order: number;
}

// Pricing
export interface PricingItem {
  id: string;
  title: LocalizedContent;
  description?: LocalizedContent;
  duration: string;
  price: number;
  currency: string;
  type: 'session' | 'package';
  order: number;
}

// Bookings
export interface Booking {
  id: string;
  clientName: string;
  clientEmail: string;
  clientPhone: string;
  serviceId: string;
  datetime: Timestamp;
  status: 'pending' | 'confirmed' | 'cancelled';
  googleEventId?: string;
  notes?: string;
  createdAt: Timestamp;
}

// Contact
export interface ContactSubmission {
  id: string;
  name: string;
  email: string;
  phone?: string;
  message: string;
  createdAt: Timestamp;
  read: boolean;
}

// Settings
export interface Settings {
  siteName: string;
  logo?: string;
  contactEmail: string;
  phone: string;
  address: string;
  defaultTheme: 'light' | 'dark';
  defaultLanguage: 'ro' | 'en';
  socialLinks: {
    whatsapp?: string;
    facebook?: string;
    instagram?: string;
    linkedin?: string;
  };
  calendar: {
    workingDays: number[]; // 0 = Sunday, 6 = Saturday
    workingHours: { start: string; end: string };
    sessionDuration: number; // minutes
    bufferTime: number; // minutes between sessions
  };
}

// Supported locales
export type Locale = 'ro' | 'en';

// Theme mode
export type ThemeMode = 'light' | 'dark';
