import {NextIntlClientProvider} from 'next-intl';
import {getMessages,getLocale} from 'next-intl/server';
import { generateSEOMetadata } from '@/lib/seo';
import "../globals.css";

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;

  return await generateSEOMetadata({
    locale: locale || 'en',
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