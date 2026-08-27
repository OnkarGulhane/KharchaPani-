import { Category } from "./category";

export interface Expense {
  id: number;
  title: string;
  amount: number;
  date: string;
  category_id: number;
  notes?: string | null;
  payment_mode?: string | null;
  user_id: number;
  created_at: string;
  updated_at: string;
  category?: Category | null;
}

export interface ExpenseCreate {
  title: string;
  amount: number;
  date: string;
  category_id: number;
  notes?: string | null;
  payment_mode?: string | null;
}

export interface ExpenseUpdate {
  title?: string;
  amount?: number;
  date?: string;
  category_id?: number;
  notes?: string | null;
  payment_mode?: string | null;
}

export interface ExpenseFilterParams {
  page?: number;
  page_size?: number;
  search?: string;
  category_id?: number;
  start_date?: string;
  end_date?: string;
  payment_mode?: string;
  sort_by?: string;
  order?: "asc" | "desc";
}
