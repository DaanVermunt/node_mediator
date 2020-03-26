import { State } from '../state/state'
import { Stringable } from '../../helper/generic-interfaces/stringable'

export interface ActionRes {
    to: State
    reward: number
    numberOfSteps: number
    hasPassedIllegal: boolean
}

export const nullRes: (from: State) => ActionRes = from => ({
    to: from,
    // reward: Number.NEGATIVE_INFINITY,
    reward: -10000,
    numberOfSteps: 1,
    hasPassedIllegal: true,
})

export type ActionHash = string

export interface Action extends Stringable {
    perform: (from: State) => ActionRes
    name: string
    h(): string
    cost?: number
}

export const EMERGENCY_STOP = 'EMERGENCY_STOP'

export const emergencyStop: Action = {
    perform: (state: State) => nullRes(state),
    name: EMERGENCY_STOP,
    h: () =>  EMERGENCY_STOP,
}

export const isEmergencyStop = (action: Action): boolean => {
    return action.name === EMERGENCY_STOP
}
