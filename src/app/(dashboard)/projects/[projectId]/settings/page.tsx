'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useToast } from '@/components/ui/use-toast';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Separator } from '@/components/ui/separator';
import { Loading } from '@/components/ui/loading';
import { Project } from '@/lib/types';
import iamService from '@/lib/services/iam-service';
import { AlertCircle, RotateCw, Trash } from 'lucide-react';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

export default function ProjectSettingsPage() {
  const params = useParams();
  const router = useRouter();
  const projectId = params.projectId as string;
  const { toast } = useToast();
  
  const [project, setProject] = useState<Project | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [activeTab, setActiveTab] = useState('general');
  const [confirmDelete, setConfirmDelete] = useState(false);
  
  // General settings state
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [isActive, setIsActive] = useState(true);
  
  // API settings state
  const [apiKey, setApiKey] = useState('');
  const [rateLimitPerMinute, setRateLimitPerMinute] = useState('60');
  const [eventQuota, setEventQuota] = useState('10000');
  const [enableCors, setEnableCors] = useState(true);
  const [regeneratingKey, setRegeneratingKey] = useState(false);
  
  // Data retention settings
  const [retentionPeriod, setRetentionPeriod] = useState('90');
  const [anonymizeUserData, setAnonymizeUserData] = useState(false);
  const [autoArchiveSessions, setAutoArchiveSessions] = useState(true);
  
  // Load project data
  useEffect(() => {
    const fetchProject = async () => {
      try {
        setLoading(true);
        const projectData = await iamService.getProject(projectId);
        setProject(projectData);
        
        // Initialize form state
        setName(projectData.name);
        setDescription(projectData.description);
        setIsActive(projectData.isActive);
        setApiKey(projectData.apiKey);
      } catch (error) {
        console.error('Error loading project:', error);
        toast({
          title: 'Error',
          description: 'Failed to load project. Please try again.',
          variant: 'destructive',
        });
      } finally {
        setLoading(false);
      }
    };
    
    fetchProject();
  }, [projectId, toast]);

  // Handle form submission
  const handleSaveSettings = async () => {
    try {
      setSaving(true);
      
      // Update project
      const updatedProject = await iamService.updateProject(projectId, {
        name,
        description,
        isActive
      });
      
      setProject(updatedProject);
      
      toast({
        title: 'Settings saved',
        description: 'Project settings have been updated successfully',
      });
    } catch (error) {
      console.error('Error saving settings:', error);
      toast({
        title: 'Error',
        description: 'Failed to save settings. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setSaving(false);
    }
  };
  
  // Handle API key regeneration
  const handleRegenerateApiKey = async () => {
    try {
      setRegeneratingKey(true);
      
      // This is a placeholder for API key regeneration
      // In a real implementation, we'd call a specific endpoint
      const updatedProject = await iamService.updateProject(projectId, {
        ...project!,
        apiKey: `key_${Date.now().toString(36)}`
      });
      
      setProject(updatedProject);
      setApiKey(updatedProject.apiKey);
      
      toast({
        title: 'API Key Regenerated',
        description: 'The API key has been regenerated successfully',
      });
    } catch (error) {
      console.error('Error regenerating API key:', error);
      toast({
        title: 'Error',
        description: 'Failed to regenerate API key. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setRegeneratingKey(false);
    }
  };
  
  // Handle project deletion
  const handleDeleteProject = async () => {
    try {
      await iamService.deleteProject(projectId);
      
      toast({
        title: 'Project Deleted',
        description: 'The project has been deleted successfully',
      });
      
      // Navigate back to projects list
      router.push('/dashboard/projects');
    } catch (error) {
      console.error('Error deleting project:', error);
      toast({
        title: 'Error',
        description: 'Failed to delete project. Please try again.',
        variant: 'destructive',
      });
    }
  };

  if (loading) {
    return <Loading message="Loading project settings..." />;
  }

  if (!project) {
    return (
      <div className="flex h-96 items-center justify-center">
        <div className="text-center">
          <AlertCircle className="mx-auto h-12 w-12 text-destructive" />
          <h2 className="mt-4 text-lg font-semibold">Project Not Found</h2>
          <p className="mt-2 text-muted-foreground">
            The project you're looking for doesn't exist or you don't have access to it.
          </p>
          <Button className="mt-4" onClick={() => router.push('/dashboard/projects')}>
            Back to Projects
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col space-y-1 sm:flex-row sm:items-center sm:justify-between sm:space-y-0">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Project Settings</h1>
          <p className="text-muted-foreground">
            Configure settings for {project.name}
          </p>
        </div>
        
        <AlertDialog open={confirmDelete} onOpenChange={setConfirmDelete}>
          <AlertDialogTrigger asChild>
            <Button variant="destructive">
              <Trash className="mr-2 h-4 w-4" />
              Delete Project
            </Button>
          </AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
              <AlertDialogDescription>
                This action cannot be undone. This will permanently delete the project
                "{project.name}" and all associated data including telemetry, sessions, users,
                and configuration.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction onClick={handleDeleteProject} className="bg-destructive text-destructive-foreground">
                Delete
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
      <Separator />

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="general">General</TabsTrigger>
          <TabsTrigger value="api">API Settings</TabsTrigger>
          <TabsTrigger value="retention">Data Retention</TabsTrigger>
        </TabsList>
        
        <TabsContent value="general" className="space-y-4 pt-4">
          <Card>
            <CardHeader>
              <CardTitle>General Settings</CardTitle>
              <CardDescription>
                Configure basic project settings
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-2">
                <Label htmlFor="project-name">Project Name</Label>
                <Input
                  id="project-name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                />
              </div>
              
              <div className="grid gap-2">
                <Label htmlFor="project-description">Description</Label>
                <Textarea
                  id="project-description"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  rows={3}
                />
              </div>
              
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="is-active">Active Status</Label>
                  <p className="text-sm text-muted-foreground">
                    Enable or disable this project
                  </p>
                </div>
                <Switch
                  id="is-active"
                  checked={isActive}
                  onCheckedChange={setIsActive}
                />
              </div>
            </CardContent>
            <CardFooter>
              <Button onClick={handleSaveSettings} disabled={saving}>
                {saving ? 'Saving...' : 'Save Settings'}
              </Button>
            </CardFooter>
          </Card>
        </TabsContent>
        
        <TabsContent value="api" className="space-y-4 pt-4">
          <Card>
            <CardHeader>
              <CardTitle>API Settings</CardTitle>
              <CardDescription>
                Configure API access and limits for this project
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="api-key">API Key</Label>
                <div className="flex space-x-2">
                  <Input
                    id="api-key"
                    value={apiKey}
                    readOnly
                    className="font-mono"
                  />
                  <Button 
                    variant="outline" 
                    onClick={handleRegenerateApiKey}
                    disabled={regeneratingKey}
                  >
                    <RotateCw className={`mr-2 h-4 w-4 ${regeneratingKey ? 'animate-spin' : ''}`} />
                    Regenerate
                  </Button>
                </div>
                <p className="text-sm text-muted-foreground">
                  This key provides access to all API endpoints for this project.
                  <strong className="block mt-1 text-destructive">Keep it secure!</strong>
                </p>
              </div>
              
              <Separator />
              
              <div className="grid gap-2">
                <Label htmlFor="rate-limit">Rate Limit (requests per minute)</Label>
                <Input
                  id="rate-limit"
                  type="number"
                  value={rateLimitPerMinute}
                  onChange={(e) => setRateLimitPerMinute(e.target.value)}
                />
              </div>
              
              <div className="grid gap-2">
                <Label htmlFor="event-quota">Monthly Event Quota</Label>
                <Input
                  id="event-quota"
                  type="number"
                  value={eventQuota}
                  onChange={(e) => setEventQuota(e.target.value)}
                />
              </div>
              
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="enable-cors">Enable CORS</Label>
                  <p className="text-sm text-muted-foreground">
                    Allow cross-origin requests to your API
                  </p>
                </div>
                <Switch
                  id="enable-cors"
                  checked={enableCors}
                  onCheckedChange={setEnableCors}
                />
              </div>
            </CardContent>
            <CardFooter>
              <Button onClick={handleSaveSettings} disabled={saving}>
                {saving ? 'Saving...' : 'Save Settings'}
              </Button>
            </CardFooter>
          </Card>
        </TabsContent>
        
        <TabsContent value="retention" className="space-y-4 pt-4">
          <Card>
            <CardHeader>
              <CardTitle>Data Retention</CardTitle>
              <CardDescription>
                Configure how long data is stored and managed
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-2">
                <Label htmlFor="retention-period">Retention Period (days)</Label>
                <Input
                  id="retention-period"
                  type="number"
                  value={retentionPeriod}
                  onChange={(e) => setRetentionPeriod(e.target.value)}
                />
                <p className="text-sm text-muted-foreground">
                  How long to keep telemetry data before automatic deletion
                </p>
              </div>
              
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="anonymize-data">Anonymize User Data</Label>
                  <p className="text-sm text-muted-foreground">
                    Remove personally identifiable information from telemetry
                  </p>
                </div>
                <Switch
                  id="anonymize-data"
                  checked={anonymizeUserData}
                  onCheckedChange={setAnonymizeUserData}
                />
              </div>
              
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="auto-archive">Auto-Archive Sessions</Label>
                  <p className="text-sm text-muted-foreground">
                    Automatically archive old sessions to save storage
                  </p>
                </div>
                <Switch
                  id="auto-archive"
                  checked={autoArchiveSessions}
                  onCheckedChange={setAutoArchiveSessions}
                />
              </div>
            </CardContent>
            <CardFooter>
              <Button onClick={handleSaveSettings} disabled={saving}>
                {saving ? 'Saving...' : 'Save Settings'}
              </Button>
            </CardFooter>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
} 