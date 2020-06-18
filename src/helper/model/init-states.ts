import MState, { AutonomousConfidence, HumanConfidence, LoA, zeroState } from '../../mediator-model/state/m-state'
import { RewardSystem } from '../../simulation/scenario'

function enumValues<T>(t: T): ReadonlyArray<T[keyof T]> {
    const values = Object.values(t)
    return values.filter(x => typeof x === 'number')
}

export const createMStates = (time: number, rewardSystem: RewardSystem): MState[] => {
    const res = [] as MState[]
    enumValues(HumanConfidence).forEach(hc => {
        enumValues(LoA).forEach(loa => {
            enumValues(AutonomousConfidence).forEach(ac => {
                for (let t = 0; t < time; t++) {
                    const st = new MState(hc, loa,  ac, t, rewardSystem)
                    res.push(st)
                }
            })
        })
    })
    res.push(zeroState)
    return res
}
