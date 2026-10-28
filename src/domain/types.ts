export type Level = 0 | 1 | 2;

export interface Business {
  key: string;
  name: string;
  cost: number;
  u1_cost: number;
  u2_cost: number;
  is_provisional: boolean;
  sort_order: number;
}

export interface StartReward {
  cash: number;
}
