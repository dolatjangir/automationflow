import { Clock3 } from "lucide-react";
import type { NodeProps } from "@xyflow/react";
import type { JourneyFlowNode } from "@/types/journey-builder";
import WorkflowNodeCard from "./WorkflowNodeCard";

export default function DelayNode({ data, selected }: NodeProps<JourneyFlowNode>) {
  return <WorkflowNodeCard data={data} icon={Clock3} tone="purple" selected={selected} />;
}
