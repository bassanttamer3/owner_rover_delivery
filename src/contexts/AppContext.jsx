import React, { createContext, useContext, useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';

const AppContext = createContext(undefined);

export const AppProvider = ({ children }) => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [selectedRover, setSelectedRover] = useState(null);
  const [isDarkMode, setIsDarkMode] = useState(false);
  const location = useLocation();

  // Collapse sidebar on main page by default
  useEffect(() => {
    if (location.pathname === '/') {
      setIsSidebarOpen(false);
    }
  }, [location.pathname]);

  // Apply dark mode class to document
  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [isDarkMode]);

  const toggleSidebar = () => setIsSidebarOpen(!isSidebarOpen);
  const toggleDarkMode = () => setIsDarkMode(!isDarkMode);

  return (
    <AppContext.Provider
      value={{
        isSidebarOpen,
        toggleSidebar,
        selectedRover,
        setSelectedRover,
        isDarkMode,
        toggleDarkMode,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};
