'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { 
  Menu, 
  LayoutDashboard, 
  Folder, 
  BarChart, 
  Timer,
  Users, 
  Settings,
  User,
  List
} from 'lucide-react';

const navigation = [
  {
    name: 'Dashboard',
    href: '/dashboard',
    icon: LayoutDashboard,
  },
  {
    name: 'Projects',
    href: '/projects',
    icon: Folder,
  },
  {
    name: 'Analytics',
    href: '/analytics',
    icon: BarChart,
  },
  {
    name: 'Sessions',
    href: '/sessions',
    icon: Timer,
  },
  {
    name: 'Users',
    href: '/users',
    icon: Users,
  },
  {
    name: 'Settings',
    href: '/settings',
    icon: Settings,
  },
];

export default function MobileNav() {
  const pathname = usePathname();
  
  // Add a check for project-related pages
  const isProjectPage = pathname.includes('/projects/');
  const projectId = isProjectPage ? pathname.split('/')[2] : null;

  // Project sub-navigation to be shown when in a project page
  const projectNavigation = projectId ? [
    {
      name: 'Overview',
      href: `/projects/${projectId}`,
      icon: LayoutDashboard,
    },
    {
      name: 'Users',
      href: `/projects/${projectId}/users`,
      icon: Users,
    },
    {
      name: 'Telemetry',
      href: `/projects/${projectId}/telemetry`,
      icon: BarChart,
    },
    {
      name: 'Event Definitions',
      href: `/projects/${projectId}/event-definitions`,
      icon: List,
    },
    {
      name: 'Settings',
      href: `/projects/${projectId}/settings`,
      icon: Settings,
    },
  ] : [];

  return (
    <Sheet>
      <SheetTrigger asChild>
        <Button variant="outline" size="icon" className="md:hidden">
          <Menu className="h-5 w-5" />
          <span className="sr-only">Toggle menu</span>
        </Button>
      </SheetTrigger>
      <SheetContent side="left" className="pr-0">
        <div className="my-4 h-full overflow-y-auto pb-10">
          <div className="flex flex-col gap-4">
            <Link href="/dashboard" className="flex items-center gap-2 px-4">
              <span className="font-bold">KOGASE</span>
            </Link>
            <Separator />
            <nav className="grid gap-1 px-2">
              {navigation.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    'flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium hover:bg-accent hover:text-accent-foreground',
                    pathname === item.href ? 'bg-accent text-accent-foreground' : 'transparent'
                  )}
                >
                  <item.icon className="h-5 w-5" />
                  {item.name}
                </Link>
              ))}
            </nav>
            
            {isProjectPage && projectId && (
              <>
                <Separator />
                <div className="px-4">
                  <h3 className="mb-1 text-sm font-semibold">Project</h3>
                  <nav className="grid gap-1">
                    {projectNavigation.map((item) => (
                      <Link
                        key={item.href}
                        href={item.href}
                        className={cn(
                          'flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium hover:bg-accent hover:text-accent-foreground',
                          pathname === item.href ? 'bg-accent text-accent-foreground' : 'transparent'
                        )}
                      >
                        <item.icon className="h-5 w-5" />
                        {item.name}
                      </Link>
                    ))}
                  </nav>
                </div>
              </>
            )}
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}