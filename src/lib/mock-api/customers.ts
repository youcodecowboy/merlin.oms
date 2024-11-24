import type { Customer } from '@/lib/schema'

// Initialize with Star Wars characters as customers
const defaultCustomers: Customer[] = [
  {
    id: 'cust_001',
    name: 'Luke Skywalker',
    email: 'luke.skywalker@rebellion.org',
    phone: '+1 (555) 123-4567',
    created_at: '2024-01-15T10:00:00Z',
    updated_at: '2024-01-15T10:00:00Z'
  },
  {
    id: 'cust_002',
    name: 'Leia Organa',
    email: 'leia.organa@rebellion.org',
    phone: '+1 (555) 234-5678',
    created_at: '2024-01-15T10:30:00Z',
    updated_at: '2024-01-15T10:30:00Z'
  },
  {
    id: 'cust_003',
    name: 'Han Solo',
    email: 'han.solo@millennium-falcon.com',
    phone: '+1 (555) 345-6789',
    created_at: '2024-01-16T09:00:00Z',
    updated_at: '2024-01-16T09:00:00Z'
  },
  {
    id: 'cust_004',
    name: 'Obi-Wan Kenobi',
    email: 'ben.kenobi@jedi.org',
    phone: '+1 (555) 456-7890',
    created_at: '2024-01-17T11:00:00Z',
    updated_at: '2024-01-17T11:00:00Z'
  },
  {
    id: 'cust_005',
    name: 'Din Djarin',
    email: 'mando@bounty-guild.com',
    phone: '+1 (555) 567-8901',
    created_at: '2024-01-18T14:00:00Z',
    updated_at: '2024-01-18T14:00:00Z'
  },
  {
    id: 'cust_006',
    name: 'Ahsoka Tano',
    email: 'ahsoka.tano@force-users.com',
    phone: '+1 (555) 678-9012',
    created_at: '2024-01-19T15:30:00Z',
    updated_at: '2024-01-19T15:30:00Z'
  },
  {
    id: 'cust_007',
    name: 'Boba Fett',
    email: 'boba.fett@hunters-guild.com',
    phone: '+1 (555) 789-0123',
    created_at: '2024-01-20T16:45:00Z',
    updated_at: '2024-01-20T16:45:00Z'
  },
  {
    id: 'cust_008',
    name: 'Padmé Amidala',
    email: 'padme.amidala@naboo.gov',
    phone: '+1 (555) 890-1234',
    created_at: '2024-01-21T12:15:00Z',
    updated_at: '2024-01-21T12:15:00Z'
  },
  {
    id: 'cust_009',
    name: 'Lando Calrissian',
    email: 'lando@cloud-city.com',
    phone: '+1 (555) 901-2345',
    created_at: '2024-01-22T13:20:00Z',
    updated_at: '2024-01-22T13:20:00Z'
  },
  {
    id: 'cust_010',
    name: 'Cara Dune',
    email: 'cara.dune@shock-trooper.org',
    phone: '+1 (555) 012-3456',
    created_at: '2024-01-23T17:10:00Z',
    updated_at: '2024-01-23T17:10:00Z'
  }
]

// Load persisted data or use defaults
const loadPersistedData = () => {
  try {
    const savedCustomers = localStorage.getItem('mockCustomers')
    return savedCustomers ? JSON.parse(savedCustomers) : defaultCustomers
  } catch (error) {
    console.error('Failed to load customers:', error)
    return defaultCustomers
  }
}

// Initialize with persisted or default data
let mockCustomers = loadPersistedData()

// Helper function to persist data
const persistData = () => {
  try {
    localStorage.setItem('mockCustomers', JSON.stringify(mockCustomers))
  } catch (error) {
    console.error('Failed to persist customers:', error)
  }
}

// API Functions
export async function getMockCustomers(): Promise<Customer[]> {
  await new Promise(resolve => setTimeout(resolve, 500))
  return mockCustomers
}

export async function getMockCustomer(id: string): Promise<Customer | undefined> {
  await new Promise(resolve => setTimeout(resolve, 500))
  return mockCustomers.find(customer => customer.id === id)
}

export async function createMockCustomer(data: Omit<Customer, 'id' | 'created_at' | 'updated_at'>): Promise<Customer> {
  const customer: Customer = {
    id: `cust_${nanoid()}`,
    ...data,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  }

  mockCustomers.push(customer)
  persistData()
  return customer
}

export async function updateMockCustomer(id: string, updates: Partial<Customer>): Promise<Customer | undefined> {
  const index = mockCustomers.findIndex(customer => customer.id === id)
  if (index === -1) return undefined

  mockCustomers[index] = {
    ...mockCustomers[index],
    ...updates,
    updated_at: new Date().toISOString()
  }

  persistData()
  return mockCustomers[index]
}

export async function deleteMockCustomer(id: string): Promise<boolean> {
  const index = mockCustomers.findIndex(customer => customer.id === id)
  if (index === -1) return false

  mockCustomers.splice(index, 1)
  persistData()
  return true
}

// Export for testing
export { mockCustomers }