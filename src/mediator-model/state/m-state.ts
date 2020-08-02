import { State, StateHash } from '../../MDP/state/state'
import { SimulationState } from '../../simulation/simulation-state'
import { getACfromSimState, getHCfromSimState } from '../../simulation/simulation'
import { RewardSystem } from '../../simulation/scenario'
import { getElement } from '../../helper/model/sort'

export enum HumanConfidence {
    HC0,
    HC1,
    HC2,
    HC3,
}

export enum HumanImpact {
    HCI0,
    HCI1,
    HCI2,
    HCI3,
}

export enum LoA {
    LoA0,
    LoA1,
    LoA2,
    LoA3,
}

// export const requiredFactors = Object.keys(LoA)
//     .filter(loa => isNaN(Number(loa)))
//     .reduce((res, loa) => {
//         return [`D_${loa}`, `A_${loa}`, ...res]
//     }, [])

export enum AutonomousConfidence {
    AC0,
    AC1,
    AC2,
    AC3,
}

export const toMState = (state: State): (MState | null) => {
    const res = state as MState
    if (
        res.autonomousConfidence !== undefined &&
        res.humanConfidence !== undefined &&
        res.loa !== undefined
    ) {
        return res
    }
    return null
}

export const isMState = (state: State): state is MState => {
    const res = state as MState
    return res.autonomousConfidence !== undefined &&
        res.humanConfidence !== undefined &&
        res.loa !== undefined
}

export const r = {
    top: 110,
    high: 100,
    medium: 90,
    low: 80,
    zero: 0,
    bad: -100,
}

export const rewardList: RewardSystem[] = [
    'min_transitions',
    'min_automation',
    'max_automation',
]

export const transCost = (rs: RewardSystem) => rs === 'min_transitions' ? 100 : 10
export const wakeUpCost = 10

export const loaR = (rs: RewardSystem) => rs === 'min_automation' ? {
    [LoA.LoA0]: r.top,
    [LoA.LoA1]: r.high,
    [LoA.LoA2]: r.medium,
    [LoA.LoA3]: r.low,
} : rs === 'min_transitions' ?
    {
        [LoA.LoA0]: r.medium,
        [LoA.LoA1]: r.medium,
        [LoA.LoA2]: r.medium,
        [LoA.LoA3]: r.medium,
    }
    :
    {
        [LoA.LoA0]: r.low,
        [LoA.LoA1]: r.medium,
        [LoA.LoA2]: r.high,
        [LoA.LoA3]: r.top,
    }

class MState implements State {

    loaReward: Record<LoA, number>

    constructor(
        public readonly humanConfidence: HumanConfidence,
        public readonly loa: LoA,
        public readonly autonomousConfidence: AutonomousConfidence,
        public readonly time: number,
        public readonly humanImpact: HumanImpact,
        public readonly rewardSystem: RewardSystem = 'max_automation',
    ) {
        this.loaReward = loaR(rewardSystem)
    }

    h(): string {
        return this.toString()
    }

    isSafe(): boolean {
        if (this.time === -1) {
            return true
        }

        if (this.autonomousConfidence < this.loa) {
            return false
        }
        return this.safeHCLoA()
    }

    private safeHCLoA(): boolean {
        const totalHC = this.humanConfidence + this.humanImpact
        switch (this.loa) {
            case LoA.LoA0:
                return totalHC >= HumanConfidence.HC3
            case LoA.LoA1:
                return totalHC >= HumanConfidence.HC2
            case LoA.LoA2:
                return totalHC >= HumanConfidence.HC1
            case LoA.LoA3:
                return true
        }
    }

    isSafePrivate(): boolean {
        if (this.autonomousConfidence < this.loa) {
            return false
        }

        return this.safeHCLoA()
    }

    reward(): number {
        if (this.time === -1) {
            return r.zero
        }

        return this.isSafePrivate() ? this.loaReward[this.loa] : r.bad
    }

    toString(): string {
        const rewardIdx = rewardList.findIndex(item => item === this.rewardSystem)
        return `hc: ${this.humanConfidence}, hci: ${this.humanImpact}, loa: ${this.loa}, ac: ${this.autonomousConfidence}, t: ${this.time}, rw: ${rewardIdx}`
    }

}

const getFromStateHash = (stateHash: StateHash, index: number): number => {
    const regex = /: -?\d+/g
    const found = stateHash.match(regex)

    if (found && found[index] !== undefined) {
        return parseInt(found[index].substring(2), 10)
    }
    return -1
}

export const getHC = (stateHash: StateHash): number => getFromStateHash(stateHash, 0)
export const getHCI = (stateHash: StateHash): number => getFromStateHash(stateHash, 1)
export const getLoA = (stateHash: StateHash): number => getFromStateHash(stateHash, 2)
export const getAC = (stateHash: StateHash): number => getFromStateHash(stateHash, 3)
export const getT = (stateHash: StateHash): number => getFromStateHash(stateHash, 4)
export const getRw = (stateHash: StateHash): RewardSystem => rewardList[getFromStateHash(stateHash, 5)]

export const fromSimState = (simState: SimulationState): MState => {
    return new MState(getHCfromSimState(simState), simState.LoA, getACfromSimState(simState), 0, 0, simState.rewardSystem)
}

export const fromStateHash = (st: StateHash): MState => {
    const tString = st.substring(st.indexOf('t: ') + 3)
    const t = parseInt(tString, 10)

    const ac = getElement(st, 'ac:')
    const hc = getElement(st, 'hc')
    const loa = getElement(st, 'loa:')
    const hci = getElement(st, 'hci:')
    return new MState(hc, loa, ac, t, hci)
}

export const zeroState: MState = new MState(0, 0, 0, -1, 0)

export default MState
