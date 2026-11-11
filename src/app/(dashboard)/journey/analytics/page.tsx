
"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import {
  Activity,
  AlertCircle,
  ArrowLeft,
  CheckCircle2,
  Clock3,
  RefreshCw,
  TrendingUp,
  Workflow,
  FlaskConical,
  Radio,
} from "lucide-react";

interface AnalyticsSummary {
  totalExecutions: number;
  testExecutions: number;
  completed: number;
  failed: number;
  running: number;
  queued: number;
  cancelled: number;
  successRate: number;
  activeJourneys: number;
  totalJourneys: number;
}

interface TrendItem {
  date: string;
  label: string;
  real: number;
  test: number;
  completed: number;
  failed: number;
}

interface JourneyPerformance {
  id: string;
  name: string;
  status: string;
  totalExecutions: number;
  completed: number;
  failed: number;
  successRate: number;
}

interface AnalyticsData {
  summary: AnalyticsSummary;
  modeBreakdown: {
    real: number;
    test: number;
  };
  trend: TrendItem[];
  journeys: JourneyPerformance[];
  generatedAt: string;
}

interface AnalyticsResponse {
  success: boolean;
  message?: string;
  data?: AnalyticsData;
}

function formatNumber(value: number) {
  return value.toLocaleString("en-IN");
}

function formatDate(value: string) {
  return new Date(value).toLocaleString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function StatCard({
  title,
  value,
  subtitle,
  icon: Icon,
  iconClass,
}: {
  title: string;
  value: string;
  subtitle: string;
  icon: typeof Activity;
  iconClass: string;
}) {
  return (
    <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
      <div className="flex items-center justify-between">
        <p className="text-sm font-medium text-gray-500">{title}</p>
        <div className={`rounded-lg p-2.5 ${iconClass}`}>
          <Icon size={20} />
        </div>
      </div>

      <p className="mt-4 text-3xl font-bold tracking-tight text-gray-900">
        {value}
      </p>

      <p className="mt-1 text-xs text-gray-500">{subtitle}</p>
    </div>
  );
}

function EmptyState({ message }: { message: string }) {
  return (
    <div className="flex min-h-40 flex-col items-center justify-center text-center">
      <Activity className="mb-2 text-gray-300" size={28} />
      <p className="text-sm text-gray-500">{message}</p>
    </div>
  );
}

export default function JourneyAnalyticsPage() {
  const [data, setData] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState("");

  const fetchAnalytics = useCallback(async (showLoader = true) => {
    if (showLoader) {
      setLoading(true);
    } else {
      setRefreshing(true);
    }

    setError("");

    try {
      const response = await fetch("/api/journeys/analytics", {
        method: "GET",
        cache: "no-store",
      });

      const result: AnalyticsResponse = await response.json();

      if (!response.ok || !result.success || !result.data) {
        throw new Error(
          result.message || "Unable to load journey analytics."
        );
      }

      setData(result.data);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Something went wrong."
      );
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchAnalytics();
  }, [fetchAnalytics]);

  const maxTrendValue = useMemo(() => {
    if (!data?.trend.length) return 1;

    return Math.max(
      1,
      ...data.trend.map((item) => item.real + item.test)
    );
  }, [data]);

  const maxJourneyValue = useMemo(() => {
    if (!data?.journeys.length) return 1;

    return Math.max(
      1,
      ...data.journeys.map((item) => item.totalExecutions)
    );
  }, [data]);

  if (loading) {
    return (
      <div className="flex min-h-[70vh] flex-col items-center justify-center gap-3 bg-gray-50">
        <div className="h-9 w-9 animate-spin rounded-full border-2 border-gray-200 border-t-teal-600" />
        <p className="text-sm text-gray-500">
          Loading journey analytics...
        </p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="mx-auto max-w-7xl space-y-6 px-4 py-6 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
          <div>
            <Link
              href="/journey"
              className="mb-3 inline-flex items-center gap-1.5 text-sm text-gray-500 transition hover:text-teal-700"
            >
              <ArrowLeft size={15} />
              Back to Journeys
            </Link>

            <h1 className="text-2xl font-bold tracking-tight text-gray-900">
              Journey Analytics
            </h1>

            <p className="mt-1 text-sm text-gray-500">
              Monitor your journey execution performance and activity.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => fetchAnalytics(false)}
              disabled={refreshing}
              className="inline-flex items-center gap-2 rounded-lg border border-gray-200 bg-white px-4 py-2.5 text-sm font-medium text-gray-700 shadow-sm transition hover:bg-gray-50 disabled:opacity-60"
            >
              <RefreshCw
                size={15}
                className={refreshing ? "animate-spin" : ""}
              />
              Refresh
            </button>

            <Link
              href="/journey"
              className="rounded-lg bg-teal-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-teal-700"
            >
              View Journeys
            </Link>
          </div>
        </div>

        {/* Error */}
        {error && (
          <div className="flex flex-col justify-between gap-3 rounded-xl border border-red-200 bg-red-50 p-4 sm:flex-row sm:items-center">
            <div className="flex items-center gap-2 text-sm text-red-700">
              <AlertCircle size={18} />
              {error}
            </div>

            <button
              type="button"
              onClick={() => fetchAnalytics()}
              className="text-sm font-semibold text-red-700 underline"
            >
              Try again
            </button>
          </div>
        )}

        {data && (
          <>
            {/* Summary cards */}
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
              <StatCard
                title="Real Executions"
                value={formatNumber(data.summary.totalExecutions)}
                subtitle="Actual execution records, excluding tests"
                icon={Activity}
                iconClass="bg-blue-50 text-blue-600"
              />

              <StatCard
                title="Success Rate"
                value={`${data.summary.successRate}%`}
                subtitle={`${formatNumber(data.summary.completed)} completed executions`}
                icon={TrendingUp}
                iconClass="bg-emerald-50 text-emerald-600"
              />

              <StatCard
                title="Failed Executions"
                value={formatNumber(data.summary.failed)}
                subtitle="Real executions with failed status"
                icon={AlertCircle}
                iconClass="bg-red-50 text-red-600"
              />

              <StatCard
                title="Active Journeys"
                value={formatNumber(data.summary.activeJourneys)}
                subtitle={`${formatNumber(data.summary.totalJourneys)} total journeys`}
                icon={Workflow}
                iconClass="bg-violet-50 text-violet-600"
              />
            </div>

            {/* Status overview */}
            <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
              <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm lg:col-span-2">
                <div className="mb-5 flex items-center justify-between">
                  <div>
                    <h2 className="font-semibold text-gray-900">
                      Execution Status
                    </h2>
                    <p className="mt-1 text-xs text-gray-500">
                      Breakdown of real execution records
                    </p>
                  </div>
                  <Activity className="text-gray-400" size={19} />
                </div>

                <div className="grid grid-cols-2 gap-3 sm:grid-cols-5">
                  {[
                    {
                      label: "Completed",
                      value: data.summary.completed,
                      color: "bg-emerald-500",
                      text: "text-emerald-700",
                    },
                    {
                      label: "Running",
                      value: data.summary.running,
                      color: "bg-blue-500",
                      text: "text-blue-700",
                    },
                    {
                      label: "Queued",
                      value: data.summary.queued,
                      color: "bg-amber-500",
                      text: "text-amber-700",
                    },
                    {
                      label: "Failed",
                      value: data.summary.failed,
                      color: "bg-red-500",
                      text: "text-red-700",
                    },
                    {
                      label: "Cancelled",
                      value: data.summary.cancelled,
                      color: "bg-gray-400",
                      text: "text-gray-600",
                    },
                  ].map((item) => (
                    <div
                      key={item.label}
                      className="rounded-lg border border-gray-100 bg-gray-50 p-3"
                    >
                      <div className="flex items-center gap-2">
                        <span
                          className={`h-2 w-2 rounded-full ${item.color}`}
                        />
                        <span className="text-xs text-gray-500">
                          {item.label}
                        </span>
                      </div>
                      <p
                        className={`mt-3 text-2xl font-bold ${item.text}`}
                      >
                        {formatNumber(item.value)}
                      </p>
                    </div>
                  ))}
                </div>

                <div className="mt-5 rounded-lg bg-gray-50 p-4">
                  <div className="mb-2 flex justify-between text-xs text-gray-500">
                    <span>Completed execution share</span>
                    <span>{data.summary.successRate}%</span>
                  </div>

                  <div className="h-2.5 overflow-hidden rounded-full bg-gray-200">
                    <div
                      className="h-full rounded-full bg-emerald-500 transition-all"
                      style={{
                        width: `${data.summary.successRate}%`,
                      }}
                    />
                  </div>
                </div>
              </div>

              {/* Test vs real */}
              <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
                <div className="mb-5">
                  <h2 className="font-semibold text-gray-900">
                    Execution Modes
                  </h2>
                  <p className="mt-1 text-xs text-gray-500">
                    Test runs compared with real runs
                  </p>
                </div>

                <div className="space-y-5">
                  <div>
                    <div className="mb-2 flex items-center justify-between">
                      <span className="flex items-center gap-2 text-sm text-gray-600">
                        <Radio size={16} className="text-teal-600" />
                        Real
                      </span>
                      <span className="font-semibold text-gray-900">
                        {formatNumber(data.modeBreakdown.real)}
                      </span>
                    </div>

                    <div className="h-2.5 overflow-hidden rounded-full bg-gray-100">
                      <div
                        className="h-full rounded-full bg-teal-500"
                        style={{
                          width: `${
                            data.modeBreakdown.real +
                              data.modeBreakdown.test >
                            0
                              ? (data.modeBreakdown.real /
                                  (data.modeBreakdown.real +
                                    data.modeBreakdown.test)) *
                                100
                              : 0
                          }%`,
                        }}
                      />
                    </div>
                  </div>

                  <div>
                    <div className="mb-2 flex items-center justify-between">
                      <span className="flex items-center gap-2 text-sm text-gray-600">
                        <FlaskConical
                          size={16}
                          className="text-violet-600"
                        />
                        Test
                      </span>
                      <span className="font-semibold text-gray-900">
                        {formatNumber(data.modeBreakdown.test)}
                      </span>
                    </div>

                    <div className="h-2.5 overflow-hidden rounded-full bg-gray-100">
                      <div
                        className="h-full rounded-full bg-violet-500"
                        style={{
                          width: `${
                            data.modeBreakdown.real +
                              data.modeBreakdown.test >
                            0
                              ? (data.modeBreakdown.test /
                                  (data.modeBreakdown.real +
                                    data.modeBreakdown.test)) *
                                100
                              : 0
                          }%`,
                        }}
                      />
                    </div>
                  </div>
                </div>

                <div className="mt-6 border-t border-gray-100 pt-4">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-500">
                      All execution records
                    </span>
                    <span className="font-semibold text-gray-900">
                      {formatNumber(
                        data.modeBreakdown.real +
                          data.modeBreakdown.test
                      )}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Daily trends */}
            <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
              <div className="mb-6 flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
                <div>
                  <h2 className="font-semibold text-gray-900">
                    Execution Trends
                  </h2>
                  <p className="mt-1 text-xs text-gray-500">
                    Daily execution activity over the last 14 days
                  </p>
                </div>

                <div className="flex flex-wrap gap-4 text-xs text-gray-500">
                  <span className="flex items-center gap-1.5">
                    <span className="h-2.5 w-2.5 rounded-sm bg-teal-500" />
                    Real
                  </span>
                  <span className="flex items-center gap-1.5">
                    <span className="h-2.5 w-2.5 rounded-sm bg-violet-400" />
                    Test
                  </span>
                </div>
              </div>

              {data.trend.some(
                (item) => item.real > 0 || item.test > 0
              ) ? (
                <div className="flex h-64 items-end gap-2 overflow-x-auto pb-2">
                  {data.trend.map((item) => {
                    const realHeight =
                      (item.real / maxTrendValue) * 100;
                    const testHeight =
                      (item.test / maxTrendValue) * 100;

                    return (
                      <div
                        key={item.date}
                        className="flex h-full min-w-[35px] flex-1 flex-col items-center justify-end"
                        title={`${item.label}: ${item.real} real, ${item.test} test`}
                      >
                        <div className="mb-2 text-[10px] font-medium text-gray-500">
                          {item.real + item.test || ""}
                        </div>

                        <div className="flex h-[190px] w-full items-end justify-center gap-0.5">
                          <div
                            className="w-2/5 rounded-t-sm bg-teal-500 transition-all"
                            style={{
                              height: `${Math.max(
                                item.real > 0 ? 3 : 0,
                                realHeight
                              )}%`,
                            }}
                          />
                          <div
                            className="w-2/5 rounded-t-sm bg-violet-400 transition-all"
                            style={{
                              height: `${Math.max(
                                item.test > 0 ? 3 : 0,
                                testHeight
                              )}%`,
                            }}
                          />
                        </div>

                        <span className="mt-3 whitespace-nowrap text-[10px] text-gray-400">
                          {item.label}
                        </span>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <EmptyState message="No execution activity recorded in the last 14 days." />
              )}
            </div>

            {/* Journey performance */}
            <div className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm">
              <div className="flex items-center justify-between border-b border-gray-100 p-5">
                <div>
                  <h2 className="font-semibold text-gray-900">
                    Journey Performance
                  </h2>
                  <p className="mt-1 text-xs text-gray-500">
                    Real execution performance for each journey
                  </p>
                </div>
                <Workflow className="text-gray-400" size={20} />
              </div>

              {data.journeys.length === 0 ? (
                <EmptyState message="No journeys available." />
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full min-w-[650px] text-left">
                    <thead className="bg-gray-50 text-[11px] font-semibold uppercase tracking-wider text-gray-500">
                      <tr>
                        <th className="px-5 py-3">Journey</th>
                        <th className="px-5 py-3">Status</th>
                        <th className="px-5 py-3">Executions</th>
                        <th className="px-5 py-3">Completed</th>
                        <th className="px-5 py-3">Failed</th>
                        <th className="px-5 py-3">Success Rate</th>
                        <th className="px-5 py-3">Action</th>
                      </tr>
                    </thead>

                    <tbody className="divide-y divide-gray-100">
                      {data.journeys.map((journey) => (
                        <tr
                          key={journey.id}
                          className="transition hover:bg-gray-50"
                        >
                          <td className="max-w-[220px] px-5 py-4">
                            <p
                              className="truncate text-sm font-semibold text-gray-900"
                              title={journey.name}
                            >
                              {journey.name}
                            </p>
                            <p className="mt-1 text-[10px] text-gray-400">
                              ID: {journey.id.slice(-8)}
                            </p>
                          </td>

                          <td className="px-5 py-4">
                            <span
                              className={`rounded-full px-2.5 py-1 text-xs font-medium ${
                                journey.status === "active"
                                  ? "bg-emerald-50 text-emerald-700"
                                  : journey.status === "paused"
                                    ? "bg-amber-50 text-amber-700"
                                    : "bg-gray-100 text-gray-600"
                              }`}
                            >
                              {journey.status}
                            </span>
                          </td>

                          <td className="px-5 py-4 text-sm font-semibold text-gray-800">
                            {formatNumber(journey.totalExecutions)}
                          </td>

                          <td className="px-5 py-4 text-sm text-emerald-700">
                            {formatNumber(journey.completed)}
                          </td>

                          <td className="px-5 py-4 text-sm text-red-600">
                            {formatNumber(journey.failed)}
                          </td>

                          <td className="min-w-[130px] px-5 py-4">
                            <div className="flex items-center gap-2">
                              <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-gray-100">
                                <div
                                  className="h-full rounded-full bg-teal-500"
                                  style={{
                                    width: `${journey.successRate}%`,
                                  }}
                                />
                              </div>
                              <span className="text-xs font-semibold text-gray-700">
                                {journey.successRate}%
                              </span>
                            </div>
                          </td>

                          <td className="px-5 py-4">
                            <Link
                              href={`/journey/${journey.id}/executions`}
                              className="whitespace-nowrap text-xs font-semibold text-teal-700 hover:underline"
                            >
                              View History
                            </Link>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="flex flex-col justify-between gap-2 text-xs text-gray-400 sm:flex-row sm:items-center">
              <span>
                Analytics are calculated from stored journey execution records.
              </span>
              <span>
                Last updated: {formatDate(data.generatedAt)}
              </span>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
