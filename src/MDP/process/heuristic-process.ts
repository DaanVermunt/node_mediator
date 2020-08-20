import { Process } from './process'
import { State, StateHash } from '../state/state'
import { Action, ActionHash, emergencyStop } from '../action/action'
import { Problem } from './problem'
import { SolverType } from '../../argparser'
import { isMState } from '../../mediator-model/state/m-state'

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
        const expectedResults = this.actions
            .reduce((res, action) => {
                return {
                    ...res,
                    [action.h()]: {
                            illegal: action.getExpReward(this.curState, .99).hasPassedIllegal,
                            act: action,
                        },
                }
            }, {} as Record<ActionHash, { illegal: boolean, act: Action }>)

        switch (this.solverType) {
            case 'heuristic_max_automation':
                return this.getMaxAutomation(expectedResults)
            case 'heuristic_min_automation':
                return this.getMinAutomation(expectedResults)
            case 'heuristic_min_transitions':
                return this.getMinTransition(expectedResults)
            case 'heuristic_optimal_driver':
                return this.getBestDriver(expectedResults)
            default:
                return this.actions.find(act => act.name === 'do_nothing') || emergencyStop

        }

    }

    getMaxAutomation(expectedResults: Record<ActionHash, { illegal: boolean, act: Action }>): Action {
        if (expectedResults.loa_up && !expectedResults.loa_up.illegal) {
            return expectedResults.loa_up.act
        }

        if (expectedResults.do_nothing && !expectedResults.do_nothing.illegal) {
            return expectedResults.do_nothing.act
        }

        if (expectedResults.loa_down && !expectedResults.loa_down.illegal) {
            return expectedResults.loa_down.act
        }

        if (expectedResults.hc_up && !expectedResults.hc_up.illegal) {
            return expectedResults.hc_up.act
        }

        return emergencyStop
    }

    getMinAutomation(expectedResults: Record<ActionHash, { illegal: boolean, act: Action }>): Action {
        if (expectedResults.loa_down && !expectedResults.loa_down.illegal) {
            return expectedResults.loa_down.act
        }

        if (expectedResults.do_nothing && !expectedResults.do_nothing.illegal) {
            return expectedResults.do_nothing.act
        }

        if (expectedResults.loa_up && !expectedResults.loa_up.illegal) {
            return expectedResults.loa_up.act
        }

        if (expectedResults.hc_up && !expectedResults.hc_up.illegal) {
            return expectedResults.hc_up.act
        }

        return emergencyStop
    }

    getMinTransition(expectedResults: Record<ActionHash, { illegal: boolean, act: Action }>): Action {
        if (expectedResults.do_nothing && !expectedResults.do_nothing.illegal) {
            return expectedResults.do_nothing.act
        }

        if (Math.random() < .5) {
            if (expectedResults.loa_down && !expectedResults.loa_down.illegal) {
                return expectedResults.loa_down.act
            }

            if (expectedResults.loa_up && !expectedResults.loa_up.illegal) {
                return expectedResults.loa_up.act
            }
        } else {
            if (expectedResults.loa_up && !expectedResults.loa_up.illegal) {
                return expectedResults.loa_up.act
            }

            if (expectedResults.loa_down && !expectedResults.loa_down.illegal) {
                return expectedResults.loa_down.act
            }
        }

        if (expectedResults.hc_up && !expectedResults.hc_up.illegal) {
            return expectedResults.hc_up.act
        }

        return emergencyStop

    }

    getBestDriver(expectedResults: Record<ActionHash, { illegal: boolean, act: Action }>): Action {
        if (!isMState(this.curState)) {
           return emergencyStop
        }

        if (this.curState.humanConfidence > this.curState.autonomousConfidence) {
            return this.getMaxAutomation(expectedResults)
        } else if (this.curState.humanConfidence < this.curState.autonomousConfidence) {
            return this.getMinTransition(expectedResults)
        } else {
            if (expectedResults.do_nothing && !expectedResults.do_nothing.illegal) {
                return expectedResults.do_nothing.act
            }
            if (expectedResults.hc_up && !expectedResults.hc_up.illegal) {
                return expectedResults.hc_up.act
            }
        }

        return emergencyStop
    }
}

export default HeuristicProcess
