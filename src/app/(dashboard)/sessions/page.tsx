'use client';

import { useState, useEffect } from 'react';
import { useToast } from '@/components/ui/use-toast';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Loading } from '@/components/ui/loading';
import { Project, PlaySession } from '@/lib/types';
import iamService from '@/lib/services/iam-service';
import telemetryService from '@/lib/services/telemetry-service';

export default function SessionsPage() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [projectMap, setProjectMap] = useState<Record<string, Project>>({});
  const [selectedProjectFilter, setSelectedProjectFilter] = useState<string>('all');
  const [sessions, setSessions] = useState<PlaySession[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [timeRange, setTimeRange] = useState('7d');
  const [filteredSessions, setFilteredSessions] = useState<PlaySession[]>([]);
  const { toast } = useToast();

  // Load projects
  useEffect(() => {
    const loadProjects = async () => {
      try {
        setLoading(true);
        const projectList = await iamService.getProjects();
        setProjects(projectList);
        
        // Create a map of project IDs to project objects for quick lookup
        const projectMapObj: Record<string, Project> = {};
        projectList.forEach(project => {
          projectMapObj[project.id] = project;
        });
        setProjectMap(projectMapObj);
      } catch (error) {
        console.error('Error loading projects:', error);
        toast({
          title: 'Error',
          description: 'Failed to load projects. Please try again.',
          variant: 'destructive',
        });
      } finally {
        setLoading(false);
      }
    };

    loadProjects();
  }, [toast]);

  // Load sessions from all projects
  useEffect(() => {
    const loadSessions = async () => {
      try {
        setLoading(true);
        
        // Calculate start date based on time range
        const filters: any = {};
        const startDate = new Date();
        if (timeRange === '1d') {
          startDate.setDate(startDate.getDate() - 1);
          filters.startDate = startDate.toISOString();
        } else if (timeRange === '7d') {
          startDate.setDate(startDate.getDate() - 7);
          filters.startDate = startDate.toISOString();
        } else if (timeRange === '30d') {
          startDate.setDate(startDate.getDate() - 30);
          filters.startDate = startDate.toISOString();
        } else if (timeRange === '90d') {
          startDate.setDate(startDate.getDate() - 90);
          filters.startDate = startDate.toISOString();
        }
        
        if (statusFilter !== 'all') {
          filters.isActive = statusFilter === 'active';
        }
        
        // Get all sessions across all projects
        const sessionsData = await telemetryService.getAllPlaySessions(filters);
        setSessions(sessionsData);
      } catch (error) {
        console.error('Error loading sessions:', error);
        toast({
          title: 'Error',
          description: 'Failed to load sessions. Please try again.',
          variant: 'destructive',
        });
      } finally {
        setLoading(false);
      }
    };

    loadSessions();
  }, [statusFilter, timeRange, toast]);

  // Filter sessions by project, search term
  useEffect(() => {
    let filtered = [...sessions];
    
    // First filter by project if a specific one is selected
    if (selectedProjectFilter !== 'all') {
      filtered = filtered.filter(session => session.projectId === selectedProjectFilter);
    }
    
    // Then apply search term filter
    if (searchTerm.trim()) {
      const search = searchTerm.toLowerCase();
      filtered = filtered.filter(session => {
        // Search by session ID, device ID, user ID, or project name
        const projectName = projectMap[session.projectId]?.name?.toLowerCase() || '';
        return (
          session.id.toLowerCase().includes(search) ||
          session.deviceId.toLowerCase().includes(search) ||
          (session.userId && session.userId.toLowerCase().includes(search)) ||
          (session.platform && session.platform.toLowerCase().includes(search)) ||
          projectName.includes(search)
        );
      });
    }
    
    setFilteredSessions(filtered);
  }, [sessions, searchTerm, selectedProjectFilter, projectMap]);

  // Format timestamp
  const formatTimestamp = (timestamp: string): string => {
    const date = new Date(timestamp);
    return date.toLocaleString();
  };

  // Format duration
  const formatDuration = (startTime: string, endTime?: string): string => {
    if (!endTime) return 'In progress';
    
    const start = new Date(startTime).getTime();
    const end = new Date(endTime).getTime();
    const durationSeconds = Math.floor((end - start) / 1000);
    
    if (durationSeconds < 60) return `${durationSeconds}s`;
    const minutes = Math.floor(durationSeconds / 60);
    const remainingSeconds = durationSeconds % 60;
    
    if (minutes < 60) return `${minutes}m ${remainingSeconds}s`;
    const hours = Math.floor(minutes / 60);
    const remainingMinutes = minutes % 60;
    
    return `${hours}h ${remainingMinutes}m ${remainingSeconds}s`;
  };

  // Get status badge class
  const getStatusBadgeClass = (isActive: boolean): string => {
    return isActive
      ? 'bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300'
      : 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300';
  };

  // Get project name from ID
  const getProjectName = (projectId: string): string => {
    return projectMap[projectId]?.name || 'Unknown Project';
  };

  // Calculate session statistics
  const sessionStats = {
    total: filteredSessions.length,
    active: filteredSessions.filter(s => s.isActive).length,
    completed: filteredSessions.filter(s => !s.isActive).length,
    projectCount: new Set(filteredSessions.map(s => s.projectId)).size
  };

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col space-y-2 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Sessions</h1>
          <p className="text-muted-foreground">
            View and analyze player sessions across all projects
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <Select
            value={timeRange}
            onValueChange={setTimeRange}
            disabled={loading}
          >
            <SelectTrigger className="w-[130px]">
              <SelectValue placeholder="Time range" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="1d">Last 24h</SelectItem>
              <SelectItem value="7d">Last 7 days</SelectItem>
              <SelectItem value="30d">Last 30 days</SelectItem>
              <SelectItem value="90d">Last 90 days</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
      <Separator />

      {/* Stats cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Sessions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{sessionStats.total}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Sessions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{sessionStats.active}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Completed Sessions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{sessionStats.completed}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Projects</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{sessionStats.projectCount}</div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader className="pb-3">
          <CardTitle>Session Browser</CardTitle>
          <div className="flex flex-wrap mt-2 items-center gap-2">
            <Input
              placeholder="Search sessions..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="max-w-sm"
            />
            <Select
              value={statusFilter}
              onValueChange={setStatusFilter}
              disabled={loading}
            >
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="All statuses" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All statuses</SelectItem>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="ended">Ended</SelectItem>
              </SelectContent>
            </Select>
            <Select
              value={selectedProjectFilter}
              onValueChange={setSelectedProjectFilter}
              disabled={loading || projects.length === 0}
            >
              <SelectTrigger className="w-[200px]">
                <SelectValue placeholder="All projects" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All projects</SelectItem>
                {projects.map((project) => (
                  <SelectItem key={project.id} value={project.id}>
                    {project.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardHeader>
        <CardContent>
          {loading ? (
            <Loading message="Loading sessions..." />
          ) : sessions.length === 0 ? (
            <div className="flex h-40 flex-col items-center justify-center rounded-lg border border-dashed p-8 text-center">
              <h3 className="text-lg font-medium">No sessions found</h3>
              <p className="text-sm text-muted-foreground">
                Try adjusting your filters or select a different time range
              </p>
            </div>
          ) : (
            <>
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Project</TableHead>
                      <TableHead>User ID</TableHead>
                      <TableHead>Device ID</TableHead>
                      <TableHead>Start Time</TableHead>
                      <TableHead>Duration</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Platform</TableHead>
                      <TableHead>App Version</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredSessions.map((session) => (
                      <TableRow key={session.id}>
                        <TableCell>
                          <Badge variant="outline" className="font-normal">
                            {getProjectName(session.projectId)}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          {session.userId || 'Anonymous'}
                        </TableCell>
                        <TableCell>
                          {session.deviceId.substring(0, 8)}...
                        </TableCell>
                        <TableCell>{formatTimestamp(session.startedAt)}</TableCell>
                        <TableCell>{formatDuration(session.startedAt, session.endedAt)}</TableCell>
                        <TableCell>
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusBadgeClass(session.isActive)}`}>
                            {session.isActive ? 'Active' : 'Ended'}
                          </span>
                        </TableCell>
                        <TableCell>{session.platform || 'Unknown'}</TableCell>
                        <TableCell>{session.appVersion || 'Unknown'}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
              
              <div className="flex items-center justify-between mt-4">
                <div className="text-sm text-muted-foreground">
                  Showing {filteredSessions.length} of {sessions.length} sessions
                </div>
              </div>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
}