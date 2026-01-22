export type { Language, Translations } from './types';
export { en } from './en';
export { ru } from './ru';

import { en } from './en';
import { ru } from './ru';
import type { Language, Translations } from './types';

export const translations: Record<Language, Translations> = {
  en,
  ru,
};

export const languages: { code: Language; name: string; nativeName: string }[] = [
  { code: 'en', name: 'English', nativeName: 'English' },
  { code: 'ru', name: 'Russian', nativeName: 'Русский' },
];

export const defaultLanguage: Language = 'en';
