import React, { useState } from 'react';
import { INITIAL, buildViewModel } from './viewModel';
import Layout from './components/Layout';
import Inicio from './pages/Inicio';
import Nosotros from './pages/Nosotros';
import Cursos from './pages/Cursos';
import Ficha from './pages/Ficha';
import Checkout from './pages/Checkout';
import Material from './pages/Material';
import Extranjeros from './pages/Extranjeros';
import Blog from './pages/Blog';
import Articulo from './pages/Articulo';
import Faq from './pages/Faq';
import Contacto from './pages/Contacto';

export const PAGES = {
  inicio: Inicio,
  nosotros: Nosotros,
  cursos: Cursos,
  ficha: Ficha,
  checkout: Checkout,
  material: Material,
  extranjeros: Extranjeros,
  blog: Blog,
  articulo: Articulo,
  faq: Faq,
  contacto: Contacto,
};

export default function App() {
  const [st, setSt] = useState(INITIAL);
  const patch = (next) => setSt((s) => ({ ...s, ...(typeof next === 'function' ? next(s) : next) }));

  const go = (page, extra) => {
    patch({ page, error: '', ...(extra || {}) });
    if (typeof window !== 'undefined') window.scrollTo(0, 0);
  };

  const v = buildViewModel(st, patch, go);
  const Page = PAGES[st.page] || Inicio;

  return (
    <Layout {...v}>
      <Page {...v} />
    </Layout>
  );
}
