import { apiFetch } from "./client";
import { Expense, ExpenseCreate, ExpenseUpdate, ExpenseFilterParams } from "@/types/expense";
import { PaginatedData } from "@/types/api";

export async function getExpenses(params: ExpenseFilterParams = {}): Promise<PaginatedData<Expense>> {
  const query = new URLSearchParams();
  if (params.page) query.append("page", params.page.toString());
  if (params.page_size) query.append("page_size", params.page_size.toString());
  if (params.search) query.append("search", params.search);
  if (params.category_id) query.append("category_id", params.category_id.toString());
  if (params.start_date) query.append("start_date", params.start_date);
  if (params.end_date) query.append("end_date", params.end_date);
  if (params.payment_mode) query.append("payment_mode", params.payment_mode);
  if (params.sort_by) query.append("sort_by", params.sort_by);
  if (params.order) query.append("order", params.order);

  const queryString = query.toString() ? `?${query.toString()}` : "";
  return apiFetch<PaginatedData<Expense>>(`/expenses${queryString}`);
}

export async function getExpense(id: number): Promise<Expense> {
  return apiFetch<Expense>(`/expenses/${id}`);
}

export async function createExpense(data: ExpenseCreate): Promise<Expense> {
  return apiFetch<Expense>("/expenses", {
    method: "POST",
    body: JSON.stringify(data),
  });
}

export async function updateExpense(id: number, data: ExpenseUpdate): Promise<Expense> {
  return apiFetch<Expense>(`/expenses/${id}`, {
    method: "PUT",
    body: JSON.stringify(data),
  });
}

export async function deleteExpense(id: number): Promise<boolean> {
  return apiFetch<boolean>(`/expenses/${id}`, {
    method: "DELETE",
  });
}
