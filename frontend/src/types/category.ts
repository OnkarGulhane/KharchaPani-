export interface Category {
  id: number;
  name: string;
  is_default: boolean;
  user_id: number;
  created_at: string;
  expense_count?: number;
}

export interface CategoryCreate {
  name: string;
}

export interface CategoryUpdate {
  name: string;
}

export interface CategoryDeleteConflict {
  linked_expense_count: number;
}
