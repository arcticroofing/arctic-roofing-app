import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { SidebarTrigger } from '@/components/ui/sidebar';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { getAllProjects } from '../services/projectService';
import { useAuth } from '../contexts/AuthContext';
import { CreateProject } from '../components/CreateProject';
import { Calendar, DollarSign, User, MapPin, TrendingUp, Eye } from 'lucide-react';
import { Button } from '@/components/ui/button';

const ProjectManagerDashboard = () => {
  const navigate = useNavigate();
  const { isManagerAuthenticated } = useAuth();

  React.useEffect(() => {
    if (!isManagerAuthenticated) {
      navigate('/manager/login');
    }
  }, [isManagerAuthenticated, navigate]);

  const { data: projects, isLoading } = useQuery({
    queryKey: ['projects'],
    queryFn: getAllProjects,
  });

  const statusColors = {
    'Not Started': 'bg-gray-500',
    'In Progress': 'bg-[#96D7FE]',
    'Completed': 'bg-green-500',
    'On Hold': 'bg-yellow-500'
  };

  if (!isManagerAuthenticated) {
    return null;
  }

  if (isLoading) {
    return (
      <div className="flex flex-col h-full w-full bg-black">
        <header className="flex items-center sticky top-0 z-10 gap-2 sm:gap-4 border-b border-[#96D7FE]/20 bg-black px-3 sm:px-6 py-3 sm:py-4">
          <SidebarTrigger className="text-[#96D7FE]" />
          <h1 className="text-lg sm:text-2xl font-semibold text-white">Manager Dashboard</h1>
        </header>
        <main className="flex-1 flex items-center justify-center p-4">
          <p className="text-gray-400">Loading projects...</p>
        </main>
      </div>
    );
  }

  const stats = {
    total: projects?.length || 0,
    inProgress: projects?.filter(p => p.status === 'In Progress').length || 0,
    completed: projects?.filter(p => p.status === 'Completed').length || 0,
    notStarted: projects?.filter(p => p.status === 'Not Started').length || 0,
  };

  return (
    <div className="flex flex-col h-full w-full bg-black">
      <header className="flex items-center justify-between sticky top-0 z-10 gap-2 sm:gap-4 border-b border-[#96D7FE]/20 bg-black px-3 sm:px-6 py-3 sm:py-4 shadow-lg shadow-[#96D7FE]/5">
        <div className="flex items-center gap-2 sm:gap-4 flex-1 min-w-0">
          <SidebarTrigger className="text-[#96D7FE] flex-shrink-0" />
          <div className="min-w-0">
            <h1 className="text-lg sm:text-2xl font-semibold text-white truncate">Manager Dashboard</h1>
            <p className="text-xs sm:text-sm text-gray-400 hidden sm:block">Manage all roofing projects</p>
          </div>
        </div>
        <div className="flex-shrink-0">
          <CreateProject />
        </div>
      </header>

      <main className="flex-1 overflow-auto bg-black p-3 sm:p-6">
        <div className="max-w-7xl mx-auto space-y-4 sm:space-y-6">
          {/* Stats Cards - Mobile Optimized */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
            <Card className="bg-gray-900 border-[#96D7FE]/30">
              <CardHeader className="pb-2 sm:pb-3">
                <CardTitle className="text-xs sm:text-sm font-medium text-gray-400">
                  Total Projects
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl sm:text-3xl font-bold text-white">{stats.total}</div>
              </CardContent>
            </Card>

            <Card className="bg-gray-900 border-[#96D7FE]/30">
              <CardHeader className="pb-2 sm:pb-3">
                <CardTitle className="text-xs sm:text-sm font-medium text-gray-400">
                  In Progress
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl sm:text-3xl font-bold text-[#96D7FE]">{stats.inProgress}</div>
              </CardContent>
            </Card>

            <Card className="bg-gray-900 border-[#96D7FE]/30">
              <CardHeader className="pb-2 sm:pb-3">
                <CardTitle className="text-xs sm:text-sm font-medium text-gray-400">
                  Completed
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl sm:text-3xl font-bold text-green-500">{stats.completed}</div>
              </CardContent>
            </Card>

            <Card className="bg-gray-900 border-[#96D7FE]/30">
              <CardHeader className="pb-2 sm:pb-3">
                <CardTitle className="text-xs sm:text-sm font-medium text-gray-400">
                  Not Started
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl sm:text-3xl font-bold text-gray-500">{stats.notStarted}</div>
              </CardContent>
            </Card>
          </div>

          {/* Projects List - Mobile Optimized */}
          <Card className="bg-gray-900 border-[#96D7FE]/30">
            <CardHeader>
              <CardTitle className="text-white text-base sm:text-lg">All Projects</CardTitle>
            </CardHeader>
            <CardContent>
              {projects && projects.length > 0 ? (
                <div className="space-y-3 sm:space-y-4">
                  {projects.map((project) => (
                    <div
                      key={project.id}
                      className="bg-gray-800 rounded-lg p-3 sm:p-4 border border-[#96D7FE]/20 hover:border-[#96D7FE] transition-all cursor-pointer"
                      onClick={() => navigate(`/project/${project.id}`)}
                    >
                      {/* Mobile Layout */}
                      <div className="space-y-3">
                        {/* Header Row */}
                        <div className="flex items-start justify-between gap-2">
                          <div className="flex-1 min-w-0">
                            <h3 className="text-base sm:text-lg font-semibold text-white mb-1 break-words">
                              {project.projectType}
                            </h3>
                            <div className="flex items-start gap-1.5 text-xs sm:text-sm text-gray-400">
                              <MapPin size={14} className="flex-shrink-0 mt-0.5" />
                              <span className="break-words">{project.address}</span>
                            </div>
                          </div>
                          <span className={`${statusColors[project.status]} text-black px-2 sm:px-3 py-1 rounded-full text-xs font-semibold whitespace-nowrap flex-shrink-0`}>
                            {project.status}
                          </span>
                        </div>

                        {/* Info Grid - Stacks on Mobile */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2 text-xs sm:text-sm">
                          <div className="flex items-center gap-1.5 text-gray-400">
                            <User size={14} className="text-[#96D7FE] flex-shrink-0" />
                            <span className="truncate">{project.homeownerName}</span>
                          </div>
                          <div className="flex items-center gap-1.5 text-gray-400">
                            <Calendar size={14} className="text-[#96D7FE] flex-shrink-0" />
                            <span>{new Date(project.startDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</span>
                          </div>
                          <div className="flex items-center gap-1.5 text-gray-400">
                            <DollarSign size={14} className="text-[#96D7FE] flex-shrink-0" />
                            <span>${project.budget.toLocaleString()}</span>
                          </div>
                          <div className="flex items-center gap-1.5 text-gray-400">
                            <TrendingUp size={14} className="text-[#96D7FE] flex-shrink-0" />
                            <span>{project.progress}% Complete</span>
                          </div>
                        </div>

                        {/* Progress Bar */}
                        <div className="w-full bg-gray-700 rounded-full h-2">
                          <div
                            className="bg-[#96D7FE] h-2 rounded-full transition-all duration-500"
                            style={{ width: `${project.progress}%` }}
                          />
                        </div>

                        {/* View Button - Full Width on Mobile */}
                        <Button
                          onClick={(e) => {
                            e.stopPropagation();
                            navigate(`/project/${project.id}`);
                          }}
                          className="w-full sm:w-auto bg-[#96D7FE] hover:bg-[#7bc5ec] text-black font-semibold text-sm"
                        >
                          <Eye size={16} className="mr-1" />
                          View Details
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12">
                  <p className="text-gray-400 mb-4">No projects yet</p>
                  <CreateProject />
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
};

export default ProjectManagerDashboard;