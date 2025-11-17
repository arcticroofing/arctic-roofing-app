import { supabase } from '@/lib/supabase';

export interface Manager {
  id: string;
  email: string;
  name: string;
}

export const loginManager = async (email: string, password: string): Promise<Manager | null> => {
  try {
    console.log('🔐 Attempting manager login:', email);

    // Query managers table with password_hash
    const { data, error } = await supabase
      .from('managers')
      .select('*')
      .eq('email', email.toLowerCase())
      .eq('password_hash', password)
      .single();

    if (error || !data) {
      console.error('❌ Login failed:', error?.message);
      return null;
    }

    const manager: Manager = {
      id: data.id,
      email: data.email,
      name: data.name,
    };

    console.log('✅ Manager authenticated:', manager.name);
    return manager;
  } catch (error) {
    console.error('❌ Login error:', error);
    return null;
  }
};

export const getCurrentManager = (): Manager | null => {
  const stored = localStorage.getItem('currentManager');
  const expiry = localStorage.getItem('managerExpiry');
  const version = localStorage.getItem('sessionVersion');
  
  // Clear old sessions (before Supabase migration)
  if (!version || version !== '2.0') {
    console.log('🧹 Clearing old session format');
    localStorage.removeItem('currentManager');
    localStorage.removeItem('managerExpiry');
    localStorage.setItem('sessionVersion', '2.0');
    return null;
  }
  
  if (!stored || !expiry) return null;
  
  // Check if session expired
  const expiryTime = parseInt(expiry);
  const now = Date.now();
  
  if (now > expiryTime) {
    console.log('⏰ Manager session expired');
    localStorage.removeItem('currentManager');
    localStorage.removeItem('managerExpiry');
    return null;
  }
  
  return JSON.parse(stored);
};

export const setCurrentManager = (manager: Manager): void => {
  localStorage.setItem('currentManager', JSON.stringify(manager));
  localStorage.setItem('sessionVersion', '2.0');
  
  // Set expiry to 30 days from now
  const expiryTime = Date.now() + (30 * 24 * 60 * 60 * 1000);
  localStorage.setItem('managerExpiry', expiryTime.toString());
  
  console.log('✅ Manager session saved (expires in 30 days)');
};
export const setCurrentManager = (manager: Manager): void => {
  localStorage.setItem('currentManager', JSON.stringify(manager));

  // Set expiry to 30 days from now
  const expiryTime = Date.now() + (30 * 24 * 60 * 60 * 1000);
  localStorage.setItem('managerExpiry', expiryTime.toString());

  console.log('✅ Manager session saved (expires in 30 days)');
};

export const logoutManager = (): void => {
  localStorage.removeItem('currentManager');
  localStorage.removeItem('managerExpiry');
  console.log('👋 Manager logged out');
};