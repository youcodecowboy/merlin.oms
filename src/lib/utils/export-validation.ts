import { ModuleExports, REQUIRED_EXPORTS } from './export-registry'

export class ExportValidationError extends Error {
  constructor(
    public module: string,
    public missing: string[],
    public type: 'required' | 'types' | 'optional'
  ) {
    super(`Missing ${type} exports in ${module}: ${missing.join(', ')}`)
    this.name = 'ExportValidationError'
  }
}

export function validateModuleExports(modulePath: string, exports: any) {
  const moduleSpec = REQUIRED_EXPORTS.find(spec => spec.path === modulePath)
  if (!moduleSpec) {
    console.warn(`No export specification found for module: ${modulePath}`)
    return
  }

  // Check required exports
  const missingRequired = moduleSpec.required.filter(exp => !(exp in exports))
  if (missingRequired.length > 0) {
    throw new ExportValidationError(modulePath, missingRequired, 'required')
  }

  // Check type exports if specified
  if (moduleSpec.types) {
    const missingTypes = moduleSpec.types.filter(type => !(type in exports))
    if (missingTypes.length > 0) {
      throw new ExportValidationError(modulePath, missingTypes, 'types')
    }
  }

  // Check optional exports if specified
  if (moduleSpec.optional) {
    const missingOptional = moduleSpec.optional.filter(exp => !(exp in exports))
    if (missingOptional.length > 0) {
      console.warn(`Missing optional exports in ${modulePath}: ${missingOptional.join(', ')}`)
    }
  }
}

// Validate exports during development
export function validateAllExports() {
  if (process.env.NODE_ENV !== 'development') return

  const errors: ExportValidationError[] = []
  
  REQUIRED_EXPORTS.forEach(spec => {
    try {
      // Dynamic import for browser compatibility
      import(`../${spec.path}`).then(module => {
        validateModuleExports(spec.path, module)
      }).catch(error => {
        console.error(`Failed to load module ${spec.path}:`, error)
      })
    } catch (error) {
      if (error instanceof ExportValidationError) {
        errors.push(error)
      } else {
        console.error(`Failed to validate exports for ${spec.path}:`, error)
      }
    }
  })

  if (errors.length > 0) {
    throw new Error(
      'Export validation failed:\n' +
      errors.map(e => `- ${e.message}`).join('\n')
    )
  }
}

// Run validation in development
if (process.env.NODE_ENV === 'development') {
  validateAllExports()
} 