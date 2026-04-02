import express from 'express';
import multer from 'multer';
import { execSync, exec } from 'child_process';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const app = express();
const PORT = 3001;

const UPLOADS_DIR = path.join(__dirname, 'uploads');
const TRANSCRIPTS_DIR = path.join(__dirname, 'transcripts');

fs.mkdirSync(UPLOADS_DIR, { recursive: true });
fs.mkdirSync(TRANSCRIPTS_DIR, { recursive: true });

// Multer for video uploads (up to 500MB)
const upload = multer({
  dest: UPLOADS_DIR,
  limits: { fileSize: 500 * 1024 * 1024 },
});

app.use(express.json());

// CORS — allow EUNACOM v2 frontend to call this backend
app.use((_req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET, POST, DELETE, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Content-Type');
  if (_req.method === 'OPTIONS') return res.sendStatus(200);
  next();
});

// POST /api/transcribe — upload video, run Whisper, return transcript
app.post('/api/transcribe', upload.single('video'), async (req, res) => {
  const file = req.file;
  if (!file) {
    return res.status(400).json({ error: 'No video file uploaded' });
  }

  const videoPath = file.path;
  const baseName = `transcript_${Date.now()}`;
  const outputDir = TRANSCRIPTS_DIR;

  try {
    // Step 1: Extract audio with ffmpeg
    const audioPath = path.join(UPLOADS_DIR, `${baseName}.wav`);
    console.log(`[MedScribe] Extracting audio from ${file.originalname}...`);
    execSync(
      `ffmpeg -y -i "${videoPath}" -vn -acodec pcm_s16le -ar 16000 -ac 1 "${audioPath}"`,
      { stdio: 'pipe', timeout: 120000 }
    );

    // Step 2: Run mlx-whisper on the audio (Apple Silicon GPU accelerated)
    const mlxWhisper = path.join(__dirname, '.venv', 'bin', 'mlx_whisper');
    console.log(`[MedScribe] Running mlx-whisper transcription (GPU accelerated)...`);
    execSync(
      `"${mlxWhisper}" "${audioPath}" --model mlx-community/whisper-small-mlx --language es --output-dir "${outputDir}" --output-format txt`,
      { stdio: 'pipe', timeout: 600000 } // 10 min timeout
    );

    // Step 3: Read the transcript
    const txtFile = path.join(outputDir, `${path.basename(audioPath, '.wav')}.txt`);
    const transcript = fs.readFileSync(txtFile, 'utf-8').trim();

    // Step 4: Save transcript with metadata
    const transcriptData = {
      id: baseName,
      originalFile: file.originalname,
      transcribedAt: new Date().toISOString(),
      transcript,
    };
    const jsonPath = path.join(outputDir, `${baseName}.json`);
    fs.writeFileSync(jsonPath, JSON.stringify(transcriptData, null, 2));

    // Cleanup temp files
    fs.unlinkSync(videoPath);
    fs.unlinkSync(audioPath);
    try { fs.unlinkSync(txtFile); } catch {}

    console.log(`[MedScribe] Transcription complete: ${transcript.length} chars`);
    res.json(transcriptData);
  } catch (err: any) {
    console.error('[MedScribe] Error:', err.message);
    // Cleanup on error
    try { fs.unlinkSync(videoPath); } catch {}
    res.status(500).json({ error: `Transcription failed: ${err.message}` });
  }
});

// GET /api/transcripts — list all saved transcripts
app.get('/api/transcripts', (_req, res) => {
  const files = fs.readdirSync(TRANSCRIPTS_DIR)
    .filter(f => f.endsWith('.json'))
    .map(f => {
      const data = JSON.parse(fs.readFileSync(path.join(TRANSCRIPTS_DIR, f), 'utf-8'));
      return data;
    })
    .sort((a, b) => new Date(b.transcribedAt).getTime() - new Date(a.transcribedAt).getTime());
  res.json(files);
});

// GET /api/clases — list all generated clase JSON files (with topic, summary, quiz, keyPoints)
app.get('/api/clases', (_req, res) => {
  const files = fs.readdirSync(TRANSCRIPTS_DIR)
    .filter(f => f.endsWith('.json'))
    .map(f => {
      try {
        const data = JSON.parse(fs.readFileSync(path.join(TRANSCRIPTS_DIR, f), 'utf-8'));
        // Only return files that have the clase format (topic + quiz)
        if (data.topic && data.quiz) {
          return {
            id: f.replace('.json', ''),
            saved_at: data.savedAt || fs.statSync(path.join(TRANSCRIPTS_DIR, f)).mtime.toISOString(),
            topic: data.topic,
            summary: data.summary || '',
            key_points: JSON.stringify(data.keyPoints || []),
            quiz: JSON.stringify(data.quiz || []),
          };
        }
      } catch {}
      return null;
    })
    .filter(Boolean)
    .sort((a: any, b: any) => new Date(b.saved_at).getTime() - new Date(a.saved_at).getTime());
  res.json({ data: files });
});

// DELETE /api/clases?id=xxx — delete a clase file
app.delete('/api/clases', (req, res) => {
  const id = req.query.id as string;
  if (!id) return res.status(400).json({ error: 'id required' });
  const filePath = path.join(TRANSCRIPTS_DIR, `${id}.json`);
  try { fs.unlinkSync(filePath); } catch {}
  res.json({ ok: true });
});

// POST /api/clases — save a new clase
app.post('/api/clases', (req, res) => {
  const { id, topic, summary, keyPoints, quiz } = req.body;
  const fileName = id || `clase_${Date.now()}`;
  const filePath = path.join(TRANSCRIPTS_DIR, `${fileName}.json`);
  fs.writeFileSync(filePath, JSON.stringify({ topic, summary, keyPoints, quiz, savedAt: new Date().toISOString() }, null, 2));
  res.json({ ok: true, id: fileName });
});

app.listen(PORT, () => {
  console.log(`[MedScribe Server] Running on http://localhost:${PORT}`);
});
