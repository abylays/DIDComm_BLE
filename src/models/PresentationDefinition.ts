export interface PresentationDefinition {
    id: string
    name: string
    purpose?: string
    input_descriptors: InputDescriptor[]
}

export interface InputDescriptor {
    id: string
    name?: string
    purpose?: string
    constraints?: { 'fields': ConstraintField[] }
}

export interface ConstraintField {
    path: string[]
    id?: string
    purpose?: string
    filter: object
}
