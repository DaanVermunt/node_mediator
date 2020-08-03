import { REWARDS } from './mediator-model/state/m-state'

test('true is equal to true', () => {
    expect(true).toBe(true)
})

test('RANDOM', () => {
    const prob = .7
    let cnt = 0

    const attempts = 10000
    for (let i = 0; i < attempts; i++) {
        const draw = Math.random()
        cnt = cnt + (draw < prob ? 1 : 0)
    }
    // console.log(cnt / attempts)
})

