import { argparser } from './argparser'
import Simulation from './simulation/simulation'
import Process from './MDP/process/process'
import MState, { AutonomousConfidence, fromSimState, HumanConfidence, LoA } from './mediator-model/state/m-state'
import { createMStates } from './helper/model/init-states'
import { getMOptions } from './mediator-model/action/m-options'
import TicToc from './helper/TicToc'
import { Action, nullRes } from './MDP/action/action'
import { TimeTos, writeTTs } from './output/console-out'
import { writeContextHistory, writeTTHistory } from './output/write-file'

const arg = argparser.parseArgs()
const d = new Date()
console.log(`${d.getHours()}:${d.getMinutes()}:${d.getSeconds()}`)

function mainLoop() {
    const ticToc = new TicToc()
    ticToc.tic('init_start')
    // Init world
    const sim = new Simulation(arg.inputFile)
    const TTHistory: TimeTos[] = []

    const nrSteps = sim.totalT || 2
    const mStates = createMStates(nrSteps)
    ticToc.tic('init_done')

    let simState = sim.getSimState()
    // TODO: for t in Time
    for (let i = 0; i < nrSteps; i++) {
        // Get SimState

        ticToc.tic('start_getOptions')
        // Compute Transprobs
        const prims = getMOptions(mStates, simState, nrSteps)
        ticToc.tic('done_getOptions')

        // Compute MDPState
        const curMState = fromSimState(simState)

        ticToc.tic('start_computeAction')
        // Get Opt Action
        // const process = new Process(mStates, Object.values(prims), curMState, { gamma: .99, lr: .4, n: 200 })
        // const action = process.getAction()
        // console.log(mPolicyToString(mStates, process.policy, process.qFunction))

        ticToc.tic('done_computeAction')

        // Do Action in Sim
        sim.performAction({} as Action)
        simState = sim.getSimState()
        // writeFactors(sim.context, sim.t)
        writeTTs({ TTA: simState.TTA, TTD: simState.TTD })
        TTHistory.push({ TTA: simState.TTA, TTD: simState.TTD })
    }

    writeTTHistory(TTHistory)
    writeContextHistory(sim.getSimState(), nrSteps)
    console.log(new Date())
}

mainLoop()
