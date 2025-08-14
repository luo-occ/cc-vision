'use client';

import { Outlet } from 'react-router-dom';
import { type NavigationProps, SidebarNav } from './sidebar-nav';
import { 
  BarChart3, 
  TrendingUp, 
  Activity, 
  Settings, 
  PieChart
} from 'lucide-react';

const navigation: NavigationProps = {
  primary: [
    {
      icon: <BarChart3 className="h-5 w-5" />,
      title: 'Dashboard',
      href: '/dashboard',
    },
    {
      icon: <PieChart className="h-5 w-5" />,
      title: 'Holdings',
      href: '/holdings',
    },
    {
      icon: <TrendingUp className="h-5 w-5" />,
      title: 'Performance',
      href: '/performance',
    },
    {
      icon: <Activity className="h-5 w-5" />,
      title: 'Activities',
      href: '/activities',
    },
    {
      icon: <Settings className="h-5 w-5" />,
      title: 'Settings',
      href: '/settings',
    },
  ],
  secondary: [],
};

export const AppLayout = () => {
  return (
    <div className="flex min-h-screen bg-background">
      <SidebarNav navigation={navigation} />
      <div className="relative flex h-screen w-full overflow-auto">
        <main className="flex w-full flex-1 flex-col">
          <div className="flex-1 overflow-auto">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
};