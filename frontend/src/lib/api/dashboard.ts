import { apiFetch } from "./client";
import {
  DashboardSummary,
  DashboardCharts,
  PeriodComparison,
  TopCategory,
  AverageSpend,
  PeriodType,
} from "@/types/dashboard";

export async function getDashboardSummary(period: PeriodType = "month"): Promise<DashboardSummary> {
  const data = await apiFetch<any>(`/dashboard/summary?period=${period}`);
  return {
    period: data.period,
    total_spent: Number(data.total_spent),
    recent_expenses: (data.recent_expenses || []).map((exp: any) => ({
      ...exp,
      amount: Number(exp.amount),
    })),
    budget_status: data.budget_status
      ? {
          period: data.period || "month",
          amount_limit: Number(data.budget_status.total_budget),
          total_spent: Number(data.budget_status.total_spent),
          remaining: Number(data.budget_status.remaining_balance),
          percentage_used: Number(data.budget_status.percentage_used),
          status: data.budget_status.status,
        }
      : null,
  };
}

export async function getDashboardCharts(period: PeriodType = "month"): Promise<DashboardCharts> {
  const data = await apiFetch<any>(`/dashboard/charts?period=${period}`);
  return {
    pie_chart: (data.pie_chart || []).map((item: any) => ({
      ...item,
      amount: Number(item.amount),
      percentage: Number(item.percentage),
    })),
    trend_chart: (data.trend_chart || []).map((item: any) => ({
      ...item,
      amount: Number(item.amount),
    })),
  };
}

export async function getPeriodComparison(period: PeriodType = "month"): Promise<PeriodComparison> {
  const data = await apiFetch<any>(`/dashboard/comparison?period=${period}`);
  return {
    period: data.period,
    current_period_total: Number(data.current_period_total),
    previous_period_total: Number(data.previous_period_total),
    percentage_change: Number(data.percentage_change),
    is_increase: data.is_increase,
  };
}

export async function getTopCategories(
  period: PeriodType = "month",
  limit: number = 5
): Promise<TopCategory[]> {
  const data = await apiFetch<any[]>(`/dashboard/top-categories?period=${period}&limit=${limit}`);
  return (data || []).map((item) => ({
    rank: Number(item.rank),
    category_id: Number(item.category_id),
    category_name: item.category_name,
    total_amount: Number(item.total_amount),
  }));
}

export async function getAverageSpend(period: PeriodType = "month"): Promise<AverageSpend> {
  const data = await apiFetch<any>(`/dashboard/average-spend?period=${period}`);
  return {
    period: data.period,
    average_daily_spend: Number(data.average_daily_spend),
    average_weekly_spend: Number(data.average_weekly_spend),
  };
}
