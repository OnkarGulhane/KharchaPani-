package com.kharchapani.app.ui.expenses

import androidx.compose.animation.AnimatedVisibility
import androidx.compose.animation.core.*
import androidx.compose.foundation.BorderStroke
import androidx.compose.foundation.background
import androidx.compose.foundation.border
import androidx.compose.foundation.clickable
import androidx.compose.foundation.interaction.MutableInteractionSource
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.LazyRow
import androidx.compose.foundation.lazy.items
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.foundation.text.BasicTextField
import androidx.compose.foundation.text.KeyboardOptions
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
import androidx.compose.ui.graphics.SolidColor
import androidx.compose.ui.text.TextStyle
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.input.KeyboardType
import androidx.compose.ui.text.style.TextAlign
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.kharchapani.app.theme.*
import com.kharchapani.app.viewmodel.ExpenseViewModel
import java.text.SimpleDateFormat
import java.util.*

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

    var amountText by remember { mutableStateOf(initialAmount?.let { String.format("%.0f", it) } ?: "650") }
    var descriptionText by remember { mutableStateOf(initialDescription ?: "Swiggy Gourmet Order") }
    var noteText by remember { mutableStateOf("") }
    var selectedCategoryId by remember { mutableStateOf<Int?>(null) }
    var selectedPaymentMethod by remember { mutableStateOf("UPI") }

    // Blinking cursor animation
    val infiniteTransition = rememberInfiniteTransition(label = "cursor")
    val cursorAlpha by infiniteTransition.animateFloat(
        initialValue = 1f,
        targetValue = 0f,
        animationSpec = infiniteRepeatable(
            animation = tween(500, easing = LinearEasing),
            repeatMode = RepeatMode.Reverse
        ),
        label = "cursorAlpha"
    )

    val todayDateStr = remember {
        SimpleDateFormat("EEE, dd MMM", Locale.ENGLISH).format(Date())
    }

    LaunchedEffect(Unit) {
        expenseViewModel.loadCategories()
    }

    // Auto-detect matching category from initialCategory or description keywords
    LaunchedEffect(categories, initialCategory, descriptionText) {
        if (selectedCategoryId == null && categories.isNotEmpty()) {
            val query = (initialCategory ?: descriptionText).lowercase()
            val matched = categories.find { cat ->
                query.contains(cat.name.lowercase()) ||
                (cat.name.lowercase().contains("food") && (query.contains("swiggy") || query.contains("zomato") || query.contains("hotel") || query.contains("tea") || query.contains("lunch") || query.contains("dinner"))) ||
                (cat.name.lowercase().contains("travel") && (query.contains("uber") || query.contains("ola") || query.contains("petrol") || query.contains("fuel") || query.contains("cab"))) ||
                (cat.name.lowercase().contains("grocery") && (query.contains("blinkit") || query.contains("zepto") || query.contains("dmart") || query.contains("mart") || query.contains("milk")))
            }
            selectedCategoryId = matched?.id ?: categories.firstOrNull()?.id
        }
    }

    val selectedCategory = categories.find { it.id == selectedCategoryId }

    ModalBottomSheet(
        onDismissRequest = onDismiss,
        containerColor = Color(0xF5171B26),
        shape = RoundedCornerShape(topStart = 28.dp, topEnd = 28.dp),
        dragHandle = {
            Box(
                modifier = Modifier
                    .padding(top = 12.dp, bottom = 8.dp)
                    .width(44.dp)
                    .height(5.dp)
                    .clip(RoundedCornerShape(percent = 50))
                    .background(Color(0xFF494454))
            )
        },
        tonalElevation = 0.dp
    ) {
        Column(
            modifier = Modifier
                .fillMaxWidth()
                .padding(horizontal = 20.dp)
                .padding(bottom = 32.dp),
            verticalArrangement = Arrangement.spacedBy(16.dp)
        ) {
            // Header: Status Dot + Title + Close Button
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
                            .size(10.dp)
                            .shadow(8.dp, shape = CircleShape, spotColor = Color(0xFF4EDEA3))
                            .background(Color(0xFF4EDEA3), CircleShape)
                    )
                    Text(
                        text = "Add New Expense",
                        style = MaterialTheme.typography.titleMedium,
                        fontWeight = FontWeight.Bold,
                        color = TextPrimary
                    )
                }

                Box(
                    modifier = Modifier
                        .size(34.dp)
                        .clip(CircleShape)
                        .background(Color(0x33313540))
                        .border(1.dp, BorderGlass, CircleShape)
                        .clickable { onDismiss() },
                    contentAlignment = Alignment.Center
                ) {
                    Icon(
                        imageVector = Icons.Rounded.Close,
                        contentDescription = "Close",
                        tint = Color(0xFFCBC3D7),
                        modifier = Modifier.size(18.dp)
                    )
                }
            }

            // 1. Dynamic Currency Display with Flashing Violet Cursor & Hero Ambient Halo
            Column(
                modifier = Modifier.fillMaxWidth(),
                horizontalAlignment = Alignment.CenterHorizontally,
                verticalArrangement = Arrangement.spacedBy(6.dp)
            ) {
                Row(
                    verticalAlignment = Alignment.CenterVertically,
                    horizontalArrangement = Arrangement.Center
                ) {
                    Text(
                        text = "₹",
                        fontSize = 38.sp,
                        fontWeight = FontWeight.Light,
                        color = Color(0xFFCBC3D7)
                    )
                    Spacer(modifier = Modifier.width(4.dp))
                    BasicTextField(
                        value = amountText,
                        onValueChange = { amountText = it },
                        textStyle = TextStyle(
                            fontSize = 42.sp,
                            fontWeight = FontWeight.Bold,
                            color = TextPrimary,
                            textAlign = TextAlign.Center
                        ),
                        keyboardOptions = KeyboardOptions(keyboardType = KeyboardType.Number),
                        singleLine = true,
                        cursorBrush = SolidColor(Color.Transparent),
                        modifier = Modifier.width(IntrinsicSize.Min).widthIn(min = 60.dp, max = 220.dp)
                    )
                    Box(
                        modifier = Modifier
                            .width(3.dp)
                            .height(36.dp)
                            .clip(RoundedCornerShape(percent = 50))
                            .background(Color(0xFF8B5CF6).copy(alpha = cursorAlpha))
                    )
                }

                // Local AI Categorization Pill
                Box(
                    modifier = Modifier
                        .clip(RoundedCornerShape(percent = 50))
                        .background(Color(0x33003824))
                        .border(1.dp, Color(0x4D4EDEA3), RoundedCornerShape(percent = 50))
                        .padding(horizontal = 14.dp, vertical = 6.dp)
                ) {
                    Row(
                        verticalAlignment = Alignment.CenterVertically,
                        horizontalArrangement = Arrangement.spacedBy(6.dp)
                    ) {
                        Text(text = "💡", fontSize = 12.sp)
                        Text(
                            text = "${descriptionText.take(16)} detected → ${selectedCategory?.name ?: "Food & Dining"}",
                            style = MaterialTheme.typography.labelSmall,
                            color = Color(0xFF4EDEA3),
                            fontWeight = FontWeight.SemiBold
                        )
                    }
                }
            }

            // 2. Title / Merchant Input Field
            Column(verticalArrangement = Arrangement.spacedBy(4.dp)) {
                Text(
                    text = "Title / Merchant",
                    style = MaterialTheme.typography.labelSmall,
                    color = Color(0xFFCBC3D7),
                    modifier = Modifier.padding(start = 4.dp)
                )
                Box(
                    modifier = Modifier
                        .fillMaxWidth()
                        .clip(RoundedCornerShape(14.dp))
                        .background(Color(0xFF0A0E18))
                        .border(1.dp, BorderGlass, RoundedCornerShape(14.dp))
                        .padding(horizontal = 14.dp, vertical = 12.dp)
                ) {
                    Row(
                        verticalAlignment = Alignment.CenterVertically,
                        horizontalArrangement = Arrangement.spacedBy(10.dp)
                    ) {
                        Box(
                            modifier = Modifier
                                .size(28.dp)
                                .clip(RoundedCornerShape(8.dp))
                                .background(Color(0x338B5CF6)),
                            contentAlignment = Alignment.Center
                        ) {
                            Icon(
                                imageVector = Icons.Rounded.Storefront,
                                contentDescription = "Store",
                                tint = Color(0xFFD0BCFF),
                                modifier = Modifier.size(16.dp)
                            )
                        }
                        BasicTextField(
                            value = descriptionText,
                            onValueChange = { descriptionText = it },
                            textStyle = TextStyle(
                                fontSize = 15.sp,
                                fontWeight = FontWeight.Medium,
                                color = TextPrimary
                            ),
                            singleLine = true,
                            modifier = Modifier.weight(1f)
                        )
                        Icon(
                            imageVector = Icons.Rounded.Edit,
                            contentDescription = "Edit",
                            tint = Color(0xFF958EA0),
                            modifier = Modifier.size(16.dp)
                        )
                    }
                }
            }

            // 3. Category Chip Selector (Horizontal Scrolling)
            Column(verticalArrangement = Arrangement.spacedBy(6.dp)) {
                Row(
                    modifier = Modifier.fillMaxWidth(),
                    horizontalArrangement = Arrangement.SpaceBetween,
                    verticalAlignment = Alignment.CenterVertically
                ) {
                    Text(
                        text = "Category",
                        style = MaterialTheme.typography.labelSmall,
                        color = Color(0xFFCBC3D7),
                        modifier = Modifier.padding(start = 4.dp)
                    )
                    Text(
                        text = "View All",
                        style = MaterialTheme.typography.labelSmall,
                        color = Color(0xFFD0BCFF),
                        fontWeight = FontWeight.SemiBold
                    )
                }
                LazyRow(
                    horizontalArrangement = Arrangement.spacedBy(8.dp),
                    contentPadding = PaddingValues(vertical = 2.dp)
                ) {
                    items(categories) { cat ->
                        val isSelected = selectedCategoryId == cat.id
                        val pillShape = RoundedCornerShape(percent = 50)
                        Box(
                            modifier = Modifier
                                .shadow(if (isSelected) 8.dp else 0.dp, shape = pillShape, spotColor = Color(0xFF8B5CF6))
                                .clip(pillShape)
                                .background(
                                    if (isSelected) Color(0xFF3131C0) else Color(0xFF262A35)
                                )
                                .border(
                                    1.dp,
                                    if (isSelected) Color(0xFFC0C1FF) else BorderGlass,
                                    pillShape
                                )
                                .clickable { selectedCategoryId = cat.id }
                                .padding(horizontal = 14.dp, vertical = 8.dp)
                        ) {
                            Row(
                                verticalAlignment = Alignment.CenterVertically,
                                horizontalArrangement = Arrangement.spacedBy(6.dp)
                            ) {
                                Text(
                                    text = when (cat.name.lowercase()) {
                                        "food", "food & dining" -> "🍔"
                                        "travel", "transport" -> "🚖"
                                        "groceries", "grocery" -> "🛒"
                                        "fuel", "petrol" -> "⛽"
                                        "shopping" -> "🛍️"
                                        "bills", "utilities" -> "💡"
                                        "entertainment", "movie" -> "🎬"
                                        else -> "📁"
                                    },
                                    fontSize = 14.sp
                                )
                                Text(
                                    text = cat.name,
                                    style = MaterialTheme.typography.labelMedium,
                                    fontWeight = if (isSelected) FontWeight.Bold else FontWeight.Medium,
                                    color = if (isSelected) TextPrimary else Color(0xFFCBC3D7)
                                )
                            }
                        }
                    }
                }
            }

            // 4. Payment Method 4-Way Distinct Tiles
            Column(verticalArrangement = Arrangement.spacedBy(4.dp)) {
                Text(
                    text = "Payment Method",
                    style = MaterialTheme.typography.labelSmall,
                    color = Color(0xFFCBC3D7),
                    modifier = Modifier.padding(start = 4.dp)
                )
                Row(
                    modifier = Modifier.fillMaxWidth(),
                    horizontalArrangement = Arrangement.spacedBy(8.dp)
                ) {
                    listOf(
                        Triple("UPI", Icons.Rounded.QrCodeScanner, Color(0xFF4EDEA3)),
                        Triple("Cash", Icons.Rounded.Payments, Color(0xFF8B5CF6)),
                        Triple("Card", Icons.Rounded.CreditCard, Color(0xFFC0C1FF)),
                        Triple("NetBanking", Icons.Rounded.AccountBalance, Color(0xFFFFB4AB))
                    ).forEach { (method, icon, iconColor) ->
                        val isSelected = selectedPaymentMethod == method
                        val chipShape = RoundedCornerShape(12.dp)
                        Box(
                            modifier = Modifier
                                .weight(1f)
                                .height(44.dp)
                                .shadow(if (isSelected) 8.dp else 0.dp, shape = chipShape, spotColor = iconColor)
                                .clip(chipShape)
                                .background(
                                    if (isSelected) Color(0x338B5CF6) else Color(0xFF1C1F2A)
                                )
                                .border(
                                    1.dp,
                                    if (isSelected) Color(0xFF8B5CF6) else BorderGlass,
                                    chipShape
                                )
                                .clickable { selectedPaymentMethod = method },
                            contentAlignment = Alignment.Center
                        ) {
                            Column(
                                horizontalAlignment = Alignment.CenterHorizontally,
                                verticalArrangement = Arrangement.Center
                            ) {
                                Icon(
                                    imageVector = icon,
                                    contentDescription = method,
                                    tint = if (isSelected) Color(0xFFD0BCFF) else iconColor.copy(alpha = 0.7f),
                                    modifier = Modifier.size(16.dp)
                                )
                                Text(
                                    text = method,
                                    style = MaterialTheme.typography.labelSmall,
                                    fontWeight = if (isSelected) FontWeight.Bold else FontWeight.Medium,
                                    color = if (isSelected) Color(0xFFD0BCFF) else Color(0xFFCBC3D7),
                                    fontSize = 10.sp
                                )
                            }
                        }
                    }
                }
            }

            // 5. Date & Attachment Control Panel (2 Tiles)
            Row(
                modifier = Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.spacedBy(10.dp)
            ) {
                // Date Picker Tile
                Box(
                    modifier = Modifier
                        .weight(1f)
                        .clip(RoundedCornerShape(14.dp))
                        .background(Color(0xFF1C1F2A))
                        .border(1.dp, BorderGlass, RoundedCornerShape(14.dp))
                        .padding(10.dp)
                ) {
                    Row(
                        verticalAlignment = Alignment.CenterVertically,
                        horizontalArrangement = Arrangement.spacedBy(10.dp)
                    ) {
                        Box(
                            modifier = Modifier
                                .size(34.dp)
                                .clip(RoundedCornerShape(8.dp))
                                .background(Color(0x338B5CF6)),
                            contentAlignment = Alignment.Center
                        ) {
                            Icon(
                                imageVector = Icons.Rounded.CalendarToday,
                                contentDescription = "Date",
                                tint = Color(0xFFD0BCFF),
                                modifier = Modifier.size(18.dp)
                            )
                        }
                        Column {
                            Text(
                                text = "Date",
                                style = MaterialTheme.typography.labelSmall,
                                color = Color(0xFF958EA0),
                                fontSize = 10.sp
                            )
                            Text(
                                text = todayDateStr,
                                style = MaterialTheme.typography.labelMedium,
                                fontWeight = FontWeight.SemiBold,
                                color = TextPrimary
                            )
                        }
                    }
                }

                // OCR Receipt Scanner Tile
                Box(
                    modifier = Modifier
                        .weight(1f)
                        .clip(RoundedCornerShape(14.dp))
                        .background(Color(0xFF1C1F2A))
                        .border(1.dp, BorderGlass, RoundedCornerShape(14.dp))
                        .padding(10.dp)
                ) {
                    Row(
                        verticalAlignment = Alignment.CenterVertically,
                        horizontalArrangement = Arrangement.spacedBy(10.dp)
                    ) {
                        Box(
                            modifier = Modifier
                                .size(34.dp)
                                .clip(RoundedCornerShape(8.dp))
                                .background(Color(0x333131C0)),
                            contentAlignment = Alignment.Center
                        ) {
                            Icon(
                                imageVector = Icons.Rounded.CameraAlt,
                                contentDescription = "OCR",
                                tint = Color(0xFFC0C1FF),
                                modifier = Modifier.size(18.dp)
                            )
                        }
                        Column {
                            Text(
                                text = "Receipt OCR",
                                style = MaterialTheme.typography.labelSmall,
                                color = Color(0xFFC0C1FF),
                                fontSize = 10.sp
                            )
                            Text(
                                text = "Scan Bill",
                                style = MaterialTheme.typography.labelMedium,
                                fontWeight = FontWeight.SemiBold,
                                color = TextPrimary
                            )
                        }
                    }
                }
            }

            // 6. Optional Notes Field
            Box(
                modifier = Modifier
                    .fillMaxWidth()
                    .clip(RoundedCornerShape(14.dp))
                    .background(Color(0xFF0A0E18))
                    .border(1.dp, BorderGlass, RoundedCornerShape(14.dp))
                    .padding(horizontal = 14.dp, vertical = 10.dp)
            ) {
                Row(
                    verticalAlignment = Alignment.CenterVertically,
                    horizontalArrangement = Arrangement.spacedBy(8.dp)
                ) {
                    Icon(
                        imageVector = Icons.Rounded.StickyNote2,
                        contentDescription = "Note",
                        tint = Color(0xFF958EA0),
                        modifier = Modifier.size(18.dp)
                    )
                    BasicTextField(
                        value = noteText,
                        onValueChange = { noteText = it },
                        textStyle = TextStyle(
                            fontSize = 13.sp,
                            color = TextPrimary
                        ),
                        decorationBox = { innerTextField ->
                            if (noteText.isEmpty()) {
                                Text("Notes: Team Lunch, Office, etc. (Optional)...", color = Color(0xFF958EA0), fontSize = 13.sp)
                            }
                            innerTextField()
                        },
                        singleLine = true,
                        modifier = Modifier.weight(1f)
                    )
                }
            }

            // 7. Primary Action CTA Button: Neon Gradient Styling with Micro-border & Glow
            val isValid = (amountText.toDoubleOrNull() ?: 0.0) > 0
            Box(
                modifier = Modifier
                    .fillMaxWidth()
                    .height(54.dp)
                    .shadow(16.dp, shape = RoundedCornerShape(percent = 50), spotColor = Color(0xFF8B5CF6))
                    .clip(RoundedCornerShape(percent = 50))
                    .background(
                        Brush.horizontalGradient(
                            listOf(Color(0xFF6366F1), Color(0xFF8B5CF6), Color(0xFFA855F7))
                        )
                    )
                    .border(
                        BorderStroke(1.dp, Color(0x66FFFFFF)),
                        RoundedCornerShape(percent = 50)
                    )
                    .clickable(enabled = isValid) {
                        val amt = amountText.toDoubleOrNull()
                        if (amt != null && amt > 0) {
                            expenseViewModel.addExpense(
                                amount = amt,
                                categoryId = selectedCategoryId,
                                description = if (noteText.isNotBlank()) "$descriptionText ($noteText)" else descriptionText.ifBlank { "Expense" },
                                paymentMethod = selectedPaymentMethod,
                                onSuccess = onDismiss
                            )
                        }
                    },
                contentAlignment = Alignment.Center
            ) {
                Row(
                    verticalAlignment = Alignment.CenterVertically,
                    horizontalArrangement = Arrangement.spacedBy(8.dp)
                ) {
                    Icon(
                        imageVector = Icons.Rounded.CheckCircle,
                        contentDescription = "Save",
                        tint = Color.White,
                        modifier = Modifier.size(22.dp)
                    )
                    Text(
                        text = "Save Expense",
                        style = MaterialTheme.typography.titleMedium,
                        fontWeight = FontWeight.Bold,
                        color = Color.White
                    )
                }
            }
        }
    }
}


