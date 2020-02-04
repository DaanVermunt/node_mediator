import MState from '../../mediator-model/state/m-state'

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
