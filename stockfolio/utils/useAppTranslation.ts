/**
 * react-i18next 대체 — Zustand store 기반 번역
 * i18n.changeLanguage()의 동기 리렌더 폭주 문제를 해결
 */
import { useSettingsStore } from '../stores/useSettingsStore';
import en from '../i18n/en.json';
import ko from '../i18n/ko.json';

const translations: Record<string, Record<string, unknown>> = { en, ko };

function getNestedValue(obj: unknown, path: string): string {
  const keys = path.split('.');
  let result: unknown = obj;
  for (const key of keys) {
    if (result && typeof result === 'object' && key in result) {
      result = (result as Record<string, unknown>)[key];
    } else {
      return path;
    }
  }
  return typeof result === 'string' ? result : path;
}

export function useAppTranslation() {
  const language = useSettingsStore((s) => s.language);
  const t = (key: string): string => getNestedValue(translations[language], key);
  return { t, language };
}
