'use client';

import { useState, useEffect } from 'react';
import { useToast } from '@/components/ui/use-toast';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { User, UserType, UserStatus, CreateUserDto, Role } from '@/lib/types';
import { AlertCircle, MoreHorizontal, Plus, Search, Shield, User as UserIcon, Clock, Check, Copy } from 'lucide-react';
import { useAuth } from '@/lib/auth-context';
import iamService from '@/lib/services/iam-service';
import { Loading } from '@/components/ui/loading';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

export default function UsersPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [roles, setRoles] = useState<Role[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize] = useState(10);
  const [totalUsers, setTotalUsers] = useState(0);
  const [error, setError] = useState<string | null>(null);
  
  // New user form state
  const [dialogOpen, setDialogOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [newUser, setNewUser] = useState<CreateUserDto>({
    email: '',
    password: '',
    firstName: '',
    lastName: '',
    type: UserType.Developer
  });
  
  // Role management state
  const [isRoleDialogOpen, setIsRoleDialogOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [selectedUserType, setSelectedUserType] = useState<UserType>(UserType.Developer);
  const [isUpdatingRole, setIsUpdatingRole] = useState(false);
  
  // Add copy to clipboard state
  const [copiedEmail, setCopiedEmail] = useState<string | null>(null);
  
  const { user: currentUser } = useAuth();
  const { toast } = useToast();
  
  useEffect(() => {
    loadUsers();
    loadRoles();
  }, [currentPage, pageSize]);
  
  const loadUsers = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await iamService.getUsers(currentPage, pageSize);
      setUsers(data);
      // For pagination we would ideally get total count from an API response header or metadata
      setTotalUsers(data.length);
    } catch (err: any) {
      console.error('Error loading users:', err);
      setError(err?.message || 'Failed to load users data');
    } finally {
      setLoading(false);
    }
  };
  
  const loadRoles = async () => {
    try {
      const data = await iamService.getRoles();
      setRoles(data);
    } catch (err: any) {
      console.error('Error loading roles:', err);
      // Not setting error state here as roles are secondary data
    }
  };
  
  const handleCreateUser = async () => {
    if (!validateNewUser()) return;
    
    try {
      setIsSubmitting(true);
      const createdUser = await iamService.createUser(newUser);
      setUsers(prevUsers => [createdUser, ...prevUsers]);
      setDialogOpen(false);
      resetNewUserForm();
      
      toast({
        title: 'User created',
        description: `${createdUser.firstName} ${createdUser.lastName} has been created successfully`,
      });
    } catch (err: any) {
      console.error('Error creating user:', err);
      toast({
        title: 'Error',
        description: err?.message || 'Failed to create user. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
  };
  
  const validateNewUser = (): boolean => {
    if (!newUser.email.trim() || !newUser.password.trim()) {
      toast({
        title: 'Validation Error',
        description: 'Email and password are required',
        variant: 'destructive',
      });
      return false;
    }
    
    if (!newUser.firstName.trim() || !newUser.lastName.trim()) {
      toast({
        title: 'Validation Error',
        description: 'First name and last name are required',
        variant: 'destructive',
      });
      return false;
    }
    
    if (newUser.password.length < 8) {
      toast({
        title: 'Validation Error',
        description: 'Password must be at least 8 characters long',
        variant: 'destructive',
      });
      return false;
    }
    
    return true;
  };
  
  const resetNewUserForm = () => {
    setNewUser({
      email: '',
      password: '',
      firstName: '',
      lastName: '',
      type: UserType.Developer
    });
  };
  
  const handleStatusChange = async (userId: string, newStatus: UserStatus, userName: string) => {
    try {
      setLoading(true);
      
      // Call appropriate service method based on status
      if (newStatus === UserStatus.Active) {
        await iamService.activateUser(userId);
      } else if (newStatus === UserStatus.Inactive) {
        await iamService.deactivateUser(userId);
      } else if (newStatus === UserStatus.Suspended) {
        await iamService.suspendUser(userId);
      }
      
      // Update the user in the local state
      setUsers(users.map(user => 
        user.id === userId ? { ...user, status: newStatus } : user
      ));
      
      // Show success toast
      const statusText = UserStatus[newStatus].toLowerCase();
      toast({
        title: 'User updated',
        description: `${userName} is now ${statusText}`,
      });
    } catch (err: any) {
      console.error(`Error updating user status:`, err);
      toast({
        title: 'Error',
        description: err?.message || 'Failed to update user status',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };
  
  const handleUpdateUserType = async () => {
    if (!selectedUser) return;
    
    try {
      setIsUpdatingRole(true);
      
      // Create update DTO
      const updateData = {
        firstName: selectedUser.firstName,
        lastName: selectedUser.lastName,
        status: selectedUser.status,
        type: selectedUserType
      };
      
      // Update user
      await iamService.updateUser(selectedUser.id, updateData);
      
      // Update local state
      setUsers(users.map(user => 
        user.id === selectedUser.id ? { ...user, type: selectedUserType } : user
      ));
      
      setIsRoleDialogOpen(false);
      setSelectedUser(null);
      
      toast({
        title: 'User role updated',
        description: `${selectedUser.firstName} ${selectedUser.lastName} is now a ${UserType[selectedUserType]}`,
      });
    } catch (err: any) {
      console.error('Error updating user role:', err);
      toast({
        title: 'Error',
        description: err?.message || 'Failed to update user role',
        variant: 'destructive',
      });
    } finally {
      setIsUpdatingRole(false);
    }
  };
  
  // Filter users by search term
  const filteredUsers = users.filter(user => {
    if (!searchTerm) return true;
    const search = searchTerm.toLowerCase();
    return (
      user.email.toLowerCase().includes(search) ||
      (user.firstName && user.firstName.toLowerCase().includes(search)) ||
      (user.lastName && user.lastName.toLowerCase().includes(search)) ||
      (user.displayName && user.displayName.toLowerCase().includes(search))
    );
  });
  
  // Generate avatar fallback from user's initials
  const getUserInitials = (user: User): string => {
    if (user.firstName && user.lastName) {
      return `${user.firstName.charAt(0)}${user.lastName.charAt(0)}`.toUpperCase();
    }
    if (user.displayName) {
      return user.displayName.charAt(0).toUpperCase();
    }
    return user.email.charAt(0).toUpperCase();
  };
  
  // Copy to clipboard function
  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedEmail(text);
    setTimeout(() => setCopiedEmail(null), 2000);
  };
  
  // Get user type badge class - update to use better styling
  const getUserTypeBadge = (type: UserType) => {
    switch (type) {
      case UserType.Admin:
        return 'bg-red-50 text-red-700 border-red-200 dark:bg-red-900/30 dark:text-red-300 dark:border-red-800';
      case UserType.Developer:
        return 'bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-900/30 dark:text-blue-300 dark:border-blue-800';
      case UserType.Player:
        return 'bg-green-50 text-green-700 border-green-200 dark:bg-green-900/30 dark:text-green-300 dark:border-green-800';
      default:
        return 'bg-gray-50 text-gray-700 border-gray-200 dark:bg-gray-800/60 dark:text-gray-300 dark:border-gray-700';
    }
  };
  
  // Get user status badge class - update to use better styling
  const getUserStatusBadge = (status: UserStatus) => {
    switch (status) {
      case UserStatus.Active:
        return 'bg-green-50 text-green-700 border-green-200 dark:bg-green-900/30 dark:text-green-300 dark:border-green-800';
      case UserStatus.Inactive:
        return 'bg-gray-50 text-gray-700 border-gray-200 dark:bg-gray-800/60 dark:text-gray-300 dark:border-gray-700';
      case UserStatus.Suspended:
        return 'bg-red-50 text-red-700 border-red-200 dark:bg-red-900/30 dark:text-red-300 dark:border-red-800';
      default:
        return 'bg-gray-50 text-gray-700 border-gray-200 dark:bg-gray-800/60 dark:text-gray-300 dark:border-gray-700';
    }
  };
  
  // Determine if current user can manage other users
  const canManageUsers = (): boolean => {
    // Only admin users can manage other users
    return currentUser?.type === UserType.Admin;
  };
  
  // Check if a user is the current user
  const isCurrentUser = (userId: string): boolean => {
    return currentUser?.id === userId;
  };
  
  if (error) {
    return (
      <Alert variant="destructive" className="mb-6">
        <AlertCircle className="h-4 w-4" />
        <AlertDescription>{error}</AlertDescription>
      </Alert>
    );
  }
  
  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col space-y-2 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Users</h1>
          <p className="text-muted-foreground">
            Manage administrator and developer users
          </p>
        </div>
        {canManageUsers() && (
          <Button onClick={() => setDialogOpen(true)}>
            <Plus className="mr-2 h-4 w-4" />
            Add User
          </Button>
        )}
      </div>
      <Separator />

      <Card>
        <CardHeader className="pb-3">
          <CardTitle>Admin & Developer Users</CardTitle>
          <CardDescription>
            Manage administrator and developer users for the Kogase platform
          </CardDescription>
          <div className="relative mt-2 w-full max-w-sm">
            <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search users..."
              className="pl-8"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </CardHeader>
        <CardContent>
          {loading ? (
            <Loading message="Loading users..." />
          ) : filteredUsers.length === 0 ? (
            <div className="flex h-40 flex-col items-center justify-center rounded-lg border border-dashed p-8 text-center">
              <h3 className="text-lg font-medium">No users found</h3>
              <p className="text-sm text-muted-foreground">
                {searchTerm ? 'Try adjusting your search term' : 'Add users to get started'}
              </p>
            </div>
          ) : (
            <ScrollArea className="h-[500px] rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>User</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Created</TableHead>
                    <TableHead>Last Login</TableHead>
                    {canManageUsers() && <TableHead className="text-right">Actions</TableHead>}
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredUsers.map((user) => (
                    <TableRow key={user.id} className={user.status !== UserStatus.Active ? "opacity-60" : ""}>
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <Avatar className="h-10 w-10 border-2 border-muted">
                            <AvatarImage src={user.avatarUrl} alt={user.firstName + ' ' + user.lastName} />
                            <AvatarFallback className="bg-primary/10 text-primary font-medium">{getUserInitials(user)}</AvatarFallback>
                          </Avatar>
                          <div className="space-y-1">
                            <div className="font-medium">{user.firstName} {user.lastName}</div>
                            <div className="flex items-center text-sm text-muted-foreground">
                              <span className="truncate max-w-[180px]">{user.email}</span>
                              <TooltipProvider>
                                <Tooltip>
                                  <TooltipTrigger asChild>
                                    <Button
                                      onClick={() => copyToClipboard(user.email)}
                                      variant="ghost"
                                      size="icon"
                                      className="h-6 w-6 ml-1"
                                    >
                                      {copiedEmail === user.email ? (
                                        <Check className="h-3 w-3 text-green-500" />
                                      ) : (
                                        <Copy className="h-3 w-3" />
                                      )}
                                    </Button>
                                  </TooltipTrigger>
                                  <TooltipContent side="top">
                                    {copiedEmail === user.email ? 'Copied!' : 'Copy email'}
                                  </TooltipContent>
                                </Tooltip>
                              </TooltipProvider>
                            </div>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline" className={`${getUserTypeBadge(user.type)}`}>
                          {user.type === UserType.Admin ? (
                            <Shield className="mr-1 h-3 w-3" />
                          ) : (
                            <UserIcon className="mr-1 h-3 w-3" />
                          )}
                          {UserType[user.type]}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline" className={`${getUserStatusBadge(user.status)}`}>
                          {UserStatus[user.status]}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center">
                          <Clock className="mr-1 h-3 w-3 text-muted-foreground" />
                          <span className="text-sm">{user.createdAt ? new Date(user.createdAt).toLocaleDateString() : '-'}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        {user.lastLoginAt ? (
                          <TooltipProvider>
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <span className="text-sm">{new Date(user.lastLoginAt).toLocaleDateString()}</span>
                              </TooltipTrigger>
                              <TooltipContent side="top">
                                {new Date(user.lastLoginAt).toLocaleString()}
                              </TooltipContent>
                            </Tooltip>
                          </TooltipProvider>
                        ) : (
                          <span className="text-sm text-muted-foreground">Never</span>
                        )}
                      </TableCell>
                      {canManageUsers() && (
                        <TableCell className="text-right">
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                                <span className="sr-only">Open menu</span>
                                <MoreHorizontal className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuLabel>Actions</DropdownMenuLabel>
                              
                              {/* Role Management */}
                              <DropdownMenuItem 
                                onClick={() => {
                                  setSelectedUser(user);
                                  setSelectedUserType(user.type);
                                  setIsRoleDialogOpen(true);
                                }}
                                disabled={isCurrentUser(user.id)}
                                className="flex items-center"
                              >
                                <Shield className="mr-2 h-4 w-4" />
                                Manage role
                              </DropdownMenuItem>
                              
                              <DropdownMenuSeparator />
                              
                              {/* Status Change Options */}
                              {user.status !== UserStatus.Active && (
                                <DropdownMenuItem
                                  onClick={() => handleStatusChange(user.id, UserStatus.Active, `${user.firstName} ${user.lastName}`)}
                                  disabled={isCurrentUser(user.id)}
                                  className="text-green-600 focus:text-green-600"
                                >
                                  Activate user
                                </DropdownMenuItem>
                              )}
                              {user.status !== UserStatus.Inactive && (
                                <DropdownMenuItem
                                  onClick={() => handleStatusChange(user.id, UserStatus.Inactive, `${user.firstName} ${user.lastName}`)}
                                  disabled={isCurrentUser(user.id)}
                                >
                                  Deactivate user
                                </DropdownMenuItem>
                              )}
                              {user.status !== UserStatus.Suspended && (
                                <DropdownMenuItem
                                  className="text-red-600 focus:text-red-600"
                                  onClick={() => handleStatusChange(user.id, UserStatus.Suspended, `${user.firstName} ${user.lastName}`)}
                                  disabled={isCurrentUser(user.id)}
                                >
                                  Suspend user
                                </DropdownMenuItem>
                              )}
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </TableCell>
                      )}
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </ScrollArea>
          )}
        </CardContent>
      </Card>
      
      {/* Add User Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add a new user</DialogTitle>
            <DialogDescription>
              Create a new administrator or developer user
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="firstName">First Name</Label>
                <Input
                  id="firstName"
                  value={newUser.firstName}
                  onChange={(e) => setNewUser({...newUser, firstName: e.target.value})}
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="lastName">Last Name</Label>
                <Input
                  id="lastName"
                  value={newUser.lastName}
                  onChange={(e) => setNewUser({...newUser, lastName: e.target.value})}
                />
              </div>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                value={newUser.email}
                onChange={(e) => setNewUser({...newUser, email: e.target.value})}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                value={newUser.password}
                onChange={(e) => setNewUser({...newUser, password: e.target.value})}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="userType">User Type</Label>
              <Select 
                value={newUser.type.toString()} 
                onValueChange={(value) => setNewUser({...newUser, type: parseInt(value) as UserType})}
              >
                <SelectTrigger id="userType">
                  <SelectValue placeholder="Select user type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value={UserType.Admin.toString()}>Administrator</SelectItem>
                  <SelectItem value={UserType.Developer.toString()}>Developer</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleCreateUser} disabled={isSubmitting}>
              {isSubmitting ? 'Creating...' : 'Create User'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      {/* Role Management Dialog */}
      <Dialog open={isRoleDialogOpen} onOpenChange={setIsRoleDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Manage User Role</DialogTitle>
            <DialogDescription>
              {selectedUser && `Update role for ${selectedUser.firstName} ${selectedUser.lastName}`}
            </DialogDescription>
          </DialogHeader>
          {selectedUser && (
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="role">Role</Label>
                <Select 
                  value={selectedUserType.toString()} 
                  onValueChange={(value) => setSelectedUserType(parseInt(value) as UserType)}
                >
                  <SelectTrigger id="role">
                    <SelectValue placeholder="Select role" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value={UserType.Admin.toString()}>Administrator</SelectItem>
                    <SelectItem value={UserType.Developer.toString()}>Developer</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="pt-2">
                <p className="text-sm text-muted-foreground">
                  {selectedUserType === UserType.Admin 
                    ? "Administrators have full access to all system features and can manage all users and projects."
                    : "Developers can create and manage projects but have limited access to system administration."
                  }
                </p>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsRoleDialogOpen(false)}>
              Cancel
            </Button>
            <Button 
              onClick={handleUpdateUserType} 
              disabled={isUpdatingRole || !selectedUser}
            >
              {isUpdatingRole ? 'Updating...' : 'Update Role'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}