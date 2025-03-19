'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { UserPlus, UserX, UserCog, Mail, Edit } from 'lucide-react';
import { Loading } from '@/components/ui/loading';
import { useToast } from '@/components/ui/use-toast';
import iamService from '@/lib/services/iam-service';
import { Project, User, Role, UserRole } from '@/lib/types';
import { format } from 'date-fns';
import { AddUserDialog } from '@/components/users/add-user-dialog';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { AssignRoleDialog } from '@/components/users/assign-role-dialog';

export default function ProjectUsersPage() {
  const params = useParams();
  const router = useRouter();
  const projectId = params.projectId as string;
  const { toast } = useToast();
  
  const [project, setProject] = useState<Project | null>(null);
  const [users, setUsers] = useState<User[]>([]);
  const [roles, setRoles] = useState<Role[]>([]);
  const [userRoles, setUserRoles] = useState<Record<string, Role[]>>({});
  const [isLoading, setIsLoading] = useState(true);
  
  const [addUserDialogOpen, setAddUserDialogOpen] = useState(false);
  const [assignRoleDialogOpen, setAssignRoleDialogOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  
  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true);
        
        // Get project details
        const projectData = await iamService.getProject(projectId);
        setProject(projectData);
        
        // Get project users
        const usersData = await iamService.getProjectUsers(projectId);
        setUsers(usersData);
        
        // Get project roles
        const rolesData = await iamService.getProjectRoles(projectId);
        setRoles(rolesData);
        
        // Get user roles
        const userRolesMap: Record<string, Role[]> = {};
        for (const user of usersData) {
          const userRolesData = await iamService.getUserProjectRoles(user.id, projectId);
          
          // Map role IDs to actual role objects
          const userRoleObjects = userRolesData
            .map(ur => rolesData.find(r => r.id === ur.roleId))
            .filter((r): r is Role => r !== undefined);
          
          userRolesMap[user.id] = userRoleObjects;
        }
        setUserRoles(userRolesMap);
      } catch (error) {
        console.error('Error loading data:', error);
        toast({
          title: 'Error',
          description: 'Failed to load project users. Please try again.',
          variant: 'destructive',
        });
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchData();
  }, [projectId, toast]);
  
  const handleOpenAssignRoleDialog = (user: User) => {
    setSelectedUser(user);
    setAssignRoleDialogOpen(true);
  };
  
  const handleAddUser = async (email: string) => {
    try {
      // This would typically involve inviting a user to the project
      // For this example, we'll just show a success message
      toast({
        title: 'User Invited',
        description: `An invitation has been sent to ${email}`,
      });
      setAddUserDialogOpen(false);
    } catch (error) {
      console.error('Error inviting user:', error);
      toast({
        title: 'Error',
        description: 'Failed to invite user. Please try again.',
        variant: 'destructive',
      });
    }
  };
  
  const handleAssignRole = async (userId: string, roleId: string) => {
    if (!project) return;
    
    try {
      await iamService.assignRoleToUser(userId, roleId, project.id);
      
      // Update local state
      const updatedRole = roles.find(r => r.id === roleId);
      if (updatedRole) {
        setUserRoles(prev => ({
          ...prev,
          [userId]: [...(prev[userId] || []), updatedRole]
        }));
      }
      
      toast({
        title: 'Role Assigned',
        description: 'The role has been assigned successfully',
      });
      
      setAssignRoleDialogOpen(false);
    } catch (error) {
      console.error('Error assigning role:', error);
      toast({
        title: 'Error',
        description: 'Failed to assign role. Please try again.',
        variant: 'destructive',
      });
    }
  };
  
  const handleRemoveUser = async (userId: string) => {
    if (!confirm('Are you sure you want to remove this user from the project?')) {
      return;
    }
    
    try {
      // This would typically involve removing the user from the project
      // For this example, we'll just update local state
      setUsers(users.filter(u => u.id !== userId));
      
      toast({
        title: 'User Removed',
        description: 'The user has been removed from the project',
      });
    } catch (error) {
      console.error('Error removing user:', error);
      toast({
        title: 'Error',
        description: 'Failed to remove user. Please try again.',
        variant: 'destructive',
      });
    }
  };
  
  if (isLoading) {
    return <Loading message="Loading project users..." />;
  }
  
  return (
    <div className="container mx-auto py-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold">Project Users</h1>
          <p className="text-muted-foreground">
            Manage users for {project?.name}
          </p>
        </div>
        <Button onClick={() => setAddUserDialogOpen(true)}>
          <UserPlus className="mr-2 h-4 w-4" />
          Add User
        </Button>
      </div>
      
      {users.length === 0 ? (
        <Card>
          <CardContent className="pt-6 text-center">
            <p className="text-muted-foreground">
              No users found in this project. Add users to collaborate.
            </p>
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardHeader>
            <CardTitle>Project Members</CardTitle>
            <CardDescription>
              Users with access to this project and their roles
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="border rounded-md">
              <table className="w-full">
                <thead>
                  <tr className="border-b bg-muted/50">
                    <th className="text-left p-2 pl-4">User</th>
                    <th className="text-left p-2">Email</th>
                    <th className="text-left p-2">Roles</th>
                    <th className="text-left p-2">Added</th>
                    <th className="text-right p-2 pr-4">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {users.map((user) => (
                    <tr key={user.id} className="border-b hover:bg-muted/50">
                      <td className="p-2 pl-4">
                        <div className="flex items-center space-x-3">
                          <Avatar>
                            <AvatarImage src={user.avatarUrl} />
                            <AvatarFallback>
                              {`${user.firstName?.[0] || ''}${user.lastName?.[0] || ''}`}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <div className="font-medium">
                              {user.firstName} {user.lastName}
                            </div>
                            <div className="text-xs text-muted-foreground">
                              {user.isActive ? 'Active' : 'Inactive'}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="p-2">
                        <div className="flex items-center">
                          <Mail className="mr-2 h-4 w-4 text-muted-foreground" />
                          {user.email}
                        </div>
                      </td>
                      <td className="p-2">
                        <div className="flex flex-wrap gap-1">
                          {userRoles[user.id]?.map((role) => (
                            <Badge key={role.id} variant="outline">
                              {role.name}
                            </Badge>
                          ))}
                          {(!userRoles[user.id] || userRoles[user.id].length === 0) && (
                            <span className="text-xs text-muted-foreground">No roles assigned</span>
                          )}
                        </div>
                      </td>
                      <td className="p-2">
                        {format(new Date(user.createdAt), "MMM d, yyyy")}
                      </td>
                      <td className="p-2 pr-4 text-right">
                        <div className="flex justify-end gap-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleOpenAssignRoleDialog(user)}
                          >
                            <UserCog className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleRemoveUser(user.id)}
                            className="text-destructive hover:text-destructive"
                          >
                            <UserX className="h-4 w-4" />
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
      )}
      
      <AddUserDialog
        open={addUserDialogOpen}
        onOpenChange={setAddUserDialogOpen}
        onSubmit={handleAddUser}
      />
      
      {selectedUser && (
        <AssignRoleDialog
          open={assignRoleDialogOpen}
          onOpenChange={setAssignRoleDialogOpen}
          onSubmit={(roleId) => handleAssignRole(selectedUser.id, roleId)}
          availableRoles={roles}
          assignedRoles={userRoles[selectedUser.id] || []}
          userName={`${selectedUser.firstName} ${selectedUser.lastName}`}
        />
      )}
    </div>
  );
}