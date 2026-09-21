export type Level = 0 | 1 | 2;

export interface Business {
  key: string;
  name: string;
  cost: number;
  initial_cv: number;
  u1_cost: number;
  u2_cost: number;
  u1_cv: number;
  u2_cv: number;
  is_provisional: boolean;
  sort_order: number;
}

export interface StartReward {
  cash: number;
  cv: number;
}
