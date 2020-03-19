import Factor, { FactorInit } from './factor'

test('adding impact to a factor has direct impact', () => {
    const factorInit: FactorInit = {
        getOtherFactor: (factorName, t) => 1,
        name: 'sleepiness',
        value: '${-1} * 1.01',
        start_value: 0.01,
        type: 'modeled',
        dependence: 'exogenous',
        error: 0.5,
    }

    const sleepiness = new Factor(factorInit)

    const at10 = sleepiness.getPrediction(10, 1)
    console.log(at10)

    sleepiness.addImpactForPredictions(-.01, 10)

    const at10WithImpact = sleepiness.getPrediction(10, 1)
    console.log(at10WithImpact[0])

    expect(true).toBe(true)
    expect(at10WithImpact[0].value).toBeLessThan(at10[0].value)
})

test('adding impact to a factor has impact through time', () => {
    const factorInit: FactorInit = {
        getOtherFactor: (factorName, t) => 1,
        name: 'sleepiness',
        value: '${-1} * 1.01',
        start_value: 0.01,
        type: 'modeled',
        dependence: 'exogenous',
        error: 0.5,
    }

    const sleepiness = new Factor(factorInit)

    const at10 = sleepiness.getPrediction(10, 1)
    console.log(at10)

    sleepiness.addImpactForPredictions(-.01, 10)

    const at10WithImpact = sleepiness.getPrediction(10, 1)
    console.log(at10WithImpact[0])

    expect(true).toBe(true)
    expect(at10WithImpact[0].value).toBeLessThan(at10[0].value)
})

test('test how bindings work in cloning', () => {
    class TestClass {
        constructor(
            private myNumber: number,
            private otherNumber: number,
        ) {
            this.getMyNumber = this.getMyNumber.bind(this)
        }

        getMyNumber() {
            return this.myNumber
        }

        clone() {
            return [this.myNumber, this.otherNumber]
        }

        setNumber(num: number) {
            this.myNumber = num
        }

    }

    const obj1 = new TestClass(10, 10)
    expect(obj1.getMyNumber()).toEqual(obj1.getMyNumber())

    const [param1, param2] = obj1.clone()
    const obj2 = new TestClass(param1, param2)
    expect(obj1.getMyNumber()).toEqual(obj2.getMyNumber())

    obj2.setNumber(1)
    expect(obj1.getMyNumber()).toBeGreaterThan(obj2.getMyNumber())
})
