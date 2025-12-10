import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { ArrowLeft, Briefcase } from 'lucide-react';
import { useManager } from '../contexts/ManagerContext';
import { supabase } from '../lib/supabase';

const ManagerLogin = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { setManager } = useManager();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    console.log('🔐 Manager login attempt:', email);

    try {
      const { data, error } = await supabase
        .from('managers')
        .select('*')
        .eq('email', email.toLowerCase().trim())
        .eq('password_hash', password)
        .single();

      if (error || !data) {
        console.log('❌ Manager login failed');
        toast({
          title: 'Login Failed',
          description: 'Invalid email or password. Please try again.',
          variant: 'destructive',
        });
        setIsLoading(false);
        return;
      }

      console.log('✅ Manager login successful:', data);

      // Save to localStorage
      localStorage.setItem('managerSession', JSON.stringify(data));
      
      // Save to context
      setManager(data);

      toast({
        title: 'Welcome back!',
        description: 'Successfully logged in as manager.',
      });

      navigate('/manager/dashboard');
    } catch (err) {
      console.error('Login error:', err);
      toast({
        title: 'Error',
        description: 'Something went wrong. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-black p-4">
      <div className="w-full max-w-md">
        <Button
          variant="ghost"
          onClick={() => navigate('/')}
          className="mb-4 text-gray-400 hover:text-white"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Home
        </Button>

        <Card className="bg-gray-900 border-[#96D7FE]/30">
          <CardHeader className="space-y-1">
            <div className="flex items-center justify-center mb-4">
              <div className="p-3 bg-[#96D7FE]/10 rounded-full">
                <Briefcase className="h-8 w-8 text-[#96D7FE]" />
              </div>
            </div>
            <CardTitle className="text-2xl text-center text-white">Manager Login</CardTitle>
            <CardDescription className="text-center text-gray-400">
              Enter your credentials to access the project management dashboard
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <label htmlFor="email" className="text-sm font-medium text-gray-300">
                  Email
                </label>
                <Input
                  id="email"
                  type="email"
                  placeholder="manager@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="bg-gray-800 border-gray-700 text-white placeholder:text-gray-500"
                />
              </div>
              <div className="space-y-2">
                <label htmlFor="password" className="text-sm font-medium text-gray-300">
                  Password
                </label>
                <Input
                  id="password"
                  type="password"
                  placeholder="Enter your password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="bg-gray-800 border-gray-700 text-white placeholder:text-gray-500"
                />
              </div>
              <Button
                type="submit"
                className="w-full bg-[#96D7FE] hover:bg-[#7BC5ED] text-black font-semibold"
                disabled={isLoading}
              >
                {isLoading ? 'Logging in...' : 'Login'}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default ManagerLogin;
