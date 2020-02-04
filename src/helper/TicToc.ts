class TicToc {
    constructor() {
        this.t = this.time()
    }

    private t: number

    private time(): number {
        return (new Date()).getTime()
    }

    tic(mess?: string) {
        const now = this.time()
        console.log(`${ now - this.t }: ${mess}`)
        this.t = now
    }

    toc(mess?: string) {
        const now = this.time()
        console.log(`${ now - this.t }: ${mess}`)
    }

}

export default TicToc
