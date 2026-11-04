import { MessageSquareText } from "lucide-react";
import type { NodeProps } from "@xyflow/react";
import type { JourneyFlowNode } from "@/types/journey-builder";
import WorkflowNodeCard from "./WorkflowNodeCard";

export default function SMSNode({ data, selected }: NodeProps<JourneyFlowNode>) {
  return <WorkflowNodeCard data={data} icon={MessageSquareText} tone="blue" selected={selected} />;
}
