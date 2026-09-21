import "jsr:@supabase/functions-js/edge-runtime.d.ts";

const EMAIL_RE = /^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$/;
const RATE_LIMIT = 10;
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
    : configured.includes("*")
      ? "*"
      : (configured.includes(origin) ? origin : (configured[0] ?? "null"));
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

async function sha256Hex(input: string): Promise<string> {
  const digest = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(input));
  return [...new Uint8Array(digest)].map((b) => b.toString(16).padStart(2, "0")).join("");
}

async function fail(msg: string): Promise<never> {
  throw { message: msg };
}

async function dbGet<T>(path: string, prefer?: string): Promise<{ res: Response; data: T }> {
  let res: Response;
  try {
    res = await fetch(`${SR_URL}/rest/v1/${path}`, {
      headers: prefer ? { ...SR_HEADERS, "Prefer": prefer } : SR_HEADERS,
    });
  } catch {
    await fail("db_unreachable");
  }
  const data = await (res! as Response).json().catch(() => null) as T;
  if (!(res! as Response).ok) await fail("db_read_failed");
  return { res: res! as Response, data };
}

async function dbWrite(method: string, path: string, row: Record<string, unknown>): Promise<void> {
  let res: Response;
  try {
    res = await fetch(`${SR_URL}/rest/v1/${path}`, {
      method,
      headers: { ...SR_HEADERS, "Content-Type": "application/json", "Prefer": "return=minimal" },
      body: JSON.stringify(row),
    });
  } catch {
    await fail("db_unreachable");
  }
  await (res! as Response).arrayBuffer().catch(() => {});
  if (!(res! as Response).ok) await fail("db_write_failed");
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

    if (String(b.email ?? "").length > 320 || String(b.name ?? "").length > 200) {
      return json({ error: "too_large" }, 413, req);
    }

    const email = String(b.email ?? "").trim().toLowerCase().slice(0, 254);
    const nameRaw = String(b.name ?? "").replace(/[\r\n]+/g, " ").trim().slice(0, 120);
    const name = nameRaw === "" ? null : nameRaw;
    const lang = b.lang === "en" ? "en" : "ar";

    if (!EMAIL_RE.test(email)) return json({ error: "invalid_email" }, 400, req);

    const fwd = (req.headers.get("x-forwarded-for") ?? "").split(",").map((s) => s.trim()).filter(Boolean);
    let ip = fwd.length ? fwd[fwd.length - 1] : "";
    const proxySecret = req.headers.get("x-proxy-secret") ?? "";
    const visitorIp = (req.headers.get("x-visitor-ip") ?? "").trim();
    if (PROXY_SECRET !== "" && proxySecret !== "" && proxySecret === PROXY_SECRET && visitorIp !== "") {
      ip = visitorIp;
    }
    const ipHash = ip ? await sha256Hex(`wash-newsletter:${ip}`) : null;

    if (ipHash) {
      const since = new Date(Date.now() - RATE_WINDOW_MS).toISOString();
      const { res } = await dbGet(
        `newsletter_subscribers?select=id&ip_hash=eq.${ipHash}&created_at=gte.${encodeURIComponent(since)}&limit=1`,
        "count=exact",
      );
      const cr = res.headers.get("content-range") ?? "";
      const total = Number(cr.split("/")[1]);
      if (!Number.isFinite(total)) await fail("db_count_parse");
      if (total >= RATE_LIMIT) return json({ error: "rate_limited" }, 429, req);
    }

    const { data } = await dbGet<Array<{ id: string; status: string }>>(
      `newsletter_subscribers?select=id,status&email_norm=eq.${encodeURIComponent(email)}&limit=1`,
    );
    const existing = data?.[0] ?? null;

    if (existing) {

      if (existing.status === "active") return json({ ok: true }, 200, req);
      await dbWrite("PATCH", `newsletter_subscribers?id=eq.${existing.id}`, {
        status: "active", unsubscribed_at: null, name, lang,
      });
      return json({ ok: true }, 200, req);
    }

    await dbWrite("POST", "newsletter_subscribers", {
      email, name, lang, source: "website", ip_hash: ipHash,
    });
    return json({ ok: true }, 200, req);
  } catch (err) {
    const e = err as { message?: string };
    console.error("subscribe-newsletter failed:", e?.message ?? err);
    return json({ error: "server_error" }, 500, req);
  }
});
