import React, { createContext, useState, useContext } from 'react';
import en from '../translations/en';
import es from '../translations/es';
import fr from '../translations/fr';

const translations = { en, es, fr };

const LanguageContext = createContext();

/**
 * Provides the current language and a translate function to all its children.
 *
 * @param {{children: React.ReactNode}} props
 * @returns {React.ReactElement}
 */
export const LanguageProvider = ({ children }) => {
  const [language, setLanguage] = useState('en');

  /**
   * Translate a given key to the current language.
   *
   * If the key is not found, the key itself is returned.
   *
   * @param {string} key
   * @returns {string}
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