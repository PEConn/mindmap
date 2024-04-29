import { type Node, type Edge, Position } from '@xyflow/svelte';
import dagre from '@dagrejs/dagre';

const dagreGraph = new dagre.graphlib.Graph();
dagreGraph.setDefaultEdgeLabel(() => ({}));

const fallbackNodeWidth = 172;

// TODO: Make the layout take into account the node height.

function width(node: Node): number {
    const w = node.computed?.width ?? fallbackNodeWidth;
    return w;
}

function height(node: Node): number {
    return node.computed?.height ?? node.data.label.length;
}

export function layoutElements(nodes: Node[], edges: Edge[]) {
    // dagreGraph.setGraph({ rankdir: direction });
    dagreGraph.setGraph({});

    nodes.forEach((node) => {
        dagreGraph.setNode(node.id, {
            width: width(node),
            height: height(node)
        });
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
        node.position = {
            x: nodeWithPosition.x - width(node) / 2,
            y: nodeWithPosition.y - height(node) / 2
        };
    });

    return { nodes, edges };
}