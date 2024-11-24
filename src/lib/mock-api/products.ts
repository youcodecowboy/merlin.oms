import type { Product } from '@/lib/schema'

// Initialize with a variety of products following the SKU structure
const defaultProducts: Product[] = [
  // Stone wash variations
  {
    id: 'prod_001',
    sku: 'ST-24-X-30-STA',
    name: 'Straight Fit Stone Wash',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  },
  {
    id: 'prod_002',
    sku: 'ST-28-X-32-STA',
    name: 'Straight Fit Stone Wash',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  },
  {
    id: 'prod_003',
    sku: 'ST-32-X-34-STA',
    name: 'Straight Fit Stone Wash',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  },
  
  // Indigo wash variations
  {
    id: 'prod_004',
    sku: 'ST-30-X-30-IND',
    name: 'Straight Fit Indigo Wash',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  },
  {
    id: 'prod_005',
    sku: 'ST-34-X-32-IND',
    name: 'Straight Fit Indigo Wash',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  },
  {
    id: 'prod_006',
    sku: 'ST-36-X-34-IND',
    name: 'Straight Fit Indigo Wash',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  },

  // Onyx wash variations
  {
    id: 'prod_007',
    sku: 'ST-28-X-30-ONX',
    name: 'Straight Fit Onyx Wash',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  },
  {
    id: 'prod_008',
    sku: 'ST-32-X-32-ONX',
    name: 'Straight Fit Onyx Wash',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  },
  {
    id: 'prod_009',
    sku: 'ST-36-X-36-ONX',
    name: 'Straight Fit Onyx Wash',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  },

  // Jaguar wash variations
  {
    id: 'prod_010',
    sku: 'ST-30-X-30-JAG',
    name: 'Straight Fit Jaguar Wash',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  },
  {
    id: 'prod_011',
    sku: 'ST-34-X-32-JAG',
    name: 'Straight Fit Jaguar Wash',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  },
  {
    id: 'prod_012',
    sku: 'ST-38-X-34-JAG',
    name: 'Straight Fit Jaguar Wash',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  },

  // Additional sizes
  {
    id: 'prod_013',
    sku: 'ST-40-X-32-STA',
    name: 'Straight Fit Stone Wash',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  },
  {
    id: 'prod_014',
    sku: 'ST-42-X-34-IND',
    name: 'Straight Fit Indigo Wash',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  },
  {
    id: 'prod_015',
    sku: 'ST-44-X-32-ONX',
    name: 'Straight Fit Onyx Wash',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  }
]

// Load persisted data or use defaults
const loadPersistedData = () => {
  try {
    const savedProducts = localStorage.getItem('mockProducts')
    return savedProducts ? JSON.parse(savedProducts) : defaultProducts
  } catch (error) {
    console.error('Failed to load products:', error)
    return defaultProducts
  }
}

// Initialize with persisted or default data
let mockProducts = loadPersistedData()

// Helper function to persist data
const persistData = () => {
  try {
    localStorage.setItem('mockProducts', JSON.stringify(mockProducts))
  } catch (error) {
    console.error('Failed to persist products:', error)
  }
}

// API Functions
export async function getMockProducts(searchQuery?: string): Promise<Product[]> {
  await new Promise(resolve => setTimeout(resolve, 500))
  
  if (!searchQuery) {
    return mockProducts
  }

  const query = searchQuery.toLowerCase()
  return mockProducts.filter(product => 
    product.sku.toLowerCase().includes(query) ||
    product.name.toLowerCase().includes(query)
  )
}

export async function getMockProduct(id: string): Promise<Product | undefined> {
  await new Promise(resolve => setTimeout(resolve, 500))
  return mockProducts.find(product => product.id === id)
}

export async function getMockProductBySKU(sku: string): Promise<Product | undefined> {
  await new Promise(resolve => setTimeout(resolve, 500))
  return mockProducts.find(product => product.sku === sku)
}

// Export for testing
export { mockProducts }