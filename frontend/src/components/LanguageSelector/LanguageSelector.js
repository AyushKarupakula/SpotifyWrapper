import React from 'react';
import { useLanguage } from '../../context/LanguageContext';
import './LanguageSelector.css';

/**
 * A dropdown that allows the user to select the language of the app.
 * 
 * The component will automatically update the language context when the user
 * selects a different option.
 * 
 * @returns {JSX.Element} A <div> element containing a <select> element with
 * the available languages.
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