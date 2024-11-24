export const config = {
  api: {
    baseUrl: import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000',
    timeout: 5000
  },
  pagination: {
    defaultPageSize: 10,
    maxPageSize: 100
  },
  dates: {
    format: 'MMMM dd, yyyy',
    timezone: 'America/Los_Angeles'
  }
} as const 