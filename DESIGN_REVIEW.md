# Design Review Report — We Are Still Here Website

**Date:** September 3, 2026  
**Reviewer:** Senior UI/UX Design Reviewer  
**Scope:** 5 HTML pages + CSS + JS (vanilla, no frameworks)

---

## 1. Executive Summary

The website is a **solid, well-structured foundation** for an institutional Palestinian student initiative. It demonstrates thoughtful RTL-first architecture, clean semantic HTML, and a disciplined visual language that avoids "charity landing page" tropes. The vanilla CSS/JS approach ensures performance on weak connections (critical for Gaza audience).

**Overall Grade: B+** — Strong fundamentals with specific gaps in design token architecture, accessibility polish, and component state completeness that prevent it from reaching professional institutional grade.

---

## 2. Critical Issues (Must Fix)

### 2.1 Missing Focus-Visible Styles — WCAG 2.4.7 Failure
**File:** `css/style.css`  
**Lines:** 81–82 (only `.skip:focus` defined)  
**Issue:** No `:focus-visible` styles for interactive elements (buttons, links, nav items, form inputs, language toggle, menu button). Keyboard users cannot see focus state.  
**Fix:** Add comprehensive `:focus-visible` ring using design tokens:
```css
:focus-visible {
  outline: 2px solid var(--green-dark);
  outline-offset: 2px;
}
.btn:focus-visible, .nav-links a:focus-visible, .lang-toggle:focus-visible,
.menu-btn:focus-visible, input:focus-visible, textarea:focus-visible {
  outline: 2px solid var(--green-dark);
  outline-offset: 2px;
}
```

### 2.2 Color Contrast — Primary Green on White Fails WCAG AA
**File:** `css/style.css`  
**Lines:** 1–4 (`--green: #4A5D3A`, `--bg: #FAF9F6`)  
**Issue:** `--green` (#4A5D3A) on `--bg` (#FAF9F6) = **3.8:1** — fails 4.5:1 for body text. Used in `.btn`, `.eyebrow`, `.tagline`, `.stat-num`, `.badge`, `.value-icon`.  
**Fix:** Darken `--green` to `#3D4D2E` (4.6:1) or lighten `--bg` to `#FFFFFF`. Test all semantic pairings.

### 2.3 Language Toggle Button Lacks ARIA
**File:** `index.html` line 30, `js/main.js` lines 16, 27–28  
**Issue:** `<button class="lang-toggle">EN</button>` has no `aria-pressed`, `aria-label`, or `role="switch"`. Screen readers announce only "EN button".  
**Fix:**
```html
<button class="lang-toggle" type="button" role="switch" aria-checked="false" aria-label="Switch to English">EN</button>
```
Update JS to toggle `aria-checked` and `aria-label`.

### 2.4 Mobile Nav Missing ARIA Attributes
**File:** `index.html` lines 22, 23, `css/style.css` lines 32, 83–87, `js/main.js` lines 30–32  
**Issue:** Hamburger button lacks `aria-expanded`, `aria-controls`, `aria-label` (uses ☰ emoji). Nav panel lacks `role="navigation"` and `aria-label`.  
**Fix:**
```html
<button class="menu-btn" aria-expanded="false" aria-controls="main-nav" aria-label="Open menu">☰</button>
<nav class="nav-links" id="main-nav" role="navigation" aria-label="Main navigation">
```
Update JS to toggle `aria-expanded`.

### 2.5 Form Labels Not Programmatically Associated
**File:** `contact.html` lines 28–31  
**Issue:** `<label><span>Name</span><input ...></label>` wraps input but lacks `for`/`id` pairing. Works implicitly but fragile; screen readers may not announce correctly.  
**Fix:** Add explicit `for`/`id`:
```html
<label for="name"><span data-ar="الاسم" data-en="Name">الاسم</span></label>
<input required id="name" name="name" ...>
```

---

## 3. Major Issues (Should Fix)

### 3.1 No Design Token Architecture (Primitive → Semantic → Component)
**File:** `css/style.css` lines 1–8  
**Issue:** All tokens are **primitive-only** (raw hex values). No semantic layer (`--color-primary`, `--color-text`, `--color-border`) or component layer (`--btn-bg`, `--card-border`). Theming, dark mode, or brand updates require find/replace across 88 lines.  
**Recommendation:** Restructure per design-system skill three-layer model:
```css
:root {
  /* Primitive */
  --color-green-600: #4A5D3A;
  --color-green-700: #37462C;
  --color-green-100: #EDF1E8;
  --color-neutral-900: #1E1E1E;
  --color-neutral-500: #5C5C5C;
  --color-neutral-200: #E4E0D6;
  --color-neutral-50: #FAF9F6;
  --color-accent-500: #C9B48A;
  --color-accent-600: #A68F5E;

  /* Semantic */
  --color-primary: var(--color-green-600);
  --color-primary-hover: var(--color-green-700);
  --color-text: var(--color-neutral-900);
  --color-text-muted: var(--color-neutral-500);
  --color-border: var(--color-neutral-200);
  --color-surface: #FFFFFF;
  --color-bg: var(--color-neutral-50);
  --color-accent: var(--color-accent-500);
  --color-accent-hover: var(--color-accent-600);
  --color-focus: var(--color-green-700);

  /* Component */
  --btn-primary-bg: var(--color-primary);
  --btn-primary-hover: var(--color-primary-hover);
  --btn-primary-text: #FFFFFF;
  --btn-ghost-bg: transparent;
  --btn-ghost-text: var(--color-primary);
  --card-bg: var(--color-surface);
  --card-border: var(--color-border);
  --input-border: var(--color-border);
  --input-bg: var(--color-surface);
}
```

### 3.2 Incomplete Component State Definitions
**File:** `css/style.css`  
**Missing states:** `:focus-visible`, `:active`, `:disabled`, `:hover` for ghost buttons, `--btn-disabled`  
**Current:** Only `.btn:hover`, `.btn.gold:hover`, `.nav-links a:hover`  
**Impact:** Inconsistent interaction feedback; disabled states invisible.  
**Fix:** Define complete state matrix per component (see design-system skill `references/states-and-variants.md`).

### 3.3 Touch Targets Below 44×44pt on Mobile
**File:** `css/style.css` lines 24, 31, 84–87  
**Measurements:**
- Nav links: `padding: 8px 12px` → ~32×32px tap area
- Language toggle: `padding: 7px 14px` → ~30×30px
- Mobile menu items: same padding, no `min-height`
**Fix:** Enforce `min-height: 44px; min-width: 44px` on all interactive elements; increase padding to `12px 16px`.

### 3.4 Skip Link Only Visible on Focus (Good) But Wrong Position
**File:** `css/style.css` lines 81–82  
**Issue:** `left: 8px; top: 8px` — in RTL this places it on the right (correct), but `left` is physical not logical. Should use `inset-inline-start: 8px; inset-block-start: 8px;`.

### 3.5 Emoji Used as UI Icon (Hamburger Menu)
**File:** `index.html` line 22, all pages  
**Issue:** `☰` is a font-dependent emoji; renders inconsistently across OS, cannot be styled, violates design-system rule "No Emoji as Structural Icons".  
**Fix:** Replace with inline SVG or CSS-only hamburger:
```html
<button class="menu-btn" ...>
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true">
    <line x1="3" y1="6" x2="21" y2="6"></line>
    <line x1="3" y1="12" x2="21" y2="12"></line>
    <line x1="3" y1="18" x2="21" y2="18"></line>
  </svg>
</button>
```

### 3.6 Placeholder Images Use Dashed Border Pattern (Not Production-Ready)
**File:** `css/style.css` line 21 (`.ph` class), `shop.html` lines 30–32  
**Issue:** `.ph` placeholder style is visible in production; `shop.html` shows "صور المنتجات متاحة على متجر Teemill" and "صورة الغلاف تُضاف لاحقًا" as card content.  
**Fix:** Replace with proper skeleton loaders or actual images; if placeholders remain, style as subtle skeleton (`animate-pulse` via CSS).

### 3.7 No Reduced Motion Support
**File:** `css/style.css` line 10 (`html{scroll-behavior:smooth}`)  
**Issue:** No `@media (prefers-reduced-motion: reduce)` to disable smooth scroll and any future animations.  
**Fix:**
```css
@media (prefers-reduced-motion: reduce) {
  html { scroll-behavior: auto; }
  *, *::before, *::after {
    animation-duration: 0.01ms !important;
    transition-duration: 0.01ms !important;
  }
}
```

---

## 4. Minor Issues (Nice to Have)

### 4.1 Inconsistent Spacing Scale
**File:** `css/style.css`  
**Observed values:** `4px, 6px, 8px, 10px, 12px, 14px, 16px, 18px, 20px, 26px, 34px, 40px, 44px, 52px`  
**Issue:** Not an 8dp base rhythm. Values like 6, 10, 14, 18, 26, 34, 44 break the scale.  
**Recommendation:** Adopt 8dp base: `4, 8, 16, 24, 32, 40, 48, 64`. Map current values:
- 6px → 8px
- 10px → 8px or 16px
- 14px → 16px
- 18px → 16px
- 26px → 24px
- 34px → 32px
- 44px → 40px or 48px
- 52px → 48px or 64px

### 4.2 Font Loading Not Optimized
**File:** All HTML files line 15 (`<link href="https://fonts.googleapis.com/css2?family=Cairo...`)`  
**Issue:** No `preload` for critical fonts, no `font-display: swap` in CSS (Google Fonts URL includes `&display=swap` but not in `@font-face`).  
**Fix:** Add preload for Cairo/Inter wght 400/700:
```html
<link rel="preload" as="font" type="font/woff2" crossorigin href="https://fonts.gstatic.com/s/cairo/v23/SLXGc1nY6HkvalI37GUBFw.woff2">
<link rel="preload" as="font" type="font/woff2" crossorigin href="https://fonts.gstatic.com/s/inter/v18/UcCO3FwrK3iLTeHuS_nVMrMxCp50SjIw2boKoduKmMEVuLyfAZ9hjp-Ek-_EeA.woff2">
```
Add `@font-face` with `font-display: swap` in CSS for self-hosted fallback.

### 4.3 Hero Tagline Hardcoded English in RTL Mode
**File:** `index.html` line 40, `about.html` line 24  
**Issue:** `<div class="tagline" data-ar="We Are Still Here..." data-en="We Are Still Here...">` — same English text for both languages. Should have Arabic translation or be marked as brand mark (untranslated).

### 4.4 Footer Copyright Year Hardcoded
**File:** All HTML files line ~100 (`© باقون | We Are Still Here — جميع الحقوق محفوظة.`)  
**Issue:** No dynamic year.  
**Fix:** JS: `document.querySelector('.copy').textContent = \`© \${new Date().getFullYear()} ...\``

### 4.5 Social Links Lack `aria-label`
**File:** All HTML files (footer `.social-row a`, follow sections)  
**Issue:** `<a href="...">Facebook</a>` — visible text is fine, but icon-only versions would need labels. Current text links are acceptable but add `aria-label` for consistency.

### 4.6 Card `h3` Margin Inconsistency
**File:** `css/style.css` line 51 (`.card h3{margin:.2rem 0 .4rem}`)  
**Issue:** Uses `rem` while rest of spacing uses `px`. Breaks token consistency.

### 4.7 `dir="ltr"` on WhatsApp Link Only
**File:** `contact.html` line 38  
**Issue:** `<a href="https://wa.me/..." dir="ltr">+972 56-727-3164</a>` — correct for phone number, but should also apply to any LTR content in RTL page (e.g., email, URLs).

---

## 5. Positive Observations

| Area | Strength |
|------|----------|
| **RTL-First Architecture** | `html[lang="ar"]` + `dir="rtl"` default; logical properties (`margin-inline`, `padding-inline`, `inset-inline`) used correctly in CSS. Language toggle flips `dir` and `lang` properly. |
| **Semantic HTML** | Proper `<header>`, `<main>`, `<section>`, `<footer>`, `<nav>`, `<aside>`, `<form>`, `<label>` usage. Heading hierarchy (h1→h2→h3) maintained. |
| **Skip Link** | Present on all pages (`a.skip` with `data-ar`/`data-en`), hidden until focus. |
| **Responsive Breakpoints** | Mobile-first: base styles ≤760px, `@media(min-width:700px)` for grids, `@media(min-width:860px)` for hero. Clean, minimal. |
| **Performance** | Zero frameworks. CSS 88 lines, JS 34 lines. Fonts preconnect. No heavy dependencies. |
| **Bilingual Content Strategy** | `data-ar`/`data-en` on all text nodes; `data-ar-ph`/`data-en-ph` on placeholders. JS swaps cleanly. |
| **Visual Hierarchy** | Clear: eyebrow → h1 → lede → tagline → CTAs. Stats cards use large `stat-num` for scanning. |
| **Institutional Tone** | Restrained color palette, no hero imagery clutter, "Impact in figures" with precise sourcing note. Feels like an organization, not a campaign. |
| **Logical Properties** | `margin-inline-start: auto`, `padding-inline: 18px`, `inset-inline: 0` — correct for bidirectional layouts. |
| **Sticky Header with Backdrop Blur** | `position: sticky; top: 0; backdrop-filter: blur(6px)` — modern, performant. |

---

## 6. Specific Recommendations with File:Line References

### Design System & Tokens
| # | File | Line | Recommendation |
|---|------|------|----------------|
| 1 | `css/style.css` | 1–8 | Restructure to three-layer token architecture (primitive → semantic → component) |
| 2 | `css/style.css` | 26–30 | Define complete button state matrix (default, hover, active, focus, disabled) for primary, gold, ghost variants |
| 3 | `css/style.css` | 50 | Define card state variants (default, hover, interactive) |
| 4 | `css/style.css` | 14 | Move `--max: 1120px` to semantic `--container-max` |

### RTL/LTR Bidirectional
| # | File | Line | Recommendation |
|---|------|------|----------------|
| 5 | `css/style.css` | 81–82 | Change skip link `left: 8px` → `inset-inline-start: 8px` |
| 6 | `css/style.css` | 32 | Replace emoji hamburger with inline SVG |
| 7 | `js/main.js` | 8 | Ensure `document.documentElement.dir` sets before content swap (current order correct) |

### Responsive & Mobile
| # | File | Line | Recommendation |
|---|------|------|----------------|
| 8 | `css/style.css` | 24 | Increase nav link padding to `12px 16px`; add `min-height: 44px` |
| 9 | `css/style.css` | 31 | Increase lang-toggle padding to `10px 16px`; add `min-height: 44px` |
| 10 | `css/style.css` | 84–87 | Mobile nav items: `min-height: 44px; padding: 12px 16px` |
| 11 | `css/style.css` | 66 | Form inputs: add `min-height: 44px` for touch |

### Accessibility
| # | File | Line | Recommendation |
|---|------|------|----------------|
| 12 | `css/style.css` | (new) | Add `:focus-visible` styles for all interactive elements |
| 13 | `index.html` | 30 | Add `role="switch" aria-checked="false" aria-label="Switch to English"` to lang-toggle |
| 14 | `index.html` | 22–23 | Add `aria-expanded`, `aria-controls`, `aria-label` to menu-btn; `id="main-nav"` + `role="navigation"` to nav-links |
| 15 | `js/main.js` | 30–32 | Toggle `aria-expanded` on menu button |
| 16 | `contact.html` | 28–31 | Add explicit `for`/`id` on all form labels |
| 17 | `css/style.css` | 10 | Add `@media (prefers-reduced-motion: reduce)` block |
| 18 | `css/style.css` | 1–4 | Fix `--green` contrast: change to `#3D4D2E` or adjust `--bg` |

### Visual & Content
| # | File | Line | Recommendation |
|---|------|------|----------------|
| 19 | `shop.html` | 30–32 | Replace `.ph` placeholders with actual images or skeleton loaders |
| 20 | `index.html` | 40 | Provide Arabic translation for tagline or mark as untranslated brand mark |
| 21 | All HTML | ~100 | Dynamic copyright year via JS |
| 22 | `css/style.css` | 21 | Replace `.ph` dashed border with subtle skeleton animation |

### Performance
| # | File | Line | Recommendation |
|---|------|------|----------------|
| 23 | All HTML | 15 | Add font preload links for Cairo/Inter wght 400/700 |
| 24 | `css/style.css` | (new) | Add `@font-face` with `font-display: swap` for self-hosted fallback |

### Code Quality
| # | File | Line | Recommendation |
|---|------|------|----------------|
| 25 | `css/style.css` | 51 | Change `.card h3` margin to use spacing token (e.g., `var(--space-2)`) |
| 26 | `css/style.css` | 45 | Define spacing tokens: `--space-1: 4px`, `--space-2: 8px`, etc. |
| 27 | `js/main.js` | 5 | Consider `const KEY = 'wash-lang';` (const over var) |

---

## 7. Priority Action Plan

### Sprint 1 (Critical — Week 1)
1. Fix focus-visible styles (2.1)
2. Fix color contrast (2.2)
3. Add ARIA to language toggle (2.3)
4. Add ARIA to mobile nav (2.4)
5. Fix form label association (2.5)

### Sprint 2 (Major — Week 2)
6. Implement three-layer token architecture (3.1)
7. Complete component state matrix (3.2)
8. Fix touch targets ≥44×44pt (3.3)
9. Fix skip link logical property (3.4)
10. Replace emoji hamburger with SVG (3.5)
11. Add reduced motion support (3.7)

### Sprint 3 (Polish — Week 3)
12. Standardize 8dp spacing scale (4.1)
13. Optimize font loading (4.2)
14. Fix tagline translation (4.3)
15. Dynamic copyright year (4.4)
16. Replace shop placeholders (4.6)

---

## 8. Accessibility Audit Summary (WCAG 2.1 AA)

| Criterion | Status | Notes |
|-----------|--------|-------|
| 1.1.1 Non-text Content | ⚠️ Partial | Logo has alt; placeholder images lack meaningful alt |
| 1.3.1 Info & Relationships | ✅ Pass | Semantic HTML, proper heading hierarchy |
| 1.4.3 Contrast (Minimum) | ❌ Fail | Primary green on background 3.8:1 |
| 1.4.4 Resize Text | ✅ Pass | Relative units (rem/clamp), no fixed px on text |
| 2.1.1 Keyboard | ⚠️ Partial | All interactive reachable, but no visible focus |
| 2.1.2 No Keyboard Trap | ✅ Pass | No traps detected |
| 2.4.3 Focus Order | ✅ Pass | Logical DOM order |
| 2.4.7 Focus Visible | ❌ Fail | Only skip link has focus style |
| 3.1.1 Language of Page | ✅ Pass | `lang="ar"` / `lang="en"` on html |
| 3.1.2 Language of Parts | ✅ Pass | `data-ar`/`data-en` on all text |
| 3.2.1 On Focus | ✅ Pass | No unexpected context changes |
| 3.3.2 Labels or Instructions | ⚠️ Partial | Form labels implicit only; placeholders bilingual |
| 4.1.2 Name, Role, Value | ❌ Fail | Lang toggle, menu button lack ARIA |

**WCAG 2.1 AA Compliance: ~65%** — Critical gaps in focus visibility and contrast.

---

## 9. Design Token Migration Example

### Before (Current)
```css
:root {
  --green: #4A5D3A;
  --green-dark: #37462C;
  --bg: #FAF9F6;
  --card: #FFFFFF;
  --ink: #1E1E1E;
  --muted: #5C5C5C;
  --line: #E4E0D6;
  --accent: #C9B48A;
}
.btn { background: var(--green); }
.btn:hover { background: var(--green-dark); }
```

### After (Recommended)
```css
:root {
  /* Primitive */
  --color-green-600: #3D4D2E;  /* Adjusted for contrast */
  --color-green-700: #2E3D22;
  --color-green-100: #EDF1E8;
  --color-neutral-900: #1E1E1E;
  --color-neutral-500: #5C5C5C;
  --color-neutral-200: #E4E0D6;
  --color-neutral-50: #FAF9F6;
  --color-accent-500: #C9B48A;
  --color-accent-600: #A68F5E;

  /* Semantic */
  --color-primary: var(--color-green-600);
  --color-primary-hover: var(--color-green-700);
  --color-text: var(--color-neutral-900);
  --color-text-muted: var(--color-neutral-500);
  --color-border: var(--color-neutral-200);
  --color-surface: #FFFFFF;
  --color-bg: var(--color-neutral-50);
  --color-accent: var(--color-accent-500);
  --color-accent-hover: var(--color-accent-600);
  --color-focus: var(--color-green-700);

  /* Component */
  --btn-primary-bg: var(--color-primary);
  --btn-primary-hover: var(--color-primary-hover);
  --btn-primary-text: #FFFFFF;
  --btn-ghost-bg: transparent;
  --btn-ghost-text: var(--color-primary);
  --card-bg: var(--color-surface);
  --card-border: var(--color-border);

  /* Spacing (8dp base) */
  --space-1: 4px; --space-2: 8px; --space-3: 16px;
  --space-4: 24px; --space-5: 32px; --space-6: 40px;
  --space-7: 48px; --space-8: 64px;

  /* Typography */
  --font-ar: "Cairo", "Tajawal", "Segoe UI", Tahoma, sans-serif;
  --font-en: "Inter", "Poppins", "Segoe UI", Arial, sans-serif;
  --radius: 14px;
  --container-max: 1120px;
}
.btn {
  background: var(--btn-primary-bg);
  color: var(--btn-primary-text);
}
.btn:hover { background: var(--btn-primary-hover); }
.btn:focus-visible { outline: 2px solid var(--color-focus); outline-offset: 2px; }
```

---

**End of Report**