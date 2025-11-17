export interface Manager {
  id: string;
  email: string;
  password: string;
  name: string;
}

// In a real app, passwords would be hashed and stored securely
let managers: Manager[] = [
  {
    id: 'm1',
    email: 'noah@arcticroofing.org',
    password: 'arctic2024',
    name: 'Noah Johnson'
  }
];

export const loginManager = async (email: string, password: string): Promise<Manager | null> => {
  return new Promise((resolve) => {
    setTimeout(() => {
      const manager = managers.find(
        m => m.email.toLowerCase() === email.toLowerCase() && m.password === password
      );
      resolve(manager || null);
    }, 500);
  });
};

export const getCurrentManager = (): Manager | null => {
  const stored = localStorage.getItem('currentManager');
  const expiry = localStorage.getItem('managerExpiry');
  
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
  
  // Set expiry to 30 days from now
  const expiryTime = Date.now() + (30 * 24 * 60 * 60 * 1000);
  localStorage.setItem('managerExpiry', expiryTime.toString());
  
  console.log('✅ Manager session saved (expires in 30 days)');
};

export const logoutManager = (): void => {
  localStorage.removeItem('currentManager');
  localStorage.removeItem('managerExpiry');
};