import { WritingTask, CEFRLevel, TaskCategory } from '../types';

interface TopicBlueprint {
  theme: string;
  category: TaskCategory;
  title: string;
  instructions: string;
  requirements: [string, string, string, string];
  min_words: number;
  max_words: number;
  time_limit_minutes: number;
  sample_outline: string[];
  sample_starter: string;
}

// 14 Themes for B1 with 12 unique scenarios each = 168 B1 Prompts
const B1_THEMES = [
  { name: 'Freizeit & Hobbys', category: 'E-Mail' as TaskCategory, min: 80, max: 110, time: 20 },
  { name: 'Reisen & Urlaub', category: 'E-Mail' as TaskCategory, min: 80, max: 110, time: 20 },
  { name: 'Wohnen & Nachbarschaft', category: 'Brief' as TaskCategory, min: 75, max: 105, time: 20 },
  { name: 'Sprachkurs & Bildung', category: 'Brief' as TaskCategory, min: 70, max: 95, time: 15 },
  { name: 'Arbeit & Praktikum', category: 'Brief' as TaskCategory, min: 80, max: 110, time: 20 },
  { name: 'Einkaufen & Konsum', category: 'Stellungnahme' as TaskCategory, min: 90, max: 120, time: 25 },
  { name: 'Gesundheit & Ernährung', category: 'Stellungnahme' as TaskCategory, min: 90, max: 120, time: 25 },
  { name: 'Medien & Soziale Netzwerke', category: 'Stellungnahme' as TaskCategory, min: 90, max: 120, time: 25 },
  { name: 'Umwelt & Mülltrennung', category: 'Stellungnahme' as TaskCategory, min: 90, max: 120, time: 25 },
  { name: 'Familie & Feste', category: 'E-Mail' as TaskCategory, min: 80, max: 110, time: 20 },
  { name: 'Freundschaft & Ausflüge', category: 'E-Mail' as TaskCategory, min: 80, max: 110, time: 20 },
  { name: 'Verkehr & Mobilität', category: 'Brief' as TaskCategory, min: 75, max: 105, time: 20 },
  { name: 'Kultur & Unterhaltung', category: 'Stellungnahme' as TaskCategory, min: 90, max: 120, time: 25 },
  { name: 'Haustiere & Natur', category: 'Stellungnahme' as TaskCategory, min: 85, max: 115, time: 20 },
];

const B1_SCENARIO_VARIANTS = [
  {
    focus: 'Erfahrungsbericht',
    intro: 'Sie haben kürzlich neue Erfahrungen im Bereich',
    req1: 'Beschreiben Sie Ihre konkrete persönliche Erfahrung.',
    req2: 'Begründen Sie, was Ihnen besonders gut oder schlecht gefallen hat.',
    req3: 'Geben Sie einen Ratschlag für interessierte Personen.',
    req4: 'Schlagen Sie eine gemeinsame Aktivität vor.',
  },
  {
    focus: 'Entschuldigung und Bitte',
    intro: 'Wegen eines unvorhergesehenen Termins können Sie bezüglich',
    req1: 'Entschuldigen Sie sich höflich für die Verzögerung.',
    req2: 'Erläutern Sie den genauen Grund nachvollziehbar.',
    req3: 'Bitten Sie um Zusendung der wichtigsten Unterlagen.',
    req4: 'Schlagen Sie einen konkreten Ersatztermin vor.',
  },
  {
    focus: 'Meinungsäußerung im Online-Forum',
    intro: 'Sie haben im Internet eine lebhafte Diskussion zum Thema',
    req1: 'Äußern Sie Ihre persönliche Meinung zu diesem Phänomen.',
    req2: 'Nennen Sie zwei wichtige Vorteile für den Alltag.',
    req3: 'Erläutern Sie mögliche Nachteile oder Risiken.',
    req4: 'Berichten Sie kurz von einer Situation in Ihrem Heimatland.',
  },
  {
    focus: 'Einladung und Planung',
    intro: 'Sie möchten demnächst eine gemeinsame Veranstaltung zum Thema',
    req1: 'Laden Sie Ihre Freunde oder Bekannten herzlich dazu ein.',
    req2: 'Erklären Sie den Anlass und das geplante Programm.',
    req3: 'Bitten Sie um Unterstützung bei der Vorbereitung.',
    req4: 'Fragen Sie nach Terminvorschlägen und Essenswünschen.',
  },
  {
    focus: 'Rat und Empfehlung',
    intro: 'Ihr Kollege oder Freund bittet Sie um Rat bezüglich',
    req1: 'Zeigen Sie Verständnis für die schwierige Lage.',
    req2: 'Schildern Sie eine ähnliche Erfahrung, die Sie gemacht haben.',
    req3: 'Empfehlen Sie zwei konkrete Lösungsmöglichkeiten.',
    req4: 'Bieten Sie Ihre persönliche Hilfe bei der Umsetzung an.',
  },
  {
    focus: 'Reklamation und Anfrage',
    intro: 'Sie haben eine Dienstleistung in Anspruch genommen im Bereich',
    req1: 'Schildern Sie den gebuchten Ablauf und die Absprachen.',
    req2: 'Beschreiben Sie die aufgetretenen Abweichungen.',
    req3: 'Erklären Sie, warum Sie mit dem Ergebnis unzufrieden sind.',
    req4: 'Bitten Sie um Nachbesserung oder Preisminderung.',
  },
  {
    focus: 'Veränderung im Lebensstil',
    intro: 'Sie haben sich entschieden, Gewohnheiten zu verändern bei',
    req1: 'Erzählen Sie, warum Sie diese Entscheidung getroffen haben.',
    req2: 'Beschreiben Sie, wie Ihr Alltag nun aussieht.',
    req3: 'Welche positiven Effekte bemerken Sie bereits?',
    req4: 'Ermuntern Sie andere dazu, es ebenfalls auszuprobieren.',
  },
  {
    focus: 'Glückwunsch und Geschenkidee',
    intro: 'Ein guter Freund feiert ein Jubiläum oder einen Erfolg bei',
    req1: 'Gratulieren Sie herzlich zu diesem besonderen Meilenstein.',
    req2: 'Erinnern Sie an eine schöne gemeinsame Anekdote.',
    req3: 'Machen Sie einen Vorschlag für ein passendes Geschenk.',
    req4: 'Fragen Sie nach dem genauen Zeitplan der Feier.',
  },
  {
    focus: 'Diskussionsbeitrag Jugend und Alter',
    intro: 'In einer Zeitschrift geht es um unterschiedliche Perspektiven auf',
    req1: 'Vergleichen Sie die Haltung von Jüngeren und Älteren.',
    req2: 'Geben Sie ein anschauliches Beispiel aus der Familie.',
    req3: 'Nennen Sie Bedingungen für ein gutes Miteinander.',
    req4: 'Formulieren Sie ein kurzes, prägnantes Fazit.',
  },
  {
    focus: 'Wohnort- und Umgebungswandel',
    intro: 'In Ihrer Nachbarschaft gibt es neue Entwicklungen bezüglich',
    req1: 'Beschreiben Sie die aktuellen Veränderungen vor Ort.',
    req2: 'Erklären Sie, wie die Bewohner darauf reagieren.',
    req3: 'Nennen Sie eigene Bedenken oder Hoffnungen.',
    req4: 'Schlagen Sie eine Bürgerinitiative oder Versammlung vor.',
  },
  {
    focus: 'Lernmethoden und Motivation',
    intro: 'Im Sprachcafé tauschen sich Lernende aus über',
    req1: 'Erzählen Sie, welche Methoden Ihnen am meisten helfen.',
    req2: 'Beschreiben Sie typische Hürden und Frustrationen.',
    req3: 'Geben Sie praktische Tipps zur Aufrechterhaltung der Motivation.',
    req4: 'Fragen Sie nach den Erfahrungen der anderen Teilnehmenden.',
  },
  {
    focus: 'Zukunftspläne und Wünsche',
    intro: 'Sie blicken auf das kommende Jahr und planen Neuerungen bei',
    req1: 'Schildern Sie Ihre wichtigsten Ziele für die nächste Zeit.',
    req2: 'Begründen Sie, warum Ihnen diese Ziele am Herzen liegen.',
    req3: 'Erläutern Sie, wie Sie sich darauf vorbereiten.',
    req4: 'Fragen Sie Ihr Gegenüber nach seinen Plänen.',
  },
];

// 14 Themes for B2 with 12 unique scenarios each = 168 B2 Prompts
const B2_THEMES = [
  { name: 'Arbeitswelt & New Work', category: 'Stellungnahme' as TaskCategory, min: 180, max: 230, time: 35 },
  { name: 'Kundenbeschwerde & Reklamation', category: 'Beschwerde' as TaskCategory, min: 160, max: 210, time: 30 },
  { name: 'Mobilität & Klimaschutz', category: 'Stellungnahme' as TaskCategory, min: 170, max: 220, time: 35 },
  { name: 'Digitalisierung & Mediennutzung', category: 'Stellungnahme' as TaskCategory, min: 180, max: 230, time: 35 },
  { name: 'Wohnungsmarkt & Mietrecht', category: 'Brief' as TaskCategory, min: 160, max: 210, time: 30 },
  { name: 'Lebenslanges Lernen & Karriere', category: 'Stellungnahme' as TaskCategory, min: 180, max: 230, time: 35 },
  { name: 'Konsumgesellschaft & Verpackungsmüll', category: 'Stellungnahme' as TaskCategory, min: 170, max: 220, time: 35 },
  { name: 'Gesundheitsförderung im Betrieb', category: 'Brief' as TaskCategory, min: 160, max: 210, time: 30 },
  { name: 'Reisereklamation & Pauschalurlaub', category: 'Beschwerde' as TaskCategory, min: 160, max: 210, time: 30 },
  { name: 'Datenschutz & Überwachung', category: 'Stellungnahme' as TaskCategory, min: 180, max: 230, time: 35 },
  { name: 'Ehrenamt & Bürgerbeteiligung', category: 'Stellungnahme' as TaskCategory, min: 170, max: 220, time: 35 },
  { name: 'Ernährung & Massentierhaltung', category: 'Stellungnahme' as TaskCategory, min: 180, max: 230, time: 35 },
  { name: 'Universitätsorganisation & Gebühren', category: 'Brief' as TaskCategory, min: 160, max: 210, time: 30 },
  { name: 'Fehlerhafte Lieferung & Vertragsbruch', category: 'Beschwerde' as TaskCategory, min: 160, max: 210, time: 30 },
];

const B2_SCENARIO_VARIANTS = [
  {
    focus: 'Differenzierte Vor- und Nachteilsabwägung',
    req1: 'Erörtern Sie sowohl wesentliche Vor- als auch Nachteile der Entwicklung.',
    req2: 'Untersuchen Sie die wirtschaftlichen und sozialen Begleiterscheinungen.',
    req3: 'Führen Sie aussagekräftige Beispiele aus dem Berufsalltag an.',
    req4: 'Formulieren Sie eine fundierte persönliche Schlussfolgerung.',
  },
  {
    focus: 'Formelle Reklamation mit Fristsetzung',
    req1: 'Konkretisieren Sie die Abweichungen zwischen Zusage und tatsächlicher Leistung.',
    req2: 'Legen Sie die finanziellen und organisatorischen Einbußen dar.',
    req3: 'Verlangen Sie eine adäquate Rückerstattung oder Kompensationsleistung.',
    req4: 'Setzen Sie eine verbindliche Frist für eine schriftliche Stellungnahme.',
  },
  {
    focus: 'Stellungnahme zu gesellschaftlichen Kontroversen',
    req1: 'Skizzieren Sie die gegenwärtige Diskussion und deren Relevanz.',
    req2: 'Beleuchten Sie die Interessenkonflikte verschiedener Bevölkerungsgruppen.',
    req3: 'Wägen Sie individuelle Freiheit gegen gesellschaftliche Verantwortung ab.',
    req4: 'Schlagen Sie tragfähige Kompromisslösungen vor.',
  },
  {
    focus: 'Eingabe an Behörden oder Geschäftsführung',
    req1: 'Beschreiben Sie den Missstand und dessen akute Dringlichkeit sachlich.',
    req2: 'Weisen Sie auf bestehende Richtlinien, Verträge oder Schutzrechte hin.',
    req3: 'Skizzieren Sie konkrete Präventions- und Abhilfemaßnahmen.',
    req4: 'Bitten Sie um ein klärendes persönliches Gespräch oder einen Zwischenbericht.',
  },
  {
    focus: 'Gegenüberstellung von Tradition und Innovation',
    req1: 'Analysieren Sie, wie traditionelle Abläufe durch moderne Ansätze verändert werden.',
    req2: 'Erläutern Sie die Bedenken konservativer Akteure.',
    req3: 'Heben Sie Innovationschancen und Effizienzgewinne hervor.',
    req4: 'Geben Sie eine begründete Prognose für die nächsten fünf Jahre ab.',
  },
  {
    focus: 'Interkultureller Vergleich und Mobilität',
    req1: 'Stellen Sie die Handhabung des Themas in verschiedenen Ländern gegenüber.',
    req2: 'Erörtern Sie kulturelle Faktoren, die diese Unterschiede prägen.',
    req3: 'Berichten Sie von eigenen Erfahrungen im internationalen Kontext.',
    req4: 'Ziehen Sie Lehren für eine zukunftsfähige Ausgestaltung im Inland.',
  },
  {
    focus: 'Nachhaltige Unternehmensführung',
    req1: 'Erläutern Sie den Spagat zwischen Rentabilität und ökologischer Verantwortung.',
    req2: 'Geben Sie konkrete Beispiele für gelungene Nachhaltigkeitsinitiativen.',
    req3: 'Diskutieren Sie die Glaubwürdigkeit von Zertifikaten und Gütesiegeln.',
    req4: 'Formulieren Sie Erwartungen der Konsumenten an die Unternehmen.',
  },
  {
    focus: 'Arbeitnehmerrechte und Arbeitszeiterfassung',
    req1: 'Beleuchten Sie die Entgrenzung von Berufs- und Privatleben durch moderne Medien.',
    req2: 'Diskutieren Sie Pflichten der Arbeitgeber zum Gesundheitsschutz.',
    req3: 'Führen Sie Vor- und Nachteile transparenter Arbeitszeitkontrollen an.',
    req4: 'Schlagen Sie flexible, vertrauensbasierte Modelle vor.',
  },
  {
    focus: 'Urbane Lebensqualität und Raumplanung',
    req1: 'Erörtern Sie den Druck auf Grünflächen durch Nachverdichtung.',
    req2: 'Diskutieren Sie Maßnahmen zur Verkehrsberuhigung und Fußgängerförderung.',
    req3: 'Gehen Sie auf die Bedürfnisse von Familien und älteren Menschen ein.',
    req4: 'Fassen Sie Ihre Vision einer lebenswerten Stadt zusammen.',
  },
  {
    focus: 'Gleichstellung und Chancengerechtigkeit',
    req1: 'Untersuchen Sie Barrieren beim beruflichen Aufstieg benachteiligter Gruppen.',
    req2: 'Erörtern Sie Sinn und Grenzen gesetzlicher Quotenregelungen.',
    req3: 'Nennen Sie erfolgreiche Mentoring- und Förderprogramme.',
    req4: 'Geben Sie eine klare Positionierung zur Wirksamkeit dieser Instrumente ab.',
  },
  {
    focus: 'Verbraucheraufklärung und Täuschungsschutz',
    req1: 'Kritisieren Sie intransparente Preisgestaltungen oder Werbeversprechen.',
    req2: 'Legen Sie die Rolle von Verbraucherzentralen und Kontrollbehörden dar.',
    req3: 'Erörtern Sie die Eigenverantwortung der Bürger beim Einkaufen.',
    req4: 'Fordern Sie strengere Sanktionen für wiederholte Verstöße.',
  },
  {
    focus: 'Generationendialog und Alternde Gesellschaft',
    req1: 'Analysieren Sie die Herausforderungen des demografischen Wandels für Sozialsysteme.',
    req2: 'Diskutieren Sie das Potenzial älterer Fachkräfte am Arbeitsmarkt.',
    req3: 'Betonen Sie die Bedeutung generationsübergreifender Wohn- und Lernprojekte.',
    req4: 'Schließen Sie mit einem Appell zur Stärkung des gesellschaftlichen Zusammenhalts.',
  },
];

// 14 Themes for C1 with 12 unique scenarios each = 168 C1 Prompts
const C1_THEMES = [
  { name: 'Künstliche Intelligenz & Epistemische Autonomie', category: 'Erörterung' as TaskCategory, min: 250, max: 350, time: 45 },
  { name: 'Wissenschaftsfreiheit & Akademische Integrität', category: 'Erörterung' as TaskCategory, min: 250, max: 350, time: 45 },
  { name: 'Bioethik & Genetische Modifikation', category: 'Erörterung' as TaskCategory, min: 250, max: 350, time: 45 },
  { name: 'Demokratie & Digitale Desinformation', category: 'Stellungnahme' as TaskCategory, min: 240, max: 340, time: 45 },
  { name: 'Energiewende & Verteilungsgerechtigkeit', category: 'Erörterung' as TaskCategory, min: 250, max: 350, time: 45 },
  { name: 'Wirtschaftswachstum vs. Postwachstumsökonomie', category: 'Erörterung' as TaskCategory, min: 250, max: 350, time: 45 },
  { name: 'Bildungsmonopole & Soziale Mobilität', category: 'Bericht' as TaskCategory, min: 240, max: 330, time: 40 },
  { name: 'Überwachungskapitalismus & Privatsphäre', category: 'Stellungnahme' as TaskCategory, min: 240, max: 340, time: 45 },
  { name: 'Globalisierung & Resilienz von Lieferketten', category: 'Erörterung' as TaskCategory, min: 250, max: 350, time: 45 },
  { name: 'Automatisierung & Bedingungsloses Grundeinkommen', category: 'Erörterung' as TaskCategory, min: 250, max: 350, time: 45 },
  { name: 'Urbanisierung, Segregation & Gentrifizierung', category: 'Bericht' as TaskCategory, min: 240, max: 330, time: 40 },
  { name: 'Sprachwandel, Anglizismen & Identität', category: 'Stellungnahme' as TaskCategory, min: 240, max: 340, time: 45 },
  { name: 'Beschleunigung & Psychische Belastungen', category: 'Erörterung' as TaskCategory, min: 250, max: 350, time: 45 },
  { name: 'Klimagerechtigkeit im Nord-Süd-Konflikt', category: 'Erörterung' as TaskCategory, min: 250, max: 350, time: 45 },
];

const C1_SCENARIO_VARIANTS = [
  {
    focus: 'Dialektische Analyse und Synthese',
    req1: 'Analysieren Sie die theoretischen Grundlagen und historischen Ursachen des Phänomens.',
    req2: 'Untersuchen Sie gegenläufige wissenschaftliche Positionen und methodische Prämissen.',
    req3: 'Wägen Sie kurzfristige Effizienzgewinne gegen langfristige systemische Risiken ab.',
    req4: 'Entwickeln Sie eine erkenntnistheoretisch fundierte Synthese mit Ausblick.',
  },
  {
    focus: 'Kritischer Diskurskommentar mit Textbezug',
    req1: 'Dekonstruieren Sie die dominierende Argumentationslinie im öffentlichen Diskurs.',
    req2: 'Legen Sie verborgene Axiome und normative Grundannahmen offen.',
    req3: 'Konfrontieren Sie die Thesen mit empirischen Befunden aus der Sozialforschung.',
    req4: 'Formulieren Sie pointierte handlungsorientierte Kriterien für die Politikberatung.',
  },
  {
    focus: 'Ethische Grenzziehung und Technologiebewertung',
    req1: 'Beleuchten Sie ethische Dilemmata zwischen technologischem Imperativ und Menschenwürde.',
    req2: 'Erörtern Sie Haftungsfragen, Zurechenbarkeit und den Verlust menschlicher Kontrolle.',
    req3: 'Untersuchen Sie die Gefahr der Monopolisierung durch multinationale Konzerne.',
    req4: 'Entwerfen Sie einen normativen Ordnungsrahmen zur Sicherung demokratischer Souveränität.',
  },
  {
    focus: 'Sozioökonomische Strukturdiagnose',
    req1: 'Analysieren Sie die Wechselwirkungen zwischen Marktmechanismen und sozialer Kohäsion.',
    req2: 'Arbeiten Sie Verlierer und Gewinner dieser strukturellen Transformation heraus.',
    req3: 'Prüfen Sie bestehende institutionelle Auffangnetze auf ihre Tragfähigkeit.',
    req4: 'Skizzieren Sie Reformoptionen unter Berücksichtigung fiskalischer Machbarkeit.',
  },
  {
    focus: 'Institutionelle Reform und Governance',
    req1: 'Diagnostizieren Sie institutionelle Trägheiten und Steuerungsdefizite des Staates.',
    req2: 'Diskutieren Sie partizipative versus technokratische Entscheidungsmodelle.',
    req3: 'Beleuchten Sie supranationale Verflechtungen und Souveränitätsabtretungen.',
    req4: 'Formulieren Sie konkrete Leitlinien für ein transparentes Mehrebenen-System.',
  },
  {
    focus: 'Epistemologie und Wissenssoziologie',
    req1: 'Hinterfragen Sie die Objektivität und gesellschaftliche Instrumentalisierung von Expertise.',
    req2: 'Analysieren Sie die Dynamiken von Echokammern und algorithmischer Filterung.',
    req3: 'Erläutern Sie die Bedingungen gelingender Deliberation im Sinne des Diskurses.',
    req4: 'Ziehen Sie Konsequenzen für die Resilienz offener demokratischer Gesellschaften.',
  },
  {
    focus: 'Ökologische Suffizienz versus Effizienz',
    req1: 'Unterziehen Sie das Paradigma des grünen Wachstums einer grundlegenden Kritik.',
    req2: 'Stellen Sie technologische Effizienzsteigerungen dem Rebound-Effekt gegenüber.',
    req3: 'Erörtern Sie kulturelle Dimensionen von Genügsamkeit und Wohlstandsumdefinition.',
    req4: 'Plädieren Sie für konsistente ordnungspolitische Instrumente.',
  },
  {
    focus: 'Kulturelle Identität und Semiotik',
    req1: 'Untersuchen Sie sprachliche Hegemonien und den Wandel symbolischer Ordnungen.',
    req2: 'Diskutieren Sie das Spannungsverhältnis zwischen universalistischer Norm und Partikularismus.',
    req3: 'Analysieren Sie die Rekurrenz von Identitätskonflikten in Zeiten des Umbruchs.',
    req4: 'Fassen Sie die Rolle des Bildungssystems bei der Wertevermittlung zusammen.',
  },
  {
    focus: 'Anthropologische Implikationen der Moderne',
    req1: 'Reflektieren Sie die Beschleunigung und Entfremdung im subjektiven Zeiterleben.',
    req2: 'Beleuchten Sie die Fragmentierung von Lebensentwürfen und Verbindlichkeiten.',
    req3: 'Diskutieren Sie Mechanismen zur Rückgewinnung von Resonanz und Sinnhaftigkeit.',
    req4: 'Ziehen Sie ein differenziertes Fazit zur menschlichen Anpassungsfähigkeit.',
  },
  {
    focus: 'Globale Gerechtigkeit und Postkolonialismus',
    req1: 'Analysieren Sie historische Asymmetrien in der globalen Ressourcenverteilung.',
    req2: 'Diskutieren Sie moralische Verpflichtungen wohlhabender Industriestaaten.',
    req3: 'Hinterfragen Sie paternalistische Entwicklungskonzepte kritisch.',
    req4: 'Fordern Sie partnerschaftliche Strukturen auf Augenhöhe.',
  },
  {
    focus: 'Rechtsphilosophie und Grundrechte',
    req1: 'Prüfen Sie die Verhältnismäßigkeit staatlicher Eingriffe in Grundfreiheiten im Krisenfall.',
    req2: 'Erläutern Sie das Spannungsfeld zwischen kollektiver Sicherheit und Bürgerrechten.',
    req3: 'Diskutieren Sie die Rolle der Verfassungsgerichtsbarkeit als Korrektiv.',
    req4: 'Geben Sie ein fundiertes Votum zur Bewahrung des Rechtsstaates ab.',
  },
  {
    focus: 'Zukunft der Arbeitsgesellschaft',
    req1: 'Projektieren Sie die Erosion traditioneller Erwerbsbiografien durch Disruption.',
    req2: 'Diskutieren Sie die Entkopplung von gesellschaftlicher Wertschöpfung und Lohnerwerb.',
    req3: 'Erörtern Sie neue Modelle der Umverteilung und Anerkennung von Fürsorgearbeit.',
    req4: 'Skizzieren Sie ein zukunftsweisendes Leitbild einer sinnerfüllten Tätigkeitsgesellschaft.',
  },
];

/**
 * Generates exactly 504 standardized CEFR exam prompts (168 B1, 168 B2, 168 C1)
 * Distributed evenly 1:1:1 with realistic Goethe/telc requirements.
 */
function buildCentralExamPool(): WritingTask[] {
  const tasks: WritingTask[] = [];

  // Generate 168 B1 Tasks (14 themes * 12 scenarios)
  let b1Counter = 1;
  B1_THEMES.forEach((theme) => {
    B1_SCENARIO_VARIANTS.forEach((scenario) => {
      const padId = String(b1Counter).padStart(3, '0');
      tasks.push({
        id: `task-b1-${padId}`,
        task_id: `EXAM-B1-${padId}`,
        language: 'de',
        cefr_level: 'B1',
        category: theme.category,
        topic: theme.name,
        title: `${theme.name}: ${scenario.focus}`,
        instructions: `${scenario.intro} „${theme.name}“ gesammelt. Verfassen Sie einen kohärenten Text auf Deutsch gemäß den nachstehenden Leitpunkten.`,
        requirements: [scenario.req1, scenario.req2, scenario.req3, scenario.req4],
        min_words: theme.min,
        max_words: theme.max,
        time_limit_minutes: theme.time,
        task_version: '3.0',
        sample_outline: [
          'Passende Anrede und höfliche Hinführung zum Thema',
          'Behandlung der ersten beiden Leitpunkte mit Beispielen',
          'Behandlung der letzten beiden Leitpunkte und Begründung',
          'Schlussformel und Verabschiedung',
        ],
        sample_starter: theme.category === 'Brief'
          ? 'Sehr geehrte Damen und Herren, bezüglich Ihrer Mitteilung zu...'
          : 'Liebe Freundinnen und Freunde, ich möchte euch gerne von...',
      });
      b1Counter++;
    });
  });

  // Generate 168 B2 Tasks (14 themes * 12 scenarios)
  let b2Counter = 1;
  B2_THEMES.forEach((theme) => {
    B2_SCENARIO_VARIANTS.forEach((scenario) => {
      const padId = String(b2Counter).padStart(3, '0');
      tasks.push({
        id: `task-b2-${padId}`,
        task_id: `EXAM-B2-${padId}`,
        language: 'de',
        cefr_level: 'B2',
        category: theme.category,
        topic: theme.name,
        title: `${theme.name}: ${scenario.focus}`,
        instructions: `Im gesellschaftlichen und beruflichen Kontext gewinnt der Aspekt „${theme.name}“ zunehmend an Relevanz. Verfassen Sie einen fundierten Text (${theme.category}), in dem Sie die aufgeführten Aspekte sachlich und sprachlich differenziert darlegen.`,
        requirements: [scenario.req1, scenario.req2, scenario.req3, scenario.req4],
        min_words: theme.min,
        max_words: theme.max,
        time_limit_minutes: theme.time,
        task_version: '3.0',
        sample_outline: [
          'Einleitung: Definition der Ausgangslage und Relevanz für Gesellschaft/Betrieb',
          'Hauptteil 1: Ausführliche Erörterung der ersten beiden Kernaspekte mit Argumenten',
          'Hauptteil 2: Reflexion von Gegenargumenten, Risiken oder alternativen Lösungsansätzen',
          'Schluss: Ausgewogene Zusammenfassung und zukunftsgerichtetes persönliches Fazit',
        ],
        sample_starter: theme.category === 'Beschwerde'
          ? 'Sehr geehrte Damen und Herren, mit diesem Schreiben möchte ich meine Beanstandung bezüglich...'
          : 'Das Thema erfreut sich in jüngster Zeit reger gesellschaftlicher Aufmerksamkeit...',
      });
      b2Counter++;
    });
  });

  // Generate 168 C1 Tasks (14 themes * 12 scenarios)
  let c1Counter = 1;
  C1_THEMES.forEach((theme) => {
    C1_SCENARIO_VARIANTS.forEach((scenario) => {
      const padId = String(c1Counter).padStart(3, '0');
      tasks.push({
        id: `task-c1-${padId}`,
        task_id: `EXAM-C1-${padId}`,
        language: 'de',
        cefr_level: 'C1',
        category: theme.category,
        topic: theme.name,
        title: `${theme.name}: ${scenario.focus}`,
        instructions: `Die akademische Auseinandersetzung mit „${theme.name}“ berührt fundamentale Grundfragen unseres Gemeinwesens. Verfassen Sie eine wissenschaftlich fundierte Abhandlung (${theme.category}), in der Sie theoretische Prämissen reflektieren, empirische Aspekte analysieren und eine methodisch schlüssige Position begründen.`,
        requirements: [scenario.req1, scenario.req2, scenario.req3, scenario.req4],
        min_words: theme.min,
        max_words: theme.max,
        time_limit_minutes: theme.time,
        task_version: '3.0',
        sample_outline: [
          'Prolog: Epistemische Kontextualisierung und Explikation der forschungsleitenden Fragestellung',
          'Diskursanalyse: Dekonstruktion dominierender Paradigmata und Gegenüberstellung theoriegeleiteter Positionen',
          'Synthese & Kritik: Reflexion normativer Implikationen, Antinomien und institutioneller Friktionen',
          'Ausblick: Formulierung zukunftsfähiger Leitprinzipien und wissenschaftlicher Forschungsdesiderata',
        ],
        sample_starter: 'Die Kontroverse um die vorliegende Thematik erfordert eine differenzierte Auseinandersetzung, die über vordergründige Phänomene hinausreicht...',
      });
      c1Counter++;
    });
  });

  return tasks;
}

export const EXAM_PROMPTS_POOL: WritingTask[] = buildCentralExamPool();
