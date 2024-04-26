<script lang="ts">
  import { writable } from 'svelte/store';
  import {
    SvelteFlow,
    Controls,
    Background,
    MiniMap,
    Position,
    type Node,
    type Edge,
    MarkerType,
    ConnectionLineType,
  } from '@xyflow/svelte';

  import '@xyflow/svelte/dist/style.css';

  import EasyNode from './components/EasyNode.svelte';
  import FloatingEdge from './components/FloatingEdge.svelte';
  import { executeCommand } from './lib/commands';
  import { layoutElements } from './lib/dagre';
  import { startLayout, stopLayout } from './lib/d3-layout';
    import CustomNode from './components/CustomNode.svelte';

  let command = "";

  function onCommandKeydown(event: KeyboardEvent) {
    if (event.shiftKey) return;
    if (event.key !== "Enter") return;

    event.preventDefault();
    executeCommand(command, nodes, edges, onLayout);

    command = "";
  }

  // https://svelteflow.dev/examples/nodes/easy-connect
  const nodeTypes = {
    'custom': CustomNode
  }

  const edgeTypes = {
    'floating': FloatingEdge
  }

  const defaultEdgeOptions = {
    style: 'stroke-width: 3; stroke: black;',
    type: 'floating',
    markerEnd: {
      type: MarkerType.ArrowClosed,
      color: 'black'
    }
  };

  const connectionLineStyle = 'stroke: black; stroke-width: 3;';

  const nodes = writable<Node[]>(JSON.parse(localStorage.getItem("nodes") ?? "[]"));
  nodes.subscribe((value) => localStorage.setItem("nodes", JSON.stringify(value)));

  const edges = writable<Edge[]>(JSON.parse(localStorage.getItem("edges") ?? "[]"));
  edges.subscribe((value) => localStorage.setItem("edges", JSON.stringify(value)));

  let layout = "none";

  function onLayout(override = "", onNewElement = false) {
    const l = override === "" ? layout : override;

    if (l === "flow") {
      const layout = layoutElements($nodes, $edges);

      $nodes = layout.nodes;
      $edges = layout.edges;
    } else if (l === "force") {
      startLayout(nodes, edges, onNewElement);
    }
  }
</script>

<!-- svelte-ignore a11y-no-static-element-interactions -->
<!-- svelte-ignore a11y-click-events-have-key-events -->
<div style:height="100vh" on:click={stopLayout}>
  <SvelteFlow
      {nodes} {edges}
      {nodeTypes} {edgeTypes}
      {defaultEdgeOptions}
      connectionLineType={ConnectionLineType.Straight}
      {connectionLineStyle}
      fitView>
    <Controls position="top-left" />
    <Background />
    <MiniMap position="top-right" />
    <div class="command-palette">
      <textarea bind:value={command} on:keydown={onCommandKeydown}/>
      <select bind:value={layout}>
        <option>none</option>
        <option>flow</option>
        <option>force</option>
      </select>
    </div>
  </SvelteFlow>
</div>

<style>
.command-palette {
  position: absolute;
  bottom: 30px;
  left: 50%;
  width: 60%;
  transform: translate(-50%, -50%);
  z-index: 4;
  background: lightblue;
  padding: 5px;
  box-sizing: border-box;
}

.command-palette textarea {
  font-size: large;
  width: 100%;
  box-sizing: border-box;
}
</style>