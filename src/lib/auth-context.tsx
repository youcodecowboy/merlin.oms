import { createContext, useContext, useEffect, useState } from 'react'
import { Session, User } from '@supabase/supabase-js'
import { supabase } from './supabase'
import { signIn as authSignIn, signUp as authSignUp, signOut as authSignOut } from './auth'
import { useToast } from '@/components/ui/use-toast'
import { AppError } from './errors'

interface AuthContextType {
  session: Session | null
  user: User | null
  signIn: () => Promise<void>
  signUp: (data: { email: string; password: string }) => Promise<void>
  signOut: () => Promise<void>
  loading: boolean
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [session, setSession] = useState<Session | null>(null)
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const { toast } = useToast()

  useEffect(() => {
    let mounted = true

    supabase.auth.getSession().then(({ data: { session } }) => {
      if (mounted) {
        setSession(session)
        setUser(session?.user ?? null)
        setLoading(false)
      }
    })

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (mounted) {
        setSession(session)
        setUser(session?.user ?? null)
        setLoading(false)
      }
    })

    return () => {
      mounted = false
      subscription.unsubscribe()
    }
  }, [])

  const signIn = async (data: { email: string; password: string }) => {
    try {
      setLoading(true)
      const { session } = await authSignIn(data)
      
      if (session?.user) {
        toast({
          title: "Signed in successfully",
          description: `Welcome back, ${session.user.email}`
        })
      }
    } catch (error) {
      if (error instanceof AppError) {
        toast({
          title: "Sign in failed",
          description: error.message,
          variant: "destructive"
        })
      } else {
        toast({
          title: "Sign in failed",
          description: "An unexpected error occurred",
          variant: "destructive"
        })
      }
      throw error
    } finally {
      setLoading(false)
    }
  }

  const signUp = async (data: { email: string; password: string }) => {
    try {
      setLoading(true)
      await authSignUp(data)
      
      toast({
        title: "Account created successfully",
        description: "Please check your email to verify your account"
      })
    } catch (error) {
      if (error instanceof AppError) {
        toast({
          title: "Sign up failed",
          description: error.message,
          variant: "destructive"
        })
      } else {
        toast({
          title: "Sign up failed",
          description: "An unexpected error occurred",
          variant: "destructive"
        })
      }
      throw error
    } finally {
      setLoading(false)
    }
  }

  const signOut = async () => {
    try {
      setLoading(true)
      await authSignOut()
      
      toast({
        title: "Signed out successfully"
      })
    } catch (error) {
      if (error instanceof AppError) {
        toast({
          title: "Sign out failed",
          description: error.message,
          variant: "destructive"
        })
      } else {
        toast({
          title: "Sign out failed",
          description: "An unexpected error occurred",
          variant: "destructive"
        })
      }
      throw error
    } finally {
      setLoading(false)
    }
  }

  return (
    <AuthContext.Provider value={{ session, user, signIn, signUp, signOut, loading }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}