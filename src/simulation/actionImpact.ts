import { FactorName } from './factor'
import { PrimitiveName } from '../mediator-model/action/m-primitives'

export interface ActionImpactInput {
    primitive_name: PrimitiveName
    name: string
    on_factor: FactorName
    success_chance?: number
    diff: number
    std: number
}

export interface ActionImpact {
    name: string
    effectFrom: PrimitiveName
    effectFactor: FactorName
    meanEffect: number
    successChance: number
    std: number
}
