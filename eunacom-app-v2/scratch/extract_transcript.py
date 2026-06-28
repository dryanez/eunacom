import json

transcript_path = "/Users/felipeyanez/.gemini/antigravity/brain/8bb42034-29bc-437e-83c1-b314baa0eec8/.system_generated/logs/transcript_full.jsonl"

with open(transcript_path, 'r') as f:
    lines = f.readlines()

for line in reversed(lines):
    line = line.strip()
    if not line: continue
    try:
        data = json.loads(line)
        if data.get('type') == 'USER_INPUT':
            content = data.get('content')
            full_text = ""
            if isinstance(content, list):
                for item in content:
                    if isinstance(item, dict) and 'text' in item:
                        full_text += item['text'] + "\n"
            elif isinstance(content, str):
                full_text = content
            
            if '==Start of PDF==' in full_text:
                with open("/Users/felipeyanez/Desktop/NEWeunacom/eunacom-app-v2/scratch/clean_message.txt", "w") as out:
                    out.write(full_text)
                print(f"Found the USER_INPUT and saved {len(full_text)} chars to clean_message.txt")
                break
    except Exception as e:
        continue
