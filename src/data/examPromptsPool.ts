import { WritingTask, TaskCategory } from '../types';

/**
 * Standardized Central Exam Prompts Pool (840 prompts total: 168 per CEFR level A1–C1).
 * Difficulty, prompt phrasing, Leitpunkte structure, word counts, and time limits are
 * strictly calibrated to authentic Goethe-Zertifikat & telc exam standards for each level.
 */

// ============================================================================
// 1. A1 LEVEL (Start Deutsch 1 / Goethe-Zertifikat A1)
//    - 30–50 words, 15–20 minutes, 3 simple everyday Leitpunkte
//    - Short, clear A1 sentences; concrete daily-life communication (du / Sie)
// ============================================================================
const A1_THEMES = [
  { name: 'Geburtstagsparty', context: 'eine Party am Samstag', recipient: 'Ihre Freundin Anna', formal: false, category: 'E-Mail' as TaskCategory, min: 30, max: 50, time: 15 },
  { name: 'Arzttermin', context: 'einen Termin beim Arzt', recipient: 'die Arztpraxis Dr. Weber', formal: true, category: 'Brief' as TaskCategory, min: 30, max: 50, time: 15 },
  { name: 'Urlaub & Postkarte', context: 'Ihren Urlaub am Meer', recipient: 'Ihren Freund Lukas', formal: false, category: 'Brief' as TaskCategory, min: 30, max: 50, time: 15 },
  { name: 'Deutschkurs', context: 'den Deutschkurs am Morgen', recipient: 'Ihre Lehrerin Frau Klein', formal: true, category: 'E-Mail' as TaskCategory, min: 30, max: 50, time: 15 },
  { name: 'Neue Wohnung', context: 'Ihre neue Wohnung', recipient: 'Ihre Bekannte Maria', formal: false, category: 'E-Mail' as TaskCategory, min: 30, max: 50, time: 15 },
  { name: 'Einkaufen & Supermarkt', context: 'das Einkaufen für das Essen', recipient: 'Ihren Mitbewohner Tom', formal: false, category: 'E-Mail' as TaskCategory, min: 30, max: 50, time: 15 },
  { name: 'Wochenende & Ausflug', context: 'einen Ausflug am Sonntag', recipient: 'Ihren Freund Paul', formal: false, category: 'E-Mail' as TaskCategory, min: 30, max: 50, time: 15 },
  { name: 'Restaurant & Tisch', context: 'einen Tisch im Restaurant', recipient: 'das Restaurant „Sonne“', formal: true, category: 'Brief' as TaskCategory, min: 30, max: 50, time: 15 },
  { name: 'Hotelzimmer buchen', context: 'ein Zimmer im Hotel', recipient: 'das Hotel am Bahnhof', formal: true, category: 'Brief' as TaskCategory, min: 30, max: 50, time: 15 },
  { name: 'Arbeit & Büro', context: 'Ihre Arbeit im Büro', recipient: 'Ihren Kollegen Herrn Becker', formal: true, category: 'E-Mail' as TaskCategory, min: 30, max: 50, time: 15 },
  { name: 'Familie & Besuch', context: 'den Besuch von Ihrer Familie', recipient: 'Ihre Freundin Sara', formal: false, category: 'E-Mail' as TaskCategory, min: 30, max: 50, time: 15 },
  { name: 'Sport & Schwimmbad', context: 'Sport im Schwimmbad', recipient: 'Ihren Freund Jan', formal: false, category: 'E-Mail' as TaskCategory, min: 30, max: 50, time: 15 },
  { name: 'Zug & Bahnhof', context: 'die Fahrt mit dem Zug', recipient: 'Ihre Kollegin Lisa', formal: false, category: 'E-Mail' as TaskCategory, min: 30, max: 50, time: 15 },
  { name: 'Stadt & Treffpunkt', context: 'ein Treffen in der Stadt', recipient: 'Ihren Freund Jonas', formal: false, category: 'E-Mail' as TaskCategory, min: 30, max: 50, time: 15 },
];

const A1_SCENARIO_VARIANTS = [
  {
    focus: 'Einladung schreiben',
    situation: 'Sie planen etwas Besonderes und möchten einladen.',
    req1: 'Warum schreiben Sie? (Grund nennen)',
    req2: 'Wann und wo ist das Treffen?',
    req3: 'Was soll die Person mitbringen?',
  },
  {
    focus: 'Termin absagen',
    situation: 'Sie haben heute leider keine Zeit und müssen absagen.',
    req1: 'Entschuldigen Sie sich kurz.',
    req2: 'Warum können Sie heute nicht kommen?',
    req3: 'Wann haben Sie wieder Zeit?',
  },
  {
    focus: 'Um Information bitten',
    situation: 'Sie haben eine Frage und brauchen kurze Informationen.',
    req1: 'Sagen Sie, was Sie suchen oder brauchen.',
    req2: 'Wann brauchen Sie das? (Tag oder Uhrzeit)',
    req3: 'Fragen Sie nach dem Preis oder der Adresse.',
  },
  {
    focus: 'Etwas reservieren oder buchen',
    situation: 'Sie möchten für das Wochenende etwas reservieren.',
    req1: 'Für wann und für wie viele Personen möchten Sie buchen?',
    req2: 'Welche Wünsche haben Sie? (z. B. Uhrzeit oder Zimmer)',
    req3: 'Bitten Sie um eine kurze Antwort.',
  },
  {
    focus: 'Zu spät kommen',
    situation: 'Ihr Bus hat Verspätung und Sie kommen später.',
    req1: 'Sagen Sie, dass Sie heute später kommen.',
    req2: 'Warum kommen Sie zu spät?',
    req3: 'Um wie viel Uhr sind Sie dort?',
  },
  {
    focus: 'Kurzer Bericht aus dem Alltag',
    situation: 'Sie möchten kurz über Ihre Woche erzählen.',
    req1: 'Wie geht es Ihnen und wo sind Sie gerade?',
    req2: 'Was machen Sie jeden Tag? (1–2 Sätze)',
    req3: 'Wie ist das Wetter oder die Stimmung dort?',
  },
  {
    focus: 'Um Hilfe bitten',
    situation: 'Sie brauchen morgen bei einer Sache Hilfe.',
    req1: 'Wobei brauchen Sie Hilfe?',
    req2: 'Wann und wo soll das sein?',
    req3: 'Danken Sie freundlich für die Hilfe.',
  },
  {
    focus: 'Treffpunkt vorschlagen',
    situation: 'Sie möchten sich bald wiedersehen.',
    req1: 'Wann möchten Sie sich treffen?',
    req2: 'Welchen Ort schlagen Sie vor?',
    req3: 'Was möchten Sie zusammen machen?',
  },
  {
    focus: 'Danke sagen',
    situation: 'Sie haben ein Geschenk oder Hilfe bekommen.',
    req1: 'Bedanken Sie sich herzlich.',
    req2: 'Sagen Sie, was Ihnen besonders gut gefällt.',
    req3: 'Laden Sie die Person auf einen Kaffee ein.',
  },
  {
    focus: 'Etwas suchen oder finden',
    situation: 'Sie haben etwas vergessen oder suchen eine Adresse.',
    req1: 'Was suchen oder brauchen Sie genau?',
    req2: 'Wo waren Sie zuletzt?',
    req3: 'Wie kann man Sie erreichen? (Telefon oder E-Mail)',
  },
  {
    focus: 'Zeit ändern',
    situation: 'Der alte Termin passt leider nicht mehr.',
    req1: 'Warum können Sie am alten Termin nicht?',
    req2: 'Welchen neuen Tag schlagen Sie vor?',
    req3: 'Fragen Sie: Passt der neue Termin?',
  },
  {
    focus: 'Nach dem Weg fragen',
    situation: 'Sie kommen bald an und kennen den Weg noch nicht.',
    req1: 'Wann kommen Sie am Bahnhof oder Haus an?',
    req2: 'Wie kommen Sie zum Ziel? (Bus, U-Bahn oder zu Fuß?)',
    req3: 'Fragen Sie nach der genauen Hausnummer oder Haltestelle.',
  },
];

// ============================================================================
// 2. A2 LEVEL (Goethe-Zertifikat A2 / telc Deutsch A2)
//    - 50–80 words, 20–25 minutes, 4 concrete everyday Leitpunkte
//    - Everyday narration (Perfekt), simple reasons (weil/denn), polite requests
// ============================================================================
const A2_THEMES = [
  { name: 'Freunde & Einladungen', category: 'E-Mail' as TaskCategory, min: 50, max: 80, time: 20, formal: false },
  { name: 'Reisen & Ferien', category: 'E-Mail' as TaskCategory, min: 55, max: 80, time: 20, formal: false },
  { name: 'Wohnen & Umzug', category: 'E-Mail' as TaskCategory, min: 55, max: 80, time: 20, formal: false },
  { name: 'Arbeit & Kollegen', category: 'Brief' as TaskCategory, min: 50, max: 80, time: 20, formal: true },
  { name: 'Gesundheit & Arztbesuch', category: 'Brief' as TaskCategory, min: 50, max: 75, time: 20, formal: true },
  { name: 'Essen & Kochen', category: 'E-Mail' as TaskCategory, min: 50, max: 80, time: 20, formal: false },
  { name: 'Deutschkurs & Hausaufgaben', category: 'E-Mail' as TaskCategory, min: 50, max: 80, time: 20, formal: true },
  { name: 'Einkaufen & Geschenke', category: 'E-Mail' as TaskCategory, min: 55, max: 80, time: 20, formal: false },
  { name: 'Wochenendausflug & Wetter', category: 'E-Mail' as TaskCategory, min: 55, max: 80, time: 20, formal: false },
  { name: 'Familie & Alltag', category: 'E-Mail' as TaskCategory, min: 55, max: 80, time: 20, formal: false },
  { name: 'Freizeitverein & Anmeldung', category: 'Brief' as TaskCategory, min: 50, max: 80, time: 20, formal: true },
  { name: 'Feste & Feiern', category: 'E-Mail' as TaskCategory, min: 55, max: 80, time: 20, formal: false },
  { name: 'Bahnfahrt & Verspätung', category: 'Brief' as TaskCategory, min: 50, max: 80, time: 20, formal: true },
  { name: 'Nachbarschaft & Hausordnung', category: 'Brief' as TaskCategory, min: 50, max: 80, time: 20, formal: true },
];

const A2_SCENARIO_VARIANTS = [
  {
    focus: 'Einladung annehmen und nachfragen',
    intro: 'Sie haben eine Einladung zum Thema',
    req1: 'Bedanken Sie sich herzlich für die Einladung.',
    req2: 'Sagen Sie, wann Sie ankommen und wie lange Sie bleiben können.',
    req3: 'Bieten Sie an, etwas zum Essen oder Trinken mitzubringen.',
    req4: 'Fragen Sie nach der genauen Adresse oder der Wegbeschreibung.',
  },
  {
    focus: 'Entschuldigung und neuer Termin',
    intro: 'Sie können einen wichtigen Termin zum Thema',
    req1: 'Entschuldigen Sie sich für die kurzfristige Absage.',
    req2: 'Erklären Sie einfach, warum Sie nicht kommen können.',
    req3: 'Schlagen Sie einen neuen Tag und eine Uhrzeit vor.',
    req4: 'Bitten Sie um eine kurze Rückmeldung.',
  },
  {
    focus: 'Erlebnis am Wochenende erzählen',
    intro: 'Sie möchten einem Bekannten kurz von Ihren Erlebnissen rund um',
    req1: 'Erzählen Sie im Perfekt, wo Sie waren und was Sie gemacht haben.',
    req2: 'Wer war dabei und wie war die Stimmung?',
    req3: 'Was hat Ihnen besonders gut gefallen und warum?',
    req4: 'Laden Sie die Person ein, nächstes Mal mitzukommen.',
  },
  {
    focus: 'Um Auskunft und Anmeldung bitten',
    intro: 'Sie interessieren sich für ein Angebot zum Bereich',
    req1: 'Schreiben Sie, wofür Sie sich interessieren.',
    req2: 'Fragen Sie nach den genauen Zeiten und Terminen.',
    req3: 'Fragen Sie, wie viel es kostet und was man mitbringen muss.',
    req4: 'Bitten Sie um eine schriftliche Antwort per E-Mail.',
  },
  {
    focus: 'Kleines Problem freundlich melden',
    intro: 'Es gibt eine kleine Störung oder ein Problem bei',
    req1: 'Beschreiben Sie kurz und höflich, was passiert ist.',
    req2: 'Sagen Sie, seit wann das Problem besteht.',
    req3: 'Erklären Sie, warum eine schnelle Lösung wichtig für Sie ist.',
    req4: 'Fragen Sie, wann jemand helfen oder kommen kann.',
  },
  {
    focus: 'Umzug oder Veränderung mitteilen',
    intro: 'In Ihrem Alltag gibt es Neuigkeiten im Bereich',
    req1: 'Berichten Sie kurz, was sich geändert hat.',
    req2: 'Beschreiben Sie, wie Ihnen die neue Situation gefällt.',
    req3: 'Erklären Sie, was noch vorbereitet oder erledigt werden muss.',
    req4: 'Laden Sie zu einem Besuch am nächsten Wochenende ein.',
  },
  {
    focus: 'Geschenk gemeinsam planen',
    intro: 'Sie wollen zusammen mit anderen eine Überraschung vorbereiten für',
    req1: 'Machen Sie einen Vorschlag für ein passendes Geschenk.',
    req2: 'Begründen Sie kurz, warum die Idee gut passt.',
    req3: 'Schlagen Sie vor, wann und wo Sie gemeinsam einkaufen gehen können.',
    req4: 'Fragen Sie nach dem Budget und weiteren Ideen.',
  },
  {
    focus: 'Hilfe anbieten und organisieren',
    intro: 'Ein Bekannter braucht Unterstützung im Alltag beim Thema',
    req1: 'Sagen Sie freundlich, dass Sie gerne helfen möchten.',
    req2: 'Schlagen Sie zwei konkrete Tage vor, an denen Sie Zeit haben.',
    req3: 'Fragen Sie, was genau vorbereitet werden soll.',
    req4: 'Geben Sie Ihre Telefonnummer für Rückfragen an.',
  },
  {
    focus: 'Tipps und Ratschläge geben',
    intro: 'Eine Freundin möchte mehr erfahren und bittet um Tipps zu',
    req1: 'Berichten Sie kurz von Ihrer eigenen Erfahrung.',
    req2: 'Geben Sie zwei praktische Tipps, die leicht umzusetzen sind.',
    req3: 'Nennen Sie einen Ort oder eine Zeit, die besonders günstig ist.',
    req4: 'Wünschen Sie viel Erfolg und bieten Sie ein Gespräch an.',
  },
  {
    focus: 'Krankheit und Vertretung melden',
    intro: 'Sie sind leicht erkältet und schreiben eine kurze Nachricht wegen',
    req1: 'Informieren Sie rechtzeitig über Ihre Situation.',
    req2: 'Erklären Sie, was der Arzt gesagt hat und wie lange Sie fehlen.',
    req3: 'Schreiben Sie, wer wichtige Aufgaben übernehmen kann oder was dringend ist.',
    req4: 'Versprechen Sie, sich zu melden, sobald es Ihnen besser geht.',
  },
  {
    focus: 'Buchung bestätigen oder ändern',
    intro: 'Sie haben eine Reservierung vorgenommen im Zusammenhang mit',
    req1: 'Nennen Sie das Datum Ihrer Reservierung.',
    req2: 'Erklären Sie, welche Änderung Sie wünschen (z. B. Personenanzahl oder Uhrzeit).',
    req3: 'Fragen Sie, ob diese Änderung ohne zusätzliche Kosten möglich ist.',
    req4: 'Bitten Sie um eine kurze Bestätigung.',
  },
  {
    focus: 'Erinnerung und Rückfrage',
    intro: 'Sie haben noch keine Antwort erhalten bezüglich',
    req1: 'Erinnern Sie höflich an Ihre letzte Nachricht.',
    req2: 'Fassen Sie Ihre wichtigste Frage in ein bis zwei Sätzen zusammen.',
    req3: 'Erklären Sie kurz, bis wann Sie die Antwort brauchen.',
    req4: 'Bedanken Sie sich im Voraus für die Mühe.',
  },
];

// ============================================================================
// 3. B1 LEVEL (Goethe-Zertifikat B1 / telc Deutsch B1)
//    - 80–115 words, 20–25 minutes, 4 genuine B1 Leitpunkte
//    - Personal emails, semi-formal letters, everyday online forum opinions
// ============================================================================
const B1_THEMES = [
  { name: 'Freizeit & Hobbys', category: 'E-Mail' as TaskCategory, min: 80, max: 110, time: 20 },
  { name: 'Reisen & Urlaub', category: 'E-Mail' as TaskCategory, min: 80, max: 110, time: 20 },
  { name: 'Wohnen & Nachbarschaft', category: 'Brief' as TaskCategory, min: 80, max: 110, time: 20 },
  { name: 'Sprachkurs & Weiterbildung', category: 'Brief' as TaskCategory, min: 80, max: 110, time: 20 },
  { name: 'Arbeit & Praktikum', category: 'Brief' as TaskCategory, min: 80, max: 110, time: 20 },
  { name: 'Einkaufen & Online-Shopping', category: 'Stellungnahme' as TaskCategory, min: 85, max: 115, time: 25 },
  { name: 'Gesundheit & Ernährung', category: 'Stellungnahme' as TaskCategory, min: 85, max: 115, time: 25 },
  { name: 'Medien & Smartphone im Alltag', category: 'Stellungnahme' as TaskCategory, min: 85, max: 115, time: 25 },
  { name: 'Umwelt & Mülltrennung', category: 'Stellungnahme' as TaskCategory, min: 85, max: 115, time: 25 },
  { name: 'Familie & Feste', category: 'E-Mail' as TaskCategory, min: 80, max: 110, time: 20 },
  { name: 'Freundschaft & Ausflüge', category: 'E-Mail' as TaskCategory, min: 80, max: 110, time: 20 },
  { name: 'Verkehr & öffentliche Verkehrsmittel', category: 'Brief' as TaskCategory, min: 80, max: 110, time: 20 },
  { name: 'Kino, Musik & Unterhaltung', category: 'Stellungnahme' as TaskCategory, min: 85, max: 115, time: 25 },
  { name: 'Haustiere & Natur', category: 'Stellungnahme' as TaskCategory, min: 85, max: 115, time: 25 },
];

const B1_SCENARIO_VARIANTS = [
  {
    focus: 'Erfahrungsbericht an Freunde',
    intro: 'Sie haben vor Kurzem neue Erfahrungen im Bereich',
    req1: 'Beschreiben Sie genau, was Sie erlebt haben.',
    req2: 'Begründen Sie, was Ihnen besonders gut oder nicht gefallen hat.',
    req3: 'Geben Sie einen praktischen Tipp für Interessierte.',
    req4: 'Schlagen Sie ein gemeinsames Treffen oder eine Aktivität vor.',
  },
  {
    focus: 'Entschuldigung und Terminverschiebung',
    intro: 'Wegen eines wichtigen Termins müssen Sie Ihre Pläne zum Thema',
    req1: 'Entschuldigen Sie sich höflich für die Absage oder Verspätung.',
    req2: 'Erklären Sie nachvollziehbar den Grund dafür.',
    req3: 'Bitten Sie um die wichtigsten Informationen oder Unterlagen.',
    req4: 'Schlagen Sie einen konkreten neuen Termin vor.',
  },
  {
    focus: 'Meinungsäußerung im Online-Forum',
    intro: 'Im Internet lesen Sie eine Diskussion über das Thema',
    req1: 'Sagen Sie klar, wie Ihre persönliche Meinung dazu ist.',
    req2: 'Nennen Sie zwei wichtige Vorteile für den Alltag.',
    req3: 'Beschreiben Sie mögliche Nachteile oder Probleme.',
    req4: 'Berichten Sie kurz, wie die Situation in Ihrem Heimatland aussieht.',
  },
  {
    focus: 'Einladung und gemeinsame Planung',
    intro: 'Sie organisieren bald eine kleine Veranstaltung rund um',
    req1: 'Laden Sie Ihre Freunde oder Bekannten herzlich dazu ein.',
    req2: 'Erklären Sie den Anlass, das Datum und was geplant ist.',
    req3: 'Bitten Sie freundlich um Hilfe bei der Vorbereitung.',
    req4: 'Fragen Sie, wer Zeit hat und ob es besondere Wünsche gibt.',
  },
  {
    focus: 'Rat und persönliche Empfehlung',
    intro: 'Eine gute Freundin hat eine Frage und bittet Sie um Rat zum Thema',
    req1: 'Zeigen Sie Verständnis für ihre Situation.',
    req2: 'Erzählen Sie von einer ähnlichen Erfahrung, die Sie gemacht haben.',
    req3: 'Empfehlen Sie zwei konkrete Möglichkeiten zur Lösung.',
    req4: 'Bieten Sie Ihre Unterstützung in den nächsten Tagen an.',
  },
  {
    focus: 'Höfliche Anfrage und Beschwerde',
    intro: 'Bei einem Angebot oder Service hatten Sie Schwierigkeiten im Bereich',
    req1: 'Schildern Sie kurz, was vereinbart oder gebucht war.',
    req2: 'Beschreiben Sie genau, was nicht gut funktioniert hat.',
    req3: 'Erklären Sie, warum das für Sie ärgerlich oder unpraktisch war.',
    req4: 'Fragen Sie höflich nach einer Lösung oder Erstattung.',
  },
  {
    focus: 'Gewohnheiten im Alltag ändern',
    intro: 'Sie haben beschlossen, Ihren Alltag etwas umzustellen beim Thema',
    req1: 'Erklären Sie, warum Sie diese Entscheidung getroffen haben.',
    req2: 'Beschreiben Sie, was Sie jetzt anders machen als früher.',
    req3: 'Welche positiven Veränderungen merken Sie schon?',
    req4: 'Ermutigen Sie andere, das ebenfalls einmal auszuprobieren.',
  },
  {
    focus: 'Glückwunsch und Überraschung',
    intro: 'Ein guter Bekannter feiert einen besonderen Erfolg im Bereich',
    req1: 'Gratulieren Sie herzlich zu diesem schönen Anlass.',
    req2: 'Erinnern Sie an ein schönes gemeinsames Erlebnis.',
    req3: 'Machen Sie einen Vorschlag für ein gemeinsames Geschenk.',
    req4: 'Fragen Sie nach der Uhrzeit und dem Treffpunkt für die Feier.',
  },
  {
    focus: 'Vergleich von früher und heute',
    intro: 'In einem Blogartikel geht es um Veränderungen bei',
    req1: 'Vergleichen Sie, wie Jüngere und Ältere mit diesem Thema umgehen.',
    req2: 'Nennen Sie ein passendes Beispiel aus Ihrer Familie oder Bekanntschaft.',
    req3: 'Erklären Sie, was Sie an der heutigen Entwicklung gut finden.',
    req4: 'Fassen Sie Ihre Meinung in einem kurzen Schlusssatz zusammen.',
  },
  {
    focus: 'Neues Projekt in der Nachbarschaft',
    intro: 'In Ihrer Stadt oder Nachbarschaft gibt es neue Ideen zum Thema',
    req1: 'Beschreiben Sie, was vor Ort neu geplant ist.',
    req2: 'Erklären Sie, wie die Nachbarn oder Freunde darauf reagieren.',
    req3: 'Nennen Sie Ihre eigenen Wünsche oder Bedenken dazu.',
    req4: 'Schlagen Sie vor, gemeinsam an einem Treffen teilzunehmen.',
  },
  {
    focus: 'Tipps zum Lernen und Üben',
    intro: 'In Ihrer Lerngruppe sprechen Sie über Erfahrungen mit',
    req1: 'Erzählen Sie, welche Übungen oder Wege Ihnen am besten helfen.',
    req2: 'Beschreiben Sie, was Ihnen am Anfang schwergefallen ist.',
    req3: 'Geben Sie zwei Tipps, wie man motiviert bleiben kann.',
    req4: 'Fragen Sie die anderen nach ihren eigenen Erfahrungen.',
  },
  {
    focus: 'Pläne für die nächsten Monate',
    intro: 'Sie denken über das nächste Jahr nach und planen etwas im Bereich',
    req1: 'Beschreiben Sie Ihre wichtigsten Ziele für die kommende Zeit.',
    req2: 'Begründen Sie, warum Ihnen diese Pläne wichtig sind.',
    req3: 'Erzählen Sie, wie Sie sich schon jetzt darauf vorbereiten.',
    req4: 'Fragen Sie Ihren Gesprächspartner nach seinen eigenen Plänen.',
  },
];

// ============================================================================
// 4. B2 LEVEL (Goethe-Zertifikat B2 / telc Deutsch B2)
//    - 160–220 words, 30–35 minutes, 4 differentiated B2 Leitpunkte
// ============================================================================
const B2_THEMES = [
  { name: 'Arbeitswelt & New Work', category: 'Stellungnahme' as TaskCategory, min: 170, max: 220, time: 35 },
  { name: 'Kundenbeschwerde & Reklamation', category: 'Beschwerde' as TaskCategory, min: 160, max: 210, time: 30 },
  { name: 'Mobilität & Klimaschutz', category: 'Stellungnahme' as TaskCategory, min: 170, max: 220, time: 35 },
  { name: 'Digitalisierung & Mediennutzung', category: 'Stellungnahme' as TaskCategory, min: 170, max: 220, time: 35 },
  { name: 'Wohnungsmarkt & Mietrecht', category: 'Brief' as TaskCategory, min: 160, max: 210, time: 30 },
  { name: 'Lebenslanges Lernen & Karriere', category: 'Stellungnahme' as TaskCategory, min: 170, max: 220, time: 35 },
  { name: 'Konsumgesellschaft & Verpackungsmüll', category: 'Stellungnahme' as TaskCategory, min: 170, max: 220, time: 35 },
  { name: 'Gesundheitsförderung im Betrieb', category: 'Brief' as TaskCategory, min: 160, max: 210, time: 30 },
  { name: 'Reisereklamation & Pauschalurlaub', category: 'Beschwerde' as TaskCategory, min: 160, max: 210, time: 30 },
  { name: 'Datenschutz & Überwachung', category: 'Stellungnahme' as TaskCategory, min: 170, max: 220, time: 35 },
  { name: 'Ehrenamt & Bürgerbeteiligung', category: 'Stellungnahme' as TaskCategory, min: 170, max: 220, time: 35 },
  { name: 'Ernährung & Massentierhaltung', category: 'Stellungnahme' as TaskCategory, min: 170, max: 220, time: 35 },
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

// ============================================================================
// 5. C1 LEVEL (Goethe-Zertifikat C1 / TestDaF / DSH)
//    - 240–330 words, 40–45 minutes, 4 analytical/academic Leitpunkte
// ============================================================================
const C1_THEMES = [
  { name: 'Künstliche Intelligenz & Epistemische Autonomie', category: 'Erörterung' as TaskCategory, min: 250, max: 330, time: 45 },
  { name: 'Wissenschaftsfreiheit & Akademische Integrität', category: 'Erörterung' as TaskCategory, min: 250, max: 330, time: 45 },
  { name: 'Bioethik & Genetische Modifikation', category: 'Erörterung' as TaskCategory, min: 250, max: 330, time: 45 },
  { name: 'Demokratie & Digitale Desinformation', category: 'Stellungnahme' as TaskCategory, min: 240, max: 320, time: 45 },
  { name: 'Energiewende & Verteilungsgerechtigkeit', category: 'Erörterung' as TaskCategory, min: 250, max: 330, time: 45 },
  { name: 'Wirtschaftswachstum vs. Postwachstumsökonomie', category: 'Erörterung' as TaskCategory, min: 250, max: 330, time: 45 },
  { name: 'Bildungsmonopole & Soziale Mobilität', category: 'Bericht' as TaskCategory, min: 240, max: 320, time: 40 },
  { name: 'Überwachungskapitalismus & Privatsphäre', category: 'Stellungnahme' as TaskCategory, min: 240, max: 320, time: 45 },
  { name: 'Globalisierung & Resilienz von Lieferketten', category: 'Erörterung' as TaskCategory, min: 250, max: 330, time: 45 },
  { name: 'Automatisierung & Bedingungsloses Grundeinkommen', category: 'Erörterung' as TaskCategory, min: 250, max: 330, time: 45 },
  { name: 'Urbanisierung, Segregation & Gentrifizierung', category: 'Bericht' as TaskCategory, min: 240, max: 320, time: 40 },
  { name: 'Sprachwandel, Anglizismen & Identität', category: 'Stellungnahme' as TaskCategory, min: 240, max: 320, time: 45 },
  { name: 'Beschleunigung & Psychische Belastungen', category: 'Erörterung' as TaskCategory, min: 250, max: 330, time: 45 },
  { name: 'Klimagerechtigkeit im Nord-Süd-Konflikt', category: 'Erörterung' as TaskCategory, min: 250, max: 330, time: 45 },
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
 * Generates 840 standardized CEFR exam prompts (168 A1, 168 A2, 168 B1, 168 B2, 168 C1)
 * Distributed evenly 1:1:1:1:1 with realistic Goethe/telc difficulty and word counts.
 */
function buildCentralExamPool(): WritingTask[] {
  const tasks: WritingTask[] = [];

  // 1. Generate 168 A1 Tasks (14 themes * 12 scenarios)
  let a1Counter = 1;
  A1_THEMES.forEach((theme) => {
    A1_SCENARIO_VARIANTS.forEach((scenario) => {
      const padId = String(a1Counter).padStart(3, '0');
      const anrede = theme.formal ? 'Sie (formell)' : 'du (persönlich)';
      tasks.push({
        id: `task-a1-${padId}`,
        task_id: `EXAM-A1-${padId}`,
        language: 'de',
        cefr_level: 'A1',
        category: theme.category,
        topic: theme.name,
        title: `${theme.name}: ${scenario.focus}`,
        instructions: `${scenario.situation} Schreiben Sie eine kurze Nachricht (${theme.category}) über ${theme.context} an ${theme.recipient} (${anrede}). Schreiben Sie zu allen 3 Punkten (30–50 Wörter).`,
        requirements: [scenario.req1, scenario.req2, scenario.req3],
        min_words: theme.min,
        max_words: theme.max,
        time_limit_minutes: theme.time,
        task_version: '4.0',
        sample_outline: [
          theme.formal ? 'Anrede: Sehr geehrte Damen und Herren / Guten Tag...' : 'Anrede: Liebe/r ... / Hallo ...',
          'Punkt 1 bis 3 kurz und klar beantworten (1–2 kurze Sätze pro Punkt)',
          theme.formal ? 'Gruß: Mit freundlichen Grüßen + Ihr Name' : 'Gruß: Viele Grüße / Bis bald + Dein Name',
        ],
        sample_starter: theme.formal
          ? 'Sehr geehrte Damen und Herren, ich schreibe Ihnen wegen...'
          : 'Hallo! Ich möchte dir kurz schreiben...',
      });
      a1Counter++;
    });
  });

  // 2. Generate 168 A2 Tasks (14 themes * 12 scenarios)
  let a2Counter = 1;
  A2_THEMES.forEach((theme) => {
    A2_SCENARIO_VARIANTS.forEach((scenario) => {
      const padId = String(a2Counter).padStart(3, '0');
      const registerHint = theme.formal ? 'Schreiben Sie höflich (Sie).' : 'Schreiben Sie freundlich an eine bekannte Person (du).';
      tasks.push({
        id: `task-a2-${padId}`,
        task_id: `EXAM-A2-${padId}`,
        language: 'de',
        cefr_level: 'A2',
        category: theme.category,
        topic: theme.name,
        title: `${theme.name}: ${scenario.focus}`,
        instructions: `${scenario.intro} „${theme.name}“. ${registerHint} Antworten Sie auf alle 4 Leitpunkte in kurzen, gut verbundenen Sätzen (50–80 Wörter).`,
        requirements: [scenario.req1, scenario.req2, scenario.req3, scenario.req4],
        min_words: theme.min,
        max_words: theme.max,
        time_limit_minutes: theme.time,
        task_version: '4.0',
        sample_outline: [
          theme.formal ? 'Höfliche Anrede und Anlass der Nachricht' : 'Freundliche Begrüßung und kurzer Einstieg',
          'Erste zwei Leitpunkte mit einfachen Gründen (weil / denn) erklären',
          'Letzte zwei Leitpunkte und eine konkrete Frage beantworten',
          theme.formal ? 'Mit freundlichen Grüßen + Name' : 'Liebe Grüße + Name',
        ],
        sample_starter: theme.formal
          ? 'Sehr geehrte Damen und Herren, vielen Dank für Ihre Nachricht. Ich schreibe Ihnen, weil...'
          : 'Liebe/r ..., wie geht es dir? Ich wollte dir kurz wegen... schreiben.',
      });
      a2Counter++;
    });
  });

  // 3. Generate 168 B1 Tasks (14 themes * 12 scenarios)
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
        instructions: `${scenario.intro} „${theme.name}“. Schreiben Sie einen zusammenhängenden Text (${theme.category}) auf Deutsch und gehen Sie auf alle 4 Leitpunkte ein.`,
        requirements: [scenario.req1, scenario.req2, scenario.req3, scenario.req4],
        min_words: theme.min,
        max_words: theme.max,
        time_limit_minutes: theme.time,
        task_version: '4.0',
        sample_outline: [
          theme.category === 'Stellungnahme'
            ? 'Einstieg ins Thema und klare persönliche Position'
            : 'Passende Anrede und Grund des Schreibens',
          'Behandlung der ersten beiden Leitpunkte mit Begründung (weil, obwohl)',
          'Behandlung der letzten beiden Leitpunkte mit eigenem Beispiel',
          theme.category === 'Stellungnahme'
            ? 'Kurzes persönliches Fazit'
            : 'Freundlicher Schluss und passende Verabschiedung',
        ],
        sample_starter:
          theme.category === 'Brief'
            ? 'Sehr geehrte Damen und Herren, ich schreibe Ihnen bezüglich...'
            : theme.category === 'Stellungnahme'
            ? 'Ich finde dieses Thema im Alltag sehr wichtig. Aus meiner Sicht...'
            : 'Liebe Freunde, ich möchte euch heute gerne von... berichten.',
      });
      b1Counter++;
    });
  });

  // 4. Generate 168 B2 Tasks (14 themes * 12 scenarios)
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
        task_version: '4.0',
        sample_outline: [
          'Einleitung: Definition der Ausgangslage und Relevanz für Gesellschaft/Betrieb',
          'Hauptteil 1: Ausführliche Erörterung der ersten beiden Kernaspekte mit Argumenten',
          'Hauptteil 2: Reflexion von Gegenargumenten, Risiken oder alternativen Lösungsansätzen',
          'Schluss: Ausgewogene Zusammenfassung und zukunftsgerichtetes persönliches Fazit',
        ],
        sample_starter:
          theme.category === 'Beschwerde'
            ? 'Sehr geehrte Damen und Herren, mit diesem Schreiben möchte ich meine Beanstandung bezüglich...'
            : theme.category === 'Brief'
            ? 'Sehr geehrte Damen und Herren, bezugnehmend auf die aktuelle Situation möchte ich mich an Sie wenden...'
            : 'Das Thema erfreut sich in jüngster Zeit reger gesellschaftlicher Aufmerksamkeit...',
      });
      b2Counter++;
    });
  });

  // 5. Generate 168 C1 Tasks (14 themes * 12 scenarios)
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
        task_version: '4.0',
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
