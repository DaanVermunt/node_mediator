import { ActionImpactInput } from './actionImpact'
import { FactorInput } from './factor'
import { LoA } from '../mediator-model/state/m-state'

export type RewardSystem = 'max_automation' | 'min_automation' | 'min_transitions'

export interface Scenario {
    actionEffects: ActionImpactInput[]
    factors: FactorInput[]
    totalT: number
    startLoa?: LoA
    description: string
    horizon?: number
    rewardSystem?: RewardSystem
}
