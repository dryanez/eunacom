# Telegram Group Video Extractor & Cloud Uploader

Automated script to extract **only video files** from any Telegram group or channel and upload them directly to your Cloudflare R2 / S3 storage.

---

## 1. Quick Setup

### Install Required Dependencies
Run in your terminal:
```bash
pip install -r scripts/requirements_telegram.txt
```

---

## 2. Get Your Telegram API Credentials (Free & Takes 1 Minute)

1. Go to **[https://my.telegram.org](https://my.telegram.org)** and log in with your Telegram phone number.
2. Click **API development tools**.
3. Create an application (any app title / short name like "VideoDownloader").
4. Copy your **`api_id`** (numbers) and **`api_hash`** (alphanumeric string).

---

## 3. Configure `.env` (Optional but Convenient)

Add the following to your root `.env` or set them when prompted:

```ini
# Telegram API Credentials
TELEGRAM_API_ID=12345678
TELEGRAM_API_HASH=your_telegram_api_hash_here

# Cloudflare R2 / S3 Storage Credentials
R2_ACCOUNT_ID=your_cloudflare_account_id
R2_ACCESS_KEY_ID=your_r2_access_key_id
R2_SECRET_ACCESS_KEY=your_r2_secret_access_key
R2_BUCKET=eunacomvideos
R2_PREFIX=bnb_videos/
```

---

## 4. Run the Script

```bash
python scripts/telegram_to_cloud.py
```

### What happens when you run it:
1. **Interactive Login**: On the first run, Telegram asks for your phone number and sends a login code inside your Telegram app. A session file is created so you won't need to log in again.
2. **Select Group**: It lists your recent groups/channels (or you can paste an invite link / @username).
3. **Filter & Download**: It ignores all text messages, photos, stickers, and documents, filtering **only videos**.
4. **Direct Cloud Upload**: Uploads each video to Cloudflare R2 with high-speed multi-threaded multipart upload.
5. **Disk Space Friendly**: Deletes the local temporary video immediately after it is safely uploaded to the cloud.
6. **Resume Support**: If stopped (Ctrl+C) and restarted, it remembers previously uploaded videos and resumes where it left off.
7. **Catalog Export**: Generates `telegram_video_manifest.json` with durations, captions, file sizes, and cloud URLs.
