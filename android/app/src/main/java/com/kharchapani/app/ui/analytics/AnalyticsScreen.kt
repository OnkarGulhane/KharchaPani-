package com.kharchapani.app.ui.analytics

import androidx.compose.animation.core.*
import androidx.compose.foundation.BorderStroke
import androidx.compose.foundation.Canvas
import androidx.compose.foundation.background
import androidx.compose.foundation.border
import androidx.compose.foundation.clickable
import androidx.compose.foundation.interaction.MutableInteractionSource
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.LazyColumn
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
import androidx.compose.ui.graphics.StrokeCap
import androidx.compose.ui.graphics.drawscope.Stroke
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.kharchapani.app.theme.*
import com.kharchapani.app.ui.components.GlassmorphicCard
import com.kharchapani.app.ui.components.ObsidianAtmosphere
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

    val targetScore = (health?.score ?: 84).toFloat()
    val animatedScore = remember { Animatable(0f) }

    LaunchedEffect(targetScore) {
        animatedScore.animateTo(
            targetValue = targetScore,
            animationSpec = tween(durationMillis = 1200, easing = FastOutSlowInEasing)
        )
    }

    LaunchedEffect(Unit) {
        aiViewModel.loadAiInsights()
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
                                imageVector = Icons.Rounded.Insights,
                                contentDescription = "Analytics",
                                tint = Color.White,
                                modifier = Modifier.size(20.dp)
                            )
                        }
                        Column {
                            Text(
                                text = "Financial Health & Analytics",
                                style = MaterialTheme.typography.titleMedium,
                                fontWeight = FontWeight.Bold,
                                color = TextPrimary
                            )
                            Text(
                                text = "AI Intelligence Analysis",
                                style = MaterialTheme.typography.labelSmall,
                                color = Color(0xFFD0BCFF),
                                fontWeight = FontWeight.Medium
                            )
                        }
                    }
                },
                actions = {
                    Box(
                        modifier = Modifier
                            .padding(end = 12.dp)
                            .size(38.dp)
                            .clip(CircleShape)
                            .background(Color(0x33262A35))
                            .border(1.dp, BorderGlass, CircleShape)
                            .clickable { aiViewModel.loadAiInsights() },
                        contentAlignment = Alignment.Center
                    ) {
                        Icon(
                            imageVector = Icons.Rounded.Sync,
                            contentDescription = "Refresh",
                            tint = Color(0xFFD0BCFF),
                            modifier = Modifier.size(19.dp)
                        )
                    }
                },
                colors = TopAppBarDefaults.topAppBarColors(containerColor = ObsidianCanvas)
            )
        },
        containerColor = ObsidianCanvas
    ) { paddingValues ->
        ObsidianAtmosphere(
            modifier = Modifier
                .fillMaxSize()
                .padding(paddingValues)
        ) {
            if (isLoading) {
                Box(
                    modifier = Modifier.fillMaxSize(),
                    contentAlignment = Alignment.Center
                ) {
                    Column(
                        horizontalAlignment = Alignment.CenterHorizontally,
                        verticalArrangement = Arrangement.spacedBy(12.dp)
                    ) {
                        CircularProgressIndicator(color = TertiaryLight)
                        Text(
                            text = "Computing AI Financial Intelligence...",
                            style = MaterialTheme.typography.bodyMedium,
                            color = TextSecondary
                        )
                    }
                }
            } else {
                LazyColumn(
                    modifier = Modifier
                        .fillMaxSize()
                        .padding(horizontal = 16.dp),
                    verticalArrangement = Arrangement.spacedBy(14.dp),
                    contentPadding = PaddingValues(top = 4.dp, bottom = 40.dp)
                ) {
                    // 1. Circular Health Gauge Hero Card
                    item {
                        GlassmorphicCard(
                            modifier = Modifier.fillMaxWidth(),
                            shape = RoundedCornerShape(22.dp),
                            backgroundColor = Color(0xF2161B28),
                            spotColor = Color(0x668B5CF6),
                            elevation = 16.dp
                        ) {
                            Column(
                                modifier = Modifier
                                    .fillMaxWidth()
                                    .padding(20.dp),
                                horizontalAlignment = Alignment.CenterHorizontally,
                                verticalArrangement = Arrangement.spacedBy(14.dp)
                            ) {
                                // Circular Canvas Ring Gauge
                                Box(
                                    modifier = Modifier.size(170.dp),
                                    contentAlignment = Alignment.Center
                                ) {
                                    Canvas(modifier = Modifier.size(150.dp)) {
                                        val strokeWidth = 13.dp.toPx()
                                        // Background Track
                                        drawCircle(
                                            color = Color(0xFF262A35),
                                            radius = (size.minDimension - strokeWidth) / 2,
                                            style = Stroke(width = strokeWidth, cap = StrokeCap.Round)
                                        )
                                        // Animated Foreground Gradient Arc
                                        val sweep = (animatedScore.value / 100f) * 360f
                                        drawArc(
                                            brush = Brush.sweepGradient(
                                                listOf(
                                                    Color(0xFF10B981),
                                                    Color(0xFF6366F1),
                                                    Color(0xFF8B5CF6),
                                                    Color(0xFF10B981)
                                                )
                                            ),
                                            startAngle = -90f,
                                            sweepAngle = sweep,
                                            useCenter = false,
                                            style = Stroke(width = strokeWidth, cap = StrokeCap.Round)
                                        )
                                    }

                                    Column(
                                        horizontalAlignment = Alignment.CenterHorizontally,
                                        verticalArrangement = Arrangement.spacedBy(2.dp)
                                    ) {
                                        Row(verticalAlignment = Alignment.Bottom) {
                                            Text(
                                                text = "${animatedScore.value.toInt()}",
                                                fontSize = 40.sp,
                                                fontWeight = FontWeight.ExtraBold,
                                                color = TextPrimary
                                            )
                                            Text(
                                                text = "/100",
                                                fontSize = 16.sp,
                                                color = TextSecondary,
                                                modifier = Modifier.padding(bottom = 6.dp)
                                            )
                                        }
                                        Box(
                                            modifier = Modifier
                                                .background(
                                                    Color(0x3310B981),
                                                    RoundedCornerShape(percent = 50)
                                                )
                                                .border(1.dp, Color(0x6610B981), RoundedCornerShape(percent = 50))
                                                .padding(horizontal = 9.dp, vertical = 3.dp)
                                        ) {
                                            Row(
                                                verticalAlignment = Alignment.CenterVertically,
                                                horizontalArrangement = Arrangement.spacedBy(4.dp)
                                            ) {
                                                Icon(
                                                    imageVector = Icons.Rounded.CheckCircle,
                                                    contentDescription = "Grade",
                                                    tint = EmeraldMint,
                                                    modifier = Modifier.size(13.dp)
                                                )
                                                Text(
                                                    text = "${health?.grade ?: "Grade A"} (Strong)",
                                                    style = MaterialTheme.typography.labelSmall,
                                                    color = EmeraldMint,
                                                    fontWeight = FontWeight.Bold
                                                )
                                            }
                                        }
                                    }
                                }

                                // 50 / 30 / 20 Segmented Multi-Bar
                                Column(
                                    modifier = Modifier.fillMaxWidth(),
                                    verticalArrangement = Arrangement.spacedBy(8.dp)
                                ) {
                                    val needs = (health?.fiftyThirtyTwenty?.needsPercentage ?: 52.0).toFloat()
                                    val wants = (health?.fiftyThirtyTwenty?.wantsPercentage ?: 26.0).toFloat()
                                    val savings = (health?.fiftyThirtyTwenty?.savingsPercentage ?: 22.0).toFloat()

                                    // Colored Segment Bar
                                    Row(
                                        modifier = Modifier
                                            .fillMaxWidth()
                                            .height(10.dp)
                                            .clip(RoundedCornerShape(percent = 50))
                                    ) {
                                        Box(
                                            modifier = Modifier
                                                .weight(needs.coerceAtLeast(1f))
                                                .fillMaxHeight()
                                                .background(Color(0xFF8B5CF6))
                                        )
                                        Box(
                                            modifier = Modifier
                                                .weight(wants.coerceAtLeast(1f))
                                                .fillMaxHeight()
                                                .background(Color(0xFF6366F1))
                                        )
                                        Box(
                                            modifier = Modifier
                                                .weight(savings.coerceAtLeast(1f))
                                                .fillMaxHeight()
                                                .background(Color(0xFF10B981))
                                        )
                                    }

                                    // Legend Pills
                                    Row(
                                        modifier = Modifier.fillMaxWidth(),
                                        horizontalArrangement = Arrangement.SpaceBetween
                                    ) {
                                        LegendPill(color = Color(0xFF8B5CF6), label = "Needs ${needs.toInt()}%")
                                        LegendPill(color = Color(0xFF6366F1), label = "Wants ${wants.toInt()}%")
                                        LegendPill(color = Color(0xFF10B981), label = "Savings ${savings.toInt()}%")
                                    }
                                }
                            }
                        }
                    }

                    // 2. Spend Velocity & Safe Burn Rate Card
                    item {
                        GlassmorphicCard(
                            modifier = Modifier.fillMaxWidth(),
                            shape = RoundedCornerShape(20.dp),
                            backgroundColor = Color(0xF2161B28),
                            spotColor = Color(0x3310B981),
                            elevation = 10.dp
                        ) {
                            Column(
                                modifier = Modifier
                                    .fillMaxWidth()
                                    .padding(18.dp),
                                verticalArrangement = Arrangement.spacedBy(14.dp)
                            ) {
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
                                                .size(28.dp)
                                                .clip(RoundedCornerShape(8.dp))
                                                .background(Color(0x336366F1)),
                                            contentAlignment = Alignment.Center
                                        ) {
                                            Icon(
                                                imageVector = Icons.Rounded.ElectricBolt,
                                                contentDescription = "Velocity",
                                                tint = Color(0xFFD0BCFF),
                                                modifier = Modifier.size(16.dp)
                                            )
                                        }
                                        Text(
                                            text = "Spend Velocity & Safe Burn Rate",
                                            style = MaterialTheme.typography.titleSmall,
                                            fontWeight = FontWeight.Bold,
                                            color = TextPrimary
                                        )
                                    }
                                    Box(
                                        modifier = Modifier
                                            .background(Color(0x3310B981), RoundedCornerShape(percent = 50))
                                            .border(1.dp, Color(0x5510B981), RoundedCornerShape(percent = 50))
                                            .padding(horizontal = 8.dp, vertical = 3.dp)
                                    ) {
                                        Text(
                                            text = "● Safe Zone",
                                            style = MaterialTheme.typography.labelSmall,
                                            color = EmeraldMint,
                                            fontWeight = FontWeight.Bold
                                        )
                                    }
                                }

                                Row(
                                    modifier = Modifier.fillMaxWidth(),
                                    horizontalArrangement = Arrangement.spacedBy(10.dp)
                                ) {
                                    // Daily Average
                                    Box(
                                        modifier = Modifier
                                            .weight(1f)
                                            .clip(RoundedCornerShape(14.dp))
                                            .background(Color(0xE61A1F2D))
                                            .border(1.dp, BorderGlass, RoundedCornerShape(14.dp))
                                            .padding(12.dp)
                                    ) {
                                        Column(verticalArrangement = Arrangement.spacedBy(3.dp)) {
                                            Text(
                                                text = "Daily Average Spend",
                                                fontSize = 11.sp,
                                                color = TextSecondary
                                            )
                                            Text(
                                                text = "₹2,448 / day",
                                                fontSize = 15.sp,
                                                fontWeight = FontWeight.Bold,
                                                color = TextPrimary
                                            )
                                            Text(
                                                text = "↘ -4% vs yesterday",
                                                fontSize = 10.sp,
                                                fontWeight = FontWeight.SemiBold,
                                                color = EmeraldMint
                                            )
                                        }
                                    }

                                    // Safe Daily Limit
                                    Box(
                                        modifier = Modifier
                                            .weight(1f)
                                            .clip(RoundedCornerShape(14.dp))
                                            .background(Color(0xE61A1F2D))
                                            .border(1.dp, BorderGlass, RoundedCornerShape(14.dp))
                                            .padding(12.dp)
                                    ) {
                                        Column(verticalArrangement = Arrangement.spacedBy(3.dp)) {
                                            Text(
                                                text = "Safe Daily Limit",
                                                fontSize = 11.sp,
                                                color = TextSecondary
                                            )
                                            Text(
                                                text = "₹${(forecast?.safeDailyLimit ?: 420.0).toInt()} / day",
                                                fontSize = 15.sp,
                                                fontWeight = FontWeight.Bold,
                                                color = EmeraldMint
                                            )
                                            Text(
                                                text = "Safe for next 16 days",
                                                fontSize = 10.sp,
                                                color = TextMuted
                                            )
                                        }
                                    }
                                }

                                // Buffer Bar
                                Column(verticalArrangement = Arrangement.spacedBy(6.dp)) {
                                    Row(
                                        modifier = Modifier.fillMaxWidth(),
                                        horizontalArrangement = Arrangement.SpaceBetween
                                    ) {
                                        Text("Safe cash buffer until month-end", fontSize = 11.5.sp, color = TextSecondary)
                                        Text("86% remaining", fontSize = 11.5.sp, fontWeight = FontWeight.Bold, color = EmeraldMint)
                                    }
                                    Box(
                                        modifier = Modifier
                                            .fillMaxWidth()
                                            .height(6.dp)
                                            .clip(RoundedCornerShape(percent = 50))
                                            .background(Color(0xFF262A35))
                                    ) {
                                        Box(
                                            modifier = Modifier
                                                .fillMaxWidth(0.86f)
                                                .fillMaxHeight()
                                                .clip(RoundedCornerShape(percent = 50))
                                                .background(
                                                    Brush.horizontalGradient(
                                                        listOf(Color(0xFF10B981), Color(0xFF06B6D4))
                                                    )
                                                )
                                        )
                                    }
                                }
                            }
                        }
                    }

                    // 3. 2x2 AI Intelligence Matrix
                    item {
                        Column(verticalArrangement = Arrangement.spacedBy(10.dp)) {
                            Row(
                                modifier = Modifier.fillMaxWidth(),
                                horizontalArrangement = Arrangement.spacedBy(10.dp)
                            ) {
                                // Guru Advice Tile
                                AiTile(
                                    modifier = Modifier.weight(1f),
                                    icon = Icons.Rounded.Lightbulb,
                                    iconGradient = listOf(Color(0xFF8B5CF6), Color(0xFF6D28D9)),
                                    title = "Guru Advice",
                                    description = "Save ₹1,800 on dining & delivery this month.",
                                    actionText = "Take Action →",
                                    actionColor = Color(0xFFD0BCFF)
                                )

                                // Subscriptions Tile
                                AiTile(
                                    modifier = Modifier.weight(1f),
                                    icon = Icons.Rounded.Cached,
                                    iconGradient = listOf(Color(0xFF06B6D4), Color(0xFF0284C7)),
                                    title = "Subscriptions",
                                    description = "4 Active (Netflix, Spotify...) Total ₹3,499/mo",
                                    actionText = "Details ›",
                                    actionColor = Color(0xFFA5F3FC)
                                )
                            }

                            Row(
                                modifier = Modifier.fillMaxWidth(),
                                horizontalArrangement = Arrangement.spacedBy(10.dp)
                            ) {
                                // Tax Advisor Tile
                                AiTile(
                                    modifier = Modifier.weight(1f),
                                    icon = Icons.Rounded.AccountBalance,
                                    iconGradient = listOf(Color(0xFF10B981), Color(0xFF047857)),
                                    title = "Tax Advisor",
                                    description = "Save ₹14,200 under New Tax Regime!",
                                    actionText = "Compare →",
                                    actionColor = EmeraldMint
                                )

                                // Spend Mood CBT Tile
                                AiTile(
                                    modifier = Modifier.weight(1f),
                                    icon = Icons.Rounded.SentimentSatisfied,
                                    iconGradient = listOf(Color(0xFFF43F5E), Color(0xFFBE123C)),
                                    title = "Spend Mood (CBT)",
                                    description = "74% Mindful & Planned, 14% Impulsive",
                                    actionText = "Tune Mindset ⚙",
                                    actionColor = Color(0xFFFDA4AF)
                                )
                            }
                        }
                    }

                    // 4. Monthly Money Digest Interactive Card
                    item {
                        GlassmorphicCard(
                            modifier = Modifier.fillMaxWidth(),
                            shape = RoundedCornerShape(20.dp),
                            backgroundColor = Color(0xF2181D2C),
                            spotColor = Color(0x666366F1),
                            elevation = 12.dp
                        ) {
                            Row(
                                modifier = Modifier
                                    .fillMaxWidth()
                                    .background(
                                        Brush.linearGradient(
                                            listOf(Color(0x336366F1), Color(0x228B5CF6))
                                        )
                                    )
                                    .padding(16.dp),
                                verticalAlignment = Alignment.CenterVertically,
                                horizontalArrangement = Arrangement.SpaceBetween
                            ) {
                                Row(
                                    verticalAlignment = Alignment.CenterVertically,
                                    horizontalArrangement = Arrangement.spacedBy(12.dp),
                                    modifier = Modifier.weight(1f)
                                ) {
                                    // Glowing Play Button
                                    Box(
                                        modifier = Modifier
                                            .size(46.dp)
                                            .shadow(10.dp, shape = CircleShape, spotColor = Color(0xFF10B981))
                                            .clip(CircleShape)
                                            .background(
                                                Brush.linearGradient(
                                                    listOf(Color(0xFF10B981), Color(0xFF059669))
                                                )
                                            ),
                                        contentAlignment = Alignment.Center
                                    ) {
                                        Icon(
                                            imageVector = Icons.Rounded.PlayArrow,
                                            contentDescription = "Play",
                                            tint = Color.White,
                                            modifier = Modifier.size(24.dp)
                                        )
                                    }

                                    Column(verticalArrangement = Arrangement.spacedBy(2.dp)) {
                                        Box(
                                            modifier = Modifier
                                                .background(Color(0x338B5CF6), RoundedCornerShape(4.dp))
                                                .padding(horizontal = 6.dp, vertical = 2.dp)
                                        ) {
                                            Text(
                                                text = "New Digest Available",
                                                fontSize = 9.sp,
                                                fontWeight = FontWeight.Bold,
                                                color = Color(0xFFD0BCFF)
                                            )
                                        }
                                        Text(
                                            text = "Monthly Money Digest",
                                            style = MaterialTheme.typography.titleSmall,
                                            fontWeight = FontWeight.Bold,
                                            color = TextPrimary
                                        )
                                        Text(
                                            text = "Interactive financial stories & wrap",
                                            style = MaterialTheme.typography.bodySmall,
                                            color = TextSecondary,
                                            fontSize = 11.5.sp
                                        )
                                    }
                                }

                                Box(
                                    modifier = Modifier
                                        .size(38.dp)
                                        .clip(CircleShape)
                                        .background(Color(0x338B5CF6)),
                                    contentAlignment = Alignment.Center
                                ) {
                                    Icon(
                                        imageVector = Icons.Rounded.AutoStories,
                                        contentDescription = "Story",
                                        tint = Color(0xFFD0BCFF),
                                        modifier = Modifier.size(20.dp)
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
private fun LegendPill(color: Color, label: String) {
    Row(
        verticalAlignment = Alignment.CenterVertically,
        horizontalArrangement = Arrangement.spacedBy(4.dp)
    ) {
        Box(
            modifier = Modifier
                .size(7.dp)
                .background(color, CircleShape)
        )
        Text(
            text = label,
            fontSize = 11.5.sp,
            color = TextSecondary,
            fontWeight = FontWeight.Medium
        )
    }
}

@Composable
private fun AiTile(
    modifier: Modifier = Modifier,
    icon: androidx.compose.ui.graphics.vector.ImageVector,
    iconGradient: List<Color>,
    title: String,
    description: String,
    actionText: String,
    actionColor: Color
) {
    GlassmorphicCard(
        modifier = modifier,
        shape = RoundedCornerShape(18.dp),
        backgroundColor = Color(0xF2161A26),
        spotColor = iconGradient.first().copy(alpha = 0.3f),
        elevation = 8.dp
    ) {
        Column(
            modifier = Modifier
                .fillMaxWidth()
                .padding(14.dp),
            verticalArrangement = Arrangement.spacedBy(8.dp)
        ) {
            Box(
                modifier = Modifier
                    .size(34.dp)
                    .shadow(6.dp, shape = RoundedCornerShape(10.dp), spotColor = iconGradient.first())
                    .clip(RoundedCornerShape(10.dp))
                    .background(Brush.linearGradient(iconGradient))
                    .border(BorderStroke(1.dp, Color(0x60FFFFFF)), RoundedCornerShape(10.dp)),
                contentAlignment = Alignment.Center
            ) {
                Icon(
                    imageVector = icon,
                    contentDescription = title,
                    tint = Color.White,
                    modifier = Modifier.size(18.dp)
                )
            }

            Text(
                text = title,
                style = MaterialTheme.typography.titleSmall,
                fontWeight = FontWeight.Bold,
                color = TextPrimary,
                fontSize = 13.5.sp
            )

            Text(
                text = description,
                style = MaterialTheme.typography.bodySmall,
                color = TextSecondary,
                fontSize = 11.5.sp,
                lineHeight = 16.sp,
                maxLines = 2
            )

            Text(
                text = actionText,
                fontSize = 11.5.sp,
                fontWeight = FontWeight.Bold,
                color = actionColor
            )
        }
    }
}
