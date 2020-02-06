import { Action } from '../MDP/action/action'
import { SimulationState } from './simulation-state'
import { LoA } from '../mediator-model/state/m-state'
import Context from './context'
import { readFileSync } from 'fs'
import { FactorInput, Prediction } from './factor'

interface Scenario {
    action_effects: object[] // TODO implement interface
    factors: FactorInput[]
    totalT?: number,
    description: string,
}

const tap = <T>(f: (x: T) => T) => {
    return (x: T) => {
        f(x)
        return x
    }
}

/*
TODO: Here we should be able to play with safety options i.e. how sure should we be.
      This can even be more extreme where we define this per certainty level; sure, expected, worse case etc.
    */
export const getFirstSafeAt = (preds: Prediction[], safety = .8): number => {
    return preds
        .filter((pred: Prediction) => pred.value > safety)
        .map(pred => pred.at)
        // .map(tap(console.log.bind(console)))
        .reduce((res, min) => min < res ? min : res, Number.MAX_SAFE_INTEGER)
}

class Simulation {

    t: number = 0
    totalT?: number
    context: Context

    constructor(
        private readonly scenarioFilePath: string,
    ) {
        const scenarioFile = readFileSync(scenarioFilePath, { encoding: 'utf8' })
        const scenario: Scenario = JSON.parse(scenarioFile)
        this.totalT = scenario.totalT
        // Load Scenario
        // Check for valid factors
        this.context = new Context(scenario.factors)

        // Create first SimState
    }

    performAction(action: Action): void {
        this.t += 1
        this.context.performAction(action)
    }

    getTT(factorName: string, futureScope: number): number {
        const prediction = this.context.getFactor(factorName).getPrediction(this.t, futureScope)
        const firstSafe = getFirstSafeAt(prediction)
        return  firstSafe === Number.MAX_SAFE_INTEGER ? -1 : firstSafe - this.t
    }

    getSimState(futureScope: number = 20): SimulationState {
        return {
            inOption: false,
            TTA: {
                [LoA.LoA2]: this.getTT('A_LoA2', futureScope),
                [LoA.LoA1]: this.getTT('A_LoA1', futureScope),
                [LoA.LoA0]: this.getTT('A_LoA0', futureScope),
            },
            TTD: {
                [LoA.LoA2]: this.getTT('D_LoA2', futureScope),
                [LoA.LoA1]: this.getTT('D_LoA1', futureScope),
                [LoA.LoA0]: this.getTT('D_LoA0', futureScope),
            },
            context: this.context,
        }
    }
}

export default Simulation
