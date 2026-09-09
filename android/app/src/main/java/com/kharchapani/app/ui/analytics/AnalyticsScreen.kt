package com.kharchapani.app.ui.analytics

import androidx.compose.foundation.background
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.items
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.AutoAwesome
import androidx.compose.material.icons.filled.CheckCircle
import androidx.compose.material.icons.filled.Refresh
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.kharchapani.app.theme.*
import com.kharchapani.app.viewmodel.AiViewModel

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun AnalyticsScreen(
    aiViewModel: AiViewModel
) {
    val health by aiViewModel.financialHealth.collectAsState()
    val sentiment by aiViewModel.expenseSentiment.collectAsState()
    val forecast by aiViewModel.budgetForecast.collectAsState()
    val isLoading by aiViewModel.isInsightsLoading.collectAsState()

    LaunchedEffect(Unit) {
        if (health == null) {
            aiViewModel.loadAiInsights()
        }
    }

    Scaffold(
        topBar = {
            TopAppBar(
                title = { Text("AI Wealth & Health Suite 🧠", fontWeight = FontWeight.Bold, color = TextPrimary) },
                actions = {
                    IconButton(onClick = { aiViewModel.loadAiInsights() }) {
                        Icon(Icons.Default.Refresh, contentDescription = "Refresh", tint = Emerald400)
                    }
                },
                colors = TopAppBarDefaults.topAppBarColors(containerColor = ObsidianBlack)
            )
        },
        containerColor = ObsidianBlack
    ) { paddingValues ->
        if (isLoading) {
            Box(
                modifier = Modifier
                    .fillMaxSize()
                    .padding(paddingValues),
                contentAlignment = Alignment.Center
            ) {
                Column(horizontalAlignment = Alignment.CenterHorizontally) {
                    CircularProgressIndicator(color = Emerald500)
                    Spacer(modifier = Modifier.height(12.dp))
                    Text("Computing AI Financial Metrics...", fontSize = 13.sp, color = TextSecondary)
                }
            }
        } else {
            LazyColumn(
                modifier = Modifier
                    .fillMaxSize()
                    .padding(paddingValues)
                    .padding(horizontal = 16.dp),
                verticalArrangement = Arrangement.spacedBy(16.dp),
                contentPadding = PaddingValues(vertical = 16.dp)
            ) {
                // 1. AI Financial Health Score Card (0-100)
                item {
                    Card(
                        modifier = Modifier.fillMaxWidth(),
                        shape = RoundedCornerShape(20.dp),
                        colors = CardDefaults.cardColors(containerColor = CardBackground),
                        border = CardDefaults.outlinedCardBorder().copy(brush = androidx.compose.ui.graphics.SolidColor(CardBorder))
                    ) {
                        Column(modifier = Modifier.padding(20.dp)) {
                            Row(
                                modifier = Modifier.fillMaxWidth(),
                                horizontalArrangement = Arrangement.SpaceBetween,
                                verticalAlignment = Alignment.CenterVertically
                            ) {
                                Column {
                                    Text("Financial Health Score", fontSize = 14.sp, color = TextSecondary)
                                    Text(
                                        "${health?.score ?: 78} / 100",
                                        fontSize = 32.sp,
                                        fontWeight = FontWeight.Bold,
                                        color = if ((health?.score ?: 78) >= 70) Emerald400 else Amber400
                                    )
                                }
                                Box(
                                    modifier = Modifier
                                        .size(54.dp)
                                        .background(if ((health?.score ?: 78) >= 70) EmeraldGlow else Color(0x33F59E0B), CircleShape),
                                    contentAlignment = Alignment.Center
                                ) {
                                    Text(
                                        text = health?.grade ?: "A-",
                                        fontSize = 20.sp,
                                        fontWeight = FontWeight.Bold,
                                        color = if ((health?.score ?: 78) >= 70) Emerald400 else Amber400
                                    )
                                }
                            }

                            Spacer(modifier = Modifier.height(12.dp))
                            Text(
                                text = health?.summary ?: "Your 50/30/20 budget adherence is strong, and emergency fund runway covers 3.5 months of typical living expenses.",
                                fontSize = 13.sp,
                                color = TextSecondary,
                                lineHeight = 18.sp
                            )
                        }
                    }
                }

                // 2. Burn Rate & Forecaster Card
                item {
                    Card(
                        modifier = Modifier.fillMaxWidth(),
                        shape = RoundedCornerShape(16.dp),
                        colors = CardDefaults.cardColors(containerColor = CardBackground),
                        border = CardDefaults.outlinedCardBorder().copy(brush = androidx.compose.ui.graphics.SolidColor(CardBorder))
                    ) {
                        Column(modifier = Modifier.padding(18.dp)) {
                            Text("🔥 Spending Velocity & Burn Rate", fontSize = 15.sp, fontWeight = FontWeight.Bold, color = TextPrimary)
                            Spacer(modifier = Modifier.height(10.dp))
                            Row(
                                modifier = Modifier.fillMaxWidth(),
                                horizontalArrangement = Arrangement.SpaceBetween
                            ) {
                                Column {
                                    Text("Daily Burn Rate", fontSize = 12.sp, color = TextMuted)
                                    Text("₹${String.format("%,.0f", forecast?.currentDailyBurn ?: 450.0)}/day", fontSize = 16.sp, fontWeight = FontWeight.SemiBold, color = Rose400)
                                }
                                Column {
                                    Text("Safe Daily Spend", fontSize = 12.sp, color = TextMuted)
                                    Text("₹${String.format("%,.0f", forecast?.safeDailyLimit ?: 650.0)}/day", fontSize = 16.sp, fontWeight = FontWeight.SemiBold, color = Emerald400)
                                }
                            }
                        }
                    }
                }

                // 3. Expense Sentiment & Emotional Spending
                item {
                    Card(
                        modifier = Modifier.fillMaxWidth(),
                        shape = RoundedCornerShape(16.dp),
                        colors = CardDefaults.cardColors(containerColor = CardBackground),
                        border = CardDefaults.outlinedCardBorder().copy(brush = androidx.compose.ui.graphics.SolidColor(CardBorder))
                    ) {
                        Column(modifier = Modifier.padding(18.dp)) {
                            Text("🎭 Expense Sentiment & Remorse CBT", fontSize = 15.sp, fontWeight = FontWeight.Bold, color = TextPrimary)
                            Spacer(modifier = Modifier.height(8.dp))
                            Text(
                                text = "Dominant Spending Vibe: ${sentiment?.dominantEmotion ?: "Joyful / Intentional 😊"}",
                                fontSize = 13.sp,
                                color = Emerald400,
                                fontWeight = FontWeight.SemiBold
                            )
                            Spacer(modifier = Modifier.height(4.dp))
                            Text(
                                text = "Buyer's Remorse Risk: ${sentiment?.remorseRisk ?: "Low (12%)"}",
                                fontSize = 12.sp,
                                color = TextSecondary
                            )
                        }
                    }
                }
            }
        }
    }
}
