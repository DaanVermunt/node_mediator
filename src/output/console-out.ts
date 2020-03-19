import { PolicyVector } from '../MDP/process/policy'
import { State } from '../MDP/state/state'
import Context from '../simulation/context'
import { LoA } from '../mediator-model/state/m-state'

export function writePolicy(states: State[], policy: PolicyVector) {
    // console.log(policyToString(states, policy))
}

export function writeFactors(context: Context, t: number) {
    Object.values(context.factors).forEach(factor => {
        console.log(factor.getAtT(t, true))
    })
}

export function formatNumber(num: number): string {
    if (num >= 0 && num < 10) {
        return `00${num}`
    }
    if ( num < 100) {
        return `0${num}`
    }

    return `${num}`
}

export interface TimeTos {
    TTD: Record<LoA, number>
    TTA: Record<LoA, number>
}

// export function writeTTs(TTs: TimeTos) {
//     Object.keys(TTs)
//         .forEach((TT: keyof TimeTos) => {
//             const ttrec: Record<LoA, number> = TTs[TT]
//             console.log(ttrec[LoA.LoA0])
//             console.log(ttrec[LoA.LoA1])
//             console.log(ttrec[LoA.LoA2])
//        })
// }
