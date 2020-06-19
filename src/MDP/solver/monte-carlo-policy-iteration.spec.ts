import Simulation from '../../simulation/simulation'
import { createMStates } from '../../helper/model/init-states'
import { getMOptions } from '../../mediator-model/action/m-options'
import { Problem } from '../process/problem'
import MonteCarloPolicyIteration from './monte-carlo-policy-iteration'

test('Test copy', () => {
    const filepath = './data/scenarios/scenario1.json'
    const simulation = new Simulation(filepath)

    const horizon = 5
    const simState = simulation.getSimState(horizon)
    const mStates = createMStates(horizon, simState.rewardSystem)
    const options = getMOptions(mStates, simState, horizon)

    const problem: Problem = {
        states: mStates,
        stateList: mStates.reduce((res, state) => ({ ...res, [state.h()]: state }), {}),
        actions: options,
        actionList: options.reduce((res, option) => ({ ...res, [option.h()]: option }), {}),
        simulation,
    }

    const mcpi = new MonteCarloPolicyIteration(1)

    const { policy, qFunction, returns } = mcpi.initialize(problem)
    const episode = mcpi.runEpisode(simulation, policy)

    console.log(episode.map(stAct => `${stAct.state.h()} - ${stAct.action.h()} - ${stAct.state.isSafe() ? 'Y' : 'N'} - ${stAct.reward}`))
})
