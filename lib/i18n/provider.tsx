"use client";

import { NextIntlClientProvider } from 'next-intl';
import { ReactNode, useCallback } from 'react';
import { baseLocale, getFallbackChain, type Locale } from './config';
import trMessages from '@/messages/tr.json';
import enMessages from '@/messages/en.json';
import deMessages from '@/messages/de.json';
import ptBRMessages from '@/messages/pt-BR.json';
import esMessages from '@/messages/es.json';
import zhCNMessages from '@/messages/zh-CN.json';
import jaMessages from '@/messages/ja.json';

type Messages = Record<string, unknown>;

const messagesMap: Record<string, Messages> = {
  tr: trMessages,
  en: enMessages,
  de: deMessages,
  'pt-BR': ptBRMessages,
  es: esMessages,
  'zh-CN': zhCNMessages,
  ja: jaMessages,
};

function getNestedValue(obj: unknown, path: string): unknown {
  const keys = path.split('.');
  let current: unknown = obj;
  for (const key of keys) {
    if (current && typeof current === 'object' && key in current) {
      current = (current as Record<string, unknown>)[key];
    } else {
      return undefined;
    }
  }
  return current;
}

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

function mergeWithFallback(locale: string): Messages {
  const primary = messagesMap[locale] || {};
  const fallbackChain = getFallbackChain(locale);

  if (fallbackChain.length === 0) {
    return primary as Messages;
  }

  const fallbackMessages = fallbackChain
    .map(code => messagesMap[code])
    .filter(Boolean);

  if (fallbackMessages.length === 0) {
    return primary as Messages;
  }

  const baseFallback = messagesMap[baseLocale] || {};
  return deepMerge(baseFallback, ...fallbackMessages.reverse(), primary) as Messages;
}

interface I18nProviderProps {
  children: ReactNode;
  initialLocale: Locale;
}

export function I18nProvider({ children, initialLocale }: I18nProviderProps) {
  const locale = initialLocale;
  const messages = mergeWithFallback(locale);

  const handleError = useCallback((error: { code: string; key?: string }) => {
    if (error.code === 'MISSING_MESSAGE' && error.key) {
      const fallbackChain = [baseLocale, ...getFallbackChain(locale)];
      for (const fallbackLocale of fallbackChain) {
        const fallbackMessages = messagesMap[fallbackLocale];
        if (fallbackMessages) {
          const value = getNestedValue(fallbackMessages, error.key);
          if (value !== undefined) {
            return;
          }
        }
      }
      console.warn(`[i18n] Missing translation: ${error.key}`);
    }
  }, [locale]);

  const getMessageFallback = useCallback(({ key, namespace }: { key: string; namespace?: string }) => {
    const fullKey = namespace ? `${namespace}.${key}` : key;
    const fallbackChain = [baseLocale, ...getFallbackChain(locale)];

    for (const fallbackLocale of fallbackChain) {
      const fallbackMessages = messagesMap[fallbackLocale];
      if (fallbackMessages) {
        const value = getNestedValue(fallbackMessages, fullKey);
        if (typeof value === 'string') {
          return value;
        }
      }
    }

    return fullKey;
  }, [locale]);

  return (
    <NextIntlClientProvider
      locale={locale}
      messages={messages}
      timeZone="Europe/Istanbul"
      onError={handleError}
      getMessageFallback={getMessageFallback}
    >
      {children}
    </NextIntlClientProvider>
  );
}
