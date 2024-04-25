<script lang="ts">
    import { Handle, Position, useConnection, type NodeProps } from '@xyflow/svelte';
    import { marked } from 'marked';
  
    

    type $$Props = NodeProps;

    export let dragHandle: $$Props['dragHandle'] = undefined; dragHandle;
    export let type: $$Props['type']  = undefined; type;
    export let selected: $$Props['selected'] = undefined; selected;
    export let isConnectable: $$Props['isConnectable'] = undefined; isConnectable;
    export let zIndex: $$Props['zIndex'] = undefined; zIndex;
    export let width: $$Props['width'] = undefined; width;
    export let height: $$Props['height'] = undefined; height;
    export let dragging: $$Props['dragging']; dragging;
    export let targetPosition: $$Props['targetPosition'] = undefined; targetPosition;
    export let sourcePosition: $$Props['sourcePosition'] = undefined; sourcePosition;
    export let positionAbsoluteX: $$Props['positionAbsoluteX']; positionAbsoluteX;
    export let positionAbsoluteY: $$Props['positionAbsoluteY']; positionAbsoluteY;
  
    export let id: NodeProps['id'];
    export let data: { label: String, id: String };
  
    const connection = useConnection();
  
    let isConnecting = false;
    let isTarget = false;
  
    $: isConnecting = !!$connection.startHandle?.nodeId;
    $: isTarget = !!$connection.startHandle && $connection.startHandle?.nodeId !== id;
  
    $: label = marked(data.label);
  </script>
  
  <div class="customNode">
    <div
      class="customNodeBody"
      style:border-style={isTarget ? 'dashed' : 'solid'}
      style:background-color={isTarget ? '#ffcce3' : '#ccd9f6'}
    >
      <!-- If handles are conditionally rendered and not present initially, you need to update the node internals https://reactflow.dev/docs/api/hooks/use-update-node-internals/
      In this case we don't need to use useUpdateNodeInternals, since !isConnecting is true at the beginning and all handles are rendered initially. -->
      {#if !isConnecting}
        <Handle class="customHandle" position={Position.Right} type="source" style="z-index: 1;" />
      {/if}
      <!-- <Handle class="customHandle" position={Position.Right} type="source" /> -->
  
      <Handle
        class="customHandle"
        position={Position.Left}
        type="target"
        isConnectableStart={false}
      />
      {@html label}
    </div>
  </div>
  
  <style>
    .customNodeBody {
        padding: 10px;
        border: solid black 1px;
        border-radius: 4px;
        font-size: 12px;
        max-width: 150px;
        background: white;
        /*
      width: 150px;
      height: 80px;
      border: 3px solid black;
      position: relative;
      overflow: hidden;
      border-radius: 10px;
      display: flex;
      justify-content: center;
      align-items: center;
      font-weight: bold; */
    }
  
    .customNode:before {
      content: '';
      position: absolute;
      top: -5px;
      left: 50%;
      height: 10px;
      width: 30px;
      transform: translate(-50%, 0);
      background: #d6d5e6;
      z-index: 1000;
      line-height: 1;
      border-radius: 4px;
      color: #fff;
      font-size: 9px;
      border: 1px solid #222138;
    }
  
    :global(div.customHandle) {
      width: 100%;
      height: 100%;
      background: blue;
      position: absolute;
      top: 0;
      left: 0;
      border-radius: 0;
      transform: none;
      border: none;
      opacity: 0;
    }
  </style>
  