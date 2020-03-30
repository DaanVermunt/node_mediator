import { State, StateHash } from '../state/state'
import { Action, ActionHash } from '../action/action'
import { Problem } from './problem'
import { Solver } from '../solver/solver'
import ValueIteration from '../solver/value-iteration'
import { policyFromQFunc, PolicyVector } from './policy'
import QFunction from '../solver/q-function'

class Process {
    constructor(
        private readonly states: State[],
        private readonly actions: Action[],
        private readonly curState: State,
        private solverParams: { gamma: number, lr: number, n: number },
    ) {
        this.problem = {
            states,
            stateList: states.reduce((res, state) => ({ [state.h()]: state, ...res }), {} as Record<StateHash, State>),
            actions,
            actionList: actions.reduce((res, action) => ({ [action.h()]: action, ...res }), {} as Record<ActionHash, Action>),
        }

        this.solver = new ValueIteration(solverParams.gamma, solverParams.lr, solverParams.n)
    }

    private readonly problem: Problem
    private solver: Solver
    private qFunction?: QFunction
    public policy?: PolicyVector

    getAction(): (Action | undefined) {
        this.qFunction = this.solver.solve(this.problem)
        this.policy = policyFromQFunc(this.qFunction)
        return this.policy[this.curState.h()]
    }

    public getQFunction(): QFunction {
        if (this.qFunction) {
            return this.qFunction
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

export default Process
