const http = require('http');
const fs = require('fs');
const path = require('path');
const { assemble } = require('../scripts/assemble_video');

const PORT = process.env.PORT || 5180;
const STUDIO_DIR = path.resolve(__dirname);
const DATA_PATH = path.resolve(__dirname, '../data/videos_catalog.json');
const FINISHED_DIR = path.resolve(__dirname, '../Finished');

const MIME_TYPES = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.mp4': 'video/mp4',
  '.txt': 'text/plain; charset=utf-8',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.svg': 'image/svg+xml'
};

const server = http.createServer((req, res) => {
  // CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    res.writeHead(204);
    res.end();
    return;
  }

  const parsedUrl = new URL(req.url, `http://${req.headers.host}`);
  let pathname = parsedUrl.pathname;

  // API endpoint: /api/videos
  if (pathname === '/api/videos') {
    try {
      if (fs.existsSync(DATA_PATH)) {
        const data = fs.readFileSync(DATA_PATH, 'utf8');
        res.writeHead(200, { 'Content-Type': 'application/json; charset=utf-8' });
        res.end(data);
      } else {
        res.writeHead(404, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ error: 'Catalog not found' }));
      }
    } catch (err) {
      res.writeHead(500, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ error: err.message }));
    }
    return;
  }

  // API endpoint: /api/finished
  if (pathname === '/api/finished') {
    try {
      if (fs.existsSync(FINISHED_DIR)) {
        const files = fs.readdirSync(FINISHED_DIR).filter(f => f.endsWith('.mp4') || f.endsWith('.txt'));
        res.writeHead(200, { 'Content-Type': 'application/json; charset=utf-8' });
        res.end(JSON.stringify(files));
      } else {
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify([]));
      }
    } catch (err) {
      res.writeHead(500, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ error: err.message }));
    }
    return;
  }

  // API endpoint: POST /api/assemble
  if (pathname === '/api/assemble' && req.method === 'POST') {
    try {
      const result = assemble();
      res.writeHead(200, { 'Content-Type': 'application/json; charset=utf-8' });
      res.end(JSON.stringify(result));
    } catch (err) {
      res.writeHead(500, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ error: err.message }));
    }
    return;
  }

  // Serve finished video files from /finished/<filename> with HTTP Range support
  if (pathname.startsWith('/finished/')) {
    const filename = path.basename(pathname);
    const filePath = path.join(FINISHED_DIR, filename);
    if (fs.existsSync(filePath)) {
      const stat = fs.statSync(filePath);
      const fileSize = stat.size;
      const ext = path.extname(filePath).toLowerCase();
      const contentType = MIME_TYPES[ext] || 'application/octet-stream';
      const range = req.headers.range;

      if (range) {
        const parts = range.replace(/bytes=/, "").split("-");
        const start = parseInt(parts[0], 10);
        const end = parts[1] ? parseInt(parts[1], 10) : fileSize - 1;
        const chunksize = (end - start) + 1;
        const file = fs.createReadStream(filePath, { start, end });
        res.writeHead(206, {
          'Content-Range': `bytes ${start}-${end}/${fileSize}`,
          'Accept-Ranges': 'bytes',
          'Content-Length': chunksize,
          'Content-Type': contentType,
        });
        file.pipe(res);
      } else {
        res.writeHead(200, {
          'Content-Length': fileSize,
          'Content-Type': contentType,
          'Accept-Ranges': 'bytes'
        });
        fs.createReadStream(filePath).pipe(res);
      }
      return;
    }
  }

  // Static files in Studio
  if (pathname === '/' || pathname === '') {
    pathname = '/index.html';
  }

  const filePath = path.join(STUDIO_DIR, pathname);
  const ext = path.extname(filePath).toLowerCase();
  const contentType = MIME_TYPES[ext] || 'application/octet-stream';

  fs.readFile(filePath, (err, content) => {
    if (err) {
      if (err.code === 'ENOENT') {
        res.writeHead(404, { 'Content-Type': 'text/plain' });
        res.end('404 Not Found');
      } else {
        res.writeHead(500, { 'Content-Type': 'text/plain' });
        res.end(`Server Error: ${err.code}`);
      }
    } else {
      res.writeHead(200, { 'Content-Type': contentType });
      res.end(content);
    }
  });
});

server.listen(PORT, () => {
  console.log(`\n======================================================`);
  console.log(`🚀 EUNACOM Content Studio running at:`);
  console.log(`👉 http://localhost:${PORT}`);
  console.log(`======================================================\n`);
});
