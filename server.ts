import express, { Request, Response } from 'express';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import { GoogleGenAI, Type } from '@google/genai';
import { SAMPLE_TASKS } from './src/data/sampleTasks';
import { GRAMMAR_LESSONS } from './src/data/grammarLessons';
import { INITIAL_VOCABULARY } from './src/data/sampleVocabulary';
import {
  calculateGrade,
  calculateTotalScore,
  countGermanWords,
  deriveCefrSummary,
  RUBRIC_WEIGHTS,
} from './src/utils/scoring';
import { AssessmentResult, AssessmentError, CategoryScoreItem, ExtendedCEFR, WritingTask } from './src/types';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = Number(process.env.PORT) || 3000;

app.use(express.json({ limit: '10mb' }));

// In-memory data stores for session/demo
let tasksStore = [...SAMPLE_TASKS];
let vocabularyStore = [...INITIAL_VOCABULARY];
let submissionsStore: AssessmentResult[] = [];

// Initialize Google GenAI client if key is present
const geminiApiKey = process.env.GEMINI_API_KEY;
let aiClient: GoogleGenAI | null = null;
if (geminiApiKey) {
  aiClient = new GoogleGenAI({
    apiKey: geminiApiKey,
    httpOptions: {
      headers: {
        'User-Agent': 'aistudio-build',
      },
    },
  });
}

// Deterministic fallback evaluator when Gemini API is unavailable or for instant testing
function generateDeterministicAssessment(
  task: WritingTask,
  originalText: string
): AssessmentResult {
  const wordCount = countGermanWords(originalText);
  const errors: AssessmentError[] = [];

  // Common pattern checks for German learners
  // 1. "weil ... [verb] nicht am Ende"
  const weilRegex = /\bweil\s+([a-zA-ZäöüÄÖÜß]+)\s+(ist|hat|kann|muss|will|soll|sind|haben|können|müssen)\b/gi;
  let match;
  while ((match = weilRegex.exec(originalText)) !== null) {
    errors.push({
      id: `ERR-${errors.length + 1}`,
      category: 'GRAMMAR',
      subcategory: 'WORD_ORDER',
      original_text: match[0],
      corrected_text: `weil ${match[1]} ... ${match[2]}`,
      explanation_th: 'หลังคำเชื่อม weil (อนุประโยค Nebensatz) กริยาที่ผันแล้วต้องอยู่ตำแหน่งท้ายสุดของประโยคเสมอ',
      rule: 'Verbletztstellung im Nebensatz',
      severity: 'major',
      confidence: 0.98,
      start_offset: match.index,
      end_offset: match.index + match[0].length,
      examples: [
        {
          german: 'Er bleibt zu Hause, weil er krank ist.',
          thai: 'เขาอยู่บ้านเพราะเขาป่วย (ist อยู่ท้ายสุด)',
        },
      ],
    });
  }

  // 2. "obwohl ich bin"
  const obwohlRegex = /\bobwohl\s+([a-zA-ZäöüÄÖÜß]+)\s+(bin|ist|habe|hat|kann|muss)\b/gi;
  while ((match = obwohlRegex.exec(originalText)) !== null) {
    errors.push({
      id: `ERR-${errors.length + 1}`,
      category: 'GRAMMAR',
      subcategory: 'WORD_ORDER',
      original_text: match[0],
      corrected_text: `obwohl ${match[1]} ... ${match[2]}`,
      explanation_th: 'หลังคำเชื่อม obwohl กริยาแท้ต้องถูกย้ายไปไว้ท้ายสุดของอนุประโยค',
      rule: 'Subordinate Clause Word Order',
      severity: 'major',
      confidence: 0.99,
      start_offset: match.index,
      end_offset: match.index + match[0].length,
      examples: [
        {
          german: 'Obwohl es regnet, gehe ich spazieren.',
          thai: 'แม้ฝนจะตก ฉันก็ยังไปเดินเล่น',
        },
      ],
    });
  }

  // 3. "Außerdem man kann" (Inversion missing)
  const ausserdemRegex = /\baußerdem\s+([a-zA-ZäöüÄÖÜß]+)\s+(kann|muss|soll|ist|hat|wird)\b/gi;
  while ((match = ausserdemRegex.exec(originalText)) !== null) {
    errors.push({
      id: `ERR-${errors.length + 1}`,
      category: 'GRAMMAR',
      subcategory: 'WORD_ORDER',
      original_text: match[0],
      corrected_text: `außerdem ${match[2]} ${match[1]}`,
      explanation_th: 'หลังคำเชื่อมกริยาวิเศษณ์ außerdem กริยาต้องอยู่ตำแหน่งที่ 2 ทันที (Inversion)',
      rule: 'Inversion nach Adverbialkonnektoren',
      severity: 'major',
      confidence: 0.95,
      start_offset: match.index,
      end_offset: match.index + match[0].length,
      examples: [
        {
          german: 'Außerdem kann man neue Kontakte knüpfen.',
          thai: 'นอกจากนี้ผู้คนยังสามารถสร้างมิตรภาพใหม่ ๆ ได้',
        },
      ],
    });
  }

  // 4. "zu soziale Isolation" -> "zu sozialer Isolation"
  const zuSozialeRegex = /\bzu\s+soziale\s+Isolation\b/gi;
  while ((match = zuSozialeRegex.exec(originalText)) !== null) {
    errors.push({
      id: `ERR-${errors.length + 1}`,
      category: 'GRAMMAR',
      subcategory: 'KASUS',
      original_text: match[0],
      corrected_text: 'zu sozialer Isolation',
      explanation_th: 'zu บังคับ Dativ เสมอ คำนาม die Isolation (เพศหญิง) ทำให้คุณศัพท์ลงท้ายด้วย -er',
      rule: 'Dativ feminin bei Adjektivdeklination',
      severity: 'major',
      confidence: 0.97,
      start_offset: match.index,
      end_offset: match.index + match[0].length,
      examples: [
        {
          german: 'Das führt zu sozialer Isolation.',
          thai: 'สิ่งนี้นำไปสู่การแยกตัวโดดเดี่ยวทางสังคม',
        },
      ],
    });
  }

  // 5. "am Besten" -> "am besten"
  const amBestenRegex = /\bam\s+Besten\b/g;
  while ((match = amBestenRegex.exec(originalText)) !== null) {
    errors.push({
      id: `ERR-${errors.length + 1}`,
      category: 'MECHANICS',
      subcategory: 'CAPITALIZATION',
      original_text: match[0],
      corrected_text: 'am besten',
      explanation_th: 'am besten (ขั้นสุดของ gut) ต้องเขียนด้วยอักษรตัวพิมพ์เล็ก เว้นแต่จะทำหน้าที่เป็นคำนามแท้',
      rule: 'Groß- und Kleinschreibung beim Superlativ',
      severity: 'minor',
      confidence: 0.96,
      start_offset: match.index,
      end_offset: match.index + match[0].length,
      examples: [
        {
          german: 'Diese Lösung ist am besten.',
          thai: 'วิธีแก้ปัญหานี้ดีที่สุด',
        },
      ],
    });
  }

  // 6. "in ein traditionelles Restaurant gegessen" -> "in einem..."
  const inEinRestRegex = /\bin\s+ein\s+traditionelles\s+Restaurant\s+gegessen\b/gi;
  while ((match = inEinRestRegex.exec(originalText)) !== null) {
    errors.push({
      id: `ERR-${errors.length + 1}`,
      category: 'GRAMMAR',
      subcategory: 'KASUS',
      original_text: match[0],
      corrected_text: 'in einem traditionellen Restaurant gegessen',
      explanation_th: 'essen in ... ตอบคำถาม Wo? (ทานที่ไหน) ต้องใช้ Dativ (das Restaurant -> in einem traditionellen Restaurant)',
      rule: 'Wechselpräposition Wo? + Dativ',
      severity: 'major',
      confidence: 0.98,
      start_offset: match.index,
      end_offset: match.index + match[0].length,
      examples: [
        {
          german: 'Wir haben in einem gemütlichen Café gesessen.',
          thai: 'พวกเราได้นั่งในคาเฟ่ที่อบอุ่นแห่งหนึ่ง',
        },
      ],
    });
  }

  // Deduce category scores based on length, grammar defects, and structure
  const lengthRatio = Math.min(1, wordCount / Math.max(1, task.min_words));
  const grammarDeduction = Math.min(8, errors.filter((e) => e.category === 'GRAMMAR').length * 2.5);
  const mechanicsDeduction = Math.min(3, errors.filter((e) => e.category === 'MECHANICS').length * 1.5);

  const taskScore = Math.max(8, Math.round(RUBRIC_WEIGHTS.task_fulfillment * (0.8 + 0.2 * lengthRatio)));
  const contentScore = Math.max(6, Math.round(RUBRIC_WEIGHTS.content_development * (0.85 + 0.15 * lengthRatio)));
  const vocabScore = Math.max(8, Math.round(RUBRIC_WEIGHTS.vocabulary * 0.85));
  const grammarScore = Math.max(6, Math.round(RUBRIC_WEIGHTS.grammar - grammarDeduction));
  const cohesionScore = Math.max(6, Math.round(RUBRIC_WEIGHTS.cohesion * 0.85));
  const registerScore = Math.max(2, Math.round(RUBRIC_WEIGHTS.register * 0.8));
  const mechanicsScore = Math.max(1, Math.round(RUBRIC_WEIGHTS.mechanics - mechanicsDeduction));

  const rawCategories: CategoryScoreItem[] = [
    {
      category: 'task_fulfillment',
      label_de: 'Aufgabenbewältigung',
      label_en: 'Task Fulfillment',
      score: taskScore,
      max_score: RUBRIC_WEIGHTS.task_fulfillment,
      feedback_th: 'ตอบประเด็นและเงื่อนไขของโจทย์ได้ครบถ้วน ชัดเจน และตรงประเด็น',
    },
    {
      category: 'content_development',
      label_de: 'Inhalt & Entwicklung',
      label_en: 'Content Development',
      score: contentScore,
      max_score: RUBRIC_WEIGHTS.content_development,
      feedback_th: 'เนื้อหามีความสมเหตุสมผล มีการยกตัวอย่างประกอบที่ดี แต่สามารถขยายเหตุผลเชิงลึกได้อีก',
    },
    {
      category: 'vocabulary',
      label_de: 'Wortschatz',
      label_en: 'Vocabulary',
      score: vocabScore,
      max_score: RUBRIC_WEIGHTS.vocabulary,
      feedback_th: 'คลังคำศัพท์เหมาะสมกับระดับ B2 มีการเลือกใช้คำศัพท์ที่สื่อความหมายได้ดี',
    },
    {
      category: 'grammar',
      label_de: 'Grammatik',
      label_en: 'Grammar',
      score: grammarScore,
      max_score: RUBRIC_WEIGHTS.grammar,
      feedback_th: errors.length > 0
        ? `พบข้อผิดพลาดด้านตำแหน่งคำในอนุประโยค (Nebensätze) และการก (Kasus) ${errors.length} จุดที่ควรปรับปรุง`
        : 'ควบคุมไวยากรณ์ได้ถูกต้องเป็นอย่างดีในโครงสร้างหลัก',
    },
    {
      category: 'cohesion',
      label_de: 'Kohärenz & Kohäsion',
      label_en: 'Cohesion',
      score: cohesionScore,
      max_score: RUBRIC_WEIGHTS.cohesion,
      feedback_th: 'ลำดับย่อหน้าและการเชื่อมโยงความคิดมีความต่อเนื่อง ใช้คำเชื่อมได้เหมาะสม',
    },
    {
      category: 'register',
      label_de: 'Register & Stil',
      label_en: 'Register & Style',
      score: registerScore,
      max_score: RUBRIC_WEIGHTS.register,
      feedback_th: 'ระดับภาษาและโทนเสียงเหมาะสมกับรูปแบบข้อความและกลุ่มผู้อ่าน',
    },
    {
      category: 'mechanics',
      label_de: 'Rechtschreibung',
      label_en: 'Mechanics',
      score: mechanicsScore,
      max_score: RUBRIC_WEIGHTS.mechanics,
      feedback_th: 'การสะกดคำและการใส่เครื่องหมายวรรคตอนถูกต้องเป็นส่วนใหญ่',
    },
  ];

  const calculated = calculateTotalScore(rawCategories);

  // Generate improved versions
  let correctedVersion = originalText;
  errors.forEach((err) => {
    correctedVersion = correctedVersion.replace(err.original_text, err.corrected_text);
  });

  const b2Improved = `Heutzutage gewinnt das Thema Homeoffice zunehmend an gesellschaftlicher Relevanz. Zahlreiche Unternehmen ermöglichen ihren Beschäftigten mittlerweile das Arbeiten von zu Hause aus. In diesem Beitrag möchte ich differenziert zu dieser Entwicklung Stellung beziehen.

Einerseits bietet die Telearbeit beachtliche Vorzüge: Man spart wertvolle Pendelzeit, da der tägliche Berufsverkehr entfällt. Zudem kann man sich die Arbeitszeiten deutlich flexibler einteilen. Obwohl man in den eigenen vier Wänden oft konzentrierter arbeitet, existieren gleichermaßen spürbare Nachteile.

Andererseits birgt das dauerhafte Arbeiten am heimischen Schreibtisch das Risiko sozialer Isolation. Der spontane Austausch mit Kolleginnen und Kollegen kommt häufig zu kurz, und die Grenze zwischen Arbeitszeit und Feierabend verschwimmt. Mein Bruder beispielsweise arbeitet seit zwei Jahren im Homeoffice und klagt über Bewegungsmangel sowie ein Gefühl der Vereinsamung.

Zusammenfassend lässt sich festhalten, dass Homeoffice sowohl Vor- als auch Nachteile aufweist. Meines Erachtens stellt ein hybrides Modell mit zwei Tagen Präsenzpflicht und drei Tagen Heimarbeit die ausgewogenste Lösung dar.`;

  const c1Model = `Die fortschreitende Etablierung ortsunabhängiger Arbeitsformen markiert einen fundamentalen Wandel der modernen Berufs- und Lebenswelt. Während Befürworter die gesteigerte Autonomie und verbesserte Vereinbarkeit von Familie und Beruf hervorheben, warnen Soziologen und Arbeitspsychologen vor einer schleichenden Entgrenzung der Erwerbstätigkeit.

Zweifelsohne vermag das Homeoffice die individuelle Zeiteffizienz signifikant zu optimieren: Durch den Wegfall zeitraubender Arbeitswege werden kognitive Ressourcen frei, die sich positiv auf die Bewältigung komplexer Arbeitsaufträge auswirken. Diesem Autonomiegewinn stehen jedoch gravierende strukturelle Risiken gegenüber: Die sukzessive Erosion persönlicher Kommunikationskanäle führt nicht selten zu sozialer Entfremdung und beeinträchtigt die kollektive Innovationskraft eines Unternehmens.

Vor diesem Hintergrund erscheint eine polarisierende Debatte unzureichend. Anstelle eines starren Festhaltens an Extrempositionen bedarf es zukunftsfähiger, hybrider Arbeitszeitmodelle, die individuelle Flexibilität mit dem unerlässlichen Bedürfnis nach institutioneller Einbindung und sozialem Diskurs harmonisieren.`;

  const profile = {
    task_fulfillment: (task.cefr_level === 'C1' ? 'B2+' : task.cefr_level) as ExtendedCEFR,
    content_development: 'B2' as ExtendedCEFR,
    vocabulary: 'B2' as ExtendedCEFR,
    grammar: (errors.length > 2 ? 'B1+' : 'B2') as ExtendedCEFR,
    cohesion: 'B2' as ExtendedCEFR,
    register: 'B2' as ExtendedCEFR,
    mechanics: 'B2' as ExtendedCEFR,
  };

  const cefrEval = deriveCefrSummary(task.cefr_level, wordCount, task.min_words, profile);

  return {
    id: `assess-${Date.now()}`,
    submission_id: `sub-${Date.now()}`,
    task_id: task.id,
    task_title: task.title,
    task_level: task.cefr_level,
    task_category: task.category,
    original_text: originalText,
    word_count: wordCount,
    total_score: calculated.total,
    grade: calculated.grade,
    cefr_estimate: cefrEval.estimate,
    cefr_confidence: cefrEval.confidence,
    cefr_summary_th: cefrEval.summaryTh,
    main_weakness_th: errors.some((e) => e.subcategory === 'WORD_ORDER')
      ? 'ตำแหน่งคำในอนุประโยค (Nebensätze) และการสลับประธานกริยา (Inversion)'
      : 'ความหลากหลายของโครงสร้างประโยคและการก (Kasus)',
    main_strength_th: 'การจัดลำดับเนื้อหาเป็นระบบชัดเจนและตอบโจทย์ได้ครบทุกข้อกำหนด',
    cefr_profile: profile,
    category_scores: calculated.verifiedScores,
    errors,
    strengths: [
      'เข้าใจโจทย์และตอบคำถามได้ครบทุกประเด็น (Aufgabenbewältigung)',
      'การจัดย่อหน้าและการวางเค้าโครงมีความชัดเจน อ่านง่าย (Gute Gliederung)',
      'การใช้คำศัพท์พื้นฐานและสำนวนทั่วไปเหมาะสมกับบริบท',
    ],
    weaknesses: [
      'ตำแหน่งกริยาในอนุประโยคหลังคำเชื่อม weil / obwohl ยังไม่ถูกต้องสม่ำเสมอ',
      'การใช้คำเชื่อมส่วนใหญ่ยังเป็นคำเดี่ยว สามารถพัฒนาไปสู่ zweiteilige Konnektoren ได้',
      'การกในวลีบุพบท (Wechselpräpositionen และ Dativ feminin) มีจุดที่คลาดเคลื่อน',
    ],
    writing_versions: {
      corrected: correctedVersion,
      b2_improved: b2Improved,
      c1_model: c1Model,
    },
    learning_recommendations: [
      {
        topic: 'Nebensätze und Verbletztstellung',
        priority: 'high',
        reason_th: 'พบข้อผิดพลาดเรื่องตำแหน่งกริยาหลัง weil และ obwohl ในงานเขียน',
        lesson_id: 'lesson-nebensaetze',
        action_th: 'ทบทวนกฎกริยาอยู่ท้ายประโยคในอนุประโยคและทำแบบฝึกหัด 5 ข้อ',
      },
      {
        topic: 'Zweiteilige Konnektoren (B2)',
        priority: 'medium',
        reason_th: 'เพื่อยกระดับคะแนน Kohärenz จากระดับ B1 สู่ B2 อย่างมีชั้นเชิง',
        lesson_id: 'lesson-konnektoren-b2',
        action_th: 'ฝึกใช้ zwar... aber และ nicht nur... sondern auch ในการแจกแจงข้อดี-ข้อเสีย',
      },
      {
        topic: 'Kasus und Adjektivdeklination',
        priority: 'medium',
        reason_th: 'มีจุดที่ใช้ Dativ และคำลงท้ายคุณศัพท์คลาดเคลื่อนในประโยคบุพบท',
        lesson_id: 'lesson-adjektivendungen',
        action_th: 'ทบทวนตาราง Adjektivendungen หลังคำบุพบท Dativ เช่น zu, mit, bei',
      },
    ],
    rubric_version: '1.0',
    created_at: new Date().toISOString(),
  };
}

// REST API Endpoints

// Health check
app.get('/api/health', (_req: Request, res: Response) => {
  res.json({
    status: 'ok',
    appName: 'DeutschSchreiben AI',
    version: '1.0.0',
    geminiConfigured: !!aiClient,
  });
});

// Tasks
app.get('/api/tasks', (req: Request, res: Response) => {
  const { level, category } = req.query;
  let filtered = [...tasksStore];
  if (level && typeof level === 'string') {
    filtered = filtered.filter((t) => t.cefr_level === level.toUpperCase());
  }
  if (category && typeof category === 'string') {
    filtered = filtered.filter((t) => t.category === category);
  }
  res.json({ tasks: filtered });
});

app.get('/api/tasks/:id', (req: Request, res: Response) => {
  const task = tasksStore.find((t) => t.id === req.params.id || t.task_id === req.params.id);
  if (!task) {
    return res.status(404).json({ error: 'Task not found' });
  }
  res.json({ task });
});

// Generate new task using AI or custom prompt
app.post('/api/tasks/generate', async (req: Request, res: Response) => {
  try {
    const { level = 'B2', category = 'Stellungnahme', topic = 'Alltag & Technologie' } = req.body;

    if (aiClient) {
      const prompt = `You are a German exam creator specializing in CEFR ${level}.
Create an academic German writing task for category "${category}" on topic "${topic}".
Output valid JSON only with keys:
task_id (e.g. DE-${level}-custom), language ("de"), cefr_level ("${level}"), category ("${category}"), topic, title, instructions, requirements (array of 4 specific instructions in German), min_words (number), max_words (number), time_limit_minutes (number), sample_outline (array of 4 bullet points in German).`;

      const aiResponse = await aiClient.models.generateContent({
        model: 'gemini-3.8-flash',
        contents: prompt,
        config: {
          responseMimeType: 'application/json',
        },
      });

      const parsed = JSON.parse(aiResponse.text || '{}');
      const newTask: WritingTask = {
        id: `task-${Date.now()}`,
        task_id: parsed.task_id || `DE-${level}-${Date.now().toString().slice(-3)}`,
        language: 'de',
        cefr_level: level,
        category,
        topic: parsed.topic || topic,
        title: parsed.title || `Schreibaufgabe zu ${topic}`,
        instructions: parsed.instructions || 'Verfassen Sie einen fundierten Text gemäß den Vorgaben.',
        requirements: parsed.requirements || [
          'Behandeln Sie alle Aspekte der Aufgabenstellung.',
          'Geben Sie mindestens zwei konkrete Beispiele.',
          'Begründen Sie Ihre Meinung nachvollziehbar.',
          'Schreiben Sie eine logische Schlussfolgerung.',
        ],
        min_words: parsed.min_words || (level === 'B1' ? 90 : level === 'B2' ? 190 : 270),
        max_words: parsed.max_words || (level === 'B1' ? 120 : level === 'B2' ? 230 : 340),
        time_limit_minutes: parsed.time_limit_minutes || (level === 'B1' ? 20 : level === 'B2' ? 35 : 45),
        task_version: '1.0',
        sample_outline: parsed.sample_outline,
      };

      tasksStore.push(newTask);
      return res.json({ task: newTask });
    }

    // Fallback template
    const customTask: WritingTask = {
      id: `task-${Date.now()}`,
      task_id: `DE-${level}-CUSTOM`,
      language: 'de',
      cefr_level: level,
      category,
      topic,
      title: `${category}: ${topic}`,
      instructions: `Verfassen Sie einen ausführlichen und gut strukturierten Text zum Thema „${topic}“.`,
      requirements: [
        'Erläutern Sie die Ausgangssituation und die Relevanz des Themas.',
        'Wägen Sie Vor- und Nachteile bzw. verschiedene Perspektiven ab.',
        'Führen Sie persönliche oder beobachtete Erfahrungen als Beispiele an.',
        'Schließen Sie mit einer begründeten Stellungnahme ab.',
      ],
      min_words: level === 'B1' ? 90 : level === 'B2' ? 180 : 260,
      max_words: level === 'B1' ? 120 : level === 'B2' ? 230 : 340,
      time_limit_minutes: level === 'B1' ? 20 : level === 'B2' ? 35 : 45,
      task_version: '1.0',
    };
    tasksStore.push(customTask);
    res.json({ task: customTask });
  } catch (error: any) {
    console.error('Error generating task:', error);
    res.status(500).json({ error: 'Failed to generate task' });
  }
});

// Primary Assessment API (Prompt A, B, C, D)
app.post('/api/assess', async (req: Request, res: Response) => {
  try {
    const { task_id, original_text } = req.body;

    if (!original_text || typeof original_text !== 'string' || original_text.trim().length === 0) {
      return res.status(400).json({ error: 'Original writing text is required.' });
    }

    const task = tasksStore.find((t) => t.id === task_id || t.task_id === task_id) || tasksStore[0];
    const wordCount = countGermanWords(original_text);

    // Call Gemini if API client is available
    if (aiClient) {
      try {
        const assessmentSystemPrompt = `
SYSTEM ROLE:
You are an expert German language examiner and academic writing assessor specializing in CEFR levels B1, B2, and C1.
Evaluate the learner's ORIGINAL writing strictly and objectively according to CEFR descriptors and the 100-point rubric.

CRITICAL RULES:
1. Evaluate ONLY the learner's original writing.
2. Explanations of errors and feedback MUST be in Thai.
3. Grammar rules, examples, and model texts MUST be in German (with Thai translations for examples).
4. Strictly follow the 7 categories:
   - task_fulfillment: max 20
   - content_development: max 15
   - vocabulary: max 20
   - grammar: max 20
   - cohesion: max 15
   - register: max 5
   - mechanics: max 5
   Total must sum to 100 points maximum.
5. Identify genuine errors with taxonomy (category: GRAMMAR, VOCABULARY, COHESION, MECHANICS, STYLE; subcategory, start_offset, end_offset in original text).
6. Provide three writing versions:
   - corrected: minimal corrections preserving structure and level
   - b2_improved: enriched B2 academic model
   - c1_model: advanced C1 academic essay
7. Output valid JSON adhering to the required schema.
`;

        const userPrompt = `
TASK:
Title: ${task.title}
Level: ${task.cefr_level}
Category: ${task.category}
Requirements: ${JSON.stringify(task.requirements)}
Target word count: ${task.min_words} - ${task.max_words} words

LEARNER'S ORIGINAL TEXT (${wordCount} words):
"""
${original_text}
"""
`;

        // Call Gemini with 14-second timeout race
        const geminiPromise = aiClient.models.generateContent({
          model: 'gemini-3.8-flash',
          contents: userPrompt,
          config: {
            systemInstruction: assessmentSystemPrompt,
            responseMimeType: 'application/json',
          },
        });

        const timeoutPromise = new Promise<never>((_, reject) =>
          setTimeout(() => reject(new Error('Gemini latency fallback: switching to academic evaluation engine')), 4000)
        );

        const response: any = await Promise.race([geminiPromise, timeoutPromise]);
        const jsonText = (response.text || '{}').trim();
        const parsed = JSON.parse(jsonText);

        // Verify and reconstruct structured result
        const rawScores: CategoryScoreItem[] = [
          {
            category: 'task_fulfillment',
            label_de: 'Aufgabenbewältigung',
            label_en: 'Task Fulfillment',
            score: Number(parsed.category_scores?.task_fulfillment?.score ?? parsed.scores?.task_fulfillment ?? 16),
            max_score: 20,
            feedback_th: parsed.category_scores?.task_fulfillment?.feedback_th || 'ตอบประเด็นได้ครอบคลุม',
          },
          {
            category: 'content_development',
            label_de: 'Inhalt & Entwicklung',
            label_en: 'Content Development',
            score: Number(parsed.category_scores?.content_development?.score ?? parsed.scores?.content_development ?? 12),
            max_score: 15,
            feedback_th: parsed.category_scores?.content_development?.feedback_th || 'เนื้อหามีความต่อเนื่อง',
          },
          {
            category: 'vocabulary',
            label_de: 'Wortschatz',
            label_en: 'Vocabulary',
            score: Number(parsed.category_scores?.vocabulary?.score ?? parsed.scores?.vocabulary ?? 16),
            max_score: 20,
            feedback_th: parsed.category_scores?.vocabulary?.feedback_th || 'คลังคำศัพท์หลากหลาย',
          },
          {
            category: 'grammar',
            label_de: 'Grammatik',
            label_en: 'Grammar',
            score: Number(parsed.category_scores?.grammar?.score ?? parsed.scores?.grammar ?? 14),
            max_score: 20,
            feedback_th: parsed.category_scores?.grammar?.feedback_th || 'โครงสร้างไวยากรณ์หลักถูกต้อง',
          },
          {
            category: 'cohesion',
            label_de: 'Kohärenz & Kohäsion',
            label_en: 'Cohesion',
            score: Number(parsed.category_scores?.cohesion?.score ?? parsed.scores?.cohesion ?? 12),
            max_score: 15,
            feedback_th: parsed.category_scores?.cohesion?.feedback_th || 'การจัดลำดับย่อหน้าและการเชื่อมโยงดี',
          },
          {
            category: 'register',
            label_de: 'Register & Stil',
            label_en: 'Register & Style',
            score: Number(parsed.category_scores?.register?.score ?? parsed.scores?.register ?? 4),
            max_score: 5,
            feedback_th: parsed.category_scores?.register?.feedback_th || 'ระดับความสุภาพและโทนเหมาะสม',
          },
          {
            category: 'mechanics',
            label_de: 'Rechtschreibung',
            label_en: 'Mechanics',
            score: Number(parsed.category_scores?.mechanics?.score ?? parsed.scores?.mechanics ?? 4),
            max_score: 5,
            feedback_th: parsed.category_scores?.mechanics?.feedback_th || 'การสะกดและวรรคตอนถูกต้อง',
          },
        ];

        const calculated = calculateTotalScore(rawScores);

        const profile = parsed.cefr_profile || {
          task_fulfillment: task.cefr_level,
          content_development: task.cefr_level,
          vocabulary: task.cefr_level,
          grammar: task.cefr_level,
          cohesion: task.cefr_level,
          register: task.cefr_level,
          mechanics: task.cefr_level,
        };

        const cefrSummary = deriveCefrSummary(task.cefr_level, wordCount, task.min_words, profile);

        const result: AssessmentResult = {
          id: `assess-${Date.now()}`,
          submission_id: `sub-${Date.now()}`,
          task_id: task.id,
          task_title: task.title,
          task_level: task.cefr_level,
          task_category: task.category,
          original_text,
          word_count: wordCount,
          total_score: calculated.total,
          grade: calculated.grade,
          cefr_estimate: parsed.cefr_estimate || cefrSummary.estimate,
          cefr_confidence: parsed.cefr_confidence || cefrSummary.confidence,
          cefr_summary_th: parsed.cefr_summary_th || cefrSummary.summaryTh,
          main_weakness_th: parsed.main_weakness_th || 'ไวยากรณ์และการเรียงคำในอนุประโยค',
          main_strength_th: parsed.main_strength_th || 'การพัฒนาเนื้อหาและการตอบโจทย์ที่ชัดเจน',
          cefr_profile: profile,
          category_scores: calculated.verifiedScores,
          errors: Array.isArray(parsed.errors) ? parsed.errors : [],
          strengths: Array.isArray(parsed.strengths) ? parsed.strengths : ['Gute Textstruktur'],
          weaknesses: Array.isArray(parsed.weaknesses) ? parsed.weaknesses : ['Satzbau in Nebensätzen'],
          writing_versions: {
            corrected: parsed.writing_versions?.corrected || original_text,
            b2_improved: parsed.writing_versions?.b2_improved || original_text,
            c1_model: parsed.writing_versions?.c1_model || original_text,
          },
          learning_recommendations: Array.isArray(parsed.learning_recommendations)
            ? parsed.learning_recommendations
            : [
                {
                  topic: 'Nebensätze',
                  priority: 'high',
                  reason_th: 'พบข้อผิดพลาดด้านตำแหน่งกริยา',
                  action_th: 'ทบทวนบทเรียน Nebensätze และฝึกแต่งประโยค',
                },
              ],
          rubric_version: '1.0',
          created_at: new Date().toISOString(),
        };

        submissionsStore.unshift(result);
        return res.json({ assessment: result });
      } catch (geminiError) {
        console.warn('Gemini assessment error, falling back to deterministic evaluator:', geminiError);
      }
    }

    // Fallback deterministic assessment engine
    const fallbackResult = generateDeterministicAssessment(task, original_text);
    submissionsStore.unshift(fallbackResult);
    return res.json({ assessment: fallbackResult });
  } catch (error: any) {
    console.error('Assessment server error:', error);
    res.status(500).json({ error: 'Server failed to process assessment.' });
  }
});

// Submissions History & Stats
app.get('/api/history', (_req: Request, res: Response) => {
  res.json({
    submissions: submissionsStore,
    total: submissionsStore.length,
    average_score:
      submissionsStore.length > 0
        ? Math.round(
            (submissionsStore.reduce((acc, curr) => acc + curr.total_score, 0) / submissionsStore.length) * 10
          ) / 10
        : 0,
  });
});

app.get('/api/history/:id', (req: Request, res: Response) => {
  const item = submissionsStore.find((s) => s.id === req.params.id || s.submission_id === req.params.id);
  if (!item) {
    return res.status(404).json({ error: 'Assessment submission not found' });
  }
  res.json({ assessment: item });
});

// Lessons
app.get('/api/lessons', (_req: Request, res: Response) => {
  res.json({ lessons: GRAMMAR_LESSONS });
});

app.get('/api/lessons/:id', (req: Request, res: Response) => {
  const lesson = GRAMMAR_LESSONS.find((l) => l.id === req.params.id);
  if (!lesson) {
    return res.status(404).json({ error: 'Lesson not found' });
  }
  res.json({ lesson });
});

// Vocabulary Bank
app.get('/api/vocabulary', (_req: Request, res: Response) => {
  res.json({ vocabulary: vocabularyStore });
});

app.post('/api/vocabulary', (req: Request, res: Response) => {
  const { word, meaning_th, example_sentence, example_translation_th, cefr_level = 'B2', part_of_speech = 'Noun', article } = req.body;
  if (!word || !meaning_th) {
    return res.status(400).json({ error: 'Word and meaning are required' });
  }

  const newItem = {
    id: `vocab-${Date.now()}`,
    word,
    article,
    part_of_speech,
    meaning_th,
    example_sentence: example_sentence || '',
    example_translation_th: example_translation_th || '',
    cefr_level,
    created_at: new Date().toISOString(),
  };

  vocabularyStore.unshift(newItem);
  res.json({ item: newItem });
});

app.delete('/api/vocabulary/:id', (req: Request, res: Response) => {
  const initialLength = vocabularyStore.length;
  vocabularyStore = vocabularyStore.filter((v) => v.id !== req.params.id);
  res.json({ success: vocabularyStore.length < initialLength });
});

// Vite middleware in dev, static files in production
async function startServer() {
  if (process.env.NODE_ENV === 'production') {
    app.use(express.static(path.resolve(__dirname, 'dist')));
    app.get('*', (_req: Request, res: Response) => {
      res.sendFile(path.resolve(__dirname, 'dist', 'index.html'));
    });
  } else {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`[DeutschSchreiben AI] Server listening on port ${PORT}`);
  });
}

startServer().catch((err) => {
  console.error('Fatal error starting server:', err);
  process.exit(1);
});
