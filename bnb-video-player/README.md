# 🎬 Boards & Beyond (Step 1 & Step 2) + Pathoma 2026 Studio Player

Unified USMLE Video & Quiz Studio supporting **Local Disk** and **Zero-Egress Cloudflare R2 Cloud Streaming** (`Step 1`, `Step 2`, and `Pathoma Chapters 1–19`).

---

## 🚀 Run From Any Computer (Mac / Windows / Linux)

You do **not** need the local `D:\` drive attached to watch the videos. When cloned on another computer, `server.js` automatically reads [`cloud_catalog.json`](./cloud_catalog.json) and streams every video directly from our Cloudflare R2 bucket.

```bash
cd bnb-video-player
npm install
npm start
```

Then open **[http://localhost:4100](http://localhost:4100)**.

* Click **`Step 1`**, **`Step 2`**, or **`Pathoma`** in the top-left tab bar.
* Click **`Streaming: Cloudflare R2`** in the top-right header at any time to toggle between local disk and Cloudflare R2 streaming.

---

## ☁️ Cloudflare R2 Bucket Details

* **Bucket Name:** `eunacomvideos`
* **Public R2 Base URL:** `https://pub-779a681676944ef9acf0f9492f86ba03.r2.dev`
* **Boards & Beyond Prefix:** `https://pub-779a681676944ef9acf0f9492f86ba03.r2.dev/Boards_and_Beyond/...`
* **Pathoma 2026 Prefix:** `https://pub-779a681676944ef9acf0f9492f86ba03.r2.dev/Pathoma/...`
* **Pathoma 2025 Textbook PDF (Direct R2 Link):**
  `https://pub-779a681676944ef9acf0f9492f86ba03.r2.dev/Pathoma/00_Book_and_Anki_Decks/Pathoma%202025%20Fundamentals%20of%20Pathology%20%40Medicine_Its_easy.pdf`
* **Pathoma Anki Decks (Direct R2 Links):**
  * `https://pub-779a681676944ef9acf0f9492f86ba03.r2.dev/Pathoma/00_Book_and_Anki_Decks/Slide's%20Pathoma.apkg`
  * `https://pub-779a681676944ef9acf0f9492f86ba03.r2.dev/Pathoma/00_Book_and_Anki_Decks/Slide's%20Clinicals.apkg`

---

## 🔄 Syncing Videos to Cloudflare R2

* **Sync Boards & Beyond (`D:/Telegram_BnB_Videos` -> `R2://eunacomvideos/Boards_and_Beyond/`):**
  ```bash
  python scripts/sync_to_cloudflare_r2.py
  ```
* **Sync Pathoma 2026 & Rebuild `cloud_catalog.json` (`D:/Telegram_Pathoma_Videos` -> `R2://eunacomvideos/Pathoma/`):**
  ```bash
  python scripts/sync_pathoma_to_r2.py
  ```
