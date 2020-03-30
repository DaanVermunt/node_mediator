import { AutonomousConfidence, HumanConfidence, LoA } from '../mediator-model/state/m-state'
import Context from './context'
import { ActionImpact } from './actionImpact'

export interface SimulationState {
    t: number
    inOption: boolean
    TTD: Record<LoA, number>
    TTA: Record<LoA, number>
    context: Context
    LoA: LoA
    impacts: ActionImpact[]
    futureScope: number
}
