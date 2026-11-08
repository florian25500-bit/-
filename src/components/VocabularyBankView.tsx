import React, { useState } from 'react';
import {
  Bookmark,
  Search,
  Plus,
  BookOpen,
  Volume2,
  Trash2,
  Sparkles,
  Layers,
  ChevronLeft,
  ChevronRight,
  RotateCw,
} from 'lucide-react';
import { VocabularyItem, CEFRLevel } from '../types';

interface VocabularyBankViewProps {
  vocabulary: VocabularyItem[];
  onAddWord: (item: Omit<VocabularyItem, 'id' | 'created_at'>) => void;
  onDeleteWord: (id: string) => void;
}

export const VocabularyBankView: React.FC<VocabularyBankViewProps> = ({
  vocabulary,
  onAddWord,
  onDeleteWord,
}) => {
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [selectedLevel, setSelectedLevel] = useState<string>('ALL');
  const [showAddModal, setShowAddModal] = useState<boolean>(false);
  const [flashcardMode, setFlashcardMode] = useState<boolean>(false);
  const [cardIndex, setCardIndex] = useState<number>(0);
  const [isFlipped, setIsFlipped] = useState<boolean>(false);

  // New Word Form State
  const [newWord, setNewWord] = useState<string>('');
  const [newArticle, setNewArticle] = useState<'der' | 'die' | 'das' | ''>('');
  const [newPos, setNewPos] = useState<'Noun' | 'Verb' | 'Adjective' | 'Connector' | 'Adverb'>('Noun');
  const [newMeaning, setNewMeaning] = useState<string>('');
  const [newExample, setNewExample] = useState<string>('');
  const [newTranslation, setNewTranslation] = useState<string>('');
  const [newLevel, setNewLevel] = useState<CEFRLevel>('B2');

  const filtered = vocabulary.filter((item) => {
    const matchesLevel = selectedLevel === 'ALL' || item.cefr_level === selectedLevel;
    const matchesSearch =
      item.word.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.meaning_th.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.example_sentence.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesLevel && matchesSearch;
  });

  const handleCreateWord = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newWord || !newMeaning) return;

    onAddWord({
      word: newArticle ? `${newArticle} ${newWord}` : newWord,
      article: (newArticle || undefined) as any,
      part_of_speech: newPos,
      meaning_th: newMeaning,
      example_sentence: newExample,
      example_translation_th: newTranslation,
      cefr_level: newLevel,
      tags: ['Personal'],
    });

    setNewWord('');
    setNewArticle('');
    setNewMeaning('');
    setNewExample('');
    setNewTranslation('');
    setShowAddModal(false);
  };

  const currentFlashcard = filtered[cardIndex];

  return (
    <div className="space-y-6 py-4">
      {/* Header */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-blue-600 dark:text-blue-400">
              Wortschatz-Datenbank
            </span>
            <h1 className="text-2xl font-bold text-slate-900 dark:text-white mt-1">
              คลังคำศัพท์และสำนวนเยอรมัน (Vocabulary Bank)
            </h1>
            <p className="text-xs text-slate-500 mt-1">
              บันทึกคำศัพท์และสำนวนสำคัญที่ได้จากการตรวจงานเขียน เพื่อทบทวนและนำไปใช้ในงานเขียนครั้งต่อไป
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                setFlashcardMode(!flashcardMode);
                setCardIndex(0);
                setIsFlipped(false);
              }}
              className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
                flashcardMode
                  ? 'bg-amber-500 text-white shadow-xs'
                  : 'bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300'
              }`}
            >
              <Sparkles className="w-4 h-4" />
              <span>{flashcardMode ? 'ออกจากโหมดบัตรคำ' : 'โหมดบัตรคำ (Flashcards)'}</span>
            </button>

            <button
              onClick={() => setShowAddModal(true)}
              className="bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs px-4 py-2 rounded-xl shadow-sm transition-all flex items-center gap-1.5"
            >
              <Plus className="w-4 h-4" />
              <span>เพิ่มคำศัพท์ใหม่</span>
            </button>
          </div>
        </div>
      </div>

      {/* FLASHCARD MODE */}
      {flashcardMode && filtered.length > 0 && currentFlashcard && (
        <div className="bg-gradient-to-b from-slate-900 to-indigo-950 text-white rounded-3xl p-8 shadow-xl max-w-xl mx-auto space-y-6 text-center border border-slate-800">
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span>
              บัตรคำ {cardIndex + 1} จาก {filtered.length}
            </span>
            <span className="px-2 py-0.5 rounded font-bold bg-blue-500/20 text-blue-300 border border-blue-500/30">
              Niveau {currentFlashcard.cefr_level}
            </span>
          </div>

          {/* Flashcard Body */}
          <div
            onClick={() => setIsFlipped(!isFlipped)}
            className="min-h-[220px] bg-white/5 border border-white/10 rounded-2xl p-6 cursor-pointer hover:bg-white/10 transition-all flex flex-col items-center justify-center space-y-4 shadow-inner"
          >
            {!isFlipped ? (
              <div className="space-y-2">
                <span className="text-xs uppercase tracking-wider text-slate-400">Deutsch</span>
                <h3 className="text-3xl font-extrabold text-amber-300">
                  {currentFlashcard.word}
                </h3>
                <span className="text-xs px-2 py-0.5 rounded bg-white/10 text-slate-300 inline-block">
                  {currentFlashcard.part_of_speech}
                </span>
                <p className="text-xs text-slate-400 pt-4">แตะที่การ์ดเพื่อดูความหมายและตัวอย่าง →</p>
              </div>
            ) : (
              <div className="space-y-3 animate-in fade-in duration-200">
                <span className="text-xs uppercase tracking-wider text-emerald-400 font-bold">
                  ความหมายภาษาไทย
                </span>
                <h4 className="text-xl font-bold text-white">
                  {currentFlashcard.meaning_th}
                </h4>
                {currentFlashcard.example_sentence && (
                  <div className="pt-2 border-t border-white/10 text-xs text-left max-w-md mx-auto space-y-1">
                    <p className="font-medium text-slate-200 italic">
                      „{currentFlashcard.example_sentence}“
                    </p>
                    {currentFlashcard.example_translation_th && (
                      <p className="text-slate-400">
                        {currentFlashcard.example_translation_th}
                      </p>
                    )}
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Controls */}
          <div className="flex items-center justify-center gap-4">
            <button
              onClick={() => {
                setCardIndex((prev) => Math.max(0, prev - 1));
                setIsFlipped(false);
              }}
              disabled={cardIndex === 0}
              className="p-2.5 rounded-full bg-white/10 hover:bg-white/20 disabled:opacity-40 transition-colors"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            <button
              onClick={() => setIsFlipped(!isFlipped)}
              className="px-4 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-xs font-semibold flex items-center gap-1.5"
            >
              <RotateCw className="w-3.5 h-3.5" />
              <span>พลิกการ์ด</span>
            </button>
            <button
              onClick={() => {
                setCardIndex((prev) => Math.min(filtered.length - 1, prev + 1));
                setIsFlipped(false);
              }}
              disabled={cardIndex === filtered.length - 1}
              className="p-2.5 rounded-full bg-white/10 hover:bg-white/20 disabled:opacity-40 transition-colors"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>
        </div>
      )}

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 shadow-sm">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="ค้นหาคำศัพท์หรือความหมาย..."
            className="w-full pl-9 pr-4 py-2 rounded-xl text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        {/* Level Filters */}
        <div className="flex items-center gap-1.5 self-start sm:self-auto">
          {['ALL', 'B1', 'B2', 'C1'].map((lvl) => (
            <button
              key={lvl}
              onClick={() => setSelectedLevel(lvl)}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors ${
                selectedLevel === lvl
                  ? 'bg-blue-600 text-white'
                  : 'bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 text-slate-600 dark:text-slate-400'
              }`}
            >
              {lvl === 'ALL' ? 'ทั้งหมด' : lvl}
            </button>
          ))}
        </div>
      </div>

      {/* Vocabulary Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filtered.map((item) => (
          <div
            key={item.id}
            className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-sm space-y-3 flex flex-col justify-between hover:border-blue-400 transition-all"
          >
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-300">
                  {item.cefr_level}
                </span>
                <span className="text-[10px] font-semibold text-slate-400 uppercase">
                  {item.part_of_speech}
                </span>
              </div>

              <div>
                <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                  {item.word}
                </h3>
                <p className="text-xs font-semibold text-blue-700 dark:text-blue-400 mt-0.5">
                  {item.meaning_th}
                </p>
              </div>

              {item.example_sentence && (
                <div className="pt-2 border-t border-slate-100 dark:border-slate-800 text-xs space-y-1">
                  <p className="font-serif sm:font-sans text-slate-700 dark:text-slate-300 italic">
                    „{item.example_sentence}“
                  </p>
                  {item.example_translation_th && (
                    <p className="text-[11px] text-slate-500">
                      {item.example_translation_th}
                    </p>
                  )}
                </div>
              )}
            </div>

            <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs">
              <div className="flex flex-wrap gap-1">
                {item.tags?.map((t, idx) => (
                  <span
                    key={idx}
                    className="text-[10px] bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 px-1.5 py-0.2 rounded"
                  >
                    #{t}
                  </span>
                ))}
              </div>
              <button
                onClick={() => onDeleteWord(item.id)}
                className="text-slate-400 hover:text-red-500 transition-colors p-1"
                title="ลบคำศัพท์"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Add Word Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-4">
            <h3 className="font-bold text-base text-slate-900 dark:text-white">
              เพิ่มคำศัพท์ใหม่ลงคลัง (Neuer Eintrag)
            </h3>

            <form onSubmit={handleCreateWord} className="space-y-3 text-xs">
              <div className="grid grid-cols-3 gap-2">
                <div>
                  <label className="font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                    Artikel
                  </label>
                  <select
                    value={newArticle}
                    onChange={(e) => setNewArticle(e.target.value as any)}
                    className="w-full p-2 rounded-lg bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700"
                  >
                    <option value="">- ไม่มี -</option>
                    <option value="der">der (ชาย)</option>
                    <option value="die">die (หญิง)</option>
                    <option value="das">das (กลาง)</option>
                  </select>
                </div>

                <div className="col-span-2">
                  <label className="font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                    คำศัพท์ภาษาเยอรมัน *
                  </label>
                  <input
                    type="text"
                    required
                    value={newWord}
                    onChange={(e) => setNewWord(e.target.value)}
                    placeholder="z.B. Maßnahme"
                    className="w-full p-2 rounded-lg bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700"
                  />
                </div>
              </div>

              <div>
                <label className="font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                  ความหมายภาษาไทย *
                </label>
                <input
                  type="text"
                  required
                  value={newMeaning}
                  onChange={(e) => setNewMeaning(e.target.value)}
                  placeholder="เช่น มาตรการ, นโยบายดำเนินงาน"
                  className="w-full p-2 rounded-lg bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                    ประเภทคำ
                  </label>
                  <select
                    value={newPos}
                    onChange={(e) => setNewPos(e.target.value as any)}
                    className="w-full p-2 rounded-lg bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700"
                  >
                    <option value="Noun">คำนาม (Nomen)</option>
                    <option value="Verb">กริยา (Verb)</option>
                    <option value="Adjective">คุณศัพท์ (Adjektiv)</option>
                    <option value="Connector">คำเชื่อม (Konnektor)</option>
                  </select>
                </div>

                <div>
                  <label className="font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                    ระดับ CEFR
                  </label>
                  <select
                    value={newLevel}
                    onChange={(e) => setNewLevel(e.target.value as any)}
                    className="w-full p-2 rounded-lg bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700"
                  >
                    <option value="B1">B1</option>
                    <option value="B2">B2</option>
                    <option value="C1">C1</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                  ตัวอย่างประโยค (Beispielsatz)
                </label>
                <input
                  type="text"
                  value={newExample}
                  onChange={(e) => setNewExample(e.target.value)}
                  placeholder="Die Regierung muss Maßnahmen ergreifen."
                  className="w-full p-2 rounded-lg bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 rounded-lg border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 font-medium"
                >
                  ยกเลิก
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-500 text-white font-bold"
                >
                  บันทึก
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
