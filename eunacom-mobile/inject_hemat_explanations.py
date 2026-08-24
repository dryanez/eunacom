#!/usr/bin/env python3
"""Inject AI-generated explanations for the 21 hematología questions missing them."""
import json

EXPLANATIONS = {
    # Key: (prueba_id, numero) → explanation text
    ("modulo-1-hematologia-1", 2): (
        "La Leucemia Mieloide Crónica (LMC) se presenta con esplenomegalia importante, leucocitosis masiva (>30.000) "
        "con desplazamiento hacia la izquierda (promielocitos, baciliformes), y plaquetas elevadas. El porcentaje de blastos es bajo "
        "(<5%), lo que distingue la LMC de una leucemia aguda. La fiebre recurrente y el dolor en hipocondrio izquierdo reflejan "
        "la esplenomegalia por infiltración leucémica. La mononucleosis y fiebre tifoidea no explican leucocitosis de esta magnitud "
        "con desviación izquierda mieloide."
    ),
    ("modulo-1-hematologia-1", 12): (
        "El cuadro de síntomas B (fiebre, baja de peso, sudoración nocturna), poliadenopatías cervicales y mediastino ensanchado "
        "en una mujer joven con hemograma normal es altamente sugestivo de Linfoma (especialmente Hodgkin). "
        "El mediastino ensanchado por adenopatías mediastínicas es una presentación clásica del linfoma de Hodgkin. "
        "La Bartonella y TBC pueden dar adenopatías pero no mediastino ensanchado típicamente. La leucemia suele alterar el hemograma."
    ),
    ("modulo-1-hematologia-1", 19): (
        "El déficit de vitamina B12 produce pancitopenia (anemia + leucopenia + trombocitopenia) por falla en la síntesis de ADN "
        "en la médula ósea, afectando las tres series. En un adulto de 60 años con pancitopenia moderada (Hcto 27%, blancos 3100, "
        "plaq 50.000) sin blastos, el déficit de B12 es la causa más frecuente. La aplasia medular daría pancitopenia más severa; "
        "la leucemia aguda generalmente presenta blastos en el frotis."
    ),
    ("modulo-1-hematologia-3", 5): (
        "La poliglobulia por hipoxemia (poliglobulia secundaria) ocurre como respuesta compensatoria a hipoxia crónica. "
        "Este paciente con EPOC severo (limitación crónica del flujo aéreo por TBC antigua) presenta Hcto 60% y Hb 19.6 g/dl, "
        "con plaquetas y blancos normales. Esto descarta policitemia vera (que cursa con pancitosis: aumento de las tres series). "
        "La eritropoyetina aumenta en respuesta a la hipoxia, estimulando la eritropoyesis compensadora."
    ),
    ("modulo-1-hematologia-3", 18): (
        "La Leucemia Mieloide Crónica (LMC) se presenta con esplenomegalia importante, leucocitosis masiva (>30.000) "
        "con desplazamiento hacia la izquierda (promielocitos, baciliformes), y plaquetas elevadas. El porcentaje de blastos es bajo "
        "(<5%), lo que distingue la LMC de una leucemia aguda. La fiebre recurrente y el dolor en hipocondrio izquierdo reflejan "
        "la esplenomegalia por infiltración leucémica. La mononucleosis y fiebre tifoidea no explican leucocitosis de esta magnitud "
        "con desviación izquierda mieloide."
    ),
    ("modulo-1-hematologia-4", 2): (
        "La ictericia neonatal que aparece en las primeras 24 horas de vida se debe a hemólisis activa. La incompatibilidad ABO "
        "es la causa más FRECUENTE de enfermedad hemolítica neonatal porque los anticuerpos anti-A y anti-B de clase IgG pueden "
        "cruzar la placenta. La incompatibilidad Rh también es grave pero es menos frecuente gracias a la profilaxis con "
        "inmunoglobulina anti-D. La ictericia fisiológica aparece después de las 24 horas, nunca antes."
    ),
    ("modulo-1-hematologia-4", 5): (
        "La prematurez es el único factor que NO aumenta el riesgo de poliglobulia neonatal; al contrario, los prematuros "
        "tienden a tener hematocrito más bajo. Los factores de riesgo reales son: hijo de madre diabética (hiperglicemia fetal "
        "estimula eritropoyetina), preeclampsia (hipoxia crónica), RCIU (hipoxia placentaria) y recién nacido postérmino "
        "(insuficiencia placentaria). La poliglobulia neonatal se define como Hcto >65%."
    ),
    ("modulo-1-hematologia-4", 6): (
        "La Leucemia Linfática Aguda (LLA) es la neoplasia maligna más frecuente en niños. Se presenta con pancitopenia "
        "(por infiltración medular), fiebre y compromiso del estado general. La presencia de 5% de blastos en el hemograma "
        "junto a pancitopenia en un niño de 5 años es altamente diagnóstica de LLA. La LLC no existe en niños. "
        "El linfoma generalmente no causa pancitopenia tan marcada en etapa inicial."
    ),
    ("modulo-1-hematologia-4", 7): (
        "Las inmunodeficiencias primarias más frecuentes en pediatría son las alteraciones de la inmunidad humoral (déficit de "
        "anticuerpos/hipogammaglobulinemia), representando ~50-70% de los casos. La más común es el déficit selectivo de IgA. "
        "Se manifiestan con infecciones bacterianas recurrentes. Las alteraciones de inmunidad celular son más raras pero más "
        "graves, y las inmunodeficiencias combinadas severas (SCID) son poco frecuentes."
    ),
    ("modulo-1-hematologia-4", 8): (
        "Bordetella pertussis produce una linfocitosis marcada como parte de su patogenia: la toxina pertussis bloquea la "
        "migración de linfocitos hacia los ganglios linfáticos, acumulándose en sangre periférica. Este fenómeno se denomina "
        "'reacción leucemoide', porque mimetiza una leucemia pero es reactivo e infeccioso. Los valores pueden llegar a "
        "40.000-50.000 linfocitos/mm3. Es importante diferenciarlo de LLA, que también cursa con linfocitosis."
    ),
    ("modulo-1-hematologia-4", 9): (
        "La profilaxis de la enfermedad hemolítica fetal por incompatibilidad Rh consiste en administrar inmunoglobulina anti-D "
        "a mujeres Rh NEGATIVAS NO sensibilizadas. Si ya están sensibilizadas (Coombs indirecto positivo), la profilaxis no sirve. "
        "Se administra a las 28 semanas de gestación y dentro de las 72 horas postparto si el RN es Rh(+). "
        "También aplica en procedimientos invasivos (amniocentesis, aborto)."
    ),
    ("modulo-1-hematologia-4", 11): (
        "En pediatría, los dos grupos más importantes de cáncer son los tumores hematológicos (leucemias y linfomas, ~40% de todos "
        "los cánceres pediátricos) y los tumores del sistema nervioso central (SNC, ~25%). La leucemia linfática aguda es el "
        "cáncer más frecuente en niños. Los tumores del SNC son el segundo grupo más frecuente y la principal causa de mortalidad "
        "por tumor sólido en pediatría."
    ),
    ("modulo-1-hematologia-4", 14): (
        "El Linfoma de Hodgkin clásicamente se presenta en adultos jóvenes con síntomas B (fiebre, baja de peso, sudoración "
        "nocturna), adenopatías cervicales de consistencia aumentada, y el hallazgo PATOGNOMÓNICO de dolor en las adenopatías "
        "al ingerir alcohol. El hemograma suele ser normal o con leve alteración. La enfermedad por arañazo de gato da adenopatías "
        "pero con historia de contacto felino y no tiene el signo del alcohol."
    ),
    ("modulo-1-hematologia-4", 15): (
        "La hemofilia A (déficit de factor VIII) y B (déficit de factor IX) son trastornos recesivos ligados al cromosoma X. "
        "Por ello afecta casi exclusivamente a hombres (XY), mientras que las mujeres son portadoras (XX). Las mujeres pueden "
        "manifestar la enfermedad solo si son homocigotas (muy raro). No es autosómico porque el gen está en el cromosoma X, "
        "y no es ligado al Y porque los hijos varones afectados lo heredan de madres portadoras."
    ),
    ("modulo-1-hematologia-4", 16): (
        "Niño de 7 años con fiebre, dolores óseos (infiltración del periostio medular), petequias (trombocitopenia) y "
        "esplenomegalia es el cuadro clásico de Leucemia Aguda. Los dolores óseos reflejan la expansión de la médula ósea "
        "por células leucémicas. La leucemia aguda en niños es principalmente de estirpe linfoblástica (LLA). "
        "El PTI produce trombocitopenia pero no fiebre prolongada, dolores óseos ni esplenomegalia importante."
    ),
    ("modulo-1-hematologia-4", 17): (
        "En el prematuro con lactancia materna exclusiva, las reservas de hierro son insuficientes (se acumulan en el tercer "
        "trimestre del embarazo). La suplementación con hierro se inicia al doblar el peso de nacimiento, generalmente entre "
        "los 2-3 meses de edad corregida. En el RN de término con LME, se inicia a los 4 meses. En el prematuro, la pauta "
        "es más precoz por las menores reservas neonatales."
    ),
    ("modulo-1-hematologia-4", 18): (
        "La hemofilia es un trastorno de la coagulación (vía intrínseca), NO plaquetario. Por ello, la clínica típica son "
        "HEMARTROSIS (hemorragia en articulaciones, especialmente rodillas y tobillos) y hematomas profundos intramusculares "
        "tras traumatismos menores. Las manifestaciones de la primera opción (hemartrosis + hematomas profundos) son características "
        "de coagulopatías. Las petequias, epistaxis y gingivorragia son propias de trastornos plaquetarios (no de hemofilia)."
    ),
    ("modulo-1-hematologia-4", 19): (
        "Las infecciones meningocócicas a repetición sugieren déficit del complemento, específicamente de los componentes "
        "terminales del complemento (C5-C9, complejo de ataque a membrana). Neisseria meningitidis es destruida principalmente "
        "por lisis dependiente del complemento. El déficit de C5-C9 predispone específicamente a infecciones por gérmenes "
        "encapsulados como Neisseria y Haemophilus. El déficit de IgA predispone a infecciones respiratorias y digestivas."
    ),
    ("modulo-1-hematologia-4", 20): (
        "La clínica descrita (epistaxis, gingivorragia, petequias, equimosis desde la infancia) corresponde a un trastorno "
        "plaquetario. En trastornos plaquetarios cuantitativos o cualitativos, el examen más sensible es el TIEMPO DE SANGRÍA, "
        "que mide la función plaquetaria in vivo. El recuento de plaquetas puede ser normal si es un trastorno funcional "
        "(como trombastenia de Glanzmann). El TP y TTPK evalúan la coagulación, no las plaquetas."
    ),
    ("modulo-1-hematologia-6", 10): (
        "La mielofibrosis primaria es una neoplasia mieloproliferativa que reemplaza la médula ósea por tejido fibroso. "
        "Los DACRIOCITOS (hematíes en lágrima o teardrop) en el frotis son el hallazgo morfológico característico, producidos "
        "al pasar los eritrocitos por la médula fibrosada. Cursa con esplenomegalia importante (hematopoyesis extramedular), "
        "pancitopenia y síntomas constitucionales. La asplenia causaría lo contrario (ausencia de filtro esplénico)."
    ),
    ("modulo-1-hematologia-7", 1): (
        "La anemia ferropénica se caracteriza por ser microcítica-hipocrómica. En este paciente, el hematocrito (30%) y la "
        "hemoglobina (9.8 g/dl) están bajos, pero el recuento de glóbulos rojos (4.5 millones/mm3) está relativamente conservado, "
        "lo que indica glóbulos rojos pequeños (microcitosis). La anisocitosis +++ es típica de la ferropenia. "
        "La anemia megaloblástica cursa con macrocitosis; la hemolítica con normocitosis y reticulocitosis."
    ),
}

def main():
    path = "public/data/pruebas/modulo-1-hematologia.json"
    with open(path) as f:
        data = json.load(f)

    injected = 0
    for prueba in data["pruebas"]:
        for q in prueba["questions"]:
            key = (prueba["id"], q["numero"])
            if key in EXPLANATIONS and not q.get("explicacion"):
                q["explicacion"] = EXPLANATIONS[key]
                injected += 1
                print(f"✓ {prueba['id']} Q{q['numero']}")

    with open(path, "w", encoding="utf-8") as f:
        json.dump(data, f, ensure_ascii=False, indent=2)

    print(f"\n✅ Injected {injected} explanations → {path}")

if __name__ == "__main__":
    main()
