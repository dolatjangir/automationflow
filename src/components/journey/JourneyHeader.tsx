import Link from "next/link";
import { ArrowUpRight, ChartNoAxesCombined, Plus } from "lucide-react";

export default function JourneyHeader() {
  return (
    <div className="mb-5 flex flex-col justify-between gap-4 lg:flex-row lg:items-center">
      <div>
        <div className="mb-1 flex flex-wrap items-center gap-2">
          <h1 className="text-[25px] font-bold tracking-tight text-crm-heading">Journey</h1>
          <span className="rounded-full bg-crm-primary-light px-2.5 py-1 text-[10px] font-semibold text-crm-primary-dark">
            Automation
          </span>
        </div>
        <p className="text-[13px] text-crm-muted">
          Create, manage and monitor your customer journeys from one place.
        </p>
      </div>

      <div className="flex flex-wrap items-center gap-2.5">
        <Link
          href="/journey/analytics"
          className="inline-flex h-10 items-center justify-center gap-2 rounded-lg border border-crm-border bg-white px-3.5 text-[13px] font-semibold text-crm-text transition hover:border-crm-primary hover:bg-crm-primary-light hover:text-crm-primary-dark"
        >
          <ChartNoAxesCombined size={16} />
          Journey Analytics
          <ArrowUpRight size={13} />
        </Link>
        <Link href="/journey/builder/new" className="crm-primary-button h-10 px-4 text-[13px]">
          <Plus size={17} strokeWidth={2.2} />
          Create Journey
        </Link>
      </div>
    </div>
  );
}
