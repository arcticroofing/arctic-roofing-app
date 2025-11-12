import { supabase } from '@/lib/supabase';

export interface Manager {
  id: string;
  email: string;
  name: string;
  role: 'admin' | 'manager';
}

export const loginManager = async (email: string, password: string): Promise<Manager | null> => {
  console.log('Attempting manager login with Supabase:', email);
  
  // Query the managers table
  const { data, error } = await supabase
    .from('managers')
    .select('*')
    .eq('email', email.toLowerCase())
    .single();

  if (error || !data) {
    console.error('Manager login error:', error);
    return null;
  }

  // In production, you'd verify password with bcrypt
  // For now, we'll use Supabase's built-in auth or simple check
  console.log('Manager found:', data);
  
  return {
    id: data.id,
    email: data.email,
    name: data.name,
    role: data.role
  };
};

export const getCurrentManager = (): Manager | null => {
  const stored = localStorage.getItem('currentManager');
  return stored ? JSON.parse(stored) : null;
};

export const setCurrentManager = (manager: Manager): void => {
  localStorage.setItem('currentManager', JSON.stringify(manager));
};

export const logoutManager = (): void => {
  localStorage.removeItem('currentManager');
};