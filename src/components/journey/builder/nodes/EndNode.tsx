import { Square } from "lucide-react";
import type { NodeProps } from "@xyflow/react";
import type { JourneyFlowNode } from "@/types/journey-builder";
import WorkflowNodeCard from "./WorkflowNodeCard";

export default function EndNode({ data, selected }: NodeProps<JourneyFlowNode>) {
  return <WorkflowNodeCard data={data} icon={Square} tone="red" selected={selected} sourceHandles="none" />;
}
