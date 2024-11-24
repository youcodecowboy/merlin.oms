import { AlertCircle } from "lucide-react"
import { LoadingSpinner } from "@/components/LoadingSpinner"
import { cn } from "@/lib/utils"

interface PageLayoutProps extends React.HTMLAttributes<HTMLDivElement> {
  title: string
  loading?: boolean
  error?: Error | null
  actions?: React.ReactNode
  onRetry?: () => void
}

export function PageLayout({
  title,
  loading,
  error,
  actions,
  onRetry,
  children,
  className,
  ...props
}: PageLayoutProps) {
  return (
    <div className="container mx-auto mt-8">
      <div 
        className={cn(
          "bg-card p-8 rounded-lg shadow-md",
          className
        )}
        {...props}
      >
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold">{title}</h1>
          {actions}
        </div>

        {loading ? (
          <div className="flex items-center justify-center h-64">
            <LoadingSpinner size="lg" />
          </div>
        ) : error ? (
          <div className="flex flex-col items-center justify-center py-12">
            <AlertCircle className="h-12 w-12 text-destructive mb-4" />
            <p className="text-destructive text-center mb-4">
              {error.message || 'An error occurred'}
            </p>
            {onRetry && (
              <button
                onClick={onRetry}
                className="text-sm text-muted-foreground hover:text-foreground"
              >
                Try again
              </button>
            )}
          </div>
        ) : (
          children
        )}
      </div>
    </div>
  )
}