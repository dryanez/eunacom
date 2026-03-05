// EUNACOM 2026 — Day-by-day Study Schedule
// March 4, 2026 → July 8, 2026 (127 days, 18 weeks)
// Each day has: videos to watch, questions topic, chapter color coding

const CHAPTERS = {
  INTERNAL_MEDICINE: { id: 1, label: 'Medicina Interna', color: '#8b5cf6' },
  SPECIALTIES: { id: 2, label: 'Psiq, SP, Cx, Especialidades', color: '#3b82f6' },
  OBGYN_PEDS: { id: 3, label: 'Obstetricia, Gineco, Pediatría', color: '#22c55e' },
  REVIEW: { id: 4, label: 'Repaso y Simulacros', color: '#eab308' },
}

const VIDEO_BASE = '/videos'

// Helper: build video path from category folder and filename
const v = (category, filename) => ({
  filename,
  path: `${VIDEO_BASE}/${category}/${filename}`,
})

// === DIABETES VIDEOS ===
const DIABETES_VIDEOS = [
  v('Medicina interna/diabetes', '1.Diabetes.mp4'),
  v('Medicina interna/diabetes', '2.DM1 - LADA - Criterios de insulina.mp4'),
  v('Medicina interna/diabetes', '3.Complicaciones agudas de la diabetes.mp4'),
  v('Medicina interna/diabetes', '4.Complicaciones crónicas de la diabetes.mp4'),
  v('Medicina interna/diabetes', '5.Diabetes mellitus gestacional.mp4'),
]

// === ENDOCRINOLOGY VIDEOS ===
const ENDOCRINO_VIDEOS = [
  v('Medicina interna/Endocrino', '1.Generalidades endocrino.mp4'),
  v('Medicina interna/Endocrino', '2.Hipopituitarismo - Compresión tallo hipofisiario - Tumor hipofisario.mp4'),
  v('Medicina interna/Endocrino', '3.Síndrome de Cushing.mp4'),
  v('Medicina interna/Endocrino', '4.Insuficiencia suprarrenal.mp4'),
  v('Medicina interna/Endocrino', '5.Hipotiroidismo.mp4'),
  v('Medicina interna/Endocrino', '6.Hipertiroidismo.mp4'),
  v('Medicina interna/Endocrino', '7.Bocio - Tiroiditis.mp4'),
  v('Medicina interna/Endocrino', '8.Nódulo tiroideo - Cáncer de tiroides - Masa cervical.mp4'),
  v('Medicina interna/Endocrino', '9.Calcio - PTH.mp4'),
  v('Medicina interna/Endocrino', '10.Osteoporosis y osteopenia.mp4'),
  v('Medicina interna/Endocrino', '11.Diabetes insípida (DI) - Polidipsia primaria (PP) - SSIADH - Hiponatremia.mp4'),
  v('Medicina interna/Endocrino', '12.Pubertad precoz - Hipotiroidismo congénito - Hiperplasia suprarrenal congénita.mp4'),
]

// === CARDIOLOGY VIDEOS ===
const CARDIO_VIDEOS = [
  v('Medicina interna/Cardio', '1.Cardiopatía congénita - Soplo cardíaco.mp4'),
  v('Medicina interna/Cardio', '2.TVP - TEP - Anticoagulación - Várices.mp4'),
  v('Medicina interna/Cardio', '3.Patología arterial extremidades inferiores.mp4'),
  v('Medicina interna/Cardio', '4.Dolor toracico.mp4'),
  v('Medicina interna/Cardio', '5.Manejo síndrome coronario agudo.mp4'),
  v('Medicina interna/Cardio', '6.Complicaciones del infarto al miocardio.mp4'),
  v('Medicina interna/Cardio', '7.Disección aórtica - Aneurisma aórtica abdominal.mp4'),
  v('Medicina interna/Cardio', '8.Angina cardíaca.mp4'),
  v('Medicina interna/Cardio', '9.Endocarditis bacteriana - Enfermedad reumática.mp4'),
  v('Medicina interna/Cardio', '10.Insuficiencia cardíaca.mp4'),
  v('Medicina interna/Cardio', '11.Paro cardíaco.mp4'),
  v('Medicina interna/Cardio', '12.Shock.mp4'),
  v('Medicina interna/Cardio', '13.Valvulopatías - Miocardiopatías - Enf. del pericardio.mp4'),
  v('Medicina interna/Cardio', '14.Miocardiopatías.mp4'),
  v('Medicina interna/Cardio', '15.Enfermedades del pericardio.mp4'),
  v('Medicina interna/Cardio', '16.Manejo de urgencia arritmias (1).mp4'),
  v('Medicina interna/Cardio', '17.Bradiarritmias.mp4'),
  v('Medicina interna/Cardio', '18.Taquiarritmias.mp4'),
  v('Medicina interna/Cardio', '19.Fibrilación auricular.mp4'),
  v('Medicina interna/Cardio', '20.FA Crónica.mp4'),
  v('Medicina interna/Cardio', '21.Hipertensión arterial.mp4'),
  v('Medicina interna/Cardio', '22.Hipertensión arterial secundaria.mp4'),
  v('Medicina interna/Cardio', '23.Tratamiento HTA Esencial (1).mp4'),
  v('Medicina interna/Cardio', '24.Dislipidemias.mp4'),
]

// === RHEUMATOLOGY VIDEOS ===
const REUMATO_VIDEOS = [
  v('Medicina interna/reumato', '1.Artrosis - Monoartritis.mp4'),
  v('Medicina interna/reumato', '2.Poliartritis - Artritis reumatoidea.mp4'),
  v('Medicina interna/reumato', '3.Enfermedades del tejido conectivo.mp4'),
  v('Medicina interna/reumato', '4.Vasculitis.mp4'),
  v('Medicina interna/reumato', '5.Pelviespondilopatías.mp4'),
  v('Medicina interna/reumato', '6.Lumbago - Cervicalgia - Hombro doloroso - Codo Doloroso - Tendinitis - Bursitis - Fibromialgia.mp4'),
  v('Medicina interna/reumato', '7.Osteoporosis y osteopenia.mp4'),
]

// === GASTROENTEROLOGY VIDEOS ===
const GASTRO_VIDEOS = [
  v('Medicina interna/gastro', '1.Trastornos digestivos funcionales.mp4'),
  v('Medicina interna/gastro', '2.Ictericia.mp4'),
  v('Medicina interna/gastro', '3.Hepatitis aguda y Hepatitis crónica.mp4'),
  v('Medicina interna/gastro', '4.Patología biliar.mp4'),
  v('Medicina interna/gastro', '5.Cáncer de esófago - Cáncer gástrico - Cáncer de colon - Cáncer de recto.mp4'),
  v('Medicina interna/gastro', '6.Abdomen agudo.mp4'),
  v('Medicina interna/gastro', '7.Abdomen agudo de origen vascular (1).mp4'),
  v('Medicina interna/gastro', '8.Pancreatitis aguda - Pancreatitis crónica.mp4'),
  v('Medicina interna/gastro', '9.Hemorragia digestiva (HDA y HDB).mp4'),
  v('Medicina interna/gastro', '10.Enfermedad inflamatoria intestinal.mp4'),
  v('Medicina interna/gastro', '11.Disfagia.mp4'),
  v('Medicina interna/gastro', '12.Diarrea aguda - Diarrea crónica - C. Difficile - Constipación.mp4'),
  v('Medicina interna/gastro', '13.RGE - UGD - Dispepsia funcional - H. Pylori.mp4'),
  v('Medicina interna/gastro', '14.Malabsorción intestinal - Enfermedad celíaca - Intolerancia a la lactosa - Galactosemia.mp4'),
  v('Medicina interna/gastro', '15.Daño hepático crónico.mp4'),
]

// === HEMATOLOGY VIDEOS ===
const HEMATO_VIDEOS = [
  v('Medicina interna/Hemato', '1.Anemias.mp4'),
  v('Medicina interna/Hemato', '2.Alteraciones de la hemostasia - Púrpura.mp4'),
  v('Medicina interna/Hemato', '3.Cáncer hematoncológico (Generalidades y Leucemias).mp4'),
  v('Medicina interna/Hemato', '4.Cáncer hematoncológico (Linfomas).mp4'),
  v('Medicina interna/Hemato', '5.Cáncer hematoncológico (Gamapatías monoclonales).mp4'),
  v('Medicina interna/Hemato', '6.Cáncer hematoncológico (Síndromes mieloproliferativos y síndrome mielodisplásico).mp4'),
  v('Medicina interna/Hemato', '7.Urgencias oncologicas.mp4'),
]

// === NEPHROLOGY VIDEOS ===
const NEFRO_VIDEOS = [
  v('Medicina interna/Nefro', '1.Insuficiencia Renal - IRA.mp4'),
  v('Medicina interna/Nefro', '2.IRC y Trasplante renal.mp4'),
  v('Medicina interna/Nefro', '3.Glomerulonefritis - Síndrome nefrítico - GNRP - Nefritis intersticial.mp4'),
  v('Medicina interna/Nefro', '4.Edema - Proteinuria - Síndrome nefrótico.mp4'),
  v('Medicina interna/Nefro', '5.Infección del tracto urinario (ITU).mp4'),
  v('Medicina interna/Nefro', '6.Diuréticos y Sueroterapias.mp4'),
  v('Medicina interna/Nefro', '7.Alteraciones hidroelectrolíticas.mp4'),
  v('Medicina interna/Nefro', '8.Litiasis urológica.mp4'),
  v('Medicina interna/Nefro', '9.Uropatía obstructiva baja - Retención urinaria - Sondas urinarias.mp4'),
  v('Medicina interna/Nefro', '10.Calcio - PTH.mp4'),
  v('Medicina interna/Nefro', '11.Diabetes insípida (DI) - Polidipsia primaria (PP) - SSIADH - Hiponatremia.mp4'),
]

// === INFECTOLOGY VIDEOS ===
const INFECTO_VIDEOS = [
  v('Medicina interna/Infecto', '1.Sepsis (1).mp4'),
  v('Medicina interna/Infecto', '2.Manejo de contactos (1).mp4'),
  v('Medicina interna/Infecto', '3.SD Mononucleósico - SD. Retroviral agudo - TORCH.mp4'),
  v('Medicina interna/Infecto', '4.Meningitis.mp4'),
  v('Medicina interna/Infecto', '5.Infecciones intrahospitalarias - Aislamientos.mp4'),
  v('Medicina interna/Infecto', '6.Rabia y Tétanos.mp4'),
  v('Medicina interna/Infecto', '7.Fiebre sin foco (FSF) - Fiebre de origen desconocido (FOD).mp4'),
  v('Medicina interna/Infecto', '8.Adenitis infecciosa - Adenitis submandibular - Flegmón piso de la boca.mp4'),
  v('Medicina interna/Infecto', '9.Ántrax o carbunclo.mp4'),
  v('Medicina interna/Infecto', '10.Amigdalitis - Difteria - Anginas infecciosas.mp4'),
  v('Medicina interna/Infecto', '11.Chagas - Malaria - Dengue - Zika - Chinkungunya - Fiebre amarilla - Hanta.mp4'),
  v('Medicina interna/Infecto', '12.Enfermedades de transmisión sexual (Primera parte).mp4'),
  v('Medicina interna/Infecto', '13.Enfermedades de transmisión sexual (Segunda parte).mp4'),
  v('Medicina interna/Infecto', '14.Exantemas (Primera parte).mp4'),
  v('Medicina interna/Infecto', '15.Exantemas (Segunda parte).mp4'),
  v('Medicina interna/Infecto', '16.Brucelosis - Leptospirosis - Bartonelosis - Fiebre tifoidea - Fiebre paratifoidea.mp4'),
  v('Medicina interna/Infecto', '17.Intoxicación alimentaria - Diarrea y microorganismos - Cólera.mp4'),
  v('Medicina interna/Infecto', '18.Varicela y Herpes Zóster.mp4'),
  v('Medicina interna/Infecto', '19.VIH.mp4'),
  v('Medicina interna/Infecto', '20.Infecciones oportunistas.mp4'),
  v('Medicina interna/Infecto', '21.Parasitosis (Primera parte).mp4'),
  v('Medicina interna/Infecto', '22.Parasitosis (Segunda parte).mp4'),
  v('Medicina interna/Infecto', '23.Tuberculosis.mp4'),
]

// === RESPIRATORY VIDEOS ===
const RESPIRATORIO_VIDEOS = [
  v('Medicina interna/Respiratorio', '1.Neumonía.mp4'),
  v('Medicina interna/Respiratorio', '2.Infección respiratoria alta influenza.mp4'),
  v('Medicina interna/Respiratorio', '3.Espirometría.mp4'),
  v('Medicina interna/Respiratorio', '4.Tabaquismo.mp4'),
  v('Medicina interna/Respiratorio', '5.Tuberculosis.mp4'),
  v('Medicina interna/Respiratorio', '6.Enfermedades intersticiales - Neumoconiosis - HTP - COR Pulmonar.mp4'),
  v('Medicina interna/Respiratorio', '7.Apnea del sueño - CE Respiratorio - Intoxicación por CO - Asfixia por inmersión.mp4'),
  v('Medicina interna/Respiratorio', '8.Neumotórax - Trauma de tórax - Hemotórax - Mediastinitis.mp4'),
  v('Medicina interna/Respiratorio', '9.Nódulo pulmonar - Cáncer pulmonar - Bronquitis crónica - Bronquiectasias - Hemoptisis.mp4'),
  v('Medicina interna/Respiratorio', '10.Derrame pleural - EPA.mp4'),
  v('Medicina interna/Respiratorio', '11.Asma y EPOC.mp4'),
  v('Medicina interna/Respiratorio', '12.TVP - TEP - Anticoagulación - Várices.mp4'),
]

// === NEUROLOGY VIDEOS ===
const NEURO_VIDEOS = [
  v('Neuro', '1.Demencia y Delirium.mp4'),
  v('Neuro', '2.TEC.mp4'),
  v('Neuro', '3.Trastornos del sueño.mp4'),
  v('Neuro', '4.Vértigo y parálisis facial.mp4'),
  v('Neuro', '5.Compromiso de conciencia - Apraxia - Agnosia - Afasia.mp4'),
  v('Neuro', '6.ACV.mp4'),
  v('Neuro', '7.Cefalea - Tumor cerebral - HTEC.mp4'),
  v('Neuro', '8.Cefaleas crónicas.mp4'),
  v('Neuro', '9.Esclerosis lateral amiotrófica (ELA) - Esclerosis múltiple (EM).mp4'),
  v('Neuro', '10.Crisis convulsivas - Epilepsia - Convulsiones febriles - Estatus convulsivo.mp4'),
  v('Neuro', '11.Polineuropatías - Neuralgias - Neuropatías por atrapamiento.mp4'),
  v('Neuro', '12.Síndromes motores.mp4'),
  v('Neuro', '13.Temblor - Extrapiramidalismo.mp4'),
]

// === GERIATRICS VIDEOS ===
const GERIATRIA_VIDEOS = [
  v('geriatria', '1.Adulto mayor normal - Evaluación geriátrica - Polifarmacia - Fragilidad - Patología en anciano.mp4'),
  v('geriatria', '2.Atrofia muscular - Inmovilidad - Caídas - Depresión - Abuso - Vacunas.mp4'),
  v('geriatria', '3.Incontinencia urinaria.mp4'),
]

// === PSYCHIATRY VIDEOS ===
const PSIQUIATRIA_VIDEOS = [
  v('Psiquiatria', '1.Psiquiatría.mp4'),
  v('Psiquiatria', '2.T. Anímicos I.mp4'),
  v('Psiquiatria', '3.T. Anímicos II.mp4'),
  v('Psiquiatria', '4.T. Anímicos III.mp4'),
  v('Psiquiatria', '5.Intoxicaciones.mp4'),
  v('Psiquiatria', '6.T. Psicóticos.mp4'),
  v('Psiquiatria', '7.T. Psicoticos II.mp4'),
  v('Psiquiatria', '8.T. Ansiosos.mp4'),
  v('Psiquiatria', '9.T. Ansiosos II.mp4'),
  v('Psiquiatria', '10.T. Ansiosos III.mp4'),
  v('Psiquiatria', '11.T. Somatomorfos.mp4'),
  v('Psiquiatria', '12.T. Personalidad.mp4'),
  v('Psiquiatria', '13.T. Conversivos y T. Disociativos.mp4'),
  v('Psiquiatria', '14.T. Alimentación.mp4'),
  v('Psiquiatria', '15.T. Consumo de sustancias.mp4'),
  v('Psiquiatria', '16.T. Alcohol.mp4'),
  v('Psiquiatria', '17.Psiquiatría Infantil I.mp4'),
  v('Psiquiatria', '18.Psiquiatría Infantil II.mp4'),
  v('Psiquiatria', '19.Psiquiatría Infantil III.mp4'),
  v('Psiquiatria', '20.Psiquiatría Infantil IV.mp4'),
  v('Psiquiatria', '21.- Demencia y Delirium.mp4'),
  v('Psiquiatria', '22.- Tabaquismo y Contaminacion Ambiental.mp4'),
  v('Psiquiatria', '23.- Trastorno del sueño.mp4'),
]

// === ORL VIDEOS ===
const ORL_VIDEOS = [
  v('ORL', '1.Amigdalitis aguda.mp4'),
  v('ORL', '2.Hipertrofia adenoides.mp4'),
  v('ORL', '3.Cáncer de cabeza y cuello.mp4'),
  v('ORL', '3.Patología glándulas salivales.mp4'),
  v('ORL', '4.Cuerpo extraño.mp4'),
  v('ORL', '5.Traumatismo ORL.mp4'),
  v('ORL', '6.Otitis I.mp4'),
  v('ORL', '7.Otitis II.mp4'),
  v('ORL', '8.Hipoacusia I.mp4'),
  v('ORL', '9.Hipoacusia II.mp4'),
  v('ORL', '10.Disfonías crónicas.mp4'),
  v('ORL', '11.Estridor congénito - Laringitis aguda - Croup espasmódico - Epiglotitis.mp4'),
  v('ORL', '12.Rinitis.mp4'),
  v('ORL', '13.Poliposis nasal - Tumores nasales - Epistaxis.mp4'),
  v('ORL', '14.Trastornos de la deglución y Trastornos del habla.mp4'),
]

// === OPHTHALMOLOGY VIDEOS ===
const OFTALMO_VIDEOS = [
  v('Oftalmología', '1.Ojo rojo superficial.mp4'),
  v('Oftalmología', '2.Ojo rojo profundo.mp4'),
  v('Oftalmología', '3.Pérdida lenta de visión.mp4'),
  v('Oftalmología', '4.Perdida súbita de visión.mp4'),
  v('Oftalmología', '5.Vicios de refracción.mp4'),
  v('Oftalmología', '6.Lesiones traumáticas oculares.mp4'),
  v('Oftalmología', '7.Misceláneos.mp4'),
  v('Oftalmología', '8.Neuroftalmología.mp4'),
  v('Oftalmología', '9.Oftalmología pediátrica.mp4'),
]

// === DERMATOLOGY VIDEOS ===
const DERMATO_VIDEOS = [
  v('Dermato', '1.Dermatología.mp4'),
  v('Dermato', '2.Acné y rosácea.mp4'),
  v('Dermato', '3.Alopecia y Lesiones hipopigmentadas.mp4'),
  v('Dermato', '4.Enfermedades autoinmunes (1).mp4'),
  v('Dermato', '5.Dermatitis y otras.mp4'),
  v('Dermato', '6.Tumores premalignos y Tumores benignos de piel.mp4'),
  v('Dermato', '7.Cáncer de piel.mp4'),
  v('Dermato', '8.Reacciones adversas a medicamentos (RAM).mp4'),
  v('Dermato', '9.Dermatología pediátrica.mp4'),
  v('Dermato', '10.Pediculosis - Sarna - Loxoscelismo - Verrugas - Moluscos contagioso - Herpes.mp4'),
  v('Dermato', '11.Infecciones por hongo.mp4'),
]

// === UROLOGY VIDEOS ===
const UROLOGIA_VIDEOS = [
  v('urología', '2.Testículo agudo - Orquiepididimitis - Dolor testicular crónico.mp4'),
  v('urología', '3.Tumor testicular - Quistes del epidídimo - Hidrocele - Varicocele.mp4'),
  v('urología', '4.Trauma renal - Trauma uretral - Trauma vesical - Trauma testicular - Fractura de pene.mp4'),
  v('urología', '5.Cáncer de próstata.mp4'),
  v('urología', '6.Hematuria - Cáncer de vejiga - Cáncer de uréter.mp4'),
  v('urología', '7.Tumor renal y Cáncer renal.mp4'),
  v('urología', '8.Fimosis - Parafimosis - Balanitis - Adherencias balanoprepuciales.mp4'),
  v('urología', '9.Criptorquídea - Testículo retráctil y ascensor.mp4'),
  v('urología', '10.ITU en pediatría - Malformaciones urológicas - Reflujo vesicoureteral.mp4'),
]

// === TRAUMATOLOGY VIDEOS ===
const TMT_VIDEOS = [
  v('TMT', '1.Generalidades fracturas.mp4'),
  v('TMT', '2.Fracturas expuestas.mp4'),
  v('TMT', '3.Complicaciones de las fracturas I.mp4'),
  v('TMT', '4.Complicaciones de las fracturas II.mp4'),
  v('TMT', '5.Complicaciones de las fracturas III (1).mp4'),
  v('TMT', '6.Politraumatismo y fractura de pelvis.mp4'),
  v('TMT', '7.Lesiones de hombro.mp4'),
  v('TMT', '8.Lesiones de extremidades superiores.mp4'),
  v('TMT', '9.Lesiones de extremidades inferiores.mp4'),
  v('TMT', '10.Lesiones de rodilla.mp4'),
  v('TMT', '11.Fractura de cadera.mp4'),
  v('TMT', '12.Lesiones de partes blandas.mp4'),
  v('TMT', '13.Tumores óseos.mp4'),
  v('TMT', '14.Traumatología infantil.mp4'),
  v('TMT', '15.Infección de piel y partes blandas.mp4'),
]

// === SURGERY VIDEOS ===
const CIRUGIA_VIDEOS = [
  v('Cx', '1.Fiebre postquirúrgica.mp4'),
  v('Cx', '2.Clasificación de la herida operatoria.mp4'),
  v('Cx', '3.Herida - Escaras - Cicatrices patológicas.mp4'),
  v('Cx', '4.Furúnculos - Abscesos - Flegmones - Panadizos - Onicocriptosis.mp4'),
  v('Cx', '5.Hernias.mp4'),
  v('Cx', '7.Lesiones hepáticas.mp4'),
  v('Cx', '8.Trauma abdominal y torácico.mp4'),
  v('Cx', '9.Patología perianal.mp4'),
  v('Cx', '10.Patología pilonidal.mp4'),
  v('Cx', '11.Tumores de partes blandas.mp4'),
  v('Cx', '12.Trauma cervical y raquimedular - Trauma maxilofacial - Heridas de cara y cuero cabelludo.mp4'),
  v('Cx', '13.Estenosis carotídea - Disección carotídea - Disección vertebra.mp4'),
  v('Cx', '14.Cirugía pediátrica I.mp4'),
  v('Cx', '15.Cirugía pediátrica II.mp4'),
  v('Cx', '16.Úlcera perforada - Perforación esofágica - Ingesta de soda cáustica.mp4'),
  v('Cx', '17.Hernia hiatal - Hernia diafragmática - Tumor mediastínico.mp4'),
  v('Cx', '18.Cáncer de mama.mp4'),
  v('Cx', '19.Patología benigna de la mama.mp4'),
  v('Cx', '20.Anestesia I.mp4'),
  v('Cx', '21.Anestesia II.mp4'),
]

// === GYNECOLOGY VIDEOS ===
const GINE_VIDEOS = [
  v('Gine ', '1.Amenorrea.mp4'),
  v('Gine ', '2.Oligomenorrea y síndrome de ovario poliquístico (SOP).mp4'),
  v('Gine ', '3.Sangrado uterino anormal.mp4'),
  v('Gine ', '4.Patología benigna del útero.mp4'),
  v('Gine ', '5.Patología maligna del útero.mp4'),
  v('Gine ', '6.Leucorreas.mp4'),
  v('Gine ', '8.Prevención del cáncer de cuello uterino.mp4'),
  v('Gine ', '9.Patología maligna del cuello uterino.mp4'),
  v('Gine ', '10.Tumor ovárico.mp4'),
  v('Gine ', '11. Algia pélvica aguda (APA).mp4'),
  v('Gine ', '12.Proceso inflamatorio pélvico (PIP).mp4'),
  v('Gine ', '13. Algia pélvica crónica.mp4'),
  v('Gine ', '14.Endometriosis.mp4'),
  v('Gine ', '15.Infertilidad.mp4'),
  v('Gine ', '16.Métodos anticonceptivos – Primera parte.mp4'),
  v('Gine ', '17.Métodos anticonceptivos – Segunda parte.mp4'),
  v('Gine ', '18.Climaterio, menopausia y terapia de reemplazo hormonal (TRH).mp4'),
  v('Gine ', '19.Prolapso genital.mp4'),
  v('Gine ', '20.Ginecología infantil.mp4'),
]

// === OBSTETRICS VIDEOS ===
const OBSTETRICIA_VIDEOS = [
  v('Obstetricia', '1.Control antenatal embarazo fisiológico.mp4'),
  v('Obstetricia', '2.Determinación de la edad gestacional.mp4'),
  v('Obstetricia', '3.Anemia y embarazo.mp4'),
  v('Obstetricia', '4.Aborto espontáneo.mp4'),
  v('Obstetricia', '5.Aborto séptico.mp4'),
  v('Obstetricia', '6.Embarazo gemelar.mp4'),
  v('Obstetricia', '7.Aborto retenido.mp4'),
  v('Obstetricia', '8.Embarazo ectópico (1).mp4'),
  v('Obstetricia', '9.Enfermedad trofoblástica gestacional (ETG).mp4'),
  v('Obstetricia', '10.Hiperemesis gravídica.mp4'),
  v('Obstetricia', '11.Distocias de presentación.mp4'),
  v('Obstetricia', '12.CIE e HGAE.mp4'),
  v('Obstetricia', '13.Metrorragia primera mitad del embarazo.mp4'),
  v('Obstetricia', '14.Metrorragia segunda mitad del embarazo.mp4'),
  v('Obstetricia', '16.Metrorragias puerperales.mp4'),
  v('Obstetricia', '21.Síndrome hipertensivo del embarazo (SHE) - Primera parte.mp4'),
  v('Obstetricia', '24.Psiquiatría obstétrica (1).mp4'),
  v('Obstetricia', '25.Atención del recién nacido - Asfixia neonatal.mp4'),
  v('Obstetricia', '26.Detección de hipoxia fetal – Primera parte (1).mp4'),
  v('Obstetricia', '27.Detección de hipoxia fetal – Segunda parte (1).mp4'),
  v('Obstetricia', '28.Puerperio – Primera parte.mp4'),
  v('Obstetricia', '29.Puerperio – Segunda parte (2).mp4'),
]

// === PEDIATRICS VIDEOS ===
const PEDI_VIDEOS = [
  v('Pedi', '1.Ictericia neonatal.mp4'),
  v('Pedi', '2.Distrés respiratorio del recién nacido.mp4'),
  v('Pedi', '3.Distintos tipos de recién nacido.mp4'),
  v('Pedi', '4.Patología neonatal.mp4'),
  v('Pedi', '5.Microcefalia - Macrocefalia - Cefalea en niños.mp4'),
  v('Pedi', '6.Parálisis cerebral - Síndrome hipotónico - Síndrome hipertónico - Desarrollo psicomotor.mp4'),
  v('Pedi', '7.Síndrome de Down.mp4'),
  v('Pedi', '8.Inmunodeficiencia.mp4'),
  v('Pedi', '9.Fiebre en pediatría.mp4'),
  v('Pedi', '10.Muerte súbita y alte.mp4'),
  v('Pedi', '11.Diarrea.mp4'),
  v('Pedi', '12.Reflujo lactante - Dolor abdominal crónico en niños - Constipación en niños - Fecaloma.mp4'),
  v('Pedi', '13.Infecciones respiratorias en pediatría.mp4'),
  v('Pedi', '14.Púrpura y Anemia.mp4'),
  v('Pedi', '15.Diagnóstico nutricional y Talla baja.mp4'),
  v('Pedi', '16.Nefrología en pediatría.mp4'),
  v('Pedi', '17.Síndrome bronquial obstructivo.mp4'),
  v('Pedi', '18.Vacuna y alimentación.mp4'),
]


// ============================================================
// DAY-BY-DAY SCHEDULE GENERATOR
// ============================================================

function generateSchedule() {
  const schedule = []
  const startDate = new Date(2026, 2, 4) // March 4, 2026
  
  // Helper to add N days
  const addDays = (date, n) => {
    const d = new Date(date)
    d.setDate(d.getDate() + n)
    return d
  }
  
  // Helper to format date as YYYY-MM-DD
  const fmt = (d) => d.toISOString().split('T')[0]
  
  // Helper to distribute videos across weekdays in a date range
  // Returns array of { date, videos, topic, chapter, questionsTopic, questionCount, isReview, isExamDay, weekLabel }
  const distributeWeek = (weekStart, videos, topic, chapter, questionsTopic, totalQuestions, weekNum) => {
    const days = []
    const weekdays = [] // Mon-Fri indices: 0-4
    const weekend = []  // Sat-Sun indices: 5-6
    
    for (let i = 0; i < 7; i++) {
      const d = addDays(weekStart, i)
      const dow = d.getDay() // 0=Sun, 6=Sat
      if (dow === 0 || dow === 6) {
        weekend.push(d)
      } else {
        weekdays.push(d)
      }
    }
    
    // Distribute videos across weekdays (Mon-Fri = 5 days)
    const videosPerDay = Math.ceil(videos.length / Math.max(weekdays.length, 1))
    let vidIdx = 0
    
    weekdays.forEach((d, i) => {
      const dayVideos = videos.slice(vidIdx, vidIdx + videosPerDay)
      vidIdx += videosPerDay
      const questionsForDay = Math.round(totalQuestions / 7)
      
      days.push({
        date: fmt(d),
        week: weekNum,
        topic,
        chapter,
        videos: dayVideos,
        questionsTopic,
        questionCount: questionsForDay,
        isReview: false,
        isExamDay: false,
        weekLabel: `Semana ${weekNum}`,
        dayType: 'study',
        emoji: '📹',
      })
    })
    
    // Weekends: review + questions only (no new videos)
    weekend.forEach((d) => {
      const questionsForDay = Math.round(totalQuestions / 7)
      days.push({
        date: fmt(d),
        week: weekNum,
        topic: `Repaso: ${topic}`,
        chapter,
        videos: [],
        questionsTopic,
        questionCount: questionsForDay,
        isReview: true,
        isExamDay: false,
        weekLabel: `Semana ${weekNum}`,
        dayType: 'review',
        emoji: '📝',
      })
    })
    
    return days.sort((a, b) => a.date.localeCompare(b.date))
  }
  
  // Helper for review weeks (no new videos, just simulacros)
  const reviewWeek = (weekStart, topic, chapter, weekNum) => {
    const days = []
    for (let i = 0; i < 7; i++) {
      const d = addDays(weekStart, i)
      const dow = d.getDay()
      let dayType, emoji, desc
      
      if (dow === 1 || dow === 4) { // Monday, Thursday
        dayType = 'simulacro'
        emoji = '🎯'
        desc = `Simulacro completo — ${topic}`
      } else if (dow === 3) { // Wednesday
        dayType = 'analysis'
        emoji = '📊'
        desc = `Análisis de resultados — ${topic}`
      } else if (dow === 0) { // Sunday
        dayType = 'rest'
        emoji = '😴'
        desc = 'Descanso activo'
      } else {
        dayType = 'weak-review'
        emoji = '🔄'
        desc = `Repasar temas débiles — ${topic}`
      }
      
      days.push({
        date: fmt(d),
        week: weekNum,
        topic: desc,
        chapter,
        videos: [],
        questionsTopic: topic,
        questionCount: dayType === 'simulacro' ? 180 : dayType === 'rest' ? 0 : 50,
        isReview: true,
        isExamDay: false,
        weekLabel: `Semana ${weekNum}`,
        dayType,
        emoji,
      })
    }
    return days
  }
  
  let weekStart = new Date(startDate)
  
  // Week 1: Diabetes + Endocrinología (March 4-10)
  schedule.push(...distributeWeek(weekStart, [...DIABETES_VIDEOS, ...ENDOCRINO_VIDEOS], 'Diabetes + Endocrinología', CHAPTERS.INTERNAL_MEDICINE, 'Endocrinología', 529, 1))
  
  // Week 2: Cardiología (March 11-17)
  weekStart = addDays(startDate, 7)
  schedule.push(...distributeWeek(weekStart, CARDIO_VIDEOS, 'Cardiología', CHAPTERS.INTERNAL_MEDICINE, 'Cardiología', 418, 2))
  
  // Week 3: Reumatología + Gastro P1 (March 18-24)
  weekStart = addDays(startDate, 14)
  schedule.push(...distributeWeek(weekStart, [...REUMATO_VIDEOS, ...GASTRO_VIDEOS.slice(0, 8)], 'Reumatología + Gastroenterología', CHAPTERS.INTERNAL_MEDICINE, 'Reumatología', 512, 3))
  
  // Week 4: Gastro P2 + Hematología (March 25-31)
  weekStart = addDays(startDate, 21)
  schedule.push(...distributeWeek(weekStart, [...GASTRO_VIDEOS.slice(8), ...HEMATO_VIDEOS], 'Gastroenterología + Hematología', CHAPTERS.INTERNAL_MEDICINE, 'Gastroenterología', 599, 4))
  
  // Week 5: Nefrología + Infecto P1 (April 1-7)
  weekStart = addDays(startDate, 28)
  schedule.push(...distributeWeek(weekStart, [...NEFRO_VIDEOS, ...INFECTO_VIDEOS.slice(0, 12)], 'Nefrología + Infectología', CHAPTERS.INTERNAL_MEDICINE, 'Nefrología', 536, 5))
  
  // Week 6: Infecto P2 + Respiratorio (April 8-14)
  weekStart = addDays(startDate, 35)
  schedule.push(...distributeWeek(weekStart, [...INFECTO_VIDEOS.slice(12), ...RESPIRATORIO_VIDEOS], 'Infectología + Respiratorio', CHAPTERS.INTERNAL_MEDICINE, 'Infectología', 548, 6))
  
  // Week 7: Neurología + Geriatría (April 15-21)
  weekStart = addDays(startDate, 42)
  schedule.push(...distributeWeek(weekStart, [...NEURO_VIDEOS, ...GERIATRIA_VIDEOS], 'Neurología + Geriatría', CHAPTERS.INTERNAL_MEDICINE, 'Neurología', 300, 7))
  
  // Week 8: REVIEW Internal Medicine (April 22-28)
  weekStart = addDays(startDate, 49)
  schedule.push(...reviewWeek(weekStart, 'Medicina Interna', CHAPTERS.REVIEW, 8))
  
  // Week 9: Psiquiatría (April 29 - May 5)
  weekStart = addDays(startDate, 56)
  schedule.push(...distributeWeek(weekStart, PSIQUIATRIA_VIDEOS, 'Psiquiatría', CHAPTERS.SPECIALTIES, 'Psiquiatría', 200, 9))
  
  // Week 10: Salud Pública + ORL (May 6-12)
  weekStart = addDays(startDate, 63)
  schedule.push(...distributeWeek(weekStart, ORL_VIDEOS, 'Salud Pública + ORL', CHAPTERS.SPECIALTIES, 'Salud Pública', 200, 10))
  
  // Week 11: Oftalmología + Dermatología (May 13-19)
  weekStart = addDays(startDate, 70)
  schedule.push(...distributeWeek(weekStart, [...OFTALMO_VIDEOS, ...DERMATO_VIDEOS], 'Oftalmología + Dermatología', CHAPTERS.SPECIALTIES, 'Oftalmología', 200, 11))
  
  // Week 12: Urología + Traumatología (May 20-26)
  weekStart = addDays(startDate, 77)
  schedule.push(...distributeWeek(weekStart, [...UROLOGIA_VIDEOS, ...TMT_VIDEOS], 'Urología + Traumatología', CHAPTERS.SPECIALTIES, 'Traumatología', 200, 12))
  
  // Week 13: Cirugía y Anestesia (May 27 - June 2)
  weekStart = addDays(startDate, 84)
  schedule.push(...distributeWeek(weekStart, CIRUGIA_VIDEOS, 'Cirugía y Anestesia', CHAPTERS.SPECIALTIES, 'Cirugía y anastesia', 330, 13))
  
  // Week 14: Ginecología (June 3-9)
  weekStart = addDays(startDate, 91)
  schedule.push(...distributeWeek(weekStart, GINE_VIDEOS, 'Ginecología', CHAPTERS.OBGYN_PEDS, 'Ginecología', 200, 14))
  
  // Week 15: Obstetricia (June 10-16)
  weekStart = addDays(startDate, 98)
  schedule.push(...distributeWeek(weekStart, OBSTETRICIA_VIDEOS, 'Obstetricia', CHAPTERS.OBGYN_PEDS, 'Obstetricia', 200, 15))
  
  // Week 16: Pediatría (June 17-23)
  weekStart = addDays(startDate, 105)
  schedule.push(...distributeWeek(weekStart, PEDI_VIDEOS, 'Pediatría', CHAPTERS.OBGYN_PEDS, 'Pediatría', 200, 16))
  
  // Week 17: Repaso + Simulacros (June 24-30)
  weekStart = addDays(startDate, 112)
  schedule.push(...reviewWeek(weekStart, 'Repaso General', CHAPTERS.REVIEW, 17))
  
  // Week 18: FINAL REVIEW (July 1-7) + Exam Day July 8
  weekStart = addDays(startDate, 119)
  const finalDays = [
    { date: '2026-07-01', week: 18, topic: 'Simulacro Final #1 (180 preguntas)', chapter: CHAPTERS.REVIEW, videos: [], questionsTopic: 'Todos', questionCount: 180, isReview: true, isExamDay: false, weekLabel: 'Semana 18', dayType: 'simulacro', emoji: '🎯' },
    { date: '2026-07-02', week: 18, topic: 'Corrección detallada simulacro', chapter: CHAPTERS.REVIEW, videos: [], questionsTopic: 'Todos', questionCount: 0, isReview: true, isExamDay: false, weekLabel: 'Semana 18', dayType: 'analysis', emoji: '📊' },
    { date: '2026-07-03', week: 18, topic: 'Repasar solo temas débiles', chapter: CHAPTERS.REVIEW, videos: [], questionsTopic: 'Temas débiles', questionCount: 50, isReview: true, isExamDay: false, weekLabel: 'Semana 18', dayType: 'weak-review', emoji: '🔄' },
    { date: '2026-07-04', week: 18, topic: 'Repasar temas de alta frecuencia', chapter: CHAPTERS.REVIEW, videos: [], questionsTopic: 'Alta frecuencia', questionCount: 50, isReview: true, isExamDay: false, weekLabel: 'Semana 18', dayType: 'weak-review', emoji: '🔄' },
    { date: '2026-07-05', week: 18, topic: 'Descanso activo — solo resúmenes', chapter: CHAPTERS.REVIEW, videos: [], questionsTopic: '', questionCount: 0, isReview: true, isExamDay: false, weekLabel: 'Semana 18', dayType: 'rest', emoji: '😴' },
    { date: '2026-07-06', week: 18, topic: 'Descanso activo — solo resúmenes', chapter: CHAPTERS.REVIEW, videos: [], questionsTopic: '', questionCount: 0, isReview: true, isExamDay: false, weekLabel: 'Semana 18', dayType: 'rest', emoji: '😴' },
    { date: '2026-07-07', week: 18, topic: 'Repaso ULTRA ligero. Dormir temprano.', chapter: CHAPTERS.REVIEW, videos: [], questionsTopic: '', questionCount: 0, isReview: true, isExamDay: false, weekLabel: 'Semana 18', dayType: 'rest', emoji: '🌙' },
    { date: '2026-07-08', week: 18, topic: '🎯 DÍA DEL EXAMEN EUNACOM', chapter: CHAPTERS.REVIEW, videos: [], questionsTopic: '', questionCount: 0, isReview: false, isExamDay: true, weekLabel: '¡EXAMEN!', dayType: 'exam', emoji: '🏆' },
  ]
  schedule.push(...finalDays)
  
  return schedule
}

export const STUDY_SCHEDULE = generateSchedule()
export { CHAPTERS }

// Lookup helpers
export const getScheduleForDate = (dateStr) => STUDY_SCHEDULE.find(d => d.date === dateStr)
export const getScheduleForWeek = (weekNum) => STUDY_SCHEDULE.filter(d => d.week === weekNum)
export const getWeekNumber = (dateStr) => {
  const entry = STUDY_SCHEDULE.find(d => d.date === dateStr)
  return entry ? entry.week : null
}
export const getTodaySchedule = () => {
  const today = new Date().toISOString().split('T')[0]
  return getScheduleForDate(today)
}
