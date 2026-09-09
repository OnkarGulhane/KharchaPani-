package com.kharchapani.app.ui.components

import androidx.compose.animation.core.*
import androidx.compose.foundation.BorderStroke
import androidx.compose.foundation.background
import androidx.compose.foundation.border
import androidx.compose.foundation.clickable
import androidx.compose.foundation.interaction.MutableInteractionSource
import androidx.compose.foundation.layout.*
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
import androidx.compose.ui.graphics.Shape
import androidx.compose.ui.graphics.vector.ImageVector
import androidx.compose.ui.unit.Dp
import androidx.compose.ui.unit.dp
import com.kharchapani.app.theme.*

/**
 * Atmospheric background wrapper that renders deep obsidian with ambient glowing orbs.
 */
@Composable
fun ObsidianAtmosphere(
    modifier: Modifier = Modifier,
    content: @Composable BoxScope.() -> Unit
) {
    Box(
        modifier = modifier
            .fillMaxSize()
            .background(ObsidianCanvas)
    ) {
        // Top-Left Neon Indigo Ambient Glow
        Box(
            modifier = Modifier
                .align(Alignment.TopStart)
                .size(340.dp)
                .offset(x = (-90).dp, y = (-90).dp)
                .background(
                    Brush.radialGradient(
                        listOf(
                            Color(0x336366F1),
                            Color(0x126366F1),
                            Color.Transparent
                        )
                    ),
                    CircleShape
                )
        )

        // Mid-Right Vibrant Violet Ambient Glow
        Box(
            modifier = Modifier
                .align(Alignment.CenterEnd)
                .size(290.dp)
                .offset(x = 100.dp, y = 30.dp)
                .background(
                    Brush.radialGradient(
                        listOf(
                            Color(0x2B8B5CF6),
                            Color(0x0E8B5CF6),
                            Color.Transparent
                        )
                    ),
                    CircleShape
                )
        )

        // Bottom-Left Electric Emerald Ambient Glow
        Box(
            modifier = Modifier
                .align(Alignment.BottomStart)
                .size(260.dp)
                .offset(x = (-70).dp, y = 70.dp)
                .background(
                    Brush.radialGradient(
                        listOf(
                            Color(0x2210B981),
                            Color.Transparent
                        )
                    ),
                    CircleShape
                )
        )

        content()
    }
}

/**
 * Premium Frosted Glass Card with translucent fill, multi-stop gradient border and ambient glow shadow.
 */
@Composable
fun GlassmorphicCard(
    modifier: Modifier = Modifier,
    shape: Shape = RoundedCornerShape(22.dp),
    backgroundColor: Color = Color(0xE6171C28),
    borderGradient: Brush = Brush.verticalGradient(
        listOf(
            Color(0x38FFFFFF),
            Color(0x0DFFFFFF),
            Color(0x05FFFFFF)
        )
    ),
    spotColor: Color = Color(0x336366F1),
    elevation: Dp = 12.dp,
    onClick: (() -> Unit)? = null,
    content: @Composable ColumnScope.() -> Unit
) {
    val clickableModifier = if (onClick != null) {
        Modifier.clickable(
            interactionSource = remember { MutableInteractionSource() },
            indication = null
        ) { onClick() }
    } else Modifier

    Box(
        modifier = modifier
            .shadow(elevation, shape = shape, spotColor = spotColor, ambientColor = Color(0x55000000))
            .clip(shape)
            .background(backgroundColor)
            .border(BorderStroke(1.dp, borderGradient), shape)
            .then(clickableModifier)
    ) {
        Column(modifier = Modifier.fillMaxWidth()) {
            content()
        }
    }
}

/**
 * Glowing Category Icon Squircle with vibrant multi-stop gradient background and rounded symbol.
 */
@Composable
fun CategoryIconBadge(
    categoryName: String,
    modifier: Modifier = Modifier,
    size: Dp = 44.dp,
    iconSize: Dp = 22.dp,
    shape: Shape = RoundedCornerShape(14.dp)
) {
    val config = remember(categoryName) { getCategoryVisualConfig(categoryName) }

    Box(
        modifier = modifier
            .size(size)
            .shadow(8.dp, shape = shape, spotColor = config.glowColor, ambientColor = Color.Transparent)
            .clip(shape)
            .background(Brush.linearGradient(config.gradientColors))
            .border(
                BorderStroke(
                    1.dp,
                    Brush.verticalGradient(
                        listOf(
                            Color(0x66FFFFFF),
                            Color(0x18FFFFFF)
                        )
                    )
                ),
                shape
            ),
        contentAlignment = Alignment.Center
    ) {
        Icon(
            imageVector = config.icon,
            contentDescription = categoryName,
            tint = Color.White,
            modifier = Modifier.size(iconSize)
        )
    }
}

/**
 * Visual configuration for expense categories
 */
data class CategoryVisualConfig(
    val icon: ImageVector,
    val gradientColors: List<Color>,
    val glowColor: Color,
    val accentColor: Color
)

fun getCategoryVisualConfig(category: String): CategoryVisualConfig {
    val normalized = category.lowercase().trim()
    return when {
        normalized.contains("food") || normalized.contains("dining") || normalized.contains("rest") || normalized.contains("swiggy") || normalized.contains("zomato") || normalized.contains("खाण") -> {
            CategoryVisualConfig(
                icon = Icons.Rounded.Restaurant,
                gradientColors = listOf(Color(0xFFF43F5E), Color(0xFFBE123C)),
                glowColor = Color(0xFFF43F5E),
                accentColor = Color(0xFFFDA4AF)
            )
        }
        normalized.contains("travel") || normalized.contains("transport") || normalized.contains("uber") || normalized.contains("ola") || normalized.contains("petrol") || normalized.contains("इंधन") -> {
            CategoryVisualConfig(
                icon = Icons.Rounded.DirectionsCar,
                gradientColors = listOf(Color(0xFFF59E0B), Color(0xFFD97706)),
                glowColor = Color(0xFFF59E0B),
                accentColor = Color(0xFFFDE68A)
            )
        }
        normalized.contains("shop") || normalized.contains("amazon") || normalized.contains("flipkart") || normalized.contains("खरेदी") || normalized.contains("cloth") -> {
            CategoryVisualConfig(
                icon = Icons.Rounded.ShoppingBag,
                gradientColors = listOf(Color(0xFF8B5CF6), Color(0xFF6D28D9)),
                glowColor = Color(0xFF8B5CF6),
                accentColor = Color(0xFFDDD6FE)
            )
        }
        normalized.contains("bill") || normalized.contains("util") || normalized.contains("elect") || normalized.contains("wifi") || normalized.contains("recharge") || normalized.contains("बिल") -> {
            CategoryVisualConfig(
                icon = Icons.Rounded.Bolt,
                gradientColors = listOf(Color(0xFF06B6D4), Color(0xFF0284C7)),
                glowColor = Color(0xFF06B6D4),
                accentColor = Color(0xFFA5F3FC)
            )
        }
        normalized.contains("entertain") || normalized.contains("movie") || normalized.contains("netflix") || normalized.contains("game") || normalized.contains("मनोरंजन") -> {
            CategoryVisualConfig(
                icon = Icons.Rounded.Movie,
                gradientColors = listOf(Color(0xFFEC4899), Color(0xFFBE185D)),
                glowColor = Color(0xFFEC4899),
                accentColor = Color(0xFFFBCFE8)
            )
        }
        normalized.contains("health") || normalized.contains("med") || normalized.contains("doc") || normalized.contains("औषध") -> {
            CategoryVisualConfig(
                icon = Icons.Rounded.Favorite,
                gradientColors = listOf(Color(0xFF14B8A6), Color(0xFF0F766E)),
                glowColor = Color(0xFF14B8A6),
                accentColor = Color(0xFF99F6E4)
            )
        }
        normalized.contains("salary") || normalized.contains("income") || normalized.contains("पगार") || normalized.contains("कमवा") || normalized.contains("freelance") -> {
            CategoryVisualConfig(
                icon = Icons.Rounded.Payments,
                gradientColors = listOf(Color(0xFF10B981), Color(0xFF047857)),
                glowColor = Color(0xFF10B981),
                accentColor = Color(0xFFA7F3D0)
            )
        }
        normalized.contains("invest") || normalized.contains("mutual") || normalized.contains("stock") || normalized.contains("sip") || normalized.contains("बचत") -> {
            CategoryVisualConfig(
                icon = Icons.Rounded.ShowChart,
                gradientColors = listOf(Color(0xFF6366F1), Color(0xFF4338CA)),
                glowColor = Color(0xFF6366F1),
                accentColor = Color(0xFFC7D2FE)
            )
        }
        normalized.contains("grocery") || normalized.contains("किराणा") || normalized.contains("market") || normalized.contains("blinkit") || normalized.contains("zepto") -> {
            CategoryVisualConfig(
                icon = Icons.Rounded.LocalGroceryStore,
                gradientColors = listOf(Color(0xFF84CC16), Color(0xFF4D7C0F)),
                glowColor = Color(0xFF84CC16),
                accentColor = Color(0xFFD9F99D)
            )
        }
        normalized.contains("education") || normalized.contains("fees") || normalized.contains("book") || normalized.contains("शिक्षण") -> {
            CategoryVisualConfig(
                icon = Icons.Rounded.School,
                gradientColors = listOf(Color(0xFF3B82F6), Color(0xFF1D4ED8)),
                glowColor = Color(0xFF3B82F6),
                accentColor = Color(0xFFBFDBFE)
            )
        }
        else -> {
            CategoryVisualConfig(
                icon = Icons.Rounded.AccountBalanceWallet,
                gradientColors = listOf(Color(0xFF6366F1), Color(0xFF8B5CF6)),
                glowColor = Color(0xFF8B5CF6),
                accentColor = Color(0xFFE0E7FF)
            )
        }
    }
}
