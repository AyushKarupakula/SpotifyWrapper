import React from 'react';
import { useLanguage } from '../../context/LanguageContext';
import './LanguageSelector.css';

/**
 * A dropdown menu to select a language for the app.
 *
 * The language selected is stored in the LanguageContext, which can be
 * accessed with the useLanguage hook. The component will update
 * automatically when the language is changed.
 *
 * @returns {JSX.Element} A select element with options for English, Spanish, and French.
 */
export const LanguageSelector = () => {
  const { language, setLanguage } = useLanguage();

  return (
    <div className="language-selector">
      <select 
        value={language} 
        onChange={(e) => setLanguage(e.target.value)}
        className="language-select"
      >
        <option value="en">English</option>
        <option value="es">Español</option>
        <option value="fr">Français</option>
      </select>
    </div>
  );
}; 