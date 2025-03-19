'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Plus, Edit, Trash2, Tag } from 'lucide-react';
import { Loading } from '@/components/ui/loading';
import { useToast } from '@/components/ui/use-toast';
import telemetryService from '@/lib/services/telemetry-service';
import iamService from '@/lib/services/iam-service';
import { EventDefinition, Project } from '@/lib/types';
import { EventDefinitionDialog } from '@/components/telemetry/event-definition-dialog';
import { format } from 'date-fns';

export default function EventDefinitionsPage() {
  const params = useParams();
  const router = useRouter();
  const projectId = params.projectId as string;
  const { toast } = useToast();
  
  const [project, setProject] = useState<Project | null>(null);
  const [definitions, setDefinitions] = useState<EventDefinition[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingDefinition, setEditingDefinition] = useState<EventDefinition | null>(null);
  
  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true);
        
        // Get project details
        const projectData = await iamService.getProject(projectId);
        setProject(projectData);
        
        // Get event definitions
        const definitionsData = await telemetryService.getEventDefinitions(projectId);
        setDefinitions(definitionsData);
      } catch (error) {
        console.error('Error loading data:', error);
        toast({
          title: 'Error',
          description: 'Failed to load event definitions. Please try again.',
          variant: 'destructive',
        });
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchData();
  }, [projectId, toast]);
  
  const handleCreateDefinition = async (definition: Partial<EventDefinition>) => {
    try {
      const newDefinition = await telemetryService.createEventDefinition(
        projectId,
        {
          name: definition.name || '',
          description: definition.description || '',
          category: definition.category || 'General',
          parameters: definition.parameters || [],
        }
      );
      
      setDefinitions([...definitions, newDefinition]);
      toast({
        title: 'Success',
        description: `Event definition "${newDefinition.name}" created successfully`,
      });
      setDialogOpen(false);
    } catch (error) {
      console.error('Error creating event definition:', error);
      toast({
        title: 'Error',
        description: 'Failed to create event definition. Please try again.',
        variant: 'destructive',
      });
    }
  };
  
  const handleUpdateDefinition = async (definition: Partial<EventDefinition>) => {
    if (!editingDefinition) return;
    
    try {
      const updatedDefinition = await telemetryService.updateEventDefinition(
        editingDefinition.id,
        definition
      );
      
      setDefinitions(
        definitions.map((def) =>
          def.id === updatedDefinition.id ? updatedDefinition : def
        )
      );
      
      toast({
        title: 'Success',
        description: `Event definition "${updatedDefinition.name}" updated successfully`,
      });
      
      setDialogOpen(false);
      setEditingDefinition(null);
    } catch (error) {
      console.error('Error updating event definition:', error);
      toast({
        title: 'Error',
        description: 'Failed to update event definition. Please try again.',
        variant: 'destructive',
      });
    }
  };
  
  const handleDeleteDefinition = async (definitionId: string) => {
    if (!confirm('Are you sure you want to delete this event definition? This action cannot be undone.')) {
      return;
    }
    
    try {
      await telemetryService.deleteEventDefinition(definitionId);
      setDefinitions(definitions.filter((def) => def.id !== definitionId));
      
      toast({
        title: 'Success',
        description: 'Event definition deleted successfully',
      });
    } catch (error) {
      console.error('Error deleting event definition:', error);
      toast({
        title: 'Error',
        description: 'Failed to delete event definition. Please try again.',
        variant: 'destructive',
      });
    }
  };
  
  const handleEdit = (definition: EventDefinition) => {
    setEditingDefinition(definition);
    setDialogOpen(true);
  };
  
  const handleCreate = () => {
    setEditingDefinition(null);
    setDialogOpen(true);
  };
  
  if (isLoading) {
    return <Loading message="Loading event definitions..." />;
  }
  
  return (
    <div className="container mx-auto py-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold">Event Definitions</h1>
          <p className="text-muted-foreground">
            Manage event definitions for {project?.name}
          </p>
        </div>
        <Button onClick={handleCreate}>
          <Plus className="mr-2 h-4 w-4" />
          New Definition
        </Button>
      </div>
      
      {definitions.length === 0 ? (
        <Card>
          <CardContent className="pt-6 text-center">
            <p className="text-muted-foreground">
              No event definitions found. Create your first event definition to start tracking events.
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Event Definitions</CardTitle>
              <CardDescription>
                Events your application can track and analyze
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="border rounded-md">
                <table className="w-full">
                  <thead>
                    <tr className="border-b bg-muted/50">
                      <th className="text-left p-2 pl-4">Name</th>
                      <th className="text-left p-2">Category</th>
                      <th className="text-left p-2">Parameters</th>
                      <th className="text-left p-2">Status</th>
                      <th className="text-left p-2">Created</th>
                      <th className="text-right p-2 pr-4">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {definitions.map((definition) => (
                      <tr key={definition.id} className="border-b hover:bg-muted/50">
                        <td className="p-2 pl-4 font-medium">{definition.name}</td>
                        <td className="p-2">{definition.category}</td>
                        <td className="p-2">
                          <div className="flex flex-wrap gap-1">
                            {definition.parameters.map((param, index) => (
                              <span
                                key={index}
                                className="inline-flex items-center rounded-full bg-blue-100 px-2 py-0.5 text-xs font-medium text-blue-800 dark:bg-blue-900 dark:text-blue-300"
                              >
                                <Tag className="mr-1 h-3 w-3" />
                                {param}
                              </span>
                            ))}
                          </div>
                        </td>
                        <td className="p-2">
                          <span
                            className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${
                              definition.isActive
                                ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300"
                                : "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300"
                            }`}
                          >
                            {definition.isActive ? "Active" : "Inactive"}
                          </span>
                        </td>
                        <td className="p-2">
                          {format(new Date(definition.createdAt), "MMM d, yyyy")}
                        </td>
                        <td className="p-2 pr-4 text-right">
                          <div className="flex justify-end gap-2">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleEdit(definition)}
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleDeleteDefinition(definition.id)}
                              className="text-destructive hover:text-destructive"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
      
      <EventDefinitionDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        onSubmit={editingDefinition ? handleUpdateDefinition : handleCreateDefinition}
        initialValues={editingDefinition}
        mode={editingDefinition ? 'edit' : 'create'}
      />
    </div>
  );
}