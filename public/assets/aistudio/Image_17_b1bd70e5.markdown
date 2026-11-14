---
name: NeuroCraft
colors:
  surface: '#0f131d'
  surface-dim: '#0f131d'
  surface-bright: '#353944'
  surface-container-lowest: '#0a0e18'
  surface-container-low: '#171b26'
  surface-container: '#1c1f2a'
  surface-container-high: '#262a35'
  surface-container-highest: '#313540'
  on-surface: '#dfe2f1'
  on-surface-variant: '#bcc9cd'
  inverse-surface: '#dfe2f1'
  inverse-on-surface: '#2c303b'
  outline: '#869397'
  outline-variant: '#3d494c'
  surface-tint: '#4cd7f6'
  primary: '#4cd7f6'
  on-primary: '#003640'
  primary-container: '#06b6d4'
  on-primary-container: '#00424f'
  inverse-primary: '#00687a'
  secondary: '#d0bcff'
  on-secondary: '#3c0091'
  secondary-container: '#571bc1'
  on-secondary-container: '#c4abff'
  tertiary: '#ffb95f'
  on-tertiary: '#472a00'
  tertiary-container: '#e79400'
  on-tertiary-container: '#563400'
  error: '#ffb4ab'
  on-error: '#690005'
  error-container: '#93000a'
  on-error-container: '#ffdad6'
  primary-fixed: '#acedff'
  primary-fixed-dim: '#4cd7f6'
  on-primary-fixed: '#001f26'
  on-primary-fixed-variant: '#004e5c'
  secondary-fixed: '#e9ddff'
  secondary-fixed-dim: '#d0bcff'
  on-secondary-fixed: '#23005c'
  on-secondary-fixed-variant: '#5516be'
  tertiary-fixed: '#ffddb8'
  tertiary-fixed-dim: '#ffb95f'
  on-tertiary-fixed: '#2a1700'
  on-tertiary-fixed-variant: '#653e00'
  background: '#0f131d'
  on-background: '#dfe2f1'
  surface-variant: '#313540'
typography:
  display-lg:
    fontFamily: Plus Jakarta Sans
    fontSize: 40px
    fontWeight: '800'
    lineHeight: 48px
    letterSpacing: -0.02em
  display-lg-mobile:
    fontFamily: Plus Jakarta Sans
    fontSize: 32px
    fontWeight: '800'
    lineHeight: 38px
    letterSpacing: -0.02em
  headline-lg:
    fontFamily: Plus Jakarta Sans
    fontSize: 28px
    fontWeight: '700'
    lineHeight: 34px
    letterSpacing: -0.01em
  headline-md:
    fontFamily: Plus Jakarta Sans
    fontSize: 22px
    fontWeight: '700'
    lineHeight: 28px
  headline-sm:
    fontFamily: Plus Jakarta Sans
    fontSize: 18px
    fontWeight: '600'
    lineHeight: 24px
  body-lg:
    fontFamily: Plus Jakarta Sans
    fontSize: 16px
    fontWeight: '400'
    lineHeight: 24px
  body-md:
    fontFamily: Plus Jakarta Sans
    fontSize: 14px
    fontWeight: '400'
    lineHeight: 20px
  body-sm:
    fontFamily: Plus Jakarta Sans
    fontSize: 12px
    fontWeight: '400'
    lineHeight: 16px
  label-lg:
    fontFamily: Space Grotesk
    fontSize: 14px
    fontWeight: '700'
    lineHeight: 18px
    letterSpacing: 0.05em
  label-md:
    fontFamily: Space Grotesk
    fontSize: 12px
    fontWeight: '700'
    lineHeight: 16px
    letterSpacing: 0.06em
  label-sm:
    fontFamily: Space Grotesk
    fontSize: 10px
    fontWeight: '700'
    lineHeight: 12px
    letterSpacing: 0.08em
rounded:
  sm: 0.25rem
  DEFAULT: 0.5rem
  md: 0.75rem
  lg: 1rem
  xl: 1.5rem
  full: 9999px
spacing:
  gutter: 1rem
  gutter-mobile: 0.75rem
  margin: 1.25rem
  margin-mobile: 1rem
  space-xs: 0.25rem
  space-sm: 0.5rem
  space-md: 1rem
  space-lg: 1.5rem
  space-xl: 2rem
---

## Brand & Style
The design system targets curious minds, tech enthusiasts, and students mastering AI concepts through playful, cognitive challenges. It evokes the adrenaline of an arcade combined with the intellectual focus of an advanced neural interface: hyper-rewarding, tactile, focused, and futuristic.

The aesthetic fuses **Cyberpunk Neomorphism** with **Glassmorphism** and high-contrast gamification tokens:
- **Atmospheric Abyss:** Deep midnight canvas layers that let neon accents radiate.
- **Tactile Energy:** Chunky, bevel-edged primary buttons and physical-feeling quest nodes with crisp bottom borders to simulate pushable hardware switches.
- **Luminous Optics:** Translucent frosted overlays, subtle gradient borders, and soft electromagnetic halos that signal streaks, progress, and algorithmic unlocks.

## Colors
The color palette relies on high-luminance neon vectors against an ultra-dark navy void:

- **Canvas & Surfaces:**
  - Background Base: `#0B0F19` (Void Navy)
  - Surface Card (Base): `#111827` (Deep Orbit)
  - Surface Card (Elevated / Highlight): `#1E293B` with 60% opacity for frosted overlays
  - Surface Border / Low-Contrast Grid: `#334155`
- **Core Accents:**
  - **Electric Cyan (`#06B6D4`):** Primary action color, system telemetry, active interactive states.
  - **Neon Violet (`#8B5CF6`):** Secondary pathways, core AI mastery nodes, special challenges.
  - **Electric Amber / Gold (`#F59E0B`):** Streaks, currency (neuro-credits), combo multipliers, flame indicators.
  - **Emerald Green (`#10B981`):** Success states, confirmed correct neural weights, XP gain banners.
  - **Crimson Laser (`#EF4444`):** Error pulses, life deductions, incorrect answer states.
- **Text & Glyphs:**
  - High Contrast (Primary): `#F8FAFC`
  - Medium Contrast (Secondary / Metadata): `#94A3B8`
  - Disabled / Gridlines: `#475569`

## Typography
The system uses **Plus Jakarta Sans** for headlines and standard content to guarantee high legibility for Russian Cyrillic characters with modern, geometric forms. 

For technical parameters, numerical telemetry, XP counts, and badges, the system integrates **Space Grotesk** as the label font to inject a cybernetic, modular character. Russian uppercase strings in `Space Grotesk` should maintain relaxed tracking (`0.05em` to `0.08em`) for arcade-terminal legibility.

## Layout & Spacing
- **Layout Model:** Fluid single-column spine for mobile handheld interaction, expanding into a locked 480px centered viewport on wider screens to preserve intense reachability.
- **Rhythm:** Spacing follows an 8pt base grid with a 4pt sub-grid for micro elements (badges, indicator dots).
- **Navigation Spine:** Progression maps (tree nodes) flow along a central oscillating SVG bezier line, with interactive nodes offset by alternating margins.
- **Bottom Safe-Zone:** Crucial action zones (answer choices, submit switches) maintain a sticky 80px footer offset by `margin-mobile` to ensure thumb reach during rapid-fire quiz sessions.

## Elevation & Depth
Depth is created by layered surfaces, back-glow halos, and 3D pushable button edges rather than blurred black drop-shadows:

- **Level 0 (Canvas):** Pure `#0B0F19` backdrop.
- **Level 1 (Panels & Cards):** `#111827` solid background with a 1px solid perimeter stroke in `rgba(51, 65, 85, 0.6)`.
- **Level 2 (Glass Floating Surfaces):** `rgba(30, 41, 59, 0.7)` backdrop with a `12px` blur and a top-edge highlight border of `rgba(255, 255, 255, 0.12)`.
- **Luminescent Halo (Active States):** Glowing aura behind activated nodes or completed units using `box-shadow: 0 0 24px rgba(6, 182, 212, 0.35)`.
- **Tactile Gamified Shadow:** Action triggers utilize an unblurred, solid drop-edge (`box-shadow: 0 4px 0 #0891B2` for cyan buttons, or `0 4px 0 #0F172A` for card tiers) that translates down `4px` when pressed.

## Shapes
A rounded level of `2` provides a playful yet sophisticated balance:
- **Cards & Sheets:** `1rem` (`rounded-lg`) corner radii keep the viewport sleek and friendly.
- **Badges & Interactive Buttons:** `0.75rem` to `1rem` corner rounding creates a touch-inviting, candy-like tactile feel.
- **Interactive Map Nodes & Avatars:** Fully circular (`rounded-full`) shapes contrast against structural rounded-corner cards.
- **Progress Trackers:** Capsule/pill shapes (`rounded-full`) encasing illuminated interior bars.

## Components

### Buttons (Tactile Neo-Arcade)
- **Primary Action (Cyan):** Surface `#06B6D4`, label `#082F49` (bold `Space Grotesk`), with a solid bottom border simulation via `box-shadow: 0 4px 0 #0891B2`. On `:active`, translateY `4px` with zero shadow.
- **Secondary Action (Violet):** Surface `#8B5CF6`, label `#FFFFFF`, with `box-shadow: 0 4px 0 #6D28D9`.
- **Ghost/Tertiary:** Surface `rgba(30, 41, 59, 0.5)`, 1px border `#334155`, text `#F8FAFC`.

### Quiz Cards & Option Selectors
- Standard card: `#111827` surface, 1px border `#1E293B`, `1rem` radius.
- Selected state: Border turns `#06B6D4`, background tint shifts to `rgba(6, 182, 212, 0.1)`.
- Correct state: Flash to `#10B981` border with a subtle neon radial glow behind the card.
- Incorrect state: Shake micro-animation with `#EF4444` border and fill tint `rgba(239, 68, 68, 0.15)`.

### Gamified Level Nodes (The Neural Map)
- Spherical containers (`64px x 64px`) with dynamic icons (e.g., neural connections, chips, logic gates).
- **Completed:** Emerald glow (`#10B981`), yellow star badge at the bottom-right.
- **Current / In Progress:** Cyan pulse ring (`#06B6D4`) with a bouncing arrow pointer overhead.
- **Locked:** Deep charcoal (`#1E293B`), padlock icon, 0.5 opacity.

### HUD Stats Bar (Streaks, XP & Neuro-Credits)
- Pinned to top safe area: semi-transparent glass panel (`rgba(11, 15, 25, 0.85)` with blur).
- Metric chips:
  - Streak: Flame icon with `#F59E0B` Space Grotesk counter.
  - XP: Lightning icon with `#10B981` value.
  - Energy / Lives: Violet battery or neural icon `#8B5CF6`.

### Glowing Progress Bar
- Height: `12px`, track background `#1E293B` with `rounded-full`.
- Fill: Linear horizontal gradient from `#06B6D4` to `#8B5CF6`, topped with a tiny white specular reflection line at 40% opacity on the upper half for a physical neon-tube effect.