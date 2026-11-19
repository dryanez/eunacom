#!/usr/bin/env node
// List forum topic IDs in a group without posting: editForumTopic with no changes
// answers TOPIC_NOT_MODIFIED for a real topic and an error for anything else.
const token = process.env.TELEGRAM_BOT_TOKEN;
const chat = process.argv[2];
const max = Number(process.argv[3] || 3000);
const found = [];
const call = id => fetch(`https://api.telegram.org/bot${token}/editForumTopic`, {
  method: 'POST', headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ chat_id: chat, message_thread_id: id, icon_custom_emoji_id: undefined }),
}).then(r => r.json());
const first = await call(1);
console.log('probe #1:', JSON.stringify(first));
for (let id = 1; id <= max; id += 20) {
  const ids = Array.from({ length: 20 }, (_, k) => id + k).filter(x => x <= max);
  const res = await Promise.all(ids.map(call));
  res.forEach((r, k) => {
    const d = r.description || '';
    if (r.ok || /NOT_MODIFIED/i.test(d)) found.push(ids[k]);
    else if (r.error_code === 429) console.log('rate limited at', ids[k]);
  });
  await new Promise(r => setTimeout(r, 1100));
}
console.log('TOPICS:', JSON.stringify(found));
