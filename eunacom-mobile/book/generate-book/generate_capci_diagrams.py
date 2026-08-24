import urllib.request
import json
import base64
import os

key = 'capci_live_620c6fdfeecf3ed9dbc63cb420a4dbe2'
url = 'https://mcp.capci.app/mcp'

out_dir = os.path.join(os.path.dirname(__file__), 'images')
os.makedirs(out_dir, exist_ok=True)

diagrams = [
    {
        'filename': 'algo_urgencias.png',
        'prompt': 'Medical Flowchart: Emergency Arrhythmia Management Algorithm. Start: Patient with Cardiac Arrhythmia in Emergency. Step 1: Assess Hemodynamic Instability (Hypotension, Shock, Acute Heart Failure, Angina, Syncope). If YES (Instable): Immediate Synchronized Electrical Cardioversion (if tachyarrhythmia) or Transcutaneous Pacemaker (if bradyarrhythmia). If NO (Stable): Evaluate QRS width on 12-lead ECG. Narrow QRS (<0.12s): Vagall maneuvers -> Adenosine 6mg IV -> Beta Blockers / Verapamil. Wide QRS (>=0.12s): Treat as Ventricular Tachycardia (Amiodarone 150mg IV over 10 min).'
    },
    {
        'filename': 'algo_pcr.png',
        'prompt': 'Medical Flowchart: Advanced Cardiovascular Life Support (ACLS) Cardiac Arrest Algorithm. Start: Unresponsive Patient without Pulse. Step 1: High Quality CPR (30:2) + Connect Monitor / Defibrillator. Step 2: Assess Rhythm: Is it Shockable? If YES (VF / Pulseless VT): Shock 200J Bifasic -> CPR 2 min -> Epinephrine 1mg IV (every 3-5 min) -> Amiodarone 300mg IV. If NO (Asystole / PEA): CPR 2 min -> Immediate Epinephrine 1mg IV -> Search and Treat 5 H\'s and 5 T\'s.'
    },
    {
        'filename': 'algo_bav.png',
        'prompt': 'Medical Flowchart: Atrioventricular (AV) Block Diagnostic & Treatment Algorithm. Start: Patient with Bradycardia (<60 bpm) or Syncope. Step 1: 12-lead ECG: Assess P wave to QRS relationship. 1st Degree AV Block (PR > 0.20s constant): Observation. 2nd Degree Mobitz I (Wenckebach) (PR prolongs then drops P): Observe / treat cause. 2nd Degree Mobitz II (Constant PR, sudden P drop): Pacemaker indication. 3rd Degree (Complete) AV Block (Total AV dissociation): Permanent Pacemaker Indication (Chilean GES N 25 Guarantee).'
    },
    {
        'filename': 'algo_fa.png',
        'prompt': 'Medical Flowchart: Atrial Fibrillation Management AF-CARE Strategy. Start: AF Diagnosed on ECG (No P waves, Irregular RR). Step 1: Treat Underlying Comorbidities (Hypertension, Diabetes, Sleep Apnea). Step 2: Calculate CHA2DS2-VASc Score. If Score >= 2 (Men) or >= 3 (Women): Indicate Oral Anticoagulation (Acenocoumarol / DOACs). Step 3: Choose Strategy: Rate Control (Beta Blockers / Verapamil / Digoxin) vs Rhythm Control (Amiodarone / Flecainide / Catheter Ablation).'
    },
    {
        'filename': 'algo_tpsv.png',
        'prompt': 'Medical Flowchart: Supraventricular Tachycardia (SVT / TPSV) Acute Treatment Algorithm. Start: Regular Narrow-QRS Tachycardia (150-220 bpm). Step 1: Assess Hemodynamic Stability. If Unstable: Synchronized Electrical Cardioversion (50-100J). If Stable: Modified Valsalva Maneuver. If Reverted: Observation. If Persists: Adenosine 6mg IV Rapid Push + 20ml SF Flush. If Persists: Second Adenosine 12mg IV Push. If Fails: Verapamil 5mg IV or Diltiazem.'
    },
    {
        'filename': 'algo_tv.png',
        'prompt': 'Medical Flowchart: Wide QRS Tachycardia Management Algorithm. Start: Regular Wide QRS (>=0.12s) Tachycardia. Step 1: Assess Pulse. If No Pulse: CPR + Immediate Unsynchronized Defibrillation (200J). If Pulse Present: Assess Stability. If Unstable: Synchronized Electrical Cardioversion (100-200J). If Stable: Amiodarone 150mg IV over 10 min or Procainamide IV.'
    }
]

for d in diagrams:
    fpath = os.path.join(out_dir, d['filename'])
    print(f"Generating diagram for {d['filename']}...")
    payload = {
        'jsonrpc': '2.0',
        'id': 1,
        'method': 'tools/call',
        'params': {
            'name': 'create_diagram',
            'arguments': {
                'prompt': d['prompt']
            }
        }
    }
    
    data = json.dumps(payload).encode('utf-8')
    req = urllib.request.Request(url, data=data, headers={
        'x-api-key': key,
        'Content-Type': 'application/json',
        'Accept': 'application/json, text/event-stream'
    })
    
    try:
        with urllib.request.urlopen(req) as resp:
            content = resp.read().decode('utf-8')
            for line in content.splitlines():
                if line.startswith('data: '):
                    res = json.loads(line[6:])
                    contents = res.get('result', {}).get('content', [])
                    for item in contents:
                        if item.get('type') == 'image':
                            img_b64 = item.get('data')
                            img_bytes = base64.b64decode(img_b64)
                            with open(fpath, 'wb') as f:
                                f.write(img_bytes)
                            print(f"  SUCCESS! Saved {d['filename']} ({len(img_bytes)} bytes)")
    except Exception as e:
        print(f"  ERROR generating {d['filename']}: {e}")

print("Done generating diagrams!")
