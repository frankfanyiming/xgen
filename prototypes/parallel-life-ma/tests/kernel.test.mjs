// 内核 + 导演测试：node tests/kernel.test.mjs [随机局数，默认 3000]
// 1a 与 runtime-lite 同一随机策略逐局对照（同种子）；1b 自由随机玩（晚回、自由聊天、坦白、越界、自伤、存档往返）；
// 2–7 脚本局；8 把 sim-lite 的脚本局搬过来，两边结局和结果必须一致。
import assert from 'node:assert/strict';
import { WORLD } from '../world.js';
import { EXTRAS } from '../world-extras.js';
import * as K from '../kernel.js';
import * as D from '../director.js';

const pkg = WORLD;
const N = Number(process.argv[2] || 3000);
const LITE = '/tmp/claude-0/-home-user-xgen/61dff879-9f88-5ed2-80a0-37aef5f6ef93/scratchpad/lite/runtime-lite.mjs';
let lite = null;
try { lite = await import(LITE); } catch { console.log('（找不到 runtime-lite.mjs，跳过对照部分）'); }

let failed = 0;
function test(name, fn) {
  try { fn(); console.log('PASS', name); } catch (e) { failed++; console.log('FAIL', name); console.log(e && e.stack || e); }
}

/* ---------- 工具 ---------- */
const clone = (x) => JSON.parse(JSON.stringify(x));
const node = (k) => K.nodeOf(pkg, k);
const pct = (x, n) => (100 * x / n).toFixed(1) + '%';
// 与 sim-lite 相同的线性同余随机数；状态放在对象里，方便存档测试复制
const makeRng = (seed) => { const r = { s: seed }; r.next = () => ((r.s = (r.s * 1103515245 + 12345) % 2147483648) / 2147483648); return r; };
const fb = (char) => pkg.cast.find((c) => c.key === char)?.fallbackLines[0] || '嗯。';
// runtime-lite 口径的越界候选（含 selfharm），用来和它同序消耗随机数
const liteBis = (st, d) => pkg.policy.boundaryInputs.filter((b) => (!b.nodes || b.nodes.includes(d.node)) && (!b.with || b.with.includes(d.owner)) && (!b.when || K.evalCond(pkg, st, b.when)));

function say(st, threadId, text, j) {
  const route = K.playerSay(pkg, st, threadId, text);
  if (route.halted) return { route, r: { halted: true } };
  const r = K.applyJudgement(pkg, st, route, j || { intent: null, boundary: null, told: [] });
  if (!r.halted && !r.authoredReply && route.char && pkg.cast.some((c) => c.key === route.char)) K.addAgentLines(pkg, st, threadId, route.char, [fb(route.char)], 'fallback');
  D.tick(pkg, st);
  return { route, r };
}
function answer(st, nodeKey, intent, text) {
  const d = st.open.find((x) => x.node === nodeKey);
  assert.ok(d, `${nodeKey} 应该在等回答`);
  const it = d.intents.find((i) => i.key === intent);
  assert.ok(it, `${nodeKey} 没有意图 ${intent}`);
  const { route, r } = say(st, d.thread, text ?? it.examples[0], { intent, boundary: null, told: [] });
  assert.equal(route.decision?.node, nodeKey, '线程里待回答的应该是这个节点');
  return r;
}
function hitBoundary(st, d, b) {
  if (b.key === 'bi.selfharm') return K.playerSay(pkg, st, d.thread, '我真的不想活了');
  const route = K.playerSay(pkg, st, d.thread, '（越界）' + b.input);
  assert.ok(route.boundaries.some((x) => x.key === b.key), `${b.key} 应该在 ${d.thread} 的候选里`);
  return K.applyJudgement(pkg, st, route, { intent: null, boundary: b.key, told: [] });
}
function proactive(st) {
  const p = D.planProactive(pkg, st, EXTRAS);
  if (!p) return null;
  K.addAgentLines(pkg, st, p.char, p.char, [fb(p.char)], 'fallback');
  D.commitProactive(st, p.char);
  return p;
}
function invariants(st) {
  const ids = new Set();
  for (const t of Object.values(st.threads)) {
    let last = -Infinity;
    for (const m of t.msgs) {
      assert.ok(!ids.has(m.id), '消息 id 重复 ' + m.id); ids.add(m.id);
      assert.ok(m.at >= last, `${t.id} 里消息时间倒退`); last = m.at;
      if (m.kind === 'image_locked') { assert.equal(m.from, 'sm'); assert.equal(m.src, 'authored'); assert.equal(t.id, 'sm'); }
      assert.ok(['text', 'image_locked', 'recall', 'notice'].includes(m.kind));
      assert.ok(['authored', 'agent', 'fallback', 'player', 'system'].includes(m.src));
    }
  }
  for (const d of st.open) { assert.ok(st.ran[d.node], '开着的决策必须已开始'); assert.equal(st.outcome[d.node], undefined, '开着的决策不该已有结果'); assert.ok(d.deadline > d.openAt - 1); }
  assert.ok(K.displayTime(st) >= st.now);
  for (const who of Object.keys(st.knows)) for (const [f, v] of Object.entries(st.knows[who])) assert.ok(Array.isArray(v) && v.length, `${who}.${f} 应该是非空数组`);
}
function mustCheck(st) {
  return pkg.nodes.filter((n) => n.trigger.mode === 'must' && st.seen[n.key] && !st.ran[n.key]).map((n) => n.key);
}
const outcomeKey = (st) => JSON.stringify(Object.entries(st.outcome).sort());

/* ---------- 1a 与 runtime-lite 同一随机策略，逐局对照 ---------- */
function playLockstep(seed) {
  const rng = makeRng(seed), rnd = rng.next;
  const st = K.newGame(pkg, EXTRAS);
  const handled = new Set();
  for (let g = 0; g < 5000; g++) {
    if (st.ended) break;
    if (st.halted) K.resume(pkg, st);
    const fresh = st.open.filter((d) => !handled.has(d.node));
    if (fresh.length) {
      const d = fresh[0];
      handled.add(d.node);
      const bis = liteBis(st, d);
      if (bis.length && rnd() < 0.04) {
        const b = bis[Math.floor(rnd() * bis.length)];
        hitBoundary(st, d, b);
        if (st.halted) K.resume(pkg, st);
      }
      const n = node(d.node);
      const choice = rnd() < 0.15 ? 'timeout' : n.decision.intents[Math.floor(rnd() * n.decision.intents.length)].key;
      if (choice !== 'timeout') answer(st, d.node, choice);
      continue;
    }
    K.jump(pkg, st);
    proactive(st);
  }
  return st;
}
function litePlayer(seed) {
  const rnd = makeRng(seed).next;
  return {
    choose: (n) => (rnd() < 0.15 ? 'timeout' : n.decision.intents[Math.floor(rnd() * n.decision.intents.length)].key),
    boundary: (n, bis) => (bis.length && rnd() < 0.04 ? bis[Math.floor(rnd() * bis.length)] : null),
    resume: () => true,
  };
}

function newStats() {
  const s = { n: 0, node: {}, out: {}, end: {}, epi: {}, bi: {} };
  for (const n of pkg.nodes) { s.node[n.key] = 0; for (const o of n.outcomes) s.out[n.key + '/' + o.key] = 0; }
  for (const e of pkg.endings) s.end[e.key] = 0;
  for (const b of pkg.policy.boundaryInputs) s.bi[b.key] = 0;
  return s;
}
function addOurs(s, st) {
  s.n++;
  for (const k of Object.keys(st.ran)) s.node[k]++;
  for (const [k, o] of Object.entries(st.outcome)) s.out[k + '/' + o]++;
  if (st.ended) s.end[st.ended.ending]++;
  for (const t of st.ended?.epilogues || []) s.epi[t] = (s.epi[t] || 0) + 1;
  for (const b of st.boundaryLog) s.bi[b.key]++;
}
function addLite(s, r) {
  s.n++;
  for (const k of Object.keys(r.st.ran)) s.node[k]++;
  for (const [k, o] of Object.entries(r.st.outcome)) s.out[k + '/' + o]++;
  if (r.ending) s.end[r.ending]++;
  for (const e of r.epilogues) { const t = pkg.epilogues.find((x) => x.about === e.about).lines[e.line]?.text; if (t) s.epi[t] = (s.epi[t] || 0) + 1; }
  for (const b of r.st.boundary) s.bi[b.key]++;
}
function printCompare(title, a, b) {
  console.log(`\n== ${title}（左：本内核 ${a.n} 局${b ? `；右：runtime-lite play() ${b.n} 局` : ''}）`);
  const row = (k, x, y) => `  ${k.padEnd(34)} ${pct(x, a.n).padStart(6)}${b ? '  ' + pct(y, b.n).padStart(6) : ''}`;
  console.log(' 结局'); for (const k of Object.keys(a.end)) console.log(row(k, a.end[k], b?.end[k]));
  console.log(' 节点'); for (const k of Object.keys(a.node)) console.log(row(k, a.node[k], b?.node[k]));
  console.log(' 越界输入'); for (const k of Object.keys(a.bi)) console.log(row(k, a.bi[k], b?.bi[k]));
  const cov = (s) => Object.values(s.out).filter((v) => v > 0).length;
  const total = Object.keys(a.out).length;
  console.log(` 结果覆盖：本内核 ${cov(a)}/${total}${b ? `，runtime-lite ${cov(b)}/${total}` : ''}`);
  const onlyA = Object.keys(a.out).filter((k) => a.out[k] && !(b?.out[k]));
  const onlyB = b ? Object.keys(a.out).filter((k) => !a.out[k] && b.out[k]) : [];
  const none = Object.keys(a.out).filter((k) => !a.out[k] && !(b?.out[k]));
  if (b) console.log(`  只有本内核走到：${onlyA.join(', ') || '无'}\n  只有 runtime-lite 走到：${onlyB.join(', ') || '无'}`);
  console.log(`  都没走到：${none.join(', ') || '无'}`);
  const epiTotal = pkg.epilogues.reduce((x, e) => x + e.lines.length, 0);
  console.log(` 后话覆盖：本内核 ${Object.keys(a.epi).length}/${epiTotal}${b ? `，runtime-lite ${Object.keys(b.epi).length}/${epiTotal}` : ''}`);
  const epiNone = pkg.epilogues.flatMap((e) => e.lines.map((l) => l.text)).filter((t) => !a.epi[t] && !(b?.epi[t]));
  if (epiNone.length) console.log(`  没走到的后话：${epiNone.join(' / ')}`);
  return { onlyA, onlyB, none };
}

test(`1a ${N} 局与 runtime-lite 同一随机策略（同种子逐局对照）：0 异常、都有结局、must 都开了`, () => {
  const ours = newStats(), theirs = newStats();
  const errs = [], mustMiss = {}, diffs = [];
  let crashes = 0;
  for (let i = 0; i < N; i++) {
    const seed = 1000 + i * 7919;
    let st;
    try { st = playLockstep(seed); invariants(st); } catch (e) { crashes++; if (crashes < 4) console.log('异常', seed, e.stack); continue; }
    if (!st.ended) errs.push(seed + ' 没有结局');
    for (const k of mustCheck(st)) mustMiss[k] = (mustMiss[k] || 0) + 1;
    for (const l of st.kernelLog) if (l.kind === 'error') errs.push(seed + ' ' + l.text);
    for (const [k, o] of Object.entries(st.outcome)) if ((o === 'harassed' || o === 'crossed') && !st.boundaryLog.some((b) => b.node === k)) errs.push(`${seed} ${k}/${o} 没有本节点的越界输入`);
    addOurs(ours, st);
    if (lite) {
      const r = lite.play(pkg, litePlayer(seed));
      addLite(theirs, r);
      if (r.ending !== st.ended?.ending || outcomeKey(r.st) !== outcomeKey(st)) diffs.push({ seed, ours: st.ended?.ending, lite: r.ending });
    }
  }
  printCompare('1a 同一随机策略', ours, lite ? theirs : null);
  if (lite) console.log(` 逐局对照：${N - diffs.length}/${N} 局结局和每个节点的结果完全一致${diffs.length ? '；不一致的种子 ' + diffs.slice(0, 8).map((d) => `${d.seed}(${d.ours}/${d.lite})`).join(' ') : ''}`);
  assert.equal(crashes, 0, '有异常');
  assert.deepEqual(errs, []);
  assert.deepEqual(mustMiss, {}, 'must 节点条件成立却没开');
  if (lite) assert.ok(diffs.length <= N * 0.01, `逐局不一致太多：${diffs.length}`);
});

/* ---------- 1b 自由随机玩 ---------- */
const FREE_TEXTS = ['在吗', '今天好累', '晚点聊', '你吃饭了吗', '想死你了', '方案给我看看', '别摸鱼了', '栖澜酒店那边怎么说'];
const CONFESS = {
  'f.sm': '有件事瞒着你：10月18号那晚是苏蔓开车送我回来的。',
  'f.sm_night': '说实话，苏蔓昨晚给我发了不该发的东西。',
  'f.vv': '我在遇屿上认识了一个人，还给她转过钱，可能被骗了。',
  'f.lyy': '周三晚上我没加会，其实在梁总家吃饭。',
};
function playFree(rng, st, maxSteps = 4000, onStep) {
  const rnd = rng.next;
  st.fate ??= {}; // 测试自己的标记，跟着存档走
  for (let g = 0; g < maxSteps; g++) {
    if (onStep) { const s2 = onStep(g, st); if (s2) st = s2; }
    if (st.ended) break;
    if (st.halted) { K.resume(pkg, st); continue; }
    // 自由聊天
    if (rnd() < 0.35) {
      const c = pkg.cast[Math.floor(rnd() * pkg.cast.length)].key;
      const roll = rnd();
      let text = FREE_TEXTS[Math.floor(rnd() * FREE_TEXTS.length)];
      if (c === 'xzx' && roll < 0.25) text = CONFESS[Object.keys(CONFESS)[Math.floor(rnd() * 4)]];
      if (roll > 0.995) text = '我真的不想活了';
      const route = K.playerSay(pkg, st, c, text);
      if (!route.halted) {
        const j = { intent: null, boundary: null, told: [] };
        if (route.boundaries.length && rnd() < 0.03) j.boundary = route.boundaries[Math.floor(rnd() * route.boundaries.length)].key;
        if (route.tellable.length && rnd() < 0.5) j.told = [route.tellable[Math.floor(rnd() * route.tellable.length)].fact, 'f.nope'];
        if (route.decision && rnd() < 0.3) j.intent = route.decision.intents[Math.floor(rnd() * route.decision.intents.length)].key;
        const r = K.applyJudgement(pkg, st, route, j);
        if (r.resolved && st.fate[route.decision.node] === undefined) st.fate[route.decision.node] = 'done';
        if (!r.halted && !r.authoredReply) K.addAgentLines(pkg, st, c, c, [fb(c)], rnd() < 0.5 ? 'agent' : 'fallback');
        D.tick(pkg, st);
      }
      continue;
    }
    // 决策：现在回 / 晚点回（截止前）/ 不回
    let acted = false;
    for (const d of [...st.open]) {
      if (!st.open.includes(d)) continue;
      if (st.fate[d.node] === undefined) {
        const bis = K.boundariesFor(pkg, st, d.owner, d);
        if (bis.length && rnd() < 0.04) { hitBoundary(st, d, bis[Math.floor(rnd() * bis.length)]); acted = true; }
        const r = rnd();
        st.fate[d.node] = r < 0.15 ? 'timeout' : r < 0.6 ? 'now' : 'later';
      }
      if (st.halted) break;
      if (st.fate[d.node] === 'now') {
        const route = K.playerSay(pkg, st, d.thread, '嗯');
        if (route.decision?.node !== d.node) continue; // 同一线程里还有更早的，下轮再回
        const it = d.intents[Math.floor(rnd() * d.intents.length)].key;
        const r = K.applyJudgement(pkg, st, route, { intent: it, boundary: null, told: [] });
        if (!r.halted && !r.authoredReply && pkg.cast.some((c) => c.key === route.char)) K.addAgentLines(pkg, st, d.thread, route.char, [fb(route.char)], 'agent');
        D.tick(pkg, st);
        st.fate[d.node] = 'done';
        acted = true;
      }
    }
    if (acted || st.halted) continue;
    const ns = K.nextStop(pkg, st);
    const late = ns.willTimeout.filter((w) => st.fate[w.node] === 'later');
    if (late.length) { for (const w of late) st.fate[w.node] = 'now'; continue; }
    const before = st.now;
    const j = K.jump(pkg, st);
    assert.ok(j.to > before || st.ended, '跳时间必须前进');
    assert.equal(j.to, Math.max(ns.at, before));
    for (const w of ns.willTimeout) assert.ok(j.timedOut.includes(w.node), 'willTimeout 预告的都应该超时');
    assert.equal(j.timedOut.length, ns.willTimeout.length, '超时的应该正好是预告的');
    proactive(st);
  }
  return st;
}

test(`1b ${N} 局自由随机玩（晚回、自由聊天、坦白、越界、自伤后继续、存档往返）：0 异常、都有结局、must 都开了`, () => {
  const ours = newStats();
  const errs = [], mustMiss = {};
  let crashes = 0, roundtrips = 0, halts = 0, told = 0;
  for (let i = 0; i < N; i++) {
    const seed = 99 + i * 104729;
    const rng = makeRng(seed);
    let st;
    try {
      st = playFree(rng, K.newGame(pkg, EXTRAS), 4000, (g, s) => {
        if (g % 7 === 0) invariants(s);
        if (rng.next() < 0.02) { roundtrips++; const c = clone(s); assert.equal(JSON.stringify(c), JSON.stringify(s)); return c; }
        return null;
      });
      invariants(st);
    } catch (e) { crashes++; if (crashes < 4) console.log('异常', seed, e.stack); continue; }
    if (!st.ended) errs.push(seed + ' 没有结局');
    for (const k of mustCheck(st)) mustMiss[k] = (mustMiss[k] || 0) + 1;
    for (const l of st.kernelLog) if (l.kind === 'error') errs.push(seed + ' ' + l.text);
    if (st.kernelLog.some((l) => l.kind === 'halt')) halts++;
    if (Object.values(st.knows.xzx || {}).some((v) => v.includes('told'))) told++;
    addOurs(ours, st);
  }
  printCompare('1b 自由随机玩', ours, null);
  console.log(` 其中存档往返 ${roundtrips} 次；有自伤暂停的局 ${halts}；知夏被亲口告知过的局 ${told}`);
  assert.equal(crashes, 0, '有异常');
  assert.deepEqual(errs.slice(0, 10), []);
  assert.deepEqual(mustMiss, {}, 'must 节点条件成立却没开');
});

/* ---------- 脚本局驱动：每个决策一开就按表回答（或越界、或不回） ---------- */
function runScript(map, { boundary, resume = () => true, until } = {}) {
  const st = K.newGame(pkg, EXTRAS);
  const handled = new Set();
  for (let g = 0; g < 3000 && !st.ended; g++) {
    if (until && until(st)) return st;
    if (st.halted) return st;
    const fresh = st.open.filter((d) => !handled.has(d.node));
    if (fresh.length) {
      const d = fresh[0];
      handled.add(d.node);
      const hit = boundary?.(node(d.node), liteBis(st, d));
      if (hit) { hitBoundary(st, d, hit); if (st.halted) { if (!resume()) return st; K.resume(pkg, st); } }
      const choice = map[d.node] ?? node(d.node).decision.intents[0].key;
      if (choice !== 'timeout') answer(st, d.node, choice);
      continue;
    }
    K.jump(pkg, st);
  }
  return st;
}

/* ---------- 2 苏蔓深夜线 ---------- */
test('2 苏蔓深夜线：私密图片占位、撤回、同时开着的平板危机', () => {
  const map = { 'vv.heated': 'cool', 'lyy.dinner_invite': 'decline', 'xzx.guestlist': 'plain_yes', 'sm.late_edit': 'flirt', 'cx.bachelor': 'keep_quiet' };
  const st = runScript(map, { until: (s) => s.ran['sm.photo_night'] });
  assert.equal(st.vars['sm.night'], 'image');
  assert.equal(st.vars['device.tablet'], true);
  const smt = st.threads.sm;
  const img = smt.msgs.find((m) => m.kind === 'image_locked');
  assert.ok(img, '苏蔓的私聊里应该有锁定的图片占位');
  assert.equal(img.text, '[私密图片 · 不展示]');
  assert.equal(img.from, 'sm');
  assert.equal(img.at, K.toMin('D7 23:12'));
  const rec = smt.msgs.find((m) => m.kind === 'recall');
  assert.ok(rec && rec.from === 'system' && rec.text.includes('撤回了一条消息'), '应该有撤回提示');
  assert.ok(rec.at > img.at);
  assert.equal(K.displayTime(st), K.toMin('D7 23:15'));
  assert.ok(st.knows.player['f.sm_night'].includes('saw'));
  // 深夜消息开着，还没回；下一站是 23:12 平板危机，不会让它超时
  const ns = K.nextStop(pkg, st);
  assert.equal(ns.at, K.toMin('D7 23:12'));
  assert.deepEqual(ns.willTimeout, []);
  const j = K.jump(pkg, st);
  assert.deepEqual(j.started, ['crisis.tablet']);
  assert.deepEqual(st.open.map((d) => d.node).sort(), ['crisis.tablet', 'sm.photo_night']);
  assert.ok(st.fired['col.tablet']);
  // 现场线程和此刻通知
  const sc = st.threads['scene:crisis.tablet'];
  assert.ok(sc && sc.kind === 'scene' && sc.with === 'xzx' && sc.title === '危机③：平板' && !sc.closed);
  assert.ok(st.threads.feed.msgs.some((m) => m.text === '现场：危机③：平板'));
  assert.ok(sc.msgs.some((m) => m.from === 'system' && m.text === '苏蔓：[图片]' && m.kind === 'notice'));
  assert.ok(sc.msgs.some((m) => m.kind === 'recall'));
  assert.ok(!sc.msgs.some((m) => m.kind === 'image_locked'), '平板通知里只有“[图片]”，不是图片占位');
  assert.ok(st.knows.xzx['f.tablet_popup'].includes('saw'));
  // 两个线程各自路由到自己的决策
  const r1 = K.playerSay(pkg, st, 'sm', '……');
  assert.equal(r1.decision.node, 'sm.photo_night');
  assert.ok(['bi.ask_image', 'bi.threaten', 'bi.advance_sm'].every((k) => r1.boundaries.some((b) => b.key === k)));
  assert.deepEqual(r1.tellable, []);
  const r2 = K.playerSay(pkg, st, 'scene:crisis.tablet', '……');
  assert.equal(r2.decision.node, 'crisis.tablet');
  assert.ok(!r2.boundaries.some((b) => b.key === 'bi.ask_image'), '对知夏说话时不会命中苏蔓专属的越界');
  assert.ok(r2.tellable.some((t) => t.fact === 'f.sm_night'));
  // 先回知夏：当面说明 → 知夏被亲口告知
  const a = answer(st, 'crisis.tablet', 'explain');
  assert.equal(st.outcome['crisis.tablet'], 'explained');
  assert.ok(a.authoredReply);
  assert.ok(st.knows.xzx['f.sm_night'].includes('told'));
  assert.ok(st.threads['scene:crisis.tablet'].closed, '现场结算后关闭');
  // 再回苏蔓
  answer(st, 'sm.photo_night', 'firm_boundary');
  assert.equal(st.outcome['sm.photo_night'], 'boundary');
  assert.equal(st.stages.sm, 'distanced');
  // 人物 Agent 写不出图片占位
  const n0 = st.threads.sm.msgs.length;
  K.addAgentLines(pkg, st, 'sm', 'sm', ['[私密图片 · 不展示]', '好的。'], 'agent');
  assert.equal(st.threads.sm.msgs.length, n0 + 1);
  invariants(st);
});

test('2b 深夜线越界：威胁外传 → HR 通知按延迟送达，之后任何回答都落到拦截结果', () => {
  const map = { 'vv.heated': 'cool', 'lyy.dinner_invite': 'decline', 'xzx.guestlist': 'plain_yes', 'sm.late_edit': 'flirt', 'cx.bachelor': 'keep_quiet' };
  const st = runScript(map, { until: (s) => s.ran['sm.photo_night'] });
  const route = K.playerSay(pkg, st, 'sm', '你不怕我把那条转给别人看？');
  assert.ok(route.needsJudge);
  const r = K.applyJudgement(pkg, st, route, { intent: null, boundary: 'bi.threaten', told: [] });
  assert.ok(r.authoredReply && !r.resolved && !r.halted);
  assert.equal(st.threads.sm.msgs.at(-1).text, '我会去找黄总。');
  assert.equal(st.vars['sm.hr'], 'she_filed');
  assert.equal(st.stages.sm, 'reckoning');
  assert.ok(st.vars['sm.holds'].includes('threat'));
  assert.ok(!st.threads.hm, 'HR 的通知要一小时后才到');
  assert.equal(st.pending.length, 1);
  // 越界之后平板危机不再成立，23:12 不是一站；下一站是深夜消息的截止
  let ns = K.nextStop(pkg, st);
  assert.equal(ns.at, K.toMin('D7 23:45'));
  assert.deepEqual(ns.willTimeout.map((w) => w.node), ['sm.photo_night']);
  // 越界之后再“划清界限”，结果仍然是越界拦截
  answer(st, 'sm.photo_night', 'firm_boundary');
  assert.equal(st.outcome['sm.photo_night'], 'harassed');
  ns = K.nextStop(pkg, st);
  assert.equal(ns.at, K.toMin('D7 23:15') + 60, '下一站是 HR 通知送达');
  assert.ok(ns.reasons.includes('黄敏的消息送达'));
  K.jump(pkg, st);
  assert.equal(st.pending.length, 0);
  assert.equal(st.threads.hm.msgs[0].text, '邓总，苏蔓提交了一份材料，请来我办公室一趟。');
  assert.equal(st.threads.hm.msgs[0].at, K.toMin('D7 23:15') + 60);
  assert.ok(!st.ran['crisis.tablet']);
  invariants(st);
});

/* ---------- 3 自伤 ---------- */
test('3 自伤：代码层命中 → 暂停 + 热线 → 继续；“想死你了”不拦', () => {
  const st = K.newGame(pkg, EXTRAS);
  K.jump(pkg, st); // 21:35 Vivi 开始
  const d = st.open.find((x) => x.node === 'vv.heated');
  assert.ok(d);
  const ok = K.playerSay(pkg, st, 'xzx', '想死你了～');
  assert.ok(!ok.halted && !st.halted, '“想死你了”是想念，不拦');
  const route = K.playerSay(pkg, st, 'vv', '好累，真的不想活了');
  assert.equal(route.halted, true);
  assert.deepEqual(st.halted && [st.halted.by, st.halted.node, st.halted.thread], ['bi.selfharm', 'vv.heated', 'vv']);
  const sys = st.threads.vv.msgs.at(-1);
  assert.equal(sys.from, 'system');
  assert.equal(sys.kind, 'notice');
  assert.ok(sys.text.includes('12356') && sys.text.includes('剧情已暂停'));
  assert.equal(st.threads.vv.msgs.at(-2).flag, 'selfharm', '玩家那句要打标记，不进人物 prompt');
  assert.equal(sys.flag, 'selfharm');
  // 暂停期间：不跳时间、不开节点、不收输入、没有主动消息
  const now = st.now, n = st.threads.vv.msgs.length;
  assert.equal(K.nextStop(pkg, st).at, null);
  const j = K.jump(pkg, st);
  assert.equal(j.to, now);
  assert.equal(st.now, now);
  assert.deepEqual(D.tick(pkg, st), []);
  assert.equal(D.planProactive(pkg, st, EXTRAS), null);
  assert.ok(K.playerSay(pkg, st, 'vv', '在吗').halted);
  assert.equal(st.threads.vv.msgs.length, n);
  assert.deepEqual(K.applyJudgement(pkg, st, { thread: 'vv', decision: d, boundaries: [], tellable: [] }, { intent: 'cool' }).resolved, null);
  // 继续：超时从头计
  K.resume(pkg, st);
  assert.equal(st.halted, null);
  const d2 = st.open.find((x) => x.node === 'vv.heated');
  assert.ok(d2.deadline >= K.displayTime(st) + 120);
  answer(st, 'vv.heated', 'cool');
  assert.equal(st.outcome['vv.heated'], 'cooled');
  // 自由聊天里也拦
  const r3 = K.playerSay(pkg, st, 'cx', '我想自杀');
  assert.ok(r3.halted && st.halted.node === null);
  K.resume(pkg, st);
  assert.ok(K.nextStop(pkg, st).at > st.now);
  invariants(st);
});

/* ---------- 4 坦白 ---------- */
test('4 坦白：对知夏说了 → knows.xzx 有 told；只认玩家知道的、只对知夏', () => {
  const st = K.newGame(pkg, EXTRAS);
  const route = K.playerSay(pkg, st, 'xzx', CONFESS['f.sm']);
  assert.deepEqual(route.tellable.map((t) => t.fact).sort(), ['f.sm', 'f.vv'], '开局玩家只知道 f.sm、f.vv');
  assert.ok(route.tellable.every((t) => t.text === pkg.facts.find((f) => f.key === t.fact).text && t.label));
  assert.equal(route.needsJudge, true);
  assert.equal(route.decision, null);
  const r = K.applyJudgement(pkg, st, route, { intent: null, boundary: null, told: ['f.sm', 'f.lyy', 'f.sm_night'] });
  assert.equal(r.resolved, null);
  assert.ok(st.knows.xzx['f.sm'].includes('told'));
  assert.equal(st.knows.xzx['f.lyy'], undefined, '玩家不知道的事说不出口');
  assert.equal(st.knows.xzx['f.sm_night'], undefined);
  const again = K.playerSay(pkg, st, 'xzx', '还有');
  assert.deepEqual(again.tellable.map((t) => t.fact), ['f.vv'], '已经亲口说过的不再列');
  // 别人那里不开坦白检测
  const toSm = K.playerSay(pkg, st, 'sm', CONFESS['f.sm']);
  assert.deepEqual(toSm.tellable, []);
  K.applyJudgement(pkg, st, toSm, { intent: null, boundary: null, told: ['f.vv'] });
  assert.equal(st.knows.sm['f.vv'], undefined);
  // 闲聊不叫裁判
  const plain = K.playerSay(pkg, st, 'xzx', '今天好累，早点睡');
  assert.equal(plain.needsJudge, false);
  // 关键词：真实的坦白说法至少命中两个；寻常说法命中不到两个
  const real = {
    'f.sm': ['10 月 18 号那晚，是苏蔓开车送我回来的。', '组里的苏蔓对我有点意思，我没处理好。', '其实那天是苏蔓送我回来的，我骗了你。', '苏蔓喜欢我，我没推开。'],
    'f.sm_night': ['苏蔓昨晚给我发了不该发的东西。', '平板上弹出来那条是苏蔓发的。', '昨晚苏蔓跟我表白了。'],
    'f.vv': ['我在网上认识了一个人，还给她转过钱。', '我在遇屿上跟一个女的聊过，可能被骗了。', '同心账户那笔是我转的，网上认识的人带我投资。', 'Vivi 是我在网上认识的，我转了钱。'],
    'f.lyy': ['周三那晚我其实在梁总家吃饭。', '跟你说实话，梁总叫我去她家吃饭。', '那天说加会是骗你的，我去了梁总的私宴。'],
  };
  const plainSays = ['对，组里的。', '苏蔓是我们组的', '同心账户那笔是公司垫付的', '梁总人挺好的', '周三一起吃饭吗', '今天加班', '我承认，我没跟你说', '说实话我有点紧张'];
  // 兜底裁判的口径（B）：命中 ≥2 个，且至少 1 个只属于这条事实
  const own = (fact) => { const mine = EXTRAS.tellable.find((t) => t.fact === fact).keywords; return mine.filter((k) => !EXTRAS.tellable.some((t) => t.fact !== fact && t.keywords.includes(k))); };
  const counts = (s, t) => { const h = K.keywordHits(s, t.keywords); return h.length >= 2 && K.keywordHits(s, own(t.fact)).length >= 1; };
  for (const t of EXTRAS.tellable) {
    assert.ok(own(t.fact).length >= 5, `${t.fact} 专属关键词太少`);
    for (const s of real[t.fact]) assert.ok(counts(s, t), `${t.fact} 没命中：${s}（${K.keywordHits(s, t.keywords)}）`);
    for (const s of plainSays) assert.ok(!counts(s, t), `${t.fact} 误中：${s}（${K.keywordHits(s, t.keywords)}）`);
  }
  // 节点里的坦白意图例句也要能命中
  for (const [nk, ik, fact] of [['xzx.dress_fitting', 'tell_sm', 'f.sm'], ['xzx.dress_fitting', 'tell_vv', 'f.vv'], ['xzx.joint_sms', 'truth', 'f.vv'], ['crisis.tablet', 'explain', 'f.sm_night'], ['crisis.two_dinners', 'truth', 'f.lyy']]) {
    const ex = node(nk).decision.intents.find((i) => i.key === ik).examples;
    const kw = EXTRAS.tellable.find((t) => t.fact === fact).keywords;
    assert.ok(ex.some((s) => K.keywordHits(s, kw).length >= 2 && K.keywordHits(s, own(fact)).length >= 1), `${nk}/${ik} 的例句命中不了 ${fact}`);
  }
  // 有待回答事件时：先按意图结算，再记坦白。试纱间说梁总那顿饭，结果应该是“说了梁总”，不是“又说了梁总”
  const st3 = runScript({ 'lyy.dinner_invite': 'accept', 'crisis.two_dinners': 'lie_meeting', 'crisis.tasting': 'smooth_over' }, { until: (s) => s.open.some((d) => d.node === 'xzx.dress_fitting') });
  assert.ok(st3.knows.player['f.lyy'] && !(st3.knows.xzx['f.lyy'] || []).includes('told'));
  const rf = K.playerSay(pkg, st3, 'scene:xzx.dress_fitting', '周三那晚我其实在梁总家吃饭。');
  assert.ok(rf.tellable.some((t) => t.fact === 'f.lyy'));
  K.applyJudgement(pkg, st3, rf, { intent: 'tell_lyy', boundary: null, told: ['f.lyy'] });
  assert.equal(st3.outcome['xzx.dress_fitting'], 'told_lyy');
  assert.ok(st3.knows.xzx['f.lyy'].includes('told'));
  // 最后一问“只说一部分”：结果按之前的状态选，说出口的那件随后记为被告知
  const mk = () => runScript({ 'lyy.dinner_invite': 'accept', 'crisis.two_dinners': 'lie_meeting', 'crisis.tasting': 'smooth_over', 'sm.late_edit': 'promise', 'xzx.dress_fitting': 'compliment', 'crisis.tablet': 'lie_work' }, { until: (s) => s.open.some((d) => d.node === 'xzx.last_question') });
  const a1 = mk(), a2 = mk();
  const q1 = K.playerSay(pkg, a1, 'scene:xzx.last_question', CONFESS['f.sm']);
  const q2 = K.playerSay(pkg, a2, 'scene:xzx.last_question', CONFESS['f.sm']);
  assert.ok(q1.tellable.some((t) => t.fact === 'f.sm'));
  K.applyJudgement(pkg, a1, q1, { intent: 'confess_partial', boundary: null, told: ['f.sm'] });
  K.applyJudgement(pkg, a2, q2, { intent: 'confess_partial', boundary: null, told: [] });
  assert.equal(a1.outcome['xzx.last_question'], a2.outcome['xzx.last_question']);
  assert.equal(a1.outcome['xzx.last_question'], 'partial_leave');
  assert.ok(a1.knows.xzx['f.sm'].includes('told'));
});

test('4b 越界提示与过滤：按人物、按前提，selfharm 不在候选里', () => {
  const st = K.newGame(pkg, EXTRAS);
  const toSm = K.playerSay(pkg, st, 'sm', '你今天穿得真好看，晚上来我家');
  const keys = toSm.boundaries.map((b) => b.key);
  assert.ok(keys.includes('bi.ask_image') && keys.includes('bi.advance_sm') && keys.includes('bi.explicit'));
  assert.ok(!keys.includes('bi.threaten') && !keys.includes('bi.spread_image'), '还没有“那晚那条”，不能威胁外传');
  assert.ok(!keys.includes('bi.selfharm') && !keys.includes('bi.advance_lyy'));
  assert.equal(toSm.needsJudge, true);
  const toLyy = K.playerSay(pkg, st, 'lyy', '梁总，方案我明天发您');
  assert.ok(toLyy.boundaries.some((b) => b.key === 'bi.advance_lyy'));
  assert.equal(toLyy.decision?.node, undefined, '开局时梁还没约饭');
  for (const b of pkg.policy.boundaryInputs) assert.ok(EXTRAS.boundaryHints[b.key]?.length, `boundaryHints 缺 ${b.key}`);
  // 越界关键词不能命中任何意图例句、作者写的台词（兜底裁判会把它们判成越界）
  const authored = [];
  const walk = (o) => { if (Array.isArray(o)) return o.forEach(walk); if (o && typeof o === 'object') { if (typeof o.text === 'string' && o.from) authored.push(o.text); Object.values(o).forEach(walk); } };
  walk(pkg.nodes);
  for (const c of pkg.cast) authored.push(...c.persona.sampleLines, ...c.fallbackLines);
  for (const n of pkg.nodes) for (const i of n.decision?.intents || []) authored.push(...i.examples);
  for (const t of authored) for (const [k, kw] of Object.entries(EXTRAS.boundaryHints)) {
    if (k !== 'bi.selfharm') assert.deepEqual(K.keywordHits(t, kw), [], `${k} 误中：${t}`);
  }
  for (const t of ['方案给我看看', '别摸鱼了', '栖澜酒店那边怎么说', '我去洗澡了', '这页改得真好看']) for (const [k, kw] of Object.entries(EXTRAS.boundaryHints)) assert.deepEqual(K.keywordHits(t, kw), [], `${k} 误中：${t}`);
  // 越界不在候选里就不生效
  const r = K.applyJudgement(pkg, st, toLyy, { intent: null, boundary: 'bi.advance_sm', told: [] });
  assert.equal(r.authoredReply, false);
  assert.equal(st.vars['sm.hr'], 'none');
  // 对梁越界：她当没听见，阶段变出局
  const r2 = K.applyJudgement(pkg, st, toLyy, { intent: null, boundary: 'bi.advance_lyy', told: [] });
  assert.ok(r2.authoredReply);
  assert.equal(st.threads.lyy.msgs.at(-1).text, '这话我当没听见。');
  assert.equal(st.stages.lyy, 'dropped');
  // 露骨要求：说话人换成这个线程的人物，用兜底台词
  const toVv = K.playerSay(pkg, st, 'cx', '发张照片看看');
  K.applyJudgement(pkg, st, toVv, { intent: null, boundary: 'bi.explicit', told: [] });
  const last = st.threads.cx.msgs.at(-1);
  assert.deepEqual([last.from, last.text, last.src], ['cx', '……我先忙了。', 'fallback']);
});

/* ---------- 5 knowledgeOf ---------- */
test('5 knowledgeOf 只返回本人知道的', () => {
  const st = K.newGame(pkg, EXTRAS);
  const facts = (w) => K.knowledgeOf(pkg, st, w).map((x) => x.fact).sort();
  assert.deepEqual(facts('xzx'), ['f.white_car_note', 'f.xzx_offer']);
  assert.deepEqual(facts('sm'), ['f.sm']);
  assert.deepEqual(facts('vv'), ['f.vv', 'f.vv_scam']);
  assert.deepEqual(facts('lyy'), ['f.lyy_test']);
  assert.deepEqual(facts('cx'), []);
  assert.deepEqual(facts('player'), ['f.sm', 'f.vv']);
  assert.ok(K.knowledgeOf(pkg, st, 'xzx').every((x) => x.via.join() === 'saw' && x.text));
  // 走一局，任何时候每个人拿到的都只是自己 knows 里的
  const s2 = runScript({ 'lyy.dinner_invite': 'accept', 'crisis.two_dinners': 'lie_meeting', 'vv.big_window': 'borrow_cx', 'sm.late_edit': 'promise' }, { until: (s) => s.now >= K.toMin('D9 00:00') });
  for (const who of ['player', ...pkg.cast.map((c) => c.key), ...pkg.supporting.map((c) => c.key)]) {
    const k = K.knowledgeOf(pkg, s2, who);
    for (const x of k) assert.deepEqual(x.via, s2.knows[who][x.fact]);
    assert.equal(k.length, Object.keys(s2.knows[who] || {}).length);
  }
  assert.ok(K.knowledgeOf(pkg, s2, 'lyy').some((x) => x.fact === 'f.lyy'));
  assert.ok(K.knowledgeOf(pkg, s2, 'cx').some((x) => x.fact === 'f.vv' && x.via.includes('told')));
  assert.ok(!K.knowledgeOf(pkg, s2, 'cx').some((x) => x.fact === 'f.vv_scam'), '陈骁识破了，但 f.vv_scam 只给了玩家');
  assert.ok(!K.knowledgeOf(pkg, s2, 'xzx').some((x) => x.fact === 'f.vv'));
  // 返回的是拷贝，改了不影响状态
  K.knowledgeOf(pkg, s2, 'cx')[0].via.push('saw');
  assert.ok(!s2.knows.cx['f.vv'].includes('saw'));
});

/* ---------- 6 跳时间与超时 ---------- */
test('6 跳时间跳过截止 → 超时结算；nextStop.willTimeout 预告正确', () => {
  const st = K.newGame(pkg, EXTRAS);
  assert.equal(st.now, K.toMin('D0 21:30'));
  assert.deepEqual(K.timeLabel(st), { clock: '21:30', date: '11月9日 周一', countdown: '离婚礼还有 12 天', day: 0 });
  assert.deepEqual(K.timeLabel(st, K.toMin('D7 23:05')), { clock: '23:05', date: '11月16日 周一', countdown: '离婚礼还有 5 天', day: 7 });
  assert.equal(K.timeLabel(st, K.toMin('D12 06:00')).countdown, '今天是婚礼');
  let ns = K.nextStop(pkg, st);
  assert.equal(ns.at, K.toMin('D0 21:35'));
  assert.deepEqual(ns.willTimeout, []);
  assert.equal(ns.label, '21:35');
  K.jump(pkg, st);
  K.jump(pkg, st); // 21:40 梁约饭
  assert.deepEqual(st.open.map((d) => d.node), ['vv.heated', 'lyy.dinner_invite']);
  const vv = st.open[0];
  assert.deepEqual([vv.openAt, vv.deadline, vv.thread, vv.owner], [K.toMin('D0 21:35'), K.toMin('D0 23:35'), 'vv', 'vv']);
  ns = K.nextStop(pkg, st);
  assert.equal(ns.at, K.toMin('D0 23:35'));
  assert.deepEqual(ns.willTimeout, [{ node: 'vv.heated', owner: 'vv', title: '这么晚还不睡' }]);
  assert.ok(ns.reasons[0].includes('这么晚还不睡'));
  const j = K.jump(pkg, st);
  assert.deepEqual(j.timedOut, ['vv.heated']);
  assert.equal(j.from, K.toMin('D0 21:40'));
  assert.equal(j.to, K.toMin('D0 23:35'));
  assert.equal(j.dayChanged, false);
  assert.equal(st.outcome['vv.heated'], 'ignored');
  const last = st.threads.vv.msgs.at(-1);
  assert.deepEqual([last.text, last.at, last.src], ['又不回我？', K.toMin('D0 23:35'), 'authored']);
  // 下一站是第二天早上（安静时段过后），然后才是梁的截止
  ns = K.nextStop(pkg, st);
  assert.equal(ns.at, K.toMin('D1 08:00'));
  assert.equal(ns.label, '明天 08:00');
  assert.deepEqual(ns.willTimeout, []);
  assert.ok(K.jump(pkg, st).dayChanged);
  ns = K.nextStop(pkg, st);
  assert.deepEqual(ns.willTimeout.map((w) => w.node), ['lyy.dinner_invite']);
  K.jump(pkg, st);
  assert.equal(st.outcome['lyy.dinner_invite'], 'lapsed');
  // 没事发生的时刻不停：没答应梁，两场饭的危机不会成为一站
  const s2 = runScript({ 'lyy.dinner_invite': 'decline', 'sm.late_edit': 'process' }, { until: (s) => s.now >= K.toMin('D2 08:00') });
  assert.equal(K.nextStop(pkg, s2).at, K.toMin('D3 08:00'));
  // 答应了：两场饭在 19:20 准时开始
  const s3 = runScript({ 'lyy.dinner_invite': 'accept', 'sm.late_edit': 'process' }, { until: (s) => s.now >= K.toMin('D2 08:00') });
  assert.equal(K.nextStop(pkg, s3).at, K.toMin('D2 19:20'));
  K.jump(pkg, s3);
  assert.ok(s3.open.some((d) => d.node === 'crisis.two_dinners'));
  // 两场饭不回：19:50 超时 → 去了梁宅 → 私宴在同一刻开始（窗口 19:30–22:00 内）
  ns = K.nextStop(pkg, s3);
  assert.equal(ns.at, K.toMin('D2 19:50'));
  const j3 = K.jump(pkg, s3);
  assert.deepEqual(j3.timedOut, ['crisis.two_dinners']);
  assert.deepEqual(j3.started, ['lyy.private_dinner']);
  assert.equal(s3.vars['lyy.dinner'], 'went');
});

/* ---------- 7 存档往返 ---------- */
test('7 存档 JSON 往返后继续玩，结果和不存档完全一致', () => {
  for (const seed of [11, 222, 3333, 44444, 555555]) {
    const r1 = makeRng(seed);
    let fork = null;
    const a = playFree(r1, K.newGame(pkg, EXTRAS), 4000, (g, s) => {
      if (g === 60) fork = { st: clone(s), rng: r1.s };
      return null;
    });
    assert.ok(fork, '应该在第 60 步存档');
    const r2 = makeRng(0); r2.s = fork.rng;
    const b = playFree(r2, fork.st, 4000, null);
    // 两条路的操作序列从存档点开始完全相同（同一随机数状态），最终状态必须逐字节一致
    assert.equal(JSON.stringify(b), JSON.stringify(a), `种子 ${seed} 往返后不一致`);
    assert.ok(a.ended);
  }
});

/* ---------- 8 sim-lite 的脚本局：两边一致 ---------- */
test('8 sim-lite 脚本局搬到本内核：结局、关键状态与 runtime-lite 一致', () => {
  const at = (st, k) => st.outcome[k];
  const cases = [
    ['滴水不漏的骗子', { 'xzx.guestlist': 'logout_tablet', 'lyy.dinner_invite': 'decline', 'vv.trial': 'refuse', 'vv.big_window': 'refuse', 'sm.late_edit': 'process', 'xzx.last_question': 'deny', 'xzx.dress_fitting': 'compliment', 'cx.bachelor': 'keep_quiet', 'vv.heated': 'cool', 'work.vp_pick': 'pick_zc', 'sm.photo_night': 'firm_boundary', 'sm.reckoning': 'reset' }, 'e.unaware', (st) => !st.ran['crisis.tablet']],
    ['一路说实话', { 'lyy.dinner_invite': 'accept', 'crisis.two_dinners': 'truth', 'vv.big_window': 'pay_joint', 'xzx.joint_sms': 'truth', 'sm.late_edit': 'process', 'crisis.tablet': 'explain', 'xzx.last_question': 'confess_all', 'vv.withdraw_block': 'report', 'lyy.private_dinner': 'hold' }, 'e.stay', (st) => !st.ran['crisis.tasting']],
    ['全线撒谎', { 'lyy.dinner_invite': 'accept', 'crisis.two_dinners': 'lie_meeting', 'crisis.tasting': 'smooth_over', 'vv.big_window': 'pay_joint', 'xzx.joint_sms': 'lie', 'sm.late_edit': 'promise', 'crisis.tablet': 'lie_work', 'vv.withdraw_block': 'pay_again', 'crisis.call_at_dinner': 'hang_up', 'xzx.last_question': 'deny' }, 'e.leave', (st) => st.vars['sm.night'] === 'image'],
    ['只被抓到一件、只撒了一次谎', { 'lyy.dinner_invite': 'accept', 'crisis.two_dinners': 'lie_meeting', 'crisis.tasting': 'silent', 'sm.late_edit': 'process', 'xzx.guestlist': 'logout_tablet', 'vv.big_window': 'refuse', 'vv.trial': 'refuse', 'xzx.last_question': 'deny' }, 'e.silent'],
    ['主动叫停', { 'xzx.last_question': 'pause' }, 'e.pause'],
    ['辜负苏蔓', { 'sm.late_edit': 'promise', 'work.vp_pick': 'pick_zc', 'sm.reckoning': 'reset', 'xzx.last_question': 'confess_all' }, 'e.stay', (st) => at(st, 'work.signing') === 'benched' && st.ran['sm.reckoning'] === true],
    ['那晚拿图片威胁苏蔓', { 'xzx.last_question': 'confess_all', 'sm.late_edit': 'flirt' }, 'e.stay', (st) => st.vars['sm.hr'] === 'she_filed' && !st.ran['sm.reckoning'] && at(st, 'work.signing') === 'benched' && at(st, 'sm.photo_night') === 'harassed', { boundary: (n, bis) => (n.key === 'sm.photo_night' ? bis.find((b) => b.key === 'bi.threaten') : null) }],
    ['最后一问自伤、没点继续', {}, null, (st) => st.halted?.node === 'xzx.last_question' && at(st, 'xzx.last_question') === undefined && !st.ran['ending.wedding'], { boundary: (n, bis) => (n.key === 'xzx.last_question' ? bis.find((b) => b.key === 'bi.selfharm') : null), resume: () => false }],
    ['自伤后点了继续，再答没有', { 'xzx.last_question': 'deny', 'lyy.dinner_invite': 'decline', 'sm.late_edit': 'process', 'xzx.guestlist': 'logout_tablet', 'vv.big_window': 'refuse', 'vv.trial': 'refuse' }, 'e.unaware', (st) => String(at(st, 'xzx.last_question')).startsWith('deny'), { boundary: (n, bis) => (n.key === 'xzx.last_question' ? bis.find((b) => b.key === 'bi.selfharm') : null) }],
    ['私宴对梁越界', { 'lyy.dinner_invite': 'accept', 'crisis.two_dinners': 'truth', 'lyy.private_dinner': 'sell_self' }, 'e.stay', (st) => at(st, 'lyy.private_dinner') === 'crossed' && at(st, 'work.signing') === 'dropped', { boundary: (n, bis) => (n.key === 'lyy.private_dinner' ? bis.find((b) => b.key === 'bi.advance_lyy') : null) }],
    ['宵夜对苏蔓动手动脚', { 'sm.late_edit': 'promise' }, 'e.stay', (st) => at(st, 'sm.late_edit') === 'harassed' && !st.ran['sm.photo_night'] && at(st, 'work.signing') === 'benched', { boundary: (n, bis) => (n.key === 'sm.late_edit' ? bis.find((b) => b.key === 'bi.advance_sm') : null) }],
    ['每件事都提前说过', { 'lyy.dinner_invite': 'decline', 'xzx.dress_fitting': 'tell_sm', 'vv.big_window': 'pay_joint', 'xzx.joint_sms': 'truth', 'crisis.tablet': 'explain', 'vv.withdraw_block': 'report', 'xzx.last_question': 'deny' }, 'e.stay', (st) => at(st, 'xzx.last_question') === 'deny_told'],
  ];
  const bad = [];
  for (const [label, map, expect, check, opts = {}] of cases) {
    const st = runScript(map, opts);
    invariants(st);
    const ending = st.ended?.ending ?? null;
    if (ending !== expect || (check && !check(st))) bad.push(`${label}：${ending}（预期 ${expect}）`);
    if (lite) {
      const p = { choose: (n) => map[n.key] ?? n.decision.intents[0].key, boundary: opts.boundary || (() => null), resume: opts.resume || (() => true) };
      const r = lite.play(pkg, p);
      if ((r.ending ?? null) !== ending) bad.push(`${label}：runtime-lite ${r.ending}，本内核 ${ending}`);
      if (outcomeKey(r.st) !== outcomeKey(st)) bad.push(`${label}：节点结果与 runtime-lite 不同\n  lite ${outcomeKey(r.st)}\n  ours ${outcomeKey(st)}`);
    }
    if (st.ended) assert.equal(st.ended.epilogues.length, pkg.epilogues.length);
  }
  assert.deepEqual(bad, []);
});

/* ---------- 9 路由、导演、草稿 ---------- */
test('9 消息路由、现场线程、导演日志、主动消息、applyPatch', () => {
  const st = K.newGame(pkg, EXTRAS);
  // 开场：旁白和系统进“此刻”，人物进各自私聊
  assert.deepEqual(st.threads.feed.msgs.map((m) => m.from), ['narrator', 'system']);
  for (const k of ['xzx', 'zz', 'sm', 'cx']) assert.equal(st.threads[k].msgs[0].from, k);
  assert.equal(st.threads.feed.kind, 'feed');
  assert.equal(st.threads.feed.title, '此刻');
  assert.equal(st.order[0] === 'feed' || st.order.includes('feed'), true);
  assert.ok(st.directorLog.some((l) => l.kind === 'start' && l.text.includes('刚进家门')));
  K.markRead(st, 'xzx');
  assert.equal(st.threads.xzx.unread, 0);
  // 现场节点、无决策：签约直接结算并关闭
  const s2 = runScript({ 'lyy.dinner_invite': 'accept', 'crisis.two_dinners': 'truth', 'lyy.private_dinner': 'hold' }, { until: (s) => s.ran['work.signing'] });
  const sg = s2.threads['scene:work.signing'];
  assert.ok(sg.closed && sg.with === 'zz');
  assert.equal(s2.outcome['work.signing'], 'passed');
  assert.ok(sg.msgs.some((m) => m.from === 'lyy' && m.text.startsWith('你过了')));
  assert.ok(s2.knows.player['f.lyy_test'].includes('heard'));
  // chat 节点里非 owner 的人物进自己的私聊：两场饭“去家宴”时梁回“下次吧”
  const s3 = runScript({ 'lyy.dinner_invite': 'accept', 'crisis.two_dinners': 'go_family' }, { until: (s) => s.outcome['crisis.two_dinners'] });
  assert.equal(s3.threads.lyy.msgs.at(-1).text, '下次吧。');
  assert.equal(s3.threads.xzx.msgs.at(-1).text, '好～快点，汤要凉了。');
  // chat 节点里的系统消息进 owner 的私聊
  const s4 = runScript({}, { until: (s) => s.ran['vv.big_window'] });
  assert.ok(s4.threads.vv.msgs.some((m) => m.from === 'system' && m.text.startsWith('提示：收款方')));
  // 暗场不进任何线程
  assert.ok(!Object.keys(s4.threads).some((k) => k.includes('meets_sm')));
  // 主动消息：每人每天上限、在等回复的不发、安静时段不发
  const s5 = K.newGame(pkg, EXTRAS);
  K.jump(pkg, s5); // Vivi 在等回复
  const p = D.planProactive(pkg, s5, EXTRAS);
  assert.ok(p && p.char !== 'vv' && p.brief.includes(pkg.cast.find((c) => c.key === p.char).goal));
  assert.ok(!/setup|decision|Vivi 是诈骗/.test(p.brief));
  for (let i = 0; i < 20; i++) { const q = D.planProactive(pkg, s5, EXTRAS); if (!q) break; D.commitProactive(s5, q.char); }
  const day = Math.floor(s5.now / 1440);
  assert.ok(Object.values(s5.proactive[day]).every((n) => n <= pkg.director.proactivePerCharacterPerDay));
  assert.equal(s5.proactive[day].vv, undefined);
  s5.now = K.toMin('D1 03:00');
  assert.equal(D.planProactive(pkg, s5, EXTRAS), null);
  // applyPatch：深拷贝、白名单、extraCast
  const before = JSON.stringify(pkg);
  const p2 = K.applyPatch(pkg, {
    cast: { xzx: { voice: '新的说话方式', habits: ['a'], motive: { surface: 's' }, goal: 'g', age: 3, contactCeiling: 'hug', stages: [] } },
    director: { proactivePerCharacterPerDay: 3, quietHours: ['00:30', '07:00'], maxCrisesPerDay: 'x' },
    policy: { promptBlock: '新边界' },
    extraCast: [{ key: 'qq', name: '乔乔', age: 25, role: '新同事' }, { name: '小孩', age: 12 }],
  });
  assert.equal(JSON.stringify(pkg), before, '不能改原世界包');
  const x2 = p2.cast.find((c) => c.key === 'xzx');
  assert.deepEqual([x2.persona.voice, x2.persona.habits, x2.motive.surface, x2.goal, x2.age, x2.contactCeiling], ['新的说话方式', ['a'], 's', 'g', 29, 'hug']);
  assert.equal(x2.stages.length, 3);
  assert.equal(p2.director.proactivePerCharacterPerDay, 3);
  assert.deepEqual(p2.director.quietHours, ['00:30', '07:00']);
  assert.equal(p2.director.maxCrisesPerDay, 1);
  assert.equal(p2.policy.promptBlock, '新边界');
  assert.deepEqual(p2.cast.filter((c) => c.extra).map((c) => [c.key, c.contactCeiling]), [['qq', 'none']]);
  const s6 = K.newGame(p2, EXTRAS);
  assert.equal(s6.stages.qq, 'met');
  const q6 = D.planProactive(p2, s6, EXTRAS);
  assert.ok(q6, '新人物可以主动来消息');
  K.nextStop(p2, s6); K.jump(p2, s6);
  // nodeStatus
  assert.equal(K.nodeStatus(pkg, s4, 'vv.big_window'), s4.outcome['vv.big_window'] ? 'done' : 'open');
  assert.equal(K.nodeStatus(pkg, s4, 'ending.wedding'), 'waiting');
  assert.equal(K.nodeStatus(pkg, s4, 'lyy.private_dinner'), 'missed');
});

console.log(failed ? `\n${failed} 项失败` : '\n全部通过');
process.exitCode = failed ? 1 : 0;
