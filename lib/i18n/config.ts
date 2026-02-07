export interface LanguageConfig {
  code: string;
  name: string;
  nativeName: string;
  isBase?: boolean;
  fallback?: string[];
}

export const languages: LanguageConfig[] = [
  { code: 'en', name: 'English', nativeName: 'English', isBase: true },
  { code: 'tr', name: 'Turkish', nativeName: 'Türkçe' },
  { code: 'de', name: 'German', nativeName: 'Deutsch' },
  { code: 'pt-BR', name: 'Portuguese (Brazil)', nativeName: 'Português (Brasil)', fallback: ['en'] },
  { code: 'es', name: 'Spanish', nativeName: 'Español' },
  { code: 'zh-CN', name: 'Chinese (Simplified)', nativeName: '简体中文', fallback: ['en'] },
  { code: 'ja', name: 'Japanese', nativeName: '日本語', fallback: ['en'] },
];

export const locales = languages.map(l => l.code) as [string, ...string[]];
export type Locale = (typeof locales)[number];

export const baseLocale = languages.find(l => l.isBase)?.code || 'en';
export const defaultLocale: Locale = 'en';

export function getFallbackChain(locale: string): string[] {
  const lang = languages.find(l => l.code === locale);
  if (!lang) return [baseLocale];

  if (lang.fallback && lang.fallback.length > 0) {
    return [...lang.fallback, baseLocale].filter((v, i, a) => a.indexOf(v) === i);
  }

  const baseLang = locale.split('-')[0];
  if (baseLang !== locale && locales.includes(baseLang)) {
    return [baseLang, baseLocale].filter((v, i, a) => a.indexOf(v) === i);
  }

  return lang.isBase ? [] : [baseLocale];
}

export function getLanguageByCode(code: string): LanguageConfig | undefined {
  return languages.find(l => l.code === code);
}
