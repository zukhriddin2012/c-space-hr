'use client';

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';

interface SidebarContextType {
  isCollapsed: boolean;
  toggleSidebar: () => void;
  setCollapsed: (collapsed: boolean) => void;
}

const SidebarContext = createContext<SidebarContextType | undefined>(undefined);

const STORAGE_KEY = 'sidebar-collapsed';

export function SidebarProvider({ children }: { children: ReactNode }) {
  const [isCollapsed, setIsCollapsed] = useState(false);

  // Load saved preference on mount
  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved !== null) {
      setIsCollapsed(saved === 'true');
    }
  }, []);

  const toggleSidebar = () => {
    setIsCollapsed(prev => {
      const newValue = !prev;
      localStorage.setItem(STORAGE_KEY, String(newValue));
      return newValue;
    });
  };

  const setCollapsed = (collapsed: boolean) => {
    setIsCollapsed(collapsed);
    localStorage.setItem(STORAGE_KEY, String(collapsed));
  };

  return (
    <SidebarContext.Provider value={{ isCollapsed, toggleSidebar, setCollapsed }}>
      {children}
    </SidebarContext.Provider>
  );
}

export function useSidebar() {
  const context = useContext(SidebarContext);
  if (context === undefined) {
    throw new Error('useSidebar must be used within a SidebarProvider');
  }
  return context;
}
