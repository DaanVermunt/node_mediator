import { Problem } from '../process/problem'
import { StateHash } from '../state/state'
import { Action, ActionHash, emergencyStop } from '../action/action'

export const ILLEGAL = 'illegal'
export type QValue = number | typeof ILLEGAL

export const isNumericQValue = (qval: QValue): qval is number => {
    return qval !== 'illegal'
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
    ) {
        this.qValues = {} as Record<StateHash, Record<ActionHash, number>>
        p.states.forEach(state => {

            this.qValues[state.h()] = {} as Record<ActionHash, number>
            p.actions.forEach(action => {
                this.qValues[state.h()][action.h()] = 0
            })
        })
        this.maxQValue = this.maxQValue.bind(this)
    }

    qValues: Record<StateHash, Record<ActionHash, QValue>>

    get(state: StateHash, action: ActionHash): QValue {
        return this.qValues[state][action]
    }

    set(state: StateHash, action: ActionHash, val: QValue): void {
        this.qValues[state][action] = val
    }

    maxQValue(state: StateHash): QValue {
        return Object.values(this.qValues[state])
            .reduce((max, val) => val === ILLEGAL || max > val ? max : val, ILLEGAL)
    }

    getMaxAction(state: StateHash): Action {
        if (this.maxQValue(state) === ILLEGAL) {
            return emergencyStop
        }

        return this.p.actions.reduce((maxAction, action) => {
            const maxQ = this.get(state, maxAction.h())
            const actQ = this.get(state, action.h())

            const res = actQ === ILLEGAL || maxQ > actQ ? maxAction : action

            return res
        })
    }

    equals(other: QFunction): boolean {
        this.p.states.forEach(state => {
            this.p.actions.forEach(action => {

                if (this.qValues[state.h()][action.h()] !== other.qValues[state.h()][action.h()]) {
                    return false
                }

            })
        })

        return true
    }
}

export default QFunction
