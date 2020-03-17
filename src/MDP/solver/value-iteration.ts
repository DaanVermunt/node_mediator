import { Solver } from './solver'
import { Problem } from '../process/problem'
import QFunction from './q-function'
import { Action } from '../action/action'
import { State, StateHash } from '../state/state'

class ValueIteration implements Solver {
    constructor(
        private gamma: number,
        private lr: number,
        private n: number = 200,
    ) {
    }

    newQValue(qCurrent: number, qMax: (to: StateHash) => number, action: Action, state: State) {
        const { to, reward, numberOfSteps } = action.perform(state)
        return qCurrent + this.lr * (reward + Math.pow(this.gamma, numberOfSteps) * qMax(to.h()) - qCurrent)
    }

    solve(p: Problem): QFunction {
        const q = new QFunction(p)
        for (let i = 0; i < this.n; i++) {
            Object.values(p.states).forEach(state => {
                p.actions.forEach(action => {
                    const qCurrent = q.get(state.h(), action.h())
                    const val = this.newQValue(qCurrent, q.maxQValue, action, state)

                    q.set(state.h(), action.h(), val)
                })
            })
        }

        return q
    }
}

export default ValueIteration
