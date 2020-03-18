import { Stringable } from '../../helper/generic-interfaces/stringable'

export type StateHash = string

export interface State extends Stringable {
    reward(): number
    transitionCost(from: this): number
    h(): StateHash
}
