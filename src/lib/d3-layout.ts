import * as d3 from "d3";
import { type Writable, get } from 'svelte/store';
import { type Node, type Edge } from '@xyflow/svelte';

let simulation: d3.Simulation<any, any> | null = null;

export function stopLayout() {
    if (simulation === null) return;

    simulation.stop();
    simulation = null;
}

export function startLayout(
        nodes: Writable<Node[]>,
        edges: Writable<Edge[]>,
        onNewElement: boolean) {
    stopLayout();

    // TODO: I reckon something is going to go wrong when there's a
    // simulation ongoing and you add a node. How do we fix that?
    const nodesCopy = get(nodes);
    const nodeIdToSimulatedIndexMap = new Map();
    const simulationNodes = nodesCopy.map((node, index) => {
        nodeIdToSimulatedIndexMap.set(node.id, index);

        let maybeFixedPosition = {};
        if (onNewElement && index < nodesCopy.length - 2) {
            maybeFixedPosition = {
                fx: node.position.x,
                fy: node.position.y
            }
        }

        const size = node.computed.width;
        return {
            x: node.position.x,
            y: node.position.y,
            data: node,
            size,
            ...maybeFixedPosition
        }
    })

    const simulatedEdges: d3.SimulationLinkDatum<any>[] = [];
    get(edges).forEach(edge => {
        const source = nodeIdToSimulatedIndexMap.get(edge.source);
        const target = nodeIdToSimulatedIndexMap.get(edge.target);

        if (source === undefined || target === undefined) {
            console.log("Not simulating edge with missing source or target");
            console.log(`${source} ${target}`);
        }
        simulatedEdges.push({ source, target });
    })

    console.log("Running simulation");
    simulation = d3
        .forceSimulation(simulationNodes)
        .force("charge", d3.forceManyBody().distanceMax(300))
        .force("collide", d3.forceCollide(node => node.size))
        .force("link", d3.forceLink(simulatedEdges).distance(200))
        .on("tick", () => {
            console.log("Tick");
            nodes.set(simulationNodes.map(node => {
                return {
                    ...node.data,
                    position: {
                        x: node.x,
                        y: node.y
                    }
                }
            }));
        });
}