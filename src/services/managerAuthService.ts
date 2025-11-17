import { supabase } from '@/lib/supabase';

export interface Manager {
  id: string;
  email: string;
  name: string;
}

export const loginManager = async (email: string, password: string): Promise<Manager | null> => {
  try {
    const { data, error } = await supabase
      .from('managers')
      .select('*')
      .eq('email', email.toLowerCase())
      .eq('password_hash', password)
      .single();

    if (error || !data) {
      return null;
    }

    const manager: Manager = {
      id: data.id,
      email: data.email,
      name: data.name,
    };

    return manager;
  } catch (error) {
    return null;
  }
};

export const getCurrentManager = (): Manager | null => {
  try {
    const stored = localStorage.getItem('currentManager');
    const expiry = localStorage.getItem('managerExpiry');
    const version = localStorage.getItem('sessionVersion');

    if (!version || version !== '2.0') {
      localStorage.removeItem('currentManager');
      localStorage.removeItem('managerExpiry');
      localStorage.setItem('sessionVersion', '2.0');
      return null;
    }

    if (!stored || !expiry) return null;

    const expiryTime = parseInt(expiry);
    const now = Date.now();

    if (now > expiryTime) {
      localStorage.removeItem('currentManager');
      localStorage.removeItem('managerExpiry');
      return null;
    }

    // Force localStorage to persist on iOS
    if (typeof window !== 'undefined' && window.localStorage) {
      window.localStorage.setItem('_persist', 'true');
    }

    return JSON.parse(stored);
  } catch (error) {
    return null;
  }
};

export const setCurrentManager = (manager: Manager): void => {
  try {
    localStorage.setItem('currentManager', JSON.stringify(manager));
    localStorage.setItem('sessionVersion', '2.0');

    // 30 days expiry
    const expiryTime = Date.now() + (30 * 24 * 60 * 60 * 1000);
    localStorage.setItem('managerExpiry', expiryTime.toString());

    // iOS PWA persistence flag
    localStorage.setItem('_persist', 'true');
    
    // Force write to disk on iOS
    if (typeof window !== 'undefined' && window.localStorage) {
      window.localStorage.setItem('_lastWrite', Date.now().toString());
    }
  } catch (error) {
    console.error('Error saving session:', error);
  }
};

export const logoutManager = (): void => {
  localStorage.removeItem('currentManager');
  localStorage.removeItem('managerExpiry');
};