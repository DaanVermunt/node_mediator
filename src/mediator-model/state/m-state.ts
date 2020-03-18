import { State } from '../../MDP/state/state'
import { SimulationState } from '../../simulation/simulation-state'
import { getACfromSimState, getHCfromSimState } from '../../simulation/simulation'

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

export const r = {
    top: 110,
    high: 100,
    medium: 90,
    low: 80,
    zero: 0,
    bad: -100,
}

export const loaR = {
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

    transitionCost(from: MState): number {
        if (from.loa !== this.loa) {
            return 10
        }
        return 0
    }

    isSafe(ac: AutonomousConfidence, hc: HumanConfidence, loa: LoA): boolean {
        // HACKY BUT EFFECTIVE
        if (ac < loa) {
            return false
        }

        switch (loa) {
            case LoA.LoA0:
                return hc === HumanConfidence.HC3
            case LoA.LoA1:
                return hc >= HumanConfidence.HC2
            case LoA.LoA2:
                return hc >= HumanConfidence.HC1
            case LoA.LoA3:
                return true
        }
    }

    // TODO does this depend on the current sim state?
    reward(): number {
        if (this.time === -1) {
            return r.zero
        }

        const ac = this.autonomousConfidence
        const hc = this.humanConfidence
        const loa = this.loa

        return this.isSafe(ac, hc, loa) ? loaR[loa] : r.bad
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
