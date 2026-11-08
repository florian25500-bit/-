import {
  AssessmentError,
  AssessmentResult,
  CategoryScoreItem,
  ExtendedCEFR,
  Grade,
  WritingTask,
} from '../types';
import {
  calculateGrade,
  calculateTotalScore,
  countGermanWords,
  countGermanChars,
  countParagraphs,
  RUBRIC_WEIGHTS,
} from './scoring';

// B1, B2, C1 vocabulary banks for lexical detection
const B2_C1_ACADEMIC_VOCAB = new Set([
  'zusammenfassend', 'stellungnahme', 'einerseits', 'andererseits', 'außerdem',
  'deshalb', 'deswegen', 'infolgedessen', 'demzufolge', 'dennoch', 'obwohl',
  'trotzdem', 'zweifellos', 'insbesondere', 'schließlich', 'mittlerweile',
  'beispielsweise', 'vermutlich', 'tatsächlich', 'offensichtlich', 'gewissermaßen',
  'hervorheben', 'berücksichtigen', 'darstellen', 'verdeutlichen', 'beeinflussen',
  'begründen', 'beurteilen', 'einschätzen', 'ermöglichen', 'führen', 'beitragen',
  'voraussetzen', 'entsprechen', 'fordern', 'fördern', 'verhindern', 'verbessern',
  'entwicklung', 'bedeutung', 'auswirkung', 'erfahrung', 'herausforderung',
  'möglichkeit', 'maßnahme', 'voraussetzung', 'entscheidung', 'perspektive',
  'zusammenhang', 'unterschied', 'vorteil', 'nachteil', 'begründung', 'ergebnis',
  'forschung', 'untersuchung', 'gesellschaft', 'arbeitswelt', 'technologie',
  'digitalisierung', 'nachhaltigkeit', 'umweltschutz', 'verantwortung', 'autonomie',
  'differenziert', 'komplex', 'relevant', 'wesentlich', 'erheblich', 'nachhaltig',
  'vielfältig', 'kontrovers', 'effektiv', 'effizient', 'fundiert', 'kontinuierlich'
]);

const C1_ADVANCED_VOCAB = new Set([
  'paradigmenwechsel', 'epistemisch', 'differenzierung', 'implikation', 'diskrepanz',
  'atrophie', 'erosion', 'autonomie', 'ambiguität', 'substituieren', 'subsumieren',
  'einhergehen', 'obsolet', 'synthese', 'diskurs', 'plausibel', 'adäquat',
  'signifikant', 'fundamental', 'sukzessive', 'ambivalent', 'heterogen', 'homogen',
  'unabdingbar', 'unerlässlich', 'prägnant', 'pointiert', 'innovativ', 'zeitnah',
  'widerlegen', 'propagieren', 'konstatieren', 'postulieren', 'rezipieren',
  'in betracht ziehen', 'zur folge haben', 'einfluss ausüben', 'zur verfügung stehen'
]);

// Common German nouns that must be capitalized
const COMMON_GERMAN_NOUNS = [
  'arbeit', 'zeit', 'mensch', 'menschen', 'leben', 'jahr', 'jahre', 'tag', 'tage',
  'welt', 'kind', 'kinder', 'frau', 'frauen', 'mann', 'männer', 'freund', 'freunde',
  'haus', 'stadt', 'land', 'problem', 'probleme', 'frage', 'fragen', 'thema',
  'meinung', 'beispiel', 'beispiele', 'grund', 'gründe', 'vorteil', 'vorteile',
  'nachteil', 'nachteile', 'möglichkeit', 'möglichkeiten', 'geld', 'schule',
  'universität', 'kurs', 'kurse', 'ausflug', 'reise', 'brief', 'nachricht',
  'eltern', 'lehrer', 'student', 'studenten', 'kollege', 'kollegen', 'büro',
  'heimat', 'erfahrung', 'erfahrungen', 'familie', 'zukunft', 'gesundheit'
];

interface LinguisticFeatures {
  wordCount: number;
  charCount: number;
  paragraphCount: number;
  sentenceCount: number;
  avgSentenceLength: number;
  uniqueWords: number;
  typeTokenRatio: number;
  b2VocabCount: number;
  c1VocabCount: number;
  connectorsCount: number;
  subordinateClauseCount: number;
  detectedErrors: AssessmentError[];
  matchedRequirementKeywords: number;
  formalityScore: number;
}

/**
 * Perform genuine linguistic feature extraction and error detection on German text
 */
export function analyzeGermanLinguisticFeatures(
  text: string,
  task: WritingTask
): LinguisticFeatures {
  const wordCount = countGermanWords(text);
  const charCount = countGermanChars(text);
  const paragraphCount = countParagraphs(text);

  const sentences = text
    .split(/(?<=[.!?])\s+/)
    .map((s) => s.trim())
    .filter((s) => s.length > 0);
  const sentenceCount = Math.max(1, sentences.length);
  const avgSentenceLength = Math.round((wordCount / sentenceCount) * 10) / 10;

  // Extract clean words
  const words = (text.toLowerCase().match(/[\p{L}\p{N}_\-ßäöüÄÖÜ]+/gu) || []);
  const uniqueWordsSet = new Set(words);
  const uniqueWords = uniqueWordsSet.size;
  const typeTokenRatio = wordCount > 0 ? Math.round((uniqueWords / wordCount) * 100) / 100 : 0;

  // Count CEFR vocabulary
  let b2VocabCount = 0;
  let c1VocabCount = 0;
  words.forEach((w) => {
    if (C1_ADVANCED_VOCAB.has(w)) c1VocabCount++;
    else if (B2_C1_ACADEMIC_VOCAB.has(w)) b2VocabCount++;
  });

  // Connector detection
  const connectorRegex = /\b(weil|da|obwohl|trotzdem|deshalb|deswegen|außerdem|zudem|jedoch|allerdings|einerseits|andererseits|zwar|während|nachdem|sodass|damit|dennoch|folglich|infolgedessen|darüber hinaus|des Weiteren)\b/gi;
  const connectorsMatches = text.match(connectorRegex) || [];
  const connectorsCount = connectorsMatches.length;

  // Subordinate clause markers
  const subClauseRegex = /\b(weil|da|obwohl|dass|wenn|falls|ob|damit|nachdem|während|sodass|indem)\b/gi;
  const subClauseMatches = text.match(subClauseRegex) || [];
  const subordinateClauseCount = subClauseMatches.length;

  const detectedErrors: AssessmentError[] = [];

  // 1. RULE: Verb am Ende im Nebensatz (weil, obwohl, dass, wenn)
  // Catch patterns like: "weil er ist müde", "obwohl ich habe keine Zeit", "dass wir können kommen"
  const verbSecondInNebensatz = /\b(weil|obwohl|dass|wenn|da)\s+([a-zA-ZäöüÄÖÜß]+)\s+(ist|war|hat|hatte|wird|kann|muss|soll|will|darf|sind|haben|können|müssen|habe|hast|bin|bist|waren|werde|wirst|könnte|würde|hätte|wäre)\s+([^.!?,\n]{2,})/gi;
  let m: RegExpExecArray | null;
  while ((m = verbSecondInNebensatz.exec(text)) !== null) {
    const fullMatch = m[0];
    const subjunktion = m[1];
    const subject = m[2];
    const finiteVerb = m[3];
    const rest = m[4].trim();

    // Check if the finite verb is not already at the end of clause
    if (rest.length > 2 && !rest.startsWith('nicht')) {
      const corrected = `${subjunktion} ${subject} ${rest} ${finiteVerb}`;
      detectedErrors.push({
        id: `err-nebensatz-${m.index}`,
        category: 'GRAMMAR',
        subcategory: 'WORD_ORDER',
        severity: 'major',
        confidence: 0.96,
        original_text: fullMatch,
        corrected_text: corrected,
        explanation_th: `ในอนุประโยคที่ขึ้นต้นด้วยคำเชื่อมรอง (${subjunktion}) คำกริยาที่ผันตามประธาน (${finiteVerb}) ต้องวางไว้ที่ "ตำแหน่งท้ายสุดของประโยค" เสมอ ไม่วางไว้ตำแหน่งที่สองเหมือนประโยคหลัก`,
        rule: 'Verbletztstellung im Nebensatz (Kausalsatz / Konzessivsatz)',
        start_offset: m.index,
        end_offset: m.index + fullMatch.length,
        examples: [
          {
            german: `Ich bleibe zu Hause, ${subjunktion} ich krank bin.`,
            thai: `ฉันอยู่บ้านเพราะฉันป่วย (กริยา bin อยู่ตำแหน่งสุดท้าย)`,
          },
        ],
      });
    }
  }

  // 2. RULE: Inversion nach Konjunktionaladverbien (außerdem, deshalb, trotzdem, daher)
  // Catch: "Außerdem ich denke", "Deshalb wir müssen", "Trotzdem er kommt"
  const inversionErrorRegex = /\b(Außerdem|Deshalb|Deswegen|Trotzdem|Daher|Folglich|Dennoch)\s+([a-zA-ZäöüÄÖÜß]+)\s+(ist|war|hat|hatte|wird|kann|muss|soll|will|darf|denke|glaube|habe|sind|haben)\b/g;
  while ((m = inversionErrorRegex.exec(text)) !== null) {
    const fullMatch = m[0];
    const adverb = m[1];
    const subject = m[2];
    const finiteVerb = m[3];

    // If subject is placed before verb, it violates V2 inversion
    if (['ich', 'du', 'er', 'sie', 'es', 'wir', 'ihr', 'man'].includes(subject.toLowerCase())) {
      const corrected = `${adverb} ${finiteVerb} ${subject}`;
      detectedErrors.push({
        id: `err-inversion-${m.index}`,
        category: 'GRAMMAR',
        subcategory: 'INVERSION',
        severity: 'major',
        confidence: 0.95,
        original_text: fullMatch,
        corrected_text: corrected,
        explanation_th: `คำเชื่อมกลุ่มกริยาวิเศษณ์ (${adverb}) นับเป็นตำแหน่งที่ 1 ของประโยคหลัก ดังนั้นคำกริยาแท้ (${finiteVerb}) ต้องตามมาเป็นตำแหน่งที่ 2 ทันที แล้วจึงตามด้วยประธาน (${subject})`,
        rule: 'Inversion (Subjekt-Verb-Umstellung nach Konjunktionaladverb)',
        start_offset: m.index,
        end_offset: m.index + fullMatch.length,
        examples: [
          {
            german: `${adverb} habe ich keine Zeit. (ไม่ใช่ ${adverb} ich habe...)`,
            thai: `นอกจากนี้ฉันไม่มีเวลา (กริยา habe สลับมาอยู่หน้าประธาน ich)`,
          },
        ],
      });
    }
  }

  // 3. RULE: Großschreibung von Nomen (Capitalization of German Nouns)
  // Catch lowercase nouns preceded by articles/pronouns: "die zeit", "das problem", "mein freund", "viele leute"
  COMMON_GERMAN_NOUNS.forEach((noun) => {
    const nounLowerRegex = new RegExp(`\\b(ein|eine|einen|einem|einer|eines|der|die|das|den|dem|des|mein|meine|meinen|sein|seine|ihr|ihre|viele|alle)\\s+(${noun})\\b`, 'g');
    let nm: RegExpExecArray | null;
    while ((nm = nounLowerRegex.exec(text)) !== null) {
      const full = nm[0];
      const art = nm[1];
      const nWord = nm[2];
      const capitalized = nWord.charAt(0).toUpperCase() + nWord.slice(1);
      detectedErrors.push({
        id: `err-nouncap-${nm.index}`,
        category: 'MECHANICS',
        subcategory: 'CAPITALIZATION',
        severity: 'minor',
        confidence: 0.92,
        original_text: full,
        corrected_text: `${art} ${capitalized}`,
        explanation_th: `ในภาษาเยอรมัน คำนามทุกคำ (${capitalized}) ต้องขึ้นต้นด้วย "ตัวพิมพ์ใหญ่" เสมอ ไม่ว่าคำนั้นจะอยู่ตำแหน่งใดของประโยค`,
        rule: 'Großschreibung von Substantiven (Nomen)',
        start_offset: nm.index,
        end_offset: nm.index + full.length,
        examples: [
          {
            german: `${art} ${capitalized} ist sehr wichtig.`,
            thai: `${capitalized} เป็นสิ่งสำคัญมาก (คำนามต้องขึ้นต้นด้วยพิมพ์ใหญ่)`,
          },
        ],
      });
    }
  });

  // 4. RULE: Dativ nach Präpositionen mit Dativ (mit, zu, bei, nach, von, aus, seit)
  const dativErrorsRegex = /\b(zu|mit|bei|nach|von|aus|seit)\s+(das|die|der)\s+([a-zA-ZäöüÄÖÜß]+)\b/gi;
  while ((m = dativErrorsRegex.exec(text)) !== null) {
    const full = m[0];
    const prep = m[1].toLowerCase();
    const art = m[2].toLowerCase();
    const word = m[3];

    // "zu das" -> "zum", "bei das" -> "beim", "mit die" -> "mit der" (fem) or "mit den" (pl)
    if (prep === 'zu' && art === 'das') {
      detectedErrors.push({
        id: `err-dativ-${m.index}`,
        category: 'GRAMMAR',
        subcategory: 'KASUS',
        severity: 'major',
        confidence: 0.94,
        original_text: full,
        corrected_text: `zum ${word}`,
        explanation_th: `คำบุพบท "zu" บังคับใช้รูป Dativ เสมอ สำหรับคำนามเพศกลาง (das) ต้องเปลี่ยนเป็น "zu dem" หรือรูปย่อ "zum"`,
        rule: 'Dativ-Präpositionen (zu + Dativ)',
        start_offset: m.index,
        end_offset: m.index + full.length,
        examples: [
          {
            german: `Ich gehe zum Bahnhof / zum Unterricht.`,
            thai: `ฉันไปสถานีรถไฟ / ไปเรียน (zu + dem = zum)`,
          },
        ],
      });
    }
  }

  // 5. RULE: Repetitive basic words (e.g. overusing "machen" or "sehr gut")
  const machenCount = (text.match(/\b(machen|macht|machte|gemacht)\b/gi) || []).length;
  if (machenCount >= 4) {
    detectedErrors.push({
      id: `err-vocab-machen`,
      category: 'VOCABULARY',
      subcategory: 'WORD_VARIETY',
      severity: 'minor',
      confidence: 0.88,
      original_text: 'machen',
      corrected_text: 'ausüben / durchführen / unternehmen / erledigen',
      explanation_th: `พบการใช้คำกริยาพื้นฐาน "machen" ซ้ำกันเกินไป (${machenCount} ครั้ง) สำหรับระดับ B2/C1 ควรเลือกใช้คำกริยาที่เฉพาะเจาะจง เช่น eine Erfahrung machen -> eine Erfahrung sammeln, Sport machen -> Sport treiben`,
      rule: 'Präziser Wortschatz (Vermeidung von Alltagsverben)',
      start_offset: 0,
      end_offset: 6,
      examples: [
        {
          german: 'Erfahrungen sammeln / Sport treiben / eine Entscheidung treffen',
          thai: 'เก็บเกี่ยวประสบการณ์ / ออกกำลังกาย / ตัดสินใจ',
        },
      ],
    });
  }

  // Check requirements coverage against task instructions
  let matchedRequirementKeywords = 0;
  const lowerText = text.toLowerCase();
  task.requirements.forEach((req) => {
    // Extract key content words from requirement
    const reqWords = req.toLowerCase().match(/[\p{L}ßäöü]+/gu) || [];
    const significantWords = reqWords.filter((w) => w.length > 4);
    const hasMatch = significantWords.some((sw) => lowerText.includes(sw));
    if (hasMatch) matchedRequirementKeywords++;
  });

  // Formality check for letters vs essays
  let formalityScore = 1;
  if (task.category === 'Brief' || task.category === 'Beschwerde') {
    const hasFormalGreeting = /sehr geehrte/i.test(text);
    const hasFormalClose = /mit freundlichen grüßen/i.test(text);
    formalityScore = hasFormalGreeting && hasFormalClose ? 1 : 0.6;
  } else if (task.category === 'E-Mail' && task.cefr_level === 'B1') {
    const hasInformalGreeting = /liebe|lieber|hallo/i.test(text);
    const hasInformalClose = /liebe grüße|herzliche grüße|viele grüße/i.test(text);
    formalityScore = hasInformalGreeting && hasInformalClose ? 1 : 0.7;
  }

  return {
    wordCount,
    charCount,
    paragraphCount,
    sentenceCount,
    avgSentenceLength,
    uniqueWords,
    typeTokenRatio,
    b2VocabCount,
    c1VocabCount,
    connectorsCount,
    subordinateClauseCount,
    detectedErrors,
    matchedRequirementKeywords,
    formalityScore,
  };
}

/**
 * Genuine CEFR scoring calculation based strictly on actual linguistic evidence
 */
export function evaluateTextLinguistically(
  task: WritingTask,
  originalText: string
): AssessmentResult {
  const wordCount = countGermanWords(originalText);
  const minWords = task.min_words;
  const maxWords = task.max_words;

  // 1. Extreme short text check (Under 8 words)
  if (wordCount < 8) {
    const rawCategories: CategoryScoreItem[] = [
      {
        category: 'task_fulfillment',
        label_de: 'Aufgabenbewältigung',
        label_en: 'Task Fulfillment',
        score: Math.max(1, Math.round(wordCount * 0.2)),
        max_score: 20,
        feedback_th: `เนื้อหาสั้นเกินไปอย่างมาก (${wordCount} คำ จากเกณฑ์กำหนด ${minWords}–${maxWords} คำ) ไม่สามารถตอบโจทย์ได้ครบ`,
      },
      {
        category: 'content_development',
        label_de: 'Inhalt & Entwicklung',
        label_en: 'Content Development',
        score: Math.max(1, Math.round(wordCount * 0.15)),
        max_score: 15,
        feedback_th: 'ไม่มีการพัฒนาเนื้อหาหรือข้อถกเถียงอย่างเป็นรูปธรรม',
      },
      {
        category: 'vocabulary',
        label_de: 'Wortschatz',
        label_en: 'Vocabulary',
        score: Math.max(2, Math.round(wordCount * 0.2)),
        max_score: 20,
        feedback_th: 'คลังคำศัพท์จำกัดมาก ไม่พบคำศัพท์เชิงวิชาการตามระดับเป้าหมาย',
      },
      {
        category: 'grammar',
        label_de: 'Grammatik',
        label_en: 'Grammar',
        score: Math.max(2, Math.round(wordCount * 0.2)),
        max_score: 20,
        feedback_th: 'โครงสร้างประโยคไม่เพียงพอต่อการวัดความแม่นยำทางไวยากรณ์',
      },
      {
        category: 'cohesion',
        label_de: 'Kohärenz & Kohäsion',
        label_en: 'Cohesion',
        score: 1,
        max_score: 15,
        feedback_th: 'ขาดคำเชื่อมและการจัดย่อหน้าอย่างเป็นระบบ',
      },
      {
        category: 'register',
        label_de: 'Register & Stil',
        label_en: 'Register & Style',
        score: 1,
        max_score: 5,
        feedback_th: 'ไม่สามารถระบุระดับภาษาที่เหมาะสมกับบริบทได้',
      },
      {
        category: 'mechanics',
        label_de: 'Rechtschreibung',
        label_en: 'Mechanics',
        score: 1,
        max_score: 5,
        feedback_th: 'ไม่เพียงพอต่อการวัดผล',
      },
    ];

    const calc = calculateTotalScore(rawCategories);
    return {
      id: `assess-${Date.now()}`,
      submission_id: `sub-${Date.now()}`,
      task_id: task.id,
      task_title: task.title,
      task_level: task.cefr_level,
      task_category: task.category,
      original_text: originalText,
      word_count: wordCount,
      total_score: calc.total,
      grade: calc.grade,
      cefr_estimate: 'A1',
      cefr_confidence: 'high',
      cefr_summary_th: `ระดับที่ตรวจวัดได้จริงคือ A1 เนื่องจากงานเขียนมีความยาวเพียง ${wordCount} คำ ซึ่งต่ำกว่าเกณฑ์ข้อสอบอย่างมีนัยสำคัญ`,
      main_weakness_th: 'จำนวนคำและเนื้อหาไม่เพียงพอตามข้อกำหนดของโจทย์อย่างรุนแรง',
      main_strength_th: 'มีการส่งข้อความเพื่อเริ่มฝึกฝน',
      cefr_profile: {
        task_fulfillment: 'A1',
        content_development: 'A1',
        vocabulary: 'A1',
        grammar: 'A1',
        cohesion: 'A1',
        register: 'A1',
        mechanics: 'A1',
      },
      category_scores: calc.verifiedScores,
      errors: [],
      strengths: ['เริ่มต้นเขียนข้อความภาษาเยอรมัน'],
      weaknesses: [
        `ความยาว ${wordCount} คำ ไม่เพียงพอต่อเกณฑ์ขั้นต่ำ ${minWords} คำ`,
        'ยังไม่มีโครงสร้างประโยคและคำเชื่อมที่สมบูรณ์',
      ],
      writing_versions: {
        corrected: originalText,
        b2_improved: `Sehr geehrte Damen und Herren,\n\nich schreibe Ihnen bezüglich der vorliegenden Aufgabenstellung...`,
        c1_model: `Im Hinblick auf die gegenwärtige Fragestellung lässt sich konstatieren, dass...`,
      },
      learning_recommendations: [
        {
          topic: 'Wortschatzaufbau und Grundwortschatz',
          priority: 'high',
          reason_th: 'เพิ่มพูนคลังคำศัพท์พื้นฐานเพื่อขยายความยาวของบทความ',
          action_th: 'ฝึกเขียนประโยคสั้นๆ วันละ 5 ประโยคตามโครงสร้าง Subject + Verb + Object',
        },
      ],
      rubric_version: '2.0',
      created_at: new Date().toISOString(),
    };
  }

  // 2. Perform deep linguistic feature extraction
  const feats = analyzeGermanLinguisticFeatures(originalText, task);

  // Ratio of length compared to min required words
  const lengthRatio = Math.min(1.0, wordCount / minWords);
  const lengthPenaltyFactor = wordCount < minWords ? Math.max(0.3, lengthRatio) : 1.0;

  // Excessive length penalty if over 160% of max_words
  const excessivePenalty = wordCount > maxWords * 1.5 ? 0.9 : 1.0;

  // Error deductions
  const majorGrammarErrors = feats.detectedErrors.filter((e) => e.category === 'GRAMMAR').length;
  const mechanicsErrors = feats.detectedErrors.filter((e) => e.category === 'MECHANICS').length;
  const vocabErrors = feats.detectedErrors.filter((e) => e.category === 'VOCABULARY').length;

  // 1. Task Fulfillment (Max 20)
  // Determined by: length completion (40%), requirement checklist match (40%), formality (20%)
  const reqRatio = task.requirements.length > 0 ? feats.matchedRequirementKeywords / task.requirements.length : 0.8;
  const rawTaskScore = 20 * (0.45 * lengthRatio + 0.35 * Math.min(1, reqRatio + 0.3) + 0.2 * feats.formalityScore);
  const taskScore = Math.max(2, Math.min(20, Math.round(rawTaskScore * excessivePenalty)));

  // 2. Content Development (Max 15)
  // Determined by: paragraph count, sentence complexity, and overall depth
  const paragraphBonus = feats.paragraphCount >= 3 ? 1.0 : feats.paragraphCount === 2 ? 0.85 : 0.65;
  const avgSentenceScore = feats.avgSentenceLength >= 12 && feats.avgSentenceLength <= 25 ? 1.0 : 0.85;
  const rawContentScore = 15 * lengthPenaltyFactor * paragraphBonus * avgSentenceScore;
  const contentScore = Math.max(2, Math.min(15, Math.round(rawContentScore)));

  // 3. Vocabulary (Max 20)
  // Determined by: type-token ratio (richness), B2/C1 lexicon count, minus vocabulary errors
  const lexicalRichness = Math.min(1.0, feats.typeTokenRatio * 1.6);
  const advancedBonus = Math.min(4, feats.b2VocabCount * 0.6 + feats.c1VocabCount * 1.2);
  const vocabDeduction = vocabErrors * 2;
  const baseVocab = 16 * lengthPenaltyFactor * lexicalRichness + advancedBonus - vocabDeduction;
  const vocabScore = Math.max(3, Math.min(20, Math.round(baseVocab)));

  // 4. Grammar (Max 20)
  // Determined by: presence of complex clauses (subordinate, passive, modals) minus grammar errors
  const complexClauseBonus = Math.min(4, feats.subordinateClauseCount * 0.8);
  const grammarDeduction = majorGrammarErrors * 2.2;
  const baseGrammar = (16 + complexClauseBonus - grammarDeduction) * (0.6 + 0.4 * lengthPenaltyFactor);
  const grammarScore = Math.max(3, Math.min(20, Math.round(baseGrammar)));

  // 5. Cohesion & Linkers (Max 15)
  // Determined by: connectors count and paragraph flow
  const connectorRatio = Math.min(1.0, feats.connectorsCount / Math.max(3, Math.round(wordCount / 40)));
  const baseCohesion = 15 * (0.6 * connectorRatio + 0.4 * paragraphBonus) * lengthPenaltyFactor;
  const cohesionScore = Math.max(2, Math.min(15, Math.round(baseCohesion)));

  // 6. Register & Style (Max 5)
  const baseRegister = 5 * feats.formalityScore * (0.7 + 0.3 * lengthPenaltyFactor);
  const registerScore = Math.max(1, Math.min(5, Math.round(baseRegister)));

  // 7. Mechanics (Max 5)
  const mechanicsScore = Math.max(1, Math.min(5, Math.round(5 - mechanicsErrors * 0.8)));

  // Construct raw categories
  const rawCategories: CategoryScoreItem[] = [
    {
      category: 'task_fulfillment',
      label_de: 'Aufgabenbewältigung',
      label_en: 'Task Fulfillment',
      score: taskScore,
      max_score: 20,
      feedback_th: lengthRatio >= 0.95
        ? 'ตอบประเด็นและข้อกำหนดของโจทย์ได้ครบถ้วน ชัดเจน และตรงเป้าหมาย'
        : `ความยาว ${wordCount} คำ ยังต่ำกว่าเกณฑ์เป้าหมาย (${minWords}–${maxWords} คำ) ทำให้การตอบประเด็นไม่สมบูรณ์`,
    },
    {
      category: 'content_development',
      label_de: 'Inhalt & Entwicklung',
      label_en: 'Content Development',
      score: contentScore,
      max_score: 15,
      feedback_th: feats.paragraphCount >= 3
        ? 'มีการลำดับเค้าโครงความคิดเป็นย่อหน้าชัดเจน มีเหตุผลและตัวอย่างสนับสนุน'
        : 'ควรแบ่งย่อหน้าให้ชัดเจนอย่างน้อย 3 ย่อหน้า (บทนำ, เนื้อหาหลัก, สรุป)',
    },
    {
      category: 'vocabulary',
      label_de: 'Wortschatz',
      label_en: 'Vocabulary',
      score: vocabScore,
      max_score: 20,
      feedback_th: feats.b2VocabCount + feats.c1VocabCount >= 4
        ? `พบคำศัพท์และสำนวนระดับวิชาการ B2/C1 (${feats.b2VocabCount + feats.c1VocabCount} คำ) ช่วยยกระดับความสละสลวย`
        : 'คลังคำศัพท์อยู่ในเกณฑ์สื่อสารได้ แต่ควรเพิ่มคำศัพท์วิชาการและสำนวนเฉพาะทางระดับ B2',
    },
    {
      category: 'grammar',
      label_de: 'Grammatik',
      label_en: 'Grammar',
      score: grammarScore,
      max_score: 20,
      feedback_th: majorGrammarErrors === 0
        ? 'ควบคุมไวยากรณ์และตำแหน่งคำกริยาได้ถูกต้องดีมาก'
        : `ตรวจพบจุดคลาดเคลื่อนทางไวยากรณ์ ${majorGrammarErrors} จุด (เน้นตำแหน่งกริยาในอนุประโยค/การสลับประธานกริยา)`,
    },
    {
      category: 'cohesion',
      label_de: 'Kohärenz & Kohäsion',
      label_en: 'Cohesion',
      score: cohesionScore,
      max_score: 15,
      feedback_th: feats.connectorsCount >= 4
        ? `มีการใช้คำเชื่อมประโยค ${feats.connectorsCount} จุด ทำให้ข้อความไหลลื่น`
        : 'ควรเพิ่มคำเชื่อมความสัมพันธ์ เช่น deshalb, obwohl, einerseits... andererseits',
    },
    {
      category: 'register',
      label_de: 'Register & Stil',
      label_en: 'Register & Style',
      score: registerScore,
      max_score: 5,
      feedback_th: feats.formalityScore >= 0.9
        ? 'ระดับความสุภาพและสำนวนเปิด-ปิดตรงตามประเภทงานเขียน'
        : 'ควรปรับระดับภาษาให้เข้ากับบริบทที่เป็นทางการมากยิ่งขึ้น',
    },
    {
      category: 'mechanics',
      label_de: 'Rechtschreibung',
      label_en: 'Mechanics',
      score: mechanicsScore,
      max_score: 5,
      feedback_th: mechanicsErrors === 0
        ? 'การสะกดคำ ตัวพิมพ์ใหญ่คำนาม และเครื่องหมายวรรคตอนถูกต้องดี'
        : `พบจุดที่ตัวพิมพ์ใหญ่ของคำนามคลาดเคลื่อน ${mechanicsErrors} จุด`,
    },
  ];

  const calc = calculateTotalScore(rawCategories);

  // Derive genuine CEFR Level based on calculated total score and linguistic profile
  let cefrEstimate: ExtendedCEFR = 'B1';
  let cefrConfidence: 'high' | 'medium' | 'low' = 'high';

  if (calc.total >= 88 && wordCount >= minWords) {
    cefrEstimate = calc.total >= 94 ? 'C1' : 'B2+';
  } else if (calc.total >= 75) {
    cefrEstimate = calc.total >= 82 ? 'B2' : 'B1+';
  } else if (calc.total >= 60) {
    cefrEstimate = 'B1';
  } else if (calc.total >= 45) {
    cefrEstimate = 'A2+';
  } else {
    cefrEstimate = 'A2';
  }

  const profile: Record<string, ExtendedCEFR> = {
    task_fulfillment: taskScore >= 17 ? 'B2+' : taskScore >= 14 ? 'B2' : taskScore >= 11 ? 'B1+' : 'B1',
    content_development: contentScore >= 13 ? 'B2+' : contentScore >= 10 ? 'B2' : 'B1',
    vocabulary: vocabScore >= 17 ? 'B2+' : vocabScore >= 14 ? 'B2' : vocabScore >= 10 ? 'B1+' : 'B1',
    grammar: grammarScore >= 17 ? 'B2+' : grammarScore >= 13 ? 'B2' : grammarScore >= 9 ? 'B1+' : 'B1',
    cohesion: cohesionScore >= 13 ? 'B2+' : cohesionScore >= 10 ? 'B2' : 'B1',
    register: registerScore >= 4 ? 'B2' : 'B1',
    mechanics: mechanicsScore >= 4 ? 'B2' : 'B1',
  };

  // Generate dynamic corrected version by replacing errors
  let correctedVersion = originalText;
  feats.detectedErrors.forEach((err) => {
    correctedVersion = correctedVersion.replace(err.original_text, err.corrected_text);
  });

  // Dynamic Strengths & Weaknesses based on real stats
  const strengths: string[] = [];
  if (wordCount >= minWords) strengths.push(`เขียนได้ความยาวตรงตามเกณฑ์ (${wordCount} คำ)`);
  if (feats.b2VocabCount > 0) strengths.push(`มีคำศัพท์ระดับ B2 ปรากฏในบทความ ${feats.b2VocabCount} คำ`);
  if (feats.connectorsCount >= 3) strengths.push(`ใช้คำเชื่อมแสดงความสัมพันธ์ของประโยคได้เหมาะสม (${feats.connectorsCount} จุด)`);
  if (feats.paragraphCount >= 3) strengths.push('มีการแบ่งย่อหน้าโครงสร้างอย่างเป็นระเบียบ');
  if (strengths.length === 0) strengths.push('สื่อความหมายในประเด็นพื้นฐานได้เข้าใจ');

  const weaknesses: string[] = [];
  if (wordCount < minWords) weaknesses.push(`จำนวนคำ ${wordCount} คำ ยังน้อยกว่าเกณฑ์กำหนด ${minWords} คำ`);
  if (majorGrammarErrors > 0) weaknesses.push(`ตำแหน่งคำกริยาในอนุประโยค (Nebensätze) หรือการสลับประธานกริยาคลาดเคลื่อน ${majorGrammarErrors} จุด`);
  if (mechanicsErrors > 0) weaknesses.push('มีคำนามภาษาเยอรมันที่ลืมขึ้นต้นด้วยตัวพิมพ์ใหญ่');
  if (feats.b2VocabCount === 0) weaknesses.push('ยังไม่พบคำศัพท์และสำนวนระดับ B2 เพื่อยกระดับความสละสลวย');
  if (weaknesses.length === 0) weaknesses.push('รักษาความแม่นยำและฝึกใช้คำเชื่อมคู่ (zweiteilige Konnektoren) ให้ชำนาญยิ่งขึ้น');

  return {
    id: `assess-${Date.now()}`,
    submission_id: `sub-${Date.now()}`,
    task_id: task.id,
    task_title: task.title,
    task_level: task.cefr_level,
    task_category: task.category,
    original_text: originalText,
    word_count: wordCount,
    total_score: calc.total,
    grade: calc.grade,
    cefr_estimate: cefrEstimate,
    cefr_confidence: cefrConfidence,
    cefr_summary_th: `ระดับที่ประเมินได้จากข้อเขียนจริงคือ ${cefrEstimate} (คะแนนรวม ${calc.total}/100 เกรด ${calc.grade}) โดยวิเคราะห์จากความยาว ${wordCount} คำ โครงสร้างไวยากรณ์ และคลังคำศัพท์ที่ปรากฏจริง`,
    main_weakness_th: weaknesses[0],
    main_strength_th: strengths[0],
    cefr_profile: profile as any,
    category_scores: calc.verifiedScores,
    errors: feats.detectedErrors,
    strengths,
    weaknesses,
    writing_versions: {
      corrected: correctedVersion,
      b2_improved: `[ฉบับยกระดับระดับ B2 สำหรับหัวข้อ: ${task.title}]\n\n${correctedVersion}\n\n(คำแนะนำ: นำคำเชื่อมคู่ เช่น nicht nur ... sondern auch, zwar ... aber มาช่วยเสริมเหตุผล)`,
      c1_model: `[ฉบับแบบอย่างวิชาการระดับ C1 สำหรับหัวข้อ: ${task.title}]\n\nZweifelsohne erfordert die Thematik „${task.title}“ eine differenzierte Auseinandersetzung. Im Hinblick auf die gegenwärtigen gesellschaftlichen Entwicklungen lässt sich konstatieren, dass fundierte Maßnahmen unerlässlich sind.`,
    },
    learning_recommendations: [
      {
        topic: majorGrammarErrors > 0 ? 'Nebensätze und Verbletztstellung' : 'Zweiteilige Konnektoren',
        priority: 'high',
        reason_th: majorGrammarErrors > 0
          ? 'พบข้อผิดพลาดเรื่องตำแหน่งกริยาในอนุประโยค'
          : 'เพื่อยกระดับทักษะการเชื่อมโยงความไปสู่ระดับ B2/C1',
        lesson_id: 'lesson-nebensaetze',
        action_th: 'ทบทวนบทเรียนและทำแบบฝึกหัด 5 ข้อ',
      },
    ],
    rubric_version: '2.0',
    created_at: new Date().toISOString(),
  };
}
