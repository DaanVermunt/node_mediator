import { State, StateHash } from '../state/state'
import { Action, ActionRes, ActionResPerform, nullRes, nullResPerform } from './action'
import { PrimitiveName } from '../../mediator-model/action/m-primitives'

class Primitive implements Action {
    constructor(
        public name: PrimitiveName,
        // private transitionMatrix: Record<StateHash, Record<StateHash, number>>,
        private getTransistions: (action: PrimitiveName, from: State) => Record<StateHash, number>,
        private states: Record<StateHash, State>,
        public cost: number = 0,
    ) {
    }

    getExpReward(from: State, discount: number): ActionRes {
        const transProbs = this.getTransistions(this.name, from)

        const transProbsWithState = Object.keys(transProbs).reduce((res, stateHash) => (
            {
                ...res,
                [stateHash]: { state: this.states[stateHash], prob: transProbs[stateHash] },
            }), {})

        const reward = Object.keys(transProbs).reduce((res, stateHash) => (
            {
                ...res,
                [stateHash]: this.states[stateHash].reward() - this.cost,
            }), {})

        return {
            reward,
            transProbs: transProbsWithState,

            expReward: 0,
            numberOfSteps: 1,
            hasPassedIllegal: false,
        }
    }

    public perform(from: State): ActionResPerform {
        // const transitions: Record<StateHash, number> = this.transitionMatrix[from.h()]
        const transitions: Record<StateHash, number> = this.getTransistions(this.name, from)

        if (
            Object.keys(transitions).length === 0 ||
            Object.values(transitions).reduce((sum, val) => sum + val) <= 0
        ) {
           return nullResPerform(from)
        }

        const totalProb = Object.values(transitions).reduce((sum, val) => sum + val)

        const draw = Math.random() * totalProb

        let cumProd = 0
        const resKey = Object.keys(transitions)
            .filter(transKey => transitions[transKey] > 0)
            .map(transKey => {
                cumProd += transitions[transKey]
                const res = {
                    key: transKey,
                    val: cumProd,
                }
                return res
            })
            .find(transkeyVal => draw <= transkeyVal.val)

        if (!resKey) {
            return nullResPerform(from)
        }
        const resState = this.states[resKey.key]

        return {
            numberOfSteps: 1,
            reward: resState.reward() - this.cost,
            to: resState,
            hasPassedIllegal: !resState.isSafe(),
        }
    }

    public toString(): string {
        console.error('toString(): NOT IMPLEMENTED')
        return ''
    }

    public h(): string {
        return this.name
    }

}

export default Primitive
