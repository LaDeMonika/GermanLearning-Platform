/* Grammar data: cases, pronouns, possessives, people, exercises. */

const CASES = {
  nom: { name: 'Nominativ', short: 'Nom', q: 'Wer? / Was?', role: 'Subject: who or what does the action' },
  akk: { name: 'Akkusativ', short: 'Akk', q: 'Wen? / Was?', role: 'Direct object: who or what the action hits' },
  dat: { name: 'Dativ', short: 'Dat', q: 'Wem?', role: 'Indirect object: to / for whom (the receiver)' },
  gen: { name: 'Genitiv', short: 'Gen', q: 'Wessen?', role: 'Owner: whose' },
};
const CASE_KEYS = ['nom', 'akk', 'dat', 'gen'];

const GENDERS = {
  m: { name: 'masculine', art: 'der' },
  f: { name: 'feminine', art: 'die' },
  n: { name: 'neuter', art: 'das' },
  pl: { name: 'plural', art: 'die' },
};
const GENDER_KEYS = ['m', 'f', 'n', 'pl'];

const DEF_ART = {
  nom: { m: 'der', f: 'die', n: 'das', pl: 'die' },
  akk: { m: 'den', f: 'die', n: 'das', pl: 'die' },
  dat: { m: 'dem', f: 'der', n: 'dem', pl: 'den' },
  gen: { m: 'des', f: 'der', n: 'des', pl: 'der' },
};

// ein / kein / mein ... all share these endings
const POSS_END = {
  nom: { m: '', f: 'e', n: '', pl: 'e' },
  akk: { m: 'en', f: 'e', n: '', pl: 'e' },
  dat: { m: 'em', f: 'er', n: 'em', pl: 'en' },
  gen: { m: 'es', f: 'er', n: 'es', pl: 'er' },
};

function possForm(stem, c, g) {
  const e = POSS_END[c][g];
  if (!e) return stem;
  if (stem === 'euer') return 'eur' + e; // euer -> eure, euren, eurem ...
  return stem + e;
}

const PRONOUNS = {
  ich:   { label: 'ich',        en: 'I',                     nom: 'ich', akk: 'mich', dat: 'mir',   gen: 'meiner', poss: 'mein',  possEn: 'my' },
  du:    { label: 'du',         en: 'you (1 person, informal)', nom: 'du', akk: 'dich', dat: 'dir', gen: 'deiner', poss: 'dein',  possEn: 'your' },
  er:    { label: 'er',         en: 'he / it (der-word)',    nom: 'er',  akk: 'ihn',  dat: 'ihm',   gen: 'seiner', poss: 'sein',  possEn: 'his / its' },
  sie:   { label: 'sie',        en: 'she / it (die-word)',   nom: 'sie', akk: 'sie',  dat: 'ihr',   gen: 'ihrer',  poss: 'ihr',   possEn: 'her / its' },
  es:    { label: 'es',         en: 'it (das-word)',         nom: 'es',  akk: 'es',   dat: 'ihm',   gen: 'seiner', poss: 'sein',  possEn: 'its' },
  wir:   { label: 'wir',        en: 'we',                    nom: 'wir', akk: 'uns',  dat: 'uns',   gen: 'unser',  poss: 'unser', possEn: 'our' },
  ihr:   { label: 'ihr',        en: 'you all (informal)',    nom: 'ihr', akk: 'euch', dat: 'euch',  gen: 'euer',   poss: 'euer',  possEn: 'your (plural)' },
  siePl: { label: 'sie (pl.)',  en: 'they',                  nom: 'sie', akk: 'sie',  dat: 'ihnen', gen: 'ihrer',  poss: 'ihr',   possEn: 'their' },
  Sie:   { label: 'Sie',        en: 'you (formal, 1 or more)', nom: 'Sie', akk: 'Sie', dat: 'Ihnen', gen: 'Ihrer', poss: 'Ihr', possEn: 'your (formal)' },
};
const PRONOUN_KEYS = ['ich', 'du', 'er', 'sie', 'es', 'wir', 'ihr', 'siePl', 'Sie'];
// Short labels for answer buttons where "sie" is ambiguous
const PRONOUN_BTN = { ich: 'ich', du: 'du', er: 'er', sie: 'sie (she)', es: 'es', wir: 'wir', ihr: 'ihr', siePl: 'sie (they)', Sie: 'Sie (formal)' };

const CONJ = {
  sein:   { ich: 'bin',   du: 'bist',   er: 'ist',  sie: 'ist',  es: 'ist',  wir: 'sind',   ihr: 'seid',  siePl: 'sind',   Sie: 'sind' },
  haben:  { ich: 'habe',  du: 'hast',   er: 'hat',  sie: 'hat',  es: 'hat',  wir: 'haben',  ihr: 'habt',  siePl: 'haben',  Sie: 'haben' },
  kommen: { ich: 'komme', du: 'kommst', er: 'kommt', sie: 'kommt', es: 'kommt', wir: 'kommen', ihr: 'kommt', siePl: 'kommen', Sie: 'kommen' },
};

/* ---------- The cast: everyone seen from YOUR point of view ---------- */

const PEOPLE = {
  me:      { name: 'You',        emoji: '🙋', role: 'the speaker',        pron3: 'ich',   item: { n: 'Buch', g: 'n', e: '📕', gen: 'Buches' } },
  anna:    { name: 'Anna',       emoji: '👩', role: 'your friend',        pron3: 'sie',   item: { n: 'Auto', g: 'n', e: '🚗', gen: 'Autos' } },
  ben:     { name: 'Ben',        emoji: '👨', role: 'your friend',        pron3: 'er',    item: { n: 'Rucksack', g: 'm', e: '🎒', gen: 'Rucksacks' } },
  annaben: { name: 'Anna & Ben', emoji: '👩👨', role: 'your two friends', pron3: 'siePl', item: { n: 'Wohnung', g: 'f', e: '🏠' } },
  weber:   { name: 'Frau Weber', emoji: '👩‍💼', role: 'your boss',        pron3: 'sie',   item: { n: 'Tasche', g: 'f', e: '💼' } },
  tom:     { name: 'Tom',        emoji: '🧑', role: 'a colleague',        pron3: 'er',    item: { n: 'Hund', g: 'm', e: '🐕', gen: 'Hundes', anim: true } },
  lisa:    { name: 'Lisa',       emoji: '👩‍🦰', role: 'your neighbour',    pron3: 'sie',   item: { n: 'Katze', g: 'f', e: '🐈', anim: true, size: true } },
  baby:    { name: 'das Baby',   emoji: '👶', role: 'Lisa’s baby (das Baby = neuter)', pron3: 'es', item: { n: 'Teddy', g: 'm', e: '🧸', gen: 'Teddys' } },
  tomlisa: { name: 'Tom & Lisa', emoji: '🧑👩‍🦰', role: 'two other people', pron3: 'siePl', item: { n: 'Kinder', g: 'pl', e: '🧒', dat: 'Kindern', anim: true } },
  us:      { name: 'You & Tom',  emoji: '🙋🧑', role: 'you + someone else', pron3: 'wir',   item: { n: 'Garten', g: 'm', e: '🌳', gen: 'Gartens' } },
};

// Who you are talking to decides who is du / ihr / Sie.
const LISTENERS = {
  anna:    { label: 'Anna',       desc: 'one friend',       pron: 'du',  excludes: ['annaben'] },
  annaben: { label: 'Anna & Ben', desc: 'two friends',      pron: 'ihr', excludes: ['anna', 'ben'] },
  weber:   { label: 'Frau Weber', desc: 'your boss, formal', pron: 'Sie', excludes: [] },
};

/* ---------- Nouns for possessive practice ---------- */

const NOUNS = [
  { n: 'Hund', g: 'm', e: '🐕', anim: true, size: true, gen: 'Hundes' },
  { n: 'Bruder', g: 'm', e: '👦', anim: true, size: true, gen: 'Bruders' },
  { n: 'Vater', g: 'm', e: '👨‍🦳', anim: true, gen: 'Vaters' },
  { n: 'Schlüssel', g: 'm', e: '🔑', gen: 'Schlüssels' },
  { n: 'Rucksack', g: 'm', e: '🎒', gen: 'Rucksacks' },
  { n: 'Katze', g: 'f', e: '🐈', anim: true, size: true },
  { n: 'Schwester', g: 'f', e: '👧', anim: true, size: true },
  { n: 'Mutter', g: 'f', e: '👩', anim: true },
  { n: 'Tasche', g: 'f', e: '👜' },
  { n: 'Jacke', g: 'f', e: '🧥' },
  { n: 'Auto', g: 'n', e: '🚗', gen: 'Autos' },
  { n: 'Buch', g: 'n', e: '📕', gen: 'Buches' },
  { n: 'Handy', g: 'n', e: '📱', gen: 'Handys' },
  { n: 'Fahrrad', g: 'n', e: '🚲', gen: 'Fahrrads' },
  { n: 'Eltern', g: 'pl', e: '👫', anim: true },
  { n: 'Kinder', g: 'pl', e: '🧒', anim: true, size: true, dat: 'Kindern' },
  { n: 'Schuhe', g: 'pl', e: '👟', dat: 'Schuhen' },
  { n: 'Freunde', g: 'pl', e: '🧑‍🤝‍🧑', anim: true, dat: 'Freunden' },
];

// Dativ plural adds -n, Genitiv m/n adds -(e)s
function nounForm(noun, c) {
  if (c === 'dat' && noun.dat) return noun.dat;
  if (c === 'gen' && noun.gen) return noun.gen;
  return noun.n;
}

/* ---------- Exercise templates ---------- */

// {X} = the pronoun blank. self: subject is "ich", so the target can't be ich / wir.
const PRON_TEMPLATES = [
  { c: 'nom', s: '{X} {sein} heute müde.', q: 'Wer ist heute müde?', why: 'The person is the subject; the verb form agrees with it.' },
  { c: 'nom', s: '{X} {haben} Hunger.', q: 'Wer hat Hunger?', why: 'The person is the subject; the verb form agrees with it.' },
  { c: 'nom', s: 'Morgen {kommen} {X} zur Party.', q: 'Wer kommt morgen zur Party?', why: 'The subject can stand after the verb; it is still Nominativ.' },
  { c: 'akk', self: true, s: 'Ich sehe {X}.', q: 'Wen sehe ich?', why: 'sehen + direct object → Akkusativ.' },
  { c: 'akk', self: true, s: 'Ich frage {X}.', q: 'Wen frage ich?', why: 'fragen + Akkusativ.' },
  { c: 'akk', self: true, s: 'Ich rufe {X} morgen an.', q: 'Wen rufe ich morgen an?', why: 'anrufen + Akkusativ.' },
  { c: 'akk', self: true, s: 'Ich vermisse {X}.', q: 'Wen vermisse ich?', why: 'vermissen + Akkusativ.' },
  { c: 'akk', self: true, s: 'Ich warte auf {X}.', q: 'Auf wen warte ich?', why: 'warten auf + Akkusativ.' },
  { c: 'akk', self: true, s: 'Ich gehe nicht ohne {X}.', q: 'Ohne wen gehe ich nicht?', why: 'ohne → always Akkusativ.' },
  { c: 'akk', s: 'Das Geschenk ist für {X}.', q: 'Für wen ist das Geschenk?', why: 'für → always Akkusativ.' },
  { c: 'akk', s: 'Der Lehrer kennt {X}.', q: 'Wen kennt der Lehrer?', why: 'kennen + direct object → Akkusativ.' },
  { c: 'dat', self: true, s: 'Ich helfe {X}.', q: 'Wem helfe ich?', why: 'helfen → always Dativ.' },
  { c: 'dat', self: true, s: 'Ich danke {X}.', q: 'Wem danke ich?', why: 'danken → always Dativ.' },
  { c: 'dat', self: true, s: 'Ich gehe mit {X} ins Kino.', q: 'Mit wem gehe ich ins Kino?', why: 'mit → always Dativ.' },
  { c: 'dat', self: true, s: 'Ich schreibe {X} eine Nachricht.', q: 'Wem schreibe ich eine Nachricht?', why: 'schreiben: the receiver → Dativ, the thing (eine Nachricht) → Akkusativ.' },
  { c: 'dat', self: true, s: 'Ich wohne bei {X}.', q: 'Bei wem wohne ich?', why: 'bei → always Dativ.' },
  { c: 'dat', s: 'Das Buch gehört {X}.', q: 'Wem gehört das Buch?', why: 'gehören → always Dativ.' },
  { c: 'dat', s: 'Der Film gefällt {X}.', q: 'Wem gefällt der Film?', why: 'gefallen → always Dativ.' },
  { c: 'dat', s: 'Der Lehrer antwortet {X}.', q: 'Wem antwortet der Lehrer?', why: 'antworten → always Dativ.' },
  { c: 'dat', s: 'Der Kellner bringt {X} die Rechnung.', q: 'Wem bringt der Kellner die Rechnung?', why: 'bringen: the receiver → Dativ.' },
];

// {P} = possessive blank, {N} = noun, {ist} = ist/sind. anim: only people/animals (true) or only things (false).
// s / q may be [singular, plural].
const POSS_TEMPLATES = [
  { c: 'nom', s: '{P} {N} {ist} hier.', q: 'Wer/Was {ist} hier?', why: 'It is the subject of the sentence.' },
  { c: 'nom', s: 'Wo {ist} {P} {N}?', q: 'Wer/Was {ist} wo?', why: 'The subject can stand after the verb; it is still Nominativ.' },
  { c: 'nom', s: 'Das {ist} {P} {N}.', q: 'Wer/Was ist das?', why: 'sein (to be) → Nominativ on both sides.' },
  { c: 'akk', s: 'Ich sehe {P} {N}.', q: 'Wen/Was sehe ich?', why: 'sehen + direct object → Akkusativ.' },
  { c: 'akk', s: 'Ich suche {P} {N}.', q: 'Wen/Was suche ich?', why: 'suchen + direct object → Akkusativ.' },
  { c: 'akk', s: 'Ich mag {P} {N}.', q: 'Wen/Was mag ich?', why: 'mögen + direct object → Akkusativ.' },
  { c: 'akk', anim: true, s: 'Das Geschenk ist für {P} {N}.', q: 'Für wen ist das Geschenk?', why: 'für → always Akkusativ.' },
  { c: 'dat', s: 'Was ist mit {P} {N} los?', q: 'Mit wem/was ist etwas los?', why: 'mit → always Dativ.' },
  { c: 'dat', anim: true, s: 'Ich helfe {P} {N}.', q: 'Wem helfe ich?', why: 'helfen → always Dativ.' },
  { c: 'dat', anim: true, s: 'Ich spreche mit {P} {N}.', q: 'Mit wem spreche ich?', why: 'mit → always Dativ.' },
  { c: 'dat', anim: true, s: 'Ich gebe {P} {N} ein Geschenk.', q: 'Wem gebe ich ein Geschenk?', why: 'geben: the receiver → Dativ.' },
  { c: 'gen', anim: true, s: ['Der Name {P} {N} ist schön.', 'Die Namen {P} {N} sind schön.'], q: ['Wessen Name ist schön?', 'Wessen Namen sind schön?'], why: 'Whose? → Genitiv.' },
  { c: 'gen', anim: false, s: 'Die Farbe {P} {N} gefällt mir.', q: 'Wessen Farbe gefällt mir?', why: 'Whose? → Genitiv.' },
];

/* ---------- Case detective: [target] in the sentence, {Q} in the question ---------- */
// t: p = Wer/Was/Wen/Wem/Wessen · prep = wer/wen/wem after a preposition · place = Wo/Wohin/Woher

const DETECTIVE = [
  { s: '[Der Hund] schläft.', q: '{Q} schläft?', a: 'Wer', t: 'p', c: 'nom', why: 'The one doing the action (the subject) → Nominativ.' },
  { s: '[Meine Schwester] wohnt in Berlin.', q: '{Q} wohnt in Berlin?', a: 'Wer', t: 'p', c: 'nom', why: 'Subject → Nominativ.' },
  { s: 'Heute kommt [mein Bruder].', q: '{Q} kommt heute?', a: 'Wer', t: 'p', c: 'nom', why: 'The subject can come after the verb. Still Nominativ.' },
  { s: 'Das ist [ein Tisch].', q: '{Q} ist das?', a: 'Was', t: 'p', c: 'nom', why: 'sein (to be) → Nominativ on both sides.' },
  { s: 'Er wird [ein guter Arzt].', q: '{Q} wird er?', a: 'Was', t: 'p', c: 'nom', why: 'werden (to become) → Nominativ: it describes the subject.' },
  { s: '[Das Buch] liegt auf dem Tisch.', q: '{Q} liegt auf dem Tisch?', a: 'Was', t: 'p', c: 'nom', why: 'Subject → Nominativ.' },
  { s: 'Morgen besucht [der Lehrer] die Klasse.', q: '{Q} besucht morgen die Klasse?', a: 'Wer', t: 'p', c: 'nom', why: 'The one doing the visiting → Nominativ.' },
  { s: 'Den Mann sieht [die Frau].', q: '{Q} sieht den Mann?', a: 'Wer', t: 'p', c: 'nom', why: 'Word order can trick you. "den Mann" is the object, so "die Frau" is the subject.' },

  { s: 'Ich kaufe [einen Apfel].', q: '{Q} kaufe ich?', a: 'Was', t: 'p', c: 'akk', why: 'The thing the action hits (direct object) → Akkusativ. "einen" shows it.' },
  { s: 'Wir besuchen [den Opa].', q: '{Q} besuchen wir?', a: 'Wen', t: 'p', c: 'akk', why: 'Direct object → Akkusativ.' },
  { s: 'Sie liebt [ihren Mann].', q: '{Q} liebt sie?', a: 'Wen', t: 'p', c: 'akk', why: 'Direct object → Akkusativ.' },
  { s: '[Den Film] habe ich schon gesehen.', q: '{Q} habe ich schon gesehen?', a: 'Was', t: 'p', c: 'akk', why: 'The object stands first here, but "den" gives it away. The subject is "ich".' },
  { s: '[Den Mann] sieht die Frau.', q: '{Q} sieht die Frau?', a: 'Wen', t: 'p', c: 'akk', why: '"den" marks Akkusativ even at the start of the sentence.' },
  { s: 'Hast du [einen Bruder]?', q: '{Q} hast du?', a: 'Wen', t: 'p', c: 'akk', why: 'haben + Akkusativ.' },
  { s: 'Es gibt [einen Park] hier.', q: '{Q} gibt es hier?', a: 'Was', t: 'p', c: 'akk', why: '"es gibt" always takes Akkusativ.' },
  { s: 'Ich rufe [meine Mutter] an.', q: '{Q} rufe ich an?', a: 'Wen', t: 'p', c: 'akk', why: 'anrufen + Akkusativ.' },
  { s: 'Er gibt dem Kind [einen Ball].', q: '{Q} gibt er dem Kind?', a: 'Was', t: 'p', c: 'akk', why: 'The thing being given → Akkusativ. (The receiver is Dativ.)' },
  { s: 'Ich schenke meiner Freundin [Blumen].', q: '{Q} schenke ich meiner Freundin?', a: 'Was', t: 'p', c: 'akk', why: 'The thing being given → Akkusativ.' },
  { s: 'Er zeigt uns [die Stadt].', q: '{Q} zeigt er uns?', a: 'Was', t: 'p', c: 'akk', why: 'The thing being shown → Akkusativ.' },
  { s: 'Das Geschenk ist für [meinen Vater].', q: 'Für {Q} ist das Geschenk?', a: 'wen', t: 'prep', c: 'akk', why: 'für → always Akkusativ (durch, für, gegen, ohne, um).' },
  { s: 'Ich gehe ohne [meine Freundin].', q: 'Ohne {Q} gehe ich?', a: 'wen', t: 'prep', c: 'akk', why: 'ohne → always Akkusativ.' },
  { s: 'Ich lege das Buch auf [den Tisch].', q: '{Q} lege ich das Buch?', a: 'Wohin', t: 'place', c: 'akk', why: 'auf is a two-way preposition. Movement / direction (Wohin?) → Akkusativ.' },
  { s: 'Wir gehen in [die Stadt].', q: '{Q} gehen wir?', a: 'Wohin', t: 'place', c: 'akk', why: 'in + direction (Wohin?) → Akkusativ.' },
  { s: 'Er hängt das Bild an [die Wand].', q: '{Q} hängt er das Bild?', a: 'Wohin', t: 'place', c: 'akk', why: 'an + direction (Wohin?) → Akkusativ.' },

  { s: 'Ich helfe [meinem Freund].', q: '{Q} helfe ich?', a: 'Wem', t: 'p', c: 'dat', why: 'helfen always takes Dativ.' },
  { s: 'Er gibt [dem Kind] einen Ball.', q: '{Q} gibt er einen Ball?', a: 'Wem', t: 'p', c: 'dat', why: 'geben: the receiver → Dativ, the thing → Akkusativ.' },
  { s: 'Das Auto gehört [meiner Mutter].', q: '{Q} gehört das Auto?', a: 'Wem', t: 'p', c: 'dat', why: 'gehören always takes Dativ.' },
  { s: 'Ich danke [dir].', q: '{Q} danke ich?', a: 'Wem', t: 'p', c: 'dat', why: 'danken always takes Dativ.' },
  { s: 'Die Jacke gefällt [mir].', q: '{Q} gefällt die Jacke?', a: 'Wem', t: 'p', c: 'dat', why: 'gefallen always takes Dativ.' },
  { s: 'Ich erzähle [meinem Opa] eine Geschichte.', q: '{Q} erzähle ich eine Geschichte?', a: 'Wem', t: 'p', c: 'dat', why: 'erzählen: the listener/receiver → Dativ.' },
  { s: 'Ich schenke [meiner Freundin] Blumen.', q: '{Q} schenke ich Blumen?', a: 'Wem', t: 'p', c: 'dat', why: 'schenken: the receiver → Dativ.' },
  { s: 'Er zeigt [uns] die Stadt.', q: '{Q} zeigt er die Stadt?', a: 'Wem', t: 'p', c: 'dat', why: 'zeigen: the person who gets shown → Dativ.' },
  { s: 'Ich spiele mit [meiner Schwester].', q: 'Mit {Q} spiele ich?', a: 'wem', t: 'prep', c: 'dat', why: 'mit → always Dativ (aus, bei, mit, nach, seit, von, zu).' },
  { s: 'Wir wohnen bei [unseren Eltern].', q: 'Bei {Q} wohnen wir?', a: 'wem', t: 'prep', c: 'dat', why: 'bei → always Dativ.' },
  { s: 'Ich gehe zu [meinem Arzt].', q: 'Zu {Q} gehe ich?', a: 'wem', t: 'prep', c: 'dat', why: 'zu → always Dativ, even with movement.' },
  { s: 'Sie kommt aus [der Schweiz].', q: '{Q} kommt sie?', a: 'Woher', t: 'place', c: 'dat', why: 'aus → always Dativ.' },
  { s: 'Das Buch liegt auf [dem Tisch].', q: '{Q} liegt das Buch?', a: 'Wo', t: 'place', c: 'dat', why: 'auf + location, no movement (Wo?) → Dativ.' },
  { s: 'Wir sind in [der Stadt].', q: '{Q} sind wir?', a: 'Wo', t: 'place', c: 'dat', why: 'in + location (Wo?) → Dativ.' },
  { s: 'Das Bild hängt an [der Wand].', q: '{Q} hängt das Bild?', a: 'Wo', t: 'place', c: 'dat', why: 'an + location (Wo?) → Dativ.' },

  { s: 'Das ist das Auto [meines Vaters].', q: '{Q} Auto ist das?', a: 'Wessen', t: 'p', c: 'gen', why: 'Owner (whose?) → Genitiv: des / eines / meines + noun-(e)s.' },
  { s: 'Die Farbe [der Tasche] ist schön.', q: '{Q} Farbe ist schön?', a: 'Wessen', t: 'p', c: 'gen', why: 'Whose colour? → Genitiv.' },
  { s: 'Das Haus [unserer Eltern] ist alt.', q: '{Q} Haus ist alt?', a: 'Wessen', t: 'p', c: 'gen', why: 'Whose house? → Genitiv.' },
  { s: 'Der Name [des Hundes] ist Bello.', q: '{Q} Name ist Bello?', a: 'Wessen', t: 'p', c: 'gen', why: 'Whose name? → Genitiv. Note the -es on Hundes.' },
];

const DETECTIVE_OPTS = {
  p: ['Wer', 'Was', 'Wen', 'Wem', 'Wessen'],
  prep: ['wer', 'wen', 'wem'],
  place: ['Wo', 'Wohin', 'Woher'],
};

/* ---------- du / ihr / Sie ---------- */

const ANREDE = [
  { s: 'Your best friend', a: 'du' },
  { s: 'Your boss', a: 'Sie', note: 'Unless your workplace uses du with everyone.' },
  { s: 'Your mother', a: 'du' },
  { s: 'Two friends at a party', a: 'ihr', note: 'More than one person you say du to → ihr.' },
  { s: 'A doctor you visit', a: 'Sie' },
  { s: 'A police officer', a: 'Sie' },
  { s: 'A small child', a: 'du' },
  { s: 'Your parents (both together)', a: 'ihr' },
  { s: 'An adult stranger on the street', a: 'Sie' },
  { s: 'Your siblings', a: 'ihr' },
  { s: 'A shop assistant', a: 'Sie' },
  { s: 'A classmate at your language school', a: 'du', note: 'Students usually say du to each other.' },
  { s: 'Your teacher in an adult course', a: 'Sie', note: 'Unless they offer the du.' },
  { s: 'Your dog', a: 'du' },
  { s: 'Mr and Mrs Weber, neighbours you don’t know well', a: 'Sie', note: 'Sie is also the formal plural.' },
  { s: 'A group of children', a: 'ihr' },
  { s: 'A colleague who said „Wir können uns duzen“', a: 'du', note: '„duzen“ = to use du. „siezen“ = to use Sie.' },
  { s: 'A group of business clients', a: 'Sie' },
  { s: 'Your partner', a: 'du' },
  { s: 'Your grandparents (both)', a: 'ihr' },
  { s: 'A customer service agent on the phone', a: 'Sie' },
  { s: 'All your cousins at once', a: 'ihr' },
];

/* ---------- Learn page content ---------- */

// [text, case, question] chunks; plain strings are uncoloured
const COLOR_EXAMPLES = [
  [['Der Mann', 'nom', 'Wer gibt dem Kind einen Ball?'], ' gibt ', ['dem Kind', 'dat', 'Wem gibt der Mann einen Ball?'], ' ', ['einen Ball', 'akk', 'Was gibt der Mann dem Kind?'], '.'],
  [['Ich', 'nom', 'Wer hilft?'], ' helfe ', ['meiner Mutter', 'dat', 'Wem helfe ich? (helfen → always Dativ)'], '.'],
  [['Wir', 'nom', 'Wer kauft?'], ' kaufen ', ['einen Tisch', 'akk', 'Was kaufen wir?'], ' für ', ['unseren Sohn', 'akk', 'Für wen? (für → always Akkusativ)'], '.'],
  [['Das Auto', 'nom', 'Was steht in der Garage?'], ' ', ['meines Vaters', 'gen', 'Wessen Auto?'], ' steht in ', ['der Garage', 'dat', 'Wo steht das Auto? (in + Wo? → Dativ)'], '.'],
  [['Sie', 'nom', 'Wer stellt die Vase?'], ' stellt ', ['die Vase', 'akk', 'Was stellt sie?'], ' auf ', ['den Tisch', 'akk', 'Wohin stellt sie die Vase? (auf + Wohin? → Akkusativ)'], '.'],
  [['Den Film', 'akk', 'Was hat er gesehen? ("den" → Akkusativ, even at the start!)'], ' hat ', ['er', 'nom', 'Wer hat den Film gesehen?'], ' schon gesehen.'],
  [['Mein Bruder', 'nom', 'Wer schenkt?'], ' schenkt ', ['mir', 'dat', 'Wem schenkt er ein Buch?'], ' ', ['ein Buch', 'akk', 'Was schenkt er mir?'], '.'],
  [['Ich', 'nom', 'Wer geht?'], ' gehe mit ', ['dir', 'dat', 'Mit wem gehe ich? (mit → always Dativ)'], ' ins Kino.'],
];

const PREPS = {
  akk: ['durch', 'für', 'gegen', 'ohne', 'um', 'bis', 'entlang'],
  dat: ['aus', 'bei', 'mit', 'nach', 'seit', 'von', 'zu', 'gegenüber', 'ab', 'außer'],
  two: ['an', 'auf', 'hinter', 'in', 'neben', 'über', 'unter', 'vor', 'zwischen'],
  gen: ['wegen', 'während', 'trotz', 'statt', 'innerhalb', 'außerhalb'],
};

const DAT_VERBS = ['helfen', 'danken', 'gefallen', 'gehören', 'antworten', 'gratulieren', 'folgen', 'glauben', 'passen', 'schmecken', 'fehlen', 'zuhören', 'vertrauen', 'wehtun'];
const DAT_AKK_VERBS = ['geben', 'schenken', 'zeigen', 'bringen', 'schicken', 'erklären', 'erzählen', 'leihen', 'sagen', 'kaufen'];

/* ---------- Adjective endings ---------- */

// def = after der/die/das (weak) · indef = after ein/kein/mein… (mixed) · none = no article (strong)
const ADJ_TYPES = {
  def:   { name: 'after der · die · das', short: 'der-words', also: 'also after dieser, jeder, welcher, alle (pl.)' },
  indef: { name: 'after ein · kein · mein …', short: 'ein-words', also: 'also after dein, sein, ihr, unser, euer, Ihr' },
  none:  { name: 'no article', short: 'no article', also: 'often with food, drinks, materials and plurals' },
};
const ADJ_TYPE_KEYS = ['def', 'indef', 'none'];

const ADJ_END = {
  def: {
    nom: { m: 'e', f: 'e', n: 'e', pl: 'en' },
    akk: { m: 'en', f: 'e', n: 'e', pl: 'en' },
    dat: { m: 'en', f: 'en', n: 'en', pl: 'en' },
    gen: { m: 'en', f: 'en', n: 'en', pl: 'en' },
  },
  indef: {
    nom: { m: 'er', f: 'e', n: 'es', pl: 'en' },
    akk: { m: 'en', f: 'e', n: 'es', pl: 'en' },
    dat: { m: 'en', f: 'en', n: 'en', pl: 'en' },
    gen: { m: 'en', f: 'en', n: 'en', pl: 'en' },
  },
  none: {
    nom: { m: 'er', f: 'e', n: 'es', pl: 'e' },
    akk: { m: 'en', f: 'e', n: 'es', pl: 'e' },
    dat: { m: 'em', f: 'er', n: 'em', pl: 'en' },
    gen: { m: 'en', f: 'er', n: 'en', pl: 'er' },
  },
};

// Words that work without an article: food, drinks, plurals
const MASS_NOUNS = [
  { n: 'Kaffee', g: 'm', e: '☕', gen: 'Kaffees', adj: ['kalt', 'warm', 'stark', 'gut'] },
  { n: 'Wein', g: 'm', e: '🍷', gen: 'Weins', adj: ['rot', 'gut', 'billig', 'teuer'] },
  { n: 'Käse', g: 'm', e: '🧀', gen: 'Käses', adj: ['frisch', 'alt', 'gut'] },
  { n: 'Milch', g: 'f', e: '🥛', adj: ['kalt', 'warm', 'frisch'] },
  { n: 'Suppe', g: 'f', e: '🍲', adj: ['warm', 'heiß', 'lecker'] },
  { n: 'Wasser', g: 'n', e: '💧', gen: 'Wassers', adj: ['kalt', 'warm', 'frisch'] },
  { n: 'Brot', g: 'n', e: '🍞', gen: 'Brotes', adj: ['frisch', 'alt', 'gut'] },
  { n: 'Äpfel', g: 'pl', e: '🍎', dat: 'Äpfeln', adj: ['rot', 'grün', 'frisch'] },
  { n: 'Tomaten', g: 'pl', e: '🍅', adj: ['rot', 'frisch', 'lecker'] },
  { n: 'Blumen', g: 'pl', e: '💐', adj: ['schön', 'rot', 'frisch'] },
];

const ADJ_PEOPLE = ['alt', 'jung', 'nett', 'lieb'];
const ADJ_SIZE = ['klein', 'groß']; // only for nouns with size: true (kids, siblings, pets)
const ADJ_THINGS = ['alt', 'neu', 'groß', 'klein', 'schön', 'rot', 'schwarz', 'teuer'];

// Adjectives whose stem changes when an ending is added
const ADJ_STEM = { teuer: 'teur', dunkel: 'dunkl', hoch: 'hoh', sauer: 'saur' };
function adjForm(adj, end) {
  return end ? (ADJ_STEM[adj] || adj) + end : adj;
}

// {A} = article, {ADJ} = adjective blank, {N} = noun, {ist} = ist/sind
const ADJ_TEMPLATES = [
  { c: 'nom', s: '{A} {ADJ} {N} {ist} hier.', q: 'Wer/Was {ist} hier?' },
  { c: 'nom', s: 'Da {ist} {A} {ADJ} {N}.', q: 'Wer/Was {ist} da?' },
  { c: 'nom', s: 'Das {ist} {A} {ADJ} {N}.', q: 'Wer/Was ist das?', why: 'sein (to be) → Nominativ.' },
  { c: 'akk', s: 'Ich sehe {A} {ADJ} {N}.', q: 'Wen/Was sehe ich?' },
  { c: 'akk', s: 'Ich suche {A} {ADJ} {N}.', q: 'Wen/Was suche ich?' },
  { c: 'akk', s: 'Ich mag {A} {ADJ} {N}.', q: 'Wen/Was mag ich?' },
  { c: 'akk', anim: true, s: 'Das Geschenk ist für {A} {ADJ} {N}.', q: 'Für wen ist das Geschenk?', why: 'für → always Akkusativ.' },
  { c: 'dat', s: 'Was ist mit {A} {ADJ} {N} los?', q: 'Mit wem/was ist etwas los?', why: 'mit → always Dativ.' },
  { c: 'dat', anim: true, s: 'Ich helfe {A} {ADJ} {N}.', q: 'Wem helfe ich?', why: 'helfen → always Dativ.' },
  { c: 'dat', anim: true, s: 'Ich spreche mit {A} {ADJ} {N}.', q: 'Mit wem spreche ich?', why: 'mit → always Dativ.' },
  { c: 'gen', anim: true, s: ['Der Name {A} {ADJ} {N} ist schön.', 'Die Namen {A} {ADJ} {N} sind schön.'], q: ['Wessen Name ist schön?', 'Wessen Namen sind schön?'] },
  { c: 'gen', anim: false, s: 'Der Preis {A} {ADJ} {N} ist hoch.', q: 'Wessen Preis ist hoch?' },
];

// Sentences without an article (MASS_NOUNS). {schmeckt} = schmeckt/schmecken
const ADJ_NONE_TEMPLATES = [
  { c: 'nom', s: '{ADJ} {N} {schmeckt} gut.', q: 'Wer/Was schmeckt gut?' },
  { c: 'nom', s: 'Hier {ist} {ADJ} {N}.', q: 'Wer/Was ist hier?' },
  { c: 'akk', s: 'Ich kaufe {ADJ} {N}.', q: 'Was kaufe ich?' },
  { c: 'akk', s: 'Ich mag {ADJ} {N}.', q: 'Was mag ich?' },
  { c: 'dat', s: 'Ich koche mit {ADJ} {N}.', q: 'Womit koche ich?', why: 'mit → always Dativ.' },
  { c: 'dat', s: 'Was machst du mit {ADJ} {N}?', q: 'Womit machst du etwas?', why: 'mit → always Dativ.' },
];

const ADJ_ARTICLE_STEMS = ['ein', 'kein', 'mein', 'dein', 'sein', 'ihr', 'unser', 'euer'];

/* ---------- Reflexive pronouns ---------- */

// Only er/sie/es, sie (pl.) and Sie get a new word: sich (always lowercase)
const REFL = {
  ich: { akk: 'mich', dat: 'mir' },
  du: { akk: 'dich', dat: 'dir' },
  er: { akk: 'sich', dat: 'sich' },
  sie: { akk: 'sich', dat: 'sich' },
  es: { akk: 'sich', dat: 'sich' },
  wir: { akk: 'uns', dat: 'uns' },
  ihr: { akk: 'euch', dat: 'euch' },
  siePl: { akk: 'sich', dat: 'sich' },
  Sie: { akk: 'sich', dat: 'sich' },
};

// Present tense in the order ich, du, er/sie/es, wir, ihr, sie/Sie
const CONJ_INDEX = { ich: 0, du: 1, er: 2, sie: 2, es: 2, wir: 3, ihr: 4, siePl: 5, Sie: 5 };
const V = {
  waschen: ['wasche', 'wäschst', 'wäscht', 'waschen', 'wascht', 'waschen'],
  freuen: ['freue', 'freust', 'freut', 'freuen', 'freut', 'freuen'],
  beeilen: ['beeile', 'beeilst', 'beeilt', 'beeilen', 'beeilt', 'beeilen'],
  interessieren: ['interessiere', 'interessierst', 'interessiert', 'interessieren', 'interessiert', 'interessieren'],
  erinnern: ['erinnere', 'erinnerst', 'erinnert', 'erinnern', 'erinnert', 'erinnern'],
  ruhen: ['ruhe', 'ruhst', 'ruht', 'ruhen', 'ruht', 'ruhen'],
  setzen: ['setze', 'setzt', 'setzt', 'setzen', 'setzt', 'setzen'],
  ziehen: ['ziehe', 'ziehst', 'zieht', 'ziehen', 'zieht', 'ziehen'],
  stellen: ['stelle', 'stellst', 'stellt', 'stellen', 'stellt', 'stellen'],
  putzen: ['putze', 'putzt', 'putzt', 'putzen', 'putzt', 'putzen'],
  kaufen: ['kaufe', 'kaufst', 'kauft', 'kaufen', 'kauft', 'kaufen'],
  sehen: ['sehe', 'siehst', 'sieht', 'sehen', 'seht', 'sehen'],
  wuenschen: ['wünsche', 'wünschst', 'wünscht', 'wünschen', 'wünscht', 'wünschen'],
  merken: ['merke', 'merkst', 'merkt', 'merken', 'merkt', 'merken'],
  machen: ['mache', 'machst', 'macht', 'machen', 'macht', 'machen'],
  verspaeten: ['verspäte', 'verspätest', 'verspätet', 'verspäten', 'verspätet', 'verspäten'],
  aergern: ['ärgere', 'ärgerst', 'ärgert', 'ärgern', 'ärgert', 'ärgern'],
  kuemmern: ['kümmere', 'kümmerst', 'kümmert', 'kümmern', 'kümmert', 'kümmern'],
  kaemmen: ['kämme', 'kämmst', 'kämmt', 'kämmen', 'kämmt', 'kämmen'],
};

// Verbs that are (almost) always reflexive. {S} subject, {V} verb, {R} reflexive blank.
// c = case of the reflexive pronoun: dat when there is already an Akkusativ object.
const REFL_VERBS = [
  { inf: 'sich freuen auf', c: 'akk', v: V.freuen, s: '{S} {V} {R} auf das Wochenende.', en: 'to look forward to' },
  { inf: 'sich beeilen', c: 'akk', v: V.beeilen, s: '{S} {V} {R}.', en: 'to hurry' },
  { inf: 'sich interessieren für', c: 'akk', v: V.interessieren, s: '{S} {V} {R} für Musik.', en: 'to be interested in' },
  { inf: 'sich erinnern an', c: 'akk', v: V.erinnern, s: '{S} {V} {R} an den Urlaub.', en: 'to remember' },
  { inf: 'sich ausruhen', c: 'akk', v: V.ruhen, s: '{S} {V} {R} am Wochenende aus.', en: 'to rest' },
  { inf: 'sich setzen', c: 'akk', v: V.setzen, s: '{S} {V} {R} auf das Sofa.', en: 'to sit down' },
  { inf: 'sich anziehen', c: 'akk', v: V.ziehen, s: '{S} {V} {R} schnell an.', en: 'to get dressed' },
  { inf: 'sich vorstellen', c: 'akk', v: V.stellen, s: '{S} {V} {R} kurz vor.', en: 'to introduce oneself' },
  { inf: 'sich waschen', c: 'akk', v: V.waschen, s: '{S} {V} {R} jeden Morgen.', en: 'to wash (oneself)' },
  { inf: 'sich verspäten', c: 'akk', v: V.verspaeten, s: '{S} {V} {R} heute.', en: 'to be late' },
  { inf: 'sich ärgern über', c: 'akk', v: V.aergern, s: '{S} {V} {R} über den Regen.', en: 'to be annoyed about' },
  { inf: 'sich kümmern um', c: 'akk', v: V.kuemmern, s: '{S} {V} {R} um den Hund.', en: 'to take care of' },
  { inf: 'sich (Dat) etwas vorstellen', c: 'dat', v: V.stellen, s: '{S} {V} {R} das Leben in Berlin vor.', en: 'to imagine something', obj: 'das Leben in Berlin' },
  { inf: 'sich (Dat) die Hände waschen', c: 'dat', v: V.waschen, s: '{S} {V} {R} die Hände.', en: 'to wash one’s hands', obj: 'die Hände' },
  { inf: 'sich (Dat) die Zähne putzen', c: 'dat', v: V.putzen, s: '{S} {V} {R} die Zähne.', en: 'to brush one’s teeth', obj: 'die Zähne' },
  { inf: 'sich (Dat) etwas kaufen', c: 'dat', v: V.kaufen, s: '{S} {V} {R} ein Eis.', en: 'to buy oneself something', obj: 'ein Eis' },
  { inf: 'sich (Dat) etwas ansehen', c: 'dat', v: V.sehen, s: '{S} {V} {R} den Film an.', en: 'to watch something', obj: 'den Film' },
  { inf: 'sich (Dat) etwas wünschen', c: 'dat', v: V.wuenschen, s: '{S} {V} {R} einen Hund.', en: 'to wish for something', obj: 'einen Hund' },
  { inf: 'sich (Dat) etwas merken', c: 'dat', v: V.merken, s: '{S} {V} {R} das Wort.', en: 'to memorise something', obj: 'das Wort' },
  { inf: 'sich (Dat) Sorgen machen', c: 'dat', v: V.machen, s: '{S} {V} {R} Sorgen.', en: 'to worry', obj: 'Sorgen' },
];

// Verbs that work on yourself OR on someone else: "Er wäscht sich" vs "Er wäscht ihn"
const MIRROR_VERBS = [
  { c: 'akk', v: V.waschen, s: '{S} {V} {R}.', en: 'washes', pic: '🧼' },
  { c: 'akk', v: V.ziehen, s: '{S} {V} {R} an.', en: 'dresses', pic: '👕' },
  { c: 'akk', v: V.stellen, s: '{S} {V} {R} vor.', en: 'introduces', pic: '🤝' },
  { c: 'akk', v: V.kaemmen, s: '{S} {V} {R}.', en: 'combs the hair of', pic: '🪮' },
  { c: 'akk', v: V.sehen, s: '{S} {V} {R} im Spiegel.', en: 'sees in the mirror', pic: '🪞' },
  { c: 'dat', v: V.kaufen, s: '{S} {V} {R} ein Eis.', en: 'buys an ice cream for', pic: '🍦', obj: 'ein Eis' },
  { c: 'dat', v: V.machen, s: '{S} {V} {R} einen Kaffee.', en: 'makes a coffee for', pic: '☕', obj: 'einen Kaffee' },
  { c: 'dat', v: V.waschen, s: '{S} {V} {R} die Hände.', en: 'washes the hands of', pic: '🧼', obj: 'die Hände' },
];

// Groups, so "Tom & Lisa" and "Tom" never act on each other
const GROUP_MEMBERS = { us: ['me', 'tom'], tomlisa: ['tom', 'lisa'], annaben: ['anna', 'ben'] };

/* ---------- Two-way prepositions: Wo? → Dativ, Wohin? → Akkusativ ---------- */

// Preposition + article short forms
const CONTRACT = {
  in: { dem: 'im', das: 'ins' },
  an: { dem: 'am', das: 'ans' },
  zu: { dem: 'zum', der: 'zur' },
  bei: { dem: 'beim' },
  von: { dem: 'vom' },
};

// Learn page cards. {x} marks the article (or short form) to highlight.
const TWO_WAY = [
  { p: 'an', en: 'on (a side), at', wo: 'Das Bild hängt an {der} Wand.', wohin: 'Ich hänge das Bild an {die} Wand.' },
  { p: 'auf', en: 'on (top of)', wo: 'Das Buch liegt auf {dem} Tisch.', wohin: 'Ich lege das Buch auf {den} Tisch.' },
  { p: 'hinter', en: 'behind', wo: 'Das Auto steht hinter {dem} Haus.', wohin: 'Ich fahre das Auto hinter {das} Haus.' },
  { p: 'in', en: 'in, into', wo: 'Die Tasse steht {im} Schrank.', wohin: 'Ich stelle die Tasse in {den} Schrank.' },
  { p: 'neben', en: 'next to', wo: 'Die Lampe steht neben {dem} Bett.', wohin: 'Ich stelle die Lampe neben {das} Bett.' },
  { p: 'über', en: 'above, over', wo: 'Die Lampe hängt über {dem} Sofa.', wohin: 'Ich hänge die Lampe über {das} Sofa.' },
  { p: 'unter', en: 'under', wo: 'Der Hund liegt unter {dem} Tisch.', wohin: 'Der Hund legt sich unter {den} Tisch.' },
  { p: 'vor', en: 'in front of', wo: 'Das Fahrrad steht vor {der} Tür.', wohin: 'Ich stelle das Fahrrad vor {die} Tür.' },
  { p: 'zwischen', en: 'between', wo: 'Die Katze sitzt zwischen {den} Stühlen.', wohin: 'Die Katze springt zwischen {die} Stühle.' },
];

const VERB_PAIRS = [
  { wohin: 'legen', wohinEx: 'Ich lege das Buch auf {den} Tisch.', wo: 'liegen', woEx: 'Das Buch liegt auf {dem} Tisch.' },
  { wohin: 'stellen', wohinEx: 'Ich stelle die Vase auf {den} Tisch.', wo: 'stehen', woEx: 'Die Vase steht auf {dem} Tisch.' },
  { wohin: 'sich setzen', wohinEx: 'Ich setze mich auf {das} Sofa.', wo: 'sitzen', woEx: 'Ich sitze auf {dem} Sofa.' },
  { wohin: 'hängen', wohinEx: 'Ich hänge das Bild an {die} Wand.', wo: 'hängen', woEx: 'Das Bild hängt an {der} Wand.' },
  { wohin: 'stecken', wohinEx: 'Ich stecke den Schlüssel in {die} Tasche.', wo: 'stecken', woEx: 'Der Schlüssel steckt in {der} Tasche.' },
  { wohin: 'gehen / fahren', wohinEx: 'Wir gehen in {den} Park.', wo: 'sein / wohnen / warten', woEx: 'Wir sind {im} Park.' },
];

// Things you can put somewhere
const WW_THINGS = {
  legen: [{ nom: 'das Buch', akk: 'das Buch' }, { nom: 'der Schlüssel', akk: 'den Schlüssel' }, { nom: 'das Handy', akk: 'das Handy' }, { nom: 'die Zeitung', akk: 'die Zeitung' }],
  stellen: [{ nom: 'die Vase', akk: 'die Vase' }, { nom: 'die Lampe', akk: 'die Lampe' }, { nom: 'der Koffer', akk: 'den Koffer' }, { nom: 'das Glas', akk: 'das Glas' }],
  haengen: [{ nom: 'das Bild', akk: 'das Bild' }, { nom: 'die Jacke', akk: 'die Jacke' }, { nom: 'der Spiegel', akk: 'den Spiegel' }],
};

// Each action has a Wohin version (movement → Akk) and a Wo version (position → Dat).
// {T.nom}/{T.akk} = thing, {GO} = gehen/fahren, {B} = blank, {N} = place noun
const WW_ACTIONS = {
  lay: { kind: 'put', things: 'legen', pair: 'legen (to put down, movement) ↔ liegen (to lie, position)',
    wohin: { s: 'Ich lege {T.akk} {B} {N}.', q: 'Wohin lege ich {T.akk}?' }, wo: { s: '{T.nom} liegt {B} {N}.', q: 'Wo liegt {T.nom}?' } },
  stand: { kind: 'put', things: 'stellen', pair: 'stellen (to put upright, movement) ↔ stehen (to stand, position)',
    wohin: { s: 'Ich stelle {T.akk} {B} {N}.', q: 'Wohin stelle ich {T.akk}?' }, wo: { s: '{T.nom} steht {B} {N}.', q: 'Wo steht {T.nom}?' } },
  hang: { kind: 'hang', things: 'haengen', pair: 'hängen is both: Ich hänge … (movement) ↔ … hängt (position)',
    wohin: { s: 'Ich hänge {T.akk} {B} {N}.', q: 'Wohin hänge ich {T.akk}?' }, wo: { s: '{T.nom} hängt {B} {N}.', q: 'Wo hängt {T.nom}?' } },
  sit: { kind: 'sit', pair: 'sich setzen (to sit down, movement) ↔ sitzen (to sit, position)',
    wohin: { s: 'Ich setze mich {B} {N}.', q: 'Wohin setze ich mich?' }, wo: { s: 'Ich sitze {B} {N}.', q: 'Wo sitze ich?' } },
  go: { kind: 'go', pair: 'gehen / fahren (movement) ↔ sein / warten / sich treffen (position)',
    wohin: { s: 'Wir {GO} {B} {N}.', q: 'Wohin {GO} wir?' },
    wo: [{ s: 'Wir sind {B} {N}.', q: 'Wo sind wir?' }, { s: 'Wir treffen uns {B} {N}.', q: 'Wo treffen wir uns?' }, { s: 'Wir warten {B} {N}.', q: 'Wo warten wir?' }] },
};

// Places and which prepositions make sense for each kind of action
const WW_PLACES = [
  { n: 'Tisch', g: 'm', put: ['auf', 'unter', 'neben'], hang: ['über'] },
  { n: 'Schrank', g: 'm', put: ['in', 'auf', 'neben'] },
  { n: 'Regal', g: 'n', put: ['in', 'auf'] },
  { n: 'Bett', g: 'n', put: ['auf', 'unter', 'neben'], hang: ['über'], sit: ['auf'] },
  { n: 'Sofa', g: 'n', put: ['auf', 'hinter', 'neben'], hang: ['über'], sit: ['auf'] },
  { n: 'Stuhl', g: 'm', put: ['auf', 'neben', 'unter'], sit: ['auf'] },
  { n: 'Wand', g: 'f', hang: ['an'] },
  { n: 'Tür', g: 'f', put: ['vor', 'hinter', 'neben'], hang: ['an'] },
  { n: 'Fenster', g: 'n', put: ['vor', 'neben'], sit: ['an'] },
  { n: 'Betten', g: 'pl', put: ['zwischen'] },
  { n: 'Kinder', g: 'pl', dat: 'Kindern', sit: ['zwischen', 'neben'] },
  { n: 'Küche', g: 'f', go: ['in'], goVerb: 'gehen' },
  { n: 'Garten', g: 'm', go: ['in'], goVerb: 'gehen' },
  { n: 'Stadt', g: 'f', go: ['in'], goVerb: 'fahren' },
  { n: 'Kino', g: 'n', go: ['in'], goVerb: 'gehen' },
  { n: 'Park', g: 'm', go: ['in'], goVerb: 'gehen' },
  { n: 'Haus', g: 'n', go: ['in', 'hinter', 'vor'], goVerb: 'gehen' },
  { n: 'Meer', g: 'n', go: ['an'], goVerb: 'fahren' },
  { n: 'See', g: 'm', go: ['an'], goVerb: 'fahren' },
  { n: 'Strand', g: 'm', go: ['an'], goVerb: 'gehen' },
  { n: 'Berg', g: 'm', go: ['auf'], goVerb: 'gehen' },
];

// Traps: they look like the Wo/Wohin rule, but it doesn't decide the case
const WW_TRAPS = [
  { s: 'Ich gehe {B} Arzt.', p: 'zu', n: 'Arzt', g: 'm', c: 'dat', qa: 'Wohin', q: 'Wohin gehe ich?', why: '<b>zu</b> is not a two-way preposition. It is always Dativ, even with movement.' },
  { s: 'Wir fahren {B} Bahnhof.', p: 'zu', n: 'Bahnhof', g: 'm', c: 'dat', qa: 'Wohin', q: 'Wohin fahren wir?', why: '<b>zu</b> is always Dativ, even with movement.' },
  { s: 'Ich gehe {B} Post.', p: 'zu', n: 'Post', g: 'f', c: 'dat', qa: 'Wohin', q: 'Wohin gehe ich?', why: '<b>zu</b> is always Dativ: zu + der → zur.' },
  { s: 'Sie kommt {B} Schule.', p: 'aus', n: 'Schule', g: 'f', c: 'dat', qa: 'Woher', q: 'Woher kommt sie?', why: '<b>aus</b> is always Dativ.' },
  { s: 'Ich komme {B} Bäcker.', p: 'von', n: 'Bäcker', g: 'm', c: 'dat', qa: 'Woher', q: 'Woher komme ich?', why: '<b>von</b> is always Dativ: von + dem → vom.' },
  { s: 'Ich bin {B} Bäcker.', p: 'bei', n: 'Bäcker', g: 'm', c: 'dat', qa: 'Wo', q: 'Wo bin ich?', why: '<b>bei</b> is always Dativ: bei + dem → beim.' },
  { s: 'Wir kommen {B} Hotel an.', p: 'in', n: 'Hotel', g: 'n', c: 'dat', qa: 'Wo', q: 'Wo kommen wir an?', why: '<b>ankommen</b> answers Wo? (where you are when you arrive), so in → Dativ.' },
  { s: 'Wir laufen {B} Park.', p: 'in', n: 'Park', g: 'm', c: 'dat', qa: 'Wo', q: 'Wo laufen wir?', why: 'Moving around <b>inside</b> a place (not into it) is still Wo? → Dativ. Compare: Wir laufen in den Park (into it).' },
];

/* ---------- Noun genders: der / die / das ---------- */

// how = how reliable the rule is
const GENDER_RULES = {
  ling:    { g: 'm', label: '-ling', how: 'always' },
  ismus:   { g: 'm', label: '-ismus', how: 'always' },
  ig:      { g: 'm', label: '-ig', how: 'always' },
  or:      { g: 'm', label: '-or', how: 'almost always' },
  ant:     { g: 'm', label: '-ant / -ent (people, animals)', how: 'almost always' },
  time:    { g: 'm', label: 'days, months, seasons', how: 'almost always' },
  weather: { g: 'm', label: 'weather and directions', how: 'almost always' },
  alcohol: { g: 'm', label: 'alcoholic drinks', how: 'almost always' },
  male:    { g: 'm', label: 'male people', how: 'almost always' },
  er:      { g: 'm', label: '-er for people and machines', how: 'usually', note: 'Only when it means someone or something that does an action (lehren → der Lehrer). Not every -er word: das Fenster, das Zimmer, die Butter.' },
  ung:     { g: 'f', label: '-ung', how: 'always' },
  heit:    { g: 'f', label: '-heit / -keit', how: 'always' },
  schaft:  { g: 'f', label: '-schaft', how: 'always' },
  ion:     { g: 'f', label: '-ion', how: 'almost always' },
  taet:    { g: 'f', label: '-tät', how: 'always' },
  ie:      { g: 'f', label: '-ie', how: 'almost always' },
  ik:      { g: 'f', label: '-ik', how: 'almost always' },
  ur:      { g: 'f', label: '-ur', how: 'almost always' },
  ei:      { g: 'f', label: '-ei', how: 'almost always' },
  in:      { g: 'f', label: '-in (female people)', how: 'always' },
  enz:     { g: 'f', label: '-enz / -anz', how: 'always' },
  e:       { g: 'f', label: '-e', how: 'about 90%', note: 'Main exceptions: male people and animals (der Junge, der Löwe) and a few others (der Name, der Käse, das Auge, das Ende).' },
  female:  { g: 'f', label: 'female people', how: 'almost always' },
  chen:    { g: 'n', label: '-chen / -lein (small)', how: 'always', note: 'Even for people: das Mädchen.' },
  um:      { g: 'n', label: '-um', how: 'almost always' },
  ment:    { g: 'n', label: '-ment', how: 'almost always' },
  ma:      { g: 'n', label: '-ma', how: 'almost always' },
  inf:     { g: 'n', label: 'verbs used as nouns', how: 'always', note: 'Any infinitive can become a noun: essen → das Essen.' },
  o:       { g: 'n', label: '-o', how: 'usually' },
  ge:      { g: 'n', label: 'Ge- at the start', how: 'often' },
  young:   { g: 'n', label: 'babies and young animals', how: 'usually' },
  metal:   { g: 'n', label: 'metals', how: 'almost always' },
  nis:     { g: 'n', label: '-nis', how: 'usually' },
};

// r = rule key, x = exception to that rule, no r = no rule (just learn it)
const GENDER_NOUNS = [
  // der
  { n: 'Frühling', g: 'm', en: 'spring', e: '🌸', r: 'ling' },
  { n: 'Schmetterling', g: 'm', en: 'butterfly', e: '🦋', r: 'ling' },
  { n: 'Liebling', g: 'm', en: 'darling, favourite', e: '❤️', r: 'ling' },
  { n: 'Tourismus', g: 'm', en: 'tourism', e: '🧳', r: 'ismus' },
  { n: 'Honig', g: 'm', en: 'honey', e: '🍯', r: 'ig' },
  { n: 'König', g: 'm', en: 'king', e: '🤴', r: 'ig' },
  { n: 'Essig', g: 'm', en: 'vinegar', e: '🫙', r: 'ig' },
  { n: 'Motor', g: 'm', en: 'engine', e: '⚙️', r: 'or' },
  { n: 'Doktor', g: 'm', en: 'doctor', e: '🧑‍⚕️', r: 'or' },
  { n: 'Autor', g: 'm', en: 'author', e: '✍️', r: 'or' },
  { n: 'Traktor', g: 'm', en: 'tractor', e: '🚜', r: 'or' },
  { n: 'Labor', g: 'n', en: 'laboratory', e: '🧪', r: 'or', x: true },
  { n: 'Student', g: 'm', en: 'student', e: '🎓', r: 'ant' },
  { n: 'Präsident', g: 'm', en: 'president', e: '🏛️', r: 'ant' },
  { n: 'Elefant', g: 'm', en: 'elephant', e: '🐘', r: 'ant' },
  { n: 'Montag', g: 'm', en: 'Monday', e: '📅', r: 'time' },
  { n: 'Januar', g: 'm', en: 'January', e: '🗓️', r: 'time' },
  { n: 'Sommer', g: 'm', en: 'summer', e: '☀️', r: 'time' },
  { n: 'Herbst', g: 'm', en: 'autumn', e: '🍂', r: 'time' },
  { n: 'Frühjahr', g: 'n', en: 'spring (season)', e: '🌷', r: 'time', x: true },
  { n: 'Regen', g: 'm', en: 'rain', e: '🌧️', r: 'weather' },
  { n: 'Schnee', g: 'm', en: 'snow', e: '❄️', r: 'weather' },
  { n: 'Wind', g: 'm', en: 'wind', e: '💨', r: 'weather' },
  { n: 'Norden', g: 'm', en: 'north', e: '🧭', r: 'weather' },
  { n: 'Wein', g: 'm', en: 'wine', e: '🍷', r: 'alcohol' },
  { n: 'Bier', g: 'n', en: 'beer', e: '🍺', r: 'alcohol', x: true },
  { n: 'Vater', g: 'm', en: 'father', e: '👨', r: 'male' },
  { n: 'Onkel', g: 'm', en: 'uncle', e: '🧔', r: 'male' },
  { n: 'Sohn', g: 'm', en: 'son', e: '👦', r: 'male' },
  { n: 'Lehrer', g: 'm', en: 'teacher', e: '🧑‍🏫', r: 'er' },
  { n: 'Fahrer', g: 'm', en: 'driver', e: '🚕', r: 'er' },
  { n: 'Computer', g: 'm', en: 'computer', e: '💻', r: 'er' },
  { n: 'Tisch', g: 'm', en: 'table', e: '🪑' },
  { n: 'Stuhl', g: 'm', en: 'chair', e: '🪑' },
  { n: 'Hund', g: 'm', en: 'dog', e: '🐕' },
  { n: 'Apfel', g: 'm', en: 'apple', e: '🍎' },
  { n: 'Baum', g: 'm', en: 'tree', e: '🌳' },
  { n: 'Zug', g: 'm', en: 'train', e: '🚆' },
  { n: 'Löffel', g: 'm', en: 'spoon', e: '🥄' },
  { n: 'Schlüssel', g: 'm', en: 'key', e: '🔑' },
  { n: 'Kaffee', g: 'm', en: 'coffee', e: '☕' },

  // die
  { n: 'Zeitung', g: 'f', en: 'newspaper', e: '📰', r: 'ung' },
  { n: 'Wohnung', g: 'f', en: 'flat, apartment', e: '🏠', r: 'ung' },
  { n: 'Rechnung', g: 'f', en: 'bill', e: '🧾', r: 'ung' },
  { n: 'Übung', g: 'f', en: 'exercise', e: '📝', r: 'ung' },
  { n: 'Freiheit', g: 'f', en: 'freedom', e: '🕊️', r: 'heit' },
  { n: 'Gesundheit', g: 'f', en: 'health', e: '💪', r: 'heit' },
  { n: 'Möglichkeit', g: 'f', en: 'possibility', e: '🔀', r: 'heit' },
  { n: 'Freundschaft', g: 'f', en: 'friendship', e: '🤝', r: 'schaft' },
  { n: 'Mannschaft', g: 'f', en: 'team', e: '⚽', r: 'schaft' },
  { n: 'Information', g: 'f', en: 'information', e: 'ℹ️', r: 'ion' },
  { n: 'Situation', g: 'f', en: 'situation', e: '🤔', r: 'ion' },
  { n: 'Lektion', g: 'f', en: 'lesson', e: '📘', r: 'ion' },
  { n: 'Universität', g: 'f', en: 'university', e: '🎓', r: 'taet' },
  { n: 'Qualität', g: 'f', en: 'quality', e: '⭐', r: 'taet' },
  { n: 'Familie', g: 'f', en: 'family', e: '👪', r: 'ie' },
  { n: 'Energie', g: 'f', en: 'energy', e: '⚡', r: 'ie' },
  { n: 'Genie', g: 'n', en: 'genius', e: '🧠', r: 'ie', x: true },
  { n: 'Musik', g: 'f', en: 'music', e: '🎵', r: 'ik' },
  { n: 'Politik', g: 'f', en: 'politics', e: '🗳️', r: 'ik' },
  { n: 'Fabrik', g: 'f', en: 'factory', e: '🏭', r: 'ik' },
  { n: 'Natur', g: 'f', en: 'nature', e: '🌿', r: 'ur' },
  { n: 'Kultur', g: 'f', en: 'culture', e: '🎭', r: 'ur' },
  { n: 'Temperatur', g: 'f', en: 'temperature', e: '🌡️', r: 'ur' },
  { n: 'Abitur', g: 'n', en: 'school-leaving exam', e: '📜', r: 'ur', x: true },
  { n: 'Bäckerei', g: 'f', en: 'bakery', e: '🥐', r: 'ei' },
  { n: 'Polizei', g: 'f', en: 'police', e: '🚓', r: 'ei' },
  { n: 'Ei', g: 'n', en: 'egg', e: '🥚', r: 'ei', x: true },
  { n: 'Lehrerin', g: 'f', en: 'female teacher', e: '👩‍🏫', r: 'in' },
  { n: 'Ärztin', g: 'f', en: 'female doctor', e: '👩‍⚕️', r: 'in' },
  { n: 'Königin', g: 'f', en: 'queen', e: '👸', r: 'in' },
  { n: 'Konferenz', g: 'f', en: 'conference', e: '🗣️', r: 'enz' },
  { n: 'Distanz', g: 'f', en: 'distance', e: '📏', r: 'enz' },
  { n: 'Lampe', g: 'f', en: 'lamp', e: '💡', r: 'e' },
  { n: 'Straße', g: 'f', en: 'street', e: '🛣️', r: 'e' },
  { n: 'Tasche', g: 'f', en: 'bag', e: '👜', r: 'e' },
  { n: 'Blume', g: 'f', en: 'flower', e: '🌸', r: 'e' },
  { n: 'Schule', g: 'f', en: 'school', e: '🏫', r: 'e' },
  { n: 'Sonne', g: 'f', en: 'sun', e: '☀️', r: 'e' },
  { n: 'Woche', g: 'f', en: 'week', e: '📆', r: 'e' },
  { n: 'Name', g: 'm', en: 'name', e: '🏷️', r: 'e', x: true },
  { n: 'Käse', g: 'm', en: 'cheese', e: '🧀', r: 'e', x: true },
  { n: 'Junge', g: 'm', en: 'boy', e: '👦', r: 'e', x: true },
  { n: 'Auge', g: 'n', en: 'eye', e: '👁️', r: 'e', x: true },
  { n: 'Ende', g: 'n', en: 'end', e: '🔚', r: 'e', x: true },
  { n: 'Frau', g: 'f', en: 'woman', e: '👩', r: 'female' },
  { n: 'Tochter', g: 'f', en: 'daughter', e: '👧', r: 'female' },
  { n: 'Tante', g: 'f', en: 'aunt', e: '👵', r: 'female' },
  { n: 'Tür', g: 'f', en: 'door', e: '🚪' },
  { n: 'Uhr', g: 'f', en: 'clock, watch', e: '⏰' },
  { n: 'Hand', g: 'f', en: 'hand', e: '✋' },
  { n: 'Stadt', g: 'f', en: 'city', e: '🏙️' },
  { n: 'Milch', g: 'f', en: 'milk', e: '🥛' },
  { n: 'Nacht', g: 'f', en: 'night', e: '🌙' },
  { n: 'Maus', g: 'f', en: 'mouse', e: '🐭' },

  // das
  { n: 'Mädchen', g: 'n', en: 'girl', e: '👧', r: 'chen' },
  { n: 'Brötchen', g: 'n', en: 'bread roll', e: '🥯', r: 'chen' },
  { n: 'Kätzchen', g: 'n', en: 'kitten', e: '🐱', r: 'chen' },
  { n: 'Fräulein', g: 'n', en: 'miss (old-fashioned)', e: '👱', r: 'chen' },
  { n: 'Museum', g: 'n', en: 'museum', e: '🏛️', r: 'um' },
  { n: 'Zentrum', g: 'n', en: 'centre', e: '🎯', r: 'um' },
  { n: 'Datum', g: 'n', en: 'date', e: '📅', r: 'um' },
  { n: 'Dokument', g: 'n', en: 'document', e: '📄', r: 'ment' },
  { n: 'Instrument', g: 'n', en: 'instrument', e: '🎻', r: 'ment' },
  { n: 'Medikament', g: 'n', en: 'medicine', e: '💊', r: 'ment' },
  { n: 'Moment', g: 'm', en: 'moment', e: '⏱️', r: 'ment', x: true },
  { n: 'Thema', g: 'n', en: 'topic', e: '💬', r: 'ma' },
  { n: 'Klima', g: 'n', en: 'climate', e: '🌍', r: 'ma' },
  { n: 'Firma', g: 'f', en: 'company', e: '🏢', r: 'ma', x: true },
  { n: 'Essen', g: 'n', en: 'food, eating', e: '🍽️', r: 'inf' },
  { n: 'Leben', g: 'n', en: 'life', e: '🌱', r: 'inf' },
  { n: 'Schwimmen', g: 'n', en: 'swimming', e: '🏊', r: 'inf' },
  { n: 'Auto', g: 'n', en: 'car', e: '🚗', r: 'o' },
  { n: 'Kino', g: 'n', en: 'cinema', e: '🎬', r: 'o' },
  { n: 'Büro', g: 'n', en: 'office', e: '🗂️', r: 'o' },
  { n: 'Radio', g: 'n', en: 'radio', e: '📻', r: 'o' },
  { n: 'Euro', g: 'm', en: 'euro', e: '💶', r: 'o', x: true },
  { n: 'Gemüse', g: 'n', en: 'vegetables', e: '🥦', r: 'ge' },
  { n: 'Gebäude', g: 'n', en: 'building', e: '🏢', r: 'ge' },
  { n: 'Geschenk', g: 'n', en: 'present', e: '🎁', r: 'ge' },
  { n: 'Getränk', g: 'n', en: 'drink', e: '🥤', r: 'ge' },
  { n: 'Gesicht', g: 'n', en: 'face', e: '🙂', r: 'ge' },
  { n: 'Geschichte', g: 'f', en: 'story, history', e: '📖', r: 'ge', x: true },
  { n: 'Gedanke', g: 'm', en: 'thought', e: '💭', r: 'ge', x: true },
  { n: 'Kind', g: 'n', en: 'child', e: '🧒', r: 'young' },
  { n: 'Baby', g: 'n', en: 'baby', e: '👶', r: 'young' },
  { n: 'Kalb', g: 'n', en: 'calf', e: '🐄', r: 'young' },
  { n: 'Gold', g: 'n', en: 'gold', e: '🥇', r: 'metal' },
  { n: 'Silber', g: 'n', en: 'silver', e: '🥈', r: 'metal' },
  { n: 'Ergebnis', g: 'n', en: 'result', e: '📊', r: 'nis' },
  { n: 'Geheimnis', g: 'n', en: 'secret', e: '🤫', r: 'nis' },
  { n: 'Zeugnis', g: 'n', en: 'school report', e: '📑', r: 'nis' },
  { n: 'Erlaubnis', g: 'f', en: 'permission', e: '✅', r: 'nis', x: true },
  { n: 'Haus', g: 'n', en: 'house', e: '🏠' },
  { n: 'Buch', g: 'n', en: 'book', e: '📕' },
  { n: 'Bett', g: 'n', en: 'bed', e: '🛏️' },
  { n: 'Fenster', g: 'n', en: 'window', e: '🪟' },
  { n: 'Zimmer', g: 'n', en: 'room', e: '🛋️' },
  { n: 'Wasser', g: 'n', en: 'water', e: '💧' },
  { n: 'Brot', g: 'n', en: 'bread', e: '🍞' },
  { n: 'Jahr', g: 'n', en: 'year', e: '📆' },
  { n: 'Messer', g: 'n', en: 'knife', e: '🔪' },
  { n: 'Herz', g: 'n', en: 'heart', e: '❤️' },
  { n: 'Handy', g: 'n', en: 'mobile phone', e: '📱' },
];

// Compound nouns: the LAST part decides the gender. null = not a noun (verb/adjective).
const COMPOUNDS = [
  { n: 'Haustür', g: 'f', en: 'front door', e: '🚪', parts: [['Haus', 'n'], ['Tür', 'f']] },
  { n: 'Kühlschrank', g: 'm', en: 'fridge', e: '🧊', parts: [['kühl', null], ['Schrank', 'm']] },
  { n: 'Fahrrad', g: 'n', en: 'bicycle', e: '🚲', parts: [['fahren', null], ['Rad', 'n']] },
  { n: 'Apfelsaft', g: 'm', en: 'apple juice', e: '🧃', parts: [['Apfel', 'm'], ['Saft', 'm']] },
  { n: 'Handtasche', g: 'f', en: 'handbag', e: '👜', parts: [['Hand', 'f'], ['Tasche', 'f']] },
  { n: 'Schlafzimmer', g: 'n', en: 'bedroom', e: '🛏️', parts: [['schlafen', null], ['Zimmer', 'n']] },
  { n: 'Bahnhof', g: 'm', en: 'train station', e: '🚉', parts: [['Bahn', 'f'], ['Hof', 'm']] },
  { n: 'Hausaufgabe', g: 'f', en: 'homework', e: '📚', parts: [['Haus', 'n'], ['Aufgabe', 'f']] },
  { n: 'Wörterbuch', g: 'n', en: 'dictionary', e: '📖', parts: [['Wörter', 'pl'], ['Buch', 'n']] },
  { n: 'Geburtstag', g: 'm', en: 'birthday', e: '🎂', parts: [['Geburt', 'f'], ['Tag', 'm']] },
  { n: 'Kindergarten', g: 'm', en: 'kindergarten', e: '🧸', parts: [['Kinder', 'pl'], ['Garten', 'm']] },
  { n: 'Taschengeld', g: 'n', en: 'pocket money', e: '💰', parts: [['Tasche', 'f'], ['Geld', 'n']] },
  { n: 'Sonnenbrille', g: 'f', en: 'sunglasses', e: '🕶️', parts: [['Sonne', 'f'], ['Brille', 'f']] },
  { n: 'Hundefutter', g: 'n', en: 'dog food', e: '🦴', parts: [['Hund', 'm'], ['Futter', 'n']] },
];

// For the ending checker: longest endings first
const SUFFIX_RULES = [
  ['chen', 'chen'], ['lein', 'chen'], ['ismus', 'ismus'], ['schaft', 'schaft'], ['ling', 'ling'],
  ['heit', 'heit'], ['keit', 'heit'], ['ung', 'ung'], ['tät', 'taet'], ['ment', 'ment'], ['ion', 'ion'],
  ['enz', 'enz'], ['anz', 'enz'], ['nis', 'nis'], ['ie', 'ie'], ['ik', 'ik'], ['ur', 'ur'], ['ei', 'ei'],
  ['um', 'um'], ['ma', 'ma'], ['ig', 'ig'], ['or', 'or'], ['ant', 'ant'], ['ent', 'ant'], ['in', 'in'],
  ['o', 'o'], ['e', 'e'],
];

/* ---------- Perfekt: haben/sein + Partizip II ---------- */

const PP_TYPES = {
  weak:   { label: 'regular', rule: 'ge- + stem + -t (-et after t/d)' },
  strong: { label: 'irregular', rule: 'ge- + stem (often changed) + -en. Learn these by heart.' },
  mixed:  { label: 'mixed', rule: 'ge- + changed stem + -t' },
  sep:    { label: 'separable', rule: 'prefix + ge + participle: the ge- goes in the middle' },
  insep:  { label: 'inseparable prefix', rule: 'be-, ver-, er-, ent-, emp-, zer-, ge-, miss- → no ge-' },
  ieren:  { label: '-ieren verb', rule: 'no ge-, just -t' },
};
const PP_TYPE_KEYS = ['weak', 'strong', 'mixed', 'sep', 'insep', 'ieren'];

const AUX_WHY = {
  move: 'movement from A to B → <b>sein</b>',
  change: 'a change of state → <b>sein</b>',
  stay: 'sein and bleiben always take <b>sein</b>',
  obj: 'it has an Akkusativ object → always <b>haben</b>',
  refl: 'reflexive verbs always take <b>haben</b>',
  default: 'no movement to a place, no change of state → <b>haben</b> (most verbs)',
};

// aux: h = haben, s = sein · why: key of AUX_WHY · sep: separable prefix · refl: reflexive ({R})
// s: {S} subject, {AUX} haben/sein, {PP} participle
const PERFEKT_VERBS = [
  { inf: 'machen', en: 'to do, make', pp: 'gemacht', aux: 'h', type: 'weak', why: 'obj', s: '{S} {AUX} die Hausaufgaben {PP}.' },
  { inf: 'kaufen', en: 'to buy', pp: 'gekauft', aux: 'h', type: 'weak', why: 'obj', s: '{S} {AUX} ein Auto {PP}.' },
  { inf: 'spielen', en: 'to play', pp: 'gespielt', aux: 'h', type: 'weak', why: 'obj', s: '{S} {AUX} Fußball {PP}.' },
  { inf: 'lernen', en: 'to learn', pp: 'gelernt', aux: 'h', type: 'weak', why: 'obj', s: '{S} {AUX} Deutsch {PP}.' },
  { inf: 'kochen', en: 'to cook', pp: 'gekocht', aux: 'h', type: 'weak', why: 'obj', s: '{S} {AUX} eine Suppe {PP}.' },
  { inf: 'arbeiten', en: 'to work', pp: 'gearbeitet', aux: 'h', type: 'weak', why: 'default', s: '{S} {AUX} gestern lange {PP}.' },
  { inf: 'warten', en: 'to wait', pp: 'gewartet', aux: 'h', type: 'weak', why: 'default', s: '{S} {AUX} auf den Bus {PP}.' },
  { inf: 'wohnen', en: 'to live', pp: 'gewohnt', aux: 'h', type: 'weak', why: 'default', s: '{S} {AUX} in Berlin {PP}.' },
  { inf: 'hören', en: 'to hear, listen', pp: 'gehört', aux: 'h', type: 'weak', why: 'obj', s: '{S} {AUX} Musik {PP}.' },
  { inf: 'tanzen', en: 'to dance', pp: 'getanzt', aux: 'h', type: 'weak', why: 'default', s: '{S} {AUX} die ganze Nacht {PP}.' },
  { inf: 'sehen', en: 'to see', pp: 'gesehen', aux: 'h', type: 'strong', why: 'obj', s: '{S} {AUX} einen Film {PP}.' },
  { inf: 'essen', en: 'to eat', pp: 'gegessen', aux: 'h', type: 'strong', why: 'obj', s: '{S} {AUX} eine Pizza {PP}.' },
  { inf: 'trinken', en: 'to drink', pp: 'getrunken', aux: 'h', type: 'strong', why: 'obj', s: '{S} {AUX} einen Kaffee {PP}.' },
  { inf: 'schreiben', en: 'to write', pp: 'geschrieben', aux: 'h', type: 'strong', why: 'obj', s: '{S} {AUX} einen Brief {PP}.' },
  { inf: 'lesen', en: 'to read', pp: 'gelesen', aux: 'h', type: 'strong', why: 'obj', s: '{S} {AUX} das Buch {PP}.' },
  { inf: 'finden', en: 'to find', pp: 'gefunden', aux: 'h', type: 'strong', why: 'obj', s: '{S} {AUX} den Schlüssel {PP}.' },
  { inf: 'sprechen', en: 'to speak', pp: 'gesprochen', aux: 'h', type: 'strong', why: 'default', s: '{S} {AUX} mit dem Chef {PP}.' },
  { inf: 'nehmen', en: 'to take', pp: 'genommen', aux: 'h', type: 'strong', why: 'obj', s: '{S} {AUX} den Bus {PP}.' },
  { inf: 'schlafen', en: 'to sleep', pp: 'geschlafen', aux: 'h', type: 'strong', why: 'default', s: '{S} {AUX} gut {PP}.', note: 'Sleeping is not a change of state. But einschlafen (to fall asleep) is → sein.' },
  { inf: 'helfen', en: 'to help', pp: 'geholfen', aux: 'h', type: 'strong', why: 'default', s: '{S} {AUX} dem Nachbarn {PP}.' },
  { inf: 'singen', en: 'to sing', pp: 'gesungen', aux: 'h', type: 'strong', why: 'obj', s: '{S} {AUX} ein Lied {PP}.' },
  { inf: 'treffen', en: 'to meet', pp: 'getroffen', aux: 'h', type: 'strong', why: 'obj', s: '{S} {AUX} alte Freunde {PP}.' },
  { inf: 'bringen', en: 'to bring', pp: 'gebracht', aux: 'h', type: 'mixed', why: 'obj', s: '{S} {AUX} Blumen {PP}.' },
  { inf: 'denken', en: 'to think', pp: 'gedacht', aux: 'h', type: 'mixed', why: 'default', s: '{S} {AUX} an den Urlaub {PP}.' },
  { inf: 'wissen', en: 'to know (a fact)', pp: 'gewusst', aux: 'h', type: 'mixed', why: 'obj', s: '{S} {AUX} das nicht {PP}.' },
  { inf: 'kennen', en: 'to know (a person)', pp: 'gekannt', aux: 'h', type: 'mixed', why: 'obj', s: '{S} {AUX} den Lehrer gut {PP}.' },
  { inf: 'gehen', en: 'to go, walk', pp: 'gegangen', aux: 's', type: 'strong', why: 'move', s: '{S} {AUX} ins Kino {PP}.' },
  { inf: 'fahren', en: 'to drive, travel', pp: 'gefahren', aux: 's', type: 'strong', why: 'move', s: '{S} {AUX} nach Berlin {PP}.' },
  { inf: 'fliegen', en: 'to fly', pp: 'geflogen', aux: 's', type: 'strong', why: 'move', s: '{S} {AUX} nach Spanien {PP}.' },
  { inf: 'kommen', en: 'to come', pp: 'gekommen', aux: 's', type: 'strong', why: 'move', s: '{S} {AUX} zu spät {PP}.' },
  { inf: 'laufen', en: 'to run, walk', pp: 'gelaufen', aux: 's', type: 'strong', why: 'move', s: '{S} {AUX} nach Hause {PP}.' },
  { inf: 'schwimmen', en: 'to swim', pp: 'geschwommen', aux: 's', type: 'strong', why: 'move', s: '{S} {AUX} über den See {PP}.' },
  { inf: 'reisen', en: 'to travel', pp: 'gereist', aux: 's', type: 'weak', why: 'move', s: '{S} {AUX} nach Italien {PP}.', note: 'A regular participle, but still sein because it is movement.' },
  { inf: 'wandern', en: 'to hike', pp: 'gewandert', aux: 's', type: 'weak', why: 'move', s: '{S} {AUX} in den Bergen {PP}.' },
  { inf: 'aufstehen', en: 'to get up', pp: 'aufgestanden', aux: 's', type: 'sep', sep: 'auf', why: 'change', s: '{S} {AUX} früh {PP}.' },
  { inf: 'einschlafen', en: 'to fall asleep', pp: 'eingeschlafen', aux: 's', type: 'sep', sep: 'ein', why: 'change', s: '{S} {AUX} sofort {PP}.' },
  { inf: 'aufwachen', en: 'to wake up', pp: 'aufgewacht', aux: 's', type: 'sep', sep: 'auf', why: 'change', s: '{S} {AUX} um sechs Uhr {PP}.' },
  { inf: 'werden', en: 'to become', pp: 'geworden', aux: 's', type: 'strong', why: 'change', s: '{S} {AUX} sehr müde {PP}.' },
  { inf: 'sein', en: 'to be', pp: 'gewesen', aux: 's', type: 'strong', why: 'stay', s: '{S} {AUX} in Paris {PP}.' },
  { inf: 'bleiben', en: 'to stay', pp: 'geblieben', aux: 's', type: 'strong', why: 'stay', s: '{S} {AUX} zu Hause {PP}.' },
  { inf: 'einkaufen', en: 'to go shopping', pp: 'eingekauft', aux: 'h', type: 'sep', sep: 'ein', why: 'default', s: '{S} {AUX} im Supermarkt {PP}.' },
  { inf: 'anrufen', en: 'to call', pp: 'angerufen', aux: 'h', type: 'sep', sep: 'an', why: 'obj', s: '{S} {AUX} die Oma {PP}.' },
  { inf: 'fernsehen', en: 'to watch TV', pp: 'ferngesehen', aux: 'h', type: 'sep', sep: 'fern', why: 'default', s: '{S} {AUX} am Abend {PP}.' },
  { inf: 'aufräumen', en: 'to tidy up', pp: 'aufgeräumt', aux: 'h', type: 'sep', sep: 'auf', why: 'obj', s: '{S} {AUX} das Zimmer {PP}.' },
  { inf: 'mitbringen', en: 'to bring along', pp: 'mitgebracht', aux: 'h', type: 'sep', sep: 'mit', why: 'obj', s: '{S} {AUX} einen Kuchen {PP}.' },
  { inf: 'besuchen', en: 'to visit', pp: 'besucht', aux: 'h', type: 'insep', why: 'obj', s: '{S} {AUX} die Oma {PP}.' },
  { inf: 'verstehen', en: 'to understand', pp: 'verstanden', aux: 'h', type: 'insep', why: 'obj', s: '{S} {AUX} die Frage {PP}.' },
  { inf: 'bekommen', en: 'to get, receive', pp: 'bekommen', aux: 'h', type: 'insep', why: 'obj', s: '{S} {AUX} ein Geschenk {PP}.', note: 'bekommen = to get (not "become"!). Participle looks like the infinitive.' },
  { inf: 'erzählen', en: 'to tell', pp: 'erzählt', aux: 'h', type: 'insep', why: 'obj', s: '{S} {AUX} eine Geschichte {PP}.' },
  { inf: 'vergessen', en: 'to forget', pp: 'vergessen', aux: 'h', type: 'insep', why: 'obj', s: '{S} {AUX} den Termin {PP}.' },
  { inf: 'bezahlen', en: 'to pay', pp: 'bezahlt', aux: 'h', type: 'insep', why: 'obj', s: '{S} {AUX} die Rechnung {PP}.' },
  { inf: 'studieren', en: 'to study (at university)', pp: 'studiert', aux: 'h', type: 'ieren', why: 'obj', s: '{S} {AUX} Medizin {PP}.' },
  { inf: 'telefonieren', en: 'to phone', pp: 'telefoniert', aux: 'h', type: 'ieren', why: 'default', s: '{S} {AUX} mit Anna {PP}.' },
  { inf: 'fotografieren', en: 'to take photos', pp: 'fotografiert', aux: 'h', type: 'ieren', why: 'obj', s: '{S} {AUX} den Hund {PP}.' },
  { inf: 'reparieren', en: 'to repair', pp: 'repariert', aux: 'h', type: 'ieren', why: 'obj', s: '{S} {AUX} das Fahrrad {PP}.' },
  { inf: 'sich freuen', en: 'to be happy', pp: 'gefreut', aux: 'h', type: 'weak', why: 'refl', refl: true, s: '{S} {AUX} {R} sehr {PP}.' },
  { inf: 'sich waschen', en: 'to wash (oneself)', pp: 'gewaschen', aux: 'h', type: 'strong', why: 'refl', refl: true, s: '{S} {AUX} {R} schnell {PP}.' },
];

/* ---------- Word order ---------- */

// One clause, many shapes. forms: present tense (ich, du, er, wir, ihr, sie) of the verb
// (for separable verbs: without the prefix). rest: object or place, may be empty.
const WO_CLAUSES = [
  { inf: 'fahren', forms: ['fahre', 'fährst', 'fährt', 'fahren', 'fahrt', 'fahren'], rest: 'nach Berlin', time: 'morgen', past: 'letzte Woche', pp: 'gefahren', aux: 's' },
  { inf: 'lernen', forms: ['lerne', 'lernst', 'lernt', 'lernen', 'lernt', 'lernen'], rest: 'Deutsch', time: 'heute', past: 'gestern', pp: 'gelernt', aux: 'h' },
  { inf: 'kaufen', forms: V.kaufen, rest: 'ein neues Handy', time: 'morgen', past: 'gestern', pp: 'gekauft', aux: 'h' },
  { inf: 'kochen', forms: ['koche', 'kochst', 'kocht', 'kochen', 'kocht', 'kochen'], rest: 'Spaghetti', time: 'heute Abend', past: 'gestern', pp: 'gekocht', aux: 'h' },
  { inf: 'spielen', forms: ['spiele', 'spielst', 'spielt', 'spielen', 'spielt', 'spielen'], rest: 'Fußball', time: 'am Samstag', past: 'am Samstag', pp: 'gespielt', aux: 'h' },
  { inf: 'arbeiten', forms: ['arbeite', 'arbeitest', 'arbeitet', 'arbeiten', 'arbeitet', 'arbeiten'], rest: 'zu Hause', time: 'morgen', past: 'gestern', pp: 'gearbeitet', aux: 'h' },
  { inf: 'aufstehen', sep: 'auf', forms: ['stehe', 'stehst', 'steht', 'stehen', 'steht', 'stehen'], rest: '', time: 'morgen früh', past: 'heute früh', pp: 'aufgestanden', aux: 's' },
  { inf: 'einkaufen', sep: 'ein', forms: V.kaufen, rest: 'im Supermarkt', time: 'heute', past: 'gestern', pp: 'eingekauft', aux: 'h' },
  { inf: 'anrufen', sep: 'an', forms: ['rufe', 'rufst', 'ruft', 'rufen', 'ruft', 'rufen'], rest: 'die Oma', time: 'heute Abend', past: 'gestern Abend', pp: 'angerufen', aux: 'h' },
  { inf: 'fernsehen', sep: 'fern', forms: V.sehen, rest: '', time: 'heute Abend', past: 'gestern Abend', pp: 'ferngesehen', aux: 'h' },
];

// Subjects as written in the sentence + their pronoun key (for the verb form)
const WO_SUBJECTS = [
  { w: 'ich', k: 'ich' }, { w: 'du', k: 'du' }, { w: 'Tom', k: 'er' }, { w: 'Lisa', k: 'sie' },
  { w: 'wir', k: 'wir' }, { w: 'ihr', k: 'ihr' }, { w: 'meine Eltern', k: 'siePl' },
];
const WO_SUBJECTS_Q = [{ w: 'du', k: 'du' }, { w: 'ihr', k: 'ihr' }, { w: 'Sie', k: 'Sie' }];

const WO_MODALS = {
  müssen: ['muss', 'musst', 'muss', 'müssen', 'müsst', 'müssen'],
  wollen: ['will', 'willst', 'will', 'wollen', 'wollt', 'wollen'],
  können: ['kann', 'kannst', 'kann', 'können', 'könnt', 'können'],
};

// Conjunctions that send the verb to the end, with a main clause to hang them on
const WO_SUB_INTROS = [
  { c: 'weil', p: 'Ich bin froh,' }, { c: 'dass', p: 'Ich glaube,' }, { c: 'ob', p: 'Ich weiß nicht,' },
  { c: 'wenn', p: 'Es ist super,' }, { c: 'obwohl', p: 'Das ist gut,' },
];
// Position 0: these change nothing
const WO_ZERO_INTROS = [{ c: 'aber', p: 'Es regnet,' }, { c: 'denn', p: 'Ich bin glücklich,' }, { c: 'und', p: 'Das Wetter ist schön,' }];
// A whole clause in position 1: the verb comes right after the comma
const WO_FIRST_INTROS = ['Wenn ich Zeit habe,', 'Weil es so schön ist,', 'Wenn alles klappt,'];

const WO_SUB_CONJ = ['weil', 'dass', 'ob', 'wenn', 'obwohl', 'als', 'bevor', 'nachdem', 'damit', 'während', 'seit', 'bis', 'falls', 'sodass'];
const WO_ZERO_CONJ = ['und', 'aber', 'oder', 'denn', 'sondern'];

// Connecting adverbs take position 1 themselves: the verb comes right after them
const WO_ADV_INTROS = [
  { c: 'deshalb', p: 'Das Wetter ist schlecht,' }, { c: 'deswegen', p: 'Wir haben heute Zeit,' },
  { c: 'trotzdem', p: 'Es regnet,' }, { c: 'trotzdem', p: 'Ich bin sehr müde,' },
  { c: 'dann', p: 'Zuerst frühstücken wir,' }, { c: 'danach', p: 'Wir essen zuerst,' },
  { c: 'außerdem', p: 'Ich habe viel zu tun,' }, { c: 'darum', p: 'Das ist wichtig,' },
];
const WO_ADV_CONJ = [
  ['deshalb / deswegen / darum / daher', 'that’s why, so'], ['trotzdem / dennoch', 'anyway, still'], ['dann / danach', 'then, after that'],
  ['außerdem', 'besides, also'], ['sonst', 'otherwise'], ['also', 'so, therefore'], ['stattdessen', 'instead'],
];

// je … desto: [text, role]. The je-part has the verb at the end, the desto-part has it right after desto + comparative.
const JE_DESTO = [
  [['je mehr', 'X'], ['ich', 'S'], ['lerne', 'VE'], ['desto besser', 'X'], ['spreche', 'V'], ['ich', 'S'], ['Deutsch', 'X']],
  [['je länger', 'X'], ['ich', 'S'], ['schlafe', 'VE'], ['desto müder', 'X'], ['bin', 'V'], ['ich', 'S']],
  [['je öfter', 'X'], ['wir', 'S'], ['üben', 'VE'], ['desto leichter', 'X'], ['wird', 'V'], ['es', 'S']],
  [['je älter', 'X'], ['mein Opa', 'S'], ['wird', 'VE'], ['desto ruhiger', 'X'], ['ist', 'V'], ['er', 'S']],
  [['je früher', 'X'], ['du', 'S'], ['aufstehst', 'VE'], ['desto mehr Zeit', 'X'], ['hast', 'V'], ['du', 'S']],
  [['je schneller', 'X'], ['ihr', 'S'], ['fahrt', 'VE'], ['desto früher', 'X'], ['seid', 'V'], ['ihr', 'S'], ['da', 'X']],
  [['je mehr Kaffee', 'X'], ['ich', 'S'], ['trinke', 'VE'], ['desto nervöser', 'X'], ['werde', 'V'], ['ich', 'S']],
  [['je wärmer', 'X'], ['es', 'S'], ['ist', 'VE'], ['desto glücklicher', 'X'], ['sind', 'V'], ['die Leute', 'S']],
];

// Two-part connectors: fill in the missing half
const CONNECTOR_PAIRS = [
  { s: 'Ich trinke weder Kaffee ___ Tee.', a: 'noch', pair: 'weder … noch', en: 'neither … nor' },
  { s: 'Ich habe ___ Zeit noch Geld.', a: 'weder', pair: 'weder … noch', en: 'neither … nor' },
  { s: 'Wir fahren entweder ans Meer ___ in die Berge.', a: 'oder', pair: 'entweder … oder', en: 'either … or' },
  { s: '___ kommst du mit, oder du bleibst hier.', a: 'Entweder', pair: 'entweder … oder', en: 'either … or' },
  { s: 'Sie spricht sowohl Deutsch ___ Englisch.', a: 'als auch', pair: 'sowohl … als auch', en: 'both … and' },
  { s: 'Sowohl meine Mutter ___ mein Vater sprechen Englisch.', a: 'als auch', pair: 'sowohl … als auch', en: 'both … and' },
  { s: 'Er ist nicht nur nett, ___ auch lustig.', a: 'sondern', pair: 'nicht nur … sondern auch', en: 'not only … but also' },
  { s: 'Das Auto ist zwar alt, ___ es fährt noch gut.', a: 'aber', pair: 'zwar … aber', en: 'admittedly … but' },
  { s: '___ mehr ich übe, desto besser werde ich.', a: 'Je', pair: 'je … desto', en: 'the more … the more' },
  { s: 'Je länger der Film ist, ___ müder werde ich.', a: 'desto', pair: 'je … desto', en: 'the more … the more' },
];
const CONNECTOR_PAIR_WORDS = ['noch', 'weder', 'oder', 'entweder', 'als auch', 'sondern', 'aber', 'je', 'desto'];

// Same meaning, three word orders: the verb after the gap tells you which connector fits.
// type: sub = verb to the end, zero = normal order, adv = verb right after the gap
const CONNECTOR_TYPE = {
  weil: 'sub', obwohl: 'sub', bevor: 'sub', wenn: 'sub',
  denn: 'zero', aber: 'zero', und: 'zero', oder: 'zero',
  deshalb: 'adv', deswegen: 'adv', trotzdem: 'adv', dann: 'adv', sonst: 'adv',
};
const CONNECTOR_PICK = [
  { opts: ['weil', 'denn', 'deshalb'], items: [
    { s: 'Ich bleibe zu Hause, ___ ich krank bin.', a: 'weil' },
    { s: 'Ich bleibe zu Hause, ___ ich bin krank.', a: 'denn' },
    { s: 'Ich bin krank, ___ bleibe ich zu Hause.', a: 'deshalb' },
  ] },
  { opts: ['weil', 'denn', 'deswegen'], items: [
    { s: 'Ich esse einen Apfel, ___ ich Hunger habe.', a: 'weil' },
    { s: 'Ich esse einen Apfel, ___ ich habe Hunger.', a: 'denn' },
    { s: 'Ich habe Hunger, ___ esse ich einen Apfel.', a: 'deswegen' },
  ] },
  { opts: ['obwohl', 'aber', 'trotzdem'], items: [
    { s: 'Ich gehe spazieren, ___ es regnet.', a: 'obwohl' },
    { s: 'Es regnet, ___ ich gehe spazieren.', a: 'aber' },
    { s: 'Es regnet, ___ gehe ich spazieren.', a: 'trotzdem' },
  ] },
  { opts: ['obwohl', 'aber', 'trotzdem'], items: [
    { s: 'Sie lernt weiter, ___ sie müde ist.', a: 'obwohl' },
    { s: 'Sie ist müde, ___ sie lernt weiter.', a: 'aber' },
    { s: 'Sie ist müde, ___ lernt sie weiter.', a: 'trotzdem' },
  ] },
  { opts: ['bevor', 'und', 'dann'], items: [
    { s: 'Ich frühstücke, ___ ich zur Arbeit gehe.', a: 'bevor' },
    { s: 'Ich frühstücke, ___ ich gehe zur Arbeit.', a: 'und' },
    { s: 'Ich frühstücke, ___ gehe ich zur Arbeit.', a: 'dann' },
  ] },
  { opts: ['wenn', 'oder', 'sonst'], items: [
    { s: 'Wir verpassen den Zug, ___ wir uns nicht beeilen.', a: 'wenn' },
    { s: 'Wir müssen uns beeilen, ___ wir verpassen den Zug.', a: 'oder' },
    { s: 'Wir müssen uns beeilen, ___ verpassen wir den Zug.', a: 'sonst' },
  ] },
];

/* ---------- Präteritum ---------- */

// ich/er form of every verb in the Perfekt list.
// Type: w = regular (-te), s = irregular (vowel change), m = mixed (vowel change + -te), aux = sein/werden.
// Group for irregular verbs = the new vowel.
const PRAET_FORMS = {
  machen: ['machte', 'w'], kaufen: ['kaufte', 'w'], spielen: ['spielte', 'w'], lernen: ['lernte', 'w'],
  kochen: ['kochte', 'w'], arbeiten: ['arbeitete', 'w'], warten: ['wartete', 'w'], wohnen: ['wohnte', 'w'],
  hören: ['hörte', 'w'], tanzen: ['tanzte', 'w'], reisen: ['reiste', 'w'], wandern: ['wanderte', 'w'],
  aufwachen: ['wachte', 'w'], einkaufen: ['kaufte', 'w'], aufräumen: ['räumte', 'w'], besuchen: ['besuchte', 'w'],
  erzählen: ['erzählte', 'w'], bezahlen: ['bezahlte', 'w'], studieren: ['studierte', 'w'], telefonieren: ['telefonierte', 'w'],
  fotografieren: ['fotografierte', 'w'], reparieren: ['reparierte', 'w'], 'sich freuen': ['freute', 'w'],
  bringen: ['brachte', 'm'], denken: ['dachte', 'm'], wissen: ['wusste', 'm'], kennen: ['kannte', 'm'], mitbringen: ['brachte', 'm'],
  sehen: ['sah', 's', 'a'], essen: ['aß', 's', 'a'], trinken: ['trank', 's', 'a'], lesen: ['las', 's', 'a'],
  finden: ['fand', 's', 'a'], sprechen: ['sprach', 's', 'a'], nehmen: ['nahm', 's', 'a'], helfen: ['half', 's', 'a'],
  singen: ['sang', 's', 'a'], treffen: ['traf', 's', 'a'], kommen: ['kam', 's', 'a'], schwimmen: ['schwamm', 's', 'a'],
  bekommen: ['bekam', 's', 'a'], verstehen: ['verstand', 's', 'a'], vergessen: ['vergaß', 's', 'a'], aufstehen: ['stand', 's', 'a'],
  fernsehen: ['sah', 's', 'a'],
  schreiben: ['schrieb', 's', 'ie'], bleiben: ['blieb', 's', 'ie'], schlafen: ['schlief', 's', 'ie'], laufen: ['lief', 's', 'ie'],
  einschlafen: ['schlief', 's', 'ie'], anrufen: ['rief', 's', 'ie'],
  fahren: ['fuhr', 's', 'u'], 'sich waschen': ['wusch', 's', 'u'],
  fliegen: ['flog', 's', 'o'],
  gehen: ['ging', 's', 'special'],
  sein: ['war', 'aux'], werden: ['wurde', 'aux'],
};

// The ones you also use when speaking, with their own sentences
const PRAET_EXTRA = [
  { inf: 'haben', en: 'to have', p: 'hatte', t: 'aux', s: '{S} {V} keine Zeit.' },
  { inf: 'können', en: 'can, to be able to', p: 'konnte', t: 'mod', s: '{S} {V} gut schwimmen.' },
  { inf: 'müssen', en: 'must, to have to', p: 'musste', t: 'mod', s: '{S} {V} früh aufstehen.' },
  { inf: 'wollen', en: 'to want', p: 'wollte', t: 'mod', s: '{S} {V} nach Paris fahren.' },
  { inf: 'dürfen', en: 'may, to be allowed to', p: 'durfte', t: 'mod', s: '{S} {V} lange aufbleiben.' },
  { inf: 'sollen', en: 'should, to be supposed to', p: 'sollte', t: 'mod', s: '{S} {V} mehr lernen.' },
  { inf: 'mögen', en: 'to like', p: 'mochte', t: 'mod', s: '{S} {V} keinen Kaffee.' },
];

const PRAET_TYPES = {
  w: { label: 'regular', rule: 'stem + -te + ending (-ete after t/d): machen → machte, arbeiten → arbeitete' },
  s: { label: 'irregular', rule: 'the vowel changes and there is no -te: gehen → ging, sehen → sah' },
  m: { label: 'mixed', rule: 'the vowel changes AND you add -te: bringen → brachte, denken → dachte' },
  mod: { label: 'modal verb', rule: 'drop the umlaut, add -te: können → konnte, müssen → musste' },
  aux: { label: 'sein / haben / werden', rule: 'learn these three by heart: war, hatte, wurde' },
};
const PRAET_GROUPS = { a: '→ a', ie: '→ ie', u: '→ u', o: '→ o', special: 'special' };

/* ---------- Konjunktiv II ---------- */

// Forms in the order ich, du, er, wir, ihr, sie/Sie
const k2Row = stem => [stem, stem + 'st', stem, stem + 'n', stem + 't', stem + 'n'];
const K2_FORMS = {
  sein: ['wäre', 'wärst', 'wäre', 'wären', 'wärt', 'wären'],
  haben: k2Row('hätte'), werden: k2Row('würde'),
  können: k2Row('könnte'), müssen: k2Row('müsste'), dürfen: k2Row('dürfte'), mögen: k2Row('möchte'),
  sollen: k2Row('sollte'), wollen: k2Row('wollte'), wissen: k2Row('wüsste'),
};
const K2_VERBS = ['sein', 'haben', 'werden', 'können', 'müssen', 'dürfen', 'mögen', 'sollen', 'wollen', 'wissen'];
// How each form is made, for explanations
const K2_HOW = {
  sein: 'war → <b>wäre</b> (Präteritum + umlaut)',
  haben: 'hatte → <b>hätte</b> (Präteritum + umlaut)',
  werden: 'wurde → <b>würde</b>. würde + infinitive works for almost every other verb',
  können: 'konnte → <b>könnte</b> (Präteritum + umlaut)',
  müssen: 'musste → <b>müsste</b> (Präteritum + umlaut)',
  dürfen: 'durfte → <b>dürfte</b> (Präteritum + umlaut)',
  mögen: 'mochte → <b>möchte</b> (Präteritum + umlaut)',
  sollen: '<b>sollte</b>: looks exactly like the Präteritum (no umlaut)',
  wollen: '<b>wollte</b>: looks exactly like the Präteritum (no umlaut)',
  wissen: 'wusste → <b>wüsste</b> (Präteritum + umlaut)',
};
// Present tense of the modal verbs (and wissen), used as wrong answers
const MODAL_PRESENT = {
  können: ['kann', 'kannst', 'kann', 'können', 'könnt', 'können'],
  müssen: ['muss', 'musst', 'muss', 'müssen', 'müsst', 'müssen'],
  dürfen: ['darf', 'darfst', 'darf', 'dürfen', 'dürft', 'dürfen'],
  mögen: ['mag', 'magst', 'mag', 'mögen', 'mögt', 'mögen'],
  sollen: ['soll', 'sollst', 'soll', 'sollen', 'sollt', 'sollen'],
  wollen: ['will', 'willst', 'will', 'wollen', 'wollt', 'wollen'],
  wissen: ['weiß', 'weißt', 'weiß', 'wissen', 'wisst', 'wissen'],
};

const K2_USES = {
  polite: { label: 'polite requests', icon: '🙏', rule: 'Konjunktiv II makes requests polite: <i>Könnten Sie …? Würden Sie …? Ich hätte gern …</i>' },
  wish: { label: 'wishes', icon: '🌠', rule: 'Wishes: <i>Ich wäre gern … · Wenn ich doch … hätte!</i>' },
  advice: { label: 'advice', icon: '💡', rule: 'Advice: <i>Du solltest … · An deiner Stelle würde ich …</i>' },
  unreal: { label: 'wenn … würde', icon: '🤔', rule: 'Imagined situation: <b>wenn</b> + Konjunktiv II (verb at the end), then Konjunktiv II in the main clause (verb first after the comma).' },
  past: { label: 'hätte / wäre + participle', icon: '⏮️', rule: 'Imagined past: <b>hätte / wäre + participle</b>. haben or sein is chosen like in the Perfekt.' },
};

// {S} subject, {S2} the same subject later in the sentence, {V}/{V1}/{V2} gaps.
// subj: allowed pronoun keys (default: all but es)
const K2_TEMPLATES = [
  { use: 'polite', s: '{V} {S} mir bitte helfen?', v: 'können', subj: ['du', 'ihr', 'Sie'] },
  { use: 'polite', s: '{V} {S} bitte das Fenster öffnen?', v: 'können', subj: ['du', 'ihr', 'Sie'] },
  { use: 'polite', s: '{V} {S} mir bitte das Salz geben?', v: 'werden', subj: ['du', 'ihr', 'Sie'] },
  { use: 'polite', s: '{V} ich kurz Ihr Telefon benutzen?', v: 'dürfen', subj: ['ich'] },
  { use: 'polite', s: '{S} {V} gern einen Kaffee.', v: 'haben', subj: ['ich', 'wir'] },
  { use: 'polite', s: '{S} {V} ein Glas Wasser, bitte.', v: 'mögen', subj: ['ich', 'wir'] },
  { use: 'wish', s: 'Wenn {S} doch mehr Zeit {V}!', v: 'haben' },
  { use: 'wish', s: 'Wenn {S} doch schon zu Hause {V}!', v: 'sein' },
  { use: 'wish', s: '{S} {V} jetzt gern am Meer.', v: 'sein' },
  { use: 'wish', s: '{S} {V} gern besser Deutsch sprechen.', v: 'werden' },
  { use: 'wish', s: 'Wenn {S} nur die Antwort {V}!', v: 'wissen' },
  { use: 'advice', s: '{S} {V} mehr schlafen.', v: 'sollen', subj: ['du', 'ihr', 'Sie'] },
  { use: 'advice', s: '{S} {V} mal eine Pause machen.', v: 'können', subj: ['du', 'ihr', 'Sie'] },
  { use: 'advice', s: 'An deiner Stelle {V} ich zum Arzt gehen.', v: 'werden', subj: ['ich'] },
  { use: 'advice', s: '{S} {V} wirklich weniger arbeiten.', v: 'müssen', subj: ['du', 'ihr', 'Sie'] },
  { use: 'unreal', s: 'Wenn {S} reich {V1}, {V2} {S2} um die Welt reisen.', v1: 'sein', v2: 'werden' },
  { use: 'unreal', s: 'Wenn {S} ein Auto {V1}, {V2} {S2} ans Meer fahren.', v1: 'haben', v2: 'können' },
  { use: 'unreal', s: 'Wenn {S} mehr Zeit {V1}, {V2} {S2} öfter Sport machen.', v1: 'haben', v2: 'werden' },
  { use: 'unreal', s: 'Wenn {S} nicht so müde {V1}, {V2} {S2} noch ins Kino gehen.', v1: 'sein', v2: 'werden' },
  { use: 'past', s: 'Wenn {S} Zeit gehabt {V1}, {V2} {S2} gekommen.', v1: 'haben', v2: 'sein' },
  { use: 'past', s: 'Wenn {S} früher aufgestanden {V1}, {V2} {S2} den Bus nicht verpasst.', v1: 'sein', v2: 'haben' },
  { use: 'past', s: '{S} {V} das gern früher gewusst.', v: 'haben' },
  { use: 'past', s: 'Fast {V} {S} den Zug verpasst!', v: 'haben' },
];

/* ---------- Plurals ---------- */

// The five patterns (umlaut or not is part of each)
const PLURAL_PATTERNS = {
  e: { label: '-e / ¨-e', note: 'Mostly masculine (often with umlaut) and short neuter words.' },
  er: { label: '-er / ¨-er', note: 'Mostly short neuter words. Umlaut whenever possible.' },
  n: { label: '-(e)n / -nen', note: 'Almost all feminine words, plus words ending in -e.' },
  s: { label: '-s', note: 'Words ending in a vowel (not -e), foreign words, short forms.' },
  0: { label: '– / ¨', note: 'Masculine and neuter words ending in -er, -el, -en, -chen, -lein.' },
};
const PLURAL_PATTERN_KEYS = ['e', 'er', 'n', 's', '0'];

// Rules of thumb: what you see → what the plural usually is
const PLURAL_RULES = {
  fem: { see: 'feminine (die …)', pl: '-(e)n', how: 'almost always' },
  femx: { see: 'some short feminine words', pl: '¨-e or ¨', how: 'exceptions to learn', note: 'Hand → Hände, Stadt → Städte, Nacht → Nächte, Maus → Mäuse, Mutter → Mütter, Tochter → Töchter' },
  in: { see: '-in (female people)', pl: '-nen', how: 'always' },
  suffix: { see: '-ung, -heit, -keit, -schaft, -ion, -tät', pl: '-en', how: 'always' },
  eend: { see: 'ends in -e', pl: '-n', how: 'almost always' },
  weak: { see: 'male people / animals ending in -ent, -ant, -e', pl: '-en / -n', how: 'almost always' },
  erelen: { see: 'masculine / neuter ending in -er, -el, -en', pl: '– (sometimes ¨)', how: 'almost always' },
  chen: { see: '-chen, -lein', pl: '– (no change)', how: 'always' },
  masc: { see: 'other masculine words', pl: '-e, often ¨-e', how: 'usually' },
  neut: { see: 'short neuter words', pl: '-er (¨) or -e', how: 'usually' },
  vowel: { see: 'ends in a vowel (not -e) or a foreign word', pl: '-s', how: 'usually' },
  latin: { see: '-um, -ma (Latin / Greek)', pl: 'the ending becomes -en', how: 'usually' },
};
const PLURAL_RULE_KEYS = ['fem', 'femx', 'in', 'suffix', 'eend', 'weak', 'erelen', 'chen', 'masc', 'neut', 'vowel', 'latin'];

// p = pattern, r = rule of thumb (none = just learn it)
const PLURAL_NOUNS = [
  { n: 'Tag', g: 'm', pl: 'Tage', p: 'e', r: 'masc', e: '📅', en: 'day' },
  { n: 'Hund', g: 'm', pl: 'Hunde', p: 'e', r: 'masc', e: '🐕', en: 'dog' },
  { n: 'Tisch', g: 'm', pl: 'Tische', p: 'e', r: 'masc', e: '🪑', en: 'table' },
  { n: 'Schuh', g: 'm', pl: 'Schuhe', p: 'e', r: 'masc', e: '👟', en: 'shoe' },
  { n: 'Freund', g: 'm', pl: 'Freunde', p: 'e', r: 'masc', e: '🧑‍🤝‍🧑', en: 'friend' },
  { n: 'Monat', g: 'm', pl: 'Monate', p: 'e', r: 'masc', e: '🗓️', en: 'month' },
  { n: 'Stuhl', g: 'm', pl: 'Stühle', p: 'e', r: 'masc', e: '🪑', en: 'chair' },
  { n: 'Baum', g: 'm', pl: 'Bäume', p: 'e', r: 'masc', e: '🌳', en: 'tree' },
  { n: 'Zug', g: 'm', pl: 'Züge', p: 'e', r: 'masc', e: '🚆', en: 'train' },
  { n: 'Sohn', g: 'm', pl: 'Söhne', p: 'e', r: 'masc', e: '👦', en: 'son' },
  { n: 'Arzt', g: 'm', pl: 'Ärzte', p: 'e', r: 'masc', e: '🧑‍⚕️', en: 'doctor' },
  { n: 'Kopf', g: 'm', pl: 'Köpfe', p: 'e', r: 'masc', e: '🙂', en: 'head' },
  { n: 'Platz', g: 'm', pl: 'Plätze', p: 'e', r: 'masc', e: '📍', en: 'square, seat' },
  { n: 'Jahr', g: 'n', pl: 'Jahre', p: 'e', r: 'neut', e: '📆', en: 'year' },
  { n: 'Brot', g: 'n', pl: 'Brote', p: 'e', r: 'neut', e: '🍞', en: 'bread' },
  { n: 'Geschenk', g: 'n', pl: 'Geschenke', p: 'e', r: 'neut', e: '🎁', en: 'present' },
  { n: 'Problem', g: 'n', pl: 'Probleme', p: 'e', r: 'neut', e: '❗', en: 'problem' },
  { n: 'Hand', g: 'f', pl: 'Hände', p: 'e', r: 'femx', e: '✋', en: 'hand' },
  { n: 'Stadt', g: 'f', pl: 'Städte', p: 'e', r: 'femx', e: '🏙️', en: 'city' },
  { n: 'Nacht', g: 'f', pl: 'Nächte', p: 'e', r: 'femx', e: '🌙', en: 'night' },
  { n: 'Maus', g: 'f', pl: 'Mäuse', p: 'e', r: 'femx', e: '🐭', en: 'mouse' },

  { n: 'Kind', g: 'n', pl: 'Kinder', p: 'er', r: 'neut', e: '🧒', en: 'child' },
  { n: 'Bild', g: 'n', pl: 'Bilder', p: 'er', r: 'neut', e: '🖼️', en: 'picture' },
  { n: 'Ei', g: 'n', pl: 'Eier', p: 'er', r: 'neut', e: '🥚', en: 'egg' },
  { n: 'Lied', g: 'n', pl: 'Lieder', p: 'er', r: 'neut', e: '🎵', en: 'song' },
  { n: 'Buch', g: 'n', pl: 'Bücher', p: 'er', r: 'neut', e: '📕', en: 'book' },
  { n: 'Haus', g: 'n', pl: 'Häuser', p: 'er', r: 'neut', e: '🏠', en: 'house' },
  { n: 'Glas', g: 'n', pl: 'Gläser', p: 'er', r: 'neut', e: '🥛', en: 'glass' },
  { n: 'Land', g: 'n', pl: 'Länder', p: 'er', r: 'neut', e: '🌍', en: 'country' },
  { n: 'Wort', g: 'n', pl: 'Wörter', p: 'er', r: 'neut', e: '💬', en: 'word' },
  { n: 'Dorf', g: 'n', pl: 'Dörfer', p: 'er', r: 'neut', e: '🏘️', en: 'village' },
  { n: 'Fahrrad', g: 'n', pl: 'Fahrräder', p: 'er', r: 'neut', e: '🚲', en: 'bicycle' },
  { n: 'Mann', g: 'm', pl: 'Männer', p: 'er', e: '👨', en: 'man' },

  { n: 'Frau', g: 'f', pl: 'Frauen', p: 'n', r: 'fem', e: '👩', en: 'woman' },
  { n: 'Tür', g: 'f', pl: 'Türen', p: 'n', r: 'fem', e: '🚪', en: 'door' },
  { n: 'Uhr', g: 'f', pl: 'Uhren', p: 'n', r: 'fem', e: '⏰', en: 'clock' },
  { n: 'Schwester', g: 'f', pl: 'Schwestern', p: 'n', r: 'fem', e: '👧', en: 'sister' },
  { n: 'Lampe', g: 'f', pl: 'Lampen', p: 'n', r: 'eend', e: '💡', en: 'lamp' },
  { n: 'Tasche', g: 'f', pl: 'Taschen', p: 'n', r: 'eend', e: '👜', en: 'bag' },
  { n: 'Straße', g: 'f', pl: 'Straßen', p: 'n', r: 'eend', e: '🛣️', en: 'street' },
  { n: 'Woche', g: 'f', pl: 'Wochen', p: 'n', r: 'eend', e: '📆', en: 'week' },
  { n: 'Blume', g: 'f', pl: 'Blumen', p: 'n', r: 'eend', e: '🌸', en: 'flower' },
  { n: 'Auge', g: 'n', pl: 'Augen', p: 'n', r: 'eend', e: '👁️', en: 'eye' },
  { n: 'Zeitung', g: 'f', pl: 'Zeitungen', p: 'n', r: 'suffix', e: '📰', en: 'newspaper' },
  { n: 'Wohnung', g: 'f', pl: 'Wohnungen', p: 'n', r: 'suffix', e: '🏠', en: 'flat' },
  { n: 'Information', g: 'f', pl: 'Informationen', p: 'n', r: 'suffix', e: 'ℹ️', en: 'information' },
  { n: 'Universität', g: 'f', pl: 'Universitäten', p: 'n', r: 'suffix', e: '🎓', en: 'university' },
  { n: 'Freundschaft', g: 'f', pl: 'Freundschaften', p: 'n', r: 'suffix', e: '🤝', en: 'friendship' },
  { n: 'Freundin', g: 'f', pl: 'Freundinnen', p: 'n', r: 'in', e: '👭', en: 'female friend' },
  { n: 'Lehrerin', g: 'f', pl: 'Lehrerinnen', p: 'n', r: 'in', e: '👩‍🏫', en: 'female teacher' },
  { n: 'Ärztin', g: 'f', pl: 'Ärztinnen', p: 'n', r: 'in', e: '👩‍⚕️', en: 'female doctor' },
  { n: 'Student', g: 'm', pl: 'Studenten', p: 'n', r: 'weak', e: '🎓', en: 'student' },
  { n: 'Junge', g: 'm', pl: 'Jungen', p: 'n', r: 'weak', e: '👦', en: 'boy' },
  { n: 'Elefant', g: 'm', pl: 'Elefanten', p: 'n', r: 'weak', e: '🐘', en: 'elephant' },
  { n: 'Bett', g: 'n', pl: 'Betten', p: 'n', e: '🛏️', en: 'bed' },
  { n: 'Museum', g: 'n', pl: 'Museen', p: 'n', r: 'latin', e: '🏛️', en: 'museum' },
  { n: 'Zentrum', g: 'n', pl: 'Zentren', p: 'n', r: 'latin', e: '🎯', en: 'centre' },
  { n: 'Thema', g: 'n', pl: 'Themen', p: 'n', r: 'latin', e: '💬', en: 'topic' },
  { n: 'Firma', g: 'f', pl: 'Firmen', p: 'n', r: 'latin', e: '🏢', en: 'company' },

  { n: 'Auto', g: 'n', pl: 'Autos', p: 's', r: 'vowel', e: '🚗', en: 'car' },
  { n: 'Handy', g: 'n', pl: 'Handys', p: 's', r: 'vowel', e: '📱', en: 'mobile phone' },
  { n: 'Kino', g: 'n', pl: 'Kinos', p: 's', r: 'vowel', e: '🎬', en: 'cinema' },
  { n: 'Foto', g: 'n', pl: 'Fotos', p: 's', r: 'vowel', e: '📷', en: 'photo' },
  { n: 'Baby', g: 'n', pl: 'Babys', p: 's', r: 'vowel', e: '👶', en: 'baby' },
  { n: 'Oma', g: 'f', pl: 'Omas', p: 's', r: 'vowel', e: '👵', en: 'grandma' },
  { n: 'Hotel', g: 'n', pl: 'Hotels', p: 's', r: 'vowel', e: '🏨', en: 'hotel' },
  { n: 'Café', g: 'n', pl: 'Cafés', p: 's', r: 'vowel', e: '☕', en: 'café' },

  { n: 'Lehrer', g: 'm', pl: 'Lehrer', p: '0', r: 'erelen', e: '🧑‍🏫', en: 'teacher' },
  { n: 'Zimmer', g: 'n', pl: 'Zimmer', p: '0', r: 'erelen', e: '🛋️', en: 'room' },
  { n: 'Fenster', g: 'n', pl: 'Fenster', p: '0', r: 'erelen', e: '🪟', en: 'window' },
  { n: 'Löffel', g: 'm', pl: 'Löffel', p: '0', r: 'erelen', e: '🥄', en: 'spoon' },
  { n: 'Schlüssel', g: 'm', pl: 'Schlüssel', p: '0', r: 'erelen', e: '🔑', en: 'key' },
  { n: 'Koffer', g: 'm', pl: 'Koffer', p: '0', r: 'erelen', e: '🧳', en: 'suitcase' },
  { n: 'Kuchen', g: 'm', pl: 'Kuchen', p: '0', r: 'erelen', e: '🍰', en: 'cake' },
  { n: 'Apfel', g: 'm', pl: 'Äpfel', p: '0', r: 'erelen', e: '🍎', en: 'apple' },
  { n: 'Vater', g: 'm', pl: 'Väter', p: '0', r: 'erelen', e: '👨', en: 'father' },
  { n: 'Bruder', g: 'm', pl: 'Brüder', p: '0', r: 'erelen', e: '👦', en: 'brother' },
  { n: 'Garten', g: 'm', pl: 'Gärten', p: '0', r: 'erelen', e: '🌻', en: 'garden' },
  { n: 'Vogel', g: 'm', pl: 'Vögel', p: '0', r: 'erelen', e: '🐦', en: 'bird' },
  { n: 'Mutter', g: 'f', pl: 'Mütter', p: '0', r: 'femx', e: '👩', en: 'mother' },
  { n: 'Tochter', g: 'f', pl: 'Töchter', p: '0', r: 'femx', e: '👧', en: 'daughter' },
  { n: 'Mädchen', g: 'n', pl: 'Mädchen', p: '0', r: 'chen', e: '👧', en: 'girl' },
  { n: 'Brötchen', g: 'n', pl: 'Brötchen', p: '0', r: 'chen', e: '🥯', en: 'bread roll' },
];

/* ---------- Relative clauses ---------- */

// Like der/die/das, except the four special forms: denen, dessen, deren
const REL_PRON = {
  nom: { m: 'der', f: 'die', n: 'das', pl: 'die' },
  akk: { m: 'den', f: 'die', n: 'das', pl: 'die' },
  dat: { m: 'dem', f: 'der', n: 'dem', pl: 'denen' },
  gen: { m: 'dessen', f: 'deren', n: 'dessen', pl: 'deren' },
};

// kind decides which clauses make sense. dat / gen: noun form when it changes.
const REL_NOUNS = [
  { n: 'Mann', g: 'm', gen: 'Mannes', kind: 'person', e: '👨' },
  { n: 'Frau', g: 'f', kind: 'person', e: '👩' },
  { n: 'Kind', g: 'n', gen: 'Kindes', kind: 'person', e: '🧒' },
  { n: 'Lehrer', g: 'm', gen: 'Lehrers', kind: 'person', e: '🧑‍🏫' },
  { n: 'Ärztin', g: 'f', kind: 'person', e: '👩‍⚕️' },
  { n: 'Kinder', g: 'pl', dat: 'Kindern', kind: 'person', e: '🧒' },
  { n: 'Nachbarn', g: 'pl', kind: 'person', e: '🏘️' },
  { n: 'Buch', g: 'n', gen: 'Buches', kind: 'thing', e: '📕' },
  { n: 'Schlüssel', g: 'm', gen: 'Schlüssels', kind: 'thing', e: '🔑' },
  { n: 'Tasche', g: 'f', kind: 'thing', e: '👜' },
  { n: 'Bücher', g: 'pl', dat: 'Büchern', kind: 'thing', e: '📚' },
  { n: 'Laptop', g: 'm', gen: 'Laptops', kind: 'thing', e: '💻' },
  { n: 'Haus', g: 'n', gen: 'Hauses', kind: 'place', e: '🏠' },
  { n: 'Wohnung', g: 'f', kind: 'place', e: '🏢' },
  { n: 'Stadt', g: 'f', kind: 'place', e: '🏙️' },
  { n: 'Auto', g: 'n', gen: 'Autos', kind: 'vehicle', e: '🚗' },
  { n: 'Bus', g: 'm', gen: 'Busses', kind: 'vehicle', e: '🚌' },
  { n: 'Bahn', g: 'f', kind: 'vehicle', e: '🚆' },
];

// The relative clause. {R} = relative pronoun gap. q = the same idea as a normal sentence,
// with {X} = the noun in its case: that shows which case the pronoun needs.
// s / q may be [singular, plural] when the verb changes.
const REL_CLAUSES = [
  { c: 'nom', s: ['{R} dort wohnt', '{R} dort wohnen'], q: ['{X} wohnt dort.', '{X} wohnen dort.'], kinds: ['person'] },
  { c: 'nom', s: ['{R} neben mir sitzt', '{R} neben mir sitzen'], q: ['{X} sitzt neben mir.', '{X} sitzen neben mir.'], kinds: ['person'] },
  { c: 'nom', s: ['{R} auf dem Tisch liegt', '{R} auf dem Tisch liegen'], q: ['{X} liegt auf dem Tisch.', '{X} liegen auf dem Tisch.'], kinds: ['thing'] },
  { c: 'nom', s: ['{R} sehr teuer war', '{R} sehr teuer waren'], q: ['{X} war sehr teuer.', '{X} waren sehr teuer.'], kinds: ['thing', 'vehicle', 'place'] },
  { c: 'akk', s: '{R} ich gestern gesehen habe', q: 'Ich habe {X} gestern gesehen.', kinds: ['person', 'thing', 'vehicle', 'place'] },
  { c: 'akk', s: '{R} ich gut kenne', q: 'Ich kenne {X} gut.', kinds: ['person'] },
  { c: 'akk', s: '{R} du suchst', q: 'Du suchst {X}.', kinds: ['thing', 'person'] },
  { c: 'akk', s: 'für {R} ich das Geschenk gekauft habe', q: 'Ich habe das Geschenk für {X} gekauft.', kinds: ['person'], prep: 'für' },
  { c: 'dat', s: '{R} ich oft helfe', q: 'Ich helfe {X} oft.', kinds: ['person'] },
  { c: 'dat', s: '{R} das Fahrrad gehört', q: 'Das Fahrrad gehört {X}.', kinds: ['person'] },
  { c: 'dat', s: 'mit {R} ich gestern gesprochen habe', q: 'Ich habe gestern mit {X} gesprochen.', kinds: ['person'], prep: 'mit' },
  { c: 'dat', s: 'in {R} ich wohne', q: 'Ich wohne in {X}.', kinds: ['place'], prep: 'in' },
  { c: 'dat', s: 'mit {R} ich zur Arbeit fahre', q: 'Ich fahre mit {X} zur Arbeit.', kinds: ['vehicle'], prep: 'mit' },
  { c: 'gen', s: '{R} Auto vor der Tür steht', q: 'Das Auto {X} steht vor der Tür.', kinds: ['person'] },
  { c: 'gen', s: '{R} Namen ich vergessen habe', q: 'Ich habe den Namen {X} vergessen.', kinds: ['person'] },
  { c: 'gen', s: '{R} Farbe mir so gut gefällt', q: 'Die Farbe {X} gefällt mir so gut.', kinds: ['thing', 'vehicle'] },
];

// The main clause: its case has nothing to do with the relative pronoun's case
const REL_MAINS = [
  { c: 'nom', s: ['Das ist {X},', 'Das sind {X},'], kinds: ['person', 'thing', 'vehicle', 'place'] },
  { c: 'akk', s: 'Ich kenne {X},', kinds: ['person'] },
  { c: 'akk', s: 'Ich mag {X},', kinds: ['thing', 'vehicle', 'place'] },
  { c: 'dat', s: 'Ich danke {X},', kinds: ['person'] },
];

/* ---------- Verbs with fixed prepositions ---------- */

// {PA} = preposition + article gap, {N} = noun, q = W-question with {W} (worauf / auf wen …).
// person: people and animals use preposition + pronoun (auf ihn), things use da-/wo- words (darauf).
const VERB_PREPS = [
  { v: 'warten auf', prep: 'auf', c: 'akk', en: 'to wait for', s: 'Ich warte {PA} {N}.', n: 'Bus', g: 'm', q: '{W} wartest du?' },
  { v: 'warten auf', prep: 'auf', c: 'akk', en: 'to wait for', s: 'Ich warte {PA} {N}.', n: 'Lehrer', g: 'm', person: true, q: '{W} wartest du?' },
  { v: 'sich freuen auf', prep: 'auf', c: 'akk', en: 'to look forward to', s: 'Ich freue mich {PA} {N}.', n: 'Wochenende', g: 'n', q: '{W} freust du dich?' },
  { v: 'sich freuen über', prep: 'über', c: 'akk', en: 'to be happy about', s: 'Ich freue mich {PA} {N}.', n: 'Geschenk', g: 'n', q: '{W} freust du dich?' },
  { v: 'denken an', prep: 'an', c: 'akk', en: 'to think of', s: 'Ich denke oft {PA} {N}.', n: 'Urlaub', g: 'm', q: '{W} denkst du oft?' },
  { v: 'denken an', prep: 'an', c: 'akk', en: 'to think of', s: 'Ich denke oft {PA} {N}.', n: 'Oma', g: 'f', person: true, q: '{W} denkst du oft?' },
  { v: 'sich erinnern an', prep: 'an', c: 'akk', en: 'to remember', s: 'Ich erinnere mich gern {PA} {N}.', n: 'Reise', g: 'f', q: '{W} erinnerst du dich gern?' },
  { v: 'sich interessieren für', prep: 'für', c: 'akk', en: 'to be interested in', s: 'Ich interessiere mich {PA} {N}.', n: 'Film', g: 'm', q: '{W} interessierst du dich?' },
  { v: 'sich kümmern um', prep: 'um', c: 'akk', en: 'to take care of', s: 'Ich kümmere mich {PA} {N}.', n: 'Oma', g: 'f', person: true, q: '{W} kümmerst du dich?' },
  { v: 'sich ärgern über', prep: 'über', c: 'akk', en: 'to be annoyed about', s: 'Ich ärgere mich {PA} {N}.', n: 'Wetter', g: 'n', q: '{W} ärgerst du dich?' },
  { v: 'sprechen über', prep: 'über', c: 'akk', en: 'to talk about', s: 'Wir sprechen {PA} {N}.', n: 'Problem', g: 'n', q: '{W} sprecht ihr?' },
  { v: 'nachdenken über', prep: 'über', c: 'akk', en: 'to think about', s: 'Ich denke {PA} {N} nach.', n: 'Frage', g: 'f', q: '{W} denkst du nach?' },
  { v: 'sich bedanken für', prep: 'für', c: 'akk', en: 'to say thank you for', s: 'Ich bedanke mich {PA} {N}.', n: 'Geschenk', g: 'n', q: '{W} bedankst du dich?' },
  { v: 'sich vorbereiten auf', prep: 'auf', c: 'akk', en: 'to prepare for', s: 'Ich bereite mich {PA} {N} vor.', n: 'Prüfung', g: 'f', q: '{W} bereitest du dich vor?' },
  { v: 'sich konzentrieren auf', prep: 'auf', c: 'akk', en: 'to concentrate on', s: 'Ich konzentriere mich {PA} {N}.', n: 'Arbeit', g: 'f', q: '{W} konzentrierst du dich?' },
  { v: 'sich gewöhnen an', prep: 'an', c: 'akk', en: 'to get used to', s: 'Ich gewöhne mich {PA} {N}.', n: 'Wetter', g: 'n', q: '{W} gewöhnst du dich?' },
  { v: 'glauben an', prep: 'an', c: 'akk', en: 'to believe in', s: 'Ich glaube {PA} {N}.', n: 'Zukunft', g: 'f', q: '{W} glaubst du?' },
  { v: 'bitten um', prep: 'um', c: 'akk', en: 'to ask for', s: 'Ich bitte {PA} {N}.', n: 'Rechnung', g: 'f', q: '{W} bittest du?' },
  { v: 'aufpassen auf', prep: 'auf', c: 'akk', en: 'to look after', s: 'Ich passe {PA} {N} auf.', n: 'Hund', g: 'm', person: true, q: '{W} passt du auf?' },
  { v: 'lachen über', prep: 'über', c: 'akk', en: 'to laugh about', s: 'Wir lachen {PA} {N}.', n: 'Witz', g: 'm', q: '{W} lacht ihr?' },
  { v: 'sich entschuldigen für', prep: 'für', c: 'akk', en: 'to apologise for', s: 'Ich entschuldige mich {PA} {N}.', n: 'Fehler', g: 'm', q: '{W} entschuldigst du dich?' },
  { v: 'sich Sorgen machen um', prep: 'um', c: 'akk', en: 'to worry about', s: 'Ich mache mir Sorgen {PA} {N}.', n: 'Zukunft', g: 'f', q: '{W} machst du dir Sorgen?' },
  { v: 'sich verlassen auf', prep: 'auf', c: 'akk', en: 'to rely on', s: 'Ich verlasse mich {PA} {N}.', n: 'Freund', g: 'm', person: true, q: '{W} verlässt du dich?' },

  { v: 'Angst haben vor', prep: 'vor', c: 'dat', en: 'to be afraid of', s: 'Ich habe Angst {PA} {N}.', n: 'Hund', g: 'm', person: true, q: '{W} hast du Angst?' },
  { v: 'Angst haben vor', prep: 'vor', c: 'dat', en: 'to be afraid of', s: 'Ich habe Angst {PA} {N}.', n: 'Prüfung', g: 'f', q: '{W} hast du Angst?' },
  { v: 'träumen von', prep: 'von', c: 'dat', en: 'to dream of', s: 'Ich träume {PA} {N}.', n: 'Urlaub', g: 'm', q: '{W} träumst du?' },
  { v: 'sprechen mit', prep: 'mit', c: 'dat', en: 'to talk to', s: 'Ich spreche {PA} {N}.', n: 'Lehrer', g: 'm', person: true, q: '{W} sprichst du?' },
  { v: 'telefonieren mit', prep: 'mit', c: 'dat', en: 'to be on the phone with', s: 'Ich telefoniere {PA} {N}.', n: 'Oma', g: 'f', person: true, q: '{W} telefonierst du?' },
  { v: 'teilnehmen an', prep: 'an', c: 'dat', en: 'to take part in', s: 'Ich nehme {PA} {N} teil.', n: 'Kurs', g: 'm', q: '{W} nimmst du teil?' },
  { v: 'fragen nach', prep: 'nach', c: 'dat', en: 'to ask about / for', s: 'Ich frage {PA} {N}.', n: 'Weg', g: 'm', q: '{W} fragst du?' },
  { v: 'suchen nach', prep: 'nach', c: 'dat', en: 'to look for', s: 'Ich suche {PA} {N}.', n: 'Schlüssel', g: 'm', q: '{W} suchst du?' },
  { v: 'gratulieren zu', prep: 'zu', c: 'dat', en: 'to congratulate on', s: 'Ich gratuliere dir {PA} {N}.', n: 'Geburtstag', g: 'm', q: '{W} gratulierst du mir?' },
  { v: 'einladen zu', prep: 'zu', c: 'dat', en: 'to invite to', s: 'Ich lade dich {PA} {N} ein.', n: 'Party', g: 'f', q: '{W} lädst du mich ein?' },
  { v: 'sich verabschieden von', prep: 'von', c: 'dat', en: 'to say goodbye to', s: 'Ich verabschiede mich {PA} {N}.', n: 'Chef', g: 'm', person: true, q: '{W} verabschiedest du dich?' },
  { v: 'abhängen von', prep: 'von', c: 'dat', en: 'to depend on', s: 'Das hängt {PA} {N} ab.', n: 'Wetter', g: 'n', q: '{W} hängt das ab?' },
  { v: 'warnen vor', prep: 'vor', c: 'dat', en: 'to warn about', s: 'Ich warne dich {PA} {N}.', n: 'Gefahr', g: 'f', q: '{W} warnst du mich?' },
  { v: 'sich beschäftigen mit', prep: 'mit', c: 'dat', en: 'to deal with', s: 'Ich beschäftige mich {PA} {N}.', n: 'Thema', g: 'n', q: '{W} beschäftigst du dich?' },
  { v: 'helfen bei', prep: 'bei', c: 'dat', en: 'to help with', s: 'Ich helfe dir {PA} {N}.', n: 'Arbeit', g: 'f', q: '{W} hilfst du mir?' },
  { v: 'anfangen mit', prep: 'mit', c: 'dat', en: 'to start with', s: 'Ich fange {PA} {N} an.', n: 'Arbeit', g: 'f', q: '{W} fängst du an?' },
  { v: 'aufhören mit', prep: 'mit', c: 'dat', en: 'to stop (doing)', s: 'Ich höre {PA} {N} auf.', n: 'Rauchen', g: 'n', q: '{W} hörst du auf?' },
  { v: 'erzählen von', prep: 'von', c: 'dat', en: 'to tell about', s: 'Ich erzähle {PA} {N}.', n: 'Reise', g: 'f', q: '{W} erzählst du?' },
  { v: 'sich treffen mit', prep: 'mit', c: 'dat', en: 'to meet (up) with', s: 'Ich treffe mich {PA} {N}.', n: 'Kollegin', g: 'f', person: true, q: '{W} triffst du dich?' },
];

const VP_PREPS = ['an', 'auf', 'über', 'für', 'um', 'mit', 'von', 'vor', 'zu', 'nach', 'bei', 'in'];
