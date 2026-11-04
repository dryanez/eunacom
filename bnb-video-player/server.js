const express = require('express');
const fs = require('fs');
const path = require('path');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 4100;
const VIDEOS_DIR = path.resolve('D:/Telegram_BnB_Videos');

app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

if (!fs.existsSync(VIDEOS_DIR)) {
  fs.mkdirSync(VIDEOS_DIR, { recursive: true });
}

// Recursive directory crawler to build full Step 1 / Step 2 hierarchy
function scanTree(dir, relativePath = '') {
  const result = {
    name: path.basename(dir),
    relativePath,
    type: 'directory',
    children: [],
    videos: [],
  };

  if (!fs.existsSync(dir)) return result;

  const entries = fs.readdirSync(dir, { withFileTypes: true });

  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);
    const rel = relativePath ? `${relativePath}/${entry.name}` : entry.name;

    if (entry.isDirectory()) {
      const sub = scanTree(fullPath, rel);
      if (sub.children.length > 0 || sub.videos.length > 0) {
        result.children.push(sub);
      }
    } else if (entry.isFile() && /\.(mp4|mkv|webm|mov)$/i.test(entry.name)) {
      try {
        const stats = fs.statSync(fullPath);
        result.videos.push({
          filename: entry.name,
          title: entry.name.replace(/^\d+[\._\s\-]+/, '').replace(/\.mp4$/i, ''),
          relativePath: rel,
          size: stats.size,
          sizeFormatted: (stats.size / (1024 * 1024)).toFixed(1) + ' MB',
          modified: stats.mtime,
          url: `/api/stream?path=${encodeURIComponent(rel)}`,
        });
      } catch (e) {}
    }
  }

  // Sort children naturally
  result.children.sort((a, b) => a.name.localeCompare(b.name, undefined, { numeric: true }));
  result.videos.sort((a, b) => a.filename.localeCompare(b.filename, undefined, { numeric: true }));

  return result;
}

// API: Get structured curriculum tree
app.get('/api/videos', (req, res) => {
  try {
    const tree = scanTree(VIDEOS_DIR);

    // Calculate totals
    let totalCount = 0;
    let totalBytes = 0;

    function countAll(node) {
      totalCount += node.videos.length;
      for (const v of node.videos) totalBytes += v.size;
      for (const c of node.children) countAll(c);
    }
    countAll(tree);

    res.json({
      tree: tree.children, // [Step 1 - Preclinical, Step 2 - Clinical, ...]
      totalVideos: totalCount,
      totalSize: (totalBytes / (1024 * 1024 * 1024)).toFixed(2) + ' GB',
      storagePath: VIDEOS_DIR,
      updatedAt: new Date().toISOString(),
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// API: Stream Video with HTTP 206 Partial Content (Instant Seeking for any nested path)
app.get('/api/stream', (req, res) => {
  const relPath = req.query.path;
  if (!relPath) return res.status(400).send('Missing path parameter');

  const filePath = path.join(VIDEOS_DIR, relPath);

  // Security check: ensure path is within VIDEOS_DIR
  if (!filePath.startsWith(VIDEOS_DIR) || !fs.existsSync(filePath)) {
    return res.status(404).send('Video not found');
  }

  const stat = fs.statSync(filePath);
  const fileSize = stat.size;
  const range = req.headers.range;

  if (range) {
    const parts = range.replace(/bytes=/, '').split('-');
    const start = parseInt(parts[0], 10);
    const end = parts[1] ? parseInt(parts[1], 10) : fileSize - 1;
    const chunksize = end - start + 1;
    const file = fs.createReadStream(filePath, { start, end });
    const head = {
      'Content-Range': `bytes ${start}-${end}/${fileSize}`,
      'Accept-Ranges': 'bytes',
      'Content-Length': chunksize,
      'Content-Type': 'video/mp4',
    };
    res.writeHead(206, head);
    file.pipe(res);
  } else {
    const head = {
      'Content-Length': fileSize,
      'Content-Type': 'video/mp4',
    };
    res.writeHead(200, head);
    fs.createReadStream(filePath).pipe(res);
  }
});

// API: Get transcript segments for a video
app.get('/api/transcript', (req, res) => {
  const relPath = req.query.path;
  if (!relPath) return res.status(400).json({ error: 'Missing path' });

  const transcriptsDir = path.join(VIDEOS_DIR, 'transcripts');
  const baseName = relPath.replace(/\.[^/.]+$/, '');
  const jsonPath = path.join(transcriptsDir, `${baseName}.json`);
  const txtPath = path.join(transcriptsDir, `${baseName}.txt`);

  if (fs.existsSync(jsonPath)) {
    try {
      const data = JSON.parse(fs.readFileSync(jsonPath, 'utf8'));
      return res.json({ available: true, ...data });
    } catch (e) {}
  } else if (fs.existsSync(txtPath)) {
    const text = fs.readFileSync(txtPath, 'utf8');
    return res.json({ available: true, full_text: text, segments: [] });
  }

  res.json({ available: false, message: 'Transcript generating in background...' });
});

// API: Get Interactive Quiz for a video lesson
app.get('/api/quiz', (req, res) => {
  const relPath = req.query.path;
  if (!relPath) return res.status(400).json({ error: 'Missing path' });

  const cleanLesson = path.basename(relPath, path.extname(relPath)).replace(/^\d+[\._\s\-]+/, '').toLowerCase().replace(/[^a-z0-9]/g, '');
  const quizDir = path.join(VIDEOS_DIR, 'quizzes_extracted');

  if (fs.existsSync(quizDir)) {
    // Search for matching quiz.json
    function findQuiz(dir) {
      const entries = fs.readdirSync(dir, { withFileTypes: true });
      for (const e of entries) {
        const full = path.join(dir, e.name);
        if (e.isDirectory()) {
          const found = findQuiz(full);
          if (found) return found;
        } else if (e.name === 'quiz.json') {
          const parentClean = path.basename(dir).replace(/^\d+[\._\s\-]+/, '').toLowerCase().replace(/[^a-z0-9]/g, '');
          if (parentClean.includes(cleanLesson) || cleanLesson.includes(parentClean)) {
            return full;
          }
        }
      }
      return null;
    }

    const matchedQuiz = findQuiz(quizDir);
    if (matchedQuiz) {
      try {
        const data = JSON.parse(fs.readFileSync(matchedQuiz, 'utf8'));
        return res.json({ available: true, ...data });
      } catch (e) {}
    }
  }

  res.json({ available: false, message: 'No quiz available for this topic yet.' });
});

// API: Download companion PDF (Slide Notes / Slide Book)
app.get('/api/pdf', (req, res) => {
  const relPath = req.query.path;
  if (!relPath) return res.status(400).send('Missing path');

  const pdfDir = path.join(VIDEOS_DIR, 'PDFs_and_Quizzes', 'Slides_and_Notes');
  const cleanLesson = path.basename(relPath, path.extname(relPath)).replace(/^\d+[\._\s\-]+/, '').toLowerCase().replace(/[^a-z0-9]/g, '');

  if (fs.existsSync(pdfDir)) {
    function findPdf(dir) {
      const entries = fs.readdirSync(dir, { withFileTypes: true });
      for (const e of entries) {
        const full = path.join(dir, e.name);
        if (e.isDirectory()) {
          const found = findPdf(full);
          if (found) return found;
        } else if (e.name.toLowerCase().endsWith('.pdf')) {
          const fClean = e.name.toLowerCase().replace(/[^a-z0-9]/g, '');
          if (fClean.includes(cleanLesson) || cleanLesson.includes(fClean)) {
            return full;
          }
        }
      }
      return null;
    }

    const matchedPdf = findPdf(pdfDir);
    if (matchedPdf) {
      return res.download(matchedPdf);
    }
  }

  res.status(404).send('No PDF companion found for this lesson.');
});

// Serve extracted quiz images statically
app.use('/quizzes', express.static(path.join(VIDEOS_DIR, 'quizzes_extracted')));

app.listen(PORT, () => {
  console.log(`\n======================================================`);
  console.log(`🎬 Boards & Beyond Player Studio running at:`);
  console.log(`👉 http://localhost:${PORT}`);
  console.log(`📂 Serving Step 1 & Step 2 from: ${VIDEOS_DIR}`);
  console.log(`======================================================\n`);
});

