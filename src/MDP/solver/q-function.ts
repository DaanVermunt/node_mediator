import { Problem } from '../process/problem'
import { StateHash } from '../state/state'
import { Action, ActionHash } from '../action/action'

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
    }

    qValues: Record<StateHash, Record<ActionHash, number>>

    get(state: StateHash, action: ActionHash): number {
        return this.qValues[state][action]
    }

    set(state: StateHash, action: ActionHash, val: number): void {
        this.qValues[state][action] = val
    }

    maxQValue(state: StateHash): number {
        const maxx = Object.values(this.qValues[state])
            .reduce((max, val) => val > max ? val : max, Number.NEGATIVE_INFINITY)
        if (Math.random() < .00) {
            console.log(Object.values(this.qValues[state]))
            console.log(maxx)
        }
        return maxx
    }

    getMaxAction(state: StateHash): Action {
        return this.p.actions.reduce((maxAction, action) => {
            return this.get(state, maxAction.h()) < this.get(state, action.h()) ?
                action : maxAction
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
