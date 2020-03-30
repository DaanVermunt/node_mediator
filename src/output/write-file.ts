import * as fs from 'fs'
import { SimulationState } from '../simulation/simulation-state'
import { LoA } from '../mediator-model/state/m-state'
import { TimeTos } from './console-out'
import { StateActionHistoryItem } from '../main'

export function writeContextHistory(simState: SimulationState, to: number, outputFolder: string) {
    const context = simState.context

    // HEADER
    let resString = 't'
    Object.values(context.factors).forEach(factor => {
        resString += `,${factor.name}`
    })
    resString += `\n`

    // ROWS
    for (let i = 0; i < to; i++) {
        resString += `${i}`
        Object.values(context.factors).forEach(factor => {
            resString += `,${factor.getAtT(i, false)}`
        })
        resString += `\n`
    }

    fs.writeFileSync(`./data/out/${outputFolder}/context.csv`, resString, { encoding: 'utf-8' })
}

export function writeStateActionHistory(stateActionHistory: StateActionHistoryItem[], outputFolder: string) {
    if (stateActionHistory.length === 0) {
        return
    }
    let resString = 't'
    // HEADER
    Object.keys(stateActionHistory[0]).forEach((key: string) => {
            resString += `,${key}`
        })
    resString += `\n`

    // ROWS
    stateActionHistory.forEach((histItem, idx) => {
        resString += `${idx}`
        // @ts-ignore
        // tslint:disable-next-line
        Object.values(histItem).forEach((item) => {
            resString += `,${item}`
        })
        resString += `\n`
    })

    fs.writeFileSync(`./data/out/${outputFolder}/StateActionHistory.csv`, resString, { encoding: 'utf-8' })
}

export function writeTTHistory(TThistory: TimeTos[], outputFolder: string) {
    let resString = 't'
    const LoAArray: LoA[] = Object.values(LoA)
        .filter(loa => typeof loa !== 'string') as LoA[]
    // HEADER
    LoAArray.forEach((loa: number) => {
            resString += `,TTA_LoA${loa}`
            resString += `,TTD_LoA${loa}`
        })
    resString += `\n`

    // ROWS
    TThistory.forEach((histItem, idx) => {
        resString += `${idx}`
        LoAArray.forEach((loa: number) => {
            resString += `,${histItem.TTA[loa as LoA]}`
            resString += `,${histItem.TTD[loa as LoA]}`
        })
        resString += `\n`
    })

    fs.writeFileSync(`./data/out/${outputFolder}/TTs.csv`, resString, { encoding: 'utf-8' })
}
