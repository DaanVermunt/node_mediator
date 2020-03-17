import { SimulationState } from '../../simulation/simulation-state'
import { getTransFunction } from './m-primitives'

const simState: SimulationState = {

} as SimulationState

jest.mock('../../simulation/simulation', () => ({
    __esModule: true,
    getACfromSimState: jest.fn(),
    getHCfromSimState: jest.fn(),
}))

test('get trans', () => {
    const transF = getTransFunction(simState, 20)
    console.error(transF)
})
