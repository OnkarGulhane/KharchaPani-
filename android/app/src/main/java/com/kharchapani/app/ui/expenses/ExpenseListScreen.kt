package com.kharchapani.app.ui.expenses

import androidx.compose.animation.AnimatedVisibility
import androidx.compose.foundation.BorderStroke
import androidx.compose.foundation.background
import androidx.compose.foundation.border
import androidx.compose.foundation.clickable
import androidx.compose.foundation.interaction.MutableInteractionSource
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.LazyRow
import androidx.compose.foundation.lazy.items
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.rounded.*
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.draw.shadow
import androidx.compose.ui.graphics.Brush
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.kharchapani.app.data.model.ExpenseResponse
import com.kharchapani.app.theme.*
import com.kharchapani.app.ui.components.CategoryIconBadge
import com.kharchapani.app.ui.components.GlassmorphicCard
import com.kharchapani.app.ui.components.ObsidianAtmosphere
import com.kharchapani.app.viewmodel.ExpenseListUiState
import com.kharchapani.app.viewmodel.ExpenseViewModel

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun ExpenseListScreen(
    expenseViewModel: ExpenseViewModel,
    onAddExpenseClick: () -> Unit
) {
    val listState by expenseViewModel.listState.collectAsState()
    val categories by expenseViewModel.categories.collectAsState()
    val searchQuery by expenseViewModel.searchQuery.collectAsState()
    val selectedCategoryId by expenseViewModel.selectedCategoryId.collectAsState()
    val actionStatus by expenseViewModel.actionStatus.collectAsState()

    val snackbarHostState = remember { SnackbarHostState() }

    LaunchedEffect(Unit) {
        expenseViewModel.loadCategories()
        expenseViewModel.loadExpenses()
    }

    LaunchedEffect(actionStatus) {
        actionStatus?.let {
            snackbarHostState.showSnackbar(it)
            expenseViewModel.clearActionStatus()
        }
    }

    Scaffold(
        topBar = {
            TopAppBar(
                title = {
                    Row(
                        verticalAlignment = Alignment.CenterVertically,
                        horizontalArrangement = Arrangement.spacedBy(10.dp)
                    ) {
                        Box(
                            modifier = Modifier
                                .size(38.dp)
                                .shadow(8.dp, shape = RoundedCornerShape(12.dp), spotColor = Color(0xFF8B5CF6))
                                .clip(RoundedCornerShape(12.dp))
                                .background(
                                    Brush.linearGradient(
                                        listOf(Color(0xFF6366F1), Color(0xFF8B5CF6))
                                    )
                                )
                                .border(
                                    BorderStroke(1.dp, Color(0x60FFFFFF)),
                                    RoundedCornerShape(12.dp)
                                ),
                            contentAlignment = Alignment.Center
                        ) {
                            Icon(
                                imageVector = Icons.Rounded.AccountBalanceWallet,
                                contentDescription = "Ledger",
                                tint = Color.White,
                                modifier = Modifier.size(20.dp)
                            )
                        }
                        Column {
                            Text(
                                text = "Expenses & Ledger",
                                style = MaterialTheme.typography.titleMedium,
                                fontWeight = FontWeight.Bold,
                                color = TextPrimary
                            )
                            Text(
                                text = "Complete Transaction History",
                                style = MaterialTheme.typography.labelSmall,
                                color = Color(0xFFD0BCFF),
                                fontWeight = FontWeight.Medium
                            )
                        }
                    }
                },
                colors = TopAppBarDefaults.topAppBarColors(containerColor = ObsidianCanvas)
            )
        },
        floatingActionButton = {
            Box(
                modifier = Modifier
                    .size(58.dp)
                    .shadow(18.dp, shape = CircleShape, spotColor = Color(0xFF8B5CF6), ambientColor = Color(0xFF6366F1))
                    .clip(CircleShape)
                    .background(
                        Brush.linearGradient(
                            listOf(Color(0xFF6366F1), Color(0xFF8B5CF6), Color(0xFFA855F7))
                        )
                    )
                    .border(BorderStroke(1.5.dp, Color(0x60FFFFFF)), CircleShape)
                    .clickable { onAddExpenseClick() },
                contentAlignment = Alignment.Center
            ) {
                Icon(
                    imageVector = Icons.Rounded.Add,
                    contentDescription = "Add Expense",
                    tint = Color.White,
                    modifier = Modifier.size(30.dp)
                )
            }
        },
        snackbarHost = { SnackbarHost(snackbarHostState) },
        containerColor = ObsidianCanvas
    ) { paddingValues ->
        ObsidianAtmosphere(
            modifier = Modifier
                .fillMaxSize()
                .padding(paddingValues)
        ) {
            Column(
                modifier = Modifier
                    .fillMaxSize()
                    .padding(horizontal = 16.dp)
            ) {
                // 1. Search Bar
                Box(
                    modifier = Modifier
                        .fillMaxWidth()
                        .padding(top = 4.dp, bottom = 12.dp)
                        .shadow(8.dp, shape = RoundedCornerShape(16.dp), spotColor = Color(0x336366F1))
                        .clip(RoundedCornerShape(16.dp))
                        .background(Color(0xE61A1F2D))
                        .border(1.dp, BorderGlass, RoundedCornerShape(16.dp))
                        .padding(horizontal = 14.dp, vertical = 4.dp)
                ) {
                    Row(
                        verticalAlignment = Alignment.CenterVertically,
                        horizontalArrangement = Arrangement.spacedBy(10.dp)
                    ) {
                        Icon(
                            imageVector = Icons.Rounded.Search,
                            contentDescription = "Search",
                            tint = Color(0xFFD0BCFF),
                            modifier = Modifier.size(20.dp)
                        )
                        TextField(
                            value = searchQuery,
                            onValueChange = { expenseViewModel.setSearchQuery(it) },
                            placeholder = {
                                Text(
                                    "Search by title, merchant, or notes...",
                                    color = TextMuted,
                                    fontSize = 13.5.sp
                                )
                            },
                            singleLine = true,
                            colors = TextFieldDefaults.colors(
                                focusedContainerColor = Color.Transparent,
                                unfocusedContainerColor = Color.Transparent,
                                focusedIndicatorColor = Color.Transparent,
                                unfocusedIndicatorColor = Color.Transparent,
                                focusedTextColor = TextPrimary,
                                unfocusedTextColor = TextPrimary
                            ),
                            modifier = Modifier.weight(1f)
                        )
                        if (searchQuery.isNotEmpty()) {
                            IconButton(
                                onClick = { expenseViewModel.setSearchQuery("") },
                                modifier = Modifier.size(24.dp)
                            ) {
                                Icon(
                                    imageVector = Icons.Rounded.Close,
                                    contentDescription = "Clear",
                                    tint = TextMuted,
                                    modifier = Modifier.size(16.dp)
                                )
                            }
                        }
                    }
                }

                // 2. Category Filter Pills Tray
                LazyRow(
                    horizontalArrangement = Arrangement.spacedBy(8.dp),
                    contentPadding = PaddingValues(bottom = 12.dp)
                ) {
                    item {
                        val isAllSelected = selectedCategoryId == null
                        CategoryFilterPill(
                            label = "All (${categories.size + 1})",
                            isSelected = isAllSelected,
                            onClick = { expenseViewModel.filterByCategory(null) }
                        )
                    }
                    items(categories) { category ->
                        val isSelected = selectedCategoryId == category.id
                        CategoryFilterPill(
                            label = category.name,
                            isSelected = isSelected,
                            onClick = { expenseViewModel.filterByCategory(category.id) }
                        )
                    }
                }

                // 3. Transactions List
                when (val state = listState) {
                    is ExpenseListUiState.Loading -> {
                        Box(
                            modifier = Modifier
                                .fillMaxWidth()
                                .weight(1f),
                            contentAlignment = Alignment.Center
                        ) {
                            CircularProgressIndicator(color = TertiaryLight)
                        }
                    }
                    is ExpenseListUiState.Error -> {
                        Box(
                            modifier = Modifier
                                .fillMaxWidth()
                                .weight(1f),
                            contentAlignment = Alignment.Center
                        ) {
                            Text(
                                text = state.message,
                                color = CoralRose,
                                style = MaterialTheme.typography.bodyMedium
                            )
                        }
                    }
                    is ExpenseListUiState.Success -> {
                        val expenses = state.expenses
                        if (expenses.isEmpty()) {
                            Box(
                                modifier = Modifier
                                    .fillMaxWidth()
                                    .weight(1f),
                                contentAlignment = Alignment.Center
                            ) {
                                Column(
                                    horizontalAlignment = Alignment.CenterHorizontally,
                                    verticalArrangement = Arrangement.spacedBy(10.dp)
                                ) {
                                    Box(
                                        modifier = Modifier
                                            .size(56.dp)
                                            .clip(CircleShape)
                                            .background(Color(0x33262A35)),
                                        contentAlignment = Alignment.Center
                                    ) {
                                        Icon(
                                            imageVector = Icons.Rounded.SearchOff,
                                            contentDescription = "Empty",
                                            tint = TextMuted,
                                            modifier = Modifier.size(28.dp)
                                        )
                                    }
                                    Text(
                                        text = "No matching expenses found",
                                        style = MaterialTheme.typography.bodyMedium,
                                        color = TextSecondary
                                    )
                                }
                            }
                        } else {
                            val totalSpent = expenses.sumOf { it.amount }
                            LazyColumn(
                                modifier = Modifier.weight(1f),
                                verticalArrangement = Arrangement.spacedBy(10.dp),
                                contentPadding = PaddingValues(bottom = 80.dp)
                            ) {
                                // Ledger Summary Banner
                                item {
                                    GlassmorphicCard(
                                        modifier = Modifier.fillMaxWidth(),
                                        shape = RoundedCornerShape(16.dp),
                                        backgroundColor = Color(0xE61A1E2B),
                                        spotColor = Color(0x336366F1),
                                        elevation = 8.dp
                                    ) {
                                        Row(
                                            modifier = Modifier
                                                .fillMaxWidth()
                                                .padding(14.dp),
                                            horizontalArrangement = Arrangement.SpaceBetween,
                                            verticalAlignment = Alignment.CenterVertically
                                        ) {
                                            Column {
                                                Text(
                                                    text = "FILTERED TOTAL",
                                                    fontSize = 10.sp,
                                                    fontWeight = FontWeight.Bold,
                                                    color = Color(0xFFD0BCFF),
                                                    letterSpacing = 1.sp
                                                )
                                                Text(
                                                    text = "${expenses.size} Transactions",
                                                    fontSize = 12.sp,
                                                    color = TextSecondary
                                                )
                                            }
                                            Text(
                                                text = "₹ ${String.format("%,.2f", totalSpent)}",
                                                fontSize = 20.sp,
                                                fontWeight = FontWeight.ExtraBold,
                                                color = TextPrimary
                                            )
                                        }
                                    }
                                }

                                items(expenses, key = { it.id }) { expense ->
                                    LedgerExpenseItem(
                                        expense = expense,
                                        onDelete = { expenseViewModel.deleteExpense(expense.id) }
                                    )
                                }
                            }
                        }
                    }
                }
            }
        }
    }
}

@Composable
private fun CategoryFilterPill(
    label: String,
    isSelected: Boolean,
    onClick: () -> Unit
) {
    Box(
        modifier = Modifier
            .shadow(if (isSelected) 8.dp else 0.dp, shape = RoundedCornerShape(percent = 50), spotColor = Color(0xFF6366F1))
            .clip(RoundedCornerShape(percent = 50))
            .background(
                if (isSelected) {
                    Brush.linearGradient(listOf(Color(0xFF6366F1), Color(0xFF8B5CF6)))
                } else {
                    Brush.linearGradient(listOf(Color(0xCC1F2433), Color(0xCC1F2433)))
                }
            )
            .border(
                1.dp,
                if (isSelected) Color(0x80FFFFFF) else BorderGlass,
                RoundedCornerShape(percent = 50)
            )
            .clickable { onClick() }
            .padding(horizontal = 14.dp, vertical = 7.dp),
        contentAlignment = Alignment.Center
    ) {
        Text(
            text = label,
            style = MaterialTheme.typography.labelMedium,
            fontWeight = if (isSelected) FontWeight.Bold else FontWeight.Normal,
            color = if (isSelected) Color.White else Color(0xFFCBC3D7),
            fontSize = 12.sp
        )
    }
}

@Composable
private fun LedgerExpenseItem(
    expense: ExpenseResponse,
    onDelete: () -> Unit
) {
    var showDeleteConfirm by remember { mutableStateOf(false) }

    GlassmorphicCard(
        modifier = Modifier.fillMaxWidth(),
        shape = RoundedCornerShape(16.dp),
        backgroundColor = Color(0xE6171B26),
        spotColor = Color(0x206366F1),
        elevation = 6.dp
    ) {
        Row(
            modifier = Modifier
                .fillMaxWidth()
                .padding(horizontal = 14.dp, vertical = 12.dp),
            verticalAlignment = Alignment.CenterVertically,
            horizontalArrangement = Arrangement.SpaceBetween
        ) {
            Row(
                verticalAlignment = Alignment.CenterVertically,
                horizontalArrangement = Arrangement.spacedBy(12.dp),
                modifier = Modifier.weight(1f)
            ) {
                // Category Icon with tailored gradient squircle
                CategoryIconBadge(
                    categoryName = expense.categoryName ?: "General",
                    size = 44.dp,
                    iconSize = 22.dp,
                    shape = RoundedCornerShape(12.dp)
                )

                Column(verticalArrangement = Arrangement.spacedBy(3.dp)) {
                    Text(
                        text = expense.displayTitle,
                        style = MaterialTheme.typography.bodyMedium,
                        fontWeight = FontWeight.SemiBold,
                        color = TextPrimary,
                        maxLines = 1
                    )
                    Row(
                        verticalAlignment = Alignment.CenterVertically,
                        horizontalArrangement = Arrangement.spacedBy(6.dp)
                    ) {
                        Text(
                            text = expense.expenseDate,
                            style = MaterialTheme.typography.bodySmall,
                            color = TextMuted,
                            fontSize = 11.sp
                        )
                        Box(
                            modifier = Modifier
                                .background(Color(0x33262A35), RoundedCornerShape(4.dp))
                                .padding(horizontal = 5.dp, vertical = 1.dp)
                        ) {
                            Text(
                                text = expense.paymentMethod,
                                fontSize = 9.5.sp,
                                color = Color(0xFFC7C4D7),
                                fontWeight = FontWeight.Medium
                            )
                        }
                    }
                }
            }

            // Amount and Delete Action
            Row(
                verticalAlignment = Alignment.CenterVertically,
                horizontalArrangement = Arrangement.spacedBy(8.dp)
            ) {
                Text(
                    text = "-₹${String.format("%,.0f", expense.amount)}",
                    style = MaterialTheme.typography.titleSmall,
                    fontWeight = FontWeight.Bold,
                    color = CoralRose,
                    fontSize = 15.sp
                )

                IconButton(
                    onClick = { showDeleteConfirm = true },
                    modifier = Modifier.size(28.dp)
                ) {
                    Icon(
                        imageVector = Icons.Rounded.DeleteOutline,
                        contentDescription = "Delete",
                        tint = TextMuted,
                        modifier = Modifier.size(17.dp)
                    )
                }
            }
        }
    }

    if (showDeleteConfirm) {
        AlertDialog(
            onDismissRequest = { showDeleteConfirm = false },
            title = { Text("Delete Expense?", color = TextPrimary, fontWeight = FontWeight.Bold) },
            text = { Text("Are you sure you want to delete '${expense.title}' of ₹${expense.amount.toInt()}?", color = TextSecondary) },
            confirmButton = {
                TextButton(
                    onClick = {
                        showDeleteConfirm = false
                        onDelete()
                    }
                ) {
                    Text("Delete", color = CoralRose, fontWeight = FontWeight.Bold)
                }
            },
            dismissButton = {
                TextButton(onClick = { showDeleteConfirm = false }) {
                    Text("Cancel", color = TextPrimary)
                }
            },
            containerColor = Color(0xFF1E2333),
            shape = RoundedCornerShape(20.dp)
        )
    }
}
