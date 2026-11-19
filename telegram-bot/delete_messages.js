#!/usr/bin/env node
// Delete bot messages: node delete_messages.js "@chan:255-257,@other:264"
const token = process.env.TELEGRAM_BOT_TOKEN;
const spec = process.argv[2] || '';
let failed = 0;
for (const part of spec.split(',').map(s => s.trim()).filter(Boolean)) {
  const [chat, range] = part.split(':');
  const [a, b] = range.split('-').map(Number);
  for (let id = a; id <= (b || a); id++) {
    const r = await fetch(`https://api.telegram.org/bot${token}/deleteMessage`, {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ chat_id: chat, message_id: id }),
    }).then(r => r.json());
    console.log(`${chat} #${id}: ${r.ok ? 'deleted' : 'FAILED ' + r.description}`);
    if (!r.ok) failed++;
  }
}
process.exit(failed ? 1 : 0);
