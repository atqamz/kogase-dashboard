'use client';

import { useState, useEffect } from 'react';
import { useToast } from '@/components/ui/use-toast';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { AnalyticsChart } from "@/components/dashboard/analytics-chart";
import { Loading } from '@/components/ui/loading';
import { Project, PlaySession, TelemetryEvent } from '@/lib/types';
import iamService from '@/lib/services/iam-service';
import telemetryService from '@/lib/services/telemetry-service';
import { format, subDays, subMonths, addDays, startOfDay, endOfDay, startOfMonth, endOfMonth, eachDayOfInterval, parseISO, differenceInDays } from 'date-fns';
import { Separator } from '@/components/ui/separator';

interface MetricSummary {
  dau: number; // Daily Active Users
  wau: number; // Weekly Active Users
  mau: number; // Monthly Active Users
  totalUsers: number;
  newUsers: number;
  retention: number;
  sessionsPerUser: number;
  avgSessionDuration: number;
  projectComparison: {
    projectId: string;
    projectName: string;
    userCount: number;
    sessionCount: number;
    eventCount: number;
  }[];
}

export default function AnalyticsPage() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [selectedProject, setSelectedProject] = useState<string>('all');
  const [loadingProjects, setLoadingProjects] = useState(true);
  const [loadingData, setLoadingData] = useState(true);
  const [timeframe, setTimeframe] = useState('7d');
  const [metricSummary, setMetricSummary] = useState<MetricSummary | null>(null);
  const [dailyUserData, setDailyUserData] = useState<{name: string, value: number}[]>([]);
  const [monthlyUserData, setMonthlyUserData] = useState<{name: string, value: number}[]>([]);
  const [sessionData, setSessionData] = useState<{name: string, value: number}[]>([]);
  const { toast } = useToast();

  // Load projects
  useEffect(() => {
    const loadProjects = async () => {
      try {
        setLoadingProjects(true);
        const projectList = await iamService.getProjects();
        setProjects(projectList);
      } catch (error) {
        console.error('Error loading projects:', error);
        toast({
          title: 'Error',
          description: 'Failed to load projects. Please try again.',
          variant: 'destructive',
        });
      } finally {
        setLoadingProjects(false);
      }
    };

    loadProjects();
  }, [toast]);

  // Load analytics data
  useEffect(() => {
    const loadAnalytics = async () => {
      if (loadingProjects) return;

      try {
        setLoadingData(true);
        
        const now = new Date();
        const startDate = timeframe === '7d' 
          ? subDays(now, 7) 
          : timeframe === '30d' 
          ? subDays(now, 30) 
          : subDays(now, 90);
        
        // If "all" is selected, aggregate data from all projects
        if (selectedProject === 'all') {
          await loadAllProjectsData(startDate, now);
        } else {
          await loadSingleProjectData(selectedProject, startDate, now);
        }
        
      } catch (error) {
        console.error('Error loading analytics:', error);
        toast({
          title: 'Error',
          description: 'Failed to load analytics data. Please try again.',
          variant: 'destructive',
        });
      } finally {
        setLoadingData(false);
      }
    };

    loadAnalytics();
  }, [loadingProjects, selectedProject, timeframe, toast]);

  // Load data for all projects
  const loadAllProjectsData = async (startDate: Date, endDate: Date) => {
    // Initialize metrics
    let allSessions: PlaySession[] = [];
    let allEvents: TelemetryEvent[] = [];
    let totalUserSet = new Set<string>();
    let dauSet = new Set<string>();
    let wauSet = new Set<string>();
    let mauSet = new Set<string>();
    let newUserSet = new Set<string>();
    
    // For project comparison
    const projectComparison: MetricSummary['projectComparison'] = [];
    
    // Collect data from all projects
    for (const project of projects) {
      // Get sessions
      const sessions = await telemetryService.getPlaySessions(project.id, {
        startDate: startDate.toISOString(),
        endDate: endDate.toISOString()
      });
      
      // Get events
      const events = await telemetryService.getProjectEvents(project.id, {
        startDate: startDate.toISOString(),
        endDate: endDate.toISOString()
      });
      
      allSessions = [...allSessions, ...sessions];
      allEvents = [...allEvents, ...events];
      
      // Extract unique users
      const projectUserSet = new Set<string>();
      sessions.forEach(session => {
        if (session.userId) {
          projectUserSet.add(session.userId);
          totalUserSet.add(session.userId);
          
          // Check if this session is today
          const sessionDate = new Date(session.startedAt);
          if (differenceInDays(endDate, sessionDate) === 0) {
            dauSet.add(session.userId);
          }
          
          // Check if this session is this week
          if (differenceInDays(endDate, sessionDate) <= 7) {
            wauSet.add(session.userId);
          }
          
          // Check if this session is this month
          if (differenceInDays(endDate, sessionDate) <= 30) {
            mauSet.add(session.userId);
          }
          
          // Check if user is new (joined in the selected timeframe)
          if (sessionDate >= startDate) {
            newUserSet.add(session.userId);
          }
        }
      });
      
      // Add to project comparison
      projectComparison.push({
        projectId: project.id,
        projectName: project.name,
        userCount: projectUserSet.size,
        sessionCount: sessions.length,
        eventCount: events.length
      });
    }
    
    // Calculate retention (simplified - actually should be cohort-based)
    // Here we're just using: active users / total users
    const retention = totalUserSet.size > 0 ? (dauSet.size / totalUserSet.size) * 100 : 0;
    
    // Calculate sessions per user
    const sessionsPerUser = totalUserSet.size > 0 ? allSessions.length / totalUserSet.size : 0;
    
    // Calculate average session duration
    let totalDuration = 0;
    let completedSessions = 0;
    
    allSessions.forEach(session => {
      if (session.endedAt) {
        const start = new Date(session.startedAt).getTime();
        const end = new Date(session.endedAt).getTime();
        const duration = (end - start) / 1000; // in seconds
        if (duration > 0) {
          totalDuration += duration;
          completedSessions++;
        }
      }
    });
    
    const avgSessionDuration = completedSessions > 0 ? totalDuration / completedSessions : 0;
    
    // Create metric summary
    const summary: MetricSummary = {
      dau: dauSet.size,
      wau: wauSet.size,
      mau: mauSet.size,
      totalUsers: totalUserSet.size,
      newUsers: newUserSet.size,
      retention: parseFloat(retention.toFixed(1)),
      sessionsPerUser: parseFloat(sessionsPerUser.toFixed(2)),
      avgSessionDuration,
      projectComparison: projectComparison.sort((a, b) => b.userCount - a.userCount)
    };
    
    setMetricSummary(summary);
    
    // Generate chart data
    generateChartData(allSessions, startDate, endDate);
  };

  // Load data for a single project
  const loadSingleProjectData = async (projectId: string, startDate: Date, endDate: Date) => {
    // Get sessions
    const sessions = await telemetryService.getPlaySessions(projectId, {
      startDate: startDate.toISOString(),
      endDate: endDate.toISOString()
    });
    
    // Get events
    const events = await telemetryService.getProjectEvents(projectId, {
      startDate: startDate.toISOString(),
      endDate: endDate.toISOString()
    });
    
    // Extract unique users
    const totalUserSet = new Set<string>();
    const dauSet = new Set<string>();
    const wauSet = new Set<string>();
    const mauSet = new Set<string>();
    const newUserSet = new Set<string>();
    
    sessions.forEach(session => {
      if (session.userId) {
        totalUserSet.add(session.userId);
        
        // Check if this session is today
        const sessionDate = new Date(session.startedAt);
        if (differenceInDays(endDate, sessionDate) === 0) {
          dauSet.add(session.userId);
        }
        
        // Check if this session is this week
        if (differenceInDays(endDate, sessionDate) <= 7) {
          wauSet.add(session.userId);
        }
        
        // Check if this session is this month
        if (differenceInDays(endDate, sessionDate) <= 30) {
          mauSet.add(session.userId);
        }
        
        // Check if user is new (joined in the selected timeframe)
        if (sessionDate >= startDate) {
          newUserSet.add(session.userId);
        }
      }
    });
    
    // Calculate retention (simplified)
    const retention = totalUserSet.size > 0 ? (dauSet.size / totalUserSet.size) * 100 : 0;
    
    // Calculate sessions per user
    const sessionsPerUser = totalUserSet.size > 0 ? sessions.length / totalUserSet.size : 0;
    
    // Calculate average session duration
    let totalDuration = 0;
    let completedSessions = 0;
    
    sessions.forEach(session => {
      if (session.endedAt) {
        const start = new Date(session.startedAt).getTime();
        const end = new Date(session.endedAt).getTime();
        const duration = (end - start) / 1000; // in seconds
        if (duration > 0) {
          totalDuration += duration;
          completedSessions++;
        }
      }
    });
    
    const avgSessionDuration = completedSessions > 0 ? totalDuration / completedSessions : 0;
    
    // Create project comparison with just this project
    const projectComparison = [{
      projectId: projectId,
      projectName: projects.find(p => p.id === projectId)?.name || 'Unknown Project',
      userCount: totalUserSet.size,
      sessionCount: sessions.length,
      eventCount: events.length
    }];
    
    // Create metric summary
    const summary: MetricSummary = {
      dau: dauSet.size,
      wau: wauSet.size,
      mau: mauSet.size,
      totalUsers: totalUserSet.size,
      newUsers: newUserSet.size,
      retention: parseFloat(retention.toFixed(1)),
      sessionsPerUser: parseFloat(sessionsPerUser.toFixed(2)),
      avgSessionDuration,
      projectComparison
    };
    
    setMetricSummary(summary);
    
    // Generate chart data
    generateChartData(sessions, startDate, endDate);
  };

  // Generate chart data based on sessions
  const generateChartData = (sessions: PlaySession[], startDate: Date, endDate: Date) => {
    // For daily users chart (last 7/30/90 days depending on timeframe)
    const days = eachDayOfInterval({ start: startDate, end: endDate });
    const dailyData = days.map(day => {
      const dayStart = startOfDay(day);
      const dayEnd = endOfDay(day);
      
      // Find users active on this day
      const activeUsers = new Set<string>();
      sessions.forEach(session => {
        const sessionDate = new Date(session.startedAt);
        if (sessionDate >= dayStart && sessionDate <= dayEnd && session.userId) {
          activeUsers.add(session.userId);
        }
      });
      
      return {
        name: format(day, timeframe === '7d' ? 'EEE' : 'MMM dd'),
        value: activeUsers.size
      };
    });
    
    setDailyUserData(dailyData);
    
    // For monthly users chart (last 6 months)
    const monthlyData = [];
    for (let i = 5; i >= 0; i--) {
      const monthStart = startOfMonth(subMonths(new Date(), i));
      const monthEnd = endOfMonth(subMonths(new Date(), i));
      
      // Find users active in this month
      const activeUsers = new Set<string>();
      sessions.forEach(session => {
        const sessionDate = new Date(session.startedAt);
        if (sessionDate >= monthStart && sessionDate <= monthEnd && session.userId) {
          activeUsers.add(session.userId);
        }
      });
      
      monthlyData.push({
        name: format(monthStart, 'MMM'),
        value: activeUsers.size
      });
    }
    
    setMonthlyUserData(monthlyData);
    
    // For session count chart
    const sessionData = days.map(day => {
      const dayStart = startOfDay(day);
      const dayEnd = endOfDay(day);
      
      // Count sessions on this day
      const dailySessions = sessions.filter(session => {
        const sessionDate = new Date(session.startedAt);
        return sessionDate >= dayStart && sessionDate <= dayEnd;
      });
      
      return {
        name: format(day, timeframe === '7d' ? 'EEE' : 'MMM dd'),
        value: dailySessions.length
      };
    });
    
    setSessionData(sessionData);
  };

  // Format duration in seconds to readable time
  const formatDuration = (seconds: number) => {
    if (seconds < 60) return `${Math.round(seconds)}s`;
    
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = Math.round(seconds % 60);
    
    if (minutes < 60) {
      return `${minutes}m ${remainingSeconds}s`;
    }
    
    const hours = Math.floor(minutes / 60);
    const remainingMinutes = minutes % 60;
    
    return `${hours}h ${remainingMinutes}m`;
  };

  if (loadingProjects || (loadingData && !metricSummary)) {
    return <Loading message="Loading analytics data..." />;
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col space-y-2 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Analytics</h1>
          <p className="text-muted-foreground">
            Key metrics and telemetry insights for your projects
          </p>
        </div>
        
        <div className="flex flex-col space-y-2 sm:flex-row sm:space-y-0 sm:space-x-2">
          <Select 
            value={timeframe} 
            onValueChange={setTimeframe}
          >
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Select timeframe" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="7d">Last 7 days</SelectItem>
              <SelectItem value="30d">Last 30 days</SelectItem>
              <SelectItem value="90d">Last 90 days</SelectItem>
              <SelectItem value="6m">Last 6 months</SelectItem>
            </SelectContent>
          </Select>
          
          <Select 
            value={selectedProject} 
            onValueChange={setSelectedProject}
          >
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Select project" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Projects</SelectItem>
              {projects.map(project => (
                <SelectItem key={project.id} value={project.id}>
                  {project.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>
      <Separator />

      {loadingData ? (
        <Loading message="Updating analytics data..." />
      ) : metricSummary ? (
        <>
          {/* Key metrics cards */}
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">DAU / MAU Ratio</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {metricSummary.mau > 0 
                    ? `${((metricSummary.dau / metricSummary.mau) * 100).toFixed(1)}%` 
                    : 'N/A'}
                </div>
                <p className="text-xs text-muted-foreground">
                  {metricSummary.dau.toLocaleString()} daily / {metricSummary.mau.toLocaleString()} monthly users
                </p>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">User Retention</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {metricSummary.retention}%
                </div>
                <p className="text-xs text-muted-foreground">
                  Active users ratio
                </p>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Sessions per User</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {metricSummary.sessionsPerUser}
                </div>
                <p className="text-xs text-muted-foreground">
                  Average per active user
                </p>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Avg. Session Time</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {formatDuration(metricSummary.avgSessionDuration)}
                </div>
                <p className="text-xs text-muted-foreground">
                  Time spent per session
                </p>
              </CardContent>
            </Card>
          </div>
          
          {/* Charts and detailed metrics */}
          <Tabs defaultValue="users" className="space-y-4">
            <TabsList>
              <TabsTrigger value="users">Users</TabsTrigger>
              <TabsTrigger value="sessions">Sessions</TabsTrigger>
              <TabsTrigger value="projects">Projects</TabsTrigger>
            </TabsList>
            
            <TabsContent value="users" className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Card>
                  <CardHeader>
                    <CardTitle>Daily Active Users</CardTitle>
                    <CardDescription>
                      Users active each day
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="pt-2">
                    <div className="h-[300px]">
                      <AnalyticsChart data={dailyUserData} />
                    </div>
                  </CardContent>
                </Card>
                
                <Card>
                  <CardHeader>
                    <CardTitle>Monthly Active Users</CardTitle>
                    <CardDescription>
                      Users active each month
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="pt-2">
                    <div className="h-[300px]">
                      <AnalyticsChart data={monthlyUserData} />
                    </div>
                  </CardContent>
                </Card>
              </div>
              
              <Card>
                <CardHeader>
                  <CardTitle>User Metrics</CardTitle>
                  <CardDescription>
                    Key user engagement metrics
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <dl className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
                    <div className="bg-muted/50 p-4 rounded-lg">
                      <dt className="text-sm font-medium text-muted-foreground">Total Users</dt>
                      <dd className="mt-1 text-2xl font-semibold">{metricSummary.totalUsers.toLocaleString()}</dd>
                    </div>
                    <div className="bg-muted/50 p-4 rounded-lg">
                      <dt className="text-sm font-medium text-muted-foreground">New Users</dt>
                      <dd className="mt-1 text-2xl font-semibold">{metricSummary.newUsers.toLocaleString()}</dd>
                    </div>
                    <div className="bg-muted/50 p-4 rounded-lg">
                      <dt className="text-sm font-medium text-muted-foreground">WAU</dt>
                      <dd className="mt-1 text-2xl font-semibold">{metricSummary.wau.toLocaleString()}</dd>
                    </div>
                    <div className="bg-muted/50 p-4 rounded-lg">
                      <dt className="text-sm font-medium text-muted-foreground">MAU</dt>
                      <dd className="mt-1 text-2xl font-semibold">{metricSummary.mau.toLocaleString()}</dd>
                    </div>
                  </dl>
                </CardContent>
              </Card>
            </TabsContent>
            
            <TabsContent value="sessions" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Daily Sessions</CardTitle>
                  <CardDescription>
                    Number of sessions started each day
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="h-[300px]">
                    <AnalyticsChart data={sessionData} />
                  </div>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader>
                  <CardTitle>Session Statistics</CardTitle>
                  <CardDescription>
                    Detailed session metrics
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                    <div className="bg-muted/50 p-4 rounded-lg">
                      <dt className="text-sm font-medium text-muted-foreground">Avg. Sessions per Day</dt>
                      <dd className="mt-1 text-2xl font-semibold">
                        {(sessionData.reduce((sum, day) => sum + day.value, 0) / sessionData.length).toFixed(1)}
                      </dd>
                    </div>
                    <div className="bg-muted/50 p-4 rounded-lg">
                      <dt className="text-sm font-medium text-muted-foreground">Avg. Session Duration</dt>
                      <dd className="mt-1 text-2xl font-semibold">
                        {formatDuration(metricSummary.avgSessionDuration)}
                      </dd>
                    </div>
                    <div className="bg-muted/50 p-4 rounded-lg">
                      <dt className="text-sm font-medium text-muted-foreground">Sessions per User</dt>
                      <dd className="mt-1 text-2xl font-semibold">
                        {metricSummary.sessionsPerUser}
                      </dd>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
            
            <TabsContent value="projects" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Project Comparison</CardTitle>
                  <CardDescription>
                    Usage metrics by project
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {metricSummary.projectComparison.length === 0 ? (
                    <div className="text-center py-6">
                      <p className="text-muted-foreground">No projects data available</p>
                    </div>
                  ) : (
                    <div className="border rounded-md">
                      <table className="w-full">
                        <thead>
                          <tr className="border-b bg-muted/50">
                            <th className="text-left p-2 pl-4">Project</th>
                            <th className="text-right p-2">Users</th>
                            <th className="text-right p-2">Sessions</th>
                            <th className="text-right p-2 pr-4">Events</th>
                          </tr>
                        </thead>
                        <tbody>
                          {metricSummary.projectComparison.map((project) => (
                            <tr key={project.projectId} className="border-b">
                              <td className="p-2 pl-4 font-medium">{project.projectName}</td>
                              <td className="p-2 text-right">{project.userCount.toLocaleString()}</td>
                              <td className="p-2 text-right">{project.sessionCount.toLocaleString()}</td>
                              <td className="p-2 pr-4 text-right">{project.eventCount.toLocaleString()}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </>
      ) : (
        <div className="flex h-60 flex-col items-center justify-center rounded-lg border border-dashed p-8 text-center">
          <h3 className="text-lg font-medium">No analytics data available</h3>
          <p className="text-sm text-muted-foreground mt-2">
            Try selecting a different project or timeframe, or check back later
          </p>
        </div>
      )}
    </div>
  );
}