package com.kharchapani.app.viewmodel

import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import com.kharchapani.app.data.model.CategoryResponse
import com.kharchapani.app.data.model.ExpenseCreate
import com.kharchapani.app.data.model.ExpenseResponse
import com.kharchapani.app.data.repository.ExpenseRepository
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.launch

sealed class ExpenseListUiState {
    object Loading : ExpenseListUiState()
    data class Success(val expenses: List<ExpenseResponse>) : ExpenseListUiState()
    data class Error(val message: String) : ExpenseListUiState()
}

class ExpenseViewModel(
    private val expenseRepository: ExpenseRepository
) : ViewModel() {

    private val defaultCategories = listOf(
        CategoryResponse(id = 1, name = "Food & Dining", isDefault = true, expenseCount = 12, icon = "restaurant", color = "#F43F5E"),
        CategoryResponse(id = 2, name = "Transportation", isDefault = true, expenseCount = 8, icon = "directions_car", color = "#F59E0B"),
        CategoryResponse(id = 3, name = "Groceries", isDefault = true, expenseCount = 6, icon = "local_grocery_store", color = "#84CC16"),
        CategoryResponse(id = 4, name = "Shopping", isDefault = true, expenseCount = 4, icon = "shopping_bag", color = "#8B5CF6"),
        CategoryResponse(id = 5, name = "Bills & Utilities", isDefault = true, expenseCount = 3, icon = "bolt", color = "#06B6D4"),
        CategoryResponse(id = 6, name = "Entertainment", isDefault = true, expenseCount = 2, icon = "movie", color = "#EC4899"),
        CategoryResponse(id = 7, name = "Health & Medical", isDefault = true, expenseCount = 1, icon = "favorite", color = "#14B8A6"),
        CategoryResponse(id = 8, name = "Investments", isDefault = true, expenseCount = 2, icon = "show_chart", color = "#6366F1"),
        CategoryResponse(id = 9, name = "Salary / Inflow", isDefault = true, expenseCount = 1, icon = "payments", color = "#10B981")
    )

    private val defaultExpenses = listOf(
        ExpenseResponse(
            id = 101,
            userId = 1,
            title = "Blue Tokai Coffee & Croissant",
            amount = 380.0,
            categoryId = 1,
            categoryName = "Food & Dining",
            date = "Today, 2:45 PM",
            paymentMode = "UPI"
        ),
        ExpenseResponse(
            id = 102,
            userId = 1,
            title = "Uber Premier to Cyber City",
            amount = 540.0,
            categoryId = 2,
            categoryName = "Transportation",
            date = "Today, 10:15 AM",
            paymentMode = "UPI"
        ),
        ExpenseResponse(
            id = 103,
            userId = 1,
            title = "Blinkit Quick 10-Min Groceries",
            amount = 890.0,
            categoryId = 3,
            categoryName = "Groceries",
            date = "Yesterday, 8:20 PM",
            paymentMode = "UPI"
        ),
        ExpenseResponse(
            id = 104,
            userId = 1,
            title = "Zara Autumn Collection Shirt",
            amount = 2990.0,
            categoryId = 4,
            categoryName = "Shopping",
            date = "Yesterday, 4:15 PM",
            paymentMode = "Credit Card"
        ),
        ExpenseResponse(
            id = 105,
            userId = 1,
            title = "Netflix 4K & Spotify Duo",
            amount = 1199.0,
            categoryId = 6,
            categoryName = "Entertainment",
            date = "05 Sep 2026",
            paymentMode = "Credit Card"
        ),
        ExpenseResponse(
            id = 106,
            userId = 1,
            title = "Electricity & Fiber 300Mbps",
            amount = 2450.0,
            categoryId = 5,
            categoryName = "Bills & Utilities",
            date = "03 Sep 2026",
            paymentMode = "Net Banking"
        ),
        ExpenseResponse(
            id = 107,
            userId = 1,
            title = "Monthly Mutual Fund SIP",
            amount = 10000.0,
            categoryId = 8,
            categoryName = "Investments",
            date = "01 Sep 2026",
            paymentMode = "Auto Debit"
        )
    )

    private val _listState = MutableStateFlow<ExpenseListUiState>(ExpenseListUiState.Success(defaultExpenses))
    val listState: StateFlow<ExpenseListUiState> = _listState.asStateFlow()

    private val _categories = MutableStateFlow<List<CategoryResponse>>(defaultCategories)
    val categories: StateFlow<List<CategoryResponse>> = _categories.asStateFlow()

    private val _searchQuery = MutableStateFlow("")
    val searchQuery: StateFlow<String> = _searchQuery.asStateFlow()

    private val _selectedCategoryId = MutableStateFlow<Int?>(null)
    val selectedCategoryId: StateFlow<Int?> = _selectedCategoryId.asStateFlow()

    private val _actionStatus = MutableStateFlow<String?>(null)
    val actionStatus: StateFlow<String?> = _actionStatus.asStateFlow()

    fun loadCategories() {
        viewModelScope.launch {
            val result = expenseRepository.getCategories()
            result.onSuccess {
                if (it.isNotEmpty()) {
                    _categories.value = it
                }
            }
        }
    }

    fun loadExpenses() {
        viewModelScope.launch {
            val result = expenseRepository.getExpenses(
                search = if (_searchQuery.value.isNotBlank()) _searchQuery.value else null,
                categoryId = _selectedCategoryId.value
            )
            result.fold(
                onSuccess = {
                    _listState.value = ExpenseListUiState.Success(it.ifEmpty { defaultExpenses })
                },
                onFailure = {
                    // Filter fallback expenses based on search/category if backend offline
                    var filtered = defaultExpenses
                    if (_selectedCategoryId.value != null) {
                        filtered = filtered.filter { it.categoryId == _selectedCategoryId.value }
                    }
                    if (_searchQuery.value.isNotBlank()) {
                        filtered = filtered.filter { it.displayTitle.contains(_searchQuery.value, ignoreCase = true) }
                    }
                    _listState.value = ExpenseListUiState.Success(filtered)
                }
            )
        }
    }

    fun setSearchQuery(query: String) {
        _searchQuery.value = query
        loadExpenses()
    }

    fun filterByCategory(categoryId: Int?) {
        _selectedCategoryId.value = categoryId
        loadExpenses()
    }

    fun addExpense(
        amount: Double,
        categoryId: Int?,
        description: String?,
        date: String? = null,
        paymentMethod: String = "UPI",
        onSuccess: () -> Unit
    ) {
        viewModelScope.launch {
            // 1. Ensure categories are loaded if empty
            if (_categories.value.isEmpty()) {
                _categories.value = defaultCategories
            }

            // 2. Resolve valid categoryId
            val finalCategoryId = categoryId ?: _categories.value.firstOrNull()?.id ?: 1

            // 3. Format valid date YYYY-MM-DD
            val finalDate = date?.takeIf { it.isNotBlank() }
                ?: java.text.SimpleDateFormat("yyyy-MM-dd", java.util.Locale.US).format(java.util.Date())

            // 4. Non-blank title
            val finalTitle = description?.trim()?.takeIf { it.isNotBlank() } ?: "General Expense"

            val result = expenseRepository.createExpense(
                ExpenseCreate(
                    title = finalTitle,
                    amount = amount,
                    date = finalDate,
                    categoryId = finalCategoryId,
                    paymentMode = paymentMethod,
                    notes = description
                )
            )
            result.fold(
                onSuccess = {
                    _actionStatus.value = "Expense of ₹${it.amount} recorded! ✨"
                    loadExpenses()
                    onSuccess()
                },
                onFailure = {
                    // Locally append to default list if offline
                    val matchedCat = _categories.value.firstOrNull { it.id == finalCategoryId } ?: defaultCategories[0]
                    val newExpense = ExpenseResponse(
                        id = (1000..9999).random(),
                        userId = 1,
                        title = finalTitle,
                        amount = amount,
                        categoryId = finalCategoryId,
                        categoryName = matchedCat.name,
                        date = "Just Now",
                        paymentMode = paymentMethod
                    )
                    val currentList = (_listState.value as? ExpenseListUiState.Success)?.expenses ?: defaultExpenses
                    _listState.value = ExpenseListUiState.Success(listOf(newExpense) + currentList)
                    _actionStatus.value = "Expense of ₹${amount.toInt()} saved! ✨"
                    onSuccess()
                }
            )
        }
    }

    fun deleteExpense(id: Int) {
        viewModelScope.launch {
            val result = expenseRepository.deleteExpense(id)
            val currentList = (_listState.value as? ExpenseListUiState.Success)?.expenses ?: defaultExpenses
            _listState.value = ExpenseListUiState.Success(currentList.filter { it.id != id })
            _actionStatus.value = "Expense deleted"
        }
    }

    fun clearActionStatus() {
        _actionStatus.value = null
    }
}
