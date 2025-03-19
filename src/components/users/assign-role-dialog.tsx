'use client';

import { useState } from 'react';
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Loader2 } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Role } from '@/lib/types';

const formSchema = z.object({
  roleId: z.string().min(1, {
    message: 'Please select a role',
  }),
});

type FormValues = z.infer<typeof formSchema>;

interface AssignRoleDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (roleId: string) => Promise<void>;
  availableRoles: Role[];
  assignedRoles: Role[];
  userName: string;
}

export function AssignRoleDialog({
  open,
  onOpenChange,
  onSubmit,
  availableRoles,
  assignedRoles,
  userName,
}: AssignRoleDialogProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      roleId: '',
    },
  });
  
  const handleFormSubmit = async (values: FormValues) => {
    try {
      setIsSubmitting(true);
      await onSubmit(values.roleId);
      form.reset();
    } catch (error) {
      console.error('Error submitting form:', error);
    } finally {
      setIsSubmitting(false);
    }
  };
  
  // Filter out already assigned roles
  const assignedRoleIds = assignedRoles.map(role => role.id);
  const availableRolesToAssign = availableRoles.filter(
    role => !assignedRoleIds.includes(role.id)
  );
  
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
      <DialogHeader>
          <DialogTitle>Manage User Roles</DialogTitle>
          <DialogDescription>
            Assign roles to {userName} for this project
          </DialogDescription>
        </DialogHeader>
        
        <div className="py-4">
          <h4 className="text-sm font-medium mb-2">Current Roles</h4>
          <div className="flex flex-wrap gap-2 mb-4">
            {assignedRoles.length > 0 ? (
              assignedRoles.map((role) => (
                <Badge key={role.id} variant="secondary">
                  {role.name}
                </Badge>
              ))
            ) : (
              <p className="text-sm text-muted-foreground">No roles assigned yet</p>
            )}
          </div>
        </div>
        
        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleFormSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="roleId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Assign New Role</FormLabel>
                  <Select 
                    onValueChange={field.onChange} 
                    defaultValue={field.value}
                    disabled={isSubmitting || availableRolesToAssign.length === 0}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select a role" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {availableRolesToAssign.map((role) => (
                        <SelectItem key={role.id} value={role.id}>
                          {role.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormDescription>
                    Each role provides different permissions in the project
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => onOpenChange(false)} disabled={isSubmitting}>
                Cancel
              </Button>
              <Button 
                type="submit" 
                disabled={isSubmitting || availableRolesToAssign.length === 0}
              >
                {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Assign Role
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}