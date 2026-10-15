// 导演（CONTRACT §8）：固定规则 D1–D6，按顺序执行，不打分、不调模型。
// D1–D5 与 runtime-lite.mjs 的 play() 同义：候选 = 没开过 + 在窗口内 + 触发条件成立；
// 安静时段挡 optional；危机受“首个时间 / 每天上限 / 间隔”限制；排序 must > 危机 > priority；一次开一个，再重算。
import { evalCond, startNode, toMin } from './kernel.js';
import { EXTRAS } from './world-extras.js';

const LOG_CAP = 800;
function dlog(st, kind, text) {
  st.directorLog.push({ at: st.now, kind, text });
  if (st.directorLog.length > LOG_CAP) st.directorLog.splice(0, st.directorLog.length - LOG_CAP);
}

/** D3：危机限制。返回挡下的原因，或 null。 */
export const crisisLimit = (pkg, st, node) => {
  const d = pkg.director;
  if (!node.crisis) return null;
  if (st.now < toMin(d.firstCrisisNotBefore)) return '早于第一个危机的时间';
  const day = Math.floor(st.now / 1440);
  if (st.crises.filter((t) => Math.floor(t / 1440) === day).length >= d.maxCrisesPerDay) return '当天已有危机';
  if (st.crises.some((t) => st.now - t < d.minHoursBetweenCrises * 60)) return '离上一个危机不足间隔';
  return null;
};

/** D4：安静时段（按故事钟）。 */
export const inQuiet = (pkg, now) => {
  const [a, b] = pkg.director.quietHours.map((x) => Number(x.slice(0, 2)) * 60 + Number(x.slice(3)));
  const m = ((now % 1440) + 1440) % 1440;
  return a < b ? m >= a && m < b : m >= a || m < b;
};

function block(st, n, why) {
  if (st.blocked[n.key] === why) return;
  st.blocked[n.key] = why;
  dlog(st, 'block', `「${n.title}」${why}`);
}

function why(pkg, n, rest) {
  const parts = [];
  if (n.trigger.mode === 'must') parts.push('D1 must：窗口内条件一成立就开始');
  else parts.push('optional：条件成立、不在安静时段');
  if (n.crisis) {
    const col = pkg.collisions.find((c) => c.crisis === n.key);
    parts.push(`D2 碰撞「${col?.label || '?'}」成立`);
  }
  if (rest.length) parts.push(`D5 同时还有 ${rest.map((x) => `「${x.title}」`).join('')}，按 must > 危机 > priority 先开这个（priority ${n.priority}）`);
  return parts.join('；');
}

/** 窗口已经过了、却没开过的节点：记一笔“没发生”。 */
function noteMissed(pkg, st) {
  for (const n of pkg.nodes) {
    if (st.ran[n.key] || st.missed[n.key] || st.now <= toMin(n.trigger.window[1])) continue;
    st.missed[n.key] = true;
    dlog(st, 'miss', `「${n.title}」窗口已过，没发生（${st.seen[n.key] ? '被规则挡下：' + (st.blocked[n.key] || '?') : '触发条件没成立'}）`);
  }
}

/** 在 st.now 按 D1–D5 选节点并开始，直到没有可开的。返回开始的节点 key。 */
export function tick(pkg, st) {
  const started = [];
  if (st.halted || st.ended) return started;
  noteMissed(pkg, st);
  for (let guard = 0; guard < 64; guard++) {
    const t = st.now;
    const cands = pkg.nodes.filter((n) => !st.ran[n.key] && t >= toMin(n.trigger.window[0]) && t <= toMin(n.trigger.window[1]) && evalCond(pkg, st, n.trigger.when));
    for (const n of cands) st.seen[n.key] = true;
    const ok = cands.filter((n) => {
      if (n.trigger.mode === 'optional' && inQuiet(pkg, t)) { block(st, n, '被挡：安静时段只放 must（D4）'); return false; }
      const w = crisisLimit(pkg, st, n);
      if (w) { block(st, n, `危机被挡：${w}（D3）`); return false; }
      return true;
    });
    if (!ok.length) break;
    ok.sort((a, b) => (b.trigger.mode === 'must') - (a.trigger.mode === 'must') || !!b.crisis - !!a.crisis || b.priority - a.priority);
    const n = ok[0];
    dlog(st, 'start', `开始「${n.title}」${n.hidden ? '（暗场，玩家看不到）' : ''}：${why(pkg, n, ok.slice(1))}`);
    startNode(pkg, st, n.key);
    started.push(n.key);
    if (st.halted || st.ended) break;
  }
  return started;
}

/**
 * D6：节点之外的主动消息。cast 人物；当天主动次数没到上限；不在安静时段；她没有待回答事件；阶段不在 silentStages；
 * 选最久没和玩家说过话的那位。brief 只写她自己的目标和阶段含义，不写剧情。
 */
export function planProactive(pkg, st, extras = EXTRAS) {
  if (st.halted || st.ended) return null;
  const d = pkg.director;
  if (inQuiet(pkg, st.now)) { dlog(st, 'proactive', 'D6：安静时段，不安排主动消息'); return null; }
  const day = Math.floor(st.now / 1440);
  const used = st.proactive[day] || {};
  const silent = extras?.silentStages || [];
  const busy = new Set();
  for (const o of st.open) { if (o.owner) busy.add(o.owner); const w = st.threads[o.thread]?.with; if (w) busy.add(w); }
  const pool = pkg.cast.filter((c) => (used[c.key] || 0) < d.proactivePerCharacterPerDay
    && !silent.includes(st.stages[c.key]) && !busy.has(c.key) && extras?.people?.[c.key]?.chat !== false);
  if (!pool.length) { dlog(st, 'proactive', 'D6：没有人可以主动发消息（配额用完、在等你回复或已经不再联系）'); return null; }
  const last = (k) => (st.threads[k]?.msgs.length ? st.threads[k].lastAt : -1);
  const c = [...pool].sort((a, b) => last(a.key) - last(b.key))[0];
  const stage = c.stages.find((s) => s.key === st.stages[c.key]) || c.stages[0];
  const brief = `你自己想要的：${c.goal}\n你们现在的关系：${stage.label}——${stage.meaning}\n现在主动给他发消息，像平时那样开个头；只说你自己知道的事，不提还没发生的事，不替任何事情下结论。`;
  return { char: c.key, brief };
}

export function commitProactive(st, char) {
  const day = Math.floor(st.now / 1440);
  const m = (st.proactive[day] ??= {});
  m[char] = (m[char] || 0) + 1;
  dlog(st, 'proactive', `D6：${EXTRAS.people?.[char]?.name || char} 主动发了一条（今天第 ${m[char]} 条）`);
}
