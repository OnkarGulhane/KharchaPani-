package com.kharchapani.app.ui.guru

import androidx.compose.foundation.BorderStroke
import androidx.compose.foundation.background
import androidx.compose.foundation.border
import androidx.compose.foundation.clickable
import androidx.compose.foundation.interaction.MutableInteractionSource
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.LazyRow
import androidx.compose.foundation.lazy.items
import androidx.compose.foundation.lazy.rememberLazyListState
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
import com.kharchapani.app.data.model.ChatMessage
import com.kharchapani.app.theme.*
import com.kharchapani.app.ui.components.GlassmorphicCard
import com.kharchapani.app.ui.components.ObsidianAtmosphere
import com.kharchapani.app.viewmodel.AiViewModel

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun KharchaGuruScreen(
    aiViewModel: AiViewModel
) {
    val messages by aiViewModel.messages.collectAsState()
    val quickReplies by aiViewModel.quickReplies.collectAsState()
    val isChatLoading by aiViewModel.isChatLoading.collectAsState()

    var inputText by remember { mutableStateOf("") }
    val listState = rememberLazyListState()

    LaunchedEffect(messages.size) {
        if (messages.isNotEmpty()) {
            listState.animateScrollToItem(messages.size - 1)
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
                                        listOf(Color(0xFF8B5CF6), Color(0xFFA855F7))
                                    )
                                )
                                .border(BorderStroke(1.dp, Color(0x60FFFFFF)), RoundedCornerShape(12.dp)),
                            contentAlignment = Alignment.Center
                        ) {
                            Icon(
                                imageVector = Icons.Rounded.AutoAwesome,
                                contentDescription = "Guru AI",
                                tint = Color.White,
                                modifier = Modifier.size(20.dp)
                            )
                        }
                        Column {
                            Text(
                                text = "खर्चा Guru AI",
                                style = MaterialTheme.typography.titleMedium,
                                fontWeight = FontWeight.Bold,
                                color = TextPrimary
                            )
                            Text(
                                text = "Intelligent Financial Advisor",
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
            ) {
                // 1. Chat Messages History
                LazyColumn(
                    state = listState,
                    modifier = Modifier
                        .weight(1f)
                        .padding(horizontal = 16.dp),
                    verticalArrangement = Arrangement.spacedBy(14.dp),
                    contentPadding = PaddingValues(top = 10.dp, bottom = 16.dp)
                ) {
                    items(messages) { message ->
                        ChatBubble(message = message)
                    }

                    if (isChatLoading) {
                        item {
                            Row(
                                verticalAlignment = Alignment.CenterVertically,
                                horizontalArrangement = Arrangement.spacedBy(8.dp),
                                modifier = Modifier.padding(start = 8.dp, top = 4.dp)
                            ) {
                                Box(
                                    modifier = Modifier
                                        .size(28.dp)
                                        .clip(CircleShape)
                                        .background(Color(0x338B5CF6)),
                                    contentAlignment = Alignment.Center
                                ) {
                                    Icon(
                                        imageVector = Icons.Rounded.AutoAwesome,
                                        contentDescription = "Thinking",
                                        tint = Color(0xFFD0BCFF),
                                        modifier = Modifier.size(15.dp)
                                    )
                                }
                                Text(
                                    text = "खर्चा Guru विचार करत आहे...",
                                    style = MaterialTheme.typography.bodySmall,
                                    color = Color(0xFFD0BCFF),
                                    fontSize = 12.sp
                                )
                            }
                        }
                    }
                }

                // 2. Quick Action Chips Tray
                if (quickReplies.isNotEmpty()) {
                    LazyRow(
                        modifier = Modifier
                            .fillMaxWidth()
                            .padding(bottom = 8.dp),
                        contentPadding = PaddingValues(horizontal = 16.dp),
                        horizontalArrangement = Arrangement.spacedBy(8.dp)
                    ) {
                        items(quickReplies) { reply ->
                            Box(
                                modifier = Modifier
                                    .shadow(4.dp, shape = RoundedCornerShape(percent = 50), spotColor = Color(0x338B5CF6))
                                    .clip(RoundedCornerShape(percent = 50))
                                    .background(Color(0xCC1E2333))
                                    .border(1.dp, Color(0x338B5CF6), RoundedCornerShape(percent = 50))
                                    .clickable {
                                        aiViewModel.sendMessage(reply)
                                    }
                                    .padding(horizontal = 12.dp, vertical = 7.dp)
                            ) {
                                Row(
                                    verticalAlignment = Alignment.CenterVertically,
                                    horizontalArrangement = Arrangement.spacedBy(5.dp)
                                ) {
                                    Icon(
                                        imageVector = Icons.Rounded.AutoAwesome,
                                        contentDescription = "Prompt",
                                        tint = Color(0xFFD0BCFF),
                                        modifier = Modifier.size(13.dp)
                                    )
                                    Text(
                                        text = reply,
                                        style = MaterialTheme.typography.labelSmall,
                                        color = Color(0xFFDFE2F1),
                                        fontWeight = FontWeight.Medium,
                                        fontSize = 11.5.sp
                                    )
                                }
                            }
                        }
                    }
                }

                // 3. Bottom Glass Input Bar
                Box(
                    modifier = Modifier
                        .fillMaxWidth()
                        .background(Color(0xF0131722))
                        .border(BorderStroke(1.dp, BorderGlass))
                        .padding(horizontal = 16.dp, vertical = 10.dp)
                ) {
                    Row(
                        modifier = Modifier.fillMaxWidth(),
                        verticalAlignment = Alignment.CenterVertically,
                        horizontalArrangement = Arrangement.spacedBy(10.dp)
                    ) {
                        // Input Field
                        TextField(
                            value = inputText,
                            onValueChange = { inputText = it },
                            placeholder = {
                                Text(
                                    "खर्चा Guru ला काहीही विचारा...",
                                    color = TextMuted,
                                    fontSize = 13.5.sp
                                )
                            },
                            colors = TextFieldDefaults.colors(
                                focusedContainerColor = Color(0xFF1E2333),
                                unfocusedContainerColor = Color(0xFF1A1F2D),
                                focusedIndicatorColor = Color.Transparent,
                                unfocusedIndicatorColor = Color.Transparent,
                                focusedTextColor = TextPrimary,
                                unfocusedTextColor = TextPrimary
                            ),
                            shape = RoundedCornerShape(percent = 50),
                            modifier = Modifier
                                .weight(1f)
                                .heightIn(min = 46.dp)
                        )

                        // Send Button with Neon Indigo Gradient
                        Box(
                            modifier = Modifier
                                .size(46.dp)
                                .shadow(8.dp, shape = CircleShape, spotColor = Color(0xFF6366F1))
                                .clip(CircleShape)
                                .background(
                                    if (inputText.isNotBlank()) {
                                        Brush.linearGradient(listOf(Color(0xFF6366F1), Color(0xFF8B5CF6)))
                                    } else {
                                        Brush.linearGradient(listOf(Color(0xFF262A35), Color(0xFF262A35)))
                                    }
                                )
                                .clickable(enabled = inputText.isNotBlank()) {
                                    aiViewModel.sendMessage(inputText)
                                    inputText = ""
                                },
                            contentAlignment = Alignment.Center
                        ) {
                            Icon(
                                imageVector = Icons.Rounded.Send,
                                contentDescription = "Send",
                                tint = if (inputText.isNotBlank()) Color.White else TextMuted,
                                modifier = Modifier.size(20.dp)
                            )
                        }
                    }
                }
            }
        }
    }
}

@Composable
private fun ChatBubble(message: ChatMessage) {
    val isUser = message.role == "user"

    Row(
        modifier = Modifier.fillMaxWidth(),
        horizontalArrangement = if (isUser) Arrangement.End else Arrangement.Start,
        verticalAlignment = Alignment.Top
    ) {
        if (!isUser) {
            Box(
                modifier = Modifier
                    .padding(end = 8.dp, top = 2.dp)
                .size(30.dp)
                .shadow(6.dp, shape = CircleShape, spotColor = Color(0xFF8B5CF6))
                .clip(CircleShape)
                .background(
                    Brush.linearGradient(listOf(Color(0xFF8B5CF6), Color(0xFFA855F7)))
                ),
                contentAlignment = Alignment.Center
            ) {
                Icon(
                    imageVector = Icons.Rounded.AutoAwesome,
                    contentDescription = "Guru AI",
                    tint = Color.White,
                    modifier = Modifier.size(16.dp)
                )
            }
        }

        Box(
            modifier = Modifier
                .widthIn(max = 290.dp)
                .shadow(
                    if (isUser) 8.dp else 4.dp,
                    shape = RoundedCornerShape(
                        topStart = 18.dp,
                        topEnd = 18.dp,
                        bottomStart = if (isUser) 18.dp else 4.dp,
                        bottomEnd = if (isUser) 4.dp else 18.dp
                    ),
                    spotColor = if (isUser) Color(0xFF6366F1) else Color(0x338B5CF6)
                )
                .clip(
                    RoundedCornerShape(
                        topStart = 18.dp,
                        topEnd = 18.dp,
                        bottomStart = if (isUser) 18.dp else 4.dp,
                        bottomEnd = if (isUser) 4.dp else 18.dp
                    )
                )
                .background(
                    if (isUser) {
                        Brush.linearGradient(listOf(Color(0xFF6366F1), Color(0xFF8B5CF6)))
                    } else {
                        Brush.linearGradient(listOf(Color(0xF01B2030), Color(0xF0171B28)))
                    }
                )
                .border(
                    BorderStroke(
                        1.dp,
                        if (isUser) Color(0x40FFFFFF) else Color(0x2B8B5CF6)
                    ),
                    RoundedCornerShape(
                        topStart = 18.dp,
                        topEnd = 18.dp,
                        bottomStart = if (isUser) 18.dp else 4.dp,
                        bottomEnd = if (isUser) 4.dp else 18.dp
                    )
                )
                .padding(horizontal = 14.dp, vertical = 10.dp)
        ) {
            Text(
                text = message.content,
                style = MaterialTheme.typography.bodyMedium,
                color = if (isUser) Color.White else TextPrimary,
                lineHeight = 20.sp,
                fontSize = 13.5.sp
            )
        }
    }
}
