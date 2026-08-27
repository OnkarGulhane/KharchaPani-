import { apiFetch, ApiError } from "./client";
import { Category, CategoryCreate, CategoryUpdate, CategoryDeleteConflict } from "@/types/category";

export async function getCategories(): Promise<Category[]> {
  return apiFetch<Category[]>("/categories");
}

export async function createCategory(data: CategoryCreate): Promise<Category> {
  return apiFetch<Category>("/categories", {
    method: "POST",
    body: JSON.stringify(data),
  });
}

export async function updateCategory(id: number, data: CategoryUpdate): Promise<Category> {
  return apiFetch<Category>(`/categories/${id}`, {
    method: "PUT",
    body: JSON.stringify(data),
  });
}

export interface DeleteCategoryResult {
  success: boolean;
  conflict?: CategoryDeleteConflict;
}

export async function deleteCategory(
  id: number,
  options?: { reassign_to?: number; cascade?: boolean }
): Promise<DeleteCategoryResult> {
  const query = new URLSearchParams();
  if (options?.reassign_to) query.append("reassign_to", options.reassign_to.toString());
  if (options?.cascade) query.append("cascade", "true");

  const queryString = query.toString() ? `?${query.toString()}` : "";

  try {
    const res = await apiFetch<boolean>(`/categories/${id}${queryString}`, {
      method: "DELETE",
    });
    return { success: true };
  } catch (err) {
    if (err instanceof ApiError && err.status === 409) {
      return {
        success: false,
        conflict: {
          linked_expense_count: (err as any).linked_expense_count || 1,
        },
      };
    }
    throw err;
  }
}
