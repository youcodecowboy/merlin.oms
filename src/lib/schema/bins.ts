export type BinZone = 'WASH' | 'QC' | 'STOCK' | 'FINISH' | 'PACK' | '1' | '2' | '3' | '4' | '5'

export interface Bin {
  id: string
  zone: BinZone
  rack: string
  shelf: string
  capacity: number
  current_items: number
  items: string[] // Array of inventory item IDs
} 