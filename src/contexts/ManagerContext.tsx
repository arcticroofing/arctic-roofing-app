import React, { createContext, useContext, useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';

interface ManagerContextType {
  manager: any;
  loading: boolean;
  setManager: (manager: any) => void;
}

const ManagerContext = createContext<ManagerContextType>({
  manager: null,
  loading: true,
  setManager: () => {},
});

export const ManagerProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [manager, setManager] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadManager = async () => {
      try {
        // Check if there's a stored manager session
        const storedManager = localStorage.getItem('managerSession');
        if (storedManager) {
          const managerData = JSON.parse(storedManager);
          setManager(managerData);
        }
      } catch (error) {
        console.error('Error loading manager:', error);
      } finally {
        setLoading(false);
      }
    };
    loadManager();
  }, []);

  return (
    <ManagerContext.Provider value={{ manager, loading, setManager }}>
      {children}
    </ManagerContext.Provider>
  );
};

export const useManager = () => useContext(ManagerContext);