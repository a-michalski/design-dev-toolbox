# Design Tokens Implementation Template for Figma Make Projects

This template provides a complete guide for implementing a Design Tokens system in Figma Make projects, following the W3C Design Tokens Format specification.

## Table of Contents

- [Prompt for New Projects](#prompt-for-new-projects)
- [Naming Convention Rules](#naming-convention-rules)
- [File Templates](#file-templates)
- [Decision Tree](#decision-tree)
- [Implementation Checklist](#implementation-checklist)
- [Color Mapping Examples](#color-mapping-examples)
- [Quick Start Command](#quick-start-command)

---

## Prompt for New Projects

Use this prompt when starting a new Figma Make project:

```markdown
Design Tokens Implementation Request

Implement a Design Tokens system in this Figma Make project following W3C Design Tokens Format.

Requirements:

1. File Structure:
   /design-tokens/tokens.json - W3C compliant specification (documentation)
   /styles/globals.css - CSS custom properties (implementation)

2. Token Architecture (2 layers):
   Primitive Layer (palette):
   - Raw color values (hex codes)
   - Naming: --palette-{theme}-{color} (e.g., --palette-brand-blue)

   Semantic Layer (semantic):
   - Meaning-based aliases that reference palette
   - Categories: brand, bg, text, border, ui
   - Naming: --{category}-{variant} (e.g., --brand-primary, --bg-main)

3. tokens.json format:
```json
{
  "color": {
    "palette": {
      "{theme-name}": {
        "{color-name}": {
          "$type": "color",
          "$value": "#HEXCODE",
          "$description": "Description of usage"
        }
      }
    },
    "semantic": {
      "{category}": {
        "{variant}": {
          "$type": "color",
          "$value": "{color.palette.{theme}.{color}}",
          "$description": "Semantic meaning"
        }
      }
    }
  }
}
```

4. globals.css format:
```css
:root {
  /* === PALETTE: {Theme Name} === */
  --palette-{theme}-{color}: #HEXCODE;

  /* === SEMANTIC: {Category} === */
  --{category}-{variant}: var(--palette-{theme}-{color});
}
```

5. Guidelines.md section:
   Add a "Design Tokens System" section with:
   - Token structure explanation
   - Usage examples (DO / DON'T)
   - How to change themes
   - Reference to tokens.json

Color Palette for this project:
[PASTE YOUR COLOR PALETTE HERE]

Current hardcoded colors to migrate:
[LIST OF HEX CODES CURRENTLY USED IN PROJECT]

Deliverables:
- Create /design-tokens/tokens.json
- Update /styles/globals.css with token system
- Update Guidelines.md with Design Tokens section
- Convert [NUMBER] existing components to use tokens
- Provide migration guide for remaining components
```

---

## Naming Convention Rules

### Primitive Tokens (Palette)

**Pattern:** `--palette-{theme}-{color}`

**Examples:**
```css
--palette-brand-blue
--palette-brand-navy
--palette-brand-gold
--palette-neutral-gray-100
--palette-neutral-gray-900
--palette-accent-pink
--palette-accent-green
```

**Rules:**
- Use descriptive color names (not `color-1`, `color-2`)
- Include theme/context (`brand`, `neutral`, `accent`)
- Use variations: `-light`, `-dark`, `-100`, `-900`
- No semantic meaning (not `--palette-error-red`)

### Semantic Tokens (Aliases)

**Categories:**
```
--brand-{variant}          (primary, secondary, accent)
--bg-{variant}             (main, card, subtle, hover)
--text-{variant}           (primary, secondary, muted, inverse)
--border-{variant}         (default, accent, subtle, focus)
--ui-{state}-{variant}     (success, warning, error, info)
```

**Examples:**
```css
/* Brand */
--brand-primary: var(--palette-brand-gold);
--brand-secondary: var(--palette-brand-blue);

/* Backgrounds */
--bg-main: var(--palette-brand-navy);
--bg-card: var(--palette-neutral-gray-900);
--bg-hover: var(--palette-neutral-gray-800);

/* Text */
--text-primary: #FFFFFF;
--text-secondary: var(--palette-neutral-gray-300);
--text-muted: var(--palette-neutral-gray-500);

/* Borders */
--border-default: var(--palette-neutral-gray-700);
--border-accent: var(--palette-brand-gold);

/* UI States */
--ui-success-bg: var(--palette-accent-green);
--ui-error-text: var(--palette-accent-red);
```

---

## File Templates

### Template: tokens.json

```json
{
  "$schema": "https://design-tokens.github.io/community-group/format.json",
  "color": {
    "palette": {
      "brand": {
        "primary": {
          "$type": "color",
          "$value": "#YOUR_COLOR",
          "$description": "Main brand color"
        },
        "secondary": {
          "$type": "color",
          "$value": "#YOUR_COLOR",
          "$description": "Secondary brand color"
        }
      },
      "neutral": {
        "white": {
          "$type": "color",
          "$value": "#FFFFFF",
          "$description": "Pure white"
        },
        "black": {
          "$type": "color",
          "$value": "#000000",
          "$description": "Pure black"
        },
        "gray": {
          "100": { "$type": "color", "$value": "#F7F7F7" },
          "500": { "$type": "color", "$value": "#6B7280" },
          "900": { "$type": "color", "$value": "#111827" }
        }
      },
      "accent": {
        "success": { "$type": "color", "$value": "#10B981" },
        "warning": { "$type": "color", "$value": "#F59E0B" },
        "error": { "$type": "color", "$value": "#EF4444" },
        "info": { "$type": "color", "$value": "#3B82F6" }
      }
    },
    "semantic": {
      "brand": {
        "primary": {
          "$type": "color",
          "$value": "{color.palette.brand.primary}",
          "$description": "Primary CTA, links, highlights"
        },
        "secondary": {
          "$type": "color",
          "$value": "{color.palette.brand.secondary}",
          "$description": "Secondary actions, less prominent elements"
        }
      },
      "background": {
        "main": {
          "$type": "color",
          "$value": "{color.palette.neutral.gray.900}",
          "$description": "Main application background"
        },
        "card": {
          "$type": "color",
          "$value": "{color.palette.neutral.gray.800}",
          "$description": "Card/panel backgrounds"
        }
      },
      "text": {
        "primary": {
          "$type": "color",
          "$value": "{color.palette.neutral.white}",
          "$description": "Primary text color"
        },
        "muted": {
          "$type": "color",
          "$value": "{color.palette.neutral.gray.500}",
          "$description": "Less important text"
        }
      },
      "ui": {
        "success": {
          "$type": "color",
          "$value": "{color.palette.accent.success}",
          "$description": "Success states, confirmations"
        },
        "error": {
          "$type": "color",
          "$value": "{color.palette.accent.error}",
          "$description": "Error states, destructive actions"
        }
      }
    }
  }
}
```

### Template: globals.css Section

```css
/* ==========================================
   DESIGN TOKENS
   Based on /design-tokens/tokens.json
   W3C Design Tokens Format
   ========================================== */

:root {
  /* ===================================
     PALETTE (Primitive Tokens)
     Raw color values
     =================================== */

  /* Brand Colors */
  --palette-brand-primary: #YOUR_COLOR;
  --palette-brand-secondary: #YOUR_COLOR;

  /* Neutral Colors */
  --palette-neutral-white: #FFFFFF;
  --palette-neutral-black: #000000;
  --palette-neutral-gray-100: #F7F7F7;
  --palette-neutral-gray-500: #6B7280;
  --palette-neutral-gray-900: #111827;

  /* Accent Colors */
  --palette-accent-success: #10B981;
  --palette-accent-warning: #F59E0B;
  --palette-accent-error: #EF4444;
  --palette-accent-info: #3B82F6;

  /* ===================================
     SEMANTIC TOKENS (Alias Tokens)
     Meaning-based references
     =================================== */

  /* Brand */
  --brand-primary: var(--palette-brand-primary);
  --brand-secondary: var(--palette-brand-secondary);

  /* Backgrounds */
  --bg-main: var(--palette-neutral-gray-900);
  --bg-card: var(--palette-neutral-gray-800);
  --bg-subtle: var(--palette-neutral-gray-700);
  --bg-hover: var(--palette-neutral-gray-600);

  /* Text */
  --text-primary: var(--palette-neutral-white);
  --text-secondary: var(--palette-neutral-gray-300);
  --text-muted: var(--palette-neutral-gray-500);
  --text-inverse: var(--palette-neutral-black);

  /* Borders */
  --border-default: var(--palette-neutral-gray-700);
  --border-accent: var(--palette-brand-primary);
  --border-subtle: var(--palette-neutral-gray-800);
  --border-focus: var(--palette-brand-secondary);

  /* UI States */
  --ui-success: var(--palette-accent-success);
  --ui-warning: var(--palette-accent-warning);
  --ui-error: var(--palette-accent-error);
  --ui-info: var(--palette-accent-info);
}

/* ===================================
   THEME VARIANTS (Optional)
   =================================== */

[data-theme="light"] {
  --bg-main: var(--palette-neutral-white);
  --bg-card: var(--palette-neutral-gray-100);
  --text-primary: var(--palette-neutral-black);
}

[data-theme="ocean"] {
  --brand-primary: #31BFC7;
  --bg-main: #0A2540;
}
```

### Template: Guidelines.md Section

```markdown
## Design Tokens System

This project uses W3C Design Tokens Format with a two-layer architecture for maintainable theming.

### Architecture

**Primitive Layer (--palette-*):**
- Raw color values (hex codes)
- Single source of truth for all colors
- Located in: /design-tokens/tokens.json (spec) + /styles/globals.css (implementation)

**Semantic Layer (--brand-, --bg-, etc.):**
- Meaning-based aliases that reference primitive tokens
- Used directly in components
- Easy to change entire theme by updating references

### Token Categories

| Category | Purpose | Examples |
|----------|---------|----------|
| --brand-* | Brand identity colors | --brand-primary, --brand-secondary |
| --bg-* | Background colors | --bg-main, --bg-card, --bg-hover |
| --text-* | Text colors | --text-primary, --text-muted |
| --border-* | Border colors | --border-default, --border-accent |
| --ui-* | UI state colors | --ui-success, --ui-error |

### Usage in Components

**DO: Use semantic tokens**
```tsx
// React inline styles
<div style={{ backgroundColor: 'var(--bg-main)' }}>

// Tailwind arbitrary values
<Badge className="bg-[var(--brand-primary)] text-[var(--text-primary)]">

// Motion animations
<motion.div style={{ borderColor: 'var(--border-accent)' }}>
```

**DON'T: Use hardcoded hex values**
```tsx
// BAD - hardcoded
<div style={{ backgroundColor: '#2D2855' }}>
<Badge className="bg-[#FEBE42]">
```

**DON'T: Use palette tokens directly (unless specific need)**
```tsx
// BAD - bypasses semantic layer
<div style={{ backgroundColor: 'var(--palette-brand-navy)' }}>

// GOOD - use semantic token instead
<div style={{ backgroundColor: 'var(--bg-main)' }}>
```

### Changing Theme

**Step 1:** Edit /design-tokens/tokens.json (source of truth)
```json
"primary": {
  "$value": "{color.palette.ocean.blue}"  // Change reference
}
```

**Step 2:** Update /styles/globals.css to match
```css
--brand-primary: var(--palette-ocean-blue);  /* Update value */
```

**Result:** All components using var(--brand-primary) update automatically!

### Adding New Theme

Create a theme variant using data-theme attribute:

```css
/* globals.css */
[data-theme="dark"] {
  --bg-main: #000000;
  --text-primary: #FFFFFF;
}

[data-theme="ocean"] {
  --brand-primary: #31BFC7;
  --bg-main: #0A2540;
}
```

Switch theme in JavaScript:
```tsx
document.documentElement.dataset.theme = 'ocean';
```

### Migration Guide

When converting existing components:

1. **Find hardcoded colors:** Search for # in component files
2. **Identify purpose:** Is it a background? Text? Border?
3. **Replace with semantic token:**
   - #2D2855 (purple bg) → var(--bg-main)
   - #D4A574 (gold accent) → var(--brand-primary)
   - #FFFFFF (white text) → var(--text-primary)
4. **Test visually:** Ensure no regressions

### Resources

- Specification: /design-tokens/tokens.json
- Implementation: /styles/globals.css
- W3C Format: https://design-tokens.github.io/community-group/format.html
```

---

## Decision Tree

Use this flowchart when choosing token names:

```
Is it a raw color value?
├─ YES → Use palette token (--palette-{theme}-{color})
└─ NO → Is it used in components?
    └─ YES → What's its purpose?
        ├─ Main brand color → --brand-primary
        ├─ Background → --bg-{variant}
        ├─ Text → --text-{variant}
        ├─ Border → --border-{variant}
        └─ UI state → --ui-{state}
```

---

## Implementation Checklist

Use this checklist for new projects:

- [ ] Identify all colors in project (search for `#`)
- [ ] Group colors into: brand, neutral, accent
- [ ] Create `/design-tokens/tokens.json` with W3C structure
- [ ] Add palette tokens to `/styles/globals.css`
- [ ] Add semantic tokens to `/styles/globals.css`
- [ ] Update `Guidelines.md` with Design Tokens section
- [ ] Convert 2-3 components as examples
- [ ] Test visually (no regressions)
- [ ] Document special cases (if any)

---

## Color Mapping Examples

Example mappings from hardcoded colors to semantic tokens:

```
Hardcoded         → Semantic Token
─────────────────────────────────────────
#2D2855 (purple)  → var(--bg-main)
#D4A574 (gold)    → var(--brand-primary)
#F5C57C (yellow)  → var(--brand-secondary)
#FFFFFF (white)   → var(--text-primary)
#5D5A88 (lavender)→ var(--border-default)
#10B981 (green)   → var(--ui-success)
#EF4444 (red)     → var(--ui-error)
```

---

## Quick Start Command

Copy and paste this into a new Figma Make project:

```
Implement Design Tokens System:
- Create /design-tokens/tokens.json (W3C format)
- Update /styles/globals.css with --palette- and --brand-, --bg-, --text- tokens
- Add "Design Tokens System" section to Guidelines.md
- Convert these components: [LIST YOUR COMPONENTS]

Color palette:
- Primary: #YOUR_COLOR
- Secondary: #YOUR_COLOR
- Background: #YOUR_COLOR

Use naming: --palette-{theme}-{color} and --{category}-{variant}
```

---

## Usage

This template is part of the [Design Dev Toolbox](https://github.com/a-michalski/design-dev-toolbox) for Figma Make projects. It provides a standardized approach to implementing maintainable, scalable design tokens following industry best practices.

For more information about Figma Make and related tools, see the main repository README.
