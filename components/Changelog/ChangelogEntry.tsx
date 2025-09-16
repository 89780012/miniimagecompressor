import React from 'react';
import { CalendarDays, GitCommit } from 'lucide-react';
import { ChangelogEntry as ChangelogEntryType, SupportedLocale } from '@/types/changelog';
import { ChangelogItem } from './ChangelogItem';

interface ChangelogEntryProps {
  entry: ChangelogEntryType;
  locale: SupportedLocale;
  isLatest?: boolean;
}

const getVersionColor = (type: ChangelogEntryType['type']) => {
  switch (type) {
    case 'major':
      return 'bg-gradient-to-r from-purple-500 to-pink-500 text-white';
    case 'minor':
      return 'bg-gradient-to-r from-blue-500 to-cyan-500 text-white';
    case 'patch':
      return 'bg-gradient-to-r from-green-500 to-emerald-500 text-white';
    case 'fix':
      return 'bg-gradient-to-r from-orange-500 to-red-500 text-white';
    default:
      return 'bg-gradient-to-r from-gray-500 to-gray-600 text-white';
  }
};

const getVersionTypeText = (type: ChangelogEntryType['type'], locale: SupportedLocale) => {
  const translations = {
    zh: {
      major: "重大版本",
      minor: "功能版本",
      patch: "修复版本",
      fix: "问题修复"
    },
    en: {
      major: "Major Version",
      minor: "Feature Version",
      patch: "Fix Version",
      fix: "Bug Fix"
    },
    hi: {
      major: "मेजर वर्जन",
      minor: "फीचर वर्जन",
      patch: "फिक्स वर्जन",
      fix: "बग फिक्स"
    }
  };

  return translations[locale][type];
};

export function ChangelogEntry({ entry, locale, isLatest = false }: ChangelogEntryProps) {
  const versionColorClass = getVersionColor(entry.type);
  const formattedDate = new Date(entry.date).toLocaleDateString(locale === 'zh' ? 'zh-CN' : locale === 'hi' ? 'hi-IN' : 'en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });

  return (
    <div className="relative">
      {/* Timeline line */}
      <div className="absolute left-6 top-16 bottom-0 w-0.5 bg-gradient-to-b from-gray-300 to-transparent"></div>

      {/* Timeline dot */}
      <div className="absolute left-4 top-8 w-4 h-4 rounded-full bg-white border-2 border-gray-300 shadow-sm"></div>

      {/* Content */}
      <div className="ml-16 pb-12">
        {/* Header */}
        <div className="mb-6">
          <div className="flex items-center justify-between mb-3">
            <h3 className={`inline-flex items-center px-4 py-2 rounded-full text-lg font-semibold ${versionColorClass} shadow-lg`}>
              <GitCommit className="w-5 h-5 mr-2" />
              {entry.version}
              {isLatest && (
                <span className="ml-2 px-2 py-0.5 bg-white/20 rounded-full text-xs">
                  Latest
                </span>
              )}
            </h3>
            <div className="flex items-center text-sm text-gray-500">
              <CalendarDays className="w-4 h-4 mr-1" />
              <time dateTime={entry.date}>{formattedDate}</time>
            </div>
          </div>

          <div className="space-y-2">
            <h4 className="text-xl font-bold text-gray-900">
              {entry.title[locale]}
            </h4>
            <p className="text-gray-600">
              {entry.description[locale]}
            </p>
            <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium border ${getVersionColor(entry.type).replace('bg-gradient-to-r', 'border').replace('text-white', 'text-gray-700')} bg-opacity-10`}>
              {getVersionTypeText(entry.type, locale)}
            </span>
          </div>
        </div>

        {/* Changes */}
        <div className="space-y-3">
          {entry.changes.map((change, index) => (
            <ChangelogItem key={index} item={change} locale={locale} />
          ))}
        </div>
      </div>
    </div>
  );
}