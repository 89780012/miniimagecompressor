import React from 'react';
import { Metadata } from 'next';
import { changelogTranslations } from '@/lib/changelog-data';
import { SupportedLocale } from '@/types/changelog';
import { getLocale } from 'next-intl/server';

export async function generateMetadata(): Promise<Metadata> {
  const locale = await getLocale() as SupportedLocale;
  const t = changelogTranslations[locale];

  return {
    title: t.title,
    description: t.subtitle,
    keywords: '更新日志, changelog, 版本历史, 开发历程, image compressor, 图片压缩工具',
  };
}

export default function ChangelogLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}