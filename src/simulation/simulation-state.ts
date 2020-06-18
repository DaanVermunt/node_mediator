import { LoA } from '../mediator-model/state/m-state'
import Context from './context'
import { ActionImpact } from './actionImpact'
import { RewardSystem } from './scenario'

export interface SimulationState {
    t: number
    inOption: boolean
    TTD: Record<LoA, number>
    TTA: Record<LoA, number>
    context: Context
    LoA: LoA
    rewardSystem: RewardSystem
    impacts: ActionImpact[]
    futureScope: number
}
