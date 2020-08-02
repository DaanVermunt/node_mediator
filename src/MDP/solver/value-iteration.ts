import { Solver } from './solver'
import { Problem } from '../process/problem'
import {
    decodeIllegal,
    encodeIllegal,
    IllegalDecoded,
} from './q-function'
import { Action, ActionHash } from '../action/action'
import { State, StateHash } from '../state/state'
import { fromStateHash, getAC, getHC, getHCI, getLoA, getT } from '../../mediator-model/state/m-state'
import VFunction, { isIllegalVValue, isNumericVValue, VValue, vValueCompare } from './v-function'

class ValueIteration implements Solver {
    constructor(
        private gamma: number,
        private epsilon: number,
        private n: number,
        private timeOfES: number,
    ) {
    }

    // checkIllegalQValue(qCurrent: QValue, qMaxVal: QValue, hasPassedIllegal: boolean, numberOfSteps: number):
    // {illegal: boolean, illegalRes: QValue } {
    // // TODO: how do we deal with the value inside the illegal state
    //     // DO we have such a thing as prioritizing high possibilities
    //     if (isIllegalQValue(qCurrent)) {
    //         const qCurValIllObj = decodeIllegal(qCurrent)
    //         const illegalRes = encodeIllegal({
    //             stepsToPossibleDanger: Math.max(qCurValIllObj.stepsToPossibleDanger, numberOfSteps),
    //             qval: 0,
    //         })
    //         return {
    //             illegal: true,
    //             illegalRes,
    //         }
    //     }
    //
    //     if (hasPassedIllegal) {
    //         const illState: IllegalDecoded = {
    //             stepsToPossibleDanger: numberOfSteps,
    //             qval: qCurrent,
    //         }
    //
    //         if (numberOfSteps <  this.timeOfES) {
    //             return {
    //                 illegal: true,
    //                 illegalRes: encodeIllegal(illState),
    //             }
    //         }
    //     }
    //
    //     if (isIllegalQValue(qMaxVal)) {
    //         const qMaxValIllObj = decodeIllegal(qMaxVal)
    //
    //         const totalSteps = qMaxValIllObj.stepsToPossibleDanger + numberOfSteps
    //
    //         if (totalSteps < this.timeOfES) {
    //             const illegalRes = encodeIllegal({
    //                 stepsToPossibleDanger: qMaxValIllObj.stepsToPossibleDanger + numberOfSteps,
    //                 qval: qCurrent,
    //             })
    //             return {
    //                 illegal: true,
    //                 illegalRes,
    //             }
    //         }
    //     }
    //     return { illegal: false, illegalRes: encodeIllegal(getNewIllegal()) }
    // }

    // newQValue(qCurrent: QValue, qMax: (to: StateHash) => QValue, action: Action, state: State): QValue {
    //     const { transProbs, reward, numberOfSteps, hasPassedIllegal } = action.perform(state)
    //
    //     const qMaxVal = qMax(Object.keys(transProbs)[0])
    //
    //     if (isMState(state) && state.time < 0) {
    //         return 0
    //     }
    //
    //     // TODO: How do we deal with the different lengths
    //     const { illegal, illegalRes } = this.checkIllegalQValue(qCurrent, qMaxVal, hasPassedIllegal, numberOfSteps)
    //
    //     if(illegal) {
    //         return illegalRes
    //     }
    //
    //     // TODO: TURN TO VALUE ITERATION USING THE POWER OF TRANSITION PROBABILITIES INSTEAD OF Q-LEARNING
    //     return qCurrent * Math.pow(this.gamma, numberOfSteps) + reward
    // }

    newValue(action: Action, state: State, vOld: VFunction) {
        const { transProbs, expReward, numberOfSteps, hasPassedIllegal } = action.getExpReward(state, this.gamma)

        const oldVSum = Object.keys(transProbs)
            .filter(stateHash => transProbs[stateHash].prob > 0)
            .map((stateHash: StateHash) => {
                const vs = vOld.get(stateHash)
                if (isNumericVValue(vs)) {
                    return { val: vs * transProbs[stateHash].prob, illegal: false, distanceToIllegal: Infinity }
                }

                const illegalVal = decodeIllegal(vs)
                // GET steps to state
                const targetT = getT(stateHash)
                const curT = getT(state.h())
                const summedDist = illegalVal.stepsToPossibleDanger + targetT - curT

                return { val: illegalVal.val * transProbs[stateHash].prob, illegal: true, distanceToIllegal: summedDist }
            }).reduce((sum, val) => ({
                    val: sum.val + val.val,
                    illegal: sum.illegal || val.illegal,
                    distanceToIllegal: Math.min(sum.distanceToIllegal, val.distanceToIllegal),
                })
                , { val: 0, illegal: false, distanceToIllegal: Infinity })

        if (hasPassedIllegal) {
            const illState: IllegalDecoded = {
                stepsToPossibleDanger: numberOfSteps,
                val: 0,
                // val: expReward + oldVSum.val,
            }
            return encodeIllegal(illState)
        }

        if (oldVSum.illegal && oldVSum.distanceToIllegal < this.timeOfES) {
            const illRes: IllegalDecoded = {
                stepsToPossibleDanger: oldVSum.distanceToIllegal,
                // val: expReward + oldVSum.val,
                val: 0,
            }
            return encodeIllegal(illRes)
        }

        return expReward + oldVSum.val
    }

    solve(p: Problem): VFunction {
        const v = new VFunction(p)
        let v2: null | VFunction = null
        let n = 0
        // for (let i = 0; i < this.n; i++) {
        while ( (v2 === null || !v2.equals(v, this.epsilon)) && n < this.n) {
            v2 = v.copy()
            n = n + 1

            Object.values(p.states).forEach(state => {
                const vActions =  p.actions.map((action ): {val: VValue, action: ActionHash} => {
                    const val = this.newValue(action, state, v2 as VFunction)

                    return {
                        val,
                        action: action.h(),
                    }
                })

                vActions.sort((a, b) => vValueCompare(a.val, b.val))
                const maxAction = vActions[0]

                v.setAction(state.h(), maxAction.action)
                v.setValue(state.h(), maxAction.val)

            })
        }

        // console.log(Object
        //     .keys(v.vValues)
        //     .filter(key => getT(key) < 3)
        //     .filter(key => getLoA(key) === 0)
        //     .filter(key => getHCI(key) === 0)
        //     .filter(key => getAC(key) === 2)
        //     .filter(key => getHC(key) === 3)
        //     .map(key => `${key}, ${v.vValues[key]}`),
        // )

        console.log(`solving took --  ${n}  -- time steps`)
        return v
    }
}

export default ValueIteration
