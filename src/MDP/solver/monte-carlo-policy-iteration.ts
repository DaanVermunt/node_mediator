import { Solver } from './solver'
import { Problem } from '../process/problem'
import { Action, ActionHash } from '../action/action'
import { Policy, policyFromQFunc } from '../process/policy'
import { State, StateHash } from '../state/state'
import QFunction from './q-function'
import Simulation from '../../simulation/simulation'
import MState, { fromSimState } from '../../mediator-model/state/m-state'
import Option from '../action/option'

export interface EpisodeNode {
    state: State
    action: Action
    reward: number
}

class MonteCarloPolicyIteration implements Solver {

    constructor(
        private readonly n: number,
        private readonly gamma: number,
    ) {
    }

    initialize(problem: Problem): {policy: Policy, qFunction: QFunction, returns: Record<StateHash, Record<ActionHash, number[]>>} {
        const qFunction = new QFunction(problem)
        const policyVec = policyFromQFunc(qFunction)

        const policy = (state: State): Action => policyVec[state.h()]

        const returns = {} as Record<StateHash, Record<ActionHash, number[]>>
        problem.states.forEach(state => {

            returns[state.h()] = {} as Record<ActionHash, number[]>
            problem.actions.forEach(action => {
                returns[state.h()][action.h()] = []
            })
        })

        return { policy, qFunction, returns }
    }

    solve(problem: Problem): Action {
        // INIT
        const { policy, qFunction, returns } = this.initialize(problem)

        for (let i = 0; i < this.n; i++) {
            // Generate episode using policy
            const episode = this.runEpisode(problem.simulation.clone(), policy)

            // For each state in s in episode
            episode.forEach((episodeNode, index) => {
                const sh = episodeNode.state.h()
                const ah = episodeNode.action.h()
                // R = first-visit return
                const R = episode.filter((en, idx) => idx >= index)
                    .reduce((sum, en) => (this.gamma ** en.state.time) * en.reward + sum, 0)
                // append R to returns
                returns[sh][ah].push(R)

                // Q(s, a) = average(returns(s, a)
            })
        }

        throw new Error('Not Implemented')
    }

    runEpisode(simulation: Simulation, policy: Policy): EpisodeNode[] {
        let curState = fromSimState(simulation.getSimState())
        const res: EpisodeNode[] = [{ state: curState, action: policy(curState), reward: 0 }]

        let finished = false
        while ( !finished ) {

            const nextAction = policy(curState) as Option
            simulation.performOption(policy(curState) as Option)
            curState = fromSimState(simulation.getSimState())
            const curAction = policy(curState) as Option

            const { subEpisode, newState } = this.performOption(simulation, nextAction)
            curState = newState

            res.push(subEpisode)

            finished = !curState.isSafe()
        }
        return res
    }

    performOption(simulation: Simulation, option: Option): {reward: number, newState: MState} {
        let done = false
        let cur: MState | null = null
        let to: MState | null = null
        let attempts = 0

        let rewardsSum = 0

        while (!done) {
            cur = fromSimState(simulation.getSimState())
            const act = option.policy(cur)

            simulation.performAction(act)
            to = fromSimState(simulation.getSimState())
            attempts = attempts + 1

            done = option.finalizeTransition(cur, to) || attempts >= option.attempts
        }

        if (to === null) {
            throw new Error('THIS CANNOT BE')
        } else {
            const reward = Math.pow(this.gamma, attempts) * rewardsSum
            return { newState: to, reward }
        }
    }
}

export default MonteCarloPolicyIteration
