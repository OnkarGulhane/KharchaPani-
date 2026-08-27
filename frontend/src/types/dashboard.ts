import { Expense } from "./expense";
import { BudgetStatus } from "./budget";

export type PeriodType = "day" | "week" | "month";

export interface DashboardSummary {
  period: PeriodType;
  total_spent: number;
  recent_expenses: Expense[];
  budget_status: BudgetStatus | null;
}

export interface CategoryPieItem {
  category_id: number;
  category_name: string;
  amount: number;
  percentage: number;
}

export interface SpendTrendItem {
  label: string;
  amount: number;
}

export interface DashboardCharts {
  pie_chart: CategoryPieItem[];
  trend_chart: SpendTrendItem[];
}

export interface PeriodComparison {
  period: string;
  current_period_total: number;
  previous_period_total: number;
  percentage_change: number;
  is_increase: boolean;
}

export interface TopCategory {
  rank: number;
  category_id: number;
  category_name: string;
  total_amount: number;
}

export interface AverageSpend {
  period: PeriodType;
  average_daily_spend: number;
  average_weekly_spend: number;
}
