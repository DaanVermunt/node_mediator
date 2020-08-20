import { ArgumentParser } from 'argparse'

export type SolverType = 'mdp' | 'passive' | 'heuristic_max_automation' | 'heuristic_min_automation' | 'heuristic_min_transitions' | 'heuristic_optimal_driver'

export interface Args {
    inputFile: string
    outputFolder: string
    solver: SolverType
    i: number
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

const solverOptions: SolverType[] = ['mdp', 'passive', 'heuristic_max_automation', 'heuristic_min_automation', 'heuristic_min_transitions', 'heuristic_optimal_driver']
argparser.addArgument(
    ['-s'],
    {
        help: 'the solver to choose',
        type: 'string',
        action: 'store',
        dest: 'solver',
        required: false,
        defaultValue: 'mdp',
        choices: solverOptions,
    },
)

argparser.addArgument(
    ['-n'],
    {
        help: 'the ith run of experiment',
        type: 'int',
        action: 'store',
        dest: 'i',
        required: false,
        defaultValue: 0,
    },
)
