import createMiddleware from 'next-intl/middleware';
import { getLocaleCodes, DEFAULT_LOCALE } from '@/lib/locales'

export default createMiddleware({
  // A list of all locales that are supported
  locales: getLocaleCodes(),

  // Used when no locale matches
  defaultLocale: DEFAULT_LOCALE,

  localePrefix: "as-needed",

  // 禁用浏览器语言检测，强制使用默认语言
  localeDetection: false
});

export const config = {
  // Match only internationalized pathnames
  matcher: [
    // Match all paths except for
    // - api (API routes)
    // - _next/static (static files)
    // - _next/image (image optimization files)
    // - favicon.ico (favicon file)
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
  ]
};