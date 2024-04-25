<svelte:options immutable />

<script lang="ts">
  import { getStraightPath, useNodes, type EdgeProps, type Node } from '@xyflow/svelte';
  import { getEdgeParams } from '../lib/utils';

  type $$Props = EdgeProps;

  export let source: EdgeProps['source'];
  export let target: EdgeProps['target'];
  export let markerEnd: EdgeProps['markerEnd'] = undefined;
  export let style: EdgeProps['style'] = undefined;
  export let id: EdgeProps['id'];

  // To get rid of warnings/
  export let data: EdgeProps['data'] = undefined; data;
  export let label: EdgeProps['label'] = undefined; label;
  export let labelStyle: EdgeProps['labelStyle'] = undefined; labelStyle;
  export let type: EdgeProps['type']; type;
  export let sourceHandleId: EdgeProps['sourceHandleId']; sourceHandleId;
  export let targetHandleId: EdgeProps['targetHandleId']; targetHandleId;
  export let markerStart: EdgeProps['markerStart']; markerStart;
  export let sourcePosition: EdgeProps['sourcePosition']; sourcePosition;
  export let targetPosition: EdgeProps['targetPosition']; targetPosition;
  export let sourceX: EdgeProps['sourceX']; sourceX;
  export let sourceY: EdgeProps['sourceY']; sourceY;
  export let targetX: EdgeProps['targetX']; targetX;
  export let targetY: EdgeProps['targetY']; targetY;
  export let animated: EdgeProps['animated']; animated;
  export let selected: EdgeProps['selected']; selected;
  export let interactionWidth: EdgeProps['interactionWidth']; interactionWidth;

  const nodes = useNodes();

  let sourceNode: Node | undefined;
  let targetNode: Node | undefined;

  let edgePath: string | undefined;

  $: {
    $nodes.forEach((node) => {
      if (node.id === source) sourceNode = node;
      if (node.id === target) targetNode = node;
    });
    if (sourceNode && targetNode) {
      const edgeParams = getEdgeParams(sourceNode, targetNode);
      edgePath = getStraightPath({
        sourceX: edgeParams.sx,
        sourceY: edgeParams.sy,
        targetX: edgeParams.tx,
        targetY: edgeParams.ty
      })[0];
      if (isNaN(edgeParams.sx)) {
        edgePath = undefined;
      }
    } else {
      edgePath = undefined;
    }
  }
</script>

<path {id} marker-end={markerEnd} d={edgePath} {style} />