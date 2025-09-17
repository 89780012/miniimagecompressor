import {NextIntlClientProvider} from 'next-intl';
import {getMessages, getLocale, getTranslations} from 'next-intl/server';
import { generateSEOMetadata } from '@/lib/seo';

export async function generateMetadata() {
  const locale = await getLocale();
  const t = await getTranslations({ locale });

  return await generateSEOMetadata({
    title: t("resizeMetadata.title"),
    description: t("resizeMetadata.description"),
    keywords: t("resizeMetadata.keywords"),
    locale: locale,
    url: '/resizeimage'
  });
}

export default async function ResizeImageLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const messages = await getMessages();

  return (
    <NextIntlClientProvider messages={messages}>
      {children}
    </NextIntlClientProvider>
  );
}