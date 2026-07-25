import { DementiaQuestion } from '../types';
import { Language } from '../lib/i18n';

export const DEMENTIA_TEST_QUESTIONS_ES: DementiaQuestion[] = [
  {
    id: 'q-orient-1',
    section: 'Orientación',
    questionText: '¿En qué año estamos actualmente?',
    instruction: 'Seleccione el año correcto con el botón grande:',
    type: 'multiple_choice',
    options: ['2024', '2025', '2026', '2027'],
    correctAnswer: '2026',
    hint: 'Mire el calendario de la pared o de la pantalla'
  },
  {
    id: 'q-orient-2',
    section: 'Orientación',
    questionText: '¿En qué estación del año estamos en este momento?',
    instruction: 'Elija la opción que corresponda:',
    type: 'multiple_choice',
    options: ['Primavera', 'Verano', 'Otoño', 'Invierno'],
    correctAnswer: 'Verano',
    hint: 'Piense en el clima de los últimos días'
  },
  {
    id: 'q-orient-3',
    section: 'Orientación',
    questionText: '¿En qué lugar te encuentras ahora mismo?',
    instruction: 'Indique su ubicación actual:',
    type: 'multiple_choice',
    options: ['En mi casa / hogar', 'En el hospital o clínica', 'En un parque', 'En el supermercado'],
    correctAnswer: 'En mi casa / hogar',
    hint: '¿Dónde está respondiendo este ejercicio?'
  },
  {
    id: 'q-mem-1',
    section: 'Memoria Inmediata',
    questionText: 'Guarda en tu memoria estas 3 palabras sagradas:',
    instruction: 'Léelas en voz alta o escúchalas atentamente. Más adelante te las preguntaremos.',
    type: 'memory_words',
    wordItems: [
      { word: 'MANZANA', icon: 'Apple' },
      { word: 'MESA', icon: 'Armchair' },
      { word: 'MONEDA', icon: 'Coins' }
    ],
    hint: 'Manzana 🍎, Mesa 🪑, Moneda 🪙'
  },
  {
    id: 'q-calc-1',
    section: 'Atención y Cálculo',
    questionText: 'Si tienes $10 pesos y compras un pan de $3 pesos, ¿cuántos pesos te quedan?',
    instruction: 'Toca la cifra correcta:',
    type: 'multiple_choice',
    options: ['$5 pesos', '$7 pesos', '$8 pesos', '$10 pesos'],
    correctAnswer: '$7 pesos',
    hint: 'Reste 3 a 10: 10 - 3'
  },
  {
    id: 'q-calc-2',
    section: 'Atención y Cálculo',
    questionText: 'Cuenta hacia atrás de 2 en 2 comenzando en 10:',
    instruction: '¿Cuál es el número que falta en la serie: 10, 8, 6, ___, 2?',
    type: 'multiple_choice',
    options: ['5', '4', '3', '1'],
    correctAnswer: '4',
    hint: 'Reste 2 a 6'
  },
  {
    id: 'q-recall-1',
    section: 'Recuerdo Diferido',
    questionText: '¿Cuáles eran las 3 palabras que te pedimos recordar hace un momento?',
    instruction: 'Seleccione las 3 palabras correctas:',
    type: 'memory_recall',
    options: ['MANZANA', 'MESA', 'MONEDA', 'PERRO', 'CASA', 'LÁPIZ'],
    correctAnswer: ['MANZANA', 'MESA', 'MONEDA'],
    hint: 'Una fruta, un mueble y un objeto de valor'
  },
  {
    id: 'q-lang-1',
    section: 'Lenguaje e Imágenes',
    questionText: '¿Qué objeto se muestra en esta imagen?',
    instruction: 'Mire atentamente la figura:',
    type: 'image_recognition',
    imageUrl: 'clock',
    options: ['Reloj de pared', 'Teléfono', 'Espejo', 'Plato'],
    correctAnswer: 'Reloj de pared',
    hint: 'Sirve para ver la hora'
  },
  {
    id: 'q-lang-2',
    section: 'Lenguaje e Imágenes',
    questionText: '¿Qué instrumento se usa para escribir o dibujar en papel?',
    instruction: 'Elija la respuesta correcta:',
    type: 'multiple_choice',
    options: ['Lápiz o Bolígrafo', 'Cuchara', 'Peine', 'Cepillo'],
    correctAnswer: 'Lápiz o Bolígrafo',
    hint: 'Tiene mina de grafito o tinta'
  },
  {
    id: 'q-spatial-1',
    section: 'Coordinación Espacial',
    questionText: '¿Cuál de estas figuras muestra dos círculos entrelazados correctamente?',
    instruction: 'Siga con la vista las formas geométricas:',
    type: 'spatial_pattern',
    options: ['Opción A: Círculos unidos cruzados', 'Opción B: Círculos separados lejos', 'Opción C: Dos cuadrados altos'],
    correctAnswer: 'Opción A: Círculos unidos cruzados',
    hint: 'Deben cruzarse como dos argollas de cadena'
  }
];

export const DEMENTIA_TEST_QUESTIONS_EN: DementiaQuestion[] = [
  {
    id: 'q-orient-1',
    section: 'Orientation',
    questionText: 'What year are we currently in?',
    instruction: 'Select the correct year with the large button:',
    type: 'multiple_choice',
    options: ['2024', '2025', '2026', '2027'],
    correctAnswer: '2026',
    hint: 'Look at a wall calendar or screen date'
  },
  {
    id: 'q-orient-2',
    section: 'Orientation',
    questionText: 'What season of the year is it right now?',
    instruction: 'Choose the matching option:',
    type: 'multiple_choice',
    options: ['Spring', 'Summer', 'Autumn', 'Winter'],
    correctAnswer: 'Summer',
    hint: 'Think about the weather in recent days'
  },
  {
    id: 'q-orient-3',
    section: 'Orientation',
    questionText: 'Where are you right now?',
    instruction: 'Select your current location:',
    type: 'multiple_choice',
    options: ['At my home', 'In a hospital or clinic', 'In a park', 'At the grocery store'],
    correctAnswer: 'At my home',
    hint: 'Where are you taking this exercise?'
  },
  {
    id: 'q-mem-1',
    section: 'Immediate Memory',
    questionText: 'Remember these 3 important words in your memory:',
    instruction: 'Read them out loud or listen closely. We will ask you later.',
    type: 'memory_words',
    wordItems: [
      { word: 'APPLE', icon: 'Apple' },
      { word: 'TABLE', icon: 'Armchair' },
      { word: 'COIN', icon: 'Coins' }
    ],
    hint: 'Apple 🍎, Table 🪑, Coin 🪙'
  },
  {
    id: 'q-calc-1',
    section: 'Attention & Calculation',
    questionText: 'If you have $10 dollars and buy bread for $3 dollars, how much is left?',
    instruction: 'Tap the correct number:',
    type: 'multiple_choice',
    options: ['$5 dollars', '$7 dollars', '$8 dollars', '$10 dollars'],
    correctAnswer: '$7 dollars',
    hint: 'Subtract 3 from 10: 10 - 3'
  },
  {
    id: 'q-calc-2',
    section: 'Attention & Calculation',
    questionText: 'Count backwards by 2 starting from 10:',
    instruction: 'Which number is missing: 10, 8, 6, ___, 2?',
    type: 'multiple_choice',
    options: ['5', '4', '3', '1'],
    correctAnswer: '4',
    hint: 'Subtract 2 from 6'
  },
  {
    id: 'q-recall-1',
    section: 'Delayed Recall',
    questionText: 'Which 3 words did we ask you to remember a moment ago?',
    instruction: 'Select the 3 correct words:',
    type: 'memory_recall',
    options: ['APPLE', 'TABLE', 'COIN', 'DOG', 'HOUSE', 'PENCIL'],
    correctAnswer: ['APPLE', 'TABLE', 'COIN'],
    hint: 'A fruit, a piece of furniture, and money'
  },
  {
    id: 'q-lang-1',
    section: 'Language & Recognition',
    questionText: 'What object is shown in this picture?',
    instruction: 'Look closely at the image:',
    type: 'image_recognition',
    imageUrl: 'clock',
    options: ['Wall Clock', 'Telephone', 'Mirror', 'Plate'],
    correctAnswer: 'Wall Clock',
    hint: 'Used to tell the time'
  },
  {
    id: 'q-lang-2',
    section: 'Language & Recognition',
    questionText: 'Which instrument is used to write or draw on paper?',
    instruction: 'Choose the correct answer:',
    type: 'multiple_choice',
    options: ['Pencil or Pen', 'Spoon', 'Comb', 'Brush'],
    correctAnswer: 'Pencil or Pen',
    hint: 'It contains graphite or ink'
  },
  {
    id: 'q-spatial-1',
    section: 'Spatial Coordination',
    questionText: 'Which option shows two interlaced circles correctly?',
    instruction: 'Follow the geometric shapes with your eyes:',
    type: 'spatial_pattern',
    options: ['Option A: Interlocking overlapping circles', 'Option B: Circles far apart', 'Option C: Two tall squares'],
    correctAnswer: 'Option A: Interlocking overlapping circles',
    hint: 'They should overlap like two chain links'
  }
];

export const DEMENTIA_TEST_QUESTIONS_DE: DementiaQuestion[] = [
  {
    id: 'q-orient-1',
    section: 'Orientierung',
    questionText: 'In welchem Jahr befinden wir uns aktuell?',
    instruction: 'Wählen Sie das richtige Jahr:',
    type: 'multiple_choice',
    options: ['2024', '2025', '2026', '2027'],
    correctAnswer: '2026',
    hint: 'Schauen Sie auf einen Kalender'
  },
  {
    id: 'q-orient-2',
    section: 'Orientierung',
    questionText: 'Welche Jahreszeit haben wir derzeit?',
    instruction: 'Wählen Sie die passende Antwort:',
    type: 'multiple_choice',
    options: ['Frühling', 'Sommer', 'Herbst', 'Winter'],
    correctAnswer: 'Sommer',
    hint: 'Denken Sie an das Wetter der letzten Tage'
  },
  {
    id: 'q-orient-3',
    section: 'Orientierung',
    questionText: 'Wo befinden Sie sich gerade?',
    instruction: 'Geben Sie Ihren Standort an:',
    type: 'multiple_choice',
    options: ['Zu Hause', 'Im Krankenhaus oder der Klinik', 'In einem Park', 'Im Supermarkt'],
    correctAnswer: 'Zu Hause',
    hint: 'Wo machen Sie gerade diese Übung?'
  },
  {
    id: 'q-mem-1',
    section: 'Sofortgedächtnis',
    questionText: 'Merken Sie sich diese 3 wichtigen Wörter:',
    instruction: 'Lesen Sie sie laut vor oder hören Sie aufmerksam zu.',
    type: 'memory_words',
    wordItems: [
      { word: 'APFEL', icon: 'Apple' },
      { word: 'TISCH', icon: 'Armchair' },
      { word: 'MÜNZE', icon: 'Coins' }
    ],
    hint: 'Apfel 🍎, Tisch 🪑, Münze 🪙'
  },
  {
    id: 'q-calc-1',
    section: 'Aufmerksamkeit & Rechnen',
    questionText: 'Wenn Sie 10 € haben und ein Brot für 3 € kaufen, wie viel bleibt übrig?',
    instruction: 'Tippen Sie auf die richtige Zahl:',
    type: 'multiple_choice',
    options: ['5 €', '7 €', '8 €', '10 €'],
    correctAnswer: '7 €',
    hint: 'Ziehen Sie 3 von 10 ab'
  },
  {
    id: 'q-calc-2',
    section: 'Aufmerksamkeit & Rechnen',
    questionText: 'Zählen Sie in Zweierschritten von 10 rückwärts:',
    instruction: 'Welche Zahl fehlt: 10, 8, 6, ___, 2?',
    type: 'multiple_choice',
    options: ['5', '4', '3', '1'],
    correctAnswer: '4',
    hint: 'Ziehen Sie 2 von 6 ab'
  },
  {
    id: 'q-recall-1',
    section: 'Verzögertes Erinnern',
    questionText: 'Welche 3 Wörter sollten Sie sich vorhin merken?',
    instruction: 'Wählen Sie die 3 richtigen Wörter aus:',
    type: 'memory_recall',
    options: ['APFEL', 'TISCH', 'MÜNZE', 'HUND', 'HAUS', 'STIFT'],
    correctAnswer: ['APFEL', 'TISCH', 'MÜNZE'],
    hint: 'Eine Frucht, ein Möbelstück und Geld'
  },
  {
    id: 'q-lang-1',
    section: 'Sprache & Erkennung',
    questionText: 'Welcher Gegenstand ist hier abgebildet?',
    instruction: 'Betrachten Sie das Bild genau:',
    type: 'image_recognition',
    imageUrl: 'clock',
    options: ['Wanduhr', 'Telefon', 'Spiegel', 'Teller'],
    correctAnswer: 'Wanduhr',
    hint: 'Dient zum Ablesen der Uhrzeit'
  },
  {
    id: 'q-lang-2',
    section: 'Sprache & Erkennung',
    questionText: 'Womit schreibt oder zeichnet man auf Papier?',
    instruction: 'Wählen Sie die richtige Antwort:',
    type: 'multiple_choice',
    options: ['Bleistift oder Stift', 'Löffel', 'Kamm', 'Bürste'],
    correctAnswer: 'Bleistift oder Stift',
    hint: 'Enthält Graphit oder Tinte'
  },
  {
    id: 'q-spatial-1',
    section: 'Räumliche Koordination',
    questionText: 'Welche Option zeigt zwei ineinandergreifende Kreise?',
    instruction: 'Verfolgen Sie die Formen:',
    type: 'spatial_pattern',
    options: ['Option A: Ineinandergreifende Kreise', 'Option B: Weit getrennte Kreise', 'Option C: Zwei hohe Quadrate'],
    correctAnswer: 'Option A: Ineinandergreifende Kreise',
    hint: 'Wie zwei Kettenglieder'
  }
];

export function getDementiaTestQuestions(lang: Language = 'es'): DementiaQuestion[] {
  if (lang === 'en') return DEMENTIA_TEST_QUESTIONS_EN;
  if (lang === 'de') return DEMENTIA_TEST_QUESTIONS_DE;
  return DEMENTIA_TEST_QUESTIONS_ES;
}

export const DEMENTIA_TEST_QUESTIONS = DEMENTIA_TEST_QUESTIONS_ES;
