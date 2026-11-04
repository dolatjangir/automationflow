
import { GitBranch } from "lucide-react";
import type { NodeProps } from "@xyflow/react";

import type { JourneyFlowNode } from "@/types/journey-builder";
import WorkflowNodeCard from "./WorkflowNodeCard";

export default function ConditionNode({
  data,
  selected,
}: NodeProps<JourneyFlowNode>) {
  return (
    <WorkflowNodeCard
      data={data}
      icon={GitBranch}
      tone="blue"
      selected={selected}
      showTarget
      sourceHandles="branch"
    />
  );
}
