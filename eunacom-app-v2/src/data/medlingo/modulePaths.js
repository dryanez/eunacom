// Module Paths Curriculum for MedLingo EUNACOM
// Organized by EUNACOM specialties with units, nodes, chests, and boss levels

export const MEDLINGO_MODULES = [
  {
    id: 'cardiologia',
    name: 'Cardiología',
    emoji: '🫀',
    themeColor: '#ef4444', // Crimson Red
    accentColor: '#dc2626',
    mentorId: 'dr_yang',
    description: 'Arritmias, SCA, Insuficiencia Cardíaca, Soplos y Urgencias Cardiovasculares.',
    units: [
      {
        id: 'cardio_unit_1',
        unitNumber: 1,
        title: 'Unidad 1: Semiología Cardiovascular & Soplos',
        description: 'Domina los focos de auscultación, soplos sistólicos vs diastólicos y pulso venoso.',
        color: '#ef4444',
        nodes: [
          {
            id: 'cardio_1_1',
            title: 'Focos y Ruidos Cardíacos',
            subtitle: 'S1, S2, desdoblamientos y clicks',
            order: 1,
            type: 'standard',
            icon: 'stethoscope',
            totalQuestions: 4,
            xpReward: 20,
            gemsReward: 5
          },
          {
            id: 'cardio_1_2',
            title: 'Soplos Sistólicos',
            subtitle: 'Estenosis aórtica, IM, CIA y CIV',
            order: 2,
            type: 'standard',
            icon: 'activity',
            totalQuestions: 4,
            xpReward: 20,
            gemsReward: 5
          },
          {
            id: 'cardio_chest_1',
            title: 'Cofre de Guardia',
            subtitle: 'Recompensa de Gemas y Vida Extra',
            order: 3,
            type: 'chest',
            icon: 'gift',
            gemsReward: 40
          },
          {
            id: 'cardio_1_3',
            title: 'Soplos Diastólicos & Semiología',
            subtitle: 'Insuficiencia aórtica, EM y pulso carotídeo',
            order: 4,
            type: 'standard',
            icon: 'heart',
            totalQuestions: 4,
            xpReward: 25,
            gemsReward: 5
          },
          {
            id: 'cardio_boss_1',
            title: 'Pase de Visita con la Dra. Cristina Yang',
            subtitle: 'Desafío Boss: Diagnósticos Valvulares Rápidos',
            order: 5,
            type: 'boss_round',
            icon: 'crown',
            totalQuestions: 5,
            xpReward: 50,
            gemsReward: 25
          }
        ]
      },
      {
        id: 'cardio_unit_2',
        unitNumber: 2,
        title: 'Unidad 2: Arritmias & ECG de Urgencia',
        description: 'Fibrilación Auricular, Taquicardias y Bloqueos AV.',
        color: '#f97316', // Orange
        nodes: [
          {
            id: 'cardio_2_1',
            title: 'Taquiarritmias Estables vs Inestables',
            subtitle: 'Manejo eléctrico vs farmacológico',
            order: 1,
            type: 'standard',
            icon: 'zap',
            totalQuestions: 4,
            xpReward: 20,
            gemsReward: 5
          },
          {
            id: 'cardio_2_2',
            title: 'Fibrilación Auricular & CHA2DS2-VASc',
            subtitle: 'Control de frecuencia y anticoagulación',
            order: 2,
            type: 'standard',
            icon: 'activity',
            totalQuestions: 4,
            xpReward: 25,
            gemsReward: 5
          },
          {
            id: 'cardio_chest_2',
            title: 'Cofre Clínico',
            subtitle: 'Bono de Guardia',
            order: 3,
            type: 'chest',
            icon: 'gift',
            gemsReward: 50
          },
          {
            id: 'cardio_2_3',
            title: 'Bloqueos AV & Marcapasos',
            subtitle: '1er grado, Mobitz I, Mobitz II y 3er grado',
            order: 4,
            type: 'standard',
            icon: 'radio',
            totalQuestions: 4,
            xpReward: 25,
            gemsReward: 5
          },
          {
            id: 'cardio_boss_2',
            title: 'Jefe de Turno: Arritmias Mortales',
            subtitle: 'Algoritmos ACLS & MINSAL en tiempo real',
            order: 5,
            type: 'boss_round',
            icon: 'crown',
            totalQuestions: 5,
            xpReward: 60,
            gemsReward: 30
          }
        ]
      },
      {
        id: 'cardio_unit_3',
        unitNumber: 3,
        title: 'Unidad 3: Síndrome Coronario Agudo & Reperfusión',
        description: 'SCA con y sin SDST, trombólisis en APS vs Angioplastia.',
        color: '#e11d48',
        nodes: [
          {
            id: 'cardio_3_1',
            title: 'SCA con Supradesnivel ST',
            subtitle: 'Tiempos MINSAL puerta-aguja y puerta-balón',
            order: 1,
            type: 'standard',
            icon: 'flame',
            totalQuestions: 4,
            xpReward: 25,
            gemsReward: 5
          },
          {
            id: 'cardio_3_2',
            title: 'SCA sin Supradesnivel ST',
            subtitle: 'Score TIMI / GRACE y estratificación',
            order: 2,
            type: 'standard',
            icon: 'shield',
            totalQuestions: 4,
            xpReward: 25,
            gemsReward: 5
          },
          {
            id: 'cardio_boss_3',
            title: 'Turno de Reanimación Avanzada',
            subtitle: 'Desafío Maestro: Insignia de Oro Cardiología',
            order: 3,
            type: 'boss_round',
            icon: 'award',
            totalQuestions: 6,
            xpReward: 100,
            gemsReward: 50
          }
        ]
      }
    ]
  },
  {
    id: 'gastroenterologia',
    name: 'Gastroenterología',
    emoji: '🫁',
    themeColor: '#10b981', // Emerald Green
    accentColor: '#059669',
    mentorId: 'dr_house',
    description: 'Hemorragia Digestiva, Ictericia, Cirrosis, Pancreatitis Aguda y Vía Biliar.',
    units: [
      {
        id: 'gastro_unit_1',
        unitNumber: 1,
        title: 'Unidad 1: Hemorragia Digestiva Alta y Baja',
        description: 'Manejo inicial, scores de Glasgow-Blatchford y endoscopía.',
        color: '#10b981',
        nodes: [
          {
            id: 'gastro_1_1',
            title: 'HDA Variceal vs No Variceal',
            subtitle: 'Terlipresina, IBP y antibióticos',
            order: 1,
            type: 'standard',
            icon: 'droplet',
            totalQuestions: 4,
            xpReward: 20,
            gemsReward: 5
          },
          {
            id: 'gastro_1_2',
            title: 'Hemorragia Digestiva Baja',
            subtitle: 'Divertículos, angiodisplasia y colonoscopía',
            order: 2,
            type: 'standard',
            icon: 'activity',
            totalQuestions: 4,
            xpReward: 20,
            gemsReward: 5
          },
          {
            id: 'gastro_chest_1',
            title: 'Cofre de Gemas Digestivo',
            subtitle: 'Premio por avance',
            order: 3,
            type: 'chest',
            icon: 'gift',
            gemsReward: 40
          },
          {
            id: 'gastro_boss_1',
            title: 'Pase de Guardia con el Dr. House',
            subtitle: 'Diagnósticos diferenciales complejos',
            order: 4,
            type: 'boss_round',
            icon: 'crown',
            totalQuestions: 5,
            xpReward: 50,
            gemsReward: 25
          }
        ]
      },
      {
        id: 'gastro_unit_2',
        unitNumber: 2,
        title: 'Unidad 2: Ictericias, Vía Biliar & Páncreas',
        description: 'Coledocolitiasis, Colangitis de Tokio y Pancreatitis Aguda.',
        color: '#059669',
        nodes: [
          {
            id: 'gastro_2_1',
            title: 'Colangitis Aguda & Criterios de Tokio',
            subtitle: 'Tríada de Charcot y Pentada de Reynolds',
            order: 1,
            type: 'standard',
            icon: 'alert-triangle',
            totalQuestions: 4,
            xpReward: 25,
            gemsReward: 5
          },
          {
            id: 'gastro_2_2',
            title: 'Pancreatitis Aguda: Criterios y Manejo',
            subtitle: 'Hidratación vigorosa y criterios de gravedad',
            order: 2,
            type: 'standard',
            icon: 'flame',
            totalQuestions: 4,
            xpReward: 25,
            gemsReward: 5
          },
          {
            id: 'gastro_boss_2',
            title: 'Maestría en Gastroenterología',
            subtitle: 'Desafío Boss',
            order: 3,
            type: 'boss_round',
            icon: 'award',
            totalQuestions: 5,
            xpReward: 80,
            gemsReward: 40
          }
        ]
      }
    ]
  },
  {
    id: 'respiratorio',
    name: 'Respiratorio',
    emoji: '🫁',
    themeColor: '#0ea5e9', // Sky Blue
    accentColor: '#0284c7',
    mentorId: 'dr_cox',
    description: 'Neumonía (NAC), Crisis Asmática, EPOC Exacerbado y TEP.',
    units: [
      {
        id: 'resp_unit_1',
        unitNumber: 1,
        title: 'Unidad 1: Infecciones Respiratorias & NAC',
        description: 'Scores CURB-65 / CRB-65, esquemas antibióticos MINSAL.',
        color: '#0ea5e9',
        nodes: [
          {
            id: 'resp_1_1',
            title: 'Estratificación CURB-65',
            subtitle: 'Criterios de hospitalización en Chile',
            order: 1,
            type: 'standard',
            icon: 'activity',
            totalQuestions: 4,
            xpReward: 20,
            gemsReward: 5
          },
          {
            id: 'resp_1_2',
            title: 'Tratamiento Empírico de NAC',
            subtitle: 'Amoxicilina + Ác. Clavulánico vs Macrólidos',
            order: 2,
            type: 'standard',
            icon: 'shield',
            totalQuestions: 4,
            xpReward: 20,
            gemsReward: 5
          },
          {
            id: 'resp_chest_1',
            title: 'Cofre Respiratorio',
            subtitle: 'Recompensa',
            order: 3,
            type: 'chest',
            icon: 'gift',
            gemsReward: 40
          },
          {
            id: 'resp_boss_1',
            title: 'Pase de Visita con el Dr. Perry Cox',
            subtitle: 'Examen de Crisis Asmática y TEP',
            order: 4,
            type: 'boss_round',
            icon: 'crown',
            totalQuestions: 5,
            xpReward: 50,
            gemsReward: 25
          }
        ]
      }
    ]
  },
  {
    id: 'pediatria',
    name: 'Pediatría & Neonatología',
    emoji: '🧸',
    themeColor: '#8b5cf6', // Violet
    accentColor: '#7c3aed',
    mentorId: 'dr_murphy',
    description: 'Bronquiolitis, Croup, Fiebre sin Foco, Vacunas PNI y Neonatología.',
    units: [
      {
        id: 'pedia_unit_1',
        unitNumber: 1,
        title: 'Unidad 1: Respiratorio Pediátrico & Urgencias',
        description: 'Score de Tal, Bronquiolitis por VRS y Laringitis Obstructiva.',
        color: '#8b5cf6',
        nodes: [
          {
            id: 'pedia_1_1',
            title: 'Score de Tal & Crisis Bronquial',
            subtitle: 'Manejo abreviado de Salbutamol en APS',
            order: 1,
            type: 'standard',
            icon: 'activity',
            totalQuestions: 4,
            xpReward: 20,
            gemsReward: 5
          },
          {
            id: 'pedia_1_2',
            title: 'Laringitis & Croup (Score de Taussig)',
            subtitle: 'Dexametasona y Adrenalina racémica',
            order: 2,
            type: 'standard',
            icon: 'feather',
            totalQuestions: 4,
            xpReward: 20,
            gemsReward: 5
          },
          {
            id: 'pedia_chest_1',
            title: 'Cofre Pediátrico',
            subtitle: 'Recompensa',
            order: 3,
            type: 'chest',
            icon: 'gift',
            gemsReward: 40
          },
          {
            id: 'pedia_boss_1',
            title: 'Turno Pediátrico con el Dr. Shaun Murphy',
            subtitle: 'Desafío de Urgencia Pediátrica',
            order: 4,
            type: 'boss_round',
            icon: 'crown',
            totalQuestions: 5,
            xpReward: 60,
            gemsReward: 30
          }
        ]
      }
    ]
  },
  {
    id: 'ginecologia',
    name: 'Ginecología y Obstetricia',
    emoji: '🌸',
    themeColor: '#ec4899', // Pink
    accentColor: '#db2777',
    mentorId: 'dr_grey',
    description: 'Control Prenatal, Preeclampsia, Hemorragias del 1er y 3er Trimestre, Cáncer Cervicouterino.',
    units: [
      {
        id: 'gine_unit_1',
        unitNumber: 1,
        title: 'Unidad 1: Estados Hipertensivos del Embarazo',
        description: 'Preeclampsia moderada vs severa, Sulfato de Magnesio y Guías MINSAL.',
        color: '#ec4899',
        nodes: [
          {
            id: 'gine_1_1',
            title: 'Criterios de Preeclampsia Severa',
            subtitle: 'Proteinuria, plaquetas y transaminasas',
            order: 1,
            type: 'standard',
            icon: 'activity',
            totalQuestions: 4,
            xpReward: 20,
            gemsReward: 5
          },
          {
            id: 'gine_1_2',
            title: 'Esquema de Sulfato de Magnesio (Zuspan)',
            subtitle: 'Carga, mantención y antídoto Gluconato',
            order: 2,
            type: 'standard',
            icon: 'shield',
            totalQuestions: 4,
            xpReward: 20,
            gemsReward: 5
          },
          {
            id: 'gine_chest_1',
            title: 'Cofre Obstétrico',
            subtitle: 'Bono de Gemas',
            order: 3,
            type: 'chest',
            icon: 'gift',
            gemsReward: 40
          },
          {
            id: 'gine_boss_1',
            title: 'Pase Obstétrico con la Dra. Grey',
            subtitle: 'Urgencias Perinatales & Parto',
            order: 4,
            type: 'boss_round',
            icon: 'crown',
            totalQuestions: 5,
            xpReward: 60,
            gemsReward: 30
          }
        ]
      }
    ]
  },
  {
    id: 'nefrologia',
    name: 'Nefrología & Medio Interno',
    emoji: '🧪',
    themeColor: '#06b6d4', // Cyan
    accentColor: '#0891b2',
    mentorId: 'dr_house',
    description: 'Injuria Renal Aguda (KDIGO), Trastornos del Sodio y Potasio, Glomerulopatías.',
    units: [
      {
        id: 'nefro_unit_1',
        unitNumber: 1,
        title: 'Unidad 1: Trastornos Hidroelectrolíticos',
        description: 'Hiperkalemia grave, Hiponatremia hipoosmolar y corrección de sodio.',
        color: '#06b6d4',
        nodes: [
          {
            id: 'nefro_1_1',
            title: 'Hiperkalemia de Urgencia & ECG',
            subtitle: 'Gluconato de Calcio, Insulina + Glucosa y Salbutamol',
            order: 1,
            type: 'standard',
            icon: 'zap',
            totalQuestions: 4,
            xpReward: 20,
            gemsReward: 5
          },
          {
            id: 'nefro_1_2',
            title: 'Hiponatremia: Corrección Segura',
            subtitle: 'Límite de 8-10 mEq/24h y Mielinolisis Pontina',
            order: 2,
            type: 'standard',
            icon: 'droplet',
            totalQuestions: 4,
            xpReward: 20,
            gemsReward: 5
          },
          {
            id: 'nefro_boss_1',
            title: 'El Gran Pase Nefrológico con House',
            subtitle: 'Casos difíciles de gases y electrolitos',
            order: 3,
            type: 'boss_round',
            icon: 'crown',
            totalQuestions: 5,
            xpReward: 60,
            gemsReward: 30
          }
        ]
      }
    ]
  }
]
