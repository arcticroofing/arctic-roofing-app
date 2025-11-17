import { useNavigate } from 'react-router-dom';
import { Shield, Lock, ArrowRight } from 'lucide-react';

const Index = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen flex flex-col items-center justify-between bg-black text-white p-6">
      <div className="flex-1 flex flex-col items-center justify-center max-w-4xl w-full">
        {/* Logo */}
        <div className="mb-12">
          <img 
            src="/arctic-roofing-logo.png" 
            alt="Arctic Roofing - Storm Restoration Experts" 
            className="h-32 w-auto object-contain"
          />
        </div>

        {/* Title */}
        <h1 className="text-5xl sm:text-6xl font-bold text-center mb-6">
          Project Portal
        </h1>

        {/* Subtitle */}
        <p className="text-xl sm:text-2xl text-gray-300 text-center mb-8">
          Track your roofing project in real-time
        </p>

        {/* Features */}
        <div className="flex items-center gap-3 text-[#96D7FE] mb-16">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 bg-[#96D7FE] rounded-full"></div>
            <span className="text-sm sm:text-base">Secure</span>
          </div>
          <span className="text-gray-600">•</span>
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 bg-[#96D7FE] rounded-full"></div>
            <span className="text-sm sm:text-base">Real-time</span>
          </div>
          <span className="text-gray-600">•</span>
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 bg-[#96D7FE] rounded-full"></div>
            <span className="text-sm sm:text-base">Mobile-friendly</span>
          </div>
        </div>

        {/* Portal Buttons */}
        <div className="w-full max-w-2xl space-y-4">
          {/* Manager Portal */}
          <button
            onClick={() => navigate('/manager/login')}
            className="w-full bg-gray-900/50 backdrop-blur border-2 border-gray-800 rounded-2xl p-6 hover:border-[#96D7FE]/50 hover:bg-gray-900/70 transition-all group"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 bg-gray-800/50 rounded-xl flex items-center justify-center group-hover:bg-[#96D7FE]/10 transition-colors">
                  <Shield className="w-7 h-7 text-gray-400 group-hover:text-[#96D7FE] transition-colors" />
                </div>
                <div className="text-left">
                  <h3 className="text-xl font-bold text-white mb-1">Manager Portal</h3>
                  <p className="text-gray-400 text-sm">Manage projects & updates</p>
                </div>
              </div>
              <ArrowRight className="w-6 h-6 text-gray-600 group-hover:text-[#96D7FE] group-hover:translate-x-1 transition-all" />
            </div>
          </button>

          {/* Homeowner Portal */}
          <button
            onClick={() => navigate('/homeowner/login')}
            className="w-full bg-gray-900/50 backdrop-blur border-2 border-gray-800 rounded-2xl p-6 hover:border-[#96D7FE]/50 hover:bg-gray-900/70 transition-all group"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 bg-gray-800/50 rounded-xl flex items-center justify-center group-hover:bg-[#96D7FE]/10 transition-colors">
                  <Lock className="w-7 h-7 text-gray-400 group-hover:text-[#96D7FE] transition-colors" />
                </div>
                <div className="text-left">
                  <h3 className="text-xl font-bold text-white mb-1">Homeowner Portal</h3>
                  <p className="text-gray-400 text-sm">Track your project</p>
                </div>
              </div>
              <ArrowRight className="w-6 h-6 text-gray-600 group-hover:text-[#96D7FE] group-hover:translate-x-1 transition-all" />
            </div>
          </button>
        </div>
      </div>

      {/* Footer */}
      <div className="text-center text-gray-500 text-sm space-y-2 mt-12">
        <p>© 2024 Arctic Roofing. All rights reserved.</p>
        <p>Need help? Contact your project manager</p>
      </div>
    </div>
  );
};

export default Index;