package com.kharchapani.app.ui.dashboard

import androidx.compose.animation.AnimatedVisibility
import androidx.compose.foundation.background
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.items
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.*
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.Brush
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.kharchapani.app.data.model.ExpenseResponse
import com.kharchapani.app.theme.*
import com.kharchapani.app.viewmodel.DashboardUiState
import com.kharchapani.app.viewmodel.DashboardViewModel

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun DashboardScreen(
    dashboardViewModel: DashboardViewModel,
    userName: String?,
    onAddExpenseClick: () -> Unit,
    onVoiceExpenseClick: () -> Unit,
    onGuruClick: () -> Unit,
    onSettingsClick: () -> Unit,
    onViewAllExpenses: () -> Unit
) {
    val uiState by dashboardViewModel.uiState.collectAsState()
    val selectedPeriod by dashboardViewModel.selectedPeriod.collectAsState()

    LaunchedEffect(Unit) {
        dashboardViewModel.loadDashboardData()
    }

    Scaffold(
        topBar = {
            TopAppBar(
                title = {
                    Column {
                        Text(
                            text = "नमस्कार, ${userName ?: "User"}! 👋",
                            fontSize = 18.sp,
                            fontWeight = FontWeight.Bold,
                            color = TextPrimary
                        )
                        Text(
                            text = "KharchaPani Financial Engine",
                            fontSize = 12.sp,
                            color = Emerald400
                        )
                    }
                },
                actions = {
                    IconButton(onClick = onSettingsClick) {
                        Icon(Icons.Default.Settings, contentDescription = "Settings", tint = TextSecondary)
                    }
                },
                colors = TopAppBarDefaults.topAppBarColors(containerColor = ObsidianBlack)
            )
        },
        containerColor = ObsidianBlack
    ) { paddingValues ->
        Box(
            modifier = Modifier
                .fillMaxSize()
                .padding(paddingValues)
        ) {
            when (val state = uiState) {
                is DashboardUiState.Loading -> {
                    Box(modifier = Modifier.fillMaxSize(), contentAlignment = Alignment.Center) {
                        CircularProgressIndicator(color = Emerald500)
                    }
                }
                is DashboardUiState.Error -> {
                    Box(modifier = Modifier.fillMaxSize(), contentAlignment = Alignment.Center) {
                        Column(horizontalAlignment = Alignment.CenterHorizontally) {
                            Text(text = "Error: ${state.message}", color = Rose400)
                            Spacer(modifier = Modifier.height(12.dp))
                            Button(
                                onClick = { dashboardViewModel.loadDashboardData() },
                                colors = ButtonDefaults.buttonColors(containerColor = Emerald500)
                            ) {
                                Text("Retry", color = ObsidianBlack)
                            }
                        }
                    }
                }
                is DashboardUiState.Success -> {
                    val summary = state.summary
                    val budget = summary.budgetStatus
                    val comparison = state.comparison

                    LazyColumn(
                        modifier = Modifier
                            .fillMaxSize()
                            .padding(horizontal = 16.dp),
                        verticalArrangement = Arrangement.spacedBy(16.dp),
                        contentPadding = PaddingValues(bottom = 24.dp)
                    ) {
                        // Period Selector Chips
                        item {
                            Row(
                                modifier = Modifier
                                    .fillMaxWidth()
                                    .padding(vertical = 4.dp),
                                horizontalArrangement = Arrangement.spacedBy(8.dp)
                            ) {
                                listOf("day" to "Today", "week" to "This Week", "month" to "This Month").forEach { (periodKey, label) ->
                                    val isSelected = selectedPeriod == periodKey
                                    FilterChip(
                                        selected = isSelected,
                                        onClick = { dashboardViewModel.setPeriod(periodKey) },
                                        label = { Text(label, fontSize = 13.sp) },
                                        colors = FilterChipDefaults.filterChipColors(
                                            selectedContainerColor = Emerald500,
                                            selectedLabelColor = ObsidianBlack,
                                            containerColor = CardBackground,
                                            labelColor = TextSecondary
                                        )
                                    )
                                }
                            }
                        }

                        // Total Spent Highlight Hero Card
                        item {
                            Card(
                                modifier = Modifier.fillMaxWidth(),
                                shape = RoundedCornerShape(20.dp),
                                colors = CardDefaults.cardColors(containerColor = CardBackground)
                            ) {
                                Box(
                                    modifier = Modifier
                                        .fillMaxWidth()
                                        .background(
                                            Brush.verticalGradient(
                                                listOf(Color(0xFF0F2537), CardBackground)
                                            )
                                        )
                                        .padding(20.dp)
                                ) {
                                    Column {
                                        Text(
                                            text = "Total Spent (${selectedPeriod.replaceFirstChar { it.uppercase() }})",
                                            fontSize = 13.sp,
                                            color = TextSecondary
                                        )
                                        Text(
                                            text = "₹${String.format("%,.2f", summary.totalSpent)}",
                                            fontSize = 32.sp,
                                            fontWeight = FontWeight.Bold,
                                            color = Emerald400,
                                            modifier = Modifier.padding(vertical = 4.dp)
                                        )

                                        if (comparison != null) {
                                            Row(verticalAlignment = Alignment.CenterVertically) {
                                                Icon(
                                                    imageVector = if (comparison.isIncrease) Icons.Default.TrendingUp else Icons.Default.TrendingDown,
                                                    contentDescription = "Trend",
                                                    tint = if (comparison.isIncrease) Rose400 else Emerald400,
                                                    modifier = Modifier.size(16.dp)
                                                )
                                                Spacer(modifier = Modifier.width(4.dp))
                                                Text(
                                                    text = "${String.format("%.1f", comparison.percentageChange)}% vs previous period",
                                                    fontSize = 12.sp,
                                                    color = if (comparison.isIncrease) Rose400 else Emerald400
                                                )
                                            }
                                        }
                                    }
                                }
                            }
                        }

                        // Budget Status Card
                        if (budget != null && budget.limitAmount > 0) {
                            item {
                                Card(
                                    modifier = Modifier.fillMaxWidth(),
                                    shape = RoundedCornerShape(16.dp),
                                    colors = CardDefaults.cardColors(containerColor = CardBackground),
                                    border = CardDefaults.outlinedCardBorder().copy(brush = androidx.compose.ui.graphics.SolidColor(CardBorder))
                                ) {
                                    Column(modifier = Modifier.padding(16.dp)) {
                                        Row(
                                            modifier = Modifier.fillMaxWidth(),
                                            horizontalArrangement = Arrangement.SpaceBetween
                                        ) {
                                            Text("Monthly Budget", fontSize = 14.sp, fontWeight = FontWeight.SemiBold, color = TextPrimary)
                                            Text(
                                                "₹${String.format("%,.0f", budget.spentAmount)} / ₹${String.format("%,.0f", budget.limitAmount)}",
                                                fontSize = 13.sp,
                                                color = if (budget.isExceeded) Rose400 else Emerald400
                                            )
                                        }
                                        Spacer(modifier = Modifier.height(8.dp))
                                        LinearProgressIndicator(
                                            progress = (budget.percentageUsed / 100f).coerceIn(0.0, 1.0).toFloat(),
                                            modifier = Modifier
                                                .fillMaxWidth()
                                                .height(8.dp)
                                                .clip(RoundedCornerShape(4.dp)),
                                            color = if (budget.isExceeded) Rose500 else Emerald500,
                                            trackColor = ObsidianDark
                                        )
                                        Spacer(modifier = Modifier.height(6.dp))
                                        Text(
                                            text = if (budget.isExceeded) "⚠️ Budget exceeded by ₹${String.format("%,.0f", budget.spentAmount - budget.limitAmount)}" else "Remaining: ₹${String.format("%,.0f", budget.remainingAmount)}",
                                            fontSize = 12.sp,
                                            color = TextSecondary
                                        )
                                    }
                                }
                            }
                        }

                        // Quick Action Buttons
                        item {
                            Row(
                                modifier = Modifier.fillMaxWidth(),
                                horizontalArrangement = Arrangement.spacedBy(10.dp)
                            ) {
                                // Add Expense
                                Card(
                                    modifier = Modifier
                                        .weight(1f)
                                        .clickable { onAddExpenseClick() },
                                    shape = RoundedCornerShape(14.dp),
                                    colors = CardDefaults.cardColors(containerColor = CardBackground)
                                ) {
                                    Row(
                                        modifier = Modifier.padding(14.dp),
                                        verticalAlignment = Alignment.CenterVertically
                                    ) {
                                        Box(
                                            modifier = Modifier
                                                .size(36.dp)
                                                .background(EmeraldGlow, CircleShape),
                                            contentAlignment = Alignment.Center
                                        ) {
                                            Icon(Icons.Default.Add, contentDescription = "Add", tint = Emerald400)
                                        }
                                        Spacer(modifier = Modifier.width(10.dp))
                                        Text("Add Expense", fontSize = 13.sp, fontWeight = FontWeight.Medium, color = TextPrimary)
                                    }
                                }

                                // Voice Expense
                                Card(
                                    modifier = Modifier
                                        .weight(1f)
                                        .clickable { onVoiceExpenseClick() },
                                    shape = RoundedCornerShape(14.dp),
                                    colors = CardDefaults.cardColors(containerColor = CardBackground)
                                ) {
                                    Row(
                                        modifier = Modifier.padding(14.dp),
                                        verticalAlignment = Alignment.CenterVertically
                                    ) {
                                        Box(
                                            modifier = Modifier
                                                .size(36.dp)
                                                .background(Color(0x33A855F7), CircleShape),
                                            contentAlignment = Alignment.Center
                                        ) {
                                            Icon(Icons.Default.Mic, contentDescription = "Voice", tint = Purple500)
                                        }
                                        Spacer(modifier = Modifier.width(10.dp))
                                        Text("बोली खर्चा", fontSize = 13.sp, fontWeight = FontWeight.Medium, color = TextPrimary)
                                    }
                                }
                            }
                        }

                        // Recent Transactions Section Header
                        item {
                            Row(
                                modifier = Modifier
                                    .fillMaxWidth()
                                    .padding(top = 8.dp),
                                horizontalArrangement = Arrangement.SpaceBetween,
                                verticalAlignment = Alignment.CenterVertically
                            ) {
                                Text("Recent Transactions", fontSize = 16.sp, fontWeight = FontWeight.Bold, color = TextPrimary)
                                Text(
                                    "View All",
                                    fontSize = 13.sp,
                                    color = Emerald400,
                                    modifier = Modifier.clickable { onViewAllExpenses() }
                                )
                            }
                        }

                        // Recent Transactions List
                        if (summary.recentExpenses.isEmpty()) {
                            item {
                                Card(
                                    modifier = Modifier.fillMaxWidth(),
                                    colors = CardDefaults.cardColors(containerColor = CardBackground),
                                    shape = RoundedCornerShape(12.dp)
                                ) {
                                    Text(
                                        "No transactions yet. Tap '+ Add Expense' or 'बोली खर्चा' to record one!",
                                        fontSize = 13.sp,
                                        color = TextMuted,
                                        modifier = Modifier.padding(16.dp)
                                    )
                                }
                            }
                        } else {
                            items(summary.recentExpenses.take(5)) { expense ->
                                TransactionRowItem(expense = expense)
                            }
                        }
                    }
                }
            }
        }
    }
}

@Composable
fun TransactionRowItem(expense: ExpenseResponse) {
    Card(
        modifier = Modifier.fillMaxWidth(),
        shape = RoundedCornerShape(14.dp),
        colors = CardDefaults.cardColors(containerColor = CardBackground),
        border = CardDefaults.outlinedCardBorder().copy(brush = androidx.compose.ui.graphics.SolidColor(CardBorder))
    ) {
        Row(
            modifier = Modifier
                .fillMaxWidth()
                .padding(14.dp),
            horizontalArrangement = Arrangement.SpaceBetween,
            verticalAlignment = Alignment.CenterVertically
        ) {
            Row(verticalAlignment = Alignment.CenterVertically) {
                Box(
                    modifier = Modifier
                        .size(40.dp)
                        .background(ObsidianDark, CircleShape),
                    contentAlignment = Alignment.Center
                ) {
                    Text(
                        text = when (expense.categoryName?.lowercase()) {
                            "food", "food & dining" -> "🍔"
                            "travel", "transport" -> "🚗"
                            "groceries" -> "🛒"
                            "utilities", "bills" -> "💡"
                            "shopping" -> "🛍️"
                            "salary", "income" -> "💰"
                            else -> "💸"
                        },
                        fontSize = 18.sp
                    )
                }
                Spacer(modifier = Modifier.width(12.dp))
                Column {
                    Text(
                        text = expense.description?.takeIf { it.isNotBlank() } ?: (expense.categoryName ?: "Expense"),
                        fontSize = 14.sp,
                        fontWeight = FontWeight.SemiBold,
                        color = TextPrimary
                    )
                    Text(
                        text = "${expense.categoryName ?: "Uncategorized"} • ${expense.expenseDate.take(10)}",
                        fontSize = 12.sp,
                        color = TextMuted
                    )
                }
            }
            Text(
                text = "-₹${String.format("%,.2f", expense.amount)}",
                fontSize = 15.sp,
                fontWeight = FontWeight.Bold,
                color = Rose400
            )
        }
    }
}
