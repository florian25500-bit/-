import React, { useState } from 'react';
import {
  Bookmark,
  Search,
  Plus,
  BookOpen,
  Volume2,
  Trash2,
  Sparkles,
  ChevronLeft,
  ChevronRight,
  RotateCw,
  X,
  Copy,
  Check,
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
  const [selectedPos, setSelectedPos] = useState<string>('ALL');
  const [copiedId, setCopiedId] = useState<string | null>(null);
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
    const matchesPos =
      selectedPos === 'ALL' ||
      (selectedPos === 'Modifier'
        ? item.part_of_speech === 'Adjective' || item.part_of_speech === 'Adverb'
        : item.part_of_speech === selectedPos);
    const q = searchTerm.toLowerCase();
    const matchesSearch =
      !q ||
      item.word.toLowerCase().includes(q) ||
      item.meaning_th.toLowerCase().includes(q) ||
      item.example_sentence.toLowerCase().includes(q) ||
      (item.tags || []).some((t) => t.toLowerCase().includes(q));
    return matchesLevel && matchesPos && matchesSearch;
  });

  const handleCopyPhrase = async (id: string, text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedId(id);
      setTimeout(() => setCopiedId((curr) => (curr === id ? null : curr)), 1800);
    } catch {
      // Fallback ignored in restricted environments
    }
  };

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
    <div className="space-y-6 py-6">
      {/* Header Banner */}
      <div className="bg-white border border-slate-200/80 rounded-2xl p-6 sm:p-7 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-blue-700">
              Wortschatz & Redemittel fürs Schreiben
            </span>
            <h1 className="text-xl sm:text-2xl font-bold text-slate-900 mt-1 tracking-tight">
              คลังคำศัพท์และสำนวนสำหรับงานเขียนเยอรมัน (Vocabulary Bank)
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 mt-1 max-w-2xl leading-relaxed">
              รวบรวมคำศัพท์ กริยาสำคัญ คำเชื่อมประโยค และ Redemittel ระดับ A1–C1 สำหรับนำไปใช้เขียนอีเมล จดหมาย เรียงความ และข้อร้องเรียนได้ทันที
            </p>
          </div>

          <div className="flex items-center gap-2.5">
            <button
              onClick={() => {
                setFlashcardMode(!flashcardMode);
                setCardIndex(0);
                setIsFlipped(false);
              }}
              className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                flashcardMode
                  ? 'bg-amber-500 text-white shadow-xs'
                  : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
              }`}
            >
              <Sparkles className="w-4 h-4" />
              <span>{flashcardMode ? 'ออกจากโหมดบัตรคำ' : 'โหมดบัตรคำ (Flashcards)'}</span>
            </button>

            <button
              onClick={() => setShowAddModal(true)}
              className="bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs px-4 py-2 rounded-xl shadow-xs hover:shadow-md transition-all flex items-center gap-1.5 cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>เพิ่มคำศัพท์ใหม่</span>
            </button>
          </div>
        </div>
      </div>

      {/* FLASHCARD MODE */}
      {flashcardMode && filtered.length > 0 && currentFlashcard && (
        <div className="bg-slate-50 border border-slate-200/80 rounded-3xl p-8 max-w-xl mx-auto space-y-6 text-center shadow-xs">
          <div className="flex items-center justify-between text-xs text-slate-500">
            <span>
              บัตรคำ {cardIndex + 1} จาก {filtered.length}
            </span>
            <span className="px-2.5 py-0.5 rounded-md font-bold bg-blue-50 text-blue-700 border border-blue-200">
              Niveau {currentFlashcard.cefr_level}
            </span>
          </div>

          {/* Flashcard Canvas */}
          <div
            onClick={() => setIsFlipped(!isFlipped)}
            className="min-h-[220px] bg-white border border-slate-200/80 rounded-2xl p-6 cursor-pointer hover:border-blue-400 transition-all flex flex-col items-center justify-center space-y-3 shadow-xs select-none"
          >
            {!isFlipped ? (
              <div className="space-y-2">
                <span className="text-[11px] uppercase tracking-wider text-slate-400 font-bold">Deutsch</span>
                <h3 className="text-3xl font-extrabold text-slate-900">
                  {currentFlashcard.word}
                </h3>
                <span className="text-xs px-2.5 py-0.5 rounded-md bg-slate-100 text-slate-600 font-medium inline-block">
                  {currentFlashcard.part_of_speech}
                </span>
                <p className="text-xs text-slate-400 pt-4">แตะที่การ์ดเพื่อดูความหมายและตัวอย่าง →</p>
              </div>
            ) : (
              <div className="space-y-3 animate-in fade-in duration-200">
                <span className="text-[11px] uppercase tracking-wider text-emerald-700 font-bold">
                  ความหมายภาษาไทย
                </span>
                <h4 className="text-xl font-bold text-slate-900">
                  {currentFlashcard.meaning_th}
                </h4>
                {currentFlashcard.example_sentence && (
                  <div className="pt-3 border-t border-slate-100 text-xs text-left max-w-md mx-auto space-y-1">
                    <p className="font-semibold text-slate-800">„{currentFlashcard.example_sentence}“</p>
                    {currentFlashcard.example_translation_th && (
                      <p className="text-slate-500">{currentFlashcard.example_translation_th}</p>
                    )}
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Controls */}
          <div className="flex items-center justify-center gap-3">
            <button
              onClick={() => {
                setCardIndex((prev) => (prev > 0 ? prev - 1 : filtered.length - 1));
                setIsFlipped(false);
              }}
              className="p-2.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-100 text-slate-700 transition-colors cursor-pointer shadow-2xs"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>

            <button
              onClick={() => setIsFlipped(!isFlipped)}
              className="px-4 py-2 rounded-xl bg-white border border-slate-200 text-slate-700 hover:bg-slate-100 text-xs font-semibold flex items-center gap-1.5 cursor-pointer shadow-2xs"
            >
              <RotateCw className="w-3.5 h-3.5 text-slate-500" />
              <span>พลิกการ์ด</span>
            </button>

            <button
              onClick={() => {
                setCardIndex((prev) => (prev < filtered.length - 1 ? prev + 1 : 0));
                setIsFlipped(false);
              }}
              className="p-2.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-100 text-slate-700 transition-colors cursor-pointer shadow-2xs"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>
        </div>
      )}

      {/* Search and Filters */}
      <div className="bg-white border border-slate-200/80 rounded-2xl p-4 shadow-xs space-y-3">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3">
          <div className="relative w-full lg:w-80">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="ค้นหาคำศัพท์ แท็ก (เช่น Redemittel) หรือตัวอย่าง..."
              className="w-full pl-9 pr-4 py-2 rounded-xl text-xs bg-slate-50 border border-slate-200 text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
            />
          </div>

          <div className="flex flex-wrap items-center gap-1.5">
            {['ALL', 'A1', 'A2', 'B1', 'B2', 'C1'].map((lvl) => {
              const count =
                lvl === 'ALL'
                  ? vocabulary.length
                  : vocabulary.filter((v) => v.cefr_level === lvl).length;
              return (
                <button
                  key={lvl}
                  type="button"
                  onClick={() => {
                    setSelectedLevel(lvl);
                    setCardIndex(0);
                  }}
                  className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-colors cursor-pointer ${
                    selectedLevel === lvl
                      ? 'bg-blue-600 text-white font-bold shadow-2xs'
                      : 'bg-slate-100 hover:bg-slate-200 text-slate-600'
                  }`}
                >
                  {lvl === 'ALL' ? `ทุกระดับ (${count})` : `${lvl} (${count})`}
                </button>
              );
            })}
          </div>
        </div>

        <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-slate-100">
          <div className="flex flex-wrap items-center gap-1.5">
            <span className="text-[11px] font-semibold text-slate-400 mr-1">ชนิดคำ/บทบาท:</span>
            {[
              { id: 'ALL', label: 'ทั้งหมด' },
              { id: 'Connector', label: 'คำเชื่อมประโยค (Konnektoren)' },
              { id: 'Verb', label: 'คำกริยา (Verben)' },
              { id: 'Noun', label: 'คำนาม (Nomen)' },
              { id: 'Modifier', label: 'คุณศัพท์/สำนวน (Adj./Adv.)' },
            ].map((pos) => (
              <button
                key={pos.id}
                type="button"
                onClick={() => {
                  setSelectedPos(pos.id);
                  setCardIndex(0);
                }}
                className={`px-2.5 py-1 rounded-lg text-[11px] font-semibold transition-colors cursor-pointer ${
                  selectedPos === pos.id
                    ? 'bg-slate-800 text-white'
                    : 'bg-slate-50 hover:bg-slate-100 text-slate-600 border border-slate-200/70'
                }`}
              >
                {pos.label}
              </button>
            ))}
          </div>

          <span className="text-[11px] text-slate-400 font-medium">
            แสดง {filtered.length} จาก {vocabulary.length} รายการ
          </span>
        </div>
      </div>

      {/* Vocabulary Cards Grid */}
      {filtered.length === 0 ? (
        <div className="bg-white border border-dashed border-slate-200 rounded-2xl p-12 text-center space-y-3">
          <Bookmark className="w-10 h-10 text-slate-300 mx-auto" />
          <h3 className="text-sm font-bold text-slate-700">ไม่พบคำศัพท์ที่ตรงกับการค้นหา</h3>
          <p className="text-xs text-slate-500">ลองเปลี่ยนคำค้นหา หรือเพิ่มคำศัพท์ใหม่เข้าระบบ</p>
          <button
            onClick={() => setShowAddModal(true)}
            className="px-4 py-2 bg-blue-600 text-white text-xs font-semibold rounded-xl cursor-pointer"
          >
            เพิ่มคำศัพท์ชิ้นแรก
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map((item) => (
            <div
              key={item.id}
              className="bg-white border border-slate-200/80 rounded-2xl p-5 shadow-xs hover:border-blue-300 transition-all flex flex-col justify-between space-y-3 group"
            >
              <div className="space-y-2.5">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5">
                    <span
                      className={`px-2 py-0.5 rounded-md font-bold text-[10px] border ${
                        item.cefr_level === 'C1'
                          ? 'bg-indigo-50 text-indigo-700 border-indigo-200'
                          : item.cefr_level === 'B2'
                          ? 'bg-blue-50 text-blue-700 border-blue-200'
                          : item.cefr_level === 'B1'
                          ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                          : item.cefr_level === 'A2'
                          ? 'bg-cyan-50 text-cyan-700 border-cyan-200'
                          : 'bg-teal-50 text-teal-700 border-teal-200'
                      }`}
                    >
                      {item.cefr_level}
                    </span>
                    <span className="text-[10px] text-slate-400 font-medium">{item.part_of_speech}</span>
                  </div>

                  <div className="flex items-center gap-1">
                    <button
                      type="button"
                      onClick={() => handleCopyPhrase(item.id, item.word)}
                      className="p-1.5 rounded-lg text-slate-400 hover:text-blue-600 hover:bg-blue-50 transition-all cursor-pointer"
                      title="คัดลอกคำศัพท์เพื่อนำไปเขียน"
                      aria-label={`คัดลอกคำว่า ${item.word}`}
                    >
                      {copiedId === item.id ? (
                        <Check className="w-3.5 h-3.5 text-emerald-600" />
                      ) : (
                        <Copy className="w-3.5 h-3.5" />
                      )}
                    </button>
                    <button
                      type="button"
                      onClick={() => onDeleteWord(item.id)}
                      className="opacity-0 group-hover:opacity-100 p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-all cursor-pointer"
                      title="ลบคำศัพท์นี้"
                      aria-label={`ลบคำว่า ${item.word}`}
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                <div>
                  <div className="flex items-baseline justify-between gap-2">
                    <h3 className="text-lg font-bold text-slate-900 group-hover:text-blue-600 transition-colors">
                      {item.word}
                    </h3>
                    {item.plural && (
                      <span className="text-[11px] text-slate-400 shrink-0">Pl. {item.plural}</span>
                    )}
                  </div>
                  <p className="text-xs text-slate-600 font-medium mt-0.5">
                    {item.meaning_th}
                  </p>
                </div>

                {item.example_sentence && (
                  <div className="p-3 bg-slate-50/70 rounded-xl border border-slate-100 text-xs space-y-1">
                    <p className="text-slate-800 leading-relaxed font-sans font-medium">
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

              {item.tags && item.tags.length > 0 && (
                <div className="flex flex-wrap gap-1 pt-1">
                  {item.tags.slice(0, 3).map((tag) => (
                    <span
                      key={tag}
                      className="px-2 py-0.5 rounded-md bg-slate-100 text-slate-500 text-[10px] font-medium"
                    >
                      #{tag}
                    </span>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Add Word Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white border border-slate-200 rounded-2xl max-w-lg w-full p-6 shadow-xl space-y-4 animate-in fade-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="font-bold text-base text-slate-900">
                เพิ่มคำศัพท์หรือสำนวนใหม่ (Neues Wort)
              </h3>
              <button
                onClick={() => setShowAddModal(false)}
                className="text-slate-400 hover:text-slate-600 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCreateWord} className="space-y-4">
              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="text-xs text-slate-500 block mb-1">คำนำหน้านาม</label>
                  <select
                    value={newArticle}
                    onChange={(e: any) => setNewArticle(e.target.value)}
                    className="w-full text-xs p-2.5 rounded-xl border border-slate-200 bg-slate-50"
                  >
                    <option value="">(ไม่มี/กริยา)</option>
                    <option value="der">der (ชาย)</option>
                    <option value="die">die (หญิง)</option>
                    <option value="das">das (กลาง)</option>
                  </select>
                </div>

                <div className="col-span-2">
                  <label className="text-xs text-slate-500 block mb-1">คำศัพท์ภาษาเยอรมัน *</label>
                  <input
                    type="text"
                    required
                    value={newWord}
                    onChange={(e) => setNewWord(e.target.value)}
                    placeholder="เช่น Ausflug, beeinflussen..."
                    className="w-full text-xs p-2.5 rounded-xl border border-slate-200 bg-slate-50 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs text-slate-500 block mb-1">ชนิดของคำ (POS)</label>
                  <select
                    value={newPos}
                    onChange={(e: any) => setNewPos(e.target.value)}
                    className="w-full text-xs p-2.5 rounded-xl border border-slate-200 bg-slate-50"
                  >
                    <option value="Noun">คำนาม (Nomen)</option>
                    <option value="Verb">คำกริยา (Verb)</option>
                    <option value="Adjective">คำคุณศัพท์ (Adjektiv)</option>
                    <option value="Connector">คำเชื่อม (Konnektor)</option>
                    <option value="Adverb">คำกริยาวิเศษณ์ (Adverb)</option>
                  </select>
                </div>

                <div>
                  <label className="text-xs text-slate-500 block mb-1">ระดับภาษา (CEFR)</label>
                  <select
                    value={newLevel}
                    onChange={(e: any) => setNewLevel(e.target.value)}
                    className="w-full text-xs p-2.5 rounded-xl border border-slate-200 bg-slate-50"
                  >
                    <option value="A1">A1</option>
                    <option value="A2">A2</option>
                    <option value="B1">B1</option>
                    <option value="B2">B2</option>
                    <option value="C1">C1</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="text-xs text-slate-500 block mb-1">ความหมายภาษาไทย *</label>
                <input
                  type="text"
                  required
                  value={newMeaning}
                  onChange={(e) => setNewMeaning(e.target.value)}
                  placeholder="เช่น การเดินทางท่องเที่ยวระยะสั้น, มีอิทธิพลต่อ..."
                  className="w-full text-xs p-2.5 rounded-xl border border-slate-200 bg-slate-50 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                />
              </div>

              <div>
                <label className="text-xs text-slate-500 block mb-1">ตัวอย่างประโยค (German)</label>
                <input
                  type="text"
                  value={newExample}
                  onChange={(e) => setNewExample(e.target.value)}
                  placeholder="เช่น Wir machen am Wochenende einen Ausflug."
                  className="w-full text-xs p-2.5 rounded-xl border border-slate-200 bg-slate-50"
                />
              </div>

              <div>
                <label className="text-xs text-slate-500 block mb-1">คำแปลตัวอย่าง (Thai)</label>
                <input
                  type="text"
                  value={newTranslation}
                  onChange={(e) => setNewTranslation(e.target.value)}
                  placeholder="เช่น พวกเราจะไปเที่ยวกันสุดสัปดาห์นี้"
                  className="w-full text-xs p-2.5 rounded-xl border border-slate-200 bg-slate-50"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-100 cursor-pointer"
                >
                  ยกเลิก
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-xl shadow-xs cursor-pointer"
                >
                  บันทึกคำศัพท์
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
