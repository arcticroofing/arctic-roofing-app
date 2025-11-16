import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Shield, Lock, ArrowRight } from 'lucide-react';

const Index = () => {
  return (
    <div className="min-h-screen relative overflow-hidden bg-black">
      {/* Animated Background */}
      <div className="absolute inset-0 overflow-hidden">
        {/* Gradient Orbs */}
        <div className="absolute top-0 -left-4 w-72 h-72 bg-[#96D7FE] rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob"></div>
        <div className="absolute top-0 -right-4 w-72 h-72 bg-blue-400 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob animation-delay-2000"></div>
        <div className="absolute -bottom-8 left-20 w-72 h-72 bg-cyan-400 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob animation-delay-4000"></div>
        
        {/* Grid Pattern */}
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#1f2937_1px,transparent_1px),linear-gradient(to_bottom,#1f2937_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_80%_50%_at_50%_0%,#000_70%,transparent_110%)]"></div>
      </div>

      {/* Content */}
      <div className="relative z-10 min-h-screen flex flex-col items-center justify-center px-4">
        {/* Logo */}
        <div className="mb-8 animate-fade-in">
          <img 
            src="/arctic-roofing-logo.png" 
            alt="Arctic Roofing Logo" 
            className="h-24 sm:h-32 w-auto drop-shadow-2xl"
          />
        </div>

        {/* Title */}
        <div className="text-center mb-12 animate-fade-in-up">
          <h1 className="text-4xl sm:text-6xl font-bold mb-4 text-white bg-clip-text text-transparent bg-gradient-to-r from-white to-[#96D7FE]">
            Project Portal
          </h1>
          <p className="text-xl sm:text-2xl text-gray-400 mb-2">
            Track your roofing project in real-time
          </p>
          <div className="flex items-center justify-center gap-2 text-[#96D7FE] text-sm">
            <div className="w-2 h-2 bg-[#96D7FE] rounded-full animate-pulse"></div>
            <span>Secure • Real-time • Mobile-friendly</span>
          </div>
        </div>
        
        {/* Login Buttons */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 max-w-2xl w-full animate-fade-in-up animation-delay-200">
          <Link to="/manager/login" className="group">
            <div className="relative">
              <div className="absolute -inset-0.5 bg-gradient-to-r from-[#96D7FE] to-blue-400 rounded-2xl blur opacity-30 group-hover:opacity-100 transition duration-1000 group-hover:duration-200"></div>
              <Button className="relative w-full bg-gray-900 hover:bg-gray-800 border border-[#96D7FE]/30 text-white font-semibold py-8 text-lg rounded-2xl transition-all duration-300 group-hover:scale-105">
                <div className="flex items-center justify-between w-full">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-[#96D7FE]/20 rounded-lg">
                      <Shield className="text-[#96D7FE]" size={24} />
                    </div>
                    <div className="text-left">
                      <div className="font-bold">Manager Portal</div>
                      <div className="text-xs text-gray-400">Manage projects & updates</div>
                    </div>
                  </div>
                  <ArrowRight className="text-[#96D7FE] group-hover:translate-x-1 transition-transform" size={20} />
                </div>
              </Button>
            </div>
          </Link>
          
          <Link to="/homeowner/login" className="group">
            <div className="relative">
              <div className="absolute -inset-0.5 bg-gradient-to-r from-[#96D7FE] to-blue-400 rounded-2xl blur opacity-30 group-hover:opacity-100 transition duration-1000 group-hover:duration-200"></div>
              <Button className="relative w-full bg-gray-900 hover:bg-gray-800 border border-[#96D7FE]/30 text-white font-semibold py-8 text-lg rounded-2xl transition-all duration-300 group-hover:scale-105">
                <div className="flex items-center justify-between w-full">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-[#96D7FE]/20 rounded-lg">
                      <Lock className="text-[#96D7FE]" size={24} />
                    </div>
                    <div className="text-left">
                      <div className="font-bold">Homeowner Portal</div>
                      <div className="text-xs text-gray-400">Track your project</div>
                    </div>
                  </div>
                  <ArrowRight className="text-[#96D7FE] group-hover:translate-x-1 transition-transform" size={20} />
                </div>
              </Button>
            </div>
          </Link>
        </div>

        {/* Footer */}
        <div className="mt-16 text-center text-gray-500 text-sm animate-fade-in animation-delay-400">
          <p>© 2024 Arctic Roofing. All rights reserved.</p>
          <p className="mt-2">Need help? Contact your project manager</p>
        </div>
      </div>

      {/* Custom Animations */}
      <style>{`
        @keyframes blob {
          0% { transform: translate(0px, 0px) scale(1); }
          33% { transform: translate(30px, -50px) scale(1.1); }
          66% { transform: translate(-20px, 20px) scale(0.9); }
          100% { transform: translate(0px, 0px) scale(1); }
        }
        
        @keyframes fade-in {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        
        @keyframes fade-in-up {
          from { 
            opacity: 0;
            transform: translateY(20px);
          }
          to { 
            opacity: 1;
            transform: translateY(0);
          }
        }
        
        .animate-blob {
          animation: blob 7s infinite;
        }
        
        .animation-delay-2000 {
          animation-delay: 2s;
        }
        
        .animation-delay-4000 {
          animation-delay: 4s;
        }
        
        .animate-fade-in {
          animation: fade-in 1s ease-out;
        }
        
        .animate-fade-in-up {
          animation: fade-in-up 1s ease-out;
        }
        
        .animation-delay-200 {
          animation-delay: 0.2s;
          animation-fill-mode: both;
        }
        
        .animation-delay-400 {
          animation-delay: 0.4s;
          animation-fill-mode: both;
        }
      `}</style>
    </div>
  );
};

export default Index;