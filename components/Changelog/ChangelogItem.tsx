import React from 'react';
import { CalendarDays, Clock, Code, Zap, Bot, Search, Globe, Lock, Trash2, RefreshCw, Home, Languages, Crop, FolderOpen, History, Download, Cloud, Package, Eye, Settings } from 'lucide-react';
import { ChangelogItem as ChangelogItemType, SupportedLocale } from '@/types/changelog';

interface ChangelogItemProps {
  item: ChangelogItemType;
  locale: SupportedLocale;
}

// 优化：使用 Map 提高图标查找性能
const iconMap = new Map([
  ['Bot', Bot],
  ['Search', Search],
  ['Lock', Lock],
  ['Trash2', Trash2],
  ['Palette', RefreshCw], // 使用RefreshCw代替Palette
  ['RefreshCw', RefreshCw],
  ['Home', Home],
  ['Languages', Languages],
  ['Code', Code],
  ['Crop', Crop],
  ['FolderOpen', FolderOpen],
  ['History', History],
  ['Download', Download],
  ['Cloud', Cloud],
  ['Package', Package],
  ['Eye', Eye],
  ['Globe', Globe],
  ['CalendarDays', CalendarDays],
  ['Clock', Clock],
  ['Zap', Zap],
  ['Settings', Settings]
]);

const getChangeIcon = (type: ChangelogItemType['type']) => {
  switch (type) {
    case 'feature':
      return Zap;
    case 'fix':
      return Code;
    case 'improvement':
      return RefreshCw;
    case 'breaking':
      return CalendarDays;
    default:
      return Clock;
  }
};

const getChangeColor = (type: ChangelogItemType['type']) => {
  switch (type) {
    case 'feature':
      return 'bg-green-100 text-green-700 border-green-200';
    case 'fix':
      return 'bg-red-100 text-red-700 border-red-200';
    case 'improvement':
      return 'bg-blue-100 text-blue-700 border-blue-200';
    case 'breaking':
      return 'bg-orange-100 text-orange-700 border-orange-200';
    default:
      return 'bg-gray-100 text-gray-700 border-gray-200';
  }
};

const getChangeTypeText = (type: ChangelogItemType['type'], locale: SupportedLocale) => {
  const translations = {
    zh: {
      feature: "新功能",
      fix: "问题修复",
      improvement: "功能改进",
      breaking: "破坏性变更"
    },
    en: {
      feature: "New Feature",
      fix: "Bug Fix",
      improvement: "Feature Improvement",
      breaking: "Breaking Change"
    },
    hi: {
      feature: "नई सुविधा",
      fix: "बग फिक्स",
      improvement: "सुविधा सुधार",
      breaking: "ब्रेकिंग चेंज"
    }
  };

  return translations[locale][type];
};

export const ChangelogItem = React.memo(function ChangelogItem({ item, locale }: ChangelogItemProps) {
  const IconComponent = iconMap.get(item.icon) || getChangeIcon(item.type);
  const colorClass = getChangeColor(item.type);

  return (
    <div className="flex items-start space-x-3 p-4 bg-white rounded-lg border border-gray-100 hover:border-gray-200 transition-colors">
      <div className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center border ${colorClass}`}>
        <IconComponent className="w-4 h-4" />
      </div>
      <div className="flex-1 min-w-0">
        <h4 className="text-sm font-medium text-gray-900">
          {item.title[locale]}
        </h4>
        {item.description && (
          <p className="text-sm text-gray-600 mt-1">
            {item.description[locale]}
          </p>
        )}
        <div className="flex items-center mt-2 space-x-4">
          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${colorClass}`}>
            {getChangeTypeText(item.type, locale)}
          </span>
          {item.commits && item.commits.length > 0 && (
            <span className="text-xs text-gray-500">
              {item.commits.length} commit{item.commits.length > 1 ? 's' : ''}
            </span>
          )}
        </div>
      </div>
    </div>
  );
});