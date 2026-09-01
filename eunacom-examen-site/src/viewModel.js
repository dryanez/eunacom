import { UNIVERSIDADES, CURSOS, POSTS, MATERIAL, VIAS, FAQ, METODOS } from './data/site';
import { BRAND, CONTACTO, TRANSFERENCIA } from './site.config';

const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

export const INITIAL = {
  page: 'inicio', curso: 'anual', post: 'fechas-inscripciones', cat: 'Todas', faq: 0,
  nombre: '', correo: '', rut: '', fono: '', pais: '', fecha: '', interes: '', nota: '',
  metodo: 'webpay', tarjeta: '', vence: '', cvv: '',
  error: '', enviado: false, pagado: false, correoEnviado: '', orden: '',
  boletin: '', suscrito: false, correoSuscrito: '',
};

/** Port of the design's renderVals(): state in, view model out. */
export function buildViewModel(st, patch, go) {
  const field = (name) => (e) => patch({ [name]: e.target.value, error: '' });

  const ficha = CURSOS.find((c) => c.slug === st.curso) || CURSOS[0];
  const post = POSTS.find((a) => a.slug === st.post) || POSTS[0];
  const cats = ['Todas'].concat(POSTS.map((a) => a.cat).filter((c, i, arr) => arr.indexOf(c) === i));
  const lista = st.cat === 'Todas' ? POSTS : POSTS.filter((a) => a.cat === st.cat);
  const metodoActual = METODOS.find((m) => m.id === st.metodo) || METODOS[0];

  const mapPost = (a) => ({
    categoria: a.cat, titulo: a.titulo, bajada: a.bajada, fecha: a.fecha, lectura: a.lectura,
    abrir: () => go('articulo', { post: a.slug }),
  });
  const mapCurso = (c) => ({
    kicker: c.kicker, estado: c.estado, nombre: c.nombre, resumen: c.resumen,
    duracion: c.duracion, inicio: c.inicio, termino: c.termino, examen: c.examen, modalidad: c.modalidad,
    precioClp: c.precioClp, precioUsd: c.precioUsd,
    meta: `${c.duracion} · inicio ${c.inicio}`,
    ver: () => go('ficha', { curso: c.slug }),
    comprar: () => go('checkout', { curso: c.slug }),
  });

  return {
    marca: BRAND.nombre,
    sigla: BRAND.sigla,
    autor: BRAND.autor,
    telefono: CONTACTO.telefono,
    correoContacto: CONTACTO.correo,
    transferencia: {
      banco: TRANSFERENCIA.banco
        || 'Te enviamos los datos de transferencia por correo al confirmar la matrícula.',
      titular: TRANSFERENCIA.titular,
    },

    esInicio: st.page === 'inicio', esNosotros: st.page === 'nosotros', esCursos: st.page === 'cursos',
    esFicha: st.page === 'ficha', esCheckout: st.page === 'checkout', esMaterial: st.page === 'material',
    esExtranjeros: st.page === 'extranjeros', esBlog: st.page === 'blog', esArticulo: st.page === 'articulo',
    esFaq: st.page === 'faq', esContacto: st.page === 'contacto',

    irInicio: () => go('inicio'),
    irNosotros: () => go('nosotros'),
    irCursos: () => go('cursos'),
    irMaterial: () => go('material'),
    irExtranjeros: () => go('extranjeros'),
    irBlog: () => go('blog'),
    irFaq: () => go('faq'),
    irContacto: () => go('contacto'),
    verPractico: () => go('ficha', { curso: 'practico' }),
    comprarFicha: () => go('checkout'),

    universidades: UNIVERSIDADES.map((nombre) => ({ nombre })),
    cursos: CURSOS.map(mapCurso),
    cursosHome: CURSOS.slice(0, 3).map(mapCurso),

    ficha: {
      kicker: ficha.kicker, nombre: ficha.nombre, precioClp: ficha.precioClp, precioUsd: ficha.precioUsd,
      precioNota: ficha.precioNota, duracion: ficha.duracion, inicio: ficha.inicio, termino: ficha.termino,
      examen: ficha.examen, modalidad: ficha.modalidad, cupos: ficha.cupos,
      paraQuien: ficha.paraQuien, temarioNota: ficha.temarioNota,
      cierreTitulo: ficha.cierreTitulo, cierreTexto: ficha.cierreTexto,
      intro: ficha.intro.map((t) => ({ t })),
      incluye: ficha.incluye.map((t) => ({ t })),
      comoFunciona: ficha.comoFunciona.map((t) => ({ t })),
      temario: ficha.temario.map((x) => ({ semana: x.s, tema: x.t, detalle: x.d })),
    },

    material: MATERIAL.map((m) => ({ tema: m.t, cantidad: m.c, nota: m.n })),
    vias: VIAS.map((x) => ({ num: x.n, titulo: x.t, texto: x.x })),

    posts: lista.map(mapPost),
    postsHome: POSTS.slice(0, 3).map(mapPost),
    categorias: cats.map((c) => ({
      nombre: c,
      filtrar: () => patch({ cat: c }),
      estilo: {
        fontFamily: "'Montserrat',sans-serif", fontWeight: 600, fontSize: '12.5px',
        background: st.cat === c ? '#0b5ea8' : '#fff', color: st.cat === c ? '#fff' : '#41556b',
        border: `1px solid ${st.cat === c ? '#0b5ea8' : '#cfdeeb'}`, padding: '9px 16px',
        borderRadius: '3px', cursor: 'pointer',
      },
    })),
    post: {
      categoria: post.cat, titulo: post.titulo, bajada: post.bajada, fecha: post.fecha, lectura: post.lectura,
      secciones: post.secciones.map((s) => ({ h: s.h, parrafos: s.parrafos.map((t) => ({ t })) })),
    },
    relacionados: POSTS.filter((a) => a.slug !== post.slug).slice(0, 4).map((a) => ({
      titulo: a.titulo, abrir: () => go('articulo', { post: a.slug }),
    })),

    faq: FAQ.map((f, k) => {
      const on = st.faq === k;
      return {
        q: f.q, a: f.a, abierta: on, icono: on ? '–' : '+',
        toggle: () => patch((s) => ({ faq: s.faq === k ? -1 : k })),
        estilo: {
          width: '100%', background: on ? '#f6fafd' : '#fff', border: 'none', padding: '20px 24px',
          display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', gap: '18px',
          cursor: 'pointer', fontFamily: "'Montserrat',sans-serif", fontWeight: 700,
          fontSize: '16px', lineHeight: 1.45, color: '#08365f',
        },
      };
    }),

    metodos: METODOS.map((m) => {
      const on = st.metodo === m.id;
      return {
        nombre: m.nombre, detalle: m.detalle,
        elegir: () => patch({ metodo: m.id, error: '' }),
        estilo: {
          display: 'flex', gap: '14px', alignItems: 'flex-start', width: '100%',
          background: on ? '#f6fafd' : '#fff', border: `1px solid ${on ? '#0b5ea8' : '#dae8f4'}`,
          borderRadius: '4px', padding: '16px 18px', cursor: 'pointer',
        },
        radio: {
          width: '18px', height: '18px', borderRadius: '50%', flex: 'none', marginTop: '2px',
          border: `2px solid ${on ? '#0b5ea8' : '#c2d4e5'}`,
          background: on ? '#0b5ea8' : '#fff', boxShadow: on ? 'inset 0 0 0 3px #fff' : 'none',
        },
      };
    }),
    metodo: metodoActual.nombre,
    mostrarTarjeta: st.metodo === 'webpay' || st.metodo === 'dos-pagos',
    mostrarTransferencia: st.metodo === 'transferencia' || st.metodo === 'internacional',
    textoBoton: st.metodo === 'webpay' || st.metodo === 'dos-pagos' ? 'Pagar y matricularme' : 'Confirmar matrícula',

    nombre: st.nombre, correo: st.correo, rut: st.rut, fono: st.fono, pais: st.pais, fecha: st.fecha,
    interes: st.interes, nota: st.nota, tarjeta: st.tarjeta, vence: st.vence, cvv: st.cvv,
    error: st.error, orden: st.orden, correoEnviado: st.correoEnviado,
    pagado: st.pagado, noPagado: !st.pagado,
    enviado: st.enviado, abierto: !st.enviado,
    boletin: st.boletin, suscrito: st.suscrito, noSuscrito: !st.suscrito, correoSuscrito: st.correoSuscrito,

    onNombre: field('nombre'), onCorreo: field('correo'), onRut: field('rut'),
    onFono: field('fono'), onPais: field('pais'), onFecha: field('fecha'),
    onInteres: field('interes'), onNota: field('nota'), onTarjeta: field('tarjeta'),
    onVence: field('vence'), onCvv: field('cvv'), onBoletin: field('boletin'),

    suscribir: () => {
      if (EMAIL.test(st.boletin.trim())) patch({ suscrito: true, correoSuscrito: st.boletin.trim() });
    },

    pagar: () => {
      if (!st.nombre.trim()) return patch({ error: 'Escribe tu nombre completo.' });
      if (!st.rut.trim()) return patch({ error: 'Falta tu RUT o número de pasaporte.' });
      if (!EMAIL.test(st.correo.trim())) return patch({ error: 'Revisa el correo, parece incompleto.' });
      if (!st.fecha) return patch({ error: 'Indica en qué convocatoria rindes.' });
      patch({
        pagado: true, correoEnviado: st.correo.trim(), error: '',
        orden: `EU-${Math.floor(100000 + Math.random() * 899999)}`,
      });
      if (typeof window !== 'undefined') window.scrollTo(0, 0);
      return undefined;
    },

    enviar: () => {
      if (!st.nombre.trim()) return patch({ error: 'Escribe tu nombre.' });
      if (!EMAIL.test(st.correo.trim())) return patch({ error: 'Revisa el correo, parece incompleto.' });
      if (!st.fecha) return patch({ error: 'Indica cuándo rindes.' });
      return patch({ enviado: true, correoEnviado: st.correo.trim(), error: '' });
    },
    reset: () => patch({ enviado: false, nombre: '', correo: '', interes: '', fecha: '', pais: '', nota: '' }),
  };
}
