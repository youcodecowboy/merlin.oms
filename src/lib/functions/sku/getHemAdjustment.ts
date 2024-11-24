export function getHemAdjustment(hem: 'RWH' | 'STH' | 'ORL' | 'HRL'): number {
  switch (hem) {
    case 'RWH': return 0
    case 'STH': return 0
    case 'ORL': return 2
    case 'HRL': return 4
    default: return 0
  }
}