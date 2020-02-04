import { Solver } from './solver'
import { Problem } from '../process/problem'
import QFunction from './q-function'
import MState from '../../mediator-model/state/m-state'

class ValueIteration implements Solver {
    constructor(
        private gamma: number,
        private lr: number,
        private n: number = 200,
    ) {
    }

    solve(p: Problem): QFunction {
        const q = new QFunction(p)
        for (let i = 0; i < this.n; i++) {
            Object.values(p.states).forEach(state => {
                p.actions.forEach(action => {
                    const { to, reward, numberOfSteps } = action.perform(state)

                    const qCurrent = q.get(state.h(), action.h())

                    const val = qCurrent + this.lr * (reward + Math.pow(this.gamma, numberOfSteps) * q.maxQValue(to.h()) - qCurrent)

                    // if (numberOfSteps >= 1) {
                    //     console.log('-----------------------------')
                    //     console.log(numberOfSteps)
                    // }

                    q.set(state.h(), action.h(), val)

                })
            })
        }

        return q
    }
}

export default ValueIteration
