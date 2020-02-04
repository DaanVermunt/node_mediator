import Factor, { FactorHash, FactorInput } from './factor'
import { Action } from '../MDP/action/action'

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

    getFromValueFromFactor(factorName: string, atT: number): number {
        // Maybe get factor another way as the factor hash might change from just name
        if (this.factors[factorName as FactorHash]) {
            return this.factors[factorName].getAtT(atT)
        }
        throw Error('Factor does not exist')
    }

    performAction(action?: Action) {
        Object.values(this.factors).forEach(factor => {
            console.log(factor.name, ':', factor.next())
        })
    }
}

export default Context
