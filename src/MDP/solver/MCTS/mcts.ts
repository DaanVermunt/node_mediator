import { Solver } from '../solver'
import { Problem } from '../../process/problem'
import { Action, ActionHash } from '../../action/action'
import { State } from '../../state/state'
import MCTSNode from './mcts-node'

// interface MCTSNode {
//     state: State
//     children: Record<ActionHash, MCTSNode>
// }

class MonteCarloTreeSearch implements Solver {
    constructor(
        private readonly n: number,
    ) {
    }

    solve(p: Problem): Action {
        return this.treeSearch(p.curMCTSNode)
    }

    treeSearch(root: MCTSNode) {
        for (let i = 0; i < this.n; i++) {
            const leaf = this.traverse(root)
            const simulationResult = this.rollOut(leaf)
            this.backPropagate(leaf, simulationResult)
        }
    }

    traverse(node: MCTSNode): MCTSNode {

        return node
    }

    rollOut(node: MCTSNode): number {

        return 0
    }

    rollOutPolicy(node: MCTSNode): MCTSNode {
        return node
    }

    backPropagate(node: MCTSNode, result: number) {

    }

    best_child(node: MCTSNode): MCTSNode {
        return node
    }
}

export default MonteCarloTreeSearch
