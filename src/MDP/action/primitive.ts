import { State, StateHash } from '../state/state'
import { Action, ActionRes, nullRes } from './action'
import { PrimitiveName } from '../../mediator-model/action/m-primitives'
import MState, { AutonomousConfidence, HumanConfidence, LoA, zeroState } from '../../mediator-model/state/m-state'

class Primitive implements Action {
    constructor(
        public name: PrimitiveName,
        private transitionMatrix: Record<StateHash, Record<StateHash, number>>,
        private states: Record<StateHash, State>,
    ) {
    }

    public perform(from: State): ActionRes {
        const transitions: Record<StateHash, number> = this.transitionMatrix[from.h()]

        if (!transitions ||
            Object.keys(transitions).length === 0 ||
            Object.values(transitions).reduce((sum, val) => sum + val) <= 0
        ) {
            return nullRes(from)
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
            return nullRes(from)
        }
        const resState = this.states[resKey.key]

        return {
            numberOfSteps: 1,
            reward: resState.reward(),
            to: resState,
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
