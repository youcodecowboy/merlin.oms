import { SKUComponents } from '@/lib/sku'

export interface InventoryLogEntry {
  timestamp: string
  type: 'SEARCH' | 'MATCH' | 'COMMIT' | 'PRODUCTION'
  details: {
    orderSKU?: string
    matchType?: 'EXACT' | 'UNIVERSAL' | 'NONE'
    itemId?: string
    components?: SKUComponents
    message: string
  }
}

class InventoryLogger {
  private logs: InventoryLogEntry[] = []

  logSearch(orderSKU: string) {
    this.addEntry('SEARCH', {
      orderSKU,
      message: `Starting inventory search for SKU: ${orderSKU}`
    })
  }

  logMatch(matchType: 'EXACT' | 'UNIVERSAL' | 'NONE', details: {
    orderSKU: string
    itemId?: string
    message: string
  }) {
    this.addEntry('MATCH', {
      matchType,
      ...details
    })
  }

  logCommit(itemId: string, orderId: string) {
    this.addEntry('COMMIT', {
      itemId,
      message: `Committed item ${itemId} to order ${orderId}`
    })
  }

  logProduction(components: SKUComponents, quantity: number) {
    this.addEntry('PRODUCTION', {
      components,
      message: `Created production request for ${quantity} units`
    })
  }

  private addEntry(type: InventoryLogEntry['type'], details: InventoryLogEntry['details']) {
    this.logs.push({
      timestamp: new Date().toISOString(),
      type,
      details
    })
  }

  getLogs(): InventoryLogEntry[] {
    return [...this.logs]
  }

  clearLogs() {
    this.logs = []
  }
}

export const inventoryLogger = new InventoryLogger()</content>