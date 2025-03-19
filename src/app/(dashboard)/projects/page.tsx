'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardFooter, 
  CardHeader, 
  CardTitle 
} from '@/components/ui/card';
import { PlusCircle, Settings, Trash2, Activity, BarChart, Copy, Calendar, ArrowRight } from 'lucide-react';
import { Loading } from '@/components/ui/loading';
import { Project } from '@/lib/types';
import iamService from '@/lib/services/iam-service';
import { useToast } from '@/components/ui/use-toast';
import Link from 'next/link';
import { CreateProjectDialog } from '@/components/projects/create-project-dialog';
import { Badge } from '@/components/ui/badge';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Separator } from '@/components/ui/separator';

export default function ProjectsPage() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    fetchProjects();
  }, []);

  async function fetchProjects() {
    try {
      setIsLoading(true);
      const data = await iamService.getProjects();
      setProjects(data);
    } catch (error) {
      console.error('Error fetching projects:', error);
      toast({
        title: 'Error',
        description: 'Failed to load projects. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  }

  async function handleCreateProject(name: string, description: string, ownerId: string) {
    try {
      const newProject = await iamService.createProject({ name, description, ownerId });
      setProjects([...projects, newProject]);
      toast({
        title: 'Success',
        description: `Project "${name}" created successfully`,
      });
      setIsDialogOpen(false);
    } catch (error) {
      console.error('Error creating project:', error);
      toast({
        title: 'Error',
        description: 'Failed to create project. Please try again.',
        variant: 'destructive',
      });
      throw error; // Re-throw to let the dialog component handle it
    }
  }

  async function handleDeleteProject(projectId: string) {
    if (!confirm('Are you sure you want to delete this project? This action cannot be undone.')) {
      return;
    }

    try {
      await iamService.deleteProject(projectId);
      setProjects(projects.filter(project => project.id !== projectId));
      toast({
        title: 'Success',
        description: 'Project deleted successfully',
      });
    } catch (error) {
      console.error('Error deleting project:', error);
      toast({
        title: 'Error',
        description: 'Failed to delete project. Please try again.',
        variant: 'destructive',
      });
    }
  }

  if (isLoading) {
    return <Loading message="Loading projects..." />;
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col space-y-2 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Projects</h1>
          <p className="text-muted-foreground">
            Create and manage your game projects
          </p>
        </div>
        <Button onClick={() => setIsDialogOpen(true)}>
          <PlusCircle className="mr-2 h-4 w-4" />
          New Project
        </Button>
      </div>
      <Separator />

      {projects.length === 0 ? (
        <div className="flex h-60 flex-col items-center justify-center rounded-lg border border-dashed p-8 text-center">
          <h3 className="text-lg font-medium">No projects found</h3>
          <p className="text-sm text-muted-foreground mt-2">
            Get started by creating a new project
          </p>
          <Button onClick={() => setIsDialogOpen(true)} className="mt-4">
            <PlusCircle className="mr-2 h-4 w-4" />
            Create Project
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {projects.map((project) => (
            <Link key={project.id} href={`/projects/${project.id}`} className="block">
              <Card className="h-full transition-all hover:shadow-md cursor-pointer border border-border hover:border-primary">
                <CardHeader className="pb-2">
                  <CardTitle className="flex items-center justify-between">
                    <span>{project.name}</span>
                    <Badge variant="outline" className={project.isActive ? 'bg-green-50 text-green-700 border-green-200' : 'bg-gray-50 text-gray-700 border-gray-200'}>
                      {project.isActive ? 'Active' : 'Inactive'}
                    </Badge>
                  </CardTitle>
                  <CardDescription className="line-clamp-2">{project.description}</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="space-y-1">
                      <div className="text-sm text-muted-foreground flex items-center justify-between">
                        <span className="font-medium text-foreground">API Key</span>
                        <TooltipProvider>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <Button
                                onClick={(e) => {
                                  e.preventDefault();
                                  navigator.clipboard.writeText(project.apiKey);
                                  toast({
                                    title: "API Key copied",
                                    description: "The API key has been copied to your clipboard",
                                    duration: 3000
                                  });
                                  setTimeout(() => {
                                    toast({
                                      title: "Security reminder",
                                      description: "Remember to keep your API key secure",
                                      variant: "default",
                                      duration: 5000
                                    });
                                  }, 300);
                                }}
                                variant="ghost"
                                size="sm"
                                className="h-7 px-2"
                              >
                                <Copy className="h-3.5 w-3.5 mr-1" />
                                <span className="text-xs">Copy</span>
                              </Button>
                            </TooltipTrigger>
                            <TooltipContent side="top">
                              Copy API Key to clipboard
                            </TooltipContent>
                          </Tooltip>
                        </TooltipProvider>
                      </div>
                      <div className="rounded-md bg-muted p-2">
                        <code className="text-xs font-mono truncate block">{project.apiKey}</code>
                      </div>
                    </div>
                    <div className="flex justify-between items-center text-sm text-muted-foreground">
                      <div className="flex items-center">
                        <Calendar className="h-3.5 w-3.5 mr-1.5" />
                        <span>{new Date(project.createdAt).toLocaleDateString()}</span>
                      </div>
                    </div>
                  </div>
                </CardContent>
                <CardFooter className="flex justify-between">
                  <Button 
                    variant="outline" 
                    size="sm"
                    asChild
                  >
                    <span>Open Project <ArrowRight className="h-3.5 w-3.5 ml-1" /></span>
                  </Button>
                  <Button 
                    variant="destructive" 
                    size="sm" 
                    onClick={(e) => {
                      e.preventDefault();
                      handleDeleteProject(project.id);
                    }}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </CardFooter>
              </Card>
            </Link>
          ))}
        </div>
      )}
      
      <CreateProjectDialog 
        open={isDialogOpen}
        onOpenChange={setIsDialogOpen}
        onSubmit={handleCreateProject}
      />
    </div>
  );
}