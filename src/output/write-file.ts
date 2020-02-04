import Context from '../simulation/context'

export function writeContextHistory(context: Context) {
    // TODO Create header row
    // TODO create one big square matrix
    // TODO write to file
    Object.values(context.factors).forEach(factor => {
        console.log()
    })
}
