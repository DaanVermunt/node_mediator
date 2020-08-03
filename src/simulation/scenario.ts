import { ActionImpactInput } from './actionImpact'
import { FactorInput } from './factor'
import { LoA } from '../mediator-model/state/m-state'

export type RewardSystem = 'max_automation' | 'min_automation' | 'min_transitions'

export interface AlActionParams {
    successOfPrimitive: number
    numberOfAttempts: number
}

export interface LoaParams {
    up: AlActionParams,
    down: AlActionParams,
}

export const loaActionDefault: LoaParams = {
    up: {
        numberOfAttempts: 1,
        successOfPrimitive: 1,
    },
    down: {
        numberOfAttempts: 1,
        successOfPrimitive: 1,
    },
}

export interface Scenario {
    actionEffects: ActionImpactInput[]
    factors: FactorInput[]
    totalT: number
    startLoa?: LoA
    description: string
    horizon?: number
    timeOfES?: number
    fearOfES?: number
    rewardSystem?: RewardSystem
    alActionParams?: LoaParams
}
