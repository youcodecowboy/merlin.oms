export type Role = 
  | 'ADMIN'           // System admin
  | 'MANAGER'         // Team manager
  | 'TEAM_LEAD'       // Team lead
  | 'OPERATOR'        // Basic team member
  | 'QC'              // Quality control
  | 'SCANNER'         // Scanning operator

export type TeamType = 
  | 'WASH'
  | 'QC'
  | 'FINISHING'
  | 'PATTERN'
  | 'CUTTING'
  | 'SEWING'
  | 'PACKING'

export interface User {
  id: string
  email: string
  name: string
  role: Role
  team_id?: string
  team?: Team
  created_at: string
  updated_at: string
  preferences?: {
    theme?: 'light' | 'dark' | 'system'
    notifications?: boolean
    [key: string]: any
  }
}

export interface Team {
  id: string
  name: string
  type: TeamType
  description?: string
  lead_id?: string
  members: User[]
  active: boolean
  created_at: string
  updated_at: string
  metadata?: {
    location?: string
    shift?: 'DAY' | 'NIGHT'
    [key: string]: any
  }
}

export interface Assignment {
  id: string
  request_id: string
  team_id: string
  assigned_to?: string  // User ID if assigned to specific person
  assigned_by: string   // User ID who made assignment
  status: 'PENDING' | 'ACCEPTED' | 'COMPLETED' | 'REJECTED'
  priority: 'HIGH' | 'MEDIUM' | 'LOW'
  due_date?: string
  notes?: string
  created_at: string
  updated_at: string
} 