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

  useEffect(() => {
    const restoreSession = () => {
      console.log('🔄 Restoring session...');
      
      try {
        const storedManager = localStorage.getItem('currentManager');
        const managerExpiry = localStorage.getItem('managerExpiry');
        
        if (storedManager && managerExpiry) {
          const expiryTime = parseInt(managerExpiry);
          if (Date.now() < expiryTime) {
            const manager = JSON.parse(storedManager);
            console.log('✅ Manager session restored:', manager);
            setCurrentManagerState(manager);
            setIsManagerAuthenticated(true);
          } else {
            console.log('⏰ Manager session expired');
            localStorage.removeItem('currentManager');
            localStorage.removeItem('managerExpiry');
          }
        }

        const storedHomeowner = localStorage.getItem('currentHomeowner');
        const homeownerExpiry = localStorage.getItem('homeownerExpiry');
        
        if (storedHomeowner && homeownerExpiry) {
          const expiryTime = parseInt(homeownerExpiry);
          if (Date.now() < expiryTime) {
            const homeowner = JSON.parse(storedHomeowner);
            console.log('✅ Homeowner session restored:', homeowner);
            console.log('📋 Project ID:', homeowner.projectId);
            
            if (!homeowner.projectId) {
              console.error('❌ Homeowner missing projectId, clearing session');
              localStorage.removeItem('currentHomeowner');
              localStorage.removeItem('homeownerExpiry');
            } else {
              setCurrentHomeownerState(homeowner);
              setIsHomeownerAuthenticated(true);
            }
          } else {
            console.log('⏰ Homeowner session expired');
            localStorage.removeItem('currentHomeowner');
            localStorage.removeItem('homeownerExpiry');
          }
        }
      } catch (e) {
        console.error('❌ Error restoring session:', e);
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
    console.log('🔐 Manager login attempt:', email);
    const manager = await loginManagerService(email, password);
    if (manager) {
      setCurrentManagerState(manager);
      setIsManagerAuthenticated(true);
      
      const expiryTime = Date.now() + (30 * 24 * 60 * 60 * 1000);
      localStorage.setItem('managerExpiry', expiryTime.toString());
      
      console.log('✅ Manager logged in successfully');
      return true;
    }
    console.log('❌ Manager login failed');
    return false;
  };

  const loginHomeowner = async (email: string, password: string): Promise<boolean> => {
    console.log('🔐 Homeowner login attempt:', email);
    const homeowner = await loginHomeownerService(email, password);
    
    if (homeowner) {
      console.log('✅ Homeowner data received:', homeowner);
      console.log('📋 Project ID:', homeowner.projectId);
      
      if (!homeowner.projectId) {
        console.error('❌ Homeowner missing projectId!');
        return false;
      }
      
      setCurrentHomeownerState(homeowner);
      setIsHomeownerAuthenticated(true);
      
      const expiryTime = Date.now() + (90 * 24 * 60 * 60 * 1000);
      localStorage.setItem('homeownerExpiry', expiryTime.toString());
      
      console.log('✅ Homeowner logged in successfully');
      return true;
    }
    console.log('❌ Homeowner login failed');
    return false;
  };

  const logoutManager = () => {
    console.log('👋 Manager logging out');
    logoutManagerService();
    setCurrentManagerState(null);
    setIsManagerAuthenticated(false);
    localStorage.removeItem('managerExpiry');
  };

  const logoutHomeowner = () => {
    console.log('👋 Homeowner logging out');
    logoutHomeownerService();
    setCurrentHomeownerState(null);
    setIsHomeownerAuthenticated(false);
    localStorage.removeItem('homeownerExpiry');
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