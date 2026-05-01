import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import bodyparser from 'body-parser';
import crypto from 'crypto';

import fakeig from './fakeig.mjs';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const app = express();
const port = Number(process.env.PORT || 3000);

function log(level, message, meta = {}) {
  process.stdout.write(`${JSON.stringify({ timestamp: new Date().toISOString(), level, message, ...meta })}\n`);
}

app.use(bodyparser.json({ limit: '50mb' }));
app.use(express.static(path.join(__dirname, 'public')));

app.get('/api/healthz', (req, res) => {
  res.status(200).json({ ok: true, service: 'storygen-web' });
});

app.post('/api/generate', async (req, res) => {
  const correlationId = req.headers['x-correlation-id'] || crypto.randomUUID();

  try {
    let { pp, name, text } = req.body ?? {};

    if (!name || !text) {
      return res.status(400).json({ error: 'name dan text wajib diisi', correlationId });
    }

    if (!pp) {
      pp = 'https://raw.githubusercontent.com/uploader762/dat4/main/uploads/e0f993-1777126212302.jpg';
    }

    const buffer = await fakeig.run(pp, name, text);
    res.set('x-correlation-id', String(correlationId));
    res.set('Content-Type', 'image/png');
    res.send(buffer);
  } catch (error) {
    log('error', 'generate_failed', {
      correlationId,
      error: error instanceof Error ? error.message : String(error)
    });
    res.status(500).json({ error: 'Gagal merender gambar', correlationId });
  }
});

app.get('*', (_req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

if (!process.env.VERCEL) {
  app.listen(port, () => {
    log('info', 'server_started', { port });
  });
}

export default app;
