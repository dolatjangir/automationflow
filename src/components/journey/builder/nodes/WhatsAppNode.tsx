import { MessageCircle } from "lucide-react";
import type { NodeProps } from "@xyflow/react";
import type { JourneyFlowNode } from "@/types/journey-builder";
import WorkflowNodeCard from "./WorkflowNodeCard";

export default function WhatsAppNode({ data, selected }: NodeProps<JourneyFlowNode>) {
  return <WorkflowNodeCard data={data} icon={MessageCircle} tone="green" selected={selected} />;
}
