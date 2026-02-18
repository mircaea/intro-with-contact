import createMiddleware from 'next-intl/middleware';
import { locales, defaultLocale } from './i18n/config';

export default createMiddleware({
  locales,
  defaultLocale,
  localePrefix: 'always',
});

export const config = {
  // Match all pathnames except for:
  // - /api, /_next, /_vercel routes
  // - /admin routes (admin panel doesn't need i18n)
  // - files with extensions (e.g. favicon.ico)
  matcher: ['/', '/(ro|en)/:path*', '/((?!api|admin|_next|_vercel|.*\\..*).*)'],
};
