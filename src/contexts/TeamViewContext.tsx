import { createContext, useContext } from 'react'
import type { TeamType } from '@/lib/schema/accounts'

interface TeamViewContextType {
  currentView: string
  setCurrentView: (view: string) => void
}

const TeamViewContext = createContext<TeamViewContextType>({
  currentView: 'ADMIN',
  setCurrentView: () => {}
})

export const useTeamView = () => {
  const context = useContext(TeamViewContext)
  if (!context) {
    throw new Error('useTeamView must be used within a TeamViewProvider')
  }
  return context
}

export { TeamViewContext } 