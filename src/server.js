const http = require('http');
const fs = require('fs');
const path = require('path');
const { URL } = require('url');

const publicDir = path.join(__dirname, '..', 'public');

loadEnvFile();

const DEFAULT_MODEL = process.env.OPENAI_MODEL || 'gpt-3.5-turbo';

const server = http.createServer(async (req, res) => {
  try {
    const url = new URL(req.url, `http://${req.headers.host}`);

    if (req.method === 'POST' && url.pathname === '/api/chat') {
      await handleChatRequest(req, res);
      return;
    }

    if (req.method === 'GET') {
      await serveStaticFile(url.pathname, res);
      return;
    }

    res.writeHead(405, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ error: 'Method not allowed' }));
  } catch (error) {
    console.error('Unexpected server error', error);
    res.writeHead(500, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ error: 'Internal server error' }));
  }
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log(`ChatGPT relay server listening on http://localhost:${PORT}`);
});

function loadEnvFile() {
  const envPath = path.join(__dirname, '..', '.env');
  try {
    const data = fs.readFileSync(envPath, 'utf8');
    data.split(/\r?\n/).forEach((line) => {
      const trimmed = line.trim();
      if (!trimmed || trimmed.startsWith('#')) {
        return;
      }

      const equalsIndex = trimmed.indexOf('=');
      if (equalsIndex === -1) {
        return;
      }

      const key = trimmed.slice(0, equalsIndex).trim();
      const value = trimmed.slice(equalsIndex + 1).trim().replace(/^['"]|['"]$/g, '');
      if (!(key in process.env)) {
        process.env[key] = value;
      }
    });
  } catch (error) {
    if (error.code !== 'ENOENT') {
      console.warn('Could not read .env file:', error.message);
    }
  }
}

async function handleChatRequest(req, res) {
  if (!process.env.OPENAI_API_KEY) {
    res.writeHead(500, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ error: 'OPENAI_API_KEY is not configured on the server.' }));
    return;
  }

  let body = '';
  for await (const chunk of req) {
    body += chunk;
    if (body.length > 1e6) {
      res.writeHead(413, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ error: 'Request body too large' }));
      req.destroy();
      return;
    }
  }

  let payload;
  try {
    payload = JSON.parse(body || '{}');
  } catch (error) {
    res.writeHead(400, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ error: 'Request body must be valid JSON.' }));
    return;
  }

  const { messages, temperature, max_tokens: maxTokens } = payload || {};
  if (!Array.isArray(messages) || messages.length === 0) {
    res.writeHead(400, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ error: 'The "messages" array is required.' }));
    return;
  }

  const sanitizedMessages = [];
  for (const message of messages) {
    if (!message || typeof message.role !== 'string' || typeof message.content !== 'string') {
      res.writeHead(400, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ error: 'Each message must include a role and content string.' }));
      return;
    }

    sanitizedMessages.push({
      role: message.role,
      content: message.content,
    });
  }

  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 60000);

    const apiResponse = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
      },
      body: JSON.stringify({
        model: DEFAULT_MODEL,
        messages: sanitizedMessages,
        temperature: typeof temperature === 'number' ? temperature : 0.7,
        max_tokens: typeof maxTokens === 'number' ? maxTokens : undefined,
      }),
      signal: controller.signal,
    });

    clearTimeout(timeout);

    const responseBody = await apiResponse.text();
    if (!apiResponse.ok) {
      let errorMessage = 'Failed to retrieve a response from OpenAI.';
      try {
        const parsed = JSON.parse(responseBody);
        if (parsed?.error?.message) {
          errorMessage = parsed.error.message;
        }
      } catch (error) {
        // ignore JSON parse errors
      }
      console.error('OpenAI API error:', apiResponse.status, responseBody);
      res.writeHead(apiResponse.status, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ error: errorMessage }));
      return;
    }

    let parsed;
    try {
      parsed = JSON.parse(responseBody);
    } catch (error) {
      res.writeHead(502, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ error: 'Invalid response format from OpenAI.' }));
      return;
    }

    const assistantMessage = parsed?.choices?.[0]?.message?.content || '';
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(
      JSON.stringify({
        message: assistantMessage,
        usage: parsed?.usage ?? null,
      })
    );
  } catch (error) {
    if (error.name === 'AbortError') {
      res.writeHead(504, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ error: 'The OpenAI request timed out.' }));
      return;
    }

    console.error('Error contacting OpenAI:', error);
    res.writeHead(502, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ error: 'Unable to complete the request to OpenAI.' }));
  }
}

async function serveStaticFile(requestPath, res) {
  const decodedPath = decodeURIComponent(requestPath);
  const relativePath = decodedPath === '/' ? 'index.html' : decodedPath.replace(/^\/+/, '');
  const absolutePath = path.join(publicDir, relativePath);
  if (!absolutePath.startsWith(publicDir)) {
    res.writeHead(403, { 'Content-Type': 'text/plain' });
    res.end('Forbidden');
    return;
  }

  try {
    const stat = await fs.promises.stat(absolutePath);
    if (stat.isDirectory()) {
      await streamFile(path.join(absolutePath, 'index.html'), res);
      return;
    }
    await streamFile(absolutePath, res);
  } catch (error) {
    if (error.code === 'ENOENT') {
      res.writeHead(404, { 'Content-Type': 'text/plain' });
      res.end('Not Found');
    } else {
      console.error('Static file error:', error);
      res.writeHead(500, { 'Content-Type': 'text/plain' });
      res.end('Internal Server Error');
    }
  }
}

async function streamFile(filePath, res) {
  const ext = path.extname(filePath).toLowerCase();
  const contentType = getContentType(ext);
  res.writeHead(200, { 'Content-Type': contentType });
  const stream = fs.createReadStream(filePath);
  stream.pipe(res);
  stream.on('error', (error) => {
    console.error('Stream error:', error);
    if (!res.headersSent) {
      res.writeHead(500, { 'Content-Type': 'text/plain' });
    }
    res.end('Internal Server Error');
  });
}

function getContentType(ext) {
  switch (ext) {
    case '.html':
      return 'text/html; charset=utf-8';
    case '.css':
      return 'text/css; charset=utf-8';
    case '.js':
      return 'application/javascript; charset=utf-8';
    case '.json':
      return 'application/json; charset=utf-8';
    case '.svg':
      return 'image/svg+xml';
    case '.png':
      return 'image/png';
    case '.jpg':
    case '.jpeg':
      return 'image/jpeg';
    case '.ico':
      return 'image/x-icon';
    default:
      return 'application/octet-stream';
  }
}
