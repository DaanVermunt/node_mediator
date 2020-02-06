import { Action } from '../MDP/action/action'
import { SimulationState } from './simulation-state'
import { AutonomousConfidence, HumanConfidence, LoA } from '../mediator-model/state/m-state'
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

export const getHCfromSimState = (simState: SimulationState, at = simState.t): HumanConfidence => {
    const loa0Pred = simState.context.getFactor('D_LoA0').getPrediction(at, 1)[0]
    const loa1Pred = simState.context.getFactor('D_LoA1').getPrediction(at, 1)[0]
    const loa2Pred = simState.context.getFactor('D_LoA2').getPrediction(at, 1)[0]
    if (predictionIsSafe(loa0Pred)) {
        return HumanConfidence.HC2
    } else if (predictionIsSafe(loa1Pred) || predictionIsSafe(loa2Pred)) {
        return HumanConfidence.HC1
    }
    return HumanConfidence.HC0
}

// TODO , were do we get this param (20 probably linked to future Scope)
export const getACfromSimState = (simState: SimulationState, at = simState.t): AutonomousConfidence => {

    const loa1Pred = simState.context.getFactor('A_LoA1').getPrediction(at, 1)[0]
    const loa2Pred = simState.context.getFactor('A_LoA2').getPrediction(at, 1)[0]

    const prediction = simState.context.getFactor('A_LoA2').getPrediction(at, 20)
    const longTimeSafe = prediction.filter(predictionIsSafe).length === 20

    if (longTimeSafe) {
        return AutonomousConfidence.AC2
    } else if (predictionIsSafe(loa1Pred) || predictionIsSafe(loa2Pred)) {
        return AutonomousConfidence.AC1
    }
    return AutonomousConfidence.AC0
}

/*
TODO: Here we should be able to play with safety options i.e. how sure should we be.
      This can even be more extreme where we define this per certainty level; sure, expected, worse case etc.
    */
export const predictionIsSafe = (pred: Prediction): boolean => pred.value < .8

export const getFirstSafeAt = (preds: Prediction[]): number => {
    return preds
        .filter(predictionIsSafe)
        .map(pred => pred.at)
        // .map(tap(console.log.bind(console)))
        .reduce((res, min) => min < res ? min : res, Number.MAX_SAFE_INTEGER)
}

class Simulation {

    t: number = 0
    totalT?: number
    context: Context
    curLoA: LoA

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
        this.curLoA = this.context.performAction(action, this.curLoA)
    }

    getTT(factorName: string, futureScope: number, t: number = this.t): number {
        const prediction = this.context.getFactor(factorName).getPrediction(t, futureScope)
        const firstSafe = getFirstSafeAt(prediction)
        return firstSafe === Number.MAX_SAFE_INTEGER ? -1 : firstSafe - t
    }

    getSimState(futureScope: number = 20): SimulationState {
        return {
            t: this.t,
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
            LoA: this.curLoA,
        }
    }
}

export default Simulation
