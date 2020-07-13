import { ArgumentParser } from 'argparse'

export type SolverType = 'heuristic' | 'mdp' | 'passive'

export interface Args {
    inputFile: string,
    outputFolder: string,
    solver: SolverType,
}

export const argparser: ArgumentParser = new ArgumentParser()

argparser.addArgument(
    ['-i'],
    {
        help: 'path too input file',
        type: 'string',
        action: 'store',
        dest: 'inputFile',
    },
)

argparser.addArgument(
    ['-o'],
    {
        help: 'path too output folder',
        type: 'string',
        action: 'store',
        dest: 'outputFolder',
    },
)

const solverOptions: SolverType[] = ['mdp', 'heuristic', 'passive']
argparser.addArgument(
    ['-s'],
    {
        help: 'the solver to choose',
        type: 'string',
        action: 'store',
        dest: 'solver',
        required: true,
        defaultValue: 'mdp',
        choices: solverOptions,
    },
)
