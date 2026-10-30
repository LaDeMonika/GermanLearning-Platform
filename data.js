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
