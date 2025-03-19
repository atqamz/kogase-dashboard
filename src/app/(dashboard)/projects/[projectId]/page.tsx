'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardFooter, 
  CardHeader, 
  CardTitle 
} from '@/components/ui/card';
import { 
  Tabs, 
  TabsContent, 
  TabsList, 
  TabsTrigger 
} from '@/components/ui/tabs';
import { 
  User, 
  Users, 
  Settings, 
  Activity, 
  List, 
  BarChart, 
  AlertCircle 
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Loading } from '@/components/ui/loading';
import { Badge } from '@/components/ui/badge';
import { Project } from '@/lib/types';
import iamService from '@/lib/services/iam-service';

export default function ProjectDetailPage() {
  const router = useRouter();
  const params = useParams();
  const projectId = params.projectId as string;
  
  const [project, setProject] = useState<Project | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchProjectDetails();
  }, [projectId]);

  async function fetchProjectDetails() {
    try {
      setIsLoading(true);
      setError(null);
      const data = await iamService.getProject(projectId);
      setProject(data);
    } catch (err: any) {
      console.error('Error fetching project details:', err);
      setError(err?.message || 'Failed to load project details. Please try again.');
    } finally {
      setIsLoading(false);
    }
  }

  if (isLoading) {
    return <Loading message="Loading project details..." />;
  }

  if (error) {
    return (
      <Alert variant="destructive" className="mt-6">
        <AlertCircle className="h-4 w-4" />
        <AlertDescription>{error}</AlertDescription>
        <Button variant="outline" onClick={() => router.push('/projects')} className="mt-2">
          Back to Projects
        </Button>
      </Alert>
    );
  }

  if (!project) {
    return (
      <Alert variant="destructive" className="mt-6">
        <AlertCircle className="h-4 w-4" />
        <AlertDescription>Project not found.</AlertDescription>
        <Button variant="outline" onClick={() => router.push('/projects')} className="mt-2">
          Back to Projects
        </Button>
      </Alert>
    );
  }

  return (
    <div className="container mx-auto py-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-3xl font-bold">{project.name}</h1>
            <Badge variant={project.isActive ? "default" : "secondary"}>
              {project.isActive ? "Active" : "Inactive"}
            </Badge>
          </div>
          <p className="text-muted-foreground mt-1">{project.description}</p>
        </div>
        <Button variant="outline" onClick={() => router.push('/projects')}>
          Back to Projects
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-lg">API Key</CardTitle>
          </CardHeader>
          <CardContent>
            <code className="bg-muted px-2 py-1 rounded text-sm break-all">
              {project.apiKey}
            </code>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-lg">Created On</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm">
              {new Date(project.createdAt).toLocaleDateString()} at {new Date(project.createdAt).toLocaleTimeString()}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-lg">Last Updated</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm">
              {new Date(project.updatedAt).toLocaleDateString()} at {new Date(project.updatedAt).toLocaleTimeString()}
            </p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Getting Started</CardTitle>
          <CardDescription>
            Quick steps to integrate this project with your game
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div>
              <h3 className="font-medium">1. Set up the SDK</h3>
              <p className="text-sm text-muted-foreground mt-1">
                Install and initialize the Kogase SDK in your game project
              </p>
            </div>
            <div>
              <h3 className="font-medium">2. Configure your API key</h3>
              <p className="text-sm text-muted-foreground mt-1">
                Add your API key to the SDK initialization
              </p>
              <code className="mt-2 bg-muted px-3 py-2 rounded block text-sm">
                KogaseClient.Initialize("{project.apiKey}");
              </code>
            </div>
            <div>
              <h3 className="font-medium">3. Define your events</h3>
              <p className="text-sm text-muted-foreground mt-1">
                Go to the Event Definitions tab to create events to track
              </p>
            </div>
            <div>
              <h3 className="font-medium">4. Start tracking events</h3>
              <p className="text-sm text-muted-foreground mt-1">
                Use the SDK to track events in your game
              </p>
              <code className="mt-2 bg-muted px-3 py-2 rounded block text-sm">
                test
              </code>
            </div>
          </div>
        </CardContent>
        <CardFooter>
          <Button asChild>
            <Link href="https://docs.kogase.io">
              Read Documentation
            </Link>
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
} 