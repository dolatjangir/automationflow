
"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";

type ExecutionStatus =
  | "queued"
  | "running"
  | "completed"
  | "failed"
  | "cancelled";

interface ExecutionLog {
  id: string;
  level: "info" | "warning" | "error";
  message: string;
  nodeId: string | null;
  createdAt: string;
}

interface Execution {
  id: string;
  journeyId: string;
  contactId: string | null;
  status: ExecutionStatus;
  isTest: boolean;
  currentNodeId: string | null;
  triggerData: Record<string, unknown> | null;
  errorMessage: string | null;
  retryCount: number;
  startedAt: string | null;
  completedAt: string | null;
  createdAt: string;
  updatedAt: string;
  logs: ExecutionLog[];
}

interface Journey {
  id: string;
  name: string;
}

interface ApiResponse {
  success: boolean;
  message?: string;
  data?: {
    journey: Journey;
    executions: Execution[];
    total: number;
  };
}

type FilterStatus = "all" | ExecutionStatus;
type FilterMode = "all" | "test" | "live";

const statusConfig: Record<
  ExecutionStatus,
  { label: string; color: string; dot: string }
> = {
  queued: {
    label: "Queued",
    color: "bg-amber-50 text-amber-700 border-amber-200",
    dot: "bg-amber-500",
  },
  running: {
    label: "Running",
    color: "bg-blue-50 text-blue-700 border-blue-200",
    dot: "bg-blue-500",
  },
  completed: {
    label: "Completed",
    color: "bg-emerald-50 text-emerald-700 border-emerald-200",
    dot: "bg-emerald-500",
  },
  failed: {
    label: "Failed",
    color: "bg-red-50 text-red-700 border-red-200",
    dot: "bg-red-500",
  },
  cancelled: {
    label: "Cancelled",
    color: "bg-gray-100 text-gray-600 border-gray-200",
    dot: "bg-gray-400",
  },
};

function formatDate(value: string | null) {
  if (!value) return "—";

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) return "—";

  return date.toLocaleString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function getDuration(execution: Execution) {
  if (!execution.startedAt) return "—";

  const start = new Date(execution.startedAt).getTime();

  const end = execution.completedAt
    ? new Date(execution.completedAt).getTime()
    : execution.status === "running"
      ? Date.now()
      : null;

  if (!end || Number.isNaN(start) || Number.isNaN(end)) {
    return "—";
  }

  const seconds = Math.max(0, Math.round((end - start) / 1000));

  if (seconds < 60) return `${seconds}s`;

  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = seconds % 60;

  return `${minutes}m ${remainingSeconds}s`;
}

function getInitials(value: string) {
  return value
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0])
    .join("")
    .toUpperCase();
}

function StatusBadge({ status }: { status: ExecutionStatus }) {
  const config = statusConfig[status] ?? statusConfig.queued;

  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs font-medium ${config.color}`}
    >
      <span className={`h-1.5 w-1.5 rounded-full ${config.dot}`} />
      {config.label}
    </span>
  );
}

function SummaryCard({
  title,
  value,
  icon,
  iconClass,
}: {
  title: string;
  value: number;
  icon: React.ReactNode;
  iconClass: string;
}) {
  return (
    <div className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
      <div className="flex items-center justify-between">
        <p className="text-sm font-medium text-gray-500">{title}</p>
        <div
          className={`flex h-9 w-9 items-center justify-center rounded-lg ${iconClass}`}
        >
          {icon}
        </div>
      </div>
      <p className="mt-3 text-2xl font-semibold text-gray-900">{value}</p>
    </div>
  );
}

function LogLevelBadge({ level }: { level: ExecutionLog["level"] }) {
  const styles = {
    info: "bg-blue-50 text-blue-700",
    warning: "bg-amber-50 text-amber-700",
    error: "bg-red-50 text-red-700",
  };

  return (
    <span
      className={`rounded-md px-2 py-0.5 text-[10px] font-semibold uppercase ${styles[level]}`}
    >
      {level}
    </span>
  );
}

export default function ExecutionHistoryPageContent() {
  const params = useParams();
  const journeyId = params.id as string;

  const [journey, setJourney] = useState<Journey | null>(null);
  const [executions, setExecutions] = useState<Execution[]>([]);
  const [total, setTotal] = useState(0);

  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState("");

  const [statusFilter, setStatusFilter] =
    useState<FilterStatus>("all");
  const [modeFilter, setModeFilter] =
    useState<FilterMode>("all");
  const [search, setSearch] = useState("");
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const fetchExecutions = useCallback(
    async (showLoader = true) => {
      if (!journeyId) return;

      if (showLoader) {
        setLoading(true);
      } else {
        setRefreshing(true);
      }

      setError("");

      try {
        const response = await fetch(
          `/api/journeys/${journeyId}/executions`,
          {
            method: "GET",
            headers: {
              "Content-Type": "application/json",
            },
            cache: "no-store",
          }
        );

        const result: ApiResponse = await response.json();

        if (!response.ok || !result.success || !result.data) {
          throw new Error(
            result.message || "Unable to load execution history."
          );
        }

        setJourney(result.data.journey);
        setExecutions(result.data.executions ?? []);
        setTotal(result.data.total ?? 0);
      } catch (err) {
        setError(
          err instanceof Error
            ? err.message
            : "Something went wrong while loading executions."
        );
      } finally {
        setLoading(false);
        setRefreshing(false);
      }
    },
    [journeyId]
  );

  useEffect(() => {
    fetchExecutions();
  }, [fetchExecutions]);

  const stats = useMemo(() => {
    return {
      completed: executions.filter((item) => item.status === "completed")
        .length,
      running: executions.filter((item) => item.status === "running")
        .length,
      queued: executions.filter((item) => item.status === "queued").length,
      failed: executions.filter((item) => item.status === "failed").length,
    };
  }, [executions]);

  const filteredExecutions = useMemo(() => {
    return executions.filter((execution) => {
      const matchesStatus =
        statusFilter === "all" || execution.status === statusFilter;

      const matchesMode =
        modeFilter === "all" ||
        (modeFilter === "test" && execution.isTest) ||
        (modeFilter === "live" && !execution.isTest);

      const searchText = search.trim().toLowerCase();

      const matchesSearch =
        !searchText ||
        execution.id.toLowerCase().includes(searchText) ||
        JSON.stringify(execution.triggerData ?? {})
          .toLowerCase()
          .includes(searchText);

      return matchesStatus && matchesMode && matchesSearch;
    });
  }, [executions, statusFilter, modeFilter, search]);

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="mx-auto max-w-7xl space-y-6 px-4 py-6 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
          <div>
            <div className="mb-2 flex items-center gap-2 text-sm text-gray-500">
              <Link
                href="/journey"
                className="transition hover:text-teal-700"
              >
                Journeys
              </Link>
              <span>/</span>
              <Link
                href={`/journey/builder/${journeyId}`}
                className="transition hover:text-teal-700"
              >
                Builder
              </Link>
              <span>/</span>
              <span className="text-gray-800">Execution History</span>
            </div>

            <h1 className="text-2xl font-bold tracking-tight text-gray-900">
              Execution History
            </h1>

            <p className="mt-1 text-sm text-gray-500">
              {journey?.name || "Journey"} · View execution results and logs.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={() => fetchExecutions(false)}
              disabled={refreshing || loading}
              className="inline-flex items-center gap-2 rounded-lg border border-gray-200 bg-white px-4 py-2.5 text-sm font-medium text-gray-700 shadow-sm transition hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-60"
            >
              <svg
                className={`h-4 w-4 ${refreshing ? "animate-spin" : ""}`}
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
              >
                <path
                  d="M20 7v5h-5M4 17v-5h5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
                <path
                  d="M5.5 9a7 7 0 0 1 11.8-2L20 12M4 12l2.7 5a7 7 0 0 0 11.8-2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
              Refresh
            </button>

            <Link
              href={`/journey/builder/${journeyId}`}
              className="inline-flex items-center gap-2 rounded-lg bg-teal-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-teal-700"
            >
              <svg
                className="h-4 w-4"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
              >
                <path
                  d="M15 18l-6-6 6-6"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
              Back to Builder
            </Link>
          </div>
        </div>

        {/* Error */}
        {error && (
          <div className="flex items-start justify-between gap-4 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
            <div className="flex items-start gap-2">
              <span className="font-semibold">Error:</span>
              <span>{error}</span>
            </div>
            <button
              type="button"
              onClick={() => fetchExecutions()}
              className="shrink-0 font-semibold underline"
            >
              Try again
            </button>
          </div>
        )}

        {/* Summary cards */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <SummaryCard
            title="Total Executions"
            value={total}
            icon={
              <svg
                className="h-5 w-5"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.8"
              >
                <path
                  d="M8 5h8M8 9h8M8 13h5M6 3h12a2 2 0 0 1 2 2v14H4V5a2 2 0 0 1 2-2Z"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            }
            iconClass="bg-gray-100 text-gray-600"
          />

          <SummaryCard
            title="Completed"
            value={stats.completed}
            icon={
              <svg
                className="h-5 w-5"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
              >
                <path
                  d="m5 12 4 4L19 6"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            }
            iconClass="bg-emerald-50 text-emerald-600"
          />

          <SummaryCard
            title="Running / Queued"
            value={stats.running + stats.queued}
            icon={
              <svg
                className="h-5 w-5"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.8"
              >
                <circle cx="12" cy="12" r="9" />
                <path
                  d="M12 7v5l3 2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            }
            iconClass="bg-blue-50 text-blue-600"
          />

          <SummaryCard
            title="Failed"
            value={stats.failed}
            icon={
              <svg
                className="h-5 w-5"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.8"
              >
                <path
                  d="m15 9-6 6m0-6 6 6"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
                <circle cx="12" cy="12" r="9" />
              </svg>
            }
            iconClass="bg-red-50 text-red-600"
          />
        </div>

        {/* Execution list */}
        <div className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm">
          <div className="flex flex-col justify-between gap-4 border-b border-gray-200 p-5 lg:flex-row lg:items-center">
            <div>
              <h2 className="text-base font-semibold text-gray-900">
                All Executions
              </h2>
              <p className="mt-1 text-sm text-gray-500">
                Review each execution and its step-by-step logs.
              </p>
            </div>

            <div className="flex flex-col gap-2 sm:flex-row">
              <div className="relative">
                <svg
                  className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                >
                  <circle cx="11" cy="11" r="7" />
                  <path d="m20 20-4-4" strokeLinecap="round" />
                </svg>
                <input
                  type="text"
                  value={search}
                  onChange={(event) => setSearch(event.target.value)}
                  placeholder="Search execution..."
                  className="w-full rounded-lg border border-gray-200 py-2 pl-9 pr-3 text-sm outline-none transition focus:border-teal-500 focus:ring-2 focus:ring-teal-100 sm:w-56"
                />
              </div>

              <select
                value={statusFilter}
                onChange={(event) =>
                  setStatusFilter(event.target.value as FilterStatus)
                }
                className="rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm text-gray-700 outline-none focus:border-teal-500"
              >
                <option value="all">All Statuses</option>
                <option value="queued">Queued</option>
                <option value="running">Running</option>
                <option value="completed">Completed</option>
                <option value="failed">Failed</option>
                <option value="cancelled">Cancelled</option>
              </select>

              <select
                value={modeFilter}
                onChange={(event) =>
                  setModeFilter(event.target.value as FilterMode)
                }
                className="rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm text-gray-700 outline-none focus:border-teal-500"
              >
                <option value="all">All Modes</option>
                <option value="test">Test Only</option>
                <option value="live">Live Only</option>
              </select>
            </div>
          </div>

          {loading ? (
            <div className="flex min-h-64 flex-col items-center justify-center gap-3">
              <div className="h-8 w-8 animate-spin rounded-full border-2 border-gray-200 border-t-teal-600" />
              <p className="text-sm text-gray-500">
                Loading execution history...
              </p>
            </div>
          ) : filteredExecutions.length === 0 ? (
            <div className="flex min-h-64 flex-col items-center justify-center px-4 text-center">
              <div className="mb-3 flex h-14 w-14 items-center justify-center rounded-full bg-gray-100 text-gray-400">
                <svg
                  className="h-7 w-7"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.6"
                >
                  <path
                    d="M8 5h8M8 9h8M8 13h5M6 3h12a2 2 0 0 1 2 2v16H4V5a2 2 0 0 1 2-2Z"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </div>

              <h3 className="font-semibold text-gray-900">
                No executions found
              </h3>
              <p className="mt-1 max-w-sm text-sm text-gray-500">
                {executions.length === 0
                  ? "This journey has no execution history yet. Run a test from the Journey Builder to see it here."
                  : "No executions match your current filters. Try changing your search or filters."}
              </p>

              {executions.length === 0 && (
                <Link
                  href={`/journey/builder/${journeyId}`}
                  className="mt-4 rounded-lg bg-teal-600 px-4 py-2 text-sm font-semibold text-white hover:bg-teal-700"
                >
                  Open Journey Builder
                </Link>
              )}
            </div>
          ) : (
            <>
              {/* Desktop table */}
              <div className="hidden overflow-x-auto md:block">
                <table className="w-full text-left">
                  <thead className="bg-gray-50 text-xs font-semibold uppercase tracking-wider text-gray-500">
                    <tr>
                      <th className="px-5 py-3">Execution</th>
                      <th className="px-5 py-3">Status</th>
                      <th className="px-5 py-3">Mode</th>
                      <th className="px-5 py-3">Created At</th>
                      <th className="px-5 py-3">Duration</th>
                      <th className="px-5 py-3">Logs</th>
                      <th className="px-5 py-3 text-right">Details</th>
                    </tr>
                  </thead>

                  <tbody className="divide-y divide-gray-100">
                    {filteredExecutions.map((execution) => {
                      const expanded = expandedId === execution.id;

                      return (
                        <>
                          <tr
                            key={execution.id}
                            className="transition hover:bg-gray-50/70"
                          >
                            <td className="px-5 py-4">
                              <div className="flex items-center gap-3">
                                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-teal-50 text-teal-700">
                                  <svg
                                    className="h-4 w-4"
                                    viewBox="0 0 24 24"
                                    fill="none"
                                    stroke="currentColor"
                                    strokeWidth="1.8"
                                  >
                                    <path
                                      d="M5 12h4l3-8 4 16 3-8h2"
                                      strokeLinecap="round"
                                      strokeLinejoin="round"
                                    />
                                  </svg>
                                </div>

                                <div className="min-w-0">
                                  <p className="font-medium text-gray-900">
                                    #{execution.id.slice(-8)}
                                  </p>
                                  <p className="text-xs text-gray-400">
                                    {execution.contactId
                                      ? `Contact: ${execution.contactId}`
                                      : "No linked contact"}
                                  </p>
                                </div>
                              </div>
                            </td>

                            <td className="px-5 py-4">
                              <StatusBadge status={execution.status} />
                            </td>

                            <td className="px-5 py-4">
                              <span
                                className={`rounded-md px-2.5 py-1 text-xs font-medium ${
                                  execution.isTest
                                    ? "bg-violet-50 text-violet-700"
                                    : "bg-teal-50 text-teal-700"
                                }`}
                              >
                                {execution.isTest ? "Test" : "Live"}
                              </span>
                            </td>

                            <td className="px-5 py-4 text-sm text-gray-600">
                              {formatDate(execution.createdAt)}
                            </td>

                            <td className="px-5 py-4 text-sm text-gray-600">
                              {getDuration(execution)}
                            </td>

                            <td className="px-5 py-4 text-sm text-gray-600">
                              {execution.logs?.length ?? 0}
                            </td>

                            <td className="px-5 py-4 text-right">
                              <button
                                type="button"
                                onClick={() =>
                                  setExpandedId(
                                    expanded ? null : execution.id
                                  )
                                }
                                className="inline-flex items-center gap-1 rounded-lg px-3 py-2 text-sm font-medium text-teal-700 transition hover:bg-teal-50"
                              >
                                {expanded ? "Hide Logs" : "View Logs"}
                                <svg
                                  className={`h-4 w-4 transition-transform ${
                                    expanded ? "rotate-180" : ""
                                  }`}
                                  viewBox="0 0 24 24"
                                  fill="none"
                                  stroke="currentColor"
                                  strokeWidth="2"
                                >
                                  <path
                                    d="m6 9 6 6 6-6"
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                  />
                                </svg>
                              </button>
                            </td>
                          </tr>

                          {expanded && (
                            <tr key={`${execution.id}-details`}>
                              <td
                                colSpan={7}
                                className="bg-gray-50/80 px-5 py-5"
                              >
                                <ExecutionDetails execution={execution} />
                              </td>
                            </tr>
                          )}
                        </>
                      );
                    })}
                  </tbody>
                </table>
              </div>

              {/* Mobile cards */}
              <div className="space-y-3 p-4 md:hidden">
                {filteredExecutions.map((execution) => {
                  const expanded = expandedId === execution.id;

                  return (
                    <div
                      key={execution.id}
                      className="rounded-xl border border-gray-200 p-4"
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div className="min-w-0">
                          <p className="font-semibold text-gray-900">
                            #{execution.id.slice(-8)}
                          </p>
                          <p className="mt-1 text-xs text-gray-500">
                            {formatDate(execution.createdAt)}
                          </p>
                        </div>
                        <StatusBadge status={execution.status} />
                      </div>

                      <div className="mt-3 flex flex-wrap items-center gap-2 text-xs">
                        <span className="rounded-md bg-gray-100 px-2 py-1 text-gray-600">
                          {execution.isTest ? "Test" : "Live"}
                        </span>
                        <span className="text-gray-500">
                          {execution.logs?.length ?? 0} logs
                        </span>
                        <span className="text-gray-500">
                          {getDuration(execution)}
                        </span>
                      </div>

                      <button
                        type="button"
                        onClick={() =>
                          setExpandedId(expanded ? null : execution.id)
                        }
                        className="mt-3 text-sm font-semibold text-teal-700"
                      >
                        {expanded ? "Hide Details ↑" : "View Details ↓"}
                      </button>

                      {expanded && (
                        <div className="mt-4 border-t border-gray-100 pt-4">
                          <ExecutionDetails execution={execution} />
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </>
          )}

          {!loading && filteredExecutions.length > 0 && (
            <div className="flex flex-col justify-between gap-2 border-t border-gray-200 px-5 py-3 text-xs text-gray-500 sm:flex-row sm:items-center">
              <span>
                Showing {filteredExecutions.length} of {executions.length}{" "}
                loaded executions
              </span>
              <span>Total records: {total}</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function ExecutionDetails({
  execution,
}: {
  execution: Execution;
}) {
  const triggerData = execution.triggerData ?? {};
  const logs = execution.logs ?? [];

  return (
    <div className="space-y-5">
      {/* Execution information */}
      <div>
        <h3 className="mb-3 text-sm font-semibold text-gray-900">
          Execution Information
        </h3>

        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
          <InfoItem label="Execution ID" value={execution.id} />
          <InfoItem
            label="Started At"
            value={formatDate(execution.startedAt)}
          />
          <InfoItem
            label="Completed At"
            value={formatDate(execution.completedAt)}
          />
          <InfoItem
            label="Retry Count"
            value={String(execution.retryCount ?? 0)}
          />
        </div>
      </div>

      {/* Trigger data */}
      <div>
        <h3 className="mb-3 text-sm font-semibold text-gray-900">
          Trigger Data
        </h3>

        {Object.keys(triggerData).length > 0 ? (
          <div className="overflow-hidden rounded-lg border border-gray-200 bg-white">
            <div className="divide-y divide-gray-100">
              {Object.entries(triggerData).map(([key, value]) => (
                <div
                  key={key}
                  className="grid grid-cols-1 gap-1 px-4 py-3 sm:grid-cols-3 sm:gap-4"
                >
                  <span className="text-xs font-medium text-gray-500">
                    {key}
                  </span>
                  <span className="break-words text-sm text-gray-800 sm:col-span-2">
                    {typeof value === "object" && value !== null
                      ? JSON.stringify(value)
                      : String(value ?? "—")}
                  </span>
                </div>
              ))}
            </div>
          </div>
        ) : (
          <p className="rounded-lg border border-gray-200 bg-white p-4 text-sm text-gray-500">
            No trigger data available.
          </p>
        )}
      </div>

      {/* Error */}
      {execution.errorMessage && (
        <div className="rounded-lg border border-red-200 bg-red-50 p-4">
          <h3 className="text-sm font-semibold text-red-800">
            Execution Error
          </h3>
          <p className="mt-1 whitespace-pre-wrap text-sm text-red-700">
            {execution.errorMessage}
          </p>
        </div>
      )}

      {/* Logs */}
      <div>
        <div className="mb-3 flex items-center justify-between gap-2">
          <h3 className="text-sm font-semibold text-gray-900">
            Execution Logs
          </h3>
          <span className="text-xs text-gray-500">
            {logs.length} {logs.length === 1 ? "entry" : "entries"}
          </span>
        </div>

        {logs.length > 0 ? (
          <div className="space-y-0 rounded-lg border border-gray-200 bg-white p-4">
            {logs.map((log, index) => (
              <div
                key={log.id}
                className="relative flex gap-3 pb-5 last:pb-0"
              >
                <div className="flex flex-col items-center">
                  <div
                    className={`mt-1 h-2.5 w-2.5 shrink-0 rounded-full ${
                      log.level === "error"
                        ? "bg-red-500"
                        : log.level === "warning"
                          ? "bg-amber-500"
                          : "bg-teal-500"
                    }`}
                  />
                  {index !== logs.length - 1 && (
                    <div className="mt-1 w-px flex-1 bg-gray-200" />
                  )}
                </div>

                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <LogLevelBadge level={log.level} />
                    <span className="text-xs text-gray-400">
                      {formatDate(log.createdAt)}
                    </span>
                  </div>

                  <p className="mt-1 break-words text-sm leading-6 text-gray-700">
                    {log.message}
                  </p>

                  {log.nodeId && (
                    <p className="mt-1 break-all text-xs text-gray-400">
                      Node ID: {log.nodeId}
                    </p>
                  )}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="rounded-lg border border-gray-200 bg-white p-4 text-sm text-gray-500">
            No execution logs available.
          </p>
        )}
      </div>
    </div>
  );
}

function InfoItem({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  return (
    <div className="rounded-lg border border-gray-200 bg-white p-3">
      <p className="text-xs text-gray-500">{label}</p>
      <p className="mt-1 break-all text-sm font-medium text-gray-800">
        {value}
      </p>
    </div>
  );
}

