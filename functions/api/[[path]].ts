import { GoogleGenAI } from '@google/genai/web';
import { handleApiRequest, type EdgeKVNamespace } from '../../src/server/apiRouter';

interface PagesEnv {
  GEMINI_API_KEY?: string;
  DEUTSCHSCHREIBEN_KV?: EdgeKVNamespace;
}

interface PagesFunctionContext {
  request: Request;
  env: PagesEnv;
}

function createPagesGeminiClient(apiKey: string) {
  return new GoogleGenAI({
    apiKey,
    httpOptions: {
      headers: {
        'User-Agent': 'aistudio-build',
      },
    },
  });
}

export const onRequest = async (context: PagesFunctionContext): Promise<Response> => {
  return handleApiRequest(context.request, {
    GEMINI_API_KEY: context.env.GEMINI_API_KEY,
    DEUTSCHSCHREIBEN_KV: context.env.DEUTSCHSCHREIBEN_KV,
    RUNTIME: 'cloudflare-pages',
    createGeminiClient: createPagesGeminiClient,
  });
};
