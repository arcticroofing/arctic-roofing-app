import { supabase } from '@/lib/supabase';

export interface Homeowner {
  id: string;
  email: string;
  name: string;
  projectId: string;
}

export const loginHomeowner = async (email: string, password: string): Promise<Homeowner | null> => {
  try {
    const { data, error } = await supabase
      .from('homeowners')
      .select('*')
      .eq('email', email.toLowerCase())
      .eq('password_hash', password)
      .single();

    if (error || !data) {
      return null;
    }

    const homeowner: Homeowner = {
      id: data.id,
      email: data.email,
      name: data.name,
      projectId: data.project_id,
    };

    return homeowner;
  } catch (error) {
    return null;
  }
};

export const createHomeownerAccount = async (
  name: string,
  email: string,
  projectId: string
): Promise<{ homeowner: Homeowner; temporaryPassword: string }> => {
  const temporaryPassword = `Arctic${Math.floor(1000 + Math.random() * 9000)}`;

  const { data, error } = await supabase
    .from('homeowners')
    .insert([
      {
        name,
        email: email.toLowerCase(),
        password_hash: temporaryPassword,
        project_id: projectId,
      },
    ])
    .select()
    .single();

  if (error) {
    throw error;
  }

  const homeowner: Homeowner = {
    id: data.id,
    email: data.email,
    name: data.name,
    projectId: data.project_id,
  };

  return { homeowner, temporaryPassword };
};

// iOS PWA Compatible Storage
export const getCurrentHomeowner = (): Homeowner | null => {
  try {
    const stored = localStorage.getItem('currentHomeowner');
    const expiry = localStorage.getItem('homeownerExpiry');
    const version = localStorage.getItem('sessionVersion');

    if (!version || version !== '2.0') {
      localStorage.removeItem('currentHomeowner');
      localStorage.removeItem('homeownerExpiry');
      localStorage.setItem('sessionVersion', '2.0');
      return null;
    }

    if (!stored || !expiry) return null;

    const expiryTime = parseInt(expiry);
    const now = Date.now();

    if (now > expiryTime) {
      localStorage.removeItem('currentHomeowner');
      localStorage.removeItem('homeownerExpiry');
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

export const setCurrentHomeowner = (homeowner: Homeowner): void => {
  try {
    localStorage.setItem('currentHomeowner', JSON.stringify(homeowner));
    localStorage.setItem('sessionVersion', '2.0');

    // 90 days expiry
    const expiryTime = Date.now() + (90 * 24 * 60 * 60 * 1000);
    localStorage.setItem('homeownerExpiry', expiryTime.toString());

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

export const logoutHomeowner = (): void => {
  localStorage.removeItem('currentHomeowner');
  localStorage.removeItem('homeownerExpiry');
};