import apiClient from '../api-client';
import { 
  Project, 
  User, 
  Role, 
  UserRole, 
  CreateProjectRequest,
  CreateUserDto
} from '../types';

/**
 * Service for IAM (Identity and Access Management) operations
 * Matches with ProjectsController, UsersController, RolesController, and UserRolesController
 */
const iamService = {
  // Projects - Matching ProjectsController endpoints
  /**
   * Get all projects
   */
  async getProjects(): Promise<Project[]> {
    return apiClient.getReq<Project[]>('iam/projects');
  },
  
  /**
   * Get project by ID
   */
  async getProject(projectId: string): Promise<Project> {
    return apiClient.getReq<Project>(`iam/projects/${projectId}`);
  },
  
  /**
   * Create a new project
   */
  async createProject(project: CreateProjectRequest): Promise<Project> {
    return apiClient.postReq<Project>('iam/projects', project);
  },
  
  /**
   * Update a project
   */
  async updateProject(projectId: string, project: Partial<Project>): Promise<Project> {
    return apiClient.putReq<Project>(`iam/projects/${projectId}`, project);
  },
  
  /**
   * Delete a project
   */
  async deleteProject(projectId: string): Promise<void> {
    await apiClient.deleteReq(`iam/projects/${projectId}`);
  },
  
  // Users - Matching UsersController endpoints
  /**
   * Get all users with pagination
   */
  async getUsers(page: number = 1, pageSize: number = 10): Promise<User[]> {
    return apiClient.getReq<User[]>(`iam/users?page=${page}&pageSize=${pageSize}`);
  },
  
  /**
   * Get user by ID
   */
  async getUser(userId: string): Promise<User> {
    return apiClient.getReq<User>(`iam/users/${userId}`);
  },
  
  /**
   * Create a new user
   */
  async createUser(userData: CreateUserDto): Promise<User> {
    return apiClient.postReq<User>('iam/users', userData);
  },
  
  /**
   * Update a user
   */
  async updateUser(userId: string, user: Partial<User>): Promise<User> {
    return apiClient.putReq<User>(`iam/users/${userId}`, user);
  },
  
  /**
   * Activate a user
   */
  async activateUser(userId: string): Promise<void> {
    await apiClient.putReq(`iam/users/${userId}/activate`, {});
  },
  
  /**
   * Deactivate a user
   */
  async deactivateUser(userId: string): Promise<void> {
    await apiClient.putReq(`iam/users/${userId}/deactivate`, {});
  },
  
  /**
   * Suspend a user
   */
  async suspendUser(userId: string): Promise<void> {
    await apiClient.putReq(`iam/users/${userId}/suspend`, {});
  },
  
  /**
   * Get project users
   */
  async getProjectUsers(projectId: string): Promise<User[]> {
    return apiClient.getReq<User[]>(`iam/projects/${projectId}/users`);
  },
  
  // Roles - Matching RolesController endpoints
  /**
   * Get all roles
   */
  async getRoles(): Promise<Role[]> {
    return apiClient.getReq<Role[]>('iam/roles');
  },
  
  /**
   * Get role by ID
   */
  async getRole(roleId: string): Promise<Role> {
    return apiClient.getReq<Role>(`iam/roles/${roleId}`);
  },
  
  /**
   * Create a new role
   */
  async createRole(role: Partial<Role>): Promise<Role> {
    return apiClient.postReq<Role>('iam/roles', role);
  },
  
  /**
   * Update a role
   */
  async updateRole(roleId: string, role: Partial<Role>): Promise<Role> {
    return apiClient.putReq<Role>(`iam/roles/${roleId}`, role);
  },
  
  /**
   * Delete a role
   */
  async deleteRole(roleId: string): Promise<void> {
    await apiClient.deleteReq(`iam/roles/${roleId}`);
  },
  
  /**
   * Get project roles
   */
  async getProjectRoles(projectId: string): Promise<Role[]> {
    return apiClient.getReq<Role[]>(`iam/projects/${projectId}/roles`);
  },
  
  // User Roles - Matching UserRolesController endpoints
  /**
   * Get user roles
   */
  async getUserRoles(userId: string): Promise<UserRole[]> {
    return apiClient.getReq<UserRole[]>(`iam/users/${userId}/roles`);
  },
  
  /**
   * Get user roles for a project
   */
  async getUserProjectRoles(userId: string, projectId: string): Promise<UserRole[]> {
    return apiClient.getReq<UserRole[]>(`iam/projects/${projectId}/users/${userId}/roles`);
  },
  
  /**
   * Assign role to user in a project
   */
  async assignRoleToUser(userId: string, roleId: string, projectId: string): Promise<UserRole> {
    return apiClient.postReq<UserRole>(`iam/projects/${projectId}/users/${userId}/roles`, { roleId });
  },
  
  /**
   * Remove role from user in a project
   */
  async removeUserRole(userRoleId: string): Promise<void> {
    await apiClient.deleteReq(`iam/user-roles/${userRoleId}`);
  },
};

export default iamService;