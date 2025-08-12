// Browser-compatible JWT implementation
const JWT_SECRET = process.env.NEXT_PUBLIC_JWT_SECRET || 'your-secret-key-change-in-production';
const JWT_EXPIRES_IN = 7 * 24 * 60 * 60 * 1000; // 7 days in milliseconds

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

// Demo credentials for easy testing
export const DEMO_CREDENTIALS = {
  email: 'demo@cinehunt.com',
  password: 'demo123',
  name: 'Demo User'
};

// Mock user database - in production, this would be a real database
const users: User[] = [
  // Pre-populate with demo user
  {
    id: 'demo-001',
    name: DEMO_CREDENTIALS.name,
    email: DEMO_CREDENTIALS.email,
    createdAt: new Date('2024-01-01'),
  }
];

// Simple JWT-like token generation (base64 encoded)
const generateToken = (user: User): string => {
  const payload = {
    id: user.id,
    email: user.email,
    name: user.name,
    exp: Date.now() + JWT_EXPIRES_IN,
    iat: Date.now()
  };
  
  // Encode payload as base64
  const encodedPayload = btoa(JSON.stringify(payload));
  const encodedSecret = btoa(JWT_SECRET);
  
  // Simple hash-like signature (not cryptographically secure, but sufficient for demo)
  const signature = btoa(encodedPayload + encodedSecret);
  
  const token = `${encodedPayload}.${signature}`;
  console.log('Generated token:', token);
  return token;
};

// Verify token
const verifyToken = (token: string): User | null => {
  try {
    console.log('Verifying token:', token);
    const [encodedPayload, signature] = token.split('.');
    
    if (!encodedPayload || !signature) {
      console.log('Invalid token format');
      return null;
    }
    
    // Decode payload
    const payload = JSON.parse(atob(encodedPayload));
    console.log('Token payload:', payload);
    
    // Check expiration
    if (payload.exp < Date.now()) {
      console.log('Token expired');
      return null;
    }
    
    // Verify signature (simple check for demo)
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

// Register new user
export const registerUser = async (name: string, email: string, password: string): Promise<AuthResponse> => {
  // Check if user already exists
  const existingUser = users.find(user => user.email === email);
  if (existingUser) {
    throw new Error('User with this email already exists');
  }

  // In production, hash the password here
  // const hashedPassword = await bcrypt.hash(password, 10);

  // Create new user
  const newUser: User = {
    id: Date.now().toString(),
    name,
    email,
    createdAt: new Date(),
  };

  // Add to mock database
  users.push(newUser);

  // Generate token
  const token = generateToken(newUser);

  return {
    user: newUser,
    token,
  };
};

// Login user
export const loginUser = async (email: string, password: string): Promise<AuthResponse> => {
  // Check for demo credentials first
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

  // Find user by email in existing users
  const user = users.find(u => u.email === email);
  if (!user) {
    throw new Error('Invalid email or password');
  }

  // In production, verify password hash here
  // const isValidPassword = await bcrypt.compare(password, user.password);
  // if (!isValidPassword) {
  //   throw new Error('Invalid email or password');
  // }

  // Generate token
  const token = generateToken(user);

  return {
    user,
    token,
  };
};

// Get user by token
export const getUserByToken = (token: string): User | null => {
  return verifyToken(token);
};

// Store token in localStorage
export const storeToken = (token: string): void => {
  if (typeof window !== 'undefined') {
    localStorage.setItem('cine_token', token);
  }
};

// Get token from localStorage
export const getToken = (): string | null => {
  if (typeof window !== 'undefined') {
    return localStorage.getItem('cine_token');
  }
  return null;
};

// Remove token from localStorage
export const removeToken = (): void => {
  if (typeof window !== 'undefined') {
    localStorage.removeItem('cine_token');
  }
};

// Store user data in localStorage
export const storeUser = (user: User): void => {
  if (typeof window !== 'undefined') {
    localStorage.setItem('cine_user', JSON.stringify(user));
  }
};

// Get user data from localStorage
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

// Remove user data from localStorage
export const removeUser = (): void => {
  if (typeof window !== 'undefined') {
    localStorage.removeItem('cine_user');
  }
};

// Store complete authentication state
export const storeAuthState = (user: User, token: string): void => {
  storeUser(user);
  storeToken(token);
};

// Clear complete authentication state
export const clearAuthState = (): void => {
  removeUser();
  removeToken();
};

// Check if user is authenticated
export const isAuthenticated = (): boolean => {
  const token = getToken();
  const user = getUser();
  
  if (!token || !user) return false;
  
  // Verify token is still valid
  const verifiedUser = verifyToken(token);
  return verifiedUser !== null;
};

// Get current user
export const getCurrentUser = (): User | null => {
  const token = getToken();
  if (!token) return null;
  
  // First try to get from localStorage
  const storedUser = getUser();
  if (storedUser) {
    // Verify token is still valid
    const verifiedUser = verifyToken(token);
    if (verifiedUser) {
      return storedUser;
    }
  }
  
  // If stored user is invalid, try to verify token
  const verifiedUser = verifyToken(token);
  if (verifiedUser) {
    // Update stored user data
    storeUser(verifiedUser);
    return verifiedUser;
  }
  
  // Clear invalid auth state
  clearAuthState();
  return null;
};
