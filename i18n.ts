import { getRequestConfig } from 'next-intl/server';
import { defaultLocale, baseLocale, getFallbackChain } from '@/lib/i18n/config';
import { createClient } from '@supabase/supabase-js';

type Messages = Record<string, unknown>;

const messagesMap: Record<string, () => Promise<Messages>> = {
  tr: () => import('@/messages/tr.json').then(m => m.default as Messages),
  en: () => import('@/messages/en.json').then(m => m.default as Messages),
  de: () => import('@/messages/de.json').then(m => m.default as Messages),
  'pt-BR': () => import('@/messages/pt-BR.json').then(m => m.default as Messages),
  es: () => import('@/messages/es.json').then(m => m.default as Messages),
  'zh-CN': () => import('@/messages/zh-CN.json').then(m => m.default as Messages),
  ja: () => import('@/messages/ja.json').then(m => m.default as Messages),
};

function deepMerge(...objects: unknown[]): unknown {
  const result: Record<string, unknown> = {};

  for (const obj of objects) {
    if (!obj || typeof obj !== 'object') continue;

    for (const key of Object.keys(obj as Record<string, unknown>)) {
      const value = (obj as Record<string, unknown>)[key];
      if (value && typeof value === 'object' && !Array.isArray(value)) {
        result[key] = deepMerge(result[key] || {}, value);
      } else if (value !== undefined) {
        result[key] = value;
      }
    }
  }

  return result;
}

async function mergeWithFallback(locale: string): Promise<Messages> {
  const primaryLoader = messagesMap[locale];
  const primary = primaryLoader ? await primaryLoader() : {};
  const fallbackChain = getFallbackChain(locale);

  if (fallbackChain.length === 0) {
    return primary as Messages;
  }

  const fallbackMessages: Messages[] = [];
  for (const code of fallbackChain) {
    const loader = messagesMap[code];
    if (loader) {
      fallbackMessages.push(await loader());
    }
  }

  if (fallbackMessages.length === 0) {
    return primary as Messages;
  }

  const baseLoader = messagesMap[baseLocale];
  const baseFallback = baseLoader ? await baseLoader() : {};
  return deepMerge(baseFallback, ...fallbackMessages.reverse(), primary) as Messages;
}

async function getLocaleFromDB(): Promise<string> {
  try {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

    if (!supabaseUrl || !supabaseKey) {
      return defaultLocale;
    }

    const supabase = createClient(supabaseUrl, supabaseKey);
    const { data } = await supabase
      .from('public_site_settings')
      .select('default_locale')
      .maybeSingle();

    if (data?.default_locale && messagesMap[data.default_locale]) {
      return data.default_locale;
    }
  } catch (error) {
    console.error('Failed to fetch locale from DB:', error);
  }

  return defaultLocale;
}

export default getRequestConfig(async () => {
  const locale = await getLocaleFromDB();
  const messages = await mergeWithFallback(locale);

  return {
    locale,
    messages,
    timeZone: 'Europe/Istanbul',
  };
});
