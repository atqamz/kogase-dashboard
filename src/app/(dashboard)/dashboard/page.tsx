'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Project, User } from '@/lib/types';
import { useAuth } from '@/lib/auth-context';
import { Loading } from '@/components/ui/loading';
import { useToast } from '@/components/ui/use-toast';
import iamService from '@/lib/services/iam-service';
import telemetryService from '@/lib/services/telemetry-service';
import { BarChart, LineChart, PieChart, Users, Timer, Activity, FolderPlus, ArrowRight } from "lucide-react";
import { AnalyticsChart } from '@/components/dashboard/analytics-chart';
import { CreateProjectDialog } from '@/components/projects/create-project-dialog';
import { Badge } from '@/components/ui/badge';
import Link from 'next/link';
import { ScrollArea } from '@/components/ui/scroll-area';

export default function DashboardPage() {
  const router = useRouter();
  const { user } = useAuth();
  const { toast } = useToast();
  const [projects, setProjects] = useState<Project[]>([]);
  const [totalUsers, setTotalUsers] = useState(0);
  const [totalSessions, setTotalSessions] = useState(0);
  const [totalEvents, setTotalEvents] = useState(0);
  const [activeSessions, setActiveSessions] = useState(0);
  const [loading, setLoading] = useState(true);
  const [activeUsersData, setActiveUsersData] = useState<{name: string, value: number}[]>([]);
  const [sessionTrend, setSessionTrend] = useState<{name: string, value: number}[]>([]);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        
        // Get all projects
        const projectsData = await iamService.getProjects();
        setProjects(projectsData);
        
        // Aggregate metrics across all projects
        let userCount = 0;
        let sessionCount = 0;
        let eventCount = 0;
        let activeSessionCount = 0;
        
        for (const project of projectsData) {
          // Get sessions for this project
          const sessions = await telemetryService.getPlaySessions(project.id);
          sessionCount += sessions.length;
          activeSessionCount += sessions.filter(s => s.isActive).length;
          
          // Get events for this project
          const events = await telemetryService.getProjectEvents(project.id);
          eventCount += events.length;
          
          // Get unique users from sessions
          const uniqueUsers = new Set();
          sessions.forEach(session => {
            if (session.userId) uniqueUsers.add(session.userId);
          });
          userCount += uniqueUsers.size;
        }
        
        setTotalUsers(userCount);
        setTotalSessions(sessionCount);
        setTotalEvents(eventCount);
        setActiveSessions(activeSessionCount);
        
        // Generate dummy data for charts
        generateChartData();
        
        toast({
          title: "Dashboard updated",
          description: "Latest metrics have been loaded",
          duration: 3000
        });
        
      } catch (error) {
        console.error('Error fetching dashboard data:', error);
        toast({
          title: 'Error',
          description: 'Failed to load dashboard data',
          variant: 'destructive',
        });
      } finally {
        setLoading(false);
      }
    };
    
    fetchData();
  }, [toast]);
  
  const generateChartData = () => {
    // Sample data for active users (last 7 days)
    setActiveUsersData([
      { name: 'Mon', value: Math.floor(Math.random() * 100) + 50 },
      { name: 'Tue', value: Math.floor(Math.random() * 100) + 50 },
      { name: 'Wed', value: Math.floor(Math.random() * 100) + 50 },
      { name: 'Thu', value: Math.floor(Math.random() * 100) + 50 },
      { name: 'Fri', value: Math.floor(Math.random() * 100) + 50 },
      { name: 'Sat', value: Math.floor(Math.random() * 100) + 50 },
      { name: 'Sun', value: Math.floor(Math.random() * 100) + 50 },
    ]);
    
    // Sample data for session trends (last 7 days)
    setSessionTrend([
      { name: 'Mon', value: Math.floor(Math.random() * 150) + 100 },
      { name: 'Tue', value: Math.floor(Math.random() * 150) + 100 },
      { name: 'Wed', value: Math.floor(Math.random() * 150) + 100 },
      { name: 'Thu', value: Math.floor(Math.random() * 150) + 100 },
      { name: 'Fri', value: Math.floor(Math.random() * 150) + 100 },
      { name: 'Sat', value: Math.floor(Math.random() * 150) + 100 },
      { name: 'Sun', value: Math.floor(Math.random() * 150) + 100 },
    ]);
  };
  
  const handleCreateProject = async (name: string, description: string, ownerId: string) => {
    try {
      const newProject = await iamService.createProject({ name, description, ownerId });
      setProjects([...projects, newProject]);
      
      toast({
        title: 'Project created',
        description: `"${name}" has been created successfully`,
        duration: 3000
      });
      
      // Show a second success toast after a small delay
      setTimeout(() => {
        toast({
          title: 'Getting started',
          description: 'Configure your project settings to get started',
          duration: 5000
        });
      }, 300);
      
    } catch (error) {
      console.error('Error creating project:', error);
      toast({
        title: 'Error',
        description: 'Failed to create project. Please try again.',
        variant: 'destructive',
      });
      throw error; // Re-throw to let the dialog component handle it
    }
  };

  if (loading) {
    return <Loading message="Loading dashboard data..." />;
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col space-y-2 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-3xl font-bold">Admin Dashboard</h1>
          <p className="text-muted-foreground">
            Welcome back, {user?.displayName || user?.firstName || user?.email}
          </p>
        </div>

        <Button onClick={() => setIsCreateDialogOpen(true)}>
          <FolderPlus className="mr-2 h-4 w-4" />
          New Project
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="border-border hover:border-primary hover:shadow-sm transition-all">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Total Projects</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{projects.length}</div>
            <div className="flex items-center text-xs text-muted-foreground mt-1">
              <FolderPlus className="h-3.5 w-3.5 mr-1" />
              <span>All active projects</span>
            </div>
          </CardContent>
        </Card>
        
        <Card className="border-border hover:border-primary hover:shadow-sm transition-all">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Total Users</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalUsers.toLocaleString()}</div>
            <div className="flex items-center text-xs text-muted-foreground mt-1">
              <Users className="h-3.5 w-3.5 mr-1" />
              <span>Across all projects</span>
            </div>
          </CardContent>
        </Card>
        
        <Card className="border-border hover:border-primary hover:shadow-sm transition-all">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Total Sessions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalSessions.toLocaleString()}</div>
            <div className="flex items-center text-xs text-muted-foreground mt-1">
              <Timer className="h-3.5 w-3.5 mr-1" />
              <span>{activeSessions} active now</span>
            </div>
          </CardContent>
        </Card>
        
        <Card className="border-border hover:border-primary hover:shadow-sm transition-all">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Total Events</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalEvents.toLocaleString()}</div>
            <div className="flex items-center text-xs text-muted-foreground mt-1">
              <Activity className="h-3.5 w-3.5 mr-1" />
              <span>Telemetry events</span>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="border-border hover:border-primary hover:shadow-sm transition-all">
          <CardHeader>
            <CardTitle>Active Users (All Projects)</CardTitle>
            <CardDescription>Daily active users for the past week</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-[300px]">
              <AnalyticsChart data={activeUsersData} />
            </div>
          </CardContent>
        </Card>
        
        <Card className="border-border hover:border-primary hover:shadow-sm transition-all">
          <CardHeader>
            <CardTitle>Session Trends</CardTitle>
            <CardDescription>Session count for the past week</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-[300px]">
              <AnalyticsChart data={sessionTrend} />
            </div>
          </CardContent>
        </Card>
      </div>

      <Card className="border-border hover:border-primary hover:shadow-sm transition-all">
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle>Recent Projects</CardTitle>
            <CardDescription>Your most recently updated projects</CardDescription>
          </div>
          {projects.length > 0 && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => router.push('/dashboard/projects')}
            >
              View All
            </Button>
          )}
        </CardHeader>
        <CardContent>
          {projects.length === 0 ? (
            <div className="flex h-40 flex-col items-center justify-center rounded-lg border border-dashed p-8 text-center">
              <h3 className="text-lg font-medium">No projects found</h3>
              <p className="text-sm text-muted-foreground mt-2">
                Get started by creating a new project
              </p>
              <Button onClick={() => setIsCreateDialogOpen(true)} className="mt-4">
                <FolderPlus className="mr-2 h-4 w-4" />
                Create Project
              </Button>
            </div>
          ) : (
            <ScrollArea className="h-[350px]">
              <div className="rounded-md border">
                <table className="w-full">
                  <thead>
                    <tr className="border-b bg-muted/50">
                      <th className="text-left p-2 pl-4">Name</th>
                      <th className="text-left p-2">Status</th>
                      <th className="text-left p-2">Users</th>
                      <th className="text-left p-2">Last Updated</th>
                      <th className="text-right p-2 pr-4">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {projects.map((project) => (
                      <tr key={project.id} className="border-b hover:bg-muted/50">
                        <td className="p-2 pl-4 font-medium">{project.name}</td>
                        <td className="p-2">
                          <Badge variant="outline" className={project.isActive 
                            ? 'bg-green-50 text-green-700 border-green-200 dark:bg-green-900/30 dark:text-green-300 dark:border-green-800'
                            : 'bg-gray-50 text-gray-700 border-gray-200 dark:bg-gray-800/60 dark:text-gray-300 dark:border-gray-700'}>
                            {project.isActive ? 'Active' : 'Inactive'}
                          </Badge>
                        </td>
                        <td className="p-2">--</td>
                        <td className="p-2">{new Date(project.updatedAt).toLocaleDateString()}</td>
                        <td className="p-2 pr-4 text-right">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => router.push(`/projects/${project.id}`)}
                            className="text-xs"
                          >
                            Open <ArrowRight className="ml-1 h-3 w-3" />
                          </Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </ScrollArea>
          )}
        </CardContent>
      </Card>
      
      <CreateProjectDialog 
        open={isCreateDialogOpen}
        onOpenChange={setIsCreateDialogOpen}
        onSubmit={handleCreateProject}
      />
    </div>
  );
}