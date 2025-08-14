'use client';

import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { 
  BarChart3, 
  TrendingUp, 
  Activity, 
  Settings, 
  PieChart,
  PanelLeftClose,
  PanelLeftOpen 
} from 'lucide-react';

export interface NavLink {
  title: string;
  href: string;
  icon?: React.ReactNode;
}

export interface NavigationProps {
  primary: NavLink[];
  secondary?: NavLink[];
}

export function SidebarNav({ navigation }: { navigation: NavigationProps }) {
  const location = useLocation();
  const [collapsed, setCollapsed] = useState(true);

  return (
    <div
      className={cn({
        'h-screen border-r bg-secondary/50 transition-[width] duration-300 ease-in-out md:flex':
          true,
        'md:w-sidebar': !collapsed,
        'md:w-sidebar-collapsed': collapsed,
      })}
    >
      <div className="z-20 w-full rounded-xl md:flex">
        <div className="flex w-full flex-col">
          <div className="flex w-full flex-1 flex-col overflow-y-auto">
            <div className="flex-1">
              <nav
                aria-label="Sidebar"
                className="flex flex-shrink-0 flex-col space-y-3 p-2"
              >
                <div className="flex items-center justify-center pb-12 pt-6">
                  <Link to="/">
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary text-primary-foreground">
                      <PieChart className="h-6 w-6" />
                    </div>
                  </Link>

                  <span
                    className={cn(
                      'text-md ml-2 font-bold transition-opacity delay-100 duration-300 ease-in-out',
                      {
                        'sr-only opacity-0': collapsed,
                        'block opacity-100': !collapsed,
                      },
                    )}
                  >
                    Portfolio Tracker
                  </span>
                </div>

                {navigation?.primary?.map((item) => NavItem({ item, collapsed }))}
              </nav>
            </div>

            <div className="flex flex-shrink-0 flex-col p-2">
              {navigation?.secondary?.map((item) => NavItem({ item, collapsed }))}
              <div className="mt-2 border-t pt-2">
                <div className="flex justify-end">
                  <Button
                    title="Toggle Sidebar"
                    variant="ghost"
                    onClick={() => setCollapsed(!collapsed)}
                    className="text-muted-foreground hover:bg-transparent"
                    aria-label={collapsed ? 'Expand Sidebar' : 'Collapse Sidebar'}
                  >
                    {collapsed ? (
                      <PanelLeftOpen className="h-5 w-5" />
                    ) : (
                      <PanelLeftClose className="h-5 w-5" />
                    )}
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  function NavItem({
    item,
    collapsed,
    className,
    ...props
  }: {
    item: NavLink;
    collapsed: boolean;
    className?: string;
    onClick?: () => void;
  }) {
    const isActive = location.pathname === item.href || 
      (item.href !== '/' && location.pathname.startsWith(item.href));
    
    return (
      <Button
        key={item.title}
        variant={isActive ? 'secondary' : 'ghost'}
        asChild
        className={cn('h-12 justify-start text-foreground', className)}
      >
        <Link to={item.href} title={item.title} {...props}>
          {item.icon}
          <span
            className={cn({
              'ml-2 transition-opacity delay-100 duration-300 ease-in-out': true,
              'sr-only opacity-0': collapsed,
              'block opacity-100': !collapsed,
            })}
          >
            {item.title}
          </span>
        </Link>
      </Button>
    );
  }
}