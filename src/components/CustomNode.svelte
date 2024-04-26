<script lang="ts">
    import { Handle, Position, type NodeProps } from '@xyflow/svelte';
    import type { Writable } from 'svelte/store';

    type $$Props = NodeProps;

    export let id: $$Props['id']; id;
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

    export let data: {
        label: String,
        id: String,
        color?: String,
    };

    $: {
        console.log(data.color);
    }

    $: cssVariables = data.color !== undefined ? `--bg-color: ${data.color}` : "";
</script>
   
<div style="{cssVariables}" class="customNode">
    
    <span>{data.id}</span>
    <div>
        {data.label}
    </div>
    <Handle type="source" position={Position.Bottom} />
    <Handle type="target" position={Position.Bottom} />
</div>

<style>
    .customNode {
        padding: 10px;
        border: solid black 1px;
        border-radius: 4px;
        font-size: 12px;
        max-width: 150px;
        background: var(--bg-color, white);
    }

    .customNode span {
        position: absolute;
        font-size: 8px;
        color: darkslategrey;
        right: 4px;
        top: 0px;
    }
</style>