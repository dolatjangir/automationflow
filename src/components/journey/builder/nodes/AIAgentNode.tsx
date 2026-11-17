
import { Bot } from "lucide-react";
import type { NodeProps } from "@xyflow/react";
import type { JourneyFlowNode } from "@/types/journey-builder";
import WorkflowNodeCard from "./WorkflowNodeCard";

export default function AIAgentNode({
  data,
  selected,
}: NodeProps<JourneyFlowNode>) {
  return (
    <WorkflowNodeCard
      data={data}
      icon={Bot}
      tone="indigo"
      selected={selected}
    />
  );
}
