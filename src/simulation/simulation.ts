import { Action } from '../MDP/action/action'
import { SimulationState } from './simulation-state'
import { LoA } from '../mediator-model/state/m-state'
import Context from './context'
import { readFileSync } from 'fs'
import { FactorInput } from './factor'

interface Scenario {
    action_effects: object[] // TODO implement interface
    factors: FactorInput[]
}

class Simulation {

    t: number = 0
    context: Context

    constructor(
        private readonly scenarioFilePath: string,
    ) {
        const scenarioFile = readFileSync(scenarioFilePath, { encoding: 'utf8' })
        const scenario: Scenario = JSON.parse(scenarioFile)
        // Load Scenario
        // Check for valid factors
        this.context = new Context(scenario.factors)

        // Create first SimState
    }

    performAction(action: Action): void {
        this.context.performAction(action)
    }

    getSimState(): SimulationState {
        return {
            inOption: false,
            TTA: {
                [LoA.LoA2]: 10,
                [LoA.LoA1]: 10,
                [LoA.LoA0]: 10,
            },
            TTD: {
                [LoA.LoA2]: 10,
                [LoA.LoA1]: 10,
                [LoA.LoA0]: 10,
            },
            context: this.context,
        }
        // TODO implement
    }

}

export default Simulation
