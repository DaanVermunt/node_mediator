import { argparser } from './argparser'
import Simulation from './simulation/simulation'
import Process from './MDP/process/process'
import MState, { AutonomousConfidence, HumanConfidence, LoA } from './mediator-model/state/m-state'
import { createMStates } from './helper/model/init-states'
import { getMOptions } from './mediator-model/action/m-options'
import TicToc from './helper/TicToc'
import { Action } from './MDP/action/action'
import { writeContext } from './output/console-out'

const arg = argparser.parseArgs()
const d = new Date()
console.log(`${d.getHours()}:${d.getMinutes()}:${d.getSeconds()}`)

function mainLoop() {
    const ticToc = new TicToc()
    ticToc.tic('init_start')
    // Init world
    const sim = new Simulation(arg.inputFile)

    const nrSteps = sim.totalT || 2
    // const mStates = createMStates(nrSteps)
    ticToc.tic('init_done')

    // TODO: for t in Time
    for (let i = 0; i < nrSteps; i++) {
        // Get SimState
        // const simState = sim.getSimState()

        ticToc.tic('start_getOptions')
        // Compute Transprobs
        // const prims = getMOptions(mStates, simState, nrSteps)
        ticToc.tic('done_getOptions')

        // Compute MDPState
        // TODO compute from simulation
        // const curMState = new MState(HumanConfidence.HC0, LoA.LoA1, AutonomousConfidence.AC0, 0)

        ticToc.tic('start_computeAction')
        // Get Opt Action
        // const process = new Process(mStates, Object.values(prims), curMState, { gamma: .99, lr: .4, n: 200 })
        // const action = process.getAction()
        // console.log(mPolicyToString(mStates, process.policy, process.qFunction))

        ticToc.tic('done_computeAction')

        // Do Action in Sim
        sim.performAction({} as Action)
        writeContext(sim.context, sim.t)
    }
}

mainLoop()
