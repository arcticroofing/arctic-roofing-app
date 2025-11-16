import React, { createContext, useContext, useState, useEffect } from 'react';
import { 
  loginManager, 
  loginHomeowner, 
  logoutManager, 
  logoutHomeowner,
  type Manager, 
  type Homeowner 
} from '../services/authService';

interface AuthContextType {
  currentManager: Manager | null;
  currentHomeowner: Homeowner | null;
  isManagerAuthenticated: boolean;
  isHomeownerAuthenticated: boolean;
  handleManagerLogin: (email: string, password: string) => Promise<boolean>;
  handleHomeownerLogin: (email: string, password: string) => Promise<boolean>;
  handleManagerLogout: () => void;
  handleHomeownerLogout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentManager, setCurrentManagerState] = useState<Manager | null>(null);
  const [currentHomeowner, setCurrentHomeownerState] = useState<Homeowner | null>(null);
  const [isManagerAuthenticated, setIsManagerAuthenticated] = useState(false);
  const [isHomeownerAuthenticated, setIsHomeownerAuthenticated] = useState(false);

  useEffect(() => {
    const storedManager = localStorage.getItem('currentManager');
    const storedHomeowner = localStorage.getItem('currentHomeowner');

    if (storedManager) {
      try {
        const manager = JSON.parse(storedManager);
        setCurrentManagerState(manager);
        setIsManagerAuthenticated(true);
      } catch (e) {
        console.error('Error parsing stored manager:', e);
        localStorage.removeItem('currentManager');
      }
    }

    if (storedHomeowner) {
      try {
        const homeowner = JSON.parse(storedHomeowner);
        setCurrentHomeownerState(homeowner);
        setIsHomeownerAuthenticated(true);
      } catch (e) {
        console.error('Error parsing stored homeowner:', e);
        localStorage.removeItem('currentHomeowner');
      }
    }
  }, []);

  const handleManagerLogin = async (email: string, password: string): Promise<boolean> => {
    const manager = await loginManager(email, password);
    if (manager) {
      setCurrentManagerState(manager);
      setIsManagerAuthenticated(true);
      return true;
    }
    return false;
  };

  const handleHomeownerLogin = async (email: string, password: string): Promise<boolean> => {
    const homeowner = await loginHomeowner(email, password);
    if (homeowner) {
      setCurrentHomeownerState(homeowner);
      setIsHomeownerAuthenticated(true);
      return true;
    }
    return false;
  };

  const handleManagerLogout = () => {
    logoutManager();
    setCurrentManagerState(null);
    setIsManagerAuthenticated(false);
  };

  const handleHomeownerLogout = () => {
    logoutHomeowner();
    setCurrentHomeownerState(null);
    setIsHomeownerAuthenticated(false);
  };

  return (
    <AuthContext.Provider
      value={{
        currentManager,
        currentHomeowner,
        isManagerAuthenticated,
        isHomeownerAuthenticated,
        handleManagerLogin,
        handleHomeownerLogin,
        handleManagerLogout,
        handleHomeownerLogout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};