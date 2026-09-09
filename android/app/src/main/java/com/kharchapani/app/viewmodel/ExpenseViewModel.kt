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

    private val _listState = MutableStateFlow<ExpenseListUiState>(ExpenseListUiState.Loading)
    val listState: StateFlow<ExpenseListUiState> = _listState.asStateFlow()

    private val _categories = MutableStateFlow<List<CategoryResponse>>(emptyList())
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
                _categories.value = it
            }
        }
    }

    fun loadExpenses() {
        viewModelScope.launch {
            _listState.value = ExpenseListUiState.Loading
            val result = expenseRepository.getExpenses(
                search = if (_searchQuery.value.isNotBlank()) _searchQuery.value else null,
                categoryId = _selectedCategoryId.value
            )
            result.fold(
                onSuccess = { _listState.value = ExpenseListUiState.Success(it) },
                onFailure = { _listState.value = ExpenseListUiState.Error(it.message ?: "Failed to load expenses") }
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
                val catsResult = expenseRepository.getCategories()
                catsResult.onSuccess { _categories.value = it }
            }

            // 2. Resolve valid categoryId (selected, or first available, or fallback to 1)
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
                    _actionStatus.value = "Expense of ₹${it.amount} recorded!"
                    loadExpenses()
                    onSuccess()
                },
                onFailure = {
                    _actionStatus.value = "Error: ${it.message}"
                }
            )
        }
    }

    fun deleteExpense(id: Int) {
        viewModelScope.launch {
            val result = expenseRepository.deleteExpense(id)
            if (result.isSuccess) {
                _actionStatus.value = "Expense deleted"
                loadExpenses()
            }
        }
    }

    fun clearActionStatus() {
        _actionStatus.value = null
    }
}
