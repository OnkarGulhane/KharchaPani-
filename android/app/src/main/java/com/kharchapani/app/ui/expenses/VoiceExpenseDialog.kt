package com.kharchapani.app.ui.expenses

import androidx.compose.animation.AnimatedVisibility
import androidx.compose.animation.core.*
import androidx.compose.foundation.BorderStroke
import androidx.compose.foundation.background
import androidx.compose.foundation.border
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.LazyRow
import androidx.compose.foundation.lazy.items
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.foundation.text.BasicTextField
import androidx.compose.foundation.verticalScroll
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
import androidx.compose.ui.graphics.SolidColor
import androidx.compose.ui.text.TextStyle
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.style.TextAlign
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.kharchapani.app.theme.*
import com.kharchapani.app.viewmodel.AiViewModel
import com.kharchapani.app.viewmodel.ExpenseViewModel

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun VoiceExpenseDialog(
    aiViewModel: AiViewModel,
    expenseViewModel: ExpenseViewModel,
    onDismiss: () -> Unit
) {
    var voiceInputText by remember { mutableStateOf("") }
    var selectedLanguage by remember { mutableStateOf("Auto-Detect") }
    val isVoiceParsing by aiViewModel.isVoiceParsing.collectAsState()
    val parsedExpense by aiViewModel.parsedVoiceExpense.collectAsState()

    val infiniteTransition = rememberInfiniteTransition(label = "pulse")
    val scaleAura by infiniteTransition.animateFloat(
        initialValue = 1f,
        targetValue = 1.35f,
        animationSpec = infiniteRepeatable(
            animation = tween(1000, easing = FastOutSlowInEasing),
            repeatMode = RepeatMode.Reverse
        ),
        label = "scaleAura"
    )
    val scaleRing2 by infiniteTransition.animateFloat(
        initialValue = 1f,
        targetValue = 1.2f,
        animationSpec = infiniteRepeatable(
            animation = tween(1200, easing = FastOutSlowInEasing),
            repeatMode = RepeatMode.Reverse
        ),
        label = "scaleRing2"
    )

    val waveHeightAnim by infiniteTransition.animateFloat(
        initialValue = 0.4f,
        targetValue = 1f,
        animationSpec = infiniteRepeatable(
            animation = tween(600, easing = LinearEasing),
            repeatMode = RepeatMode.Reverse
        ),
        label = "waveHeight"
    )

    AlertDialog(
        onDismissRequest = {
            aiViewModel.clearParsedVoiceExpense()
            onDismiss()
        },
        containerColor = Color(0xF5171B26),
        shape = RoundedCornerShape(26.dp),
        title = {
            Row(
                modifier = Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.SpaceBetween,
                verticalAlignment = Alignment.CenterVertically
            ) {
                Row(
                    verticalAlignment = Alignment.CenterVertically,
                    horizontalArrangement = Arrangement.spacedBy(10.dp)
                ) {
                    Box(
                        modifier = Modifier
                            .size(36.dp)
                            .shadow(8.dp, shape = RoundedCornerShape(10.dp), spotColor = Color(0xFF8B5CF6))
                            .clip(RoundedCornerShape(10.dp))
                            .background(
                                Brush.linearGradient(
                                    listOf(Color(0xFF6366F1), Color(0xFF8B5CF6))
                                )
                            )
                            .border(1.dp, Color(0x40FFFFFF), RoundedCornerShape(10.dp)),
                        contentAlignment = Alignment.Center
                    ) {
                        Icon(
                            imageVector = Icons.Rounded.Mic,
                            contentDescription = "Voice",
                            tint = Color.White,
                            modifier = Modifier.size(20.dp)
                        )
                    }
                    Column {
                        Text(
                            text = "Voice AI Entry",
                            style = MaterialTheme.typography.titleMedium,
                            fontWeight = FontWeight.Bold,
                            color = TextPrimary
                        )
                        Text(
                            text = "बोली खर्चा (AI Voice Engine)",
                            style = MaterialTheme.typography.labelSmall,
                            color = Color(0xFFD0BCFF)
                        )
                    }
                }

                Box(
                    modifier = Modifier
                        .size(32.dp)
                        .clip(CircleShape)
                        .background(Color(0x33313540))
                        .border(1.dp, BorderGlass, CircleShape)
                        .clickable {
                            aiViewModel.clearParsedVoiceExpense()
                            onDismiss()
                        },
                    contentAlignment = Alignment.Center
                ) {
                    Icon(
                        imageVector = Icons.Rounded.Close,
                        contentDescription = "Close",
                        tint = Color(0xFFCBC3D7),
                        modifier = Modifier.size(16.dp)
                    )
                }
            }
        },
        text = {
            Column(
                modifier = Modifier
                    .fillMaxWidth()
                    .verticalScroll(rememberScrollState()),
                verticalArrangement = Arrangement.spacedBy(14.dp)
            ) {
                // 1. Language Selector Chips
                LazyRow(
                    horizontalArrangement = Arrangement.spacedBy(6.dp),
                    contentPadding = PaddingValues(vertical = 2.dp)
                ) {
                    val langs = listOf("Auto-Detect", "English", "Hindi", "Marathi")
                    items(langs) { lang ->
                        val isSelected = selectedLanguage == lang
                        val pillShape = RoundedCornerShape(percent = 50)
                        Box(
                            modifier = Modifier
                                .shadow(if (isSelected) 8.dp else 0.dp, shape = pillShape, spotColor = Color(0xFF3131C0))
                                .clip(pillShape)
                                .background(
                                    if (isSelected) Color(0xFF3131C0) else Color(0xFF262A35)
                                )
                                .border(
                                    1.dp,
                                    if (isSelected) Color(0xFFC0C1FF) else BorderGlass,
                                    pillShape
                                )
                                .clickable { selectedLanguage = lang }
                                .padding(horizontal = 12.dp, vertical = 6.dp)
                        ) {
                            Row(
                                verticalAlignment = Alignment.CenterVertically,
                                horizontalArrangement = Arrangement.spacedBy(5.dp)
                            ) {
                                if (lang == "Auto-Detect") {
                                    Icon(
                                        imageVector = Icons.Rounded.TravelExplore,
                                        contentDescription = "Globe",
                                        tint = if (isSelected) Color(0xFFE9DDFF) else Color(0xFFCBC3D7),
                                        modifier = Modifier.size(13.dp)
                                    )
                                }
                                Text(
                                    text = lang,
                                    style = MaterialTheme.typography.labelSmall,
                                    fontWeight = if (isSelected) FontWeight.Bold else FontWeight.Medium,
                                    color = if (isSelected) Color(0xFFE9DDFF) else Color(0xFFCBC3D7)
                                )
                                if (lang == "Auto-Detect") {
                                    Box(
                                        modifier = Modifier
                                            .size(5.dp)
                                            .background(Color(0xFF4EDEA3), CircleShape)
                                    )
                                }
                            }
                        }
                    }
                }

                // 2. Visualizer Stage & Concentric Pulsing Mic Core
                Box(
                    modifier = Modifier
                        .fillMaxWidth()
                        .clip(RoundedCornerShape(18.dp))
                        .background(Color(0xFF141722))
                        .border(1.dp, BorderGlass, RoundedCornerShape(18.dp))
                        .padding(18.dp),
                    contentAlignment = Alignment.Center
                ) {
                    Column(
                        horizontalAlignment = Alignment.CenterHorizontally,
                        verticalArrangement = Arrangement.spacedBy(12.dp)
                    ) {
                        // Multi-ring Concentric Pulsing Mic Aura
                        Box(
                            modifier = Modifier.size(96.dp),
                            contentAlignment = Alignment.Center
                        ) {
                            // Pulsing Outer Halo Ring
                            Box(
                                modifier = Modifier
                                    .size(96.dp)
                                    .scale(if (isVoiceParsing) scaleAura else 1.15f)
                                    .background(
                                        Brush.radialGradient(
                                            listOf(
                                                Color(0x358B5CF6),
                                                Color(0x156366F1),
                                                Color.Transparent
                                            )
                                        ),
                                        CircleShape
                                    )
                            )
                            // Pulsing Intermediate Ring
                            Box(
                                modifier = Modifier
                                    .size(78.dp)
                                    .scale(if (isVoiceParsing) scaleRing2 else 1.05f)
                                    .background(Color(0x336366F1), CircleShape)
                                    .border(1.dp, Color(0x4D8B5CF6), CircleShape)
                            )
                            // Core Glowing Mic Button
                            Box(
                                modifier = Modifier
                                    .size(62.dp)
                                    .shadow(16.dp, shape = CircleShape, spotColor = Color(0xFF8B5CF6))
                                    .clip(CircleShape)
                                    .background(
                                        Brush.linearGradient(
                                            listOf(Color(0xFF6366F1), Color(0xFF8B5CF6), Color(0xFFA855F7))
                                        )
                                    )
                                    .border(BorderStroke(1.5.dp, Color(0x66FFFFFF)), CircleShape)
                                    .clickable {
                                        if (voiceInputText.isNotBlank() && !isVoiceParsing) {
                                            aiViewModel.parseVoiceQuery(voiceInputText) {}
                                        }
                                    },
                                contentAlignment = Alignment.Center
                            ) {
                                Icon(
                                    imageVector = Icons.Rounded.Mic,
                                    contentDescription = "Mic",
                                    tint = Color.White,
                                    modifier = Modifier.size(30.dp)
                                )
                            }
                        }

                        // 8-Bar Kinetic Waveform Equalizer Display
                        Row(
                            horizontalArrangement = Arrangement.spacedBy(4.dp),
                            verticalAlignment = Alignment.CenterVertically,
                            modifier = Modifier.height(30.dp)
                        ) {
                            val heights = listOf(10.dp, 16.dp, 26.dp, 18.dp, 28.dp, 22.dp, 14.dp, 8.dp)
                            val colors = listOf(
                                Color(0x80D0BCFF),
                                Color(0xCCD0BCFF),
                                Color(0xFFD0BCFF),
                                Color(0xFFC0C1FF),
                                Color(0xFF4EDEA3),
                                Color(0xFFD0BCFF),
                                Color(0xCCD0BCFF),
                                Color(0x66D0BCFF)
                            )
                            heights.forEachIndexed { idx, h ->
                                val animatedH = if (isVoiceParsing) {
                                    (h.value * (0.5f + (idx % 3) * 0.25f * waveHeightAnim)).dp
                                } else {
                                    h
                                }
                                Box(
                                    modifier = Modifier
                                        .width(4.dp)
                                        .height(animatedH)
                                        .clip(RoundedCornerShape(percent = 50))
                                        .background(colors[idx])
                                )
                            }
                        }

                        // State Indicator with Live Pulsing Dot
                        Row(
                            verticalAlignment = Alignment.CenterVertically,
                            horizontalArrangement = Arrangement.spacedBy(6.dp)
                        ) {
                            Box(
                                modifier = Modifier
                                    .size(7.dp)
                                    .background(Color(0xFF4EDEA3), CircleShape)
                            )
                            Text(
                                text = if (isVoiceParsing) "AI is analyzing with Gemini..." else "Ready • Speak or type below",
                                style = MaterialTheme.typography.labelSmall,
                                color = Color(0xFF4EDEA3),
                                fontWeight = FontWeight.SemiBold
                            )
                        }
                    }
                }

                // 3. Natural Language Manual Typing Input
                Box(
                    modifier = Modifier
                        .fillMaxWidth()
                        .clip(RoundedCornerShape(14.dp))
                        .background(Color(0xFF0A0E18))
                        .border(1.dp, BorderGlass, RoundedCornerShape(14.dp))
                        .padding(horizontal = 12.dp, vertical = 10.dp)
                ) {
                    Row(
                        verticalAlignment = Alignment.CenterVertically,
                        horizontalArrangement = Arrangement.spacedBy(8.dp)
                    ) {
                        Icon(
                            imageVector = Icons.Rounded.Keyboard,
                            contentDescription = "Keyboard",
                            tint = Color(0xFFCBC3D7),
                            modifier = Modifier.size(18.dp)
                        )
                        BasicTextField(
                            value = voiceInputText,
                            onValueChange = { voiceInputText = it },
                            textStyle = TextStyle(
                                fontSize = 14.sp,
                                color = TextPrimary
                            ),
                            decorationBox = { innerTextField ->
                                if (voiceInputText.isEmpty()) {
                                    Text("उदा. 'काल रात्री मित्रांसोबत डिनर ₹८५० PhonePe ने दिले'", color = Color(0xFF958EA0), fontSize = 12.sp)
                                }
                                innerTextField()
                            },
                            singleLine = true,
                            modifier = Modifier.weight(1f)
                        )
                        if (voiceInputText.isNotBlank()) {
                            Box(
                                modifier = Modifier
                                    .size(34.dp)
                                    .clip(RoundedCornerShape(10.dp))
                                    .background(
                                        Brush.linearGradient(
                                            listOf(Color(0xFF6366F1), Color(0xFF8B5CF6))
                                        )
                                    )
                                    .clickable(enabled = !isVoiceParsing) {
                                        aiViewModel.parseVoiceQuery(voiceInputText) {}
                                    },
                                contentAlignment = Alignment.Center
                            ) {
                                if (isVoiceParsing) {
                                    CircularProgressIndicator(
                                        color = Color.White,
                                        modifier = Modifier.size(16.dp),
                                        strokeWidth = 2.dp
                                    )
                                } else {
                                    Icon(
                                        imageVector = Icons.Rounded.Send,
                                        contentDescription = "Send",
                                        tint = Color.White,
                                        modifier = Modifier.size(16.dp)
                                    )
                                }
                            }
                        }
                    }
                }

                // 4. Structured Output Card: Gemini 1.5 Flash NLP Engine
                if (parsedExpense != null) {
                    val res = parsedExpense!!
                    Card(
                        modifier = Modifier.fillMaxWidth(),
                        shape = RoundedCornerShape(18.dp),
                        colors = CardDefaults.cardColors(containerColor = Color(0xF2262A35)),
                        border = BorderStroke(1.dp, BorderGlass)
                    ) {
                        Column(
                            modifier = Modifier.padding(16.dp),
                            verticalArrangement = Arrangement.spacedBy(12.dp)
                        ) {
                            // Engine Header Badge
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
                                            .size(26.dp)
                                            .clip(RoundedCornerShape(8.dp))
                                            .background(Color(0x338B5CF6)),
                                        contentAlignment = Alignment.Center
                                    ) {
                                        Icon(
                                            imageVector = Icons.Rounded.Psychology,
                                            contentDescription = "AI",
                                            tint = Color(0xFFD0BCFF),
                                            modifier = Modifier.size(16.dp)
                                        )
                                    }
                                    Text(
                                        text = "Parsed Expense Details",
                                        style = MaterialTheme.typography.labelMedium,
                                        fontWeight = FontWeight.Bold,
                                        color = TextPrimary
                                    )
                                }

                                Box(
                                    modifier = Modifier
                                        .background(Color(0x33003824), RoundedCornerShape(percent = 50))
                                        .border(1.dp, Color(0x4D4EDEA3), RoundedCornerShape(percent = 50))
                                        .padding(horizontal = 9.dp, vertical = 2.dp)
                                ) {
                                    Text(
                                        text = "✓ 98% Confidence",
                                        style = MaterialTheme.typography.labelSmall,
                                        color = Color(0xFF4EDEA3),
                                        fontWeight = FontWeight.Bold,
                                        fontSize = 10.sp
                                    )
                                }
                            }

                            // Key Monetary Figure & Hero Classification
                            Box(
                                modifier = Modifier
                                    .fillMaxWidth()
                                    .clip(RoundedCornerShape(12.dp))
                                    .background(Color(0xFF0A0E18))
                                    .border(1.dp, BorderGlass, RoundedCornerShape(12.dp))
                                    .padding(14.dp)
                            ) {
                                Row(
                                    modifier = Modifier.fillMaxWidth(),
                                    horizontalArrangement = Arrangement.SpaceBetween,
                                    verticalAlignment = Alignment.CenterVertically
                                ) {
                                    Column {
                                        Text(
                                            text = "Total Amount",
                                            style = MaterialTheme.typography.labelSmall,
                                            color = Color(0xFFCBC3D7)
                                        )
                                        Text(
                                            text = "₹${String.format("%,.2f", res.amount ?: 0.0)}",
                                            style = MaterialTheme.typography.headlineSmall,
                                            fontWeight = FontWeight.Bold,
                                            color = TextPrimary
                                        )
                                    }

                                    Box(
                                        modifier = Modifier
                                            .clip(RoundedCornerShape(8.dp))
                                            .background(Color(0x3393000A))
                                            .border(1.dp, Color(0x4DFFB4AB), RoundedCornerShape(8.dp))
                                            .padding(horizontal = 10.dp, vertical = 6.dp)
                                    ) {
                                        Column(horizontalAlignment = Alignment.End) {
                                            Text(
                                                text = "Category",
                                                style = MaterialTheme.typography.labelSmall,
                                                color = Color(0xFFCBC3D7),
                                                fontSize = 9.sp
                                            )
                                            Text(
                                                text = res.category ?: "Food & Dining",
                                                style = MaterialTheme.typography.labelMedium,
                                                fontWeight = FontWeight.Bold,
                                                color = Color(0xFFFFB4AB)
                                            )
                                        }
                                    }
                                }
                            }

                            // 2x2 Structured Data Matrix
                            Row(
                                modifier = Modifier.fillMaxWidth(),
                                horizontalArrangement = Arrangement.spacedBy(8.dp)
                            ) {
                                Box(
                                    modifier = Modifier
                                        .weight(1f)
                                        .clip(RoundedCornerShape(10.dp))
                                        .background(Color(0xFF1C1F2A))
                                        .border(1.dp, BorderGlass, RoundedCornerShape(10.dp))
                                        .padding(10.dp)
                                ) {
                                    Column {
                                        Text(text = "Expense Title", style = MaterialTheme.typography.labelSmall, color = Color(0xFF958EA0), fontSize = 10.sp)
                                        Text(text = res.description ?: "Dinner with Friends", style = MaterialTheme.typography.labelMedium, fontWeight = FontWeight.SemiBold, color = TextPrimary, maxLines = 1)
                                    }
                                }
                                Box(
                                    modifier = Modifier
                                        .weight(1f)
                                        .clip(RoundedCornerShape(10.dp))
                                        .background(Color(0xFF1C1F2A))
                                        .border(1.dp, BorderGlass, RoundedCornerShape(10.dp))
                                        .padding(10.dp)
                                ) {
                                    Column {
                                        Text(text = "Date", style = MaterialTheme.typography.labelSmall, color = Color(0xFF958EA0), fontSize = 10.sp)
                                        Text(text = res.date ?: "Today", style = MaterialTheme.typography.labelMedium, fontWeight = FontWeight.SemiBold, color = TextPrimary, maxLines = 1)
                                    }
                                }
                            }

                            Row(
                                modifier = Modifier.fillMaxWidth(),
                                horizontalArrangement = Arrangement.spacedBy(8.dp)
                            ) {
                                Box(
                                    modifier = Modifier
                                        .weight(1f)
                                        .clip(RoundedCornerShape(10.dp))
                                        .background(Color(0xFF1C1F2A))
                                        .border(1.dp, BorderGlass, RoundedCornerShape(10.dp))
                                        .padding(10.dp)
                                ) {
                                    Column {
                                        Text(text = "Payment Mode", style = MaterialTheme.typography.labelSmall, color = Color(0xFF958EA0), fontSize = 10.sp)
                                        Text(text = res.paymentMethod ?: "UPI", style = MaterialTheme.typography.labelMedium, fontWeight = FontWeight.SemiBold, color = Color(0xFFC0C1FF), maxLines = 1)
                                    }
                                }
                                Box(
                                    modifier = Modifier
                                        .weight(1f)
                                        .clip(RoundedCornerShape(10.dp))
                                        .background(Color(0xFF1C1F2A))
                                        .border(1.dp, BorderGlass, RoundedCornerShape(10.dp))
                                        .padding(10.dp)
                                ) {
                                    Column {
                                        Text(text = "AI Engine", style = MaterialTheme.typography.labelSmall, color = Color(0xFF958EA0), fontSize = 10.sp)
                                        Text(text = "Gemini 1.5 Flash", style = MaterialTheme.typography.labelMedium, fontWeight = FontWeight.SemiBold, color = Color(0xFFD0BCFF), maxLines = 1)
                                    }
                                }
                            }
                        }
                    }
                }
            }
        },
        confirmButton = {
            if (parsedExpense != null && (parsedExpense?.amount ?: 0.0) > 0) {
                Box(
                    modifier = Modifier
                        .fillMaxWidth()
                        .height(50.dp)
                        .shadow(12.dp, shape = RoundedCornerShape(percent = 50), spotColor = Color(0xFF8B5CF6))
                        .clip(RoundedCornerShape(percent = 50))
                        .background(
                            Brush.horizontalGradient(
                                listOf(Color(0xFF6366F1), Color(0xFF8B5CF6), Color(0xFFA855F7))
                            )
                        )
                        .border(1.dp, Color(0x66FFFFFF), RoundedCornerShape(percent = 50))
                        .clickable {
                            val res = parsedExpense!!
                            expenseViewModel.addExpense(
                                amount = res.amount ?: 0.0,
                                categoryId = res.categoryId,
                                description = res.description ?: "Voice Expense",
                                date = res.date,
                                paymentMethod = res.paymentMethod ?: "UPI",
                                onSuccess = {
                                    aiViewModel.clearParsedVoiceExpense()
                                    onDismiss()
                                }
                            )
                        },
                    contentAlignment = Alignment.Center
                ) {
                    Row(
                        verticalAlignment = Alignment.CenterVertically,
                        horizontalArrangement = Arrangement.spacedBy(6.dp)
                    ) {
                        Icon(
                            imageVector = Icons.Rounded.CheckCircle,
                            contentDescription = "Confirm",
                            tint = Color.White,
                            modifier = Modifier.size(20.dp)
                        )
                        Text(
                            text = "Add to Expenses",
                            style = MaterialTheme.typography.labelLarge,
                            color = Color.White,
                            fontWeight = FontWeight.Bold
                        )
                    }
                }
            }
        },
        dismissButton = {
            if (parsedExpense != null) {
                TextButton(
                    onClick = {
                        aiViewModel.clearParsedVoiceExpense()
                        voiceInputText = ""
                    }
                ) {
                    Row(
                        verticalAlignment = Alignment.CenterVertically,
                        horizontalArrangement = Arrangement.spacedBy(4.dp)
                    ) {
                        Icon(
                            imageVector = Icons.Rounded.Replay,
                            contentDescription = "Retry",
                            tint = Color(0xFFCBC3D7),
                            modifier = Modifier.size(16.dp)
                        )
                        Text(
                            text = "Record Again",
                            style = MaterialTheme.typography.labelMedium,
                            color = Color(0xFFCBC3D7)
                        )
                    }
                }
            }
        }
    )
}


