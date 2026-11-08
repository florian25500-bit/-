import { GrammarLesson } from '../types';

export const GRAMMAR_LESSONS: GrammarLesson[] = [
  {
    id: 'lesson-nebensaetze',
    title: 'ตำแหน่งคำในอนุประโยค (Nebensätze: weil, obwohl, dass)',
    german_title: 'Nebensätze und Verbletztstellung',
    topic: 'Nebensätze',
    cefr_level: 'B1',
    explanation_th:
      'ในภาษาเยอรมัน เมื่อเชื่อมประโยคด้วยสันธานรอง (Subjunktionen) เช่น weil (เพราะว่า), obwohl (แม้ว่า), dass (ว่า), wenn (ถ้า/เมื่อ) กริยาที่ผันตามประธาน (konjugiertes Verb) จะต้องถูกย้ายไปอยู่ "ตำแหน่งสุดท้ายของอนุประโยค" เสมอ ต่างจากภาษาไทยและอังกฤษที่กริยาอยู่หลังประธานทันที',
    rules: [
      'โครงสร้าง: Subjunktion + Subjekt + ... + konjugiertes Verb (กริยาผันอยู่ท้ายสุด)',
      'หากมีกริยาช่วย (Modalverb): Subjunktion + Subjekt + ... + Vollverb (Infinitiv) + Modalverb (ผันแล้ว)',
      'หากมี Perfekt: Subjunktion + Subjekt + ... + Partizip II + haben/sein (ผันแล้ว)',
      'เครื่องหมายจุลภาค (Komma): ต้องคั่นระหว่าง Hauptsatz กับ Nebensatz เสมอ'
    ],
    correct_examples: [
      {
        german: 'Obwohl es heute stark regnet, gehe ich im Park spazieren.',
        thai: 'แม้ว่าวันนี้ฝนตกหนัก ฉันก็ยังไปเดินเล่นในสวน',
        note: 'regnet อยู่ท้ายอนุประโยค obwohl'
      },
      {
        german: 'Ich arbeite gerne im Homeoffice, weil ich meine Zeit besser einteilen kann.',
        thai: 'ฉันชอบทำงานที่บ้านเพราะฉันสามารถจัดสรรเวลาได้ดีกว่า',
        note: 'einteilen (Infinitiv) + kann (Modalverb อยู่ท้ายสุด)'
      },
      {
        german: 'Der Lehrer sagt, dass alle Schüler die Hausaufgaben gemacht haben.',
        thai: 'ครูบอกว่านักเรียนทุกคนได้ทำการบ้านแล้ว',
        note: 'haben อยู่ท้ายสุดหลัง Partizip II'
      }
    ],
    incorrect_examples: [
      {
        german: 'Obwohl ich bin müde, lerne ich weiter.',
        thai: 'แม้ว่าฉันเหนื่อย ฉันก็ยังอ่านหนังสือต่อ',
        correction: 'Obwohl ich müde bin, lerne ich weiter.',
        why_wrong_th: 'หลัง obwohl กริยาผัน bin ต้องอยู่ท้ายประโยค ไม่ใช่อยู่หลังประธาน ich ทันที'
      },
      {
        german: 'Er bleibt zu Hause, weil er ist krank.',
        thai: 'เขาอยู่บ้านเพราะเขาป่วย',
        correction: 'Er bleibt zu Hause, weil er krank ist.',
        why_wrong_th: 'หลัง weil กริยา ist ต้องอยู่ท้ายอนุประโยค'
      }
    ],
    quiz: [
      {
        question: 'ประโยคใดเรียงคำใน Nebensatz ได้ถูกต้องตามหลักไวยากรณ์เยอรมัน?',
        options: [
          'Ich kann nicht kommen, weil ich habe keine Zeit.',
          'Ich kann nicht kommen, weil ich keine Zeit habe.',
          'Ich kann nicht kommen, weil habe ich keine Zeit.',
          'Ich kann nicht kommen, weil ich Zeit keine habe.'
        ],
        correctIndex: 1,
        explanation_th: 'หลัง weil กริยาที่ผัน (habe) ต้องอยู่ท้ายประโยค: "weil ich keine Zeit habe"'
      },
      {
        question: 'เลือกรูปประโยคที่ถูกต้องเมื่อขึ้นต้นด้วย "Obwohl":',
        options: [
          'Obwohl das Auto teuer war, hat er es gekauft.',
          'Obwohl das Auto war teuer, er hat es gekauft.',
          'Obwohl war das Auto teuer, hat er es gekauft.',
          'Obwohl das Auto teuer war, er hat gekauft es.'
        ],
        correctIndex: 0,
        explanation_th: 'ในอนุประโยค war อยู่ท้ายสุด และในประโยคหลักถัดมา กริยา hat ต้องขึ้นเป็นตำแหน่งที่หนึ่งต่อจากจุลภาค'
      }
    ]
  },
  {
    id: 'lesson-kasus',
    title: 'การใช้ 4 การก (Kasus: Nominativ, Akkusativ, Dativ, Genitiv)',
    german_title: 'Die vier Fälle (Kasuslehre)',
    topic: 'Kasus',
    cefr_level: 'B1',
    explanation_th:
      'ระบบการก (Kasus) ในภาษาเยอรมันเป็นตัวกำหนดหน้าที่ของคำนามในประโยค ซึ่งส่งผลต่อการเปลี่ยนรูป Artikel (der/die/das/ein/eine), Pronomen และคำลงท้ายของคุณศัพท์ โดยจำแนกตามหน้าที่: Nominativ (ประธาน), Akkusativ (กรรมตรง / ทิศทาง), Dativ (กรรมรอง / สถานที่นิ่ง), Genitiv (แสดงความเป็นเจ้าของ / คำบุพบทเฉพาะ)',
    rules: [
      'Nominativ: ประธานของประโยค (Wer oder was?) -> der / die / das / die',
      'Akkusativ: กรรมตรง หรือตาม Präpositionen เช่น durch, für, gegen, ohne, um -> den / die / das / die',
      'Dativ: กรรมรอง หรือตาม Präpositionen เช่น aus, bei, mit, nach, seit, von, zu -> dem / der / dem / den (+n)',
      'Genitiv: ความเป็นเจ้าของ หรือตาม Präpositionen เช่น wegen, trotz, während, statt -> des (+s/es) / der / des (+s/es) / der'
    ],
    correct_examples: [
      {
        german: 'Ich fahre morgen mit dem schnellen Zug nach München.',
        thai: 'พรุ่งนี้ฉันจะเดินทางไปมิวนิกด้วยรถไฟขบวนเร็ว',
        note: 'mit บังคับ Dativ เสมอ: der Zug -> dem Zug'
      },
      {
        german: 'Trotz des schlechten Wetters machten wir eine Wanderung.',
        thai: 'แม้ว่าสภาพอากาศจะเลวร้าย พวกเราก็ยังไปเดินป่า',
        note: 'trotz บังคับ Genitiv: das Wetter -> des schlechten Wetters'
      },
      {
        german: 'Der Arzt hilft dem kranken Patienten.',
        thai: 'หมอช่วยเหลือคนไข้ที่ป่วย',
        note: 'กริยา helfen บังคับกรรม Dativ: der Patient -> dem Patienten'
      }
    ],
    incorrect_examples: [
      {
        german: 'Ich gehe heute mit den Freund ins Kino.',
        thai: 'วันนี้ฉันไปดูหนังกับเพื่อน',
        correction: 'Ich gehe heute mit dem Freund ins Kino.',
        why_wrong_th: 'mit บังคับ Dativ เอกพจน์เพศชาย der Freund ต้องเปลี่ยนเป็น dem Freund (ไม่ใช่ den ซึ่งเป็น Akkusativ)'
      },
      {
        german: 'Wegen das Wetter bleiben wir zu Hause.',
        thai: 'เนื่องจากสภาพอากาศพวกเราจึงอยู่บ้าน',
        correction: 'Wegen des Wetters bleiben wir zu Hause.',
        why_wrong_th: 'wegen ในภาษาวิชาการระดับ B2-C1 ต้องใช้คู่กับ Genitiv: des Wetters'
      }
    ],
    quiz: [
      {
        question: 'คำบุพบท "mit" ต้องตามด้วยการก (Kasus) ใดเสมอ?',
        options: ['Nominativ', 'Akkusativ', 'Dativ', 'Genitiv'],
        correctIndex: 2,
        explanation_th: 'mit เป็นบุพบทที่ใช้กับ Dativ เสมอ (aus, bei, mit, nach, seit, von, zu)'
      },
      {
        question: 'เติมคำในช่องว่าง: "Wir danken ______ für Ihre Unterstützung." (Herr Müller - der)',
        options: ['den Herrn Müller', 'dem Herrn Müller', 'des Herrn Müllers', 'der Herr Müller'],
        correctIndex: 1,
        explanation_th: 'danken บังคับ Dativ: dem Herrn Müller (Herr เป็น N-Deklination จึงลงท้ายด้วย -n)'
      }
    ]
  },
  {
    id: 'lesson-wechselpraepositionen',
    title: 'Wechselpräpositionen (Wohin? Akkusativ vs. Wo? Dativ)',
    german_title: 'Wechselpräpositionen (an, auf, in, neben, unter, vor...)',
    topic: 'Präpositionen',
    cefr_level: 'B1',
    explanation_th:
      'Wechselpräpositionen ทั้ง 9 คำ ได้แก่ an, auf, hinter, in, neben, über, unter, vor, zwischen สามารถตามด้วย Akkusativ หรือ Dativ ขึ้นอยู่กับความหมาย: หากเป็นการเคลื่อนที่ข้ามแดนหรือเปลี่ยนตำแหน่ง (Wohin? ไปไหน?) ใช้ Akkusativ; หากเป็นสถานที่จุดเดิม ไม่มีการเคลื่อนย้ายขอบเขต (Wo? อยู่ที่ไหน?) ใช้ Dativ',
    rules: [
      'Wohin? (การเคลื่อนที่/ทิศทาง/การวางสิ่งของ) -> Akkusativ (stellen, legen, hängen, setzen)',
      'Wo? (ตำแหน่งนิ่ง/สถานที่อยู่) -> Dativ (stehen, liegen, hängen, sitzen)',
      'คู่กริยา: stellen (ตั้งวาง - Akk) vs. stehen (ตั้งอยู่ - Dat)',
      'คู่กริยา: legen (วางนอน - Akk) vs. liegen (นอนอยู่ - Dat)'
    ],
    correct_examples: [
      {
        german: 'Ich lege das Buch auf den Schreibtisch. (Wohin? -> Akkusativ)',
        thai: 'ฉันวางหนังสือนอนลงบนโต๊ะทำงาน',
        note: 'auf den Schreibtisch (Akkusativ เพศชาย)'
      },
      {
        german: 'Das Buch liegt jetzt auf dem Schreibtisch. (Wo? -> Dativ)',
        thai: 'ตอนนี้หนังสือวางอยู่บนโต๊ะทำงาน',
        note: 'auf dem Schreibtisch (Dativ เพศชาย)'
      }
    ],
    incorrect_examples: [
      {
        german: 'Er stellt die Vase auf dem Tisch.',
        thai: 'เขาตั้งแจกันไว้บนโต๊ะ',
        correction: 'Er stellt die Vase auf den Tisch.',
        why_wrong_th: 'stellen คือการย้ายที่ (Wohin?) ต้องใช้ Akkusativ: auf den Tisch'
      }
    ],
    quiz: [
      {
        question: '"Wir treffen uns morgen in ______ Bibliothek." (die Bibliothek - สถานที่นัดพบ Wo?)',
        options: ['die', 'der', 'den', 'dem'],
        correctIndex: 1,
        explanation_th: 'Wo? (อยู่ที่ไหน) die Bibliothek เปลี่ยนเป็น der Bibliothek ใน Dativ'
      }
    ]
  },
  {
    id: 'lesson-konnektoren-b2',
    title: 'คำเชื่อมระดับ B2-C1 (Konnektoren: zwar... aber, nicht nur... sondern auch)',
    german_title: 'Zweiteilige Konnektoren und Kohäsion',
    topic: 'Konnektoren',
    cefr_level: 'B2',
    explanation_th:
      'การเขียนระดับ B2 และ C1 ที่ดีตามเกณฑ์ Kohärenz & Kohäsion ต้องใช้คำเชื่อมแบบสองส่วน (zweiteilige Konnektoren) และ Adverbialkonnektoren เพื่อสร้างความสละสลวย การเปรียบเทียบ และความลึกซึ้งในการอภิปราย แทนที่จะใช้คำง่าย ๆ อย่าง und, aber, weil ซ้ำ ๆ',
    rules: [
      'zwar ... aber ... (แม้ว่าจะ...แต่ว่า... ใช้ยอมรับข้อดีข้อหนึ่งก่อนจะแย้ง)',
      'nicht nur ... sondern auch ... (ไม่เพียงแต่...แต่ยัง...ด้วย ใช้เสริมน้ำหนัก)',
      'einerseits ... andererseits ... (ด้านหนึ่ง...ในอีกด้านหนึ่ง... ใช้แจกแจงสองมุมมอง)',
      'weder ... noch ... (ทั้งไม่...และไม่... ใช้ปฏิเสธทั้งคู่ ไม่ต้องมี nicht)',
      'Konnektoren พร้อม Inversion: deshalb, trotzdem, folglich, dennoch บังคับ Verb ตำแหน่งที่ 2'
    ],
    correct_examples: [
      {
        german: 'Homeoffice bietet zwar mehr Flexibilität, aber es erfordert auch hohe Selbstdisziplin.',
        thai: 'แม้ว่าโฮมออฟฟิศจะมอบความยืดหยุ่นที่มากกว่า ทว่ามันก็เรียกร้องวินัยในตนเองสูงเช่นกัน'
      },
      {
        german: 'Künstliche Intelligenz steigert nicht nur die Produktivität, sondern sie eröffnet auch neue Lernchancen.',
        thai: 'AI ไม่เพียงแต่ช่วยเพิ่มผลิตภาพ แต่ยังเปิดโอกาสในการเรียนรู้ใหม่ ๆ อีกด้วย'
      },
      {
        german: 'Die Kosten sind gestiegen; folglich müssen wir unsere Ausgaben reduzieren.',
        thai: 'ต้นทุนสูงขึ้น ด้วยเหตุนี้เราจึงจำเป็นต้องลดรายจ่ายลง'
      }
    ],
    incorrect_examples: [
      {
        german: 'Außerdem man kann die Zeit besser einteilen.',
        thai: 'นอกจากนี้คนเรายังสามารถจัดสรรเวลาได้ดีขึ้น',
        correction: 'Außerdem kann man die Zeit besser einteilen.',
        why_wrong_th: 'หลังคำเชื่อม außerdem กริยาต้องอยู่ตำแหน่งที่ 2 ทันที (เกิด Inversion: außerdem kann man...)'
      }
    ],
    quiz: [
      {
        question: 'ข้อใดใช้คำเชื่อมสองส่วนได้อย่างถูกต้อง?',
        options: [
          'Er spricht zwar Deutsch, aber er hat noch Schwierigkeiten mit der Grammatik.',
          'Er spricht zwar Deutsch, aber er nicht spricht fließend.',
          'Er spricht weder Deutsch noch er spricht Englisch nicht.',
          'Er spricht nicht nur Deutsch, aber auch Englisch.'
        ],
        correctIndex: 0,
        explanation_th: '"zwar ... aber" ใช้อย่างถูกต้องในการยอมรับข้อเท็จจริงแรกและแย้งประเด็นถัดมา'
      }
    ]
  },
  {
    id: 'lesson-passiv',
    title: 'โครงสร้างกรรมวาจก (Vorgangspassiv & Zustandspassiv)',
    german_title: 'Passivformen im akademischen Deutsch',
    topic: 'Passiv',
    cefr_level: 'B2',
    explanation_th:
      'ในงานเขียนเชิงวิชาการ รายงาน และบทความแสดงความคิดเห็นระดับ B2-C1 นิยมใช้โครงสร้าง Passiv เพื่อเน้นที่ตัวการกระทำหรือผลลัพธ์มากกว่าผู้กระทำ (Objektivität)',
    rules: [
      'Vorgangspassiv (เน้นกระบวนการ): werden (ผันตามประธานใหม่) + Partizip II (อยู่ท้ายสุด)',
      'Präteritum Passiv: wurde / wurden + Partizip II',
      'Passiv mit Modalverb: Modalverb (ผัน) + ... + Partizip II + werden',
      'ผู้กระทำ: von + Dativ (บุคคล/สิ่งมีชีวิต) หรือ durch + Akkusativ (สื่อกลาง/วิธีการ)'
    ],
    correct_examples: [
      {
        german: 'Die Ergebnisse der Studie werden nächste Woche veröffentlicht.',
        thai: 'ผลลัพธ์ของงานวิจัยจะได้รับการเผยแพร่ในสัปดาห์หน้า'
      },
      {
        german: 'Diese Richtlinien müssen von allen Mitarbeitern beachtet werden.',
        thai: 'แนวปฏิบัติเหล่านี้ต้องได้รับการปฏิบัติตามโดยพนักงานทุกคน'
      }
    ],
    incorrect_examples: [
      {
        german: 'Das Gesetz wurde von das Parlament beschlossen.',
        thai: 'กฎหมายได้รับการอนุมัติโดยรัฐสภา',
        correction: 'Das Gesetz wurde vom Parlament (von dem Parlament) beschlossen.',
        why_wrong_th: 'von บังคับ Dativ เสมอ: das Parlament -> dem Parlament -> vom Parlament'
      }
    ],
    quiz: [
      {
        question: 'แปลงประโยค "Der Arzt untersucht den Patienten" เป็น Vorgangspassiv:',
        options: [
          'Der Patient wird vom Arzt untersucht.',
          'Der Patient ist vom Arzt untersuchen.',
          'Der Patient wurde des Arztes untersucht.',
          'Der Patient wird durch den Arzt untersuchen.'
        ],
        correctIndex: 0,
        explanation_th: 'der Patient กลายเป็นประธาน + wird + vom Arzt + untersucht (Partizip II อยู่ท้ายสุด)'
      }
    ]
  },
  {
    id: 'lesson-konjunktiv-2',
    title: 'Konjunktiv II (สมมุติภาพ สุภาพ และการอภิปรายอย่างมีชั้นเชิง)',
    german_title: 'Konjunktiv II der Höflichkeit und Irrealität',
    topic: 'Konjunktiv II',
    cefr_level: 'B2',
    explanation_th:
      'Konjunktiv II ใช้ในการแสดงความสุภาพในจดหมาย/อีเมลทางการ (เช่น Ich wäre Ihnen dankbar...), การตั้งสมมุติฐานที่ตรงข้ามกับความเป็นจริง (Irreale Bedingungssätze), และการให้ข้อเสนอแนะเชิงวิชาการอย่างสุภาพ',
    rules: [
      'รูป würde + Infinitiv: ใช้กับกริยาทั่วไปเกือบทั้งหมด (z.B. ich würde vorschlagen)',
      'รูปแท้ (Stammformen): sein -> wäre, haben -> hätte, werden -> würde, wissen -> wüsste',
      'Modalverben ใน Konjunktiv II: können -> könnte, müssen -> müsste, sollen -> sollte, dürfen -> dürfte'
    ],
    correct_examples: [
      {
        german: 'Für eine baldige Rückmeldung wäre ich Ihnen sehr dankbar.',
        thai: 'ผม/ดิฉันจะขอบพระคุณเป็นอย่างยิ่งหากได้รับการตอบกลับโดยเร็ว'
      },
      {
        german: 'Wenn die Regierung mehr in Bildung investieren würde, gäbe es weniger Fachkräftemangel.',
        thai: 'หากรัฐบาลลงทุนในการศึกษามากกว่านี้ การขาดแคลนแรงงานทักษะสูงก็คงจะลดลง'
      }
    ],
    incorrect_examples: [
      {
        german: 'Ich will bitten Sie um eine Ermäßigung.',
        thai: 'ฉันต้องการขอให้คุณลดราคา (แข็งกระด้างเกินไป)',
        correction: 'Ich möchte Sie um eine Ermäßigung bitten. / Ich wäre Ihnen dankbar, wenn Sie...',
        why_wrong_th: 'ในจดหมายทางการระดับ B2 การใช้ "Ich will" ถือว่าไม่สุภาพอย่างยิ่ง ควรใช้ Konjunktiv II'
      }
    ],
    quiz: [
      {
        question: 'สำนวนขอร้องอย่างสุภาพในจดหมายทางการที่ถูกต้องคือข้อใด?',
        options: [
          'Könnten Sie mir bitte die Unterlagen zusenden?',
          'Können Sie mich die Unterlagen sofort schicken!',
          'Sie müssen mir die Unterlagen zusenden.',
          'Ich will die Unterlagen von Ihnen haben.'
        ],
        correctIndex: 0,
        explanation_th: 'Könnten Sie... เป็นรูป Konjunktiv II ที่สุภาพและเป็นมาตรฐานที่สุดในจดหมายเยอรมัน'
      }
    ]
  },
  {
    id: 'lesson-adjektivendungen',
    title: 'คำลงท้ายคำคุณศัพท์ (Adjektivdeklination: schwach, stark, gemischt)',
    german_title: 'Adjektivendungen im Kontext',
    topic: 'Adjektivdeklination',
    cefr_level: 'B1',
    explanation_th:
      'คำคุณศัพท์ที่วางหน้าคำนาม (attributive Adjektive) ต้องผันคำลงท้ายตาม 3 ปัจจัย: 1. มี Artikel นำหน้าแบบใด (ชี้เฉพาะ / ไม่ชี้เฉพาะ / ไม่มี) 2. เพศและพจน์ของคำนาม 3. การก (Kasus) ของคำนามนั้น',
    rules: [
      'Schwache Deklination (หลัง der, die, das...): เติม -e ใน Nom. Sg. และ Akk. Fem./Neut., ส่วนกรณีอื่นทั้งหมด (Dativ, Genitiv, Plural, Akk. Mask.) เติม -en เสมอ',
      'Gemischte Deklination (หลัง ein, kein, mein...): คล้าย schwach แต่ Nom. Mask. (-er), Nom./Akk. Neut. (-es)',
      'Starke Deklination (ไม่มี Artikel นำหน้า): คำคุณศัพท์ต้องรับหน้าที่บอกเพศและการก โดยเติมคำลงท้ายเหมือน der/die/das (ยกเว้น Gen. Mask./Neut. เติม -en)'
    ],
    correct_examples: [
      {
        german: 'Ich habe einen interessanten Ausflug gemacht.',
        thai: 'ฉันได้ไปเที่ยวหนึ่งทริปที่น่าสนใจมาก',
        note: 'ein + Akk. Maskulinum -> einen interessant-en Ausflug'
      },
      {
        german: 'Mit großem Interesse habe ich Ihre Anzeige gelesen.',
        thai: 'ดิฉัน/กระผมได้อ่านประกาศของคุณด้วยความสนใจเป็นอย่างยิ่ง',
        note: 'Starke Deklination ใน Dativ Maskulinum/Neutrum: mit groß-em Interesse'
      }
    ],
    incorrect_examples: [
      {
        german: 'Ich habe ein interessanter Film gesehen.',
        thai: 'ฉันดูหนังที่น่าสนใจเรื่องหนึ่ง',
        correction: 'Ich habe einen interessanten Film gesehen.',
        why_wrong_th: 'der Film เป็นกรรม Akkusativ เพศชาย: ein -> einen และ adjektiv -> interessanten'
      }
    ],
    quiz: [
      {
        question: 'เติมคำลงท้ายคุณศัพท์: "Wir wohnen in ein___ modern___ Wohnung." (die Wohnung, Dativ)',
        options: ['einer modernen', 'eine moderne', 'einen modernen', 'einem moderne'],
        correctIndex: 0,
        explanation_th: 'in + Dativ ของ die Wohnung คือ "in einer modernen Wohnung"'
      }
    ]
  },
  {
    id: 'lesson-nominalisierung',
    title: 'การแปลงเป็นคำนามเชิงวิชาการ (Nominalisierung & C1-Stil)',
    german_title: 'Nominalstil und Funktionsverbgefüge',
    topic: 'Nominalisierung',
    cefr_level: 'C1',
    explanation_th:
      'ลักษณะเด่นของภาษาเยอรมันระดับ C1 (Akademischer Stil) คือการเปลี่ยนประโยคที่ใช้กริยาเป็นกลุ่มคำนาม (Nominalisierung) และการใช้โครงสร้างกริยาเฉพาะกลุ่ม (Funktionsverbgefüge) เพื่อให้เนื้อความมีความกระชับ เป็นทางการ และแม่นยำทางวิชาการ',
    rules: [
      'Verb -> Nomen: diskutieren -> die Diskussion, einführen -> die Einführung, zunehmen -> die Zunahme',
      'Nebensatz mit weil -> Präpositionalphrase mit wegen/aufgrund (+ Genitiv)',
      'Funktionsverbgefüge: zur Verfügung stehen (พร้อมให้ใช้), in Betracht ziehen (พิจารณา), Kritik üben an (วิพากษ์วิจารณ์)'
    ],
    correct_examples: [
      {
        german: 'Aufgrund der zunehmenden Digitalisierung verändern sich traditionelle Lernprozesse.',
        thai: 'อันเนื่องมาจากการปรับเปลี่ยนสู่ระบบดิจิทัลที่เพิ่มขึ้นเรื่อย ๆ กระบวนการเรียนรู้แบบดั้งเดิมจึงกำลังแปรเปลี่ยนไป'
      },
      {
        german: 'Wir müssen diese Aspekte unbedingt in Betracht ziehen.',
        thai: 'พวกเราจำเป็นต้องนำประเด็นเหล่านี้มาพิจารณาอย่างรอบคอบ'
      }
    ],
    incorrect_examples: [
      {
        german: 'Weil die Preise immer mehr steigen, kaufen die Leute weniger.',
        thai: 'เพราะราคาขึ้นเรื่อย ๆ ผู้คนจึงซื้อน้อยลง (ระดับภาษาธรรมดา B1)',
        correction: 'Infolge des stetigen Preisanstiegs sinkt die Kaufkraft der Bevölkerung. (C1 Akademisch)',
        why_wrong_th: 'แม้ว่าประโยคเดิมจะไม่ผิดไวยากรณ์ แต่ในระดับ C1 ควรยกระดับสู่ Nominalstil เพื่อเพิ่มความลึกซึ้ง'
      }
    ],
    quiz: [
      {
        question: 'เปลี่ยนประโยค "Man muss das Thema diskutieren" ให้อยู่ในรูป Funktionsverbgefüge ระดับ C1:',
        options: [
          'Das Thema muss zur Diskussion stehen / gebracht werden.',
          'Das Thema muss diskutiert sein.',
          'Man diskutiert über das Thema viel.',
          'Das Thema hat eine Diskussion gemacht.'
        ],
        correctIndex: 0,
        explanation_th: '"zur Diskussion stehen / bringen" เป็นสำนวน FVG ที่เป็นมาตรฐานทางวิชาการ'
      }
    ]
  }
];
