export type FactorHash = string

export type DependenceType = 'exogenous' | 'endogenous'
export type FactorType = 'static' | 'modeled'
export type FactorName = string

export interface FactorInput {
    name: FactorName,
    value: string | number,
    start_value?: number,
    type: FactorType,
    dependence: DependenceType,
    error?: number
}

export interface Prediction {
    at: number,
    factorName: string,
    value: number,
    error: number,
}

export interface FactorInit extends FactorInput {
    getOtherFactor: (factorName: string, t: number, prediction: boolean) => number
}

class Factor {
    t = 0

    name: string
    value: number
    formula: string
    startValue: number
    type: FactorType
    error: number
    getOtherFactor: (factorName: string, t: number, prediction: boolean) => number
    dependence: DependenceType
    impacts: Record<number, number>
    simImpacts: Record<number, number>

    trueValues = [] as number[]
    prediction = [] as number[]
    readValues = [] as number[]

    constructor(params: FactorInit) {
        this.name = params.name
        this.type = params.type
        this.dependence = params.dependence
        this.error = params.error ? params.error : 0
        this.value = this.type === 'static' ? params.value as number : 0
        this.formula = this.type === 'modeled' ? params.value as string : ''
        this.startValue = params.start_value ? params.start_value : 0
        this.getOtherFactor = params.getOtherFactor

        this.simImpacts = {}
        this.impacts = {}
    }

    getAtT(t: number, prediction = false): number {
        const history = prediction ? this.prediction : this.trueValues
        if (history.length <= t) {
            this.next(prediction)
            return this.getAtT(t, prediction)
        } else {
            return history[t]
        }
    }

    next(prediction = false): number {
        const history = prediction ? this.prediction : this.trueValues
        let updated: number

        if (this.type === 'static') {
            updated = this.value
        } else {
            const parsedForm = this.parseFormula(history, prediction)
            updated = Function(`return ${parsedForm}`).call(null)
            if (updated !== 0 && !updated) {
                throw Error(`COULD NOT EVAL for ${this.name}: ${parsedForm}`)
            }
        }

        if (prediction) {
            const impactFromPred = this.simImpacts[history.length] ? this.simImpacts[history.length] : 0
            updated = updated + impactFromPred
        } else {
            const impact = this.impacts[history.length] ? this.impacts[history.length] : 0
            updated = updated + impact
        }

        updated = Math.min(Math.max(updated, 0), 1)

        history.push(updated)
        if (!prediction) {
            this.prediction = [...this.trueValues]
        }
        this.readValues.push(this.readValue())
        return updated
    }

    h(): FactorHash {
        // NB: the context expects this to return the name as it is used to compare the factors as defined in formulas
        return this.name
    }

    private readValue(): number {
        return 0
    }

    private parseFormula(history: number[], prediction: boolean = false): string {

        // replace ${_t}
        let tmpFormula = this.formula.replace(/\${_t}/g, history.length.toString())

        // replace ${-x}
        const backRefs = tmpFormula.match(/\${-[0-9]*}/g)

        if (backRefs) {
            backRefs.forEach(ref => {
                const backIndex = Number(ref.replace('${', '').replace('}', ''))
                const backValue =
                    !isNaN(backIndex) && Math.abs(backIndex) < history.length
                        ? history[history.length + backIndex]
                        : this.startValue

                tmpFormula = tmpFormula.replace(ref, backValue.toString())
            })
        }

        // replace internal refs
        const factorRefs = tmpFormula.match(/\${.*?}/g)
        if (factorRefs) {
            factorRefs.forEach(ref => {
                const factorName = ref.replace('${', '').replace('}', '')
                const factorValue = this.getOtherFactor(factorName, history.length, prediction)
                tmpFormula = tmpFormula.replace(ref, factorValue.toString())
            })
        }

        return tmpFormula
    }

    getPrediction(from: number, n: number): Prediction[] {
        const pred: Prediction[] = []

        for (let i = from; i < from + n; i++) {
            pred.push({
                at: i,
                factorName: this.name,
                value: this.getAtT(i, true),
                error: this.error,
            })
        }
        return pred
    }

    addImpact(impact: number, time: number) {
        this.impacts[time] = this.impacts[time] ? this.impacts[time] + impact : impact
        // Reset prediction
    }

    addImpactForPredictions(impact: number, time: number) {
        this.simImpacts[time] = this.simImpacts[time] ? this.simImpacts[time] + impact : impact
    }

    resetSimImpacts() {
        this.simImpacts = {}
    }
}

export default Factor
