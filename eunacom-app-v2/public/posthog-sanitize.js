/* Strips login secrets from URLs before PostHog sends an event.
   Supabase OAuth returns to /#access_token=…&refresh_token=…&provider_token=…, and Mercado Pago / PayPal
   add ids to the query string. PostHog records the URL in $current_url, $referrer, $initial_* and in
   session-replay meta events, so every string property is cleaned.
   Used as posthog.init(..., { before_send: window.phBeforeSend }). */
(function () {
  var SECRET = /([#?&])(access_token|refresh_token|provider_token|provider_refresh_token|id_token|token)=[^&#]*/gi;

  function cleanUrl(s) {
    if (s.indexOf('token') === -1) return s;
    return s.replace(SECRET, '$1$2=[redacted]');
  }

  function walk(v, depth) {
    if (typeof v === 'string') return cleanUrl(v);
    if (!v || typeof v !== 'object' || depth > 6) return v;
    if (Array.isArray(v)) { for (var i = 0; i < v.length; i++) v[i] = walk(v[i], depth + 1); return v; }
    for (var k in v) if (Object.prototype.hasOwnProperty.call(v, k)) v[k] = walk(v[k], depth + 1);
    return v;
  }

  window.phCleanUrl = cleanUrl;
  window.phBeforeSend = function (event) {
    if (!event) return event;
    try {
      // Replay snapshots are large DOM trees: only walk them when a secret is actually present.
      if (event.event === '$snapshot' && JSON.stringify(event.properties || {}).indexOf('access_token') === -1) return event;
      if (event.properties) walk(event.properties, 0);
      if (event.$set) walk(event.$set, 0);
      if (event.$set_once) walk(event.$set_once, 0);
    } catch (e) {}
    return event;
  };
})();
