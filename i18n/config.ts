import { getLocaleCodes } from '@/lib/locales'

export type Locale = (typeof locales)[number];

export const locales = getLocaleCodes() as readonly string[];
export const defaultLocale: Locale = 'zh';