# DESIGN REVIEW 2 — We Are Still Here | باقون (static bilingual site)

Scope: `index.html`, `about.html`, `shop.html`, `team.html`, `contact.html`, `400.html`, `403.html`, `404.html`, `500.html`, `css/style.css`, `js/main.js`.
Lens: `ui-ux-pro-max` (Quick Reference + pre-delivery checklist; `--domain ux "animation accessibility"`, `--stack html-tailwind` mentally), `ui-styling` (mobile-first, a11y patterns), `design-system` (token discipline). No dark mode exists — skipped per brief.
Method: read-only. Contrast recomputed in Python (relative-luminance, WCAG 2.x). No files edited.

## Executive summary

The system is fundamentally sound: mobile-first, ascending breakpoints (640/768/900/1024/1280), logical properties used in most new motion code, SVG-only icons, gated hover lift, reduced-motion + counter guards in JS. Two issues are release-blocking: (1) desktop nav controls shrink below the 44px touch minimum, (2) the gold-button hover state fails WCAG AA for normal text. RTL has one real breakage (skip link) plus one unmirrored animation (gold sheen); the much-feared nav/hero/footer breakpoint failures were **not** found — cascade order is correct and grids do not overflow. Token discipline is the largest volume problem: footer palette, note palette, error red, avatar gradient, `#fff` repeats, raw px/rem, and per-page inline `style=""` attributes all bypass `:root`.

## Critical

### C1 — Desktop nav controls drop below 44px touch target (breaks the claimed 48px system)
- `css/style.css:340` — `.nav-links a{min-height:0;padding:9px 13px}` → height ≈ 35–38px. FAIL (< 44).
- `css/style.css:341` — `.nav-links .btn{...min-height:0;padding:9px 20px}` → ≈ 36px. FAIL.
- `css/style.css:342` — `.nav-links .lang-toggle{min-height:0;padding:7px 14px}` → ≈ 32px. FAIL.
- Checklist basis: ui-ux-pro-max "Touch Target Minimum ≥44×44" / pre-delivery checklist; ui-styling accessibility-first.
- Fix: keep `min-height:var(--touch-target)` or at least 44px on ≥900px; if a slimmer desktop bar is wanted, keep the *visual* padding but expand the hit area (e.g. `min-height:44px` + tighter header, or transparent `::before` hit-slop). Do not ship `min-height:0` on interactive controls.

### C2 — Gold button hover fails WCAG AA (normal text)
- `css/style.css:50` — `.btn.gold:hover{background:var(--accent-dark);color:#fff}`.
- Recomputed: `#FFFFFF` on `#A68F5E` = **3.13:1**. Needs 4.5:1 (0.9rem/14.4px bold is not "large" text). FAIL. Default state passes (`#1E1E1E` on `#C9B48A` = 8.24:1).
- Fix: on hover keep dark text (`color:#1E1E1E`), or darken hover bg to ≈ `#7A6535`+ (verify ≥4.5:1), or add a dark outline/shadow so the white-text state is not the only affordance. Re-test after change.

## Major

### M1 — RTL breakage: skip link uses physical `left`
- `css/style.css:289` — `.skip{position:absolute;left:-9999px}`; `css/style.css:290` — `.skip:focus{left:var(--space-md);...}`.
- In RTL (default language) the skip link parks/appears on the wrong side; it should follow reading origin.
- Fix: `inset-inline-start:-9999px` / `inset-inline-start:var(--space-md)` (keep `top` as-is).

### M2 — RTL breakage + perf: gold sheen sweep is physical and layout-triggering
- `css/style.css:439` — `.btn.gold::after{...left:-60%;...transition:left .6s ease}`; `css/style.css:442` — `.btn.gold:hover::after{left:130%}`.
- Same sweep direction in both dirs (should mirror in RTL); animating `left` forces layout each frame (design-system/ui-ux-pro-max prefer `transform`/`opacity`). 600ms also exceeds the 150–300ms micro-interaction guidance.
- Fix: drive with `transform:translateX()` (+ `skewX`), mirror via `html[dir]` or logical translate, duration ≈ 250–350ms. Reduced-motion already neuters it via `css/style.css:27-30` — keep that.

### M3 — Scroll progress bar can intercept taps; gradient not mirrored
- `css/style.css:444-445` — `.scroll-progress{position:fixed;top:0;...z-index:60}` with **no** `pointer-events:none`, sitting above the sticky header (`z-index:50`).
- A 3px full-width strip at the very top edge can swallow edge taps on mobile.
- Secondary: `background:linear-gradient(90deg,...)` runs LTR in both dirs while `transform-origin` is correctly flipped (`css/style.css:446-447`), so the color order reads reversed in RTL.
- Fix: add `pointer-events:none`; optionally flip gradient with `html[dir="rtl"] .scroll-progress{background:linear-gradient(-90deg,...)}`.

### M4 — Form errors are color-only with no visible message (checklist fail)
- `css/style.css:265` — `input[aria-invalid="true"]{border-color:#c0392b}` (hardcoded red, no token); `js/main.js:152-163` sets `aria-invalid` but emits **no** text error, no `aria-describedby`.
- Fails ui-ux-pro-max "Color is not the only indicator" + "Form fields have labels, hints, and clear error messages".
- Fix: add a persistent error summary/hint region, link each field via `aria-describedby`, add an icon or text prefix in addition to the red border, tokenize the error color (e.g. `--color-danger`).

### M5 — Token bypasses (design-system violation — largest count, fix systematically)
Hardcoded values that should reference `:root` tokens (representative lines):
- `#fff` × ~10 instead of `var(--card)`: `css/style.css:40,62,66,84,93,158,163,175,183,290` (buttons, header/menu/lang/eyebrow/partners/org/chips/skip).
- Footer palette with no tokens: `css/style.css:270` (`#22271F`, `#EDEBE3`), `css/style.css:272-273,275,282` (`#fff`, `#CFCABB`, `#EDEBE3`) + every page's footer `style="color:#CFCABB;font-size:.9rem/.85rem"` (e.g. `index.html:97`, `about.html:87`, `shop.html:44`, `team.html:89`, `contact.html:51`, `400.html:35`, `403.html:35`, `404.html:35`, `500.html:35`).
- Note palette: `css/style.css:202-203` (`#FFF8E8`, `#5a4a1f`).
- Error red: `css/style.css:265` (`#c0392b`).
- Avatar gradient: `css/style.css:226` (`#dde5d0`, `#f6f8f1`).
- `#1E1E1E` in `css/style.css:49` duplicates `var(--ink)`.
- Raw header metrics off the 4/8 rhythm: `css/style.css:59` (`min-height:62px`), `css/style.css:70` (`top:62px`), `css/style.css:333` (`min-height:70px`).
- Raw type/spacing bypassing `--fs-*`/`--space-*`: `css/style.css:96` (`clamp(...7vw,2.5rem)`), `css/style.css:356` (`2.75rem`), `css/style.css:355,360,376-377` (`3.5rem/4rem/4.5rem/3.25rem`), `css/style.css:42` (`12px 24px`), `css/style.css:340-342` (`9px 13px`, `9px 20px`, `7px 14px`).
- Inline HTML bypasses: `style="padding-top:0"` (`index.html:74,85`, `about.html:36,49,59`, `team.html:35,76`), `contact.html:39` (`style="align-content:start"`), `contact.html:46` (`style="margin-top:10px"`).
- Fix: add semantic/component tokens (`--footer-bg`, `--footer-fg`, `--footer-muted`, `--note-bg`, `--note-ink`, `--color-danger`, `--radius-nav` etc.), replace `#fff`→`var(--card)`, replace inline styles with a `.block.flush-top` / utility class.

### M6 — Reduced-motion ordering is fragile (works today only via `!important`)
- `css/style.css:27-30` sets `html{scroll-behavior:auto}` inside the reduce block, but `css/style.css:31` re-declares `html{scroll-behavior:smooth}` **after** it. It only survives because the `*` rule carries `!important`.
- Fix: move the `@media (prefers-reduced-motion: reduce)` block to the **end** of the motion section (or re-assert `html{scroll-behavior:auto}` after line 31 without relying on `!important`).

### M7 — Long Latin member names can overflow (no wrapping guard)
- `team.html:44-69` names like "Sohair Rafat Medhat Hamdan", "Ikhlas Shazly Youssef Abu Ouda", "Mahmoud Anwar Rizq Al-Ajrami", "Beneath the Hum…" titles in `shop.html:34-35`.
- `css/style.css:231-235` (`.member-card h4`) sets margins/line-height but no `overflow-wrap:break-word` / `hyphens:auto`; cards are `text-align:center` with fixed side margins, so at 320–360px the unbroken Latin runs are the likeliest overflow in the whole site.
- Fix: `overflow-wrap:anywhere` (or `break-word`) + `hyphens:auto` on `.member-card h4`, `.product h3`, `.partner-card span`; add `min-width:0` to grid children that can contain long words.

### M8 — Partner-card ellipsis can never trigger
- `css/style.css:167` — `.partner-card span{overflow:hidden;text-overflow:ellipsis}` without `white-space:nowrap` (chips intentionally wrap, but this span wants single-line truncation).
- Fix: add `white-space:nowrap;min-width:0` (or remove the ellipsis declarations if wrapping is intended).

## Minor / polish

- **N1 — Reveal delay leaks into later transitions:** `css/style.css:414-418` keeps `transition-delay:var(--reveal-delay)` on `.reveal.visible`, so hover `box-shadow` lifts wait for the stagger delay. Fix: reset `transition-delay:0s` for `:hover`/`:focus-visible` or scope the delay to `opacity,transform` only.
- **N2 — Org chart double borders at ≥640px:** `css/style.css:187-191` adds full card borders while `css/style.css:176` (`div+div{border-top}`) still applies. Fix: inside the 640px query, `border-top:none` on the stacked rule or use `gap` + card borders only.
- **N3 — Icon stroke/size inconsistency:** hamburger `stroke-width:2` (all headers) vs value icons `1.8` (`about.html:40-46`); icon boxes `22px/26px/20px` (`css/style.css:69,140,166,180`) with no icon-size tokens. Fix: `--icon-sm/md/lg` + one stroke width per layer.
- **N4 — Fixed chrome ignores safe areas:** `.to-top` (`css/style.css:449`) and `.scroll-progress` use raw `20px/0` with no `env(safe-area-inset-*)`. Fix: `bottom:calc(20px + env(safe-area-inset-bottom))`, same for `inset-inline-end`.
- **N5 — Brand link has no visible focus style** (buttons/nav/foot/social/inputs all have `:focus-visible`; `.brand` does not). Fix: mirror the `.btn:focus-visible` outline on `.brand:focus-visible`.
- **N6 — `leadership-grid` comment/code mismatch:** `css/style.css:251` comment says "centered as a group" but `justify-content:flex-start`. Either center or fix the comment.
- **N7 — Type scale drift:** `h1` raw `2.5rem/2.75rem` (`css/style.css:96,356`) vs `--fs-4xl:2.25rem`; section padding raw `3.5rem/4rem/4.5rem` (`css/style.css:355,360,376-377`) vs `--space-3xl:48px`. Harmless but defeats the token story — map to tokens.
- **N8 — Sheen gradient uses raw white:** `css/style.css:440` `rgba(255,255,255,.5)` — tokenize if a surface token set is introduced.

## What was checked and PASSED (no action)

- **Breakpoints/cascade:** queries ascend 640 → 768 → 900 → 1024 → 1280 (`css/style.css:303,318,332,354,375`); desktop nav correctly unhides at 900 (`menu-btn:none`, `nav-links:static/visible`, `css/style.css:336-339`); hero goes 2-col at 900 (`css/style.css:344`); footer goes 3-col at 768 (`css/style.css:324`); no `display:none` nav-on-desktop bug, no grid overflow (all `1fr` + `img{max-width:100%}`), no footer-stack inversion.
- **Hero overflow:** `.hero{overflow:hidden}` + `::before{inset:-20%}` drift (`css/style.css:386-401`) is contained — no page scrollbar from the 16s drift/scale.
- **Good RTL:** `margin-inline/padding-inline/inset-inline` throughout (`css/style.css:36,70,82,312,430`); `sec-title` bar and nav underline mirror origin per `html[dir]` (`css/style.css:424-425,433-434`); progress-bar origin mirrored (`css/style.css:446-447`); WhatsApp number pinned `dir="ltr"` (`contact.html:42`); chevrons/arrows are direction-neutral (down/up), nothing to mirror.
- **Contrast (recomputed, AA):** green `#3A4D2A`/white 9.23; green-dark/white 11.67; muted `#5C5C5C` on bg `#FAF9F6` 6.35 (and 6.69 on white); ink/gold `#1E1E1E`/`#C9B48A` 8.24; note `#5a4a1f`/`#FFF8E8` 8.15; footer `#CFCABB`/`#22271F` 9.30, `#EDEBE3`/`#22271F` 12.77; badges green-dark/green-soft 9.80. Only the gold-hover pair fails (C2).
- **Progressive enhancement:** `.reveal` is added by JS (`js/main.js:37-38`), so no-JS leaves content visible (not stuck at `opacity:0`); `IntersectionObserver` has fallbacks (`js/main.js:44-46,78`); counters and smooth-scroll respect reduced-motion (`js/main.js:60,134`); hover lift gated to `(hover:hover) and (min-width:1024px)` (`css/style.css:367-370,247-249`); `:active{scale(.98)}` is transform-only (no layout shift).
- **Type for Arabic:** body `line-height:1.7` (AR) / `1.6` (EN) (`css/style.css:32-33`), lede `1.75`, tagline `1.7` — meets the ≥1.7 Arabic expectation; `max-width:60ch/70ch` measures (`css/style.css:322,345`); error-code `clamp(4rem,18vw,8rem)` fits 320px (~64px).
- **Hygiene:** SVG icons only (no emoji icons); `:focus-visible` present on buttons/menu/lang/nav/inputs/to-top/foot/social; touch targets pass everywhere except C1 (`menu-btn`, `lang-toggle` mobile, `foot-links`, `social-row`, `to-top` 48px all pass).

## Verification checklist (re-run after fixes)

- [ ] 360px / 640px / 768px / 900px / 1024px / 1280px + landscape: nav appears exactly at 900, no horizontal scrollbar, hero 2-col breathing room, footer 3-col, no orphan collisions.
- [ ] RTL (ar) + LTR (en): skip-link side, sheen direction, progress origin/gradient, underline origins, brand truncation, WhatsApp `dir=ltr` intact.
- [ ] Keyboard: Tab order header → skip → nav → hero CTAs → cards → footer; every control shows `:focus-visible`, including `.brand`.
- [ ] Touch: caliper all controls ≥44px incl. desktop nav links/CTA/lang at 900px+; `scroll-progress` never blocks taps; `to-top` clears footer links + notch (`env()`).
- [ ] Contrast: re-run the 12 pairs above; gold-hover ≥4.5:1; error state not color-only (icon + text + `aria-describedby`).
- [ ] Motion: `prefers-reduced-motion` → no drift/rise/sheen/counter/smooth-scroll; `scroll-behavior` stays `auto` regardless of rule order; hover lift absent on touch.
- [ ] No-JS: disable JS → all `.sec-title/.card/.member-card/.product` visible, layout intact.
- [ ] Type: longest Latin names/titles at 320px (`Sohair Rafat Medhat Hamdan`, `Ikhlas Shazly Youssef Abu Ouda`, book titles) wrap without overflow; `Save Youth Future Society` chip behaves as designed.
- [ ] Tokens: `grep` for `#[0-9a-fA-F]` / `style="` in `css/` + `*.html` trends to zero (allow documented one-offs); rhythm values come from `--space-*`/`--fs-*`.
