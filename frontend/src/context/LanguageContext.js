import React, { createContext, useState, useContext } from 'react';
import en from '../translations/en';
import es from '../translations/es';
import fr from '../translations/fr';

const translations = { en, es, fr };

const LanguageContext = createContext();

/**
 * Provides the language context to the app.
 *
 * The language context consists of the current language code, a function to
 * set the language, and a function to translate a key to the current language.
 *
 * The translate function takes a key as a string and returns the translated
 * string, or the original key if no translation exists. A key may be a nested
 * key, e.g. 'welcome.title'.
 *
 * @param {{children: ReactNode}} props
 *   The children of the component.
 */
export const LanguageProvider = ({ children }) => {
  const [language, setLanguage] = useState('en');

  /**
   * Translate a key to the current language.
   *
   * @param {string} key
   *   The key to translate. May be a nested key, e.g. 'welcome.title'.
   * @return {string}
   *   The translated string, or the original key if no translation exists.
   */
  const t = (key) => {
    const keys = key.split('.');
    let translation = translations[language];
    
    for (const k of keys) {
      translation = translation[k];
      if (!translation) return key;
    }
    
    return translation;
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => useContext(LanguageContext); 