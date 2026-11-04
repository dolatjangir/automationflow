
"use client";

import { useCallback } from "react";
import type { DragEvent } from "react";
import type { MouseEventHandler } from "react";
import {
  ReactFlow,
  ReactFlowProvider,
  Background,
  BackgroundVariant,
  Controls,
  MiniMap,
  MarkerType,
  useReactFlow,
} from "@xyflow/react";

import type {
  EdgeChange,
  NodeChange,
  OnConnect,
  NodeMouseHandler,

} from "@xyflow/react";

import type {
  ActionDefinition,
  JourneyFlowEdge,
  JourneyFlowNode,
} from "@/types/journey-builder";

import JourneyToolbar from "./JourneyToolbar";

import TriggerNode from "./nodes/TriggerNode";
import DelayNode from "./nodes/DelayNode";
import WhatsAppNode from "./nodes/WhatsAppNode";
import EmailNode from "./nodes/EmailNode";
import SMSNode from "./nodes/SMSNode";
import ConditionNode from "./nodes/ConditionNode";
import AssignUserNode from "./nodes/AssignUserNode";
import EndNode from "./nodes/EndNode";

/* =========================================
   NODE TYPES
========================================= */

const nodeTypes = {
  trigger: TriggerNode,
  delay: DelayNode,
  whatsapp: WhatsAppNode,
  email: EmailNode,
  sms: SMSNode,
  condition: ConditionNode,
  assign: AssignUserNode,
  end: EndNode,
};

/* =========================================
   DRAG AND DROP CONFIGURATION
========================================= */

const DRAG_TYPE = "application/x-journey-action";

interface DragPayload {
  id: string;
  title: string;
  description: string;
  type: ActionDefinition["type"];
  category: ActionDefinition["category"];
  icon: string;
  color: string;
  config?: ActionDefinition["config"];
}

/* =========================================
   COMPONENT PROPS
========================================= */

interface WorkflowCanvasProps {
  nodes: JourneyFlowNode[];
  edges: JourneyFlowEdge[];

  onNodesChange: (
    changes: NodeChange<JourneyFlowNode>[]
  ) => void;

  onEdgesChange: (changes: EdgeChange[]) => void;

  onConnect: OnConnect;

  onNodeClick: NodeMouseHandler<JourneyFlowNode>;

  onPaneClick: MouseEventHandler<Element>;

  onAddAction: (
    action: ActionDefinition,
    position: { x: number; y: number }
  ) => void;
}

/* =========================================
   VALIDATE DRAG PAYLOAD
========================================= */

function isValidDragPayload(
  value: unknown
): value is DragPayload {
  if (!value || typeof value !== "object") {
    return false;
  }

  const payload = value as Record<string, unknown>;

  return (
    typeof payload.id === "string" &&
    typeof payload.title === "string" &&
    typeof payload.description === "string" &&
    typeof payload.type === "string" &&
    typeof payload.category === "string" &&
    typeof payload.icon === "string" &&
    typeof payload.color === "string"
  );
}

/* =========================================
   WORKFLOW CANVAS INNER
========================================= */

function WorkflowCanvasInner(props: WorkflowCanvasProps) {
  const { screenToFlowPosition } =
    useReactFlow<JourneyFlowNode>();

  const {
    onAddAction,
    nodes,
    edges,
    onNodesChange,
    onEdgesChange,
    onConnect,
    onNodeClick,
    onPaneClick,
  } = props;

  /* =====================================
     DRAG OVER
  ===================================== */

  const handleDragOver = useCallback(
    (event: DragEvent<HTMLDivElement>) => {
      event.preventDefault();

      event.dataTransfer.dropEffect = "copy";
    },
    []
  );

  /* =====================================
     DROP ACTION ON CANVAS
  ===================================== */

  const handleDrop = useCallback(
    (event: DragEvent<HTMLDivElement>) => {
      event.preventDefault();

      const raw =
        event.dataTransfer.getData(DRAG_TYPE) ||
        event.dataTransfer.getData("text/plain");

      if (!raw) {
        return;
      }

      try {
        const parsed: unknown = JSON.parse(raw);

        if (!isValidDragPayload(parsed)) {
          console.error("Invalid journey action payload");
          return;
        }

        const payload = parsed;

        // Convert browser screen coordinates
        // into React Flow canvas coordinates.
        const position = screenToFlowPosition({
          x: event.clientX,
          y: event.clientY,
        });

        // Preserve the complete action definition.
        const action: ActionDefinition = {
          id: payload.id,
          title: payload.title,
          description: payload.description,
          type: payload.type,
          category: payload.category,
          icon: payload.icon,
          color: payload.color,
          config: payload.config ?? {},
        };

        // Send the action to the parent component.
        // The parent must add it to React Flow nodes state.
        onAddAction(action, position);

      } catch (error) {
        console.error(
          "Unable to create workflow node:",
          error
        );
      }
    },
    [onAddAction, screenToFlowPosition]
  );

  console.log("WORKFLOW NODES:", props.nodes);

console.log(
  "NODE POSITIONS:",
  props.nodes.map((node) => ({
    id: node.id,
    type: node.type,
    position: node.position,
  }))
);
  /* =====================================
     RENDER CANVAS
  ===================================== */

  return (
   <div
  className="relative h-[600px] min-h-[600px] w-full flex-1 bg-[#FBFDFF]"
  onDrop={handleDrop}
  onDragOver={handleDragOver}
>
      {/* Canvas Toolbar */}
      <JourneyToolbar
        nodeCount={nodes.length}
        edgeCount={edges.length}
      />

      <ReactFlow
        nodes={nodes}
        edges={edges}

        nodeTypes={nodeTypes}

        /* Node and edge state */
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}

        /* Connections */
        onConnect={onConnect}

        /* Selection events */
        onNodeClick={onNodeClick}
        onPaneClick={onPaneClick}

        /* Canvas settings */
        fitView
        fitViewOptions={{
          padding: 0.25,
          maxZoom: 1.05,
        }}
        minZoom={0.2}
        maxZoom={1.6}

        /* Allow node deletion */
        deleteKeyCode={["Backspace", "Delete"]}

        /* Default connection appearance */
        defaultEdgeOptions={{
          type: "smoothstep",
          style: {
            stroke: "#91A0B2",
            strokeWidth: 1.8,
          },
          markerEnd: {
            type: MarkerType.ArrowClosed,
            color: "#91A0B2",
          },
        }}

        proOptions={{
          hideAttribution: true,
        }}

        className="journey-flow-canvas"
      >
        {/* Dotted Background */}
        <Background
          variant={BackgroundVariant.Dots}
          gap={18}
          size={1}
          color="#DCE6EE"
        />

        {/* Zoom Controls */}
        <Controls
          position="bottom-right"
          showInteractive={false}
          className="!overflow-hidden !rounded-lg !border !border-[#DDE7F0] !bg-white !shadow-md [&>button]:!border-[#EDF0F4] [&>button]:!fill-[#536579]"
        />

        {/* Mini Map */}
        <MiniMap
          position="bottom-left"
          pannable
          zoomable
          nodeColor={(node) => {
            if (node.type === "trigger") return "#34D399";

            if (node.type === "whatsapp") return "#16A34A";

            if (
              node.type === "email" ||
              node.type === "delay"
            ) {
              return "#A78BFA";
            }

            if (
              node.type === "condition" ||
              node.type === "sms"
            ) {
              return "#60A5FA";
            }

            if (node.type === "assign") {
              return "#FBBF24";
            }

            return "#FB7185";
          }}
          className="!border !border-[#DDE7F0] !bg-white !shadow-md"
        />
      </ReactFlow>
    </div>
  );
}

/* =========================================
   WORKFLOW CANVAS PROVIDER
========================================= */

export default function WorkflowCanvas(
  props: WorkflowCanvasProps
) {
  return (
    <ReactFlowProvider>
      <WorkflowCanvasInner {...props} />
    </ReactFlowProvider>
  );
}
