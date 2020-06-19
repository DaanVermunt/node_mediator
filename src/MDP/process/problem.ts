import { State, StateHash } from '../state/state'
import { Action, ActionHash } from '../action/action'
import Simulation from '../../simulation/simulation'

export interface Problem {
    states: State[]
    stateList: Record<StateHash, State>
    actions: Action[]
    actionList: Record<ActionHash, Action>
    simulation: Simulation
}
