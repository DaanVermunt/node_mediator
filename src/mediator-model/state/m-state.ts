import { State } from '../../MDP/state/state'
import { SimulationState } from '../../simulation/simulation-state'

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
    reward(): number {
        if (this.time === -1) {
            return 0
        }

        if (this.loa === LoA.LoA2) {
            switch (this.humanConfidence) {
                case HumanConfidence.HC0:
                    return 20
                case HumanConfidence.HC1:
                    return 2
                case HumanConfidence.HC2:
                    return 100
                default:
                    return 0
            }
        } else if (this.loa === LoA.LoA1) {
            switch (this.humanConfidence) {
                case HumanConfidence.HC0:
                    return 10
                case HumanConfidence.HC1:
                    return 15
                case HumanConfidence.HC2:
                    return 20
                default:
                    return 0
            }
        } else {
            switch (this.humanConfidence) {
                case HumanConfidence.HC0:
                    return -5
                case HumanConfidence.HC1:
                    return 10
                case HumanConfidence.HC2:
                    return 15
                default:
                    return 0
            }
        }

    }

    toString(): string {
        return `hc:${this.humanConfidence}, loa: ${this.loa}, ac: ${this.autonomousConfidence}, t: ${this.time}`
    }

}

export const fromSimState = (simState: SimulationState): MState => {
    // TODO implement
    return new MState(0, 0, 0, 0)
}

export const zeroState: MState = new MState(0, 0, 0, -1)

export default MState
