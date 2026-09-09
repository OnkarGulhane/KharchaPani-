package com.kharchapani.app.ui.dashboard

import androidx.compose.animation.AnimatedVisibility
import androidx.compose.animation.core.*
import androidx.compose.foundation.BorderStroke
import androidx.compose.foundation.background
import androidx.compose.foundation.border
import androidx.compose.foundation.clickable
import androidx.compose.foundation.interaction.MutableInteractionSource
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.LazyColumn
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
import androidx.compose.ui.draw.scale
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
    var showSmsNudge by remember { mutableStateOf(true) }

    val infiniteTransition = rememberInfiniteTransition(label = "pulse_live")
    val pulseAlpha by infiniteTransition.animateFloat(
        initialValue = 0.35f,
        targetValue = 1f,
        animationSpec = infiniteRepeatable(
            animation = tween(1000, easing = LinearEasing),
            repeatMode = RepeatMode.Reverse
        ),
        label = "pulse_alpha"
    )

    LaunchedEffect(Unit) {
        dashboardViewModel.loadDashboardData()
    }

    Scaffold(
        topBar = {
            TopAppBar(
                title = {
                    Row(
                        verticalAlignment = Alignment.CenterVertically,
                        horizontalArrangement = Arrangement.spacedBy(10.dp)
                    ) {
                        // Glowing Brand Emblem Squircle
                        Box(
                            modifier = Modifier
                                .size(40.dp)
                                .shadow(10.dp, shape = RoundedCornerShape(13.dp), spotColor = Color(0xFF8B5CF6))
                                .clip(RoundedCornerShape(13.dp))
                                .background(
                                    Brush.linearGradient(
                                        listOf(Color(0xFF6366F1), Color(0xFF8B5CF6), Color(0xFFA855F7))
                                    )
                                )
                                .border(
                                    BorderStroke(
                                        1.dp,
                                        Brush.verticalGradient(
                                            listOf(Color(0x80FFFFFF), Color(0x20FFFFFF))
                                        )
                                    ),
                                    RoundedCornerShape(13.dp)
                                ),
                            contentAlignment = Alignment.Center
                        ) {
                            Icon(
                                imageVector = Icons.Rounded.AccountBalanceWallet,
                                contentDescription = "Logo",
                                tint = Color.White,
                                modifier = Modifier.size(22.dp)
                            )
                        }
                        Column {
                            Text(
                                text = "KharchaPani",
                                style = MaterialTheme.typography.titleMedium,
                                fontWeight = FontWeight.Bold,
                                color = TextPrimary,
                                letterSpacing = (-0.3).sp
                            )
                            Text(
                                text = "Obsidian Kinetic Hub",
                                style = MaterialTheme.typography.labelSmall,
                                color = Color(0xFFD0BCFF),
                                fontWeight = FontWeight.SemiBold
                            )
                        }
                    }
                },
                actions = {
                    // Notification Button with Coral Rose indicator dot
                    Box(
                        modifier = Modifier
                            .size(40.dp)
                            .clip(CircleShape)
                            .background(Color(0x33262A35))
                            .border(1.dp, BorderGlass, CircleShape)
                            .clickable { },
                        contentAlignment = Alignment.Center
                    ) {
                        Icon(
                            imageVector = Icons.Rounded.Notifications,
                            contentDescription = "Notifications",
                            tint = Color(0xFFCBC3D7),
                            modifier = Modifier.size(20.dp)
                        )
                        Box(
                            modifier = Modifier
                                .align(Alignment.TopEnd)
                                .padding(top = 9.dp, end = 9.dp)
                                .size(7.dp)
                                .background(Color(0xFFF43F5E), CircleShape)
                                .border(1.dp, Color(0xFF0F131D), CircleShape)
                        )
                    }
                    Spacer(modifier = Modifier.width(8.dp))
                    // Profile Avatar with Multi-tone glowing border
                    Box(
                        modifier = Modifier
                            .padding(end = 12.dp)
                            .size(40.dp)
                            .shadow(8.dp, shape = CircleShape, spotColor = Color(0xFF6366F1))
                            .clip(CircleShape)
                            .background(
                                Brush.linearGradient(
                                    listOf(Color(0xFF3131C0), Color(0xFF8B5CF6))
                                )
                            )
                            .border(
                                BorderStroke(
                                    1.5.dp,
                                    Brush.sweepGradient(
                                        listOf(Color(0xFF6366F1), Color(0xFF8B5CF6), Color(0xFF10B981), Color(0xFF6366F1))
                                    )
                                ),
                                CircleShape
                            )
                            .clickable { onSettingsClick() },
                        contentAlignment = Alignment.Center
                    ) {
                        Text(
                            text = (userName?.take(1) ?: "O").uppercase(),
                            fontWeight = FontWeight.Bold,
                            color = Color.White,
                            fontSize = 15.sp
                        )
                    }
                },
                colors = TopAppBarDefaults.topAppBarColors(
                    containerColor = ObsidianCanvas
                )
            )
        },
        containerColor = ObsidianCanvas
    ) { paddingValues ->
        ObsidianAtmosphere(
            modifier = Modifier
                .fillMaxSize()
                .padding(paddingValues)
        ) {
            when (val state = uiState) {
                is DashboardUiState.Loading -> {
                    Box(modifier = Modifier.fillMaxSize(), contentAlignment = Alignment.Center) {
                        CircularProgressIndicator(color = TertiaryLight)
                    }
                }
                is DashboardUiState.Error -> {
                    Box(modifier = Modifier.fillMaxSize(), contentAlignment = Alignment.Center) {
                        Column(
                            horizontalAlignment = Alignment.CenterHorizontally,
                            modifier = Modifier.padding(24.dp)
                        ) {
                            Text(
                                text = "Error: ${state.message}",
                                style = MaterialTheme.typography.bodyMedium,
                                color = CoralRose
                            )
                            Spacer(modifier = Modifier.height(16.dp))
                            Button(
                                onClick = { dashboardViewModel.loadDashboardData() },
                                shape = RoundedCornerShape(percent = 50),
                                colors = ButtonDefaults.buttonColors(containerColor = NeonIndigo)
                            ) {
                                Text("Retry", color = TextPrimary, fontWeight = FontWeight.SemiBold)
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
                        verticalArrangement = Arrangement.spacedBy(14.dp),
                        contentPadding = PaddingValues(top = 6.dp, bottom = 32.dp)
                    ) {
                        // 1. Segmented Timeframe Switcher Pill Bar
                        item {
                            Box(
                                modifier = Modifier
                                    .fillMaxWidth()
                                    .background(
                                        Color(0xCC1F2433),
                                        RoundedCornerShape(percent = 50)
                                    )
                                    .border(1.dp, BorderGlass, RoundedCornerShape(percent = 50))
                                    .padding(3.dp)
                            ) {
                                Row(
                                    modifier = Modifier.fillMaxWidth(),
                                    horizontalArrangement = Arrangement.SpaceBetween
                                ) {
                                    listOf(
                                        "day" to "Today",
                                        "week" to "This Week",
                                        "month" to "This Month"
                                    ).forEach { (periodKey, label) ->
                                        val isSelected = selectedPeriod == periodKey
                                        Box(
                                            modifier = Modifier
                                                .weight(1f)
                                                .height(38.dp)
                                                .shadow(if (isSelected) 10.dp else 0.dp, shape = RoundedCornerShape(percent = 50), spotColor = Color(0xFF6366F1))
                                                .clip(RoundedCornerShape(percent = 50))
                                                .background(
                                                    if (isSelected) {
                                                        Brush.linearGradient(listOf(Color(0xFF6366F1), Color(0xFF8B5CF6)))
                                                    } else {
                                                        Brush.linearGradient(listOf(Color.Transparent, Color.Transparent))
                                                    }
                                                )
                                                .clickable { dashboardViewModel.setPeriod(periodKey) },
                                            contentAlignment = Alignment.Center
                                        ) {
                                            Text(
                                                text = label,
                                                style = MaterialTheme.typography.labelMedium,
                                                fontWeight = if (isSelected) FontWeight.Bold else FontWeight.Medium,
                                                color = if (isSelected) Color(0xFFFFFFFF) else Color(0xFF94A3B8)
                                            )
                                        }
                                    }
                                }
                            }
                        }

                        // 2. Hero Balance Glassmorphic Card with Atmospheric Radial Glow
                        item {
                            val cardShape = RoundedCornerShape(24.dp)
                            Box(
                                modifier = Modifier.fillMaxWidth()
                            ) {
                                // Atmospheric Radial Glow behind card
                                Box(
                                    modifier = Modifier
                                        .align(Alignment.TopCenter)
                                        .offset(y = (-8).dp)
                                        .size(width = 260.dp, height = 110.dp)
                                        .background(
                                            Brush.radialGradient(
                                                listOf(
                                                    Color(0x408B5CF6),
                                                    Color(0x1F6366F1),
                                                    Color.Transparent
                                                )
                                            ),
                                            CircleShape
                                        )
                                )

                                GlassmorphicCard(
                                    modifier = Modifier.fillMaxWidth(),
                                    shape = cardShape,
                                    backgroundColor = Color(0xF2161A26),
                                    spotColor = Color(0x808B5CF6),
                                    elevation = 20.dp
                                ) {
                                    // Top Accent Glow Strip
                                    Box(
                                        modifier = Modifier
                                            .fillMaxWidth()
                                            .height(3.dp)
                                            .background(
                                                Brush.horizontalGradient(
                                                    listOf(
                                                        Color(0xFF6366F1),
                                                        Color(0xFF8B5CF6),
                                                        Color(0xFF10B981)
                                                    )
                                                )
                                            )
                                    )

                                    Column(
                                        modifier = Modifier
                                            .fillMaxWidth()
                                            .padding(20.dp),
                                        verticalArrangement = Arrangement.spacedBy(12.dp)
                                    ) {
                                        // Header Row
                                        Row(
                                            modifier = Modifier.fillMaxWidth(),
                                            horizontalArrangement = Arrangement.SpaceBetween,
                                            verticalAlignment = Alignment.CenterVertically
                                        ) {
                                            Row(
                                                verticalAlignment = Alignment.CenterVertically,
                                                horizontalArrangement = Arrangement.spacedBy(8.dp)
                                            ) {
                                                Box(
                                                    modifier = Modifier
                                                        .size(30.dp)
                                                        .clip(RoundedCornerShape(9.dp))
                                                        .background(
                                                            Brush.linearGradient(
                                                                listOf(Color(0xFF6366F1), Color(0xFF8B5CF6))
                                                            )
                                                        ),
                                                    contentAlignment = Alignment.Center
                                                ) {
                                                    Icon(
                                                        imageVector = Icons.Rounded.AccountBalanceWallet,
                                                        contentDescription = "Wallet",
                                                        tint = Color.White,
                                                        modifier = Modifier.size(17.dp)
                                                    )
                                                }
                                                Text(
                                                    text = "TOTAL ${selectedPeriod.uppercase()} SPEND",
                                                    style = MaterialTheme.typography.labelSmall,
                                                    fontWeight = FontWeight.Bold,
                                                    color = Color(0xFFD0BCFF),
                                                    letterSpacing = 1.sp
                                                )
                                            }

                                            // Live Pulsating Indicator
                                            Row(
                                                verticalAlignment = Alignment.CenterVertically,
                                                horizontalArrangement = Arrangement.spacedBy(5.dp),
                                                modifier = Modifier
                                                    .background(Color(0x3310B981), RoundedCornerShape(percent = 50))
                                                    .border(1.dp, Color(0x5510B981), RoundedCornerShape(percent = 50))
                                                    .padding(horizontal = 8.dp, vertical = 3.dp)
                                            ) {
                                                Box(
                                                    modifier = Modifier
                                                        .size(6.dp)
                                                        .scale(pulseAlpha)
                                                        .background(Color(0xFF10B981), CircleShape)
                                                )
                                                Text(
                                                    text = "LIVE",
                                                    fontSize = 10.sp,
                                                    fontWeight = FontWeight.Bold,
                                                    color = Color(0xFF4EDEA3)
                                                )
                                            }
                                        }

                                        // Tabular Hero Spend
                                        Row(
                                            verticalAlignment = Alignment.Bottom,
                                            horizontalArrangement = Arrangement.spacedBy(3.dp)
                                        ) {
                                            Text(
                                                text = "₹",
                                                fontSize = 28.sp,
                                                fontWeight = FontWeight.Light,
                                                color = TextPrimary
                                            )
                                            Text(
                                                text = String.format("%,.2f", summary.totalSpent),
                                                fontSize = 36.sp,
                                                fontWeight = FontWeight.ExtraBold,
                                                color = TextPrimary,
                                                letterSpacing = (-0.5).sp
                                            )
                                        }

                                        // Inflow / Outflow Cash Flow Pills
                                        Row(
                                            modifier = Modifier.fillMaxWidth(),
                                            horizontalArrangement = Arrangement.spacedBy(10.dp)
                                        ) {
                                            // Inflow Pill
                                            Box(
                                                modifier = Modifier
                                                    .weight(1f)
                                                    .clip(RoundedCornerShape(12.dp))
                                                    .background(Color(0x2210B981))
                                                    .border(1.dp, Color(0x4010B981), RoundedCornerShape(12.dp))
                                                    .padding(horizontal = 10.dp, vertical = 8.dp)
                                            ) {
                                                Row(
                                                    verticalAlignment = Alignment.CenterVertically,
                                                    horizontalArrangement = Arrangement.spacedBy(6.dp)
                                                ) {
                                                    Icon(
                                                        imageVector = Icons.Rounded.ArrowDownward,
                                                        contentDescription = "Income",
                                                        tint = Color(0xFF10B981),
                                                        modifier = Modifier.size(15.dp)
                                                    )
                                                    Column {
                                                        Text("INCOME", fontSize = 9.sp, fontWeight = FontWeight.Bold, color = Color(0xFF4EDEA3))
                                                        Text("₹ 45,000", fontSize = 12.sp, fontWeight = FontWeight.Bold, color = TextPrimary)
                                                    }
                                                }
                                            }

                                            // Outflow Pill
                                            Box(
                                                modifier = Modifier
                                                    .weight(1f)
                                                    .clip(RoundedCornerShape(12.dp))
                                                    .background(Color(0x22F43F5E))
                                                    .border(1.dp, Color(0x40F43F5E), RoundedCornerShape(12.dp))
                                                    .padding(horizontal = 10.dp, vertical = 8.dp)
                                            ) {
                                                Row(
                                                    verticalAlignment = Alignment.CenterVertically,
                                                    horizontalArrangement = Arrangement.spacedBy(6.dp)
                                                ) {
                                                    Icon(
                                                        imageVector = Icons.Rounded.ArrowUpward,
                                                        contentDescription = "Expense",
                                                        tint = Color(0xFFF43F5E),
                                                        modifier = Modifier.size(15.dp)
                                                    )
                                                    Column {
                                                        Text("OUTFLOW", fontSize = 9.sp, fontWeight = FontWeight.Bold, color = Color(0xFFFDA4AF))
                                                        Text("₹ ${summary.totalSpent.toInt()}", fontSize = 12.sp, fontWeight = FontWeight.Bold, color = TextPrimary)
                                                    }
                                                }
                                            }
                                        }

                                        // 3-Color Budget Velocity Bar
                                        if (budget != null) {
                                            Column(verticalArrangement = Arrangement.spacedBy(6.dp)) {
                                                Row(
                                                    modifier = Modifier.fillMaxWidth(),
                                                    horizontalArrangement = Arrangement.SpaceBetween
                                                ) {
                                                    Text(
                                                        text = "Budget: ₹${budget.spentAmount.toInt()} / ₹${budget.limitAmount.toInt()}",
                                                        style = MaterialTheme.typography.bodySmall,
                                                        color = TextSecondary,
                                                        fontSize = 11.5.sp
                                                    )
                                                    Text(
                                                        text = "${String.format("%.1f", budget.percentageUsed)}% used",
                                                        style = MaterialTheme.typography.labelSmall,
                                                        color = if (budget.isExceeded) CoralRose else EmeraldMint,
                                                        fontWeight = FontWeight.Bold
                                                    )
                                                }

                                                // Multi-Stop Gradient Track
                                                Box(
                                                    modifier = Modifier
                                                        .fillMaxWidth()
                                                        .height(7.dp)
                                                        .clip(RoundedCornerShape(percent = 50))
                                                        .background(Color(0xFF262A35))
                                                ) {
                                                    Box(
                                                        modifier = Modifier
                                                            .fillMaxWidth((budget.percentageUsed.toFloat() / 100f).coerceIn(0f, 1f))
                                                            .fillMaxHeight()
                                                            .clip(RoundedCornerShape(percent = 50))
                                                            .background(
                                                                Brush.horizontalGradient(
                                                                    listOf(
                                                                        Color(0xFF10B981),
                                                                        Color(0xFF6366F1),
                                                                        Color(0xFFF43F5E)
                                                                    )
                                                                )
                                                            )
                                                    )
                                                }
                                            }
                                        }
                                    }
                                }
                            }
                        }

                        // 3. Quick Actions Row
                        item {
                            Row(
                                modifier = Modifier.fillMaxWidth(),
                                horizontalArrangement = Arrangement.spacedBy(10.dp)
                            ) {
                                // Add Expense Gradient Action
                                Box(
                                    modifier = Modifier
                                        .weight(1.3f)
                                        .height(48.dp)
                                        .shadow(12.dp, shape = RoundedCornerShape(14.dp), spotColor = Color(0xFF6366F1))
                                        .clip(RoundedCornerShape(14.dp))
                                        .background(
                                            Brush.linearGradient(
                                                listOf(Color(0xFF6366F1), Color(0xFF8B5CF6))
                                            )
                                        )
                                        .clickable { onAddExpenseClick() },
                                    contentAlignment = Alignment.Center
                                ) {
                                    Row(
                                        verticalAlignment = Alignment.CenterVertically,
                                        horizontalArrangement = Arrangement.spacedBy(6.dp)
                                    ) {
                                        Icon(
                                            imageVector = Icons.Rounded.AddCircle,
                                            contentDescription = "Add",
                                            tint = Color.White,
                                            modifier = Modifier.size(19.dp)
                                        )
                                        Text(
                                            text = "+ Add Expense",
                                            fontWeight = FontWeight.Bold,
                                            color = Color.White,
                                            fontSize = 13.5.sp
                                        )
                                    }
                                }

                                // Ask Guru Action
                                Box(
                                    modifier = Modifier
                                        .weight(1f)
                                        .height(48.dp)
                                        .shadow(8.dp, shape = RoundedCornerShape(14.dp), spotColor = Color(0xFF8B5CF6))
                                        .clip(RoundedCornerShape(14.dp))
                                        .background(Color(0xE61F2433))
                                        .border(1.dp, BorderGlass, RoundedCornerShape(14.dp))
                                        .clickable { onGuruClick() },
                                    contentAlignment = Alignment.Center
                                ) {
                                    Row(
                                        verticalAlignment = Alignment.CenterVertically,
                                        horizontalArrangement = Arrangement.spacedBy(6.dp)
                                    ) {
                                        Icon(
                                            imageVector = Icons.Rounded.AutoAwesome,
                                            contentDescription = "Guru AI",
                                            tint = Color(0xFFD0BCFF),
                                            modifier = Modifier.size(18.dp)
                                        )
                                        Text(
                                            text = "Ask Guru",
                                            fontWeight = FontWeight.SemiBold,
                                            color = TextPrimary,
                                            fontSize = 13.sp
                                        )
                                    }
                                }
                            }
                        }

                        // 4. SMS Auto-Detect Smart Nudge Card
                        if (showSmsNudge) {
                            item {
                                GlassmorphicCard(
                                    modifier = Modifier.fillMaxWidth(),
                                    shape = RoundedCornerShape(16.dp),
                                    backgroundColor = Color(0xCC1A1F2C),
                                    spotColor = Color(0x4010B981),
                                    elevation = 8.dp
                                ) {
                                    Row(
                                        modifier = Modifier
                                            .fillMaxWidth()
                                            .padding(14.dp),
                                        verticalAlignment = Alignment.CenterVertically,
                                        horizontalArrangement = Arrangement.SpaceBetween
                                    ) {
                                        Row(
                                            verticalAlignment = Alignment.CenterVertically,
                                            horizontalArrangement = Arrangement.spacedBy(10.dp),
                                            modifier = Modifier.weight(1f)
                                        ) {
                                            Box(
                                                modifier = Modifier
                                                    .size(36.dp)
                                                    .shadow(6.dp, shape = RoundedCornerShape(10.dp), spotColor = Color(0xFF10B981))
                                                .clip(RoundedCornerShape(10.dp))
                                                .background(
                                                    Brush.linearGradient(
                                                        listOf(Color(0xFF10B981), Color(0xFF059669))
                                                    )
                                                ),
                                                contentAlignment = Alignment.Center
                                            ) {
                                                Icon(
                                                    imageVector = Icons.Rounded.Sms,
                                                    contentDescription = "SMS",
                                                    tint = Color.White,
                                                    modifier = Modifier.size(18.dp)
                                                )
                                            }
                                            Column {
                                                Text(
                                                    text = "Instant SMS Tracking",
                                                    style = MaterialTheme.typography.labelMedium,
                                                    fontWeight = FontWeight.Bold,
                                                    color = TextPrimary
                                                )
                                                Text(
                                                    text = "Auto-detect bank debit SMS alerts",
                                                    style = MaterialTheme.typography.bodySmall,
                                                    color = TextSecondary,
                                                    fontSize = 11.sp
                                                )
                                            }
                                        }

                                        IconButton(
                                            onClick = { showSmsNudge = false },
                                            modifier = Modifier.size(24.dp)
                                        ) {
                                            Icon(
                                                imageVector = Icons.Rounded.Close,
                                                contentDescription = "Dismiss",
                                                tint = TextMuted,
                                                modifier = Modifier.size(16.dp)
                                            )
                                        }
                                    }
                                }
                            }
                        }

                        // 5. Recent Transactions Header
                        item {
                            Row(
                                modifier = Modifier
                                    .fillMaxWidth()
                                    .padding(top = 6.dp),
                                horizontalArrangement = Arrangement.SpaceBetween,
                                verticalAlignment = Alignment.CenterVertically
                            ) {
                                Row(
                                    verticalAlignment = Alignment.CenterVertically,
                                    horizontalArrangement = Arrangement.spacedBy(6.dp)
                                ) {
                                    Icon(
                                        imageVector = Icons.Rounded.ReceiptLong,
                                        contentDescription = "Recent",
                                        tint = Color(0xFFD0BCFF),
                                        modifier = Modifier.size(18.dp)
                                    )
                                    Text(
                                        text = "Recent Transactions",
                                        style = MaterialTheme.typography.titleSmall,
                                        fontWeight = FontWeight.Bold,
                                        color = TextPrimary
                                    )
                                }
                                Text(
                                    text = "View All →",
                                    style = MaterialTheme.typography.labelMedium,
                                    color = Color(0xFF8B5CF6),
                                    fontWeight = FontWeight.Bold,
                                    modifier = Modifier.clickable { onViewAllExpenses() }
                                )
                            }
                        }

                        // 6. Recent Transaction Items
                        if (summary.recentExpenses.isEmpty()) {
                            item {
                                GlassmorphicCard(
                                    modifier = Modifier.fillMaxWidth(),
                                    shape = RoundedCornerShape(16.dp),
                                    backgroundColor = Color(0x99171C28)
                                ) {
                                    Column(
                                        modifier = Modifier
                                            .fillMaxWidth()
                                            .padding(24.dp),
                                        horizontalAlignment = Alignment.CenterHorizontally
                                    ) {
                                        Text("No expenses logged yet", color = TextSecondary)
                                        Spacer(modifier = Modifier.height(8.dp))
                                        Text("+ Add your first expense", color = Color(0xFF8B5CF6), fontWeight = FontWeight.Bold, modifier = Modifier.clickable { onAddExpenseClick() })
                                    }
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
    GlassmorphicCard(
        modifier = Modifier.fillMaxWidth(),
        shape = RoundedCornerShape(16.dp),
        backgroundColor = Color(0xE6171B26),
        spotColor = Color(0x226366F1),
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
                    size = 42.dp,
                    iconSize = 20.dp,
                    shape = RoundedCornerShape(12.dp)
                )

                Column(verticalArrangement = Arrangement.spacedBy(2.dp)) {
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
                                fontSize = 9.sp,
                                color = Color(0xFFC7C4D7),
                                fontWeight = FontWeight.Medium
                            )
                        }
                    }
                }
            }

            // Amount
            Text(
                text = "-₹${String.format("%,.0f", expense.amount)}",
                style = MaterialTheme.typography.titleSmall,
                fontWeight = FontWeight.Bold,
                color = CoralRose,
                fontSize = 15.sp
            )
        }
    }
}
