// 玩家手机（CONTRACT §11）：轻讯会话列表、会话页、「过一会儿」、暂停/结局遮罩、toast。
// 只通过 app 读状态、发动作，不 import kernel/app。时间查询走 app.kernel（kernel.js 模块对象），没有时用本地近似。
// 界面上不区分作者台词和模型台词：消息只按 from / kind 画，不看 src。

const ICON = {
  back: '<svg viewBox="0 0 24 24" width="22" height="22" aria-hidden="true"><path d="M15 5l-7 7 7 7" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"/></svg>',
  lock: '<svg viewBox="0 0 24 24" width="22" height="22" aria-hidden="true"><rect x="5" y="10.5" width="14" height="10" rx="2.2" fill="none" stroke="currentColor" stroke-width="1.7"/><path d="M8.5 10.5V8a3.5 3.5 0 0 1 7 0v2.5" fill="none" stroke="currentColor" stroke-width="1.7"/><circle cx="12" cy="15.3" r="1.3" fill="currentColor"/></svg>',
  clock: '<svg viewBox="0 0 24 24" width="17" height="17" aria-hidden="true"><circle cx="12" cy="12" r="8.5" fill="none" stroke="currentColor" stroke-width="1.8"/><path d="M12 7.5V12l3 2" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/></svg>',
  caret: '<svg viewBox="0 0 24 24" width="14" height="14" aria-hidden="true"><path d="M6 9l6 6 6-6" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"/></svg>',
  down: '<svg viewBox="0 0 24 24" width="14" height="14" aria-hidden="true"><path d="M12 5v13M6 12l6 6 6-6" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"/></svg>',
  warn: '<svg viewBox="0 0 24 24" width="16" height="16" aria-hidden="true"><path d="M12 4l9 16H3z" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linejoin="round"/><path d="M12 10v4.5M12 17.2v.3" stroke="currentColor" stroke-width="1.9" stroke-linecap="round"/></svg>',
  go: '<svg viewBox="0 0 24 24" width="12" height="12" aria-hidden="true"><path d="M9 6l6 6-6 6" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"/></svg>',
};

const PALETTE = ['var(--p1)', 'var(--p2)', 'var(--p3)', 'var(--p4)', 'var(--p5)', 'var(--p6)'];
const WEEK = ['周日', '周一', '周二', '周三', '周四', '周五', '周六'];
const GAP = 20;            // 同一线程里两条消息隔这么多故事分钟就插一个时间签
const NEAR_BOTTOM = 72;    // 离底部这么近算"在底部"，新消息来了自动滚
const isPerson = (f) => !!f && f !== 'player' && f !== 'narrator' && f !== 'system';
const pad = (n) => String(n).padStart(2, '0');
const dayOf = (min) => Math.floor(min / 1440);
const hash = (s) => [...String(s)].reduce((a, c) => (a * 31 + c.codePointAt(0)) >>> 0, 7);

/** 小工具：建元素。文本一律走 textContent，模型输出不会被当成 HTML。 */
function h(tag, props, ...kids) {
  const n = document.createElement(tag);
  if (props) {
    for (const [k, v] of Object.entries(props)) {
      if (v === null || v === undefined || v === false) continue;
      if (k === 'class') n.className = v;
      else if (k === 'text') n.textContent = v;
      else if (k === 'html') n.innerHTML = v; // 只用于本文件里的静态图标
      else if (k === 'style') for (const [sk, sv] of Object.entries(v)) n.style.setProperty(sk, sv);
      else if (k.startsWith('on') && typeof v === 'function') n.addEventListener(k.slice(2), v);
      else n.setAttribute(k, v === true ? '' : String(v));
    }
  }
  for (const c of kids.flat(Infinity)) {
    if (c === null || c === undefined || c === false) continue;
    n.append(c.nodeType ? c : String(c));
  }
  return n;
}
const icon = (name, cls = 'pl-ic') => h('span', { class: cls, html: ICON[name], 'aria-hidden': 'true' });

export function mountPhone(el, app) {
  /* ---------- 界面自己的状态（不进存档） ---------- */
  const ui = {
    view: 'list', tid: null,
    drafts: new Map(),       // 每个线程的输入框草稿
    refOpen: new Set(),      // 展开了「参考回复」的线程
    refKey: null,
    confirm: null,           // 「过一会儿」确认条对应的下一站签名
    sending: false, jumping: false, resuming: false, refocus: false,
    rendered: [], queue: [], last: null, timer: null, typingFrom: null,
    forceBottom: false,
    endedSeen: null, ask: null,
    lastSeq: null, markPending: false, poll: null, busySig: '',
  };
  const reduceMotion = typeof matchMedia === 'function' ? matchMedia('(prefers-reduced-motion: reduce)') : { matches: false };

  /* ---------- 数据读取 ---------- */
  const K = () => app.kernel || null;
  const P = () => app.pkg || {};
  const X = () => app.extras || {};

  function displayTime(st) {
    const k = K();
    if (k && typeof k.displayTime === 'function') return k.displayTime(st);
    let t = st.now || 0;
    for (const id in st.threads) { const th = st.threads[id]; if (th.msgs.length && th.lastAt > t) t = th.lastAt; }
    return t;
  }
  function tl(min) {
    const st = app.st;
    const k = K();
    if (k && typeof k.timeLabel === 'function') return k.timeLabel(st, min);
    // 本地近似：与 kernel.timeLabel 同口径
    const m = ((min % 1440) + 1440) % 1440;
    const clock = `${pad(Math.floor(m / 60))}:${pad(m % 60)}`;
    const [y, mo, d] = String(st?.startDate || X().startDate || P().universe?.startDate || '2026-11-09').split('-').map(Number);
    const dt = new Date(Date.UTC(y, mo - 1, d + dayOf(min)));
    const date = `${dt.getUTCMonth() + 1}月${dt.getUTCDate()}日 ${WEEK[dt.getUTCDay()]}`;
    let ends = st?.endsAt;
    if (ends === undefined) { const mm = /^D(\d+) (\d\d):(\d\d)$/.exec(P().universe?.endsAt || ''); ends = mm ? mm[1] * 1440 + mm[2] * 60 + +mm[3] : 12 * 1440; }
    const left = dayOf(ends) - dayOf(min);
    const countdown = left > 0 ? `离婚礼还有 ${left} 天` : left === 0 ? '今天是婚礼' : '婚礼已经过去';
    return { clock, date, countdown };
  }
  function nextStop(st) {
    const k = K();
    if (k && typeof k.nextStop === 'function') return k.nextStop(app.pkg, st);
    // 本地近似：只知道待回答事件的截止时间
    if (st.ended) return { at: null, label: '故事已经结束', reasons: [], willTimeout: [] };
    if (st.halted) return { at: null, label: '剧情已暂停', reasons: [], willTimeout: [] };
    const ds = [...(st.open || [])].sort((a, b) => a.deadline - b.deadline);
    const at = ds.length ? ds[0].deadline : null;
    return { at, label: at === null ? '' : tl(at).clock, reasons: [], willTimeout: ds.filter((d) => d.deadline === at).map((d) => ({ node: d.node, owner: d.owner, title: d.title })) };
  }
  function busySet() {
    try { const b = app.busyThreads?.(); return b instanceof Set ? b : new Set(b || []); } catch { return new Set(); }
  }

  const personCache = new Map();
  function who(key) {
    if (!key) return { key, name: '', short: '', color: 'var(--muted)', intro: '', chat: false, initial: '' };
    let p = personCache.get(key);
    if (p && p.pkg === app.pkg) return p;
    const ex = X().people?.[key];
    const pkg = P();
    const cast = (pkg.cast || []).find((c) => c.key === key);
    const sup = cast ? null : (pkg.supporting || []).find((c) => c.key === key);
    const name = ex?.name || cast?.name || sup?.name || key;
    p = {
      pkg: app.pkg, key, name,
      short: ex?.short || cast?.name || sup?.name || key,
      color: ex?.color || PALETTE[hash(key) % PALETTE.length],
      intro: ex?.intro || cast?.publicIntro || cast?.role || sup?.role || sup?.note || '',
      chat: ex ? !!ex.chat : !!cast,
      initial: [...name][0] || '?',
    };
    personCache.set(key, p);
    return p;
  }
  const playerName = () => X().player?.name || 'Danny';
  const decisionsIn = (st, tid) => (st.open || []).filter((d) => d.thread === tid).sort((a, b) => a.openAt - b.openAt);
  const decisionIn = (st, tid) => decisionsIn(st, tid)[0] || null;

  function canTalk(st, t) {
    if (!t || st.ended || st.halted) return false;
    if (t.kind === 'scene') return !t.closed;
    if (t.kind === 'feed') return !!decisionIn(st, t.id);
    return who(t.with).chat || !!decisionIn(st, t.id);
  }
  function closedText(st, t) {
    if (st.ended) return '故事已经结束';
    if (st.halted) return '剧情已暂停';
    if (!t) return '';
    if (t.kind === 'scene') return '这一场结束了';
    if (t.kind === 'feed') return '';
    return `${who(t.with).short}现在没在等你回复`;
  }

  /* ---------- 骨架（只建一次；之后只改局部，输入框和滚动位置不会丢） ---------- */
  const statusClock = h('span', { class: 'pl-status-clock' });
  const statusDate = h('span', { class: 'pl-status-date' });
  const statusCount = h('span', { class: 'pl-status-count' });
  const statusBar = h('div', { class: 'pl-status', role: 'status', 'aria-label': '故事时间' }, statusClock, statusDate, statusCount);

  const listSub = h('span', { class: 'pl-appbar-sub' });
  const restartBtn = h('button', { class: 'pl-textbtn', type: 'button', onclick: () => { ui.ask = 'restart'; render(); } }, '重新开始');
  const endBanner = h('button', { class: 'pl-endbanner', type: 'button', hidden: true, onclick: () => { ui.endedSeen = null; render(); } });
  const rows = h('div', { class: 'pl-scroll pl-rows', role: 'list' });
  const listView = h('section', { class: 'pl-view pl-list', 'aria-label': '会话列表' },
    h('header', { class: 'pl-appbar pl-list-bar' },
      h('div', { class: 'pl-appbar-title' }, h('h2', { class: 'pl-brand' }, '轻讯'), listSub),
      restartBtn),
    endBanner, rows);

  const backCount = h('span', { class: 'pl-back-n' });
  const backBtn = h('button', { class: 'pl-back', type: 'button', onclick: () => goList() },
    icon('back'), backCount, h('span', { class: 'pl-sr' }, '返回会话列表'));
  const threadTitle = h('div', { class: 'pl-thread-title' });
  const threadSub = h('div', { class: 'pl-thread-sub' });
  const threadAv = h('span', { class: 'pl-thread-av' });
  const msgs = h('div', { class: 'pl-scroll pl-msgs', role: 'log', 'aria-live': 'polite', 'aria-label': '消息' });
  const newPill = h('button', { class: 'pl-newpill', type: 'button', hidden: true, onclick: () => { flushReveal(); toBottom(true); } }, icon('down'), '新消息');
  const refBar = h('div', { class: 'pl-ref', hidden: true });
  const ta = h('textarea', { class: 'pl-input', rows: '1', 'aria-label': '输入消息', enterkeyhint: 'send', maxlength: '500' });
  const sendBtn = h('button', { class: 'pl-send', type: 'button', onclick: () => send() }, '发送');
  const composer = h('div', { class: 'pl-composer' }, ta, sendBtn);
  const closedBar = h('div', { class: 'pl-closedbar', hidden: true });
  const dock = h('div', { class: 'pl-dock' }, refBar, composer, closedBar);
  const threadView = h('section', { class: 'pl-view pl-thread', 'aria-label': '会话' },
    h('header', { class: 'pl-appbar pl-thread-bar' }, backBtn, h('div', { class: 'pl-thread-head' }, threadTitle, threadSub), threadAv),
    h('div', { class: 'pl-msgwrap' }, msgs, newPill),
    dock);

  const views = h('div', { class: 'pl-views' }, listView, threadView);

  const jumpBtn = h('button', { class: 'pl-jump-btn', type: 'button', onclick: () => onJump() });
  const jumpWarn = h('div', { class: 'pl-jump-warn', role: 'alert' });
  const jumpBar = h('div', { class: 'pl-jump' }, jumpBtn, jumpWarn);
  const homeInd = h('div', { class: 'pl-homeind', 'aria-hidden': 'true' });
  const layer = h('div', { class: 'pl-layer', hidden: true });

  const screen = h('div', { class: 'pl-screen', 'data-view': 'list' }, statusBar, views, jumpBar, homeInd, layer);
  const phone = h('div', { class: 'pl-phone', 'data-settled': '1' }, screen);
  el.replaceChildren(phone);

  // toast 放在 body 上：窄屏切到后台时也能看到
  let toastHost = document.querySelector('.pl-toasts');
  if (!toastHost) { toastHost = h('div', { class: 'pl-toasts', 'aria-live': 'polite' }); document.body.append(toastHost); }

  /* ---------- 事件 ---------- */
  ta.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' && !e.shiftKey && !e.isComposing && e.keyCode !== 229) { e.preventDefault(); send(); }
  });
  ta.addEventListener('input', () => { autosize(); syncSendBtn(); if (ui.tid) ui.drafts.set(ui.tid, ta.value); });
  msgs.addEventListener('scroll', () => { if (nearBottom()) newPill.hidden = true; }, { passive: true });
  msgs.addEventListener('click', (e) => { if (ui.queue.length && !e.target.closest('button')) flushReveal(); });
  phone.addEventListener('keydown', (e) => {
    if (e.key !== 'Escape') return;
    if (ui.ask) { ui.ask = null; render(); }
    else if (ui.confirm) { ui.confirm = null; render(); }
  });

  const offs = [];
  const sub = (evt, fn) => { const off = app.on?.(evt, fn); if (typeof off === 'function') offs.push(off); };
  sub('change', () => render());
  sub('toast', (p) => toast(p?.text ?? String(p ?? ''), p?.kind));

  /* ---------- 导航 ---------- */
  function openThread(tid) {
    if (ui.tid && ui.tid !== tid) ui.drafts.set(ui.tid, ta.value);
    flushReveal(true);
    ui.view = 'thread';
    ui.tid = tid;
    ui.rendered = []; ui.queue = []; ui.last = null; ui.refKey = null;
    ta.value = ui.drafts.get(tid) || '';
    msgs.replaceChildren();
    newPill.hidden = true;
    ui.forceBottom = true;
    render();
    autosize();
    const touch = typeof matchMedia === 'function' && matchMedia('(hover: none)').matches;
    requestAnimationFrame(() => { toBottom(true); if (!touch && !ta.disabled && !composer.hidden) ta.focus({ preventScroll: true }); });
  }
  function goList() {
    if (ui.tid) ui.drafts.set(ui.tid, ta.value);
    flushReveal(true);
    ui.view = 'list';
    render();
    const row = rows.querySelector(`[data-thread="${CSS.escape(ui.tid || '')}"]`);
    if (row) row.focus({ preventScroll: false });
  }

  /* ---------- 渲染 ---------- */
  function render() {
    const st = app.st;
    if (!st) { rows.replaceChildren(h('p', { class: 'pl-empty' }, '正在准备…')); return; }
    // 新开了一局（seq 变小）：回到列表、清掉界面状态
    if (ui.lastSeq !== null && st.seq < ui.lastSeq) resetUi();
    ui.lastSeq = st.seq;
    if (ui.view === 'thread' && !st.threads[ui.tid]) { ui.view = 'list'; }
    screen.dataset.view = ui.view;
    listView.inert = ui.view !== 'list';
    threadView.inert = ui.view !== 'thread';
    renderStatus(st);
    renderList(st);
    if (ui.view === 'thread') renderThread(st);
    renderJump(st);
    renderLayer(st);
    maybeMarkRead(st);
    watchBusy();
    updateSettled();
  }

  function resetUi() {
    stopReveal();
    Object.assign(ui, { view: 'list', tid: null, rendered: [], queue: [], last: null, confirm: null, endedSeen: null, ask: null, refKey: null });
    ui.drafts.clear(); ui.refOpen.clear();
    msgs.replaceChildren();
    ta.value = '';
    personCache.clear();
  }

  function renderStatus(st) {
    const L = tl(displayTime(st));
    statusClock.textContent = L.clock;
    statusDate.textContent = L.date;
    statusCount.textContent = L.countdown;
  }

  /* 会话列表 */
  function threadList(st) {
    const out = [];
    if (st.threads.feed) out.push(st.threads.feed);
    for (const id of st.order || []) {
      if (id === 'feed') continue;
      const t = st.threads[id];
      if (t && t.msgs.length && !out.includes(t)) out.push(t);
    }
    // order 里漏掉的线程（防御）
    for (const id in st.threads) { const t = st.threads[id]; if (t.msgs.length && !out.includes(t)) out.push(t); }
    return out;
  }
  function previewOf(t, busy) {
    if (busy) return { text: '正在输入…', typing: true };
    const m = t.msgs[t.msgs.length - 1];
    if (!m) return { text: t.kind === 'feed' ? '暂时没有新动静' : '' };
    let text = m.kind === 'image_locked' ? '[图片]' : m.text;
    if (m.from === 'player') text = '你：' + text;
    else if (t.kind === 'scene' && isPerson(m.from)) text = who(m.from).short + '：' + text;
    return { text: text.replace(/\s+/g, ' ') };
  }
  function rowTime(min, now) {
    const d0 = dayOf(now), d1 = dayOf(min);
    const L = tl(min);
    if (d1 >= d0) return L.clock;
    if (d1 === d0 - 1) return '昨天';
    return L.date.split(' ')[0];
  }
  function avatar(t, cls = 'pl-av') {
    if (t.kind === 'feed') return h('span', { class: cls + ' is-feed', 'aria-hidden': 'true' }, '此');
    const p = who(t.with);
    return h('span', { class: cls + (t.kind === 'scene' ? ' is-scene' : ''), style: { '--c': p.color }, 'aria-hidden': 'true' }, p.initial || '现');
  }
  function titleOf(t) {
    if (t.kind === 'feed') return [t.title || '此刻'];
    if (t.kind === 'scene') return [h('span', { class: 'pl-tag' }, '现场'), t.title];
    return [t.title || who(t.with).name];
  }
  function renderList(st) {
    const now = displayTime(st);
    const busy = busySet();
    let unread = 0;
    const keep = rows.scrollTop;
    const items = threadList(st).map((t) => {
      unread += t.unread || 0;
      const pv = previewOf(t, busy.has(t.id));
      const waiting = decisionsIn(st, t.id).length > 0 && !st.ended;
      return h('div', { role: 'listitem' }, h('button', {
        class: 'pl-row' + (t.kind === 'feed' ? ' is-feed' : '') + (t.unread ? ' has-unread' : '') + (t.closed ? ' is-closed' : ''),
        type: 'button', 'data-thread': t.id, onclick: () => openThread(t.id),
      },
      avatar(t),
      h('span', { class: 'pl-row-main' },
        h('span', { class: 'pl-row-top' },
          h('span', { class: 'pl-row-title' }, titleOf(t)),
          h('span', { class: 'pl-row-time' }, t.msgs.length ? rowTime(t.lastAt, now) : '')),
        h('span', { class: 'pl-row-bottom' },
          h('span', { class: 'pl-row-preview' + (pv.typing ? ' is-typing' : '') }, pv.text),
          waiting ? h('span', { class: 'pl-wait' }, '等你回复') : null,
          t.unread ? h('span', { class: 'pl-badge' }, t.unread > 99 ? '99+' : String(t.unread), h('span', { class: 'pl-sr' }, ' 条未读')) : null))));
    });
    const focused = rows.contains(document.activeElement) ? document.activeElement.dataset.thread : null;
    rows.replaceChildren(...items);
    rows.scrollTop = keep;
    if (focused) rows.querySelector(`[data-thread="${CSS.escape(focused)}"]`)?.focus({ preventScroll: true });
    listSub.textContent = unread ? `${unread} 条未读` : '都看过了';
    const showEnd = !!st.ended && ui.endedSeen === endKey(st);
    endBanner.hidden = !showEnd;
    if (showEnd) endBanner.replaceChildren(h('span', null, '故事已经结束'), h('span', { class: 'pl-endbanner-go' }, '看结局', icon('go')));
  }

  /* 会话页 */
  function renderThread(st) {
    const t = st.threads[ui.tid];
    if (!t) return;
    const busy = busySet().has(t.id);
    threadTitle.replaceChildren(...titleOf(t));
    let sub = '';
    if (t.kind === 'feed') sub = '旁白和通知';
    else if (t.kind === 'scene') {
      const here = [...new Set(t.msgs.filter((m) => isPerson(m.from)).map((m) => who(m.from).short))];
      sub = (here.length ? '在场：' + here.join('、') : '') + (t.closed ? (here.length ? ' · ' : '') + '已结束' : '');
    } else sub = who(t.with).intro;
    if (busy && !t.closed) { threadSub.textContent = '正在输入…'; threadSub.classList.add('is-typing'); }
    else { threadSub.textContent = sub; threadSub.classList.remove('is-typing'); }
    threadSub.title = sub;
    threadAv.replaceChildren(t.kind === 'feed' ? '' : avatar(t, 'pl-av pl-av-sm'));
    // 返回键旁边：其它线程的未读数
    let others = 0;
    for (const id in st.threads) if (id !== t.id) others += st.threads[id].unread || 0;
    backCount.textContent = others ? String(others > 99 ? '99+' : others) : '';

    syncMsgs(st, t);
    renderTyping(st, t);
    renderDock(st, t);
  }

  function updateSettled() {
    const busy = ui.view === 'thread' && ui.tid && busySet().has(ui.tid);
    phone.dataset.settled = ui.queue.length || ui.timer || ui.sending || ui.jumping || ui.resuming || busy ? '0' : '1';
  }
  function nearBottom() { return msgs.scrollHeight - msgs.scrollTop - msgs.clientHeight < NEAR_BOTTOM; }
  function toBottom(force) {
    if (force || nearBottom()) { msgs.scrollTop = msgs.scrollHeight; newPill.hidden = true; }
  }

  // 新消息：玩家自己的立刻出现；别人的排队，带"正在输入"一条条放出来（纯视觉）
  function syncMsgs(st, t) {
    const list = t.msgs;
    const known = ui.rendered.length + ui.queue.length;
    let ok = known <= list.length;
    for (let i = 0; ok && i < ui.rendered.length; i++) if (list[i].id !== ui.rendered[i].id || list[i].text !== ui.rendered[i].text) ok = false;
    for (let i = 0; ok && i < ui.queue.length; i++) if (list[ui.rendered.length + i].id !== ui.queue[i].id) ok = false;
    if (!ok) {
      // 对不上（新开一局、存档换了）：整段重画
      stopReveal();
      const keep = msgs.scrollTop, stick = nearBottom();
      msgs.replaceChildren();
      ui.rendered = []; ui.queue = []; ui.last = null;
      for (const m of list) appendMsg(t, m);
      if (stick || ui.forceBottom) toBottom(true); else msgs.scrollTop = keep;
      ui.forceBottom = false;
      return;
    }
    const fresh = list.slice(known);
    if (ui.forceBottom && ui.rendered.length === 0 && !ui.queue.length) {
      // 刚打开会话：已有消息一次画完
      for (const m of fresh) appendMsg(t, m);
      toBottom(true);
      ui.forceBottom = false;
      return;
    }
    for (const m of fresh) {
      if (m.from === 'player' || reduceMotion.matches || document.hidden) {
        flushReveal();
        const stick = nearBottom() || m.from === 'player' || ui.forceBottom;
        appendMsg(t, m, true);
        if (stick) toBottom(true); else newPill.hidden = false;
      } else ui.queue.push(m);
    }
    if (ui.forceBottom) { toBottom(true); ui.forceBottom = false; }
    if (ui.queue.length) startReveal();
  }

  function revealDelay(m) {
    const fast = ui.queue.length > 4 ? 0.55 : 1;
    if (m.kind === 'notice' || m.kind === 'recall') return 420 * fast;
    if (m.kind === 'image_locked') return 900 * fast;
    return (480 + Math.min([...m.text].length * 18, 720)) * fast;
  }
  function startReveal() {
    if (ui.timer) return;
    const step = () => {
      const m = ui.queue[0];
      if (!m) { ui.timer = null; ui.typingFrom = null; afterReveal(); updateSettled(); return; }
      ui.typingFrom = isPerson(m.from) ? m.from : null;
      renderTyping(app.st, app.st?.threads[ui.tid]);
      ui.timer = setTimeout(() => {
        ui.timer = null;
        const t = app.st?.threads[ui.tid];
        if (!t || ui.queue[0] !== m) { ui.typingFrom = null; updateSettled(); return; }
        ui.queue.shift();
        const stick = nearBottom();
        appendMsg(t, m, true);
        if (stick) toBottom(true); else newPill.hidden = false;
        step();
      }, revealDelay(m));
    };
    step();
  }
  function stopReveal() {
    if (ui.timer) clearTimeout(ui.timer);
    ui.timer = null; ui.typingFrom = null;
  }
  function flushReveal(silent) {
    if (!ui.queue.length) return;
    stopReveal();
    const t = app.st?.threads[ui.tid];
    const stick = nearBottom();
    if (t) for (const m of ui.queue) appendMsg(t, m, !silent);
    ui.queue = [];
    if (!silent) { if (stick) toBottom(true); else newPill.hidden = false; afterReveal(); }
  }
  function afterReveal() {
    const st = app.st;
    if (!st) return;
    const t = st.threads[ui.tid];
    if (t) renderTyping(st, t);
    renderLayer(st); // 结局遮罩等消息放完再出
  }

  function chipLabel(min, withDate) {
    const L = tl(min);
    return withDate ? `${L.date} ${L.clock}` : L.clock;
  }

  function appendMsg(t, m, live) {
    const prev = ui.last;
    const els = [];
    const newDay = !prev || dayOf(prev.at) !== dayOf(m.at);
    const chip = newDay || m.at - prev.at >= GAP;
    if (chip) els.push(h('div', { class: 'pl-chip' }, chipLabel(m.at, newDay)));
    const isNotice = m.kind === 'notice' || m.kind === 'recall';
    if (isNotice && m.from === 'narrator') {
      els.push(h('div', { class: 'pl-narr', 'data-id': m.id }, h('p', null, m.text)));
    } else if (isNotice) {
      const sceneId = m.node && 'scene:' + m.node;
      const st = app.st;
      if (t.kind === 'feed' && sceneId && st?.threads[sceneId] && /^现场[：:]/.test(m.text)) {
        els.push(h('div', { class: 'pl-sysrow', 'data-id': m.id },
          h('button', { class: 'pl-sys pl-sys-link', type: 'button', onclick: () => openThread(sceneId) }, m.text, h('span', { class: 'pl-sys-go' }, '去看看', icon('go')))));
      } else {
        els.push(h('div', { class: 'pl-sysrow', 'data-id': m.id }, h('span', { class: 'pl-sys' + (m.kind === 'recall' ? ' is-recall' : '') }, m.text)));
      }
    } else {
      const me = m.from === 'player';
      const p = me ? null : who(m.from);
      const runStart = chip || !prev || prev.from !== m.from || prev.kind === 'notice' || prev.kind === 'recall';
      const showName = !me && runStart && (t.kind === 'scene' || (t.kind !== 'feed' && m.from !== t.with) || t.kind === 'feed');
      const showAv = !me && t.kind === 'scene';
      const body = m.kind === 'image_locked'
        ? h('div', { class: 'pl-locked', role: 'img', 'aria-label': '私密图片，不展示', draggable: 'false', oncontextmenu: (e) => e.preventDefault() },
          icon('lock', 'pl-locked-ic'), h('span', null, '私密图片 · 不展示'))
        : h('div', { class: 'pl-bubble' }, m.text);
      els.push(h('div', {
        class: 'pl-msg ' + (me ? 'is-me' : 'is-in') + (runStart ? ' is-start' : ' is-cont') + (showAv ? ' has-av' : '') + (m.kind === 'image_locked' ? ' is-image' : ''),
        'data-id': m.id, style: p ? { '--c': p.color } : null,
      },
      showAv ? (runStart ? h('span', { class: 'pl-av pl-av-xs', 'aria-hidden': 'true' }, p.initial) : h('span', { class: 'pl-av-gap', 'aria-hidden': 'true' })) : null,
      h('div', { class: 'pl-msg-col' },
        showName ? h('div', { class: 'pl-msg-name' }, p.short) : null,
        me ? h('span', { class: 'pl-sr' }, playerName() + '：') : (showName ? null : h('span', { class: 'pl-sr' }, p.short + '：')),
        body)));
    }
    // 打字气泡始终留在最后
    const typing = msgs.querySelector('.pl-typing');
    for (const e of els) { if (live) e.classList.add('is-new'); msgs.insertBefore(e, typing); }
    ui.rendered.push({ id: m.id, text: m.text });
    ui.last = m;
  }

  function renderTyping(st, t) {
    let tp = msgs.querySelector('.pl-typing');
    let from = ui.typingFrom;
    if (!from && st && t && !t.closed && busySet().has(t.id)) from = isPerson(t.with) ? t.with : null;
    if (!from) { if (tp) tp.remove(); return; }
    const p = who(from);
    const key = from + '|' + (t?.kind || '');
    if (tp && tp.dataset.key === key) { if (tp !== msgs.lastElementChild) msgs.append(tp); return; }
    if (tp) tp.remove();
    const scene = t?.kind === 'scene';
    tp = h('div', { class: 'pl-msg is-in is-start pl-typing' + (scene ? ' has-av' : ''), 'data-key': key, style: { '--c': p.color }, role: 'status', 'aria-label': `${p.short}正在输入` },
      scene ? h('span', { class: 'pl-av pl-av-xs', 'aria-hidden': 'true' }, p.initial) : null,
      h('div', { class: 'pl-msg-col' },
        scene ? h('div', { class: 'pl-msg-name' }, p.short) : null,
        h('div', { class: 'pl-bubble pl-dots', 'aria-hidden': 'true' }, h('i'), h('i'), h('i'))));
    const stick = nearBottom();
    msgs.append(tp);
    if (stick) toBottom(true);
  }

  function renderDock(st, t) {
    const d = st.ended || st.halted ? null : decisionIn(st, t.id);
    const talk = canTalk(st, t);
    const busy = ui.sending || busySet().has(t.id);
    // 参考回复
    const open = ui.refOpen.has(t.id);
    const key = d && talk ? `${t.id}|${d.node}|${open}|${d.deadline}` : 'none';
    if (key !== ui.refKey) {
      ui.refKey = key;
      if (!d || !talk) { refBar.hidden = true; refBar.replaceChildren(); }
      else {
        refBar.hidden = false;
        const L = tl(d.deadline);
        const sameDay = dayOf(d.deadline) === dayOf(displayTime(st));
        const toggle = h('button', { class: 'pl-ref-toggle' + (open ? ' is-open' : ''), type: 'button', 'aria-expanded': String(open), onclick: () => { if (open) ui.refOpen.delete(t.id); else ui.refOpen.add(t.id); render(); } },
          '参考回复', icon('caret'));
        const due = h('span', { class: 'pl-ref-due' }, `等你回复 · ${sameDay ? '' : L.date.split(' ')[0] + ' '}${L.clock} 前`);
        const panel = open ? h('div', { class: 'pl-ref-cards' }, d.intents.map((it) =>
          h('button', { class: 'pl-ref-card', type: 'button', title: it.examples?.[0] || it.label, onclick: () => fill(it.examples?.[0] || it.label) },
            h('span', { class: 'pl-ref-label' }, it.label),
            h('span', { class: 'pl-ref-ex' }, it.examples?.[0] || '')))) : null;
        refBar.replaceChildren(...[h('div', { class: 'pl-ref-row' }, toggle, due), panel].filter(Boolean));
      }
    }
    composer.hidden = !talk;
    closedBar.hidden = talk;
    if (!talk) closedBar.textContent = closedText(st, t);
    dock.hidden = !talk && t.kind === 'feed' && !st.ended && !st.halted;
    ta.disabled = ui.sending;
    ta.placeholder = busy ? '对方正在输入…' : t.kind === 'scene' ? '当面说点什么' : t.kind === 'feed' ? '说点什么' : `发消息给${who(t.with).short}`;
    syncSendBtn();
  }
  function syncSendBtn() {
    sendBtn.disabled = ui.sending || ui.jumping || !ta.value.trim();
  }
  function autosize() {
    ta.style.height = 'auto';
    ta.style.height = Math.min(ta.scrollHeight, 132) + 'px';
  }
  function fill(text) {
    ta.value = text;
    if (ui.tid) ui.drafts.set(ui.tid, text);
    autosize(); syncSendBtn();
    ta.focus({ preventScroll: true });
    try { ta.setSelectionRange(text.length, text.length); } catch { /* 有些浏览器不支持 */ }
  }

  async function send() {
    const st = app.st;
    const t = st?.threads[ui.tid];
    const text = ta.value.trim();
    if (!t || !text || ui.sending || ui.jumping || !canTalk(st, t)) return;
    ui.sending = true;
    ui.refocus = document.activeElement === ta;
    ta.value = '';
    ui.drafts.delete(t.id);
    ui.refOpen.delete(t.id);
    autosize();
    flushReveal();
    ui.forceBottom = true;
    render();
    try {
      await app.act.send(t.id, text);
    } catch (err) {
      if (!ta.value) { ta.value = text; ui.drafts.set(t.id, text); autosize(); }
      toast('没发出去，再试一次', 'warn');
      console.warn('[phone] send failed', err);
    } finally {
      ui.sending = false;
      render();
      if (ui.refocus && ui.view === 'thread' && !ta.disabled && !composer.hidden) ta.focus({ preventScroll: true });
    }
  }

  /* 「过一会儿」 */
  const stopKey = (ns) => `${ns.at}|${(ns.willTimeout || []).map((w) => w.node).join(',')}`;
  function whoWaits(ns) {
    const names = [];
    for (const w of ns.willTimeout || []) {
      const n = w.owner ? who(w.owner).short : w.title || '有人';
      if (!names.includes(n)) names.push(n);
    }
    return names;
  }
  function renderJump(st) {
    const ns = nextStop(st);
    const blocked = ns.at === null || ns.at === undefined;
    if (ui.confirm && (blocked || ui.confirm !== stopKey(ns))) ui.confirm = null;
    const confirming = !!ui.confirm && !ui.jumping;
    jumpBar.classList.toggle('is-confirm', confirming);
    jumpBar.classList.toggle('is-off', blocked);
    if (ui.jumping) {
      jumpBtn.replaceChildren(icon('clock'), h('span', { class: 'pl-jump-main' }, '时间在走…'));
      jumpBtn.disabled = true;
    } else if (blocked) {
      jumpBtn.replaceChildren(icon('clock'), h('span', { class: 'pl-jump-main' }, ns.label || '现在没有可以跳过去的时间'));
      jumpBtn.disabled = true;
    } else if (confirming) {
      jumpBtn.replaceChildren(h('span', { class: 'pl-jump-main' }, '确认跳过'));
      jumpBtn.disabled = false;
    } else {
      jumpBtn.replaceChildren(...[icon('clock'), h('span', { class: 'pl-jump-main' }, '过一会儿'), ns.label ? h('span', { class: 'pl-jump-to' }, '到 ' + ns.label) : null].filter(Boolean));
      jumpBtn.disabled = ui.sending;
    }
    jumpBtn.setAttribute('aria-label', confirming ? '确认跳过，没回的消息按没回处理' : blocked ? (ns.label || '不能跳') : `过一会儿，到 ${ns.label || ''}`);
    if (confirming) {
      const names = whoWaits(ns);
      jumpWarn.hidden = false;
      jumpWarn.replaceChildren(icon('warn'), h('span', null, `${names.join('、')}的消息你还没回，跳过去就算没回`),
        h('button', { class: 'pl-jump-cancel', type: 'button', onclick: () => { ui.confirm = null; render(); } }, '先不跳'));
    } else { jumpWarn.hidden = true; jumpWarn.replaceChildren(); }
  }
  async function onJump() {
    const st = app.st;
    if (!st || ui.jumping || ui.sending) return;
    const ns = nextStop(st);
    if (ns.at === null || ns.at === undefined) return;
    if ((ns.willTimeout || []).length && ui.confirm !== stopKey(ns)) { ui.confirm = stopKey(ns); render(); return; }
    ui.confirm = null;
    ui.jumping = true;
    render();
    try { await app.act.jump(); } catch (err) { toast('时间没能往前走，再试一次', 'warn'); console.warn('[phone] jump failed', err); } finally { ui.jumping = false; render(); }
  }

  /* 遮罩：暂停 / 结局 / 重新开始确认 */
  const endKey = (st) => st.ended ? `${st.ended.ending}|${st.ended.at ?? ''}` : null;
  function haltText(st) {
    const hl = st.halted;
    const t = st.threads[hl.thread] || null;
    const m = t && [...t.msgs].reverse().find((x) => x.from === 'system' && (hl.at === undefined || x.at >= hl.at));
    return m?.text || '剧情暂停了。点「继续」之后，故事接着往下走。';
  }
  let layerKey = '';
  function renderLayer(st) {
    let key = '', build = null;
    if (st.halted) {
      key = 'halt|' + JSON.stringify(st.halted) + '|' + ui.resuming;
      build = () => h('div', { class: 'pl-scrim' },
        h('div', { class: 'pl-sheet pl-halt', role: 'alertdialog', 'aria-modal': 'true', 'aria-labelledby': 'pl-halt-title' },
          h('h3', { id: 'pl-halt-title', class: 'pl-sheet-title' }, '先停一下'),
          h('p', { class: 'pl-sheet-text' }, haltText(st)),
          h('div', { class: 'pl-actions' },
            h('button', { class: 'pl-btn is-primary', type: 'button', disabled: ui.resuming, 'data-autofocus': '', onclick: async () => {
              if (ui.resuming) return;
              ui.resuming = true; render();
              try { await app.act.resume(); } finally { ui.resuming = false; render(); }
            } }, '继续'))));
    } else if (st.ended && ui.endedSeen !== endKey(st) && !ui.queue.length) {
      key = 'end|' + endKey(st);
      const e = st.ended;
      build = () => h('div', { class: 'pl-ending', role: 'dialog', 'aria-modal': 'true', 'aria-labelledby': 'pl-end-title' },
        h('div', { class: 'pl-ending-inner' },
          h('p', { class: 'pl-ending-kicker' }, '结局' + (e.at !== undefined ? ' · ' + tl(e.at).date : '')),
          h('h2', { id: 'pl-end-title', class: 'pl-ending-title' }, e.title || '故事结束了'),
          e.text ? h('p', { class: 'pl-ending-text' }, e.text) : null,
          (e.epilogues || []).length ? h('div', { class: 'pl-epi' },
            h('p', { class: 'pl-epi-head' }, '后来'),
            h('ul', null, e.epilogues.map((x) => h('li', null, x)))) : null,
          h('div', { class: 'pl-actions' },
            h('button', { class: 'pl-btn', type: 'button', onclick: () => app.view?.show?.('admin') }, '看看后台'),
            h('button', { class: 'pl-btn is-primary', type: 'button', 'data-autofocus': '', onclick: () => restart() }, '重新开始')),
          h('button', { class: 'pl-textbtn pl-ending-back', type: 'button', onclick: () => { ui.endedSeen = endKey(st); render(); } }, '回看对话')));
    } else if (ui.ask === 'restart') {
      key = 'ask';
      build = () => h('div', { class: 'pl-scrim', onclick: (ev) => { if (ev.target === ev.currentTarget) { ui.ask = null; render(); } } },
        h('div', { class: 'pl-sheet', role: 'alertdialog', 'aria-modal': 'true', 'aria-labelledby': 'pl-ask-title' },
          h('h3', { id: 'pl-ask-title', class: 'pl-sheet-title' }, '重新开始一局？'),
          h('p', { class: 'pl-sheet-text' }, '这一局的消息和进度会清空，从第一天晚上九点半重新来。'),
          h('div', { class: 'pl-actions' },
            h('button', { class: 'pl-btn', type: 'button', onclick: () => { ui.ask = null; render(); } }, '取消'),
            h('button', { class: 'pl-btn is-primary', type: 'button', 'data-autofocus': '', onclick: () => restart() }, '重新开始'))));
    }
    const modal = !!build;
    views.inert = modal;
    jumpBar.inert = modal;
    if (key === layerKey) return;
    layerKey = key;
    if (!build) { layer.hidden = true; layer.replaceChildren(); return; }
    layer.hidden = false;
    layer.replaceChildren(build());
    const f = layer.querySelector('[data-autofocus]');
    if (f) requestAnimationFrame(() => f.focus({ preventScroll: true }));
  }
  async function restart() {
    ui.ask = null;
    resetUi();
    ui.lastSeq = null;
    render();
    try { await app.act.restart(); } finally { ui.lastSeq = null; render(); }
  }

  /* 已读：打开的会话有未读就标掉（延后一拍，避免在渲染里递归） */
  function maybeMarkRead(st) {
    if (ui.view !== 'thread' || ui.markPending) return;
    const t = st.threads[ui.tid];
    if (!t || !t.unread) return;
    ui.markPending = true;
    setTimeout(() => {
      ui.markPending = false;
      const cur = app.st?.threads[ui.tid];
      if (ui.view === 'thread' && cur && cur.unread) {
        try { const r = app.act.markRead(ui.tid); if (r && typeof r.catch === 'function') r.catch(() => {}); } catch { /* 忽略 */ }
      }
    }, 0);
  }

  /* 动作进行中时轮询「正在输入」（app 不一定为它单独发 change） */
  function watchBusy() {
    const pending = ui.sending || ui.jumping || ui.resuming;
    if (pending && !ui.poll) {
      ui.poll = setInterval(() => {
        const sig = [...busySet()].sort().join(',');
        if (sig !== ui.busySig) { ui.busySig = sig; render(); }
        if (!(ui.sending || ui.jumping || ui.resuming)) { clearInterval(ui.poll); ui.poll = null; }
      }, 200);
    }
    ui.busySig = [...busySet()].sort().join(',');
  }

  /* toast：3 秒消失 */
  function toast(text, kind) {
    if (!text) return;
    const n = h('div', { class: 'pl-toast' + (kind === 'warn' ? ' is-warn' : ''), role: 'status' }, text);
    toastHost.append(n);
    while (toastHost.children.length > 3) toastHost.firstElementChild.remove();
    setTimeout(() => { n.classList.add('is-out'); setTimeout(() => n.remove(), 260); }, 3000);
  }

  render();

  return {
    destroy() { offs.forEach((f) => f()); stopReveal(); if (ui.poll) clearInterval(ui.poll); el.replaceChildren(); },
    openThread, goList, render,
  };
}
