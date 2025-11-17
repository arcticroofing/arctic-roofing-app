import { supabase } from '@/lib/supabase';

export interface Homeowner {
  id: string;
  email: string;
  name: string;
  projectId: string;
}

export const loginHomeowner = async (email: string, password: string): Promise<Homeowner | null> => {
  try {
    console.log('🔐 Attempting homeowner login:', email);

    // Query homeowners table with password_hash
    const { data, error } = await supabase
      .from('homeowners')
      .select('*')
      .eq('email', email.toLowerCase())
      .eq('password_hash', password)
      .single();

    if (error || !data) {
      console.error('❌ Login failed:', error?.message);
      return null;
    }

    const homeowner: Homeowner = {
      id: data.id,
      email: data.email,
      name: data.name,
      projectId: data.project_id,
    };

    console.log('✅ Homeowner authenticated:', homeowner.name);
    return homeowner;
  } catch (error) {
    console.error('❌ Login error:', error);
    return null;
  }
};

export const createHomeownerAccount = async (
  name: string,
  email: string,
  projectId: string
): Promise<{ homeowner: Homeowner; temporaryPassword: string }> => {
  // Generate a secure temporary password
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
    console.error('❌ Error creating homeowner account:', error);
    throw error;
  }

  const homeowner: Homeowner = {
    id: data.id,
    email: data.email,
    name: data.name,
    projectId: data.project_id,
  };

  console.log('✅ Homeowner account created');
  console.log('📧 Email:', homeowner.email);
  console.log('🔑 Temporary Password:', temporaryPassword);

  return { homeowner, temporaryPassword };
};

export const getCurrentHomeowner = (): Homeowner | null => {
  const stored = localStorage.getItem('currentHomeowner');
  const expiry = localStorage.getItem('homeownerExpiry');

  if (!stored || !expiry) return null;

  // Check if session expired
  const expiryTime = parseInt(expiry);
  const now = Date.now();

  if (now > expiryTime) {
    console.log('⏰ Homeowner session expired');
    localStorage.removeItem('currentHomeowner');
    localStorage.removeItem('homeownerExpiry');
    return null;
  }

  return JSON.parse(stored);
};

export const setCurrentHomeowner = (homeowner: Homeowner): void => {
  localStorage.setItem('currentHomeowner', JSON.stringify(homeowner));

  // Set expiry to 90 days from now
  const expiryTime = Date.now() + (90 * 24 * 60 * 60 * 1000);
  localStorage.setItem('homeownerExpiry', expiryTime.toString());

  console.log('✅ Homeowner session saved (expires in 90 days)');
};

export const logoutHomeowner = (): void => {
  localStorage.removeItem('currentHomeowner');
  localStorage.removeItem('homeownerExpiry');
  console.log('👋 Homeowner logged out');
};