import React from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarHeader,
  SidebarFooter,
} from "@/components/ui/sidebar";
import { Home, User, LogOut } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { Button } from '@/components/ui/button';

export function AppSidebar() {
  const location = useLocation();
  const navigate = useNavigate();
  const { isHomeownerAuthenticated, isManagerAuthenticated, currentHomeowner, currentManager, logoutHomeowner, logoutManager } = useAuth();
  
  const menuItems = [
    { title: 'Home', icon: Home, href: '/' },
    { 
      title: isHomeownerAuthenticated ? 'My Project' : 'Homeowner Login', 
      icon: User, 
      href: isHomeownerAuthenticated ? '/homeowner' : '/homeowner/login' 
    },
  ];

  const handleLogout = () => {
    if (isHomeownerAuthenticated) {
      logoutHomeowner();
      navigate('/homeowner/login');
    } else if (isManagerAuthenticated) {
      logoutManager();
      navigate('/manager/login');
    }
  };

  return (
    <Sidebar>
      <SidebarHeader className="border-b border-[#96D7FE]/20 bg-black">
        <Link to="/" className="flex items-center justify-center px-4 py-4">
          <img 
            src="/arctic-roofing-logo.png" 
            alt="Arctic Roofing" 
            className="h-16 w-auto object-contain"
          />
        </Link>
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel className="text-[#96D7FE]">Navigation</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {menuItems.map((item) => (
                <SidebarMenuItem key={item.href}>
                  <SidebarMenuButton asChild isActive={location.pathname === item.href}>
                    <Link to={item.href}>
                      <item.icon className="h-4 w-4" />
                      <span>{item.title}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
      {(isHomeownerAuthenticated || isManagerAuthenticated) && (
        <SidebarFooter className="border-t border-[#96D7FE]/20 p-4">
          <div className="mb-2">
            <p className="text-xs text-gray-400">Logged in as</p>
            <p className="text-sm font-semibold text-[#96D7FE] truncate">
              {isHomeownerAuthenticated ? currentHomeowner?.name : currentManager?.name}
            </p>
            {isManagerAuthenticated && (
              <p className="text-xs text-gray-500">Project Manager</p>
            )}
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={handleLogout}
            className="w-full gap-2 border-[#96D7FE]/30 text-[#96D7FE] hover:bg-[#96D7FE]/10"
          >
            <LogOut size={16} />
            Logout
          </Button>
        </SidebarFooter>
      )}
    </Sidebar>
  );
}