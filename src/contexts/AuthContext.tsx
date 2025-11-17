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
  const [currentHomeowner, setCurrentHomeownerState] = useState<Homeowner | null>(null);
  const [currentManager, setCurrentManagerState] = useState<Manager | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const homeowner = getCurrentHomeowner();
    if (homeowner) {
      setCurrentHomeownerState(homeowner);
    }

    const manager = getCurrentManager();
    if (manager) {
      setCurrentManagerState(manager);
    }
    
    setIsLoading(false);
  }, []);

  const loginHomeowner = async (email: string, password: string): Promise<boolean> => {
    const homeowner = await loginHomeownerService(email, password);
    
    if (homeowner) {
      setCurrentHomeowner(homeowner);
      setCurrentHomeownerState(homeowner);
      return true;
    }
    
    return false;
  };

  const loginManager = async (email: string, password: string): Promise<boolean> => {
    const manager = await loginManagerService(email, password);
    
    if (manager) {
      setCurrentManager(manager);
      setCurrentManagerState(manager);
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