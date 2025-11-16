import { supabase } from '@/lib/supabase';

export interface Manager {
  id: string;
  email: string;
  password: string;
  name: string;
  role: string;
}

export interface Homeowner {
  id: string;
  email: string;
  password: string;
  name: string;
  projectId: string;
}

// Manager Auth Functions
export const loginManager = async (email: string, password: string): Promise<Manager | null> => {
  console.log('Attempting manager login with Supabase:', email);
  
  const { data, error } = await supabase
    .from('managers')
    .select('*')
    .eq('email', email.toLowerCase())
    .single();

  if (error || !data) {
    console.error('Manager login error:', error);
    return null;
  }

  if (data.password_hash !== password) {
    console.error('Password mismatch');
    return null;
  }

  console.log('Manager found:', data);
  
  return {
    id: data.id,
    email: data.email,
    password: data.password_hash,
    name: data.name,
    role: data.role
  };
};

export const logoutManager = (): void => {
  console.log('Manager logged out');
  localStorage.removeItem('currentManager');
};

export const setCurrentManager = (manager: Manager): void => {
  localStorage.setItem('currentManager', JSON.stringify(manager));
};

export const getCurrentManager = async (managerId: string): Promise<Manager | null> => {
  console.log('Fetching current manager:', managerId);
  
  const { data, error } = await supabase
    .from('managers')
    .select('*')
    .eq('id', managerId)
    .single();

  if (error || !data) {
    console.error('Error fetching manager:', error);
    return null;
  }

  return {
    id: data.id,
    email: data.email,
    password: data.password_hash,
    name: data.name,
    role: data.role
  };
};

// Homeowner Auth Functions
export const loginHomeowner = async (email: string, password: string): Promise<Homeowner | null> => {
  console.log('🔐 Attempting homeowner login');
  console.log('📧 Email entered:', email);
  console.log('🔑 Password entered:', password);
  
  const { data, error } = await supabase
    .from('homeowners')
    .select('*')
    .eq('email', email.toLowerCase())
    .single();

  console.log('📊 Query result:', data);
  console.log('❌ Query error:', error);

  if (error || !data) {
    console.error('❌ Homeowner not found in database');
    return null;
  }

  console.log('✅ Homeowner found:', data.email);
  console.log('🔑 Stored password:', data.password_hash);
  console.log('🔑 Entered password:', password);
  console.log('🔍 Passwords match:', data.password_hash === password);

  if (data.password_hash !== password) {
    console.error('❌ Password mismatch!');
    return null;
  }

  console.log('✅ Login successful!');
  
  return {
    id: data.id,
    email: data.email,
    password: data.password_hash,
    name: data.name,
    projectId: data.project_id
  };
};

export const logoutHomeowner = (): void => {
  console.log('Homeowner logged out');
  localStorage.removeItem('currentHomeowner');
};

export const setCurrentHomeowner = (homeowner: Homeowner): void => {
  localStorage.setItem('currentHomeowner', JSON.stringify(homeowner));
};

export const getCurrentHomeowner = async (homeownerId: string): Promise<Homeowner | null> => {
  console.log('Fetching current homeowner:', homeownerId);
  
  const { data, error } = await supabase
    .from('homeowners')
    .select('*')
    .eq('id', homeownerId)
    .single();

  if (error || !data) {
    console.error('Error fetching homeowner:', error);
    return null;
  }

  return {
    id: data.id,
    email: data.email,
    password: data.password_hash,
    name: data.name,
    projectId: data.project_id
  };
};

// Account Creation
export const createHomeownerAccount = async (
  name: string,
  email: string,
  projectId: string
): Promise<{ homeowner: Homeowner; temporaryPassword: string }> => {
  const temporaryPassword = `Arctic${Math.floor(Math.random() * 10000)}`;
  
  console.log('🏠 Creating homeowner account...');
  console.log('📧 Email:', email);
  console.log('👤 Name:', name);
  console.log('🔑 Generated Password:', temporaryPassword);
  console.log('📋 Project ID:', projectId);
  
  const { data, error } = await supabase
    .from('homeowners')
    .insert([{
      email: email.toLowerCase(),
      password_hash: temporaryPassword,
      name: name,
      project_id: projectId
    }])
    .select()
    .single();

  if (error) {
    console.error('❌ Error creating homeowner:', error);
    throw error;
  }

  console.log('✅ Homeowner created successfully:', data);
  console.log('✅ Password saved to database:', data.password_hash);

  return {
    homeowner: {
      id: data.id,
      email: data.email,
      password: data.password_hash,
      name: data.name,
      projectId: data.project_id
    },
    temporaryPassword: data.password_hash
  };
};