import { Action, ActionHash } from '../../action/action'
import { State } from '../../state/state'

class MCTSNode {

    public children: Record<ActionHash, MCTSNode> = {}

    constructor(
        private readonly parent: MCTSNode | null,
        private readonly action: Action,
        private readonly state: State,
        unexpandedActions: Action[],
    ) {
    }

    childNode(action: Action): MCTSNode | null {
        const res = this.children[action.h()]
        return res ? res : null
    }

    expand(action: Action, childState: State, unexpandedActions: Action[]): MCTSNode {
        throw new Error('NOT IMPLEMENTED')
    }

    allPlays(): Action[] {
        return []
    }

    unexpandedActions(): Action[] {
        return []
    }

    isFullyExpanded(): boolean {
        return false
    }

    isLeaf(): boolean {
        return false
    }

    getUCB1(biasParam: number): number {
        throw new Error('NOT IMPLEMENTED')
    }
}

export default MCTSNode
