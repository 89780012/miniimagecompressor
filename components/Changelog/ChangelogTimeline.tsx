import React from 'react';
import { ArrowLeft, GitBranch, Clock, TrendingUp } from 'lucide-react';
import Link from 'next/link';
import { useLocale } from 'next-intl';
import { ChangelogData, SupportedLocale } from '@/types/changelog';
import { changelogTranslations } from '@/lib/changelog-data';
import { ChangelogEntry } from './ChangelogEntry';

interface ChangelogTimelineProps {
  data: ChangelogData;
}

export function ChangelogTimeline({ data }: ChangelogTimelineProps) {
  const locale = useLocale() as SupportedLocale;
  const t = changelogTranslations[locale];

  const totalEntries = data.entries.length;
  const totalChanges = data.entries.reduce((acc, entry) => acc + entry.changes.length, 0);

  const getStatsText = (locale: SupportedLocale) => {
    if (locale === 'zh') {
      return {
        versions: '个版本',
        updates: '项更新',
        ongoing: '持续更新中',
        endMessage: '项目开发历程完整记录'
      };
    } else if (locale === 'hi') {
      return {
        versions: 'वर्जन',
        updates: 'अपडेट',
        ongoing: 'निरंतर अपडेट',
        endMessage: 'परियोजना विकास इतिहास पूर्ण रिकॉर्ड'
      };
    } else {
      return {
        versions: 'versions',
        updates: 'updates',
        ongoing: 'Ongoing development',
        endMessage: 'Complete development history record'
      };
    }
  };

  const stats = getStatsText(locale);

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      {/* Header */}
      <div className="mb-12">
        <div className="flex items-center justify-between mb-6">
          <Link
            href={locale === 'en' ? '/' : `/${locale}`}
            className="inline-flex items-center text-gray-600 hover:text-gray-900 transition-colors"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            {t.backToApp}
          </Link>
        </div>

        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            {t.title}
          </h1>
          <p className="text-xl text-gray-600 mb-6">
            {t.subtitle}
          </p>

          {/* Stats */}
          <div className="flex items-center justify-center space-x-8 text-sm">
            <div className="flex items-center space-x-2">
              <GitBranch className="w-4 h-4 text-blue-500" />
              <span className="text-gray-600">
                {totalEntries} {stats.versions}
              </span>
            </div>
            <div className="flex items-center space-x-2">
              <TrendingUp className="w-4 h-4 text-green-500" />
              <span className="text-gray-600">
                {totalChanges} {stats.updates}
              </span>
            </div>
            <div className="flex items-center space-x-2">
              <Clock className="w-4 h-4 text-orange-500" />
              <span className="text-gray-600">
                {stats.ongoing}
              </span>
            </div>
          </div>
        </div>

        {/* Visual separator */}
        <div className="w-full h-px bg-gradient-to-r from-transparent via-gray-300 to-transparent"></div>
      </div>

      {/* Timeline */}
      <div className="relative">
        {data.entries.map((entry, index) => (
          <ChangelogEntry
            key={entry.version}
            entry={entry}
            locale={locale}
            isLatest={index === 0}
          />
        ))}

        {/* Timeline end */}
        <div className="relative">
          <div className="absolute left-4 w-4 h-4 rounded-full bg-gradient-to-r from-gray-400 to-gray-500 shadow-lg"></div>
          <div className="ml-16 py-8">
            <div className="bg-gradient-to-r from-gray-50 to-gray-100 rounded-lg p-6 border border-gray-200">
              <div className="flex items-center justify-center space-x-3 text-gray-600">
                <GitBranch className="w-5 h-5" />
                <span className="text-lg font-medium">{stats.endMessage}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}