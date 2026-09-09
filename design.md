---
name: Obsidian Kinetic - KharchaPani Design System
colors:
  # Surface & Canvas
  surface: '#0f131d'
  surface-dim: '#0f131d'
  surface-bright: '#353944'
  surface-container-lowest: '#0a0e18'
  surface-container-low: '#171b26'
  surface-container: '#1c1f2a'
  surface-container-high: '#262a35'
  surface-container-highest: '#313540'
  surface-variant: '#313540'
  surface-tint: '#c0c1ff'
  background: '#0f131d'
  on-background: '#dfe2f1'
  on-surface: '#dfe2f1'
  on-surface-variant: '#c7c4d7'
  inverse-surface: '#dfe2f1'
  inverse-on-surface: '#2c303b'
  outline: '#908fa0'
  outline-variant: '#464554'

  # Primary Brand Palette (Neon Indigo)
  primary: '#c0c1ff'
  on-primary: '#1000a9'
  primary-container: '#8083ff'
  on-primary-container: '#0d0096'
  inverse-primary: '#494bd6'
  primary-fixed: '#e1e0ff'
  primary-fixed-dim: '#c0c1ff'
  on-primary-fixed: '#07006c'
  on-primary-fixed-variant: '#2f2ebe'

  # Secondary Palette (Emerald Mint / Positive Cash Flow)
  secondary: '#4edea3'
  on-secondary: '#003824'
  secondary-container: '#00a572'
  on-secondary-container: '#00311f'
  secondary-fixed: '#6ffbbe'
  secondary-fixed-dim: '#4edea3'
  on-secondary-fixed: '#002113'
  on-secondary-fixed-variant: '#005236'

  # Tertiary Palette (Vibrant Violet / Analytics)
  tertiary: '#d0bcff'
  on-tertiary: '#3c0091'
  tertiary-container: '#a078ff'
  on-tertiary-container: '#340080'
  tertiary-fixed: '#e9ddff'
  tertiary-fixed-dim: '#d0bcff'
  on-tertiary-fixed: '#23005c'
  on-tertiary-fixed-variant: '#5516be'

  # Semantic Alerts & Status
  error: '#ffb4ab'
  on-error: '#690005'
  error-container: '#93000a'
  on-error-container: '#ffdad6'

  # Direct Brand Overrides & UI Accents
  brand-primary: '#6366F1'
  brand-secondary: '#10B981'
  brand-tertiary: '#8B5CF6'
  brand-expense: '#F43F5E'
  brand-canvas: '#0B0F19'
  card-elevated: '#111827'
  card-highlight: '#1F2937'

typography:
  display-hero:
    fontFamily: Plus Jakarta Sans
    fontSize: 40px
    fontWeight: '800'
    lineHeight: 48px
    letterSpacing: -0.03em
  display-hero-mobile:
    fontFamily: Plus Jakarta Sans
    fontSize: 34px
    fontWeight: '800'
    lineHeight: 40px
    letterSpacing: -0.025em
  headline-lg:
    fontFamily: Plus Jakarta Sans
    fontSize: 28px
    fontWeight: '700'
    lineHeight: 36px
    letterSpacing: -0.02em
  headline-md:
    fontFamily: Plus Jakarta Sans
    fontSize: 22px
    fontWeight: '700'
    lineHeight: 28px
    letterSpacing: -0.015em
  headline-sm:
    fontFamily: Plus Jakarta Sans
    fontSize: 18px
    fontWeight: '600'
    lineHeight: 24px
    letterSpacing: -0.01em
  body-lg:
    fontFamily: Manrope
    fontSize: 16px
    fontWeight: '500'
    lineHeight: 24px
    letterSpacing: -0.01em
  body-md:
    fontFamily: Manrope
    fontSize: 14px
    fontWeight: '400'
    lineHeight: 20px
    letterSpacing: 0em
  body-sm:
    fontFamily: Manrope
    fontSize: 12px
    fontWeight: '400'
    lineHeight: 16px
    letterSpacing: 0.01em
  label-lg:
    fontFamily: Plus Jakarta Sans
    fontSize: 14px
    fontWeight: '600'
    lineHeight: 18px
    letterSpacing: 0.01em
  label-md:
    fontFamily: Plus Jakarta Sans
    fontSize: 12px
    fontWeight: '600'
    lineHeight: 16px
    letterSpacing: 0.03em
  label-sm:
    fontFamily: Plus Jakarta Sans
    fontSize: 10px
    fontWeight: '700'
    lineHeight: 14px
    letterSpacing: 0.06em

rounded:
  sm: 0.5rem      # 8px
  DEFAULT: 1rem   # 16px
  md: 1.5rem      # 24px
  lg: 2rem        # 32px
  xl: 3rem        # 48px
  full: 9999px    # Pill shape

spacing:
  space-2xs: 0.25rem           # 4px
  space-xs: 0.5rem             # 8px
  space-sm: 0.75rem            # 12px
  space-md: 1rem               # 16px
  space-lg: 1.5rem             # 24px
  space-xl: 2rem               # 32px
  space-2xl: 2.5rem            # 40px
  space-3xl: 3.5rem            # 56px
  screen-edge-padding: 1.25rem # 20px
  card-inner-padding: 1.25rem  # 20px
  stack-gap: 0.75rem           # 12px
---

# KharchaPani Design System — Obsidian Kinetic

Extracted directly from Stitch project **KharchaPani** (`projects/9418550330303082072`).

---

## 1. Brand Philosophy & Aesthetic Direction

**Obsidian Kinetic** is an elite financial tracking design system tailored for high-performance financial management. It merges deep space obsidian backgrounds with glowing neon luminescence, tactile glass surfaces, and pill-shaped interactive geometry.

### Core Tenets
- **Prestige & Control:** Executive terminal clarity with focused financial metrics.
- **Luminescent Hierarchy:** Critical monetary numbers glow with intention rather than creating clutter.
- **Neomorphic Glassmorphism:** Layered translucent planes (`backdrop-filter: blur(16px)`), micro-borders (`1px solid rgba(255, 255, 255, 0.08)`), and targeted ambient lighting on OLED displays.

---

## 2. Color Palette Architecture

The color system is calibrated for dark mode ergonomics with high-contrast functional signals:

### A. Surface & Canvas Tones
| Token | Hex / Value | Description |
| :--- | :--- | :--- |
| `bg-base` / `background` | `#0B0F19` / `#0F131D` | Deep canvas obsidian background |
| `surface-container-lowest` | `#0A0E18` | Recessed containers, input tracks |
| `surface-container-low` | `#171B26` | Low elevation container base |
| `surface-container` | `#1C1F2A` | Standard card surface |
| `surface-container-high` | `#262A35` | Interactive card states, active lists |
| `surface-container-highest` | `#313540` | Hover states and active selections |
| `surface-elevated` | `#111827` | Primary card & sheet background |
| `surface-highlight` | `#1F2937` | Secondary floating interactive elements |

### B. Brand & Semantic Accents
| Token | Hex Code | Role & Usage |
| :--- | :--- | :--- |
| **Brand Primary (Neon Indigo)** | `#6366F1` / `#C0C1FF` | Action triggers, navigation, hero card glows |
| **Secondary (Emerald Mint)** | `#10B981` / `#4EDEA3` | Income inflows, positive balances, savings goals |
| **Tertiary (Vibrant Violet)** | `#8B5CF6` / `#D0BCFF` | Analytics layers, budget tags, category chips |
| **Expense / Alert (Coral Rose)** | `#F43F5E` / `#FFB4AB` | Outbound payments, debt alerts, budget limits |
| **Outline / Glass Border** | `#908FA0` / `rgba(255, 255, 255, 0.08)` | Translucent card outlines and separators |
| **Active Glow Border** | `rgba(99, 102, 241, 0.35)` | Focused inputs and selected state halo |

### C. Typography Contrast Hierarchy
| Token | Hex Code | Usage |
| :--- | :--- | :--- |
| `text-primary` / `on-surface` | `#FFFFFF` / `#DFE2F1` | Core balance figures, major headers |
| `text-secondary` / `on-surface-variant` | `#94A3B8` / `#C7C4D7` | Supporting metrics, timestamps, labels |
| `text-muted` | `#475569` | Micro-captions and inactive hints |

---

## 3. Typography Hierarchy

### Font Families
- **Headlines, Metrics & Labels:** `Plus Jakarta Sans` (Geometric, sculptured, modern)
- **Body & Transaction Ledgers:** `Manrope` (Open counters, legible at small scales)
- **Numerical Rule:** Enforce `font-variant-numeric: tabular-nums` for all currency amounts and counters to prevent jitter during live updates.

### Type Scale
| Token | Font Family | Size | Weight | Line Height | Tracking |
| :--- | :--- | :--- | :--- | :--- | :--- |
| `display-hero` | Plus Jakarta Sans | 40px | 800 (ExtraBold) | 48px | `-0.03em` |
| `display-hero-mobile` | Plus Jakarta Sans | 34px | 800 (ExtraBold) | 40px | `-0.025em` |
| `headline-lg` | Plus Jakarta Sans | 28px | 700 (Bold) | 36px | `-0.02em` |
| `headline-md` | Plus Jakarta Sans | 22px | 700 (Bold) | 28px | `-0.015em` |
| `headline-sm` | Plus Jakarta Sans | 18px | 600 (SemiBold) | 24px | `-0.01em` |
| `body-lg` | Manrope | 16px | 500 (Medium) | 24px | `-0.01em` |
| `body-md` | Manrope | 14px | 400 (Regular) | 20px | `0em` |
| `body-sm` | Manrope | 12px | 400 (Regular) | 16px | `+0.01em` |
| `label-lg` | Plus Jakarta Sans | 14px | 600 (SemiBold) | 18px | `+0.01em` |
| `label-md` | Plus Jakarta Sans | 12px | 600 (SemiBold) | 16px | `+0.03em` |
| `label-sm` | Plus Jakarta Sans | 10px | 700 (Bold) | 14px | `+0.06em` |

---

## 4. Spacing, Geometry & Shapes

### Spacing System (8-Point Rhythm with 4-Point Micro-Adjustments)
- `space-2xs`: `0.25rem` (4px)
- `space-xs`: `0.5rem` (8px)
- `space-sm`: `0.75rem` (12px)
- `space-md`: `1.0rem` (16px)
- `space-lg`: `1.5rem` (24px)
- `space-xl`: `2.0rem` (32px)
- `space-2xl`: `2.5rem` (40px)
- `space-3xl`: `3.5rem` (56px)
- `screen-edge-padding`: `1.25rem` (20px)
- `card-inner-padding`: `1.25rem` (20px)
- `stack-gap`: `0.75rem` (12px)

### Border Radius & Corner Geometry
- **Badges, Buttons & Pills:** `rounded-full` (`9999px`)
- **Cards & Data Modules:** `rounded-lg` (`2rem` / 32px) or `rounded-md` (`1.5rem` / 24px)
- **Inner Micro-Elements & Icons:** `rounded` (`1rem` / 16px)

---

## 5. Elevation, Depth & Glassmorphism

| Layer | Structure | Styling & Shadows |
| :--- | :--- | :--- |
| **L0 - Canvas** | `#0B0F19` | Dark obsidian base with ambient radial gradient lighting |
| **L1 - Glass Cards** | `#111827` (70% opacity) | `backdrop-filter: blur(16px); border: 1px solid rgba(255, 255, 255, 0.08);` |
| **L2 - Floating Sheets**| `#1F2937` (85% opacity) | `box-shadow: 0 16px 32px -8px rgba(0, 0, 0, 0.6);` |
| **L3 - Hero Radiance** | Radiant Primary Core | `box-shadow: 0 8px 30px -4px rgba(99, 102, 241, 0.25);` |
| **Income Flash** | Positive transaction event | `box-shadow: 0 0 24px rgba(16, 185, 129, 0.2);` |
| **Expense Flash** | High expense alert | `box-shadow: 0 0 24px rgba(244, 63, 94, 0.2);` |

---

## 6. Stitch Screen Mapping

Project **KharchaPani** includes reference UI specifications for:
1. **Home Dashboard (`859c377cf0ab49b4bf4fc7a22c9cabbd` / `ebf29996c6534866bc26e98ba999f685`):**
   - Total Balance Hero Card with Neon Indigo top-border gradient
   - Quick Cash Flow summary (Income `#10B981`, Expense `#F43F5E`)
   - Recent Transactions ledger with category icon enclosures and tabular currency values
2. **Analytics & Insights (`d79956a2078a4e68b1f91f5fae738034` / `4ea64c5b986e4347bd41da56f3937460`):**
   - Timeframe Segmented Control (Day / Week / Month / Year) in pill tray
   - Spend breakdown and category visual distribution using Violet/Indigo gradients
3. **Add Transaction Modal / Screen (`9b4ac3bc42e845e1af204b53ee2c2364` / `46284358cfb24f879b8193bfd80a302b`):**
   - Dynamic Hero Monetary Input (`display-hero` font with pulsating `#6366F1` caret)
   - Pill Category Chips with active border glows
   - Primary Pill action button with directional gradient (`#6366F1` → `#8B5CF6`)
