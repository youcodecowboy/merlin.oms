export function buildSKU(components: { 
  style: string
  waist: number
  shape: string
  inseam: number
  wash: string 
}): string {
  return `${components.style}-${components.waist}-${components.shape}-${components.inseam}-${components.wash}`
}