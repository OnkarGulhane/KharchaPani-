export interface Budget {
  id: number;
  period: "month" | "week" | "monthly" | "weekly";
  amount_limit: number;
  category_id?: number | null;
  user_id: number;
  created_at: string;
  updated_at: string;
}

export interface BudgetCreate {
  period: "month" | "week" | "monthly" | "weekly";
  amount_limit: number;
  category_id?: number | null;
}

export interface BudgetStatus {
  period: string;
  amount_limit: number;
  total_spent: number;
  remaining: number;
  percentage_used: number;
  status: "on_track" | "near_limit" | "over_budget";
}
