import { Action } from '../MDP/action/action'
import { SimulationState } from './simulation-state'
import MState, { AutonomousConfidence, fromSimState, HumanConfidence, LoA } from '../mediator-model/state/m-state'
import Context from './context'
import { readFileSync } from 'fs'
import { Prediction } from './factor'
import { ActionImpact, ActionImpactInput } from './actionImpact'
import Option from '../MDP/action/option'
import { RewardSystem, Scenario } from './scenario'

export const tap = <T>(f: (x: T) => T) => {
    return (x: T) => {
        f(x)
        return x
    }
}

export const getHCfromSimState = (simState: SimulationState, tDelta: number = 0): HumanConfidence => {
    const at = simState.t + tDelta

    const loa0Pred = simState.context.getFactor('D_LoA0').getPrediction(at, 1)[0]
    const loa1Pred = simState.context.getFactor('D_LoA1').getPrediction(at, 1)[0]
    const loa2Pred = simState.context.getFactor('D_LoA2').getPrediction(at, 1)[0]
    const loa3Pred = simState.context.getFactor('D_LoA3').getPrediction(at, 1)[0]

    if (predictionIsSafe(loa0Pred)) {
        return HumanConfidence.HC3
    } else if (predictionIsSafe(loa1Pred)) {
        return HumanConfidence.HC2
    } else if (predictionIsSafe(loa2Pred)) {
        return HumanConfidence.HC1
    }
    return HumanConfidence.HC0
}

export const getACfromSimState = (simState: SimulationState, tDelta: number = 0): AutonomousConfidence => {
    const at = simState.t + tDelta

    const loa1Pred = simState.context.getFactor('A_LoA1').getPrediction(at, 1)[0]
    const loa2Pred = simState.context.getFactor('A_LoA2').getPrediction(at, 1)[0]
    const loa3Pred = simState.context.getFactor('A_LoA3').getPrediction(at, 1)[0]

    // const prediction = simState.context.getFactor('A_LoA2').getPrediction(at, 20)
    // const longTimeSafe = prediction.filter(predictionIsSafe).length === 20

    if (predictionIsSafe(loa3Pred)) {
        return AutonomousConfidence.AC3
    } else if (predictionIsSafe(loa2Pred)) {
        return AutonomousConfidence.AC2
    } else if (predictionIsSafe(loa1Pred)) {
        return AutonomousConfidence.AC1
    }
    return AutonomousConfidence.AC0
}

/*
      Here we should be able to play with safety options i.e. how sure should we be.
      This can even be more extreme where we define this per certainty level; sure, expected, worse case etc.
    */
export const predictionIsSafe = (pred: Prediction): boolean => pred.value > .8

export const getFirstSafeAt = (preds: Prediction[]): number => {
    return preds
        .filter(predictionIsSafe)
        .map(pred => pred.at)
        // .map(tap(console.log.bind(console)))
        .reduce((res, min) => min < res ? min : res, Number.MAX_SAFE_INTEGER)
}

class Simulation {

    t: number = 0
    totalT: number
    context: Context
    curLoA: LoA
    impacts: ActionImpact[]
    horizon: number
    rewardSystem: RewardSystem

    constructor(
        private readonly scenarioFilePath: string,
    ) {
        const scenarioFile = readFileSync(scenarioFilePath, { encoding: 'utf8' })
        const scenario: Scenario = JSON.parse(scenarioFile)
        this.totalT = scenario.totalT
        // Load Scenario
        // Check for valid factors
        this.context = new Context(scenario.factors)

        this.curLoA = scenario.startLoa || LoA.LoA0
        // Create first SimState
        this.impacts = scenario.actionEffects ? this.parseImpacts(scenario.actionEffects) : []
        this.horizon = scenario.horizon || 20
        this.rewardSystem = scenario.rewardSystem || 'max_automation'
    }

    performAction(action?: Action): void {
        this.t = this.t + 1
        const impacts = this.impacts.filter(impact => action && impact.effectFrom === action.name)
        this.curLoA = this.context.performAction(action, this.curLoA, this.t, impacts)
    }

    performOption(option: Option): void {
        let done = false
        let cur: MState | null = null
        let to: MState | null = null
        let attempts = 0

        while (!done) {
            cur = fromSimState(this.getSimState())
            const act = option.policy(cur)

            this.performAction(act)
            to = fromSimState(this.getSimState())
            attempts = attempts + 1

            done = option.finalizeTransition(cur, to) || attempts >= option.attempts
        }
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
                [LoA.LoA3]: this.getTT('A_LoA3', futureScope),
                [LoA.LoA2]: this.getTT('A_LoA2', futureScope),
                [LoA.LoA1]: this.getTT('A_LoA1', futureScope),
                [LoA.LoA0]: this.getTT('A_LoA0', futureScope),
            },
            TTD: {
                [LoA.LoA3]: this.getTT('D_LoA3', futureScope),
                [LoA.LoA2]: this.getTT('D_LoA2', futureScope),
                [LoA.LoA1]: this.getTT('D_LoA1', futureScope),
                [LoA.LoA0]: this.getTT('D_LoA0', futureScope),
            },
            context: this.context,
            LoA: this.curLoA,
            impacts: this.impacts,
            futureScope,
            rewardSystem: this.rewardSystem,
        }
    }

    private parseImpacts(actionEffects: ActionImpactInput[]): ActionImpact[] {
        return actionEffects.map(ae => ({
            effectFactor: ae.on_factor,
            effectFrom: ae.primitive_name,
            meanEffect: ae.diff,
            std: ae.std,
            name: ae.name,
        }))
    }
}

export default Simulation
