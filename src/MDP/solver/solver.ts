import { Problem } from '../process/problem'
import QFunction from './q-function'

export interface Solver {
    solve(p: Problem): QFunction
}
