import express, { Request, Response } from 'express';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import { GoogleGenAI } from '@google/genai';
import { handleApiRequest } from './src/server/apiRouter';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

function resolvePort(): number {
  const portArgIndex = process.argv.indexOf('--port');
  if (portArgIndex !== -1 && process.argv[portArgIndex + 1]) {
    const cliPort = Number(process.argv[portArgIndex + 1]);
    if (Number.isFinite(cliPort) && cliPort > 0) return cliPort;
  }
  const envPort = Number(process.env.PORT);
  const defaultAppPort = Number(process.env.DEFAULT_APP_PORT);
  if (
    process.env.NODE_ENV !== 'production' &&
    envPort === Number(process.env.NGINX_PORT) &&
    Number.isFinite(defaultAppPort) &&
    defaultAppPort > 0
  ) {
    return defaultAppPort;
  }
  return Number.isFinite(envPort) && envPort > 0 ? envPort : defaultAppPort || 3000;
}

const app = express();
const PORT = resolvePort();

function createNodeGeminiClient(apiKey: string) {
  return new GoogleGenAI({
    apiKey,
    httpOptions: {
      headers: {
        'User-Agent': 'aistudio-build',
      },
    },
  });
}

// Parse API payloads as raw text (up to 10MB) so Web Standard Request receives exact body
app.use('/api', express.text({ type: '*/*', limit: '10mb' }));

// Delegate all /api/* endpoints to the shared Edge-compatible Web Standard router
app.all('/api/*', async (req: Request, res: Response) => {
  try {
    const host = req.get('host') || `localhost:${PORT}`;
    const targetUrl = `${req.protocol}://${host}${req.originalUrl}`;
    const headers = new Headers();
    for (const [key, value] of Object.entries(req.headers)) {
      if (typeof value === 'string') {
        headers.set(key, value);
      } else if (Array.isArray(value)) {
        headers.set(key, value.join(', '));
      }
    }

    const method = req.method.toUpperCase();
    const hasBody = method !== 'GET' && method !== 'HEAD' && method !== 'OPTIONS';
    const rawBody =
      hasBody && typeof req.body === 'string'
        ? req.body
        : hasBody && req.body && typeof req.body === 'object'
        ? JSON.stringify(req.body)
        : undefined;

    const webRequest = new globalThis.Request(targetUrl, {
      method,
      headers,
      body: rawBody,
    });

    const webResponse = await handleApiRequest(webRequest, {
      GEMINI_API_KEY: process.env.GEMINI_API_KEY,
      RUNTIME: 'node',
      createGeminiClient: createNodeGeminiClient,
    });

    res.status(webResponse.status);
    webResponse.headers.forEach((value, key) => {
      if (key.toLowerCase() !== 'content-encoding' && key.toLowerCase() !== 'transfer-encoding') {
        res.setHeader(key, value);
      }
    });

    if (webResponse.status === 204) {
      return res.end();
    }
    const text = await webResponse.text();
    return res.send(text);
  } catch (err) {
    console.error('Express API adapter error:', err);
    return res.status(500).json({ error: 'เกิดข้อผิดพลาดภายในเซิร์ฟเวอร์' });
  }
});

// Vite middleware in dev, static files in production
async function startServer() {
  if (process.env.NODE_ENV === 'production') {
    app.use(express.static(path.resolve(__dirname, 'dist')));
    app.get('*', (_req: Request, res: Response) => {
      res.sendFile(path.resolve(__dirname, 'dist', 'index.html'));
    });
  } else {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`[DeutschSchreiben AI] Server listening on port ${PORT}`);
  });
}

startServer().catch((err) => {
  console.error('Fatal error starting server:', err);
  process.exit(1);
});
