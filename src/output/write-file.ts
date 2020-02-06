import * as fs from 'fs'
import { SimulationState } from '../simulation/simulation-state'
import { LoA } from '../mediator-model/state/m-state'
import { TimeTos } from './console-out'

export function writeContextHistory(simState: SimulationState, to: number) {
    const context = simState.context

    // HEADER
    let resString = 't'
    Object.values(context.factors).forEach(factor => {
        resString += `,${factor.name}`
    })
    resString += `\n`

    // ROWS
    for (let i = 0; i < to; i++) {
        resString += `${i}, `
        Object.values(context.factors).forEach(factor => {
            resString += `,${factor.getAtT(i)}`
        })
        resString += `\n`
    }

    fs.writeFileSync('./data/out/context.csv', resString, { encoding: 'utf-8' })
}

export function writeTTHistory(TThistory: TimeTos[]) {
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
        resString += `${idx}, `
        LoAArray.forEach((loa: number) => {
            resString += `,${histItem.TTA[loa as LoA]}`
            resString += `,${histItem.TTD[loa as LoA]}`
        })
        resString += `\n`
    })

    fs.writeFileSync('./data/out/TTs.csv', resString, { encoding: 'utf-8' })
}
