import React, { createContext, useState, useContext, useEffect } from "react";

const ThemeContext = createContext();

/**
 * ThemeProvider component that wraps the application in a ThemeContext.Provider
 * component. It initializes the theme state as "dark" and provides a function
 * to toggle the theme. The theme is stored in the document.documentElement as
 * the "data-theme" attribute.
 *
 * The children prop is expected to be the root of the application.
 *
 * @prop {React.ReactNode} children
 * @returns {React.ReactElement} ThemeContext.Provider
 */
export const ThemeProvider = ({ children }) => {
  const [theme, setTheme] = useState("dark"); // default theme

/**
 * Toggles the current theme between "light" and "dark".
 * Updates the theme state to the opposite value of the current theme.
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