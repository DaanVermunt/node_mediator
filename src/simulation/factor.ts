export type FactorHash = string

export type DependenceType = 'exogenous' | 'endogenous'
export type FactorType = 'static' | 'modeled'

export interface FactorInput {
    name: string,
    value: string | number,
    start_value?: number,
    type: FactorType,
    dependence: DependenceType,
    error?: number
}

interface FactorInit extends FactorInput {
   getOtherFactor: (factorName: string, t: number) => number
}

class Factor {

    t = 0

    name: string
    value: number
    formula: string
    startValue: number
    type: FactorType
    error: number
    getOtherFactor: (factorName: string, t: number) => number
    dependence: DependenceType

    trueValues = [] as number[]
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
    }

    getAtT(t: number): number {
        if (this.getT() <= t) {
            this.next()
            return this.getAtT(t)
        } else {
            return this.trueValues[t]
        }
    }

    next(): number {
        let updated: number

        if (this.type === 'static') {
            updated = this.value
        } else {
            const parsedForm = this.parseFormula()
            updated = Function(`return ${parsedForm}`).call(null)
            if (updated !== 0 && !updated) {
                throw Error(`COULD NOT EVAL for ${this.name}: ${parsedForm}`)
            }
        }

        this.trueValues.push(updated)
        this.readValues.push(this.readValue())
        return updated
    }

    h(): FactorHash {
        // NB: the context expects this to return the name as it is used to compare the factors as defined in formulas
        return this.name
    }

    private readValue(): number {
        // TODO take last value and add uncertainty
        return 0
    }

    private parseFormula(): string {

        // replace ${_t}
        let tmpFormula = this.formula.replace(/\${_t}/g, this.getT().toString())

        // replace ${-x}
        const backRefs = tmpFormula.match(/\${-[0-9]*}/g)

        if (backRefs) {
            backRefs.forEach(ref => {
                const backIndex = Number(ref.replace('${', '').replace('}', ''))
                const backValue  =
                    !isNaN(backIndex) && Math.abs(backIndex) < this.getT()
                    ? this.trueValues[this.getT() + backIndex]
                    : this.startValue

                tmpFormula = tmpFormula.replace(ref, backValue.toString())
            })
        }

        // replace internal refs
        const factorRefs = tmpFormula.match(/\${.*?}/g)
        if (factorRefs) {
            factorRefs.forEach(ref => {
                const factorName = ref.replace('${', '').replace('}', '')
                const factorValue = this.getOtherFactor(factorName, this.getT())
                tmpFormula = tmpFormula.replace(ref, factorValue.toString())
            })
        }

        return tmpFormula
    }

    getLastTrue(): number {
        return this.trueValues[this.getT() - 1]
    }

    getT(): number {
        return this.trueValues.length
    }
}

export default Factor
