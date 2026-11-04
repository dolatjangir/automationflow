"use client";

import { useMemo, useState } from "react";
import JourneyFilters from "@/components/journey/JourneyFilters";
import JourneyHeader from "@/components/journey/JourneyHeader";
import JourneyPagination from "@/components/journey/JourneyPagination";
import JourneyStats from "@/components/journey/JourneyStats";
import JourneyTable from "@/components/journey/JourneyTable";
import JourneyTabs from "@/components/journey/JourneyTabs";
import { initialJourneys } from "@/data/journeys";
import type {
  Journey,
  JourneyChannelFilter,
  JourneySortOption,
  JourneyStatusFilter,
} from "@/types/journey";

const PAGE_SIZE = 5;

export default function JourneyPage() {
  const [journeys, setJourneys] = useState<Journey[]>(initialJourneys);
  const [status, setStatus] = useState<JourneyStatusFilter>("all");
  const [search, setSearch] = useState("");
  const [channel, setChannel] = useState<JourneyChannelFilter>("all");
  const [sort, setSort] = useState<JourneySortOption>("updated_desc");
  const [currentPage, setCurrentPage] = useState(1);

  const filteredJourneys = useMemo(() => {
    const normalizedSearch = search.trim().toLowerCase();

    const result = journeys.filter((journey) => {
      const matchesStatus = status === "all" || journey.status === status;
      const matchesChannel = channel === "all" || journey.channels.includes(channel);
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
          return new Date(a.updatedAt).getTime() - new Date(b.updatedAt).getTime();
        case "name_asc":
          return a.name.localeCompare(b.name);
        case "enrolled_desc":
          return b.enrolled - a.enrolled;
        case "updated_desc":
        default:
          return new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime();
      }
    });
  }, [journeys, status, search, channel, sort]);

  const totalPages = Math.max(1, Math.ceil(filteredJourneys.length / PAGE_SIZE));
  const safePage = Math.min(currentPage, totalPages);
  const visibleJourneys = filteredJourneys.slice(
    (safePage - 1) * PAGE_SIZE,
    safePage * PAGE_SIZE,
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

  const handleDuplicate = (journey: Journey) => {
    const now = new Date();
    const copy: Journey = {
      ...journey,
      id: `journey-${now.getTime()}`,
      name: `${journey.name} (Copy)`,
      status: "draft",
      enrolled: 0,
      completed: 0,
      updatedAt: now.toISOString(),
      updatedLabel: "Just now",
    };

    setJourneys((current) => [copy, ...current]);
    setStatus("all");
    setChannel("all");
    setSearch("");
    setSort("updated_desc");
    setCurrentPage(1);
  };

  const handleToggleStatus = (journey: Journey) => {
    setJourneys((current) =>
      current.map((item) =>
        item.id === journey.id
          ? {
              ...item,
              status: item.status === "active" ? "paused" : "active",
              updatedAt: new Date().toISOString(),
              updatedLabel: "Just now",
            }
          : item,
      ),
    );
  };

  const handleDelete = (journey: Journey) => {
    const confirmed = window.confirm(`Delete "${journey.name}"? This action cannot be undone.`);
    if (!confirmed) return;

    setJourneys((current) => current.filter((item) => item.id !== journey.id));
    setCurrentPage(1);
  };

  return (
    <div className="mx-auto w-full max-w-[1600px]">
      <JourneyHeader />
      <JourneyTabs activeTab="journeys" />
      <JourneyStats journeys={journeys} />

      <div className="crm-card p-4 md:p-5">
        <div className="mb-4 flex flex-col justify-between gap-1 sm:flex-row sm:items-center">
          <div>
            <h2 className="text-[15px] font-bold text-crm-heading">My Journeys</h2>
            <p className="mt-0.5 text-[11px] text-crm-muted">
              Manage and track your customer automation workflows.
            </p>
          </div>
          <span className="text-[11px] text-crm-muted">
            {journeys.length} total {journeys.length === 1 ? "journey" : "journeys"}
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
      </div>
    </div>
  );
}
