
import type { Edge, Node } from "@xyflow/react";

/* =========================================
   JOURNEY NODE TYPES
========================================= */

export type JourneyNodeType =
  | "trigger"
  | "delay"
  | "whatsapp"
  | "email"
  | "sms"
  | "condition"
  | "assign"
  | "ai_agent"
  | "end";

/* =========================================
   ACTION CATEGORIES
========================================= */

export type JourneyActionCategory =
  | "triggers"
  | "communication"
  | "flow"
  | "crm"
  | "ai";

/* =========================================
   AI AGENT CONFIGURATION
========================================= */

export type AIProvider = "openai" | "gemini" | "groq";

export type AIOutputFormat = "text" | "json";

export interface AIAgentConfig {
  provider?: AIProvider;
  model?: string;
  instructions?: string;
  input?: string;
  outputFormat?: AIOutputFormat;
  outputKey?: string;
  temperature?: number;
  maxTokens?: number;
}

/* =========================================
   NODE CONFIGURATION
========================================= */

export interface JourneyNodeConfig
  extends Record<string, unknown> {
  provider?: "baileys" | "meta" | AIProvider;
  account?: string;
  messageType?: "template" | "custom";
  template?: string;
  message?: string;
  subject?: string;
  senderName?: string;
  duration?: number;
  unit?: "minutes" | "hours" | "days";
  conditionField?: string;
  operator?: string;
  value?: string;
  assignee?: string;
  triggerEvent?: string;

  // AI Agent configuration
  model?: string;
  instructions?: string;
  input?: string;
  outputFormat?: AIOutputFormat;
  outputKey?: string;
  temperature?: number;
  maxTokens?: number;
}

/* =========================================
   NODE DATA
========================================= */

export interface JourneyNodeData
  extends Record<string, unknown> {
  title: string;
  description: string;
  config: JourneyNodeConfig;

  // Original action information
  actionId?: string;
  category?: JourneyActionCategory;
  icon?: string;
  color?: string;
}

/* =========================================
   REACT FLOW NODE TYPES
========================================= */

export type JourneyFlowNode = Node<
  JourneyNodeData,
  JourneyNodeType
>;

export type JourneyFlowEdge = Edge;

/* =========================================
   ACTION DEFINITION
========================================= */

export interface ActionDefinition {
  id: string;
  title: string;
  description: string;
  type: JourneyNodeType;
  category: JourneyActionCategory;
  icon: string;
  color: string;
  config?: JourneyNodeConfig;
}

/* =========================================
   SAVED WORKFLOW
========================================= */

export interface SavedJourneyWorkflow {
  id: string;
  name: string;
  status: "draft" | "active";
  nodes: JourneyFlowNode[];
  edges: JourneyFlowEdge[];
  updatedAt: string;
}
