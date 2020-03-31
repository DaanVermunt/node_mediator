import { State } from '../../MDP/state/state'
import { SimulationState } from '../../simulation/simulation-state'
import { getACfromSimState, getHCfromSimState, rewardSystem } from '../../simulation/simulation'

export enum HumanConfidence {
    HC0,
    HC1,
    HC2,
    HC3,
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
    if (
        res.autonomousConfidence !== undefined &&
        res.humanConfidence !== undefined &&
        res.loa !== undefined
    ) {
        return true
    }
    return false
}

export const r = {
    top: 110,
    high: 100,
    medium: 90,
    low: 80,
    zero: 0,
    bad: -100,
}

export const transCost = rewardSystem === 'min_transitions' ? 100 : 10
export const wakeUpCost = 10

export const loaR = rewardSystem === 'min_automation' ? {
    [LoA.LoA0]: r.top,
    [LoA.LoA1]: r.high,
    [LoA.LoA2]: r.medium,
    [LoA.LoA3]: r.low,
} : rewardSystem === 'min_transitions' ?
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
    constructor(
        public readonly humanConfidence: HumanConfidence,
        public readonly loa: LoA,
        public readonly autonomousConfidence: AutonomousConfidence,
        public readonly time: number,
    ) {
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

        switch (this.loa) {
            case LoA.LoA0:
                return this.humanConfidence === HumanConfidence.HC3
            case LoA.LoA1:
                return this.humanConfidence >= HumanConfidence.HC2
            case LoA.LoA2:
                return this.humanConfidence >= HumanConfidence.HC1
            case LoA.LoA3:
                return true
        }
    }

    isSafePrivate(): boolean {
        if (this.autonomousConfidence < this.loa) {
            return false
        }

        switch (this.loa) {
            case LoA.LoA0:
                return this.humanConfidence === HumanConfidence.HC3
            case LoA.LoA1:
                return this.humanConfidence >= HumanConfidence.HC2
            case LoA.LoA2:
                return this.humanConfidence >= HumanConfidence.HC1
            case LoA.LoA3:
                return true
        }
    }

    reward(): number {
        if (this.time === -1) {
            return r.zero
        }

        return this.isSafePrivate() ? loaR[this.loa] : r.bad
    }

    toString(): string {
        return `hc:${this.humanConfidence}, loa: ${this.loa}, ac: ${this.autonomousConfidence}, t: ${this.time}`
    }

}

export const fromSimState = (simState: SimulationState): MState => {
    return new MState(getHCfromSimState(simState), simState.LoA, getACfromSimState(simState), 0)
}

export const zeroState: MState = new MState(0, 0, 0, -1)

export default MState
