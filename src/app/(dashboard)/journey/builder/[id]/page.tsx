"use client";

import "@xyflow/react/dist/style.css";

import { Suspense, useCallback, useEffect, useMemo, useState } from "react";
import { addEdge, useEdgesState, useNodesState } from "@xyflow/react";
import type { OnConnect, NodeMouseHandler } from "@xyflow/react";
import { useParams } from "next/navigation";
import { CheckCircle2, Info, X } from "lucide-react";

import BuilderHeader from "@/components/journey/builder/BuilderHeader";
import ActionSidebar from "@/components/journey/builder/ActionSidebar";
import WorkflowCanvas from "@/components/journey/builder/WorkflowCanvas";
import NodeSettings from "@/components/journey/builder/NodeSettings";
import { initialJourneyEdges, initialJourneyNodes } from "@/data/journey-builder";
import type {
  JourneyFlowEdge,
  JourneyFlowNode,
  JourneyNodeData,
  ActionDefinition,
  SavedJourneyWorkflow,
} from "@/types/journey-builder";

 function JourneyBuilderContent() {
  const params = useParams<{ id: string }>();
  const journeyId = params?.id ?? "new";

  const [journeyName, setJourneyName] = useState("Property Buyer Follow-up");
  const [status, setStatus] = useState<"draft" | "active">("draft");
  const [lastSaved, setLastSaved] = useState("Not saved yet");
  const [selectedNodeId, setSelectedNodeId] = useState<string | null>("whatsapp-1");
  const [toast, setToast] = useState<string | null>(null);

  const [nodes, setNodes, onNodesChange] = useNodesState<JourneyFlowNode>(initialJourneyNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState<JourneyFlowEdge>(initialJourneyEdges);

  const selectedNode = useMemo(
    () => nodes.find((node) => node.id === selectedNodeId) ?? null,
    [nodes, selectedNodeId],
  );

  // Load a locally saved draft when this builder ID has been saved before.
  useEffect(() => {
    try {
      const saved = localStorage.getItem(`journey-builder:${journeyId}`);
      if (!saved) return;
      const parsed = JSON.parse(saved) as SavedJourneyWorkflow;
      if (Array.isArray(parsed.nodes) && Array.isArray(parsed.edges)) {
        setNodes(parsed.nodes);
        setEdges(parsed.edges);
        setJourneyName(parsed.name || "Untitled Journey");
        setStatus(parsed.status || "draft");
        setLastSaved("Saved locally");
        setSelectedNodeId(parsed.nodes[0]?.id ?? null);
      }
    } catch {
      setToast("The saved browser draft could not be loaded. The sample workflow is shown instead.");
    }
    // The builder should load only when the route ID changes.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [journeyId]);

  useEffect(() => {
    if (!toast) return;
    const timeout = window.setTimeout(() => setToast(null), 4200);
    return () => window.clearTimeout(timeout);
  }, [toast]);


const handleAddAction = useCallback(
  (
    action: ActionDefinition,
    position?: { x: number; y: number }
  ) => {
    const id = `node-${crypto.randomUUID()}`;

    // Fallback position for click-to-add.
    const fallbackPosition = {
      x: 300 + (nodes.length % 3) * 60,
      y: 160 + nodes.length * 100,
    };

    const newNode: JourneyFlowNode = {
      id,
      type: action.type,
      position: position ?? fallbackPosition,
      data: {
        title: action.title,
        description: action.description,
        config: { ...(action.config ?? {}) },

        // Preserve original action information.
        actionId: action.id,
        category: action.category,
        icon: action.icon,
        color: action.color,
      },
    };

    // Add actual node to React Flow.
    setNodes((currentNodes) => [
      ...currentNodes,
      newNode,
    ]);

    // Automatically select newly created node.
    setSelectedNodeId(id);

    setToast(`${action.title} added to workflow.`);
  },
  [nodes.length, setNodes]
);


  const handleConnect: OnConnect = useCallback(
    (connection) => setEdges((current) => addEdge(connection, current)),
    [setEdges],
  );

  const handleNodeClick: NodeMouseHandler<JourneyFlowNode> = useCallback(
    (_event, node) => setSelectedNodeId(node.id),
    [],
  );

  const handlePaneClick = useCallback(() => {
    setSelectedNodeId(null);
  }, []);

  const updateSelectedNode = useCallback((patch: Partial<JourneyNodeData>) => {
    if (!selectedNodeId) return;
    setNodes((current) => current.map((node) =>
      node.id === selectedNodeId
        ? { ...node, data: { ...node.data, ...patch } }
        : node,
    ));
  }, [selectedNodeId, setNodes]);

  const createWorkflowSnapshot = (nextStatus: "draft" | "active"): SavedJourneyWorkflow => ({
    id: journeyId,
    name: journeyName.trim() || "Untitled Journey",
    status: nextStatus,
    nodes,
    edges,
    updatedAt: new Date().toISOString(),
  });

  const handleSave = () => {
    const snapshot = createWorkflowSnapshot("draft");
    try {
      localStorage.setItem(`journey-builder:${journeyId}`, JSON.stringify(snapshot));
      setStatus("draft");
      setLastSaved(`Saved at ${new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}`);
      setToast("Draft saved in this browser. Database saving is not connected yet.");
    } catch {
      setToast("Could not save this draft in browser storage.");
    }
  };

  const handlePublish = () => {
    const hasTrigger = nodes.some((node) => node.type === "trigger");
    if (!hasTrigger) {
      setToast("Add a trigger before publishing this journey.");
      return;
    }

    const snapshot = createWorkflowSnapshot("active");
    try {
      localStorage.setItem(`journey-builder:${journeyId}`, JSON.stringify(snapshot));
      setStatus("active");
      setLastSaved(`Saved at ${new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}`);
      setToast("Marked as published in this browser preview. Connect the backend before sending real messages.");
    } catch {
      setToast("Could not save this journey in browser storage.");
    }
  };

  const handleTest = () => {
    setToast("Preview mode only: connect the execution engine to run a real test.");
  };

  return (
    <div className="-mx-4 -my-4 flex min-h-[calc(100vh-58px)] flex-col overflow-hidden bg-white md:-mx-5 md:-my-5 lg:-mx-6 lg:-my-6">
      <BuilderHeader
        journeyName={journeyName}
        status={status}
        lastSaved={lastSaved}
        onNameChange={setJourneyName}
        onSave={handleSave}
        onPublish={handlePublish}
        onTest={handleTest}
      />

      <div className="flex min-h-[680px] flex-1 overflow-hidden">
        <ActionSidebar onAddAction={(action) => handleAddAction(action)} />

        <WorkflowCanvas
          nodes={nodes}
          edges={edges}
          onNodesChange={onNodesChange}
          onEdgesChange={onEdgesChange}
          onConnect={handleConnect}
          onNodeClick={handleNodeClick}
          onPaneClick={handlePaneClick}
          onAddAction={handleAddAction}
        />

        <NodeSettings
          node={selectedNode}
          onChange={updateSelectedNode}
          onClose={() => setSelectedNodeId(null)}
        />
      </div>

      {toast && (
        <div role="status" className="fixed bottom-5 right-5 z-[100] flex max-w-[420px] items-start gap-3 rounded-xl border border-[#CDEBE6] bg-white px-4 py-3 shadow-xl">
          <span className="mt-0.5 text-[#00A38F]"><CheckCircle2 size={17} /></span>
          <p className="flex-1 text-[12px] leading-5 text-[#344258]">{toast}</p>
          <button type="button" onClick={() => setToast(null)} aria-label="Dismiss notification" className="text-[#91A0B2] hover:text-[#344258]"><X size={15} /></button>
        </div>
      )}

      <div className="flex items-center gap-2 border-t border-[#E5EAF0] bg-[#FBFDFF] px-4 py-2 text-[10px] text-[#8293A8]">
        <Info size={13} className="text-[#00A9B7]" />
        Builder interactions are frontend-only in this package; connect your CRM APIs and execution service before enabling live campaigns.
      </div>
    </div>
  );
}


export default function JourneyBuilderPage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-[60vh] items-center justify-center">
          <div className="text-sm text-gray-500">
            Loading Journey Builder...
          </div>
        </div>
      }
    >
      <JourneyBuilderContent />
    </Suspense>
  );
}