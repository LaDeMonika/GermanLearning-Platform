/* Fälle Trainer: rendering and practice logic. Data lives in data.js. */
(() => {
'use strict';

const $ = (s, el = document) => el.querySelector(s);
const $$ = (s, el = document) => [...el.querySelectorAll(s)];
const app = $('#app');
const rnd = a => a[Math.floor(Math.random() * a.length)];
const shuffle = a => { const b = [...a]; for (let i = b.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [b[i], b[j]] = [b[j], b[i]]; } return b; };
const uniq = a => [...new Set(a)];
const cap = s => s.charAt(0).toUpperCase() + s.slice(1);
const tag = (c, text) => `<span class="ct ct-${c}">${text || CASES[c].name}</span>`;
const hl = (c, text) => `<b class="c-${c}">${text}</b>`;

const store = {
  get(k, d) { try { const v = localStorage.getItem('faelle.' + k); return v ? JSON.parse(v) : d; } catch { return d; } },
  set(k, v) { try { localStorage.setItem('faelle.' + k, JSON.stringify(v)); } catch { /* storage unavailable */ } },
};
const settings = Object.assign({ answer: 'choice', gen: true, gender: true, mode: 'who' }, store.get('settings', {}));
const saveSettings = () => store.set('settings', settings);

/* ---------- Perspective helpers ---------- */

function pronKey(pid, lid) {
  if (pid === 'me') return 'ich';
  if (pid === 'us') return 'wir';
  if (pid === lid) return LISTENERS[lid].pron;
  return PEOPLE[pid].pron3;
}
const poolFor = lid => Object.keys(PEOPLE).filter(id => !LISTENERS[lid].excludes.includes(id));
const personRole = (pid, lid) => (pid === 'me' || pid === 'us') ? 1 : pid === lid ? 2 : 3;
const ROLE_LABEL = { 1: '1st person', 2: '2nd person', 3: '3rd person' };
function relation(pid, lid) {
  if (pid === 'me') return 'that’s you, the speaker';
  if (pid === 'us') return 'you + someone else';
  if (pid === lid) return 'the person you are talking to';
  return 'someone you are talking about';
}
const personLabel = pid => `${PEOPLE[pid].emoji} ${PEOPLE[pid].name}`;
const nounLabel = n => `${GENDERS[n.g].art} ${n.n}${n.g === 'pl' ? ' (pl.)' : ''}`;

function pronExamples(key) {
  const P = PRONOUNS[key];
  return {
    nom: `${hl('nom', cap(P.nom))} ${CONJ.sein[key]} hier.`,
    akk: `Der Lehrer sieht ${hl('akk', P.akk)}.`,
    dat: `Der Lehrer hilft ${hl('dat', P.dat)}.`,
    gen: `<span class="muted">rare today, old-fashioned style</span>`,
  };
}

function possExamples(stem, item) {
  const pl = item.g === 'pl';
  const f = c => `${hl(c, possForm(stem, c, item.g))} ${nounForm(item, c)}`;
  return {
    nom: `Das ${pl ? 'sind' : 'ist'} ${f('nom')}.`,
    akk: `Ich sehe ${f('akk')}.`,
    dat: `Was ist mit ${f('dat')} los?`,
    gen: item.anim
      ? (pl ? `Die Namen ${f('gen')} sind schön.` : `Der Name ${f('gen')} ist schön.`)
      : `Die Farbe ${f('gen')} gefällt mir.`,
  };
}

function possTable(stem, hiGender, withNouns) {
  const sample = { m: 'Hund', f: 'Katze', n: 'Auto', pl: 'Kinder' };
  const sampleDat = { pl: 'Kindern' };
  const sampleGen = { m: 'Hundes', n: 'Autos' };
  let h = `<div class="tw"><table><thead><tr><th></th>${GENDER_KEYS.map(g => `<th class="${g === hiGender ? 'hlcol' : ''}">${GENDERS[g].name}<span class="sub">${GENDERS[g].art} ${withNouns ? sample[g] : ''}</span></th>`).join('')}</tr></thead><tbody>`;
  for (const c of CASE_KEYS) {
    h += `<tr class="row-${c}"><th>${CASES[c].name}<span class="sub">${CASES[c].q}</span></th>`;
    for (const g of GENDER_KEYS) {
      const form = possForm(stem, c, g);
      const end = POSS_END[c][g];
      const shown = end ? `${form.slice(0, form.length - end.length)}<span class="end">${end}</span>` : form;
      let noun = '';
      if (withNouns) noun = ' ' + ((c === 'dat' && sampleDat[g]) || (c === 'gen' && sampleGen[g]) || sample[g]);
      h += `<td class="f ${g === hiGender ? 'hlcol' : ''}">${shown}<span class="sub">${noun}</span></td>`;
    }
    h += '</tr>';
  }
  return h + '</tbody></table></div>';
}

/* ---------- Routing ---------- */

const ROUTES = { cases: renderCases, perspective: renderPerspective, adjectives: renderAdjectives, reflexive: renderReflexive, relative: renderRelative, wowohin: renderWoWohin, genders: renderGenders, plurals: renderPlurals, perfekt: renderPerfekt, praeteritum: renderPraeteritum, konjunktiv: renderKonjunktiv, verbprep: renderVerbPrep, wortstellung: renderWordOrder, tables: renderTables, practice: renderPractice };
function route() {
  const r = location.hash.slice(1).split('/')[0] || 'cases';
  const key = ROUTES[r] ? r : 'cases';
  $$('nav a').forEach(a => a.classList.toggle('active', a.getAttribute('href') === '#' + key));
  $$('.navgroup').forEach(g => $('.navbtn', g).classList.toggle('active', !!$('a.active', g)));
  closeMenus();
  ROUTES[key]();
  window.scrollTo(0, 0);
}
window.addEventListener('hashchange', route);

/* ---------- Header dropdown menus ---------- */

function closeMenus() {
  $$('.navgroup').forEach(g => { g.classList.remove('open'); $('.navbtn', g).setAttribute('aria-expanded', 'false'); });
}

$$('.navbtn').forEach(btn => btn.addEventListener('click', e => {
  e.stopPropagation();
  const group = btn.parentElement;
  const opening = !group.classList.contains('open');
  closeMenus();
  if (opening) {
    group.classList.add('open');
    btn.setAttribute('aria-expanded', 'true');
  }
}));
document.addEventListener('click', e => { if (!e.target.closest('.navgroup')) closeMenus(); });
document.addEventListener('keydown', e => { if (e.key === 'Escape') closeMenus(); });

/* =========================================================
   CASES (learn)
   ========================================================= */

function renderCases() {
  const cardEx = {
    nom: { s: '<mark class="c-nom">Der Hund</mark> schläft.', a: '<i>Wer schläft?</i> → der Hund' },
    akk: { s: 'Ich sehe <mark class="c-akk">den Hund</mark>.', a: '<i>Wen sehe ich?</i> → den Hund' },
    dat: { s: 'Ich gebe <mark class="c-dat">dem Hund</mark> Wasser.', a: '<i>Wem gebe ich Wasser?</i> → dem Hund' },
    gen: { s: 'Das ist der Ball <mark class="c-gen">des Hundes</mark>.', a: '<i>Wessen Ball?</i> → des Hundes' },
  };
  const cards = CASE_KEYS.map(c => `
    <div class="case-card ${c}">
      <div class="nm c-${c}">${CASES[c].name}</div>
      <div class="qq">${CASES[c].q}</div>
      <div class="rl">${CASES[c].role}</div>
      <div class="arts">${GENDER_KEYS.map(g => DEF_ART[c][g]).join(' · ')}</div>
      <div class="ex">${cardEx[c].s}<br><small>${cardEx[c].a}</small></div>
    </div>`).join('');

  const prepRow = (k, label, c) => `<div class="prep-row">${c ? tag(c, label) : `<span class="ct ct-dat" style="background:linear-gradient(90deg,var(--dat-bg),var(--akk-bg));color:var(--text)">${label}</span>`} ${PREPS[k].map(p => `<span class="pill">${p}</span>`).join('')}</div>`;

  const colored = COLOR_EXAMPLES.map((parts, i) => `<div class="colored">${parts.map((p, j) =>
    typeof p === 'string' ? p : `<button class="chunk ${p[1]}" data-i="${i}" data-j="${j}">${p[0]}</button>`).join('')}</div>`).join('');

  app.innerHTML = `
  <section class="card">
    <h2>The 4 German cases</h2>
    <p class="lead">To find which case a noun or pronoun needs, <b>ask a question about it</b>. The question word tells you the case.</p>
    <div class="case-cards">${cards}</div>
  </section>

  <section class="card">
    <h2>How to find the case, step by step</h2>
    <ol class="steps">
      <li><b>Is there a preposition in front of it?</b> Then the preposition decides. It beats everything else.
        ${prepRow('akk', 'always Akk', 'akk')}
        ${prepRow('dat', 'always Dat', 'dat')}
        ${prepRow('two', 'Wo? → Dat · Wohin? → Akk')}
        ${prepRow('gen', 'Genitiv', 'gen')}
      </li>
      <li><b>Find the verb, then ask <i>Wer? / Was?</i></b> Who or what is doing it? That is the subject → ${tag('nom')}. The verb ending matches this word (ich bin, du bist, er ist …).</li>
      <li><b>Ask <i>Wen? / Was?</i></b> Who or what does the action hit directly? → ${tag('akk')}.</li>
      <li><b>Ask <i>Wem?</i></b> To or for whom? Who receives something? → ${tag('dat')}.
        <div class="prep-row"><small>These verbs always take Dativ:</small> ${DAT_VERBS.map(v => `<span class="pill">${v}</span>`).join('')}</div>
        <div class="prep-row"><small>Give / show verbs: person = Dat, thing = Akk:</small> ${DAT_AKK_VERBS.map(v => `<span class="pill">${v}</span>`).join('')}</div>
      </li>
      <li><b>Ask <i>Wessen?</i></b> Whose? → ${tag('gen')}. In everyday speech people often say <i>von + Dativ</i> instead (das Auto von meinem Vater).</li>
    </ol>
    <div class="tips">
      <div class="tip"><b>Only masculine really changes in Akk</b>der → den, ein → einen, mein → meinen. Feminine, neuter and plural stay the same as Nominativ.</div>
      <div class="tip"><b>The "der-test" for Was?</b><i>Was</i> can be Nom or Akk. Swap the thing for a masculine noun: if you'd say <i>der</i> it's Nom, if <i>den</i> it's Akk.</div>
      <div class="tip"><b>sein · werden · bleiben</b>Nominativ on both sides: <i>Das ist <u>ein</u> Tisch. Er wird <u>ein</u> Arzt.</i></div>
      <div class="tip"><b>Dativ plural adds -n</b>die Kinder → mit den Kinder<u>n</u>. (Not if the plural already ends in -n or -s.)</div>
      <div class="tip"><b>Short forms</b>im = in dem · ins = in das · am = an dem · zum = zu dem · zur = zu der · beim = bei dem · vom = von dem</div>
    </div>
  </section>

  <section class="card">
    <h2>See it in real sentences</h2>
    <p class="muted">Tap a coloured part to see the question it answers.</p>
    ${colored}
    <div class="chunk-out" id="chunkOut"><span class="muted">← pick a coloured part</span></div>
  </section>

  <section class="card">
    <h2>Two-way prepositions: Wo? or Wohin?</h2>
    <p class="muted">an, auf, hinter, in, neben, über, unter, vor, zwischen can take Dativ or Akkusativ. Ask yourself one question:</p>
    <div class="wowohin">
      <div class="ww dat"><div class="big c-dat">Wo? → Dativ</div><div class="pic">📕▬</div><p>Location, no change of place.<br><b>Das Buch liegt auf <span class="c-dat">dem</span> Tisch.</b><br><b>Ich bin in <span class="c-dat">der</span> Stadt.</b></p></div>
      <div class="ww akk"><div class="big c-akk">Wohin? → Akkusativ</div><div class="pic">📕➜▬</div><p>Movement / direction to a goal.<br><b>Ich lege das Buch auf <span class="c-akk">den</span> Tisch.</b><br><b>Ich gehe in <span class="c-akk">die</span> Stadt.</b></p></div>
    </div>
    <p style="margin-top:12px"><a href="#wowohin">More on Wo? / Wohin?: all 9 prepositions, verb pairs and traps →</a></p>
  </section>`;
}

app.addEventListener('click', onChunk);
function onChunk(e) {
  const b = e.target.closest('.chunk');
  if (!b || !$('#chunkOut')) return;
  const p = COLOR_EXAMPLES[b.dataset.i][b.dataset.j];
  $$('.chunk').forEach(x => x.classList.toggle('on', x === b));
  $('#chunkOut').innerHTML = `<span style="font-size:1.15rem"><i>${p[2]}</i></span> → <b>${p[0]}</b> → ${tag(p[1])}<br><small>${CASES[p[1]].role}</small>`;
}

/* =========================================================
   WHO IS WHO (perspective)
   ========================================================= */

const persp = { listener: 'anna', sel: 'tom' };

function pcard(pid) {
  const r = personRole(pid, persp.listener);
  const key = pronKey(pid, persp.listener);
  const item = PEOPLE[pid].item;
  return `<button class="pcard r${r} ${persp.sel === pid ? 'sel' : ''}" data-p="${pid}">
    <span class="badge">${ROLE_LABEL[r]}</span>
    <div class="emo">${PEOPLE[pid].emoji}</div>
    <div class="nm">${PEOPLE[pid].name}</div>
    <div class="pr">${PRONOUNS[key].nom}</div>
    <div class="it">${item.e} ${possForm(PRONOUNS[key].poss, 'nom', item.g)} ${item.n}</div>
  </button>`;
}

function renderPerspective() {
  const L = persp.listener;
  const pool = poolFor(L);
  if (!pool.includes(persp.sel)) persp.sel = L;
  const others = pool.filter(p => p !== 'me' && p !== 'us' && p !== L);

  app.innerHTML = `
  <section class="card">
    <h2>Who is who, from your point of view</h2>
    <p class="lead">You are always <b>ich</b>. The person you talk <b>to</b> is <b>du / ihr / Sie</b>. Everyone you talk <b>about</b> is <b>er / sie / es / sie</b>. Change who you're talking to and watch the pronouns change.</p>
    <div class="ctl-row"><span>Who are you talking to?</span>
      <div class="seg" id="lseg">${Object.keys(LISTENERS).map(k => `<button data-l="${k}" class="${k === L ? 'on' : ''}">${LISTENERS[k].label} <small>(${LISTENERS[k].desc})</small></button>`).join('')}</div>
    </div>
    <div class="talk">
      ${pcard('me')}
      <div class="arrow"><span class="bubble">💬</span>talking to →</div>
      ${pcard(L)}
    </div>
    <h4>People you talk about</h4>
    <div class="pgrid">${others.map(pcard).join('')}</div>
    <h4>A group that includes you</h4>
    <div class="pgrid">${pcard('us')}</div>
    <p class="muted" style="margin-top:12px">Tap anyone to see all their forms and what belongs to them.</p>
  </section>
  <section class="card" id="detail">${personDetail(persp.sel)}</section>
  <section class="card">
    <h2>How to address people: du, ihr or Sie?</h2>
    <div class="addr">
      <div><div class="w">du</div><b>One person you know well.</b><br>Friends, family, partner, children, animals, classmates, often young colleagues.<br><small>du · dich · dir · <b>dein</b></small></div>
      <div><div class="w">ihr</div><b>Two or more people you'd each say du to.</b><br>Your friends, your parents, a group of kids.<br><small>ihr · euch · euch · <b>euer</b></small></div>
      <div><div class="w">Sie</div><b>One or more people, formal.</b><br>Adult strangers, your boss, doctors, officials, shop staff, older people. <b>Always capital S</b>, verb like "they": <i>Sie sind</i>.<br><small>Sie · Sie · Ihnen · <b>Ihr</b></small></div>
    </div>
    <div class="tips">
      <div class="tip"><b>Not sure?</b>Use Sie. People will offer the du: <i>„Wollen wir uns duzen?“</i></div>
      <div class="tip"><b>er / sie / es also mean "it"</b>Things follow their grammatical gender: der Tisch → <b>er</b>, die Lampe → <b>sie</b>, das Bild → <b>es</b>.</div>
      <div class="tip"><b>sie, sie or Sie?</b>sie + ist = she. sie + sind = they. Sie + sind (capital) = formal you.</div>
    </div>
  </section>`;

  $('#lseg').addEventListener('click', e => {
    const b = e.target.closest('button[data-l]');
    if (!b) return;
    persp.listener = b.dataset.l;
    renderPerspective();
  });
  $$('.pcard').forEach(b => b.addEventListener('click', () => {
    persp.sel = b.dataset.p;
    $$('.pcard').forEach(x => x.classList.toggle('sel', x.dataset.p === persp.sel));
    $('#detail').innerHTML = personDetail(persp.sel);
    $('#detail').scrollIntoView({ behavior: 'smooth', block: 'start' });
  }));
}

function personDetail(pid) {
  const L = persp.listener;
  const key = pronKey(pid, L);
  const P = PRONOUNS[key];
  const person = PEOPLE[pid];
  const item = person.item;
  const pe = pronExamples(key);
  const xe = possExamples(P.poss, item);

  let changeNote = '';
  if (pid === 'me') changeNote = 'You are always <b>ich</b>, no matter who you talk to.';
  else if (pid === 'us') changeNote = '<b>wir</b> = you + anyone else. It never changes.';
  else {
    const asListener = Object.keys(LISTENERS).find(l => l === pid);
    const to = asListener ? PRONOUNS[LISTENERS[pid].pron].nom : (person.pron3 === 'siePl' ? 'ihr / Sie' : 'du / Sie');
    changeNote = `Talking <b>to</b> ${person.name}: <b>${to}</b> · talking <b>about</b> ${person.name}: <b>${PRONOUNS[person.pron3].nom}</b>`;
  }

  return `
    <h2>${person.emoji} ${person.name} = <span style="color:var(--p${personRole(pid, L)})">${P.label}</span> <small>(${P.en})</small></h2>
    <p class="muted">${cap(person.role)}, ${relation(pid, L)}. ${changeNote}</p>
    <h4>Personal pronoun in every case</h4>
    <div class="forms4">${CASE_KEYS.map(c => `
      <div class="fcell ${c}"><div class="lab">${CASES[c].name} · ${CASES[c].q}</div><div class="big">${P[c]}</div><div class="ex">${pe[c]}</div></div>`).join('')}
    </div>
    <h4>What belongs to ${person.name}: ${item.e} ${nounLabel(item)} → ${P.poss}- <small>(${P.possEn})</small></h4>
    <div class="forms4">${CASE_KEYS.map(c => `
      <div class="fcell ${c}"><div class="lab">${CASES[c].name} · ${CASES[c].q}</div><div class="big">${possForm(P.poss, c, item.g)}</div><div class="ex">${xe[c]}</div></div>`).join('')}
    </div>
    <h4>All forms of ${P.poss}- <small>(highlighted: ${GENDERS[item.g].name}, like ${item.n})</small></h4>
    ${possTable(P.poss, item.g, true)}`;
}

/* =========================================================
   ADJECTIVE helpers (shared by learn, tables and practice)
   ========================================================= */

const findNoun = (list, n) => list.find(x => x.n === n);
const ADJ_SAMPLE = {
  def: { adj: 'alt', nouns: { m: findNoun(NOUNS, 'Hund'), f: findNoun(NOUNS, 'Katze'), n: findNoun(NOUNS, 'Auto'), pl: findNoun(NOUNS, 'Kinder') } },
  indef: { adj: 'alt', nouns: { m: findNoun(NOUNS, 'Hund'), f: findNoun(NOUNS, 'Katze'), n: findNoun(NOUNS, 'Auto'), pl: findNoun(NOUNS, 'Kinder') } },
  none: { adj: 'gut', nouns: { m: findNoun(MASS_NOUNS, 'Wein'), f: findNoun(MASS_NOUNS, 'Milch'), n: findNoun(MASS_NOUNS, 'Wasser'), pl: findNoun(MASS_NOUNS, 'Äpfel') } },
};

function adjArticle(type, c, g, stem) {
  if (type === 'def') return DEF_ART[c][g];
  if (type === 'indef') return possForm(stem || 'mein', c, g);
  return '';
}

// Article with its ending marked; "ein" without an ending gets an empty slot
function articleHtml(type, c, g, art) {
  if (type === 'def') return `${art.slice(0, -1)}<span class="sig">${art.slice(-1)}</span>`;
  if (type === 'indef') {
    const e = POSS_END[c][g];
    return e ? `${art.slice(0, -e.length)}<span class="sig">${e}</span>` : `${art}<span class="noend"></span>`;
  }
  return '';
}

// Why the adjective gets this ending
function adjReason(type, c, g, art) {
  const end = ADJ_END[type][c][g];
  if (type === 'def') {
    return `<b>${art}</b> is a der-word: it already shows the case and gender, so the adjective only needs the weak ending ${end === 'e'
      ? '<b>-e</b>. This is one of the five -e spots (Nominativ singular, plus Akkusativ feminine and neuter).'
      : '<b>-en</b>, used everywhere outside the five -e spots.'}`;
  }
  if (type === 'indef') {
    if (!POSS_END[c][g]) return `<b>${art}</b> has no ending here, so it doesn't show the gender. The adjective has to show it: <b>-${end}</b>, borrowing the last letter of <b>${DEF_ART[c][g]}</b>.`;
    return `<b>${art}</b> already has an ending (-${POSS_END[c][g]}), so the adjective takes the weak ending <b>-${end}</b>.`;
  }
  if (c === 'gen' && g !== 'f' && g !== 'pl') return 'No article, but the noun already ends in -s here, so the adjective takes <b>-en</b>. This is the one exception.';
  return `No article, so the adjective does the article's job. It takes the ending of <b>${DEF_ART[c][g]}</b> → <b>-${end}</b>.`;
}

function adjTable(type, hi) {
  const s = ADJ_SAMPLE[type];
  let h = `<div class="tw"><table class="adjt"><thead><tr><th></th>${GENDER_KEYS.map(g => `<th>${GENDERS[g].name}</th>`).join('')}</tr></thead><tbody>`;
  for (const c of CASE_KEYS) {
    h += `<tr class="row-${c}"><th>${CASES[c].name}<span class="sub">${CASES[c].q}</span></th>`;
    for (const g of GENDER_KEYS) {
      const end = ADJ_END[type][c][g];
      const art = adjArticle(type, c, g);
      const cls = type !== 'none' && end === 'e' ? 'ae-e' : end === 'en' ? 'ae-en' : 'ae-strong';
      const on = hi && hi.c === c && hi.g === g ? ' ae-on' : '';
      h += `<td class="${cls}${on}"><span class="ae">-${end}</span><span class="sub">${art ? art + ' ' : ''}${adjForm(s.adj, end)} ${nounForm(s.nouns[g], c)}</span></td>`;
    }
    h += '</tr>';
  }
  return h + '</tbody></table></div>';
}

const adjLegend = `<div class="legend"><span><i class="sw ae-e"></i> -e</span><span><i class="sw ae-en"></i> -en</span><span><i class="sw ae-strong"></i> strong ending (shows the gender)</span></div>`;

/* =========================================================
   ADJECTIVES (learn)
   ========================================================= */

const adjB = { type: 'indef', stem: 'ein', c: 'nom', g: 'm', adj: 'alt', tab: 'def' };
const BUILDER_ADJ = ['alt', 'neu', 'gut', 'klein', 'schön', 'teuer'];

function renderAdjectives() {
  const sigRow = (art, adj, end, noun, note) => `<div class="sigrow"><div class="sigphrase">${art} ${adj}<span class="sig">${end}</span> ${noun}</div><div class="muted">${note}</div></div>`;

  app.innerHTML = `
  <section class="card">
    <h2>Adjective endings</h2>
    <p class="lead">When an adjective stands <b>before a noun</b>, it needs an ending. The golden rule: <b>the gender + case signal has to show up once</b>, either on the article or on the adjective.</p>
    ${sigRow(`de<span class="sig">r</span>`, 'alt', 'e', 'Hund', 'The article already shows "r" (masculine), so the adjective relaxes: <b>-e</b>.')}
    ${sigRow('ein<span class="noend"></span>', 'alt', 'er', 'Hund', '"ein" shows nothing, so the adjective takes the "r": <b>-er</b>.')}
    ${sigRow('', 'rot', 'er', 'Wein', 'No article at all, so the adjective shows the "r": <b>-er</b>.')}
    <div class="tips">
      <div class="tip"><b>After the noun: no ending</b><i>Der Hund ist alt.</i> Only adjectives <u>before</u> a noun get endings.</div>
      <div class="tip"><b>Dativ and Genitiv after an article</b>are always <b>-en</b>, in both the der and ein tables. That's half the table done!</div>
      <div class="tip"><b>Two adjectives, same ending</b><i>ein schön<u>er</u> alt<u>er</u> Hund · mit dem klein<u>en</u> rot<u>en</u> Auto</i></div>
      <div class="tip"><b>Spelling changes</b>teuer → teu<u>re</u> · dunkel → dunk<u>le</u> · hoch → ho<u>he</u> · sauer → sau<u>re</u></div>
    </div>
  </section>

  <section class="card">
    <h2>The three tables</h2>
    <div class="seg" id="adjTabs">${ADJ_TYPE_KEYS.map(k => `<button data-t="${k}" class="${adjB.tab === k ? 'on' : ''}">${ADJ_TYPES[k].name}</button>`).join('')}</div>
    <div id="adjTabBody"></div>
  </section>

  <section class="card">
    <h2>Ending builder</h2>
    <p class="muted">Pick an article, a case, a gender and an adjective. See the ending and why.</p>
    <div id="builder"></div>
  </section>`;

  drawAdjTab();
  drawBuilder();
  $('#adjTabs').addEventListener('click', e => {
    const b = e.target.closest('[data-t]');
    if (!b) return;
    adjB.tab = b.dataset.t;
    $$('#adjTabs button').forEach(x => x.classList.toggle('on', x === b));
    drawAdjTab();
  });
}

function drawAdjTab() {
  const t = adjB.tab;
  const notes = {
    def: 'Easy one: <b>-e</b> in the five spots (all Nominativ singular, plus Akkusativ feminine and neuter). <b>-en</b> everywhere else.',
    indef: 'Same as the der-table, except in the three spots where ein / mein has <b>no ending</b> (Nom masc., Nom + Akk neuter). There the adjective shows the gender itself: <b>-er</b> / <b>-es</b>. Plural uses kein / mein (ein has no plural).',
    none: 'The adjective takes the ending der / die / das would have: der → -er, den → -en, dem → -em, die → -e, das → -es. Exception: Genitiv masculine/neuter is <b>-en</b>, because the noun already gets -s.',
  };
  $('#adjTabBody').innerHTML = `<p style="margin-top:14px">${notes[t]} <small>(${ADJ_TYPES[t].also})</small></p>${adjLegend}${adjTable(t)}`;
}

function drawBuilder() {
  const B = adjB;
  if (B.type === 'indef' && B.g === 'pl' && B.stem === 'ein') B.stem = 'kein';
  const s = ADJ_SAMPLE[B.type];
  const noun = s.nouns[B.g];
  const art = adjArticle(B.type, B.c, B.g, B.stem);
  const end = ADJ_END[B.type][B.c][B.g];
  const word = adjForm(B.adj, end);
  const stem = word.slice(0, word.length - end.length);
  const phrase = `${art ? articleHtml(B.type, B.c, B.g, art) + ' ' : ''}${stem}<span class="end">${end}</span> ${nounForm(noun, B.c)}`;

  const chips = (key, list, label) => `<div class="chips">${list.map(([v, l]) => `<button class="chipbtn ${B[key] === v ? 'on' : ''}" data-k="${key}" data-v="${v}">${l}</button>`).join('')}</div>`;
  const typeChips = [['def', 'der / die / das'], ['indef', 'ein-word'], ['none', 'no article']];
  const stems = ADJ_ARTICLE_STEMS.filter(x => !(B.g === 'pl' && x === 'ein')).map(x => [x, x + '…']);

  $('#builder').innerHTML = `
    <div class="bgrid">
      <div><h4>Article</h4>${chips('type', typeChips)}${B.type === 'indef' ? chips('stem', stems) : ''}</div>
      <div><h4>Case</h4>${chips('c', CASE_KEYS.map(c => [c, CASES[c].name]))}</div>
      <div><h4>Noun</h4>${chips('g', GENDER_KEYS.map(g => [g, `${GENDERS[g].art} ${s.nouns[g].n}`]))}</div>
      <div><h4>Adjective</h4>${chips('adj', BUILDER_ADJ.map(a => [a, a]))}</div>
    </div>
    <div class="build-out c-${B.c}">${phrase}</div>
    <p>${adjReason(B.type, B.c, B.g, art)}</p>
    ${adjLegend}${adjTable(B.type, { c: B.c, g: B.g })}`;

  $$('#builder [data-k]').forEach(b => b.addEventListener('click', () => {
    B[b.dataset.k] = b.dataset.v;
    drawBuilder();
  }));
}

/* =========================================================
   REFLEXIVE
   ========================================================= */

const REFL_EN = { ich: 'myself', du: 'yourself', er: 'himself', sie: 'herself', es: 'itself', wir: 'ourselves', ihr: 'yourselves', siePl: 'themselves', Sie: 'yourself (formal)' };
const members = id => GROUP_MEMBERS[id] || [id];
const overlaps = (a, b) => members(a).some(m => members(b).includes(m));

function reflSentence(verb, key, r) {
  return verb.s.replace('{S}', cap(PRONOUNS[key].nom)).replace('{V}', verb.v[CONJ_INDEX[key]]).replace('{R}', r);
}

function reflCaseReason(verb) {
  return verb.c === 'dat'
    ? `There is already an Akkusativ object (<i>${verb.obj}</i>), so the person goes in Dativ.`
    : 'There is no other Akkusativ object, so the person goes in Akkusativ.';
}

const sichNote = w => w === 'sich' ? ' <small>(sich is always lowercase, even for formal Sie)</small>' : '';

// "Tom wäscht sich" (same person) vs "Tom wäscht ihn" (someone else)
function mirrorAnswer(verb, doer, recv, L) {
  return doer === recv ? REFL[pronKey(doer, L)][verb.c] : PRONOUNS[pronKey(recv, L)][verb.c];
}

function mirrorPic(verb, doer, recv) {
  const self = doer === recv;
  return `<div class="mirror">${personLabel(doer)} <span class="arr">${verb.pic} ${self ? '↩︎' : '➜'}</span> ${self ? '<span class="muted">the same person</span>' : personLabel(recv)}</div>`;
}

function mirrorExplain(verb, doer, recv, L, word) {
  const kd = pronKey(doer, L);
  const self = doer === recv;
  return `<ol>
    <li><b>Who does it?</b> ${personLabel(doer)}: ${relation(doer, L)} → <b>${PRONOUNS[kd].label}</b></li>
    <li><b>Who gets it?</b> ${self
      ? 'the same person → <b>reflexive pronoun</b>'
      : `${personLabel(recv)}, someone else (${relation(recv, L)}) → normal pronoun <b>${PRONOUNS[pronKey(recv, L)].label}</b>`}</li>
    <li><b>Case:</b> ${reflCaseReason(verb)} → ${tag(verb.c)}</li>
    <li>→ ${hl(verb.c, word)}${self ? sichNote(word) : ''}</li>
  </ol>`;
}

function reflTable() {
  return `<div class="tw"><table><thead><tr><th>Person</th><th class="col-akk">reflexive Akk</th><th class="col-dat">reflexive Dat</th><th>normal Akk</th><th>normal Dat</th></tr></thead><tbody>
    ${PRONOUN_KEYS.map(k => `<tr><th>${PRONOUNS[k].label}<span class="sub">${REFL_EN[k]}</span></th>
      <td class="f c-akk ${REFL[k].akk !== PRONOUNS[k].akk ? 'hlcol' : ''}">${REFL[k].akk}</td>
      <td class="f c-dat ${REFL[k].dat !== PRONOUNS[k].dat ? 'hlcol' : ''}">${REFL[k].dat}</td>
      <td class="muted">${PRONOUNS[k].akk}</td><td class="muted">${PRONOUNS[k].dat}</td></tr>`).join('')}
  </tbody></table></div>`;
}

const reflB = { listener: 'anna', doer: 'tom', recv: 'tom', verb: 0 };

function renderReflexive() {
  const isPrep = v => / (auf|für|an|über|um)$/.test(v.inf);
  const verbList = list => `<ul class="vlist">${list.map(v => `<li><b>${v.inf}</b> <small>${v.en}</small></li>`).join('')}</ul>`;

  app.innerHTML = `
  <section class="card">
    <h2>Reflexive pronouns: myself, yourself, himself …</h2>
    <p class="lead">When the action goes <b>back to the person doing it</b>, German uses a reflexive pronoun. For <b>ich, du, wir, ihr</b> it is just the normal pronoun. Only the 3rd person and formal Sie get a new word: <b>sich</b>.</p>
    <div class="mirror-pair">
      <div class="mp"><div class="mpic">🧑 ↩︎</div><div class="sentence">Tom wäscht <b class="c-akk">sich</b>.</div><small>Tom washes himself: same person → reflexive</small></div>
      <div class="mp"><div class="mpic">🧑 ➜ 👶</div><div class="sentence">Tom wäscht <b class="c-akk">es</b>.</div><small>Tom washes the baby: someone else → normal pronoun</small></div>
    </div>
    <h4>All forms <small>(highlighted: where reflexive differs from the normal pronoun)</small></h4>
    ${reflTable()}
  </section>

  <section class="card">
    <h2>Akkusativ or Dativ?</h2>
    <div class="wowohin">
      <div class="ww akk"><div class="big c-akk">One object → Akkusativ</div><p>The person is the only thing the action hits.<br><b>Ich wasche <span class="c-akk">mich</span>.</b><br><b>Du ziehst <span class="c-akk">dich</span> an.</b></p></div>
      <div class="ww dat"><div class="big c-dat">+ a thing → Dativ</div><p>A thing already takes the Akkusativ, so the person moves to Dativ.<br><b>Ich wasche <span class="c-dat">mir</span> die Hände.</b><br><b>Du ziehst <span class="c-dat">dir</span> die Jacke an.</b></p></div>
    </div>
    <p class="muted" style="margin-top:12px">Only <b>ich</b> and <b>du</b> show the difference (mich/mir, dich/dir). All other persons look the same in both cases.</p>
  </section>

  <section class="card">
    <h2>Mirror tool: myself or someone else?</h2>
    <p class="muted">Pick who does it and who gets it. Same person → reflexive. Someone else → normal pronoun, from your point of view.</p>
    <div id="mirrorTool"></div>
  </section>

  <section class="card">
    <h2>Common reflexive verbs</h2>
    <div class="bgrid">
      <div><h4>Akkusativ</h4>${verbList(REFL_VERBS.filter(v => v.c === 'akk' && !isPrep(v)))}</div>
      <div><h4>Akkusativ + preposition</h4>${verbList(REFL_VERBS.filter(v => v.c === 'akk' && isPrep(v)))}</div>
      <div><h4>Dativ (+ a thing in Akk)</h4>${verbList(REFL_VERBS.filter(v => v.c === 'dat'))}</div>
    </div>
    <div class="tips">
      <div class="tip"><b>sich is never capitalised</b><i>Setzen Sie <u>sich</u>!</i> Even with formal Sie, it stays lowercase.</div>
      <div class="tip"><b>Word order</b>The reflexive comes right after the verb or subject: <i>Freust du dich? · Ich habe mich gefreut.</i></div>
      <div class="tip"><b>Commands</b><i>Beeil dich! · Beeilt euch! · Beeilen Sie sich!</i></div>
      <div class="tip"><b>Perfect tense uses haben</b><i>Ich habe mich gewaschen.</i> (not bin)</div>
    </div>
  </section>`;

  drawMirror();
}

function drawMirror() {
  const B = reflB;
  const L = B.listener;
  const pool = poolFor(L);
  if (!pool.includes(B.doer)) B.doer = L;
  if (!pool.includes(B.recv) || (B.recv !== B.doer && overlaps(B.recv, B.doer))) B.recv = B.doer;
  const verb = MIRROR_VERBS[B.verb];
  const kd = pronKey(B.doer, L);
  const word = mirrorAnswer(verb, B.doer, B.recv, L);

  const chips = (key, list) => `<div class="chips">${list.map(([v, l, dis]) => `<button class="chipbtn ${String(B[key]) === String(v) ? 'on' : ''}" data-k="${key}" data-v="${v}" ${dis ? 'disabled' : ''}>${l}</button>`).join('')}</div>`;

  $('#mirrorTool').innerHTML = `
    <div class="ctl-row"><span>You are talking to</span>
      <div class="seg" id="mseg">${Object.keys(LISTENERS).map(k => `<button data-l="${k}" class="${k === L ? 'on' : ''}">${LISTENERS[k].label}</button>`).join('')}</div>
    </div>
    <div class="bgrid">
      <div><h4>Who does it?</h4>${chips('doer', pool.map(p => [p, personLabel(p)]))}</div>
      <div><h4>Who gets it?</h4>${chips('recv', pool.map(p => [p, personLabel(p), p !== B.doer && overlaps(p, B.doer)]))}</div>
      <div><h4>Action</h4>${chips('verb', MIRROR_VERBS.map((v, i) => [i, `${v.pic} ${v.en}`]))}</div>
    </div>
    ${mirrorPic(verb, B.doer, B.recv)}
    <div class="build-out">${reflSentence(verb, kd, hl(verb.c, word))}</div>
    <div class="explain">${mirrorExplain(verb, B.doer, B.recv, L, word)}</div>`;

  $$('#mirrorTool [data-k]').forEach(b => b.addEventListener('click', () => {
    B[b.dataset.k] = b.dataset.k === 'verb' ? +b.dataset.v : b.dataset.v;
    drawMirror();
  }));
  $('#mseg').addEventListener('click', e => {
    const b = e.target.closest('[data-l]');
    if (b) { B.listener = b.dataset.l; drawMirror(); }
  });
}

/* =========================================================
   WO? WOHIN? (two-way prepositions)
   ========================================================= */

// Little picture: a grey reference object and a ball showing the position
function prepSvg(p) {
  const box = (x, y, w, h) => `<rect x="${x}" y="${y}" width="${w}" height="${h}" rx="3" class="pv-box"/>`;
  const ball = (cx, cy, r = 7, extra = '') => `<circle cx="${cx}" cy="${cy}" r="${r}" class="pv-ball" ${extra}/>`;
  const shapes = {
    an: box(78, 6, 10, 68) + ball(70, 40),
    auf: box(35, 42, 50, 30) + ball(60, 34),
    hinter: ball(80, 36, 7, 'opacity=".55"') + box(35, 34, 45, 38),
    in: `<path d="M35 32 V72 H85 V32" class="pv-open"/>` + ball(60, 63),
    neben: box(22, 38, 46, 34) + ball(86, 65),
    über: box(35, 46, 50, 26) + ball(60, 18),
    unter: `<rect x="28" y="26" width="64" height="6" rx="2" class="pv-box"/><line x1="33" y1="32" x2="33" y2="74" class="pv-leg"/><line x1="87" y1="32" x2="87" y2="74" class="pv-leg"/>` + ball(60, 66),
    vor: box(38, 22, 44, 40) + ball(60, 58, 9),
    zwischen: box(12, 40, 30, 32) + box(78, 40, 30, 32) + ball(60, 65),
  };
  return `<svg viewBox="0 0 120 80" class="pv" aria-hidden="true">${shapes[p]}<line x1="4" y1="75" x2="116" y2="75" class="pv-ground"/></svg>`;
}

// "an {der} Wand" → highlight the marked article in the case colour
const markArt = (s, c) => s.replace(/\{(.+?)\}/, `<b class="c-${c}">$1</b>`);

function renderWoWohin() {
  app.innerHTML = `
  <section class="card">
    <h2>Two-way prepositions: Wo? or Wohin?</h2>
    <p class="lead">Nine prepositions can take <b>Dativ or Akkusativ</b>. You decide with one question: is something <b>staying in a place</b> or <b>moving to a place</b>?</p>
    <div class="wowohin">
      <div class="ww dat"><div class="big c-dat">📍 Wo? → Dativ</div><p>Position. Nothing changes place.<br><b>${markArt('Die Katze sitzt auf {dem} Tisch.', 'dat')}</b></p></div>
      <div class="ww akk"><div class="big c-akk">➡️ Wohin? → Akkusativ</div><p>Movement to a new place, a goal.<br><b>${markArt('Die Katze springt auf {den} Tisch.', 'akk')}</b></p></div>
    </div>
  </section>

  <section class="card">
    <h2>The nine prepositions</h2>
    <div class="pgrid9">${TWO_WAY.map(t => `
      <div class="pcard9">
        ${prepSvg(t.p)}
        <div class="pname">${t.p} <small>${t.en}</small></div>
        <div class="pex"><span class="ct ct-dat">Wo?</span> ${markArt(t.wo, 'dat')}</div>
        <div class="pex"><span class="ct ct-akk">Wohin?</span> ${markArt(t.wohin, 'akk')}</div>
      </div>`).join('')}
    </div>
  </section>

  <section class="card">
    <h2>Verb pairs</h2>
    <p class="muted">The verb usually tells you the answer. Putting verbs are movement (Akk), being verbs are position (Dat).</p>
    <div class="tw"><table>
      <thead><tr><th class="col-akk">Wohin? → Akk<span class="sub">movement, an action</span></th><th class="col-dat">Wo? → Dat<span class="sub">position, a state</span></th></tr></thead>
      <tbody>${VERB_PAIRS.map(v => `<tr><td><b>${v.wohin}</b><span class="sub">${markArt(v.wohinEx, 'akk')}</span></td><td><b>${v.wo}</b><span class="sub">${markArt(v.woEx, 'dat')}</span></td></tr>`).join('')}</tbody>
    </table></div>
  </section>

  <section class="card">
    <h2>Short forms</h2>
    <div class="tw"><table>
      <thead><tr><th></th><th class="col-dat">Wo? (Dativ)</th><th class="col-akk">Wohin? (Akkusativ)</th></tr></thead>
      <tbody>
        <tr><th>in</th><td class="f c-dat">im <span class="sub">= in dem · Ich bin im Park.</span></td><td class="f c-akk">ins <span class="sub">= in das · Ich gehe ins Kino.</span></td></tr>
        <tr><th>an</th><td class="f c-dat">am <span class="sub">= an dem · Wir sind am Meer.</span></td><td class="f c-akk">ans <span class="sub">= an das · Wir fahren ans Meer.</span></td></tr>
      </tbody>
    </table></div>
    <p class="muted" style="margin-top:8px">So <b>im / am</b> always mean Wo? and <b>ins / ans</b> always mean Wohin?</p>
  </section>

  <section class="card">
    <h2>Watch out</h2>
    <div class="tips">
      <div class="tip"><b>zu, nach, aus, von, bei are not two-way</b>Always Dativ, even with movement: <i>Ich gehe <u>zum</u> Arzt. Ich fahre <u>zur</u> Arbeit.</i></div>
      <div class="tip"><b>Moving inside a place = Wo?</b><i>Wir laufen <u>im</u> Park</i> (around in it) vs <i>Wir laufen <u>in den</u> Park</i> (into it).</div>
      <div class="tip"><b>ankommen = Wo?</b><i>Wir kommen <u>im</u> Hotel an.</i> You ask where you are when you arrive.</div>
      <div class="tip"><b>Fixed verb + preposition</b>These ignore Wo/Wohin, just learn them: <i>warten auf + Akk, denken an + Akk, Angst haben vor + Dat.</i></div>
      <div class="tip"><b>Time → Dativ</b><i>am Montag, im Juli, vor einer Woche</i> (Wann? → Dativ)</div>
    </div>
  </section>`;
}

// Blank for preposition + article; uses the short form (im, ins, zum …) when there is one
function wwParts(prep, c, g) {
  const art = DEF_ART[c][g];
  const short = CONTRACT[prep] && CONTRACT[prep][art];
  return { art, short, answer: short || art };
}

function wwExercise({ s, q, prep, place, c, qa, qOpts, reason, pairNote }) {
  const { art, short, answer } = wwParts(prep, c, place.g);
  const noun = c === 'dat' && place.dat ? place.dat : place.n;
  const fillB = x => cap(s.replace('{B}', short ? x : `${prep} ${x}`).replace('{N}', noun));
  const qFilled = q.replace(/^\{Q\}/, qa);

  let options = null;
  if (!typeMode()) {
    const arts = ['dem', 'das', 'der', 'die', 'den'];
    options = short
      ? uniq(arts.map(a => (CONTRACT[prep] && CONTRACT[prep][a]) || `${prep} ${a}`)).map(v => ({ v, l: v }))
      : arts.map(v => ({ v, l: v }));
  }
  const check = value => {
    const v = value.trim().replace(/\s+/g, ' ').toLowerCase();
    if (v === answer) return { ok: true };
    if (short && v === `${prep} ${art}`) return { ok: true, note: `Correct, but people almost always say <b>${short}</b>.` };
    return { ok: false };
  };

  return {
    caseKey: c,
    sentence: fillB('<span class="blank">___</span>'),
    steps: [
      { ask: 'First ask the question. Which question word fits?', pre: `<div class="qline">${q.replace('{Q}', '<span class="blank">___</span>')}</div>`,
        options: qOpts.map(v => ({ v, l: v + '?' })), answer: qa, after: `<i>${qFilled}</i>` },
      { ask: short ? `Fill in <b>${prep}</b> + article. Use the short form.` : 'Fill in the article.', options, answer, check },
    ],
    explain: `<ol>
      <li><b>Ask:</b> <i>${qFilled}</i> ${pairNote ? `<small>(${pairNote})</small>` : ''}</li>
      <li><b>Case:</b> ${reason} → ${tag(c)}</li>
      <li><b>Noun:</b> ${GENDERS[place.g].art} ${place.n} → ${GENDERS[place.g].name} → ${hl(c, art)}</li>
      ${short ? `<li><b>Short form:</b> ${prep} + ${art} → ${hl(c, short)}</li>` : ''}
    </ol><div class="full">${fillB(hl(c, answer))}</div>`,
  };
}

/* =========================================================
   DER · DIE · DAS (noun genders)
   ========================================================= */

const GART = { m: 'der', f: 'die', n: 'das', pl: 'die' };
const gTag = (g, text) => `<span class="gt gt-${g}">${text || GART[g]}</span>`;
const ruleExamples = (key, n = 3) => GENDER_NOUNS.filter(x => x.r === key && !x.x).slice(0, n).map(x => `${GART[x.g]} ${x.n}`).join(', ');

function genderExplain(item) {
  if (item.parts) {
    const parts = item.parts.map(([p, g]) => `${p} <small>(${g ? (g === 'pl' ? 'plural' : GART[g]) : 'not a noun'})</small>`).join(' + ');
    return `<b>Compound noun:</b> ${parts}. The <b>last part</b> decides → ${gTag(item.g)}`;
  }
  const rule = GENDER_RULES[item.r];
  if (!rule) return `No ending rule for this one. Just learn it as <b>${GART[item.g]} ${item.n}</b>: say it out loud with the article a few times.`;
  if (item.x) return `⚠️ <b>Exception!</b> Nouns with <b>${rule.label}</b> are ${rule.how} ${gTag(rule.g)}, but it's ${gTag(item.g)} ${item.n}. Learn this one by heart.`;
  return `<b>${rule.label}</b> → ${rule.how} ${gTag(rule.g)}${rule.note ? `<br><small>${rule.note}</small>` : ''}<br><small>More like this: ${ruleExamples(item.r)}</small>`;
}

// Ending checker: known word → compound with a known last part → ending rules
function guessGender(word) {
  const w = word.trim().replace(/^(der|die|das)\s+/i, '');
  if (w.length < 2) return null;
  const lw = w.toLowerCase();
  const name = cap(w);
  const all = GENDER_NOUNS.concat(COMPOUNDS);
  const known = all.find(x => x.n.toLowerCase() === lw);
  if (known) return { g: known.g, name: known.n, html: `✓ In the word list (${known.en}). ${genderExplain(known)}` };

  // Exceptions don't count as a last part: Legende is not a compound of Ende
  const tail = all.filter(x => !x.x && x.n.length >= 3 && lw.length >= x.n.length + 3 && lw.endsWith(x.n.toLowerCase()))
    .sort((a, b) => b.n.length - a.n.length)[0];
  if (tail) return { g: tail.g, name, html: `Looks like a compound ending in <b>${tail.n}</b> (${GART[tail.g]} ${tail.n}). The last part decides.` };

  const byRule = (suffix, key) => {
    const r = GENDER_RULES[key];
    return { g: r.g, name, html: `${suffix ? `Ends in <b>-${suffix}</b>` : 'Starts with <b>Ge-</b>'} → ${r.how} ${gTag(r.g)} <small>(rule: ${r.label})</small>${r.note ? `<br><small>${r.note}</small>` : ''}` };
  };
  const matches = SUFFIX_RULES.filter(([s]) => lw.length > s.length + 1 && lw.endsWith(s));
  // Strong endings (-chen … -ion) beat Ge-; Ge- beats weak endings like -e
  const strong = matches.find(([s]) => SUFFIX_RULES.findIndex(([x]) => x === s) <= 10);
  if (strong) return byRule(...strong);
  if (lw.startsWith('ge') && lw.length > 4) return byRule('', 'ge');
  if (matches.length) return byRule(...matches[0]);
  return { g: null, name, html: 'No ending rule found. Learn this one with its article!' };
}

function renderGenders() {
  const col = g => {
    const rules = Object.keys(GENDER_RULES).filter(k => GENDER_RULES[k].g === g);
    return `<div class="gcol"><div class="ghead gt-${g}">${GART[g]} <small>${GENDERS[g].name}</small></div>
      ${rules.map(k => {
        const r = GENDER_RULES[k];
        const exc = GENDER_NOUNS.filter(x => x.r === k && x.x).map(x => `${GART[x.g]} ${x.n}`).join(', ');
        return `<div class="grule"><div class="glabel">${r.label} <span class="how">${r.how}</span></div>
          <div class="gex">${ruleExamples(k)}</div>${exc ? `<div class="gexc">⚠️ ${exc}</div>` : ''}</div>`;
      }).join('')}</div>`;
  };
  const compCards = COMPOUNDS.slice(0, 6).map(c => `<div class="comp">${c.parts.map(([p, g]) => g ? `${gTag(g, g === 'pl' ? 'die (pl.)' : GART[g])} ${p}` : `<span class="muted">${p}</span>`).join(' + ')} → ${gTag(c.g)} <b>${c.n}</b></div>`).join('');

  app.innerHTML = `
  <section class="card">
    <h2>der · die · das: noun genders</h2>
    <p class="lead">Every German noun is <b>masculine, feminine or neuter</b>, and every case ending in this app depends on it. Always learn a noun <b>with its article</b>. The good news: many endings give the gender away.</p>
    <div class="gcols">${col('m')}${col('f')}${col('n')}</div>
  </section>

  <section class="card">
    <h2>Ending checker</h2>
    <p class="muted">Type any German noun. It checks the word list, then compound parts, then the ending rules.</p>
    <div class="typerow"><input type="text" id="gInput" placeholder="e.g. Zeitung, Häuschen, Küchentür" autocomplete="off" spellcheck="false"></div>
    <div id="gOut" class="gout"><span class="muted">Try: Freundschaft, Kätzchen, Optimismus, Gebirge, Schreibtischlampe …</span></div>
  </section>

  <section class="card">
    <h2>Compound nouns: the last part decides</h2>
    <p class="muted">German glues words together. Only the <b>last</b> word counts for the gender.</p>
    <div class="comps">${compCards}</div>
  </section>

  <section class="card">
    <h2>Tips</h2>
    <div class="tips">
      <div class="tip"><b>Plural is always die</b><i>der Hund → die Hunde, das Kind → die Kinder.</i> (Then the case endings follow the plural column.)</div>
      <div class="tip"><b>People: natural gender, mostly</b><i>der Mann, die Frau</i>, but <i>das Mädchen</i> (-chen) and <i>das Kind</i>.</div>
      <div class="tip"><b>Many common words have no rule</b><i>der Tisch, die Tür, das Haus.</i> Learn them with the article, maybe with a colour or picture for each gender.</div>
      <div class="tip"><b>Rules beat feelings</b>Gender is grammar, not meaning: <i>die Sonne</i> (sun) and <i>der Mond</i> (moon).</div>
    </div>
  </section>`;

  $('#gInput').addEventListener('input', e => {
    const r = guessGender(e.target.value);
    $('#gOut').innerHTML = r
      ? `<div class="build-out">${r.g ? gTag(r.g) : '<span class="gt">???</span>'} ${esc(r.name)}</div><p>${r.html}</p>`
      : '<span class="muted">Type a noun…</span>';
  });
}

/* =========================================================
   RELATIVE CLAUSES
   ========================================================= */

const relNounCase = (x, c) => `${DEF_ART[c][x.g]} ${(c === 'dat' && x.dat) || (c === 'gen' && x.gen) || x.n}`;
const relPick = (v, x) => (Array.isArray(v) ? v[x.g === 'pl' ? 1 : 0] : v);

// One relative-clause sentence: the pronoun, a sentence maker and the "put the noun back in" check sentence
function relBuild(x, cl, main) {
  const pron = REL_PRON[cl.c][x.g];
  const mainTxt = relPick(main.s, x).replace('{X}', relNounCase(x, main.c));
  const qStr = relPick(cl.q, x);
  const X = relNounCase(x, cl.c);
  return {
    pron,
    sentence: r => `${mainTxt} ${relPick(cl.s, x).replace('{R}', r)}.`,
    q: qStr.replace('{X}', hl(cl.c, qStr.startsWith('{X}') ? cap(X) : X)),
  };
}

function relExplain(x, cl, main, b) {
  const special = ['denen', 'dessen', 'deren'].includes(b.pron);
  return `<ol>
    <li><b>Gender / number</b> comes from the noun: ${GART[x.g]} ${x.n} → ${GENDERS[x.g].name}</li>
    <li><b>Case</b> comes from the relative clause. Put the noun back in: <i>${b.q}</i> → ${tag(cl.c)}${cl.prep ? ` <small>(${cl.prep} + ${CASES[cl.c].name})</small>` : ''}</li>
    <li>${GENDERS[x.g].name} + ${CASES[cl.c].name} → <b>${b.pron}</b>${special ? ' <small>(one of the special forms: denen, dessen, deren)</small>' : ''}</li>
    ${main.c !== cl.c ? `<li><small>The main clause says <i>${relNounCase(x, main.c)}</i> (${CASES[main.c].name}), but that doesn't matter: only the relative clause decides the case.</small></li>` : ''}
  </ol>`;
}

function relTable() {
  return `<div class="tw"><table><thead><tr><th></th>${GENDER_KEYS.map(g => `<th>${GENDERS[g].name}</th>`).join('')}</tr></thead><tbody>
    ${CASE_KEYS.map(c => `<tr class="row-${c}"><th>${CASES[c].name}<span class="sub">${CASES[c].q}</span></th>${GENDER_KEYS.map(g => {
      const r = REL_PRON[c][g];
      const differs = r !== DEF_ART[c][g];
      return `<td class="f ${differs ? 'hlcol' : ''}">${r}${differs ? `<span class="sub">article: ${DEF_ART[c][g]}</span>` : ''}</td>`;
    }).join('')}</tr>`).join('')}
  </tbody></table></div>`;
}

const relState = { noun: 'Mann', clause: 0, main: 0 };

function renderRelative() {
  const find = n => REL_NOUNS.find(x => x.n === n);
  const worked = [['Mann', 0, 0], ['Laptop', 4, 0], ['Stadt', 11, 0], ['Kinder', 8, 1], ['Lehrer', 14, 0]].map(([n, ci, mi]) => {
    const x = find(n);
    const b = relBuild(x, REL_CLAUSES[ci], REL_MAINS[mi]);
    return `<div class="relex"><div class="sentence">${b.sentence(hl(REL_CLAUSES[ci].c, b.pron))}</div>${relExplain(x, REL_CLAUSES[ci], REL_MAINS[mi], b)}</div>`;
  }).join('');
  const blocks = list => woBlocks({ prefix: list[0], punct: '.', form: 'rel', cl: {}, chunks: list.slice(1).map(([t, r]) => ({ t, r })) });

  app.innerHTML = `
  <section class="card">
    <h2>Relative clauses: describing a noun</h2>
    <p class="lead">A relative clause adds information about a noun: <i>der Mann, <b>der</b> dort wohnt</i> = the man <b>who</b> lives there. The relative pronoun looks like der / die / das, and it gets its information from <b>two directions</b>:</p>
    <div class="relviz">
      <div><span class="kb">der Mann</span><small>the noun</small></div>
      <div class="relarrow">← gender &amp; number</div>
      <div><span class="kb kb-V">der</span><small>relative pronoun</small></div>
      <div class="relarrow">case →</div>
      <div><span class="kb">dort wohnt</span><small>its own clause</small></div>
    </div>
    <h4>Three steps</h4>
    <ol class="steps">
      <li><b>Find the noun</b> it describes → masculine, feminine, neuter or plural.</li>
      <li><b>Put the noun back into the relative clause</b> as a normal sentence. Its case there is the pronoun's case. <i>(der Mann, den ich kenne ← Ich kenne <u>den Mann</u> → Akkusativ)</i></li>
      <li><b>Pick the form</b> from the table below.</li>
    </ol>
    <h4>Worked examples</h4>
    ${worked}
  </section>

  <section class="card">
    <h2>The relative pronouns</h2>
    <p class="muted">Almost the same as der / die / das. Highlighted: the four forms that are different.</p>
    ${relTable()}
  </section>

  <section class="card">
    <h2>Word order and commas</h2>
    <p class="muted">A relative clause is a Nebensatz: the verb goes to the <b>end</b>, and there are commas around it.</p>
    ${blocks(['Das ist der Mann,', ['der', 'S'], ['dort', 'X'], ['wohnt', 'VE']])}
    ${blocks(['Ich kenne die Frau,', ['mit', 'X'], ['der', 'X'], ['du', 'X'], ['gesprochen', 'E'], ['hast', 'VE']])}
    <div class="tips">
      <div class="tip"><b>Preposition first</b>The preposition comes before the pronoun: <i>die Stadt, <u>in der</u> ich wohne · der Freund, <u>mit dem</u> ich spiele · die Leute, <u>für die</u> ich koche</i>.</div>
      <div class="tip"><b>In the middle of a sentence</b><i>Der Mann<u>, der dort wohnt,</u> ist mein Vater.</i> The relative clause sits right after its noun, with a comma on both sides.</div>
      <div class="tip"><b>Genitiv: whose</b><i>der Mann, <u>dessen</u> Auto rot ist · die Frau, <u>deren</u> Kinder hier spielen</i>. dessen / deren never change.</div>
    </div>
  </section>

  <section class="card">
    <h2>Relative clause builder</h2>
    <p class="muted">Pick a noun, a main clause and a relative clause.</p>
    <div id="relTool"></div>
  </section>

  <section class="card">
    <h2>was and wo</h2>
    <div class="tips">
      <div class="tip"><b>was after alles, nichts, etwas, das</b><i>Alles, <u>was</u> ich weiß · Das ist nichts, <u>was</u> mich stört · Das, <u>was</u> du sagst, stimmt.</i></div>
      <div class="tip"><b>was after a superlative</b><i>Das ist das Beste, <u>was</u> ich je gegessen habe.</i></div>
      <div class="tip"><b>wo for places</b><i>die Stadt, <u>wo</u> ich wohne</i> = die Stadt, in der ich wohne. Both are fine.</div>
      <div class="tip"><b>Not dass!</b><i>das Buch, <u>das</u> ich lese</i> (relative pronoun) vs <i>Ich weiß, <u>dass</u> …</i> (conjunction).</div>
    </div>
  </section>`;

  drawRelTool();
}

function drawRelTool() {
  const st = relState;
  const x = REL_NOUNS.find(n => n.n === st.noun);
  const clauses = REL_CLAUSES.map((c, i) => [i, c]).filter(([, c]) => c.kinds.includes(x.kind));
  if (!clauses.find(([i]) => i === st.clause)) st.clause = clauses[0][0];
  const mains = REL_MAINS.map((m, i) => [i, m]).filter(([, m]) => m.kinds.includes(x.kind));
  if (!mains.find(([i]) => i === st.main)) st.main = mains[0][0];
  const cl = REL_CLAUSES[st.clause];
  const main = REL_MAINS[st.main];
  const b = relBuild(x, cl, main);
  const chips = (key, list) => `<div class="chips">${list.map(([v, l]) => `<button class="chipbtn ${String(st[key]) === String(v) ? 'on' : ''}" data-k="${key}" data-v="${v}">${l}</button>`).join('')}</div>`;
  $('#relTool').innerHTML = `
    <div class="bgrid">
      <div><h4>Noun</h4>${chips('noun', REL_NOUNS.map(n => [n.n, `${GART[n.g]} ${n.n}`]))}</div>
      <div><h4>Main clause</h4>${chips('main', mains.map(([i, m]) => [i, relPick(m.s, x).replace('{X}', '…').replace(',', '')]))}</div>
      <div><h4>Relative clause</h4>${chips('clause', clauses.map(([i, c]) => [i, relPick(c.s, x).replace('{R}', '…')]))}</div>
    </div>
    <div class="build-out">${b.sentence(hl(cl.c, b.pron))}</div>
    <div class="explain">${relExplain(x, cl, main, b)}</div>`;
  $$('#relTool [data-k]').forEach(btn => btn.addEventListener('click', () => {
    st[btn.dataset.k] = btn.dataset.k === 'noun' ? btn.dataset.v : +btn.dataset.v;
    drawRelTool();
  }));
}

/* =========================================================
   PLURALS
   ========================================================= */

const UMLAUT = { a: 'ä', o: 'ö', u: 'ü', A: 'Ä', O: 'Ö', U: 'Ü' };
// Umlaut on the last a/o/u/au (Haus → Häus, Apfel → Äpfel). Only for one-syllable words
// and words ending in -er/-el/-en, where an umlaut plural is realistic.
function umlautStem(w) {
  const syllables = (w.match(/[aeiouäöüy]+/gi) || []).length;
  if (syllables > 1 && !/(er|el|en)$/.test(w)) return null;
  const m = [...w.matchAll(/au|Au|[aouAOU]/g)].pop();
  if (!m || m.index + m[0].length >= w.length || (syllables === 1 && m.index === 0)) return null;
  return w.slice(0, m.index) + UMLAUT[m[0][0]] + w.slice(m.index + 1);
}

// Dictionary notation: der Tag, -e · der Stuhl, ¨-e · das Zimmer, -
function plCode(x) {
  if (x.r === 'latin') return x.pl;
  return (x.pl.startsWith(x.n) ? '' : '¨') + '-' + x.pl.slice(x.n.length);
}

const plDative = x => (/[ns]$/.test(x.pl) ? x.pl : x.pl + 'n');

// Wrong plurals built from the other patterns, only the ones that could look right
function pluralDistractors(x) {
  const w = x.n;
  const u = umlautStem(w);
  let cands;
  if (/e$/.test(w)) cands = [w + 'n', w + 's', w];
  else if (/en$/.test(w)) cands = [w, w + 's', w + 'e', u];
  else if (/(el|er)$/.test(w)) cands = [w, w + 'n', w + 's', u];
  else cands = [w + 'e', w + 'er', w + 'en', w + 's', w, u && u + 'e', u && u + 'er'];
  return shuffle(uniq(cands.filter(Boolean)).filter(c => c !== x.pl)).slice(0, 3);
}

function pluralRuleHtml(x) {
  const r = PLURAL_RULES[x.r];
  if (!r) return 'No rule of thumb for this one: learn it with its plural.';
  return `<b>${r.see}</b> → ${r.how} <b>${r.pl}</b>${r.note ? `<br><small>${r.note}</small>` : ''}`;
}

function renderPlurals() {
  const pairs = list => list.map(x => `${GART[x.g]} ${x.n} → die <b>${x.pl}</b>`).join('<br>');
  const notation = [
    ['-e', 'add -e', 'der Tag, -e → die Tage'], ['¨-e', 'umlaut + -e', 'der Stuhl, ¨-e → die Stühle'],
    ['-er / ¨-er', '(umlaut +) -er', 'das Buch, ¨-er → die Bücher'], ['-n / -en', 'add -(e)n', 'die Frau, -en → die Frauen'],
    ['-s', 'add -s', 'das Auto, -s → die Autos'], ['-', 'no change', 'das Zimmer, - → die Zimmer'], ['¨-', 'umlaut only', 'der Apfel, ¨- → die Äpfel'],
  ];

  app.innerHTML = `
  <section class="card">
    <h2>Plurals</h2>
    <p class="lead">The article is easy: in the plural it is <b>always die</b>. The ending is the tricky part. There are five patterns.</p>
    <div class="tips">${PLURAL_PATTERN_KEYS.map(p => `<div class="tip"><b>${PLURAL_PATTERNS[p].label}</b>${PLURAL_PATTERNS[p].note}<div class="ppex">${pairs(PLURAL_NOUNS.filter(x => x.p === p).slice(0, 4))}</div></div>`).join('')}</div>
  </section>

  <section class="card">
    <h2>Rules of thumb</h2>
    <p class="muted">Look at the gender and the ending of the singular.</p>
    <div class="tw"><table>
      <thead><tr><th>When you see …</th><th>the plural is …</th><th>How sure?</th><th>Examples</th></tr></thead>
      <tbody>${PLURAL_RULE_KEYS.map(k => {
        const r = PLURAL_RULES[k];
        const ex = PLURAL_NOUNS.filter(x => x.r === k).slice(0, 3).map(x => `${x.n} → ${x.pl}`).join(', ');
        return `<tr><th>${r.see}</th><td class="f">${r.pl}</td><td class="muted">${r.how}</td><td>${ex}</td></tr>`;
      }).join('')}</tbody>
    </table></div>
  </section>

  <section class="card">
    <h2>Reading a dictionary</h2>
    <p class="muted">Dictionaries write the plural as a short code after the noun. Learn every noun like this: <b>der Tisch, -e</b>.</p>
    <div class="tw"><table>
      <thead><tr><th>Code</th><th>Means</th><th>Example</th></tr></thead>
      <tbody>${notation.map(([c, m, e]) => `<tr><th>${c}</th><td>${m}</td><td>${e}</td></tr>`).join('')}</tbody>
    </table></div>
  </section>

  <section class="card">
    <h2>Plurals in the four cases</h2>
    <div class="forms4">
      <div class="fcell nom"><div class="lab">Nominativ</div><div class="big">die</div><div class="ex">Die Kinder spielen.</div></div>
      <div class="fcell akk"><div class="lab">Akkusativ</div><div class="big">die</div><div class="ex">Ich sehe die Kinder.</div></div>
      <div class="fcell dat"><div class="lab">Dativ</div><div class="big">den …n</div><div class="ex">Ich spiele mit den Kinder<u>n</u>.</div></div>
      <div class="fcell gen"><div class="lab">Genitiv</div><div class="big">der</div><div class="ex">die Namen der Kinder</div></div>
    </div>
    <div class="tips">
      <div class="tip"><b>Dativ plural: add -n</b><i>mit den Kindern, den Äpfeln, den Tagen</i>, unless the plural already ends in -n or -s: <i>mit den Frauen, den Autos</i>.</div>
      <div class="tip"><b>No article? Same endings</b><i>Ich spiele mit Kindern.</i> The -n stays.</div>
    </div>
  </section>

  <section class="card">
    <h2>All words by pattern</h2>
    <div class="tips">${PLURAL_PATTERN_KEYS.map(p => `<div class="tip"><b>${PLURAL_PATTERNS[p].label}</b><div class="ppex">${PLURAL_NOUNS.filter(x => x.p === p).map(x => `${x.n}, <span class="muted">${plCode(x)}</span>`).join('<br>')}</div></div>`).join('')}</div>
  </section>`;
}

/* =========================================================
   PERFEKT
   ========================================================= */

const auxInf = v => v.aux === 's' ? 'sein' : 'haben';

// Participle split into prefix · ge · stem · ending, for colouring
function ppParts(v) {
  let rest = v.pp;
  let sep = '';
  let ge = '';
  if (v.sep && rest.startsWith(v.sep)) { sep = v.sep; rest = rest.slice(sep.length); }
  if (v.type !== 'insep' && v.type !== 'ieren' && rest.startsWith('ge')) { ge = 'ge'; rest = rest.slice(2); }
  const end = /en$/.test(rest) ? 'en' : /[td]et$/.test(rest) ? 'et' : 't';
  const stem = rest.slice(0, rest.length - end.length);
  return `<span class="pp"><span class="pp-sep">${sep}</span><span class="pp-ge">${ge}</span>${stem}<span class="pp-end">${end}</span></span>`;
}

// Typical wrong participles: regular instead of irregular, ge- in the wrong place …
function ppDistractors(v) {
  const sep = v.sep || '';
  const base = v.inf.replace(/^sich /, '').slice(sep.length);
  const stem = base.replace(/e?n$/, '');
  const noGe = v.type === 'insep' || v.type === 'ieren';
  const ge = noGe ? '' : 'ge';
  const geMistake = noGe ? 'ge' + v.pp : sep ? 'ge' + sep + v.pp.slice(sep.length + 2) : v.pp.replace(/^ge/, '');
  return uniq([sep + ge + stem + (/[td]$/.test(stem) ? 'et' : 't'), sep + ge + stem + 'en', geMistake]).filter(x => x !== v.pp);
}

const perf = { verb: 'gehen' };

function renderPerfekt() {
  const typeCard = t => {
    const ex = PERFEKT_VERBS.filter(v => v.type === t).slice(0, 3);
    return `<div class="tip"><b>${PP_TYPES[t].label}</b>${PP_TYPES[t].rule}<div class="ppex">${ex.map(v => `${v.inf} → ${ppParts(v)}`).join('<br>')}</div></div>`;
  };
  const verbsBy = why => PERFEKT_VERBS.filter(v => v.why === why).map(v => v.inf).join(', ');

  app.innerHTML = `
  <section class="card">
    <h2>Perfekt: talking about the past</h2>
    <p class="lead">In spoken German, the Perfekt is used for almost everything in the past. It has two parts: <b>haben or sein</b> in position 2, and the <b>participle</b> at the very end.</p>
    <div class="klammer">
      <div><span class="kb">Ich</span><small>position 1</small></div>
      <div><span class="kb kb-aux">habe</span><small>2: haben / sein</small></div>
      <div><span class="kb kb-mid">gestern einen Film</span><small>everything else</small></div>
      <div><span class="kb kb-pp">gesehen</span><small>end: participle</small></div>
    </div>
    <div class="klammer">
      <div><span class="kb kb-aux">Bist</span><small>question: verb first</small></div>
      <div><span class="kb">du</span><small></small></div>
      <div><span class="kb kb-mid">gestern ins Kino</span><small></small></div>
      <div><span class="kb kb-pp">gegangen</span><small>still at the end</small></div>
    </div>
  </section>

  <section class="card">
    <h2>haben or sein?</h2>
    <p class="muted">Most verbs take haben. Learn the three groups that take sein:</p>
    <div class="wowohin">
      <div class="ww akk"><div class="big">🚶 Movement A → B</div><p>→ <b>sein</b><br><small>${verbsBy('move')}</small></p></div>
      <div class="ww akk"><div class="big">🔄 Change of state</div><p>→ <b>sein</b><br><small>${verbsBy('change')}</small></p></div>
      <div class="ww akk"><div class="big">🧍 sein &amp; bleiben</div><p>→ <b>sein</b><br><small>${verbsBy('stay')}</small></p></div>
      <div class="ww dat"><div class="big">✋ Everything else</div><p>→ <b>haben</b><br><small>All verbs with an Akkusativ object, all reflexive verbs, and verbs like schlafen, arbeiten, wohnen, warten.</small></p></div>
    </div>
    <div class="tips">
      <div class="tip"><b>An Akkusativ object means haben</b><i>Ich <u>bin</u> nach Berlin gefahren</i> (movement) vs <i>Ich <u>habe</u> das Auto gefahren</i> (I drove the car: Akk object).</div>
      <div class="tip"><b>schlafen vs einschlafen</b><i>Ich habe gut geschlafen</i> (no change) vs <i>Ich bin sofort eingeschlafen</i> (change: awake → asleep).</div>
      <div class="tip"><b>tanzen, schwimmen …</b>Moving around in one place = haben (<i>Wir haben getanzt</i>). Going somewhere = sein (<i>Ich bin über den See geschwommen</i>).</div>
    </div>
  </section>

  <section class="card">
    <h2>Building the participle</h2>
    <div class="legend"><span class="pp"><span class="pp-sep">prefix</span></span><span class="pp"><span class="pp-ge">ge</span></span><span>stem</span><span class="pp"><span class="pp-end">ending</span></span></div>
    <div class="tips">${PP_TYPE_KEYS.map(typeCard).join('')}</div>
  </section>

  <section class="card">
    <h2>Participle builder</h2>
    <p class="muted">Pick a verb to see its participle, haben or sein, and every form.</p>
    <div id="perfBuilder"></div>
  </section>`;

  drawPerfBuilder();
}

function drawPerfBuilder() {
  const v = PERFEKT_VERBS.find(x => x.inf === perf.verb) || PERFEKT_VERBS[0];
  const rows = ['ich', 'du', 'er', 'wir', 'ihr', 'siePl', 'Sie'].map(k => {
    const label = k === 'er' ? 'er / sie / es' : PRONOUNS[k].label;
    return `<tr><th>${label}</th><td>${CONJ[auxInf(v)][k]} ${v.refl ? REFL[k].akk + ' ' : ''}… <b>${v.pp}</b></td></tr>`;
  }).join('');
  $('#perfBuilder').innerHTML = `
    ${PP_TYPE_KEYS.map(t => `<h4>${PP_TYPES[t].label}</h4><div class="chips">${PERFEKT_VERBS.filter(x => x.type === t).map(x => `<button class="chipbtn ${x === v ? 'on' : ''}" data-verb="${x.inf}">${x.inf}</button>`).join('')}</div>`).join('')}
    <div class="build-out">${v.inf} → ${ppParts(v)}</div>
    <p><b>${auxInf(v)}</b>: ${AUX_WHY[v.why]}. <b>${PP_TYPES[v.type].label}</b>: ${PP_TYPES[v.type].rule}${v.note ? `<br><small>${v.note}</small>` : ''}</p>
    <div class="tw"><table><tbody>${rows}</tbody></table></div>
    <p class="muted" style="margin-top:8px">Example: ${v.s.replace('{S}', 'Ich').replace('{AUX}', `<b>${CONJ[auxInf(v)].ich}</b>`).replace('{R}', v.refl ? 'mich' : '').replace('{PP}', `<b>${v.pp}</b>`)}</p>`;
  $$('#perfBuilder [data-verb]').forEach(b => b.addEventListener('click', () => { perf.verb = b.dataset.verb; drawPerfBuilder(); }));
}

/* =========================================================
   WORD ORDER
   ========================================================= */

// sub = weak-spot topic
const WO_FORMS = {
  svo: { label: 'statement', sub: 'main' },
  time: { label: 'start with the time', sub: 'main' },
  modal: { label: '+ modal verb', sub: 'main' },
  perf: { label: 'Perfekt', sub: 'main' },
  yn: { label: 'yes/no question', sub: 'question' },
  wq: { label: 'W-question', sub: 'question' },
  sub: { label: 'weil / dass / ob …', sub: 'sub' },
  subModal: { label: 'weil … + modal', sub: 'sub' },
  subPerf: { label: 'weil … + Perfekt', sub: 'sub' },
  zero: { label: 'aber / denn / und', sub: 'conj0' },
  first: { label: 'clause first', sub: 'sub' },
  adv: { label: 'deshalb / trotzdem …', sub: 'adv' },
};

const WO_WHY = {
  svo: 'The conjugated verb is always in <b>position 2</b>. In the middle, time usually comes before the object or place.',
  time: 'Something other than the subject is in position 1, so the subject moves <b>behind the verb</b>. The verb stays in position 2.',
  modal: 'The modal verb is conjugated in position 2. The main verb goes to the end as an <b>infinitive</b>.',
  perf: 'haben / sein in position 2, the <b>participle</b> at the end.',
  yn: 'Yes/no question: the verb comes <b>first</b>.',
  wq: 'W-question: question word in position 1, verb in <b>position 2</b>, then the subject.',
  sub: '<b>{c}</b> sends the conjugated verb to the <b>very end</b>. A separable verb joins back together there.',
  subModal: '<b>{c}</b> sends the conjugated verb (the modal) to the very end, after the infinitive.',
  subPerf: '<b>{c}</b> sends haben / sein to the very end, after the participle.',
  zero: '<b>{c}</b> is "position 0" (und, aber, oder, denn, sondern). It changes nothing: normal order follows.',
  first: 'The whole clause before the comma is position 1, so the verb comes <b>right after the comma</b>: verb, comma, verb.',
  adv: '<b>{c}</b> is a connecting adverb: it takes <b>position 1</b> itself, so the verb comes right after it, then the subject.',
  jeDesto: '<b>je</b> works like weil: its verb goes to the <b>end</b>. <b>desto</b> + comparative is position 1 of the second part, so its verb comes <b>right after</b> it.',
};

// Chunk roles: S subject · V conjugated verb (position 1/2) · VE conjugated verb at the end · E other end part · X anything else
function woBuild(cl, subj, form, opts = {}) {
  const i = CONJ_INDEX[subj.k];
  const verb = cl.forms[i];
  const S = { t: subj.w, r: 'S' };
  const X = t => ({ t, r: 'X' });
  const rest = cl.rest ? [X(cl.rest)] : [];
  const sepEnd = cl.sep ? [{ t: cl.sep, r: 'E' }] : [];
  const modal = WO_MODALS[opts.modal || 'müssen'][i];
  const aux = CONJ[cl.aux === 's' ? 'sein' : 'haben'][subj.k];
  const intro = opts.intro || WO_SUB_INTROS[0];
  const adv = opts.adv || WO_ADV_INTROS[0];
  const zero = opts.zero || WO_ZERO_INTROS[0];
  const shapes = {
    svo: () => ({ chunks: [S, { t: verb, r: 'V' }, X(cl.time), ...rest, ...sepEnd] }),
    time: () => ({ chunks: [X(cl.time), { t: verb, r: 'V' }, S, ...rest, ...sepEnd] }),
    modal: () => ({ chunks: [S, { t: modal, r: 'V' }, X(cl.time), ...rest, { t: cl.inf, r: 'E' }] }),
    perf: () => ({ chunks: [S, { t: aux, r: 'V' }, X(cl.past), ...rest, { t: cl.pp, r: 'E' }] }),
    yn: () => ({ chunks: [{ t: verb, r: 'V' }, S, X(cl.time), ...rest, ...sepEnd], punct: '?' }),
    wq: () => ({ chunks: [X('wann'), { t: verb, r: 'V' }, S, ...rest, ...sepEnd], punct: '?' }),
    sub: () => ({ prefix: `${intro.p} ${intro.c}`, conj: intro.c, chunks: [S, X(cl.time), ...rest, { t: (cl.sep || '') + verb, r: 'VE' }] }),
    subModal: () => ({ prefix: `${intro.p} ${intro.c}`, conj: intro.c, chunks: [S, X(cl.time), ...rest, { t: cl.inf, r: 'E' }, { t: modal, r: 'VE' }] }),
    subPerf: () => ({ prefix: `${intro.p} ${intro.c}`, conj: intro.c, chunks: [S, X(cl.past), ...rest, { t: cl.pp, r: 'E' }, { t: aux, r: 'VE' }] }),
    zero: () => ({ prefix: `${zero.p} ${zero.c}`, conj: zero.c, chunks: [S, { t: verb, r: 'V' }, X(cl.time), ...rest, ...sepEnd] }),
    first: () => ({ prefix: opts.first || WO_FIRST_INTROS[0], chunks: [{ t: verb, r: 'V' }, S, X(cl.time), ...rest, ...sepEnd] }),
    adv: () => ({ prefix: `${adv.p} ${adv.c}`, conj: adv.c, chunks: [{ t: verb, r: 'V' }, S, X(cl.time), ...rest, ...sepEnd] }),
  };
  return Object.assign({ prefix: '', punct: '.', form, cl }, shapes[form]());
}

const woWord = (b, n) => (n === 0 && !b.prefix ? cap(b.chunks[n].t) : b.chunks[n].t);
const woText = b => `${b.prefix ? b.prefix + ' ' : ''}${b.chunks.map((c, n) => woWord(b, n) + (c.comma ? ',' : '')).join(' ')}${b.punct}`;

// je … desto sentences are fixed, not built from a clause
function jeDestoBuild(item) {
  const chunks = item.map(([t, r]) => ({ t, r }));
  chunks[chunks.findIndex(c => c.r === 'VE')].comma = true;
  return { prefix: '', punct: '.', form: 'jeDesto', cl: {}, chunks };
}

const fillGap = (s, html) => s.replace('___', html);

// Practice: the missing half of entweder … oder, weder … noch …
function woPair() {
  const it = rnd(CONNECTOR_PAIRS);
  const fmt = w => (it.s.startsWith('___') ? cap(w) : w);
  const others = shuffle(CONNECTOR_PAIR_WORDS.filter(w => w !== it.a.toLowerCase())).slice(0, 3);
  return {
    sub: 'conj2',
    hint: 'Two-part connector: find the missing half.',
    sentence: fillGap(it.s, '<span class="blank">___</span>'),
    steps: [{ ask: 'Which word completes the pair?', options: shuffle([it.a.toLowerCase(), ...others]).map(w => ({ v: fmt(w), l: fmt(w) })), answer: it.a }],
    explain: `<b>${it.pair}</b> = ${it.en}<div class="full">${fillGap(it.s, `<b>${it.a}</b>`)}</div>`,
  };
}

const CONN_TYPE_TEXT = {
  zero: 'needs normal order after it: subject, then verb (position 0)',
  adv: 'needs the verb right after it (it takes position 1 itself)',
  sub: 'needs the verb at the very end (Nebensatz)',
};

// Practice: same meaning, three word orders; the verb position picks the connector
function woPick() {
  const g = rnd(CONNECTOR_PICK);
  const it = rnd(g.items);
  const fmt = w => (it.s.startsWith('___') ? cap(w) : w);
  return {
    sub: 'adv',
    hint: 'Same meaning, different word order. Look at where the verb is after the gap.',
    sentence: fillGap(it.s, '<span class="blank">___</span>'),
    steps: [{ ask: 'Which connector fits this word order?', options: g.opts.map(w => ({ v: w, l: fmt(w) })), answer: it.a }],
    explain: `<ul class="connlist">${g.opts.map(w => `<li>${w === it.a ? '✓' : '✗'} <b>${w}</b> ${CONN_TYPE_TEXT[CONNECTOR_TYPE[w]]}</li>`).join('')}</ul>
      <div class="full">${fillGap(it.s, `<b>${fmt(it.a)}</b>`)}</div>`,
  };
}

function woWhy(b) {
  let why = WO_WHY[b.form].replace('{c}', b.conj || '');
  if (b.cl.sep && ['svo', 'time', 'yn', 'wq', 'zero', 'first'].includes(b.form)) why += ` Separable verb: the prefix <b>${b.cl.sep}</b> goes to the very end.`;
  return why;
}

function woBlocks(b) {
  const label = (c, n) => ({
    S: 'subject',
    V: n === 0 && !b.prefix ? 'verb: position 1' : 'verb: position 2',
    VE: 'verb at the end',
    E: 'end',
  }[c.r] || '');
  return `<div class="klammer">${b.prefix ? `<div><span class="kb kb-pre">${b.prefix}</span><small>${b.form === 'first' ? 'position 1' : ''}</small></div>` : ''}
    ${b.chunks.map((c, n) => `<div><span class="kb kb-${c.r}">${woWord(b, n)}${c.comma ? ',' : ''}</span><small>${label(c, n)}</small></div>`).join('')}
    <div><span class="kb kb-punct">${b.punct}</span><small></small></div></div>`;
}

const woState = { verb: 'aufstehen', subj: 'ich', form: 'svo' };

function renderWordOrder() {
  const lern = WO_CLAUSES.find(c => c.inf === 'lernen');
  const auf = WO_CLAUSES.find(c => c.inf === 'aufstehen');
  const fahr = WO_CLAUSES.find(c => c.inf === 'fahren');
  const ich = WO_SUBJECTS[0];
  const du = WO_SUBJECTS[1];
  const ex = (cl, s, form, opts) => woBlocks(woBuild(cl, s, form, opts));
  const objFirst = { prefix: '', punct: '.', form: 'time', chunks: [{ t: 'Deutsch', r: 'X' }, { t: 'lerne', r: 'V' }, { t: 'ich', r: 'S' }, { t: 'heute', r: 'X' }] };

  app.innerHTML = `
  <section class="card">
    <h2>Word order</h2>
    <p class="lead">Rule number one: in a normal sentence the conjugated verb is <b>always in position 2</b>. A position is a block, not a word: <i>am Samstag</i> or <i>meine Eltern</i> count as one.</p>
    ${ex(lern, ich, 'svo')}
    ${ex(lern, ich, 'time')}
    ${woBlocks(objFirst)}
    <p class="muted">Whatever comes first, the verb stays second. If the subject isn't first, it moves right behind the verb.</p>
  </section>

  <section class="card">
    <h2>The verb bracket</h2>
    <p class="muted">When the verb has two parts, the second part goes to the <b>very end</b>.</p>
    <h4>Separable verb</h4>${ex(auf, ich, 'svo')}
    <h4>Modal verb + infinitive</h4>${ex(fahr, ich, 'modal', { modal: 'müssen' })}
    <h4>Perfekt: haben / sein + participle</h4>${ex(fahr, ich, 'perf')}
  </section>

  <section class="card">
    <h2>Questions</h2>
    <h4>Yes/no question: verb first</h4>${ex(fahr, du, 'yn')}
    <h4>W-question: question word, then verb</h4>${ex(fahr, du, 'wq')}
  </section>

  <section class="card">
    <h2>Connecting sentences</h2>
    <p class="muted">Every connecting word belongs to one of three groups. The group decides where the verb goes.</p>
    <div class="conn3">
      <div class="ww dat"><div class="big">1 · Position 0</div><p>Nothing changes: subject, verb …<br><b>${WO_ZERO_CONJ.join(', ')}</b></p></div>
      <div class="ww gen3"><div class="big">2 · Verb right after</div><p>The word itself is position 1, so the verb comes next.<br><b>${WO_ADV_CONJ.map(a => a[0]).join(', ')}</b></p></div>
      <div class="ww akk"><div class="big">3 · Verb to the end</div><p>Subordinate clause (Nebensatz), always with a comma.<br><b>${WO_SUB_CONJ.join(', ')}</b></p></div>
    </div>
    <h4>1 · aber: normal order</h4>${ex(lern, ich, 'zero', { zero: WO_ZERO_INTROS[0] })}
    <h4>2 · trotzdem: verb right after</h4>${ex(lern, ich, 'adv', { adv: WO_ADV_INTROS[2] })}
    <h4>2 · deshalb: verb right after</h4>${ex(fahr, ich, 'adv', { adv: WO_ADV_INTROS[0] })}
    <h4>3 · weil: verb at the end</h4>${ex(lern, ich, 'sub', { intro: WO_SUB_INTROS[0] })}
    <h4>3 · Separable verbs join back together</h4>${ex(auf, ich, 'sub', { intro: WO_SUB_INTROS[0] })}
    <h4>3 · Two verbs: the conjugated one is last</h4>${ex(fahr, ich, 'subModal', { intro: WO_SUB_INTROS[1], modal: 'müssen' })}${ex(fahr, ich, 'subPerf', { intro: WO_SUB_INTROS[1] })}
    <h4>3 · Nebensatz first: verb, comma, verb</h4>${ex(lern, ich, 'first', { first: WO_FIRST_INTROS[0] })}
  </section>

  <section class="card">
    <h2>Same meaning, three word orders</h2>
    <p class="muted">These say the same thing. Only the verb position changes.</p>
    <div class="tw"><table>
      <thead><tr><th></th><th>1 · Position 0</th><th>2 · Verb right after</th><th>3 · Verb to the end</th></tr></thead>
      <tbody>
        <tr><th>reason</th><td>…, <b>denn</b> ich <u>bin</u> krank.</td><td>Ich bin krank, <b>deshalb</b> <u>bleibe</u> ich zu Hause.</td><td>…, <b>weil</b> ich krank <u>bin</u>.</td></tr>
        <tr><th>contrast</th><td>Es regnet, <b>aber</b> ich <u>gehe</u> raus.</td><td>Es regnet, <b>trotzdem</b> <u>gehe</u> ich raus.</td><td>Ich gehe raus, <b>obwohl</b> es <u>regnet</u>.</td></tr>
        <tr><th>time</th><td>Ich esse, <b>und</b> ich <u>gehe</u> dann.</td><td>Ich esse, <b>dann</b> <u>gehe</u> ich.</td><td>Ich esse, <b>bevor</b> ich <u>gehe</u>.</td></tr>
        <tr><th>condition</th><td>Beeil dich, <b>oder</b> du <u>verpasst</u> den Zug.</td><td>Beeil dich, <b>sonst</b> <u>verpasst</u> du den Zug.</td><td><b>Wenn</b> du dich nicht <u>beeilst</u>, …</td></tr>
      </tbody>
    </table></div>
    <h4>Connecting adverbs and their meaning</h4>
    <div class="chips">${WO_ADV_CONJ.map(([w, en]) => `<span class="pill"><b>${w}</b> · ${en}</span>`).join('')}</div>
    <p class="muted">Tip: connecting adverbs can also stand in the middle: <i>Es regnet. Ich gehe <u>trotzdem</u> raus.</i> Then the subject keeps position 1.</p>
  </section>

  <section class="card">
    <h2>Two-part connectors</h2>
    <h4>je … desto: the more …, the more …</h4>
    ${woBlocks(jeDestoBuild(JE_DESTO[0]))}
    ${woBlocks(jeDestoBuild(JE_DESTO[4]))}
    <p class="muted">The je-part works like a weil-clause (verb at the end). The desto-part starts with desto + comparative, then comes the verb.</p>
    <div class="tw"><table>
      <thead><tr><th>Pair</th><th>Meaning</th><th>Example</th></tr></thead>
      <tbody>
        <tr><th>entweder … oder</th><td>either … or</td><td>Wir fahren <b>entweder</b> ans Meer <b>oder</b> in die Berge.</td></tr>
        <tr><th>weder … noch</th><td>neither … nor</td><td>Ich trinke <b>weder</b> Kaffee <b>noch</b> Tee.</td></tr>
        <tr><th>sowohl … als auch</th><td>both … and</td><td>Sie spricht <b>sowohl</b> Deutsch <b>als auch</b> Englisch.</td></tr>
        <tr><th>nicht nur … sondern auch</th><td>not only … but also</td><td>Er ist <b>nicht nur</b> nett, <b>sondern auch</b> lustig.</td></tr>
        <tr><th>zwar … aber</th><td>admittedly … but</td><td>Das Auto ist <b>zwar</b> alt, <b>aber</b> es fährt noch gut.</td></tr>
        <tr><th>je … desto</th><td>the more … the more</td><td><b>Je</b> mehr ich übe, <b>desto</b> besser werde ich.</td></tr>
      </tbody>
    </table></div>
  </section>

  <section class="card">
    <h2>Sentence transformer</h2>
    <p class="muted">Pick a verb, a subject and a sentence shape. Watch the blocks move.</p>
    <div id="woTool"></div>
  </section>

  <section class="card">
    <h2>Tips</h2>
    <div class="tips">
      <div class="tip"><b>weil vs denn</b>Same meaning, different order: <i>…, weil ich müde <u>bin</u></i> vs <i>…, denn ich <u>bin</u> müde</i>.</div>
      <div class="tip"><b>The middle: TeKaMoLo</b>Time, cause (Kausal), manner (Modal), place (Lokal): <i>Ich fahre <u>morgen</u> <u>wegen der Arbeit</u> <u>mit dem Zug</u> <u>nach Berlin</u>.</i></div>
      <div class="tip"><b>Always a comma</b>before weil, dass, ob, wenn … Never before und / oder joining two short parts.</div>
    </div>
  </section>`;

  drawWoTool();
}

function drawWoTool() {
  const st = woState;
  const cl = WO_CLAUSES.find(c => c.inf === st.verb);
  const subj = WO_SUBJECTS.concat(WO_SUBJECTS_Q).find(s => s.w === st.subj);
  const b = woBuild(cl, subj, st.form);
  const chips = (key, list) => `<div class="chips">${list.map(([v, l]) => `<button class="chipbtn ${st[key] === v ? 'on' : ''}" data-k="${key}" data-v="${v}">${l}</button>`).join('')}</div>`;
  $('#woTool').innerHTML = `
    <div class="bgrid">
      <div><h4>Verb</h4>${chips('verb', WO_CLAUSES.map(c => [c.inf, c.inf]))}</div>
      <div><h4>Subject</h4>${chips('subj', uniq(WO_SUBJECTS.concat(WO_SUBJECTS_Q).map(s => s.w)).map(w => [w, w]))}</div>
      <div><h4>Shape</h4>${chips('form', Object.keys(WO_FORMS).map(f => [f, WO_FORMS[f].label]))}</div>
    </div>
    ${woBlocks(b)}
    <p>${woWhy(b)}</p>`;
  $$('#woTool [data-k]').forEach(btn => btn.addEventListener('click', () => { st[btn.dataset.k] = btn.dataset.v; drawWoTool(); }));
}

/* =========================================================
   PRÄTERITUM
   ========================================================= */

// The Perfekt verbs (their sentences turned into Präteritum) + haben and the modal verbs
const PRAET_VERBS = PERFEKT_VERBS.map(v => {
  const [p, t, g] = PRAET_FORMS[v.inf];
  return { inf: v.inf, en: v.en, p, t, g, sep: v.sep, refl: v.refl, perf: v,
    s: v.s.replace('{AUX}', '{V}').replace(' {PP}', v.sep ? ' ' + v.sep : '') };
}).concat(PRAET_EXTRA);

const PRAET_KEYS = ['ich', 'du', 'er', 'wir', 'ihr', 'siePl'];
const PRAET_KEY_LABEL = { ich: 'ich', du: 'du', er: 'er / sie / es', wir: 'wir', ihr: 'ihr', siePl: 'sie / Sie' };
const praetSub = v => ({ w: 'regular', s: 'irregular', m: 'irregular', mod: 'modal', aux: 'modal' }[v.t]);
// Perfekt of the extra verbs, for the table
const PRAET_EXTRA_PERF = { haben: 'hat gehabt', können: 'hat gekonnt', müssen: 'hat gemusst', wollen: 'hat gewollt', dürfen: 'hat gedurft', sollen: 'hat gesollt', mögen: 'hat gemocht' };

// Stems ending in -e take -st, -n, -t (machte → machtest); others take -st/-est, -en, -t/-et (ging → gingst, las → lasest)
function praetForm(v, key) {
  const i = CONJ_INDEX[key];
  if (v.p.endsWith('e')) return v.p + ['', 'st', '', 'n', 't', 'n'][i];
  const du = /[sßzdt]$/.test(v.p) ? 'est' : 'st';
  const ihr = /[dt]$/.test(v.p) ? 'et' : 't';
  return v.p + ['', du, '', 'en', ihr, 'en'][i];
}
const praetHl = (v, key) => { const f = praetForm(v, key); return `${v.p}<span class="end">${f.slice(v.p.length)}</span>`; };
const praetSentence = (v, key, word) => v.s.replace('{S}', cap(PRONOUNS[key].nom)).replace('{V}', word).replace('{R}', v.refl ? REFL[key].akk : '');
const perfSentence = (v, key) => (v.perf
  ? v.perf.s.replace('{S}', cap(PRONOUNS[key].nom)).replace('{AUX}', CONJ[auxInf(v.perf)][key]).replace('{R}', v.refl ? REFL[key].akk : '').replace('{PP}', v.perf.pp)
  : '');
const umlautForm = f => f.replace(/[ou]/, ch => ({ o: 'ö', u: 'ü' }[ch]));

// Typical wrong answers: another person's ending, regular -te for irregular verbs, könnte, present tense
function praetDistractors(v, key) {
  const form = praetForm(v, key);
  const i = CONJ_INDEX[key];
  const stem = v.inf.replace(/^sich /, '').slice((v.sep || '').length).replace(/e?n$/, '');
  const out = [praetForm(v, i === 0 || i === 2 ? 'wir' : 'ich')];
  if (v.t !== 'w' && v.inf !== 'sein' && v.inf !== 'werden') out.push(praetForm({ p: stem + (/[td]$/.test(stem) ? 'ete' : 'te') }, key));
  if (v.t === 'mod' && /[äöü]/.test(v.inf)) out.push(umlautForm(form));
  if (v.t === 'aux') out.push(PRESENT_AUX[v.inf][i]);
  else out.push(stem + (/[td]$/.test(stem) ? ['e', 'est', 'et', 'en', 'et', 'en'] : ['e', /[sßz]$/.test(stem) ? 't' : 'st', 't', 'en', 't', 'en'])[i]);
  return uniq(out).filter(x => x !== form).slice(0, 3);
}
// Present tense of sein / haben / werden, as distractors
const PRESENT_AUX = {
  sein: ['bin', 'bist', 'ist', 'sind', 'seid', 'sind'],
  haben: ['habe', 'hast', 'hat', 'haben', 'habt', 'haben'],
  werden: ['werde', 'wirst', 'wird', 'werden', 'werdet', 'werden'],
};

const praetState = { verb: 'gehen' };

function renderPraeteritum() {
  const find = inf => PRAET_VERBS.find(v => v.inf === inf);
  const sample = ['machen', 'arbeiten', 'gehen', 'sein', 'haben', 'können', 'bringen'].map(find);
  const groups = Object.keys(PRAET_GROUPS).map(g => `<div class="tip"><b>${PRAET_GROUPS[g]}</b>${PRAET_VERBS.filter(v => v.g === g && !v.sep).map(v => `${v.inf} → ${v.p}`).join('<br>')}</div>`).join('');

  app.innerHTML = `
  <section class="card">
    <h2>Präteritum: the written past</h2>
    <p class="lead">German has two past tenses that mean the same thing. Which one you use depends on <b>speaking or writing</b>.</p>
    <div class="wowohin">
      <div class="ww dat"><div class="big">🗣️ Speaking → Perfekt</div><p><i>Gestern <b>bin</b> ich ins Kino <b>gegangen</b>.</i></p></div>
      <div class="ww akk"><div class="big">📖 Writing → Präteritum</div><p>Stories, books, news: <i>Gestern <b>ging</b> ich ins Kino.</i></p></div>
    </div>
    <div class="tips">
      <div class="tip"><b>The exception: use these in speech too</b><i>war, hatte, wurde</i>, the modal verbs (<i>konnte, musste, wollte, durfte, sollte, mochte</i>), <i>wusste</i> and <i>es gab</i>. Nobody says “ich bin gewesen” half as often as “ich war”.</div>
    </div>
  </section>

  <section class="card">
    <h2>The endings</h2>
    <p class="muted"><b>ich</b> and <b>er / sie / es</b> are always the same and have no ending (highlighted rows).</p>
    <div class="tw"><table><thead><tr><th></th>${sample.map(v => `<th>${v.inf}<span class="sub">${PRAET_TYPES[v.t].label}</span></th>`).join('')}</tr></thead><tbody>
      ${PRAET_KEYS.map(k => `<tr class="${k === 'ich' || k === 'er' ? 'same' : ''}"><th>${PRAET_KEY_LABEL[k]}</th>${sample.map(v => `<td class="f">${praetHl(v, k)}</td>`).join('')}</tr>`).join('')}
    </tbody></table></div>
  </section>

  <section class="card">
    <h2>Five kinds of verbs</h2>
    <div class="tips">${Object.keys(PRAET_TYPES).map(t => `<div class="tip"><b>${PRAET_TYPES[t].label}</b>${PRAET_TYPES[t].rule}</div>`).join('')}</div>
  </section>

  <section class="card">
    <h2>Irregular verbs: sort them by the new vowel</h2>
    <p class="muted">Most irregular verbs change their vowel to a. Learning them in groups helps.</p>
    <div class="tips">${groups}</div>
  </section>

  <section class="card">
    <h2>Verb builder</h2>
    <p class="muted">Pick a verb: every Präteritum form next to the spoken Perfekt.</p>
    <div id="praetBuilder"></div>
  </section>

  <section class="card">
    <h2>Tips</h2>
    <div class="tips">
      <div class="tip"><b>Separable verbs split, like in the present</b><i>Ich stand um 7 Uhr <u>auf</u>. Sie rief mich <u>an</u>.</i></div>
      <div class="tip"><b>konnte or könnte?</b><i>konnte</i> = could (past). <i>könnte</i> (umlaut) = could / would be able (Konjunktiv II). Same for musste / müsste, durfte / dürfte.</div>
      <div class="tip"><b>es gab = there was / there were</b><i>Früher gab es hier einen Park.</i></div>
      <div class="tip"><b>Fairy tales</b><i>Es war einmal …</i> = Once upon a time … All in Präteritum.</div>
    </div>
  </section>`;

  drawPraetBuilder();
}

function drawPraetBuilder() {
  const v = PRAET_VERBS.find(x => x.inf === praetState.verb) || PRAET_VERBS[0];
  const typeKeys = ['aux', 'mod', 'w', 's', 'm'];
  $('#praetBuilder').innerHTML = `
    ${typeKeys.map(t => `<h4>${PRAET_TYPES[t].label}</h4><div class="chips">${PRAET_VERBS.filter(x => x.t === t).map(x => `<button class="chipbtn ${x === v ? 'on' : ''}" data-verb="${x.inf}">${x.inf}</button>`).join('')}</div>`).join('')}
    <div class="build-out">${v.inf} → ${v.p}${v.sep ? ` … ${v.sep}` : ''}</div>
    <p><b>${PRAET_TYPES[v.t].label}</b>: ${PRAET_TYPES[v.t].rule}${v.g ? ` · vowel group <b>${PRAET_GROUPS[v.g]}</b>` : ''}</p>
    <div class="tw"><table>
      <thead><tr><th></th><th>Präteritum (written)</th><th>Perfekt (spoken)</th></tr></thead>
      <tbody>${PRAET_KEYS.map(k => `<tr class="${k === 'ich' || k === 'er' ? 'same' : ''}"><th>${PRAET_KEY_LABEL[k]}</th>
        <td class="f">${praetHl(v, k)}${v.sep ? ` … ${v.sep}` : ''}</td>
        <td>${v.perf ? `${CONJ[auxInf(v.perf)][k]} ${v.refl ? REFL[k].akk + ' ' : ''}… ${v.perf.pp}` : '<span class="muted">mostly Präteritum</span>'}</td></tr>`).join('')}</tbody>
    </table></div>
    <p class="muted" style="margin-top:8px">Example: ${praetSentence(v, 'ich', `<b>${praetForm(v, 'ich')}</b>`)}${v.perf ? ` · spoken: ${perfSentence(v, 'ich')}` : ''}</p>`;
  $$('#praetBuilder [data-verb]').forEach(b => b.addEventListener('click', () => { praetState.verb = b.dataset.verb; drawPraetBuilder(); }));
}

/* =========================================================
   KONJUNKTIV II
   ========================================================= */

const K2_SUBJ_DEFAULT = PRONOUN_KEYS.filter(k => k !== 'es');
const k2Form = (inf, key) => K2_FORMS[inf][CONJ_INDEX[key]];
const markUmlaut = s => s.replace(/[äöü]/, '<span class="end">$&</span>');
// wärst / wärt also exist as wärest / wäret
const K2_ALT = { wärst: 'wärest', wärt: 'wäret' };

// Fill a template; gaps = { V, V1, V2 } as HTML
function k2Sentence(t, key, gaps) {
  const p = PRONOUNS[key].nom;
  let s = t.s.replace('{S2}', p).replace('{S}', p);
  for (const g of ['V', 'V1', 'V2']) s = s.replace(`{${g}}`, gaps[g] || '');
  return cap(s);
}

// Typical wrong answers: Präteritum (konnte), present (kann), another person's form
function k2Distractors(inf, key) {
  const i = CONJ_INDEX[key];
  const pv = PRAET_VERBS.find(v => v.inf === inf);
  const out = [pv ? praetForm(pv, key) : null, (PRESENT_AUX[inf] || MODAL_PRESENT[inf])[i], K2_FORMS[inf][i === 0 || i === 2 ? 3 : 0]];
  return out.filter(x => x && x !== k2Form(inf, key));
}

function k2Table() {
  const headInf = inf => { const pv = PRAET_VERBS.find(v => v.inf === inf); return `${inf}<span class="sub">${pv ? pv.p + ' →' : ''}</span>`; };
  return `<div class="tw"><table><thead><tr><th></th>${K2_VERBS.map(inf => `<th>${headInf(inf)}</th>`).join('')}</tr></thead><tbody>
    ${PRAET_KEYS.map(k => `<tr><th>${PRAET_KEY_LABEL[k]}</th>${K2_VERBS.map(inf => `<td class="f">${markUmlaut(k2Form(inf, k))}</td>`).join('')}</tr>`).join('')}
  </tbody></table></div>`;
}

function renderKonjunktiv() {
  const USE_EX = {
    polite: ['Könnten Sie mir helfen?', 'Ich hätte gern einen Kaffee.'],
    wish: ['Ich wäre jetzt gern am Meer.', 'Wenn ich doch mehr Zeit hätte!'],
    advice: ['Du solltest mehr schlafen.', 'An deiner Stelle würde ich zum Arzt gehen.'],
    unreal: ['Wenn ich reich wäre, würde ich reisen.', 'Was würdest du machen?'],
  };
  const blocks = list => woBlocks({ prefix: '', punct: '.', form: 'k2', cl: {}, chunks: list.map(([t, r, comma]) => ({ t, r, comma })) });
  const pairs = [
    ['Ich habe Zeit.', 'Ich hätte Zeit.'], ['Ich bin reich.', 'Ich wäre reich.'], ['Ich kann dir helfen.', 'Ich könnte dir helfen.'],
    ['Er weiß es.', 'Er wüsste es.'], ['Ich fahre nach Spanien.', 'Ich würde nach Spanien fahren.'],
  ];

  app.innerHTML = `
  <section class="card">
    <h2>Konjunktiv II: the “would” form</h2>
    <p class="lead">Use it for what is <b>not real</b> (or not real yet): polite requests, wishes, advice and imagined situations.</p>
    <div class="conn3">${Object.keys(USE_EX).map(u => `<div class="ww dat"><div class="big">${K2_USES[u].icon} ${cap(K2_USES[u].label)}</div><p>${USE_EX[u].map(e => `<i>${e}</i>`).join('<br>')}</p></div>`).join('')}</div>
  </section>

  <section class="card">
    <h2>How to build it</h2>
    <div class="tips">
      <div class="tip"><b>1 · Most verbs: würde + infinitive</b><i>Ich <u>würde</u> gern nach Spanien <u>fahren</u>.</i> The infinitive goes to the end, like with a modal verb.</div>
      <div class="tip"><b>2 · The important ones have their own form</b>Präteritum + umlaut: <i>war → wäre, hatte → hätte, konnte → könnte, musste → müsste, durfte → dürfte, mochte → möchte, wusste → wüsste</i>.</div>
      <div class="tip"><b>3 · sollen and wollen</b><i>sollte, wollte</i> look exactly like the Präteritum. The context tells you which one it is.</div>
    </div>
    <h4>All forms <small>(the umlaut is what makes it Konjunktiv)</small></h4>
    ${k2Table()}
  </section>

  <section class="card">
    <h2>Real or not real?</h2>
    <div class="tw"><table>
      <thead><tr><th>Real (Indikativ)</th><th>Not real (Konjunktiv II)</th></tr></thead>
      <tbody>${pairs.map(([a, b]) => `<tr><td>${a}</td><td class="f">${markUmlaut(b)}</td></tr>`).join('')}</tbody>
    </table></div>
  </section>

  <section class="card">
    <h2>wenn-sentences</h2>
    <p class="muted">The wenn-part has its verb at the end (it's a Nebensatz). It is position 1, so the main clause starts with its verb.</p>
    ${blocks([['Wenn', 'X'], ['ich', 'S'], ['reich', 'X'], ['wäre', 'VE', true], ['würde', 'V'], ['ich', 'S'], ['um die Welt', 'X'], ['reisen', 'E']])}
    ${blocks([['Wenn', 'X'], ['ich', 'S'], ['ein Auto', 'X'], ['hätte', 'VE', true], ['könnte', 'V'], ['ich', 'S'], ['ans Meer', 'X'], ['fahren', 'E']])}
    <h4>In the past: hätte / wäre + participle</h4>
    ${blocks([['Wenn', 'X'], ['ich', 'S'], ['Zeit', 'X'], ['gehabt', 'E'], ['hätte', 'VE', true], ['wäre', 'V'], ['ich', 'S'], ['gekommen', 'E']])}
    <p class="muted">haben or sein follows the Perfekt rules: <i>ich habe … gehabt → ich hätte … gehabt</i>, <i>ich bin gekommen → ich wäre gekommen</i>.</p>
  </section>

  <section class="card">
    <h2>Tips</h2>
    <div class="tips">
      <div class="tip"><b>konnte or könnte?</b><i>Ich konnte schwimmen</i> = I was able to (past). <i>Ich könnte schwimmen</i> = I could / would be able to.</div>
      <div class="tip"><b>Not “würde haben / würde sein”</b>Use <i>hätte</i> and <i>wäre</i> instead. Same for the modals: <i>könnte</i>, not “würde können”.</div>
      <div class="tip"><b>möchte = would like</b><i>Ich möchte einen Tee.</i> The polite form of <i>Ich will …</i></div>
      <div class="tip"><b>Useful phrases</b><i>Wenn ich du wäre, … · Es wäre schön, wenn … · An deiner Stelle würde ich … · Hätten Sie kurz Zeit?</i></div>
      <div class="tip"><b>Without wenn</b>Start with the verb instead: <i>Wäre ich reich, würde ich reisen.</i></div>
    </div>
  </section>`;
}

/* =========================================================
   VERBS + PREPOSITIONS
   ========================================================= */

const startsVowel = p => /^[aeiouäöü]/.test(p);
const daWord = p => `da${startsVowel(p) ? 'r' : ''}${p}`;
const woWordP = p => `wo${startsVowel(p) ? 'r' : ''}${p}`;
const PERS_KEY = { m: 'er', f: 'sie', n: 'es' };
// "auf den Bus", with short forms where German uses them (vom Urlaub, zum Geburtstag, am Kurs)
function vpPhrase(x) {
  const { art, short } = wwParts(x.prep, x.c, x.g);
  return short ? `${short} ${x.n}` : `${x.prep} ${art} ${x.n}`;
}
const vpSentence = (x, mid) => x.s.replace('{PA} {N}', mid);
// Things → darauf; people and animals → auf ihn
const vpReplace = x => (x.person ? `${x.prep} ${PRONOUNS[PERS_KEY[x.g]][x.c]}` : daWord(x.prep));
// Things → Worauf; people → Auf wen
const vpQuestion = x => (x.person ? `${cap(x.prep)} ${x.c === 'akk' ? 'wen' : 'wem'}` : cap(woWordP(x.prep)));
const vpVerb = x => x.v.replace(/ \S+$/, '');

// One example per verb + preposition, for lists
const vpUnique = () => VERB_PREPS.filter((x, i) => VERB_PREPS.findIndex(y => y.v === x.v) === i);

function vpRows(list) {
  return list.map(x => `<tr data-search="${esc((x.v + ' ' + x.en).toLowerCase())}"><th>${x.v} ${tag(x.c, CASES[x.c].short)}<span class="sub">${x.en}</span></th><td>${vpSentence(x, `<b>${vpPhrase(x)}</b>`)}</td></tr>`).join('');
}

function renderVerbPrep() {
  const list = vpUnique();
  const daRows = uniq(VERB_PREPS.map(x => x.prep)).map(p => `<tr><th>${p}</th><td class="f">${daWord(p)}</td><td class="f">${woWordP(p)}</td></tr>`).join('');
  const bus = VERB_PREPS.find(x => x.n === 'Bus');
  const lehrer = VERB_PREPS.find(x => x.n === 'Lehrer' && x.prep === 'auf');

  app.innerHTML = `
  <section class="card">
    <h2>Verbs with a fixed preposition</h2>
    <p class="lead">Many verbs always come with the same preposition, and that preposition always takes the same case. Learn them as <b>one unit</b>: <i>warten auf + Akk</i>, <i>Angst haben vor + Dat</i>.</p>
    <div class="tips">
      <div class="tip"><b>Wo / Wohin doesn't count here</b>The verb decides the case, not the meaning: <i>Ich warte <u>auf den</u> Bus</i> (no movement, still Akk).</div>
      <div class="tip"><b>auf and über: almost always Akk</b>With verbs, auf and über nearly always take the Akkusativ.</div>
      <div class="tip"><b>an: it depends</b><i>denken an + Akk</i>, but <i>teilnehmen an + Dat</i>. Learn each one.</div>
      <div class="tip"><b>mit, von, zu, nach, bei, vor: Dativ</b>mit, von, zu, nach and bei are always Dativ anyway. vor with verbs is Dativ too: <i>Angst vor dem Hund</i>.</div>
    </div>
  </section>

  <section class="card">
    <h2>The list</h2>
    <div class="typerow"><input type="text" id="vpSearch" placeholder="Search: warten, afraid, über …" autocomplete="off" spellcheck="false"></div>
    <div class="bgrid vpcols">
      <div><h4>${tag('akk')}</h4><div class="tw"><table><tbody id="vpAkk">${vpRows(list.filter(x => x.c === 'akk'))}</tbody></table></div></div>
      <div><h4>${tag('dat')}</h4><div class="tw"><table><tbody id="vpDat">${vpRows(list.filter(x => x.c === 'dat'))}</tbody></table></div></div>
    </div>
  </section>

  <section class="card">
    <h2>Same verb, different preposition</h2>
    <div class="tw"><table>
      <tbody>
        <tr><th>sich freuen <b>auf</b> + Akk</th><td>something in the future: <i>Ich freue mich auf das Wochenende.</i></td></tr>
        <tr><th>sich freuen <b>über</b> + Akk</th><td>something now or in the past: <i>Ich freue mich über das Geschenk.</i></td></tr>
        <tr><th>sprechen <b>mit</b> + Dat</th><td>the person: <i>Ich spreche mit dem Lehrer.</i></td></tr>
        <tr><th>sprechen <b>über</b> + Akk</th><td>the topic: <i>Wir sprechen über das Problem.</i></td></tr>
        <tr><th>denken <b>an</b> + Akk</th><td>to have in mind: <i>Ich denke an dich.</i></td></tr>
        <tr><th>nachdenken <b>über</b> + Akk</th><td>to think something through: <i>Ich denke über die Frage nach.</i></td></tr>
      </tbody>
    </table></div>
  </section>

  <section class="card">
    <h2>da- and wo- words</h2>
    <p class="muted">For <b>things</b>, replace "preposition + noun" with da(r)- + preposition, and ask with wo(r)- + preposition. The <b>r</b> is added when the preposition starts with a vowel.</p>
    <div class="wowohin">
      <div class="ww dat"><div class="big">📦 Things</div><p>${vpSentence(bus, `<b>${vpPhrase(bus)}</b>`)}<br>→ ${vpSentence(bus, `<b>${vpReplace(bus)}</b>`)}<br>→ <b>${vpQuestion(bus)}</b> ${bus.q.replace('{W} ', '')}</p></div>
      <div class="ww akk"><div class="big">🧑 People (and animals)</div><p>${vpSentence(lehrer, `<b>${vpPhrase(lehrer)}</b>`)}<br>→ ${vpSentence(lehrer, `<b>${vpReplace(lehrer)}</b>`)}<br>→ <b>${vpQuestion(lehrer)}</b> ${lehrer.q.replace('{W} ', '')}</p></div>
    </div>
    <h4>All forms</h4>
    <div class="tw"><table><thead><tr><th>Preposition</th><th>da-word</th><th>wo-word</th></tr></thead><tbody>${daRows}</tbody></table></div>
    <div class="tips">
      <div class="tip"><b>da-word + a whole clause</b><i>Ich freue mich <u>darauf</u>, dass du kommst. · Ich freue mich <u>darauf</u>, dich zu sehen.</i> The da-word points ahead to the clause.</div>
      <div class="tip"><b>Spoken shortcut</b>People often say <i>Auf was wartest du?</i> instead of <i>Worauf wartest du?</i> Fine when speaking, but write <i>worauf</i>.</div>
    </div>
  </section>`;

  $('#vpSearch').addEventListener('input', e => {
    const q = e.target.value.trim().toLowerCase();
    $$('#vpAkk tr, #vpDat tr').forEach(tr => { tr.style.display = !q || tr.dataset.search.includes(q) ? '' : 'none'; });
  });
}

/* =========================================================
   TABLES
   ========================================================= */

const tables = { by: 'owner', owner: 'er', c: 'akk' };

function renderTables() {
  const artCell = (c, g) => {
    const def = DEF_ART[c][g];
    const ein = g === 'pl' ? '–' : possForm('ein', c, g);
    return `${def}<span class="sub">${ein} · ${possForm('kein', c, g)}</span>`;
  };

  app.innerHTML = `
  <section class="card">
    <h2>Tables</h2>
    <div class="toc"><a href="#t-art" data-jump>Articles</a><a href="#t-pron" data-jump>Personal pronouns</a><a href="#t-stems" data-jump>Possessive words</a><a href="#t-poss" data-jump>Possessive endings</a><a href="#t-prep" data-jump>Prepositions</a><a href="#t-adj" data-jump>Adjective endings</a><a href="#t-refl" data-jump>Reflexive pronouns</a><a href="#t-perf" data-jump>Perfekt participles</a><a href="#t-praet" data-jump>Präteritum</a><a href="#t-k2" data-jump>Konjunktiv II</a><a href="#t-plural" data-jump>Plurals</a><a href="#t-rel" data-jump>Relative pronouns</a><a href="#t-vp" data-jump>Verbs + prepositions</a></div>
  </section>

  <section class="card" id="t-art">
    <h2>Articles by case</h2>
    <p class="muted">Top: definite (the). Below: ein (a) · kein (no). Possessives (mein, dein …) take exactly the same endings as ein / kein.</p>
    <div class="tw"><table>
      <thead><tr><th></th>${GENDER_KEYS.map(g => `<th>${GENDERS[g].name}</th>`).join('')}</tr></thead>
      <tbody>${CASE_KEYS.map(c => `<tr class="row-${c}"><th>${CASES[c].name}<span class="sub">${CASES[c].q}</span></th>${GENDER_KEYS.map(g => `<td class="f">${artCell(c, g)}</td>`).join('')}</tr>`).join('')}</tbody>
    </table></div>
  </section>

  <section class="card" id="t-pron">
    <h2>Personal pronouns</h2>
    <div class="tw"><table>
      <thead><tr><th>Person</th>${CASE_KEYS.map(c => `<th class="col-${c}">${CASES[c].name}<span class="sub">${CASES[c].q}</span></th>`).join('')}</tr></thead>
      <tbody>${PRONOUN_KEYS.map(k => `<tr><th>${PRONOUNS[k].label}<span class="sub">${PRONOUNS[k].en}</span></th>${CASE_KEYS.map(c => `<td class="f c-${c}">${PRONOUNS[k][c]}${c === 'gen' ? '<span class="sub">rare</span>' : ''}</td>`).join('')}</tr>`).join('')}</tbody>
    </table></div>
    <p class="muted" style="margin-top:8px">Notice: <b>uns, euch</b> are the same in Akk and Dat. <b>sie / sie / Sie</b> look the same in Nom and Akk. <b>ihr</b> can mean "you all" (Nom) or "to her" (Dat).</p>
  </section>

  <section class="card" id="t-stems">
    <h2>Possessive words: who owns it?</h2>
    <div class="tw"><table>
      <thead><tr><th>Owner</th><th>Possessive</th><th>English</th><th>Example</th></tr></thead>
      <tbody>${PRONOUN_KEYS.map(k => `<tr><th>${PRONOUNS[k].label}</th><td class="f">${PRONOUNS[k].poss}-</td><td>${PRONOUNS[k].possEn}</td><td>${possForm(PRONOUNS[k].poss, 'nom', 'm')} Hund · ${possForm(PRONOUNS[k].poss, 'nom', 'f')} Katze</td></tr>`).join('')}</tbody>
    </table></div>
    <p class="muted" style="margin-top:8px">The <b>owner</b> picks the word (sein vs ihr). The <b>thing owned</b> and the <b>case</b> pick the ending. <i>Tom → sein-, his cat (die Katze) → seine Katze.</i></p>
  </section>

  <section class="card" id="t-poss">
    <h2>Possessive endings</h2>
    <div class="ctl-row"><span>View by</span>
      <div class="seg" id="tby"><button data-by="owner" class="${tables.by === 'owner' ? 'on' : ''}">one owner, all cases</button><button data-by="case" class="${tables.by === 'case' ? 'on' : ''}">one case, all owners</button></div>
    </div>
    <div id="tpossBody"></div>
  </section>

  <section class="card" id="t-prep">
    <h2>Prepositions and verbs that decide the case</h2>
    <div class="tw"><table>
      <thead><tr><th>Case</th><th>Words</th></tr></thead>
      <tbody>
        <tr class="row-akk"><th>Akkusativ</th><td>${PREPS.akk.join(', ')}</td></tr>
        <tr class="row-dat"><th>Dativ</th><td>${PREPS.dat.join(', ')}</td></tr>
        <tr><th>Wo? → Dat<br>Wohin? → Akk</th><td>${PREPS.two.join(', ')}</td></tr>
        <tr class="row-gen"><th>Genitiv</th><td>${PREPS.gen.join(', ')}</td></tr>
        <tr class="row-dat"><th>Dativ verbs</th><td>${DAT_VERBS.join(', ')}</td></tr>
        <tr><th>Dat person +<br>Akk thing</th><td>${DAT_AKK_VERBS.join(', ')}</td></tr>
      </tbody>
    </table></div>
  </section>

  <section class="card" id="t-adj">
    <h2>Adjective endings</h2>
    ${adjLegend}
    ${ADJ_TYPE_KEYS.map(t => `<h4>${ADJ_TYPES[t].name} <small>(${ADJ_TYPES[t].also})</small></h4>${adjTable(t)}`).join('')}
  </section>

  <section class="card" id="t-refl">
    <h2>Reflexive pronouns</h2>
    <p class="muted">Highlighted: where the reflexive differs from the normal pronoun. Dativ is used when there is already a thing in Akkusativ (<i>Ich wasche mir die Hände</i>).</p>
    ${reflTable()}
  </section>

  <section class="card" id="t-perf">
    <h2>Perfekt: participles and haben / sein</h2>
    <div class="tw"><table>
      <thead><tr><th>Infinitive</th><th>Participle</th><th>haben / sein</th><th>Type</th></tr></thead>
      <tbody>${PP_TYPE_KEYS.flatMap(t => PERFEKT_VERBS.filter(v => v.type === t)).map(v => `<tr><th>${v.inf}<span class="sub">${v.en}</span></th><td class="f">${ppParts(v)}</td><td class="${v.aux === 's' ? 'f c-akk' : ''}">${auxInf(v)}</td><td class="muted">${PP_TYPES[v.type].label}</td></tr>`).join('')}</tbody>
    </table></div>
  </section>

  <section class="card" id="t-praet">
    <h2>Präteritum</h2>
    <p class="muted">er / sie / es form. ich is the same.</p>
    <div class="tw"><table>
      <thead><tr><th>Infinitive</th><th>Präteritum</th><th>Perfekt</th><th>Type</th></tr></thead>
      <tbody>${['aux', 'mod', 's', 'm', 'w'].flatMap(t => PRAET_VERBS.filter(v => v.t === t)).map(v => `<tr><th>${v.inf}<span class="sub">${v.en}</span></th>
        <td class="f">${v.p}${v.sep ? ` … ${v.sep}` : ''}</td>
        <td>${v.perf ? `${CONJ[auxInf(v.perf)].er} ${v.perf.pp}` : PRAET_EXTRA_PERF[v.inf]}</td>
        <td class="muted">${PRAET_TYPES[v.t].label}${v.g ? ` ${PRAET_GROUPS[v.g]}` : ''}</td></tr>`).join('')}</tbody>
    </table></div>
  </section>

  <section class="card" id="t-k2">
    <h2>Konjunktiv II</h2>
    <p class="muted">Every other verb: <b>würde + infinitive</b> (ich würde fahren, du würdest fahren …).</p>
    ${k2Table()}
  </section>

  <section class="card" id="t-plural">
    <h2>Plurals</h2>
    <div class="tw"><table>
      <thead><tr><th>Singular</th><th>Plural</th><th>Dictionary</th><th>Dativ plural</th></tr></thead>
      <tbody>${PLURAL_PATTERN_KEYS.flatMap(p => PLURAL_NOUNS.filter(x => x.p === p)).map(x => `<tr><th>${GART[x.g]} ${x.n}<span class="sub">${x.en}</span></th>
        <td class="f">die ${x.pl}</td><td class="muted">${plCode(x)}</td><td>den ${plDative(x)}</td></tr>`).join('')}</tbody>
    </table></div>
  </section>

  <section class="card" id="t-rel">
    <h2>Relative pronouns</h2>
    <p class="muted">Gender and number from the noun, case from the relative clause. Highlighted: different from the article.</p>
    ${relTable()}
  </section>

  <section class="card" id="t-vp">
    <h2>Verbs with prepositions</h2>
    <div class="tw"><table><tbody>${vpRows(vpUnique().filter(x => x.c === 'akk'))}${vpRows(vpUnique().filter(x => x.c === 'dat'))}</tbody></table></div>
  </section>`;

  drawPossBody();
  $('#tby').addEventListener('click', e => {
    const b = e.target.closest('button[data-by]');
    if (!b) return;
    tables.by = b.dataset.by;
    $$('#tby button').forEach(x => x.classList.toggle('on', x === b));
    drawPossBody();
  });
  $$('[data-jump]').forEach(a => a.addEventListener('click', e => {
    e.preventDefault();
    $(a.getAttribute('href')).scrollIntoView({ behavior: 'smooth' });
  }));
}

function drawPossBody() {
  const body = $('#tpossBody');
  if (tables.by === 'owner') {
    body.innerHTML = `<div class="chips" id="townChips">${PRONOUN_KEYS.map(k => `<button class="chipbtn ${k === tables.owner ? 'on' : ''}" data-k="${k}">${PRONOUNS[k].label} → ${PRONOUNS[k].poss}</button>`).join('')}</div>
      ${possTable(PRONOUNS[tables.owner].poss, null, true)}`;
    $('#townChips').addEventListener('click', e => {
      const b = e.target.closest('[data-k]');
      if (b) { tables.owner = b.dataset.k; drawPossBody(); }
    });
  } else {
    const c = tables.c;
    body.innerHTML = `<div class="chips" id="tcaseChips">${CASE_KEYS.map(k => `<button class="chipbtn ${k === c ? 'on' : ''}" data-c="${k}">${CASES[k].name}</button>`).join('')}</div>
      <div class="tw"><table><thead><tr><th>Owner</th>${GENDER_KEYS.map(g => `<th>${GENDERS[g].name}</th>`).join('')}</tr></thead><tbody>
      ${PRONOUN_KEYS.map(k => `<tr><th>${PRONOUNS[k].label}</th>${GENDER_KEYS.map(g => `<td class="f c-${c}">${possForm(PRONOUNS[k].poss, c, g)}</td>`).join('')}</tr>`).join('')}
      </tbody></table></div>`;
    $('#tcaseChips').addEventListener('click', e => {
      const b = e.target.closest('[data-c]');
      if (b) { tables.c = b.dataset.c; drawPossBody(); }
    });
  }
}

/* =========================================================
   PRACTICE
   ========================================================= */

const MODES = {
  who: { title: '👀 Who is who', d: 'Which pronoun is each person, from your view?' },
  anrede: { title: '🗣️ du · ihr · Sie', d: 'How do you address them?' },
  detective: { title: '🔍 Case detective', d: 'Ask the question, find the case.' },
  pron: { title: '👤 Pronouns', d: 'ich / mich / mir … in sentences.' },
  poss: { title: '🎁 Whose is it?', d: 'mein / sein / ihr … with the right ending.' },
  adj: { title: '✨ Adjective endings', d: 'der alte · ein alter · alter …' },
  refl: { title: '🪞 Reflexive', d: 'mich / mir / sich: myself or someone else?' },
  rel: { title: '🔗 Relative clauses', d: 'der Mann, den ich kenne …' },
  ww: { title: '📍 Wo or Wohin?', d: 'auf dem Tisch or auf den Tisch? im or ins?' },
  genders: { title: '🏷️ der · die · das', d: 'Noun genders, ending rules, compounds.' },
  plural: { title: '👥 Plurals', d: 'die Tage, die Kinder, die Autos …' },
  perfekt: { title: '⏮️ Perfekt', d: 'haben or sein? gemacht, gegangen, aufgestanden …' },
  praet: { title: '⏪ Präteritum', d: 'war, hatte, konnte, ging, machte …' },
  k2: { title: '💭 Konjunktiv II', d: 'würde, hätte, wäre, könnte …' },
  vp: { title: '🧷 Verbs + prepositions', d: 'warten auf den Bus · worauf? · darauf' },
  wo: { title: '🧩 Word order', d: 'Tap the words into the right order.' },
  mix: { title: '🔀 Mix', d: 'All of the above.' },
  review: { title: '🎯 Weak spots', d: 'More of what you get wrong. Misses come back.' },
};

const session = { c: 0, t: 0, streak: 0 };
let cur = null;

function sceneHtml(L, highlight, pool) {
  const chips = pool.filter(p => p !== 'me').map(p =>
    `<span class="chip ${p === highlight ? 'hl' : ''} ${p === L ? 'listener' : ''}">${personLabel(p)}${p === L ? ' 💬' : ''}</span>`).join('');
  return `<div class="scene"><div class="scene-top">🙋 <b>You</b> are talking to <b>${personLabel(L)}</b> <span class="muted">(${LISTENERS[L].desc})</span></div><div class="cast">${chips}</div></div>`;
}

const typeMode = () => settings.answer === 'type';

// Text answers: case-insensitive, except formal Sie / Ihnen / Ihr… where capitals change the meaning.
function checkText(given, expected, atStart) {
  const g = given.trim().replace(/\s+/g, ' ');
  if (g === expected) return { ok: true };
  if (g.toLowerCase() !== expected.toLowerCase()) return { ok: false };
  if (atStart || !/^(sie|ihnen|ihr|ihre|ihren|ihrem|ihrer|ihres)$/.test(expected.toLowerCase())) return { ok: true };
  return { ok: false, note: expected[0] === expected[0].toUpperCase()
    ? 'Formal Sie / Ihnen / Ihr is always written with a capital letter.'
    : 'With a capital letter this would be the formal "you". Here it must be lowercase.' };
}

const GEN = {
  who() {
    const L = rnd(Object.keys(LISTENERS));
    const pool = poolFor(L);
    const pid = rnd(pool.filter(p => p !== 'me'));
    const key = pronKey(pid, L);
    const P = PRONOUNS[key];
    const item = PEOPLE[pid].item;
    const verb = item.g === 'pl' ? 'sind' : 'ist';
    const possAns = possForm(P.poss, 'nom', item.g);
    const possOpts = uniq(PRONOUN_KEYS.map(k => possForm(PRONOUNS[k].poss, 'nom', item.g)));
    return {
      caseKey: 'nom',
      scene: sceneHtml(L, pid, pool),
      steps: [
        { ask: `Which pronoun do you use for <b>${personLabel(pid)}</b>?`, options: PRONOUN_KEYS.map(k => ({ v: k, l: PRONOUN_BTN[k] })), answer: key },
        { ask: `This belongs to ${PEOPLE[pid].name}: ${item.e} <b>${nounLabel(item)}</b>. Say: “Das ${verb} ___ ${item.n}.”`,
          options: typeMode() ? null : shuffle(possOpts).map(v => ({ v, l: v })), answer: possAns },
      ],
      explain: `<ol>
        <li>${personLabel(pid)}: ${relation(pid, L)} → <b>${P.label}</b> <small>(${P.en})</small></li>
        <li>${P.label} → possessive <b>${P.poss}-</b> · ${nounLabel(item)} is ${GENDERS[item.g].name}, Nominativ → <b>${possAns}</b></li>
      </ol><div class="full">Das ${verb} ${hl('nom', possAns)} ${item.n}.</div>`,
    };
  },

  anrede() {
    const it = rnd(ANREDE);
    const rules = { du: 'One person you know well → du.', ihr: 'Two or more people you’d each say du to → ihr.', Sie: 'Formal situation (one or more people) → Sie.' };
    return {
      steps: [{ ask: `You speak to: <span style="font-size:1.3rem">${it.s}</span>`, options: ['du', 'ihr', 'Sie'].map(v => ({ v, l: v })), answer: it.a }],
      explain: `<b>${it.a}</b>: ${rules[it.a]} ${it.note ? `<br><small>${it.note}</small>` : ''}`,
    };
  },

  detective() {
    const it = rnd(DETECTIVE);
    const target = it.s.match(/\[(.+?)\]/)[1];
    const qFilled = it.q.replace('{Q}', it.a);
    const sentence = c => it.s.replace(/\[(.+?)\]/, `<mark class="tgt ${c || ''}">$1</mark>`);
    const wasNote = it.a === 'Was' ? '<br><small>Tip: “Was?” works for Nom and Akk. Is it the one doing it (Nom) or the one being hit by the action (Akk)?</small>' : '';
    return {
      caseKey: it.c,
      sentence: sentence(),
      sentenceDone: sentence(it.c),
      steps: [
        { ask: 'Ask a question about the highlighted part. Which question word fits?',
          pre: `<div class="qline">${it.q.replace('{Q}', '<span class="blank">___</span>')}</div>`,
          options: DETECTIVE_OPTS[it.t].map(v => ({ v, l: v })), answer: it.a,
          after: `<i>${qFilled}</i> → <b>${target}</b>` },
        { ask: 'So which case is it?', options: CASE_KEYS.map(c => ({ v: c, l: CASES[c].name })), answer: it.c },
      ],
      explain: `<i>${qFilled}</i> → <b>${target}</b> → ${tag(it.c)}<br>${it.why}${wasNote}`,
    };
  },

  pron() {
    const L = rnd(Object.keys(LISTENERS));
    const pool = poolFor(L);
    const t = rnd(PRON_TEMPLATES);
    const pid = rnd(t.self ? pool.filter(p => p !== 'me' && p !== 'us') : pool);
    const key = pronKey(pid, L);
    const P = PRONOUNS[key];
    const atStart = t.s.startsWith('{X}');
    const answer = atStart ? cap(P[t.c]) : P[t.c];
    const fill = x => t.s.replace('{sein}', CONJ.sein[key]).replace('{haben}', CONJ.haben[key]).replace('{kommen}', CONJ.kommen[key]).replace('{X}', x);

    let options = null;
    if (!typeMode()) {
      const same = uniq(['nom', 'akk', 'dat'].map(c => P[c]));
      const others = shuffle(PRONOUN_KEYS.filter(k => k !== key)).map(k => PRONOUNS[k][t.c]);
      const forms = uniq([P[t.c], ...same, ...others].map(f => atStart ? cap(f) : f)).slice(0, 6);
      options = shuffle(forms).map(v => ({ v, l: v }));
    }
    return {
      caseKey: t.c,
      scene: sceneHtml(L, pid, pool),
      sentence: fill(`<span class="blank">___</span> <span class="who">${personLabel(pid)}</span>`),
      steps: [{ ask: 'Fill in the pronoun.', options, answer, atStart }],
      explain: `<ol>
        <li><b>Who?</b> ${personLabel(pid)}: ${relation(pid, L)} → <b>${P.label}</b></li>
        <li><b>Ask:</b> <i>${t.q}</i> → ${tag(t.c)} ${t.why}</li>
        <li><b>${P.label}</b> in ${CASES[t.c].name} → ${hl(t.c, P[t.c])}</li>
      </ol><div class="full">${fill(hl(t.c, answer))}</div>`,
    };
  },

  poss() {
    const L = rnd(Object.keys(LISTENERS));
    const pool = poolFor(L);
    const owner = rnd(pool);
    const key = pronKey(owner, L);
    const P = PRONOUNS[key];
    const t = rnd(POSS_TEMPLATES.filter(x => settings.gen || x.c !== 'gen'));
    const noun = rnd(NOUNS.filter(n => t.anim === undefined || !!n.anim === t.anim));
    const pl = noun.g === 'pl';
    const pick = v => Array.isArray(v) ? v[pl ? 1 : 0] : v;
    const s = pick(t.s).replace('{ist}', pl ? 'sind' : 'ist');
    const q = pick(t.q).replace('{ist}', pl ? 'sind' : 'ist');
    const atStart = s.startsWith('{P}');
    const form = possForm(P.poss, t.c, noun.g);
    const answer = atStart ? cap(form) : form;
    const end = POSS_END[t.c][noun.g];
    const fill = x => s.replace('{P}', x).replace('{N}', nounForm(noun, t.c));

    let options = null;
    if (!typeMode()) {
      const sameStem = shuffle(uniq(GENDER_KEYS.flatMap(g => CASE_KEYS.map(c => possForm(P.poss, c, g)))).filter(f => f !== form)).slice(0, 2);
      const otherStems = shuffle(uniq(PRONOUN_KEYS.map(k => possForm(PRONOUNS[k].poss, t.c, noun.g))).filter(f => f !== form)).slice(0, 3);
      options = shuffle(uniq([form, ...sameStem, ...otherStems].map(f => atStart ? cap(f) : f))).map(v => ({ v, l: v }));
    }
    const thing = settings.gender ? nounLabel(noun) : noun.n;
    return {
      caseKey: t.c,
      scene: sceneHtml(L, owner === 'me' ? null : owner, pool),
      hint: `${noun.e} <b>${thing}</b> belongs to <b>${personLabel(owner)}</b>`,
      sentence: fill('<span class="blank">___</span>'),
      steps: [{ ask: 'Fill in the possessive word.', options, answer, atStart }],
      explain: `<ol>
        <li><b>Owner:</b> ${personLabel(owner)}: ${relation(owner, L)} → ${P.label} → <b>${P.poss}-</b></li>
        <li><b>Thing:</b> ${nounLabel(noun)} → ${GENDERS[noun.g].name}</li>
        <li><b>Ask:</b> <i>${q}</i> → ${tag(t.c)} ${t.why}</li>
        <li><b>Ending:</b> ${GENDERS[noun.g].name} + ${CASES[t.c].name} → ${end ? `<span class="end">-${end}</span>` : 'no ending'} → ${hl(t.c, form)}</li>
      </ol><div class="full">${fill(hl(t.c, answer))}</div>`,
    };
  },

  adj() {
    const type = rnd(['def', 'def', 'indef', 'indef', 'indef', 'none']);
    let t, noun, adj, art = '';
    if (type === 'none') {
      t = rnd(ADJ_NONE_TEMPLATES);
      noun = rnd(MASS_NOUNS);
      adj = rnd(noun.adj);
    } else {
      t = rnd(ADJ_TEMPLATES.filter(x => settings.gen || x.c !== 'gen'));
      noun = rnd(NOUNS.filter(n => t.anim === undefined || !!n.anim === t.anim));
      adj = rnd(noun.anim ? ADJ_PEOPLE.concat(noun.size ? ADJ_SIZE : []) : ADJ_THINGS);
    }
    const c = t.c;
    const pl = noun.g === 'pl';
    const pick = v => Array.isArray(v) ? v[pl ? 1 : 0] : v;
    const s = pick(t.s).replace('{ist}', pl ? 'sind' : 'ist').replace('{schmeckt}', pl ? 'schmecken' : 'schmeckt');
    const q = pick(t.q).replace('{ist}', pl ? 'sind' : 'ist');
    // ein has no plural; "kein" sounds odd in Genitiv sentences
    if (type !== 'none') art = adjArticle(type, c, noun.g, rnd(ADJ_ARTICLE_STEMS.filter(x => !(pl && x === 'ein') && !(c === 'gen' && x === 'kein'))));

    const end = ADJ_END[type][c][noun.g];
    const word = adjForm(adj, end);
    const adjFirst = s.startsWith('{ADJ}');
    const answer = adjFirst ? cap(word) : word;
    const fill = x => s
      .replace('{A}', s.startsWith('{A}') ? cap(art) : art)
      .replace('{ADJ}', x)
      .replace('{N}', nounForm(noun, c));

    const options = typeMode() ? null
      : uniq(['e', 'en', 'er', 'es', 'em'].map(e => adjForm(adj, e))).map(f => adjFirst ? cap(f) : f).map(v => ({ v, l: v }));
    // Typed: accept the full word or just the ending ("en" / "-en")
    const check = value => {
      const g = value.trim().replace(/^-/, '').toLowerCase();
      if (g === word.toLowerCase() || g === end) return { ok: true };
      if (ADJ_STEM[adj] && g === adj + end) return { ok: false, note: `${adj} drops a letter before an ending: ${adjForm(adj, end)}.` };
      return { ok: false };
    };
    const thing = settings.gender ? nounLabel(noun) : noun.n;
    return {
      caseKey: c,
      hint: `${noun.e} <b>${thing}</b> · adjective: <b>${adj}</b>`,
      sentence: fill(`<span class="blank">${adjFirst ? cap(adj) : adj}…</span>`),
      steps: [{ ask: 'Pick the adjective with the right ending.', options, answer, check }],
      explain: `<ol>
        <li><b>Article:</b> ${art ? `<b>${art}</b> → ${ADJ_TYPES[type].short}` : 'none'}</li>
        <li><b>Noun:</b> ${nounLabel(noun)} → ${GENDERS[noun.g].name}</li>
        <li><b>Ask:</b> <i>${q}</i> → ${tag(c)} ${t.why || ''}</li>
        <li><b>Ending:</b> ${adjReason(type, c, noun.g, art)} → ${hl(c, word)}</li>
      </ol><div class="full">${fill(hl(c, answer))}</div>`,
    };
  },

  refl() {
    const L = rnd(Object.keys(LISTENERS));
    const pool = poolFor(L);
    const blank = '<span class="blank">___</span>';
    const reflOptions = (answer, keys, c) => {
      if (typeMode()) return null;
      const near = [answer, 'sich', ...keys.flatMap(k => [REFL[k].akk, REFL[k].dat, PRONOUNS[k].akk, PRONOUNS[k].dat])];
      const extra = shuffle(PRONOUN_KEYS).flatMap(k => [REFL[k][c], PRONOUNS[k][c]]);
      return shuffle(uniq([...near, ...extra]).slice(0, 6)).map(v => ({ v, l: v }));
    };

    // Half the time: an always-reflexive verb
    if (Math.random() < 0.5) {
      const verb = rnd(REFL_VERBS);
      const pid = rnd(pool);
      const key = pronKey(pid, L);
      const answer = REFL[key][verb.c];
      return {
        caseKey: verb.c,
        scene: sceneHtml(L, pid === 'me' ? null : pid, pool),
        hint: `<b>${verb.inf}</b> <small>(${verb.en})</small> · done by ${personLabel(pid)}`,
        sentence: reflSentence(verb, key, blank),
        steps: [{ ask: 'Fill in the reflexive pronoun.', options: reflOptions(answer, [key], verb.c), answer }],
        explain: `<ol>
          <li><b>Who does it?</b> ${personLabel(pid)}: ${relation(pid, L)} → <b>${PRONOUNS[key].label}</b></li>
          <li><b>Verb:</b> ${verb.inf} is reflexive: the action goes back to the same person.</li>
          <li><b>Case:</b> ${reflCaseReason(verb)} → ${tag(verb.c)}</li>
          <li><b>${PRONOUNS[key].label}</b> → ${hl(verb.c, answer)}${sichNote(answer)}</li>
        </ol><div class="full">${reflSentence(verb, key, hl(verb.c, answer))}</div>`,
      };
    }

    // Otherwise: myself or someone else?
    const verb = rnd(MIRROR_VERBS);
    const doer = rnd(pool);
    const others = pool.filter(p => !overlaps(p, doer));
    const recv = Math.random() < 0.5 || !others.length ? doer : rnd(others);
    const kd = pronKey(doer, L);
    const answer = mirrorAnswer(verb, doer, recv, L);
    return {
      caseKey: verb.c,
      scene: sceneHtml(L, recv === 'me' ? null : recv, pool),
      hint: mirrorPic(verb, doer, recv),
      sentence: reflSentence(verb, kd, blank),
      steps: [{ ask: 'Myself or someone else? Fill in the pronoun.', options: reflOptions(answer, uniq([kd, pronKey(recv, L)]), verb.c), answer }],
      explain: `${mirrorExplain(verb, doer, recv, L, answer)}<div class="full">${reflSentence(verb, kd, hl(verb.c, answer))}</div>`,
    };
  },

  genders() {
    const item = Math.random() < 0.2 ? rnd(COMPOUNDS) : rnd(GENDER_NOUNS);
    return {
      sub: item.g,
      hint: `${item.e} <i>${item.en}</i>`,
      sentence: `<span class="blank">___</span> ${item.n}`,
      steps: [{ ask: 'der, die or das?', options: ['der', 'die', 'das'].map(v => ({ v, l: v })), answer: GART[item.g] }],
      explain: `${genderExplain(item)}<div class="full">${gTag(item.g)} ${item.n}</div>`,
    };
  },

  wo() {
    const form = rnd(['svo', 'time', 'time', 'modal', 'perf', 'yn', 'wq', 'sub', 'sub', 'subModal', 'subPerf', 'zero', 'first',
      'adv', 'adv', 'jeDesto', 'pair', 'pick', 'pick']);
    if (form === 'pair') return woPair();
    if (form === 'pick') return woPick();
    const cl = rnd(WO_CLAUSES);
    const subj = rnd(form === 'yn' || form === 'wq' ? WO_SUBJECTS_Q : WO_SUBJECTS);
    const opts = { modal: rnd(Object.keys(WO_MODALS)), intro: rnd(WO_SUB_INTROS), zero: rnd(WO_ZERO_INTROS), first: rnd(WO_FIRST_INTROS), adv: rnd(WO_ADV_INTROS) };
    const b = form === 'jeDesto' ? jeDestoBuild(rnd(JE_DESTO)) : woBuild(cl, subj, form, opts);
    const words = b.chunks.map(c => c.t);
    let tiles;
    do { tiles = shuffle(words); } while (tiles.join(' ') === words.join(' '));
    // Statements could start with almost anything, so their first block is given
    const locked = ['svo', 'time', 'modal', 'perf', 'zero', 'jeDesto'].includes(form) ? tiles.indexOf(words[0]) : null;
    const asks = {
      svo: `Make a statement starting with “${cap(words[0])}”.`,
      time: `Start with the time: “${cap(words[0])}”.`,
      modal: `Make a statement with the modal verb <b>${opts.modal}</b>.`,
      perf: 'Make a statement in the Perfekt.',
      yn: 'Make a yes/no question.',
      wq: 'Make a question with “wann”.',
      first: 'Finish the sentence after the comma.',
      jeDesto: 'Build the sentence: the more …, the more …',
    };
    const answer = words.join(' ');
    return {
      sub: form === 'jeDesto' ? 'conj2' : WO_FORMS[form].sub,
      hint: form === 'jeDesto' ? '<b>je … desto</b> · the more …, the more …' : `verb: <b>${cl.inf}</b>`,
      steps: [{ ask: asks[form] || `Finish the sentence after “${b.conj}”.`, tiles, locked, prefix: b.prefix, punct: b.punct,
        answer, answerLabel: woText(b), check: v => ({ ok: v.toLowerCase() === answer.toLowerCase() }) }],
      explain: `<p>${woWhy(b)}</p>${woBlocks(b)}<div class="full">${woText(b)}</div>`,
    };
  },

  vp() {
    const x = rnd(VERB_PREPS);
    const type = Math.random() < 0.6 ? 'prep' : rnd(['da', 'wo']);
    const full = vpSentence(x, vpPhrase(x));
    const blank = '<span class="blank">___</span>';
    const thingOrPerson = x.person ? 'a person or animal' : 'a thing';

    if (type === 'prep') {
      const { art, short, answer } = wwParts(x.prep, x.c, x.g);
      const arts = ['den', 'dem', 'der', 'die', 'das'];
      const artOpts = typeMode() ? null
        : (short ? uniq(arts.map(a => (CONTRACT[x.prep] && CONTRACT[x.prep][a]) || `${x.prep} ${a}`)) : arts).map(v => ({ v, l: v }));
      const check = v => {
        const t = v.trim().replace(/\s+/g, ' ').toLowerCase();
        if (t === answer) return { ok: true };
        if (short && t === `${x.prep} ${art}`) return { ok: true, note: `Correct, but people almost always say <b>${short}</b>.` };
        return { ok: false };
      };
      return {
        caseKey: x.c,
        hint: `<i>${x.en}</i> · ${GART[x.g]} ${x.n}`,
        sentence: vpSentence(x, `<span class="blank">①</span> <span class="blank">②</span> ${x.n}`),
        steps: [
          { ask: `① Which preposition goes with <b>${vpVerb(x)}</b>?`, answer: x.prep,
            options: shuffle([x.prep, ...shuffle(VP_PREPS.filter(p => p !== x.prep)).slice(0, 3)]).map(v => ({ v, l: v })),
            after: `<b>${x.v}</b> + ${CASES[x.c].name}` },
          { ask: short ? `② <b>${x.prep}</b> + article for ${GART[x.g]} ${x.n}: use the short form.` : `② The article for <b>${GART[x.g]} ${x.n}</b>:`,
            options: artOpts, answer, check },
        ],
        explain: `<ol>
          <li><b>${x.v}</b> + ${tag(x.c)} <small>(${x.en})</small>. Learn it as one unit.</li>
          <li>${GART[x.g]} ${x.n} is ${GENDERS[x.g].name}, ${CASES[x.c].name} → ${hl(x.c, art)}${short ? ` · ${x.prep} + ${art} → ${hl(x.c, short)}` : ''}</li>
        </ol><div class="full">${vpSentence(x, hl(x.c, vpPhrase(x)))}</div>`,
      };
    }

    if (type === 'da') {
      const ans = vpReplace(x);
      const other = x.person ? daWord(x.prep) : `${x.prep} ${PRONOUNS[PERS_KEY[x.g]][x.c]}`;
      const wrongCase = `${x.prep} ${PRONOUNS[PERS_KEY[x.g]][x.c === 'akk' ? 'dat' : 'akk']}`;
      const otherDa = daWord(rnd(VP_PREPS.filter(p => p !== x.prep)));
      const options = shuffle(uniq([ans, other, x.person ? wrongCase : otherDa, otherDa])).map(v => ({ v, l: v }));
      return {
        sub: 'dawo',
        hint: `<i>${x.en}</i> · <b>${x.n}</b> is ${thingOrPerson}`,
        sentence: `${vpSentence(x, `<u>${vpPhrase(x)}</u>`)}<br>→ ${vpSentence(x, blank)}`,
        steps: [{ ask: 'Replace the underlined part:', options, answer: ans, check: v => ({ ok: v.trim().toLowerCase() === ans.toLowerCase() }) }],
        explain: (x.person
          ? `People and animals → preposition + pronoun in the ${CASES[x.c].name}: <b>${ans}</b>`
          : `Things → da(r) + preposition: <b>${ans}</b>${startsVowel(x.prep) ? ' <small>(r because the preposition starts with a vowel)</small>' : ''}`)
          + `<div class="full">${vpSentence(x, `<b>${ans}</b>`)}</div>`,
      };
    }

    const ans = vpQuestion(x);
    const other = x.person ? cap(woWordP(x.prep)) : `${cap(x.prep)} ${x.c === 'akk' ? 'wen' : 'wem'}`;
    const wrongCase = `${cap(x.prep)} ${x.c === 'akk' ? 'wem' : 'wen'}`;
    const otherWo = cap(woWordP(rnd(VP_PREPS.filter(p => p !== x.prep))));
    const options = shuffle(uniq([ans, other, x.person ? wrongCase : otherWo, otherWo])).map(v => ({ v, l: v }));
    const rest = x.q.replace('{W} ', '');
    return {
      sub: 'dawo',
      hint: `<i>${x.en}</i> · the answer is ${thingOrPerson}`,
      sentence: `${blank} ${rest}<br><span class="muted">— ${cap(vpPhrase(x))}.</span>`,
      steps: [{ ask: 'Which question word?', options, answer: ans, check: v => ({ ok: v.trim().toLowerCase() === ans.toLowerCase() }) }],
      explain: (x.person
        ? `Asking about a person → preposition + ${x.c === 'akk' ? 'wen (Akk)' : 'wem (Dat)'}: <b>${ans}</b>`
        : `Asking about a thing → wo(r) + preposition: <b>${ans}</b>`)
        + `<div class="full"><b>${ans}</b> ${rest} — ${cap(vpPhrase(x))}.</div>`,
    };
  },

  rel() {
    const cl = rnd(REL_CLAUSES);
    const x = rnd(REL_NOUNS.filter(n => cl.kinds.includes(n.kind)));
    const main = rnd(REL_MAINS.filter(m => m.kinds.includes(x.kind)));
    const b = relBuild(x, cl, main);
    // The main clause's article is the classic trap (Ich kenne den Mann, der …)
    const trap = DEF_ART[main.c][x.g];
    const pool = uniq([...CASE_KEYS.map(c => REL_PRON[c][x.g]), 'der', 'die', 'das', 'den', 'dem', 'denen', 'dessen', 'deren'])
      .filter(p => p !== b.pron && p !== trap);
    const options = typeMode() ? null
      : shuffle(uniq([b.pron, trap, ...shuffle(pool)]).slice(0, 5)).map(v => ({ v, l: v }));
    return {
      caseKey: cl.c,
      hint: `${x.e} ${GART[x.g]} ${x.n} <small>(${GENDERS[x.g].name})</small>`,
      sentence: b.sentence('<span class="blank">___</span>'),
      steps: [
        { ask: 'Which case does the relative pronoun need <i>in its own clause</i>?',
          options: CASE_KEYS.map(c => ({ v: c, l: CASES[c].name })), answer: cl.c, after: `Put the noun back in: <i>${b.q}</i>` },
        { ask: 'So the relative pronoun is:', options, answer: b.pron, check: v => ({ ok: v.trim().toLowerCase() === b.pron }) },
      ],
      explain: `${relExplain(x, cl, main, b)}<div class="full">${b.sentence(hl(cl.c, b.pron))}</div>`,
    };
  },

  plural() {
    const x = rnd(PLURAL_NOUNS);
    const dat = plDative(x);
    const clean = v => v.trim().replace(/^(die|den)\s+/i, '').toLowerCase();
    const steps = [{ ask: `Plural of <b>${GART[x.g]} ${x.n}</b>:`, answer: x.pl,
      options: typeMode() ? null : shuffle([x.pl, ...pluralDistractors(x)]).map(v => ({ v, l: v })),
      check: v => ({ ok: clean(v) === x.pl.toLowerCase() }) }];
    // Sometimes also the Dativ plural (only where an -n is added)
    if (dat !== x.pl && Math.random() < 0.4) {
      steps.push({ ask: 'And the Dativ plural: <i>mit den …</i>', answer: dat,
        options: typeMode() ? null : shuffle([x.pl, dat]).map(v => ({ v, l: v })),
        check: v => ({ ok: clean(v) === dat.toLowerCase() }) });
    }
    return {
      sub: 'pl_' + x.p,
      hint: `${x.e} <i>${x.en}</i>`,
      sentence: `${gTag(x.g)} ${x.n} → ${gTag('pl', 'die')} <span class="blank">___</span>`,
      steps,
      explain: `<ol>
        <li>${pluralRuleHtml(x)}</li>
        <li>Pattern <b>${PLURAL_PATTERNS[x.p].label}</b> · in the dictionary: <b>${GART[x.g]} ${x.n}, ${plCode(x)}</b></li>
        <li>Dativ plural: ${dat !== x.pl ? `add -n → mit den <b>${dat}</b>` : `it already ends in -${x.pl.slice(-1)}, so no extra -n → mit den <b>${x.pl}</b>`}</li>
      </ol><div class="full">${GART[x.g]} ${x.n} → die <b>${x.pl}</b></div>`,
    };
  },

  k2() {
    const t = rnd(K2_TEMPLATES);
    const key = rnd(t.subj || K2_SUBJ_DEFAULT);
    const P = PRONOUNS[key];
    const gaps = t.v ? ['V'] : ['V1', 'V2'];
    const verbs = { V: t.v, V1: t.v1, V2: t.v2 };
    const fmt = (g, f) => (t.s.startsWith(`{${g}}`) ? cap(f) : f);
    const answers = Object.fromEntries(gaps.map(g => [g, fmt(g, k2Form(verbs[g], key))]));
    const marks = gaps.length > 1 ? ['①', '②'] : ['___'];
    const steps = gaps.map((g, n) => {
      const ans = answers[g];
      const check = x => { const v = x.trim().toLowerCase(); return { ok: v === ans.toLowerCase() || K2_ALT[ans.toLowerCase()] === v }; };
      const options = typeMode() ? null : shuffle(uniq([ans, ...k2Distractors(verbs[g], key).map(x => fmt(g, x))])).map(x => ({ v: x, l: x }));
      return { ask: `${gaps.length > 1 ? marks[n] + ' ' : ''}<b>${verbs[g]}</b> in Konjunktiv II:`, options, answer: ans, check };
    });
    return {
      sub: t.use,
      hint: `${K2_USES[t.use].icon} ${K2_USES[t.use].label} · subject: <b>${P.label}</b> <small>(${P.en})</small>`,
      sentence: k2Sentence(t, key, Object.fromEntries(gaps.map((g, n) => [g, `<span class="blank">${marks[n]}</span>`]))),
      steps,
      explain: `<ol>
        <li>${K2_USES[t.use].rule}</li>
        ${gaps.map(g => `<li><b>${verbs[g]}</b>: ${K2_HOW[verbs[g]]} → ${P.label} <b>${answers[g]}</b></li>`).join('')}
      </ol><div class="full">${k2Sentence(t, key, Object.fromEntries(gaps.map(g => [g, `<b>${answers[g]}</b>`])))}</div>`,
    };
  },

  praet() {
    const v = rnd(PRAET_VERBS);
    const key = rnd(PRONOUN_KEYS.filter(k => k !== 'es'));
    const P = PRONOUNS[key];
    const form = praetForm(v, key);
    const spoken = perfSentence(v, key);
    const noEnding = CONJ_INDEX[key] === 0 || CONJ_INDEX[key] === 2;
    return {
      sub: praetSub(v),
      hint: `<b>${v.inf}</b> <small>(${v.en})</small> · subject: <b>${P.label}</b> <small>(${P.en})</small>`,
      sentence: praetSentence(v, key, '<span class="blank">___</span>'),
      steps: [{ ask: `Put <b>${v.inf}</b> in the Präteritum.`, answer: form,
        options: typeMode() ? null : shuffle([form, ...praetDistractors(v, key)]).map(x => ({ v: x, l: x })),
        check: x => ({ ok: x.trim().toLowerCase() === form.toLowerCase() }) }],
      explain: `<ol>
        <li><b>${PRAET_TYPES[v.t].label}:</b> ${PRAET_TYPES[v.t].rule} → ${v.inf} → <b>${v.p}</b>${v.g ? ` <small>(vowel group ${PRAET_GROUPS[v.g]})</small>` : ''}</li>
        <li><b>Ending for ${P.label}:</b> ${praetHl(v, key)}${noEnding ? ' <small>(ich and er/sie/es have no ending)</small>' : ''}</li>
        ${v.sep ? `<li>Separable verb: the prefix <b>${v.sep}</b> goes to the end, just like in the present.</li>` : ''}
        ${v.t === 'mod' && /[äöü]/.test(v.inf) ? `<li><small>Careful: <i>${umlautForm(form)}</i> (with umlaut) is Konjunktiv II = “could / would”, not the past.</small></li>` : ''}
      </ol><div class="full">${praetSentence(v, key, `<b>${form}</b>`)}</div>${spoken ? `<p class="muted">Spoken (Perfekt): ${spoken}</p>` : ''}`,
    };
  },

  perfekt() {
    const v = rnd(PERFEKT_VERBS);
    const key = rnd(PRONOUN_KEYS.filter(k => k !== 'es'));
    const P = PRONOUNS[key];
    const ai = auxInf(v);
    const other = ai === 'sein' ? 'haben' : 'sein';
    const aux = CONJ[ai][key];
    const fill = (a, p) => v.s.replace('{S}', cap(P.nom)).replace('{AUX}', a).replace('{R}', v.refl ? REFL[key].akk : '').replace('{PP}', p);
    const blank = '<span class="blank">___</span>';
    const ppOptions = typeMode() ? null : shuffle([v.pp, ...ppDistractors(v)]).map(x => ({ v: x, l: x }));
    const check = value => ({ ok: value.trim().toLowerCase() === v.pp });
    return {
      sub: ai,
      hint: `<b>${v.inf}</b> <small>(${v.en})</small> · subject: <b>${P.label}</b> <small>(${P.en})</small>`,
      sentence: fill(blank, blank),
      steps: [
        { ask: 'haben or sein? Pick the right form.',
          options: shuffle([{ v: aux, l: `${aux} <small>(${ai})</small>` }, { v: CONJ[other][key], l: `${CONJ[other][key]} <small>(${other})</small>` }]), answer: aux },
        { ask: `Now the participle of <b>${v.inf}</b>.`, options: ppOptions, answer: v.pp, check },
      ],
      explain: `<ol>
        <li><b>haben or sein?</b> ${v.inf}: ${AUX_WHY[v.why]} → ${P.label} <b>${aux}</b></li>
        <li><b>Participle:</b> ${PP_TYPES[v.type].label}: ${PP_TYPES[v.type].rule} → ${ppParts(v)}</li>
        <li>haben / sein goes in position 2, the participle to the very end.</li>
        ${v.note ? `<li><small>${v.note}</small></li>` : ''}
      </ol><div class="full">${fill(`<b>${aux}</b>`, `<b>${v.pp}</b>`)}</div>`,
    };
  },

  ww() {
    const toQ = q => q.replace(/^(Wohin|Woher|Wo) /, '{Q} ');
    if (Math.random() < 0.15) {
      const t = rnd(WW_TRAPS);
      return wwExercise({ s: t.s, q: toQ(t.q), prep: t.p, place: t, c: t.c, qa: t.qa, qOpts: ['Wo', 'Wohin', 'Woher'], reason: t.why });
    }
    const act = WW_ACTIONS[rnd(Object.keys(WW_ACTIONS))];
    const place = rnd(WW_PLACES.filter(p => p[act.kind]));
    const prep = rnd(place[act.kind]);
    const dir = Math.random() < 0.5 ? 'wohin' : 'wo';
    const tpl = Array.isArray(act[dir]) ? rnd(act[dir]) : act[dir];
    const thing = act.things ? rnd(WW_THINGS[act.things]) : { nom: '', akk: '' };
    const sub = str => str.replace('{T.akk}', thing.akk).replace('{T.nom}', thing.nom).replace('{GO}', place.goVerb || 'gehen');
    const reason = dir === 'wo'
      ? `<b>${prep}</b> is a two-way preposition, and this is a position (nothing moves to a new place) → Wo? → Dativ.`
      : `<b>${prep}</b> is a two-way preposition, and this is movement to a goal → Wohin? → Akkusativ.`;
    return wwExercise({
      s: sub(tpl.s), q: toQ(cap(sub(tpl.q))), prep, place, c: dir === 'wo' ? 'dat' : 'akk',
      qa: dir === 'wo' ? 'Wo' : 'Wohin', qOpts: ['Wo', 'Wohin'], reason, pairNote: act.pair,
    });
  },
};

function renderPractice() {
  app.innerHTML = `
  <section class="card">
    <h2>Practice</h2>
    <div class="modes" id="modes">${Object.keys(MODES).map(k => `<button class="mode ${settings.mode === k ? 'on' : ''}" data-m="${k}"><div class="t">${MODES[k].title}</div><div class="d">${MODES[k].d}</div></button>`).join('')}</div>
    <div class="settings">
      <div class="seg" id="ansSeg"><button data-a="choice" class="${!typeMode() ? 'on' : ''}">Multiple choice</button><button data-a="type" class="${typeMode() ? 'on' : ''}">Type it</button></div>
      <label><input type="checkbox" id="optGen" ${settings.gen ? 'checked' : ''}> Include Genitiv</label>
      <label><input type="checkbox" id="optGender" ${settings.gender ? 'checked' : ''}> Show der/die/das hint</label>
    </div>
  </section>
  <section class="card" id="ex"></section>
  <section class="card" id="weak"></section>
  <section class="card" id="stats"></section>`;

  $('#modes').addEventListener('click', e => {
    const b = e.target.closest('[data-m]');
    if (!b) return;
    settings.mode = b.dataset.m; saveSettings();
    reviewFocus = null;
    $$('.mode').forEach(x => x.classList.toggle('on', x === b));
    newExercise();
  });
  $('#ansSeg').addEventListener('click', e => {
    const b = e.target.closest('[data-a]');
    if (!b) return;
    settings.answer = b.dataset.a; saveSettings();
    $$('#ansSeg button').forEach(x => x.classList.toggle('on', x === b));
    newExercise();
  });
  $('#optGen').addEventListener('change', e => { settings.gen = e.target.checked; saveSettings(); });
  $('#optGender').addEventListener('change', e => { settings.gender = e.target.checked; saveSettings(); newExercise(); });

  newExercise();
  drawWeak();
  drawStats();
}

function newExercise() {
  if (settings.mode === 'review') {
    cur = reviewExercise();
    drawEx();
    return;
  }
  const mode = settings.mode === 'mix'
    ? rnd(['who', 'anrede', 'detective', 'detective', 'pron', 'pron', 'poss', 'poss', 'adj', 'adj', 'refl', 'refl', 'rel', 'rel', 'ww', 'ww', 'genders', 'genders', 'plural', 'plural', 'perfekt', 'perfekt', 'praet', 'praet', 'k2', 'k2', 'vp', 'vp', 'wo', 'wo'])
    : settings.mode;
  cur = { mode, ex: GEN[mode](), step: 0, results: [] };
  drawEx();
}

function optionLabel(st, v) {
  if (v === st.answer && st.answerLabel) return st.answerLabel;
  const o = st.options && st.options.find(x => x.v === v);
  return o ? o.l : v;
}

// Tap-to-order steps: cur.picked holds tile indexes in the chosen order
function tilesHtml(st, res) {
  const word = (t, n) => (n === 0 && !st.prefix ? cap(t) : t);
  const isLocked = n => st.locked != null && n === 0;
  let h = `<div class="buildline ${res ? (res.ok ? 'right' : 'wrong') : ''}">${st.prefix ? `<span class="muted">${st.prefix}</span>` : ''}
    ${cur.picked.map((ti, n) => `<button class="tile in ${isLocked(n) ? 'locked' : ''}" data-pi="${n}" ${res || isLocked(n) ? 'disabled' : ''}>${esc(word(st.tiles[ti], n))}</button>`).join('')}<span class="punct">${st.punct}</span></div>`;
  if (!res) {
    const left = st.tiles.map((t, ti) => ({ t, ti })).filter(x => !cur.picked.includes(x.ti));
    h += `<div class="tilepool">${left.map((x, n) => `<button class="tile" data-ti="${x.ti}"><span class="k">${n + 1}</span>${esc(x.t)}</button>`).join('')}</div>
      <div class="next-row"><button class="primary check" ${left.length ? 'disabled' : ''}>Check</button><button class="ghost tilereset">Start over</button><span class="kbd">keys 1–9 pick · Backspace undoes · Enter checks</span></div>`;
  }
  return h;
}

function tileCheck(i) {
  const st = cur.ex.steps[i];
  if (cur.picked.length === st.tiles.length) answer(i, cur.picked.map(t => st.tiles[t]).join(' '));
}

function drawEx() {
  const box = $('#ex');
  if (!box) return;
  const { ex } = cur;
  const finished = cur.results.length === ex.steps.length;
  if (!cur.picked) cur.picked = ex.steps[0].tiles && ex.steps[0].locked != null ? [ex.steps[0].locked] : [];
  let h = `<div class="ex-head"><span class="mode-tag">${MODES[cur.mode].title}</span><span class="score">Session <b>${session.c}/${session.t}</b> · Streak <b>${session.streak}</b>${session.streak >= 3 ? ' 🔥' : ''}</span></div>`;
  if (cur.banner) h += `<div class="banner">${cur.banner}${reviewFocus && !cur.redo ? ' <button id="clearFocus">✕ all weak spots</button>' : ''}</div>`;
  if (ex.scene) h += ex.scene;
  if (ex.hint) h += `<div class="hint">${ex.hint}</div>`;
  if (ex.sentence) h += `<div class="sentence">${finished && ex.sentenceDone ? ex.sentenceDone : ex.sentence}</div>`;

  ex.steps.forEach((st, i) => {
    if (i > cur.step) return;
    const res = cur.results[i];
    h += `<div class="step" data-step="${i}"><div class="ask">${st.ask}</div>${st.pre || ''}`;
    if (st.tiles) {
      h += tilesHtml(st, res);
    } else if (st.options) {
      h += `<div class="opts">${st.options.map((o, n) => {
        let cls = '';
        if (res) cls = o.v === st.answer ? 'right' : (o.v === res.value ? 'wrong' : '');
        return `<button class="opt ${cls}" data-v="${o.v}" ${res ? 'disabled' : ''}>${!res && st.options.length <= 9 ? `<span class="k">${n + 1}</span>` : ''}${o.l}</button>`;
      }).join('')}</div>`;
    } else {
      const cls = res ? (res.ok ? 'right' : 'wrong') : '';
      h += `<div class="typerow"><input type="text" autocomplete="off" autocapitalize="off" spellcheck="false" class="${cls}" value="${res ? res.value.replace(/"/g, '&quot;') : ''}" ${res ? 'disabled' : ''} placeholder="type the word…"><button class="primary check" ${res ? 'disabled' : ''}>Check</button></div>`;
    }
    if (res) {
      h += `<div class="fb ${res.ok ? 'ok' : 'bad'}">${res.ok ? '✓ Richtig!' : `✗ Correct answer: <b>${optionLabel(st, st.answer)}</b>`}${res.note ? `<span class="more">${res.note}</span>` : ''}${st.after ? `<span class="more">${st.after}</span>` : ''}</div>`;
    }
    h += '</div>';
  });

  if (finished) {
    h += `<div class="explain">${ex.explain}</div><div class="next-row"><button class="primary" id="next">Next →</button><span class="kbd">or press Enter</span></div>`;
  }
  box.innerHTML = h;

  $$('.step', box).forEach(stepEl => {
    const i = +stepEl.dataset.step;
    $$('.opt', stepEl).forEach(b => b.addEventListener('click', () => answer(i, b.dataset.v)));
    const st = ex.steps[i];
    if (st.tiles && !cur.results[i]) {
      $$('[data-ti]', stepEl).forEach(b => b.addEventListener('click', () => { cur.picked.push(+b.dataset.ti); drawEx(); }));
      $$('[data-pi]', stepEl).forEach(b => b.addEventListener('click', () => { cur.picked.splice(+b.dataset.pi, 1); drawEx(); }));
      $('.tilereset', stepEl).addEventListener('click', () => { cur.picked = cur.picked.slice(0, st.locked != null ? 1 : 0); drawEx(); });
      $('.check', stepEl).addEventListener('click', () => tileCheck(i));
    }
    const input = $('input', stepEl);
    if (input && !input.disabled) {
      const go = () => { if (input.value.trim()) answer(i, input.value); };
      $('.check', stepEl).addEventListener('click', go);
      input.addEventListener('keydown', e => { if (e.key === 'Enter') { e.preventDefault(); e.stopPropagation(); go(); } });
      input.focus();
    }
  });
  const next = $('#next');
  if (next) { next.addEventListener('click', newExercise); next.focus({ preventScroll: true }); }
  const clear = $('#clearFocus');
  if (clear) clear.addEventListener('click', () => { reviewFocus = null; newExercise(); });
}

function answer(i, value) {
  if (cur.results[i]) return;
  const st = cur.ex.steps[i];
  const r = st.options ? { ok: value === st.answer } : st.check ? st.check(value) : checkText(value, st.answer, st.atStart);
  cur.results[i] = { ok: r.ok, value, note: r.note };
  if (i < cur.ex.steps.length - 1) cur.step = i + 1;
  else record();
  drawEx();
}

function record() {
  const ok = cur.results.every(r => r.ok);
  session.t++;
  if (ok) { session.c++; session.streak++; } else session.streak = 0;
  const stats = loadStats();
  const bump = (obj, key) => { const s = obj[key] || (obj[key] = { c: 0, t: 0 }); s.t++; if (ok) s.c++; };
  bump(stats.modes, cur.mode);
  if (cur.ex.caseKey) bump(stats.cases, cur.ex.caseKey);
  bump(stats.topics, topicKey(cur.mode, subOf(cur.ex)));

  if (!ok) {
    const wrong = cur.results.map((r, i) => r.ok ? null : toText(optionLabel(cur.ex.steps[i], r.value))).filter(Boolean).join(' · ');
    const text = summarize(cur.ex);
    stats.mistakes = [{ topic: topicLabel(cur.mode, subOf(cur.ex)), text, wrong }, ...stats.mistakes.filter(m => m.text !== text)].slice(0, 15);
    // Each missed question comes back at most twice
    cur.ex.redos = (cur.ex.redos || 0) + 1;
    if (cur.ex.redos <= 2 && redoQueue.length < 10) redoQueue.push({ mode: cur.mode, ex: cur.ex, due: session.t + 3 });
  }
  store.set('stats', stats);
  drawStats();
  drawWeak();
}

/* ---------- Weak spots ---------- */

const PRACTICE_MODES = ['who', 'anrede', 'detective', 'pron', 'poss', 'adj', 'refl', 'rel', 'ww', 'genders', 'plural', 'perfekt', 'praet', 'k2', 'vp', 'wo'];
// Cases each mode can produce (null = the mode has no case)
const MODE_CASES = { who: ['nom'], anrede: [null], detective: CASE_KEYS, pron: ['nom', 'akk', 'dat'], poss: CASE_KEYS, adj: CASE_KEYS, refl: ['akk', 'dat'], rel: CASE_KEYS, ww: ['akk', 'dat'], genders: ['m', 'f', 'n'], plural: ['pl_e', 'pl_er', 'pl_n', 'pl_s', 'pl_0'], perfekt: ['haben', 'sein'], praet: ['regular', 'irregular', 'modal'], k2: ['polite', 'wish', 'advice', 'unreal', 'past'], vp: ['akk', 'dat', 'dawo'], wo: ['main', 'question', 'sub', 'conj0', 'adv', 'conj2'] };
const topicKey = (mode, c) => `${mode}:${c || '-'}`;
// Topic = mode + case, or mode + gender for der/die/das
const subOf = ex => ex.caseKey || ex.sub;
const SUB_LABEL = { m: 'der words', f: 'die words', n: 'das words', haben: 'haben verbs', sein: 'sein verbs',
  main: 'main clauses', question: 'questions', sub: 'weil / dass clauses', conj0: 'aber / denn / und', adv: 'deshalb / trotzdem', conj2: 'je … desto & pairs',
  regular: 'regular verbs', irregular: 'irregular verbs', modal: 'sein, haben & modals',
  polite: 'polite requests', wish: 'wishes', advice: 'advice', unreal: 'wenn … würde', past: 'hätte / wäre + participle',
  pl_e: '-e / ¨-e', pl_er: '-er / ¨-er', pl_n: '-(e)n', pl_s: '-s', pl_0: '– / ¨', dawo: 'da- / wo- words' };
const topicLabel = (mode, c) => `${MODES[mode].title}${c ? ` · ${CASES[c] ? CASES[c].name : SUB_LABEL[c]}` : ''}`;
const emptyStats = () => ({ modes: {}, cases: {}, topics: {}, mistakes: [] });
const loadStats = () => Object.assign(emptyStats(), store.get('stats', {}));
const esc = s => String(s).replace(/[&<>"]/g, ch => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[ch]));
const toText = html => { const d = document.createElement('div'); d.innerHTML = html; return d.textContent.replace(/\s+/g, ' ').trim(); };

// Missed exercises come back a few questions later (this session only)
const redoQueue = [];
let reviewFocus = null; // { mode, c } when one weak spot was picked

function summarize(ex) {
  const d = document.createElement('div');
  d.innerHTML = ex.explain;
  const full = d.querySelector('.full');
  if (full) return full.textContent.replace(/\s+/g, ' ').trim();
  const answers = ex.steps.map(st => toText(optionLabel(st, st.answer))).join(' · ');
  return `${toText(ex.sentenceDone || ex.sentence || ex.steps[0].ask)} → ${answers}`;
}

function allTopics(stats) {
  return PRACTICE_MODES.flatMap(mode => MODE_CASES[mode]
    .filter(c => settings.gen || c !== 'gen')
    .map(c => {
      const s = stats.topics[topicKey(mode, c)] || { c: 0, t: 0 };
      // Smoothed error rate: an unseen topic counts as 50 %
      return { mode, c, s, weakness: (s.t - s.c + 1) / (s.t + 2) };
    }));
}

function weakSpots(stats, n) {
  return allTopics(stats)
    .filter(t => t.s.t >= 2 && t.s.c < t.s.t)
    .sort((a, b) => a.s.c / a.s.t - b.s.c / b.s.t || b.s.t - a.s.t)
    .slice(0, n);
}

// Weighted pick: the weaker the topic, the more often it comes up
function pickTopic() {
  if (reviewFocus) return reviewFocus;
  const topics = allTopics(loadStats());
  const total = topics.reduce((sum, t) => sum + t.weakness ** 2, 0);
  let r = Math.random() * total;
  for (const t of topics) { r -= t.weakness ** 2; if (r <= 0) return t; }
  return topics[topics.length - 1];
}

function reviewExercise() {
  // Never two repeats in a row; with a focus, only repeats from that topic
  const inFocus = q => !reviewFocus || (q.mode === reviewFocus.mode && (!reviewFocus.c || subOf(q.ex) === reviewFocus.c));
  const due = cur && cur.redo ? -1 : redoQueue.findIndex(q => q.due <= session.t && inFocus(q));
  if (due >= 0) {
    const { mode, ex } = redoQueue.splice(due, 1)[0];
    ex.steps.forEach(st => { if (st.options) st.options = shuffle(st.options); });
    return { mode, ex, step: 0, results: [], redo: true, banner: '🔁 Again: you missed this one a few questions ago' };
  }
  const t = pickTopic();
  let ex;
  for (let n = 0; n < 60; n++) {
    ex = GEN[t.mode]();
    if (!t.c || subOf(ex) === t.c) break;
  }
  const s = loadStats().topics[topicKey(t.mode, t.c)];
  const acc = s && s.t ? `${Math.round(100 * s.c / s.t)}% so far` : 'new for you';
  return { mode: t.mode, ex, step: 0, results: [], banner: `🎯 ${reviewFocus ? 'Focus' : 'Weak spot'}: ${topicLabel(t.mode, t.c)} · ${acc}` };
}

function drawWeak() {
  const el = $('#weak');
  if (!el) return;
  const stats = loadStats();
  const spots = weakSpots(stats, 5);
  el.innerHTML = `<h3>🎯 Your weak spots</h3>
    ${spots.length
      ? `<div class="weaklist">${spots.map(t => `<div class="weakrow"><span>${topicLabel(t.mode, t.c)}</span><span class="muted">${t.s.c}/${t.s.t} · ${Math.round(100 * t.s.c / t.s.t)}%</span><button class="ghost" data-focus="${t.mode}|${t.c || ''}">Practise this</button></div>`).join('')}</div>`
      : '<p class="muted">No weak spots yet. Answer some questions and the topics you miss most will show up here.</p>'}
    ${stats.mistakes.length ? `<h4>Recent mistakes</h4><ul class="mistakes">${stats.mistakes.slice(0, 8).map(m => `<li><span class="muted">${esc(m.topic)}</span><br><span class="ok-txt">✓</span> ${esc(m.text)}${m.wrong ? ` <span class="bad-txt">(you: ${esc(m.wrong)})</span>` : ''}</li>`).join('')}</ul>` : ''}`;

  $$('[data-focus]', el).forEach(b => b.addEventListener('click', () => {
    const [mode, c] = b.dataset.focus.split('|');
    reviewFocus = { mode, c: c || null };
    settings.mode = 'review'; saveSettings();
    $$('.mode').forEach(x => x.classList.toggle('on', x.dataset.m === 'review'));
    newExercise();
    $('#ex').scrollIntoView({ behavior: 'smooth', block: 'start' });
  }));
}

function drawStats() {
  const el = $('#stats');
  if (!el) return;
  const stats = loadStats();
  const bar = (label, s, cls) => {
    const pct = s && s.t ? Math.round(100 * s.c / s.t) : 0;
    return `<div class="stat"><div class="row"><span>${label}</span><span>${s && s.t ? `${s.c}/${s.t} · ${pct}%` : '–'}</span></div><div class="bar ${cls || ''}"><i style="width:${pct}%"></i></div></div>`;
  };
  el.innerHTML = `<div class="ex-head"><h3 style="margin:0">Your progress (all time)</h3><button class="ghost" id="resetStats">Reset</button></div>
    <div class="statgrid">
      <div>${PRACTICE_MODES.map(k => bar(MODES[k].title, stats.modes[k])).join('')}</div>
      <div>${CASE_KEYS.map(c => bar(CASES[c].name, stats.cases[c], c)).join('')}</div>
    </div>`;
  $('#resetStats').addEventListener('click', () => {
    if (!confirm('Reset all progress?')) return;
    store.set('stats', emptyStats());
    redoQueue.length = 0;
    drawStats();
    drawWeak();
  });
}

// Keyboard: 1–9 picks an option, Enter goes to the next exercise
document.addEventListener('keydown', e => {
  if (!cur || !$('#ex') || e.ctrlKey || e.metaKey || e.altKey) return;
  if (e.target.tagName === 'INPUT') return;
  const finished = cur.results.length === cur.ex.steps.length;
  if (e.key === 'Enter' && finished) {
    e.preventDefault();
    newExercise();
    return;
  }
  if (finished) return;
  const st = cur.ex.steps[cur.step];
  const n = parseInt(e.key, 10);
  if (st.tiles) {
    if (e.key === 'Backspace') {
      e.preventDefault();
      if (cur.picked.length > (st.locked != null ? 1 : 0)) { cur.picked.pop(); drawEx(); }
    } else if (e.key === 'Enter') {
      e.preventDefault();
      tileCheck(cur.step);
    } else if (n >= 1) {
      const left = st.tiles.map((t, ti) => ti).filter(ti => !cur.picked.includes(ti));
      if (left[n - 1] != null) { cur.picked.push(left[n - 1]); drawEx(); }
    }
    return;
  }
  if (n >= 1 && st.options && st.options[n - 1]) answer(cur.step, st.options[n - 1].v);
});

route();
})();
