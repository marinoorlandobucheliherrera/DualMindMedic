
// src/app/api/ollama/[[...path]]/route.ts
import {NextRequest, NextResponse} from 'next/server';

// Use the explicit IP address for localhost to prevent resolution issues.
const OLLAMA_HOST = process.env.OLLAMA_HOST || 'http://127.0.0.1:11434';

async function handler(req: NextRequest) {
  const path = req.nextUrl.pathname.replace('/api/ollama', '');
  const url = `${OLLAMA_HOST}/api${path}`;

  try {
    const ollamaResponse = await fetch(url, {
      method: req.method,
      headers: {
        'Content-Type': 'application/json',
      },
      body: req.body,
      // Duplex stream is required for streaming responses
      // @ts-ignore
      duplex: 'half',
    });

    return new NextResponse(ollamaResponse.body, {
      status: ollamaResponse.status,
      statusText: ollamaResponse.statusText,
      headers: {
        'Content-Type': ollamaResponse.headers.get('Content-Type') || 'application/json',
      },
    });
  } catch (e: any) {
    console.error(`Error proxying to Ollama: ${e.message}`);
    // Return the underlying error for better debugging
    return new NextResponse(JSON.stringify({error: e.message}), {
      status: 500,
      statusText: 'Internal Server Error',
    });
  }
}

export const GET = handler;
export const POST = handler;
