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
import { evaluateTextLinguistically } from './src/utils/germanEvaluator';

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

// Initialize Google GenAI client only if a real API key is present
const geminiApiKey = process.env.GEMINI_API_KEY;
let aiClient: GoogleGenAI | null = null;
if (geminiApiKey && geminiApiKey !== 'MY_GEMINI_API_KEY' && geminiApiKey.trim().length > 15) {
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
  return evaluateTextLinguistically(task, originalText);
}

// User submissions store starts completely clean without fake mock assessments
// Submissions are strictly added when the real user submits essays

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

// Randomly draw a standardized central exam task
app.get('/api/tasks/random', (req: Request, res: Response) => {
  const { level } = req.query;
  let pool = [...tasksStore];
  if (level && typeof level === 'string') {
    pool = pool.filter((t) => t.cefr_level === level.toUpperCase());
  }
  if (pool.length === 0) pool = [...tasksStore];
  const randomIndex = Math.floor(Math.random() * pool.length);
  res.json({ task: pool[randomIndex] });
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
          setTimeout(() => reject(new Error('Gemini latency fallback: switching to academic evaluation engine')), 15000)
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
