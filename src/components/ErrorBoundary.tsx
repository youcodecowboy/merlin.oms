import React, { Component, ErrorInfo, ReactNode } from 'react'
import { ErrorFallback } from './ErrorFallback'

interface Props {
  children: ReactNode
  fallback?: ReactNode
}

interface State {
  hasError: boolean
  error?: Error
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false
  }

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error }
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    // Log error to console in development
    if (process.env.NODE_ENV !== 'production') {
      console.error('Uncaught error:', error)
      console.error('Component stack:', errorInfo.componentStack)
    }

    // Here you could send the error to your error reporting service
    // Example: Sentry.captureException(error)
  }

  private handleReset = () => {
    this.setState({ hasError: false, error: undefined })
  }

  public render() {
    if (this.state.hasError && this.state.error) {
      return this.props.fallback || (
        <ErrorFallback 
          error={this.state.error} 
          resetErrorBoundary={this.handleReset} 
        />
      )
    }

    return this.props.children
  }
}