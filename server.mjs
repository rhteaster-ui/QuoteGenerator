import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import bodyparser from 'body-parser';

// Import script core asli yang 230 baris itu
import fakeig from './fakeig.mjs';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const app = express();
const port = process.env.PORT || 3000;
const isVercel = Boolean(process.env.VERCEL);

// Setting limit 50mb karena file gambar Base64 ukurannya bisa lumayan besar
app.use(bodyparser.json({ limit: '50mb' }));

// Serve static assets dari root project (index.html ada di root)
app.use(express.static('.'));

// Endpoint API untuk memanggil script fakeig.mjs
app.post('/api/generate', async (req, res) => {
    try {
        let { pp, name, text } = req.body;
        
        // ==========================================
        // PENCEGAHAN ERROR (FALLBACK)
        // Jika user tidak upload foto profil dari web, 
        // gunakan foto default agar skia-canvas tidak crash.
        // ==========================================
        if (!pp) {
            pp = 'https://raw.githubusercontent.com/uploader762/dat4/main/uploads/e0f993-1777126212302.jpg';
        }
        
        // Panggil fungsi run() dari fakeig.mjs yang 230 baris itu
        const buffer = await fakeig.run(pp, name, text);
        
        // Kirim hasil render kembali ke web sebagai gambar PNG
        res.set('Content-Type', 'image/png');
        res.send(buffer);
        
    } catch (error) {
        console.error("Terjadi error di backend saat generate:", error);
        res.status(500).json({ error: 'Gagal merender gambar' });
    }
});

if (!isVercel) {
    app.listen(port, () => {
        console.log(`🚀 StoryGen Backend running at http://localhost:${port}`);
        console.log(`Buka browser dan arahkan ke http://localhost:${port}`);
    });
}

export default app;
