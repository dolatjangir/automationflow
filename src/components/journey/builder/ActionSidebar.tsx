
"use client";

import { useMemo, useState } from "react";
import type { DragEvent } from "react";

import {
  CalendarCheck,
  ChevronDown,
  Clock3,
  FileInput,
  GitBranch,
  Mail,
  MessageCircle,
  MessageSquareText,
  Search,
  Tag,
  UserPlus,
  UserRoundCheck,
  Square,
  PencilLine,
} from "lucide-react";

import type { LucideIcon } from "lucide-react";
import type { ActionDefinition } from "@/types/journey-builder";

export interface ActionItem extends ActionDefinition {
  iconComponent: LucideIcon;
}

interface ActionSidebarProps {
  onAddAction: (action: ActionItem) => void;
}

const DRAG_TYPE = "application/x-journey-action";

/* =========================================
   ACTION LIBRARY
========================================= */

const actionItems: ActionItem[] = [
  {
    id: "new-lead",
    title: "New Lead Added",
    description: "When a new lead enters the CRM",
    type: "trigger",
    category: "triggers",
    icon: "user-plus",
    color: "green",
    iconComponent: UserPlus,
    config: {
      triggerEvent: "new_lead_added",
    },
  },
  {
    id: "form-submitted",
    title: "Form Submitted",
    description: "When a lead submits a form",
    type: "trigger",
    category: "triggers",
    icon: "file-input",
    color: "blue",
    iconComponent: FileInput,
    config: {
      triggerEvent: "form_submitted",
    },
  },
  {
    id: "tag-added",
    title: "Tag Added",
    description: "When a CRM tag is applied",
    type: "trigger",
    category: "triggers",
    icon: "tag",
    color: "purple",
    iconComponent: Tag,
    config: {
      triggerEvent: "tag_added",
    },
  },
  {
    id: "field-updated",
    title: "Field Updated",
    description: "When a lead field changes",
    type: "trigger",
    category: "triggers",
    icon: "pencil",
    color: "blue",
    iconComponent: PencilLine,
    config: {
      triggerEvent: "field_updated",
    },
  },
  {
    id: "whatsapp-baileys",
    title: "WhatsApp (Baileys)",
    description: "Send using your Baileys connection",
    type: "whatsapp",
    category: "communication",
    icon: "whatsapp",
    color: "green",
    iconComponent: MessageCircle,
    config: {
      provider: "baileys",
      account: "Baileys WhatsApp (Select account)",
      messageType: "template",
      template: "property_details_v1",
      message:
        "Hi {{name}}, here are the property details you requested.",
    },
  },
  {
    id: "whatsapp-meta",
    title: "WhatsApp (Meta)",
    description: "Send using the Meta Cloud API",
    type: "whatsapp",
    category: "communication",
    icon: "whatsapp",
    color: "green",
    iconComponent: MessageCircle,
    config: {
      provider: "meta",
      account: "Meta WhatsApp (Select account)",
      messageType: "template",
      template: "property_details_v1",
      message:
        "Hi {{name}}, here are the property details you requested.",
    },
  },
  {
    id: "send-email",
    title: "Send Email",
    description: "Send a personalized email",
    type: "email",
    category: "communication",
    icon: "mail",
    color: "purple",
    iconComponent: Mail,
    config: {
      senderName: "Property Sales Team",
      subject: "Property details and brochure",
      message:
        "Hello {{name}}, please find the property details attached.",
    },
  },
  {
    id: "send-sms",
    title: "Send SMS",
    description: "Send an SMS to the lead",
    type: "sms",
    category: "communication",
    icon: "sms",
    color: "blue",
    iconComponent: MessageSquareText,
    config: {
      account: "PROPERTY Sender ID",
      message:
        "Hi {{name}}, are you still interested in this property?",
    },
  },
  {
    id: "delay",
    title: "Delay / Wait",
    description: "Wait for a selected duration",
    type: "delay",
    category: "flow",
    icon: "clock",
    color: "orange",
    iconComponent: Clock3,
    config: {
      duration: 1,
      unit: "days",
    },
  },
  {
    id: "condition",
    title: "If / Else Condition",
    description: "Split the journey based on a rule",
    type: "condition",
    category: "flow",
    icon: "branch",
    color: "blue",
    iconComponent: GitBranch,
    config: {
      conditionField: "lead_status",
      operator: "equals",
      value: "Interested",
    },
  },
  {
    id: "assign-user",
    title: "Assign to User",
    description: "Assign the lead to a teammate",
    type: "assign",
    category: "crm",
    icon: "user-check",
    color: "orange",
    iconComponent: UserRoundCheck,
    config: {
      assignee: "Property Sales Team",
    },
  },
  {
    id: "end-journey",
    title: "End Journey",
    description: "Stop this automation path",
    type: "end",
    category: "crm",
    icon: "square",
    color: "red",
    iconComponent: Square,
    config: {},
  },
];

/* =========================================
   ACTION GROUPS
========================================= */

const groups: {
  id: ActionDefinition["category"];
  label: string;
}[] = [
  { id: "triggers", label: "Triggers" },
  { id: "communication", label: "Communication" },
  { id: "flow", label: "Flow Control" },
  { id: "crm", label: "CRM Actions" },
];

/* =========================================
   ICON COLORS
========================================= */

const iconTone: Record<string, string> = {
  green: "bg-emerald-50 text-emerald-600",
  blue: "bg-blue-50 text-blue-600",
  purple: "bg-violet-50 text-violet-600",
  orange: "bg-amber-50 text-amber-600",
  red: "bg-rose-50 text-rose-600",
};

/* =========================================
   DRAG DATA TYPE
========================================= */

export interface JourneyDragData {
  id: string;
  title: string;
  description: string;
  type: ActionDefinition["type"];
  category: ActionDefinition["category"];
  icon: string;
  color: string;
  config: Record<string, unknown>;
}

/* =========================================
   ACTION SIDEBAR
========================================= */

export default function ActionSidebar({
  onAddAction,
}: ActionSidebarProps) {
  const [query, setQuery] = useState("");
  const [closedGroups, setClosedGroups] = useState<string[]>([]);
  const [draggingId, setDraggingId] = useState<string | null>(null);

  const filteredItems = useMemo(
    () =>
      actionItems.filter((item) =>
        `${item.title} ${item.description}`
          .toLowerCase()
          .includes(query.toLowerCase())
      ),
    [query]
  );

  /* =====================================
     TOGGLE GROUP
  ===================================== */

  const toggleGroup = (id: string) => {
    setClosedGroups((current) =>
      current.includes(id)
        ? current.filter((item) => item !== id)
        : [...current, id]
    );
  };

  /* =====================================
     DRAG START
  ===================================== */

  const handleDragStart = (
    event: DragEvent<HTMLButtonElement>,
    action: ActionItem
  ) => {
    const dragData: JourneyDragData = {
      id: action.id,
      title: action.title,
      description: action.description,
      type: action.type,
      category: action.category,
      icon: action.icon,
      color: action.color,
      config: action.config ?? {},
    };

    event.dataTransfer.setData(
      DRAG_TYPE,
      JSON.stringify(dragData)
    );

    // Fallback for browser compatibility.
    event.dataTransfer.setData(
      "text/plain",
      JSON.stringify(dragData)
    );

    event.dataTransfer.effectAllowed = "copy";

    setDraggingId(action.id);
  };

  /* =====================================
     DRAG END
  ===================================== */

  const handleDragEnd = () => {
    setDraggingId(null);
  };

  /* =====================================
     RENDER
  ===================================== */

  return (
    <aside className="flex h-full w-[250px] shrink-0 flex-col border-r border-[#E5EAF0] bg-white">

      {/* HEADER */}
      <div className="border-b border-[#EDF0F4] px-4 py-4">
        <h2 className="text-[14px] font-bold text-[#17324D]">
          Action Library
        </h2>

        <p className="mt-1 text-[11px] text-[#8293A8]">
          Drag an action onto the canvas
        </p>

        {/* SEARCH */}
        <div className="relative mt-3">
          <Search
            size={15}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-[#91A0B2]"
          />

          <input
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Search actions..."
            className="h-9 w-full rounded-lg border border-[#DDE7F0] bg-[#FBFCFE] pl-9 pr-3 text-[12px] text-[#17324D] outline-none transition focus:border-[#00A9B7] focus:ring-2 focus:ring-[#00A9B7]/10"
          />
        </div>
      </div>

      {/* ACTION LIST */}
      <div className="flex-1 space-y-4 overflow-y-auto px-3 py-3">

        {groups.map((group) => {
          const items = filteredItems.filter(
            (item) => item.category === group.id
          );

          if (!items.length) return null;

          const isClosed =
            closedGroups.includes(group.id) && !query;

          return (
            <section key={group.id}>

              {/* GROUP HEADING */}
              <button
                type="button"
                onClick={() => toggleGroup(group.id)}
                className="mb-2 flex w-full items-center justify-between px-1 text-left"
              >
                <span className="text-[11px] font-bold uppercase tracking-[0.08em] text-[#8293A8]">
                  {group.label}
                </span>

                <ChevronDown
                  size={15}
                  className={`text-[#8293A8] transition-transform ${
                    isClosed ? "-rotate-90" : ""
                  }`}
                />
              </button>

              {/* GROUP ACTIONS */}
              {!isClosed && (
                <div className="space-y-2">

                  {items.map((item) => {
                    const Icon = item.iconComponent;

                    const isDragging =
                      draggingId === item.id;

                    return (
                      <button
                        key={item.id}
                        type="button"
                        draggable

                        onDragStart={(event) =>
                          handleDragStart(event, item)
                        }

                        onDragEnd={handleDragEnd}

                        onClick={() => onAddAction(item)}

                        className={`
                          group flex w-full items-center gap-2.5
                          rounded-lg border px-2.5 py-2
                          text-left transition-all
                          cursor-grab active:cursor-grabbing
                          ${
                            isDragging
                              ? "border-[#00A9B7] bg-[#E5F8FA] opacity-50"
                              : "border-[#E1E9F1] bg-white hover:border-[#8EDBE0] hover:bg-[#F4FCFC] hover:shadow-sm"
                          }
                        `}

                        title="Drag to canvas or click to add"
                      >
                        {/* ICON */}
                        <span
                          className={`
                            flex h-8 w-8 shrink-0
                            items-center justify-center
                            rounded-lg
                            ${iconTone[item.color] ?? iconTone.blue}
                          `}
                        >
                          <Icon size={16} />
                        </span>

                        {/* ACTION DETAILS */}
                        <span className="min-w-0 flex-1">
                          <span className="block truncate text-[11px] font-semibold text-[#344258]">
                            {item.title}
                          </span>

                          <span className="mt-0.5 block truncate text-[9px] text-[#91A0B2]">
                            {item.description}
                          </span>
                        </span>

                        {/* DRAG INDICATOR */}
                        <CalendarCheck
                          size={13}
                          className="shrink-0 text-[#B0BCC9] opacity-0 transition group-hover:opacity-100"
                        />
                      </button>
                    );
                  })}

                </div>
              )}
            </section>
          );
        })}

        {/* EMPTY STATE */}
        {filteredItems.length === 0 && (
          <p className="px-2 py-6 text-center text-xs text-[#8293A8]">
            No actions found.
          </p>
        )}
      </div>

      {/* FOOTER */}
      <div className="border-t border-[#EDF0F4] px-4 py-3 text-[10px] text-[#8293A8]">
        Tip: Drag actions onto the canvas or click to add them.
      </div>

    </aside>
  );
}
