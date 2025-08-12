'use client'

import { useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { Sun, Moon, User, LogOut, Film, Menu, X } from 'lucide-react';
import { useTheme } from 'next-themes';
import { useAuth } from '@/contexts/AuthContext';

export const Header = () => {
  const router = useRouter();
  const pathname = usePathname();
  const { theme, setTheme } = useTheme();
  const { user, logout } = useAuth();
  const [isThemeChanging, setIsThemeChanging] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const toggleTheme = async () => {
    setIsThemeChanging(true);
    try {
      const newTheme = theme === 'dark' ? 'light' : 'dark';
      setTheme(newTheme);
    } finally {
      setTimeout(() => setIsThemeChanging(false), 300);
    }
  };

  const handleLogout = () => {
    logout();
    router.push('/');
    setIsMobileMenuOpen(false);
  };

  const navItems = [
    { label: 'Home', path: '/', icon: Film },
    { label: 'Favorites', path: '/favorites', icon: Film },
  ];

  const handleNavigation = (path: string) => {
    router.push(path);
    setIsMobileMenuOpen(false);
  };

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/50 bg-background/95 backdrop-blur-xl shadow-lg">
      <div className="container mx-auto px-3 sm:px-4 h-16 sm:h-20 flex items-center justify-between">
        <div
          className="flex items-center space-x-1 sm:space-x-2 cursor-pointer hover:opacity-80 transition-all duration-200 hover:scale-105"
          onClick={() => router.push('/')}
        >
          <div className="relative h-10 w-10 sm:h-12 sm:w-12 md:h-16 md:w-16">
            <Image
              src={theme === 'dark' ? "/assets/images/logo_dark.png" : "/assets/images/logo.png"}
              alt="CineHunt Logo"
              fill
              className="object-contain"
              priority={true}
            />
          </div>
          <span className="text-2xl sm:text-3xl md:text-4xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
            CineHunt
          </span>
        </div>

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

        <div className="flex items-center space-x-2 sm:space-x-4 md:space-x-8">
          <Button
            variant="ghost"
            size="sm"
            onClick={toggleTheme}
            disabled={isThemeChanging}
            className="flex items-center justify-center w-12 h-12 sm:w-14 sm:h-14 md:w-16 md:h-16 p-0 text-foreground hover:text-foreground hover:bg-muted/50"
            title={`Switch to ${theme === 'dark' ? 'light' : 'dark'} theme`}
          >
            {isThemeChanging ? (
              <div className="animate-spin rounded-full h-4 w-4 sm:h-5 sm:w-5 border-b-2 border-primary" />
            ) : theme === 'dark' ? (
              <Sun size={18} className="sm:w-[22px] sm:h-[22px] text-yellow-500" />
            ) : (
              <Moon size={18} className="sm:w-[22px] sm:h-[22px] text-blue-500" />
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
                className="hidden sm:flex items-center space-x-3 text-foreground border-border hover:bg-muted/50 hover:text-foreground h-12 px-6"
              >
                <LogOut size={18} />
                <span className="text-base font-medium">Logout</span>
              </Button>
            </>
          )}

          <Button
            variant="ghost"
            size="sm"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="md:hidden flex items-center justify-center w-12 h-12 p-0 text-foreground hover:text-foreground hover:bg-muted/50"
          >
            {isMobileMenuOpen ? (
              <X size={20} />
            ) : (
              <Menu size={20} />
            )}
          </Button>
        </div>
      </div>

      {/* Mobile Navigation Menu */}
      {isMobileMenuOpen && (
        <div className="md:hidden border-t border-border/50 bg-background/95 backdrop-blur-xl">
          <div className="container mx-auto px-3 py-4 space-y-3">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = pathname === item.path;
              
              return (
                <Button
                  key={item.path}
                  variant={isActive ? "secondary" : "ghost"}
                  onClick={() => handleNavigation(item.path)}
                  className="w-full flex items-center justify-start space-x-3 h-14 px-4 text-foreground hover:text-foreground hover:bg-muted/30 transition-all duration-200"
                >
                  <Icon size={20} className="text-foreground" />
                  <span className="text-base font-medium text-foreground">{item.label}</span>
                </Button>
              );
            })}
            
            {user && (
              <>
                <div className="flex items-center space-x-3 px-4 py-3 text-sm text-muted-foreground border-t border-border/30">
                  <User size={18} />
                  <span className="font-medium">{user.name}</span>
                </div>
                
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleLogout}
                  className="w-full flex items-center justify-start space-x-3 h-14 px-4 text-foreground border-border hover:bg-muted/50 hover:text-foreground"
                >
                  <LogOut size={18} />
                  <span className="text-base font-medium">Logout</span>
                </Button>
              </>
            )}
          </div>
        </div>
      )}
    </header>
  );
};
