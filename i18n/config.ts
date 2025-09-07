export type Locale = (typeof locales)[number];

export const locales = ['zh', 'en', 'hi'] as const;
export const defaultLocale: Locale = 'en';