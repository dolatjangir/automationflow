export type JourneyStatus = "active" | "paused" | "draft";

export type JourneyChannel =
  | "baileys_whatsapp"
  | "meta_whatsapp"
  | "email"
  | "sms";

export type JourneyStatusFilter = "all" | JourneyStatus;
export type JourneyChannelFilter = "all" | JourneyChannel;
export type JourneySortOption = "updated_desc" | "updated_asc" | "name_asc" | "enrolled_desc";

export interface Journey {
  id: string;
  name: string;
  description: string;
  trigger: string;
  channels: JourneyChannel[];
  enrolled: number;
  completed: number;
  status: JourneyStatus;
  updatedAt: string;
  updatedLabel: string;
}
