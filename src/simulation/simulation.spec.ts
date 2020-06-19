import Simulation from './simulation'
import { getMOptions } from '../mediator-model/action/m-options'
import { createMStates } from '../helper/model/init-states'

test('Test init', () => {
    const filepath = './data/scenarios/scenario1.json'
    const simulationA = new Simulation(filepath)

    expect(simulationA.curLoA).toEqual(0)
})

test('Test copy', () => {
    const filepath = './data/scenarios/scenario1.json'
    const simulationA = new Simulation(filepath)

    const horizon = 5
    const simState = simulationA.getSimState(horizon)
    const mStates = createMStates(horizon, simState.rewardSystem)
    const options = getMOptions(mStates, simState, horizon)

    const simulationB = simulationA.clone()

    simulationB.performOption(options[1])

    expect(simulationA.curLoA).toEqual(0)
    expect(simulationB.curLoA).toEqual(1)
    expect(simulationB.t).toEqual(simulationA.t + 1)

    expect(simulationB.context.getFactor('sleepiness').trueValues.length).toEqual(2)
    expect(simulationA.context.getFactor('sleepiness').trueValues.length).toEqual(1)

    simulationB.performOption(options[3])

    expect(simulationB.context.getFactor('sleepiness').trueValues.length).toEqual(3)
    expect(simulationA.context.getFactor('sleepiness').trueValues.length).toEqual(1)

    console.log(simulationB.context.getFactor('sleepiness').trueValues)
    console.log(simulationA.context.getFactor('sleepiness').trueValues)

})
