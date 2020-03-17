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

// export default argparser
