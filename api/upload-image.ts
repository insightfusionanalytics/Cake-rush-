// Vercel serverless function — commits an uploaded image into the GitHub repo
// under `public/uploads/`. Returns the public URL of the new image.

const OWNER = process.env.GITHUB_OWNER ?? "Ajinkyaa2004";
const REPO = process.env.GITHUB_REPO ?? "cake-studio-refine";
const BRANCH = process.env.GITHUB_BRANCH ?? "main";
const UPLOAD_DIR = "public/uploads";

const MAX_BYTES = 4 * 1024 * 1024; // 4 MB per image — keep the repo from bloating

function jsonRes(status: number, body: unknown) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { "Content-Type": "application/json" },
  });
}

function sanitize(name: string): string {
  return name
    .replace(/[^a-zA-Z0-9._-]+/g, "-")
    .replace(/-+/g, "-")
    .toLowerCase()
    .slice(0, 80);
}

export default async function handler(req: Request): Promise<Response> {
  if (req.method !== "POST") return jsonRes(405, { error: "Method not allowed" });

  const token = process.env.GITHUB_PAT;
  if (!token) return jsonRes(500, { error: "GITHUB_PAT not configured" });

  let body: { filename?: string; folder?: string; data_base64?: string };
  try {
    body = (await req.json()) as typeof body;
  } catch {
    return jsonRes(400, { error: "Invalid JSON" });
  }

  if (!body.filename || !body.data_base64) {
    return jsonRes(400, { error: "filename and data_base64 are required" });
  }

  // Trim a possible data URL prefix like `data:image/png;base64,`.
  const dataB64 = body.data_base64.replace(/^data:[^;]+;base64,/, "");
  const approxBytes = Math.floor((dataB64.length * 3) / 4);
  if (approxBytes > MAX_BYTES) {
    return jsonRes(413, {
      error: `Image too large (${(approxBytes / 1024 / 1024).toFixed(1)} MB). Max is 4 MB.`,
    });
  }

  const folder = body.folder ? sanitize(body.folder) : "";
  const safeName = sanitize(body.filename);
  const stamped = `${Date.now()}_${safeName}`;
  const path = folder
    ? `${UPLOAD_DIR}/${folder}/${stamped}`
    : `${UPLOAD_DIR}/${stamped}`;
  const publicUrl = `/${path.replace(/^public\//, "")}`;

  const url = `https://api.github.com/repos/${OWNER}/${REPO}/contents/${path}`;
  const headers = {
    Authorization: `Bearer ${token}`,
    Accept: "application/vnd.github+json",
    "X-GitHub-Api-Version": "2022-11-28",
    "User-Agent": "cake-rush-admin",
    "Content-Type": "application/json",
  };

  const putRes = await fetch(url, {
    method: "PUT",
    headers,
    body: JSON.stringify({
      message: `admin: upload ${stamped}`,
      content: dataB64,
      branch: BRANCH,
    }),
  });

  if (!putRes.ok) {
    const t = await putRes.text();
    return jsonRes(502, { error: "GitHub PUT failed", detail: t.slice(0, 400) });
  }

  return jsonRes(200, { ok: true, url: publicUrl });
}

export const config = {
  runtime: "edge",
};
