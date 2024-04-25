import { type Node, type Edge, Position } from '@xyflow/svelte';
import dagre from '@dagrejs/dagre';

const dagreGraph = new dagre.graphlib.Graph();
dagreGraph.setDefaultEdgeLabel(() => ({}));

const nodeWidth = 172;

// TODO: Make the layout take into account the node height.

export function layoutElements(nodes: Node[], edges: Edge[]) {
    // dagreGraph.setGraph({ rankdir: direction });
    dagreGraph.setGraph({});

    nodes.forEach((node) => {
        const nodeHeight = node.data.label.length;

        dagreGraph.setNode(node.id, { width: nodeWidth, height: nodeHeight });
    });

    edges.forEach((edge) => {
        dagreGraph.setEdge(edge.source, edge.target);
    });

    dagre.layout(dagreGraph);

    nodes.forEach((node) => {
        const nodeWithPosition = dagreGraph.node(node.id);
        node.targetPosition = Position.Top;
        node.sourcePosition = Position.Bottom;

        // We are shifting the dagre node position (anchor=center center) to the top left
        // so it matches the React Flow node anchor point (top left).
        const nodeHeight = node.data.label.length;
        node.position = {
            x: nodeWithPosition.x - nodeWidth / 2,
            y: nodeWithPosition.y - nodeHeight / 2
        };
    });

    return { nodes, edges };
}