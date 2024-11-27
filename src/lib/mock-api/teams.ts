import { nanoid } from 'nanoid'
import type { Team, TeamType, User } from '../schema/accounts'

// Storage keys
const TEAMS_STORAGE_KEY = 'mockTeams'
const USERS_STORAGE_KEY = 'mockUsers'

// Load persisted data
let mockTeams: Team[] = JSON.parse(localStorage.getItem(TEAMS_STORAGE_KEY) || '[]')
let mockUsers: User[] = JSON.parse(localStorage.getItem(USERS_STORAGE_KEY) || '[]')

// Persist helpers
const persistTeams = () => localStorage.setItem(TEAMS_STORAGE_KEY, JSON.stringify(mockTeams))
const persistUsers = () => localStorage.setItem(USERS_STORAGE_KEY, JSON.stringify(mockUsers))

// Team management
export async function createTeam(data: Partial<Team>): Promise<Team> {
  const team: Team = {
    id: nanoid(),
    name: data.name!,
    type: data.type!,
    description: data.description,
    members: [],
    active: true,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    metadata: data.metadata || {}
  }
  
  mockTeams.push(team)
  persistTeams()
  return team
}

export async function getTeams(): Promise<Team[]> {
  return mockTeams
}

// User management
export async function createUser(data: Partial<User>): Promise<User> {
  const user: User = {
    id: nanoid(),
    email: data.email!,
    name: data.name!,
    role: data.role!,
    team_id: data.team_id,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    preferences: data.preferences || {}
  }

  if (data.team_id) {
    const team = mockTeams.find(t => t.id === data.team_id)
    if (team) {
      user.team = team
      team.members.push(user)
      persistTeams()
    }
  }

  mockUsers.push(user)
  persistUsers()
  return user
}

export async function getUsers(): Promise<User[]> {
  return mockUsers
}

// Assignment helpers
export async function assignRequestToTeam(requestId: string, teamId: string, assignedBy: string): Promise<void> {
  const team = mockTeams.find(t => t.id === teamId)
  if (!team) throw new Error('Team not found')
  
  // Assignment logic here
  // This would create an Assignment record and update the request
}

// Initialize with some default data if empty
export async function initializeTeamsAndUsers() {
  if (mockTeams.length === 0) {
    // Create default teams
    const washTeam = await createTeam({
      name: 'Wash Team A',
      type: 'WASH',
      description: 'Main washing team',
      metadata: { location: 'WASH-ZONE-1', shift: 'DAY' }
    })

    const qcTeam = await createTeam({
      name: 'QC Team A',
      type: 'QC',
      description: 'Quality control team',
      metadata: { location: 'QC-ZONE-1', shift: 'DAY' }
    })

    // Create some default users
    await createUser({
      email: 'wash.lead@example.com',
      name: 'John Smith',
      role: 'TEAM_LEAD',
      team_id: washTeam.id
    })

    await createUser({
      email: 'qc.lead@example.com',
      name: 'Jane Doe',
      role: 'TEAM_LEAD',
      team_id: qcTeam.id
    })
  }
} 