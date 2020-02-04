import { Action, ActionRes } from './action'
import { State } from '../state/state'
import { Policy } from '../process/policy'
import { OptionName } from '../../mediator-model/action/m-options'

class Option implements Action {
    constructor(
        private initSubset: State[],
        private policy: Policy,
        private attempts: number,
        private finalizeTransition: (from: State, to: State) => boolean,

        public name: OptionName,
    ) { }

    perform(from: State): ActionRes {
        // TODO check if === workd for state objects
        if (!this.initSubset.find(st => from.h() === st.h())) {
            return {
                to: from,
                reward: Number.NEGATIVE_INFINITY,
                numberOfSteps: 1,
            }
        }

        let doneAttemps = 0
        let rewardsSum = 0

        let curState = from
        let nextState = from

        while (!this.finalizeTransition(curState, nextState) && this.attempts >= doneAttemps) {
            curState = nextState

            const action: Action | undefined = this.policy[curState.h()]
            if (!action) {
                return {
                    to: from,
                    reward: Number.NEGATIVE_INFINITY,
                    numberOfSteps: 1,
                }
            }
            const res = action.perform(curState)

            rewardsSum += res.reward
            doneAttemps += res.numberOfSteps
            nextState = res.to

        }

        return {
            to: nextState,
            reward: rewardsSum,
            numberOfSteps: doneAttemps,
        }
    }

    toString(): string {
        console.error('toString(): NOT IMPLEMENTED')
        return ''
    }

    h(): string {
        return this.name
    }
}

export default Option
