import { Process } from './process'
import { State, StateHash } from '../state/state'
import { Action, ActionHash, ActionRes, ActionResPerform, emergencyStop } from '../action/action'
import { Problem } from './problem'
import { SolverType } from '../../argparser'

class HeuristicProcess implements Process {

    constructor(
        private readonly states: State[],
        private readonly actions: Action[],
        private readonly curState: State,
        private readonly solverType: SolverType,
    ) {
        this.problem = {
            states,
            stateList: states.reduce((res, state) => ({ [state.h()]: state, ...res }), {} as Record<StateHash, State>),
            actions,
            actionList: actions.reduce((res, action) => ({ [action.h()]: action, ...res }), {} as Record<ActionHash, Action>),
        }
    }

    private readonly problem: Problem

    getAction() {
        if (this.solverType === 'passive') {
            return this.actions.find(act => act.name === 'passive') || emergencyStop
        }

        const expectedResults = this.actions
            .reduce((res, action) => {
                return {
                        ...res,
                        [action.h()]: { res: action.perform(this.curState), act: action },
                    }
                }, {} as Record<ActionHash, {res: ActionResPerform, act: Action}>)

        if (expectedResults.upgrade && !expectedResults.upgrade.res.hasPassedIllegal) {
            return expectedResults.upgrade.act
        }

        if (expectedResults.passive && !expectedResults.passive.res.hasPassedIllegal) {
            return expectedResults.passive.act
        }

        if (expectedResults.downgrade && !expectedResults.downgrade.res.hasPassedIllegal) {
            return expectedResults.downgrade.act
        }

        if (expectedResults.wake_up && !expectedResults.wake_up.res.hasPassedIllegal) {
            return expectedResults.wake_up.act
        }

        return emergencyStop
    }

}

export default HeuristicProcess
