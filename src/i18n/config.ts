export const locales = ['ro', 'en'] as const;
export type Locale = (typeof locales)[number];

export const defaultLocale: Locale = 'ro';

export const localeNames: Record<Locale, string> = {
  ro: 'Romana',
  en: 'English',
};

// Route mappings for localized URLs
export const routeTranslations: Record<string, Record<Locale, string>> = {
  'despre-mine': { ro: 'despre-mine', en: 'about' },
  about: { ro: 'despre-mine', en: 'about' },
  servicii: { ro: 'servicii', en: 'services' },
  services: { ro: 'servicii', en: 'services' },
  tarife: { ro: 'tarife', en: 'pricing' },
  pricing: { ro: 'tarife', en: 'pricing' },
  contact: { ro: 'contact', en: 'contact' },
  programare: { ro: 'programare', en: 'booking' },
  booking: { ro: 'programare', en: 'booking' },
};
