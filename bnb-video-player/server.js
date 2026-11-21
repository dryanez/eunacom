const express = require('express');
const fs = require('fs');
const path = require('path');
const cors = require('cors');
const os = require('os');

const app = express();
const PORT = process.env.PORT || 4100;
const R2_PUBLIC_BASE = process.env.R2_PUBLIC_BASE || 'https://pub-779a681676944ef9acf0f9492f86ba03.r2.dev';
const CLOUD_CATALOG_PATH = path.join(__dirname, 'cloud_catalog.json');

function resolveDir(envName, folderName) {
  if (process.env[envName] && fs.existsSync(process.env[envName])) {
    return path.resolve(process.env[envName]);
  }
  const candidates = [
    `D:/${folderName}`,
    path.join(os.homedir(), folderName),
    path.join(os.homedir(), 'Desktop', folderName),
    path.join(__dirname, folderName),
  ];
  if (process.platform === 'darwin' && fs.existsSync('/Volumes')) {
    try {
      for (const vol of fs.readdirSync('/Volumes')) {
        candidates.push(path.join('/Volumes', vol, folderName));
      }
    } catch (e) {}
  }
  for (const c of candidates) {
    if (fs.existsSync(c)) return path.resolve(c);
  }
  return path.resolve(`D:/${folderName}`);
}

const VIDEOS_DIR = resolveDir('BNB_DATA_DIR', 'Telegram_BnB_Videos');
const PATHOMA_DIR = resolveDir('PATHOMA_DATA_DIR', 'Telegram_Pathoma_Videos');

app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

function encodeR2Path(r2Key) {
  return `${R2_PUBLIC_BASE}/${r2Key.split('/').map(encodeURIComponent).join('/')}`;
}

const IGNORED_DIRS = new Set([
  'PDFs_and_Quizzes',
  'quizzes_extracted',
  'Step2_Remote_Worker',
  'transcripts',
  '00_Book_and_Anki_Decks',
]);

function scanTree(dir, relativePath = '', sourceType = 'bnb', r2Prefix = 'Boards_and_Beyond') {
  const result = {
    name: path.basename(dir),
    relativePath,
    type: 'directory',
    sourceType,
    children: [],
    videos: [],
  };

  if (!fs.existsSync(dir)) return result;

  const entries = fs.readdirSync(dir, { withFileTypes: true });

  for (const entry of entries) {
    if (IGNORED_DIRS.has(entry.name) || entry.name.startsWith('test_')) continue;

    const fullPath = path.join(dir, entry.name);
    const rel = relativePath ? `${relativePath}/${entry.name}` : entry.name;

    if (entry.isDirectory()) {
      const sub = scanTree(fullPath, rel, sourceType, r2Prefix);
      if (sub.children.length > 0 || sub.videos.length > 0) {
        result.children.push(sub);
      }
    } else if (entry.isFile() && /\.(mp4|mkv|webm|mov)$/i.test(entry.name)) {
      if (entry.name === 'test_parallel.mp4') continue;
      try {
        const stats = fs.statSync(fullPath);
        const r2Rel = sourceType === 'pathoma'
          ? rel.replace(/^Pathoma - Fundamentals of Pathology\//, '')
          : rel;
        const r2Key = `${r2Prefix}/${r2Rel}`;
        const r2Url = encodeR2Path(r2Key);
        const cleanTitle = sourceType === 'pathoma'
          ? entry.name.replace(/\.mp4$/i, '')
          : entry.name.replace(/^\d+[\._\s\-]+/, '').replace(/\.mp4$/i, '');

        result.videos.push({
          filename: entry.name,
          title: cleanTitle,
          relativePath: rel,
          sourceType,
          size: stats.size,
          sizeFormatted: (stats.size / (1024 * 1024)).toFixed(1) + ' MB',
          modified: stats.mtime,
          localUrl: `/api/stream?source=${sourceType}&path=${encodeURIComponent(r2Rel)}`,
          r2Url,
          url: `/api/stream?source=${sourceType}&path=${encodeURIComponent(r2Rel)}`,
        });
      } catch (e) {}
    }
  }

  result.children.sort((a, b) => a.name.localeCompare(b.name, undefined, { numeric: true }));
  result.videos.sort((a, b) => a.filename.localeCompare(b.filename, undefined, { numeric: true }));

  return result;
}

// API: Get structured curriculum tree (Local Disk + Cloudflare R2 Cloud Catalog fallback)
app.get('/api/videos', (req, res) => {
  try {
    const preferCloud = req.query.cloud === '1';
    let topNodes = [];
    let mode = 'local';

    if (!preferCloud && (fs.existsSync(VIDEOS_DIR) || fs.existsSync(PATHOMA_DIR))) {
      if (fs.existsSync(VIDEOS_DIR)) {
        const bnbTree = scanTree(VIDEOS_DIR, '', 'bnb', 'Boards_and_Beyond');
        topNodes.push(...bnbTree.children);
      }
      if (fs.existsSync(PATHOMA_DIR)) {
        const pathomaTree = scanTree(PATHOMA_DIR, 'Pathoma - Fundamentals of Pathology', 'pathoma', 'Pathoma');
        pathomaTree.name = 'Pathoma - Fundamentals of Pathology';
        if (pathomaTree.children.length > 0 || pathomaTree.videos.length > 0) {
          topNodes.push(pathomaTree);
        }
      }
    }

    // If running on another computer without local D:/ drives (or if cloud=1 requested), load from cloud_catalog.json
    if ((topNodes.length === 0 || preferCloud) && fs.existsSync(CLOUD_CATALOG_PATH)) {
      const catalog = JSON.parse(fs.readFileSync(CLOUD_CATALOG_PATH, 'utf8'));
      return res.json({
        ...catalog,
        mode: 'r2_cloud',
        storagePath: R2_PUBLIC_BASE,
      });
    }

    // Also merge Pathoma from cloud_catalog.json if local BnB exists but local Pathoma doesn't
    const hasPathoma = topNodes.some((n) => n.name.toLowerCase().includes('pathoma'));
    if (!hasPathoma && fs.existsSync(CLOUD_CATALOG_PATH)) {
      try {
        const catalog = JSON.parse(fs.readFileSync(CLOUD_CATALOG_PATH, 'utf8'));
        const cloudPathoma = (catalog.tree || []).find((n) => n.name.toLowerCase().includes('pathoma'));
        if (cloudPathoma) topNodes.push(cloudPathoma);
      } catch (e) {}
    }

    let totalCount = 0;
    let totalBytes = 0;

    function countAll(node) {
      totalCount += (node.videos || []).length;
      for (const v of node.videos || []) totalBytes += v.size || 0;
      for (const c of node.children || []) countAll(c);
    }
    for (const n of topNodes) countAll(n);

    res.json({
      tree: topNodes,
      totalVideos: totalCount,
      totalSize: (totalBytes / (1024 * 1024 * 1024)).toFixed(2) + ' GB',
      storagePath: `${VIDEOS_DIR} & ${PATHOMA_DIR}`,
      r2BaseUrl: R2_PUBLIC_BASE,
      mode,
      updatedAt: new Date().toISOString(),
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// API: Stream Video with HTTP 206 Partial Content (or redirect to Cloudflare R2 if local file missing)
app.get('/api/stream', (req, res) => {
  const relPath = req.query.path;
  const source = req.query.source || (relPath && relPath.startsWith('Pathoma') ? 'pathoma' : 'bnb');
  if (!relPath) return res.status(400).send('Missing path parameter');

  const cleanRel = relPath.replace(/^Pathoma - Fundamentals of Pathology\//, '');
  const baseDir = source === 'pathoma' ? PATHOMA_DIR : VIDEOS_DIR;
  const r2Prefix = source === 'pathoma' ? 'Pathoma' : 'Boards_and_Beyond';
  const filePath = path.join(baseDir, cleanRel);

  // If file is not present locally, redirect seamlessly to Cloudflare R2 bucket!
  if (!filePath.startsWith(baseDir) || !fs.existsSync(filePath)) {
    return res.redirect(302, encodeR2Path(`${r2Prefix}/${cleanRel}`));
  }

  const stat = fs.statSync(filePath);
  const fileSize = stat.size;
  const range = req.headers.range;

  if (range) {
    const parts = range.replace(/bytes=/, '').split('-');
    const start = parseInt(parts[0], 10);
    const maxChunk = 4 * 1024 * 1024;
    const requestedEnd = parts[1] ? parseInt(parts[1], 10) : Math.min(start + maxChunk - 1, fileSize - 1);
    const end = Math.min(requestedEnd, fileSize - 1);

    if (isNaN(start) || isNaN(end) || start > end || start >= fileSize) {
      res.writeHead(416, { 'Content-Range': `bytes */${fileSize}` });
      return res.end();
    }

    const chunksize = end - start + 1;
    const file = fs.createReadStream(filePath, { start, end });
    res.writeHead(206, {
      'Content-Range': `bytes ${start}-${end}/${fileSize}`,
      'Accept-Ranges': 'bytes',
      'Content-Length': chunksize,
      'Content-Type': 'video/mp4',
    });
    file.on('error', () => {
      if (!res.headersSent) res.status(500).end();
      else res.destroy();
    });
    res.on('close', () => file.destroy());
    file.pipe(res);
  } else {
    res.writeHead(200, {
      'Content-Length': fileSize,
      'Content-Type': 'video/mp4',
      'Accept-Ranges': 'bytes',
    });
    const file = fs.createReadStream(filePath);
    file.on('error', () => {
      if (!res.headersSent) res.status(500).end();
      else res.destroy();
    });
    res.on('close', () => file.destroy());
    file.pipe(res);
  }
});

// API: Get transcript segments for a video
app.get('/api/transcript', (req, res) => {
  const relPath = req.query.path;
  if (!relPath) return res.status(400).json({ error: 'Missing path' });

  const isPathoma = relPath.startsWith('Pathoma');
  const cleanRel = relPath.replace(/^Pathoma - Fundamentals of Pathology\//, '');
  const baseDir = isPathoma ? PATHOMA_DIR : VIDEOS_DIR;
  const transcriptsDir = path.join(baseDir, 'transcripts');
  const baseName = cleanRel.replace(/\.[^/.]+$/, '');
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

  res.json({ available: false, message: 'Transcript not generated for this lecture yet.' });
});

// API: Get Interactive Quiz for a video lesson
app.get('/api/quiz', (req, res) => {
  const relPath = req.query.path;
  if (!relPath) return res.status(400).json({ error: 'Missing path' });

  const cleanLesson = path.basename(relPath, path.extname(relPath)).replace(/^\d+[\._\s\-]+[a-z]?[\._\s\-]*/i, '').toLowerCase().replace(/[^a-z0-9]/g, '');
  const quizDir = path.join(VIDEOS_DIR, 'quizzes_extracted');

  if (fs.existsSync(quizDir)) {
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

// API: Download companion PDF (Slide Notes / Pathoma 2025 Textbook PDF)
app.get('/api/pdf', (req, res) => {
  const relPath = req.query.path || '';
  if (!relPath) return res.status(400).send('Missing path');

  if (relPath.toLowerCase().includes('pathoma')) {
    const localPathomaPdf = path.join(
      PATHOMA_DIR,
      '00_Book_and_Anki_Decks',
      'Pathoma 2025 Fundamentals of Pathology @Medicine_Its_easy.pdf'
    );
    if (fs.existsSync(localPathomaPdf)) {
      return res.download(localPathomaPdf);
    }
    return res.redirect(
      302,
      encodeR2Path('Pathoma/00_Book_and_Anki_Decks/Pathoma 2025 Fundamentals of Pathology @Medicine_Its_easy.pdf')
    );
  }

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

if (fs.existsSync(path.join(VIDEOS_DIR, 'quizzes_extracted'))) {
  app.use('/quizzes', express.static(path.join(VIDEOS_DIR, 'quizzes_extracted')));
}

app.listen(PORT, () => {
  console.log(`\n======================================================`);
  console.log(`🎬 USMLE Studio Player (Boards & Beyond + Pathoma)`);
  console.log(`👉 http://localhost:${PORT}`);
  console.log(`📂 Local BnB:     ${VIDEOS_DIR}`);
  console.log(`📂 Local Pathoma: ${PATHOMA_DIR}`);
  console.log(`☁️  Cloudflare R2: ${R2_PUBLIC_BASE}`);
  console.log(`======================================================\n`);
});
