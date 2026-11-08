import React, { useState, useEffect } from 'react';
import { Navbar } from './components/Navbar';
import { Footer } from './components/Footer';
import { LandingView } from './components/LandingView';
import { DashboardView } from './components/DashboardView';
import { EditorView } from './components/EditorView';
import { AssessmentResultView } from './components/AssessmentResultView';
import { LearningCenterView } from './components/LearningCenterView';
import { VocabularyBankView } from './components/VocabularyBankView';
import { HistoryView } from './components/HistoryView';
import { RubricView } from './components/RubricView';
import { SAMPLE_TASKS } from './data/sampleTasks';
import { GRAMMAR_LESSONS } from './data/grammarLessons';
import { INITIAL_VOCABULARY } from './data/sampleVocabulary';
import { AssessmentResult, WritingTask, VocabularyItem, GrammarLesson } from './types';

export default function App() {
  const [activeTab, setActiveTab] = useState<string>('dashboard');
  const [tasks, setTasks] = useState<WritingTask[]>(SAMPLE_TASKS);
  const [selectedTask, setSelectedTask] = useState<WritingTask>(SAMPLE_TASKS[0]);
  const [submissions, setSubmissions] = useState<AssessmentResult[]>([]);
  const [currentAssessment, setCurrentAssessment] = useState<AssessmentResult | null>(null);
  const [lessons, setLessons] = useState<GrammarLesson[]>(GRAMMAR_LESSONS);
  const [vocabulary, setVocabulary] = useState<VocabularyItem[]>(INITIAL_VOCABULARY);
  const [activeLessonId, setActiveLessonId] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  // Load initial backend data
  useEffect(() => {
    async function loadData() {
      try {
        const [tasksRes, historyRes, lessonsRes, vocabRes] = await Promise.allSettled([
          fetch('/api/tasks').then((r) => r.json()),
          fetch('/api/history').then((r) => r.json()),
          fetch('/api/lessons').then((r) => r.json()),
          fetch('/api/vocabulary').then((r) => r.json()),
        ]);

        if (tasksRes.status === 'fulfilled' && tasksRes.value?.tasks) {
          setTasks(tasksRes.value.tasks);
          setSelectedTask(tasksRes.value.tasks[0]);
        }

        if (lessonsRes.status === 'fulfilled' && lessonsRes.value?.lessons) {
          setLessons(lessonsRes.value.lessons);
        }

        if (vocabRes.status === 'fulfilled' && vocabRes.value?.vocabulary) {
          setVocabulary(vocabRes.value.vocabulary);
        }

        if (historyRes.status === 'fulfilled' && historyRes.value?.submissions?.length > 0) {
          setSubmissions(historyRes.value.submissions);
          setCurrentAssessment(historyRes.value.submissions[0]);
        } else {
          // Trigger a seed assessment so that Assessment Results & Dashboard have realistic initial data
          triggerSeedAssessment();
        }
      } catch (err) {
        console.warn('Error loading backend data:', err);
      }
    }

    loadData();
  }, []);

  // Seed default demonstration assessment
  const triggerSeedAssessment = async () => {
    try {
      const res = await fetch('/api/assess', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          task_id: SAMPLE_TASKS[0].id,
          original_text: SAMPLE_TASKS[0].preset_draft,
        }),
      });
      const data = await res.json();
      if (data.assessment) {
        setSubmissions([data.assessment]);
        setCurrentAssessment(data.assessment);
      }
    } catch (e) {
      console.warn('Seed assessment fallback:', e);
    }
  };

  const handleStartWriting = (task?: WritingTask) => {
    if (task) {
      setSelectedTask(task);
    }
    setActiveTab('editor');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleSubmitWriting = async (task: WritingTask, text: string) => {
    setIsSubmitting(true);
    try {
      const res = await fetch('/api/assess', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          task_id: task.id,
          original_text: text,
        }),
      });

      if (!res.ok) {
        throw new Error('Assessment failed');
      }

      const data = await res.json();
      if (data.assessment) {
        setCurrentAssessment(data.assessment);
        setSubmissions((prev) => [data.assessment, ...prev]);
        setActiveTab('assessment');
        window.scrollTo({ top: 0, behavior: 'smooth' });
      }
    } catch (error) {
      console.error('Submission error:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleViewAssessment = (result: AssessmentResult) => {
    setCurrentAssessment(result);
    setActiveTab('assessment');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleOpenLesson = (lessonId: string) => {
    setActiveLessonId(lessonId);
    setActiveTab('learning');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleSaveToVocabulary = async (word: string, meaning: string, example: string) => {
    try {
      const res = await fetch('/api/vocabulary', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          word,
          meaning_th: meaning,
          example_sentence: example,
          cefr_level: selectedTask.cefr_level,
        }),
      });
      const data = await res.json();
      if (data.item) {
        setVocabulary((prev) => [data.item, ...prev]);
      }
    } catch (e) {
      console.warn('Save vocabulary error:', e);
    }
  };

  const handleDeleteVocabulary = async (id: string) => {
    try {
      await fetch(`/api/vocabulary/${id}`, { method: 'DELETE' });
      setVocabulary((prev) => prev.filter((v) => v.id !== id));
    } catch (e) {
      console.warn('Delete vocabulary error:', e);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 font-sans selection:bg-blue-500 selection:text-white">
      {/* Top Navigation */}
      <Navbar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        onNewWriting={() => handleStartWriting()}
        submissionCount={submissions.length}
      />

      {/* Main Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8">
        {activeTab === 'landing' && (
          <LandingView
            tasks={tasks}
            onStartWriting={handleStartWriting}
            onOpenRubric={() => setActiveTab('rubric')}
          />
        )}

        {activeTab === 'dashboard' && (
          <DashboardView
            submissions={submissions}
            tasks={tasks}
            onStartWriting={handleStartWriting}
            onViewAssessment={handleViewAssessment}
            onOpenLesson={handleOpenLesson}
          />
        )}

        {activeTab === 'editor' && (
          <EditorView
            tasks={tasks}
            selectedTask={selectedTask}
            onSelectTask={setSelectedTask}
            onSubmit={handleSubmitWriting}
            isSubmitting={isSubmitting}
          />
        )}

        {activeTab === 'assessment' && currentAssessment && (
          <AssessmentResultView
            assessment={currentAssessment}
            onOpenLesson={handleOpenLesson}
            onSaveToVocabulary={handleSaveToVocabulary}
            onStartNewWriting={() => handleStartWriting()}
          />
        )}

        {activeTab === 'learning' && (
          <LearningCenterView
            lessons={lessons}
            activeLessonId={activeLessonId}
          />
        )}

        {activeTab === 'vocabulary' && (
          <VocabularyBankView
            vocabulary={vocabulary}
            onAddWord={(newItem) => {
              const fullItem: VocabularyItem = {
                ...newItem,
                id: `vocab-${Date.now()}`,
                created_at: new Date().toISOString(),
              };
              setVocabulary((prev) => [fullItem, ...prev]);
            }}
            onDeleteWord={handleDeleteVocabulary}
          />
        )}

        {activeTab === 'history' && (
          <HistoryView
            submissions={submissions}
            onViewAssessment={handleViewAssessment}
            onStartNewWriting={() => handleStartWriting()}
          />
        )}

        {activeTab === 'rubric' && <RubricView />}
      </main>

      {/* Academic Footer */}
      <Footer />
    </div>
  );
}
