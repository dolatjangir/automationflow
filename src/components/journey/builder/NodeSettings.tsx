
"use client";

import { useEffect, useState } from "react";

import {
  Check,
  Eye,
  MessageCircle,
  Mail,
  MessageSquareText,
  Clock3,
  GitBranch,
  UserRoundCheck,
  Zap,
  X,
  Info,
  AlertCircle,
} from "lucide-react";

import type {
  JourneyFlowNode,
  JourneyNodeConfig,
  JourneyNodeData,
  JourneyNodeType,
} from "@/types/journey-builder";

/* =========================================
   TYPES
========================================= */

interface NodeSettingsProps {
  node: JourneyFlowNode | null;
  onChange: (patch: Partial<JourneyNodeData>) => void;
  onClose: () => void;
}

/* =========================================
   STYLES
========================================= */

const fieldClass =
  "mt-1 h-9 w-full rounded-lg border border-[#DDE7F0] bg-white px-3 text-[12px] text-[#344258] outline-none transition focus:border-[#00A9B7] focus:ring-2 focus:ring-[#00A9B7]/10";

const labelClass =
  "text-[11px] font-semibold text-[#536579]";

const textareaClass =
  "mt-1 w-full resize-y rounded-lg border border-[#DDE7F0] bg-white px-3 py-2.5 text-[12px] leading-5 text-[#344258] outline-none transition focus:border-[#00A9B7] focus:ring-2 focus:ring-[#00A9B7]/10";

/* =========================================
   NODE METADATA
========================================= */

const nodeMeta: Record<
  JourneyNodeType,
  {
    title: string;
    subtitle: string;
    icon: typeof MessageCircle;
    tone: string;
  }
> = {
  trigger: {
    title: "Journey Trigger",
    subtitle: "Choose when this journey starts",
    icon: Zap,
    tone: "text-emerald-600 bg-emerald-50",
  },

  delay: {
    title: "Delay / Wait",
    subtitle: "Pause this journey for a period",
    icon: Clock3,
    tone: "text-violet-600 bg-violet-50",
  },

  whatsapp: {
    title: "WhatsApp Message",
    subtitle: "Send a WhatsApp message",
    icon: MessageCircle,
    tone: "text-emerald-600 bg-emerald-50",
  },

  email: {
    title: "Send Email",
    subtitle: "Send an email to the contact",
    icon: Mail,
    tone: "text-violet-600 bg-violet-50",
  },

  sms: {
    title: "Send SMS",
    subtitle: "Send an SMS to the contact",
    icon: MessageSquareText,
    tone: "text-blue-600 bg-blue-50",
  },

  condition: {
    title: "If / Else Condition",
    subtitle: "Choose the condition for this branch",
    icon: GitBranch,
    tone: "text-blue-600 bg-blue-50",
  },

  assign: {
    title: "Assign to User",
    subtitle: "Select the owner for this lead",
    icon: UserRoundCheck,
    tone: "text-amber-600 bg-amber-50",
  },

  end: {
    title: "End Journey",
    subtitle: "Stop this automation path",
    icon: X,
    tone: "text-rose-600 bg-rose-50",
  },
};

/* =========================================
   NODE SETTINGS COMPONENT
========================================= */

export default function NodeSettings({
  node,
  onChange,
  onClose,
}: NodeSettingsProps) {
  const [tab, setTab] = useState<"settings" | "preview">(
    "settings"
  );

  // Return to Settings whenever a different node is selected.
  useEffect(() => {
    setTab("settings");
  }, [node?.id]);

  const config: JourneyNodeConfig =
    node?.data.config ?? {};

  const setConfig = (
    patch: Partial<JourneyNodeConfig>
  ) => {
    onChange({
      config: {
        ...config,
        ...patch,
      },
    });
  };

  const setTitle = (value: string) => {
    onChange({ title: value });
  };

  /* =========================================
     EMPTY STATE
  ========================================= */

  if (!node) {
    return (
      <aside className="flex h-full w-[320px] shrink-0 flex-col border-l border-[#E5EAF0] bg-white">
        <div className="border-b border-[#EDF0F4] px-4 py-4">
          <h2 className="text-[14px] font-bold text-[#17324D]">
            Node Settings
          </h2>

          <p className="mt-1 text-[11px] text-[#8293A8]">
            Select a node to configure its settings.
          </p>
        </div>

        <div className="flex flex-1 flex-col items-center justify-center px-7 text-center">
          <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-[#E5F8FA] text-[#00A9B7]">
            <GitBranch size={25} />
          </div>

          <p className="mt-4 text-[13px] font-semibold text-[#344258]">
            No node selected
          </p>

          <p className="mt-1 text-[11px] leading-5 text-[#8293A8]">
            Click any workflow node on the canvas to edit
            its configuration here.
          </p>
        </div>
      </aside>
    );
  }

  /* =========================================
     SELECTED NODE DATA
  ========================================= */

  const nodeType = node.type ?? "trigger";
  const meta = nodeMeta[nodeType];
  const Icon = meta.icon;

  const provider = config.provider ?? "meta";

  // Sidebar initially supplies placeholder account strings.
  // Show an empty selection until a real account is selected.
  const rawAccount = String(config.account ?? "");

  const accountValue = rawAccount.includes(
    "(Select account)"
  )
    ? ""
    : rawAccount;

  const message = String(config.message ?? "");
  const messageLength = message.length;

  /* =========================================
     RENDER
  ========================================= */

  return (
    <aside className="flex h-full w-[320px] shrink-0 flex-col border-l border-[#E5EAF0] bg-white">

      {/* HEADER */}
      <div className="flex items-center justify-between border-b border-[#EDF0F4] px-4 py-3.5">
        <div>
          <h2 className="text-[14px] font-bold text-[#17324D]">
            Node Settings
          </h2>

          <p className="mt-0.5 text-[10px] text-[#8293A8]">
            Configure the selected step
          </p>
        </div>

        <button
          type="button"
          onClick={onClose}
          aria-label="Close settings"
          className="flex h-8 w-8 items-center justify-center rounded-lg text-[#8293A8] hover:bg-[#F1F5F9]"
        >
          <X size={16} />
        </button>
      </div>

      {/* NODE INFORMATION */}
      <div className="border-b border-[#EDF0F4] p-3">
        <div className="flex items-center gap-3 rounded-xl border border-[#DCEFEB] bg-[#F3FCFA] p-3">
          <span
            className={`flex h-9 w-9 items-center justify-center rounded-lg ${meta.tone}`}
          >
            <Icon size={18} />
          </span>

          <div className="min-w-0">
            <p className="text-[12px] font-bold text-[#17324D]">
              {nodeType === "whatsapp"
                ? `WhatsApp (${provider === "baileys" ? "Baileys" : "Meta"})`
                : meta.title}
            </p>

            <p className="mt-0.5 text-[10px] text-[#8293A8]">
              {meta.subtitle}
            </p>
          </div>
        </div>

        {/* SETTINGS / PREVIEW TABS */}
        <div className="mt-3 grid grid-cols-2 gap-2 rounded-lg bg-[#F3F6F9] p-1">
          <button
            type="button"
            onClick={() => setTab("settings")}
            className={`rounded-md py-2 text-[11px] font-semibold ${
              tab === "settings"
                ? "bg-[#00A9B7] text-white shadow-sm"
                : "text-[#536579]"
            }`}
          >
            Settings
          </button>

          <button
            type="button"
            onClick={() => setTab("preview")}
            className={`rounded-md py-2 text-[11px] font-semibold ${
              tab === "preview"
                ? "bg-[#00A9B7] text-white shadow-sm"
                : "text-[#536579]"
            }`}
          >
            <Eye size={13} className="mr-1 inline" />
            Preview
          </button>
        </div>
      </div>

      {/* SETTINGS CONTENT */}
      <div className="flex-1 space-y-4 overflow-y-auto px-4 py-4">

        {tab === "preview" ? (
          /* =================================
             PREVIEW
          ================================= */
          <div className="rounded-xl border border-[#DDE7F0] bg-[#F8FAFC] p-4">
            <p className="mb-3 text-[11px] font-bold text-[#536579]">
              Step Preview
            </p>

            <p className="text-[13px] font-semibold text-[#17324D]">
              {node.data.title}
            </p>

            <p className="mt-1 text-[11px] leading-5 text-[#8293A8]">
              {node.data.description}
            </p>

            {nodeType === "whatsapp" && (
              <p className="mt-3 text-[10px] font-semibold text-emerald-700">
                Provider: {provider === "baileys" ? "Baileys WhatsApp" : "Meta WhatsApp"}
              </p>
            )}

            {config.message && (
              <div className="mt-3 whitespace-pre-wrap rounded-lg bg-white p-3 text-[11px] leading-5 text-[#344258]">
                {message}
              </div>
            )}

            {nodeType === "delay" && (
              <p className="mt-3 text-[11px] text-[#536579]">
                Wait for {config.duration ?? 1}{" "}
                {config.unit ?? "days"}.
              </p>
            )}

            {nodeType === "condition" && (
              <p className="mt-3 text-[11px] text-[#536579]">
                {String(config.conditionField ?? "lead_status")}{" "}
                {String(config.operator ?? "equals")}{" "}
                {String(config.value ?? "Interested")}
              </p>
            )}
          </div>
        ) : (
          <>
            {/* NODE NAME */}
            <div>
              <label className={labelClass}>
                Node Name <span className="text-rose-500">*</span>
              </label>

              <input
                className={fieldClass}
                value={node.data.title}
                onChange={(event) =>
                  setTitle(event.target.value)
                }
                placeholder="Enter node name"
              />
            </div>

            {/* =================================
                TRIGGER SETTINGS
            ================================= */}
            {nodeType === "trigger" && (
              <div>
                <label className={labelClass}>
                  Trigger Event
                </label>

                <select
                  className={fieldClass}
                  value={String(
                    config.triggerEvent ?? "new_lead_added"
                  )}
                  onChange={(event) => {
                    setConfig({
                      triggerEvent: event.target.value,
                    });
                  }}
                >
                  <option value="new_lead_added">
                    New Lead Added
                  </option>
                  <option value="form_submitted">
                    Form Submitted
                  </option>
                  <option value="tag_added">
                    Tag Added
                  </option>
                  <option value="field_updated">
                    Field Updated
                  </option>
                </select>

                <p className="mt-1.5 text-[10px] text-[#91A0B2]">
                  Configure which CRM event starts this journey.
                </p>
              </div>
            )}

            {/* =================================
                WHATSAPP SETTINGS
            ================================= */}
            {nodeType === "whatsapp" && (
              <>
                <div>
                  <label className={labelClass}>
                    WhatsApp Provider{" "}
                    <span className="text-rose-500">*</span>
                  </label>

                  <select
                    className={fieldClass}
                    value={provider}
                    onChange={(event) => {
                      const nextProvider =
                        event.target.value as "baileys" | "meta";

                      setConfig({
                        provider: nextProvider,
                        account: "",
                      });
                    }}
                  >
                    <option value="baileys">
                      Baileys WhatsApp
                    </option>

                    <option value="meta">
                      Meta WhatsApp (Cloud API)
                    </option>
                  </select>
                </div>

                <div>
                  <label className={labelClass}>
                    Connected Account{" "}
                    <span className="text-rose-500">*</span>
                  </label>

                  <select
                    className={fieldClass}
                    value={accountValue}
                    onChange={(event) => {
                      setConfig({
                        account: event.target.value,
                      });
                    }}
                  >
                    <option value="">
                      Select connected account
                    </option>

                    {provider === "baileys" ? (
                      <option value="Property CRM - Baileys (Active)">
                        Property CRM - Baileys (Active)
                      </option>
                    ) : (
                      <option value="Property CRM - Meta (Active)">
                        Property CRM - Meta (Active)
                      </option>
                    )}
                  </select>

                  <p className="mt-1 text-[10px] text-[#8293A8]">
                    Example account options. Connect your
                    actual channel accounts through your
                    Outreach Channels API.
                  </p>
                </div>

                <div>
                  <label className={labelClass}>
                    Message Type
                  </label>

                  <select
                    className={fieldClass}
                    value={config.messageType ?? "template"}
                    onChange={(event) => {
                      setConfig({
                        messageType: event.target.value as
                          | "template"
                          | "custom",
                      });
                    }}
                  >
                    <option value="template">
                      Template Message
                    </option>

                    <option value="custom">
                      Custom Message
                    </option>
                  </select>
                </div>

                {config.messageType !== "custom" && (
                  <div>
                    <label className={labelClass}>
                      Message Template
                    </label>

                    <select
                      className={fieldClass}
                      value={String(
                        config.template ?? "property_details_v1"
                      )}
                      onChange={(event) => {
                        setConfig({
                          template: event.target.value,
                        });
                      }}
                    >
                      <option value="property_details_v1">
                        property_details_v1
                      </option>

                      <option value="site_visit_reminder">
                        site_visit_reminder
                      </option>

                      <option value="new_property_alert">
                        new_property_alert
                      </option>
                    </select>
                  </div>
                )}

                <div>
                  <label className={labelClass}>
                    {config.messageType === "custom"
                      ? "Custom Message"
                      : "Message Preview"}
                  </label>

                  <textarea
                    rows={5}
                    readOnly={config.messageType !== "custom"}
                    className={`${textareaClass} ${
                      config.messageType !== "custom"
                        ? "cursor-not-allowed bg-[#F8FAFC]"
                        : ""
                    }`}
                    value={message}
                    onChange={(event) => {
                      setConfig({
                        message: event.target.value,
                      });
                    }}
                  />

                  <p className="mt-1 text-[10px] text-[#8293A8]">
                    Personalization: {"{{name}}"}, {"{{city}}"},{" "}
                    {"{{property_type}}"}
                  </p>
                </div>
              </>
            )}

            {/* =================================
                EMAIL SETTINGS
            ================================= */}
            {nodeType === "email" && (
              <>
                <div>
                  <label className={labelClass}>
                    Sender Name
                  </label>

                  <input
                    className={fieldClass}
                    value={String(config.senderName ?? "")}
                    onChange={(event) => {
                      setConfig({
                        senderName: event.target.value,
                      });
                    }}
                    placeholder="Property Sales Team"
                  />
                </div>

                <div>
                  <label className={labelClass}>
                    Sender Email
                  </label>

                  <input
                    type="email"
                    className={fieldClass}
                    value={String(config.senderEmail ?? "")}
                    onChange={(event) => {
                      setConfig({
                        senderEmail: event.target.value,
                      });
                    }}
                    placeholder="sales@example.com"
                  />
                </div>

                <div>
                  <label className={labelClass}>
                    Subject
                  </label>

                  <input
                    className={fieldClass}
                    value={String(config.subject ?? "")}
                    onChange={(event) => {
                      setConfig({
                        subject: event.target.value,
                      });
                    }}
                    placeholder="Property details and brochure"
                  />
                </div>

                <div>
                  <label className={labelClass}>
                    Email Content
                  </label>

                  <textarea
                    rows={7}
                    className={textareaClass}
                    value={message}
                    onChange={(event) => {
                      setConfig({
                        message: event.target.value,
                      });
                    }}
                    placeholder="Write your email..."
                  />
                </div>
              </>
            )}

            {/* =================================
                SMS SETTINGS
            ================================= */}
            {nodeType === "sms" && (
              <>
                <div>
                  <label className={labelClass}>
                    Sender ID
                  </label>

                  <input
                    className={fieldClass}
                    value={String(config.account ?? "")}
                    onChange={(event) => {
                      setConfig({
                        account: event.target.value,
                      });
                    }}
                    placeholder="PROPERTY"
                  />
                </div>

                <div>
                  <label className={labelClass}>
                    SMS Message
                  </label>

                  <textarea
                    rows={5}
                    maxLength={160}
                    className={textareaClass}
                    value={message}
                    onChange={(event) => {
                      setConfig({
                        message: event.target.value,
                      });
                    }}
                    placeholder="Write your SMS..."
                  />

                  <div className="mt-1 flex items-center justify-between">
                    <p className="text-[10px] text-[#8293A8]">
                      Maximum 160 characters for this basic counter.
                    </p>

                    <span
                      className={`text-[10px] font-semibold ${
                        messageLength >= 150
                          ? "text-rose-500"
                          : "text-[#8293A8]"
                      }`}
                    >
                      {messageLength}/160
                    </span>
                  </div>
                </div>
              </>
            )}

            {/* =================================
                DELAY SETTINGS
            ================================= */}
            {nodeType === "delay" && (
              <>
                <div>
                  <label className={labelClass}>
                    Wait Duration
                  </label>

                  <div className="grid grid-cols-2 gap-3">
                    <input
                      type="number"
                      min={1}
                      className={fieldClass}
                      value={Number(config.duration ?? 1)}
                      onChange={(event) => {
                        const value = Number(event.target.value);

                        setConfig({
                          duration: Math.max(
                            1,
                            Number.isFinite(value) ? value : 1
                          ),
                        });
                      }}
                    />

                    <select
                      className={fieldClass}
                      value={config.unit ?? "days"}
                      onChange={(event) => {
                        setConfig({
                          unit: event.target.value as
                            | "minutes"
                            | "hours"
                            | "days",
                        });
                      }}
                    >
                      <option value="minutes">Minutes</option>
                      <option value="hours">Hours</option>
                      <option value="days">Days</option>
                    </select>
                  </div>
                </div>

                <div className="flex items-start gap-2 rounded-lg bg-violet-50 p-3">
                  <Clock3
                    size={15}
                    className="mt-0.5 text-violet-600"
                  />

                  <p className="text-[10px] leading-5 text-violet-700">
                    The next workflow step will wait for the
                    configured duration.
                  </p>
                </div>
              </>
            )}

            {/* =================================
                CONDITION SETTINGS
            ================================= */}
            {nodeType === "condition" && (
              <>
                <div>
                  <label className={labelClass}>
                    Contact Field
                  </label>

                  <select
                    className={fieldClass}
                    value={String(
                      config.conditionField ?? "lead_status"
                    )}
                    onChange={(event) => {
                      setConfig({
                        conditionField: event.target.value,
                      });
                    }}
                  >
                    <option value="lead_status">Lead Status</option>
                    <option value="city">City</option>
                    <option value="budget">Budget</option>
                    <option value="property_type">Property Type</option>
                    <option value="last_reply">Last Reply</option>
                  </select>
                </div>

                <div>
                  <label className={labelClass}>
                    Operator
                  </label>

                  <select
                    className={fieldClass}
                    value={String(config.operator ?? "equals")}
                    onChange={(event) => {
                      setConfig({
                        operator: event.target.value,
                      });
                    }}
                  >
                    <option value="equals">Equals</option>
                    <option value="not_equals">Does not equal</option>
                    <option value="contains">Contains</option>
                    <option value="greater_than">Greater than</option>
                    <option value="less_than">Less than</option>
                  </select>
                </div>

                <div>
                  <label className={labelClass}>
                    Comparison Value
                  </label>

                  <input
                    className={fieldClass}
                    value={String(config.value ?? "")}
                    onChange={(event) => {
                      setConfig({
                        value: event.target.value,
                      });
                    }}
                    placeholder="Interested"
                  />
                </div>

                <div className="rounded-lg border border-[#DDE7F0] bg-[#F8FAFC] p-3">
                  <p className="text-[10px] font-semibold text-[#536579]">
                    Branch behavior
                  </p>

                  <div className="mt-2 flex items-center gap-2 text-[10px] text-emerald-700">
                    <span className="h-2 w-2 rounded-full bg-emerald-500" />
                    Yes - Condition matches
                  </div>

                  <div className="mt-2 flex items-center gap-2 text-[10px] text-rose-600">
                    <span className="h-2 w-2 rounded-full bg-rose-500" />
                    No - Condition does not match
                  </div>
                </div>
              </>
            )}

            {/* =================================
                ASSIGN USER
            ================================= */}
            {nodeType === "assign" && (
              <div>
                <label className={labelClass}>
                  Assign To
                </label>

                <select
                  className={fieldClass}
                  value={String(
                    config.assignee ?? "Property Sales Team"
                  )}
                  onChange={(event) => {
                    setConfig({
                      assignee: event.target.value,
                    });
                  }}
                >
                  <option value="Property Sales Team">
                    Property Sales Team
                  </option>

                  <option value="Admin">Admin</option>

                  <option value="Sales Manager">
                    Sales Manager
                  </option>
                </select>

                <p className="mt-1 text-[10px] text-[#8293A8]">
                  Sample users. Connect your CRM team API
                  to load actual users.
                </p>
              </div>
            )}

            {/* =================================
                END JOURNEY
            ================================= */}
            {nodeType === "end" && (
              <div className="rounded-lg bg-rose-50 p-3">
                <div className="flex items-center gap-2 text-rose-700">
                  <Info size={15} />
                  <p className="text-[11px] font-semibold">
                    End Journey
                  </p>
                </div>

                <p className="mt-2 text-[11px] leading-5 text-rose-700">
                  This node ends the current automation path.
                  No further actions will execute after this
                  step on that path.
                </p>
              </div>
            )}
          </>
        )}
      </div>

      {/* FOOTER */}
      <div className="border-t border-[#EDF0F4] p-3">
        <div className="flex items-center gap-2 text-[10px] text-[#8293A8]">
          <Check size={13} className="text-emerald-500" />
          Changes update the canvas immediately.
        </div>
      </div>
    </aside>
  );
}
