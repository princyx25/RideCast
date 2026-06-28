import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

type ThemeMode = 'dark' | 'light' | 'midnight' | 'system';
type AccentColor = 'blue-purple' | 'green-teal' | 'orange-red' | 'pink-purple';

interface ThemeContextType {
  theme: ThemeMode;
  setTheme: (theme: ThemeMode) => void;
  accent: AccentColor;
  setAccent: (accent: AccentColor) => void;
  resolvedTheme: Exclude<ThemeMode, 'system'>;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

const getSystemTheme = (): Exclude<ThemeMode, 'system'> => {
  if (typeof window !== 'undefined') {
    return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
  }
  return 'dark';
};

export const ThemeProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [theme, setTheme] = useState<ThemeMode>(() => {
    const saved = localStorage.getItem('ridecast_theme');
    return (saved as ThemeMode) || 'dark';
  });

  const [accent, setAccent] = useState<AccentColor>(() => {
    const saved = localStorage.getItem('ridecast_accent');
    return (saved as AccentColor) || 'blue-purple';
  });

  const [resolvedTheme, setResolvedTheme] = useState<Exclude<ThemeMode, 'system'>>(getSystemTheme());

  // Handle system theme changes and apply actual theme
  useEffect(() => {
    const updateResolvedTheme = () => {
      if (theme === 'system') {
        const newResolved = getSystemTheme();
        setResolvedTheme(newResolved);
        document.documentElement.setAttribute('data-theme', newResolved);
      } else {
        setResolvedTheme(theme);
        document.documentElement.setAttribute('data-theme', theme);
      }
    };

    updateResolvedTheme();

    // Listen for system theme changes
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    const handleMediaChange = () => {
      if (theme === 'system') {
        updateResolvedTheme();
      }
    };

    mediaQuery.addEventListener('change', handleMediaChange);
    return () => mediaQuery.removeEventListener('change', handleMediaChange);
  }, [theme]);

  // Save theme to local storage
  useEffect(() => {
    localStorage.setItem('ridecast_theme', theme);
  }, [theme]);

  // Save accent to local storage and apply
  useEffect(() => {
    localStorage.setItem('ridecast_accent', accent);
    document.documentElement.setAttribute('data-accent', accent);
  }, [accent]);

  return (
    <ThemeContext.Provider value={{ theme, setTheme, accent, setAccent, resolvedTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};
