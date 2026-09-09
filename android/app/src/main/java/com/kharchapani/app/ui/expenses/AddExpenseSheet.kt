package com.kharchapani.app.ui.expenses

import androidx.compose.foundation.background
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.LazyRow
import androidx.compose.foundation.lazy.items
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.foundation.text.KeyboardOptions
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.Check
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.input.KeyboardType
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.kharchapani.app.data.model.CategoryResponse
import com.kharchapani.app.theme.*
import com.kharchapani.app.viewmodel.ExpenseViewModel

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun AddExpenseSheet(
    expenseViewModel: ExpenseViewModel,
    initialAmount: Double? = null,
    initialDescription: String? = null,
    initialCategory: String? = null,
    onDismiss: () -> Unit
) {
    val categories by expenseViewModel.categories.collectAsState()

    var amountText by remember { mutableStateOf(initialAmount?.toString() ?: "") }
    var descriptionText by remember { mutableStateOf(initialDescription ?: "") }
    var selectedCategoryId by remember { mutableStateOf<Int?>(null) }
    var selectedPaymentMethod by remember { mutableStateOf("UPI") }

    LaunchedEffect(Unit) {
        expenseViewModel.loadCategories()
    }

    // Auto-detect matching category from initialCategory or description keywords
    LaunchedEffect(categories, initialCategory, descriptionText) {
        if (selectedCategoryId == null && categories.isNotEmpty()) {
            val query = (initialCategory ?: descriptionText).lowercase()
            val matched = categories.find { cat ->
                query.contains(cat.name.lowercase()) ||
                (cat.name.lowercase().contains("food") && (query.contains("swiggy") || query.contains("zomato") || query.contains("hotel") || query.contains("tea") || query.contains("chaha"))) ||
                (cat.name.lowercase().contains("travel") && (query.contains("uber") || query.contains("ola") || query.contains("petrol") || query.contains("auto") || query.contains("diesel"))) ||
                (cat.name.lowercase().contains("groceries") && (query.contains("blinkit") || query.contains("zepto") || query.contains("dmart") || query.contains("milk")))
            }
            selectedCategoryId = matched?.id ?: categories.firstOrNull()?.id
        }
    }

    ModalBottomSheet(
        onDismissRequest = onDismiss,
        containerColor = CardBackground,
        shape = RoundedCornerShape(topStart = 24.dp, topEnd = 24.dp)
    ) {
        Column(
            modifier = Modifier
                .fillMaxWidth()
                .padding(horizontal = 24.dp)
                .padding(bottom = 36.dp)
        ) {
            Text(
                text = "Record Expense 💸",
                fontSize = 20.sp,
                fontWeight = FontWeight.Bold,
                color = Emerald400,
                modifier = Modifier.padding(bottom = 16.dp)
            )

            // Amount Field
            OutlinedTextField(
                value = amountText,
                onValueChange = { amountText = it },
                label = { Text("Amount (₹)", color = TextSecondary) },
                singleLine = true,
                keyboardOptions = KeyboardOptions(keyboardType = KeyboardType.Decimal),
                shape = RoundedCornerShape(12.dp),
                colors = OutlinedTextFieldDefaults.colors(
                    focusedTextColor = TextPrimary,
                    unfocusedTextColor = TextPrimary,
                    focusedBorderColor = Emerald500,
                    unfocusedBorderColor = CardBorder,
                    focusedContainerColor = ObsidianDark,
                    unfocusedContainerColor = ObsidianDark
                ),
                modifier = Modifier.fillMaxWidth()
            )

            Spacer(modifier = Modifier.height(12.dp))

            // Description Field
            OutlinedTextField(
                value = descriptionText,
                onValueChange = { descriptionText = it },
                label = { Text("Description (e.g. Swiggy Lunch, Petrol)", color = TextSecondary) },
                singleLine = true,
                shape = RoundedCornerShape(12.dp),
                colors = OutlinedTextFieldDefaults.colors(
                    focusedTextColor = TextPrimary,
                    unfocusedTextColor = TextPrimary,
                    focusedBorderColor = Emerald500,
                    unfocusedBorderColor = CardBorder,
                    focusedContainerColor = ObsidianDark,
                    unfocusedContainerColor = ObsidianDark
                ),
                modifier = Modifier.fillMaxWidth()
            )

            Spacer(modifier = Modifier.height(16.dp))

            // Category Chips Selector
            Text("Category:", fontSize = 13.sp, fontWeight = FontWeight.Medium, color = TextSecondary)
            Spacer(modifier = Modifier.height(6.dp))
            LazyRow(horizontalArrangement = Arrangement.spacedBy(8.dp)) {
                items(categories) { cat ->
                    val isSelected = selectedCategoryId == cat.id
                    FilterChip(
                        selected = isSelected,
                        onClick = { selectedCategoryId = cat.id },
                        label = { Text("${cat.icon ?: "📁"} ${cat.name}", fontSize = 12.sp) },
                        colors = FilterChipDefaults.filterChipColors(
                            selectedContainerColor = Emerald500,
                            selectedLabelColor = ObsidianBlack,
                            containerColor = ObsidianDark,
                            labelColor = TextSecondary
                        )
                    )
                }
            }

            Spacer(modifier = Modifier.height(16.dp))

            // Payment Method Selector
            Text("Payment Method:", fontSize = 13.sp, fontWeight = FontWeight.Medium, color = TextSecondary)
            Spacer(modifier = Modifier.height(6.dp))
            Row(horizontalArrangement = Arrangement.spacedBy(8.dp)) {
                listOf("UPI", "Cash", "Card", "NetBanking").forEach { method ->
                    val isSelected = selectedPaymentMethod == method
                    FilterChip(
                        selected = isSelected,
                        onClick = { selectedPaymentMethod = method },
                        label = { Text(method, fontSize = 12.sp) },
                        colors = FilterChipDefaults.filterChipColors(
                            selectedContainerColor = Emerald500,
                            selectedLabelColor = ObsidianBlack,
                            containerColor = ObsidianDark,
                            labelColor = TextSecondary
                        )
                    )
                }
            }

            Spacer(modifier = Modifier.height(24.dp))

            // Submit Button
            Button(
                onClick = {
                    val amt = amountText.toDoubleOrNull()
                    if (amt != null && amt > 0) {
                        expenseViewModel.addExpense(
                            amount = amt,
                            categoryId = selectedCategoryId,
                            description = descriptionText.ifBlank { "Expense" },
                            paymentMethod = selectedPaymentMethod,
                            onSuccess = onDismiss
                        )
                    }
                },
                enabled = (amountText.toDoubleOrNull() ?: 0.0) > 0,
                colors = ButtonDefaults.buttonColors(containerColor = Emerald500),
                shape = RoundedCornerShape(14.dp),
                modifier = Modifier
                    .fillMaxWidth()
                    .height(50.dp)
            ) {
                Text(
                    text = "Save Expense",
                    fontSize = 16.sp,
                    fontWeight = FontWeight.Bold,
                    color = ObsidianBlack
                )
            }
        }
    }
}
