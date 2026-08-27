import { apiFetch } from "./client";
import { Budget, BudgetCreate, BudgetStatus } from "@/types/budget";

export async function getBudgets(): Promise<Budget[]> {
  return apiFetch<Budget[]>("/budget");
}

export async function setBudget(data: BudgetCreate): Promise<Budget> {
  return apiFetch<Budget>("/budget", {
    method: "POST",
    body: JSON.stringify(data),
  });
}

export async function getBudgetStatus(period: string = "month"): Promise<BudgetStatus> {
  return apiFetch<BudgetStatus>(`/budget/status?period=${period}`);
}
