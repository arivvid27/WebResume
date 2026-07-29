---
version: alpha
name: Daniel Santos
description: A restrained dark portfolio system with editorial typography, thin dividers, and a single warm CTA accent.
colors:
  primary: "#FCFCFD"
  secondary: "#A7B0B8"
  tertiary: "#7D8A98"
  neutral: "#171A1C"
  surface: "#212529"
  on-surface: "#FCFCFD"
  error: "#E45A5A"
  border: "#30363D"
  accent: "#E1753E"
typography:
  headline-display:
    fontFamily: "neue-haas-grotesk-display"
    fontSize: "99.2071px"
    fontWeight: 400
    lineHeight: "99.2071px"
    letterSpacing: "-1.98414px"
  headline-lg:
    fontFamily: "neue-haas-grotesk-display"
    fontSize: "65.2679px"
    fontWeight: 400
    lineHeight: "71.7946px"
    letterSpacing: "-0.979018px"
  headline-md:
    fontFamily: "neue-haas-grotesk-display"
    fontSize: "44.3821px"
    fontWeight: 400
    lineHeight: "53.2586px"
    letterSpacing: "-0.221911px"
  headline-sm:
    fontFamily: "neue-haas-grotesk-display"
    fontSize: "29.3705px"
    fontWeight: 400
    lineHeight: "38.1817px"
    letterSpacing: "0.293705px"
  body-lg:
    fontFamily: "neue-haas-grotesk-text"
    fontSize: "18px"
    fontWeight: 400
    lineHeight: "28px"
    letterSpacing: "0px"
  body-md:
    fontFamily: "neue-haas-grotesk-text"
    fontSize: "16px"
    fontWeight: 400
    lineHeight: "24px"
    letterSpacing: "0px"
  body-sm:
    fontFamily: "neue-haas-grotesk-text"
    fontSize: "13.0536px"
    fontWeight: 400
    lineHeight: "18px"
    letterSpacing: "0px"
  label-lg:
    fontFamily: "neue-haas-grotesk-text"
    fontSize: "16px"
    fontWeight: 400
    lineHeight: "24px"
    letterSpacing: "0px"
  label-md:
    fontFamily: "neue-haas-grotesk-text"
    fontSize: "13.0536px"
    fontWeight: 400
    lineHeight: "18px"
    letterSpacing: "0px"
  label-sm:
    fontFamily: "neue-haas-grotesk-text"
    fontSize: "12px"
    fontWeight: 400
    lineHeight: "16px"
    letterSpacing: "0.02em"
  caption:
    fontFamily: "neue-haas-grotesk-text"
    fontSize: "12px"
    fontWeight: 400
    lineHeight: "16px"
    letterSpacing: "0.01em"
rounded:
  none: 0px
  sm: 4px
  md: 8px
  lg: 13.0536px
  xl: 24px
  full: 9999px
spacing:
  xs: 4px
  sm: 14px
  md: 24px
  lg: 40px
  xl: 78px
  gutter: 32px
  margin: 48px
components:
  button-primary:
    backgroundColor: "{colors.surface}"
    textColor: "{colors.on-surface}"
    typography: "{typography.label-md}"
    rounded: "{rounded.full}"
    padding: "5.22143px 5.22143px 5.22143px 18.275px"
    height: "45px"
    width: "184px"
  button-secondary:
    backgroundColor: "{colors.surface}"
    textColor: "{colors.on-surface}"
    typography: "{typography.label-md}"
    rounded: "{rounded.full}"
    padding: "5.22143px 5.22143px 5.22143px 18.275px"
    height: "45px"
    width: "184px"
  button-link:
    backgroundColor: "transparent"
    textColor: "{colors.on-surface}"
    typography: "{typography.label-md}"
    rounded: "{rounded.none}"
    padding: "0px"
  card:
    backgroundColor: "{colors.neutral}"
    textColor: "{colors.on-surface}"
    rounded: "{rounded.lg}"
    padding: "32.6339px"
  input:
    backgroundColor: "{colors.surface}"
    textColor: "{colors.on-surface}"
    typography: "{typography.body-md}"
    rounded: "{rounded.full}"
    padding: "12px 16px"
  chip:
    backgroundColor: "{colors.surface}"
    textColor: "{colors.on-surface}"
    typography: "{typography.label-sm}"
    rounded: "{rounded.full}"
    padding: "4px 10px"
---
# Daniel Santos

## Overview
This is a minimalist dark portfolio system with an editorial, high-end feel. It reads as calm and confident rather than flashy: large typography, thin rules, and one warm accent create a polished personal-brand presence for design clients and collaborators. The layout is spacious and intentional, with clear hierarchy and very little decorative noise.

## Colors
- **Primary (**#FCFCFD**):** The dominant off-white used for major headings, navigation, and primary text on dark backgrounds.
- **Secondary (**#A7B0B8**):** A muted cool gray used for supporting copy and less prominent UI details.
- **Tertiary (#7D8A98):** A deeper slate-gray suitable for subdued emphasis, divider-adjacent text, and secondary hierarchy.
- **Neutral (#171A1C):** The main background color, an almost-black charcoal that establishes the site’s quiet, immersive tone.
- **Surface (#212529):** A slightly lifted dark panel color used for button bodies and other interactive surfaces.
- **On-surface (**#FCFCFD**):** The text color placed on dark surfaces to preserve maximum contrast.
- **Border (#30363D):** A restrained graphite border used for the thin rules around buttons, cards, and section separators.
- **Accent (**#E1753E**):** A warm orange used sparingly for the primary CTA dot/arrow treatment, adding energy without breaking the muted palette.
- **Error (**#E45A5A**):** A reserved alert color that should remain rare and functional, never decorative.

## Typography
The system uses two Neue Haas Grotesk families: `neue-haas-grotesk-display` for headlines and `neue-haas-grotesk-text` for all UI and body copy. Headline styles are light in weight, tightly tracked, and set with large sizes to create a refined editorial rhythm; the largest display treatment is very prominent and slightly compressed vertically. Body and label text stay neutral at 400 weight, with comfortable line-height for readability in dark mode.

Use the headline scale to build hierarchy:
- `headline-display`, `headline-lg`, `headline-md`, and `headline-sm` are for hero statements, section titles, and large brand moments.
- `body-md` and `body-sm` handle paragraph content, metadata, and supporting information.
- `label-md` is the default for nav items and button text, while `label-sm` and `caption` are best for subtle annotations.

Letter spacing is generally neutral, but the largest headings use negative tracking to keep the typography compact and elegant. Small utility text can use slight positive tracking when a quieter, more refined tone is needed.

## Layout
The layout is broad and edge-to-edge, with strong horizontal breathing room rather than a centered boxed container. Sections are separated by thin horizontal dividers instead of heavy cards, so the page feels architectural and calm. Spacing follows a loose but deliberate rhythm: `xs` for micro adjustments, `sm` and `md` for typical UI separation, and `lg`/`xl` for large vertical breathing space in hero compositions.

Use generous side margins, especially in hero areas, and avoid crowding the left edge with secondary content. Interactive areas should maintain clear spacing around them so the typography remains the primary visual structure.

## Elevation & Depth
The design is intentionally flat. Depth is created through contrast, borders, and surface shifts rather than shadows or blur. The background stays on `neutral`, cards and buttons use `surface`, and thin `border` strokes define interactive boundaries without adding visual weight.

Because the system avoids elevation, use layering sparingly and keep attention on typography and spacing. If a component needs emphasis, prefer a warmer accent or slightly lighter surface before introducing shadow.

## Shapes
The shape language is soft and highly rounded at the interactive level, especially for pills and CTAs. The dominant feel is polished and modern, with `rounded.full` used for pill buttons and `rounded.lg` for cards. Smaller utility items can sit between `sm` and `md`, but the overall impression should remain smooth rather than angular.

## Components
**Buttons**
- Primary and secondary buttons are visually similar in this system: dark surface, thin border, white text, and full pill rounding.
- Use `button-primary` for the main call to action and `button-secondary` for less prominent but still important actions.
- Preserve the spacious left padding and compact vertical padding so the button feels horizontal and refined.
- The arrow or icon treatment should sit in a circular accent area when used, with `accent` reserved for emphasis.
- `button-link` is for inline navigation and underlined text links; keep it unboxed and lightweight.

**Cards**
- `card` should remain dark, bordered, and shadowless.
- Use `rounded.lg` and generous internal padding to create a restrained container that feels like part of the page rather than a floating layer.
- Cards should not compete with the hero; they are structural, not decorative.

**Inputs**
- Inputs should follow the same pill geometry as the buttons when used in this system.
- Keep borders thin and colors subdued, with clear focus states driven by contrast rather than shadow.
- Use `body-md` for user-entered text and `label-md` for placeholder/help text if needed.

**Chips and small tags**
- Chips should be compact, pill-shaped, and low-contrast.
- Use them only for metadata, status, or category labels; avoid loud fills or strong outlines.

**Navigation**
- Navigation items are simple text links with no chrome.
- Keep the top bar minimal, aligned horizontally, and separated from content by a fine border line.
- The top-right CTA should use the pill button treatment so it reads as the primary action.

## Do's and Don'ts
- Do keep the interface dark, quiet, and high-contrast.
- Do use large, light-weight display type for the hero and section hierarchy.
- Do rely on thin borders and spacing to define structure instead of shadows.
- Do reserve the warm accent for the most important interactive cue.
- Don't introduce bright or saturated secondary colors that compete with the orange CTA.
- Don't add heavy shadows, gradients, or glass effects.
- Don't make buttons square or overly decorative; keep them pill-shaped and restrained.
- Don't compress spacing so much that the typography loses its open, editorial feel.