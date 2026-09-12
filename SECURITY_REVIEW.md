# Security Review Report

**Target:** We Are Still Here — Static Bilingual Website  
**Location:** `C:\Users\Mostafa\Desktop\we-are-still-here-website\`  
**Review Date:** 2026-09-03  
**Reviewer:** Senior Security Analyst (Automated + Manual Review)  
**Scope:** 5 HTML pages, 1 CSS file, 1 JS file — static site, no backend, mailto: contact form

---

## 1. Executive Summary

| Metric | Assessment |
|--------|------------|
| **Overall Risk Level** | **Low** |
| **Critical Findings** | 0 |
| **High Findings** | 0 |
| **Medium Findings** | 3 |
| **Low Findings** | 5 |
| **Informational** | 4 |

**Summary:** The website is a well-structured static site with no backend, database, authentication, or server-side processing. The attack surface is minimal. The primary risks are client-side: missing security headers (CSP, frame protection, referrer policy), Google Fonts privacy implications (GDPR), and theoretical mailto: header injection. No XSS vectors, no hardcoded secrets, no dangerous JavaScript patterns, and all external links properly use `rel="noopener"`.

**Recommendation:** Deploy with security headers via hosting platform (Netlify/Vercel/GitHub Pages `_headers` or `netlify.toml`). Add CSP meta tag as defense-in-depth. Consider self-hosting fonts for GDPR compliance.

---

## 2. Findings Table

| ID | Severity | Title | File(s) | Category |
|----|----------|-------|---------|----------|
| FIND-001 | Medium | Missing Content Security Policy (CSP) | All HTML files | Headers/Client-Side |
| FIND-002 | Medium | Missing Clickjacking Protection (X-Frame-Options / frame-ancestors) | All HTML files | Headers/Client-Side |
| FIND-003 | Medium | Missing Referrer-Policy and Permissions-Policy | All HTML files | Headers/Client-Side |
| FIND-004 | Low | Google Fonts loaded from fonts.googleapis.com — GDPR/privacy concern | All HTML files (line 9-10, 14-15) | Privacy/Third-Party |
| FIND-005 | Low | No Subresource Integrity (SRI) for Google Fonts CSS | All HTML files (line 9-10, 14-15) | Supply Chain |
| FIND-006 | Low | mailto: contact form — theoretical email header injection | contact.html:27 | Input Handling |
| FIND-007 | Low | Email address exposed in plaintext — spam harvesting risk | All HTML files (footer, contact) | Privacy/Info Disclosure |
| FIND-008 | Low | No client-side validation/sanitization on contact form | contact.html:27-33 | Input Handling |
| FIND-009 | Info | All external links correctly use `rel="noopener"` | All HTML files | Good Practice |
| FIND-010 | Info | No inline event handlers, no `javascript:` URLs, no `eval()`/`innerHTML` | js/main.js | Good Practice |
| FIND-011 | Info | No hardcoded secrets, API keys, or tokens | All files | Good Practice |
| FIND-012 | Info | Safe DOM manipulation using `textContent` only | js/main.js:9-11 | Good Practice |

---

## 3. Detailed Findings

### FIND-001: Missing Content Security Policy (CSP)
**Severity:** Medium  
**Files:** `index.html`, `about.html`, `shop.html`, `team.html`, `contact.html` (all `<head>` sections)  
**Description:** No CSP header or `<meta http-equiv="Content-Security-Policy">` tag is present. CSP is a critical defense-in-depth mechanism to mitigate XSS, data injection, and mixed content attacks. Even static sites benefit from CSP to restrict resource loading to trusted origins.  
**Impact:** If an attacker compromises a third-party resource (e.g., Google Fonts CDN) or injects content via cache poisoning, the browser would execute it without restriction.  
**Remediation:** Add a CSP meta tag to each HTML `<head>`, or preferably configure via hosting platform headers. Recommended policy:

```html
<meta http-equiv="Content-Security-Policy"
  content="default-src 'self';
           style-src 'self' 'unsafe-inline' https://fonts.googleapis.com;
           font-src 'self' https://fonts.gstatic.com;
           img-src 'self' data: https:;
           connect-src 'self';
           frame-ancestors 'none';
           base-uri 'self';
           form-action 'self' mailto:;
           script-src 'self'">
```

**Notes:** `'unsafe-inline'` for styles is required due to inline `style=` attributes in HTML (e.g., `style="padding-top:0"`). Consider moving inline styles to CSS to remove this.

---

### FIND-002: Missing Clickjacking Protection
**Severity:** Medium  
**Files:** All HTML files (no `<meta http-equiv="X-Frame-Options">` or CSP `frame-ancestors`)  
**Description:** The site can be embedded in an `<iframe>` on malicious domains, enabling clickjacking attacks where users are tricked into clicking hidden elements (e.g., donation buttons, social links).  
**Impact:** Attackers could overlay the site in a transparent iframe and hijack clicks on "Donate", "Shop", or social media links.  
**Remediation:** Add either:
- CSP `frame-ancestors 'none'` (preferred, via FIND-001 CSP)
- OR `<meta http-equiv="X-Frame-Options" content="DENY">` in each `<head>`

---

### FIND-003: Missing Referrer-Policy and Permissions-Policy
**Severity:** Medium  
**Files:** All HTML files  
**Description:** No `Referrer-Policy` or `Permissions-Policy` headers/meta tags.  
**Impact:** 
- Referrer: Full URLs (including query strings) may leak to third-party destinations when users click external links (Chuffed, Teemill, Daraja Press, social media).
- Permissions: No restriction on browser features (camera, microphone, geolocation, etc.) — not critical for this site but defense-in-depth.  
**Remediation:** Add to `<head>`:
```html
<meta name="referrer" content="strict-origin-when-cross-origin">
<meta http-equiv="Permissions-Policy" content="camera=(), microphone=(), geolocation=(), payment=()">
```
Or configure via hosting platform headers.

---

### FIND-004: Google Fonts Loaded from fonts.googleapis.com — GDPR/Privacy Concern
**Severity:** Low  
**Files:** All HTML files, lines 9-10 (about.html), 14-15 (index.html), etc.  
```html
<link rel="preconnect" href="https://fonts.googleapis.com">
<link href="https://fonts.googleapis.com/css2?family=Cairo:wght@400;600;700;800&family=Inter:wght@400;600;700;800&display=swap" rel="stylesheet">
```
**Description:** Google Fonts CSS is loaded from `fonts.googleapis.com`, which may set cookies and log visitor IP addresses. Under GDPR/ePrivacy, this constitutes personal data processing requiring consent or legitimate interest assessment. The `preconnect` also initiates a connection before user consent.  
**Impact:** Potential non-compliance for EU/UK visitors. Google may track users across sites via font requests.  
**Remediation Options:**
1. **Self-host fonts** (recommended): Download Cairo/Inter font files (WOFF2), serve from `/fonts/`, update CSS `@font-face`. Eliminates third-party request entirely.
2. **Proxy via own domain**: Use a privacy-friendly proxy (e.g., `fonts.bunny.net`, self-hosted `google-fonts-helper`).
3. **If keeping Google Fonts**: Add `crossorigin="anonymous"` to `<link>` (already implied by preconnect), document in privacy policy, consider consent banner.

---

### FIND-005: No Subresource Integrity (SRI) for Google Fonts CSS
**Severity:** Low  
**Files:** All HTML files, font `<link>` tags  
**Description:** External stylesheet from `fonts.googleapis.com` lacks `integrity` attribute. If the CDN is compromised, malicious CSS could be injected (CSS-based keylogging, UI redressing).  
**Impact:** Supply chain attack vector. Low likelihood but high impact if exploited.  
**Remediation:** Generate SRI hash for the font CSS response and add `integrity` attribute. Note: Google Fonts CSS is dynamic (varies by user-agent), so SRI is impractical. **Best fix: self-host fonts (see FIND-004).**

---

### FIND-006: mailto: Contact Form — Theoretical Email Header Injection
**Severity:** Low  
**File:** `contact.html:27`  
```html
<form class="contact card" action="mailto:wash.team.info@gmail.com" method="post" enctype="text/plain">
```
**Description:** The form submits via `mailto:` with user-controlled `name`, `email`, `subject`, and `message` fields. While `enctype="text/plain"` mitigates some injection, RFC 2388 allows header injection via newline characters in `subject` or `body` fields. Modern email clients (Gmail, Outlook) sanitize, but legacy clients may be vulnerable.  
**Impact:** Attacker could inject `Bcc:`/`Cc:` headers to exfiltrate emails, or manipulate `Subject`/`From` for phishing.  
**Remediation:**
- **Option A (Recommended):** Replace mailto: with a backend endpoint (Netlify Functions, Vercel Serverless, Formspree, EmailJS) that sanitizes inputs and sends email server-side.
- **Option B (If keeping mailto:):** Add client-side sanitization in `main.js` to strip newlines (`\r`, `\n`, `%0D`, `%0A`) from `subject` and `message` before submission. Example:
```javascript
form.addEventListener('submit', function(e) {
  const subject = form.subject.value.replace(/[\r\n]/g, '');
  const message = form.message.value.replace(/[\r\n]/g, '');
  form.subject.value = subject;
  form.message.value = message;
});
```

---

### FIND-007: Email Address Exposed in Plaintext — Spam Harvesting
**Severity:** Low  
**Files:** All HTML files (footer, contact page)  
**Description:** `wash.team.info@gmail.com` appears in plaintext in multiple locations:
- `index.html:93`, `about.html:61`, `shop.html:42`, `team.html:49`, `contact.html:47` (footer)
- `contact.html:37` (mailto link)
- `contact.html:27` (form action)  
**Impact:** Email harvesters/scrapers will collect this address for spam lists.  
**Remediation:**
- Obfuscate in HTML: `wash.team.info<span>@</span>gmail.com` + CSS `.obfuscate::after { content: "@"; }`
- Use a contact form backend (see FIND-006) and remove plaintext email from HTML
- Or accept as acceptable for a public contact page

---

### FIND-008: No Client-Side Validation/Sanitization on Contact Form
**Severity:** Low  
**File:** `contact.html:27-33`  
**Description:** Form relies only on HTML5 `required` and `type="email"`. No custom validation (length limits, character allowlists, XSS payload detection).  
**Impact:** Users can submit extremely long inputs, special characters, or potential injection payloads. Since form uses mailto:, server-side validation doesn't exist.  
**Remediation:** Add client-side validation in `main.js`:
```javascript
const form = document.querySelector('.contact');
if (form) {
  form.addEventListener('submit', function(e) {
    const name = form.name.value.trim();
    const subject = form.subject.value.trim();
    const message = form.message.value.trim();
    if (name.length > 100 || subject.length > 200 || message.length > 5000) {
      e.preventDefault();
      alert('Input too long');
      return;
    }
    // Strip newlines for mailto: safety (FIND-006)
    form.subject.value = subject.replace(/[\r\n]/g, '');
    form.message.value = message.replace(/[\r\n]/g, '');
  });
}
```

---

### FIND-009: All External Links Correctly Use `rel="noopener"`
**Severity:** Info (Positive)  
**Files:** All HTML files  
**Description:** Every `<a target="_blank">` includes `rel="noopener"` (and implicitly `noreferrer` behavior). This prevents the opened page from accessing `window.opener`, mitigating tab-nabbing/reverse tabnabbing attacks.  
**Examples:** `index.html:29,86,87,99`; `contact.html:38,41,42`; etc.  
**Assessment:** Well implemented. No action needed.

---

### FIND-010: No Inline Event Handlers, No `javascript:` URLs, No `eval()`/`innerHTML`
**Severity:** Info (Positive)  
**Files:** `js/main.js`, all HTML files  
**Description:** 
- HTML: Zero `onclick`, `onload`, `onerror`, or `javascript:` hrefs
- JS: Uses `textContent` (safe), no `innerHTML`, `outerHTML`, `insertAdjacentHTML`, `eval()`, `Function()`, `setTimeout(string)`, `setInterval(string)`  
**Assessment:** Excellent secure coding practices. No XSS vectors in code.

---

### FIND-011: No Hardcoded Secrets, API Keys, or Tokens
**Severity:** Info (Positive)  
**Files:** All files  
**Description:** Scanned all files — no API keys, Bearer tokens, database credentials, webhook secrets, or private keys. The only "secret" is the public contact email and WhatsApp number, which are intentionally public.  
**Assessment:** Clean. No action needed.

---

### FIND-012: Safe DOM Manipulation Using `textContent` Only
**Severity:** Info (Positive)  
**File:** `js/main.js:9-11`  
```javascript
document.querySelectorAll('[data-ar]').forEach(function(el){
  var v = lang==='ar'?el.getAttribute('data-ar'):el.getAttribute('data-en');
  if(v!=null) el.textContent = v;
});
```
**Description:** Language switching uses `textContent` assignment, which is XSS-safe (browser treats as text, not HTML). No `innerHTML` or DOM parsing of user data.  
**Assessment:** Secure pattern. No action needed.

---

## 4. Specific Remediation Summary

| Priority | Action | Files to Modify |
|----------|--------|-----------------|
| **High** | Deploy CSP, X-Frame-Options, Referrer-Policy, Permissions-Policy via hosting platform headers | Netlify: `netlify.toml` / `_headers`; Vercel: `vercel.json`; GitHub Pages: limited (use meta tags) |
| **High** | Add CSP `<meta>` tag to all 5 HTML `<head>` sections as fallback | `index.html`, `about.html`, `shop.html`, `team.html`, `contact.html` |
| **Medium** | Self-host Cairo & Inter fonts (WOFF2) to remove Google Fonts dependency | New `/fonts/` dir; update `css/style.css` `@font-face`; remove font `<link>` from HTML |
| **Medium** | Replace mailto: form with backend endpoint (Netlify Functions / Formspree / EmailJS) | `contact.html`, new serverless function |
| **Low** | Add client-side validation + newline stripping to contact form | `js/main.js` |
| **Low** | Obfuscate email address in HTML or remove from footer | All HTML files |
| **Low** | Add `crossorigin="anonymous"` to font preconnect/link (if keeping Google Fonts) | All HTML files |

---

## 5. CSP Header Recommendation for Static Hosting

### Option A: Netlify (`netlify.toml`)
```toml
[[headers]]
  for = "/*"
  [headers.values]
    Content-Security-Policy = "default-src 'self'; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; font-src 'self' https://fonts.gstatic.com; img-src 'self' data: https:; connect-src 'self'; frame-ancestors 'none'; base-uri 'self'; form-action 'self' mailto:; script-src 'self'"
    X-Frame-Options = "DENY"
    Referrer-Policy = "strict-origin-when-cross-origin"
    Permissions-Policy = "camera=(), microphone=(), geolocation=(), payment=()"
    X-Content-Type-Options = "nosniff"
```

### Option B: Vercel (`vercel.json`)
```json
{
  "headers": [
    {
      "source": "/(.*)",
      "headers": [
        {"key": "Content-Security-Policy", "value": "default-src 'self'; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; font-src 'self' https://fonts.gstatic.com; img-src 'self' data: https:; connect-src 'self'; frame-ancestors 'none'; base-uri 'self'; form-action 'self' mailto:; script-src 'self'"},
        {"key": "X-Frame-Options", "value": "DENY"},
        {"key": "Referrer-Policy", "value": "strict-origin-when-cross-origin"},
        {"key": "Permissions-Policy", "value": "camera=(), microphone=(), geolocation=(), payment=()"},
        {"key": "X-Content-Type-Options", "value": "nosniff"}
      ]
    }
  ]
}
```

### Option C: GitHub Pages / Generic — CSP Meta Tag (add to each HTML `<head>`)
```html
<meta http-equiv="Content-Security-Policy" content="default-src 'self'; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; font-src 'self' https://fonts.gstatic.com; img-src 'self' data: https:; connect-src 'self'; frame-ancestors 'none'; base-uri 'self'; form-action 'self' mailto:; script-src 'self'">
<meta http-equiv="X-Frame-Options" content="DENY">
<meta name="referrer" content="strict-origin-when-cross-origin">
<meta http-equiv="Permissions-Policy" content="camera=(), microphone=(), geolocation=(), payment=()">
<meta http-equiv="X-Content-Type-Options" content="nosniff">
```

**Note:** If you self-host fonts (recommended), remove `https://fonts.googleapis.com` and `https://fonts.gstatic.com` from CSP `style-src` and `font-src`.

---

## 6. Additional Recommendations

1. **Add `crossorigin="anonymous"` to font preconnect** (if keeping Google Fonts):
   ```html
   <link rel="preconnect" href="https://fonts.googleapis.com" crossorigin>
   <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
   ```

2. **Consider `display=optional` for fonts** (already present: `&display=swap` — good for performance, but `optional` avoids layout shift).

3. **Add `integrity` to local script** (defense-in-depth):
   ```html
   <script src="js/main.js" integrity="sha384-<HASH>"></script>
   ```
   Generate with: `openssl dgst -sha384 -binary js/main.js | openssl base64 -A`

4. **Privacy Policy:** Create a privacy policy page documenting Google Fonts usage, mailto: form data handling, and external links.

5. **Security.txt:** Add `/.well-known/security.txt` with contact for vulnerability reporting.

---

## 7. Conclusion

The codebase demonstrates strong secure coding practices: no XSS vectors, no dangerous JS patterns, no secrets, proper `rel="noopener"` usage, and safe DOM manipulation. The primary gaps are **missing HTTP security headers** (CSP, frame protection, referrer policy) — easily remediated via hosting platform configuration — and **Google Fonts privacy considerations** for GDPR compliance. The mailto: form carries theoretical header injection risk; replacing it with a serverless backend is the cleanest fix.

**Overall posture: Low risk. With header deployment and font self-hosting, this achieves a strong security baseline for a static institutional site.**

---

*Report generated per OWASP ASVS 4.0 / MASVS guidelines for client-side static applications.*