<script lang="ts">
    import { Handle, Position, type NodeProps } from '@xyflow/svelte';
    import type { Writable } from 'svelte/store';
    import { marked } from 'marked';

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
    export let positionAbsoluteX: $$Props['positionAbsoluteX'] = undefined; positionAbsoluteX;
    export let positionAbsoluteY: $$Props['positionAbsoluteY'] = undefined; positionAbsoluteY;

    export let data: {
        label: string,
        id: string,
        color?: string,
    };

    $: cssVariables = data.color !== undefined ? `--bg-color: ${data.color}` : "";

    // TODO: https://github.com/markedjs/marked/issues/655#issuecomment-143456762
    // Make links to target = blank
    $: label = marked(data.label);
</script>
   
<div style="{cssVariables}" class="customNode">
    
    <span>{data.id}</span>
    <div>
        {@html label}
    </div>
    <!-- TODO: Make this nicer... -->
    <Handle class="customHandle2" type="target" position={Position.Bottom} />
    <Handle class="customHandle2" type="source" position={Position.Bottom} />
    
</div>

<style>
    .customNode {
        padding: 10px;
        border: solid black 1px;
        border-radius: 4px;
        font-size: 10px;
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

    :global(.customNode p) {
        margin: 0;
    }
    
    :global(.customNode code) {
      color: darkgreen;
      font-size: 11px;
      font-weight: 600;
    }

    /* TODO: Make this not collide with EasyNode. */
    :global(div.customHandle2) {
        width: 10px;
        height: 10px;
    }
</style>