
"use client";

import { useCallback, useEffect, useMemo, useState } from "react";

import JourneyFilters from "@/components/journey/JourneyFilters";
import JourneyHeader from "@/components/journey/JourneyHeader";
import JourneyPagination from "@/components/journey/JourneyPagination";
import JourneyStats from "@/components/journey/JourneyStats";
import JourneyTable from "@/components/journey/JourneyTable";
import JourneyTabs from "@/components/journey/JourneyTabs";

import type {
  Journey,
  JourneyChannel,
  JourneyChannelFilter,
  JourneySortOption,
  JourneyStatus,
  JourneyStatusFilter,
} from "@/types/journey";

const PAGE_SIZE = 5;

interface ApiJourney {
  id: string;
  name: string;
  description: string | null;
  status: string;
  updatedAt: string;

  nodes?: Array<{
    id: string;
    type: string;
    title: string;
    description: string | null;
    config: unknown;
  }>;

  edges?: Array<{
    id: string;
  }>;

  _count?: {
    nodes: number;
    edges: number;
    executions: number;
  };
}

function formatUpdatedLabel(dateValue: string) {
  const date = new Date(dateValue);
  const now = new Date();

  const difference = Math.max(0, now.getTime() - date.getTime());
  const minutes = Math.floor(difference / 60000);

  if (minutes < 1) return "Just now";
  if (minutes < 60) return `${minutes} min ago`;

  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours} hours ago`;

  const days = Math.floor(hours / 24);
  if (days < 7) return `${days} days ago`;

  return date.toLocaleDateString();
}

function mapJourneyStatus(status: string): JourneyStatus {
  if (status === "active") return "active";
  if (status === "paused") return "paused";
  return "draft";
}

function mapApiJourney(item: ApiJourney): Journey {
  const nodes = item.nodes ?? [];

  const channels = new Set<JourneyChannel>();

  nodes.forEach((node) => {
    const config =
      node.config && typeof node.config === "object"
        ? (node.config as Record<string, unknown>)
        : {};

    if (node.type === "whatsapp") {
      channels.add(
        config.provider === "meta"
          ? "meta_whatsapp"
          : "baileys_whatsapp"
      );
    }

    if (node.type === "email") channels.add("email");
    if (node.type === "sms") channels.add("sms");
  });

  const triggerNode = nodes.find((node) => node.type === "trigger");

  return {
    id: item.id,
    name: item.name,
    description: item.description ?? "",
    trigger:
      triggerNode?.title ??
      triggerNode?.description ??
      "No trigger configured",
    channels: Array.from(channels),
    enrolled: 0,
    completed: 0,
    status: mapJourneyStatus(item.status),
    updatedAt: item.updatedAt,
    updatedLabel: formatUpdatedLabel(item.updatedAt),
  };
}

export default function JourneyPage() {
  const [journeys, setJourneys] = useState<Journey[]>([]);
  const [status, setStatus] = useState<JourneyStatusFilter>("all");
  const [search, setSearch] = useState("");
  const [channel, setChannel] = useState<JourneyChannelFilter>("all");
  const [sort, setSort] = useState<JourneySortOption>("updated_desc");
  const [currentPage, setCurrentPage] = useState(1);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch journeys from MySQL through the API.

const fetchJourneys = useCallback(async () => {
  try {
    setLoading(true);
    setError(null);

    const response = await fetch("/api/journeys", {
      cache: "no-store",
    });

    const result = await response.json();

    if (!response.ok || !result.success) {
      throw new Error(result.message || "Unable to load journeys.");
    }

    setJourneys(
      (result.data as ApiJourney[]).map(mapApiJourney)
    );
  } catch (err) {
    console.error("Journey loading error:", err);

    setError(
      err instanceof Error
        ? err.message
        : "Something went wrong while loading journeys."
    );
  } finally {
    setLoading(false);
  }
}, []);


  useEffect(() => {
    fetchJourneys();
  }, [fetchJourneys]);

  const filteredJourneys = useMemo(() => {
    const normalizedSearch = search.trim().toLowerCase();

    const result = journeys.filter((journey) => {
      const matchesStatus =
        status === "all" || journey.status === status;

      const matchesChannel =
        channel === "all" || journey.channels.includes(channel);

      const matchesSearch =
        normalizedSearch.length === 0 ||
        journey.name.toLowerCase().includes(normalizedSearch) ||
        journey.trigger.toLowerCase().includes(normalizedSearch) ||
        journey.description.toLowerCase().includes(normalizedSearch);

      return matchesStatus && matchesChannel && matchesSearch;
    });

    return [...result].sort((a, b) => {
      switch (sort) {
        case "updated_asc":
          return (
            new Date(a.updatedAt).getTime() -
            new Date(b.updatedAt).getTime()
          );

        case "name_asc":
          return a.name.localeCompare(b.name);

        case "enrolled_desc":
          return b.enrolled - a.enrolled;

        case "updated_desc":
        default:
          return (
            new Date(b.updatedAt).getTime() -
            new Date(a.updatedAt).getTime()
          );
      }
    });
  }, [journeys, status, search, channel, sort]);

  const totalPages = Math.max(
    1,
    Math.ceil(filteredJourneys.length / PAGE_SIZE)
  );

  const safePage = Math.min(currentPage, totalPages);

  const visibleJourneys = filteredJourneys.slice(
    (safePage - 1) * PAGE_SIZE,
    safePage * PAGE_SIZE
  );

  const handleStatusChange = (value: JourneyStatusFilter) => {
    setStatus(value);
    setCurrentPage(1);
  };

  const handleSearchChange = (value: string) => {
    setSearch(value);
    setCurrentPage(1);
  };

  const handleChannelChange = (value: JourneyChannelFilter) => {
    setChannel(value);
    setCurrentPage(1);
  };

  const handleSortChange = (value: JourneySortOption) => {
    setSort(value);
    setCurrentPage(1);
  };

  // Duplicate journey using the database.
 
const handleDuplicate = async (journey: Journey) => {
  try {
    // 1. Fetch original journey
    const detailResponse = await fetch(
      `/api/journeys/${journey.id}`,
      { cache: "no-store" }
    );

    const detailResult = await detailResponse.json();

    if (!detailResponse.ok || !detailResult.success) {
      throw new Error(
        detailResult.message || "Could not load original journey."
      );
    }

    const original = detailResult.data;

    // 2. Generate new IDs for every node
    const idMap = new Map<string, string>(
      (original.nodes ?? []).map((node: any) => [
        node.id,
        `node-${crypto.randomUUID()}`,
      ])
    );

    // 3. Duplicate nodes
    const duplicatedNodes = (original.nodes ?? []).map((node: any) => ({
      id: idMap.get(node.id)!,
      type: node.type,
      position: {
        x: node.positionX,
        y: node.positionY,
      },
      data: {
        title: node.title,
        description: node.description,
        config: node.config,
        actionId: node.actionId,
        category: node.category,
        icon: node.icon,
        color: node.color,
      },
    }));

    // 4. Duplicate edges with new node IDs
    const duplicatedEdges = (original.edges ?? []).map((edge: any) => ({
      id: `edge-${crypto.randomUUID()}`,
      source: idMap.get(edge.sourceNodeId),
      target: idMap.get(edge.targetNodeId),
      sourceHandle: edge.sourceHandle,
      targetHandle: edge.targetHandle,
      type: edge.edgeType,
      label: edge.label,
      animated: edge.animated,
    }));

    // 5. Save duplicated journey in MySQL
    const response = await fetch("/api/journeys", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        name: `${journey.name} (Copy)`,
        description: original.description ?? "",
        status: "draft",
        nodes: duplicatedNodes,
        edges: duplicatedEdges,
      }),
    });

    const result = await response.json();

    if (!response.ok || !result.success) {
      throw new Error(
        result.message || "Could not duplicate journey."
      );
    }

    // 6. Refresh listing
    await fetchJourneys();

    setStatus("all");
    setChannel("all");
    setSearch("");
    setSort("updated_desc");
    setCurrentPage(1);

    window.alert("Journey duplicated successfully!");
  } catch (err) {
    console.error("Duplicate journey error:", err);

    window.alert(
      err instanceof Error
        ? err.message
        : "Could not duplicate journey."
    );
  }
};


  // Update journey status in the database.
  const handleToggleStatus = async (journey: Journey) => {
    const newStatus = journey.status === "active" ? "paused" : "active";

    try {
      const response = await fetch(`/api/journeys/${journey.id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          status: newStatus,
        }),
      });

      const result = await response.json();

      if (!response.ok || !result.success) {
        throw new Error(result.message || "Could not update journey status.");
      }

      await fetchJourneys();
    } catch (err) {
      console.error("Journey status update error:", err);
      window.alert(
        err instanceof Error ? err.message : "Could not update status."
      );
    }
  };

  // Delete journey from the database.
  const handleDelete = async (journey: Journey) => {
    const confirmed = window.confirm(
      `Delete "${journey.name}"? This action cannot be undone.`
    );

    if (!confirmed) return;

    try {
      const response = await fetch(`/api/journeys/${journey.id}`, {
        method: "DELETE",
      });

      const result = await response.json();

      if (!response.ok || !result.success) {
        throw new Error(result.message || "Could not delete journey.");
      }

      setJourneys((current) =>
        current.filter((item) => item.id !== journey.id)
      );

      setCurrentPage(1);
    } catch (err) {
      console.error("Journey deletion error:", err);
      window.alert(
        err instanceof Error ? err.message : "Could not delete journey."
      );
    }
  };

  return (
    <div className="mx-auto w-full max-w-[1600px]">
      <JourneyHeader />

      <JourneyTabs activeTab="journeys" />

      <JourneyStats journeys={journeys} />

      <div className="crm-card p-4 md:p-5">
        <div className="mb-4 flex flex-col justify-between gap-1 sm:flex-row sm:items-center">
          <div>
            <h2 className="text-[15px] font-bold text-crm-heading">
              My Journeys
            </h2>

            <p className="mt-0.5 text-[11px] text-crm-muted">
              Manage and track your customer automation workflows.
            </p>
          </div>

          <span className="text-[11px] text-crm-muted">
            {journeys.length} total{" "}
            {journeys.length === 1 ? "journey" : "journeys"}
          </span>
        </div>

        <JourneyFilters
          status={status}
          onStatusChange={handleStatusChange}
          search={search}
          onSearchChange={handleSearchChange}
          channel={channel}
          onChannelChange={handleChannelChange}
          sort={sort}
          onSortChange={handleSortChange}
        />

        {loading ? (
          <div className="py-12 text-center text-sm text-crm-muted">
            Loading journeys...
          </div>
        ) : error ? (
          <div className="py-10 text-center">
            <p className="text-sm text-red-500">{error}</p>

            <button
              type="button"
              onClick={fetchJourneys}
              className="mt-3 rounded-lg border border-crm-border px-4 py-2 text-xs font-semibold text-crm-text hover:bg-crm-primary-light"
            >
              Try again
            </button>
          </div>
        ) : (
          <>
            <JourneyTable
              journeys={visibleJourneys}
              onDuplicate={handleDuplicate}
              onToggleStatus={handleToggleStatus}
              onDelete={handleDelete}
            />

            <JourneyPagination
              currentPage={safePage}
              totalPages={totalPages}
              pageSize={PAGE_SIZE}
              totalItems={filteredJourneys.length}
              onPageChange={setCurrentPage}
            />
          </>
        )}
      </div>
    </div>
  );
}
