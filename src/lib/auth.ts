import { supabase } from './supabase'
import { AppError } from './errors'

export async function signIn({ email, password }: { email: string; password: string }) {
  try {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password
    })

    if (error) {
      throw new AppError('AUTH_ERROR', error.message, 401)
    }

    return data
  } catch (error) {
    if (error instanceof AppError) throw error
    throw new AppError('AUTH_ERROR', 'Failed to sign in', 500, error)
  }
}

export async function signUp({ email, password }: { email: string; password: string }) {
  try {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: `${window.location.origin}/auth/callback`
      }
    })

    if (error) {
      throw new AppError('AUTH_ERROR', error.message, 401)
    }

    return data
  } catch (error) {
    if (error instanceof AppError) throw error
    throw new AppError('AUTH_ERROR', 'Failed to sign up', 500, error)
  }
}

export async function signOut() {
  try {
    const { error } = await supabase.auth.signOut()
    if (error) {
      throw new AppError('AUTH_ERROR', error.message, 401)
    }
  } catch (error) {
    if (error instanceof AppError) throw error
    throw new AppError('AUTH_ERROR', 'Failed to sign out', 500, error)
  }
}