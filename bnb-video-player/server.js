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

// Ensure directory exists
if (!fs.existsSync(VIDEOS_DIR)) {
  fs.mkdirSync(VIDEOS_DIR, { recursive: true });
}

// API: List all topics and downloaded videos
app.get('/api/videos', (req, res) => {
  try {
    const topicsMap = {};
    let totalCount = 0;
    let totalBytes = 0;

    // Read manifest if available
    const manifestPath = path.join(VIDEOS_DIR, 'telegram_video_manifest.json');
    let manifest = {};
    if (fs.existsSync(manifestPath)) {
      try {
        manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf8'));
      } catch (e) {}
    }

    if (fs.existsSync(VIDEOS_DIR)) {
      const entries = fs.readdirSync(VIDEOS_DIR, { withFileTypes: true });

      for (const entry of entries) {
        if (entry.isDirectory()) {
          const topicName = entry.name;
          const topicPath = path.join(VIDEOS_DIR, topicName);
          const files = fs.readdirSync(topicPath, { withFileTypes: true });

          const videos = [];
          for (const file of files) {
            if (file.isFile() && /\.(mp4|mkv|webm|mov)$/i.test(file.name)) {
              const filePath = path.join(topicPath, file.name);
              const stats = fs.statSync(filePath);
              totalCount++;
              totalBytes += stats.size;

              // Find manifest info if exists
              let meta = null;
              for (const id in manifest) {
                if (manifest[id].filename === file.name || manifest[id].local_path?.includes(file.name)) {
                  meta = manifest[id];
                  break;
                }
              }

              videos.push({
                filename: file.name,
                topic: topicName,
                size: stats.size,
                sizeFormatted: (stats.size / (1024 * 1024)).toFixed(1) + ' MB',
                modified: stats.mtime,
                duration: meta?.duration || null,
                caption: meta?.caption || '',
                url: `/api/stream/${encodeURIComponent(topicName)}/${encodeURIComponent(file.name)}`,
              });
            }
          }

          if (videos.length > 0) {
            // Sort videos naturally
            videos.sort((a, b) => a.filename.localeCompare(b.filename, undefined, { numeric: true }));
            topicsMap[topicName] = videos;
          }
        }
      }
    }

    res.json({
      topics: topicsMap,
      totalVideos: totalCount,
      totalSize: (totalBytes / (1024 * 1024 * 1024)).toFixed(2) + ' GB',
      storagePath: VIDEOS_DIR,
      updatedAt: new Date().toISOString(),
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// API: Stream Video with HTTP 206 Partial Content (Instant Seeking)
app.get('/api/stream/:topic/:filename', (req, res) => {
  const { topic, filename } = req.params;
  const filePath = path.join(VIDEOS_DIR, topic, filename);

  if (!fs.existsSync(filePath)) {
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

app.listen(PORT, () => {
  console.log(`\n======================================================`);
  console.log(`🎬 BnB Video Player Studio running at:`);
  console.log(`👉 http://localhost:${PORT}`);
  console.log(`📂 Serving videos from: ${VIDEOS_DIR}`);
  console.log(`======================================================\n`);
});
