import React from 'react';
import { Award, BookOpen, CheckCircle2, ShieldAlert, Layers } from 'lucide-react';

export const RubricView: React.FC = () => {
  return (
    <div className="space-y-8 py-4">
      {/* Header */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm">
        <span className="text-xs font-bold uppercase tracking-wider text-blue-600 dark:text-blue-400">
          Akademischer Bewertungsrahmen
        </span>
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white mt-1">
          เกณฑ์การประเมิน 100 คะแนนเต็ม (Assessment Rubric)
        </h1>
        <p className="text-xs text-slate-500 mt-1 max-w-3xl">
          พัฒนาขึ้นตามกรอบมาตรฐาน CEFR Companion Volume 2020 และแนวทางการประเมินของ Goethe-Zertifikat และ Cambridge Writing Assessment โดยแยกเกณฑ์คำเชื่อมเป็นส่วนหนึ่งของ Cohesion เพื่อป้องกันการหักคะแนนซ้ำซ้อน
        </p>
      </div>

      {/* 7 Category Details Table */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm space-y-6">
        <h2 className="text-base font-bold text-slate-900 dark:text-white">
          โครงสร้างคะแนนทั้ง 7 หมวด (Die 7 Bewertungskategorien)
        </h2>

        <div className="space-y-4">
          {/* Cat 1 */}
          <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/60 dark:bg-slate-800/40 space-y-2">
            <div className="flex items-center justify-between text-xs">
              <span className="font-bold text-sm text-slate-900 dark:text-white">
                1. Aufgabenbewältigung (Task Fulfillment)
              </span>
              <span className="font-extrabold text-blue-600 dark:text-blue-400">
                20 คะแนน
              </span>
            </div>
            <ul className="text-xs text-slate-600 dark:text-slate-400 space-y-1 list-disc list-inside">
              <li>ความเข้าใจคำสั่งและวัตถุประสงค์ของโจทย์อย่างถ่องแท้</li>
              <li>การตอบคำถามและครอบคลุมทุกประเด็นที่กำหนด (Leitpunkte)</li>
              <li>การเขียนสอดคล้องกับประเภทข้อความ (Textsortenadäquatheit: อีเมล, จดหมาย, แสดงความเห็น)</li>
              <li>การควบคุมเนื้อหาให้อยู่ในขอบเขต ไม่ออกนอกประเด็น</li>
            </ul>
          </div>

          {/* Cat 2 */}
          <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/60 dark:bg-slate-800/40 space-y-2">
            <div className="flex items-center justify-between text-xs">
              <span className="font-bold text-sm text-slate-900 dark:text-white">
                2. Inhalt & Entwicklung (Content Development)
              </span>
              <span className="font-extrabold text-blue-600 dark:text-blue-400">
                15 คะแนน
              </span>
            </div>
            <ul className="text-xs text-slate-600 dark:text-slate-400 space-y-1 list-disc list-inside">
              <li>คุณภาพและความลึกซึ้งของข้อคิดเห็น (Inhaltliche Qualität)</li>
              <li>ความสมเหตุสมผลของข้อโต้แย้ง (Plausibilität der Argumentation)</li>
              <li>การอธิบายและขยายความแนวคิดอย่างกระจ่างชัด</li>
              <li>การยกตัวอย่างประกอบที่สอดคล้องกับบริบทจริง</li>
            </ul>
          </div>

          {/* Cat 3 */}
          <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/60 dark:bg-slate-800/40 space-y-2">
            <div className="flex items-center justify-between text-xs">
              <span className="font-bold text-sm text-slate-900 dark:text-white">
                3. Wortschatz (Vocabulary)
              </span>
              <span className="font-extrabold text-blue-600 dark:text-blue-400">
                20 คะแนน
              </span>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 text-xs text-slate-600 dark:text-slate-400 pt-1">
              <div className="p-2 bg-white dark:bg-slate-800 rounded border border-slate-200 dark:border-slate-700">
                <span className="font-bold block text-slate-900 dark:text-white">Range</span>
                <span>5 คะแนน</span>
              </div>
              <div className="p-2 bg-white dark:bg-slate-800 rounded border border-slate-200 dark:border-slate-700">
                <span className="font-bold block text-slate-900 dark:text-white">Accuracy</span>
                <span>5 คะแนน</span>
              </div>
              <div className="p-2 bg-white dark:bg-slate-800 rounded border border-slate-200 dark:border-slate-700">
                <span className="font-bold block text-slate-900 dark:text-white">Collocations</span>
                <span>4 คะแนน</span>
              </div>
              <div className="p-2 bg-white dark:bg-slate-800 rounded border border-slate-200 dark:border-slate-700">
                <span className="font-bold block text-slate-900 dark:text-white">Context</span>
                <span>3 คะแนน</span>
              </div>
              <div className="p-2 bg-white dark:bg-slate-800 rounded border border-slate-200 dark:border-slate-700">
                <span className="font-bold block text-slate-900 dark:text-white">Paraphrase</span>
                <span>3 คะแนน</span>
              </div>
            </div>
          </div>

          {/* Cat 4 */}
          <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/60 dark:bg-slate-800/40 space-y-2">
            <div className="flex items-center justify-between text-xs">
              <span className="font-bold text-sm text-slate-900 dark:text-white">
                4. Grammatik (Grammar)
              </span>
              <span className="font-extrabold text-blue-600 dark:text-blue-400">
                20 คะแนน
              </span>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 text-xs text-slate-600 dark:text-slate-400 pt-1">
              <div className="p-2 bg-white dark:bg-slate-800 rounded border border-slate-200 dark:border-slate-700">
                <span className="font-bold block text-slate-900 dark:text-white">Verb & Tense</span>
                <span>4 คะแนน</span>
              </div>
              <div className="p-2 bg-white dark:bg-slate-800 rounded border border-slate-200 dark:border-slate-700">
                <span className="font-bold block text-slate-900 dark:text-white">Word Order</span>
                <span>4 คะแนน</span>
              </div>
              <div className="p-2 bg-white dark:bg-slate-800 rounded border border-slate-200 dark:border-slate-700">
                <span className="font-bold block text-slate-900 dark:text-white">Cases & Articles</span>
                <span>4 คะแนน</span>
              </div>
              <div className="p-2 bg-white dark:bg-slate-800 rounded border border-slate-200 dark:border-slate-700">
                <span className="font-bold block text-slate-900 dark:text-white">Structure</span>
                <span>4 คะแนน</span>
              </div>
              <div className="p-2 bg-white dark:bg-slate-800 rounded border border-slate-200 dark:border-slate-700">
                <span className="font-bold block text-slate-900 dark:text-white">Complexity</span>
                <span>4 คะแนน</span>
              </div>
            </div>
          </div>

          {/* Cat 5 */}
          <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/60 dark:bg-slate-800/40 space-y-2">
            <div className="flex items-center justify-between text-xs">
              <span className="font-bold text-sm text-slate-900 dark:text-white">
                5. Kohärenz & Kohäsion (Cohesion)
              </span>
              <span className="font-extrabold text-blue-600 dark:text-blue-400">
                15 คะแนน
              </span>
            </div>
            <ul className="text-xs text-slate-600 dark:text-slate-400 space-y-1 list-disc list-inside">
              <li>Logical Organisation: การเรียงลำดับความคิดอย่างเป็นเหตุเป็นผล (4 คะแนน)</li>
              <li>Paragraph Development: การแบ่งย่อหน้าอย่างมีความหมาย (3 คะแนน)</li>
              <li>Connectors: ความหลากหลายและถูกต้องของคำเชื่อม (4 คะแนน)</li>
              <li>Reference & Transitions: การอ้างอิงและการเชื่อมข้ามประโยค (2 คะแนน)</li>
              <li>Sentence Flow: ความลื่นไหลในการอ่าน (2 คะแนน)</li>
            </ul>
          </div>

          {/* Cat 6 & 7 */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/60 dark:bg-slate-800/40 space-y-2">
              <div className="flex items-center justify-between text-xs">
                <span className="font-bold text-sm text-slate-900 dark:text-white">
                  6. Register & Stil
                </span>
                <span className="font-extrabold text-blue-600 dark:text-blue-400">5 คะแนน</span>
              </div>
              <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                ระดับความสุภาพ (Formality), ความเหมาะสมกับผู้อ่าน และความสม่ำเสมอของน้ำเสียง
              </p>
            </div>

            <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/60 dark:bg-slate-800/40 space-y-2">
              <div className="flex items-center justify-between text-xs">
                <span className="font-bold text-sm text-slate-900 dark:text-white">
                  7. Rechtschreibung
                </span>
                <span className="font-extrabold text-blue-600 dark:text-blue-400">5 คะแนน</span>
              </div>
              <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                การสะกดคำ (Orthographie), ตัวพิมพ์ใหญ่-เล็ก (Groß/Kleinschreibung) และเครื่องหมายจุลภาค (Kommasetzung)
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Grade System Table */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm space-y-4">
        <h2 className="text-base font-bold text-slate-900 dark:text-white">
          ระบบการตัดเกรด A–F (Grade System)
        </h2>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden">
            <thead className="bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-bold uppercase text-[10px]">
              <tr>
                <th className="py-3 px-4">ช่วงคะแนน (Score)</th>
                <th className="py-3 px-4">เกรด (Grade)</th>
                <th className="py-3 px-4">คำอธิบายมาตรฐาน (Description)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              <tr>
                <td className="py-3 px-4 font-bold text-emerald-600">90–100</td>
                <td className="py-3 px-4 font-black">A</td>
                <td className="py-3 px-4 text-slate-600 dark:text-slate-400">Excellent: ยอดเยี่ยม ควบคุมไวยากรณ์และคำศัพท์ได้อย่างแม่นยำสูง</td>
              </tr>
              <tr>
                <td className="py-3 px-4 font-bold text-blue-600">80–89</td>
                <td className="py-3 px-4 font-black">B</td>
                <td className="py-3 px-4 text-slate-600 dark:text-slate-400">Very Good: ดีมาก สื่อสารได้ชัดเจน มีข้อผิดพลาดเล็กน้อย</td>
              </tr>
              <tr>
                <td className="py-3 px-4 font-bold text-blue-500">70–79</td>
                <td className="py-3 px-4 font-black">C</td>
                <td className="py-3 px-4 text-slate-600 dark:text-slate-400">Good: ดี สื่อสารใจความสำคัญได้ครบถ้วน</td>
              </tr>
              <tr>
                <td className="py-3 px-4 font-bold text-amber-500">60–69</td>
                <td className="py-3 px-4 font-black">D</td>
                <td className="py-3 px-4 text-slate-600 dark:text-slate-400">Satisfactory: พอใช้ มีข้อผิดพลาดทางไวยากรณ์ที่สังเกตได้</td>
              </tr>
              <tr>
                <td className="py-3 px-4 font-bold text-amber-600">50–59</td>
                <td className="py-3 px-4 font-black">E</td>
                <td className="py-3 px-4 text-slate-600 dark:text-slate-400">Needs Improvement: ต้องปรับปรุง โครงสร้างประโยคยังมีปัญหา</td>
              </tr>
              <tr>
                <td className="py-3 px-4 font-bold text-red-600">0–49</td>
                <td className="py-3 px-4 font-black">F</td>
                <td className="py-3 px-4 text-slate-600 dark:text-slate-400">Insufficient: ไม่ผ่านเกณฑ์ขั้นต่ำ หรือหลักฐานการเขียนไม่เพียงพอ</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
