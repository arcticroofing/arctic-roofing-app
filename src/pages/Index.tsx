import React from 'react';
import { Link } from 'react-router-dom';
import { SidebarTrigger } from '@/components/ui/sidebar';
import { User, Shield, Clock, Camera } from 'lucide-react';

const Index = () => {
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
      
      <main className="flex-1 overflow-auto">
        <div className="relative bg-gradient-to-br from-black via-gray-900 to-black text-white py-20 px-6 border-b border-[#96D7FE]/20">
          <div className="max-w-4xl mx-auto text-center">
            <h2 className="text-5xl font-bold mb-6 text-white">Real-Time Project Tracking</h2>
            <p className="text-xl mb-8 text-[#96D7FE]">
              Stay connected with your roofing project every step of the way
            </p>
            <div className="flex gap-4 justify-center flex-wrap">
              <Link
                to="/homeowner/login"
                className="bg-[#96D7FE] text-black px-8 py-4 rounded-lg font-semibold hover:bg-[#7bc5ec] transition-all shadow-lg hover:shadow-[#96D7FE]/50 transform hover:-translate-y-1"
              >
                <User className="inline mr-2" size={20} />
                Homeowner Portal
              </Link>
            </div>
          </div>
        </div>

        <div className="max-w-6xl mx-auto py-16 px-6">
          <h3 className="text-3xl font-bold text-center mb-12 text-white">
            Why Choose Arctic Roofing?
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-gray-900 rounded-xl shadow-lg p-8 hover:shadow-[#96D7FE]/20 transition-shadow border border-[#96D7FE]/20">
              <div className="bg-[#96D7FE]/10 w-16 h-16 rounded-full flex items-center justify-center mb-4 border border-[#96D7FE]/30">
                <Clock className="text-[#96D7FE]" size={32} />
              </div>
              <h4 className="text-xl font-semibold mb-3 text-white">Real-Time Updates</h4>
              <p className="text-gray-400">
                Get instant notifications about your project progress, weather delays, and completion milestones.
              </p>
            </div>

            <div className="bg-gray-900 rounded-xl shadow-lg p-8 hover:shadow-[#96D7FE]/20 transition-shadow border border-[#96D7FE]/20">
              <div className="bg-[#96D7FE]/10 w-16 h-16 rounded-full flex items-center justify-center mb-4 border border-[#96D7FE]/30">
                <Camera className="text-[#96D7FE]" size={32} />
              </div>
              <h4 className="text-xl font-semibold mb-3 text-white">Photo Documentation</h4>
              <p className="text-gray-400">
                View daily photos of your project progress and keep a complete visual record of the work.
              </p>
            </div>

            <div className="bg-gray-900 rounded-xl shadow-lg p-8 hover:shadow-[#96D7FE]/20 transition-shadow border border-[#96D7FE]/20">
              <div className="bg-[#96D7FE]/10 w-16 h-16 rounded-full flex items-center justify-center mb-4 border border-[#96D7FE]/30">
                <Shield className="text-[#96D7FE]" size={32} />
              </div>
              <h4 className="text-xl font-semibold mb-3 text-white">Secure & Private</h4>
              <p className="text-gray-400">
                Your project information is confidential and secure. Only you can access your project details.
              </p>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Index;