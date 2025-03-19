'use client';

import { useState, useEffect } from 'react';
import { z } from 'zod';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Loader2, Plus, X } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { EventDefinition } from '@/lib/types';

const formSchema = z.object({
  name: z.string().min(2, {
    message: 'Event name must be at least 2 characters',
  }).max(50, {
    message: 'Event name cannot exceed 50 characters',
  }),
  description: z.string().max(500, {
    message: 'Description cannot exceed 500 characters',
  }).optional(),
  category: z.string().min(1, {
    message: 'Category is required',
  }),
  parameters: z.array(z.string()),
  isActive: z.boolean().optional(),
});

type FormValues = z.infer<typeof formSchema>;

interface EventDefinitionDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (data: Partial<EventDefinition>) => Promise<void>;
  initialValues?: EventDefinition | null;
  mode: 'create' | 'edit';
}

export function EventDefinitionDialog({
  open,
  onOpenChange,
  onSubmit,
  initialValues,
  mode,
}: EventDefinitionDialogProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [newParameter, setNewParameter] = useState('');
  
  const defaultValues: FormValues = {
    name: '',
    description: '',
    category: 'General',
    parameters: [],
    isActive: true,
  };
  
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: initialValues ? {
      name: initialValues.name,
      description: initialValues.description,
      category: initialValues.category,
      parameters: initialValues.parameters,
      isActive: initialValues.isActive,
    } : defaultValues,
  });
  
  // Reset form when dialog opens with different initialValues
  useEffect(() => {
    if (open) {
      if (initialValues) {
        form.reset({
          name: initialValues.name,
          description: initialValues.description,
          category: initialValues.category,
          parameters: initialValues.parameters,
          isActive: initialValues.isActive,
        });
      } else {
        form.reset(defaultValues);
      }
      setNewParameter('');
    }
  }, [open, initialValues, form]);
  
  const addParameter = () => {
    if (!newParameter.trim()) return;
    
    // Get current parameters
    const currentParameters = form.getValues().parameters || [];
    
    // Check if parameter already exists
    if (currentParameters.includes(newParameter)) {
      form.setError('parameters', {
        type: 'manual',
        message: 'Parameter already exists',
      });
      return;
    }
    
    // Add new parameter
    form.setValue('parameters', [...currentParameters, newParameter]);
    setNewParameter('');
    
    // Clear any errors
    form.clearErrors('parameters');
  };
  
  const removeParameter = (paramToRemove: string) => {
    const currentParameters = form.getValues().parameters || [];
    form.setValue(
      'parameters',
      currentParameters.filter((param) => param !== paramToRemove)
    );
  };
  
  const handleFormSubmit = async (values: FormValues) => {
    try {
      setIsSubmitting(true);
      await onSubmit(values);
      form.reset();
    } catch (error) {
      console.error('Error submitting form:', error);
    } finally {
      setIsSubmitting(false);
    }
  };
  
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>
            {mode === 'create' ? 'Create Event Definition' : 'Edit Event Definition'}
          </DialogTitle>
          <DialogDescription>
            {mode === 'create'
              ? 'Define a new event type to track in your application'
              : 'Update the properties of this event definition'}
          </DialogDescription>
        </DialogHeader>
        
        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleFormSubmit)} className="space-y-4 py-4">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Event Name</FormLabel>
                  <FormControl>
                    <Input 
                      placeholder="app_started" 
                      {...field} 
                      disabled={isSubmitting}
                    />
                  </FormControl>
                  <FormDescription>
                    Use snake_case for consistent naming
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Description</FormLabel>
                  <FormControl>
                    <Textarea 
                      placeholder="Triggered when the application starts" 
                      {...field} 
                      disabled={isSubmitting}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="category"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Category</FormLabel>
                  <FormControl>
                    <Input 
                      placeholder="General" 
                      {...field} 
                      disabled={isSubmitting}
                    />
                  </FormControl>
                  <FormDescription>
                    Group similar events under the same category (e.g., Navigation, Purchase, Error)
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="parameters"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Parameters</FormLabel>
                  <div className="flex space-x-2 mb-2">
                    <FormControl>
                      <Input 
                        placeholder="parameter_name"
                        value={newParameter}
                        onChange={(e) => setNewParameter(e.target.value)}
                        disabled={isSubmitting}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') {
                            e.preventDefault();
                            addParameter();
                          }
                        }}
                      />
                    </FormControl>
                    <Button 
                      type="button" 
                      onClick={addParameter}
                      disabled={isSubmitting || !newParameter.trim()}
                      variant="outline"
                    >
                      <Plus className="h-4 w-4" />
                    </Button>
                  </div>
                  <div className="flex flex-wrap gap-2 my-2">
                    {field.value.map((param, index) => (
                      <Badge key={index} variant="secondary" className="px-2 py-1">
                        {param}
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          className="h-4 w-4 p-0 ml-1"
                          onClick={() => removeParameter(param)}
                          disabled={isSubmitting}
                        >
                          <X className="h-3 w-3" />
                        </Button>
                      </Badge>
                    ))}
                  </div>
                  <FormDescription>
                    Define the parameters this event can include (e.g., duration, level_id)
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="isActive"
              render={({ field }) => (
                <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
                  <FormControl>
                    <input
                      type="checkbox"
                      checked={field.value}
                      onChange={field.onChange}
                      disabled={isSubmitting}
                      className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"
                    />
                  </FormControl>
                  <div className="space-y-1 leading-none">
                    <FormLabel>Active</FormLabel>
                    <FormDescription>
                      Only active events can be tracked by your application
                    </FormDescription>
                  </div>
                </FormItem>
              )}
            />
            
            <DialogFooter>
              <Button variant="outline" type="button" onClick={() => onOpenChange(false)} disabled={isSubmitting}>
                Cancel
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                {mode === 'create' ? 'Create Definition' : 'Update Definition'}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}