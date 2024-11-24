import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { useAuth } from '@/lib/auth-context'
import { LoadingSpinner } from './LoadingSpinner'
import { AppError } from '@/lib/errors'

const formSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters')
})

type FormData = z.infer<typeof formSchema>

export function LoginForm() {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [isSignUp, setIsSignUp] = useState(false)
  const { signIn, signUp } = useAuth()
  const navigate = useNavigate()

  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: '',
      password: ''
    }
  })

  const onSubmit = async (data: FormData) => {
    try {
      setLoading(true)
      setError(null)

      if (isSignUp) {
        await signUp(data)
        setError('Please check your email to verify your account')
      } else {
        console.log (data)
        await signIn(data)
        const redirectUrl = sessionStorage.getItem('redirectUrl') || '/'
        sessionStorage.removeItem('redirectUrl')
        navigate(redirectUrl)
      }
    } catch (error) {
      if (error instanceof AppError) {
        setError(error.message)
      } else {
        setError('An unexpected error occurred')
      }
      console.error('Auth error:', error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="bg-card p-8 rounded-lg shadow-lg">
      <div className="flex justify-center mb-8">
        <img 
          src="https://i.imgur.com/VCWYTQY.png" 
          alt="Logo" 
          className="h-12 w-auto"
        />
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <FormField
            control={form.control}
            name="email"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Email</FormLabel>
                <FormControl>
                  <Input 
                    {...field} 
                    type="email" 
                    placeholder="Enter your email"
                    disabled={loading}
                    autoComplete="email"
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="password"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Password</FormLabel>
                <FormControl>
                  <Input 
                    {...field} 
                    type="password" 
                    placeholder="Enter your password"
                    disabled={loading}
                    autoComplete={isSignUp ? "new-password" : "current-password"}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {error && (
            <p className={cn(
              "text-sm font-medium",
              error.includes('verify') ? "text-primary" : "text-destructive"
            )}>
              {error}
            </p>
          )}

          <Button 
            type="submit" 
            className="w-full"
            disabled={loading}
          >
            {loading ? (
              <LoadingSpinner size="sm" />
            ) : isSignUp ? (
              'Sign Up'
            ) : (
              'Sign In'
            )}
          </Button>

          <div className="text-center">
            <Button
              type="button"
              variant="link"
              onClick={() => {
                setIsSignUp(!isSignUp)
                setError(null)
                form.reset()
              }}
              disabled={loading}
            >
              {isSignUp ? (
                'Already have an account? Sign in'
              ) : (
                "Don't have an account? Sign up"
              )}
            </Button>
          </div>
        </form>
      </Form>
    </div>
  )
}