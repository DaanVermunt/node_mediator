import { State } from '../../MDP/state/state'
import { SimulationState } from '../../simulation/simulation-state'
import { getACfromSimState, getHCfromSimState } from '../../simulation/simulation'

export enum HumanConfidence {
    HC0,
    HC1,
    HC2,
}

export enum LoA {
    LoA0,
    LoA1,
    LoA2,
}

export const requiredFactors = Object.keys(LoA)
    .filter(loa => isNaN(Number(loa)))
    .reduce((res, loa) => {
        return [`D_${loa}`, `A_${loa}`, ...res]
    }, [])

export enum AutonomousConfidence {
    AC0,
    AC1,
    AC2,
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

class MState implements State {
    constructor(
        public readonly humanConfidence: HumanConfidence,
        public readonly loa: LoA,
        public readonly autonomousConfidence: AutonomousConfidence,
        public readonly time: number,
    ) {}

    h(): string {
        return this.toString()
    }

    // TODO make reward function dependent on AC as well
    // TODO does this depend on the current sim state?
    reward(): number {
        const r = {
            high: 100,
            zero: 0,
            bad: -100,
        }

        if (this.time === -1) {
            return 0
        }

        const ac = this.autonomousConfidence
        const hc = this.humanConfidence
        const loa = this.loa

        if (loa === LoA.LoA0) {
            if (hc === HumanConfidence.HC2) {
                return r.high
            }
            return r.bad
        }

        if (loa === LoA.LoA1) {
            if (ac === AutonomousConfidence.AC0 || hc === HumanConfidence.HC0) {
                return r.bad
            } else if (ac === AutonomousConfidence.AC1) {
                return r.high
            }
            return r.zero
        }

        // IF loa === LoA.LoA2
        if (ac === AutonomousConfidence.AC0 || ac === AutonomousConfidence.AC1) {
            return r.bad
        }
        return r.high

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
