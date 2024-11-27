export const ROUTES = {
  // Main routes
  HOME: '/',
  INVENTORY: '/inv',
  REQUESTS: '/requests',
  ORDERS: '/orders',
  
  // Dynamic routes - use with ID
  INVENTORY_ITEM: (id: string) => `/inv/${id}`,
  REQUEST: (id: string) => `/requests/${id}`,
  ORDER: (id: string) => `/orders/${id}`,
} as const 