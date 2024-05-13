import { type Writable, get } from 'svelte/store';
import { type Node, type Edge } from '@xyflow/svelte';

const QUICK_COLORS = new Map();
QUICK_COLORS.set("r", "#e6b8af");
QUICK_COLORS.set("o", "#fce5cd");
QUICK_COLORS.set("y", "#fff2cc");
QUICK_COLORS.set("g", "#d9ead3");
QUICK_COLORS.set("b", "#c9daf8");
QUICK_COLORS.set("i", "#d9d2e9");
QUICK_COLORS.set("v", "#ead1dc");

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

    if (command.startsWith("layout ")) {
        const layout = command.substring("layout ".length);
        onLayout(layout);
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
        let color = parts[2];

        if (QUICK_COLORS.has(color)) {
            color = QUICK_COLORS.get(color);
        }

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

    // TODO: Combine all the commands that involve modifying nodes.

    // Command: append <id> <text>
    if (command.startsWith("append ")) {
        const parts = command.split(" ");
        if (parts.length < 3) {
            console.log("append needs at least 3 elements.");
            return;
        }

        const id = parts[1];
        const content = parts.slice(2).join(" ");

        nodes.update(ns => {
            return ns.map(n => {
                if (n.id === id) {
                    n.data = {
                        ...n.data,
                        label: n.data.label + "\n" + content
                    }
                }

                return n;
            })
        })
    }

    // Command: edit <id> <text>
    if (command.startsWith("edit ")) {
        const parts = command.split(" ");
        if (parts.length < 3) {
            console.log("append needs at least 3 elements.");
            return;
        }

        const id = parts[1];
        const content = parts.slice(2).join(" ");

        nodes.update(ns => {
            return ns.map(n => {
                if (n.id === id) {
                    n.data = {
                        ...n.data,
                        label: content
                    }
                }

                return n;
            })
        })
    }

    // Command: move <id> <x> <y>
    if (command.startsWith("move ")) {
        const parts = command.split(" ");
        if (parts.length !== 4) {
            console.log("move requires 4 parts");
            return;
        }

        const id = parts[1];
        const x = parseInt(parts[2]);
        const y = parseInt(parts[3]);

        if (isNaN(x) || isNaN(y)) {
            console.log(`Could not parse ${x} or ${y}`);
            return;
        }

        nodes.update(ns => {
            return ns.map(n => {
                if (n.id === id) {
                    n.position = { x, y }
                }

                return n;
            })
        })
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
            console.log("Could not parse " + parts);
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

    // Command: unlink <source> <target>
    if (command.startsWith("unlink ")) {
        const parts = command.split(" ");
        if (parts.length < 3) {
            console.log("Could not parse " + parts);
            return;
        }

        const source = parts[1];
        const target = parts[2];

        edges.update(es => es.filter(e => {
            return !(e.target === target && e.source === source);
        }));
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
    const contents = serialize(nodes, edges);
    navigator.clipboard.writeText(contents)
        .then(
            () => console.log("Saved to clipboard"),
            err => console.log(err));
}

export function serialize(nodes: Node[], edges: Edge[]): string {
    const nodePart = nodes.flatMap(node => {
        // Input: node = { id, data { label } }
        // Output: add-with-id id label
        return [
            `awi ${node.id} ${node.data.label}`,
            `move ${node.id} ${node.position.x} ${node.position.y}`
        ]
    }).join("\n");
    const edgePart = edges.map(edge => {
        // Input: edge = { id, source, target, label? }
        // Output: link source target label?
        const l = edge.label ?? "";
        return `link ${edge.source} ${edge.target} ${l}`;
    }).join("\n");

    const colorsPart = nodes.flatMap(node => {
        if (node.data.color) {
            return [`color ${node.id} ${node.data.color}`]
        } else {
            return [];
        }
    }).join("\n")

    return nodePart + "\n" + edgePart + "\n" + colorsPart;
}