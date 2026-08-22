const fs = require('fs');
const path = require('path');

const cardioPath = path.join(__dirname, '..', 'src', 'data', 'studio', 'cardio_catalog.json');
const catalogPath = path.join(__dirname, '..', 'src', 'data', 'studio', 'perfil_v3_catalog.json');

const script = `[SLIDE 1: PORTADA & CÓDIGOS OFICIALES]
Bienvenidos a la Masterclass oficial de Angina Crónica Estable y Cardiopatía Isquémica para el EUNACOM 2026.
En esta clase cubrimos en profundidad los códigos 1.01.1.001 de Angina Estable, 1.01.4.004 de Test de Esfuerzo y 1.01.4.008 de AngioTAC coronario del Perfil V3 de ASOFAMECh.
Aprenderás a diferenciar la angina típica de otras causas de dolor torácico, los criterios de positividad y alto riesgo en el test de esfuerzo, la farmacoterapia antiisquémica de primera línea, la prevención secundaria obligatoria y el manejo de la angina vasoespástica de Prinzmetal. Además, resolveremos 3 casos clínicos reales del examen. Comencemos.

[SLIDE 2: MATRIZ DE EXIGENCIA LEGAL PERFIL V3]
Revisemos la exigencia legal del Perfil V3.
El código 1.01.1.001 clasifica la Angina Crónica Estable con nivel Diagnóstico Específico, Tratamiento Inicial y Seguimiento Completo en APS.
Esto significa que como médico general en CESFAM estás legalmente facultado y obligado a realizar el diagnóstico clínico, solicitar la estratificación no invasiva, iniciar la terapia farmacológica y realizar el seguimiento ambulatorio periódico.
Solo en caso de refractariedad o criterios de alto riesgo isquémico se deriva a nivel secundario para coronariografía.

[SLIDE 3: CRITERIOS DE DIAMOND-FORRESTER]
El diagnóstico de la angina de pecho es fundamentalmente clínico y se basa en los 3 criterios de Diamond-Forrester:
Primero: Localización y carácter. Dolor u opresión retroesternal profunda, con irradiación típica a mandíbula, cuello o extremidad superior izquierda.
Segundo: Gatillante fisiológico. Aparece de manera predecible con el esfuerzo físico o estrés emocional.
Tercero: Alivio rápido. Cede en menos de 5 a 10 minutos con el reposo o con nitratos sublinguales.
Si el paciente cumple los 3 criterios, se define como Angina Típica. Si cumple 2, es Angina Atípica. Si cumple 0 o 1, es Dolor Torácico No Cardíaco.

[SLIDE 4: CLASIFICACIÓN DEL DOLOR TORÁCICO]
Analicemos los tipos de dolor torácico en el EUNACOM:
La Angina Típica confiere una probabilidad pretest mayor al 85% en hombres mayores de 50 años.
La Angina Atípica es especialmente frecuente en mujeres, adultos mayores y pacientes diabéticos, donde la isquemia miocárdica puede manifestarse solo como equivalentes anginosos: disnea súbita de esfuerzo, fatiga inexplicable o náuseas.
El Dolor No Cardíaco se caracteriza por dolor punzante tipo puntada de costado, que empeora con la respiración profunda o que se reproduce palpando las articulaciones condrocostales, típico de la osteocondritis o Síndrome de Tietze.

[SLIDE 5: ESCALA CANADIENSE CCS]
La limitación funcional de la angina se clasifica según la Sociedad Cardiovascular Canadiense en 4 clases:
Clase I: La actividad física ordinaria no causa angina; solo aparece con esfuerzos extenuantes o prolongados.
Clase II: Ligera limitación de la actividad ordinaria; aparece al caminar rápido en subida o subir más de un piso.
Clase III: Marcada limitación; aparece al caminar 1 o 2 cuadras en plano a paso normal.
Clase IV: Incapacidad total; aparece con mínimos esfuerzos de la vida diaria o en reposo.
¡Atención a esta regla de examen!: Todo paciente que pasa bruscamente a clase funcional III o IV en las últimas semanas o presenta dolor en reposo debe manejarse como un Síndrome Coronario Agudo.

[SLIDE 6: FISIOPATOLOGÍA DE LA PLACA ESTABLE]
La base fisiopatológica de la angina estable es una placa de ateroma rica en colágeno con capa fibrosa gruesa que obstruye de forma fija más del 70% del lumen arterial coronario.
En reposo, el flujo sanguíneo coronario basal es suficiente para satisfacer el miocardio. Sin embargo, durante el ejercicio, la demanda de oxígeno aumenta y la reserva coronaria se agota, generando isquemia subendocárdica transitoria.
En la cascada isquémica, el dolor es el último eslabón: primero se produce la alteración metabólica celular, luego la disfunción diastólica, seguida de la disfunción sistólica y cambios eléctricos en el ECG, para finalmente manifestarse el dolor torácico.

[SLIDE 7: SELECCIÓN DEL TEST DIAGNÓSTICO]
¿Cómo elegimos el examen diagnóstico en APS?:
Si el paciente tiene capacidad para caminar y su ECG basal es completamente normal e interpretable, el estudio de primera línea es el Test de Esfuerzo convencional o Ergometría con protocolo de Bruce.
Si la probabilidad pretest es baja o intermedia (15 al 50%), el AngioTAC de coronarias es una excelente alternativa gracias a su Valor Predictivo Negativo superior al 98%, ideal para descartar enfermedad coronaria.
Si el ECG basal tiene alteraciones basales como Bloqueo Completo de Rama Izquierda, marcapasos o preexcitación, o el paciente tiene limitación motora, el Test de Esfuerzo pierde validez y se debe solicitar un Eco-Estrés o Resonancia Cardíaca con fármacos como Dobutamina o Dipiridamol.

[SLIDE 8: TEST DE ESFUERZO (CRITERIOS DE POSITIVIDAD)]
El Test de Esfuerzo se considera positivo para isquemia miocárdica cuando se observa un infradesnivel del segmento ST mayor o igual a 1 milímetro horizontal o descendente medido a 80 milisegundos del punto J.
Un infradesnivel ascendente rápido es una respuesta fisiológica normal al ejercicio y NO se considera patológico.
La aparición de un supradesnivel del ST en derivaciones sin onda Q previa indica isquemia transmural severa y obliga a detener la prueba de inmediato.
Entre las contraindicaciones absolutas para realizar un test de esfuerzo destacan la Estenosis Aórtica Severa Sintomática, el infarto reciente menor a 48 horas y las arritmias ventriculares malignas inestables.

[SLIDE 9: CRITERIOS DE ALTO RIESGO ISQUÉMICO]
Existen 4 banderas rojas en el Test de Esfuerzo que definen alto riesgo de mortalidad anual mayor al 3% y obligan a derivar al paciente directamente a Coronariografía Invasiva:
1. Infradesnivel del ST severo: Mayor o igual a 2 milímetros, o presente en 5 o más derivaciones.
2. Aparición precoz: Isquemia en el estadio 1 de Bruce, con frecuencia cardíaca menor a 120 latidos por minuto o menos de 5 METs.
3. Caída de la Presión Arterial Sistólica durante el esfuerzo, lo que traduce falla de bomba ventricular izquierda por isquemia masiva.
4. Arritmias ventriculares complejas como Taquicardia Ventricular durante el esfuerzo.
Cualquiera de estos hallazgos sugiere compromiso del Tronco Coronario Izquierdo o enfermedad de 3 vasos.

[SLIDE 10: PILARES DE PREVENCIÓN SECUNDARIA]
Todo paciente con cardiopatía coronaria confirmada debe recibir terapia de prevención secundaria obligatoria en APS:
Primero: Aspirina a dosis de 100 miligramos al día a permanencia, o Clopidogrel 75 miligramos si existe alergia demostrada.
Segundo: Estatinas de alta potencia: Atorvastatina 80 miligramos o Rosuvastatina 40 miligramos al día. Su objetivo es estabilizar la placa y alcanzar la meta de c-LDL menor a 55 miligramos por decilitro con una reducción mínima del 50%.
Tercero: Inhibidores de la ECA como Enalapril 10 a 20 miligramos al día si el paciente tiene hipertensión, diabetes, disfunción ventricular izquierda o daño renal.

[SLIDE 11: BETABLOQUEADORES (1RA LÍNEA ANTIISQUÉMICA)]
Los Betabloqueadores son el fármaco antiisquémico de primera elección.
Al bloquear los receptores Beta-1 miocárdicos, reducen la frecuencia cardíaca, la contractilidad y el consumo de oxígeno, prolongando el tiempo de diástole para favorecer la perfusión coronaria.
Los fármacos recomendados son Bisoprolol de 5 a 10 miligramos al día, Carvedilol 25 miligramos cada 12 horas o Succinato de Metoprolol.
La meta terapéutica obligatoria es alcanzar una frecuencia cardíaca en reposo entre 55 y 60 latidos por minuto.
Si los betabloqueadores están contraindicados por asma severa o bloqueo AV, el fármaco alternativo de primera línea es un Calcioantagonista no dihidropiridínico como Verapamilo o Diltiazem.

[SLIDE 12: CALCIOANTAGONISTAS & NITRATOS]
Si el paciente persiste con síntomas a pesar del betabloqueo óptimo, asociamos un Calcioantagonista Dihidropiridínico como Amlodipino 5 a 10 miligramos al día, el cual induce vasodilatación arterial periférica y coronaria.
Para el alivio sintomático de rescate, indicamos Nitroglicerina sublingual 0.6 miligramos SOS.
Instruimos al paciente a tomar 1 comprimido sentado en reposo; si el dolor no cede en 5 minutos, repetir la dosis hasta un máximo de 3 comprimidos en 15 minutos. Si el dolor persiste, debe acudir de urgencia.
¡Regla de oro de seguridad!: Jamás administrar nitratos si el paciente tomó Sildenafil en las últimas 24 horas o Tadalafil en las últimas 48 horas por riesgo de hipotensión refractaria mortal.

[SLIDE 13: ANGINA DE PRINZMETAL]
La Angina Vasoespástica de Prinzmetal es una entidad clásica en el EUNACOM:
Se presenta como dolor anginoso típico de reposo, predominantemente nocturno o de madrugada, en personas jóvenes cuyo único factor de riesgo suele ser el tabaquismo.
Durante el dolor, el electrocardiograma muestra un supradesnivel transitorio del segmento ST que se normaliza por completo al ceder el espasmo con nitroglicerina.
El tratamiento de elección a largo plazo son los Calcioantagonistas como Amlodipino o Diltiazem más el cese del tabaquismo.
¡Peligro mortal!: Los Betabloqueadores están estrictamente contraindicados en la angina de Prinzmetal porque dejan el tono vasoconstrictor Alfa-1 sin oposición, agravando el vasoespasmo.

[SLIDE 14: LAS 4 TRAMPAS DEL EUNACOM]
Repasemos las 4 trampas clásicas del examen:
Trampa 1: Creer que la estatina no se indica si el colesterol es normal. En cardiopatía coronaria, la Atorvastatina 80 mg es obligatoria para todos los pacientes.
Trampa 2: Indicar test de esfuerzo en un paciente con BCRI o marcapasos. El trazado basal no permite ver el ST; se debe solicitar Eco-Estrés.
Trampa 3: Usar betabloqueadores en sospecha de angina de Prinzmetal. Empeoran el cuadro; se usan Calcioantagonistas.
Trampa 4: Confundir una angina inestable con estable. Si el dolor ocurre en reposo o con mínimos esfuerzos, es una urgencia médica.

[SLIDE 15: CASO CLÍNICO 1]
Analicemos el Caso 1: Hombre de 56 años hipertenso y fumador con dolor retroesternal opresivo de 3 meses que aparece al subir escaleras y cede en 3 a 5 minutos de reposo, con ECG basal normal.
Cumple los 3 criterios de Diamond-Forrester para Angina Crónica Estable en clase funcional CCS II.
Dado que su ECG basal es normal y puede caminar, la conducta diagnóstica indicada es un Test de Esfuerzo en protocolo de Bruce, asociando de inmediato prevención secundaria con Aspirina, Atorvastatina y Betabloqueo. La opción correcta es la B.

[SLIDE 16: CASO CLÍNICO 2]
Analicemos el Caso 2: Mujer de 64 años con angina estable confirmada en tratamiento con dosis baja de betabloqueador (Atenolol 25 mg/día), quien persiste sintomática con frecuencia cardíaca en reposo de 82 latidos por minuto.
La conducta correcta es titular al alza la dosis del Betabloqueador hasta alcanzar la meta terapéutica de 55 a 60 latidos por minuto en reposo antes de cambiar o agregar otros fármacos. La opción correcta es la C.

[SLIDE 17: CASO CLÍNICO 3]
Analicemos el Caso 3: Hombre de 42 años fumador con dolor anginoso nocturno que lo despierta a las 4 AM, con supradesnivel transitorio del ST en derivaciones inferiores que desaparece con nitroglicerina y enzimas negativas.
El diagnóstico es Angina Vasoespástica de Prinzmetal.
El tratamiento de elección son los Calcioantagonistas para prevenir el espasmo arterial y los Betabloqueadores están formalmente contraindicados. La opción correcta es la D.

[SLIDE 18: ALGORITMO RESUMIDO DE DECISIÓN]
En resumen, ante una sospecha de angina crónica estable:
Paso 1: Diagnóstico clínico con los criterios de Diamond-Forrester y graduación CCS I a IV.
Paso 2: Test de esfuerzo si el ECG basal es normal; AngioTAC en riesgo intermedio o Eco-Estrés si hay BCRI.
Paso 3: Terapia preventiva obligatoria con Aspirina 100 mg más Atorvastatina 80 mg (meta LDL menor a 55 mg/dL).
Paso 4: Terapia antiisquémica con Betabloqueador buscando FC 55 a 60 lpm más Nitroglicerina sublingual de rescate.

[SLIDE 19: CIERRE DE LA CLASE]
Felicitaciones, has completado la Masterclass de Angina Crónica Estable dominando los 19 conceptos esenciales para el EUNACOM 2026.
En la siguiente clase revisaremos el Síndrome Coronario Agudo sin Supradesnivel del ST y la Angina Inestable. ¡Nos vemos en Cardio 02!`;

const cardio = JSON.parse(fs.readFileSync(cardioPath, 'utf8'));
const c01 = cardio.classes.find(c => c.id === 'cardio-01');
if (c01) {
  c01.slideCount = 19;
  c01.teleprompterScript = script;
  fs.writeFileSync(cardioPath, JSON.stringify(cardio, null, 2), 'utf8');
}

const catalog = JSON.parse(fs.readFileSync(catalogPath, 'utf8'));
const spec = catalog.specialties.find(s => s.specialtyId === 'cardiologia');
if (spec) {
  const cat01 = spec.classes.find(c => c.id === 'cardio-01');
  if (cat01) {
    cat01.slideCount = 19;
    cat01.teleprompterScript = script;
    fs.writeFileSync(catalogPath, JSON.stringify(catalog, null, 2), 'utf8');
  }
}

console.log('Script injection complete for cardio-01 (19 slides).');
