import { Solver } from './solver'
import { Problem } from '../process/problem'
import QFunction, { ILLEGAL, isNumericQValue, QValue } from './q-function'
import { Action } from '../action/action'
import { State, StateHash } from '../state/state'
import { isMState } from '../../mediator-model/state/m-state'

class ValueIteration implements Solver {
    constructor(
        private gamma: number,
        private lr: number,
        private n: number = 200,
    ) {
    }

    newQValue(qCurrent: QValue, qMax: (to: StateHash) => QValue, action: Action, state: State): QValue {
        const { to, reward, numberOfSteps, hasPassedIllegal } = action.perform(state)
        const qMaxVal = qMax(to.h())

        if (isMState(state) && state.time < 0) {
           return 0
        }

        if (isNumericQValue(qCurrent) && isNumericQValue(qMaxVal) && !hasPassedIllegal) {
            return qCurrent + this.lr * (reward + Math.pow(this.gamma, numberOfSteps) * qMaxVal - qCurrent)
        } else {
            return ILLEGAL
        }
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
