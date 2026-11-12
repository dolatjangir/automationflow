
"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import {
  Search,
  X,
  Users,
  UserPlus,
  Loader2,
  ChevronLeft,
  ChevronRight,
  CheckCircle2,
} from "lucide-react";

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
const CONTACT_PAGE_SIZE = 20;

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

interface ApiContact {
  id: string;
  firstName: string | null;
  lastName: string | null;
  email: string | null;
  phone: string | null;
  company: string | null;
  status: string;
}

interface EnrollmentResult {
  requested: number;
  enrolled: number;
  executionsCreated: number;
  alreadyEnrolled: number;
  duplicateContactIds?: string[];
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

function getContactName(contact: ApiContact) {
  return (
    [contact.firstName, contact.lastName].filter(Boolean).join(" ") ||
    "Unnamed Contact"
  );
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

  // Enrollment popup state
  const [enrollModalOpen, setEnrollModalOpen] = useState(false);
  const [selectedJourney, setSelectedJourney] = useState<Journey | null>(
    null
  );

  const [contacts, setContacts] = useState<ApiContact[]>([]);
  const [contactsLoading, setContactsLoading] = useState(false);
  const [contactsError, setContactsError] = useState<string | null>(null);

  const [contactSearch, setContactSearch] = useState("");
  const [contactPage, setContactPage] = useState(1);
  const [contactTotal, setContactTotal] = useState(0);

  const [selectedContactIds, setSelectedContactIds] = useState<Set<string>>(
    new Set()
  );

  const [enrolling, setEnrolling] = useState(false);
  const [enrollmentResult, setEnrollmentResult] =
    useState<EnrollmentResult | null>(null);
  const [enrollmentError, setEnrollmentError] = useState<string | null>(
    null
  );

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

  // Fetch contacts for the enrollment popup.
  const fetchEnrollmentContacts = useCallback(async () => {
    if (!enrollModalOpen) return;

    try {
      setContactsLoading(true);
      setContactsError(null);

      const params = new URLSearchParams({
        page: String(contactPage),
        limit: String(CONTACT_PAGE_SIZE),
      });

      if (contactSearch.trim()) {
        params.set("search", contactSearch.trim());
      }

      const response = await fetch(
        `/api/contacts?${params.toString()}`,
        { cache: "no-store" }
      );

      const result = await response.json();

      if (!response.ok || !result.success) {
        throw new Error(result.message || "Unable to load contacts.");
      }

      setContacts(result.data || []);
      setContactTotal(result.pagination?.total || 0);
    } catch (err) {
      console.error("Enrollment contacts error:", err);

      setContactsError(
        err instanceof Error
          ? err.message
          : "Unable to load contacts."
      );
    } finally {
      setContactsLoading(false);
    }
  }, [enrollModalOpen, contactPage, contactSearch]);

  useEffect(() => {
    fetchEnrollmentContacts();
  }, [fetchEnrollmentContacts]);

  // Open enrollment popup for a journey.
  const handleOpenEnroll = (journey: Journey) => {
    if (journey.status !== "active") {
      window.alert("Please activate this journey before enrolling contacts.");
      return;
    }

    setSelectedJourney(journey);
    setSelectedContactIds(new Set());
    setContactSearch("");
    setContactPage(1);
    setEnrollmentResult(null);
    setEnrollmentError(null);
    setContactsError(null);
    setContacts([]);
    setContactTotal(0);
    setEnrollModalOpen(true);
  };

  const handleCloseEnroll = () => {
    if (enrolling) return;

    setEnrollModalOpen(false);
    setSelectedJourney(null);
    setSelectedContactIds(new Set());
    setEnrollmentResult(null);
    setEnrollmentError(null);
    setContactsError(null);
  };

  // Select or deselect one contact.
  const handleContactSelection = (contactId: string) => {
    setSelectedContactIds((previous) => {
      const updated = new Set(previous);

      if (updated.has(contactId)) {
        updated.delete(contactId);
      } else {
        updated.add(contactId);
      }

      return updated;
    });

    setEnrollmentResult(null);
    setEnrollmentError(null);
  };

  // Select or deselect all contacts on the current page.
  const allCurrentPageSelected =
    contacts.length > 0 &&
    contacts.every((contact) => selectedContactIds.has(contact.id));

  const handleSelectAll = () => {
    setSelectedContactIds((previous) => {
      const updated = new Set(previous);

      if (allCurrentPageSelected) {
        contacts.forEach((contact) => updated.delete(contact.id));
      } else {
        contacts.forEach((contact) => updated.add(contact.id));
      }

      return updated;
    });

    setEnrollmentResult(null);
    setEnrollmentError(null);
  };

  // Enroll selected contacts into the journey.
  const handleEnrollSelected = async () => {
    if (!selectedJourney || selectedContactIds.size === 0) return;

    try {
      setEnrolling(true);
      setEnrollmentError(null);
      setEnrollmentResult(null);

      const response = await fetch(
        `/api/journeys/${selectedJourney.id}/enroll`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            contactIds: Array.from(selectedContactIds),
            source: "manual",
          }),
        }
      );

      const result = await response.json();

      if (!response.ok || !result.success) {
        throw new Error(
          result.message || "Unable to enroll selected contacts."
        );
      }

     const responseData = result.data ?? result;
const summary = responseData.summary ?? responseData;

setEnrollmentResult({
  requested: summary.requested ?? selectedContactIds.size,
  enrolled: summary.enrolled ?? 0,
  executionsCreated: summary.executionsCreated ?? 0,
  alreadyEnrolled: summary.alreadyEnrolled ?? 0,
  duplicateContactIds: responseData.duplicateContactIds ?? [],
});

      setSelectedContactIds(new Set());

      await fetchJourneys();
    } catch (err) {
      console.error("Journey enrollment error:", err);

      setEnrollmentError(
        err instanceof Error
          ? err.message
          : "Something went wrong during enrollment."
      );
    } finally {
      setEnrolling(false);
    }
  };

  const totalContactPages = Math.max(
    1,
    Math.ceil(contactTotal / CONTACT_PAGE_SIZE)
  );

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

      const idMap = new Map<string, string>(
        (original.nodes ?? []).map((node: any) => [
          node.id,
          `node-${crypto.randomUUID()}`,
        ])
      );

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
              onEnroll={handleOpenEnroll}
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

      {/* Enroll Contacts Modal */}
      {enrollModalOpen && selectedJourney && (
        <div
          className="fixed inset-0 z-[100] flex items-center justify-center bg-[#102A36]/50 p-3 backdrop-blur-[2px] sm:p-5"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) {
              handleCloseEnroll();
            }
          }}
        >
          <div className="flex max-h-[92vh] w-full max-w-4xl flex-col overflow-hidden rounded-2xl border border-[#E5EDF0] bg-white shadow-2xl">
            {/* Modal header */}
            <div className="flex items-center justify-between border-b border-[#E8EFF2] px-5 py-4 sm:px-6">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#EAF8F6] text-[#168B83]">
                  <UserPlus size={20} />
                </div>

                <div>
                  <h2 className="text-[16px] font-bold text-[#18313B]">
                    Enroll Contacts
                  </h2>
                  <p className="mt-0.5 text-[11px] text-[#71849A]">
                    Journey: {selectedJourney.name}
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={handleCloseEnroll}
                disabled={enrolling}
                className="rounded-lg p-2 text-[#81919B] transition hover:bg-[#F2F6F7] hover:text-[#263E48] disabled:opacity-40"
                aria-label="Close enrollment popup"
              >
                <X size={19} />
              </button>
            </div>

            {/* Modal content */}
            <div className="flex min-h-0 flex-1 flex-col overflow-y-auto p-5 sm:p-6">
              <div className="mb-4 flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
                <div>
                  <h3 className="text-[13px] font-bold text-[#263E48]">
                    Select Contacts
                  </h3>
                  <p className="mt-1 text-[11px] text-[#81919B]">
                    Choose the contacts you want to add to this journey.
                  </p>
                </div>

                <div className="inline-flex items-center gap-2 self-start rounded-lg bg-[#EAF8F6] px-3 py-2 text-[11px] font-semibold text-[#168B83]">
                  <Users size={14} />
                  {selectedContactIds.size} selected
                </div>
              </div>

              {/* Search */}
              <div className="relative mb-4">
                <Search
                  size={16}
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-[#91A0AA]"
                />

                <input
                  type="text"
                  value={contactSearch}
                  onChange={(event) => {
                    setContactSearch(event.target.value);
                    setContactPage(1);
                    setEnrollmentResult(null);
                    setEnrollmentError(null);
                  }}
                  placeholder="Search by name, email, phone or company..."
                  className="h-10 w-full rounded-xl border border-[#DCE7EB] bg-white pl-10 pr-4 text-[12px] text-[#263E48] outline-none transition placeholder:text-[#A0ADB5] focus:border-[#168B83] focus:ring-2 focus:ring-[#168B83]/10"
                />
              </div>

              {/* Error */}
              {contactsError && (
                <div className="mb-4 flex items-center justify-between rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-[12px] text-red-700">
                  <span>{contactsError}</span>
                  <button
                    type="button"
                    onClick={fetchEnrollmentContacts}
                    className="font-semibold underline"
                  >
                    Retry
                  </button>
                </div>
              )}

              {enrollmentError && (
                <div className="mb-4 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-[12px] text-red-700">
                  {enrollmentError}
                </div>
              )}

              {/* Enrollment result */}
              {enrollmentResult && (
                <div className="mb-4 rounded-xl border border-emerald-200 bg-emerald-50 p-4">
                  <div className="flex items-center gap-2 text-[13px] font-bold text-emerald-800">
                    <CheckCircle2 size={17} />
                    Enrollment request completed
                  </div>

                  <div className="mt-3 grid grid-cols-2 gap-3 sm:grid-cols-4">
                    <div>
                      <p className="text-[10px] text-emerald-700">
                        Requested
                      </p>
                      <p className="mt-1 text-lg font-bold text-emerald-900">
                        {enrollmentResult.requested}
                      </p>
                    </div>

                    <div>
                      <p className="text-[10px] text-emerald-700">
                        Enrolled
                      </p>
                      <p className="mt-1 text-lg font-bold text-emerald-900">
                        {enrollmentResult.enrolled}
                      </p>
                    </div>

                    <div>
                      <p className="text-[10px] text-emerald-700">
                        Executions created
                      </p>
                      <p className="mt-1 text-lg font-bold text-emerald-900">
                        {enrollmentResult.executionsCreated}
                      </p>
                    </div>

                    <div>
                      <p className="text-[10px] text-emerald-700">
                        Already enrolled
                      </p>
                      <p className="mt-1 text-lg font-bold text-emerald-900">
                        {enrollmentResult.alreadyEnrolled}
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {/* Contacts table */}
              <div className="overflow-hidden rounded-xl border border-[#E5EDF0]">
                <div className="overflow-x-auto">
                  <table className="w-full min-w-[650px] text-left">
                    <thead>
                      <tr className="bg-[#F7FAFC] text-[10px] font-semibold uppercase tracking-wide text-[#71849A]">
                        <th className="w-12 px-4 py-3">
                          <input
                            type="checkbox"
                            checked={allCurrentPageSelected}
                            onChange={handleSelectAll}
                            disabled={contactsLoading || contacts.length === 0}
                            className="h-4 w-4 cursor-pointer accent-[#168B83]"
                            aria-label="Select all contacts on this page"
                          />
                        </th>
                        <th className="px-4 py-3">Contact</th>
                        <th className="px-4 py-3">Email</th>
                        <th className="px-4 py-3">Phone</th>
                        <th className="px-4 py-3">Company</th>
                        <th className="px-4 py-3">Status</th>
                      </tr>
                    </thead>

                    <tbody className="divide-y divide-[#EDF1F3]">
                      {contactsLoading ? (
                        <tr>
                          <td
                            colSpan={6}
                            className="px-4 py-12 text-center"
                          >
                            <div className="flex items-center justify-center gap-2 text-[12px] text-[#71849A]">
                              <Loader2
                                size={17}
                                className="animate-spin text-[#168B83]"
                              />
                              Loading contacts...
                            </div>
                          </td>
                        </tr>
                      ) : contacts.length === 0 ? (
                        <tr>
                          <td
                            colSpan={6}
                            className="px-4 py-12 text-center"
                          >
                            <Users
                              size={25}
                              className="mx-auto text-[#A0ADB5]"
                            />
                            <p className="mt-3 text-[12px] font-semibold text-[#526875]">
                              No contacts found
                            </p>
                            <p className="mt-1 text-[11px] text-[#91A0AA]">
                              Add contacts first or try another search.
                            </p>
                          </td>
                        </tr>
                      ) : (
                        contacts.map((contact) => {
                          const isSelected = selectedContactIds.has(
                            contact.id
                          );

                          return (
                            <tr
                              key={contact.id}
                              onClick={() =>
                                handleContactSelection(contact.id)
                              }
                              className={`cursor-pointer transition ${
                                isSelected
                                  ? "bg-[#F0FAF8]"
                                  : "hover:bg-[#FAFCFC]"
                              }`}
                            >
                              <td className="px-4 py-3">
                                <input
                                  type="checkbox"
                                  checked={isSelected}
                                  onChange={() =>
                                    handleContactSelection(contact.id)
                                  }
                                  onClick={(event) => event.stopPropagation()}
                                  className="h-4 w-4 cursor-pointer accent-[#168B83]"
                                  aria-label={`Select ${getContactName(contact)}`}
                                />
                              </td>

                              <td className="px-4 py-3">
                                <div className="flex items-center gap-2.5">
                                  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[#EAF8F6] text-[11px] font-bold text-[#168B83]">
                                    {getContactName(contact)
                                      .charAt(0)
                                      .toUpperCase()}
                                  </div>
                                  <span className="text-[11px] font-semibold text-[#263E48]">
                                    {getContactName(contact)}
                                  </span>
                                </div>
                              </td>

                              <td className="px-4 py-3 text-[11px] text-[#627782]">
                                {contact.email || "—"}
                              </td>

                              <td className="px-4 py-3 text-[11px] text-[#627782]">
                                {contact.phone || "—"}
                              </td>

                              <td className="px-4 py-3 text-[11px] text-[#627782]">
                                {contact.company || "—"}
                              </td>

                              <td className="px-4 py-3">
                                <span className="rounded-full bg-[#F0F4F6] px-2 py-1 text-[10px] font-medium capitalize text-[#627782]">
                                  {contact.status}
                                </span>
                              </td>
                            </tr>
                          );
                        })
                      )}
                    </tbody>
                  </table>
                </div>

                {/* Contact pagination */}
                <div className="flex flex-col justify-between gap-3 border-t border-[#E8EFF2] px-4 py-3 sm:flex-row sm:items-center">
                  <p className="text-[10px] text-[#81919B]">
                    {contactTotal === 0
                      ? "No contacts"
                      : `Showing ${
                          (contactPage - 1) * CONTACT_PAGE_SIZE + 1
                        }–${Math.min(
                          contactPage * CONTACT_PAGE_SIZE,
                          contactTotal
                        )} of ${contactTotal} contacts`}
                  </p>

                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      disabled={contactPage <= 1 || contactsLoading}
                      onClick={() =>
                        setContactPage((previous) => previous - 1)
                      }
                      className="rounded-lg border border-[#DCE7EB] p-1.5 text-[#627782] hover:bg-[#F7FAFC] disabled:cursor-not-allowed disabled:opacity-40"
                    >
                      <ChevronLeft size={15} />
                    </button>

                    <span className="text-[10px] text-[#627782]">
                      Page {contactPage} of {totalContactPages}
                    </span>

                    <button
                      type="button"
                      disabled={
                        contactPage >= totalContactPages || contactsLoading
                      }
                      onClick={() =>
                        setContactPage((previous) => previous + 1)
                      }
                      className="rounded-lg border border-[#DCE7EB] p-1.5 text-[#627782] hover:bg-[#F7FAFC] disabled:cursor-not-allowed disabled:opacity-40"
                    >
                      <ChevronRight size={15} />
                    </button>
                  </div>
                </div>
              </div>

              <p className="mt-3 text-[10px] text-[#81919B]">
                You can select contacts across multiple pages. Only selected
                contacts will be enrolled.
              </p>
            </div>

            {/* Modal footer */}
            <div className="flex flex-col-reverse justify-between gap-3 border-t border-[#E8EFF2] bg-[#FBFDFE] px-5 py-4 sm:flex-row sm:items-center sm:px-6">
              <button
                type="button"
                onClick={handleCloseEnroll}
                disabled={enrolling}
                className="rounded-lg border border-[#DCE7EB] bg-white px-4 py-2.5 text-[11px] font-semibold text-[#526875] transition hover:bg-[#F5F8F9] disabled:opacity-50"
              >
                Close
              </button>

              <button
                type="button"
                onClick={handleEnrollSelected}
                disabled={enrolling || selectedContactIds.size === 0}
                className="inline-flex items-center justify-center gap-2 rounded-lg bg-[#168B83] px-5 py-2.5 text-[11px] font-semibold text-white transition hover:bg-[#11756F] disabled:cursor-not-allowed disabled:opacity-50"
              >
                {enrolling ? (
                  <Loader2 size={15} className="animate-spin" />
                ) : (
                  <UserPlus size={15} />
                )}

                {enrolling
                  ? "Enrolling..."
                  : `Enroll Selected (${selectedContactIds.size})`}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
