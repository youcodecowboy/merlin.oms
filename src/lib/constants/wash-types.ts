export const WASH_TYPES = {
  STA: {
    code: 'STA',
    name: 'STARDUST',
    description: 'Standard wash for raw denim',
    binLocation: 'WASH-STA'
  },
  IND: {
    code: 'IND',
    name: 'INDIGO',
    description: 'Indigo wash process',
    binLocation: 'WASH-IND'
  },
  ONX: {
    code: 'ONX',
    name: 'ONYX',
    description: 'Black denim wash',
    binLocation: 'WASH-ONX'
  },
  JAG: {
    code: 'JAG',
    name: 'JAGGER',
    description: 'Special wash process',
    binLocation: 'WASH-JAG'
  }
} as const

export type WashType = keyof typeof WASH_TYPES 