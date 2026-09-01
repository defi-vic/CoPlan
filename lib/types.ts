export type Activity = {
  id: string;
  title: string;
  cost: number;
  notes: string;
  order: number;
};

export type Board = {
  destination: string;
  dates: string;
  budget: number;
  spent: number;
  activities: Activity[];
};

export type BoardPatch = Partial<Pick<Board, "destination" | "dates" | "budget">>;
export type ActivityInput = { title: string; cost?: number; notes?: string };
export type ActivityPatch = Partial<ActivityInput>;
