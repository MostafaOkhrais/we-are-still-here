import "jsr:@supabase/functions-js/edge-runtime.d.ts";

const EMAIL_RE = /^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$/;
const RATE_LIMIT = 5;
const RATE_WINDOW_MS = 60 * 60 * 1000;

const SR_URL = Deno.env.get("SUPABASE_URL") ?? "";
const SR_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "";
const PROXY_SECRET = Deno.env.get("PROXY_SECRET") ?? "";
const SR_HEADERS: Record<string, string> = {
  "apikey": SR_KEY,
  "Authorization": `Bearer ${SR_KEY}`,
};

function corsHeaders(req: Request): Record<string, string> {
  const raw = Deno.env.get("ALLOWED_ORIGINS") ?? "";
  const configured = raw.split(",").map((s) => s.trim()).filter(Boolean);
  const origin = req.headers.get("origin") ?? "";
  const allow = configured.length === 0
    ? "null"
    : (configured.includes(origin) ? origin : "null");
  return {
    "Access-Control-Allow-Origin": allow,
    "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
    "Access-Control-Allow-Methods": "POST, OPTIONS",
    "Vary": "Origin",
  };
}

function json(data: unknown, status: number, req: Request): Response {
  return new Response(JSON.stringify(data), {
    status,
    headers: { ...corsHeaders(req), "Content-Type": "application/json" },
  });
}

const clean = (v: unknown, max: number): string =>
  String(v ?? "").replace(/[\r\n]+/g, " ").trim().slice(0, max);

async function sha256Hex(input: string): Promise<string> {
  const digest = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(input));
  return [...new Uint8Array(digest)].map((b) => b.toString(16).padStart(2, "0")).join("");
}

async function fail(status: number, msg: string): Promise<never> {
  throw { status, message: msg };
}

async function countSince(table: string, extra: string, since: string): Promise<number> {
  const u = `${SR_URL}/rest/v1/${table}?select=id&${extra}&created_at=gte.${encodeURIComponent(since)}&limit=1`;
  let res: Response;
  try {
    res = await fetch(u, { headers: { ...SR_HEADERS, "Prefer": "count=exact" } });
  } catch {
    await fail(500, "db_unreachable");
  }
  const cr = (res! as Response).headers.get("content-range") ?? "";
  const total = Number(cr.split("/")[1]);
  await (res! as Response).arrayBuffer().catch(() => {});
  if (!(res! as Response).ok) await fail(500, "db_count_failed");
  if (!Number.isFinite(total)) await fail(500, "db_count_parse");
  return total;
}

async function insertRow(table: string, row: Record<string, unknown>): Promise<void> {
  let res: Response;
  try {
    res = await fetch(`${SR_URL}/rest/v1/${table}`, {
      method: "POST",
      headers: { ...SR_HEADERS, "Content-Type": "application/json", "Prefer": "return=minimal" },
      body: JSON.stringify(row),
    });
  } catch {
    await fail(500, "db_unreachable");
  }
  await (res! as Response).arrayBuffer().catch(() => {});
  if (!(res! as Response).ok) {
    await fail((res! as Response).status === 400 ? 500 : 500, "db_insert_failed");
  }
}

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders(req) });
  if (req.method !== "POST") return json({ error: "method_not_allowed" }, 405, req);
  try {
    if (!SR_URL || !SR_KEY) return json({ error: "server_error" }, 500, req);
    const body: unknown = await req.json().catch(() => null);
    if (!body || typeof body !== "object") return json({ error: "bad_request" }, 400, req);
    const b = body as Record<string, unknown>;

    if (String(b.website ?? "").trim() !== "") return json({ ok: true }, 200, req);

    if (
      String(b.name ?? "").length > 150 || String(b.email ?? "").length > 320 ||
      String(b.subject ?? "").length > 300 || String(b.message ?? "").length > 6000
    ) return json({ error: "too_large" }, 413, req);

    const name = clean(b.name, 120);
    const email = String(b.email ?? "").trim().toLowerCase().slice(0, 254);
    const subjectRaw = clean(b.subject, 200);
    const subject = subjectRaw === "" ? null : subjectRaw;
    const message = String(b.message ?? "").replace(/\r\n?/g, "\n").trim().slice(0, 5000);
    const lang = b.lang === "en" ? "en" : "ar";

    if (name.length < 2) return json({ error: "invalid_name" }, 400, req);
    if (!EMAIL_RE.test(email)) return json({ error: "invalid_email" }, 400, req);
    if (message.length < 10) return json({ error: "invalid_message" }, 400, req);

    const fwd = (req.headers.get("x-forwarded-for") ?? "").split(",").map((s) => s.trim()).filter(Boolean);
    let ip = fwd.length ? fwd[fwd.length - 1] : "";
    const proxySecret = req.headers.get("x-proxy-secret") ?? "";
    const visitorIp = (req.headers.get("x-visitor-ip") ?? "").trim();
    if (PROXY_SECRET !== "" && proxySecret !== "" && proxySecret === PROXY_SECRET && visitorIp !== "") {
      ip = visitorIp;
    }
    const ipHash = ip ? await sha256Hex(`wash-contact:${ip}`) : null;
    const userAgent = (req.headers.get("user-agent") ?? "").slice(0, 300) || null;

    if (ipHash) {
      const since = new Date(Date.now() - RATE_WINDOW_MS).toISOString();
      const n = await countSince("contact_messages", `ip_hash=eq.${ipHash}`, since);
      if (n >= RATE_LIMIT) return json({ error: "rate_limited" }, 429, req);
    }

    await insertRow("contact_messages", {
      name, email, subject, message, lang, ip_hash: ipHash, user_agent: userAgent,
    });
    return json({ ok: true }, 200, req);
  } catch (err) {
    const e = err as { status?: number; message?: string };
    console.error("submit-contact failed:", e?.message ?? err);
    return json({ error: "server_error" }, 500, req);
  }
});
