import Option from '../../MDP/action/option'
import MState, { HumanConfidence, LoA, toMState } from '../state/m-state'
import { getMPrimitives, PrimitiveName } from './m-primitives'
import { SimulationState } from '../../simulation/simulation-state'
import { State } from '../../MDP/state/state'
import { Action } from '../../MDP/action/action'

export type OptionName = 'passive' | 'upgrade' | 'downgrade' | 'wake_up'

const getIsInInitSubset = () => (st: State, option: OptionName): boolean => {
    const state = toMState(st)
    if (!state) {
        return false
    }
    switch (option) {
        case 'passive':
            return true
        case 'wake_up':
            return state.humanConfidence !== HumanConfidence.HC2
        case 'upgrade':
            return state.loa !== LoA.LoA2
        case 'downgrade':
            return state.loa !== LoA.LoA0
    }
}

const getPolicyFunction = (option: OptionName, primitives: Record<PrimitiveName, Action>) => (st: State): Action => {
    const state = toMState(st)
    if (!state) {
        return primitives.do_nothing
    }

    switch (option) {
        case 'passive':
            return primitives.do_nothing
        case 'wake_up':
            return primitives.hc_up
        case 'upgrade':
            return primitives.loa_up
        case 'downgrade':
            return primitives.loa_down
    }
}

export const getMOptions = (mStates: MState[], simState: SimulationState, nrSteps: number): Option[] => {
    const primitives = getMPrimitives(mStates, simState, nrSteps)

    const passiveOption = new Option(
        getIsInInitSubset(),
        getPolicyFunction('passive', primitives),
        1,
        (from: MState, to: MState) => from.time !== to.time,
        'passive',
    )

    const upgradeOption = new Option(
        getIsInInitSubset(),
        getPolicyFunction('upgrade', primitives),
        1,
        (from: MState, to: MState) => from.loa + 1 === to.loa,
        'upgrade',
    )

    const downgradeOption = new Option(
        getIsInInitSubset(),
        getPolicyFunction('downgrade', primitives),
        1,
        (from: MState, to: MState) => {
            const res = from.loa - 1 === to.loa
            return res
        },
        'downgrade',
    )

    // TODO for wake up, we should capture the underlying consequence of the action see hc_up_primitive
    const wakeUpOption = new Option(
        getIsInInitSubset(),
        getPolicyFunction('wake_up', primitives),
        1,
        (from: MState, to: MState) => from.humanConfidence + 1 === to.humanConfidence,
        'wake_up',
    )

    return [passiveOption, upgradeOption, downgradeOption, wakeUpOption]
}
