import MState, { AutonomousConfidence, getRw, getT, HumanConfidence, HumanImpact, LoA, r } from './m-state'

test('t -1 is zero', () => {
    const [loa, hc, ac, hci] = [LoA.LoA2, HumanConfidence.HC2, AutonomousConfidence.AC2, HumanImpact.HCI0]

    const state = new MState(hc, loa, ac, -1, hci)
    expect(state.reward()).toBe(r.zero)
})

test('0, 0, 0 is bad', () => {
    const [loa, hc, ac, hci] = [LoA.LoA0, HumanConfidence.HC0, AutonomousConfidence.AC0, HumanImpact.HCI0]

    const state = new MState(hc, loa, ac, 0, hci)
    expect(state.reward()).toBe(r.bad)
})

test('test state hash to time', () => {
    const [loa, hc, ac, hci] = [LoA.LoA0, HumanConfidence.HC0, AutonomousConfidence.AC0, HumanImpact.HCI0]

    const ts = [-1, 1, 10, 100, -3]
    ts.forEach(t => {
        const state = new MState(hc, loa, ac, t, hci)
        expect(getT(state.h())).toEqual(t)
    })
})

test('multiple cases max_automation reward', () => {
    const cases: Array<{ hc: HumanConfidence, loa: LoA, ac: AutonomousConfidence, reward: number}> = [
        {
            hc: HumanConfidence.HC2,
            loa: LoA.LoA2,
            ac: AutonomousConfidence.AC2,
            reward: r.high,
        },
        {
            hc: HumanConfidence.HC2,
            loa: LoA.LoA1,
            ac: AutonomousConfidence.AC1,
            reward: r.medium,
        },
        {
            hc: HumanConfidence.HC1,
            loa: LoA.LoA1,
            ac: AutonomousConfidence.AC2,
            reward: r.bad,
        },
        {
            hc: HumanConfidence.HC2,
            loa: LoA.LoA0,
            ac: AutonomousConfidence.AC1,
            reward: r.bad,
        },
    ]

    cases.forEach(testCase => {
        const state = new MState(testCase.hc, testCase.loa, testCase.ac, 0, 0,'max_automation')
        expect(state.reward()).toBe(testCase.reward)
    })
})

test('TEST GET REWARD', () => {
    const state = new MState(0, 0, 0, 0, 0, 'min_automation')
    const rw = getRw(state.h())

    console.log(rw)

    const state2 = new MState(0, 0, 0, 0, 0, rw)

    expect(state.h()).toEqual(state2.h())
})
