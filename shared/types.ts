export type ItineraryItem = {
  id: string;
  dayId: string;
  time: string;
  title: string;
  location: string;
  category: "stay" | "food" | "culture" | "transit" | "nature";
  notes: string;
  source: "human" | "agent";
};

export type ItineraryDay = {
  id: string;
  date: string;
  label: string;
  items: ItineraryItem[];
};

export type ItineraryBoard = {
  title: string;
  destination: string;
  updatedAt: string;
  updatedBy: "human" | "agent" | "system";
  days: ItineraryDay[];
};

export type CreateDayInput = Pick<ItineraryDay, "date" | "label">;
export type UpdateDayInput = Partial<CreateDayInput>;
export type CreateItemInput = Omit<ItineraryItem, "id" | "source"> & { source?: ItineraryItem["source"] };
export type UpdateItemInput = Partial<Omit<ItineraryItem, "id" | "dayId" | "source">> & { dayId?: string; source?: ItineraryItem["source"] };
