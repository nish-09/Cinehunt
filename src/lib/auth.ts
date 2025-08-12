const JWT_SECRET = process.env.NEXT_PUBLIC_JWT_SECRET || 'your-secret-key-change-in-production';
const JWT_EXPIRES_IN = 7 * 24 * 60 * 60 * 1000;

export interface User {
  id: string;
  name: string;
  email: string;
  createdAt: Date;
}

export interface AuthResponse {
  user: User;
  token: string;
}

export const DEMO_CREDENTIALS = {
  email: 'demo@cinehunt.com',
  password: 'demo123',
  name: 'Demo User'
};

const users: User[] = [
  {
    id: 'demo-001',
    name: DEMO_CREDENTIALS.name,
    email: DEMO_CREDENTIALS.email,
    createdAt: new Date('2024-01-01'),
  }
];

const generateToken = (user: User): string => {
  const payload = {
    id: user.id,
    email: user.email,
    name: user.name,
    exp: Date.now() + JWT_EXPIRES_IN,
    iat: Date.now()
  };
  
  const encodedPayload = btoa(JSON.stringify(payload));
  const encodedSecret = btoa(JWT_SECRET);
  
  const signature = btoa(encodedPayload + encodedSecret);
  
  const token = `${encodedPayload}.${signature}`;
  console.log('Generated token:', token);
  return token;
};

const verifyToken = (token: string): User | null => {
  try {
    console.log('Verifying token:', token);
    const [encodedPayload, signature] = token.split('.');
    
    if (!encodedPayload || !signature) {
      console.log('Invalid token format');
      return null;
    }
    
    const payload = JSON.parse(atob(encodedPayload));
    console.log('Token payload:', payload);
    
    if (payload.exp < Date.now()) {
      console.log('Token expired');
      return null;
    }
    
    const expectedSignature = btoa(encodedPayload + btoa(JWT_SECRET));
    if (signature !== expectedSignature) {
      console.log('Invalid signature');
      return null;
    }
    
    console.log('Token verified successfully');
    return {
      id: payload.id,
      name: payload.name,
      email: payload.email,
      createdAt: new Date(),
    };
  } catch (error) {
    console.error('Token verification error:', error);
    return null;
  }
};

export const registerUser = async (name: string, email: string, password: string): Promise<AuthResponse> => {
  const existingUser = users.find(user => user.email === email);
  if (existingUser) {
    throw new Error('User with this email already exists');
  }

  const newUser: User = {
    id: Date.now().toString(),
    name,
    email,
    createdAt: new Date(),
  };

  users.push(newUser);

  const token = generateToken(newUser);

  return {
    user: newUser,
    token,
  };
};

export const loginUser = async (email: string, password: string): Promise<AuthResponse> => {
  if (email === DEMO_CREDENTIALS.email && password === DEMO_CREDENTIALS.password) {
    const demoUser = users.find(u => u.email === DEMO_CREDENTIALS.email);
    if (demoUser) {
      const token = generateToken(demoUser);
      return {
        user: demoUser,
        token,
      };
    }
  }

  const user = users.find(u => u.email === email);
  if (!user) {
    throw new Error('Invalid email or password');
  }

  const token = generateToken(user);

  return {
    user,
    token,
  };
};

export const getUserByToken = (token: string): User | null => {
  return verifyToken(token);
};

export const storeToken = (token: string): void => {
  if (typeof window !== 'undefined') {
    localStorage.setItem('cine_token', token);
  }
};

export const getToken = (): string | null => {
  if (typeof window !== 'undefined') {
    return localStorage.getItem('cine_token');
  }
  return null;
};

export const removeToken = (): void => {
  if (typeof window !== 'undefined') {
    localStorage.removeItem('cine_token');
  }
};

export const storeUser = (user: User): void => {
  if (typeof window !== 'undefined') {
    localStorage.setItem('cine_user', JSON.stringify(user));
  }
};

export const getUser = (): User | null => {
  if (typeof window !== 'undefined') {
    const userData = localStorage.getItem('cine_user');
    if (userData) {
      try {
        return JSON.parse(userData);
      } catch (error) {
        console.error('Error parsing user data:', error);
        localStorage.removeItem('cine_user');
        return null;
      }
    }
  }
  return null;
};

export const removeUser = (): void => {
  if (typeof window !== 'undefined') {
    localStorage.removeItem('cine_user');
  }
};

export const storeAuthState = (user: User, token: string): void => {
  storeUser(user);
  storeToken(token);
};

export const clearAuthState = (): void => {
  removeUser();
  removeToken();
};

export const isAuthenticated = (): boolean => {
  const token = getToken();
  const user = getUser();
  
  if (!token || !user) return false;
  
  const verifiedUser = verifyToken(token);
  return verifiedUser !== null;
};

export const getCurrentUser = (): User | null => {
  const token = getToken();
  if (!token) return null;
  
  const storedUser = getUser();
  if (storedUser) {
    const verifiedUser = verifyToken(token);
    if (verifiedUser) {
      return storedUser;
    }
  }
  
  const verifiedUser = verifyToken(token);
  if (verifiedUser) {
    storeUser(verifiedUser);
    return verifiedUser;
  }
  
  clearAuthState();
  return null;
};
