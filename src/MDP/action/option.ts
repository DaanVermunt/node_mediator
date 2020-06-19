import { Action, ActionRes, nullRes } from './action'
import { State } from '../state/state'
import { Policy } from '../process/policy'
import { OptionName } from '../../mediator-model/action/m-options'

class Option implements Action {
    constructor(
        private inInitSubset: (state: State, name: OptionName) => boolean,
        public policy: Policy,
        public attempts: number,
        public finalizeTransition: (from: State, to: State) => boolean,
        public name: OptionName,
        public cost: number = 0,
    ) {
    }

    perform(from: State): ActionRes {
        if (!this.inInitSubset(from, this.name)) {
            return nullRes(from)
        }

        let doneAttemps = 0
        let hasPassedIllegal = false
        let rewardsSum = 0

        let curState = from
        let nextState = from

        while (!this.finalizeTransition(curState, nextState) && this.attempts >= doneAttemps && !hasPassedIllegal) {
            curState = nextState

            const action: Action | undefined = this.policy(curState)
            if (!action) {
                return nullRes(from)
            }

            const res = action.perform(curState)

            rewardsSum = rewardsSum + res.reward - this.cost
            doneAttemps =  doneAttemps + res.numberOfSteps
            nextState = res.to
            hasPassedIllegal = hasPassedIllegal || res.hasPassedIllegal

        }

        return {
            to: nextState,
            reward: rewardsSum,
            numberOfSteps: doneAttemps,
            hasPassedIllegal,
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
