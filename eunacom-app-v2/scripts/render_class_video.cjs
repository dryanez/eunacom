#!/usr/bin/env node

/**
 * EUNACOM 2026 - Automated 1080p MP4 Video Exporter (Fast Pipeline)
 */

const fs = require("fs");
const path = require("path");
const { execSync } = require("child_process");
const puppeteer = require("puppeteer");

const args = process.argv.slice(2).reduce((acc, arg) => {
  const [k, v] = arg.replace(/^--/, "").split("=");
  acc[k] = v || true;
  return acc;
}, {});

const targetClassId = args.class || "gastro-01";
const baseUrl = args.url || "http://localhost:5173";

const outputDir = path.join(__dirname, "../dist/videos");
const tempDir = path.join(__dirname, "../temp_render_" + targetClassId);

if (!fs.existsSync(outputDir)) {
  fs.mkdirSync(outputDir, { recursive: true });
}
if (!fs.existsSync(tempDir)) {
  fs.mkdirSync(tempDir, { recursive: true });
}

console.log("═══════════════════════════════════════════════════════════════════");
console.log("🎬  EUNACOM Video Studio · 1080p MP4 Video Exporter");
console.log("═══════════════════════════════════════════════════════════════════");
console.log("📦 Masterclass: " + targetClassId);
console.log("🌐 URL:         " + baseUrl + "/deck/" + targetClassId + "?export=true");
console.log("📁 Output File: " + path.join(outputDir, targetClassId + ".mp4"));
console.log("───────────────────────────────────────────────────────────────────");

async function render() {
  console.log("🚀 Launching Headless Chrome at 1920x1080 resolution...");
  const browser = await puppeteer.launch({
    headless: "new",
    args: ["--no-sandbox", "--disable-setuid-sandbox", "--window-size=1920,1080", "--disable-dev-shm-usage"]
  });

  const page = await browser.newPage();
  await page.setViewport({ width: 1920, height: 1080, deviceScaleFactor: 1 });

  const targetUrl = baseUrl + "/deck/" + targetClassId + "?export=true";
  console.log("⏳ Loading slide deck: " + targetUrl);

  try {
    await page.goto(targetUrl, { waitUntil: "networkidle0", timeout: 30000 });
  } catch (err) {
    console.error("❌ Failed to load deck at " + targetUrl);
    await browser.close();
    process.exit(1);
  }

  await new Promise(r => setTimeout(r, 1000));

  const slideCount = 14;
  console.log("📸 Step 1/3: Capturing all " + slideCount + " 1080p slide screenshots...");

  for (let i = 0; i < slideCount; i++) {
    const slideNumber = i + 1;
    const screenshotPath = path.join(tempDir, "slide_" + slideNumber + ".png");
    await page.screenshot({ path: screenshotPath, type: "png" });
    process.stdout.write(" [" + slideNumber + "/" + slideCount + "]");

    if (i < slideCount - 1) {
      await page.keyboard.press("ArrowRight");
      await new Promise(r => setTimeout(r, 200));
    }
  }
  console.log("\n✓ All 1080p slide screenshots captured!");
  await browser.close();

  console.log("⚡ Step 2/3: Encoding video segments with ffmpeg...");
  const slideVideoFiles = [];
  const audioDir = path.join(__dirname, "../public/audio/" + targetClassId);

  for (let i = 0; i < slideCount; i++) {
    const slideNumber = i + 1;
    const screenshotPath = path.join(tempDir, "slide_" + slideNumber + ".png");
    const slideVideoPath = path.join(tempDir, "segment_" + slideNumber + ".mp4");
    const audioPath = path.join(audioDir, "slide_" + slideNumber + ".mp3");
    const hasAudio = fs.existsSync(audioPath);

    if (hasAudio) {
      execSync(
        "ffmpeg -y -loop 1 -i \"" + screenshotPath + "\" -i \"" + audioPath + "\" -c:v libx264 -preset ultrafast -tune stillimage -c:a aac -b:a 192k -pix_fmt yuv420p -shortest \"" + slideVideoPath + "\"",
        { stdio: "ignore" }
      );
    } else {
      const duration = 5;
      execSync(
        "ffmpeg -y -loop 1 -i \"" + screenshotPath + "\" -f lavfi -i anullsrc=r=44100:cl=stereo -t " + duration + " -c:v libx264 -preset ultrafast -tune stillimage -c:a aac -b:a 192k -pix_fmt yuv420p \"" + slideVideoPath + "\"",
        { stdio: "ignore" }
      );
    }
    slideVideoFiles.push(slideVideoPath);
    process.stdout.write(" [Segment " + slideNumber + "]");
  }
  console.log("\n✓ All segments encoded!");

  console.log("🔄 Step 3/3: Merging all segments into final MP4 video...");
  const concatListPath = path.join(tempDir, "concat_list.txt");
  const concatContent = slideVideoFiles.map(f => "file '" + f + "'").join("\n");
  fs.writeFileSync(concatListPath, concatContent);

  const finalVideoPath = path.join(outputDir, targetClassId + ".mp4");
  execSync(
    "ffmpeg -y -f concat -safe 0 -i \"" + concatListPath + "\" -c copy \"" + finalVideoPath + "\"",
    { stdio: "ignore" }
  );

  fs.rmSync(tempDir, { recursive: true, force: true });

  const stats = fs.statSync(finalVideoPath);
  const sizeMb = (stats.size / (1024 * 1024)).toFixed(2);

  console.log("───────────────────────────────────────────────────────────────────");
  console.log("🎉 SUCCESS! Masterclass 1080p MP4 Video Ready!");
  console.log("📹 Output File: " + finalVideoPath);
  console.log("📊 File Size:   " + sizeMb + " MB");
  console.log("───────────────────────────────────────────────────────────────────");
}

render().catch(err => {
  console.error("❌ Render error:", err);
  process.exit(1);
});
