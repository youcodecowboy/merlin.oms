import type { Team, TeamMember } from '@/lib/schema'

export const mockTeams: Team[] = [
  {
    id: 'team_warehouse',
    name: 'Warehouse',
    code: 'warehouse',
    description: 'Handles stock pulls and inventory movement'
  },
  {
    id: 'team_washing',
    name: 'Washing',
    code: 'washing',
    description: 'Manages washing and processing'
  },
  {
    id: 'team_quality',
    name: 'Quality Control',
    code: 'quality',
    description: 'Performs quality checks and approvals'
  },
  {
    id: 'team_pattern',
    name: 'Pattern',
    code: 'pattern',
    description: 'Creates and manages patterns'
  },
  {
    id: 'team_cutting',
    name: 'Cutting',
    code: 'cutting',
    description: 'Handles fabric cutting'
  },
  {
    id: 'team_production',
    name: 'Production',
    code: 'production',
    description: 'Manages production workflow'
  }
]

export const mockTeamMembers: TeamMember[] = [
  // Warehouse Team
  {
    id: 'user_w1',
    name: 'Han Solo',
    email: 'han.solo@denim.com',
    team_id: 'team_warehouse',
    role: 'LEAD'
  },
  {
    id: 'user_w2',
    name: 'Chewbacca',
    email: 'chewie@denim.com',
    team_id: 'team_warehouse',
    role: 'MEMBER'
  },

  // Washing Team
  {
    id: 'user_wash1',
    name: 'Lando Calrissian',
    email: 'lando@denim.com',
    team_id: 'team_washing',
    role: 'LEAD'
  },

  // Quality Control Team
  {
    id: 'user_qc1',
    name: 'Leia Organa',
    email: 'leia@denim.com',
    team_id: 'team_quality',
    role: 'LEAD'
  },

  // Pattern Team
  {
    id: 'user_p1',
    name: 'Obi-Wan Kenobi',
    email: 'obi.wan@denim.com',
    team_id: 'team_pattern',
    role: 'LEAD'
  },

  // Cutting Team
  {
    id: 'user_c1',
    name: 'Mace Windu',
    email: 'mace@denim.com',
    team_id: 'team_cutting',
    role: 'LEAD'
  },

  // Production Team
  {
    id: 'user_prod1',
    name: 'Luke Skywalker',
    email: 'luke@denim.com',
    team_id: 'team_production',
    role: 'LEAD'
  }
]

export async function getMockTeams(): Promise<Team[]> {
  await new Promise(resolve => setTimeout(resolve, 500))
  return mockTeams
}

export async function getMockTeamMembers(teamId?: string): Promise<TeamMember[]> {
  await new Promise(resolve => setTimeout(resolve, 500))
  if (teamId) {
    return mockTeamMembers.filter(member => member.team_id === teamId)
  }
  return mockTeamMembers
}

export async function getMockTeamMember(id: string): Promise<TeamMember | undefined> {
  await new Promise(resolve => setTimeout(resolve, 500))
  return mockTeamMembers.find(member => member.id === id)
} 