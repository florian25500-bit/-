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
import { AuthView } from './components/AuthView';
import { SAMPLE_TASKS } from './data/sampleTasks';
import { GRAMMAR_LESSONS } from './data/grammarLessons';
import { INITIAL_VOCABULARY } from './data/sampleVocabulary';
import { AssessmentResult, WritingTask, VocabularyItem, GrammarLesson } from './types';
import {
  auth,
  onAuthStateChanged,
  FirebaseUser,
  AppUser,
  getLocalUser,
  logOut,
  saveUserSubmission,
  getUserSubmissions,
  deleteUserSubmission,
  saveUserVocabulary,
  getUserVocabulary,
  deleteUserVocabulary,
} from './lib/firebase';
import { removeSubmissionFromState } from './utils/submission-helpers';

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

  // Authentication states (supports both Firebase Auth and Instant Local Profiles)
  const [user, setUser] = useState<FirebaseUser | AppUser | null>(() => getLocalUser());
  const [authLoading, setAuthLoading] = useState<boolean>(true);
  const [showAuthModal, setShowAuthModal] = useState<boolean>(false);
  const [syncNotice, setSyncNotice] = useState<string | null>(null);

  // Helper to load user-specific data
  const loadUserData = async (activeUser: FirebaseUser | AppUser) => {
    try {
      const [userSubs, userVocab] = await Promise.allSettled([
        getUserSubmissions(activeUser.uid),
        getUserVocabulary(activeUser.uid),
      ]);

      if (userSubs.status === 'fulfilled') {
        const fetchedSubs = userSubs.value || [];
        setSubmissions(fetchedSubs);
        if (fetchedSubs.length > 0) {
          setCurrentAssessment(fetchedSubs[0]);
        } else {
          setCurrentAssessment(null);
        }
      }

      if (userVocab.status === 'fulfilled' && userVocab.value?.length > 0) {
        const mappedVocab: VocabularyItem[] = userVocab.value.map((v) => ({
          id: v.id,
          word: v.word,
          part_of_speech: (v.part_of_speech as any) || 'Noun',
          article: (v.article as any) || undefined,
          meaning_th: v.meaning_th,
          example_sentence: v.example_sentence || '',
          example_translation_th: v.example_translation_th || '',
          cefr_level: (v.cefr_level as any) || 'B2',
          created_at: v.created_at,
        }));
        setVocabulary((prev) => {
          const ids = new Set(prev.map((i) => i.id));
          const newItems = mappedVocab.filter((v) => !ids.has(v.id));
          return [...newItems, ...prev];
        });
      }
    } catch (err) {
      console.warn('Error loading user data:', err);
    }
  };

  // Listen to Firebase Auth state or local user profile
  useEffect(() => {
    // If local user is already found on mount, load data immediately
    const local = getLocalUser();
    if (local) {
      setUser(local);
      loadUserData(local);
    }

    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      setAuthLoading(false);

      if (currentUser) {
        setUser(currentUser);
        await loadUserData(currentUser);
      } else {
        const activeLocal = getLocalUser();
        if (activeLocal) {
          setUser(activeLocal);
          await loadUserData(activeLocal);
        } else {
          setUser(null);
          setSubmissions([]);
          setCurrentAssessment(null);
        }
      }
    });

    return () => unsubscribe();
  }, []);

  // Load initial static resources (tasks, lessons)
  useEffect(() => {
    async function loadResources() {
      try {
        const [tasksRes, lessonsRes] = await Promise.allSettled([
          fetch('/api/tasks').then((r) => r.json()),
          fetch('/api/lessons').then((r) => r.json()),
        ]);

        if (tasksRes.status === 'fulfilled' && tasksRes.value?.tasks?.length > 0) {
          setTasks(tasksRes.value.tasks);
          const randomIdx = Math.floor(Math.random() * tasksRes.value.tasks.length);
          setSelectedTask(tasksRes.value.tasks[randomIdx]);
        }

        if (lessonsRes.status === 'fulfilled' && lessonsRes.value?.lessons) {
          setLessons(lessonsRes.value.lessons);
        }
      } catch (err) {
        console.warn('Error loading static resources:', err);
      }
    }

    loadResources();
  }, []);

  const handleRollRandomTask = (levelFilter?: string) => {
    let pool = [...tasks];
    if (levelFilter && levelFilter !== 'ALL') {
      pool = pool.filter((t) => t.cefr_level === levelFilter);
    }
    if (pool.length === 0) pool = [...tasks];
    const randomIndex = Math.floor(Math.random() * pool.length);
    setSelectedTask(pool[randomIndex]);
  };

  const handleStartWriting = (task?: WritingTask, levelFilter?: string) => {
    if (task) {
      setSelectedTask(task);
    } else {
      handleRollRandomTask(levelFilter);
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
        const errData = await res.json().catch(() => ({}));
        const msg = errData.error || 'การประเมินผลไม่สำเร็จ กรุณาลองใหม่อีกครั้ง';
        throw new Error(msg);
      }

      const data = await res.json();
      if (data.assessment) {
        const newResult: AssessmentResult = data.assessment;

        // Persist to Firestore if user is authenticated
        if (user) {
          try {
            await saveUserSubmission(user.uid, newResult);
            setSyncNotice('บันทึกผลการประเมินลงในบัญชีของคุณเรียบร้อยแล้ว');
            setTimeout(() => setSyncNotice(null), 4000);
          } catch (fireErr) {
            console.error('Failed to save submission to Firestore:', fireErr);
          }
        } else {
          // If guest or not signed in, show subtle prompt
          setSyncNotice('ผลการตรวจพร้อมแล้ว! เข้าสู่ระบบเพื่อบันทึกประวัติถาวร');
          setTimeout(() => setSyncNotice(null), 6000);
        }

        setCurrentAssessment(newResult);
        setSubmissions((prev) => [newResult, ...prev]);
        setActiveTab('assessment');
        window.scrollTo({ top: 0, behavior: 'smooth' });
      }
    } catch (error: any) {
      console.error('Submission error:', error);
      throw error;
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
    const newItem: VocabularyItem = {
      id: `vocab-${Date.now()}`,
      word,
      meaning_th: meaning,
      example_sentence: example,
      example_translation_th: '',
      cefr_level: selectedTask.cefr_level,
      created_at: new Date().toISOString(),
      part_of_speech: 'Noun',
    };

    setVocabulary((prev) => [newItem, ...prev]);

    if (user) {
      try {
        await saveUserVocabulary(user.uid, {
          id: newItem.id,
          userId: user.uid,
          word: newItem.word,
          meaning_th: newItem.meaning_th,
          part_of_speech: newItem.part_of_speech,
          example_sentence: newItem.example_sentence,
          cefr_level: newItem.cefr_level,
          created_at: newItem.created_at,
        });
      } catch (err) {
        console.warn('Failed to save vocabulary to Firestore:', err);
      }
    }
  };

  const handleDeleteVocabulary = async (id: string) => {
    setVocabulary((prev) => prev.filter((v) => v.id !== id));
    if (user) {
      try {
        await deleteUserVocabulary(user.uid, id);
      } catch (err) {
        console.warn('Failed to delete vocabulary in Firestore:', err);
      }
    }
  };

  const handleDeleteSubmission = async (id: string) => {
    if (user) {
      try {
        await deleteUserSubmission(user.uid, id);
      } catch (err) {
        console.error('Failed to delete submission:', err);
        setSyncNotice('ไม่สามารถลบประวัติงานเขียนจากคลาวด์ได้ กรุณาลองใหม่อีกครั้ง');
        setTimeout(() => setSyncNotice(null), 5000);
        return;
      }
    }

    const { nextSubmissions, nextCurrentAssessment, removed } = removeSubmissionFromState(
      submissions,
      currentAssessment?.id ?? null,
      id
    );

    if (!removed) return;

    setSubmissions(nextSubmissions);
    setCurrentAssessment(nextCurrentAssessment);
    if (activeTab === 'assessment' && !nextCurrentAssessment) {
      setActiveTab('history');
    }

    setSyncNotice('ลบประวัติงานเขียนเรียบร้อยแล้ว');
    setTimeout(() => setSyncNotice(null), 3500);
  };

  const handleSignOut = async () => {
    try {
      await logOut();
      setUser(null);
      setSubmissions([]);
      setCurrentAssessment(null);
      setActiveTab('dashboard');
    } catch (err) {
      console.error('Sign out error:', err);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#f8fafc] text-slate-900 font-sans selection:bg-blue-100 selection:text-blue-900">
      {/* Top Navigation with Auth Profile */}
      <Navbar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        onNewWriting={() => handleStartWriting()}
        submissionCount={submissions.length}
        user={user}
        onOpenAuth={() => setShowAuthModal(true)}
        onSignOut={handleSignOut}
      />

      {/* Sync/Status notification banner */}
      {syncNotice && (
        <div className="bg-blue-600 text-white text-xs font-semibold px-4 py-2.5 text-center flex items-center justify-center gap-2 shadow-xs transition-all animate-in slide-in-from-top duration-200">
          <span>{syncNotice}</span>
          {!user && (
            <button
              onClick={() => setShowAuthModal(true)}
              className="underline hover:text-blue-100 font-bold ml-2 cursor-pointer"
            >
              เข้าสู่ระบบเลย
            </button>
          )}
        </div>
      )}

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
            onDeleteSubmission={handleDeleteSubmission}
          />
        )}

        {activeTab === 'editor' && (
          <EditorView
            tasks={tasks}
            selectedTask={selectedTask}
            onSelectTask={setSelectedTask}
            onRollRandomTask={handleRollRandomTask}
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
            onStartWriting={(lvl) => handleStartWriting(undefined, lvl)}
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
              if (user) {
                saveUserVocabulary(user.uid, {
                  id: fullItem.id,
                  userId: user.uid,
                  word: fullItem.word,
                  meaning_th: fullItem.meaning_th,
                  part_of_speech: fullItem.part_of_speech,
                  article: fullItem.article,
                  example_sentence: fullItem.example_sentence,
                  example_translation_th: fullItem.example_translation_th,
                  cefr_level: fullItem.cefr_level,
                  created_at: fullItem.created_at,
                }).catch((e) => console.warn('Vocab save err:', e));
              }
            }}
            onDeleteWord={handleDeleteVocabulary}
          />
        )}

        {activeTab === 'history' && (
          <HistoryView
            submissions={submissions}
            onViewAssessment={handleViewAssessment}
            onStartNewWriting={() => handleStartWriting()}
            onDeleteSubmission={handleDeleteSubmission}
          />
        )}

        {activeTab === 'rubric' && <RubricView />}

        {activeTab === 'auth' && (
          <AuthView
            onSuccess={async () => {
              const local = getLocalUser();
              if (local) {
                setUser(local);
                await loadUserData(local);
              } else if (auth.currentUser) {
                setUser(auth.currentUser);
                await loadUserData(auth.currentUser);
              }
              setActiveTab('dashboard');
            }}
          />
        )}
      </main>

      {/* Auth Modal when triggered via Navbar or actions */}
      {showAuthModal && (
        <AuthView
          isModal={true}
          onSuccess={async () => {
            const local = getLocalUser();
            if (local) {
              setUser(local);
              await loadUserData(local);
            } else if (auth.currentUser) {
              setUser(auth.currentUser);
              await loadUserData(auth.currentUser);
            }
            setShowAuthModal(false);
          }}
          onCancel={() => {
            setShowAuthModal(false);
          }}
        />
      )}

      {/* Academic Footer */}
      <Footer />
    </div>
  );
}
