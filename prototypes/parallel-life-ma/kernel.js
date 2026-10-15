// 世界内核（CONTRACT §7）：状态、谁知道什么、条件、效果、结果、结局、消息路由、架空时间。纯代码，不调模型。
// evalCond / applyEffects / pickOutcome / 越界输入过滤 与 runtime-lite.mjs 逐函数同义；
// 不同处只有：knows 用数组（可存档）、节点开始后决策挂起等玩家回答（runtime-lite 是立刻选）、消息进对话线程。
import { tick, crisisLimit, inQuiet } from './director.js';
import { EXTRAS } from './world-extras.js';

let X = EXTRAS; // 当前用的补充数据，newGame 可以换

export const IMG = '[私密图片 · 不展示]';
const LOG_CAP = 800;

/* ---------- 时间刻度 ---------- */
const tmCache = new Map();
export const toMin = (t) => {
  let v = tmCache.get(t);
  if (v !== undefined) return v;
  const m = /^D(\d+) (\d{2}):(\d{2})$/.exec(t);
  if (!m) throw new Error('bad DayTime ' + t);
  const h = Number(m[2]), mm = Number(m[3]);
  if (h > 24 || mm > 59 || (h === 24 && mm !== 0)) throw new Error('bad DayTime ' + t);
  v = Number(m[1]) * 1440 + h * 60 + mm;
  tmCache.set(t, v);
  return v;
};
export const fmt = (n) => `D${Math.floor(n / 1440)} ${String(Math.floor((n % 1440) / 60)).padStart(2, '0')}:${String(n % 60).padStart(2, '0')}`;

export const COND_KEYS = ['all', 'any', 'not', 'var', 'flag', 'stage', 'node', 'knows', 'after', 'before', 'collision', 'is'];
export const EFFECT_KEYS = ['set', 'add', 'addTo', 'stage', 'reveal', 'send', 'if'];
const one = (o, keys, what) => {
  const hit = keys.filter((k) => k in o);
  if (hit.length !== 1) throw new Error(`${what} 必须正好有一个判别键：${JSON.stringify(o)}`);
  return hit[0];
};

/* ---------- 查表 ---------- */
const idx = new WeakMap();
function index(pkg) {
  let i = idx.get(pkg);
  if (!i) {
    i = {
      nodes: new Map(pkg.nodes.map((n) => [n.key, n])),
      conds: new Map(pkg.conds.map((c) => [c.key, c])),
      cols: new Map(pkg.collisions.map((c) => [c.key, c])),
      vars: new Map(pkg.vars.map((v) => [v.key, v])),
      facts: new Map(pkg.facts.map((f) => [f.key, f])),
    };
    idx.set(pkg, i);
  }
  return i;
}
export const nodeOf = (pkg, key) => index(pkg).nodes.get(key) || null;
const asNode = (pkg, n) => (!n ? null : typeof n === 'string' ? nodeOf(pkg, n) : n);
export function personName(pkg, key) {
  const c = pkg.cast.find((x) => x.key === key) || pkg.supporting.find((x) => x.key === key);
  return c?.name || X.people?.[key]?.name || (key === 'player' ? X.player?.name || 'Danny' : key);
}

/* ---------- 日志 ---------- */
function klog(st, kind, text) {
  st.kernelLog.push({ at: st.now, kind, text });
  if (st.kernelLog.length > LOG_CAP) st.kernelLog.splice(0, st.kernelLog.length - LOG_CAP);
}

/* ---------- 谁知道什么 ---------- */
function learn(st, who, fact, via) {
  const k = (st.knows[who] ??= {});
  const arr = (k[fact] ??= []);
  if (!arr.includes(via)) arr.push(via);
}
const VIA_LABEL = { saw: '亲眼看到', told: '你亲口告诉', heard: '听别人说' };

/* ---------- 新开一局 ---------- */
export function newGame(pkg, extras) {
  X = extras || EXTRAS;
  const vars = {};
  for (const v of pkg.vars) vars[v.key] = Array.isArray(v.default) ? [...v.default] : v.default;
  const stages = {};
  for (const c of pkg.cast) stages[c.key] = c.initialStage;
  const st = {
    v: 1, seq: 0, now: 0, vars, stages, knows: {}, ran: {}, outcome: {}, fired: {}, crises: [],
    open: [], threads: {}, order: [], halted: null, ended: null, proactive: {}, memory: {},
    directorLog: [], kernelLog: [],
    // 以下是约定之外的补充字段（都可序列化）
    startDate: X.startDate || pkg.universe.startDate,
    endsAt: toMin(pkg.universe.endsAt),
    pending: [],      // 效果里带 delayMinutes 的消息，到点（跳时间经过）才送达
    seen: {},         // 导演见过“条件成立”的节点（检查 must 用）
    blocked: {},      // 导演挡下节点的最近原因（去重日志用）
    missed: {},       // 窗口已过、没发生的节点
    boundaryLog: [],  // 命中的越界输入 [{key,node,thread,at}]
  };
  for (const f of pkg.facts) for (const k of f.knownBy) learn(st, k, f.key, 'saw');
  ensureThread(pkg, st, 'feed');
  st.now = toMin(pkg.universe.clock.startsAt);
  klog(st, 'start', `新开一局：${pkg.universe.title}，故事钟从 ${fmt(st.now)} 开始`);
  tick(pkg, st);
  return st;
}

/* ---------- 条件（与 runtime-lite 同义） ---------- */
export function evalCond(pkg, st, c) {
  const k = one(c, COND_KEYS, '条件');
  if (k === 'all') return c.all.every((x) => evalCond(pkg, st, x));
  if (k === 'any') return c.any.some((x) => evalCond(pkg, st, x));
  if (k === 'not') return !evalCond(pkg, st, c.not);
  if (k === 'var') {
    const v = st.vars[c.var];
    if ('eq' in c && v !== c.eq) return false;
    if ('ne' in c && v === c.ne) return false;
    if ('gte' in c && !(v >= c.gte)) return false;
    if ('lte' in c && !(v <= c.lte)) return false;
    if ('in' in c && !c.in.includes(v)) return false;
    if ('has' in c && !(Array.isArray(v) && v.includes(c.has))) return false;
    return true;
  }
  if (k === 'flag') return st.vars[c.flag] === true;
  if (k === 'stage') return c.in.includes(st.stages[c.stage]);
  if (k === 'node') return !!st.ran[c.node] && st.outcome[c.node] !== undefined && (!c.outcome || c.outcome.includes(st.outcome[c.node]));
  if (k === 'knows') {
    const s = st.knows[c.knows]?.[c.fact];
    return !!s && s.length > 0 && (!c.via || c.via.some((v) => s.includes(v)));
  }
  if (k === 'after') return st.now >= toMin(c.after);
  if (k === 'before') return st.now < toMin(c.before);
  if (k === 'collision') {
    const col = index(pkg).cols.get(c.collision);
    return !st.fired[c.collision] && evalCond(pkg, st, col.when);
  }
  return evalCond(pkg, st, index(pkg).conds.get(c.is).when);
}

/* ---------- 线程与消息 ---------- */
let capture = null; // applyJudgement 用来收集这一次结算送出的消息

function ensureThread(pkg, st, id) {
  let t = st.threads[id];
  if (t) return t;
  if (id === 'feed') t = { id, kind: 'feed', title: '此刻', with: null, node: null };
  else if (id.startsWith('scene:')) {
    const n = nodeOf(pkg, id.slice(6));
    t = { id, kind: 'scene', title: n?.title || id.slice(6), with: n?.owner ?? null, node: n?.key ?? id.slice(6) };
  } else t = { id, kind: 'chat', title: personName(pkg, id), with: id, node: null };
  Object.assign(t, { closed: false, msgs: [], unread: 0, lastAt: 0 });
  st.threads[id] = t;
  return t;
}

const isPerson = (from) => from !== 'narrator' && from !== 'system' && from !== 'player';
export function kindOf(from, text) {
  if (text === IMG) return 'image_locked';
  if (from === 'system' && String(text).includes('撤回了一条消息')) return 'recall';
  if (from === 'narrator' || from === 'system') return 'notice';
  return 'text';
}

/** 消息该进哪个线程（§5）。 */
export function routeOf(pkg, node, from) {
  node = asNode(pkg, node);
  if (node && node.kind === 'scene') return 'scene:' + node.key;
  if (node && (node.kind === 'chat' || node.kind === 'call')) return isPerson(from) ? from : node.owner || 'feed';
  return isPerson(from) ? from : 'feed';
}
const decisionThread = (node) => (node.kind === 'scene' ? 'scene:' + node.key : node.owner || 'feed');

function pushMsg(pkg, st, threadId, m) {
  if (threadId.startsWith('scene:') && !st.threads[threadId]) {
    const t = ensureThread(pkg, st, threadId);
    pushMsg(pkg, st, 'feed', { from: 'system', text: '现场：' + t.title, kind: 'notice', src: 'system', at: m.at, node: t.node });
  }
  const t = ensureThread(pkg, st, threadId);
  const msg = { id: 'm' + ++st.seq, at: Math.max(m.at, t.lastAt), from: m.from, text: m.text, kind: m.kind, src: m.src };
  if (m.node) msg.node = m.node;
  t.msgs.push(msg);
  t.lastAt = msg.at;
  if (msg.from !== 'player') t.unread++;
  const i = st.order.indexOf(threadId);
  if (i >= 0) st.order.splice(i, 1);
  st.order.unshift(threadId);
  if (capture) capture.push({ thread: threadId, msg });
  return msg;
}

/** 送一组作者写好的消息。ctx = { node, at, speaker, thread（强制线程）, defer（带延迟的放进 pending） }。返回送出（或排上）的消息。 */
function deliverMsgs(pkg, st, msgs, ctx) {
  const node = asNode(pkg, ctx.node);
  const out = [];
  for (const m of msgs || []) {
    if (m.when && !evalCond(pkg, st, m.when)) continue;
    const from = m.from === 'speaker' ? ctx.speaker || node?.owner || 'system' : m.from;
    const gist = m.mode === 'gist';
    const text = gist ? m.fallback ?? m.text : m.text;
    const delay = m.delayMinutes || 0;
    const at = (ctx.at ?? st.now) + delay;
    const thread = ctx.thread || routeOf(pkg, node, from);
    const msg = { from, text, kind: kindOf(from, text), src: gist ? 'fallback' : 'authored', at };
    if (node) msg.node = node.key;
    if (ctx.defer && delay > 0) {
      st.pending.push({ at, thread, msg });
      if (capture) capture.push({ thread, msg, pending: true });
      out.push(msg);
    } else out.push(pushMsg(pkg, st, thread, msg));
  }
  return out;
}

function flushPending(pkg, st) {
  if (!st.pending.length) return;
  const due = st.pending.filter((p) => p.at <= st.now).sort((a, b) => a.at - b.at);
  if (!due.length) return;
  st.pending = st.pending.filter((p) => p.at > st.now);
  for (const p of due) pushMsg(pkg, st, p.thread, p.msg);
}

/* ---------- 效果（与 runtime-lite 同义） ---------- */
export function applyEffects(pkg, st, effects, ctx = {}) {
  const node = asNode(pkg, ctx.node);
  const where = node ? node.key : ctx.label || '自由聊天';
  for (const e of effects || []) {
    const k = one(e, EFFECT_KEYS, '效果');
    if (k === 'if') { applyEffects(pkg, st, evalCond(pkg, st, e.if) ? e.then : e.else || [], ctx); continue; }
    if (k === 'set') {
      const old = st.vars[e.set];
      st.vars[e.set] = e.value;
      if (old !== e.value) klog(st, 'var', `${e.set}：${JSON.stringify(old)} → ${JSON.stringify(e.value)}（${where}）`);
    } else if (k === 'add') {
      const v = index(pkg).vars.get(e.add);
      const old = st.vars[e.add];
      const [lo, hi] = v?.range || [-Infinity, Infinity];
      st.vars[e.add] = Math.max(lo, Math.min(hi, old + e.delta));
      klog(st, 'var', `${e.add}：${old} → ${st.vars[e.add]}（${where}）`);
    } else if (k === 'addTo') {
      if (!st.vars[e.addTo].includes(e.value)) {
        st.vars[e.addTo].push(e.value);
        klog(st, 'var', `${e.addTo} 加上 ${e.value}（${where}）`);
      }
    } else if (k === 'stage') {
      const old = st.stages[e.stage];
      st.stages[e.stage] = e.to;
      if (old !== e.to) klog(st, 'stage', `${personName(pkg, e.stage)}：${old} → ${e.to}（${where}）`);
    } else if (k === 'reveal') {
      // 只能说出自己知道的事
      const teller = e.via === 'told' ? 'player' : e.via === 'heard' ? e.from : null;
      if (teller && !st.knows[teller]?.[e.reveal]) { klog(st, 'reveal', `${e.reveal} 未生效：${personName(pkg, teller)} 不知道（${where}）`); continue; }
      for (const who of e.to) {
        learn(st, who, e.reveal, e.via);
        klog(st, 'reveal', `${personName(pkg, who)} 知道了 ${e.reveal}（${VIA_LABEL[e.via]}，${where}）`);
      }
    } else deliverMsgs(pkg, st, e.send, { node, at: ctx.at, defer: ctx.defer !== false });
  }
}

/** 选第一个匹配的结果。choice 是意图 key、'timeout' 或 'auto'。 */
export function pickOutcome(pkg, st, node, choice) {
  node = asNode(pkg, node);
  for (const o of node.outcomes) {
    const onOk = o.on === 'any' ? choice !== 'auto' : Array.isArray(o.on) ? o.on.includes(choice) : o.on === choice;
    if (onOk && (!o.when || evalCond(pkg, st, o.when))) return o;
  }
  return null;
}

/* ---------- 节点 ---------- */
export function startNode(pkg, st, nodeKey) {
  const node = nodeOf(pkg, nodeKey);
  if (!node || st.ran[node.key]) return;
  st.ran[node.key] = true;
  if (node.crisis) {
    st.crises.push(st.now);
    const col = pkg.collisions.find((c) => c.crisis === node.key);
    if (col) st.fired[col.key] = true;
  }
  klog(st, 'node', `开始「${node.title}」（${node.key}）`);
  applyEffects(pkg, st, node.onStart || [], { node, at: st.now });
  const shown = node.messages.filter((m) => !m.when || evalCond(pkg, st, m.when));
  deliverMsgs(pkg, st, shown, { node, at: st.now, defer: false });
  if (node.decision) {
    const openAt = st.now + Math.max(0, ...shown.map((m) => m.delayMinutes || 0));
    const thread = decisionThread(node);
    ensureThread(pkg, st, thread);
    st.open.push({
      node: node.key, title: node.title, thread, owner: node.owner, openAt,
      deadline: openAt + node.decision.timeoutMinutes,
      intents: node.decision.intents.map((i) => ({ key: i.key, label: i.label, examples: [...i.examples] })),
    });
  } else resolve(pkg, st, node.key, 'auto');
}

/** 结算一个节点。choice = 意图 key | 'timeout' | 'auto'。opts.at = 结算时刻（结果消息从这里起算），默认 st.now。 */
export function resolve(pkg, st, nodeKey, choice, opts = {}) {
  const node = nodeOf(pkg, nodeKey);
  if (!node || !st.ran[node.key] || st.outcome[node.key] !== undefined) return null;
  const i = st.open.findIndex((d) => d.node === node.key);
  const o = pickOutcome(pkg, st, node, choice);
  if (!o) {
    klog(st, 'error', `${node.key}: 选择 ${choice} 没有匹配的结果`);
    if ((choice === 'timeout' || choice === 'auto') && i >= 0) st.open.splice(i, 1);
    return null;
  }
  if (i >= 0) st.open.splice(i, 1);
  st.outcome[node.key] = o.key;
  const at = Math.max(opts.at ?? st.now, st.now);
  klog(st, 'outcome', `「${node.title}」→ ${o.label}（${choice === 'timeout' ? '超时' : choice === 'auto' ? '自动' : '意图 ' + choice}）`);
  applyEffects(pkg, st, o.effects, { node, at });
  if (node.kind === 'scene' && st.threads['scene:' + node.key]) st.threads['scene:' + node.key].closed = true;
  if (node.kind === 'ending') finish(pkg, st);
  return o;
}

function finish(pkg, st) {
  if (st.ended) return;
  const e = pkg.endings.find((x) => !x.when || evalCond(pkg, st, x.when));
  const epilogues = [];
  for (const ep of pkg.epilogues) {
    const l = ep.lines.find((x) => !x.when || evalCond(pkg, st, x.when));
    if (l) epilogues.push(l.text);
  }
  st.open = [];
  st.ended = { ending: e.key, title: e.title, text: e.text, epilogues, at: st.now };
  pushMsg(pkg, st, 'feed', { from: 'system', text: '婚礼日 · ' + e.title, kind: 'notice', src: 'system', at: st.now });
  klog(st, 'end', `结局：${e.title}（${e.key}）`);
}

/* ---------- 查询 ---------- */
export function knowledgeOf(pkg, st, who) {
  const mine = st.knows[who] || {};
  const out = [];
  for (const f of pkg.facts) {
    const via = mine[f.key];
    if (via && via.length) out.push({ fact: f.key, text: f.text, via: [...via] });
  }
  return out;
}

export function displayTime(st) {
  let t = st.now;
  for (const id in st.threads) if (st.threads[id].msgs.length && st.threads[id].lastAt > t) t = st.threads[id].lastAt;
  return t;
}

const WEEK = ['周日', '周一', '周二', '周三', '周四', '周五', '周六'];
export function timeLabel(st, min) {
  if (min === undefined || min === null) min = displayTime(st);
  const day = Math.floor(min / 1440);
  const m = ((min % 1440) + 1440) % 1440;
  const clock = `${String(Math.floor(m / 60)).padStart(2, '0')}:${String(m % 60).padStart(2, '0')}`;
  const [y, mo, d] = String(st.startDate || '2026-11-09').split('-').map(Number);
  const dt = new Date(Date.UTC(y, mo - 1, d + day));
  const date = `${dt.getUTCMonth() + 1}月${dt.getUTCDate()}日 ${WEEK[dt.getUTCDay()]}`;
  const left = Math.floor((st.endsAt ?? 12 * 1440) / 1440) - day;
  const countdown = left > 0 ? `离婚礼还有 ${left} 天` : left === 0 ? '今天是婚礼' : '婚礼已经过去';
  return { clock, date, countdown, day };
}

/** 节点进度：'waiting' 未到 | 'open' 进行中（待回答）| 'done' 已结算 | 'missed' 没发生。 */
export function nodeStatus(pkg, st, key) {
  const n = nodeOf(pkg, key);
  if (!n) return 'missed';
  if (st.open.some((d) => d.node === key)) return 'open';
  if (st.ran[key]) return 'done';
  if (st.ended || st.now > toMin(n.trigger.window[1])) return 'missed';
  return 'waiting';
}

/* ---------- 玩家输入 ---------- */
export const normText = (s) => String(s ?? '').toLowerCase().replace(/\s+/g, '');
/** 关键词命中：去空白、转小写后按子串匹配。返回命中的关键词。 */
export function keywordHits(text, keywords) {
  const t = normText(text);
  return (keywords || []).filter((k) => { const kk = normText(k); return kk && t.includes(kk); });
}
export function isSelfHarm(text, extras = X) {
  let t = normText(text);
  for (const ex of extras.selfharmExclude || []) t = t.split(normText(ex)).join('|');
  return (extras.selfharm || []).some((k) => t.includes(normText(k)));
}

function decisionIn(st, threadId) {
  const ds = st.open.filter((d) => d.thread === threadId).sort((a, b) => a.openAt - b.openAt);
  return ds[0] || null;
}
const copyDecision = (d) => d && { ...d, intents: d.intents.map((i) => ({ ...i, examples: [...i.examples] })) };

/** 此刻在这个线程里允许命中的越界输入（与 runtime-lite 同一过滤；selfharm 由代码层直接拦，不在这里）。 */
export function boundariesFor(pkg, st, char, decision) {
  return pkg.policy.boundaryInputs.filter((b) => b.key !== 'bi.selfharm'
    && (!b.nodes || (decision && b.nodes.includes(decision.node)))
    && (!b.with || b.with.includes(char))
    && (!b.when || evalCond(pkg, st, b.when)));
}

function tellableFor(pkg, st, char) {
  if (char !== 'xzx') return [];
  const facts = index(pkg).facts;
  return (X.tellable || [])
    .filter((t) => facts.has(t.fact) && st.knows.player?.[t.fact]?.length && !(st.knows.xzx?.[t.fact] || []).includes('told'))
    .map((t) => ({ fact: t.fact, label: t.label, text: facts.get(t.fact).text }));
}

export function playerSay(pkg, st, threadId, text) {
  const t = ensureThread(pkg, st, threadId);
  const base = { thread: threadId, char: t.with, decision: null, boundaries: [], tellable: [], needsJudge: false };
  if (st.ended) return { ...base, ended: true, halted: false };
  if (st.halted) return { ...base, halted: true };
  const at = displayTime(st);
  const msg = pushMsg(pkg, st, threadId, { from: 'player', text: String(text), kind: 'text', src: 'player', at });
  const decision = decisionIn(st, threadId);
  const route = { ...base, decision: copyDecision(decision), msgId: msg.id, at };
  if (isSelfHarm(text)) {
    msg.flag = 'selfharm'; // 这句不进人物 prompt
    const b = pkg.policy.boundaryInputs.find((x) => x.key === 'bi.selfharm') || pkg.policy.boundaryInputs.find((x) => x.pause);
    if (b) hitBoundary(pkg, st, route, b, at);
    else st.halted = { by: 'selfharm', node: decision?.node ?? null, thread: threadId, at };
    return { ...route, halted: true };
  }
  const bis = boundariesFor(pkg, st, t.with, decision);
  route.boundaries = bis.map((b) => ({ key: b.key, input: b.input }));
  route.tellable = tellableFor(pkg, st, t.with);
  const hints = X.boundaryHints || {};
  const bHit = bis.some((b) => keywordHits(text, hints[b.key]).length > 0);
  const tHit = route.tellable.some((x) => keywordHits(text, (X.tellable || []).find((y) => y.fact === x.fact)?.keywords).length > 0);
  route.needsJudge = !!decision || bHit || tHit;
  return route;
}

function hitBoundary(pkg, st, route, b, at) {
  const node = route.decision ? nodeOf(pkg, route.decision.node) : null;
  st.boundaryLog.push({ key: b.key, node: node?.key ?? null, thread: route.thread, at });
  klog(st, 'boundary', `越界输入 ${b.key}（${route.thread}${node ? '，' + node.key : ''}）`);
  const sent = deliverMsgs(pkg, st, b.reply, { node, at, speaker: route.char || node?.owner, thread: route.thread, defer: false });
  if (b.pause) for (const m of sent) m.flag = 'selfharm'; // 出戏的提示不进人物 prompt
  applyEffects(pkg, st, b.effects, { node, at, label: b.key });
  if (b.pause) {
    st.halted = { by: b.key, node: node?.key ?? null, thread: route.thread, at };
    klog(st, 'halt', '剧情暂停：故事钟停住，等玩家点“继续”');
  }
  return sent;
}

/** j = { intent, boundary, told:[fact] }。顺序：越界 → 意图 → 坦白（见 CONTRACT §7【更新】）。 */
export function applyJudgement(pkg, st, route, j) {
  const res = { halted: !!st.halted, resolved: null, authoredReply: false };
  if (st.ended || st.halted || !route || route.halted) return { ...res, halted: !!st.halted };
  j = j || {};
  const at = displayTime(st);
  if (j.boundary) {
    const ok = (route.boundaries || []).some((b) => b.key === j.boundary);
    const b = ok && pkg.policy.boundaryInputs.find((x) => x.key === j.boundary);
    if (b) {
      const sent = hitBoundary(pkg, st, route, b, at);
      if (sent.length) res.authoredReply = true;
      if (st.halted) return { ...res, halted: true };
    }
  }
  if (j.intent && route.decision) {
    const d = st.open.find((x) => x.node === route.decision.node);
    if (d && d.intents.some((i) => i.key === j.intent)) {
      capture = [];
      try { res.resolved = resolve(pkg, st, d.node, j.intent, { at }); } finally {
        if (res.resolved && capture.length) res.authoredReply = true;
        capture = null;
      }
    }
  }
  // 坦白放在意图之后：节点结果按“这句话之前她知道什么”来选（如试纱间“又说了梁总”读的是之前有没有说过）
  for (const f of j.told || []) {
    if (!route.char || !(route.tellable || []).some((x) => x.fact === f)) continue;
    if (!st.knows.player?.[f]) continue; // 与 reveal via:'told' 同一前提
    if ((st.knows[route.char]?.[f] || []).includes('told')) continue;
    learn(st, route.char, f, 'told');
    klog(st, 'reveal', `${personName(pkg, route.char)} 知道了 ${f}（你亲口告诉${route.decision ? '，' + route.decision.node : '，自由聊天'}）`);
  }
  res.halted = !!st.halted;
  return res;
}

export function addAgentLines(pkg, st, threadId, from, lines, src) {
  const at = displayTime(st);
  const out = [];
  for (const line of lines || []) {
    const text = String(line ?? '').trim();
    if (!text || text.includes(IMG)) continue; // 私密图片只能来自作者写好的节点
    out.push(pushMsg(pkg, st, threadId, { from, text, kind: 'text', src: src === 'fallback' ? 'fallback' : 'agent', at }));
  }
  return out;
}

export function resume(pkg, st) {
  if (!st.halted) return;
  const h = st.halted;
  st.halted = null;
  const at = displayTime(st);
  if (h.node) {
    const d = st.open.find((x) => x.node === h.node);
    const n = nodeOf(pkg, h.node);
    if (d && n?.decision) d.deadline = Math.max(d.deadline, at + n.decision.timeoutMinutes);
  }
  klog(st, 'resume', '玩家点了“继续”' + (h.node ? `，「${nodeOf(pkg, h.node)?.title}」的超时从头计` : ''));
}

/* ---------- 时间 ---------- */
const quietEnd = (pkg) => { const q = pkg.director.quietHours[1]; return Number(q.slice(0, 2)) * 60 + Number(q.slice(3)); };
const stopCache = new WeakMap();
function afterTimes(pkg) {
  let s = stopCache.get(pkg);
  if (!s) {
    const set = new Set();
    const walk = (c) => { if (!c || typeof c !== 'object') return; if (typeof c.after === 'string') set.add(toMin(c.after)); for (const v of Object.values(c)) if (typeof v === 'object') walk(v); };
    for (const n of pkg.nodes) walk(n.trigger.when);
    for (const col of pkg.collisions) walk(col.when);
    for (const c of pkg.conds) walk(c.when);
    s = [...set].sort((a, b) => a - b);
    stopCache.set(pkg, s);
  }
  return s;
}

/** 假如此刻是 T、状态不变，哪些节点会开始（与导演同一套过滤）。 */
function startableAt(pkg, st, T) {
  const keep = st.now;
  st.now = T;
  try {
    return pkg.nodes.filter((n) => !st.ran[n.key] && T >= toMin(n.trigger.window[0]) && T <= toMin(n.trigger.window[1])
      && evalCond(pkg, st, n.trigger.when)
      && !(n.trigger.mode === 'optional' && inQuiet(pkg, T)) && !crisisLimit(pkg, st, n));
  } finally { st.now = keep; }
}

function stopLabel(st, at) {
  const shown = Math.max(at, displayTime(st));
  const L = timeLabel(st, shown);
  const d0 = Math.floor(displayTime(st) / 1440), d1 = Math.floor(shown / 1440);
  if (d1 === d0) return L.clock;
  if (d1 === d0 + 1) return '明天 ' + L.clock;
  return `${L.date} ${L.clock}`;
}

/** 下一站：最早的 截止 / 延迟消息送达 / 有节点能开始的窗口起点或 after 时刻 / 第二天早上 / 结算时刻。 */
export function nextStop(pkg, st) {
  if (st.ended) return { at: null, label: '故事已经结束', reasons: [], willTimeout: [] };
  if (st.halted) return { at: null, label: '剧情已暂停', reasons: [], willTimeout: [] };
  const now = st.now;
  const cands = [];
  for (const d of st.open) cands.push({ at: Math.max(d.deadline, now + 1), why: `「${d.title}」等你回复的时间到了` });
  for (const p of st.pending) cands.push({ at: Math.max(p.at, now + 1), why: isPerson(p.msg.from) ? `${personName(pkg, p.msg.from)}的消息送达` : '一条通知送达' });
  const qe = quietEnd(pkg);
  const morning = (Math.floor(now / 1440) + (now % 1440 < qe ? 0 : 1)) * 1440 + qe;
  if (morning < st.endsAt) cands.push({ at: morning, why: '新的一天' });
  if (st.endsAt > now) cands.push({ at: st.endsAt, why: '结算时刻' });
  let best = Math.min(...cands.map((c) => c.at));
  // 窗口起点和 after 时刻：只在那一刻真有节点能开始时才算一站（没事发生的时刻不停）
  const times = new Set(afterTimes(pkg).filter((t) => t > now && t <= best));
  for (const n of pkg.nodes) { if (st.ran[n.key]) continue; const s = toMin(n.trigger.window[0]); if (s > now && s <= best) times.add(s); }
  if (morning <= best) times.add(morning);
  for (const T of [...times].sort((a, b) => a - b)) {
    if (T > best) break;
    const ns = startableAt(pkg, st, T);
    if (ns.length) { for (const n of ns) cands.push({ at: T, why: `「${n.title}」可以开始` }); best = Math.min(best, T); break; }
  }
  if (!Number.isFinite(best)) return { at: null, label: '没有下一站了', reasons: [], willTimeout: [] };
  const at = best;
  const reasons = [...new Set(cands.filter((c) => c.at === at).map((c) => c.why))];
  const willTimeout = st.open.filter((d) => d.deadline <= at).sort((a, b) => a.deadline - b.deadline)
    .map((d) => ({ node: d.node, owner: d.owner, title: d.title }));
  return { at, label: stopLabel(st, at), reasons, willTimeout };
}

export function jump(pkg, st) {
  const from = st.now;
  const res = { from, to: from, timedOut: [], started: [], dayChanged: false, ended: !!st.ended, fromDay: Math.floor(from / 1440), toDay: Math.floor(from / 1440) };
  if (st.ended || st.halted) return res;
  const stop = nextStop(pkg, st);
  if (stop.at === null) {
    if (st.now >= st.endsAt) { forceEnd(pkg, st); res.ended = !!st.ended; }
    return res;
  }
  const to = stop.at;
  for (let guard = 0; guard < 1000; guard++) {
    let t = Infinity;
    for (const d of st.open) if (d.deadline <= to && d.deadline < t) t = d.deadline;
    for (const p of st.pending) if (p.at <= to && p.at < t) t = p.at;
    if (t === Infinity) break;
    st.now = Math.max(st.now, t);
    flushPending(pkg, st);
    const due = st.open.filter((d) => d.deadline <= st.now).sort((a, b) => a.deadline - b.deadline || a.openAt - b.openAt);
    for (const d of due) {
      if (!st.open.includes(d)) continue;
      klog(st, 'timeout', `「${d.title}」没等到回复，按超时结算`);
      const o = resolve(pkg, st, d.node, 'timeout', { at: d.deadline });
      res.timedOut.push(d.node);
      if (!o) st.open = st.open.filter((x) => x !== d);
    }
    res.started.push(...tick(pkg, st));
    if (st.ended) break;
  }
  if (!st.ended) {
    st.now = Math.max(st.now, to);
    flushPending(pkg, st);
    res.started.push(...tick(pkg, st));
  }
  if (!st.ended && st.now >= st.endsAt) forceEnd(pkg, st);
  res.to = st.now;
  res.toDay = Math.floor(st.now / 1440);
  res.dayChanged = res.toDay !== res.fromDay;
  res.ended = !!st.ended;
  klog(st, 'jump', `跳到 ${fmt(st.now)}` + (res.timedOut.length ? `，超时 ${res.timedOut.join('、')}` : '') + (res.started.length ? `，开始 ${res.started.join('、')}` : ''));
  return res;
}

function forceEnd(pkg, st) {
  klog(st, 'error', '到了结算时刻还没有结局，强制结算');
  for (const d of [...st.open]) resolve(pkg, st, d.node, 'timeout', { at: st.now });
  st.open = [];
  const en = pkg.nodes.find((n) => n.kind === 'ending');
  if (en && !st.ran[en.key]) { st.ran[en.key] = true; resolve(pkg, st, en.key, 'auto'); }
  if (!st.ended) finish(pkg, st);
}

export function markRead(st, threadId) {
  const t = st.threads[threadId];
  if (t) t.unread = 0;
}

/* ---------- 后台草稿 ---------- */
const PERSONA_KEYS = ['voice', 'habits', 'sampleLines'];
const MOTIVE_KEYS = ['surface', 'deep'];
const CAST_KEYS = ['role', 'publicIntro', 'background', 'goal', 'rules', 'never', 'fallbackLines'];
const strList = (a) => Array.isArray(a) && a.every((x) => typeof x === 'string');
const hhmm = (s) => typeof s === 'string' && /^([01]\d|2[0-4]):[0-5]\d$/.test(s);

/** 深拷贝世界包再覆盖草稿（§10）。只认白名单字段，安全相关的（年龄、接触上限、阶段、秘密）不能改。 */
export function applyPatch(pkg, patch) {
  const out = JSON.parse(JSON.stringify(pkg));
  if (!patch || typeof patch !== 'object') return out;
  for (const [key, p] of Object.entries(patch.cast || {})) {
    const c = out.cast.find((x) => x.key === key);
    if (!c || !p || typeof p !== 'object') continue;
    for (const k of CAST_KEYS) if (k in p && (typeof p[k] === 'string' || strList(p[k]))) c[k] = JSON.parse(JSON.stringify(p[k]));
    const persona = { ...(p.persona || {}) };
    for (const k of PERSONA_KEYS) if (k in p) persona[k] = p[k];
    for (const k of PERSONA_KEYS) if (k in persona && (typeof persona[k] === 'string' || strList(persona[k]))) c.persona[k] = JSON.parse(JSON.stringify(persona[k]));
    const motive = { ...(p.motive || {}) };
    for (const k of MOTIVE_KEYS) if (k in p) motive[k] = p[k];
    for (const k of MOTIVE_KEYS) if (typeof motive[k] === 'string') c.motive[k] = motive[k];
  }
  const d = patch.director || {};
  for (const k of ['proactivePerCharacterPerDay', 'maxCrisesPerDay', 'minHoursBetweenCrises']) {
    if (Number.isFinite(d[k]) && d[k] >= 0) out.director[k] = Math.floor(d[k]);
  }
  if (Array.isArray(d.quietHours) && d.quietHours.length === 2 && d.quietHours.every(hhmm)) out.director.quietHours = [...d.quietHours];
  if (patch.policy && typeof patch.policy.promptBlock === 'string' && patch.policy.promptBlock.trim()) out.policy.promptBlock = patch.policy.promptBlock;
  for (const card of patch.extraCast || []) {
    if (!card || typeof card !== 'object' || typeof card.name !== 'string') continue;
    if (!(card.age >= 18)) continue;
    let key = typeof card.key === 'string' && /^[a-z][a-z0-9_]*$/.test(card.key) ? card.key : 'x' + (out.cast.length + 1);
    while (out.cast.some((x) => x.key === key) || out.supporting.some((x) => x.key === key) || ['player', 'narrator', 'system', 'speaker', 'feed'].includes(key)) key += '_';
    const stages = Array.isArray(card.stages) && card.stages.length ? card.stages.filter((s) => s && typeof s.key === 'string') : [{ key: 'met', label: '初识', meaning: '刚认识，客气。' }];
    if (!stages.length) continue;
    out.cast.push({
      key, name: card.name, age: card.age, role: String(card.role || ''), publicIntro: String(card.publicIntro || card.role || ''),
      background: String(card.background || ''),
      persona: { voice: String(card.persona?.voice || ''), habits: strList(card.persona?.habits) ? card.persona.habits : [], sampleLines: strList(card.persona?.sampleLines) ? card.persona.sampleLines : [] },
      motive: { surface: String(card.motive?.surface || ''), deep: String(card.motive?.deep || '') },
      goal: String(card.goal || ''), secrets: [], stages,
      initialStage: stages.some((s) => s.key === card.initialStage) ? card.initialStage : stages[0].key,
      rules: strList(card.rules) ? card.rules : [], never: strList(card.never) ? card.never : [],
      fallbackLines: strList(card.fallbackLines) && card.fallbackLines.length ? card.fallbackLines : ['嗯。', '回头聊。'],
      contactCeiling: 'none', extra: true,
    });
  }
  return out;
}
