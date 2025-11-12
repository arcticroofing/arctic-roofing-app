export interface Homeowner {
  id: string;
  email: string;
  password: string;
  name: string;
  projectId: string;
}

// In a real app, passwords would be hashed and stored securely
let homeowners: Homeowner[] = [
  {
    id: 'h1',
    email: 'mitchell@email.com',
    password: 'demo123',
    name: 'John & Sarah Mitchell',
    projectId: '1'
  },
  {
    id: 'h2',
    email: 'chen@email.com',
    password: 'demo123',
    name: 'Robert & Linda Chen',
    projectId: '2'
  }
];

export const loginHomeowner = async (email: string, password: string): Promise<Homeowner | null> => {
  return new Promise((resolve) => {
    setTimeout(() => {
      const homeowner = homeowners.find(
        h => h.email.toLowerCase() === email.toLowerCase() && h.password === password
      );
      resolve(homeowner || null);
    }, 500);
  });
};

export const createHomeownerAccount = async (
  name: string,
  email: string,
  projectId: string
): Promise<{ homeowner: Homeowner; temporaryPassword: string }> => {
  return new Promise((resolve) => {
    setTimeout(() => {
      // Generate a temporary password
      const temporaryPassword = `Arctic${Math.floor(1000 + Math.random() * 9000)}`;
      
      const newHomeowner: Homeowner = {
        id: `h_${Date.now()}`,
        email: email.toLowerCase(),
        password: temporaryPassword,
        name,
        projectId
      };
      
      homeowners.push(newHomeowner);
      
      console.log('New homeowner account created:', {
        email: newHomeowner.email,
        password: temporaryPassword
      });
      
      resolve({ homeowner: newHomeowner, temporaryPassword });
    }, 500);
  });
};

export const getCurrentHomeowner = (): Homeowner | null => {
  const stored = localStorage.getItem('currentHomeowner');
  return stored ? JSON.parse(stored) : null;
};

export const setCurrentHomeowner = (homeowner: Homeowner): void => {
  localStorage.setItem('currentHomeowner', JSON.stringify(homeowner));
};

export const logoutHomeowner = (): void => {
  localStorage.removeItem('currentHomeowner');
};