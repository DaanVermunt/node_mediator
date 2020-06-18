import { Action } from '../../MDP/action/action'
import MState, { AutonomousConfidence, HumanConfidence, LoA, toMState, transCost, wakeUpCost, zeroState } from '../state/m-state'
import Primitive from '../../MDP/action/primitive'
import { State, StateHash } from '../../MDP/state/state'
import { SimulationState } from '../../simulation/simulation-state'
import { getACfromSimState, getHCfromSimState } from '../../simulation/simulation'

export const getTransFunction = (simState: SimulationState, maxTime: number) => {
    const impactCach: Record<PrimitiveName, Record<number, { hc: HumanConfidence, ac: AutonomousConfidence }>> = {
        do_nothing: {},
        loa_up: {},
        loa_down: {},
        hc_up: {},
    }

    primitiveNames.forEach(primName => {
        for (let i = 0; i <= maxTime; i++) {
            // Action simImpacts are only for non-loa up and non loa down, i.e. hc_up
            const actionsImpacts = simState.impacts.filter(impact => impact.effectFrom === primName)
            actionsImpacts.forEach(imp => {
                simState.context.addActionForPredictions(imp.meanEffect, imp.effectFactor, simState.t + i + 1)
            })

            const newHCWithAction = getHCfromSimState(simState, i + 1)
            const newACWithAction = getACfromSimState(simState, i + 1)

            actionsImpacts.forEach(imp => {
                simState.context.resetImpactsForFactor(imp.effectFactor)
            })

            impactCach[primName][i] = { hc: newHCWithAction, ac: newACWithAction }
        }
    })

    return (action: PrimitiveName, fr: State): Record<StateHash, number> => {
        const from = toMState(fr)
        if (!from) {
            return {}
        }

        const trans = {} as Record<StateHash, number>

        if (from.h() === zeroState.h() || from.time === -1 || from.time === maxTime) {
            trans[zeroState.h()] = 1
            return trans
        }

        const newAC = impactCach[action][from.time].ac
        const newHC = impactCach[action][from.time].hc

        switch (action) {
            case 'do_nothing':
                const stateTo = new MState(newHC, from.loa, newAC, from.time + 1, from.rewardSystem)
                trans[stateTo.h()] = trans[stateTo.h()] ? trans[stateTo.h()] + 1 : 1
                break

            case 'hc_up':
                if (from.humanConfidence <= HumanConfidence.HC3) {
                    const nextState = new MState(newHC, from.loa, newAC, from.time + 1, from.rewardSystem)
                    trans[nextState.h()] = trans[nextState.h()] ? trans[nextState.h()] + 1 : 1
                }
                break

            case 'loa_down':
                if (from.loa > LoA.LoA0) {
                    const goalState = new MState(newHC, from.loa - 1, newAC, from.time + 1, from.rewardSystem)
                    const failState = new MState(newHC, from.loa, newAC, from.time + 1, from.rewardSystem)

                    trans[goalState.h()] = trans[goalState.h()] ? trans[goalState.h()] + 1 : 1
                    trans[failState.h()] = trans[failState.h()] ? trans[failState.h()] + 0 : 0
                }
                break

            case 'loa_up':
                if (from.loa < LoA.LoA3) {
                    const goalState = new MState(newHC, from.loa + 1, newAC, from.time + 1, from.rewardSystem)
                    const failState = new MState(newHC, from.loa, newAC, from.time + 1, from.rewardSystem)

                    trans[goalState.h()] = trans[goalState.h()] ? trans[goalState.h()] + 1 : 1
                    trans[failState.h()] = trans[failState.h()] ? trans[failState.h()] + 0 : 0
                }
                break
        }

        return trans
    }
}

export type PrimitiveName = 'do_nothing' | 'loa_up' | 'loa_down' | 'hc_up'
export const primitiveNames: PrimitiveName[] = ['do_nothing', 'loa_up', 'loa_down', 'hc_up']

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
            stateList,
        ),
        loa_up: new Primitive(
            'loa_up',
            // loaUpTrans,
            transFunction,
            stateList,
            transCost(simState.rewardSystem),
        ),
        loa_down: new Primitive(
            'loa_down',
            // loaDownTrans,
            transFunction,
            stateList,
            transCost(simState.rewardSystem),
        ),
        hc_up: new Primitive(
            'hc_up',
            // hcUpTrans,
            transFunction,
            stateList,
            wakeUpCost,
        ),
    }
}
