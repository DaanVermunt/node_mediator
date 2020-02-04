import { Policy } from '../MDP/process/policy'
import { State } from '../MDP/state/state'
import Context from '../simulation/context'

export function writePolicy(states: State[], policy: Policy) {
    // console.log(policyToString(states, policy))
}

export function writeContext(context: Context, t: number) {
    Object.values(context.factors).forEach(factor => {
        console.log(factor.getAtT(t))
    })
}
