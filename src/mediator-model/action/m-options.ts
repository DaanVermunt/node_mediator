import Option from '../../MDP/action/option'
import MState, { HumanConfidence, LoA, zeroState } from '../state/m-state'
import { getMPrimitives } from './m-primitives'
import { SimulationState } from '../../simulation/simulation-state'

export type OptionName = 'passive' | 'upgrade' | 'downgrade' | 'wake_up'

// TODO handle simstate
export const getMOptions = (mStates: MState[], simState: SimulationState, nrSteps: number): Option[] => {
    const primitives = getMPrimitives(mStates, simState, nrSteps)

    const passiveOption = new Option(
        mStates,
        mStates.reduce((res, state) => ({ [state.h()]: primitives.do_nothing, ...res }), {}),
        1,
        (from: MState, to: MState) =>  from.time !== to.time,
        'passive',
    )

    const upgradeOption = new Option(
        mStates.filter(state => state.loa !== LoA.LoA2),
        mStates.filter(state => state.loa !== LoA.LoA2).reduce((res, state) => ({ [state.h()]: primitives.loa_up, ...res }), {}),
        3,
        (from: MState, to: MState) => from.loa + 1 === to.loa,
        'upgrade',
    )

    const downgradeOption = new Option(
        mStates.filter(state => state.loa !== LoA.LoA0 || state.h() === zeroState.h()),
        mStates
            .filter(state => state.loa !== LoA.LoA0 || state.h() === zeroState.h())
            .reduce((res, state) => ({ [state.h()]: primitives.loa_down, ...res }), {}),
        3,
        (from: MState, to: MState) => from.loa - 1 === to.loa,
        'downgrade',
    )

    const wakeUpOption = new Option(
        mStates
            .filter(state => state.humanConfidence !== HumanConfidence.HC2),
        mStates
            .filter(state => state.humanConfidence !== HumanConfidence.HC2)
            .reduce((res, state) => ({ [state.h()]: primitives.hc_up, ...res }), {}),
        3,
        (from: MState, to: MState) => from.humanConfidence + 1 === to.humanConfidence,
        'wake_up',
    )

    return [passiveOption, upgradeOption, downgradeOption, wakeUpOption]
}
