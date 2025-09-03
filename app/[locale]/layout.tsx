import {NextIntlClientProvider} from 'next-intl';
import {getMessages} from 'next-intl/server';
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
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  console.log("locale", locale);

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