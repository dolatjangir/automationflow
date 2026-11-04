import Link from "next/link";
import { Blocks, ListChecks, Workflow } from "lucide-react";

type JourneyTab = "journeys" | "builder" | "templates";

interface JourneyTabsProps {
  activeTab?: JourneyTab;
}

const tabs = [
  { id: "journeys" as const, label: "My Journeys", href: "/journey", icon: ListChecks },
  { id: "builder" as const, label: "Journey Builder", href: "/journey/builder/new", icon: Workflow },
  { id: "templates" as const, label: "Journey Templates", href: "/journey/templates", icon: Blocks },
];

export default function JourneyTabs({ activeTab = "journeys" }: JourneyTabsProps) {
  return (
    <div className="mb-5 flex w-full gap-1 overflow-x-auto border-b border-crm-border" role="tablist" aria-label="Journey sections">
      {tabs.map((tab) => {
        const Icon = tab.icon;
        const active = activeTab === tab.id;
        return (
          <Link
            key={tab.id}
            href={tab.href}
            role="tab"
            aria-selected={active}
            className={`inline-flex shrink-0 items-center gap-2 border-b-2 px-4 py-3 text-[13px] font-semibold transition ${
              active
                ? "border-crm-primary text-crm-primary-dark"
                : "border-transparent text-crm-muted hover:border-crm-border hover:text-crm-text"
            }`}
          >
            <Icon size={16} />
            {tab.label}
          </Link>
        );
      })}
    </div>
  );
}
