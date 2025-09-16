export interface ChangelogItem {
  type: 'feature' | 'fix' | 'improvement' | 'breaking';
  title: {
    zh: string;
    en: string;
    hi: string;
  };
  description?: {
    zh: string;
    en: string;
    hi: string;
  };
  icon: string;
  commits?: string[];
}

export interface ChangelogEntry {
  version: string;
  date: string;
  title: {
    zh: string;
    en: string;
    hi: string;
  };
  description: {
    zh: string;
    en: string;
    hi: string;
  };
  type: 'major' | 'minor' | 'patch' | 'fix';
  changes: ChangelogItem[];
}

export interface ChangelogData {
  entries: ChangelogEntry[];
}

export interface ChangelogTranslations {
  title: string;
  subtitle: string;
  backToApp: string;
  types: {
    major: string;
    minor: string;
    patch: string;
    fix: string;
  };
  changeTypes: {
    feature: string;
    fix: string;
    improvement: string;
    breaking: string;
  };
}

export type SupportedLocale = 'zh' | 'en' | 'hi';