import MState from '../../mediator-model/state/m-state'
import { StateHash } from '../../MDP/state/state'

export const sortMStates = (s1: MState, s2: MState): number => {
    if (s1.time !== s2.time) {
        return s2.time - s1.time
    }

    if (s1.loa !== s2.loa) {
        return s2.loa - s1.loa
    }

    if (s1.humanConfidence !== s2.humanConfidence) {
        return s1.humanConfidence - s2.humanConfidence
    }

    return 0
}

export const getElement = (stateHash: StateHash, element: string): number => {
    return  parseInt(stateHash[stateHash.indexOf(element) + element.length + 1], 10)
}

export const sortStateHash = (h1: StateHash, h2: StateHash): number => {
    const t1 = parseInt(h1.substring(h1.indexOf('t: ') + 3), 10)
    const t2 = parseInt(h2.substring(h2.indexOf('t: ') + 3), 10)

    const hc1 = getElement(h1, 'hc')
    const hc2 = getElement(h2, 'hc')

    const loa1 = getElement(h1, 'loa:')
    const loa2 = getElement(h2, 'loa:')

    const ac1 = getElement(h1, 'ac:')
    const ac2 = getElement(h2, 'ac:')

    return (t2 - t1) * 1e4 + (hc2 - hc1) * 1e3 + (ac2 - ac1) * 1e2 + (loa2 - loa1) * 1e1
}
