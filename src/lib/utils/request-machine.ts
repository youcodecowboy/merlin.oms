type RequestState = 'PENDING' | 'IN_PROGRESS' | 'COMPLETED' | 'FAILED'

const validTransitions: Record<RequestState, RequestState[]> = {
  'PENDING': ['IN_PROGRESS', 'FAILED'],
  'IN_PROGRESS': ['COMPLETED', 'FAILED'],
  'COMPLETED': [],
  'FAILED': ['PENDING']
}

export class RequestMachine {
  constructor(private currentState: RequestState = 'PENDING') {}

  transition(to: RequestState) {
    const valid = validTransitions[this.currentState].includes(to)
    if (!valid) {
      throw new Error(`Invalid transition from ${this.currentState} to ${to}`)
    }
    this.currentState = to
  }
} 