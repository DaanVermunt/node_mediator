import { State, StateHash } from '../state/state'
import { Action, ActionHash } from '../action/action'
import { Problem } from './problem'
import { Solver } from '../solver/solver'
import ValueIteration from '../solver/value-iteration'
import { policyFromVFunc, PolicyVector } from './policy'
import { Process } from './process'
import VFunction from '../solver/v-function'

class MarkovDecisionProcess implements Process {
    constructor(
        private readonly states: State[],
        private readonly actions: Action[],
        private readonly curState: State,
        private solverParams: { gamma: number, epsilon: number, n: number, timeOfES: number },
    ) {
        this.problem = {
            states,
            stateList: states.reduce((res, state) => ({ [state.h()]: state, ...res }), {} as Record<StateHash, State>),
            actions,
            actionList: actions.reduce((res, action) => ({ [action.h()]: action, ...res }), {} as Record<ActionHash, Action>),
        }

        this.solver = new ValueIteration(solverParams.gamma, solverParams.epsilon, solverParams.n, solverParams.timeOfES)
    }

    private readonly problem: Problem
    private solver: Solver
    private vFunction?: VFunction
    public policy?: PolicyVector

    getAction(): (Action | undefined) {
        this.vFunction = this.solver.solve(this.problem)
        this.policy = policyFromVFunc(this.vFunction)
        return this.policy[this.curState.h()]
    }

    public getVFunction(): VFunction {
        if (this.vFunction) {
            return this.vFunction
        } else {
            throw Error('QFunction not init')
        }

    }

    public getPolicy(): PolicyVector {
        if (this.policy) {
            return this.policy
        } else {
            throw Error('QFunction not init')
        }
    }
}

export default MarkovDecisionProcess
