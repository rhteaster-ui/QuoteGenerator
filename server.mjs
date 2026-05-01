import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import bodyparser from 'body-parser';

import fakeig from './fakeig.mjs';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const app = express();
const port = process.env.PORT || 3000;

app.use(bodyparser.json({ limit: '50mb' }));
app.use(express.static(path.join(__dirname, 'public')));

app.post('/api/generate', async (req, res) => {
    try {
        let { pp, name, text } = req.body ?? {};

        if (!pp) {
            pp = 'https://raw.githubusercontent.com/uploader762/dat4/main/uploads/e0f993-1777126212302.jpg';
        }

        const buffer = await fakeig.run(pp, name, text);
        res.set('Content-Type', 'image/png');
        res.send(buffer);
    } catch (error) {
        console.error(
            JSON.stringify({
                level: 'error',
                message: 'failed_to_generate_story_image',
                error: error?.message || String(error)
            })
        );
        res.status(500).json({ error: 'Gagal merender gambar' });
    }
});

app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

if (!process.env.VERCEL) {
    app.listen(port, () => {
        console.log(
            JSON.stringify({
                level: 'info',
                message: 'storygen_server_started',
                url: `http://localhost:${port}`
            })
        );
    });
}

export default app;
