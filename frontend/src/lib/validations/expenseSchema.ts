import { z } from "zod";

const today = new Date().toISOString().split("T")[0];

export const expenseSchema = z.object({
  title: z.string().min(1, "Title is required").max(100, "Title is too long"),
  amount: z.coerce.number().gt(0, "Amount must be greater than 0"),
  date: z
    .string()
    .min(1, "Date is required")
    .refine((val) => val <= today, {
      message: "Expense date cannot be in the future",
    }),
  category_id: z.coerce.number().gt(0, "Category is required"),
  notes: z.string().optional().nullable(),
  payment_mode: z.string().optional().nullable(),
});

export type ExpenseFormData = z.infer<typeof expenseSchema>;
