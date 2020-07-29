import { Problem } from '../process/problem'
import { StateHash } from '../state/state'
import { Action, ActionHash, emergencyStop } from '../action/action'

export interface IllegalDecoded {
    to: number
}

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
        if ('to' in illState) {
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
        return Object.values(this.qValues[state])
            .reduce((max, val) => isIllegalQValue(val) || max > val ? max : val, encodeIllegal({ to: 5 }))
    }

    getMaxAction(state: StateHash): Action {
        if (isIllegalQValue(this.maxQValue(state))) {
            return emergencyStop
        }

        return this.p.actions.reduce((maxAction, action) => {
            const maxQ = this.get(state, maxAction.h())
            const actQ = this.get(state, action.h())

            const res = isIllegalQValue(actQ) || maxQ > actQ ? maxAction : action
            // const res = actQ === ILLEGAL || maxQ > actQ ? maxAction : action

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
