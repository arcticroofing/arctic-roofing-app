import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Briefcase, Home } from 'lucide-react';

const Index = () => {
  const navigate = useNavigate();
  const { isManagerAuthenticated, isHomeownerAuthenticated } = useAuth();

  useEffect(() => {
    console.log('🏠 Index page - checking auth status');
    console.log('Manager authenticated:', isManagerAuthenticated);
    console.log('Homeowner authenticated:', isHomeownerAuthenticated);

    if (isManagerAuthenticated) {
      console.log('✅ Manager is authenticated, redirecting to /manager');
      navigate('/manager');
    } else if (isHomeownerAuthenticated) {
      console.log('✅ Homeowner is authenticated, redirecting to /homeowner');
      navigate('/homeowner');
    }
  }, [isManagerAuthenticated, isHomeownerAuthenticated, navigate]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-black p-4">
      <div className="text-center max-w-2xl">
        <div className="mb-8">
          <h1 className="text-4xl sm:text-5xl font-bold text-white mb-4">
            Arctic Roofing
          </h1>
          <p className="text-xl text-gray-400">
            Project Management Portal
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-w-md mx-auto">
          <Button
            onClick={() => navigate('/manager/login')}
            className="h-32 flex flex-col items-center justify-center gap-3 bg-gray-900 hover:bg-gray-800 border-2 border-[#96D7FE]/30 hover:border-[#96D7FE] transition-all"
          >
            <Briefcase className="h-8 w-8 text-[#96D7FE]" />
            <div>
              <div className="text-lg font-semibold text-white">Manager Login</div>
              <div className="text-sm text-gray-400">Project Management</div>
            </div>
          </Button>

          <Button
            onClick={() => navigate('/homeowner/login')}
            className="h-32 flex flex-col items-center justify-center gap-3 bg-gray-900 hover:bg-gray-800 border-2 border-[#96D7FE]/30 hover:border-[#96D7FE] transition-all"
          >
            <Home className="h-8 w-8 text-[#96D7FE]" />
            <div>
              <div className="text-lg font-semibold text-white">Homeowner Login</div>
              <div className="text-sm text-gray-400">Track Your Project</div>
            </div>
          </Button>
        </div>
      </div>
    </div>
  );
};

export default Index;