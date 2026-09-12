# We Are Still Here | باقون — Sitemap & Wireframe

## Sitemap
- `index.html` — Home: hero (logo + tagline), institutional snapshot, impact statistics (6 cards), explore cards (Programs / Shop / Team / Contact), Follow Us
- `about.html` — About & Programs: origin story (April 2024, Prof. Zahid Pranjol), Vision, Mission, 7 Core Values, 4 Programs, general org structure, partnerships (5)
- `shop.html` — Shop: Teemill store link, 2 Daraja Press books + publisher link, Chuffed donate button, proceeds note
- `team.html` — Team: collective intro (~50: ~30 Gaza / ~20 UK; ~10 trainers), leadership (Founder + Gaza Lead, titles exact), 6 functional areas (department level, no personal data), Join Us
- `contact.html` — Contact: form (name/email/subject/message), wash.team.info@gmail.com, WhatsApp +972 56-727-3164, Facebook/Instagram, general location Gaza/Palestine
- `news.html` — News & Events: DB-backed listing (published `news_posts` only), category filter tabs (All/News/Updates/Events), bilingual AR/EN, publishing via `admin.html`
- `admin.html` — Private admin (unlisted, noindex): Auth + allowlist gate; contact messages, newsletter subscribers, news posts CRUD
- `privacy.html` — Privacy Policy: bilingual data-practice disclosure matching actual implementation (hashed IPs, no analytics, Cloudflare security cookie, rights via email); linked from all footers + contact-form consent note
- Shared: `css/style.css`, `js/main.js` (AR-default RTL / EN LTR toggle + sticky navbar + mobile menu), `assets/logo.png` (official logo extracted from the provided PDF)
- SEO: `robots.txt` (allow all; admin deliberately unlisted), OG site_name/locale, twitter summary card, theme-color, inline NGO JSON-LD (CSP sha256-allowlisted, identical on all 6 pages)

## Wireframe (all pages)
Header (sticky): [logo + name] [Home | About | Shop | Team | News | Contact] [Donate] [AR/EN toggle] [☰ mobile]
URLs are clean in production (`/` `/about` …): `cleanUrls` + permanent `.html` → clean redirects in `vercel.json` (internal links keep `.html` so local preview still works; future sitemap/canonical use clean URLs).
Hosting moved to Hostinger (Apache): `.htaccess` is authoritative there (clean URLs via THE_REQUEST-safe rewrites, security headers incl. CSP hash, blocks for `vercel.json`/`*.md`/`supabase/`/non-min JS, conservative asset caching). `vercel.json` kept as documented Vercel alternative. Same-origin backend via `api.php` proxy (strict route allowlist, per-IP identity forwarded with shared secret, PHP never served); frontend needs no changes (relative `/api/*` in production).
Hero: eyebrow → H1 → lede → tagline bar → CTA buttons
Body: section title → sub → card grid (responsive 1→2→3/4 cols, mobile-first)
Footer: [logo + email + Gaza/Palestine] [quick links] [social icons] + copyright

## Content rules observed
- All figures/names/titles from prompt + official guides only; no invented facts/quotes.
- Team Annex A personal data (names, phones, emails of members) NOT published.
- General location only (Gaza / Palestine).
- Formal institutional register; tagline repeated site-wide.
