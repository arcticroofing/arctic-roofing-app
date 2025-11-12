import React, { createContext, useContext, useState, useEffect } from 'react';
import { Homeowner, getCurrentHomeowner, setCurrentHomeowner, logoutHomeowner } from '../services/authService';
import { Manager, getCurrentManager, setCurrentManager, logoutManager } from '../services/managerAuthService';

interface AuthContextType {
  currentHomeowner: Homeowner | null;
  currentManager: Manager | null;
  loginHomeowner: (homeowner: Homeowner) => void;
  loginManager: (manager: Manager) => void;
  logoutHomeowner: () => void;
  logoutManager: () => void;
  isHomeownerAuthenticated: boolean;
  isManagerAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | null>(null);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentHomeowner, setCurrentHomeownerState] = useState<Homeowner | null>(null);
  const [currentManager, setCurrentManagerState] = useState<Manager | null>(null);

  useEffect(() => {
    const homeowner = getCurrentHomeowner();
    if (homeowner) {
      setCurrentHomeownerState(homeowner);
    }

    const manager = getCurrentManager();
    if (manager) {
      setCurrentManagerState(manager);
    }
  }, []);

  const loginHomeownerHandler = (homeowner: Homeowner) => {
    setCurrentHomeowner(homeowner);
    setCurrentHomeownerState(homeowner);
  };

  const loginManagerHandler = (manager: Manager) => {
    setCurrentManager(manager);
    setCurrentManagerState(manager);
  };

  const logoutHomeownerHandler = () => {
    logoutHomeowner();
    setCurrentHomeownerState(null);
  };

  const logoutManagerHandler = () => {
    logoutManager();
    setCurrentManagerState(null);
  };

  return (
    <AuthContext.Provider value={{
      currentHomeowner,
      currentManager,
      loginHomeowner: loginHomeownerHandler,
      loginManager: loginManagerHandler,
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