'use client'

import { useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { Sun, Moon, User, LogOut, Film } from 'lucide-react';
import { useTheme } from 'next-themes';
import { useAuth } from '@/contexts/AuthContext';

export const Header = () => {
  const router = useRouter();
  const pathname = usePathname();
  const { theme, setTheme } = useTheme();
  const { user, logout } = useAuth();
  const [isThemeChanging, setIsThemeChanging] = useState(false);

  const toggleTheme = async () => {
    setIsThemeChanging(true);
    try {
      const newTheme = theme === 'dark' ? 'light' : 'dark';
      setTheme(newTheme);
    } finally {
      // Add a small delay to show the loading state
      setTimeout(() => setIsThemeChanging(false), 300);
    }
  };

  const handleLogout = () => {
    logout();
    router.push('/');
  };

  const navItems = [
    { label: 'Home', path: '/', icon: Film },
    { label: 'Favorites', path: '/favorites', icon: Film },
  ];

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/50 bg-background/95 backdrop-blur-xl shadow-lg">
      <div className="container mx-auto px-4 h-20 flex items-center justify-between">
        {/* Logo */}
        <div
          className="flex items-center space-x-2 cursor-pointer hover:opacity-80 transition-all duration-200 hover:scale-105"
          onClick={() => router.push('/')}
        >
          <div className="relative h-16 w-16">
            <Image
              src={theme === 'dark' ? "/assets/images/logo_dark.png" : "/assets/images/logo.png"}
              alt="CineHunt Logo"
              fill
              className="object-contain"
              priority={true}
            />
          </div>
          <span className="text-4xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
            CineHunt
          </span>
        </div>

        {/* Navigation */}
        <nav className="hidden md:flex items-center space-x-4">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.path;
            
            return (
              <Button
                key={item.path}
                variant={isActive ? "secondary" : "ghost"}
                onClick={() => router.push(item.path)}
                className="flex items-center space-x-4 h-16 px-8 text-foreground hover:text-foreground hover:bg-muted/30 transition-all duration-200"
              >
                <Icon size={22} className="text-foreground" />
                <span className="text-xl font-medium text-foreground">{item.label}</span>
              </Button>
            );
          })}
        </nav>

        {/* User menu */}
        <div className="flex items-center space-x-8">
          {/* Theme Toggle */}
          <Button
            variant="ghost"
            size="sm"
            onClick={toggleTheme}
            disabled={isThemeChanging}
            className="flex items-center justify-center w-16 h-16 p-0 text-foreground hover:text-foreground hover:bg-muted/50"
            title={`Switch to ${theme === 'dark' ? 'light' : 'dark'} theme`}
          >
            {isThemeChanging ? (
              <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-primary" />
            ) : theme === 'dark' ? (
              <Sun size={22} className="text-yellow-500" />
            ) : (
              <Moon size={22} className="text-blue-500" />
            )}
          </Button>

          {user && (
            <>
              <div className="hidden sm:flex items-center space-x-3 text-base">
                <User size={20} className="text-muted-foreground" />
                <span className="text-foreground font-medium">{user.name}</span>
              </div>
              
              <Button
                variant="outline"
                size="sm"
                onClick={handleLogout}
                className="flex items-center space-x-3 text-foreground border-border hover:bg-muted/50 h-12 px-6"
              >
                <LogOut size={18} />
                <span className="hidden sm:inline text-base font-medium">Logout</span>
              </Button>
            </>
          )}
        </div>
      </div>
    </header>
  );
};
