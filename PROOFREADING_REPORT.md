# Proofreading Report: We Are Still Here / باقون Website

**Date:** 2026-09-03  
**Scope:** 5 HTML files (index.html, about.html, shop.html, team.html, contact.html)  
**Languages:** Arabic (RTL) / English (LTR) — fully bilingual with `data-ar` / `data-en` attributes

---

## 1. Executive Summary

| Category | Issues Found | Severity |
|----------|--------------|----------|
| **Tagline Inconsistency** | 3 critical mismatches | 🔴 Critical |
| **Missing Bilingual Attributes** | 4 elements (2 book titles, 1 program title, 1 tagline) | 🔴 Critical |
| **Number Formatting Inconsistency** | 2 instances (English missing "approximately") | 🟡 Medium |
| **Arabic Grammar/Case Errors** | 2 instances | 🟡 Medium |
| **Title/Terminology Inconsistency** | 3 instances (Founder title, Gaza Lead title, tagline verbs) | 🟡 Medium |
| **Factual Accuracy** | All verified ✓ | 🟢 Pass |
| **Placeholder Text** | All checked ✓ | 🟢 Pass |

**Total Issues:** 14 actionable items

---

## 2. Line-by-Line Corrections

### 2.1 index.html

| Line | Element | Issue | Current | Corrected |
|------|---------|-------|---------|-----------|
| 10 | `<meta property="og:description">` | Arabic tagline variant differs from official | `باقون — ما زلنا هنا، ما زلنا نتعلم، ما زلنا نبني` | `باقون — ما زلنا نتعلم — ما زلنا نبني` (match official) |
| 38 | `<h1 data-ar="..." data-en="...">` | Arabic verb choice differs from tagline; English lowercase after em dash | `باقون — نواصل التعلم ونواصل البناء` / `We Are Still Here — we keep learning, we keep building` | `باقون — ما زلنا نتعلم — ما زلنا نبني` / `We Are Still Here — We keep learning, we keep building` |
| 40 | `<div class="tagline" data-ar="..." data-en="...">` | **Critical:** Arabic attribute contains English text | `We Are Still Here — We Are Still Learning — We Are Still Building` (both) | `data-ar="باقون — ما زلنا نتعلم — ما زلنا نبني"` / `data-en="We Are Still Here — We Are Still Learning — We Are Still Building"` |
| 50 | `<li data-ar="..." data-en="...">` | English missing "approximately" before 20 | `approximately 30 in Gaza and 20 in the United Kingdom` | `approximately 30 in Gaza and approximately 20 in the United Kingdom` |
| 61 | `<div class="card">` stat 1 | English missing "approximately" before 20 (same as line 50) | `Approximately 30 in Gaza and 20 in the United Kingdom.` | `Approximately 30 in Gaza and approximately 20 in the United Kingdom.` |
| 62 | `<div class="stat-label" data-ar="...">` | Arabic grammatical case: "المستفيدين" should be nominative | `الطلبة المستفيدين من البرامج التعليمية` | `الطلبة المستفيدون من البرامج التعليمية` |

### 2.2 about.html

| Line | Element | Issue | Current | Corrected |
|------|---------|-------|---------|-----------|
| 24 | `<div class="tagline" data-ar="..." data-en="...">` | **Critical:** Arabic attribute contains English text (same as index.html:40) | `We Are Still Here — We Are Still Learning — We Are Still Building` (both) | `data-ar="باقون — ما زلنا نتعلم — ما زلنا نبني"` / `data-en="We Are Still Here — We Are Still Learning — We Are Still Building"` |
| 50 | `<h3>البرنامج الأكاديمي الشامل</h3>` | **Critical:** Hardcoded Arabic, missing `data-en` attribute | `<h3>البرنامج الأكاديمي الشامل</h3>` | `<h3 data-ar="البرنامج الأكاديمي الشامل متعدد التخصصات" data-en="Comprehensive Multi-Disciplinary Academic Program">البرنامج الأكاديمي الشامل متعدد التخصصات</h3>` |
| 56 | `<p data-ar="...">` | Arabic title for Obay Jouda differs from team.html & constraint | `قائد المشروع في غزة` | `قائد الفريق / المشروع في غزة` |

### 2.3 shop.html

| Line | Element | Issue | Current | Corrected |
|------|---------|-------|---------|-----------|
| 31 | `<h3>We Are Still Here: Stories from Gaza's University Students</h3>` | **Critical:** Hardcoded English book title, no bilingual attributes | Hardcoded English | `<h3 data-ar="We Are Still Here: Stories from Gaza's University Students" data-en="We Are Still Here: Stories from Gaza's University Students">We Are Still Here: Stories from Gaza's University Students</h3>` |
| 32 | `<h3>Beneath the Hum of Drones: On Solidarity and the Courage of Gaza's Students</h3>` | **Critical:** Hardcoded English book title, no bilingual attributes | Hardcoded English | `<h3 data-ar="Beneath the Hum of Drones: On Solidarity and the Courage of Gaza's Students" data-en="Beneath the Hum of Drones: On Solidarity and the Courage of Gaza's Students">Beneath the Hum of Drones: On Solidarity and the Courage of Gaza's Students</h3>` |

> **Note on book titles:** Since these are published English-language book titles, they should remain in English in both languages. The `data-ar`/`data-en` attributes should both contain the English title for consistency.

### 2.4 team.html

| Line | Element | Issue | Current | Corrected |
|------|---------|-------|---------|-----------|
| 28 | `<span class="badge" data-ar="..." data-en="...">` | Founder title adds "Director" not in constraint | `المؤسس والمدير` / `Founder and Director` | `المؤسس` / `Founder` |
| 29 | `<span class="badge" data-ar="..." data-en="...">` | Arabic title slightly differs from constraint phrasing | `قائد الفريق / قائد المشروع في غزة` | `قائد الفريق / المشروع في غزة` (matches constraint "Gaza Team/Project Lead") |

### 2.5 contact.html

| Line | Element | Issue | Current | Corrected |
|------|---------|-------|---------|-----------|
| 29 | `<input required type="email" name="email" placeholder="name@example.com">` | Missing placeholder bilingual attributes (minor) | `placeholder="name@example.com"` | `placeholder="name@example.com" data-ar-ph="البريد الإلكتروني" data-en-ph="Email address"` |

---

## 3. Bilingual Mismatch Report

### 3.1 Missing `data-ar` / `data-en` Pairs

| File | Line | Element | Missing |
|------|------|---------|---------|
| about.html | 50 | Program 2 `<h3>` | `data-en` (and full `data-ar` text) |
| shop.html | 31 | Book 1 `<h3>` | Both `data-ar` and `data-en` |
| shop.html | 32 | Book 2 `<h3>` | Both `data-ar` and `data-en` |
| index.html | 40 | Tagline `<div>` | `data-ar` contains English |
| about.html | 24 | Tagline `<div>` | `data-ar` contains English |

### 3.2 Tagline Inconsistency Across Pages

| Location | Arabic Text | English Text | Status |
|----------|-------------|--------------|--------|
| **Official Constraint** | `باقون — ما زلنا نتعلم — ما زلنا نبني` | `We Are Still Here — We Are Still Learning — We Are Still Building` | ✅ Reference |
| index.html:10 (OG) | `ما زلنا هنا، ما زلنا نتعلم، ما زلنا نبني` | Official | ❌ "ما زلنا هنا" vs "باقون" |
| index.html:38 (Hero h1) | `نواصل التعلم ونواصل البناء` | `we keep learning, we keep building` | ❌ Verb mismatch |
| index.html:40 (Tagline) | **English text** | Official | 🔴 **Critical** |
| about.html:24 (Tagline) | **English text** | Official | 🔴 **Critical** |

**Recommendation:** Standardize on single Arabic translation: **`باقون — ما زلنا نتعلم — ما زلنا نبني`** for all tagline instances.

---

## 4. Factual Accuracy Verification Checklist

| Fact | Constraint | Found in Files | Status |
|------|------------|----------------|--------|
| Members/volunteers | ~50 | index.html:50,61; team.html:23; about.html:23 | ✅ Consistent |
| Gaza team count | ~30 | index.html:50,61; team.html:23; about.html:23 | ✅ Consistent |
| UK team count | ~20 | index.html:50,61; team.html:23; about.html:23 | ✅ Consistent |
| Students served | Dozens / عشرات | index.html:62; about.html:49; team.html:23 | ✅ Consistent |
| Financial-support cases | Hundreds / مئات | index.html:63; about.html:51 | ✅ Consistent |
| Trainers/academics | ~10 / نحو 10 | index.html:51,64; team.html:23; about.html:51 | ✅ Consistent |
| Published books | 2 (Daraja Press) | index.html:65; shop.html:31,32; about.html:52 | ✅ Consistent |
| Art exhibition | 1 (Gallery North) | index.html:65; shop.html:31; about.html:52 | ✅ Consistent |
| Academic partnership | University of Sussex | index.html:66; about.html:57 | ✅ Consistent |
| Founder | Professor Zahid Pranjol | All files | ✅ Consistent |
| Founder exact title | "Founder" | team.html:28 says "Founder and Director" | ⚠️ Extra "Director" |
| Gaza Lead | Obay Jouda | team.html:29; about.html:56 | ✅ Present |
| Gaza Lead exact title | "Gaza Team/Project Lead" | team.html:29 ✅; about.html:56 "Project Lead in Gaza" | ⚠️ Slight variance |
| Initiative began | April 2024 | index.html:39; about.html:23 | ✅ Consistent |
| Legal registration status | Transitioning, not yet registered | index.html:52; about.html:56 | ✅ Consistent |
| Tagline (exact) | `We Are Still Here — We Are Still Learning — We Are Still Building` | index.html:10,40; about.html:24 | ❌ Arabic missing |

---

## 5. Recommended Corrected Text Blocks

### 5.1 Unified Tagline (Apply to ALL tagline elements)

**Arabic:** `باقون — ما زلنا نتعلم — ما زلنا نبني`  
**English:** `We Are Still Here — We Are Still Learning — We Are Still Building`

### 5.2 index.html Corrections

**Line 10 (OG description):**
```html
<meta property="og:description" content="We Are Still Here — We Are Still Learning — We Are Still Building. / باقون — ما زلنا نتعلم — ما زلنا نبني.">
```

**Line 38 (Hero h1):**
```html
<h1 data-ar="باقون — ما زلنا نتعلم — ما زلنا نبني" data-en="We Are Still Here — We keep learning, we keep building">باقون — ما زلنا نتعلم — ما زلنا نبني</h1>
```

**Line 40 (Tagline):**
```html
<div class="tagline" data-ar="باقون — ما زلنا نتعلم — ما زلنا نبني" data-en="We Are Still Here — We Are Still Learning — We Are Still Building">We Are Still Here — We Are Still Learning — We Are Still Building</div>
```

**Line 50 & 61 (Stats — English text):**
```html
<!-- Line 50 data-en -->
A team of approximately 50 members and volunteers: approximately 30 in Gaza and approximately 20 in the United Kingdom.

<!-- Line 61 data-en -->
Approximately 30 in Gaza and approximately 20 in the United Kingdom.
```

**Line 62 (Stat label Arabic):**
```html
<div class="stat-label" data-ar="الطلبة المستفيدون من البرامج التعليمية" data-en="Students served through educational programs">الطلبة المستفيدون من البرامج التعليمية</div>
```

### 5.3 about.html Corrections

**Line 24 (Tagline):**
```html
<div class="tagline" data-ar="باقون — ما زلنا نتعلم — ما زلنا نبني" data-en="We Are Still Here — We Are Still Learning — We Are Still Building">We Are Still Here — We Are Still Learning — We Are Still Building</div>
```

**Line 50 (Program 2 h3):**
```html
<h3 data-ar="البرنامج الأكاديمي الشامل متعدد التخصصات" data-en="Comprehensive Multi-Disciplinary Academic Program">البرنامج الأكاديمي الشامل متعدد التخصصات</h3>
```

**Line 56 (Obay Jouda title):**
```html
<p data-ar="المؤسس والإشراف العام: البروفيسور زاهد برانجول. قائد الفريق / المشروع في غزة: Obay Jouda." data-en="Founder and general supervision: Professor Zahid Pranjol. Gaza Team / Project Lead: Obay Jouda.">المؤسس والإشراف العام: البروفيسور زاهد برانجول. قائد الفريق / المشروع في غزة: Obay Jouda.</p>
```

### 5.4 shop.html Corrections

**Line 31 (Book 1):**
```html
<h3 data-ar="We Are Still Here: Stories from Gaza's University Students" data-en="We Are Still Here: Stories from Gaza's University Students">We Are Still Here: Stories from Gaza's University Students</h3>
```

**Line 32 (Book 2):**
```html
<h3 data-ar="Beneath the Hum of Drones: On Solidarity and the Courage of Gaza's Students" data-en="Beneath the Hum of Drones: On Solidarity and the Courage of Gaza's Students">Beneath the Hum of Drones: On Solidarity and the Courage of Gaza's Students</h3>
```

### 5.5 team.html Corrections

**Line 28 (Founder badge):**
```html
<span class="badge" data-ar="المؤسس" data-en="Founder">المؤسس</span>
```

**Line 29 (Gaza Lead badge):**
```html
<span class="badge" data-ar="قائد الفريق / المشروع في غزة" data-en="Gaza Team / Project Lead">قائد الفريق / المشروع في غزة</span>
```

### 5.6 contact.html Correction (Minor)

**Line 29 (Email input):**
```html
<input required type="email" name="email" placeholder="name@example.com" data-ar-ph="البريد الإلكتروني" data-en-ph="Email address">
```

---

## 6. Additional Recommendations

### 6.1 Arabic Diacritics for Clarity
Consider adding diacritics to key proper nouns on first occurrence:
- `البروفيسور زَاهِد بْرَنْجُول` (Professor Zahid Pranjol)
- `أُوبَيْ جُودَة` (Obay Jouda)

### 6.2 Number Formatting Standard
- **Arabic:** Use Western numerals (50, 30, 20, 10) consistently — currently mixed (some spelled out "عشرات/مئات", some numerals). Recommend: Use numerals with `~` prefix for all stats.
- **English:** Keep "approximately 50 / ~50" pattern consistent.

### 6.3 Capitalization Style
- **English:** Title Case for all proper nouns, program names, titles (currently consistent ✓)
- **Arabic:** First-word capitalization only (standard for Arabic) — currently consistent ✓

### 6.4 Punctuation
- **Arabic:** Use Arabic punctuation (، ؛ ؟) — currently correct ✓
- **English:** Use standard punctuation — currently correct ✓

### 6.5 RTL/LTR Attributes
- Ensure `dir="rtl"` on `<html>` (present ✓)
- Add `dir="ltr"` to WhatsApp link (contact.html:38) — already has `dir="ltr"` ✓

---

## 7. Priority Action Items

| Priority | Action | Files Affected |
|----------|--------|----------------|
| 🔴 **P0** | Fix tagline `data-ar` attributes (replace English with Arabic) | index.html:40, about.html:24 |
| 🔴 **P0** | Add missing bilingual attributes to 4 hardcoded elements | about.html:50, shop.html:31,32 |
| 🟡 **P1** | Fix English "approximately" consistency (2 instances) | index.html:50,61 |
| 🟡 **P1** | Fix Arabic grammatical case "المستفيدين" → "المستفيدون" | index.html:62 |
| 🟡 **P1** | Align Founder/Gaza Lead titles to constraints | team.html:28,29; about.html:56 |
| 🟢 **P2** | Standardize OG tagline Arabic variant | index.html:10 |
| 🟢 **P2** | Add placeholder attributes to contact email input | contact.html:29 |
| 🟢 **P3** | Consider diacritics for proper nouns on first use | All files |

---

**Report prepared by:** Automated proofreading analysis  
**Next step:** Apply corrections above, then re-verify bilingual parity with a diff check.