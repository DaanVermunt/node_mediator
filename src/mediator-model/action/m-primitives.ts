import { Action } from '../../MDP/action/action'
import MState, { HumanConfidence, LoA, toMState, zeroState } from '../state/m-state'
import Primitive from '../../MDP/action/primitive'
import { State, StateHash } from '../../MDP/state/state'
import { SimulationState } from '../../simulation/simulation-state'
import { getACfromSimState, getHCfromSimState } from '../../simulation/simulation'

export const getTransFunction = (simState: SimulationState, maxTime: number) => (action: PrimitiveName, fr: State): Record<StateHash, number> => {
    const from = toMState(fr)
    if (!from) {
        return {}
    }

    const trans = {} as Record<StateHash, number>

    if (from.h() === zeroState.h() || from.time === -1 || from.time === maxTime) {
        trans[zeroState.h()] = 1
        return trans
    }

    const newAC = getACfromSimState(simState, from.time + 1)
    const newHC = getHCfromSimState(simState, from.time + 1)

    switch (action) {
        case 'do_nothing':
            const stateTo = new MState(newHC, from.loa, newAC, from.time + 1)
            trans[stateTo.h()] += 1
            break

        case 'hc_up':
            if (from.humanConfidence < HumanConfidence.HC2) {
                const goalState = new MState(from.humanConfidence + 1, from.loa, newAC, from.time + 1)
                // TODO compute new HC based on action HC up
                const failState = new MState(newHC, from.loa, newAC, from.time + 1)

                trans[goalState.h()] += 1
                trans[failState.h()] += 0
            }
            break
        case 'loa_down':
            if (from.loa > LoA.LoA0) {
                const goalState = new MState(newHC, from.loa - 1, newAC, from.time + 1)
                const failState = new MState(newHC, from.loa, newAC, from.time + 1)

                trans[goalState.h()] += 1
                trans[failState.h()] += 0
            }
            break
        case 'loa_up':
            if (from.loa < LoA.LoA2) {
                const goalState = new MState(newHC, from.loa + 1, newAC, from.time + 1)
                const failState = new MState(newHC, from.loa, newAC, from.time + 1)

                trans[goalState.h()] += 1
                trans[failState.h()] += 0
            }
            break
    }
    return trans
}

export type PrimitiveName = 'do_nothing' | 'loa_up' | 'loa_down' | 'hc_up'

// TODO get primatives from source files
/*
Primatives are ATM:
- do nothing
- loa up
- loa down
- hc up
 */
export const getMPrimitives = (mStates: MState[], simState: SimulationState, nrSteps: number): Record<PrimitiveName, Action> => {
    const maxtime = nrSteps - 1
    const stateList = mStates.reduce((res, state) => ({ [state.h()]: state, ...res }), {} as Record<StateHash, State>)

    const transFunction = getTransFunction(simState, maxtime)

    return {
        do_nothing: new Primitive(
            'do_nothing',
            // doNothingTrans,
            transFunction,
            stateList),
        loa_up: new Primitive(
            'loa_up',
            // loaUpTrans,
            transFunction,
            stateList),
        loa_down: new Primitive(
            'loa_down',
            // loaDownTrans,
            transFunction,
            stateList),
        hc_up: new Primitive(
            'hc_up',
            // hcUpTrans,
            transFunction,
            stateList),
    }
}
