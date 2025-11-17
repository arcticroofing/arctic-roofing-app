import React, { createContext, useContext, useState, useEffect } from 'react';
import { 
  Homeowner, 
  getCurrentHomeowner, 
  setCurrentHomeowner, 
  logoutHomeowner,
  loginHomeowner as loginHomeownerService
} from '../services/authService';
import { 
  Manager, 
  getCurrentManager, 
  setCurrentManager, 
  logoutManager as logoutManagerService,
  loginManager as loginManagerService
} from '../services/managerAuthService';

interface AuthContextType {
  currentHomeowner: Homeowner | null;
  currentManager: Manager | null;
  loginHomeowner: (email: string, password: string) => Promise<boolean>;
  loginManager: (email: string, password: string) => Promise<boolean>;
  logoutHomeowner: () => void;
  logoutManager: () => void;
  isHomeownerAuthenticated: boolean;
  isManagerAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | null>(null);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentHomeowner, setCurrentHomeownerState] = useState<Homeowner | null>(() => {
    // Initialize from localStorage immediately
    return getCurrentHomeowner();
  });
  
  const [currentManager, setCurrentManagerState] = useState<Manager | null>(() => {
    // Initialize from localStorage immediately
    return getCurrentManager();
  });
  
  const [isLoading, setIsLoading] = useState(false);

  // Persist to localStorage whenever state changes
  useEffect(() => {
    if (currentHomeowner) {
      setCurrentHomeowner(currentHomeowner);
    }
  }, [currentHomeowner]);

  useEffect(() => {
    if (currentManager) {
      setCurrentManager(currentManager);
    }
  }, [currentManager]);

  // Keep checking localStorage every second (for PWA resume)
  useEffect(() => {
    const interval = setInterval(() => {
      if (!currentHomeowner) {
        const stored = getCurrentHomeowner();
        if (stored) {
          setCurrentHomeownerState(stored);
        }
      }
      
      if (!currentManager) {
        const stored = getCurrentManager();
        if (stored) {
          setCurrentManagerState(stored);
        }
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [currentHomeowner, currentManager]);

  const loginHomeowner = async (email: string, password: string): Promise<boolean> => {
    const homeowner = await loginHomeownerService(email, password);
    
    if (homeowner) {
      setCurrentHomeowner(homeowner);
      setCurrentHomeownerState(homeowner);
      
      // Force multiple writes to ensure persistence
      setTimeout(() => setCurrentHomeowner(homeowner), 100);
      setTimeout(() => setCurrentHomeowner(homeowner), 500);
      
      return true;
    }
    
    return false;
  };

  const loginManager = async (email: string, password: string): Promise<boolean> => {
    const manager = await loginManagerService(email, password);
    
    if (manager) {
      setCurrentManager(manager);
      setCurrentManagerState(manager);
      
      // Force multiple writes to ensure persistence
      setTimeout(() => setCurrentManager(manager), 100);
      setTimeout(() => setCurrentManager(manager), 500);
      
      return true;
    }
    
    return false;
  };

  const logoutHomeownerHandler = () => {
    logoutHomeowner();
    setCurrentHomeownerState(null);
  };

  const logoutManagerHandler = () => {
    logoutManagerService();
    setCurrentManagerState(null);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-black">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#96D7FE] mx-auto mb-4"></div>
          <p className="text-gray-400">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <AuthContext.Provider value={{
      currentHomeowner,
      currentManager,
      loginHomeowner,
      loginManager,
      logoutHomeowner: logoutHomeownerHandler,
      logoutManager: logoutManagerHandler,
      isHomeownerAuthenticated: !!currentHomeowner,
      isManagerAuthenticated: !!currentManager
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
};