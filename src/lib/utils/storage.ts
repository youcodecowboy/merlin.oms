const STORAGE_KEY = 'merlin_mock_db'

export function saveToStorage(data: any) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data))
  } catch (error) {
    console.error('Failed to save to storage:', error)
  }
}

export function loadFromStorage() {
  try {
    const data = localStorage.getItem(STORAGE_KEY)
    return data ? JSON.parse(data) : null
  } catch (error) {
    console.error('Failed to load from storage:', error)
    return null
  }
} 