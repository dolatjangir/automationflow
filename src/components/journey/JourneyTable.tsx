
import Link from "next/link";
import {
  Mail,
  MessageCircle,
  MessageSquare,
  Workflow,
  History,
} from "lucide-react";
import type { Journey, JourneyChannel } from "@/types/journey";
import JourneyActions from "@/components/journey/JourneyActions";

interface JourneyTableProps {
  journeys: Journey[];
  onDuplicate: (journey: Journey) => void;
  onToggleStatus: (journey: Journey) => void;
  onDelete: (journey: Journey) => void;
}

const channelMeta: Record<
  JourneyChannel,
  {
    label: string;
    shortLabel: string;
    icon: typeof Mail;
    className: string;
  }
> = {
  baileys_whatsapp: {
    label: "Baileys WhatsApp",
    shortLabel: "Baileys",
    icon: MessageCircle,
    className: "bg-[#E8F8EF] text-[#168447]",
  },
  meta_whatsapp: {
    label: "Meta WhatsApp",
    shortLabel: "Meta",
    icon: MessageCircle,
    className: "bg-[#E6F7F8] text-[#008C99]",
  },
  email: {
    label: "Email",
    shortLabel: "Email",
    icon: Mail,
    className: "bg-[#EEF3FF] text-[#4263B5]",
  },
  sms: {
    label: "SMS",
    shortLabel: "SMS",
    icon: MessageSquare,
    className: "bg-[#FFF4E5] text-[#B76B12]",
  },
};

const statusMeta = {
  active: {
    label: "Active",
    className: "bg-[#E8F8EF] text-[#168447]",
  },
  paused: {
    label: "Paused",
    className: "bg-[#FFF4E5] text-[#B76B12]",
  },
  draft: {
    label: "Draft",
    className: "bg-[#F2EBFF] text-[#7441C8]",
  },
};

function ChannelList({ channels }: { channels: JourneyChannel[] }) {
  return (
    <div className="flex min-w-[140px] flex-wrap gap-1.5">
      {channels.map((channel) => {
        const meta = channelMeta[channel];
        const Icon = meta.icon;

        return (
          <span
            key={channel}
            title={meta.label}
            className={`inline-flex items-center gap-1 rounded-md px-2 py-1 text-[10px] font-semibold ${meta.className}`}
          >
            <Icon size={12} />
            {meta.shortLabel}
          </span>
        );
      })}
    </div>
  );
}

export default function JourneyTable({
  journeys,
  onDuplicate,
  onToggleStatus,
  onDelete,
}: JourneyTableProps) {
  if (journeys.length === 0) {
    return (
      <div className="crm-card flex min-h-[280px] flex-col items-center justify-center px-5 py-12 text-center">
        <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-xl bg-crm-primary-light text-crm-primary-dark">
          <Workflow size={23} />
        </div>

        <h3 className="text-[14px] font-semibold text-crm-heading">
          No journeys found
        </h3>

        <p className="mt-1 max-w-sm text-[12px] text-crm-muted">
          Try changing your search or filters, or create a new journey to get
          started.
        </p>

        <Link
          href="/journey/builder/new"
          className="crm-primary-button mt-4 h-9 px-4 text-[12px]"
        >
          Create Journey
        </Link>
      </div>
    );
  }

  return (
    <div className="crm-card overflow-visible">
      <div className="overflow-x-auto rounded-xl">
        <table className="w-full min-w-[960px] border-collapse text-left">
          <thead>
            <tr className="bg-[#F7FAFC] text-[11px] font-semibold uppercase tracking-[0.04em] text-[#71849A]">
              <th className="rounded-tl-xl px-4 py-3.5">
                Journey name
              </th>
              <th className="px-4 py-3.5">Trigger</th>
              <th className="px-4 py-3.5">Channels</th>
              <th className="px-4 py-3.5">Enrolled</th>
              <th className="px-4 py-3.5">Completed</th>
              <th className="px-4 py-3.5">Status</th>
              <th className="px-4 py-3.5">Last updated</th>
              <th className="rounded-tr-xl px-4 py-3.5 text-right">
                Actions
              </th>
            </tr>
          </thead>

          <tbody>
            {journeys.map((journey) => {
              const status = statusMeta[journey.status];

              const completion =
                journey.enrolled > 0
                  ? Math.round(
                      (journey.completed / journey.enrolled) * 100
                    )
                  : 0;

              return (
                <tr
                  key={journey.id}
                  className="border-t border-crm-border align-middle transition hover:bg-[#FBFDFE]"
                >
                  <td className="max-w-[230px] px-4 py-3.5">
                    <Link
                      href={`/journey/builder/${journey.id}`}
                      className="block truncate text-[12px] font-semibold text-crm-heading hover:text-crm-primary-dark"
                      title={journey.name}
                    >
                      {journey.name}
                    </Link>

                    <p
                      className="mt-1 truncate text-[10px] text-crm-muted"
                      title={journey.description}
                    >
                      {journey.description}
                    </p>
                  </td>

                  <td className="px-4 py-3.5 text-[11px] font-medium text-crm-text">
                    {journey.trigger}
                  </td>

                  <td className="px-4 py-3.5">
                    <ChannelList channels={journey.channels} />
                  </td>

                  <td className="px-4 py-3.5 text-[12px] font-semibold tabular-nums text-crm-text">
                    {journey.enrolled.toLocaleString("en-IN")}
                  </td>

                  <td className="min-w-[145px] px-4 py-3.5">
                    <div className="flex items-center justify-between gap-2 text-[11px]">
                      <span className="font-semibold tabular-nums text-crm-text">
                        {journey.completed.toLocaleString("en-IN")}
                      </span>

                      <span className="text-crm-muted">
                        {completion}%
                      </span>
                    </div>

                    <div className="mt-1.5 h-1.5 w-full overflow-hidden rounded-full bg-[#EAF0F5]">
                      <div
                        className="h-full rounded-full bg-crm-primary transition-all"
                        style={{ width: `${completion}%` }}
                      />
                    </div>
                  </td>

                  <td className="px-4 py-3.5">
                    <span
                      className={`inline-flex items-center rounded-full px-2.5 py-1 text-[10px] font-semibold ${status.className}`}
                    >
                      <span className="mr-1.5 h-1.5 w-1.5 rounded-full bg-current" />
                      {status.label}
                    </span>
                  </td>

                  <td className="whitespace-nowrap px-4 py-3.5 text-[11px] text-crm-muted">
                    {journey.updatedLabel}
                  </td>

                  <td className="px-4 py-3.5">
                    <div className="flex items-center justify-end gap-2">
                      {/* Execution History */}
                      <Link
                        href={`/journey/${journey.id}/executions`}
                        title="View Execution History"
                        aria-label={`View execution history for ${journey.name}`}
                        className="inline-flex h-8 items-center gap-1.5 rounded-lg border border-[#DCE7EB] bg-white px-2.5 text-[11px] font-semibold text-[#168B83] transition hover:border-[#168B83] hover:bg-[#EAF8F6]"
                      >
                        <History size={14} />
                        <span>History</span>
                      </Link>

                      {/* Existing Journey Actions */}
                      <JourneyActions
                        journey={journey}
                        onDuplicate={onDuplicate}
                        onToggleStatus={onToggleStatus}
                        onDelete={onDelete}
                      />
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
