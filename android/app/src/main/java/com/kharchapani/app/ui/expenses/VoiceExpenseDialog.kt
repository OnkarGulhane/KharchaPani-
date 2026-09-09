package com.kharchapani.app.ui.expenses

import androidx.compose.animation.core.*
import androidx.compose.foundation.background
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.Check
import androidx.compose.material.icons.filled.Mic
import androidx.compose.material.icons.filled.Send
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.scale
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.kharchapani.app.data.model.AIQuickParseResponse
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
    val isVoiceParsing by aiViewModel.isVoiceParsing.collectAsState()
    val parsedExpense by aiViewModel.parsedVoiceExpense.collectAsState()

    val infiniteTransition = rememberInfiniteTransition(label = "pulse")
    val scale by infiniteTransition.animateFloat(
        initialValue = 1f,
        targetValue = 1.25f,
        animationSpec = infiniteRepeatable(
            animation = tween(800, easing = FastOutSlowInEasing),
            repeatMode = RepeatMode.Reverse
        ),
        label = "scale"
    )

    AlertDialog(
        onDismissRequest = {
            aiViewModel.clearParsedVoiceExpense()
            onDismiss()
        },
        containerColor = CardBackground,
        shape = RoundedCornerShape(24.dp),
        title = {
            Row(verticalAlignment = Alignment.CenterVertically) {
                Text("🎙️ बोली खर्चा (Voice AI)", fontSize = 18.sp, fontWeight = FontWeight.Bold, color = Emerald400)
            }
        },
        text = {
            Column(
                modifier = Modifier.fillMaxWidth(),
                horizontalAlignment = Alignment.CenterHorizontally
            ) {
                Text(
                    text = "मराठी, हिंदी किंवा इंग्रजीत बोला / लिहा:",
                    fontSize = 12.sp,
                    color = TextSecondary,
                    modifier = Modifier.padding(bottom = 12.dp)
                )

                // Mic Pulse Animation
                Box(
                    modifier = Modifier
                        .size(64.dp)
                        .scale(if (isVoiceParsing) scale else 1f)
                        .background(if (isVoiceParsing) Color(0x66A855F7) else EmeraldGlow, CircleShape),
                    contentAlignment = Alignment.Center
                ) {
                    Icon(
                        imageVector = Icons.Default.Mic,
                        contentDescription = "Microphone",
                        tint = if (isVoiceParsing) Purple500 else Emerald400,
                        modifier = Modifier.size(32.dp)
                    )
                }

                Spacer(modifier = Modifier.height(16.dp))

                // Text Input / Voice Preview
                OutlinedTextField(
                    value = voiceInputText,
                    onValueChange = { voiceInputText = it },
                    placeholder = { Text("उदा. 'मित्रांसोबत हॉटेलमध्ये ५०० रुपये खर्च केले'", color = TextMuted, fontSize = 12.sp) },
                    singleLine = false,
                    maxLines = 3,
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

                // Parse Button
                Button(
                    onClick = {
                        aiViewModel.parseVoiceQuery(voiceInputText) {}
                    },
                    enabled = voiceInputText.isNotBlank() && !isVoiceParsing,
                    colors = ButtonDefaults.buttonColors(containerColor = Purple500),
                    shape = RoundedCornerShape(12.dp),
                    modifier = Modifier.fillMaxWidth()
                ) {
                    if (isVoiceParsing) {
                        CircularProgressIndicator(color = ObsidianBlack, modifier = Modifier.size(20.dp))
                    } else {
                        Row(verticalAlignment = Alignment.CenterVertically) {
                            Icon(Icons.Default.Send, contentDescription = "Parse", modifier = Modifier.size(16.dp))
                            Spacer(modifier = Modifier.width(6.dp))
                            Text("Analyze Voice Query ✨", fontWeight = FontWeight.SemiBold, color = TextPrimary)
                        }
                    }
                }

                // Parsed Expense Result Preview Card
                if (parsedExpense != null) {
                    val res = parsedExpense!!
                    Spacer(modifier = Modifier.height(16.dp))
                    Card(
                        modifier = Modifier.fillMaxWidth(),
                        shape = RoundedCornerShape(14.dp),
                        colors = CardDefaults.cardColors(containerColor = ObsidianDark),
                        border = CardDefaults.outlinedCardBorder().copy(brush = androidx.compose.ui.graphics.SolidColor(Emerald500))
                    ) {
                        Column(modifier = Modifier.padding(14.dp)) {
                            Text("✨ Parsed Transaction", fontSize = 12.sp, fontWeight = FontWeight.Bold, color = Emerald400)
                            Spacer(modifier = Modifier.height(6.dp))
                            Text("Amount: ₹${res.amount ?: 0.0}", fontSize = 16.sp, fontWeight = FontWeight.Bold, color = TextPrimary)
                            Text("Category: ${res.category ?: "General"}", fontSize = 13.sp, color = TextSecondary)
                            Text("Description: ${res.description ?: ""}", fontSize = 13.sp, color = TextSecondary)
                            Text("Date: ${res.date ?: "Today"}", fontSize = 12.sp, color = TextMuted)
                        }
                    }
                }
            }
        },
        confirmButton = {
            if (parsedExpense != null && (parsedExpense?.amount ?: 0.0) > 0) {
                Button(
                    onClick = {
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
                    colors = ButtonDefaults.buttonColors(containerColor = Emerald500)
                ) {
                    Row(verticalAlignment = Alignment.CenterVertically) {
                        Icon(Icons.Default.Check, contentDescription = "Confirm", tint = ObsidianBlack, modifier = Modifier.size(16.dp))
                        Spacer(modifier = Modifier.width(4.dp))
                        Text("Add to Expenses", color = ObsidianBlack, fontWeight = FontWeight.Bold)
                    }
                }
            }
        },
        dismissButton = {
            TextButton(onClick = {
                aiViewModel.clearParsedVoiceExpense()
                onDismiss()
            }) {
                Text("Close", color = TextSecondary)
            }
        }
    )
}
