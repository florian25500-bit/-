import { GoogleGenAI } from '@google/genai/web';
import { handleApiRequest, type EdgeKVNamespace } from '../src/server/apiRouter';

export interface CloudflareWorkerEnv {
  GEMINI_API_KEY?: string;
  DEUTSCHSCHREIBEN_KV?: EdgeKVNamespace;
  ASSETS: {
    fetch(request: Request | string): Promise<Response>;
  };
}

function createEdgeGeminiClient(apiKey: string) {
  return new GoogleGenAI({
    apiKey,
    httpOptions: {
      headers: {
        'User-Agent': 'aistudio-build',
      },
    },
  });
}

function addSecurityHeaders(response: Response): Response {
  const headers = new Headers(response.headers);
  if (!headers.has('X-Content-Type-Options')) {
    headers.set('X-Content-Type-Options', 'nosniff');
  }
  if (!headers.has('Referrer-Policy')) {
    headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');
  }
  if (!headers.has('Cross-Origin-Opener-Policy')) {
    headers.set('Cross-Origin-Opener-Policy', 'same-origin-allow-popups');
  }
  return new Response(response.body, {
    status: response.status,
    statusText: response.statusText,
    headers,
  });
}

export default {
  async fetch(request: Request, env: CloudflareWorkerEnv): Promise<Response> {
    const url = new URL(request.url);

    // Handle all backend API endpoints on the Cloudflare Edge
    if (url.pathname === '/api' || url.pathname.startsWith('/api/')) {
      return handleApiRequest(request, {
        GEMINI_API_KEY: env.GEMINI_API_KEY,
        DEUTSCHSCHREIBEN_KV: env.DEUTSCHSCHREIBEN_KV,
        RUNTIME: 'cloudflare-worker',
        createGeminiClient: createEdgeGeminiClient,
      });
    }

    // Serve static frontend assets (with SPA fallback handled by wrangler.jsonc assets config)
    const assetResponse = await env.ASSETS.fetch(request);
    return addSecurityHeaders(assetResponse);
  },
};
