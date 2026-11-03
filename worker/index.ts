// Cloudflare Worker entry: routes /api/* to the existing edge handlers and
// serves the Vite build (with SPA fallback) for everything else.
import saveContent from "../api/save-content";
import submitReview from "../api/submit-review";
import uploadImage from "../api/upload-image";

type Handler = (req: Request) => Promise<Response>;

const routes: Record<string, Handler> = {
  "/api/save-content": saveContent,
  "/api/submit-review": submitReview,
  "/api/upload-image": uploadImage,
};

interface Env {
  ASSETS: Fetcher;
}

export default {
  async fetch(req: Request, env: Env): Promise<Response> {
    const { pathname } = new URL(req.url);
    const handler = routes[pathname.replace(/\/$/, "")];
    if (handler) return handler(req);
    if (pathname.startsWith("/api/")) return new Response("Not found", { status: 404 });
    return env.ASSETS.fetch(req);
  },
};
