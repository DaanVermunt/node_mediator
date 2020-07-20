import Option from '../../MDP/action/option'
import MState, { HumanConfidence, LoA, toMState } from '../state/m-state'
import { getMPrimitives, PrimitiveName } from './m-primitives'
import { SimulationState } from '../../simulation/simulation-state'
import { State } from '../../MDP/state/state'
import { Action } from '../../MDP/action/action'

export type OptionName = 'passive' | 'upgrade' | 'downgrade' | 'wake_up'
export const optionNames = ['passive' , 'upgrade' , 'downgrade' , 'wake_up']

export const isOption = (action?: Action): action is Option => {
    return action !== undefined && optionNames.includes(action.name)
}

const getIsInInitSubset = () => (st: State, option: OptionName): boolean => {
    const state = toMState(st)
    if (!state) {
        return false
    }
    switch (option) {
        case 'passive':
            return true
        case 'wake_up':
            return true
        case 'upgrade':
            return state.loa !== LoA.LoA3
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

const isMState = (state: State): state is MState => state instanceof MState

const logWrongType = (res: boolean): boolean => {
    console.error('ERROR IN TYPING')
    return res
}

export const getMOptions = (mStates: MState[], simState: SimulationState, nrSteps: number): Option[] => {
    const primitives = getMPrimitives(mStates, simState, nrSteps)

    const passiveOption = new Option(
        getIsInInitSubset(),
        getPolicyFunction('passive', primitives),
        1,
        (from: State, to: State) => isMState(from) && isMState(to) ? from.time !== to.time : logWrongType(true),
        'passive',
    )

    const upgradeOption = new Option(
        getIsInInitSubset(),
        getPolicyFunction('upgrade', primitives),
        simState.loaActionImplementations.up.numberOfAttempts,
        (from: State, to: State) => isMState(from) && isMState(to) ? from.loa + 1 === to.loa : logWrongType(true),
        'upgrade',
    )

    const downgradeOption = new Option(
        getIsInInitSubset(),
        getPolicyFunction('downgrade', primitives),
        simState.loaActionImplementations.down.numberOfAttempts,
        (from: State, to: State) => isMState(from) && isMState(to) ? from.loa - 1 === to.loa : logWrongType(true),
        'downgrade',
    )

    const wakeUpOption = new Option(
        getIsInInitSubset(),
        getPolicyFunction('wake_up', primitives),
        1,
        (from: State, to: State) => isMState(from) && isMState(to)
            ?  from.humanConfidence + 1 === to.humanConfidence || to.humanImpact > 0
            : logWrongType(true),
        'wake_up',
    )

    return [passiveOption, upgradeOption, downgradeOption, wakeUpOption]
}
