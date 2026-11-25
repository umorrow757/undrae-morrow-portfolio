// S7: Scripted sample agent bench. A visitor picks a request; the page shows the plan, who would do
// each step, and a proposal that waits for a person. Pretend world shared with S1 (dragon daycare).
// Scripted only: no AI call, no model, no free text, nothing a visitor types is shown back.
// No storage, no network, no links. Data never animates: every step lands in one cut.

/* ===== SCENARIOS: one data block. A new scenario is new data, not new code. =====
   {v} in any string is replaced with the value picked in the request's select. */
const ROLES = ['Researcher', 'Writer', 'Reviewer', 'Builder', 'Coordinator'];
const SCENARIOS = [
  { id: 'iv', label: 'Plan interviews for {v} Nap Cave Attendants',
    slot: ['Roles to fill', ['1', '2', '3', '4', '5']], pick: 1,
    plan: [
      ['Researcher', 'Pull the shortlist for {v} Nap Cave Attendant openings', 'Finds and sorts facts; changes nothing.'],
      ['Writer', 'Draft five interview questions and a one-line scoring guide', 'Turns the plan into plain words.'],
      ['Coordinator', 'Find {v} interview slots that miss nap time', 'Owns the calendar and the hand-offs.'],
      ['Reviewer', 'Check the questions are job-related and the same for everyone', 'A second set of eyes before anything goes out.'],
    ],
    alt: [
      ['Researcher', 'Pull the shortlist for {v} Nap Cave Attendant openings', 'Finds and sorts facts; changes nothing.'],
      ['Coordinator', 'Book one group open house instead of single interviews', 'Owns the calendar and the hand-offs.'],
      ['Writer', 'Write the open-house welcome note and three shared questions', 'Turns the plan into plain words.'],
      ['Reviewer', 'Check the note and questions for fairness and clear words', 'A second set of eyes before anything goes out.'],
    ],
    touch: ['Sample interview calendar', 'Sample candidate shortlist', 'Draft question sheet'],
    time: 'About 40 minutes of bench time, then 15 minutes of yours to approve' },
  { id: 'fw', label: 'Build a new hire\'s first week',
    slot: ['Start', ['Next Monday', 'In two weeks', 'Next moon']], pick: 0,
    plan: [
      ['Coordinator', 'Set day one for {v}: badge, mittens, lair tour', 'Owns the calendar and the hand-offs.'],
      ['Writer', 'Write a five-day schedule with one goal a day', 'Turns the plan into plain words.'],
      ['Builder', 'Make a one-page checklist the new hire can tick', 'Builds the thing people will use.'],
      ['Reviewer', 'Check every day has a named buddy and a break', 'A second set of eyes before anything goes out.'],
    ],
    alt: [
      ['Coordinator', 'Set day one for {v}: badge, mittens, lair tour', 'Owns the calendar and the hand-offs.'],
      ['Writer', 'Write a three-day schedule, then shadow shifts for the rest', 'Turns the plan into plain words.'],
      ['Reviewer', 'Check the shorter plan still covers fire safety on day one', 'A second set of eyes before anything goes out.'],
    ],
    touch: ['Sample onboarding calendar', 'Draft first-week checklist'],
    time: 'About 30 minutes of bench time, then 10 minutes of yours to approve' },
  { id: 'tr', label: 'Prep a snack-time safety training',
    slot: ['Session length', ['20 minutes', '30 minutes', '45 minutes']], pick: 1,
    plan: [
      ['Researcher', 'Gather the three snack-time incidents from the sample log', 'Finds and sorts facts; changes nothing.'],
      ['Writer', 'Write a {v} outline: one story, one demo, one quiz', 'Turns the plan into plain words.'],
      ['Builder', 'Build a five-question check that keepers answer on a card', 'Builds the thing people will use.'],
      ['Reviewer', 'Check the outline fits {v} with time for questions', 'A second set of eyes before anything goes out.'],
      ['Coordinator', 'Hold a room and invite the keepers on the dawn roar shift', 'Owns the calendar and the hand-offs.'],
    ],
    alt: [
      ['Writer', 'Write a {v} outline built around one hands-on drill', 'Turns the plan into plain words.'],
      ['Reviewer', 'Check the drill is safe to run with real snacks', 'A second set of eyes before anything goes out.'],
      ['Coordinator', 'Hold the snack pantry for the drill and invite the keepers', 'Owns the calendar and the hand-offs.'],
    ],
    touch: ['Sample incident log (read only)', 'Draft training outline', 'Sample room calendar'],
    time: 'About 50 minutes of bench time, then 15 minutes of yours to approve' },
  { id: 'fu', label: 'Set up candidate follow-ups',
    slot: ['Candidates', ['1', '2', '3', '4', '5']], pick: 2,
    plan: [
      ['Researcher', 'List the {v} candidates waiting longest for a reply', 'Finds and sorts facts; changes nothing.'],
      ['Writer', 'Draft one short, kind follow-up note for each', 'Turns the plan into plain words.'],
      ['Reviewer', 'Check each note promises nothing the lair cannot keep', 'A second set of eyes before anything goes out.'],
      ['Coordinator', 'Queue the {v} notes as drafts for you to send', 'Owns the calendar and the hand-offs.'],
    ],
    alt: [
      ['Researcher', 'List the {v} candidates waiting longest for a reply', 'Finds and sorts facts; changes nothing.'],
      ['Coordinator', 'Put a five-minute call for each on your calendar instead', 'Owns the calendar and the hand-offs.'],
      ['Writer', 'Write a two-line call note for each candidate', 'Turns the plan into plain words.'],
    ],
    touch: ['Sample candidate list (read only)', 'Draft follow-up notes'],
    time: 'About 20 minutes of bench time, then 10 minutes of yours to approve' },
  { id: 'or', label: 'Summarize open roles for Monday',
    slot: ['Lairs', ['1', '2', '3', '4', '5']], pick: 2,
    plan: [
      ['Researcher', 'Pull open roles, days open and interviews booked for {v} lairs', 'Finds and sorts facts; changes nothing.'],
      ['Builder', 'Lay the numbers out as one table with a total row', 'Builds the thing people will use.'],
      ['Writer', 'Write three plain sentences on what changed since last Monday', 'Turns the plan into plain words.'],
      ['Reviewer', 'Check every total adds up before it is shared', 'A second set of eyes before anything goes out.'],
    ],
    alt: [
      ['Researcher', 'Pull open roles for {v} lairs, oldest first', 'Finds and sorts facts; changes nothing.'],
      ['Writer', 'Write one short paragraph per lair instead of a table', 'Turns the plan into plain words.'],
      ['Reviewer', 'Check every figure in the paragraphs against the source', 'A second set of eyes before anything goes out.'],
    ],
    touch: ['Sample open-roles report (read only)', 'Draft Monday summary'],
    time: 'About 25 minutes of bench time, then 5 minutes of yours to approve' },
];
const STAGES = ['Request', 'Plan', 'Routing', 'Proposal', 'Result'];
const HONEST = 'Sample data. Scripted demo: no AI runs on this page.';
const APPROVED = 'Approved (sample). Nothing ran. In the real bench, nothing runs until a person approves this exact item.';
const STOPPED = 'Stopped. Nothing ran.';
const PLAY_MS = 3000;
/* ===== END SCENARIOS ===== */

let S = null; // state
let U = null; // persistent nodes

function h(tag, props, ...kids) {
  const e = document.createElement(tag);
  for (const k in props || {}) {
    const v = props[k];
    if (v == null || v === false) continue;
    if (k === 'text') e.textContent = v;
    else if (k.startsWith('on')) e.addEventListener(k.slice(2), v);
    else e.setAttribute(k, v);
  }
  kids.flat(Infinity).forEach((c) => c != null && c !== false && e.append(c));
  return e;
}

const sc = () => SCENARIOS[S.sc];
const val = () => sc().slot[1][S.v];
const fill = (t) => t.replace(/\{v\}/g, val());
const steps = () => (S.alt ? sc().alt : sc().plan);

function say(m) { U.live.textContent = m; }

function stop() {
  if (S && S.timer) { clearInterval(S.timer); S.timer = null; }
}

function stageLine() {
  return S.stage === 4 ? 'Step 5 of 5: Result.' : `Step ${S.stage + 1} of 5: ${STAGES[S.stage]}.`;
}

// Moves one scripted step. Never moves past the proposal: only Approve, Change or Stop do that.
function advance() {
  if (S.stage >= 3) return false;
  S.stage += 1;
  const n = steps().length;
  const msg = S.stage === 1 ? `Plan: ${n} numbered steps for "${fill(sc().label)}".`
    : S.stage === 2 ? `Routing: each step tagged to a role, with why.`
    : 'Proposal ready. Nothing runs until you choose Approve, Change or Stop.';
  say(`${stageLine()} ${msg}`);
  return true;
}

function reset(msg) {
  stop();
  Object.assign(S, { stage: 0, alt: false, result: '' });
  render();
  say(msg);
}

function decide(kind) {
  stop();
  if (kind === 'change') {
    if (S.alt) { say('This sample has one alternate plan. Approve or Stop it, or Replay.'); return; }
    S.alt = true;
    render();
    say(`Changed. Alternate plan: ${steps().length} steps, routed again. Back to the proposal.`);
    focus('#ag-prop');
    return;
  }
  S.stage = 4;
  S.result = kind === 'approve' ? APPROVED : STOPPED;
  render();
  say(`${stageLine()} ${S.result}`);
  focus('#ag-res');
}

function focus(sel) {
  const t = U.view.querySelector(sel);
  if (t) t.focus();
}

function render() {
  // Persistent controls: update state in place so focus stays where it is.
  U.chips.forEach((b, i) => b.setAttribute('aria-pressed', String(i === S.sc)));
  U.slotLab.textContent = sc().slot[0];
  U.sel.replaceChildren(...sc().slot[1].map((o, i) => h('option', { value: i, text: o })));
  U.sel.value = String(S.v);
  U.step.textContent = stageLine();
  U.next.setAttribute('aria-disabled', String(S.stage >= 3));
  U.play.setAttribute('aria-disabled', String(S.stage >= 3));
  U.play.setAttribute('aria-pressed', String(!!S.timer));
  U.play.textContent = S.timer ? 'Pause' : 'Play';
  U.track.replaceChildren(...STAGES.map((n, i) => h('li', {
    class: i < S.stage ? 'done' : i === S.stage ? 'now' : '',
    'aria-current': i === S.stage ? 'step' : null,
  }, h('b', { text: `${i + 1}` }), ` ${n}`, h('span', { text: i < S.stage ? ' (done)' : i === S.stage ? ' (now)' : '' }))));

  const list = steps();
  const parts = [h('p', { class: 'ag-req' }, h('span', { class: 'ag-k', text: 'Request' }), fill(sc().label))];
  if (S.stage >= 1) {
    parts.push(h('section', { class: 'ag-box', 'aria-labelledby': 'ag-ph' },
      h('h5', { id: 'ag-ph', text: S.alt ? 'Plan (alternate)' : 'Plan' }),
      h('ol', { class: 'ag-plan' }, list.map((s) => h('li', { text: fill(s[1]) })))));
  }
  if (S.stage >= 2) {
    parts.push(h('section', { class: 'ag-box', 'aria-labelledby': 'ag-rh' },
      h('h5', { id: 'ag-rh', text: 'Routing' }),
      h('ol', { class: 'ag-route' }, list.map((s, i) => h('li', null,
        h('span', { class: 'ag-role', text: s[0] }), h('b', { text: `Step ${i + 1}` }), h('span', { class: 'ag-why', text: s[2] }))))));
  }
  if (S.stage >= 3) {
    const roles = ROLES.filter((r) => list.some((s) => s[0] === r));
    parts.push(h('section', { class: 'ag-box ag-prop', 'aria-labelledby': 'ag-prop' },
      h('h5', { id: 'ag-prop', tabindex: -1, text: 'Proposal: waiting for a person' }),
      h('dl', { class: 'ag-facts' },
        h('div', null, h('dt', { text: 'What would happen' }), h('dd', { text: `${list.length} steps by ${roles.join(', ')}: ${fill(sc().label)}.` })),
        h('div', null, h('dt', { text: 'What it would touch (sample)' }), h('dd', { text: sc().touch.join('; ') })),
        h('div', null, h('dt', { text: 'Time estimate (sample)' }), h('dd', { text: sc().time }))),
      S.stage === 3 && h('div', { class: 'ag-row', role: 'group', 'aria-label': 'Your decision' },
        h('button', { type: 'button', class: 'btn ag-go', text: 'Approve', onclick: () => decide('approve') }),
        h('button', { type: 'button', class: 'ghost', text: 'Change', 'aria-disabled': String(S.alt), onclick: () => decide('change') }),
        h('button', { type: 'button', class: 'ghost', text: 'Stop', onclick: () => decide('stop') }))));
  }
  if (S.stage === 4) {
    parts.push(h('section', { class: 'ag-box ag-res', 'aria-labelledby': 'ag-res' },
      h('h5', { id: 'ag-res', tabindex: -1, text: 'Result' }), h('p', { text: S.result })));
  }
  U.view.replaceChildren(...parts);
}

export function mount(host) {
  stop();
  S = { sc: 0, v: SCENARIOS[0].pick, stage: 0, alt: false, result: '', timer: null };
  host.textContent = '';
  U = {};
  U.live = h('p', { class: 'ag-live', role: 'status', 'aria-live': 'polite' });
  U.chips = SCENARIOS.map((s, i) => h('button', { type: 'button', class: 'tog', text: s.label.replace('{v} ', ''),
    onclick: () => { S.sc = i; S.v = s.pick; reset(`Request picked: ${fill(s.label)}. Press Next or Play.`); } }));
  U.slotLab = h('label', { for: 'ag-slot' });
  U.sel = h('select', { id: 'ag-slot', onchange: (e) => { S.v = +e.target.value; reset(`${sc().slot[0]}: ${val()}. Request is now "${fill(sc().label)}".`); } });
  U.next = h('button', { type: 'button', class: 'btn', text: 'Next', onclick: () => {
    if (!advance()) { say(S.stage === 4 ? 'Done. Press Replay to run it again.' : 'The proposal waits for you: Approve, Change or Stop.'); return; }
    if (S.stage >= 3) stop();
    render();
  } });
  U.play = h('button', { type: 'button', class: 'ghost', text: 'Play', onclick: () => {
    if (S.timer) { stop(); render(); say('Paused.'); return; }
    if (S.stage >= 3) { say('Play stops at the proposal. It never approves.'); return; }
    S.timer = setInterval(() => {
      if (!S) return;
      advance();
      if (S.stage >= 3) stop();
      render();
    }, PLAY_MS);
    render();
    say(`Playing: one step every ${PLAY_MS / 1000} seconds. It stops at the proposal and never approves.`);
  } });
  const replay = h('button', { type: 'button', class: 'ghost', text: 'Replay', onclick: () => reset('Replay: back to the request. Nothing ran.') });
  U.step = h('p', { class: 'ag-step' });
  U.track = h('ol', { class: 'ag-track', 'aria-label': 'Progress' });
  U.view = h('div', { class: 'ag-view' });

  host.append(h('div', { class: 'ag' },
    h('p', { class: 'ag-honest', text: HONEST }),
    h('section', { class: 'ag-box', 'aria-labelledby': 'ag-pick' },
      h('h5', { id: 'ag-pick', text: '1. Pick a request' }),
      h('div', { class: 'ag-chips', role: 'group', 'aria-labelledby': 'ag-pick' }, U.chips),
      h('div', { class: 'ag-slot' }, U.slotLab, U.sel)),
    h('div', { class: 'ag-row' }, U.next, U.play, replay, U.step),
    U.track, U.live, U.view));
  render();
  say('Pick a request, then press Next or Play.');
}

export function unmount() {
  stop();
  S = null;
  U = null;
}
