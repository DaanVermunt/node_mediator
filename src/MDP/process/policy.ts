import { Action } from '../action/action'
import { State, StateHash } from '../state/state'
import QFunction from '../solver/q-function'
import { sortMStates } from '../../helper/model/sort'
import Option from '../../MDP/action/option'
import MState, { HumanConfidence, LoA } from '../../mediator-model/state/m-state'
import { OptionName } from '../../mediator-model/action/m-options'

export type Policy = (state: State) => Action
export type PolicyVector = Record<StateHash, Action>

export const policyFromQFunc = (qFunc: QFunction): PolicyVector => {
    const policy = {} as PolicyVector

    Object.keys(qFunc.qValues).forEach(stateHash => {
        policy[stateHash] = qFunc.getMaxAction(stateHash)
    })

    return policy
}

const actionToArrow = (action: OptionName): string => {
    switch (action) {
        case 'downgrade':
            return 'v'
        case 'passive':
            return '-'
        case 'upgrade':
            return '^'
        case 'wake_up':
            return '>'
    }
}

export const mPolicyToString = (states: MState[], policy: PolicyVector, qFunction: QFunction, maxHorizon: number = Number.POSITIVE_INFINITY): string => {
    states = states.reduce((unique, state) => {
        const duplicate = unique.find(st => st.loa === state.loa && st.time === state.time && st.humanConfidence === state.humanConfidence)

        if (duplicate) {
            return unique
        }
        return [...unique, state]
    }, [] as MState[])

    states.sort(sortMStates)

    let t = -2
    let loa = LoA.LoA0

    let res = ''

    states
        .filter(state => state.time < maxHorizon)
        .forEach(state => {

        if (state.time !== t) {
            res += `\n\t T = ${state.time}`
            t = state.time
        }

        if (state.loa !== loa) {
            res += '\n'
            loa = state.loa

            if (loa === LoA.LoA1) {
                res += 'LOA'
            }

            res += '\t'
        }

        const action = policy[state.h()]
        if (action instanceof Option) {
            // res += `[${actionToArrow(action.name)}]`
            res += `[${actionToArrow(action.name)}, ${qFunction.get(state.h(), action.h()).toFixed(2)}]`
            // res += `[${state.loa + ',' + state.humanConfidence}, ${actionToArrow(action.name)}, ${qFunction.get(state.h(), action.h()).toFixed(0)}]`
        }

        if (state.loa === LoA.LoA0 && state.humanConfidence === HumanConfidence.HC2) {
            res += '\n\t\t HC \n'
        }
    })

    return res
}
