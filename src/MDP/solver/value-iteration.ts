import { Solver } from './solver'
import { Problem } from '../process/problem'
import QFunction, {
    decodeIllegal,
    encodeIllegal,
    IllegalDecoded,
    isIllegalQValue,
    QValue } from './q-function'
import { Action } from '../action/action'
import { State, StateHash } from '../state/state'
import { isMState } from '../../mediator-model/state/m-state'

class ValueIteration implements Solver {
    constructor(
        private gamma: number,
        private epsilon: number,
        private n: number,
        private timeOfES: number,
    ) {
    }

    newQValue(qCurrent: QValue, qMax: (to: StateHash) => QValue, action: Action, state: State): QValue {
        const { to, reward, numberOfSteps, hasPassedIllegal } = action.perform(state)

        const qMaxVal = qMax(to.h())

        if (isMState(state) && state.time < 0) {
            return 0
        }

        // TODO: how do we deal with the value inside the illegal state
        // DO we have such a thing as prioritizing high possibilities
        if (isIllegalQValue(qCurrent)) {
            const qCurValIllObj = decodeIllegal(qCurrent)
            return encodeIllegal({
                stepsToPossibleDanger: Math.max(qCurValIllObj.stepsToPossibleDanger, numberOfSteps),
                qval: 0,
            })
        }

        if (hasPassedIllegal) {
            const illState: IllegalDecoded = {
                stepsToPossibleDanger: numberOfSteps,
                qval: qCurrent,
            }

            if (numberOfSteps <  this.timeOfES) {
                return encodeIllegal(illState)
            }
        }

        if (isIllegalQValue(qMaxVal)) {
            const qMaxValIllObj = decodeIllegal(qMaxVal)

            const totalSteps = qMaxValIllObj.stepsToPossibleDanger + numberOfSteps

            if (totalSteps < this.timeOfES) {
                return encodeIllegal({
                    stepsToPossibleDanger: qMaxValIllObj.stepsToPossibleDanger + numberOfSteps,
                    qval: qCurrent,
                })
            }
        }

        // TODO: TURN TO VALUE ITERATION USING THE POWER OF TRANSITION PROBABILITIES INSTEAD OF Q-LEARNING
        return qCurrent * Math.pow(this.gamma, numberOfSteps) + reward
    }

    solve(p: Problem): QFunction {
        const q = new QFunction(p)
        let q2: null | QFunction = null
        let n = 0
        // for (let i = 0; i < this.n; i++) {
        while ( (q2 === null || !q2.equals(q, this.epsilon)) && n < this.n) {
            q2 = q.copy()
            n = n + 1

            Object.values(p.states).forEach(state => {
                p.actions.forEach(action => {
                    const qCurrent = q.get(state.h(), action.h())
                    const val = this.newQValue(qCurrent, q.maxQValue, action, state)

                    q.set(state.h(), action.h(), val)
                })
            })
        }

        console.log(`solving took --  ${n}  -- time steps`)
        return q
    }
}

export default ValueIteration
