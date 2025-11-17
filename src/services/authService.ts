import { supabase } from '@/lib/supabase';

export interface Manager {
  id: string;
  name: string;
  email: string;
}

export interface Homeowner {
  id: string;
  name: string;
  email: string;
  projectId: string;
}

export const loginManager = async (
  email: string,
  password: string
): Promise<Manager | null> => {
  console.log('🔍 Attempting manager login for:', email);
  
  const { data, error } = await supabase
    .from('managers')
    .select('*')
    .eq('email', email)
    .eq('password', password)
    .single();

  if (error || !data) {
    console.error('❌ Manager login failed:', error);
    return null;
  }

  const manager: Manager = {
    id: data.id,
    name: data.name,
    email: data.email,
  };

  console.log('✅ Manager login successful:', manager);
  localStorage.setItem('currentManager', JSON.stringify(manager));
  return manager;
};

export const loginHomeowner = async (
  email: string,
  password: string
): Promise<Homeowner | null> => {
  console.log('🔍 Attempting homeowner login for:', email);
  
  const { data, error } = await supabase
    .from('homeowners')
    .select('*')
    .eq('email', email)
    .eq('password', password)
    .single();

  if (error || !data) {
    console.error('❌ Homeowner login failed:', error);
    return null;
  }

  const homeowner: Homeowner = {
    id: data.id,
    name: data.name,
    email: data.email,
    projectId: data.project_id,
  };

  console.log('✅ Homeowner login successful:', homeowner);
  console.log('📋 Project ID from database:', data.project_id);
  console.log('📋 Project ID in object:', homeowner.projectId);

  if (!homeowner.projectId) {
    console.error('❌ WARNING: Homeowner has no project_id in database!');
  }

  localStorage.setItem('currentHomeowner', JSON.stringify(homeowner));
  return homeowner;
};

export const logoutManager = () => {
  console.log('👋 Logging out manager');
  localStorage.removeItem('currentManager');
};

export const logoutHomeowner = () => {
  console.log('👋 Logging out homeowner');
  localStorage.removeItem('currentHomeowner');
};

export const createHomeownerAccount = async (
  name: string,
  email: string,
  projectId: string
): Promise<{ homeowner: Homeowner; temporaryPassword: string }> => {
  console.log('🆕 Creating homeowner account:', { name, email, projectId });
  
  const temporaryPassword = Math.random().toString(36).slice(-8);

  const { data, error } = await supabase
    .from('homeowners')
    .insert([
      {
        name,
        email,
        password: temporaryPassword,
        project_id: projectId,
      },
    ])
    .select()
    .single();

  if (error) {
    console.error('❌ Error creating homeowner account:', error);
    throw error;
  }

  console.log('✅ Homeowner account created:', data);

  return {
    homeowner: {
      id: data.id,
      name: data.name,
      email: data.email,
      projectId: data.project_id,
    },
    temporaryPassword,
  };
};