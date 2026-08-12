---
version: alpha
name: Roomioo-coworking-hud
description: |
  Roomioo is a coworking booking app for reserving rooms, call tables, meeting spaces, and work spots. It uses a modern operating interface dressed as a 1990s isometric 16-bit management HUD. The shared chrome comes from facility-control panels: squared controls, 1px-2px ink borders, hard offset shadows, compact spacing, crisp focus states, and a small fixed palette of floor, desk, focus, water, and warning colors. Isometric artwork belongs to floor-plan and resource-overview surfaces; menus, forms, dialogs, and navigation stay flat 2D HUD panels for accessibility and speed.

colors:
  background: "#d7caa3"
  foreground: "#1c1b16"
  surface: "#f2dfb1"
  surface-elevated: "#fff0c8"
  primary: "#d66b2d"
  primary-hover: "#e07a38"
  primary-pressed: "#ad4e24"
  primary-foreground: "#fff4d0"
  secondary: "#3f7f67"
  secondary-hover: "#4c9075"
  secondary-pressed: "#2f624f"
  accent: "#4f79a8"
  destructive: "#a33b32"
  destructive-hover: "#bd4a3f"
  destructive-foreground: "#fff4d0"
  muted: "#c8b988"
  muted-foreground: "#51462f"
  border: "#2b261b"
  input: "#8f7d53"
  ring: "#ffe06f"
  selected: "#ffe06f"
  hover: "#f8e7bc"
  disabled: "#9d8f68"
  shade-0: "#fff4d0"
  shade-1: "#f2dfb1"
  shade-2: "#d7caa3"
  shade-3: "#8f7d53"
  shade-4: "#51462f"
  shade-5: "#1c1b16"
  shadow-hard: "#1c1b16"

typography:
  body:
    fontFamily: "Verdana, Geneva, system-ui, sans-serif"
    fontSize: 14px
    fontWeight: 500
    lineHeight: 1.45
    letterSpacing: 0
  heading:
    fontFamily: "Verdana, Geneva, system-ui, sans-serif"
    fontSize: 20px
    fontWeight: 800
    lineHeight: 1.2
    letterSpacing: 0
  label:
    fontFamily: "Verdana, Geneva, system-ui, sans-serif"
    fontSize: 12px
    fontWeight: 800
    lineHeight: 1.2
    letterSpacing: 0

rounded:
  none: 0px
  sm: 2px
  md: 3px
  full: 0px

spacing:
  xs: 4px
  sm: 8px
  md: 12px
  lg: 16px
  xl: 24px

components:
  button-primary:
    backgroundColor: "{colors.primary}"
    textColor: "{colors.primary-foreground}"
    border: "2px solid {colors.border}"
    shadow: "2px 2px 0 {colors.shadow-hard}"
    rounded: "{rounded.sm}"
    height: 40px
    padding: 8px 14px
  button-primary-hover:
    backgroundColor: "{colors.primary-hover}"
  button-primary-pressed:
    backgroundColor: "{colors.primary-pressed}"
    transform: "translate(2px, 2px)"
    shadow: "0 0 0 {colors.shadow-hard}"
  button-secondary:
    backgroundColor: "{colors.secondary}"
    textColor: "{colors.primary-foreground}"
    border: "2px solid {colors.border}"
    shadow: "2px 2px 0 {colors.shadow-hard}"
  button-outline:
    backgroundColor: "{colors.surface-elevated}"
    textColor: "{colors.foreground}"
    border: "2px solid {colors.border}"
    shadow: "2px 2px 0 {colors.shadow-hard}"
  button-disabled:
    backgroundColor: "{colors.disabled}"
    textColor: "{colors.muted-foreground}"
    border: "2px solid {colors.border}"
    shadow: "none"
  panel:
    backgroundColor: "{colors.surface-elevated}"
    textColor: "{colors.foreground}"
    border: "2px solid {colors.border}"
    shadow: "4px 4px 0 {colors.shadow-hard}"
    rounded: "{rounded.md}"
    padding: 24px
  input:
    backgroundColor: "{colors.shade-0}"
    textColor: "{colors.foreground}"
    border: "2px solid {colors.border}"
    shadow: "inset 2px 2px 0 {colors.muted}"
    rounded: "{rounded.sm}"
    height: 40px
  input-focused:
    border: "2px solid {colors.selected}"
    outline: "2px solid {colors.border}"
  tabs-list:
    backgroundColor: "{colors.muted}"
    border: "2px solid {colors.border}"
    rounded: "{rounded.sm}"
  tab-active:
    backgroundColor: "{colors.selected}"
    textColor: "{colors.foreground}"
    shadow: "2px 2px 0 {colors.shadow-hard}"
  dialog:
    backgroundColor: "{colors.surface-elevated}"
    border: "2px solid {colors.border}"
    shadow: "6px 6px 0 {colors.shadow-hard}"
  popover:
    backgroundColor: "{colors.surface-elevated}"
    border: "2px solid {colors.border}"
    shadow: "4px 4px 0 {colors.shadow-hard}"
  badge:
    backgroundColor: "{colors.accent}"
    textColor: "{colors.primary-foreground}"
    border: "1px solid {colors.border}"
  hud-control:
    backgroundColor: "{colors.surface}"
    border: "2px solid {colors.border}"
    shadow: "2px 2px 0 {colors.shadow-hard}"
---

## Overview

Roomioo's app chrome should feel like the control panel for a compact 16-bit isometric coworking management game: floor-tile colors, crisp rectangular components, hard edges, and clear state changes. The UI must not become a novelty skin. Text-heavy flows use flat HUD panels, while isometric assets are reserved for larger floor-plan, resource-overview, and decorative empty-state compositions.

## Core Rules

- Use a small fixed palette with hard shade steps. Do not use gradients, glass, blur, translucent overlays, or soft SaaS shadows.
- Keep controls rectangular with `0px` to `3px` radius, `1px-2px` borders, and hard offset shadows.
- Use pressed movement on clickable controls: translate `2px 2px` and remove the offset shadow.
- Keep text readable in 2D panels. Isometric projection is for floor-plan and resource assets, not forms, dialogs, menus, or dense booking schedules.
- Lighting comes from upper-left. Hard shadows fall down/right.
- Respect keyboard focus with a high-contrast yellow ring plus ink outline.
- Respect `prefers-reduced-motion`; any movement must be short, direct, and non-essential.

## Components

Buttons use bold HUD styling with strong borders and hard shadows. Primary actions use desk orange, secondary actions use focus green, outline actions use light floor surface, destructive actions use warning red. Disabled buttons keep the border but lose movement and shadow.

Cards, dialogs, popovers, and dropdowns are panels: light floor-surface fill, dark border, and down-right hard shadow. Avoid nested panels unless a modal contains form fields.

Inputs and selects use inset field wells so forms stay legible. Validation errors use destructive red borders and retain the readable light fill.

Tabs and navigation read as HUD mode selectors: inactive states sit on muted floor/stone, active states use selected yellow with a hard shadow.

Badges are compact resource labels. They may use accent blue, focus green, desk orange, or warning red, but should remain small and functional.

## Responsive Behavior

Desktop can show wide HUD rows and multi-column panels. Tablet and phone layouts collapse controls into single-column stacks, keep 40px minimum touch targets, and never scale text below the body token. HUD bars wrap or stack before text overlaps.

## Asset Rules

Pixel/isometric assets should snap to an 8px grid, use crisp edges, avoid CSS stretching, and share upper-left lighting. Directional coworking floor, table, room, wall, and desk pieces need distinct left/right/corner/end-cap assets rather than mirrored or stretched sprites when the shape would read incorrectly.

## Storybook

Storybook is the visual checkpoint for reusable components. Foundational components should show default, hover/selected when representable, disabled, long-text, form, dialog/popover, and compact mobile-like states before the language is applied broadly to app screens.
