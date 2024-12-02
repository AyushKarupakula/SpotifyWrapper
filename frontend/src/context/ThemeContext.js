import React, { createContext, useState, useContext, useEffect } from "react";

const ThemeContext = createContext();

/**
 * Provides the theme context to its children. The theme can be toggled with the
 * `toggleTheme` function. The theme is stored in local storage and defaults to
 * "dark" if not present.
 *
 * @param {object} props
 * @param {React.ReactNode} props.children
 * @returns {React.ReactElement} The theme context provider
 */
export const ThemeProvider = ({ children }) => {
  const [theme, setTheme] = useState("dark"); // default theme

  /**
   * Toggles the theme between light and dark
   */
  const toggleTheme = () => {
    setTheme((prevTheme) => (prevTheme === "light" ? "dark" : "light"));
  };

  useEffect(() => {
    document.documentElement.setAttribute("data-theme", theme);
  }, [theme]);

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => useContext(ThemeContext);