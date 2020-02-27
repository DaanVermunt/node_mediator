import { argparser } from './argparser'
import Simulation, { getACfromSimState, getHCfromSimState } from './simulation/simulation'
import Process from './MDP/process/process'
import { AutonomousConfidence, fromSimState, HumanConfidence, LoA } from './mediator-model/state/m-state'
import { createMStates } from './helper/model/init-states'
import { getMOptions } from './mediator-model/action/m-options'
import TicToc from './helper/TicToc'
import { TimeTos } from './output/console-out'
import { writeContextHistory, writeStateActionHistory, writeTTHistory } from './output/write-file'
import QFunction from './MDP/solver/q-function'

const arg = argparser.parseArgs()
const d = new Date()
console.log(`${d.getHours()}:${d.getMinutes()}:${d.getSeconds()}`)

export interface StateActionHistoryItem {
    action: string
    loa: LoA
    ac: AutonomousConfidence
    hc: HumanConfidence
}

function mainLoop() {
    const ticToc = new TicToc()
    ticToc.tic('init_start')
    // Init world
    const sim = new Simulation(arg.inputFile)
    const TTHistory: TimeTos[] = []
    const stateActionHistory: StateActionHistoryItem[] = []

    // TODO remove small number of steps
    const nrSteps = 20 || sim.totalT || 2
    // const horizon = sim.horizon || 20
    const horizon = 20 // TODO get from scenario
    const mStates = createMStates(horizon)
    ticToc.tic('init_done')
    let prevQ: QFunction | boolean = false

    let simState = sim.getSimState(horizon)
    for (let i = 0; i < nrSteps; i++) {
        // Get SimState
        // ticToc.tic(`${i} / ${nrSteps}`)

        // Compute Transprobs
        const prims = getMOptions(mStates, simState, horizon)
        // ticToc.tic('done_getOptions')

        // Compute MDPState
        const curMState = fromSimState(simState)
        console.log(curMState.h())

        // Get Opt Action
        const process = new Process(mStates, Object.values(prims), curMState, { gamma: .99, lr: .4, n: 50 })
        const action = process.getAction()
        // console.log(mPolicyToString(mStates, process.policy, process.qFunction, 5))
        console.log(prevQ && prevQ.equals(process.qFunction))
        prevQ = process.qFunction
        // ticToc.tic('done_computeAction')

        // Do Action in Sim
        sim.performAction(action)
        simState = sim.getSimState()

        // writeFactors(sim.context, sim.t)
        // writeTTs({ TTA: simState.TTA, TTD: simState.TTD })
        TTHistory.push({ TTA: simState.TTA, TTD: simState.TTD })
        stateActionHistory.push({
            action: action ? action.name : 'undefined',
            loa: simState.LoA,
            ac: getACfromSimState(simState),
            hc: getHCfromSimState(simState),
        })
    }

    writeTTHistory(TTHistory)
    writeStateActionHistory(stateActionHistory)
    writeContextHistory(sim.getSimState(), nrSteps)
    console.log(new Date())
}

mainLoop()
