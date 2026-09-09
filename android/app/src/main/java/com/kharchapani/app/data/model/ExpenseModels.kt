package com.kharchapani.app.data.model

import com.google.gson.annotations.SerializedName

// Paginated Response Container from FastAPI
data class PaginatedData<T>(
    @SerializedName("items") val items: List<T> = emptyList(),
    @SerializedName("total") val total: Int = 0,
    @SerializedName("page") val page: Int = 1,
    @SerializedName("page_size") val pageSize: Int = 20,
    @SerializedName("has_next") val hasNext: Boolean = false
)

// Category Model
data class CategoryResponse(
    @SerializedName("id") val id: Int,
    @SerializedName("name") val name: String,
    @SerializedName("is_default") val isDefault: Boolean = false,
    @SerializedName("expense_count") val expenseCount: Int = 0,
    @SerializedName("icon") val icon: String? = "💸",
    @SerializedName("color") val color: String? = "#10B981",
    @SerializedName("user_id") val userId: Int? = null,
    @SerializedName("is_income") val isIncome: Boolean = false,
    @SerializedName("created_at") val createdAt: String? = null,
    @SerializedName("updated_at") val updatedAt: String? = null
)

// Expense Model
data class ExpenseResponse(
    @SerializedName("id") val id: Int = 0,
    @SerializedName("title") val title: String? = null,
    @SerializedName("description") val description: String? = null,
    @SerializedName("amount") val amount: Double = 0.0,
    @SerializedName("date") val date: String? = null,
    @SerializedName("expense_date") val rawExpenseDate: String? = null,
    @SerializedName("notes") val notes: String? = null,
    @SerializedName("payment_mode") val paymentMode: String? = null,
    @SerializedName("payment_method") val rawPaymentMethod: String? = null,
    @SerializedName("category_id") val categoryId: Int? = null,
    @SerializedName("category_name") val categoryName: String? = null,
    @SerializedName("user_id") val userId: Int? = null,
    @SerializedName("tags") val tags: List<String>? = emptyList(),
    @SerializedName("is_recurring") val isRecurring: Boolean = false,
    @SerializedName("created_at") val createdAt: String? = null,
    @SerializedName("updated_at") val updatedAt: String? = null
) {
    val expenseDate: String
        get() = date ?: rawExpenseDate ?: ""

    val paymentMethod: String
        get() = paymentMode ?: rawPaymentMethod ?: "UPI"

    val displayTitle: String
        get() = title ?: description ?: "Expense"
}

data class ExpenseCreate(
    @SerializedName("title") val title: String,
    @SerializedName("amount") val amount: Double,
    @SerializedName("date") val date: String,
    @SerializedName("category_id") val categoryId: Int,
    @SerializedName("payment_mode") val paymentMode: String? = "UPI",
    @SerializedName("notes") val notes: String? = null
)

data class ExpenseUpdate(
    @SerializedName("title") val title: String? = null,
    @SerializedName("amount") val amount: Double? = null,
    @SerializedName("date") val date: String? = null,
    @SerializedName("category_id") val categoryId: Int? = null,
    @SerializedName("payment_mode") val paymentMode: String? = null,
    @SerializedName("notes") val notes: String? = null
)
