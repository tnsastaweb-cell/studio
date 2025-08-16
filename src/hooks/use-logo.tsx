
'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode, useCallback } from 'react';

interface LogoContextType {
  logo: string | null;
  setLogo: (logoDataUrl: string | null) => void;
}

const LogoContext = createContext<LogoContextType | undefined>(undefined);

const LOCAL_STORAGE_KEY = 'sasta-logo';

export const LogoProvider = ({ children }: { children: ReactNode }) => {
  const [logo, setLogoState] = useState<string | null>(null);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    // Load logo from localStorage on initial client-side render
    try {
      const storedLogo = localStorage.getItem(LOCAL_STORAGE_KEY);
      if (storedLogo) {
        setLogoState(storedLogo);
      }
    } catch (error) {
      console.error("Failed to load logo from localStorage", error);
    } finally {
        setIsLoaded(true);
    }
  }, []);

  const setLogo = useCallback((logoDataUrl: string | null) => {
    setLogoState(logoDataUrl);
    try {
      if (logoDataUrl) {
        localStorage.setItem(LOCAL_STORAGE_KEY, logoDataUrl);
      } else {
        localStorage.removeItem(LOCAL_STORAGE_KEY);
      }
    } catch (error) {
      console.error("Failed to save logo to localStorage", error);
    }
  }, []);
  
  if (!isLoaded) {
      return null;
  }

  return (
    <LogoContext.Provider value={{ logo, setLogo }}>
      {children}
    </LogoContext.Provider>
  );
};

export const useLogo = (): LogoContextType => {
  const context = useContext(LogoContext);
  if (context === undefined) {
    throw new Error('useLogo must be used within a LogoProvider');
  }
  return context;
};
