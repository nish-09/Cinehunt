'use client'

import { ProtectedRoute } from '@/components/ProtectedRoute';
import { Movies } from '@/components/Movies';
import { Header } from '@/components/Header';

export default function HomePage() {
  return (
    <ProtectedRoute>
      <div className="min-h-screen">
        <Header />
        <Movies />
      </div>
    </ProtectedRoute>
  );
}
