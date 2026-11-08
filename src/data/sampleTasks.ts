import { WritingTask } from '../types';

export const SAMPLE_TASKS: WritingTask[] = [
  {
    id: 'task-b2-001',
    task_id: 'DE-B2-001',
    language: 'de',
    cefr_level: 'B2',
    category: 'Stellungnahme',
    topic: 'Homeoffice und Arbeitswelt',
    title: 'Homeoffice: Chance oder Belastung für Beschäftigte?',
    instructions:
      'Immer mehr Unternehmen bieten ihren Mitarbeitenden die Möglichkeit, von zu Hause aus zu arbeiten. Schreiben Sie einen Diskussionsbeitrag für ein Online-Forum zum Thema Homeoffice.',
    requirements: [
      'Erörtern Sie sowohl Vorteile als auch Nachteile der Telearbeit.',
      'Gehen Sie auf die Produktivität und die Work-Life-Balance ein.',
      'Nennen Sie konkrete Beispiele aus Ihrem eigenen Alltag oder Umfeld.',
      'Formulieren Sie eine begründete persönliche Schlussfolgerung.'
    ],
    min_words: 180,
    max_words: 230,
    time_limit_minutes: 35,
    task_version: '1.0',
    sample_outline: [
      'Einleitung: Aktuelle Bedeutung des Themas Homeoffice',
      'Vorteile: Zeitersparnis, Flexibilität, Konzentration',
      'Nachteile: Soziale Isolation, Entgrenzung von Arbeit und Freizeit',
      'Eigene Erfahrung und persönliches Fazit'
    ],
    sample_starter: 'Heutzutage gewinnt das Arbeiten von zu Hause aus immer mehr an Bedeutung...',
    preset_draft: `Heutzutage ist das Thema Homeoffice sehr aktuell. Viele Unternehmen bieten ihren Mitarbeitern die Möglichkeit, von zu Hause zu arbeiten. In diesem Beitrag möchte ich meine persönliche Meinung dazu äußern.

Einerseits hat Homeoffice viele Vorteile. Man spart viel Zeit, weil man muss nicht jeden Tag im Stau stehen. Außerdem man kann seine Arbeitszeit flexibler einteilen. Obwohl ich bin zu Hause oft produktiver, gibt es auch einige Nachteile. 

Andererseits führt die Arbeit am heimischen Schreibtisch oft zu soziale Isolation. Der direkte Kontakt mit den Kollegen fehlt, und die Grenze zwischen Arbeit und Freizeit verschwindet. Zum Beispiel, mein Bruder arbeitet seit zwei Jahren im Homeoffice und er klagt oft über Rückenschmerzen und Einsamkeit.

Zusammenfassend lässt sich sagen, dass Homeoffice sowohl Vor- als auch Nachteile mitbringt. Meiner Meinung nach wäre eine hybride Lösung, bei der man zwei Tage im Büro und drei Tage zu Hause arbeitet, am Besten für die meisten Menschen.`
  },
  {
    id: 'task-b1-001',
    task_id: 'DE-B1-001',
    language: 'de',
    cefr_level: 'B1',
    category: 'E-Mail',
    topic: 'Freizeit und Ausflug',
    title: 'Ein gelungener Wochenendausflug',
    instructions:
      'Sie haben am vergangenen Wochenende einen interessanten Ausflug in die Berge oder an einen See gemacht. Schreiben Sie eine E-Mail an Ihren Freund Thomas.',
    requirements: [
      'Beschreiben Sie den Ausflug (Wohin sind Sie gefahren und wie war das Wetter?).',
      'Erzählen Sie, was Ihnen besonders gut gefallen hat.',
      'Machen Sie einen konkreten Vorschlag für einen gemeinsamen Ausflug nächsten Monat.'
    ],
    min_words: 80,
    max_words: 110,
    time_limit_minutes: 20,
    task_version: '1.0',
    sample_outline: [
      'Anrede und freundliche Einleitung',
      'Bericht über den Ausflug und Aktivitäten',
      'Vorschlag für ein baldiges Treffen und Verabschiedung'
    ],
    sample_starter: 'Lieber Thomas, wie geht es dir? Ich hoffe, alles ist gut bei dir...',
    preset_draft: `Lieber Thomas,

wie geht es dir? Ich hoffe, es geht dir gut. Letztes Wochenende habe ich ein wunderschönen Ausflug zum Bodensee gemacht. Das Wetter war wirklich herrlich und die Sonne hat geschienen.

Besonders gut hat mir die Bootsfahrt auf dem See gefallen, weil die Landschaft sehr malerisch war. Wir haben auch in ein traditionelles Restaurant gegessen. Das Essen hat sehr gut geschmeckt.

Hast du Lust, nächsten Monat zusammen nach Heidelberg zu fahren? Wir könnten das Schloss besuchen. Schreib mir bald!

Liebe Grüße
Florian`
  },
  {
    id: 'task-b2-002',
    task_id: 'DE-B2-002',
    language: 'de',
    cefr_level: 'B2',
    category: 'Beschwerde',
    topic: 'Kundenservice & Sprachreise',
    title: 'Beschwerde über den gebuchten Intensivsprachkurs',
    instructions:
      'Sie haben an einer zweiwöchigen Sprachreise nach Berlin teilgenommen. Leider entsprachen die tatsächlichen Bedingungen vor Ort keineswegs den Versprechungen im Prospekt. Schreiben Sie einen formellen Beschwerdebrief an die Schulleitung.',
    requirements: [
      'Beschreiben Sie die aufgetretenen Mängel (Unterkunft, Gruppengröße, Lehrmaterial).',
      'Erklären Sie, warum Sie mit der Situation unzufrieden waren.',
      'Fordern Sie eine angemessene finanzielle Entschädigung oder Preisminderung.'
    ],
    min_words: 160,
    max_words: 210,
    time_limit_minutes: 30,
    task_version: '1.0',
    sample_outline: [
      'Formelle Anrede und Grund des Schreibens',
      'Vergleich der Prospektangaben mit den realen Bedingungen',
      'Auswirkungen auf den Lernerfolg',
      'Forderung einer anteiligen Rückerstattung und Fristsetzung'
    ],
    sample_starter: 'Sehr geehrte Damen und Herren, hiermit möchte ich meine Unzufriedenheit über den Sprachkurs zum Ausdruck bringen...',
    preset_draft: `Sehr geehrte Damen und Herren,

hiermit möchte ich meine tiefe Enttäuschung über den Intensivsprachkurs „Deutsch B2“ in Berlin zum Ausdruck bringen, an dem ich vom 10. bis 24. Oktober teilgenommen habe.

In Ihrem Prospekt wurde garantiert, dass die Klassengröße maximal acht Teilnehmer umfasst. In der Realität saßen jedoch 16 Personen in unserem Raum, sodass die Lehrkraft kaum Zeit für individuelle Korrekturen hatte. Des Weiteren war die zugesagte Klimaanlage defekt, was das Lernen bei den hohen Temperaturen unerträglich machte.

Aus diesen Gründen verlief der Kurs für mich keineswegs zufriedenstellend. Ich fordere Sie daher höflich auf, mir 30 Prozent der Kursgebühren zurückzuerstatten. Für eine Rückmeldung bis zum 15. November wäre ich Ihnen sehr dankbar.

Mit freundlichen Grüßen
Florian Müller`
  },
  {
    id: 'task-c1-001',
    task_id: 'DE-C1-001',
    language: 'de',
    cefr_level: 'C1',
    category: 'Erörterung',
    topic: 'Künstliche Intelligenz und Bildung',
    title: 'KI in der Hochschulbildung: Paradigmenwechsel oder Qualitätsverlust?',
    instructions:
      'Inwiefern verändert der Einsatz generativer künstlicher Intelligenz die Rolle traditioneller Bildungseinrichtungen? Verfassen Sie einen akademisch fundierten Text, in dem Sie didaktische, gesellschaftliche und ethische Aspekte kritisch beleuchten und eine differenzierte Position entwickeln.',
    requirements: [
      'Analysieren Sie die Auswirkungen auf Lernprozesse und akademische Integrität.',
      'Untersuchen Sie die veränderte Rolle von Lehrenden und Institutionen.',
      'Wägen Sie Chancen (personalisierte Förderung) gegen Risiken (Abhängigkeit, Plagiate) ab.',
      'Formulieren Sie zukunftsfähige didaktische Handlungsempfehlungen.'
    ],
    min_words: 250,
    max_words: 350,
    time_limit_minutes: 45,
    task_version: '1.0',
    sample_outline: [
      'Einleitung: Die rasante Diffusion generativer KI im Bildungssektor',
      'Didaktische Transformation: Vom reinen Wissenserwerb zur Urteilskompetenz',
      'Risiken: Verlust von Tiefenreflexion und epistemischer Autonomie',
      'Chancen: Adaptives Lernen und Demokratisierung von Bildungsinhalten',
      'Synthese und Ausblick: Der Mensch im Zentrum der Bildungsphilosophie'
    ],
    sample_starter: 'Die fortschreitende Integration generativer KI-Systeme markiert eine Zäsur in der Hochschuldidaktik...',
    preset_draft: `Die fortschreitende Integration generativer Algorithmen in die universitäre Lehre wirft grundlegende Fragen bezüglich der Zukunft akademischer Bildung auf. Während technologieaffine Stimmen die Personalisierung von Lernpfaden propagieren, befürchten Kritiker eine Aushöhlung eigenständiger Denkleistungen.

Zweifelsohne revolutioniert künstliche Intelligenz den Zugang zu komplexen Fachinhalten. Studierende erhalten unmittelbares Feedback und können sprachliche sowie methodische Barrieren effektiver überwinden. Dieser didaktische Zugewinn ist jedoch an signifikante Risiken gekoppelt: Werden Schreibprozesse und analytische Synthesen an maschinelle Systeme delegiert, droht eine Atrophie kognitiver Kernkompetenzen. Die Fähigkeit, Ambiguitäten auszuhalten und kontroverse Thesen fundiert zu entwickeln, lässt sich nicht durch automatisierte Textbausteine substituieren.

Darüber hinaus stehen Bildungsinstitutionen vor der dringenden Notwendigkeit, ihre Prüfungskultur grundlegend zu reformieren. Anstelle reproduktiven Faktenwissens muss die Förderung kritischer Diskursfähigkeit sowie ethischer Reflexion ins Zentrum didaktischer Konzeptionen rücken.

Resümierend lässt sich festhalten, dass generative KI traditionelle Lehrinstitutionen keineswegs obsolet macht, sondern vielmehr zu einer Neudefinition ihres humanistischen Auftrags zwingt. Lehrende werden künftig weniger als bloße Wissensvermittler denn als Moderatoren diskursiver Erkenntnisprozesse fungieren müssen.`
  },
  {
    id: 'task-b2-003',
    task_id: 'DE-B2-003',
    language: 'de',
    cefr_level: 'B2',
    category: 'Brief',
    topic: 'Wohnen & Nachbarschaft',
    title: 'Bitte um Einhaltung der Hausordnung an die Hausverwaltung',
    instructions:
      'In Ihrem Mehrfamilienhaus kommt es seit Wochen zu wiederholten Ruhestörungen durch Renovierungsarbeiten zu späten Abendstunden. Schreiben Sie einen Brief an die Hausverwaltung.',
    requirements: [
      'Schildern Sie die konkreten Störungen und die betroffenen Uhrzeiten.',
      'Erklären Sie, welche Auswirkungen dies auf Ihren Schlaf und Ihre Arbeit hat.',
      'Bitten Sie um eine rasche Vermittlung und Information aller Hausbewohner.'
    ],
    min_words: 150,
    max_words: 200,
    time_limit_minutes: 30,
    task_version: '1.0'
  }
];
