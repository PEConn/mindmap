import { type Writable, get } from 'svelte/store';
import { type Node, type Edge } from '@xyflow/svelte';

export function executeCommand(
    command: string,
    nodes: Writable<Node[]>,
    edges: Writable<Edge[]>,
    onLayout: () => void) {

    // TODO: Move onLayout out.

    if (command.includes('\n')) {
        command.split('\n').forEach(part => {
            executeCommand(part, nodes, edges, onLayout);
        });
        return;
    }

    if (command === "test") {
        executeCommand("add node 1", nodes, edges, onLayout);
        executeCommand("add node 2", nodes, edges, onLayout);
        executeCommand("add node 3", nodes, edges, onLayout);
        executeCommand("ll", nodes, edges, onLayout);
    }

    if (command === "layout") {
        onLayout();
        return;
    }

    if (command === "reset" || command === "clear") {
        nodes.set([]);
        edges.set([]);
    }

    if (command === "copy") {
        serializeToClipboard(get(nodes), get(edges));
    }

    // Command: "col" for column.
    // It moves the most recently placed node right a column and to
    // the top.
    if (command === "col") {
        const ns = get(nodes);
        if (ns.length === 0) return;

        const x = Math.max(...ns.map(n => n.position.x)) + 200;
        const y = Math.min(...ns.map(n => n.position.y));
        nodes.update(ns => {
            ns[ns.length - 1].position = {x, y};
            return ns;
        })
    }

    // Command: color <id> <color>
    if (command.startsWith("color ")) {
        const parts = command.split(" ");
        if (parts.length !== 3) {
            console.log(`Malformed command: ${parts}`);
            return;
        }

        const id = parts[1];
        const color = parts[2];

        nodes.update(ns => {
            return ns.map(n => {
                // TODO: Make a note of this!!
                // n.data.color = "blue" didn't trigger an update
                // but n.data = {...n.data, color: blue} did.
                if (n.id === id) {
                    n.data = {
                        ...n.data,
                        color: color,
                    }
                }

                return n;
            })
        })
    }

    // Command: add <all the text here>
    if (command.startsWith("add ")) {
        const label = command.substring(4);
        const id = getNextId(get(nodes)).toString();

        addNode(nodes, id, label);
        onLayout(true);
    }

    // TODO: Make this be add-with-id without an overlap with the command above.
    // Command: awi <id> <text here>
    if (command.startsWith("awi ")) {
        const parts = command.split(" ");
        if (parts.length < 3) {
            console.log("awi requires at least 3 elements.");
            return;
        }

        const id = parts[1];
        const label = parts.slice(2).join(" ");
        addNode(nodes, id, label);
        onLayout(true);
    }

    if (command === "ll") {
        // ll = "link last", links the last two added nodes.
        const n = get(nodes);
        if (n.length < 2) {
            console.log("Too few elements");
            return;
        }

        const source = n[n.length - 2].id;
        const target = n[n.length - 1].id;

        addEdge(edges, source, target);
        onLayout();
    }

    // Command: link <source> <target> <label?>
    if (command.startsWith("link ")) {
        const parts = command.split(" ");
        if (parts.length < 3) {
            console.log("Could not parse" + parts);
            return;
        }
        const source = parts[1];
        const target = parts[2];
        let label: string | undefined = undefined;

        if (parts.length > 3) {
            label = parts.slice(3).join(" ");
        }

        addEdge(edges, source, target, label);
        onLayout();
    }

    if (command.startsWith("remove ")) {
        const parts = command.split(" ");
        if (parts.length !== 2) {
            console.log("Could not parse" + parts);
            return;
        }
        const target = parts[1];

        nodes.update((ns: Node[]) => ns.filter(node => node.id !== target))
        edges.update((es: Edge[]) => es.filter(e => e.source !== target && e.target !== target))
    }
}

function addNode(
        nodes: Writable<Node[]>,
        id: string,
        label: string) {

    nodes.update((ns: Node[]) => {
        // Make the node start off on top of the last one.
        // This means that nodes aren't just put in the center of the screen and
        // slowly pushing everything else outwards.
        let x = 0;
        let y = 0;

        if (ns.length > 0) {
            const lastNode = ns[ns.length - 1];
            x = lastNode.position.x;
            y = lastNode.position.y + 100;
        }

        const newNode = {
            id,
            data: {
                label: label,
                id,
            },
            position: { x, y },
            type: 'custom'
        }

        ns.push(newNode);

        return ns;
    });
}

function addEdge(
    edges: Writable<Edge[]>,
    source: string,
    target: string,
    label?: string) {
    const id = `${source}-${target}`;

    if (get(edges).filter(edge => edge.id === id).length !== 0) {
        console.log("Attempting to add duplicate edge");
        return;
    }

    let edge: Edge = { id, source, target, type: 'floating' };

    if (label) {
        edge.label = label;
    }

    edges.update(e => e.concat([edge]));
}

function getNextId(nodes: Node[]) {
    if (nodes.length === 0) return 0;
    return Math.max(...nodes.map(node => parseInt(node.id))) + 1;
}

function serializeToClipboard(nodes: Node[], edges: Edge[]) {
    const nodePart = nodes.map(node => {
        // Input: node = { id, data { label } }
        // Output: add-with-id id label
        return `awi ${node.id} ${node.data.label}`
    }).join("\n");
    const edgePart = edges.map(edge => {
        // Input: edge = { id, source, target, label? }
        // Output: link source target label?
        const l = edge.label ?? "";
        return `link ${edge.source} ${edge.target} ${l}`;
    }).join("\n");

    const contents = nodePart + "\n" + edgePart;
    navigator.clipboard.writeText(contents)
        .then(
            () => console.log("Saved to clipboard"),
            err => console.log(err));
}