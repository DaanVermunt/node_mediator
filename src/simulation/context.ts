import Factor, { FactorHash, FactorInput } from './factor'
import { Action } from '../MDP/action/action'
import { LoA } from '../mediator-model/state/m-state'
import { PrimitiveName } from '../mediator-model/action/m-primitives'
import { ActionImpact } from './actionImpact'

class Context {
    factors: Record<FactorHash, Factor>

    constructor(factorList: FactorInput[], factors?: Record<FactorHash, Factor>) {
        const boundGetFromFactor = this.getValueFromFactor.bind(this)

        if (factors) {
            this.factors = factors
        } else {
            this.factors = factorList.map(fi => {
                return new Factor({ ...fi, getOtherFactor: boundGetFromFactor })
            }).reduce((res, factor) => {
                return { ...res, [factor.h()]: factor }
            }, {})

            // ACTION to init all at t=0
            this.performAction()
        }
    }

    getFactor(factorName: string): Factor {
        // Maybe get factor another way as the factor hash might change from just name
        return this.factors[factorName as FactorHash]
    }

    resetImpactsForFactor(factor: FactorHash) {
        return this.factors[factor] && this.factors[factor].resetSimImpacts()
    }

    addActionForPredictions(actionImpact: number, factor: FactorHash, time: number): void {
        Object.values(this.factors).forEach(fac => {
            fac.prediction = [... fac.trueValues]
        })
        return this.factors[factor] && this.factors[factor].addImpactForPredictions(actionImpact, time)
    }

    getValueFromFactor(factorName: string, atT: number, prediction: boolean): number {
        if (this.getFactor(factorName)) {
            return this.factors[factorName].getAtT(atT, prediction)
        }
        throw Error('Factor does not exist')
    }

    performAction(action?: Action, curLoA: LoA = LoA.LoA0, t: number = 0, impact: ActionImpact[] = []): LoA {
        Object.values(this.factors).forEach(factor => {
            impact
                .filter(imp => imp.effectFactor === factor.name)
                .forEach(imp => {
                    factor.addImpact(imp.meanEffect, t)
                })
        })

        Object.values(this.factors).forEach(factor => {
            if (factor.trueValues.length <= t) {
                factor.next()
            }
        })

        // SPECIAL LOA ACTIONS
        if (action) {
            const loaUp = {
                [LoA.LoA3]: LoA.LoA3,
                [LoA.LoA2]: LoA.LoA3,
                [LoA.LoA1]: LoA.LoA2,
                [LoA.LoA0]: LoA.LoA1,
            }
            const loaDown = {
                [LoA.LoA3]: LoA.LoA2,
                [LoA.LoA2]: LoA.LoA1,
                [LoA.LoA1]: LoA.LoA0,
                [LoA.LoA0]: LoA.LoA0,
            }

            const actionName = action.name as PrimitiveName

            if (actionName === 'loa_up') {
                return loaUp[curLoA]
            }
            if (actionName === 'loa_down') {
                return loaDown[curLoA]
            }
        }

        return curLoA
    }

}

export default Context
