import { Workflow, MousePointer2 } from "lucide-react";

interface JourneyToolbarProps {
  nodeCount: number;
  edgeCount: number;
}

export default function JourneyToolbar({ nodeCount, edgeCount }: JourneyToolbarProps) {
  return (
    <div className="pointer-events-none absolute left-4 top-4 z-10 flex items-center gap-3 rounded-lg border border-[#E4EBF2] bg-white/95 px-3 py-2 shadow-sm backdrop-blur">
      <span className="flex h-7 w-7 items-center justify-center rounded-md bg-[#E5F8FA] text-[#008F9F]"><Workflow size={15} /></span>
      <div>
        <p className="text-[11px] font-bold text-[#344258]">Workflow Canvas</p>
        <p className="text-[9px] text-[#8293A8]">{nodeCount} steps · {edgeCount} connections</p>
      </div>
      <span className="ml-1 flex items-center gap-1 border-l border-[#E5EAF0] pl-3 text-[9px] text-[#91A0B2]"><MousePointer2 size={12} /> Drag to arrange</span>
    </div>
  );
}
