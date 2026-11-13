export type CEFRLevel = 'B1' | 'B2' | 'C1';
export type ExtendedCEFR = 'A1' | 'A2' | 'A2+' | 'B1' | 'B1+' | 'B2' | 'B2+' | 'C1' | 'C1+';
export type Grade = 'A' | 'B' | 'C' | 'D' | 'E' | 'F';

export type TaskCategory = 
  | 'E-Mail'
  | 'Brief'
  | 'Stellungnahme'
  | 'Erörterung'
  | 'Bericht'
  | 'Beschwerde';

export interface WritingTask {
  id: string;
  task_id: string;
  language: 'de';
  cefr_level: CEFRLevel;
  category: TaskCategory;
  topic: string;
  title: string;
  instructions: string;
  requirements: string[];
  min_words: number;
  max_words: number;
  time_limit_minutes: number;
  task_version: string;
  sample_outline?: string[];
  sample_starter?: string;
  preset_draft?: string; // Preloaded learner text with real errors for testing
}

export type ErrorCategory = 'GRAMMAR' | 'VOCABULARY' | 'COHESION' | 'MECHANICS' | 'STYLE';

export interface AssessmentError {
  id: string;
  category: ErrorCategory;
  subcategory: string; // e.g. WORD_ORDER, VERB_CONJUGATION, KASUS, CONNECTOR
  original_text: string;
  corrected_text: string;
  explanation_th: string;
  rule: string;
  severity: 'minor' | 'major';
  confidence: number;
  start_offset: number;
  end_offset: number;
  examples: {
    german: string;
    thai: string;
  }[];
}

export interface CategoryScoreItem {
  category: 
    | 'task_fulfillment' 
    | 'content_development' 
    | 'vocabulary' 
    | 'grammar' 
    | 'cohesion' 
    | 'register' 
    | 'mechanics';
  label_de: string;
  label_en: string;
  score: number;
  max_score: number;
  feedback_th: string;
  subcategories?: {
    name: string;
    score: number;
    max_score: number;
  }[];
}

export interface CEFRProfile {
  task_fulfillment: ExtendedCEFR;
  content_development: ExtendedCEFR;
  vocabulary: ExtendedCEFR;
  grammar: ExtendedCEFR;
  cohesion: ExtendedCEFR;
  register: ExtendedCEFR;
  mechanics: ExtendedCEFR;
}

export interface WritingVersions {
  corrected: string;
  b2_improved: string;
  c1_model: string;
}

export interface LearningRecommendation {
  topic: string;
  priority: 'high' | 'medium' | 'low';
  reason_th: string;
  lesson_id?: string;
  action_th: string;
}

export interface RequirementEvaluation {
  requirement: string;
  status: 'fulfilled' | 'partial' | 'missing';
  evidence_quote?: string;
  comment_th: string;
}

export interface AssessmentResult {
  id: string;
  submission_id: string;
  task_id: string;
  task_title: string;
  task_level: CEFRLevel;
  task_category: TaskCategory;
  original_text: string;
  word_count: number;
  total_score: number; // 0 - 100
  grade: Grade;
  cefr_estimate: ExtendedCEFR;
  cefr_confidence: 'high' | 'medium' | 'low';
  cefr_summary_th: string;
  main_weakness_th: string;
  main_strength_th: string;
  individual_coaching_note_th?: string;
  requirement_evaluations?: RequirementEvaluation[];
  cefr_profile: CEFRProfile;
  category_scores: CategoryScoreItem[];
  errors: AssessmentError[];
  strengths: string[];
  weaknesses: string[];
  writing_versions: WritingVersions;
  learning_recommendations: LearningRecommendation[];
  rubric_version: string;
  engine?: 'ai' | 'linguistic_engine';
  model_name?: string;
  prompt_version?: string;
  quality?: {
    adjustments: string[];
    is_fallback?: boolean;
    evidence_score?: number;
  };
  created_at: string;
}

export interface SubmissionHistoryItem {
  id: string;
  task_id: string;
  task_title: string;
  cefr_level: CEFRLevel;
  category: TaskCategory;
  submitted_at: string;
  word_count: number;
  total_score: number;
  grade: Grade;
  cefr_estimate: ExtendedCEFR;
  original_text: string;
  assessment_id: string;
}

export interface GrammarLesson {
  id: string;
  title: string;
  german_title: string;
  topic: string;
  cefr_level: CEFRLevel;
  explanation_th: string;
  rules: string[];
  correct_examples: {
    german: string;
    thai: string;
    note?: string;
  }[];
  incorrect_examples: {
    german: string;
    thai: string;
    correction: string;
    why_wrong_th: string;
  }[];
  quiz: {
    question: string;
    options: string[];
    correctIndex: number;
    explanation_th: string;
  }[];
}

export interface VocabularyItem {
  id: string;
  word: string;
  article?: 'der' | 'die' | 'das';
  plural?: string;
  part_of_speech: 'Noun' | 'Verb' | 'Adjective' | 'Connector' | 'Adverb';
  meaning_th: string;
  example_sentence: string;
  example_translation_th: string;
  cefr_level: CEFRLevel;
  tags?: string[];
  created_at: string;
}

export interface UserProfile {
  id: string;
  name: string;
  email: string;
  target_level: CEFRLevel;
  preferred_feedback_language: 'th' | 'de' | 'en';
  created_at: string;
}
