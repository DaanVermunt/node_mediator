import { Action } from '../action/action'

export interface Process {
    getAction: () => Action | undefined
}
