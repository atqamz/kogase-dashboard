'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import { Separator } from '@/components/ui/separator';
import { List } from 'lucide-react';

const navigation = [
  {
    name: 'Dashboard',
    href: '/dashboard',
    icon: 'layout-dashboard',
  },
  {
    name: 'Projects',
    href: '/projects',
    icon: 'folder',
  },
  {
    name: 'Analytics',
    href: '/analytics',
    icon: 'bar-chart',
  },
  {
    name: 'Sessions',
    href: '/sessions',
    icon: 'timer',
  },
  {
    name: 'Users',
    href: '/users',
    icon: 'users',
  },
  {
    name: 'Settings',
    href: '/settings',
    icon: 'settings',
  },
];

import { 
  LayoutDashboard, 
  Folder, 
  BarChart, 
  Timer, 
  Users, 
  Settings,
  Menu,
  User
} from 'lucide-react';

export default function Sidebar() {
  const pathname = usePathname();

  // Map icon names to components
  const getIcon = (icon: string, className: string = 'h-5 w-5') => {
    switch (icon) {
      case 'layout-dashboard':
        return <LayoutDashboard className={className} />;
      case 'folder':
        return <Folder className={className} />;
      case 'bar-chart':
        return <BarChart className={className} />;
      case 'timer':
        return <Timer className={className} />;
      case 'users':
        return <Users className={className} />;
      case 'settings':
        return <Settings className={className} />;
      case 'user':
        return <User className={className} />;
      case 'list':
        return <List className={className} />;
      default:
        return <LayoutDashboard className={className} />;
    }
  };

  // Add a check for project-related pages
  const isProjectPage = pathname.includes('/projects/');
  const projectId = isProjectPage ? pathname.split('/')[2] : null;

  // Project sub-navigation to be shown when in a project page
  const projectNavigation = projectId ? [
    {
      name: 'Overview',
      href: `/projects/${projectId}`,
      icon: 'layout-dashboard',
    },
    {
      name: 'Users',
      href: `/projects/${projectId}/users`,
      icon: 'users',
    },
    {
      name: 'Telemetry',
      href: `/projects/${projectId}/telemetry`,
      icon: 'bar-chart',
    },
    {
      name: 'Event Definitions',
      href: `/projects/${projectId}/event-definitions`,
      icon: 'list',
    },
    {
      name: 'Settings',
      href: `/projects/${projectId}/settings`,
      icon: 'settings',
    },
  ] : [];

  return (
    <div className="hidden border-r bg-background md:block sticky top-0 h-screen">
      <div className="flex h-full flex-col gap-2">
        <div className="flex h-16 items-center border-b px-6">
          <Link href="/dashboard" className="flex items-center gap-2 font-semibold">
            KOGASE
          </Link>
        </div>
        <div className="flex-1 overflow-auto py-2">
          <nav className="grid items-start px-2 text-sm font-medium">
            {navigation.map((item) => {
              const isActive = pathname === item.href || pathname.startsWith(`${item.href}/`);
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  className={cn(
                    'flex items-center gap-3 rounded-lg px-3 py-2 transition-all hover:text-primary',
                    isActive ? 'bg-muted text-primary' : 'text-muted-foreground'
                  )}
                >
                  {getIcon(item.icon)}
                  {item.name}
                </Link>
              );
            })}
          </nav>
        </div>
        {isProjectPage && projectId && (
          <>
            <div className="px-3 py-2">
              <h2 className="mb-2 px-4 text-lg font-semibold tracking-tight">
                Project
              </h2>
              <div className="space-y-1">
                {projectNavigation.map((item) => (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={cn(
                      'flex items-center rounded-md px-4 py-2 text-sm font-medium',
                      pathname === item.href
                        ? 'bg-accent text-accent-foreground'
                        : 'transparent hover:bg-accent hover:text-accent-foreground'
                    )}
                  >
                    {getIcon(item.icon, 'mr-2 h-4 w-4')}
                    {item.name}
                  </Link>
                ))}
              </div>
            </div>
            <Separator className="my-4" />
          </>
        )}
      </div>
    </div>
  );
}