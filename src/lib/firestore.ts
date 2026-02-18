import {
  collection,
  doc,
  getDoc,
  getDocs,
  setDoc,
  updateDoc,
  deleteDoc,
  query,
  where,
  orderBy,
  Timestamp,
  DocumentData,
} from 'firebase/firestore';
import { db } from './firebase';
import type { Page, Service, PricingItem, Booking, ContactSubmission, Settings } from '@/types';

// Generic helpers
export const getDocument = async <T>(collectionName: string, docId: string): Promise<T | null> => {
  const docRef = doc(db, collectionName, docId);
  const docSnap = await getDoc(docRef);
  return docSnap.exists() ? (docSnap.data() as T) : null;
};

export const setDocument = async <T extends DocumentData>(
  collectionName: string,
  docId: string,
  data: T
): Promise<void> => {
  const docRef = doc(db, collectionName, docId);
  await setDoc(docRef, data, { merge: true });
};

export const deleteDocument = async (collectionName: string, docId: string): Promise<void> => {
  const docRef = doc(db, collectionName, docId);
  await deleteDoc(docRef);
};

// Pages
export const getPage = (slug: string) => getDocument<Page>('pages', slug);
export const savePage = (slug: string, data: Partial<Page>) => setDocument('pages', slug, data);

// Services
export const getServices = async (): Promise<Service[]> => {
  const q = query(collection(db, 'services'), orderBy('order', 'asc'));
  const snapshot = await getDocs(q);
  return snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() } as Service));
};

export const saveService = (id: string, data: Partial<Service>) => setDocument('services', id, data);
export const deleteService = (id: string) => deleteDocument('services', id);

// Pricing
export const getPricing = async (): Promise<PricingItem[]> => {
  const q = query(collection(db, 'pricing'), orderBy('order', 'asc'));
  const snapshot = await getDocs(q);
  return snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() } as PricingItem));
};

export const savePricing = (id: string, data: Partial<PricingItem>) => setDocument('pricing', id, data);
export const deletePricing = (id: string) => deleteDocument('pricing', id);

// Bookings
export const getBookings = async (status?: Booking['status']): Promise<Booking[]> => {
  let q = query(collection(db, 'bookings'), orderBy('datetime', 'desc'));
  if (status) {
    q = query(collection(db, 'bookings'), where('status', '==', status), orderBy('datetime', 'desc'));
  }
  const snapshot = await getDocs(q);
  return snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() } as Booking));
};

export const createBooking = async (data: Omit<Booking, 'id' | 'createdAt'>): Promise<string> => {
  const docRef = doc(collection(db, 'bookings'));
  await setDoc(docRef, {
    ...data,
    createdAt: Timestamp.now(),
  });
  return docRef.id;
};

export const updateBookingStatus = async (id: string, status: Booking['status']): Promise<void> => {
  const docRef = doc(db, 'bookings', id);
  await updateDoc(docRef, { status });
};

// Contact submissions
export const getContactSubmissions = async (): Promise<ContactSubmission[]> => {
  const q = query(collection(db, 'contacts'), orderBy('createdAt', 'desc'));
  const snapshot = await getDocs(q);
  return snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() } as ContactSubmission));
};

export const createContactSubmission = async (
  data: Omit<ContactSubmission, 'id' | 'createdAt' | 'read'>
): Promise<string> => {
  const docRef = doc(collection(db, 'contacts'));
  await setDoc(docRef, {
    ...data,
    createdAt: Timestamp.now(),
    read: false,
  });
  return docRef.id;
};

export const markContactAsRead = async (id: string): Promise<void> => {
  const docRef = doc(db, 'contacts', id);
  await updateDoc(docRef, { read: true });
};

// Settings
export const getSettings = () => getDocument<Settings>('settings', 'global');
export const saveSettings = (data: Partial<Settings>) => setDocument('settings', 'global', data);
