import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { Lock } from 'lucide-react';
import { supabase } from '../lib/supabase';

const HomeownerLogin = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [formData, setFormData] = useState({ email: '', password: '' });
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    console.log('🔐 Homeowner login attempt:', formData.email);

    try {
      const { data, error } = await supabase
        .from('homeowners')
        .select('*')
        .eq('email', formData.email.toLowerCase().trim())
        .eq('password_hash', formData.password)
        .single();

      if (error || !data) {
        console.log('❌ Homeowner login failed');
        toast({
          title: "Login Failed",
          description: "Invalid email or password",
          variant: "destructive",
        });
        setIsLoading(false);
        return;
      }

      console.log('✅ Homeowner login successful:', data);

      // Save to localStorage
      localStorage.setItem('homeownerSession', JSON.stringify(data));

      toast({
        title: "Login Successful",
        description: "Welcome back!",
      });

      navigate('/homeowner/dashboard');
    } catch (error) {
      console.error('Login error:', error);
      toast({
        title: "Error",
        description: "An error occurred during login",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-black p-4">
      <Card className="w-full max-w-md bg-gray-900 border-[#96D7FE]/30">
        <CardHeader className="text-center">
          <div className="flex justify-center mb-4">
            <div className="bg-[#96D7FE]/20 p-4 rounded-full border-2 border-[#96D7FE]">
              <Lock className="text-[#96D7FE]" size={32} />
            </div>
          </div>
          <CardTitle className="text-3xl font-bold text-white">Homeowner Portal</CardTitle>
          <CardDescription className="text-gray-400">
            Login to track your roofing project
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Label htmlFor="email" className="text-gray-300">Email</Label>
              <Input
                id="email"
                name="email"
                type="email"
                value={formData.email}
                onChange={handleChange}
                className="bg-black border-[#96D7FE]/30 text-white"
                placeholder="your@email.com"
                required
              />
            </div>

            <div>
              <Label htmlFor="password" className="text-gray-300">Password</Label>
              <Input
                id="password"
                name="password"
                type="password"
                value={formData.password}
                onChange={handleChange}
                className="bg-black border-[#96D7FE]/30 text-white"
                placeholder="Enter your password"
                required
              />
            </div>

            <Button
              type="submit"
              disabled={isLoading}
              className="w-full bg-[#96D7FE] hover:bg-[#7bc5ec] text-black font-semibold"
            >
              {isLoading ? 'Logging in...' : 'Login'}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default HomeownerLogin;
