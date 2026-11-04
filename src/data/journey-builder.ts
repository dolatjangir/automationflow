import type { JourneyFlowEdge, JourneyFlowNode } from "@/types/journey-builder";

export const initialJourneyNodes: JourneyFlowNode[] = [
  {
    id: "trigger-1",
    type: "trigger",
    position: { x: 360, y: 24 },
    data: {
      title: "New Lead Added",
      description: "A new property lead enters the CRM",
      config: { triggerEvent: "new_lead_added" },
    },
  },
  {
    id: "delay-1",
    type: "delay",
    position: { x: 360, y: 155 },
    data: {
      title: "Wait 5 Minutes",
      description: "Wait before the first follow-up",
      config: { duration: 5, unit: "minutes" },
    },
  },
  {
    id: "whatsapp-1",
    type: "whatsapp",
    position: { x: 360, y: 286 },
    data: {
      title: "Send Property Details",
      description: "WhatsApp message with brochure and details",
      config: {
        provider: "meta",
        account: "Property CRM - Meta (Active)",
        messageType: "template",
        template: "property_details_v1",
        message: "Hi {{name}}, here are the property details you requested.",
      },
    },
  },
  {
    id: "condition-1",
    type: "condition",
    position: { x: 360, y: 417 },
    data: {
      title: "Customer Interested?",
      description: "Check whether the lead replied positively",
      config: {
        conditionField: "lead_status",
        operator: "equals",
        value: "Interested",
      },
    },
  },
  {
    id: "email-1",
    type: "email",
    position: { x: 95, y: 570 },
    data: {
      title: "Send Brochure",
      description: "Email the property brochure and pricing",
      config: {
        senderName: "Property Sales Team",
        subject: "Property details and brochure",
        message: "Hello {{name}}, please find the property brochure attached.",
      },
    },
  },
  {
    id: "sms-1",
    type: "sms",
    position: { x: 625, y: 570 },
    data: {
      title: "Send Follow-up SMS",
      description: "Send a short reminder to the lead",
      config: {
        account: "PROPERTY Sender ID",
        message: "Hi {{name}}, are you still interested in this property? Reply YES to know more.",
      },
    },
  },
  {
    id: "assign-1",
    type: "assign",
    position: { x: 95, y: 720 },
    data: {
      title: "Assign Salesperson",
      description: "Assign this lead to the property sales team",
      config: { assignee: "Property Sales Team" },
    },
  },
  {
    id: "end-1",
    type: "end",
    position: { x: 625, y: 720 },
    data: {
      title: "End Journey",
      description: "Stop this automation path",
      config: {},
    },
  },
];

export const initialJourneyEdges: JourneyFlowEdge[] = [
  { id: "e-trigger-delay", source: "trigger-1", target: "delay-1", type: "smoothstep" },
  { id: "e-delay-whatsapp", source: "delay-1", target: "whatsapp-1", type: "smoothstep" },
  { id: "e-whatsapp-condition", source: "whatsapp-1", target: "condition-1", type: "smoothstep" },
  {
    id: "e-condition-email",
    source: "condition-1",
    sourceHandle: "yes",
    target: "email-1",
    type: "smoothstep",
    label: "Yes",
    labelStyle: { fill: "#15803d", fontWeight: 700, fontSize: 11 },
    labelBgStyle: { fill: "#dcfce7", fillOpacity: 1 },
    labelBgPadding: [8, 4],
    labelBgBorderRadius: 8,
  },
  {
    id: "e-condition-sms",
    source: "condition-1",
    sourceHandle: "no",
    target: "sms-1",
    type: "smoothstep",
    label: "No",
    labelStyle: { fill: "#b91c1c", fontWeight: 700, fontSize: 11 },
    labelBgStyle: { fill: "#fee2e2", fillOpacity: 1 },
    labelBgPadding: [8, 4],
    labelBgBorderRadius: 8,
  },
  { id: "e-email-assign", source: "email-1", target: "assign-1", type: "smoothstep" },
  { id: "e-sms-end", source: "sms-1", target: "end-1", type: "smoothstep" },
];
