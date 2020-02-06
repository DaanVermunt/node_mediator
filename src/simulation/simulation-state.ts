import { AutonomousConfidence, HumanConfidence, LoA } from '../mediator-model/state/m-state'
import Context from './context'

export interface SimulationState {
    t: number
    inOption: boolean
    // TODO TD* uncertainty
    TTD: Record<LoA, number>
    TTA: Record<LoA, number>
    context: Context
    LoA: LoA
}
