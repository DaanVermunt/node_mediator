import { Action } from '../../MDP/action/action'
import MState, { HumanConfidence, LoA, zeroState } from '../state/m-state'
import Primitive from '../../MDP/action/primitive'
import { State, StateHash } from '../../MDP/state/state'
import { SimulationState } from '../../simulation/simulation-state'

const baseMatrix = (mStates: MState[], simState: SimulationState): Record<StateHash, Record< StateHash, number>> => {
    const base = mStates.reduce((mtx, s1) => {

        const vct = mStates.reduce((vec, s2) => {
            return { [s2.h()]: 0, ...vec }
        }, {})

        return { [s1.h()]: vct, ...mtx }
    }, {} as Record<StateHash, Record<StateHash, number>>)
    base[zeroState.h()][zeroState.h()] = 1
    return base
}

export type PrimitiveName = 'do_nothing' | 'loa_up' | 'loa_down' | 'hc_up'

// TODO make sim dependent
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

    const doNothingTrans = baseMatrix(mStates, simState)
    mStates.forEach(state => {
        if (state.time === -1) {
            return
        }

        const stateTo = state.time === maxtime
            ? zeroState
            : new MState(state.humanConfidence, state.loa, state.autonomousConfidence, state.time + 1)

        doNothingTrans[state.h()][stateTo.h()] += 1
    })

    const loaUpTrans = baseMatrix(mStates, simState)
    mStates.filter(state => state.h() !== zeroState.h()).forEach(state => {
        if (state.loa < LoA.LoA2 && state.time <  maxtime) {
            const goalState = new MState(state.humanConfidence, state.loa + 1, state.autonomousConfidence, state.time + 1)
            const failState = new MState(state.humanConfidence, state.loa, state.autonomousConfidence, state.time + 1)

            loaUpTrans[state.h()][goalState.h()] += .9
            loaUpTrans[state.h()][failState.h()] += .1
        } else if (state.time === maxtime) {
            loaUpTrans[state.h()][zeroState.h()] = 1
        }
    })

    const loaDownTrans = baseMatrix(mStates, simState)
    mStates.filter(state => state.h() !== zeroState.h()).forEach(state => {
        if (state.loa > LoA.LoA0 && state.time <  maxtime) {
            const goalState = new MState(state.humanConfidence, state.loa - 1, state.autonomousConfidence, state.time + 1)
            const failState = new MState(state.humanConfidence, state.loa, state.autonomousConfidence, state.time + 1)

            loaDownTrans[state.h()][goalState.h()] += .9
            loaDownTrans[state.h()][failState.h()] += .1
        } else if (state.time === maxtime) {
            loaDownTrans[state.h()][zeroState.h()] = 1
        }
    })

    const hcUpTrans = baseMatrix(mStates, simState)
    mStates.filter(state => state.h() !== zeroState.h()).forEach(state => {
        if (state.humanConfidence < HumanConfidence.HC2 && state.time <  maxtime) {
            const goalState = new MState(state.humanConfidence + 1, state.loa, state.autonomousConfidence, state.time + 1)
            const failState = new MState(state.humanConfidence, state.loa, state.autonomousConfidence, state.time + 1)

            hcUpTrans[state.h()][goalState.h()] += .9
            hcUpTrans[state.h()][failState.h()] += .1
        } else if (state.time === maxtime) {
            hcUpTrans[state.h()][zeroState.h()] = 1
        }
    })

    return {
        do_nothing: new Primitive(
            'do_nothing',
            doNothingTrans,
            stateList),
        loa_up: new Primitive(
            'loa_up',
            loaUpTrans,
            stateList),
        loa_down: new Primitive(
            'loa_down',
            loaDownTrans,
            stateList),
        hc_up: new Primitive(
            'hc_up',
            hcUpTrans,
            stateList),
    }
}
