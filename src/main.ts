import { argparser } from './argparser'
import Simulation, { getACfromSimState, getHCfromSimState } from './simulation/simulation'
import Process from './MDP/process/process'
import { AutonomousConfidence, fromSimState, fromStateHash, HumanConfidence, LoA } from './mediator-model/state/m-state'
import { createMStates } from './helper/model/init-states'
import { getMOptions, isOption, OptionName } from './mediator-model/action/m-options'
import { formatNumber, TimeTos } from './output/console-out'
import { writeContextHistory, writeStateActionHistory, writeTTHistory } from './output/write-file'
import { isEmergencyStop } from './MDP/action/action'
import * as fs from 'fs'
import { actionToArrow } from './MDP/process/policy'
import { getElement, sortStateHash } from './helper/model/sort'

const arg = argparser.parseArgs()
const d = new Date()
console.log(`${d.getHours()}:${d.getMinutes()}:${d.getSeconds()}`)
console.log(`Starting with ${arg.inputFile}`)

export interface StateActionHistoryItem {
    action: string
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
    // Init world
    const sim = new Simulation(arg.inputFile)
    const TTHistory: TimeTos[] = []
    const stateActionHistory: StateActionHistoryItem[] = []

    const nrSteps = sim.totalT

    const horizon = sim.horizon || 20
    let simState = sim.getSimState(horizon)

    const mStates = createMStates(horizon, simState.rewardSystem)

    for (let i = 0; i < nrSteps; i++) {
        // Compute MDPState
        const curMState = fromSimState(simState)

        // Compute Trans probs
        const prims = getMOptions(mStates, simState, horizon)

        // Get Opt Action
        const process = new Process(mStates, Object.values(prims), curMState, { gamma: .99, lr: .4, n: 50 })
        const action = process.getAction()

        // console.log(mPolicyToString(mStates, process.getPolicy(), process.getQFunction(), 20, curMState.autonomousConfidence))

        if (action && isEmergencyStop(action)) {
            const nullLoARecord = { [LoA.LoA0]: 0, [LoA.LoA1]: 0, [LoA.LoA2]: 0, [LoA.LoA3]: 0 }
            TTHistory.push({ TTA: nullLoARecord, TTD: nullLoARecord })
            stateActionHistory.push({
                action: 'EMERGENCY_STOP',
                loa: 0,
                ac: 0,
                hc: 0,
            })

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

        if ( false ) {
            const qFunction = process.getQFunction()
            const q = qFunction.qValues
            Object.keys(q).sort(sortStateHash).forEach(st => {
                const state = fromStateHash(st)
                if (state.time < 10) {
                    const val = qFunction.maxQValue(st)
                    console.log(`${st} - ${state.isSafe() ? 'Y' : 'N'} - ${val === 'illegal' ? 'XX' : Math.round(val)}`)
                }
            })
        }

        if ( false ) {
        // if ( (9 <= i  && i <= 11) || i === 1) {
           const q = process.getQFunction().qValues
           Object.keys(q).filter(st => {
               return Object.values(q[st]).filter(item => item !== 'illegal').length > 0
           }).filter(st => {
               const tString = st.substring(st.indexOf('t: ') + 3)
               const t = parseInt(tString, 10)

               const ac = getElement(st, 'ac:')
               const hc = getElement(st, 'hc')
               const loa = getElement(st, 'loa:')

               return t < 4 && t > -1  && ac === 2 && hc >= 2 && loa < 3
           }).sort(sortStateHash).forEach(st => {
               const qvalue = q[st]
               console.log(st)
               Object.keys(qvalue)
                   .map(act => ({ val: qvalue[act], act }) )
                   .filter(actVal =>  actVal.val !== 'illegal')
                   .forEach(actVal => console.log(`----  ${actVal.act} : ${Math.round(actVal.val as number)}`))
           })
        }

        TTHistory.push({ TTA: simState.TTA, TTD: simState.TTD })
        stateActionHistory.push({
            action: action ? action.name : 'undefined',
            loa: simState.LoA,
            ac: getACfromSimState(simState),
            hc: getHCfromSimState(simState),
        })
    }

    console.log(`Finished sim for ${arg.inputFile}, writing output`)
    fs.mkdirSync(`./data/out/${arg.outputFolder}`, { recursive: true })
    writeTTHistory(TTHistory, arg.outputFolder)
    writeStateActionHistory(stateActionHistory, arg.outputFolder)
    writeContextHistory(sim.getSimState(), nrSteps, arg.outputFolder)
    console.log(`Completed ${arg.inputFile}`)
    console.log(`------------------------------------------------------------------------------`)
}

mainLoop()
