import React, { useState, useEffect, useCallback } from 'react';
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
import { AdminPasscodeModal } from './components/AdminPasscodeModal';
import { AdminPanelView } from './components/AdminPanelView';
import { SAMPLE_TASKS } from './data/sampleTasks';
import { GRAMMAR_LESSONS } from './data/grammarLessons';
import { INITIAL_VOCABULARY } from './data/sampleVocabulary';
import { ENGLISH_EXAM_PROMPTS_POOL } from './data/englishExamPromptsPool';
import { ENGLISH_GRAMMAR_LESSONS } from './data/englishGrammarLessons';
import { ENGLISH_VOCABULARY } from './data/englishVocabulary';
import {
  AppLanguage,
  AssessmentMode,
  AssessmentResult,
  WritingSubmitOptions,
  WritingTask,
  VocabularyItem,
  GrammarLesson,
} from './types';
import {
  auth,
  onAuthStateChanged,
  FirebaseUser,
  AppUser,
  getLocalUser,
  logOut,
  syncUserProfile,
  resolvePublicUserId,
  isAdminSessionVerified,
  getAdminSessionToken,
  verifyAdminPasscode,
  fetchUserEntitlement,
  adminListEntitlements,
  adminSetUserEnglishAccess,
  adminUpdatePasscode,
  saveUserSubmission,
  getUserSubmissions,
  deleteUserSubmission,
  saveUserVocabulary,
  getUserVocabulary,
  deleteUserVocabulary,
} from './lib/firebase';
import { removeSubmissionFromState } from './utils/submission-helpers';
import { baseCefrFromExtended } from './utils/assessment-core';
import { ADMIN_EMAIL, isAdminEmail } from './utils/user-id';

export default function App() {
  const [activeTab, setActiveTab] = useState<string>('dashboard');
  const [activeLanguage, setActiveLanguage] = useState<AppLanguage>('de');

  const [germanTasks, setGermanTasks] = useState<WritingTask[]>(SAMPLE_TASKS);
  const [englishTasks, setEnglishTasks] = useState<WritingTask[]>(ENGLISH_EXAM_PROMPTS_POOL);
  const [selectedGermanTask, setSelectedGermanTask] = useState<WritingTask>(SAMPLE_TASKS[0]);
  const [selectedEnglishTask, setSelectedEnglishTask] = useState<WritingTask>(
    ENGLISH_EXAM_PROMPTS_POOL[0]
  );

  const [submissions, setSubmissions] = useState<AssessmentResult[]>([]);
  const [currentAssessment, setCurrentAssessment] = useState<AssessmentResult | null>(null);

  const [germanLessons, setGermanLessons] = useState<GrammarLesson[]>(GRAMMAR_LESSONS);
  const [englishLessons, setEnglishLessons] = useState<GrammarLesson[]>(ENGLISH_GRAMMAR_LESSONS);

  const [germanVocab, setGermanVocab] = useState<VocabularyItem[]>(INITIAL_VOCABULARY);
  const [englishVocab, setEnglishVocab] = useState<VocabularyItem[]>(ENGLISH_VOCABULARY);

  const [activeLessonId, setActiveLessonId] = useState<string | null>(null);
  const [editorMode, setEditorMode] = useState<AssessmentMode>('exam');
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  // Authentication & Immutable ID & Admin Gate & Feature Entitlement States
  const [user, setUser] = useState<FirebaseUser | AppUser | null>(() => getLocalUser());
  const [authLoading, setAuthLoading] = useState<boolean>(true);
  const [showAuthModal, setShowAuthModal] = useState<boolean>(false);
  const [syncNotice, setSyncNotice] = useState<string | null>(null);

  const [adminPasscodeVerified, setAdminPasscodeVerified] = useState<boolean>(() => {
    const u = getLocalUser();
    return Boolean(u && isAdminEmail(u.email) && isAdminSessionVerified(u));
  });
  const [englishWritingEnabled, setEnglishWritingEnabled] = useState<boolean>(false);
  const [syncedPublicId, setSyncedPublicId] = useState<string>('');

  const publicId = user ? syncedPublicId || resolvePublicUserId(user) : '';
  const isAdminUser = Boolean(user && isAdminEmail(user.email));
  const isVerifiedAdmin = isAdminUser && adminPasscodeVerified;

  const tasks = activeLanguage === 'en' ? englishTasks : germanTasks;
  const selectedTask = activeLanguage === 'en' ? selectedEnglishTask : selectedGermanTask;
  const lessons = activeLanguage === 'en' ? englishLessons : germanLessons;
  const vocabulary = activeLanguage === 'en' ? englishVocab : germanVocab;

  const setSelectedTask = (task: WritingTask) => {
    if (activeLanguage === 'en') {
      setSelectedEnglishTask(task);
    } else {
      setSelectedGermanTask(task);
    }
  };

  // Helper to load user-specific submissions, vocabulary, and English access entitlement
  const loadUserData = useCallback(async (activeUser: FirebaseUser | AppUser) => {
    try {
      const resolvedId = await syncUserProfile(activeUser);
      setSyncedPublicId(resolvedId);
      setAdminPasscodeVerified(
        isAdminEmail(activeUser.email) && isAdminSessionVerified(activeUser)
      );

      const [userSubs, userVocab, entitlement] = await Promise.allSettled([
        getUserSubmissions(activeUser.uid),
        getUserVocabulary(activeUser.uid),
        resolvedId ? fetchUserEntitlement(resolvedId) : Promise.resolve(null),
      ]);

      if (entitlement.status === 'fulfilled') {
        const enabled = Boolean(entitlement.value?.english_writing_enabled);
        setEnglishWritingEnabled(enabled);
        if (!enabled) {
          setActiveLanguage('de');
        }
      }

      if (userSubs.status === 'fulfilled') {
        const fetchedSubs = userSubs.value || [];
        setSubmissions(fetchedSubs);
        if (fetchedSubs.length > 0) {
          setCurrentAssessment(fetchedSubs[0]);
        } else {
          setCurrentAssessment(null);
        }
      }

      if (userVocab.status === 'fulfilled') {
        const mappedDe: VocabularyItem[] = [];
        const mappedEn: VocabularyItem[] = [];
        (userVocab.value || []).forEach((v) => {
          const item: VocabularyItem = {
            id: v.id,
            language: v.language === 'en' ? 'en' : 'de',
            word: v.word,
            part_of_speech: (v.part_of_speech as any) || 'Noun',
            article: (v.article as any) || undefined,
            meaning_th: v.meaning_th,
            example_sentence: v.example_sentence || '',
            example_translation_th: v.example_translation_th || '',
            cefr_level: (v.cefr_level as any) || 'B2',
            created_at: v.created_at,
          };
          if (item.language === 'en') {
            mappedEn.push(item);
          } else {
            mappedDe.push(item);
          }
        });

        const baseDeIds = new Set(INITIAL_VOCABULARY.map((i) => i.id));
        const baseEnIds = new Set(ENGLISH_VOCABULARY.map((i) => i.id));
        setGermanVocab([...mappedDe.filter((v) => !baseDeIds.has(v.id)), ...INITIAL_VOCABULARY]);
        setEnglishVocab([...mappedEn.filter((v) => !baseEnIds.has(v.id)), ...ENGLISH_VOCABULARY]);
      }
    } catch (err) {
      console.warn('Error loading user data:', err);
    }
  }, []);

  // Listen to Firebase Auth state or local user profile
  useEffect(() => {
    const local = getLocalUser();
    if (local) {
      setUser(local);
      void loadUserData(local);
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
          setSyncedPublicId('');
          setSubmissions([]);
          setCurrentAssessment(null);
          setGermanVocab(INITIAL_VOCABULARY);
          setEnglishVocab(ENGLISH_VOCABULARY);
          setAdminPasscodeVerified(false);
          setEnglishWritingEnabled(false);
          setActiveLanguage('de');
        }
      }
    });

    return () => unsubscribe();
  }, [loadUserData]);

  // Load initial static resources for both DE and EN
  useEffect(() => {
    async function loadResources() {
      try {
        const [deTasksRes, enTasksRes, deLessonsRes, enLessonsRes] = await Promise.allSettled([
          fetch('/api/tasks?language=de').then((r) => r.json()),
          fetch('/api/tasks?language=en').then((r) => r.json()),
          fetch('/api/lessons?language=de').then((r) => r.json()),
          fetch('/api/lessons?language=en').then((r) => r.json()),
        ]);

        if (deTasksRes.status === 'fulfilled' && deTasksRes.value?.tasks?.length > 0) {
          setGermanTasks(deTasksRes.value.tasks);
          const randomIdx = Math.floor(Math.random() * deTasksRes.value.tasks.length);
          setSelectedGermanTask(deTasksRes.value.tasks[randomIdx]);
        }

        if (enTasksRes.status === 'fulfilled' && enTasksRes.value?.tasks?.length > 0) {
          setEnglishTasks(enTasksRes.value.tasks);
          const randomIdx = Math.floor(Math.random() * enTasksRes.value.tasks.length);
          setSelectedEnglishTask(enTasksRes.value.tasks[randomIdx]);
        }

        if (deLessonsRes.status === 'fulfilled' && deLessonsRes.value?.lessons) {
          setGermanLessons(deLessonsRes.value.lessons);
        }

        if (enLessonsRes.status === 'fulfilled' && enLessonsRes.value?.lessons) {
          setEnglishLessons(enLessonsRes.value.lessons);
        }
      } catch (err) {
        console.warn('Error loading static resources:', err);
      }
    }

    void loadResources();
  }, []);

  const handleChangeLanguage = (lang: AppLanguage) => {
    if (lang === 'en' && !englishWritingEnabled) return;
    setActiveLanguage(lang);
    setActiveLessonId(null);
    if (activeTab === 'admin') {
      setActiveTab('editor');
    }
  };

  const handleRollRandomTask = (levelFilter?: string) => {
    const activePool = activeLanguage === 'en' ? englishTasks : germanTasks;
    let pool = [...activePool];
    if (levelFilter && levelFilter !== 'ALL') {
      pool = pool.filter((t) => t.cefr_level === levelFilter);
    }
    if (pool.length === 0) pool = [...activePool];
    const randomIndex = Math.floor(Math.random() * pool.length);
    setSelectedTask(pool[randomIndex]);
  };

  const handleStartWriting = (
    task?: WritingTask,
    levelFilter?: string,
    mode: AssessmentMode = 'exam'
  ) => {
    setEditorMode(mode);
    if (task) {
      if (task.language === 'en' && englishWritingEnabled) {
        setActiveLanguage('en');
        setSelectedEnglishTask(task);
      } else {
        setSelectedTask(task);
      }
    } else if (mode === 'exam') {
      handleRollRandomTask(levelFilter);
    }
    setActiveTab('editor');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleSubmitWriting = async (
    task: WritingTask,
    text: string,
    options?: WritingSubmitOptions
  ) => {
    setIsSubmitting(true);
    try {
      const mode = options?.mode || 'exam';
      const lang: AppLanguage = options?.language || activeLanguage;
      const payload: Record<string, any> = {
        mode,
        language: lang,
        task_id: mode === 'exam' ? task.id : 'free-writing',
        original_text: text,
      };
      if (options?.customPrompt) payload.custom_prompt = options.customPrompt;
      if (options?.targetLevel) payload.target_level = options.targetLevel;
      if (options?.taskCategory) payload.task_category = options.taskCategory;
      if (options?.attachedImage) {
        payload.attached_image = {
          name: options.attachedImage.name,
          mimeType: options.attachedImage.mimeType,
          data: options.attachedImage.data,
        };
      }

      const res = await fetch('/api/assess', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const rawText = await res.text();
      let data: any = {};
      try {
        data = rawText ? JSON.parse(rawText) : {};
      } catch {
        data = {};
      }

      if (!res.ok) {
        let fallbackMsg = 'การประเมินผลไม่สำเร็จ กรุณาลองใหม่อีกครั้ง';
        if (res.status === 413) {
          fallbackMsg = 'ไฟล์รูปภาพมีขนาดใหญ่เกินกำหนด กรุณาลดขนาดไฟล์รูปแล้วลองใหม่อีกครั้ง';
        } else if (res.status === 504 || res.status === 502) {
          fallbackMsg = 'การเชื่อมต่อเซิร์ฟเวอร์ AI ใช้เวลานานเกินกำหนด กรุณากดลองส่งตรวจอีกครั้ง';
        } else if (res.status >= 500) {
          fallbackMsg = `เซิร์ฟเวอร์ AI ขัดข้องชั่วคราว (${res.status}) กรุณากดลองส่งตรวจอีกครั้ง`;
        }
        const msg = (typeof data?.error === 'string' && data.error.trim()) ? data.error : fallbackMsg;
        throw new Error(msg);
      }

      if (data.assessment) {
        const newResult: AssessmentResult = data.assessment;

        if (user) {
          try {
            await saveUserSubmission(user.uid, newResult);
            setSyncNotice('บันทึกผลการประเมินลงในบัญชีของคุณเรียบร้อยแล้ว');
            setTimeout(() => setSyncNotice(null), 4000);
          } catch (fireErr) {
            console.error('Failed to save submission to Firestore:', fireErr);
          }
        } else {
          setSyncNotice('ผลการตรวจพร้อมแล้ว! เข้าสู่ระบบเพื่อบันทึกประวัติถาวร');
          setTimeout(() => setSyncNotice(null), 6000);
        }

        setCurrentAssessment(newResult);
        setSubmissions((prev) => [newResult, ...prev]);
        setActiveTab('assessment');
        window.scrollTo({ top: 0, behavior: 'smooth' });
      } else {
        throw new Error('ไม่ได้รับข้อมูลผลการประเมินจากเซิร์ฟเวอร์ กรุณาลองใหม่อีกครั้ง');
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
    if (lessonId.startsWith('en-lesson-') && englishWritingEnabled) {
      setActiveLanguage('en');
    } else if (!lessonId.startsWith('en-lesson-') && activeLanguage === 'en') {
      setActiveLanguage('de');
    }
    setActiveLessonId(lessonId);
    setActiveTab('learning');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleSaveToVocabulary = async (word: string, meaning: string, example: string) => {
    const lang: AppLanguage =
      activeTab === 'assessment' && currentAssessment?.language
        ? currentAssessment.language
        : activeLanguage;

    const derivedCefr =
      activeTab === 'assessment' && currentAssessment
        ? currentAssessment.cefr_estimate
          ? baseCefrFromExtended(currentAssessment.cefr_estimate)
          : currentAssessment.task_level !== 'UNSPECIFIED'
          ? currentAssessment.task_level
          : 'B1'
        : selectedTask.cefr_level;

    const newItem: VocabularyItem = {
      id: `vocab-${Date.now()}`,
      language: lang,
      word,
      meaning_th: meaning,
      example_sentence: example,
      example_translation_th: '',
      cefr_level: derivedCefr,
      created_at: new Date().toISOString(),
      part_of_speech: 'Noun',
    };

    if (lang === 'en') {
      setEnglishVocab((prev) => [newItem, ...prev]);
    } else {
      setGermanVocab((prev) => [newItem, ...prev]);
    }

    if (user) {
      try {
        await saveUserVocabulary(user.uid, {
          id: newItem.id,
          userId: user.uid,
          language: lang,
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
    setGermanVocab((prev) => prev.filter((v) => v.id !== id));
    setEnglishVocab((prev) => prev.filter((v) => v.id !== id));
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
      setSyncedPublicId('');
      setSubmissions([]);
      setCurrentAssessment(null);
      setGermanVocab(INITIAL_VOCABULARY);
      setEnglishVocab(ENGLISH_VOCABULARY);
      setAdminPasscodeVerified(false);
      setEnglishWritingEnabled(false);
      setActiveLanguage('de');
      setActiveTab('dashboard');
    } catch (err) {
      console.error('Sign out error:', err);
    }
  };

  const handleVerifyAdminPasscode = async (passcode: string) => {
    if (!user) return { verified: false, error: 'ไม่พบบัญชีผู้ใช้' };
    const result = await verifyAdminPasscode(user, passcode);
    if (result.verified) {
      setAdminPasscodeVerified(true);
      await loadUserData(user);
    }
    return result;
  };

  const handleAuthSuccess = async () => {
    const local = getLocalUser();
    const active = local || auth.currentUser;
    if (active) {
      setUser(active);
      await loadUserData(active);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#f8fafc] text-slate-900 font-sans selection:bg-blue-100 selection:text-blue-900">
      {/* Top Navigation with Auth Profile, Immutable ID & Admin/EN Toggles */}
      <Navbar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        onNewWriting={() => handleStartWriting()}
        submissionCount={submissions.length}
        user={user}
        publicId={publicId}
        isVerifiedAdmin={isVerifiedAdmin}
        hasEnglishAccess={englishWritingEnabled}
        activeLanguage={activeLanguage}
        onChangeLanguage={handleChangeLanguage}
        onOpenAdminPanel={() => {
          if (isVerifiedAdmin) {
            setActiveTab('admin');
            window.scrollTo({ top: 0, behavior: 'smooth' });
          }
        }}
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
            activeLanguage={activeLanguage}
            onStartWriting={handleStartWriting}
            onOpenRubric={() => setActiveTab('rubric')}
          />
        )}

        {activeTab === 'dashboard' && (
          <DashboardView
            submissions={submissions}
            activeLanguage={activeLanguage}
            tasks={tasks}
            onStartWriting={handleStartWriting}
            onStartFreeWriting={() => handleStartWriting(undefined, undefined, 'free')}
            onViewAssessment={handleViewAssessment}
            onOpenLesson={handleOpenLesson}
            onDeleteSubmission={handleDeleteSubmission}
          />
        )}

        {activeTab === 'editor' && (
          <EditorView
            tasks={tasks}
            selectedTask={selectedTask}
            activeLanguage={activeLanguage}
            initialMode={editorMode}
            onModeChange={setEditorMode}
            onSelectTask={setSelectedTask}
            onRollRandomTask={handleRollRandomTask}
            onSubmit={handleSubmitWriting}
            isSubmitting={isSubmitting}
          />
        )}

        {activeTab === 'assessment' &&
          (currentAssessment ? (
            <AssessmentResultView
              assessment={currentAssessment}
              onOpenLesson={handleOpenLesson}
              onSaveToVocabulary={handleSaveToVocabulary}
              onStartNewWriting={() => handleStartWriting()}
            />
          ) : (
            <DashboardView
              submissions={submissions}
              activeLanguage={activeLanguage}
              tasks={tasks}
              onStartWriting={handleStartWriting}
              onStartFreeWriting={() => handleStartWriting(undefined, undefined, 'free')}
              onViewAssessment={handleViewAssessment}
              onOpenLesson={handleOpenLesson}
              onDeleteSubmission={handleDeleteSubmission}
            />
          ))}

        {activeTab === 'learning' && (
          <LearningCenterView
            lessons={lessons}
            activeLanguage={activeLanguage}
            activeLessonId={activeLessonId}
            onStartWriting={(lvl) => handleStartWriting(undefined, lvl)}
          />
        )}

        {activeTab === 'vocabulary' && (
          <VocabularyBankView
            vocabulary={vocabulary}
            activeLanguage={activeLanguage}
            onAddWord={(newItem) => {
              const fullItem: VocabularyItem = {
                ...newItem,
                language: activeLanguage,
                id: `vocab-${Date.now()}`,
                created_at: new Date().toISOString(),
              };
              if (activeLanguage === 'en') {
                setEnglishVocab((prev) => [fullItem, ...prev]);
              } else {
                setGermanVocab((prev) => [fullItem, ...prev]);
              }
              if (user) {
                saveUserVocabulary(user.uid, {
                  id: fullItem.id,
                  userId: user.uid,
                  language: activeLanguage,
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
            hasEnglishAccess={englishWritingEnabled}
            onViewAssessment={handleViewAssessment}
            onStartNewWriting={() => handleStartWriting()}
            onDeleteSubmission={handleDeleteSubmission}
          />
        )}

        {activeTab === 'rubric' && <RubricView activeLanguage={activeLanguage} />}

        {activeTab === 'admin' &&
          (isVerifiedAdmin && user ? (
            <AdminPanelView
              adminEmail={user.email || ADMIN_EMAIL}
              adminPublicId={publicId}
              onLoadEntitlements={async () => {
                const token = getAdminSessionToken(user);
                if (!token) {
                  return { entitlements: [], directory: [] };
                }
                return await adminListEntitlements(token);
              }}
              onSetUserEnglishAccess={async (targetPublicId, enabled, note) => {
                const token = getAdminSessionToken(user);
                if (!token) {
                  throw new Error('กรุณายืนยันรหัสผ่านแอดมินอีกครั้ง');
                }
                const ent = await adminSetUserEnglishAccess(
                  token,
                  user.email || ADMIN_EMAIL,
                  targetPublicId,
                  enabled,
                  note
                );
                if (ent.publicId === publicId) {
                  setEnglishWritingEnabled(ent.english_writing_enabled);
                  if (!ent.english_writing_enabled) {
                    setActiveLanguage('de');
                  }
                }
                return ent;
              }}
              onUpdatePasscode={async (newPasscode) => {
                const token = getAdminSessionToken(user);
                if (!token) {
                  throw new Error('กรุณายืนยันรหัสผ่านแอดมินอีกครั้ง');
                }
                await adminUpdatePasscode(token, newPasscode);
              }}
              onSwitchToEnglishMode={() => {
                setEnglishWritingEnabled(true);
                setActiveLanguage('en');
                setActiveTab('editor');
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }}
            />
          ) : (
            <DashboardView
              submissions={submissions}
              activeLanguage={activeLanguage}
              tasks={tasks}
              onStartWriting={handleStartWriting}
              onStartFreeWriting={() => handleStartWriting(undefined, undefined, 'free')}
              onViewAssessment={handleViewAssessment}
              onOpenLesson={handleOpenLesson}
              onDeleteSubmission={handleDeleteSubmission}
            />
          ))}

        {activeTab === 'auth' && (
          <AuthView
            onSuccess={async () => {
              await handleAuthSuccess();
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
            await handleAuthSuccess();
            setShowAuthModal(false);
          }}
          onCancel={() => {
            setShowAuthModal(false);
          }}
        />
      )}

      {/* Blocking Admin Passcode Verification Gate for florian25500@gmail.com */}
      {user && isAdminUser && !adminPasscodeVerified && (
        <AdminPasscodeModal
          adminEmail={user.email || ADMIN_EMAIL}
          onVerifyPasscode={handleVerifyAdminPasscode}
          onSignOut={handleSignOut}
        />
      )}

      {/* Academic Footer */}
      <Footer />
    </div>
  );
}
