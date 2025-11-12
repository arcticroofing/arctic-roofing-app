import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { SidebarTrigger } from '@/components/ui/sidebar';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { loginManager } from '../services/managerAuthService';
import { useAuth } from '../contexts/AuthContext';
import { Shield, Mail, Lock } from 'lucide-react';

const ManagerLogin = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { loginManager: loginManagerContext, isManagerAuthenticated } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (isManagerAuthenticated) {
      navigate('/manager');
    }
  }, [isManagerAuthenticated, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    console.log('Attempting manager login with:', email);

    const manager = await loginManager(email, password);

    if (manager) {
      console.log('Manager login successful:', manager);
      loginManagerContext(manager);
      toast({
        title: "Welcome back!",
        description: `Logged in as ${manager.name}`,
      });
      navigate('/manager');
    } else {
      console.log('Manager login failed');
      toast({
        title: "Login Failed",
        description: "Invalid email or password. Please try again.",
        variant: "destructive",
      });
    }

    setIsLoading(false);
  };

  return (
    <div className="flex flex-col h-full w-full bg-black">
      <header className="flex items-center sticky top-0 z-10 gap-4 border-b border-[#96D7FE]/20 bg-black px-6 py-4">
        <SidebarTrigger className="text-[#96D7FE]" />
        <img 
          src="/arctic-roofing-logo.png" 
          alt="Arctic Roofing" 
          className="h-12 w-auto object-contain"
        />
      </header>
      
      <main className="flex-1 overflow-auto bg-gradient-to-br from-black via-gray-900 to-black flex items-center justify-center p-6">
        <Card className="w-full max-w-md shadow-2xl bg-gray-900 border-[#96D7FE]/30">
          <CardHeader className="space-y-1 text-center">
            <div className="flex justify-center mb-4">
              <div className="bg-[#96D7FE]/10 p-4 rounded-full border border-[#96D7FE]/30">
                <Shield className="text-[#96D7FE]" size={40} />
              </div>
            </div>
            <CardTitle className="text-2xl font-bold text-white">Manager Portal</CardTitle>
            <CardDescription className="text-gray-400">
              Sign in to manage projects and updates
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email" className="text-gray-300">Email Address</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-3 text-gray-500" size={18} />
                  <Input
                    id="email"
                    type="email"
                    placeholder="manager@arcticroofing.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="pl-10 bg-black border-[#96D7FE]/30 text-white placeholder:text-gray-500 focus:border-[#96D7FE]"
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="password" className="text-gray-300">Password</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-3 text-gray-500" size={18} />
                  <Input
                    id="password"
                    type="password"
                    placeholder="Enter your password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="pl-10 bg-black border-[#96D7FE]/30 text-white placeholder:text-gray-500 focus:border-[#96D7FE]"
                    required
                  />
                </div>
              </div>

              <Button
                type="submit"
                className="w-full bg-[#96D7FE] text-black hover:bg-[#7bc5ec] font-semibold"
                disabled={isLoading}
              >
                {isLoading ? 'Signing in...' : 'Sign In'}
              </Button>
            </form>

            <div className="mt-6 p-4 bg-[#96D7FE]/5 rounded-lg border border-[#96D7FE]/20">
              <p className="text-sm font-semibold text-[#96D7FE] mb-2">Demo Credentials:</p>
              <div className="text-xs text-gray-400 space-y-1">
                <p><strong className="text-gray-300">Email:</strong> admin@arcticroofing.com</p>
                <p><strong className="text-gray-300">Password:</strong> Arctic2024!</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  );
};

export default ManagerLogin;