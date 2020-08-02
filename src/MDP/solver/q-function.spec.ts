import QFunction, { isIllegalQValue, isNumericQValue, QValue } from './q-function'
import { Problem } from '../process/problem'
import { State, StateHash } from '../state/state'
import { Action } from '../action/action'
import { encodeIllegal, VValue, vValueCompare } from './v-function'

test('Copying a Qfunction should not copy by reference', () => {
    const states  = [
        { h: () => 's1' } as State,
        { h: () => 's2' } as State,
    ]
    const stateList = states.reduce((res, state) => ({ ...res, [state.h()]: state }), {})
    const actions  = [
        { h: () => 'a1' } as Action,
        { h: () => 'a2' } as Action,
    ]
    const actionList = actions.reduce((res, action) => ({ ...res, [action.h()]: action }), {})
    const p: Problem = {
        states,
        stateList,
        actions,
        actionList,
    }

    const q1 = new QFunction(p)
    q1.set('s1', 'a1', 10)

    const q2 = q1.copy()
    expect(q1.get('s1', 'a1')).toEqual(10)
    expect(q2.get('s1', 'a1')).toEqual(10)

    q1.set('s1', 'a1', 0)

    expect(q1.get('s1', 'a1')).toEqual(0)
    expect(q2.get('s1', 'a1')).toEqual(10)
})

test('Test equals', () => {
    const states  = [
        { h: () => 's1' } as State,
        { h: () => 's2' } as State,
    ]
    const stateList = states.reduce((res, state) => ({ ...res, [state.h()]: state }), {})
    const actions  = [
        { h: () => 'a1' } as Action,
        { h: () => 'a2' } as Action,
    ]
    const actionList = actions.reduce((res, action) => ({ ...res, [action.h()]: action }), {})
    const p: Problem = {
        states,
        stateList,
        actions,
        actionList,
    }

    const q1 = new QFunction(p)
    const q2 = q1.copy()
    expect(q1.equals(q2)).toBeTruthy()

    q1.set('s1', 'a1', 10)
    expect(q1.equals(q2)).toBeFalsy()
})

test('is Illegal illegal', () => {
    const q1: QValue = 'illegal to 5'
    const q2: QValue = 2

    expect(isIllegalQValue(q1)).toBeTruthy()
    expect(isNumericQValue(q1)).toBeFalsy()

    expect(isIllegalQValue(q2)).toBeFalsy()
    expect(isNumericQValue(q2)).toBeTruthy()
})

test('vValue compare', () => {
    const v1: VValue = encodeIllegal({
        stepsToPossibleDanger: 10,
        val: 20,
    })
    const v2: VValue = encodeIllegal({
        stepsToPossibleDanger: 2,
        val: 20,
    })
    const v3: VValue = encodeIllegal({
        stepsToPossibleDanger: 2,
        val: 200,
    })
    const v4: VValue = 0
    const v5: VValue = 10
    const v6: VValue = -10

    const list = [v1, v2, v3, v4, v5, v6]
    list.sort(vValueCompare)
    console.log(list)

})
