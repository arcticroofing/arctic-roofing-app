import React, { useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Link, useNavigate } from 'react-router-dom';
import { SidebarTrigger } from '@/components/ui/sidebar';
import { Button } from '@/components/ui/button';
import { getProjectById } from '../services/projectService';
import { useAuth } from '../contexts/AuthContext';
import { Calendar, MapPin, TrendingUp, User as UserIcon, LogOut } from 'lucide-react';
import { Progress } from '@/components/ui/progress';

const HomeownerDashboard = () => {
  const navigate = useNavigate();
  const { currentHomeowner, logoutHomeowner, isHomeownerAuthenticated } = useAuth();

  useEffect(() => {
    if (!isHomeownerAuthenticated) {
      navigate('/homeowner/login');
    }
  }, [isHomeownerAuthenticated, navigate]);

  const { data: myProject, isLoading } = useQuery({
    queryKey: ['project', currentHomeowner?.projectId],
    queryFn: () => getProjectById(currentHomeowner!.projectId),
    enabled: !!currentHomeowner?.projectId,
  });

  const handleLogout = () => {
    logoutHomeowner();
    navigate('/homeowner/login');
  };

  if (!isHomeownerAuthenticated || !currentHomeowner) {
    return null;
  }

  if (isLoading) {
    return (
      <div className="flex flex-col h-full w-full bg-black">
        <header className="flex items-center sticky top-0 z-10 gap-4 border-b border-[#96D7FE]/20 bg-black px-6 py-4">
          <SidebarTrigger className="text-[#96D7FE]" />
          <h1 className="text-2xl font-semibold text-white">My Project</h1>
        </header>
        <main className="flex-1 flex items-center justify-center">
          <p className="text-gray-400">Loading your project...</p>
        </main>
      </div>
    );
  }

  if (!myProject) {
    return (
      <div className="flex flex-col h-full w-full bg-black">
        <header className="flex items-center sticky top-0 z-10 gap-4 border-b border-[#96D7FE]/20 bg-black px-6 py-4">
          <SidebarTrigger className="text-[#96D7FE]" />
          <h1 className="text-2xl font-semibold text-white">My Project</h1>
        </header>
        <main className="flex-1 flex items-center justify-center">
          <p className="text-gray-400">No active projects found.</p>
        </main>
      </div>
    );
  }

  const statusColors = {
    'Not Started': 'bg-gray-500',
    'In Progress': 'bg-[#96D7FE]',
    'Completed': 'bg-green-500',
    'On Hold': 'bg-yellow-500'
  };

  return (
    <div className="flex flex-col h-full w-full bg-black">
      <header className="flex items-center sticky top-0 z-10 gap-4 border-b border-[#96D7FE]/20 bg-black px-6 py-4 shadow-lg shadow-[#96D7FE]/5">
        <SidebarTrigger className="text-[#96D7FE]" />
        <h1 className="text-2xl font-semibold text-white">My Project Dashboard</h1>
        <div className="ml-auto flex items-center gap-4">
          <span className="text-sm text-gray-400">Welcome, <strong className="text-[#96D7FE]">{currentHomeowner.name}</strong></span>
          <Button
            variant="outline"
            size="sm"
            onClick={handleLogout}
            className="gap-2 border-[#96D7FE]/30 text-[#96D7FE] hover:bg-[#96D7FE]/10"
          >
            <LogOut size={16} />
            Logout
          </Button>
        </div>
      </header>
      
      <main className="flex-1 overflow-auto bg-black p-6">
        <div className="max-w-6xl mx-auto space-y-6">
          {/* Project Header */}
          <div className="bg-gradient-to-r from-gray-900 to-black rounded-xl shadow-lg shadow-[#96D7FE]/10 p-8 text-white border border-[#96D7FE]/20">
            <div className="flex items-start justify-between mb-4">
              <div>
                <h2 className="text-3xl font-bold mb-2 text-white">{myProject.projectType}</h2>
                <div className="flex items-center gap-2 text-[#96D7FE]">
                  <MapPin size={18} />
                  <span>{myProject.address}</span>
                </div>
              </div>
              <span className={`${statusColors[myProject.status]} text-black px-4 py-2 rounded-full text-sm font-semibold`}>
                {myProject.status}
              </span>
            </div>
            
            <div className="mt-6">
              <div className="flex justify-between items-center mb-2">
                <span className="text-gray-300">Project Progress</span>
                <span className="text-2xl font-bold text-[#96D7FE]">{myProject.progress}%</span>
              </div>
              <Progress value={myProject.progress} className="h-3 bg-gray-800" />
            </div>
          </div>

          {/* Quick Stats */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-gray-900 rounded-lg shadow-md p-6 border border-[#96D7FE]/20">
              <div className="flex items-center gap-3 mb-2">
                <Calendar className="text-[#96D7FE]" size={24} />
                <h3 className="font-semibold text-gray-300">Start Date</h3>
              </div>
              <p className="text-2xl font-bold text-white">
                {new Date(myProject.startDate).toLocaleDateString()}
              </p>
            </div>

            <div className="bg-gray-900 rounded-lg shadow-md p-6 border border-[#96D7FE]/20">
              <div className="flex items-center gap-3 mb-2">
                <TrendingUp className="text-[#96D7FE]" size={24} />
                <h3 className="font-semibold text-gray-300">Est. Completion</h3>
              </div>
              <p className="text-2xl font-bold text-white">
                {new Date(myProject.estimatedCompletion).toLocaleDateString()}
              </p>
            </div>

            <div className="bg-gray-900 rounded-lg shadow-md p-6 border border-[#96D7FE]/20">
              <div className="flex items-center gap-3 mb-2">
                <UserIcon className="text-[#96D7FE]" size={24} />
                <h3 className="font-semibold text-gray-300">Project Manager</h3>
              </div>
              <p className="text-2xl font-bold text-white">{myProject.projectManager}</p>
            </div>
          </div>

          {/* Recent Updates */}
          <div className="bg-gray-900 rounded-lg shadow-md p-6 border border-[#96D7FE]/20">
            <h3 className="text-xl font-bold text-white mb-4">Recent Updates</h3>
            {myProject.updates.length > 0 ? (
              <div className="space-y-4">
                {myProject.updates.slice(0, 3).map((update) => (
                  <div key={update.id} className="border-l-4 border-[#96D7FE] pl-4 py-2 bg-black/30 rounded-r">
                    <div className="flex justify-between items-start mb-1">
                      <h4 className="font-semibold text-white">{update.title}</h4>
                      <span className="text-sm text-gray-400">
                        {new Date(update.date).toLocaleDateString()}
                      </span>
                    </div>
                    <p className="text-gray-300 mb-2">{update.description}</p>
                    <p className="text-sm text-[#96D7FE]">By {update.author}</p>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-400">No updates yet. Check back soon!</p>
            )}
          </div>

          {/* Recent Photos */}
          {myProject.photos.length > 0 && (
            <div className="bg-gray-900 rounded-lg shadow-md p-6 border border-[#96D7FE]/20">
              <h3 className="text-xl font-bold text-white mb-4">Recent Photos</h3>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                {myProject.photos.slice(0, 6).map((photo, index) => (
                  <img
                    key={index}
                    src={photo}
                    alt={`Project photo ${index + 1}`}
                    className="w-full h-48 object-cover rounded-lg shadow-sm hover:shadow-[#96D7FE]/30 transition-shadow border border-[#96D7FE]/10"
                  />
                ))}
              </div>
            </div>
          )}

          {/* View Full Details Button */}
          <Link
            to={`/project/${myProject.id}`}
            className="block w-full bg-[#96D7FE] text-black text-center py-4 rounded-lg font-semibold hover:bg-[#7bc5ec] transition-colors shadow-md hover:shadow-[#96D7FE]/50"
          >
            View Full Project Details
          </Link>
        </div>
      </main>
    </div>
  );
};

export default HomeownerDashboard;