import { argparser } from './argparser'
import Simulation, { getACfromSimState, getHCfromSimState } from './simulation/simulation'
import Process from './MDP/process/process'
import { AutonomousConfidence, fromSimState, HumanConfidence, LoA } from './mediator-model/state/m-state'
import { createMStates } from './helper/model/init-states'
import { getMOptions, isOption, OptionName } from './mediator-model/action/m-options'
import { formatNumber, TimeTos } from './output/console-out'
import { writeContextHistory, writeStateActionHistory, writeTTHistory } from './output/write-file'
import { actionToArrow, mPolicyToString } from './MDP/process/policy'
import { isEmergencyStop } from './MDP/action/action'

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
    console.time('init')
    // Init world
    const sim = new Simulation(arg.inputFile)
    const TTHistory: TimeTos[] = []
    const stateActionHistory: StateActionHistoryItem[] = []

    const nrSteps = sim.totalT || 2

    // const horizon = sim.horizon || 20
    const horizon = 20 // TODO get from scenario
    const mStates = createMStates(horizon)
    // let prevQ: QFunction | boolean = false

    let simState = sim.getSimState(horizon)

    console.timeEnd('init')
    for (let i = 0; i < nrSteps; i++) {
        // Get SimState
        // ticToc.tic(`${i} / ${nrSteps}`)

        // Compute Transprobs
        const prims = getMOptions(mStates, simState, horizon)
        // ticToc.tic('done_getOptions')

        // Compute MDPState
        const curMState = fromSimState(simState)

        // Get Opt Action
        const process = new Process(mStates, Object.values(prims), curMState, { gamma: .99, lr: .4, n: 50 })
        const action = process.getAction()

        // console.log(mPolicyToString(mStates, process.getPolicy(), process.getQFunction(), 5))

        if (action && isEmergencyStop(action)) {
            console.log(`${formatNumber(i)} -- ${curMState.h()} -- ${action.h()}`)
            // TODO Finish up history in a way
            break
        }

        // prevQ = process.getQFunction()
        // ticToc.tic('done_computeAction')

        if (isOption(action)) {
            sim.performOption(action)
        } else {
            // Do Action in Sim
            sim.performAction(action)
        }

        simState = sim.getSimState()

        console.log(`${formatNumber(i)} -- ${curMState.h()} -- ${action ? actionToArrow(action.h() as OptionName) : '[]'}`)

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
