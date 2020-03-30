import { ArgumentParser } from 'argparse'

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
