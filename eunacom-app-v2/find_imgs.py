import re
import urllib.request
import os

os.makedirs('public/img/unis_hd', exist_ok=True)

for step in ['355', '326']:
    try:
        path = f'C:/Users/PC/.gemini/antigravity/brain/0a8ec356-90d2-4c35-b1c1-851fbd8303d8/.system_generated/steps/{step}/content.md'
        with open(path, encoding='utf-8') as f:
            content = f.read()
            imgs = re.findall(r'https?://[^\s"\'<>]+(?:png|svg|webp|jpg|jpeg)', content, re.IGNORECASE)
            print(f"Step {step} total images:", len(imgs))
            for u in set(imgs):
                print(" ->", u)
    except Exception as e:
        print(f"Error {step}:", e)
