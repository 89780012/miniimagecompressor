import {NextIntlClientProvider} from 'next-intl';
import {getMessages,getLocale, getTranslations} from 'next-intl/server';
import { generateSEOMetadata } from '@/lib/seo';
import "../globals.css";

export async function generateMetadata() {
  const locale = await getLocale();
  const t = await getTranslations({ locale });

  return await generateSEOMetadata({
    title: t("metadata.title"),
    description: t("metadata.description"),
    keywords: t("metadata.keywords"),
    locale: locale,
    url: locale === 'en' ? '' : `/${locale}`
  });
}

export default async function LocaleLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const locale = await getLocale();
  const messages = await getMessages();

  return (
    <html lang={locale}>
      <body
        className="antialiased"
        suppressHydrationWarning={true}
      >
        <NextIntlClientProvider messages={messages}>
          {children}
        </NextIntlClientProvider>
      </body>
    </html>
  );
}