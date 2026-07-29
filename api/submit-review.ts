// Public review submission endpoint.
// Accepts { client_name, rating, review_text, location? } from the
// on-page "Send a bouquet" modal, validates it, and appends a new
// testimonial to `public/content.json` on GitHub. Vercel then
// redeploys and the review shows on the live site — but the client
// also gets the testimonial back in the response so React Query can
// optimistically prepend it and show it instantly.

const OWNER = process.env.GITHUB_OWNER ?? "insightfusionanalytics";
const REPO = process.env.GITHUB_REPO ?? "Cake-rush-";
const BRANCH = process.env.GITHUB_BRANCH ?? "main";
const CONTENT_PATH = "public/content.json";

// Simple validation caps.
const NAME_MAX = 80;
const LOCATION_MAX = 80;
const TEXT_MIN = 10;
const TEXT_MAX = 800;

function jsonRes(status: number, body: unknown) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { "Content-Type": "application/json" },
  });
}

function utf8ToBase64(input: string): string {
  if (typeof Buffer !== "undefined")
    return Buffer.from(input, "utf-8").toString("base64");
  // eslint-disable-next-line no-undef
  return btoa(unescape(encodeURIComponent(input)));
}

function base64ToUtf8(input: string): string {
  if (typeof Buffer !== "undefined")
    return Buffer.from(input, "base64").toString("utf-8");
  // eslint-disable-next-line no-undef
  return decodeURIComponent(escape(atob(input)));
}

function newId(prefix: string): string {
  return `${prefix}-${Date.now().toString(36)}${Math.random().toString(36).slice(2, 6)}`;
}

// Strip anything that looks like an HTML tag or URL — keeps spammy
// content off the site. Reviews rarely need markup.
function sanitize(s: string): string {
  return s
    .replace(/<[^>]*>/g, "")
    .replace(/https?:\/\/\S+/gi, "")
    .replace(/\s+/g, " ")
    .trim();
}

export default async function handler(req: Request): Promise<Response> {
  if (req.method !== "POST") return jsonRes(405, { error: "Method not allowed" });

  const token = process.env.GITHUB_PAT;
  if (!token) return jsonRes(500, { error: "Server not configured" });

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return jsonRes(400, { error: "Invalid JSON" });
  }

  const raw = (body ?? {}) as Record<string, unknown>;
  const name = sanitize(typeof raw.client_name === "string" ? raw.client_name : "");
  const location = sanitize(
    typeof raw.location === "string" ? raw.location : "",
  );
  const text = sanitize(typeof raw.review_text === "string" ? raw.review_text : "");
  const ratingNum = typeof raw.rating === "number" ? raw.rating : Number(raw.rating);
  const rating = Math.round(Math.max(1, Math.min(5, ratingNum)));

  if (!name) return jsonRes(400, { error: "Please share your name." });
  if (name.length > NAME_MAX)
    return jsonRes(400, { error: `Name is a bit long (max ${NAME_MAX}).` });
  if (location.length > LOCATION_MAX)
    return jsonRes(400, { error: `Location is a bit long (max ${LOCATION_MAX}).` });
  if (!text) return jsonRes(400, { error: "Please write a short note." });
  if (text.length < TEXT_MIN)
    return jsonRes(400, { error: `Note is too short (min ${TEXT_MIN} characters).` });
  if (text.length > TEXT_MAX)
    return jsonRes(400, { error: `Note is too long (max ${TEXT_MAX} characters).` });
  if (!Number.isFinite(rating) || rating < 1 || rating > 5)
    return jsonRes(400, { error: "Please tap a star rating." });

  const githubBase = `https://api.github.com/repos/${OWNER}/${REPO}/contents/${CONTENT_PATH}`;
  const headers = {
    Authorization: `Bearer ${token}`,
    Accept: "application/vnd.github+json",
    "X-GitHub-Api-Version": "2022-11-28",
    "User-Agent": "cake-rush-reviews",
  };

  const testimonial = {
    id: newId("tst"),
    client_name: name,
    review_text: text,
    rating,
    location: location || null,
    sort_order: 0,
    is_active: true,
  };

  const MAX_ATTEMPTS = 4;
  for (let attempt = 1; attempt <= MAX_ATTEMPTS; attempt++) {
    // Get current content + SHA.
    const getRes = await fetch(
      `${githubBase}?ref=${BRANCH}&t=${Date.now()}`,
      { headers },
    );
    if (!getRes.ok) {
      const t = await getRes.text();
      return jsonRes(502, { error: "Could not fetch content", detail: t.slice(0, 200) });
    }
    const existing = (await getRes.json()) as { sha?: string; content?: string };
    if (!existing.sha || !existing.content)
      return jsonRes(502, { error: "Unexpected GitHub response" });

    // Decode, mutate, re-encode.
    const currentJsonStr = base64ToUtf8(existing.content.replace(/\n/g, ""));
    let current: Record<string, unknown>;
    try {
      current = JSON.parse(currentJsonStr);
    } catch {
      return jsonRes(502, { error: "content.json unreadable" });
    }
    const testimonials = Array.isArray(current.testimonials)
      ? (current.testimonials as Array<Record<string, unknown>>)
      : [];
    // Newest first: give the new one a sort_order lower than any existing.
    const minSort = testimonials.reduce(
      (m, t) => {
        const s = typeof t.sort_order === "number" ? t.sort_order : 0;
        return Math.min(m, s);
      },
      0,
    );
    testimonial.sort_order = minSort - 1;
    current.testimonials = [testimonial, ...testimonials];

    const newContent = JSON.stringify(current, null, 2) + "\n";
    const newContentB64 = utf8ToBase64(newContent);

    const putRes = await fetch(githubBase, {
      method: "PUT",
      headers: { ...headers, "Content-Type": "application/json" },
      body: JSON.stringify({
        message: `review: bouquet from ${testimonial.client_name}`,
        content: newContentB64,
        branch: BRANCH,
        sha: existing.sha,
      }),
    });

    if (putRes.ok) {
      return jsonRes(200, {
        ok: true,
        testimonial,
        note: "Review saved. Public site updates in ~30–60s.",
      });
    }

    // 409 = SHA raced with a concurrent write. Retry.
    if (putRes.status === 409 && attempt < MAX_ATTEMPTS) {
      await new Promise((r) => setTimeout(r, 200 * attempt));
      continue;
    }

    const errText = await putRes.text();
    return jsonRes(502, {
      error: "Could not save review",
      detail: errText.slice(0, 400),
    });
  }

  return jsonRes(502, { error: "Save failed after retries" });
}

export const config = {
  runtime: "edge",
};
