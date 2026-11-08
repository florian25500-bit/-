import { WritingTask } from '../types';

export const SAMPLE_TASKS: WritingTask[] = [
  // B1 Goethe / Telc Standard Exam Tasks
  {
    id: 'task-b1-001',
    task_id: 'EXAM-B1-001',
    language: 'de',
    cefr_level: 'B1',
    category: 'E-Mail',
    topic: 'Freizeit und Ausflug',
    title: 'Ein gelungener Wochenendausflug',
    instructions:
      'Sie haben am vergangenen Wochenende einen interessanten Ausflug gemacht. Schreiben Sie eine persönliche E-Mail an Ihren Freund Thomas.',
    requirements: [
      'Beschreiben Sie den Ausflug (Wohin sind Sie gefahren und wie war das Wetter?).',
      'Erzählen Sie, was Ihnen besonders gut gefallen hat und begründen Sie es.',
      'Machen Sie einen konkreten Vorschlag für einen gemeinsamen Ausflug nächsten Monat.'
    ],
    min_words: 80,
    max_words: 110,
    time_limit_minutes: 20,
    task_version: '2.0',
    sample_outline: [
      'Anrede und freundliche Einleitung',
      'Bericht über den Ausflug und Aktivitäten',
      'Vorschlag für ein baldiges Treffen und herzliche Verabschiedung'
    ],
    sample_starter: 'Lieber Thomas, wie geht es dir? Ich hoffe, alles ist gut bei dir...'
  },
  {
    id: 'task-b1-002',
    task_id: 'EXAM-B1-002',
    language: 'de',
    cefr_level: 'B1',
    category: 'Stellungnahme',
    topic: 'Konsum und Internet',
    title: 'Einkaufen im Internet: Praktisch oder problematisch?',
    instructions:
      'Sie haben im Fernsehen eine Sendung zum Thema „Online-Shopping im Alltag“ gesehen. Im Gästebuch der Sendung schreiben Sie Ihre persönliche Meinung.',
    requirements: [
      'Äußern Sie Ihre Meinung zum Einkaufen im Internet.',
      'Nennen Sie Gründe, warum viele Menschen lieber online als in Geschäften kaufen.',
      'Erläutern Sie mögliche Nachteile oder Gefahren des Online-Handels.',
      'Berichten Sie von einer eigenen positiven oder negativen Kauferfahrung.'
    ],
    min_words: 90,
    max_words: 120,
    time_limit_minutes: 25,
    task_version: '2.0',
    sample_outline: [
      'Einleitung mit Bezug auf das Thema Online-Shopping',
      'Vorteile: Zeitersparnis und Produktvielfalt',
      'Nachteile: Rücksendungen und Aussterben von Innenstädten',
      'Eigene Erfahrung und persönliches Fazit'
    ],
    sample_starter: 'In der heutigen Zeit bestellen immer mehr Menschen ihre Waren online...'
  },
  {
    id: 'task-b1-003',
    task_id: 'EXAM-B1-003',
    language: 'de',
    cefr_level: 'B1',
    category: 'Brief',
    topic: 'Beruf und Bildung',
    title: 'Terminabsage und Entschuldigung beim Sprachinstitut',
    instructions:
      'Sie besuchen einen Deutschkurs, können aber am kommenden Freitag nicht am Unterricht und am Zwischentest teilnehmen. Schreiben Sie eine formelle Mitteilung an Ihre Kursleiterin Frau Wagner.',
    requirements: [
      'Höfliche Entschuldigung für Ihr Fehlen am Freitag.',
      'Verständliche Begründung (z.B. dringender Arzttermin oder unaufschiebbare berufliche Pflicht).',
      'Bitte um Zusendung der Hausaufgaben und Unterrichtsmaterialien.',
      'Vorschlag zur Nachholung des Zwischentests in der folgenden Woche.'
    ],
    min_words: 70,
    max_words: 95,
    time_limit_minutes: 15,
    task_version: '2.0',
    sample_outline: [
      'Formelle Anrede',
      'Mitteilung des Fehlens und Grund',
      'Bitte um Unterrichtsmaterialien',
      'Nachholtermin und Grußformel'
    ],
    sample_starter: 'Sehr geehrte Frau Wagner, leider muss ich Ihnen mitteilen, dass ich am kommenden Freitag nicht...'
  },

  // B2 Goethe / Telc Standard Exam Tasks
  {
    id: 'task-b2-001',
    task_id: 'EXAM-B2-001',
    language: 'de',
    cefr_level: 'B2',
    category: 'Stellungnahme',
    topic: 'Arbeitswelt und Digitalisierung',
    title: 'Homeoffice: Chance oder Belastung für Beschäftigte?',
    instructions:
      'Immer mehr Unternehmen bieten ihren Mitarbeitenden die Möglichkeit, von zu Hause aus zu arbeiten. Schreiben Sie einen Diskussionsbeitrag für ein Online-Forum zum Thema Homeoffice.',
    requirements: [
      'Erörtern Sie sowohl wesentliche Vorteile als auch Nachteile der Telearbeit.',
      'Gehen Sie auf die Produktivität, Kommunikation und die Work-Life-Balance ein.',
      'Nennen Sie konkrete Beispiele aus Ihrem eigenen Alltag oder Umfeld.',
      'Formulieren Sie eine differenzierte persönliche Schlussfolgerung.'
    ],
    min_words: 180,
    max_words: 230,
    time_limit_minutes: 35,
    task_version: '2.0',
    sample_outline: [
      'Einleitung: Aktuelle Relevanz des Themas Telearbeit',
      'Vorteile: Zeitersparnis, Flexibilität, individuelle Zeiteinteilung',
      'Nachteile: Soziale Isolation, Entgrenzung von Arbeit und Freizeit',
      'Eigene Beobachtungen und ausgewogenes Fazit'
    ],
    sample_starter: 'Das Thema Homeoffice hat in den letzten Jahren rasant an gesellschaftlicher Bedeutung gewonnen...'
  },
  {
    id: 'task-b2-002',
    task_id: 'EXAM-B2-002',
    language: 'de',
    cefr_level: 'B2',
    category: 'Beschwerde',
    topic: 'Konsum und Dienstleistung',
    title: 'Beschwerde über den gebuchten Intensivsprachkurs',
    instructions:
      'Sie haben an einer zweiwöchigen Sprachreise nach Berlin teilgenommen. Leider entsprachen die tatsächlichen Bedingungen vor Ort keineswegs den Versprechungen im Prospekt. Schreiben Sie einen formellen Beschwerdebrief an die Schulleitung.',
    requirements: [
      'Beschreiben Sie die aufgetretenen Mängel präzise (Unterkunft, Gruppengröße, Lehrmaterial).',
      'Erklären Sie, warum Sie mit der Gesamtsituation unzufrieden waren.',
      'Fordern Sie eine angemessene finanzielle Entschädigung oder Preisminderung.',
      'Setzen Sie eine verbindliche Frist für eine Rückmeldung.'
    ],
    min_words: 160,
    max_words: 210,
    time_limit_minutes: 30,
    task_version: '2.0',
    sample_outline: [
      'Formelle Anrede und Bezugnahme auf die Buchung',
      'Detaillierte Gegenüberstellung von Prospektangaben und Realität',
      'Auswirkungen auf den Lernerfolg',
      'Forderung einer anteiligen Rückerstattung und Fristsetzung'
    ],
    sample_starter: 'Sehr geehrte Damen und Herren, hiermit möchte ich meine Unzufriedenheit über den gebuchten Sprachkurs zum Ausdruck bringen...'
  },
  {
    id: 'task-b2-003',
    task_id: 'EXAM-B2-003',
    language: 'de',
    cefr_level: 'B2',
    category: 'Brief',
    topic: 'Wohnen und Nachbarschaft',
    title: 'Bitte um Einhaltung der Hausordnung an die Hausverwaltung',
    instructions:
      'In Ihrem Mehrfamilienhaus kommt es seit Wochen zu wiederholten Ruhestörungen durch Renovierungsarbeiten zu späten Abendstunden. Schreiben Sie einen Brief an die Hausverwaltung.',
    requirements: [
      'Schildern Sie die konkreten Ruhestörungen und die betroffenen Uhrzeiten.',
      'Erklären Sie, welche Auswirkungen dies auf Ihren Schlaf und Ihre berufliche Leistungsfähigkeit hat.',
      'Bitten Sie um eine rasche Vermittlung und schriftliche Information aller Hausbewohner.',
      'Weisen Sie auf die geltenden gesetzlichen Ruhezeiten und Mietminderungsrechte hin.'
    ],
    min_words: 150,
    max_words: 200,
    time_limit_minutes: 30,
    task_version: '2.0'
  },
  {
    id: 'task-b2-004',
    task_id: 'EXAM-B2-004',
    language: 'de',
    cefr_level: 'B2',
    category: 'Stellungnahme',
    topic: 'Umwelt und Mobilität',
    title: 'Kostenloser öffentlicher Nahverkehr in Großstädten',
    instructions:
      'In vielen Metropolen wird diskutiert, ob Busse und Bahnen für alle Bürger kostenlos sein sollten, um den Autoverkehr zu reduzieren. Verfassen Sie einen Forumsbeitrag.',
    requirements: [
      'Erörtern Sie die ökologischen und sozialen Chancen eines ticketfreien ÖPNV.',
      'Beleuchten Sie finanzielle und kapazitätsbezogene Hürden für die Kommunen.',
      'Führen Sie Alternativmaßnahmen an (z.B. Ausbau des Streckennetzes, Taktverdichtung).',
      'Geben Sie eine begründete persönliche Stellungnahme ab.'
    ],
    min_words: 170,
    max_words: 220,
    time_limit_minutes: 35,
    task_version: '2.0'
  },

  // C1 Goethe / Telc Hochschule Standard Exam Tasks
  {
    id: 'task-c1-001',
    task_id: 'EXAM-C1-001',
    language: 'de',
    cefr_level: 'C1',
    category: 'Erörterung',
    topic: 'Wissenschaft und Technologie',
    title: 'KI in der Hochschulbildung: Paradigmenwechsel oder Qualitätsverlust?',
    instructions:
      'Inwiefern verändert der Einsatz generativer künstlicher Intelligenz die Rolle traditioneller Bildungseinrichtungen? Verfassen Sie einen akademisch fundierten Text, in dem Sie didaktische, gesellschaftliche und ethische Aspekte kritisch beleuchten und eine differenzierte Position entwickeln.',
    requirements: [
      'Analysieren Sie die Auswirkungen auf Lernprozesse, Schreibkompetenz und akademische Integrität.',
      'Untersuchen Sie die veränderte Rolle von Lehrenden als Moderatoren diskursiver Erkenntnisprozesse.',
      'Wägen Sie Chancen (personalisierte Förderung) gegen Risiken (kognitive Abhängigkeit, epistemische Erosion) ab.',
      'Formulieren Sie zukunftsfähige didaktische Handlungsempfehlungen für Universitäten.'
    ],
    min_words: 250,
    max_words: 350,
    time_limit_minutes: 45,
    task_version: '2.0',
    sample_outline: [
      'Einleitung: Die rasante Diffusion generativer KI im Bildungssektor',
      'Didaktische Transformation: Vom reinen Wissenserwerb zur Urteilskompetenz',
      'Risiken: Verlust von Tiefenreflexion und epistemischer Autonomie',
      'Chancen: Adaptives Lernen und Demokratisierung von Bildungsinhalten',
      'Synthese und Ausblick: Der Mensch im Zentrum der Bildungsphilosophie'
    ],
    sample_starter: 'Die fortschreitende Integration generativer Algorithmen in die universitäre Lehre wirft fundamentale Fragen auf...'
  },
  {
    id: 'task-c1-002',
    task_id: 'EXAM-C1-002',
    language: 'de',
    cefr_level: 'C1',
    category: 'Erörterung',
    topic: 'Gesellschaft und Ökologie',
    title: 'Energiewende und gesellschaftlicher Wohlstand: Ein unlösbarer Widerspruch?',
    instructions:
      'Der Übergang zu erneuerbaren Energien erfordert massive wirtschaftliche Transformationen und verändertes Konsumverhalten. Verfassen Sie einen wissenschaftlichen Essay zur Vereinbarkeit von Klimaschutz und sozialem Zusammenhalt.',
    requirements: [
      'Beleuchten Sie die ökonomischen Herausforderungen industrieller Umstrukturierung.',
      'Analysieren Sie Fragen der sozialen Gerechtigkeit bezüglich steigender Energie- und Lebenshaltungskosten.',
      'Erörtern Sie die Rolle von staatlicher Regulierung versus marktbasierter Innovation.',
      'Ziehen Sie ein fundiertes Fazit mit Blick auf die Zukunftsfähigkeit westlicher Volkswirtschaften.'
    ],
    min_words: 240,
    max_words: 340,
    time_limit_minutes: 45,
    task_version: '2.0'
  }
];
