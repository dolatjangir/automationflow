import { UserRoundCheck } from "lucide-react";
import type { NodeProps } from "@xyflow/react";
import type { JourneyFlowNode } from "@/types/journey-builder";
import WorkflowNodeCard from "./WorkflowNodeCard";

export default function AssignUserNode({ data, selected }: NodeProps<JourneyFlowNode>) {
  return <WorkflowNodeCard data={data} icon={UserRoundCheck} tone="orange" selected={selected} />;
}
