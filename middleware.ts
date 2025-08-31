import createMiddleware from 'next-intl/middleware';
import { getLocaleCodes } from '@/lib/locales'

export default createMiddleware({
  // A list of all locales that are supported
  locales: getLocaleCodes(),

  // Used when no locale matches
  defaultLocale: 'zh'
});

export const config = {
  // Match only internationalized pathnames
  matcher: ['/', '/(zh|en)/:path*']
};