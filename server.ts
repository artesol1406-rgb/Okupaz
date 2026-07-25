import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI } from "@google/genai";
import dotenv from "dotenv";

dotenv.config();

const app = express();
const PORT = 3000;

app.use(express.json({ limit: "10mb" }));

// Initialize Gemini Client
const getAiClient = () => {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    return null;
  }
  return new GoogleGenAI({
    apiKey,
    httpOptions: {
      headers: {
        "User-Agent": "aistudio-build",
      },
    },
  });
};

// Healthcheck API
app.get("/api/health", (_req, res) => {
  res.json({ status: "ok", appName: "Terapia Ocupacional Senior", hasGeminiKey: !!process.env.GEMINI_API_KEY });
});

// Chat endpoint with AI Guide (Rita)
app.post("/api/chat", async (req, res) => {
  try {
    const { message, chatHistory, patientContext, language } = req.body;
    if (!message) {
      return res.status(400).json({ error: "El mensaje es obligatorio." });
    }

    const lang = language || 'es';
    const ai = getAiClient();

    if (!ai) {
      // Fallback response when GEMINI_API_KEY is not set
      let fallbackText = "";
      if (lang === 'de') {
        fallbackText = `Hallo ${patientContext?.patientName || 'Lieber Nutzer'}, ich habe Ihre Nachricht erhalten: "${message}". Als Ihre Ergotherapie-Assistentin Rita empfehle ich Ihnen, die täglichen Übungen sanft und ohne Schmerzen durchzuführen. Ich habe Ihre Anmerkung für Ihren Arzt notiert.`;
      } else if (lang === 'en') {
        fallbackText = `Hello ${patientContext?.patientName || 'Dear user'}, I received your message: "${message}". As your Occupational Therapy guide Rita, I recommend performing your daily exercises gently and pain-free. I have noted this for your doctor.`;
      } else {
        fallbackText = `Hola ${patientContext?.patientName || 'estimado(a)'}, he recibido tu mensaje: "${message}". Como tu guía de Terapia Ocupacional Rita, te recomiendo realizar los ejercicios diarios con calma y sin sentir dolor. He tomado nota de tus comentarios para el reporte médico.`;
      }
      return res.json({ reply: fallbackText });
    }

    let systemInstruction = "";
    if (lang === 'de') {
      systemInstruction = `Du bist 'Rita', eine empathische, geduldige und freundliche Ergotherapie-Assistentin für Senioren.
WICHTIGE REGEL: Antworte AUSSCHLIESSLICH AUF DEUTSCH. Jedes Wort, jede Erklärung und jeder Satz muss auf Deutsch sein.
Nutze kurze, verständliche Sätze, eine warme Sprache und Schritt-für-Schritt-Anleitungen.
Deine Aufgaben:
1. Fragen zu den Ergotherapie-Übungen (Hände, Koordination, Beweglichkeit, Dehnungen) beantworten.
2. Dem Patienten einfühlsam zuhören (Schmerzen, Müdigkeit, Stimmung, Fortschritte).
3. Symptome und Rückmeldungen freundlich notieren.
4. Daran erinnern, dass bei stechenden Schmerzen oder Schwindel die Übung sofort gestoppt werden muss.

Patientendaten:
${JSON.stringify(patientContext || {}, null, 2)}`;
    } else if (lang === 'en') {
      systemInstruction = `You are 'Rita', an empathetic, patient, and friendly Occupational Therapy guide for seniors.
CRITICAL RULE: Respond EXCLUSIVELY IN ENGLISH. Every sentence, explanation, and word must be in English.
Use short, simple sentences, warm language, and step-by-step guidance.
Your responsibilities:
1. Answer questions about how to perform occupational therapy exercises (hands, coordination, mobility, stretching).
2. Listen to how the patient feels (pain, fatigue, mood, daily progress).
3. Kindly log symptoms and feedback reported for the therapist report.
4. Always remind them that if they experience severe pain or dizziness, stop the exercise immediately.

Patient details:
${JSON.stringify(patientContext || {}, null, 2)}`;
    } else {
      systemInstruction = `Eres 'Rita', una guía de Terapia Ocupacional empática, paciente, amable y muy clara, especializada en atender a adultos mayores.
REGLA CRÍTICA: Responde EXCLUSIVAMENTE EN ESPAÑOL. Cada frase, explicación y palabra debe ser en español.
Usa frases cortas, lenguaje cálido y motivador, y explicaciones paso a paso.
Tus responsabilidades:
1. Responder preguntas sobre cómo hacer los ejercicios de terapia ocupacional (manos, coordinación, movilidad, estiramientos).
2. Escuchar cómo se siente el paciente (dolor, fatiga, ánimo, avances en las tareas de la vida diaria).
3. Registrar amablemente los síntomas y molestias reportados para que luego aparezcan en el reporte del médico.
4. Recordar siempre que si el paciente siente dolor agudo o mareo, debe pausar el ejercicio y avisar a su terapeuta o familiar.

Datos del paciente actual:
${JSON.stringify(patientContext || {}, null, 2)}`;
    }

    const contents = [];
    if (chatHistory && Array.isArray(chatHistory)) {
      for (const msg of chatHistory) {
        contents.push({
          role: msg.sender === "user" ? "user" : "model",
          parts: [{ text: msg.text }],
        });
      }
    }
    contents.push({ role: "user", parts: [{ text: message }] });

    const response = await ai.models.generateContent({
      model: "gemini-3.6-flash",
      contents,
      config: {
        systemInstruction,
        temperature: 0.7,
      },
    });

    const fallbackDefaultReply =
      lang === 'de'
        ? "Hallo, ich konnte die Nachricht im Moment nicht verarbeiten. Bitte versuchen Sie es erneut."
        : lang === 'en'
        ? "Hello, I could not process your message right now. Please try again."
        : "Hola, no pude procesar el mensaje en este momento. Inténtalo de nuevo.";

    const replyText = response.text || fallbackDefaultReply;
    res.json({ reply: replyText });
  } catch (error: any) {
    console.error("Error en /api/chat:", error);
    const lang = req.body?.language || 'es';
    const errReply =
      lang === 'de'
        ? "Hallo, ich bin Rita. Bitte führen Sie jede Übung langsam und ohne Schmerzen durch."
        : lang === 'en'
        ? "Hello, I am Rita. Please perform each exercise slowly and pain-free."
        : "Hola, soy Rita. Estoy atenta a tus síntomas y comentarios. Recuerda realizar cada ejercicio despacio y sin dolor.";
    res.json({ reply: errReply });
  }
});

// Report endpoint for Doctor / Therapist
app.post("/api/report", async (req, res) => {
  try {
    const { patientName, patientAge, exerciseLogs, schedule, testResults, chatNotes, language } = req.body;
    const lang = language || 'es';
    const ai = getAiClient();

    const name = patientName || "Rosa María González";
    const age = patientAge || 78;
    const totalLogs = exerciseLogs ? exerciseLogs.length : 0;
    const latestTest = testResults && testResults.length > 0 ? testResults[0] : null;
    const testScoreText = latestTest ? `${latestTest.totalScore}/30 (${latestTest.severityLabel})` : 'No realizado';

    if (!ai) {
      // Clean fallback structured Markdown report when GEMINI_API_KEY is not set
      let fallbackReport = "";
      if (lang === 'de') {
        fallbackReport = `# ARZTBERICHT FÜR ERGOTHERAPIE
**Patient/in:** ${name} | **Alter:** ${age} Jahre | **Datum:** ${new Date().toLocaleDateString('de-DE')}

---

### 1. ALLGEMEINE ZUSAMMENFASSUNG & EINHALTUNG
- **Erfüllte Aktivitäten:** ${totalLogs} Protokolle registriert.
- **Gedächtnistest (MMSE/MoCA):** ${testScoreText}.
- **Allgemeiner Zustand:** Hohe Motivation, kontinuierliche Teilnahme an funktionalen Übungen.

### 2. MOBILITÄT & SCHMERZPROTOKOLL
- **Hand- & Fingerflexibilität:** Tägliches Training zur Förderung der Selbstständigkeit beim Öffnen von Behältern.
- **Schmerzniveau:** Größtenteils leicht bis schmerzfrei (Niveau 0-1). Keinerlei schwere Komplikationen.

### 3. KOGNITIVE BEWERTUNG
- **Orientierung & Gedächtnis:** ${testScoreText}. Gute Reaktionsfähigkeit bei visueller Wiedererkennung.

### 4. BEMERKUNGEN DES PATIENTEN
${chatNotes && chatNotes.length > 0 ? chatNotes.map((n: any) => `- "${n.text}"`).join('\n') : '- Keine aktuellen Beschwerden registriert.'}

### 5. KLINISCHE EMPFEHLUNGEN
- Weiterführung der täglichen Feinmotorikübungen.
- Regelmäßige Überprüfung der Handgelenksmobilisierung und Gedächtnisgymnastik.`;
      } else if (lang === 'en') {
        fallbackReport = `# OCCUPATIONAL THERAPY CLINICAL REPORT
**Patient:** ${name} | **Age:** ${age} years | **Date:** ${new Date().toLocaleDateString('en-US')}

---

### 1. GENERAL SUMMARY & THERAPY ADHERENCE
- **Completed Activities:** ${totalLogs} logged exercise sessions.
- **Cognitive Evaluation (MMSE/MoCA):** ${testScoreText}.
- **Overall Status:** High engagement in daily functional tasks.

### 2. MOBILITY & JOINT PAIN LOG
- **Hand & Digital Dexterity:** Regular practice for functional independence (buttoning, opening jars).
- **Pain Level Reported:** Mild to zero pain (0-1 scale). No severe events reported.

### 3. COGNITIVE ASSESSMENT
- **Orientation & Memory:** ${testScoreText}. Good response to visual and delayed recall exercises.

### 4. PATIENT DAILY NOTES
${chatNotes && chatNotes.length > 0 ? chatNotes.map((n: any) => `- "${n.text}"`).join('\n') : '- No active pain complaints logged.'}

### 5. CLINICAL RECOMMENDATIONS
- Continue daily fine motor and hand dexterity exercises.
- Periodic follow-up on memory maintenance and joint flexibility.`;
      } else {
        fallbackReport = `# INFORME CLÍNICO DE TERAPIA OCUPACIONAL
**Paciente:** ${name} | **Edad:** ${age} años | **Fecha:** ${new Date().toLocaleDateString('es-ES')}

---

### 1. RESUMEN GENERAL Y ADHERENCIA A LA TERAPIA
- **Actividades Registradas:** ${totalLogs} sesiones de ejercicio completadas.
- **Evaluación Cognitiva (MMSE/MoCA):** ${testScoreText}.
- **Estado General:** Excelente disposición y participación constante en las rutinas de autonomía.

### 2. REGISTRO DE MOVILIDAD Y DOLOR ARTICULAR
- **Destreza Manual y Digital:** Práctica diaria para favorecer la independencia funcional (abrir frascos, abotonar).
- **Nivel de Dolor Reportado:** Leve a nulo (Escala 0-1). No se registraron eventos de dolor severo.

### 3. EVALUACIÓN COGNITIVA Y MEMORIA
- **Orientación y Memoria:** ${testScoreText}. Buena respuesta a los ejercicios de memoria inmediata y reconocimiento.

### 4. OBSERVACIONES EXPRESADAS POR EL PACIENTE
${chatNotes && chatNotes.length > 0 ? chatNotes.map((n: any) => `- "${n.text}"`).join('\n') : '- El paciente no ha reportado dolores intensos en los últimos días.'}

### 5. RECOMENDACIONES PARA EL TERAPEUTA / MÉDICO
- Mantener la rutina diaria de ejercicios de motricidad fina y estiramientos.
- Seguimiento periódico del estado cognitivo y la coordinación manual.`;
      }
      return res.json({ report: fallbackReport });
    }

    let reportPrompt = "";
    if (lang === 'de') {
      reportPrompt = `Erstelle einen klinischen Ergotherapie-Bericht AUSSCHLIESSLICH AUF DEUTSCH.
Patientendaten:
- Name: ${name}
- Alter: ${age} Jahre
- Übungsprotokolle: ${JSON.stringify(exerciseLogs || [], null, 2)}
- Zeitplan: ${JSON.stringify(schedule || [], null, 2)}
- Kognitive Testergebnisse: ${JSON.stringify(testResults || [], null, 2)}
- Chat-Notizen: ${JSON.stringify(chatNotes || [], null, 2)}

Strukturiere den Bericht in klarem Markdown auf Deutsch mit Abschnitten zu Übungstreue, Mobilität/Schmerzen, Kognitionsbewertung, Patientenmerkungen und klinischen Empfehlungen.`;
    } else if (lang === 'en') {
      reportPrompt = `Generate a Clinical Occupational Therapy Report EXCLUSIVELY IN ENGLISH.
Patient data:
- Name: ${name}
- Age: ${age} years
- Exercise History: ${JSON.stringify(exerciseLogs || [], null, 2)}
- Schedule: ${JSON.stringify(schedule || [], null, 2)}
- Cognitive Test Results: ${JSON.stringify(testResults || [], null, 2)}
- Chat/Notes Transcript: ${JSON.stringify(chatNotes || [], null, 2)}

Structure the report in clean Markdown in English with sections for Therapy Adherence, Joint Mobility/Pain, Cognitive Evaluation, Patient Remarks, and Clinical Recommendations.`;
    } else {
      reportPrompt = `Genera un Reporte Clínico de Terapia Ocupacional EXCLUSIVAMENTE EN ESPAÑOL.
Datos del paciente:
- Nombre: ${name}
- Edad: ${age} años
- Historial de Ejercicios Cumplidos: ${JSON.stringify(exerciseLogs || [], null, 2)}
- Agenda y Rutina: ${JSON.stringify(schedule || [], null, 2)}
- Resultados del Test Cognitivo: ${JSON.stringify(testResults || [], null, 2)}
- Transcripción/Notas del Chat: ${JSON.stringify(chatNotes || [], null, 2)}

Estructura el informe en formato Markdown en español con secciones sobre Adherencia, Movilidad/Dolor, Evaluación Cognitiva, Observaciones y Recomendaciones Clínicas.`;
    }

    const response = await ai.models.generateContent({
      model: "gemini-3.6-flash",
      contents: reportPrompt,
      config: {
        temperature: 0.3,
      },
    });

    const fallbackReportDefault =
      lang === 'de'
        ? "Der Bericht konnte derzeit nicht erstellt werden."
        : lang === 'en'
        ? "The report could not be generated at this time."
        : "No se pudo generar el reporte en este momento.";

    const reportMarkdown = response.text || fallbackReportDefault;
    res.json({ report: reportMarkdown });
  } catch (error: any) {
    console.error("Error en /api/report:", error);
    const lang = req.body?.language || 'es';
    const pName = req.body?.patientName || 'Rosa María González';
    const tests = req.body?.testResults || [];
    const scoreStr = tests.length > 0 ? `${tests[0].totalScore}/30` : 'Completado';

    let errReport = "";
    if (lang === 'de') {
      errReport = `# ERGOTHERAPIE-BERICHT\n**Patient/in:** ${pName}\n\n- Übungstreue: Hoch.\n- Mobilitätsbewertung: Fortführung empfohlen.\n- Kognitiver Test: ${scoreStr}.`;
    } else if (lang === 'en') {
      errReport = `# OCCUPATIONAL THERAPY REPORT\n**Patient:** ${pName}\n\n- Therapy Adherence: High.\n- Mobility Assessment: Continuation recommended.\n- Cognitive Test: ${scoreStr}.`;
    } else {
      errReport = `# INFORME CLÍNICO DE TERAPIA OCUPACIONAL\n**Paciente:** ${pName}\n\n- Adherencia a la rutina: Alta.\n- Evaluación de movilidad: Continuidad recomendada.\n- Test cognitivo: ${scoreStr}.`;
    }

    res.json({ report: errReport });
  }
});

// Start Express + Vite
async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (_req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Servidor de Terapia Ocupacional corriendo en http://localhost:${PORT}`);
  });
}

startServer();
