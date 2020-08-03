import { State, StateHash } from '../state/state'
import { Stringable } from '../../helper/generic-interfaces/stringable'

export interface ActionResPerform {
    to: State
    reward: number
    numberOfSteps: number
    hasPassedIllegal: boolean
}

export interface ActionRes {
    transProbs: Record<StateHash, {state: State, prob: number}>
    reward: Record<StateHash, number>
    expReward: number
    numberOfSteps: number
    hasPassedIllegal: boolean
}

export const nullResPerform: (from: State) => ActionResPerform = from => ({
    to: from,
    reward: Number.NEGATIVE_INFINITY,
    numberOfSteps: 1,
    hasPassedIllegal: true,
})

export const nullRes: (from: State) => ActionRes = from => ({
    transProbs: {},
    expReward: Number.NEGATIVE_INFINITY,
    reward: {},
    numberOfSteps: 1,
    hasPassedIllegal: true,
})

export type ActionHash = string

export interface Action extends Stringable {
    perform: (from: State) => ActionResPerform
    getExpReward: (from: State, discount: number) => ActionRes
    name: string
    h(): string
    cost?: number
}

export const EMERGENCY_STOP = 'EMERGENCY_STOP'

export const emergencyStop: Action = {
    perform: (state: State) => nullResPerform(state),
    getExpReward: (state: State) => nullRes(state),
    name: EMERGENCY_STOP,
    h: () =>  EMERGENCY_STOP,
}

export const isEmergencyStop = (action: Action): boolean => {
    return action.name === EMERGENCY_STOP
}
