import React, { createContext, useContext, useState, useEffect } from 'react';
import { 
  loginManager as loginManagerService, 
  loginHomeowner as loginHomeownerService, 
  logoutManager as logoutManagerService, 
  logoutHomeowner as logoutHomeownerService,
  type Manager, 
  type Homeowner 
} from '../services/authService';

interface AuthContextType {
  currentManager: Manager | null;
  currentHomeowner: Homeowner | null;
  isManagerAuthenticated: boolean;
  isHomeownerAuthenticated: boolean;
  loginManager: (email: string, password: string) => Promise<boolean>;
  loginHomeowner: (email: string, password: string) => Promise<boolean>;
  logoutManager: () => void;
  logoutHomeowner: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentManager, setCurrentManagerState] = useState<Manager | null>(null);
  const [currentHomeowner, setCurrentHomeownerState] = useState<Homeowner | null>(null);
  const [isManagerAuthenticated, setIsManagerAuthenticated] = useState(false);
  const [isHomeownerAuthenticated, setIsHomeownerAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // Restore session on mount
  useEffect(() => {
    const restoreSession = () => {
      try {
        // Check for manager session
        const storedManager = localStorage.getItem('currentManager');
        const managerExpiry = localStorage.getItem('managerExpiry');
        
        if (storedManager && managerExpiry) {
          const expiryTime = parseInt(managerExpiry);
          if (Date.now() < expiryTime) {
            const manager = JSON.parse(storedManager);
            setCurrentManagerState(manager);
            setIsManagerAuthenticated(true);
            console.log('Manager session restored');
          } else {
            // Session expired
            localStorage.removeItem('currentManager');
            localStorage.removeItem('managerExpiry');
            console.log('Manager session expired');
          }
        }

        // Check for homeowner session
        const storedHomeowner = localStorage.getItem('currentHomeowner');
        const homeownerExpiry = localStorage.getItem('homeownerExpiry');
        
        if (storedHomeowner && homeownerExpiry) {
          const expiryTime = parseInt(homeownerExpiry);
          if (Date.now() < expiryTime) {
            const homeowner = JSON.parse(storedHomeowner);
            setCurrentHomeownerState(homeowner);
            setIsHomeownerAuthenticated(true);
            console.log('Homeowner session restored');
          } else {
            // Session expired
            localStorage.removeItem('currentHomeowner');
            localStorage.removeItem('homeownerExpiry');
            console.log('Homeowner session expired');
          }
        }
      } catch (e) {
        console.error('Error restoring session:', e);
        localStorage.removeItem('currentManager');
        localStorage.removeItem('currentHomeowner');
        localStorage.removeItem('managerExpiry');
        localStorage.removeItem('homeownerExpiry');
      } finally {
        setIsLoading(false);
      }
    };

    restoreSession();
  }, []);

  const loginManager = async (email: string, password: string): Promise<boolean> => {
    const manager = await loginManagerService(email, password);
    if (manager) {
      setCurrentManagerState(manager);
      setIsManagerAuthenticated(true);
      
      // Set expiry to 30 days from now
      const expiryTime = Date.now() + (30 * 24 * 60 * 60 * 1000);
      localStorage.setItem('managerExpiry', expiryTime.toString());
      
      console.log('Manager logged in, session expires:', new Date(expiryTime));
      return true;
    }
    return false;
  };

  const loginHomeowner = async (email: string, password: string): Promise<boolean> => {
    const homeowner = await loginHomeownerService(email, password);
    if (homeowner) {
      setCurrentHomeownerState(homeowner);
      setIsHomeownerAuthenticated(true);
      
      // Set expiry to 90 days from now (homeowners need longer sessions)
      const expiryTime = Date.now() + (90 * 24 * 60 * 60 * 1000);
      localStorage.setItem('homeownerExpiry', expiryTime.toString());
      
      console.log('Homeowner logged in, session expires:', new Date(expiryTime));
      return true;
    }
    return false;
  };

  const logoutManager = () => {
    logoutManagerService();
    setCurrentManagerState(null);
    setIsManagerAuthenticated(false);
    localStorage.removeItem('managerExpiry');
    console.log('Manager logged out');
  };

  const logoutHomeowner = () => {
    logoutHomeownerService();
    setCurrentHomeownerState(null);
    setIsHomeownerAuthenticated(false);
    localStorage.removeItem('homeownerExpiry');
    console.log('Homeowner logged out');
  };

  // Show loading state while checking session
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
    <AuthContext.Provider
      value={{
        currentManager,
        currentHomeowner,
        isManagerAuthenticated,
        isHomeownerAuthenticated,
        loginManager,
        loginHomeowner,
        logoutManager,
        logoutHomeowner,
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