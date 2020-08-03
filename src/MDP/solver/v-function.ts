import { Problem } from '../process/problem'
import { StateHash } from '../state/state'
import { Action, ActionHash, emergencyStop } from '../action/action'
import { IllegalDecoded } from './q-function'

export const encodeIllegal = (illState: IllegalDecoded): ILLEGALVValue => JSON.stringify(illState)
export const decodeIllegal = (illState: string): IllegalDecoded => JSON.parse(illState)

export type ILLEGALVValue = string
export type VValue = number | ILLEGALVValue

export const isNumericVValue = (vval: VValue): vval is number => {
    return !(typeof vval === 'string')
}

export const isIllegalVValue = (vval: VValue): vval is ILLEGALVValue => {
    if (typeof vval === 'string') {
        const illState = decodeIllegal(vval)
        if ('stepsToPossibleDanger' in illState) {
            return true
        }
    }
    return false
}

export const vValueCompare = (a: VValue, b: VValue): number => {
    if (isNumericVValue(a) &&  isNumericVValue(b)) {
        return a > b ? -1 : 1
    } else if (isIllegalVValue(a) && !isIllegalVValue(b)) {
        return 1
    } else if (isIllegalVValue(b) && !isIllegalVValue(a)) {
        return -1
    } else if (isIllegalVValue(a) && isIllegalVValue(b)) {
        const aObj = decodeIllegal(a)
        const bObj = decodeIllegal(b)

        return 1e5 * (bObj.stepsToPossibleDanger - aObj.stepsToPossibleDanger) + 1e-5 * (bObj.val - aObj.val)
    }
    return 0
}

export const formatVValue = (val: VValue): string => {
    if (isNumericVValue(val)) {
        return val.toFixed(2)
    }
    return val
}

class VFunction {

    constructor(
        private readonly p: Problem,
        private readonly vValuesInit?: Record<StateHash, VValue>,
        private readonly actionsInit?: Record<StateHash, ActionHash>,
    ) {
        if (vValuesInit) {
            this.vValues = JSON.parse(JSON.stringify(vValuesInit))
            this.actions = JSON.parse(JSON.stringify(actionsInit))
        } else {
            this.vValues = {} as Record<StateHash, VValue>
            p.states.forEach(state => {
                this.vValues[state.h()] = 0
                this.actions[state.h()] = 'passive'
            })
        }
    }

    vValues: Record<StateHash, VValue> = {} as Record<StateHash, VValue>
    actions: Record<StateHash, ActionHash> = {} as Record<StateHash, ActionHash>

    get(state: StateHash): VValue {
        return this.vValues[state]
    }

    getActionHash(state: StateHash): ActionHash {
        return this.actions[state]
    }

    setValue(state: StateHash, val: VValue): void {
        this.vValues[state] = val
    }

    setAction(state: StateHash, action: ActionHash): void {
        this.actions[state] = action
    }

    equals(other: VFunction, epsilon: number = 0): boolean {
        try {
            this.p.states.forEach(state => {
                const a = this.vValues[state.h()]
                const b = other.vValues[state.h()]
                if (isNumericVValue(a) && isNumericVValue(b)) {
                    if (Math.abs(b - a) > epsilon) {
                        throw new Error()
                    }
                } else {
                    if (a !== b) {
                        throw new Error()
                    }
                }

                const aAct = this.actions[state.h()]
                const bAct = other.actions[state.h()]
                if (bAct !== aAct) {
                    throw new Error()
                }
            })
        } catch (e) {
            return false
        }

        return true
    }

    copy(): VFunction {
        return new VFunction(this.p, this.vValues, this.actions)
    }

    getAction(stHash: string): Action {
        if (isIllegalVValue(this.get(stHash))) {
            return emergencyStop
        }

        return this.p.actionList[this.getActionHash(stHash)]
    }
}

export default VFunction
