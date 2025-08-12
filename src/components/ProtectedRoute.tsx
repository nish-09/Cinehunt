'use client'

import { ReactNode } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Login } from './Login';
import { LoadingSkeleton } from './LoadingSkeleton';

interface ProtectedRouteProps {
  children: ReactNode;
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children }) => {
  const { user, loading } = useAuth();

  if (loading) {
    return <LoadingSkeleton.PageLoader />;
  }

  if (!user) {
    return <Login />;
  }

  return <>{children}</>;
};
