import { Problem } from '../process/problem'
import { StateHash } from '../state/state'
import { Action, ActionHash, emergencyStop } from '../action/action'

export interface IllegalDecoded {
    stepsToPossibleDanger: number
    qval: number
}

export const getNewIllegal = (qval: number = 0, stepsToPossibleDanger: number = Infinity) => ({ qval, stepsToPossibleDanger })

export const encodeIllegal = (illState: IllegalDecoded): ILLEGALQvalue => JSON.stringify(illState)
export const decodeIllegal = (illState: string): IllegalDecoded => JSON.parse(illState)

export type ILLEGALQvalue = string
export type QValue = number | ILLEGALQvalue

export const isNumericQValue = (qval: QValue): qval is number => {
    return !(typeof qval === 'string')
}

export const isIllegalQValue = (qval: QValue): qval is ILLEGALQvalue => {
    if (typeof qval === 'string') {
        const illState = decodeIllegal(qval)
        if ('stepsToPossibleDanger' in illState) {
            return true
        }
    }
    return false
}

export const formatQValue = (val: QValue): string => {
    if (isNumericQValue(val)) {
        return val.toFixed(2)
    }
    return val
}

class QFunction {

    constructor(
        private readonly p: Problem,
        private readonly qValuesInit?: Record<StateHash, Record<ActionHash, QValue>>,
    ) {
        if (qValuesInit) {
            this.qValues = JSON.parse(JSON.stringify(qValuesInit))
        } else {
            this.qValues = {} as Record<StateHash, Record<ActionHash, QValue>>
            p.states.forEach(state => {

                this.qValues[state.h()] = {} as Record<ActionHash, QValue>
                p.actions.forEach(action => {
                    this.qValues[state.h()][action.h()] = 0
                })
            })
        }
        this.maxQValue = this.maxQValue.bind(this)
    }

    qValues: Record<StateHash, Record<ActionHash, QValue>> = {} as Record<StateHash, Record<ActionHash, QValue>>

    get(state: StateHash, action: ActionHash): QValue {
        return this.qValues[state][action]
    }

    set(state: StateHash, action: ActionHash, val: QValue): void {
        this.qValues[state][action] = val
    }

    maxQValue(state: StateHash): QValue {
        // TODO: figure what is the max illegal value
        return Object.values(this.qValues[state])
            .reduce((max, val) => {
                // If max numeric
                if (isNumericQValue(max)) {
                    if (isNumericQValue(val)) {
                        // If max and value numeric take max value
                        return Math.max(max, val)
                    } else {
                        // Otherwise max is higher than illegal
                        return max
                    }
                }
                if (isNumericQValue(val)) {
                    // If val is numeric and max is not val is higher
                    return val
                } else {
                    // IF both are illegal
                    const valObj = decodeIllegal(val)
                    const maxObj = decodeIllegal(max)
                    if (maxObj.stepsToPossibleDanger === valObj.stepsToPossibleDanger) {
                        return maxObj.qval > valObj.qval ? max : val
                    } else {
                        return maxObj.stepsToPossibleDanger > valObj.stepsToPossibleDanger ? max : val
                    }
                }
            }, encodeIllegal(getNewIllegal(-Infinity, 0)))
    }

    getMaxAction(state: StateHash): Action {
        // console.log(state, this.maxQValue(state))
        if (isIllegalQValue(this.maxQValue(state))) {
            return emergencyStop
        }

        return this.p.actions.reduce((maxAction, action) => {
            const maxQ = this.get(state, maxAction.h())
            const actQ = this.get(state, action.h())

            // TODO: Deal with this
            const res = isIllegalQValue(actQ) || maxQ > actQ ? maxAction : action

            return res
        })
    }

    equals(other: QFunction, epsilon: number = 0): boolean {
        try {
            this.p.states.forEach(state => {
                this.p.actions.forEach(action => {

                    const a = this.qValues[state.h()][action.h()]
                    const b = other.qValues[state.h()][action.h()]
                    if (isNumericQValue(a) && isNumericQValue(b)) {
                        if (Math.abs(b - a) > epsilon) {
                            throw new Error()
                        }
                    } else {
                        if (a !== b) {
                            throw new Error()
                        }
                    }
                })
            })
        } catch (e) {
            return false
        }

        return true
    }

    copy(): QFunction {
        return new QFunction(this.p, this.qValues)
    }
}

export default QFunction
