
"use client";

import "@xyflow/react/dist/style.css";

import { Suspense, useCallback, useEffect, useMemo, useState } from "react";
import { addEdge, useEdgesState, useNodesState } from "@xyflow/react";
import type { OnConnect, NodeMouseHandler } from "@xyflow/react";
import { useParams, useRouter } from "next/navigation";
import { CheckCircle2, Info, X } from "lucide-react";

import BuilderHeader from "@/components/journey/builder/BuilderHeader";
import ActionSidebar from "@/components/journey/builder/ActionSidebar";
import WorkflowCanvas from "@/components/journey/builder/WorkflowCanvas";
import NodeSettings from "@/components/journey/builder/NodeSettings";

import type {
  JourneyFlowEdge,
  JourneyFlowNode,
  JourneyNodeData,
  ActionDefinition,
} from "@/types/journey-builder";

function JourneyBuilderContent() {
  const params = useParams<{ id: string }>();
  const router = useRouter();

  const routeId = params?.id ?? "new";

  const [journeyId, setJourneyId] = useState<string | null>(
    routeId === "new" ? null : routeId
  );

  const [journeyName, setJourneyName] = useState("Untitled Journey");
  const [status, setStatus] = useState<"draft" | "active">("draft");
  const [lastSaved, setLastSaved] = useState("Not saved yet");
  const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null);
  const [toast, setToast] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [nodes, setNodes, onNodesChange] =
    useNodesState<JourneyFlowNode>([]);

  const [edges, setEdges, onEdgesChange] =
    useEdgesState<JourneyFlowEdge>([]);

  const selectedNode = useMemo(
    () => nodes.find((node) => node.id === selectedNodeId) ?? null,
    [nodes, selectedNodeId]
  );

  // Create a new journey or load an existing journey.
  useEffect(() => {
    let cancelled = false;

    async function initializeJourney() {
      try {
        setLoading(true);

        if (routeId === "new") {
          const response = await fetch("/api/journeys", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              name: "Untitled Journey",
              description: "",
              status: "draft",
              nodes: [],
              edges: [],
            }),
          });

          const result = await response.json();

          if (!response.ok || !result.success) {
            throw new Error(
              result.message || "Could not create journey."
            );
          }

          if (cancelled) return;

          const newId = result.data.id;

          setJourneyId(newId);
          setJourneyName(result.data.name);
          setStatus(result.data.status);
          setNodes([]);
          setEdges([]);
          setLastSaved("Created in database");

          // Change URL to the real database journey ID.
          router.replace(`/journey/builder/${newId}`);

          return;
        }

        const response = await fetch(`/api/journeys/${routeId}`, {
          cache: "no-store",
        });

        const result = await response.json();

        if (!response.ok || !result.success) {
          throw new Error(
            result.message || "Could not load journey."
          );
        }

        if (cancelled) return;

        const journey = result.data;

        const loadedNodes: JourneyFlowNode[] = (journey.nodes ?? []).map(
          (node: any) => ({
            id: node.id,
            type: node.type,
            position: {
              x: node.positionX,
              y: node.positionY,
            },
            data: {
              title: node.title,
              description: node.description ?? "",
              config: node.config ?? {},
              actionId: node.actionId ?? undefined,
              category: node.category ?? undefined,
              icon: node.icon ?? undefined,
              color: node.color ?? undefined,
            },
          })
        );

        const loadedEdges: JourneyFlowEdge[] = (journey.edges ?? []).map(
          (edge: any) => ({
            id: edge.id,
            source: edge.sourceNodeId,
            target: edge.targetNodeId,
            sourceHandle: edge.sourceHandle ?? undefined,
            targetHandle: edge.targetHandle ?? undefined,
            type: edge.edgeType ?? undefined,
            label: edge.label ?? undefined,
            animated: edge.animated,
          })
        );

        setJourneyId(journey.id);
        setJourneyName(journey.name);
        setStatus(journey.status);
        setNodes(loadedNodes);
        setEdges(loadedEdges);
        setLastSaved("Loaded from database");
        setSelectedNodeId(loadedNodes[0]?.id ?? null);
      } catch (error) {
        console.error("Journey initialization error:", error);

        if (!cancelled) {
          setToast(
            error instanceof Error
              ? error.message
              : "Could not initialize journey."
          );
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    initializeJourney();

    return () => {
      cancelled = true;
    };
  }, [routeId, router, setNodes, setEdges]);

  // Toast message timeout.
  useEffect(() => {
    if (!toast) return;

    const timeout = window.setTimeout(() => setToast(null), 4200);

    return () => window.clearTimeout(timeout);
  }, [toast]);

  // Add a node to React Flow.
  const handleAddAction = useCallback(
    (
      action: ActionDefinition,
      position?: { x: number; y: number }
    ) => {
      const id = `node-${crypto.randomUUID()}`;

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
          actionId: action.id,
          category: action.category,
          icon: action.icon,
          color: action.color,
        },
      };

      setNodes((current) => [...current, newNode]);
      setSelectedNodeId(id);
      setToast(`${action.title} added to workflow.`);
    },
    [nodes.length, setNodes]
  );

  // Connect nodes, including Condition YES/NO handles.
  const handleConnect: OnConnect = useCallback(
    (connection) => {
      setEdges((current) =>
        addEdge(
          {
            ...connection,
            type: "smoothstep",
            animated: true,
            style: {
              stroke:
                connection.sourceHandle === "yes"
                  ? "#10B981"
                  : connection.sourceHandle === "no"
                    ? "#F43F5E"
                    : "#91A0B2",
              strokeWidth: 2,
            },
          },
          current
        )
      );
    },
    [setEdges]
  );

  const handleNodeClick: NodeMouseHandler<JourneyFlowNode> =
    useCallback((_event, node) => {
      setSelectedNodeId(node.id);
    }, []);

  const handlePaneClick = useCallback(() => {
    setSelectedNodeId(null);
  }, []);

  // Update selected node settings.
  const updateSelectedNode = useCallback(
    (patch: Partial<JourneyNodeData>) => {
      if (!selectedNodeId) return;

      setNodes((current) =>
        current.map((node) =>
          node.id === selectedNodeId
            ? {
                ...node,
                data: {
                  ...node.data,
                  ...patch,
                },
              }
            : node
        )
      );
    },
    [selectedNodeId, setNodes]
  );

  // Save workflow to MySQL.
  const saveJourney = async (nextStatus: "draft" | "active") => {
    if (!journeyId || saving) return;

    try {
      setSaving(true);

      const response = await fetch(`/api/journeys/${journeyId}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: journeyName.trim() || "Untitled Journey",
          status: nextStatus,

          nodes: nodes.map((node) => ({
            id: node.id,
            type: node.type,
            position: node.position,
            data: node.data,
          })),

          edges: edges.map((edge) => ({
            id: edge.id,
            source: edge.source,
            target: edge.target,
            sourceHandle: edge.sourceHandle,
            targetHandle: edge.targetHandle,
            type: edge.type,
            label: edge.label,
            animated: edge.animated,
          })),
        }),
      });

      const result = await response.json();

      if (!response.ok || !result.success) {
        throw new Error(
          result.message || "Could not save journey."
        );
      }

      setStatus(nextStatus);

      setLastSaved(
        `Saved at ${new Date().toLocaleTimeString([], {
          hour: "2-digit",
          minute: "2-digit",
        })}`
      );

      setToast(
        nextStatus === "active"
          ? "Journey published successfully in the database."
          : "Journey saved successfully in the database."
      );
    } catch (error) {
      console.error("Journey save error:", error);

      setToast(
        error instanceof Error
          ? error.message
          : "Could not save journey."
      );
    } finally {
      setSaving(false);
    }
  };

  const handleSave = () => {
    saveJourney("draft");
  };

  const handlePublish = () => {
    const hasTrigger = nodes.some((node) => node.type === "trigger");

    if (!hasTrigger) {
      setToast("Add a trigger before publishing this journey.");
      return;
    }

    saveJourney("active");
  };

 
const handleTest = async () => {
  if (!journeyId) {
    setToast("Journey is not ready. Please try again.");
    return;
  }

  if (saving) {
    setToast("Please wait until the journey is saved.");
    return;
  }

  const hasTrigger = nodes.some((node) => node.type === "trigger");

  if (!hasTrigger) {
    setToast("Add a trigger before testing this journey.");
    return;
  }

  try {
    setSaving(true);
    setToast("Saving journey before testing...");

    // 1. Save the latest workflow as a draft.
    const saveResponse = await fetch(`/api/journeys/${journeyId}`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        name: journeyName.trim() || "Untitled Journey",
        status,
        nodes: nodes.map((node) => ({
          id: node.id,
          type: node.type,
          position: node.position,
          data: node.data,
        })),
        edges: edges.map((edge) => ({
          id: edge.id,
          source: edge.source,
          target: edge.target,
          sourceHandle: edge.sourceHandle,
          targetHandle: edge.targetHandle,
          type: edge.type,
          label: edge.label,
          animated: edge.animated,
        })),
      }),
    });

    const saveResult = await saveResponse.json();

    if (!saveResponse.ok || !saveResult.success) {
      throw new Error(saveResult.message || "Could not save journey.");
    }

    setLastSaved(
      `Saved at ${new Date().toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
      })}`
    );

    // 2. Create a new test execution.
    const createResponse = await fetch(
      `/api/journeys/${journeyId}/test`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          testData: {
            firstName: "Test",
            lastName: "Contact",
            email: "test@example.com",
            phone: "9999999999",
            company: "Test Company",
            lead_status: "Interested",
          },
        }),
      }
    );

    const createResult = await createResponse.json();

    if (!createResponse.ok || !createResult.success) {
      throw new Error(
        createResult.message || "Could not create test execution."
      );
    }

    const executionId = createResult.data.execution.id;

    // 3. Run the test execution.
    const runResponse = await fetch(
      `/api/journeys/${journeyId}/test/${executionId}/run`,
      {
        method: "POST",
      }
    );

    const runResult = await runResponse.json();

    if (!runResponse.ok || !runResult.success) {
      throw new Error(
        runResult.error ||
          runResult.message ||
          "Test execution failed."
      );
    }

    setToast("Test journey completed successfully. Opening history...");

    // 4. Open execution history for this journey.
    router.push(`/journey/${journeyId}/executions`);
  } catch (error) {
    console.error("Journey test error:", error);

    setToast(
      error instanceof Error
        ? error.message
        : "Could not run journey test."
    );
  } finally {
    setSaving(false);
  }
};


  if (loading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <p className="text-sm text-gray-500">
          Loading journey from database...
        </p>
      </div>
    );
  }

  return (
    <div className="-mx-4 -my-4 flex min-h-[calc(100vh-58px)] flex-col overflow-hidden bg-white md:-mx-5 md:-my-5 lg:-mx-6 lg:-my-6">
      <BuilderHeader
        journeyName={journeyName}
        status={status}
        lastSaved={saving ? "Saving..." : lastSaved}
        onNameChange={setJourneyName}
        onSave={handleSave}
        onPublish={handlePublish}
        onTest={handleTest}
      />

      <div className="flex min-h-[680px] flex-1 overflow-hidden">
        <ActionSidebar onAddAction={handleAddAction} />

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
        <div
          role="status"
          className="fixed bottom-5 right-5 z-[100] flex max-w-[420px] items-start gap-3 rounded-xl border border-[#CDEBE6] bg-white px-4 py-3 shadow-xl"
        >
          <span className="mt-0.5 text-[#00A38F]">
            <CheckCircle2 size={17} />
          </span>

          <p className="flex-1 text-[12px] leading-5 text-[#344258]">
            {toast}
          </p>

          <button
            type="button"
            onClick={() => setToast(null)}
            aria-label="Dismiss notification"
            className="text-[#91A0B2] hover:text-[#344258]"
          >
            <X size={15} />
          </button>
        </div>
      )}

      <div className="flex items-center gap-2 border-t border-[#E5EAF0] bg-[#FBFDFF] px-4 py-2 text-[10px] text-[#8293A8]">
        <Info size={13} className="text-[#00A9B7]" />
        Journey workflow is saved in your MySQL database. Live message execution is not connected yet.
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
