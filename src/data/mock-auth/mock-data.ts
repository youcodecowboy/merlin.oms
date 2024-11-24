import { User, Team, Role, RoleType, TeamType } from './types'

// Mock Users
export const mockUsers: User[] = [
  {
    id: 'u1',
    email: 'john.smith@example.com',
    name: 'John Smith',
    role: 'TEAM_LEAD',
    teamId: 't1',
    isActive: true,
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-01T00:00:00Z'
  },
  {
    id: 'u2',
    email: 'sarah.johnson@example.com',
    name: 'Sarah Johnson',
    role: 'MANAGER',
    teamId: 't2',
    isActive: true,
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-01T00:00:00Z'
  }
]

// Mock Teams
export const mockTeams: Team[] = [
  {
    id: 't1',
    type: 'WASHING',
    name: 'Washing Team',
    description: 'Handles all washing operations',
    permissions: ['view:orders', 'create:requests', 'update:requests'],
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-01T00:00:00Z'
  },
  {
    id: 't2',
    type: 'CUTTING',
    name: 'Cutting Team',
    description: 'Handles all cutting operations',
    permissions: ['view:orders', 'create:requests', 'update:requests'],
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-01T00:00:00Z'
  }
]

// Mock Roles
export const mockRoles: Role[] = [
  {
    id: 'r1',
    type: 'ADMIN',
    name: 'Administrator',
    description: 'Full system access',
    permissions: ['view:all', 'create:all', 'update:all', 'delete:all'],
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-01T00:00:00Z'
  },
  {
    id: 'r2',
    type: 'MANAGER',
    name: 'Manager',
    description: 'Department management access',
    permissions: ['view:orders', 'create:requests', 'update:requests', 'approve:requests'],
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-01T00:00:00Z'
  },
  {
    id: 'r3',
    type: 'TEAM_LEAD',
    name: 'Team Lead',
    description: 'Team leadership access',
    permissions: ['view:orders', 'create:requests', 'update:requests'],
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-01T00:00:00Z'
  }
]

// Mock Team Members
export const mockTeamMembers = [
  {
    id: '1',
    name: 'John Smith',
    role: 'Washing Team Lead',
    team: 'WASHING',
    email: 'john.smith@example.com',
    avatar: 'https://github.com/shadcn.png'
  },
  {
    id: '2',
    name: 'Sarah Johnson',
    role: 'Stock Manager',
    team: 'STOCK',
    email: 'sarah.j@example.com',
    avatar: 'https://github.com/shadcn.png'
  },
  {
    id: '3',
    name: 'Mike Chen',
    role: 'Cutting Team Lead',
    team: 'CUTTING',
    email: 'mike.c@example.com',
    avatar: 'https://github.com/shadcn.png'
  }
]

// Role mappings for request types
export const requestTypeRoles = {
  'WASH_REQUEST': ['Washing Team Lead', 'Washing Team Member'],
  'STOCK_REQUEST': ['Stock Manager', 'Stock Team Member'],
  'CUTTING_REQUEST': ['Cutting Team Lead', 'Cutting Team Member'],
  'PATTERN_REQUEST': ['Pattern Team Lead', 'Pattern Maker'],
  'FINISHING_REQUEST': ['Finishing Team Lead', 'Finishing Team Member'],
  'PACKING_REQUEST': ['Packing Team Lead', 'Packing Team Member'],
  'MOVE_REQUEST': ['Stock Team Member', 'Logistics Coordinator'],
  'REMAKE_REQUEST': ['Production Manager', 'Quality Control Lead']
} as const