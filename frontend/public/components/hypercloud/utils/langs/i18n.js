import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

import en from './en.json';
import ko from './ko.json';

const options = {
  lookupLocalStorage: 'i18nextLng',
  caches: ['localStorage'],
  cookieMinutes: 7 * 24 * 60 * 60 * 1000,
};

const resource = {
  en: {
    COMMON: en.COMMON,
    SINGLE: en.SINGLE,
    MULTI: en.MULTI,
    SCHEMA: en.SCHEMA,
  },
  ko: {
    COMMON: ko.COMMON,
    SINGLE: ko.SINGLE,
    MULTI: ko.MULTI,
    SCHEMA: ko.SCHEMA,
  },
};

i18n
  .use(initReactI18next) // passes i18n down to react-i18next
  .init({
    lng: 'ko',
    //lng: window.localStorage.getItem('i18nextLng') || navigator.language || 'ko',
    debug: true,
    detection: options,
    resources: resource,
    keySeparator: false,
    interpolation: {
      escapeValue: false, // not needed for react as it escapes by default
    },
  });

export default i18n;
