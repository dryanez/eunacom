/**
 * FIG_SPEC · Cardiología — auditoría de figuras clínicas para la Maqueta 1b.
 * Sólo entran láminas verificadas visualmente como limpias y relevantes al EUNACOM.
 *   mode  'full' (ancho de página) | 'wide' (ancho de la caja de texto)
 *   desc  pie de figura: QUÉ se ve y POR QUÉ importa en el examen
 *   crop  [x%, y%, w%, h%] para eliminar pies/bordes del libro fuente
 *   items [{file, cap, crop?}]  cap = subrótulo bajo cada imagen (A., B., …)
 * Temas sin entrada → sin figura clínica (basta el algoritmo vectorial + tablas).
 */
module.exports = {
  '1.1': {
    mode: 'full', crop: [3, 5, 94, 61],
    desc: 'Tiempos normales del ECG de superficie. Umbrales que se preguntan textualmente: onda P < 120 ms, PR 120–200 ms, QRS < 120 ms, QTc < 440 ms (H) / < 460 ms (M).',
    items: [{ file: 'figura_1_1_ecg_intervalos.png', cap: 'Medición sistemática de intervalos' }],
  },
  '1.3': {
    mode: 'full',
    desc: 'Fibrilación auricular: ausencia de ondas P, línea de base con ondas f y R-R irregularmente irregular. Flutter común: ondas F en dientes de sierra (II, III, aVF) con conducción AV fija o variable.',
    items: [
      { file: 'figura_1_3_fa_trazado_ecg.png', cap: 'Fibrilación auricular', crop: [1, 8, 97, 60] },
      { file: 'figura_1_3_flutter_ecg.png', cap: 'Flutter auricular común', crop: [7, 13, 85, 44] },
    ],
  },
  '1.4': {
    mode: 'full', crop: [1, 1, 98, 87],
    desc: 'Preexcitación ventricular (Wolff-Parkinson-White) en ritmo sinusal: PR corto (< 120 ms), empastamiento inicial del QRS (onda delta) y QRS ancho por fusión.',
    items: [{ file: 'figura_1_4_wpw_onda_delta.png', cap: 'Onda delta y PR corto (V1–V3)' }],
  },
  '3.1': {
    mode: 'wide', crop: [0, 2, 100, 95],
    desc: 'Traducción clínica de la congestión en la insuficiencia cardíaca: congestión pulmonar y aumento de PVC, hepatomegalia dolorosa, ascitis, edemas y oliguria — la base del examen físico dirigido.',
    items: [{ file: 'figura_3_1_ic_congestiva_clinica.png', cap: 'Signos congestivos sistémicos y pulmonares' }],
  },
  '4.1': {
    mode: 'wide', crop: [1, 1, 98, 98],
    desc: 'Ecocardiograma de la válvula aórtica: apertura sistólica reducida y calcificación de los velos. La severidad se define por área valvular < 1,0 cm², gradiente medio > 40 mmHg y velocidad máxima > 4 m/s.',
    items: [{ file: 'figura_4_1_eao_ecocardiograma.png', cap: 'Válvula aórtica calcificada (eje corto)' }],
  },
  '4.4': {
    mode: 'wide',
    desc: 'Cardiopatías congénitas del adulto de mayor rendimiento: coartación aórtica (HTA en brazos + pulsos femorales débiles + muescas costales), ductus persistente (soplo continuo «en maquinaria») y tetralogía de Fallot (silueta «en zueco»).',
    items: [
      { file: 'fig_ductus_coartacion_p77_img4.jpeg', cap: 'Coartación aórtica' },
      { file: 'figura_4_4_ductus_persistencia.png', cap: 'Ductus arterioso persistente', crop: [1, 1, 98, 98] },
      { file: 'figura_4_4_fallot_anatomia.png', cap: 'Anatomía de la tetralogía de Fallot', crop: [1, 1, 98, 98] },
      { file: 'fig_fallot_rx_p79_img4.jpeg', cap: 'RxTx: corazón «en zueco»' },
    ],
  },
  '5.1': {
    mode: 'wide',
    desc: 'Monitorización ambulatoria de presión arterial (MAPA) de 24 h: promedios diurno y nocturno y porcentaje de descenso nocturno. Confirma el diagnóstico de HTA y detecta el patrón non-dipper (riesgo cardiovascular aumentado).',
    items: [{ file: 'fig_mapa_hta_p142_img3.jpeg', cap: 'Registro de 24 horas con promedios por período' }],
  },
  '5.3': {
    mode: 'full', crop: [0, 0, 100, 96],
    desc: 'ECG de pericarditis aguda: supradesnivel del ST cóncavo y difuso (no territorial) con descenso del segmento PR. Evoluciona en cuatro fases; la ausencia de imagen especular la separa del SCACEST.',
    items: [{ file: 'fig_pericarditis_ecg_p67_img1.jpeg', cap: 'Supradesnivel ST difuso y cóncavo' }],
  },
  '5.4': {
    mode: 'wide', crop: [2, 3, 96, 92],
    desc: 'AngioTC de tórax con contraste en disección aórtica: flap intimal que separa la luz verdadera de la falsa. El compromiso de la aorta ascendente (tipo A de Stanford) obliga a cirugía urgente.',
    items: [{ file: 'figura_5_4_angiotac_diseccion_stanford_a.png', cap: 'Flap intimal y doble luz (cortes axial y sagital)' }],
  },
};
