import { Button } from "@/components/ui/button"
import { AlertCircle } from "lucide-react"

interface ErrorFallbackProps {
  error: Error
  resetErrorBoundary: () => void
}

export function ErrorFallback({ error, resetErrorBoundary }: ErrorFallbackProps) {
  return (
    <div className="p-4 border border-red-200 rounded bg-red-50 dark:bg-red-900/10">
      <h2 className="text-lg font-semibold text-red-800 dark:text-red-200">
        Something went wrong
      </h2>
      <pre className="mt-2 text-sm text-red-600 dark:text-red-300">
        {error.message}
      </pre>
      <button
        onClick={resetErrorBoundary}
        className="mt-4 px-4 py-2 bg-red-100 text-red-800 rounded hover:bg-red-200"
      >
        Try again
      </button>
    </div>
  )
}