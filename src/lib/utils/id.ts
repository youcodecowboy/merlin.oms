import { customAlphabet } from 'nanoid'

// Create custom nanoid with only alphanumeric characters (no special chars)
const generateId = customAlphabet('0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ', 5)

export const createItemId = () => generateId()
export const createRequestId = (prefix: string) => `${prefix}-${generateId()}` 