/* Cookie consent banner. Optional tools (PostHog analytics + session replay) load only after "Accept".
   Text comes from data-* attributes on the <script> tag. Choice is saved in localStorage.
   Consumers: window.whenCookieConsent(fn) runs fn now if accepted, or later when the visitor accepts.
   Reopen the banner from anywhere with window.openCookieSettings(). */
(function () {
  var KEY = 'cookie_consent_v1';
  var d = (document.currentScript && document.currentScript.dataset) || {};
  var waiting = [];

  function read() { try { return localStorage.getItem(KEY); } catch (e) { return null; } }
  function save(v) { try { localStorage.setItem(KEY, v); } catch (e) {} }

  window.whenCookieConsent = function (fn) {
    if (window.cookieConsent === 'accepted') fn(); else waiting.push(fn);
  };

  function grant() {
    window.cookieConsent = 'accepted';
    var q = waiting; waiting = [];
    q.forEach(function (fn) { try { fn(); } catch (e) {} });
    if (window.posthog && window.posthog.__loaded && window.posthog.has_opted_out_capturing && window.posthog.has_opted_out_capturing()) {
      try { window.posthog.opt_in_capturing(); } catch (e) {}
    }
  }

  function deny(clicked) {
    window.cookieConsent = 'rejected';
    // Stop a PostHog session that started earlier in this visit (the visitor changed their mind).
    if (clicked && window.posthog && window.posthog.__loaded) {
      try { window.posthog.opt_out_capturing(); } catch (e) {}
    }
  }

  function close(el, choice) {
    save(choice);
    el.remove();
    if (choice === 'accepted') grant(); else deny(true);
  }

  function show() {
    if (document.getElementById('cookie-consent')) return;
    var el = document.createElement('div');
    el.id = 'cookie-consent';
    el.setAttribute('role', 'dialog');
    el.setAttribute('aria-label', d.title || 'Cookies');
    el.style.cssText = 'position:fixed;left:16px;right:16px;bottom:16px;z-index:2147483000;max-width:560px;margin:0 auto;' +
      'background:#fff;color:#1f2937;border:1px solid #e5e7eb;border-radius:14px;box-shadow:0 10px 30px rgba(0,0,0,.15);' +
      'padding:16px 18px;font:14px/1.45 system-ui,-apple-system,Segoe UI,Roboto,sans-serif;' + (d.dir === 'rtl' ? 'direction:rtl;' : '');
    var p = document.createElement('p');
    p.style.cssText = 'margin:0 0 12px';
    p.textContent = d.text || 'We use cookies to understand how the site is used and improve it. You can accept or reject optional cookies.';
    if (d.policy) {
      var a = document.createElement('a');
      a.href = d.policy; a.textContent = ' ' + (d.policyLabel || 'Privacy policy');
      a.style.cssText = 'color:inherit;text-decoration:underline';
      p.appendChild(a);
    }
    var row = document.createElement('div');
    row.style.cssText = 'display:flex;gap:8px;justify-content:flex-end;flex-wrap:wrap';
    function btn(label, primary, choice) {
      var b = document.createElement('button');
      b.type = 'button'; b.textContent = label;
      b.style.cssText = 'cursor:pointer;border-radius:10px;padding:9px 16px;font:600 14px system-ui,sans-serif;border:1px solid ' +
        (primary ? (d.color || '#111827') + ';background:' + (d.color || '#111827') + ';color:#fff' : '#d1d5db;background:#fff;color:#1f2937');
      b.onclick = function () { close(el, choice); };
      return b;
    }
    row.appendChild(btn(d.reject || 'Reject', false, 'rejected'));
    row.appendChild(btn(d.accept || 'Accept', true, 'accepted'));
    el.appendChild(p); el.appendChild(row);
    document.body.appendChild(el);
  }

  window.openCookieSettings = function () {
    try { localStorage.removeItem(KEY); } catch (e) {}
    if (document.body) show(); else document.addEventListener('DOMContentLoaded', show);
  };

  var v = read();
  // Global Privacy Control is a legal opt-out signal in some regions; treat it as "reject".
  if (!v && navigator.globalPrivacyControl === true) v = 'rejected';
  if (v === 'accepted') grant();
  else if (v === 'rejected') deny();
  else if (document.body) show();
  else document.addEventListener('DOMContentLoaded', show);
})();
