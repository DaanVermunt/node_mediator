import { FactorName } from './factor'
import { PrimitiveName } from '../mediator-model/action/m-primitives'

export interface ActionImpactInput {
    primitive_name: PrimitiveName
    name: string
    on_factor: FactorName
    diff: number
    std: number
}

export interface ActionImpact {
    name: string
    effectFrom: PrimitiveName
    effectFactor: FactorName
    meanEffect: number
    std: number
}
