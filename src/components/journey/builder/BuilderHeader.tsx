"use client";

import Link from "next/link";
import { ArrowLeft, CheckCircle2, MoreHorizontal, Play, Send, Save } from "lucide-react";

interface BuilderHeaderProps {
  journeyName: string;
  status: "draft" | "active";
  lastSaved: string;
  onSave: () => void;
  onPublish: () => void;
  onTest: () => void;
  onNameChange: (name: string) => void;
}

export default function BuilderHeader({
  journeyName,
  status,
  lastSaved,
  onSave,
  onPublish,
  onTest,
  onNameChange,
}: BuilderHeaderProps) {
  return (
    <div className="shrink-0 border-b border-[#E5EAF0] bg-white">
      <div className="flex flex-wrap items-center justify-between gap-3 px-4 py-3 md:px-6">
        <div className="flex min-w-0 items-center gap-3">
          <Link href="/journey" aria-label="Back to journeys" className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-[#DDE7F0] text-[#536579] transition hover:border-[#00A9B7] hover:bg-[#E5F8FA] hover:text-[#008F9F]">
            <ArrowLeft size={17} />
          </Link>
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              <input
                value={journeyName}
                onChange={(event) => onNameChange(event.target.value)}
                aria-label="Journey name"
                className="w-full max-w-[320px] border-0 bg-transparent p-0 text-[17px] font-bold text-[#17324D] outline-none focus:ring-0"
              />
              <span className={`rounded-full px-2.5 py-1 text-[10px] font-bold capitalize ${status === "active" ? "bg-emerald-100 text-emerald-700" : "bg-blue-50 text-blue-700"}`}>
                {status}
              </span>
            </div>
            <p className="mt-0.5 text-[11px] text-[#8293A8]">Build your customer journey with triggers, actions and conditions.</p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <span className="mr-1 hidden items-center gap-1.5 text-[10px] text-[#8293A8] lg:flex">
            <CheckCircle2 size={13} className="text-emerald-500" />
            {lastSaved}
          </span>
          <button type="button" onClick={onTest} className="inline-flex h-9 items-center gap-2 rounded-lg border border-[#DDE7F0] bg-white px-3 text-[12px] font-semibold text-[#344258] transition hover:border-[#00A9B7] hover:bg-[#F4FCFC]">
            <Play size={14} /> Test Journey
          </button>
          <button type="button" onClick={onSave} className="inline-flex h-9 items-center gap-2 rounded-lg border border-[#DDE7F0] bg-white px-3 text-[12px] font-semibold text-[#344258] transition hover:border-[#00A9B7] hover:bg-[#F4FCFC]">
            <Save size={14} /> Save Draft
          </button>
          <button type="button" onClick={onPublish} className="inline-flex h-9 items-center gap-2 rounded-lg bg-[#00A9B7] px-4 text-[12px] font-semibold text-white shadow-sm transition hover:bg-[#008F9F]">
            <Send size={14} /> Publish
          </button>
          <button type="button" title="More options" className="flex h-9 w-9 items-center justify-center rounded-lg border border-[#DDE7F0] text-[#536579] transition hover:bg-[#F7FAFC]">
            <MoreHorizontal size={18} />
          </button>
        </div>
      </div>
    </div>
  );
}
