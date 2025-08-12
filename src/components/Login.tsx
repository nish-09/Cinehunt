'use client'

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardHeader, CardContent, CardFooter } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Film, Mail, Lock, User, Info } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';
import { useTheme } from 'next-themes';
import { DEMO_CREDENTIALS } from '@/lib/auth';

export const Login = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [rememberMe, setRememberMe] = useState(false);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();
  const { login, register } = useAuth();
  const { theme } = useTheme();

  // Load saved credentials on component mount
  useEffect(() => {
    const savedCredentials = localStorage.getItem('cine_credentials');
    if (savedCredentials) {
      try {
        const { email: savedEmail, password: savedPassword, rememberMe: savedRemember } = JSON.parse(savedCredentials);
        if (savedRemember) {
          setEmail(savedEmail || '');
          setPassword(savedPassword || '');
          setRememberMe(true);
        }
      } catch (error) {
        console.error('Error loading saved credentials:', error);
        localStorage.removeItem('cine_credentials');
      }
    }
  }, []);

  const saveCredentials = (email: string, password: string, remember: boolean) => {
    if (remember) {
      const credentials = {
        email,
        password,
        rememberMe: true
      };
      localStorage.setItem('cine_credentials', JSON.stringify(credentials));
    } else {
      localStorage.removeItem('cine_credentials');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (isLogin) {
        await login(email, password);
        toast({
          title: "Welcome back!",
          description: "Successfully logged in to CineHunt!",
        });
      } else {
        await register(name, email, password);
        toast({
          title: "Account created!",
          description: "Welcome to CineHunt!",
        });
      }

      if (rememberMe) {
        saveCredentials(email, password, true);
      }
    } catch (error) {
      toast({
        title: isLogin ? "Login failed" : "Registration failed",
        description: error instanceof Error ? error.message : "Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const fillDemoCredentials = () => {
    setEmail(DEMO_CREDENTIALS.email);
    setPassword(DEMO_CREDENTIALS.password);
    setIsLogin(true);
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-background via-background to-muted/20">
      <div className="w-full max-w-md space-y-6">
        {/* Demo Credentials Info */}
        <div className="text-center space-y-2">
          <div className="flex items-center justify-center space-x-2 text-muted-foreground">
            <Info size={16} />
            <span className="text-sm">Demo Credentials Available</span>
          </div>
          <div className="flex space-x-2 justify-center">
            <Button
              variant="outline"
              size="sm"
              onClick={fillDemoCredentials}
              className="text-xs"
            >
              Fill Demo Credentials
            </Button>
            <Button
              variant="default"
              size="sm"
              onClick={async () => {
                setEmail(DEMO_CREDENTIALS.email);
                setPassword(DEMO_CREDENTIALS.password);
                setIsLogin(true);
                setLoading(true);
                try {
                  await login(DEMO_CREDENTIALS.email, DEMO_CREDENTIALS.password);
                  toast({
                    title: "Welcome!",
                    description: "Successfully logged in with demo account!",
                  });
                } catch (error) {
                  toast({
                    title: "Login failed",
                    description: error instanceof Error ? error.message : "Please try again.",
                    variant: "destructive",
                  });
                } finally {
                  setLoading(false);
                }
              }}
              disabled={loading}
              className="text-xs"
            >
              Quick Demo Login
            </Button>
          </div>
        </div>

        <Card className="glass-card border-border/50 shadow-xl">
          <CardHeader className="text-center space-y-2">
            <div className="flex items-center justify-center space-x-3 mb-4">
              <div className="relative h-12 w-12">
                <img
                  src={theme === 'dark' ? "/assets/images/logo_dark.png" : "/assets/images/logo.png"}
                  alt="CineHunt Logo"
                  className="h-full w-full object-contain"
                />
              </div>
              <span className="text-2xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
                CineHunt
              </span>
            </div>
            <h1 className="text-2xl font-bold">
              {isLogin ? 'Welcome Back' : 'Create Account'}
            </h1>
            <p className="text-muted-foreground">
              {isLogin 
                ? 'Sign in to your account to continue' 
                : 'Join CineHunt to discover amazing movies'
              }
            </p>
          </CardHeader>

          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              {!isLogin && (
                <div className="space-y-2">
                  <Label htmlFor="name">Full Name</Label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="name"
                      type="text"
                      placeholder="Enter your full name"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className="pl-10"
                      required={!isLogin}
                    />
                  </div>
                </div>
              )}

              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="email"
                    type="email"
                    placeholder="Enter your email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="pl-10"
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="password"
                    type="password"
                    placeholder="Enter your password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="pl-10"
                    required
                  />
                </div>
              </div>

              <CardFooter className="flex flex-col space-y-4 p-0">
                <Button 
                  type="submit" 
                  className="w-full h-12 text-base font-medium" 
                  disabled={loading}
                >
                  {loading ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                      {isLogin ? 'Signing In...' : 'Creating Account...'}
                    </>
                  ) : (
                    isLogin ? 'Sign In' : 'Create Account'
                  )}
                </Button>
                
                <div className="flex items-center justify-between w-full">
                  <div className="flex items-center space-x-2">
                    <Checkbox 
                      id="remember" 
                      checked={rememberMe} 
                      onCheckedChange={(checked) => setRememberMe(checked as boolean)}
                      disabled={loading}
                    />
                    <Label htmlFor="remember" className="text-sm text-muted-foreground">
                      Remember me
                    </Label>
                  </div>
                </div>
              </CardFooter>
            </form>
          </CardContent>

          <CardFooter className="flex justify-center p-6 pt-0">
            <Button
              variant="ghost"
              onClick={() => setIsLogin(!isLogin)}
              className="text-muted-foreground hover:text-foreground"
            >
              {isLogin 
                ? "Don't have an account? Sign up" 
                : "Already have an account? Sign in"
              }
            </Button>
          </CardFooter>
        </Card>

        {/* Demo Credentials Display */}
        <div className="text-center space-y-2 p-4 bg-muted/20 rounded-lg border border-border/30">
          <h3 className="text-sm font-medium text-muted-foreground">Demo Account</h3>
          <div className="text-xs text-muted-foreground space-y-1">
            <p><strong>Email:</strong> {DEMO_CREDENTIALS.email}</p>
            <p><strong>Password:</strong> {DEMO_CREDENTIALS.password}</p>
          </div>
          <p className="text-xs text-muted-foreground mt-2">
            Use these credentials to test the app without creating an account
          </p>
        </div>
      </div>
    </div>
  );
};
