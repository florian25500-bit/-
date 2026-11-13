import { GrammarLesson } from '../types';

export const GRAMMAR_LESSONS: GrammarLesson[] = [
  {
    id: 'lesson-praesens-satzbau',
    title: 'โครงสร้างประโยคพื้นฐาน V2 การผันกริยาปัจจุบัน และประโยคคำถาม (A1)',
    german_title: 'Präsens, Verbzweitstellung (V2) & W-Fragen',
    topic: 'Grundlagen',
    cefr_level: 'A1',
    explanation_th:
      'สำหรับงานเขียนระดับ A1 สิ่งสำคัญที่สุดคือการวางกริยาที่ผันตามประธานไว้ในตำแหน่งที่ 2 เสมอ (Verbzweitstellung) ในประโยคบอกเล่าและประโยคคำถามแบบ W-Frage รวมถึงการผันกริยาปัจจุบัน (Präsens) และแยกคำกริยาแยกส่วนได้ (Trennbare Verben) ให้ถูกต้อง',
    rules: [
      'ประโยคบอกเล่า: ตำแหน่งที่ 1 (ประธานหรือเวลา/สถานที่) + ตำแหน่งที่ 2 (กริยาที่ผันแล้ว) + ส่วนขยาย',
      'ประโยคคำถาม Ja/Nein: นำกริยาขึ้นตำแหน่งที่ 1 เช่น „Kommst du am Samstag?“',
      'ประโยคคำถาม W-Frage: คำถาม (Wo, Wann, Was, Warum) + กริยาตำแหน่งที่ 2 เช่น „Wann beginnt der Kurs?“',
      'คำกริยาแยกส่วนได้ (เช่น ankommen, einkaufen, mitbringen): ส่วนกริยาหลักอยู่ตำแหน่งที่ 2 ส่วนคำอุปสรรค (an-, ein-, mit-) ไปอยู่ท้ายประโยค'
    ],
    correct_examples: [
      {
        german: 'Am Samstag mache ich eine Geburtstagsparty.',
        thai: 'วันเสาร์ฉันจะจัดงานปาร์ตี้วันเกิด',
        note: 'เมื่อขึ้นต้นด้วยเวลา (Am Samstag) กริยา mache ยังคงอยู่ตำแหน่งที่ 2 หน้าประธาน ich'
      },
      {
        german: 'Kannst du bitte einen Salat mitbringen?',
        thai: 'ช่วยนำสลัดมาด้วยได้ไหม?',
        note: 'เมื่อมี Modalverb (kannst) กริยาหลัก (mitbringen) ไม่ต้องแยกส่วนและอยู่ท้ายประโยค'
      }
    ],
    incorrect_examples: [
      {
        german: 'Am Samstag ich mache eine Party.',
        thai: 'วันเสาร์ฉันจัดปาร์ตี้',
        correction: 'Am Samstag mache ich eine Party.',
        why_wrong_th: 'ภาษาเยอรมันห้ามวางประธานคั่นระหว่างคำบอกเวลากับกริยา ต้องสลับกริยา mache มาอยู่ตำแหน่งที่ 2'
      },
      {
        german: 'Ich nicht kann kommen.',
        thai: 'ฉันไม่สามารถมาได้',
        correction: 'Ich kann nicht kommen.',
        why_wrong_th: 'กริยาช่วย kann อยู่ตำแหน่งที่ 2 ส่วนกริยารูปเดิม kommen อยู่ท้ายประโยค'
      }
    ],
    quiz: [
      {
        question: 'ประโยคใดเรียงคำถูกต้องสำหรับระดับ A1?',
        options: [
          'Morgen ich gehe in den Deutschkurs.',
          'Morgen gehe ich in den Deutschkurs.',
          'Ich morgen gehe in den Deutschkurs.',
          'Gehe morgen ich in den Deutschkurs.'
        ],
        correctIndex: 1,
        explanation_th: 'เมื่อวาง Morgen ในตำแหน่งที่ 1 กริยาที่ผัน (gehe) ต้องอยู่ตำแหน่งที่ 2 ทันที'
      },
      {
        question: 'เลือกการผันและตำแหน่งคำที่ถูกต้องสำหรับกริยา "einkaufen":',
        options: [
          'Ich kaufe am Freitag im Supermarkt ein.',
          'Ich einkaufe am Freitag im Supermarkt.',
          'Ich ein am Freitag im Supermarkt kaufe.',
          'Am Freitag ich kaufe ein im Supermarkt.'
        ],
        correctIndex: 0,
        explanation_th: 'einkaufen เป็น trennbares Verb จึงแยก kaufe ไว้ตำแหน่งที่ 2 และย้าย ein ไปท้ายประโยค'
      }
    ]
  },
  {
    id: 'lesson-perfekt-modalverben',
    title: 'อดีตกาล Perfekt และการใช้กริยาช่วย Modalverben (A2)',
    german_title: 'Perfekt (haben/sein) & Modalverben im Alltag',
    topic: 'Perfekt',
    cefr_level: 'A2',
    explanation_th:
      'ในการสอบระดับ A2 ผู้เรียนมักต้องเล่าเหตุการณ์ที่ผ่านมาในจดหมาย/อีเมล (เช่น วันหยุดสุดสัปดาห์ งานเลี้ยง หรืออาการป่วย) โดยใช้โครงสร้างอดีตกาล Perfekt (haben/sein + Partizip II ท้ายประโยค) ควบคู่กับ Modalverben (können, müssen, möchten, sollen) และคำเชื่อมพื้นฐาน (und, aber, denn, weil, deshalb)',
    rules: [
      'Perfekt ใช้ haben กับกริยาทั่วไป และใช้ sein กับกริยาเคลื่อนที่เปลี่ยนตำแหน่ง/เปลี่ยนสภาพ (เช่น gehen, fahren, fliegen, kommen, bleiben, sein)',
      'Partizip II ต้องวางไว้ท้ายประโยคเสมอ เช่น „Wir haben am Sonntag einen Ausflug gemacht.“',
      'กริยา sein และ haben ในอดีตนิยมใช้รูป Präteritum คือ war / hatte เพื่อความกระชับเป็นธรรมชาติ',
      'หลังคำเชื่อม denn (เพราะว่า) กริยาอยู่ตำแหน่งที่ 2 เหมือนเดิม ต่างจาก weil ที่กริยาไปอยู่ท้ายประโยค'
    ],
    correct_examples: [
      {
        german: 'Am Wochenende bin ich mit Freunden nach München gefahren.',
        thai: 'สุดสัปดาห์ที่ผ่านมาฉันได้เดินทางไปมิวนิกกับเพื่อน ๆ',
        note: 'fahren เป็นกริยาเคลื่อนที่ จึงใช้ bin + gefahren (ท้ายประโยค)'
      },
      {
        german: 'Ich konnte leider nicht kommen, weil ich lange arbeiten musste.',
        thai: 'ฉันไม่สามารถมาได้เพราะฉันต้องทำงานดึก',
        note: 'กริยาช่วยอดีต (konnte / musste) สอดคล้องกับระดับ A2/B1'
      }
    ],
    incorrect_examples: [
      {
        german: 'Gestern ich habe einen Film gesehen.',
        thai: 'เมื่อวานฉันดูหนังมา',
        correction: 'Gestern habe ich einen Film gesehen.',
        why_wrong_th: 'กริยาช่วย habe ต้องอยู่ตำแหน่งที่ 2 หลังคำว่า Gestern'
      },
      {
        german: 'Am Samstag habe ich nach Berlin gefahren.',
        thai: 'วันเสาร์ฉันไปเบอร์ลินมา',
        correction: 'Am Samstag bin ich nach Berlin gefahren.',
        why_wrong_th: 'fahren เป็นกริยาแสดงการเคลื่อนย้ายสถานที่ ต้องใช้ sein (bin) ไม่ใช่ haben'
      }
    ],
    quiz: [
      {
        question: 'ประโยคใดใช้รูป Perfekt ได้ถูกต้อง?',
        options: [
          'Letzte Woche haben wir eine Reise nach Wien gemacht.',
          'Letzte Woche wir haben gemacht eine Reise nach Wien.',
          'Letzte Woche sind wir eine Reise nach Wien gemacht.',
          'Letzte Woche haben wir gemacht eine Reise nach Wien.'
        ],
        correctIndex: 0,
        explanation_th: 'machen ใช้กับ haben (ตำแหน่งที่ 2) และ Partizip II (gemacht) ต้องอยู่ท้ายประโยค'
      },
      {
        question: 'เติมกริยาช่วยในประโยค: „Am Sonntag ___ wir früh aufgestanden.“',
        options: ['haben', 'sind', 'werden', 'hatten'],
        correctIndex: 1,
        explanation_th: 'aufstehen เป็นกริยาเปลี่ยนสภาพ/เคลื่อนไหว จึงใช้ sein -> sind ... aufgestanden'
      }
    ]
  },
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
  },
  {
    id: 'lesson-negation-zeitangaben-a1',
    title: 'การปฏิเสธ (nicht/kein) และคำบอกเวลาในอีเมล (am, um, im) (A1)',
    german_title: 'Negation, Präpositionen der Zeit & Possessivartikel',
    topic: 'Alltagsschreiben',
    cefr_level: 'A1',
    explanation_th:
      'ในการเขียนอีเมลหรือจดหมายสั้นระดับ A1 (เช่น นัดพบ ยกเลิกนัด หรือเชิญเพื่อน) ผู้เรียนต้องใช้คำบอกเวลาให้ถูกคู่ (am + วัน, um + เวลา, im + เดือน) และเลือกใช้คำปฏิเสธ nicht กับ kein ให้ตรงชนิดคำ รวมถึงคำแสดงความเป็นเจ้าของ (mein/meine, dein/deine) ตามเพศของคำนาม',
    rules: [
      'เวลา: am + วัน/ช่วงวัน (am Montag, am Wochenende), um + นาฬิกา (um 18 Uhr), im + เดือน/ฤดู (im Juli, im Sommer)',
      'kein / keine ใช้ปฏิเสธคำนามที่มี Artikel ไม่ชี้เฉพาะ (ein/eine) หรือไม่มี Artikel เช่น „Ich habe keine Zeit.“',
      'nicht ใช้ปฏิเสธกริยา คุณศัพท์ หรือคำนามที่มี der/die/das หรือ mein/dein เช่น „Ich kann heute nicht kommen.“',
      'คำแสดงความเป็นเจ้าของ: mein/dein ใช้กับเพศชายและกลาง (mein Freund), meine/deine ใช้กับเพศหญิงและพหูพจน์ (meine Party)'
    ],
    correct_examples: [
      {
        german: 'Am Samstag um 19 Uhr mache ich eine Party, aber mein Bruder kann leider nicht kommen.',
        thai: 'วันเสาร์เวลา 19 นาฬิกาฉันจะจัดงานปาร์ตี้ แต่น่าเสียดายที่พี่ชายของฉันมาไม่ได้',
        note: 'am Samstag + um 19 Uhr ถูกต้อง และใช้ nicht ปฏิเสธกริยา kommen'
      },
      {
        german: 'Tut mir leid, ich habe morgen leider keine Zeit.',
        thai: 'ขอโทษด้วย พรุ่งนี้ฉันไม่มีเวลาเลย',
        note: 'Zeit เป็นคำนามเพศหญิง (die Zeit) จึงใช้ keine Zeit'
      }
    ],
    incorrect_examples: [
      {
        german: 'Ich habe nicht Zeit am Sonntag.',
        thai: 'วันอาทิตย์ฉันไม่มีเวลา',
        correction: 'Ich habe am Sonntag keine Zeit.',
        why_wrong_th: 'คำนามที่ไม่มี Artikel เช่น Zeit ต้องปฏิเสธด้วย kein/keine ไม่ใช่ nicht'
      },
      {
        german: 'Wir treffen uns in Samstag an 15 Uhr.',
        thai: 'พวกเรานัดเจอกันวันเสาร์เวลา 15 นาฬิกา',
        correction: 'Wir treffen uns am Samstag um 15 Uhr.',
        why_wrong_th: 'วันในสัปดาห์ใช้ am และเวลาเป็นนาฬิกาใช้ um เสมอ'
      }
    ],
    quiz: [
      {
        question: 'เลือกคำบุพบทบอกเวลาที่ถูกต้อง: „Der Deutschkurs beginnt ___ Montag ___ 9 Uhr.“',
        options: ['am / um', 'in / an', 'um / am', 'im / um'],
        correctIndex: 0,
        explanation_th: 'วันในสัปดาห์ใช้ am (am Montag) และเวลาตามนาฬิกาใช้ um (um 9 Uhr)'
      },
      {
        question: 'ประโยคใดปฏิเสธคำนามได้ถูกต้อง?',
        options: [
          'Ich habe heute kein Geld mit.',
          'Ich habe heute nicht Geld mit.',
          'Ich habe heute keine Geld mit.',
          'Ich nicht habe Geld mit.'
        ],
        correctIndex: 0,
        explanation_th: 'das Geld เป็นเพศกลาง ไม่มี Artikel เมื่อปฏิเสธจึงใช้ kein Geld'
      }
    ]
  },
  {
    id: 'lesson-brief-anrede-schluss',
    title: 'โครงสร้างจดหมายและอีเมล: Anrede, Register (du/Sie) และคำลงท้าย (A2)',
    german_title: 'Brief- & E-Mail-Aufbau: Anrede, Grußformeln & Register',
    topic: 'Brief & E-Mail',
    cefr_level: 'A2',
    explanation_th:
      'คะแนนหมวด Register & Stil และ Aufgabenbewältigung ในข้อสอบเขียนตั้งแต่ A1–B2 ขึ้นอยู่กับการเลือกคำขึ้นต้น (Anrede) การใช้สรรพนามให้คงเส้นคงวา (du/ihr กับคนสนิท หรือ Sie/Ihnen กับบุคคลทางการ/ร้านค้า) และคำลงท้าย (Grußformel) ให้ตรงกับผู้รับในโจทย์',
    rules: [
      'แบบเป็นกันเอง (เพื่อน/ครอบครัว - du): ขึ้นต้น „Liebe Anna,“ / „Lieber Lukas,“ -> ใช้สรรพนาม du, dir, dich, dein -> ลงท้าย „Viele Grüße“ / „Liebe Grüße“',
      'แบบสุภาพถึงบุคคลที่รู้จักชื่อ (คุณครู/หมอ/เพื่อนร่วมงาน - Sie): „Sehr geehrte Frau Klein,“ / „Sehr geehrter Herr Weber,“ -> ใช้ Sie, Ihnen, Ihr -> ลงท้าย „Mit freundlichen Grüßen“',
      'แบบทางการไม่ระบุชื่อ (โรงแรม/ร้านอาหาร/บริษัท - Sie): „Sehr geehrte Damen und Herren,“ + ประโยคแรกหลังจุลภาคขึ้นต้นด้วยตัวพิมพ์เล็ก (ยกเว้นคำนามและ Sie/Ihnen)',
      'ประโยคขึ้นต้นและปิดท้ายมาตรฐาน: „Vielen Dank für deine/Ihre E-Mail.“ และ „Ich freue mich auf deine/Ihre Antwort.“'
    ],
    correct_examples: [
      {
        german: 'Sehr geehrte Damen und Herren, ich möchte für Samstag einen Tisch reservieren.',
        thai: 'เรียนท่านผู้เกี่ยวข้อง กระผม/ดิฉันขอจองโต๊ะสำหรับวันเสาร์ครับ/ค่ะ',
        note: 'หลังจุลภาคในคำขึ้นต้น ขึ้นต้นคำแรก (ich) ด้วยตัวพิมพ์เล็กตามมาตรฐานอักขรวิธีเยอรมัน'
      },
      {
        german: 'Liebe Maria, vielen Dank für deine Hilfe! Bis bald, dein Tom',
        thai: 'ถึงมาเรีย ขอบคุณมากสำหรับความช่วยเหลือนะ! แล้วเจอกันเร็ว ๆ นี้ จากทอม',
        note: 'ใช้ du/dein สอดคล้องกันทั้งฉบับสำหรับเพื่อนสนิท'
      }
    ],
    incorrect_examples: [
      {
        german: 'Sehr geehrte Frau Klein, danke für deine Hilfe!',
        thai: 'เรียนคุณไคลน์ ขอบคุณสำหรับความช่วยเหลือของเธอ (สลับระดับภาษา)',
        correction: 'Sehr geehrte Frau Klein, vielen Dank für Ihre Hilfe!',
        why_wrong_th: 'ขึ้นต้นแบบสุภาพ (Sehr geehrte Frau...) ห้ามสลับไปใช้ deine ต้องใช้ Ihre ให้คงที่ทั้งฉบับ'
      },
      {
        german: 'Hallo Chef, ich will morgen frei. Tschüss!',
        thai: 'หวัดดีหัวหน้า พรุ่งนี้ฉันจะลาหยุด บาย!',
        correction: 'Sehr geehrter Herr Becker, könnte ich morgen bitte einen Tag Urlaub nehmen? Mit freundlichen Grüßen',
        why_wrong_th: 'กับหัวหน้างานหรือองค์กรควรใช้คำขึ้นต้นและคำลงท้ายแบบทางการ พร้อมคำขอร้องที่สุภาพ'
      }
    ],
    quiz: [
      {
        question: 'หากโจทย์กำหนดให้เขียนอีเมลถึงโรงแรม (Hotel am Bahnhof) ควรขึ้นต้นและลงท้ายอย่างไร?',
        options: [
          'Sehr geehrte Damen und Herren, ... / Mit freundlichen Grüßen',
          'Liebe Hotel, ... / Liebe Grüße',
          'Hallo Freunde, ... / Viele Grüße',
          'Sehr geehrter Herr Hotel, ... / Bis bald'
        ],
        correctIndex: 0,
        explanation_th: 'เมื่อเขียนถึงองค์กรหรือโรงแรมโดยไม่ระบุชื่อผู้รับ ให้ใช้ „Sehr geehrte Damen und Herren,“ และลงท้ายด้วย „Mit freundlichen Grüßen“'
      },
      {
        question: 'หลังเครื่องหมายจุลภาคใน „Liebe Anna,“ คำถัดไปควรเขียนอย่างไร?',
        options: [
          'ขึ้นต้นด้วยตัวพิมพ์เล็ก (เช่น „ich schreibe dir...“)',
          'ขึ้นต้นด้วยตัวพิมพ์ใหญ่เสมอแม้เป็นสรรพนาม',
          'เว้นบรรทัดแล้วไม่ต้องใช้ตัวพิมพ์ใหญ่กับคำนาม',
          'ใส่เครื่องหมายอัศเจรีย์แทนจุลภาคแล้วตามด้วยตัวเล็ก'
        ],
        correctIndex: 0,
        explanation_th: 'ตามกฎเยอรมันสมัยใหม่ หลังจุลภาคใน Anrede ให้ขึ้นต้นบรรทัดใหม่ด้วยตัวพิมพ์เล็ก (ยกเว้นคำนามหรือคำสุภาพ Sie/Ihnen)'
      }
    ]
  },
  {
    id: 'lesson-kommasetzung-rechtschreibung',
    title: 'เครื่องหมายจุลภาค (Kommasetzung), das vs. dass และตัวพิมพ์ใหญ่ในงานเขียน (B1)',
    german_title: 'Zeichensetzung, das/dass & Großschreibung',
    topic: 'Zeichensetzung',
    cefr_level: 'B1',
    explanation_th:
      'หมวด Rechtschreibung & Zeichensetzung มักเสียคะแนนง่ายที่สุดจาก 3 จุด คือ การลืมใส่จุลภาคหน้าอนุประโยค (weil, dass, obwohl), การใช้ das (คำนำหน้านาม/สรรพนาม) สลับกับ dass (คำเชื่อมว่า...), และการลืมขึ้นต้นคำนามหรือคำกริยา/คุณศัพท์ที่ทำหน้าที่เป็นคำนามด้วยตัวพิมพ์ใหญ่',
    rules: [
      'ใส่ Komma คั่นหน้าและหลังอนุประโยคเสมอ: weil, dass, obwohl, wenn, damit, während, nachdem รวมถึงหน้า aber, sondern, jedoch',
      'ไม่ต้องใส่ Komma หน้า und / oder เมื่อเชื่อมคำหรือกลุ่มคำที่มีระดับเท่ากัน (เช่น „Bücher und Hefte“)',
      'das (s ตัวเดียว) = Artikel/Demonstrativpronomen/Relativpronomen (แทนที่ด้วย dieses/welches ได้) ส่วน dass (ss) = คำเชื่อมประโยคย่อย (Verb อยู่ท้ายสุด)',
      'คำนามทุกคำ และกริยา/คุณศัพท์หลัง Artikel หรือคำอย่าง etwas/viel/nichts ต้องขึ้นต้นตัวพิมพ์ใหญ่ เช่น „beim Schreiben“, „etwas Wichtiges“'
    ],
    correct_examples: [
      {
        german: 'Ich glaube, dass das Thema beim Schreiben eine wichtige Rolle spielt.',
        thai: 'ฉันคิดว่าหัวข้อนี้มีบทบาทสำคัญในการเขียน',
        note: 'dass เชื่อมอนุประโยค + das Thema เป็น Artikel + beim Schreiben ใช้ตัวพิมพ์ใหญ่'
      },
      {
        german: 'Das Buch, das ich gestern gekauft habe, ist sehr spannend.',
        thai: 'หนังสือที่ฉันซื้อมาเมื่อวานน่าตื่นเต้นมาก',
        note: 'das ตัวที่สองเป็น Relativpronomen (แทนด้วย welches ได้) จึงใช้ s ตัวเดียว และมี Komma ปิดท้ายอนุประโยค'
      }
    ],
    incorrect_examples: [
      {
        german: 'Ich hoffe das du bald kommst weil wir viel besprechen müssen.',
        thai: 'ฉันหวังว่าเธอจะมาเร็ว ๆ นี้เพราะเราต้องคุยกันหลายเรื่อง',
        correction: 'Ich hoffe, dass du bald kommst, weil wir viel besprechen müssen.',
        why_wrong_th: 'ต้องใส่ Komma หน้า dass และ weil และ „ว่า...“ ต้องสะกด dass (ss สองตัว)'
      },
      {
        german: 'Wir haben etwas neues über die arbeit gelernt.',
        thai: 'พวกเราได้เรียนรู้สิ่งใหม่ ๆ เกี่ยวกับการทำงาน',
        correction: 'Wir haben etwas Neues über die Arbeit gelernt.',
        why_wrong_th: 'หลัง etwas คุณศัพท์ทำหน้าที่เป็นคำนาม (Neues) และคำนามแท้ (Arbeit) ต้องขึ้นต้นตัวพิมพ์ใหญ่'
      }
    ],
    quiz: [
      {
        question: 'ประโยคใดใช้ das / dass และใส่เครื่องหมายจุลภาคได้ถูกต้อง?',
        options: [
          'Es ist schade, dass das Wetter heute so schlecht ist.',
          'Es ist schade das dass Wetter heute so schlecht ist.',
          'Es ist schade, das das Wetter heute so schlecht ist.',
          'Es ist schade dass, das Wetter heute so schlecht ist.'
        ],
        correctIndex: 0,
        explanation_th: 'ใส่ Komma ก่อนคำเชื่อม dass (ซึ่งแปลว่า "ว่า") และใช้ das กับคำนาม das Wetter'
      },
      {
        question: 'ข้อใดสะกดตัวพิมพ์ใหญ่-เล็ก (Groß-/Kleinschreibung) ถูกต้อง?',
        options: [
          'Beim Lesen habe ich viel Neues entdeckt.',
          'beim lesen habe ich viel neues entdeckt.',
          'Beim lesen habe ich viel Neues entdeckt.',
          'Beim Lesen habe ich viel neues entdeckt.'
        ],
        correctIndex: 0,
        explanation_th: 'beim (= bei dem) ทำให้ Lesen กลายเป็นคำนาม และหลัง viel คุณศัพท์ Neues เป็นคำนาม จึงใช้ตัวพิมพ์ใหญ่ทั้งคู่'
      }
    ]
  },
  {
    id: 'lesson-relativsaetze',
    title: 'ประโยคขยายความ (Relativsätze) และ Infinitiv mit zu / um... zu (B1)',
    german_title: 'Relativsätze & Infinitivkonstruktionen für flüssiges Schreiben',
    topic: 'Satzverknüpfung',
    cefr_level: 'B1',
    explanation_th:
      'หากต้องการเขียนให้พ้นระดับประโยคสั้น ๆ แบบ A2 และได้คะแนนดีในระดับ B1–B2 ต้องรู้จักขยายคำนามด้วย Relativsätze (ที่/ซึ่ง...) และบอกจุดประสงค์หรือขยายความคิดด้วย um ... zu (เพื่อที่จะ...), ohne ... zu (โดยปราศจาก...) และ es ist wichtig, ... zu + Infinitiv',
    rules: [
      'Relativpronomen (der, die, das / denen / dessen) เลือกเพศและพจน์ตามคำนามข้างหน้า แต่เลือกการก (Kasus) ตามหน้าที่ในอนุประโยคขยาย (Verb อยู่ท้ายสุด)',
      'พหูพจน์ Dativ ใช้ „denen“ เสมอ เช่น „Die Freunde, denen ich geholfen habe...“',
      'um ... zu + Infinitiv ใช้บอกจุดประสงค์เมื่อประธานของสองส่วนเป็นคนเดียวกัน เช่น „Ich lerne Deutsch, um in Berlin zu studieren.“',
      'เมื่อประธานต่างกัน ใช้ „damit“ แทน „um ... zu“ เช่น „Ich erkläre es langsam, damit alle es verstehen.“'
    ],
    correct_examples: [
      {
        german: 'Das ist ein Problem, über das wir dringend sprechen müssen.',
        thai: 'นี่คือปัญหาที่เราจำเป็นต้องพูดคุยกันอย่างเร่งด่วน',
        note: 'sprechen über + Akk -> über das, กริยาแท้ müssen อยู่ท้ายประโยคขยาย'
      },
      {
        german: 'Viele Menschen treiben regelmäßig Sport, um gesund zu bleiben.',
        thai: 'ผู้คนจำนวนมากออกกำลังกายสม่ำเสมอเพื่อที่จะมีสุขภาพแข็งแรง',
        note: 'ใส่ Komma หน้า um และวาง zu หน้ากริยา Infinitiv (bleiben)'
      }
    ],
    incorrect_examples: [
      {
        german: 'Der Kurs, den ich besuche ihn, ist sehr nützlich.',
        thai: 'คอร์สที่ฉันเข้าเรียนมันมีประโยชน์มาก',
        correction: 'Der Kurs, den ich besuche, ist sehr nützlich.',
        why_wrong_th: 'Relativpronomen (den) แทนกรรมไปแล้ว ห้ามใส่สรรพนามซ้ำ (ihn) ในประโยคขยายอีก'
      },
      {
        german: 'Ich schreibe dir, um du kommst zur Party.',
        thai: 'ฉันเขียนหาเธอเพื่อเธอจะมาปาร์ตี้',
        correction: 'Ich schreibe dir, damit du zur Party kommst.',
        why_wrong_th: 'เมื่อประธานสองฝั่งต่างกัน (ich vs. du) ต้องใช้ damit ไม่ใช่ um ... zu'
      }
    ],
    quiz: [
      {
        question: 'เติม Relativpronomen ที่ถูกต้อง: „Die Kollegin, ___ ich gestern eine E-Mail geschickt habe, hat schon geantwortet.“',
        options: ['der', 'die', 'den', 'deren'],
        correctIndex: 0,
        explanation_th: 'schicken + Dativ, die Kollegin (เพศหญิง) ใน Dativ คือ der'
      },
      {
        question: 'ประโยคใดใช้โครงสร้างบอกจุดประสงค์ถูกต้องเมื่อประธานเป็นคนเดียวกัน?',
        options: [
          'Ich übe jeden Tag, um bessere Aufsätze zu schreiben.',
          'Ich übe jeden Tag, um bessere Aufsätze schreiben.',
          'Ich übe jeden Tag, damit bessere Aufsätze zu schreiben.',
          'Ich übe jeden Tag, für bessere Aufsätze schreiben.'
        ],
        correctIndex: 0,
        explanation_th: 'โครงสร้างมาตรฐานคือ „um ... zu + Infinitiv“ -> um bessere Aufsätze zu schreiben'
      }
    ]
  },
  {
    id: 'lesson-stellungnahme-redemittel',
    title: 'โครงสร้างเรียงความและชุดสำนวน (Redemittel) สำหรับ Stellungnahme & Beschwerde (B2)',
    german_title: 'Textaufbau & Redemittel für Argumentation und Reklamation',
    topic: 'Textaufbau & Stil',
    cefr_level: 'B2',
    explanation_th:
      'งานเขียนระดับ B2 (เช่น Stellungnahme หรือ Beschwerde) ต้องการโครงสร้างย่อหน้าที่ชัดเจน (บทนำ → ข้อดี/เหตุผล → ข้อเสีย/ข้อโต้แย้ง → ข้อเสนอแนะ/สรุป) พร้อมชุดสำนวนมาตรฐาน (Redemittel) เพื่อแสดงความคิดเห็น ชั่งน้ำหนักประเด็น และเขียนข้อร้องเรียนอย่างสุภาพแต่หนักแน่น',
    rules: [
      'บทนำ (Einleitung): „In der heutigen Gesellschaft wird häufig darüber diskutiert, ob...“ / „Im Folgenden möchte ich zu diesem Thema Stellung nehmen.“',
      'เปิดประเด็นและยกตัวอย่าง (Argumentation): „Ein wesentliches Argument für ... ist, dass...“ / „Dies lässt sich am Beispiel von ... verdeutlichen.“',
      'หักล้าง/ชั่งน้ำหนัก (Abwägen): „Dem steht jedoch entgegen, dass...“ / „Allerdings darf man nicht außer Acht lassen, dass...“',
      'จดหมายร้องเรียน (Beschwerde): „Leider entsprach ... nicht meinen Erwartungen.“ / „Ich fordere Sie auf, bis zum [Datum] für Abhilfe zu sorgen.“',
      'สรุป (Fazit): „Zusammenfassend lässt sich festhalten, dass...“ / „Aus den genannten Gründen bin ich überzeugt, dass...“'
    ],
    correct_examples: [
      {
        german: 'Einerseits bietet das Lernen mit digitalen Medien große Flexibilität, andererseits darf der persönliche Austausch nicht vernachlässigt werden.',
        thai: 'ในด้านหนึ่งการเรียนรู้ผ่านสื่อดิจิทัลให้ความยืดหยุ่นสูง แต่อีกด้านหนึ่งการมีปฏิสัมพันธ์โดยตรงก็ไม่อาจละเลยได้',
        note: 'ชั่งน้ำหนักสองด้านอย่างสมดุลตรงตามเกณฑ์ B2 Inhalt & Entwicklung'
      },
      {
        german: 'Da die zugesagten Leistungen nicht erbracht wurden, bitte ich um eine angemessene Teilrückerstattung bis zum 15. Mai.',
        thai: 'เนื่องจากไม่ได้รับบริการตามที่ตกลงไว้ จึงขอความกรุณาคืนเงินบางส่วนอย่างเหมาะสมภายในวันที่ 15 พฤษภาคม',
        note: 'ใช้สำนวนทางการและกำหนดเส้นตาย (Fristsetzung) ชัดเจนในงานเขียน Beschwerde'
      }
    ],
    incorrect_examples: [
      {
        german: 'Ich finde das Thema gut. Viele Leute machen das. Aber es ist auch schlecht.',
        thai: 'ฉันคิดว่าเรื่องนี้ดี คนทำเยอะ แต่มันก็แย่เหมือนกัน (เรียบง่ายเกินระดับ B2)',
        correction: 'Meiner Auffassung nach bringt diese Entwicklung zwar erhebliche Vorteile mit sich, birgt jedoch auch nicht zu unterschätzende Risiken.',
        why_wrong_th: 'ระดับ B2 ต้องหลีกเลี่ยงคำกว้าง ๆ อย่าง gut/schlecht และใช้ Redemittel ที่เจาะจงและเชื่อมโยงเหตุผลชัดเจน'
      }
    ],
    quiz: [
      {
        question: 'สำนวนใดเหมาะที่สุดสำหรับขึ้นต้นบทสรุป (Fazit) ในเรียงความระดับ B2?',
        options: [
          'Zusammenfassend lässt sich sagen, dass eine ausgewogene Lösung notwendig ist.',
          'Das ist alles, tschüss und vielen Dank für das Lesen.',
          'Ich bin fertig mit meiner Meinung jetzt.',
          'Zum Beispiel möchte ich am Ende noch sagen.'
        ],
        correctIndex: 0,
        explanation_th: '„Zusammenfassend lässt sich sagen / festhalten, dass...“ เป็น Redemittel มาตรฐานสำหรับบทสรุป'
      },
      {
        question: 'ในจดหมายร้องเรียน (Beschwerde) ข้อใดสื่อสารได้ตรงตามมารยาททางการระดับ B2?',
        options: [
          'Sollte ich bis zum 20. Juni keine Rückmeldung erhalten, behalte ich mir rechtliche Schritte vor.',
          'Geben Sie mir sofort mein Geld zurück, das ist eine Frechheit!',
          'Warum arbeiten Sie so schlecht? Ich bin sehr böse.',
          'Bitte antworten Sie mir, wenn Sie Zeit haben, oder egal.'
        ],
        correctIndex: 0,
        explanation_th: 'การตั้งเงื่อนไขด้วย Konjunktiv/Inversion („Sollte ich..., behalte ich mir... vor“) มีความสุภาพ หนักแน่น และเป็นมืออาชีพ'
      }
    ]
  },
  {
    id: 'lesson-partizipialattribute-c1',
    title: 'ส่วนขยายหน้าคำนาม (Partizipialattribute), Konjunktiv I และสำนวนวิชาการ C1',
    german_title: 'Partizipialattribute, indirekte Rede & Wissenschaftsstil',
    topic: 'Akademischer Stil',
    cefr_level: 'C1',
    explanation_th:
      'งานเขียนระดับ C1 (Erörterung / Bericht) โดดเด่นด้วยความกระชับเชิงสาระ (Informationsdichte) และการอ้างอิงมุมมองอย่างเป็นกลางโดยใช้ Partizipialattribute (เปลี่ยนประโยคขยาย Relativsatz มาไว้หน้าคำนาม), Konjunktiv I (อ้างคำกล่าว/งานวิจัย) และคำแสดงความเห็นเชิงวิชาการแบบระมัดระวัง (Hedging)',
    rules: [
      'Partizip I (กำลังกระทำ - aktiv): กริยา + -d + คำลงท้ายคุณศัพท์ เช่น „die weltweit steigende Nachfrage“ (แทน „die Nachfrage, die weltweit steigt“)',
      'Partizip II (ถูกกระทำ - passiv): เช่น „die von Fachleuten geforderten Reformen“ (แทน „die Reformen, die von Fachleuten gefordert werden“)',
      'Konjunktiv I สำหรับรายงานคำกล่าว/สถิติ: sein -> sei/seien, haben -> habe/hätten, geben -> gebe เช่น „Laut einer Studie sei die Quote gesunken.“',
      'Hedging เชิงวิชาการ: „Es liegt nahe, dass...“, „Es lässt sich konstatieren, dass...“, „Dies deutet darauf hin, dass...“'
    ],
    correct_examples: [
      {
        german: 'Die von zahlreichen Wissenschaftlern prognostizierten Veränderungen erfordern ein Umdenken in der Bildungspolitik.',
        thai: 'การเปลี่ยนแปลงที่นักวิชาการจำนวนมากคาดการณ์ไว้ จำเป็นต้องอาศัยการปรับกระบวนทัศน์ในนโยบายการศึกษา',
        note: 'ใช้ Partizipialattribut (die ... prognostizierten Veränderungen) ยุบประโยคขยายได้กระชับระดับ C1'
      },
      {
        german: 'Dem Bericht zufolge habe sich die Situation in ländlichen Regionen kaum verbessert.',
        thai: 'ตามรายงานระบุว่าสถานการณ์ในพื้นที่ชนบทยังแทบไม่ดีขึ้นเลย',
        note: 'ใช้ Dativ-Präposition „zufolge“ ร่วมกับ Konjunktiv I (habe ... verbessert) อย่างเป็นกลาง'
      }
    ],
    incorrect_examples: [
      {
        german: 'Die Studenten, die viel Stress haben, lernen schlechter. Man sagt, dass es wahr ist.',
        thai: 'นักศึกษาที่มีความเครียดมากเรียนได้แย่ลง เขาว่ากันว่ามันเป็นเรื่องจริง (ภาษาธรรมดาเกินระดับ C1)',
        correction: 'Stark belastete Studierende weisen häufiger Leistungseinbußen auf, was empirische Erhebungen nahelegen.',
        why_wrong_th: 'ระดับ C1 หลีกเลี่ยง „Man sagt“ และเปลี่ยน Relativsatz พื้นฐานให้กระชับเป็นกลุ่มคำนาม/Partizipialattribut'
      }
    ],
    quiz: [
      {
        question: 'ข้อใดแปลง „Die Maßnahmen, die gestern beschlossen wurden“ เป็น Partizipialattribut ได้ถูกต้อง?',
        options: [
          'die gestern beschlossenen Maßnahmen',
          'die gestern beschließenden Maßnahmen',
          'die gestern zu beschließen Maßnahmen',
          'die gestern beschlossen Maßnahmen'
        ],
        correctIndex: 0,
        explanation_th: 'เป็นการถูกกระทำในอดีต (Passiv) จึงใช้ Partizip II (beschlossen) พร้อมคำลงท้าย -en หลัง die พหูพจน์'
      },
      {
        question: 'ข้อใดใช้ Konjunktiv I ในการอ้างอิงแหล่งข้อมูลได้ถูกต้องตามมาตรฐาน C1?',
        options: [
          'Die Autorin betont, der Arbeitsmarkt befinde sich in einem tiefgreifenden Wandel.',
          'Die Autorin betont, der Arbeitsmarkt befindet sich in ein Wandel.',
          'Die Autorin betont, dass der Arbeitsmarkt ist in einem Wandel.',
          'Die Autorin betont, der Arbeitsmarkt sei gewesen in einem Wandel.'
        ],
        correctIndex: 0,
        explanation_th: '„befinde sich“ เป็นรูป Konjunktiv I เอกพจน์บุรุษที่ 3 ที่ถูกต้องสำหรับการรายงานข้อคิดเห็นอย่างเป็นกลาง'
      }
    ]
  }
];
