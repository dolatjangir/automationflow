
import type { LucideIcon } from "lucide-react";
import { Handle, Position } from "@xyflow/react";
import type { JourneyNodeData } from "@/types/journey-builder";

interface WorkflowNodeCardProps {
  data: JourneyNodeData;
  icon: LucideIcon;
  tone: "green" | "purple" | "blue" | "orange" | "red";
  selected?: boolean;
  showTarget?: boolean;
  sourceHandles?: "single" | "branch" | "none";
}

const toneClasses = {
  green: {
    border: "border-emerald-300",
    icon: "bg-emerald-50 text-emerald-600",
    accent: "bg-emerald-500",
  },
  purple: {
    border: "border-violet-300",
    icon: "bg-violet-50 text-violet-600",
    accent: "bg-violet-500",
  },
  blue: {
    border: "border-blue-300",
    icon: "bg-blue-50 text-blue-600",
    accent: "bg-blue-500",
  },
  orange: {
    border: "border-amber-300",
    icon: "bg-amber-50 text-amber-600",
    accent: "bg-amber-500",
  },
  red: {
    border: "border-rose-300",
    icon: "bg-rose-50 text-rose-600",
    accent: "bg-rose-500",
  },
};

export default function WorkflowNodeCard({
  data,
  icon: Icon,
  tone,
  selected = false,
  showTarget = true,
  sourceHandles = "single",
}: WorkflowNodeCardProps) {
  const colors = toneClasses[tone];

  return (
    <div
      className={`
        relative min-w-[230px] rounded-xl border
        bg-white px-3 py-3
        shadow-[0_3px_12px_rgba(22,50,77,0.07)]
        transition-shadow
        ${colors.border}
        ${selected
          ? "ring-2 ring-[#00A9B7]/30 shadow-lg"
          : "hover:shadow-md"
        }
      `}
    >
      {/* INPUT HANDLE */}
      {showTarget && (
        <Handle
          type="target"
          position={Position.Top}
          id="input"
          className="!h-2.5 !w-2.5 !border-2 !border-white !bg-slate-400"
        />
      )}

      {/* NODE CONTENT */}
      <div className="flex items-center gap-3">
        <div
          className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${colors.icon}`}
        >
          <Icon size={19} strokeWidth={2} />
        </div>

        <div className="min-w-0 flex-1">
          <p className="truncate text-[13px] font-bold text-[#17324D]">
            {data.title}
          </p>

          <p className="mt-0.5 line-clamp-2 text-[11px] leading-4 text-[#8293A8]">
            {data.description}
          </p>
        </div>

        <span
          className={`h-2 w-2 shrink-0 rounded-full ${colors.accent}`}
        />
      </div>

      {/* SINGLE OUTPUT */}
      {sourceHandles === "single" && (
        <Handle
          type="source"
          position={Position.Bottom}
          id="output"
          className="!h-2.5 !w-2.5 !border-2 !border-white !bg-slate-400"
        />
      )}

      {/* YES / NO OUTPUTS */}
      {sourceHandles === "branch" && (
        <>
          <Handle
            id="yes"
            type="source"
            position={Position.Bottom}
            style={{ left: "30%" }}
            className="!h-3 !w-3 !border-2 !border-white !bg-emerald-500"
          />

          <Handle
            id="no"
            type="source"
            position={Position.Bottom}
            style={{ left: "70%" }}
            className="!h-3 !w-3 !border-2 !border-white !bg-rose-500"
          />

          {/* OUTPUT LABELS */}
          <div className="absolute -bottom-7 left-[30%] -translate-x-1/2 text-[10px] font-bold text-emerald-600">
            YES
          </div>

          <div className="absolute -bottom-7 left-[70%] -translate-x-1/2 text-[10px] font-bold text-rose-500">
            NO
          </div>
        </>
      )}
    </div>
  );
}
