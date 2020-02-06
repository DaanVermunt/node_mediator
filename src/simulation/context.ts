import Factor, { FactorHash, FactorInput } from './factor'
import { Action } from '../MDP/action/action'
import { LoA } from '../mediator-model/state/m-state'
import { OptionName } from '../mediator-model/action/m-options'

class Context {
    factors: Record<FactorHash, Factor>

    constructor(factorList: FactorInput[]) {
        const boundGetFromFactor = this.getFromValueFromFactor.bind(this)

        this.factors = factorList.map(fi => {
            return new Factor({ ...fi, getOtherFactor: boundGetFromFactor })
        }).reduce((res, factor) => {
            return { ...res, [factor.h()]: factor }
        }, {})

        // ACTION to init all at t=0
        this.performAction()
    }

    getFactor(factorName: string): Factor {
        // Maybe get factor another way as the factor hash might change from just name
        return this.factors[factorName as FactorHash]
    }

    getFromValueFromFactor(factorName: string, atT: number): number {
        if (this.getFactor(factorName)) {
            return this.factors[factorName].getAtT(atT)
        }
        throw Error('Factor does not exist')
    }

    // TODO do something with action
    performAction(action?: Action, curLoA: LoA = LoA.LoA0): LoA {
        Object.values(this.factors).forEach(factor => {
           factor.next()
        })

        // Return current LoA, i.e. prev and new after action performed
        if (action) {
            const loaUp = {
                [LoA.LoA2]: LoA.LoA2,
                [LoA.LoA1]: LoA.LoA2,
                [LoA.LoA0]: LoA.LoA1,
            }
            const loaDown = {
                [LoA.LoA2]: LoA.LoA1,
                [LoA.LoA1]: LoA.LoA0,
                [LoA.LoA0]: LoA.LoA0,
            }

            const actionName = action.name as OptionName

            if (actionName === 'upgrade') {
                return loaUp[curLoA]
            }
            if (actionName === 'downgrade') {
                return loaDown[curLoA]
            }
        }

        return curLoA
    }
}

export default Context
