import { Problem } from '../process/problem'
import { Action } from '../action/action'

export interface Solver {
    solve(p: Problem): Action
}
