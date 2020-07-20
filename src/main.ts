import { argparser, Args, SolverType } from './argparser'
import Simulation, { getACfromSimState, getHCfromSimState } from './simulation/simulation'
import MarkovDecisionProcess from './MDP/process/markov-decision-process'
import { AutonomousConfidence, fromSimState, fromStateHash, HumanConfidence, LoA } from './mediator-model/state/m-state'
import { createMStates } from './helper/model/init-states'
import { getMOptions, isOption, OptionName } from './mediator-model/action/m-options'
import { formatNumber, TimeTos } from './output/console-out'
import { writeContextHistory, writeStateActionHistory, writeTTHistory } from './output/write-file'
import { isEmergencyStop } from './MDP/action/action'
import * as fs from 'fs'
import { actionToArrow } from './MDP/process/policy'
import HeuristicProcess from './MDP/process/heuristic-process'

const arg: Args = argparser.parseArgs()
const d = new Date()
console.log(`${d.getHours()}:${d.getMinutes()}:${d.getSeconds()}`)
console.log(`Starting with ${arg.inputFile}`)

export interface StateActionHistoryItem {
    action: string
    actionHeuristic?: string
    actionMDP?: string
    loa: LoA
    ac: AutonomousConfidence
    hc: HumanConfidence
}

function finishHistoryAfterStop(simulation: Simulation, timeLeft: number) {
    for (let j = 0; j < timeLeft; j++) {
        simulation.performAction()
    }
}

function mainLoop() {
    const solverType: SolverType = arg.solver

    // Init world
    const sim = new Simulation(arg.inputFile)
    const TTHistory: TimeTos[] = []
    const stateActionHistory: StateActionHistoryItem[] = []

    const nrSteps = sim.totalT

    const horizon = solverType === 'heuristic' ? 4 : (sim.horizon || 20)
    let simState = sim.getSimState(horizon)

    const timeOfES  = simState.timeOfES

    const mStates = createMStates(horizon, simState.rewardSystem)

    for (let i = 0; i < nrSteps; i++) {
        // Compute MDPState
        const curMState = fromSimState(simState)

        // Compute Trans probs
        const options = getMOptions(mStates, simState, horizon)

        // Get Opt Action
        const process = solverType === 'mdp' ?
                new MarkovDecisionProcess(mStates, Object.values(options), curMState, { gamma: .97, epsilon: 1, n: 500 }) :
                new HeuristicProcess(mStates, Object.values(options), curMState, solverType)
        const action = process.getAction()

        // Also compute other possible actions
        const alternativeActions = { actionHeuristic: '', actionMDP: '' }
        if (solverType === 'passive') {
            const mdp = new MarkovDecisionProcess(mStates, Object.values(options), curMState, { gamma: .99, epsilon: 5, n: 100 })
            const mdpAct = mdp.getAction()
            alternativeActions.actionMDP = mdpAct ? mdpAct.name : 'no_action'

            const heuristicProcess = new HeuristicProcess(mStates, Object.values(options), curMState, solverType)
            const heurAct = heuristicProcess.getAction()
            alternativeActions.actionHeuristic = heurAct ? heurAct.name : 'no_action'
        }

        if (action && isEmergencyStop(action)) {
            const nullLoARecord = { [LoA.LoA0]: 0, [LoA.LoA1]: 0, [LoA.LoA2]: 0, [LoA.LoA3]: 0 }
            TTHistory.push({ TTA: nullLoARecord, TTD: nullLoARecord })
            stateActionHistory.push({
                action: 'EMERGENCY_STOP',
                loa: curMState.loa,
                ac: curMState.autonomousConfidence,
                hc: curMState.humanConfidence,
            })

            console.log('EMERGENCY_STOP')
            finishHistoryAfterStop(sim, nrSteps - i)
            break
        }

        if (isOption(action)) {
            sim.performOption(action)
        } else {
            // Do Action in Sim
            sim.performAction(action)
        }

        // LOGGING
        simState = sim.getSimState()

        // tslint:disable-next-line:max-line-length
        // console.log(`${formatNumber(i)} -- ${curMState.h()} -- ${action ? actionToArrow(action.h() as OptionName) : '[]'} -- ${curMState.isSafe() ? 'Y' : 'N'}`)
        if ( i % 1 === 0) {
            console.log(`${formatNumber(i)} / ${formatNumber(nrSteps)} -- ${curMState.h()} -- ${action ? actionToArrow(action.h() as OptionName) : '[]'} -- ${curMState.isSafe() ? 'Y' : 'N'}`)
        }

        TTHistory.push({ TTA: simState.TTA, TTD: simState.TTD })
        stateActionHistory.push({
            action: action ? action.name : 'undefined',
            loa: simState.LoA,
            ac: getACfromSimState(simState),
            hc: getHCfromSimState(simState),
            ...alternativeActions,
        })
    }

    const outFolder = `${arg.outputFolder}/${solverType}`
    console.log(`Finished sim for ${arg.inputFile}, writing output`)
    fs.mkdirSync(`./data/out/${outFolder}`, { recursive: true })
    writeTTHistory(TTHistory, outFolder)
    writeStateActionHistory(stateActionHistory, outFolder)
    writeContextHistory(sim.getSimState(), nrSteps, outFolder)
    console.log(`Completed ${arg.inputFile}`)
    console.log(`------------------------------------------------------------------------------`)

}

mainLoop()
