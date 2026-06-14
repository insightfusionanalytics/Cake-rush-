// Vercel serverless function — commits the admin-edited content tree to
// `public/content.json` on the GitHub repo. The next push triggers a Vercel
// auto-deploy and the change goes live in ~30–60s.

const OWNER = process.env.GITHUB_OWNER ?? "insightfusionanalytics";
const REPO = process.env.GITHUB_REPO ?? "Cake-rush-";
const BRANCH = process.env.GITHUB_BRANCH ?? "main";
const CONTENT_PATH = "public/content.json";

function jsonRes(status: number, body: unknown) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { "Content-Type": "application/json" },
  });
}

function utf8ToBase64(input: string): string {
  // Vercel Node runtime supports Buffer; fall back to btoa for edge.
  if (typeof Buffer !== "undefined") return Buffer.from(input, "utf-8").toString("base64");
  // eslint-disable-next-line no-undef
  return btoa(unescape(encodeURIComponent(input)));
}

export default async function handler(req: Request): Promise<Response> {
  if (req.method !== "POST") return jsonRes(405, { error: "Method not allowed" });

  const token = process.env.GITHUB_PAT;
  if (!token) return jsonRes(500, { error: "GITHUB_PAT not configured" });

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return jsonRes(400, { error: "Invalid JSON" });
  }

  // Minimal sanity check — make sure required top-level keys exist.
  const required = [
    "settings",
    "menu_categories",
    "menu_items",
    "menu_item_prices",
    "gallery_images",
    "testimonials",
  ];
  if (typeof body !== "object" || body === null) {
    return jsonRes(400, { error: "Body must be an object" });
  }
  const obj = body as Record<string, unknown>;
  for (const k of required) {
    if (!(k in obj)) return jsonRes(400, { error: `Missing field: ${k}` });
  }
  // Default house_favourites to [] if the caller omitted it (older clients).
  if (!("house_favourites" in obj)) obj.house_favourites = [];

  const githubBase = `https://api.github.com/repos/${OWNER}/${REPO}/contents/${CONTENT_PATH}`;
  const headers = {
    Authorization: `Bearer ${token}`,
    Accept: "application/vnd.github+json",
    "X-GitHub-Api-Version": "2022-11-28",
    "User-Agent": "cake-rush-admin",
  };

  const newContent = JSON.stringify(body, null, 2) + "\n";
  const newContentB64 = utf8ToBase64(newContent);

  // Retry on 409 SHA-conflict. Happens when two saves race each other —
  // common when the admin clicks Save quickly twice, has /admin open in
  // multiple tabs, or saves while Vercel's previous build is still settling.
  // Each retry re-fetches the freshest SHA and tries the PUT again.
  const MAX_ATTEMPTS = 4;
  let lastError: { status: number; body: string } | null = null;

  for (let attempt = 1; attempt <= MAX_ATTEMPTS; attempt++) {
    // Get the current file SHA (required to update an existing file).
    const getRes = await fetch(
      `${githubBase}?ref=${BRANCH}&t=${Date.now()}`,
      { headers },
    );
    if (!getRes.ok && getRes.status !== 404) {
      const t = await getRes.text();
      return jsonRes(502, { error: "GitHub GET failed", detail: t.slice(0, 200) });
    }
    let sha: string | undefined;
    if (getRes.ok) {
      const existing = (await getRes.json()) as { sha?: string };
      sha = existing.sha;
    }

    const putRes = await fetch(githubBase, {
      method: "PUT",
      headers: { ...headers, "Content-Type": "application/json" },
      body: JSON.stringify({
        message: "admin: update content.json",
        content: newContentB64,
        branch: BRANCH,
        ...(sha ? { sha } : {}),
      }),
    });

    if (putRes.ok) {
      const result = (await putRes.json()) as {
        commit?: { sha?: string; html_url?: string };
      };
      return jsonRes(200, {
        ok: true,
        commit_sha: result.commit?.sha,
        commit_url: result.commit?.html_url,
        attempts: attempt,
        note: "Vercel will redeploy in ~30–60s; the change is then live on the public site.",
      });
    }

    const errText = await putRes.text();
    lastError = { status: putRes.status, body: errText };

    // 409 = SHA conflict (someone else committed between our GET and PUT).
    // Retry with a backoff to give the racing write time to settle.
    if (putRes.status === 409 && attempt < MAX_ATTEMPTS) {
      await new Promise((r) => setTimeout(r, 200 * attempt));
      continue;
    }

    break;
  }

  return jsonRes(502, {
    error: "GitHub PUT failed",
    detail: lastError?.body.slice(0, 400) ?? "",
    note:
      lastError?.status === 409
        ? "Conflict persisted after retries — another save likely landed simultaneously. Try Save again."
        : undefined,
  });
}

export const config = {
  runtime: "edge",
};
