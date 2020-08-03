import { Problem } from '../process/problem'
import VFunction from './v-function'

export interface Solver {
    solve(p: Problem): VFunction
}
