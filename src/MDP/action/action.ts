import { State } from '../state/state'
import { Stringable } from '../../helper/generic-interfaces/stringable'

export interface ActionRes {
    to: State
    reward: number
    numberOfSteps: number
}

export const nullRes: (from: State) => ActionRes = from => ({
    to: from,
    reward: Number.NEGATIVE_INFINITY,
    numberOfSteps: 1,
})

export type ActionHash = string

export interface Action extends Stringable {
    // TODO take into account penalty for switching state
    perform: (from: State) => ActionRes
    name: string
    h(): string
}
