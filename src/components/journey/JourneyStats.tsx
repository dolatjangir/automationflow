import { Activity, CirclePause, FilePenLine, Workflow } from "lucide-react";
import type { Journey } from "@/types/journey";

interface JourneyStatsProps {
  journeys: Journey[];
}

export default function JourneyStats({ journeys }: JourneyStatsProps) {
  const stats = [
    {
      label: "Total Journeys",
      value: journeys.length,
      helper: "All created journeys",
      icon: Workflow,
      iconClass: "bg-[#E6F7F8] text-[#0099A7]",
    },
    {
      label: "Active",
      value: journeys.filter((journey) => journey.status === "active").length,
      helper: "Currently running",
      icon: Activity,
      iconClass: "bg-[#E8F8EF] text-[#16A34A]",
    },
    {
      label: "Paused",
      value: journeys.filter((journey) => journey.status === "paused").length,
      helper: "Temporarily stopped",
      icon: CirclePause,
      iconClass: "bg-[#FFF5E5] text-[#D97706]",
    },
    {
      label: "Drafts",
      value: journeys.filter((journey) => journey.status === "draft").length,
      helper: "Not published yet",
      icon: FilePenLine,
      iconClass: "bg-[#F2EBFF] text-[#7C3AED]",
    },
  ];

  return (
    <section className="mb-5 grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4" aria-label="Journey summary">
      {stats.map((stat) => {
        const Icon = stat.icon;
        return (
          <div key={stat.label} className="crm-card flex items-center justify-between p-4">
            <div>
              <p className="text-[12px] font-medium text-crm-muted">{stat.label}</p>
              <p className="mt-1 text-[25px] font-bold leading-tight text-crm-heading">{stat.value}</p>
              <p className="mt-1 text-[11px] text-crm-muted">{stat.helper}</p>
            </div>
            <div className={`flex h-11 w-11 items-center justify-center rounded-xl ${stat.iconClass}`}>
              <Icon size={21} strokeWidth={1.8} />
            </div>
          </div>
        );
      })}
    </section>
  );
}
