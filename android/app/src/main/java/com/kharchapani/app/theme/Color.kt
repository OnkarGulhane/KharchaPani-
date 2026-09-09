package com.kharchapani.app.theme

import androidx.compose.ui.graphics.Color

// ==========================================
// Obsidian Kinetic Design System Color Palette
// Source: design.md (Stitch: KharchaPani)
// ==========================================

// 1. Surface & Canvas Colors (Dark Obsidian Architecture)
val ObsidianCanvas = Color(0xFF0B0F19)
val SurfaceDim = Color(0xFF0F131D)
val SurfaceElevated = Color(0xFF111827)
val SurfaceHighlight = Color(0xFF1F2937)
val SurfaceContainerLowest = Color(0xFF0A0E18)
val SurfaceContainerLow = Color(0xFF171B26)
val SurfaceContainer = Color(0xFF1C1F2A)
val SurfaceContainerHigh = Color(0xFF262A35)
val SurfaceContainerHighest = Color(0xFF313540)
val SurfaceVariant = Color(0xFF313540)
val SurfaceBright = Color(0xFF353944)

// 2. Primary Brand Colors (Neon Indigo)
val NeonIndigo = Color(0xFF6366F1)
val SurfaceTintIndigo = Color(0xFFC0C1FF)
val PrimaryContainerIndigo = Color(0xFF8083FF)
val OnPrimaryIndigo = Color(0xFF1000A9)
val PrimaryFixed = Color(0xFFE1E0FF)
val PrimaryFixedDim = Color(0xFFC0C1FF)
val InversePrimary = Color(0xFF494BD6)

// 3. Secondary Palette (Electric Emerald / Inflow & Positive Cash Flow)
val ElectricEmerald = Color(0xFF10B981)
val EmeraldMint = Color(0xFF4EDEA3)
val SecondaryContainerEmerald = Color(0xFF00A572)
val OnSecondaryEmerald = Color(0xFF003824)
val SecondaryFixed = Color(0xFF6FFBBE)

// 4. Tertiary Palette (Vibrant Violet / AI & Analytics)
val VibrantViolet = Color(0xFF8B5CF6)
val TertiaryLight = Color(0xFFD0BCFF)
val TertiaryContainerViolet = Color(0xFFA078FF)
val OnTertiaryViolet = Color(0xFF3C0091)
val TertiaryFixed = Color(0xFFE9DDFF)

// 5. Semantic & Status Colors
val CoralRose = Color(0xFFF43F5E)
val ErrorSoft = Color(0xFFFFB4AB)
val ErrorContainerRose = Color(0xFF93000A)
val OnErrorRose = Color(0xFF690005)
val AmberWarning = Color(0xFFF59E0B)
val AmberSoft = Color(0xFFFBBF24)
val CyanAccent = Color(0xFF06B6D4)

// 6. Text & Contrast Tokens
val TextPrimary = Color(0xFFFFFFFF)
val TextOnSurface = Color(0xFFDFE2F1)
val TextSecondary = Color(0xFF94A3B8)
val TextOnSurfaceVariant = Color(0xFFC7C4D7)
val TextMuted = Color(0xFF475569)

// 7. Glassmorphism, Micro-Borders & Glow Accents
val BorderGlass = Color(0x14FFFFFF) // 1px translucent perimeter
val BorderActiveGlow = Color(0x596366F1) // Indigo glow border
val IndigoGlow = Color(0x406366F1)
val EmeraldGlow = Color(0x3310B981)
val VioletGlow = Color(0x338B5CF6)
val RoseGlow = Color(0x33F43F5E)

// 8. Backward Compatibility Aliases
val ObsidianBlack = ObsidianCanvas
val ObsidianDark = SurfaceContainerLowest
val CardBackground = SurfaceElevated
val CardBorder = BorderGlass
val CardGlass = Color(0xB3111827)
val GlassSurface = Color(0xCC111827)
val Emerald500 = ElectricEmerald
val Emerald400 = EmeraldMint
val Emerald600 = SecondaryContainerEmerald
val Rose500 = CoralRose
val Rose400 = ErrorSoft
val Amber500 = AmberWarning
val Amber400 = AmberSoft
val Blue500 = NeonIndigo
val Purple500 = VibrantViolet
val Cyan500 = CyanAccent

// 9. Light Theme Fallbacks
val LightBackground = Color(0xFFF8FAFC)
val LightSurface = Color(0xFFFFFFFF)
val LightCardBorder = Color(0xFFE2E8F0)
val LightTextPrimary = Color(0xFF0F172A)
val LightTextSecondary = Color(0xFF64748B)
