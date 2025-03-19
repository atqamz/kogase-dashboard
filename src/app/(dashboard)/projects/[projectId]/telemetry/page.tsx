'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Loader2, Download, BarChart, Activity, Users } from 'lucide-react';
import { Loading } from '@/components/ui/loading';
import { useToast } from '@/components/ui/use-toast';
import telemetryService from '@/lib/services/telemetry-service';
import iamService from '@/lib/services/iam-service';
import { EventDefinition, PlaySession, Project, TelemetryEvent } from '@/lib/types';
import { format } from 'date-fns';

export default function TelemetryDashboardPage() {
  const params = useParams();
  const projectId = params.projectId as string;
  const { toast } = useToast();
  
  const [project, setProject] = useState<Project | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('events');
  
  // Events data
  const [events, setEvents] = useState<TelemetryEvent[]>([]);
  const [eventDefinitions, setEventDefinitions] = useState<EventDefinition[]>([]);
  const [selectedEventDefinition, setSelectedEventDefinition] = useState<string>('all');
  
  // Play sessions data
  const [playSessions, setPlaySessions] = useState<PlaySession[]>([]);
  
  useEffect(() => {
    const fetchProjectData = async () => {
      try {
        setIsLoading(true);
        
        // Get project details
        const projectData = await iamService.getProject(projectId);
        setProject(projectData);
        
        // Load initial data for active tab
        if (activeTab === 'events') {
          await loadEventsData();
        } else if (activeTab === 'sessions') {
          await loadSessionsData();
        }
      } catch (error) {
        console.error('Error loading project data:', error);
        toast({
          title: 'Error',
          description: 'Failed to load project data. Please try again.',
          variant: 'destructive',
        });
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchProjectData();
  }, [projectId, toast]);
  
  const loadEventsData = async () => {
    try {
      // Get event definitions
      const definitions = await telemetryService.getEventDefinitions(projectId);
      setEventDefinitions(definitions);
      
      // Get telemetry events
      const eventsData = await telemetryService.getProjectEvents(projectId);
      setEvents(eventsData);
    } catch (error) {
      console.error('Error loading events data:', error);
      toast({
        title: 'Error',
        description: 'Failed to load events data. Please try again.',
        variant: 'destructive',
      });
    }
  };
  
  const loadSessionsData = async () => {
    try {
      // Get play sessions
      const sessionsData = await telemetryService.getPlaySessions(projectId);
      setPlaySessions(sessionsData);
    } catch (error) {
      console.error('Error loading sessions data:', error);
      toast({
        title: 'Error',
        description: 'Failed to load sessions data. Please try again.',
        variant: 'destructive',
      });
    }
  };
  
  const handleTabChange = async (tab: string) => {
    setActiveTab(tab);
    
    // Load data for the selected tab if not already loaded
    if (tab === 'events' && eventDefinitions.length === 0) {
      await loadEventsData();
    } else if (tab === 'sessions' && playSessions.length === 0) {
      await loadSessionsData();
    }
  };
  
  const handleEventDefinitionChange = async (value: string) => {
    setSelectedEventDefinition(value);
    
    try {
      // Filter events by definition if not 'all'
      if (value === 'all') {
        const allEvents = await telemetryService.getProjectEvents(projectId);
        setEvents(allEvents);
      } else {
        const filteredEvents = await telemetryService.getProjectEvents(projectId, {
          eventDefinitionId: value
        });
        setEvents(filteredEvents);
      }
    } catch (error) {
      console.error('Error filtering events:', error);
      toast({
        title: 'Error',
        description: 'Failed to filter events. Please try again.',
        variant: 'destructive',
      });
    }
  };
  
  if (isLoading) {
    return <Loading message="Loading telemetry data..." />;
  }
  
  return (
    <div className="container mx-auto py-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold">{project?.name} Telemetry</h1>
        <p className="text-muted-foreground">{project?.description}</p>
      </div>
      
      <Tabs value={activeTab} onValueChange={handleTabChange}>
        <TabsList className="grid w-full grid-cols-3 mb-6">
          <TabsTrigger value="events">
            <Activity className="mr-2 h-4 w-4" />
            Events
          </TabsTrigger>
          <TabsTrigger value="sessions">
            <Users className="mr-2 h-4 w-4" />
            Sessions
          </TabsTrigger>
          <TabsTrigger value="metrics">
            <BarChart className="mr-2 h-4 w-4" />
            Metrics
          </TabsTrigger>
        </TabsList>
        
        {/* Events Tab */}
        <TabsContent value="events">
          <div className="mb-6">
            <Card>
              <CardHeader>
                <div className="flex justify-between items-center">
                  <div>
                    <CardTitle>Event Tracking</CardTitle>
                    <CardDescription>
                      View and filter telemetry events for your project
                    </CardDescription>
                  </div>
                  <Button variant="outline" size="sm">
                    <Download className="mr-2 h-4 w-4" />
                    Export Data
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="flex items-center space-x-4 mb-6">
                  <Select
                    value={selectedEventDefinition}
                    onValueChange={handleEventDefinitionChange}
                  >
                    <SelectTrigger className="w-[200px]">
                      <SelectValue placeholder="Select Event Type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Events</SelectItem>
                      {eventDefinitions.map((def) => (
                        <SelectItem key={def.id} value={def.id}>
                          {def.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                
                {events.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    No events found. Events will appear here once your application starts tracking them.
                  </div>
                ) : (
                  <div className="border rounded-md">
                    <table className="w-full">
                      <thead>
                        <tr className="border-b bg-muted/50">
                          <th className="text-left p-2 pl-4">Event</th>
                          <th className="text-left p-2">Session</th>
                          <th className="text-left p-2">User</th>
                          <th className="text-left p-2">Device</th>
                          <th className="text-left p-2">Timestamp</th>
                        </tr>
                      </thead>
                      <tbody>
                        {events.map((event) => {
                          // Find event definition name
                          const eventDef = eventDefinitions.find(
                            (def) => def.id === event.eventDefinitionId
                          );
                          
                          return (
                            <tr key={event.id} className="border-b hover:bg-muted/50">
                              <td className="p-2 pl-4 font-medium">
                                {eventDef?.name || "Unknown Event"}
                              </td>
                              <td className="p-2">
                                {event.playSessionId.substring(0, 8)}...
                              </td>
                              <td className="p-2">
                                {event.userId || "Anonymous"}
                              </td>
                              <td className="p-2">
                                {event.deviceId.substring(0, 8)}...
                              </td>
                              <td className="p-2">
                                {format(new Date(event.timestamp), "MMM d, yyyy HH:mm:ss")}
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>
        
        {/* Sessions Tab */}
        <TabsContent value="sessions">
          <div className="mb-6">
            <Card>
              <CardHeader>
                <div className="flex justify-between items-center">
                  <div>
                    <CardTitle>Play Sessions</CardTitle>
                    <CardDescription>
                      View user play sessions for your project
                    </CardDescription>
                  </div>
                  <Button variant="outline" size="sm">
                    <Download className="mr-2 h-4 w-4" />
                    Export Data
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                {playSessions.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    No play sessions found. Sessions will appear here once users start playing your game.
                  </div>
                ) : (
                  <div className="border rounded-md">
                    <table className="w-full">
                      <thead>
                        <tr className="border-b bg-muted/50">
                          <th className="text-left p-2 pl-4">Session ID</th>
                          <th className="text-left p-2">User</th>
                          <th className="text-left p-2">Device</th>
                          <th className="text-left p-2">Started</th>
                          <th className="text-left p-2">Duration</th>
                          <th className="text-left p-2">Status</th>
                        </tr>
                      </thead>
                      <tbody>
                        {playSessions.map((session) => {
                          const startTime = new Date(session.startedAt);
                          const endTime = session.endedAt ? new Date(session.endedAt) : null;
                          
                          // Calculate duration
                          let duration = "In progress";
                          if (endTime) {
                            const durationMs = endTime.getTime() - startTime.getTime();
                            const durationMinutes = Math.floor(durationMs / (1000 * 60));
                            duration = `${durationMinutes} min`;
                          }
                          
                          return (
                            <tr key={session.id} className="border-b hover:bg-muted/50">
                              <td className="p-2 pl-4 font-medium">
                                {session.id.substring(0, 8)}...
                              </td>
                              <td className="p-2">
                                {session.userId || "Anonymous"}
                              </td>
                              <td className="p-2">
                                {session.deviceId.substring(0, 8)}...
                              </td>
                              <td className="p-2">
                                {format(startTime, "MMM d, yyyy HH:mm")}
                              </td>
                              <td className="p-2">{duration}</td>
                              <td className="p-2">
                                <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${
                                  session.isActive
                                    ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300"
                                    : "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300"
                                }`}>
                                  {session.isActive ? "Active" : "Ended"}
                                </span>
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>
        
        {/* Metrics Tab */}
        <TabsContent value="metrics">
          <div className="mb-6">
            <Card>
              <CardHeader>
                <CardTitle>Metrics Analysis</CardTitle>
                <CardDescription>
                  Analyze and visualize metrics for your project
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-center py-12 text-muted-foreground">
                  <BarChart className="mx-auto h-12 w-12 mb-4 opacity-50" />
                  <h3 className="text-lg font-medium mb-2">Metrics Coming Soon</h3>
                  <p>
                    Advanced metrics visualization is under development and will be available soon.
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}