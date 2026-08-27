import { z } from "zod";

export const budgetSchema = z.object({
  period: z.enum(["monthly", "weekly", "month", "week"]),
  amount_limit: z.coerce.number().gt(0, "Budget limit must be greater than 0"),
  category_id: z.coerce.number().optional().nullable(),
});

export type BudgetFormData = z.infer<typeof budgetSchema>;
