import Link from "next/link";
import { Copy, MoreHorizontal, Pencil, Play, Pause, Trash2 } from "lucide-react";
import type { Journey } from "@/types/journey";

interface JourneyActionsProps {
  journey: Journey;
  onDuplicate: (journey: Journey) => void;
  onToggleStatus: (journey: Journey) => void;
  onDelete: (journey: Journey) => void;
}

export default function JourneyActions({
  journey,
  onDuplicate,
  onToggleStatus,
  onDelete,
}: JourneyActionsProps) {
  const isDraft = journey.status === "draft";
  const isActive = journey.status === "active";

  return (
    <details className="group relative inline-block text-left">
      <summary
        aria-label={`Actions for ${journey.name}`}
        className="flex h-8 w-8 cursor-pointer list-none items-center justify-center rounded-lg text-crm-muted transition hover:bg-crm-primary-light hover:text-crm-primary-dark [&::-webkit-details-marker]:hidden"
      >
        <MoreHorizontal size={19} />
      </summary>
      <div className="absolute right-0 top-9 z-20 w-44 rounded-xl border border-crm-border bg-white p-1.5 shadow-xl">
        <Link
          href={`/journey/builder/${journey.id}`}
          className="flex items-center gap-2 rounded-lg px-3 py-2 text-[12px] font-medium text-crm-text hover:bg-crm-primary-light hover:text-crm-primary-dark"
        >
          <Pencil size={14} /> Edit journey
        </Link>
        <button
          type="button"
          onClick={() => onDuplicate(journey)}
          className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-left text-[12px] font-medium text-crm-text hover:bg-crm-primary-light hover:text-crm-primary-dark"
        >
          <Copy size={14} /> Duplicate
        </button>
        {!isDraft && (
          <button
            type="button"
            onClick={() => onToggleStatus(journey)}
            className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-left text-[12px] font-medium text-crm-text hover:bg-crm-primary-light hover:text-crm-primary-dark"
          >
            {isActive ? <Pause size={14} /> : <Play size={14} />}
            {isActive ? "Pause journey" : "Resume journey"}
          </button>
        )}
        <div className="my-1 border-t border-crm-border" />
        <button
          type="button"
          onClick={() => onDelete(journey)}
          className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-left text-[12px] font-medium text-red-600 hover:bg-red-50"
        >
          <Trash2 size={14} /> Delete
        </button>
      </div>
    </details>
  );
}
