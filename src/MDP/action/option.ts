import { Action, ActionRes, ActionResPerform, nullRes, nullResPerform } from './action'
import { State, StateHash } from '../state/state'
import { Policy } from '../process/policy'
import { OptionName } from '../../mediator-model/action/m-options'
import { zeroState } from '../../mediator-model/state/m-state'

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

    getExpReward(from: State, discount: number): ActionRes {
        if (!this.inInitSubset(from, this.name)) {
            return nullRes(from)
        }

        const results = this.traverse(from, 1)

        const reward = Object.keys(results).reduce((res, item) => ({
            ...res,
            [item]: results[item].reward,
        }), {})

        const expReward = Object.values(results).reduce((res, item) => item.reward * Math.pow(discount, item.depth), 0)

        const transProbs = Object.keys(results).reduce((res, item) => ({
            ...res,
            [item]: { state: zeroState, prob: results[item].prob },
        }), {})

        const { numberOfSteps, hasPassedIllegal } = Object
            .values(results)
            .reduce((res: {numberOfSteps: number, hasPassedIllegal: boolean}, item) => {
                if (item.isSafe) {
                    return res
                }
                return {
                    hasPassedIllegal: true,
                    numberOfSteps: Math.min(item.depth, res.numberOfSteps),
                }

            }, { numberOfSteps: 1e5, hasPassedIllegal: false })

        return {
            reward,
            expReward,
            transProbs,
            numberOfSteps,
            hasPassedIllegal,
        }
    }

    traverse(from: State, probToGetHere: number, depth = 1): Record<StateHash, {prob: number, reward: number, isSafe: boolean, depth: number}> {
        const action = this.policy(from)

        const { transProbs, reward } = action.getExpReward(from, 0)

        return Object.keys(transProbs).reduce((res, stateHash: StateHash) => {
            const to = transProbs[stateHash].state
            const prob = transProbs[stateHash].prob * probToGetHere

            if (this.finalizeTransition(from, to) || !to.isSafe() || depth === this.attempts) {
                return {
                    ...res,
                    [stateHash]: {
                        prob,
                        reward: prob * reward[to.h()],
                        isSafe: to.isSafe(),
                        depth,
                    },
                }
            } else {
                return {
                    ...res,
                    ...this.traverse(to, prob, depth + 1),
                }
            }
        }, {} as Record<StateHash, {prob: number, reward: number, isSafe: boolean, depth: number}>)
    }

    perform(from: State): ActionResPerform {
        if (!this.inInitSubset(from, this.name)) {
            return nullResPerform(from)
        }

        let doneAttempts = 0
        let hasPassedIllegal = false
        let rewardsSum = 0

        let curState = from
        let nextState = from

        while (!this.finalizeTransition(curState, nextState) && this.attempts > doneAttempts && !hasPassedIllegal) {
            curState = nextState

            const action: Action | undefined = this.policy(curState)
            if (!action) {
                return nullResPerform(from)
            }

            const res = action.perform(curState)

            rewardsSum = rewardsSum + res.reward - this.cost
            doneAttempts =  doneAttempts + res.numberOfSteps
            nextState = res.to
            hasPassedIllegal = hasPassedIllegal || res.hasPassedIllegal
        }

        return {
            to: nextState,
            reward: rewardsSum,
            numberOfSteps: doneAttempts,
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
