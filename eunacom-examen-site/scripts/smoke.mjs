import { createServer } from 'vite';
import { renderToString } from 'react-dom/server';
import React from 'react';

const server = await createServer({ root: process.cwd(), server: { middlewareMode: true }, appType: 'custom' });
const load = (p) => server.ssrLoadModule(p);

const { PAGES } = await load('/src/App.jsx');
const { INITIAL, buildViewModel } = await load('/src/viewModel.js');
const { default: Layout } = await load('/src/components/Layout.jsx');
const { CURSOS, POSTS, METODOS } = await load('/src/data/site.js');

const render = (st) => {
  const v = buildViewModel({ ...INITIAL, ...st }, () => {}, () => {});
  const Page = PAGES[st.page];
  return renderToString(React.createElement(Layout, v, React.createElement(Page, v)));
};

const cases = [];
for (const page of Object.keys(PAGES)) cases.push([page, { page }]);
for (const c of CURSOS) cases.push([`ficha:${c.slug}`, { page: 'ficha', curso: c.slug }]);
for (const a of POSTS) cases.push([`articulo:${a.slug}`, { page: 'articulo', post: a.slug }]);
for (const m of METODOS) cases.push([`checkout:${m.id}`, { page: 'checkout', metodo: m.id }]);
cases.push(['checkout:pagado', { page: 'checkout', pagado: true, orden: 'EU-123456', correoEnviado: 'a@b.cl' }]);
cases.push(['checkout:error', { page: 'checkout', error: 'Revisa el correo.' }]);
cases.push(['contacto:enviado', { page: 'contacto', enviado: true, correoEnviado: 'a@b.cl' }]);
cases.push(['inicio:suscrito', { page: 'inicio', suscrito: true, correoSuscrito: 'a@b.cl' }]);
cases.push(['blog:filtrado', { page: 'blog', cat: POSTS[0].cat }]);
cases.push(['faq:abierta', { page: 'faq', faq: 3 }]);

let failed = 0, html = '';
for (const [name, st] of cases) {
  try {
    const out = render(st);
    html += out;
    console.log(`ok   ${name} (${out.length})`);
  } catch (e) {
    failed++;
    console.log(`FAIL ${name}: ${e.message}`);
  }
}
await server.close();

const banned = [/Dr\.\s/, /RNPI/, /USACH/, /Yáñez/, /\[Apellido\]/, /\[Nombre\]/, /Felipe/, /undefined/, /\[object Object\]/];
for (const re of banned) {
  const hit = re.test(html);
  console.log(`${hit ? 'BANNED PRESENT' : 'clean'}  ${re}`);
  if (hit) failed++;
}
console.log(failed ? `\n${failed} PROBLEMS` : '\nall pages render clean, no doctor references');
process.exit(failed ? 1 : 0);
