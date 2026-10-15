// 后台控制室（CONTRACT §12）：架构 / 运行监控 / 世界设定 / 成本。
// 只通过 app 读状态、发动作；只 import ./world.js（原始世界包：草稿对照、还原用）。
// 所有动态文本都先转义再进 innerHTML；模型输出、prompt 不会被当成 HTML。
import { WORLD } from './world.js';

/* ================================================================== */
/* 常量                                                                */
/* ================================================================== */

const TABS = [
  { key: 'arch', label: '架构' },
  { key: 'runtime', label: '运行监控' },
  { key: 'world', label: '世界设定' },
  { key: 'cost', label: '成本' },
];
const RT_TABS = [
  { key: 'calls', label: 'Agent 调用' },
  { key: 'director', label: '导演日志' },
  { key: 'state', label: '世界状态' },
  { key: 'events', label: '事件进度' },
];
const WD_TABS = [
  { key: 'cast', label: '人物' },
  { key: 'events', label: '事件' },
  { key: 'director', label: '导演规则' },
  { key: 'policy', label: '内容边界' },
];

const AGENT = {
  character: { label: '人物', cls: 'ad-a-char', name: '人物 Agent' },
  judge: { label: '裁判', cls: 'ad-a-judge', name: '裁判 Agent' },
  memory: { label: '记忆', cls: 'ad-a-mem', name: '记忆 Agent' },
  writer: { label: '编剧', cls: 'ad-a-writer', name: '编剧 Agent' },
};
const AGENT_ORDER = ['character', 'judge', 'memory', 'writer'];
const TRIGGER = { player: '回玩家', outcome: '接结果', proactive: '主动来信', day: '故事日整理', admin: '后台生成' };
const TIER = { quick: '快速档', default: '默认档', complex: '复杂档' };
const VIA = { saw: '看见', told: '被告知', heard: '听说' };
const VIA_CLS = { saw: 'ad-v-saw', told: 'ad-v-told', heard: 'ad-v-heard' };
const ERR = {
  offline: '离线', rate_limited: '限流', upstream_error: '上游出错', refused: '模型拒答', invalid_json: 'JSON 不合法',
  empty_completion: '空回复', prompt_too_large: 'prompt 太长', not_granted: '未授权', sampling_disabled: '采样关闭',
  not_declared: '未声明能力', capability_disabled: '能力关闭', capability_removed: '能力被移除', bad_prompt: 'prompt 构造失败',
  bad_char: '未知人物', invalid_card: '人设卡不合格',
};
const KIND = { opening: '开场', chat: '私聊', call: '通话', scene: '现场', world_event: '世界事件', ending: '结局' };
const DIR_KIND = { start: { t: '开始', c: 'ad-k-start' }, block: { t: '被挡', c: 'ad-k-block' }, miss: { t: '没发生', c: 'ad-k-miss' }, proactive: { t: '主动消息', c: 'ad-k-pro' } };
const KER_KIND = {
  start: '开局', var: '变量', stage: '阶段', reveal: '知情', node: '节点', outcome: '结果', end: '结局', boundary: '越界',
  halt: '暂停', resume: '继续', timeout: '超时', jump: '跳时间', error: '错误',
};
const STATUS = { waiting: { t: '未到', c: 'ad-s-wait' }, open: { t: '进行中', c: 'ad-s-open' }, done: { t: '已结算', c: 'ad-s-done' }, missed: { t: '没发生', c: 'ad-s-miss' } };
// 事实的短名（矩阵表头用）；没有的用 key
const FACT_SHORT = {
  'f.sm': '苏蔓越界', 'f.sm_night': '深夜消息', 'f.vv': 'Vivi', 'f.lyy': '梁宅私宴', 'f.white_car_note': '白车备忘',
  'f.tablet_popup': '平板弹窗', 'f.joint_out': '同心转账', 'f.antifraud': '反诈电话', 'f.tablet_logout': '退出平板',
  'f.vv_scam': 'Vivi 是骗局', 'f.lyy_test': '梁的考题', 'f.xzx_offer': '知夏的 offer',
};
const FACT_KIND = { secret: '秘密', evidence: '证据', truth: '真相' };
// 与 agents.js 的 PRICES 相同（不能 import）；只在日志缺 cost 字段、以及展示价格表时用
const PRICES = {
  mini: { label: 'gpt-4o-mini', in: 0.15, cached: 0.075, out: 0.60 },
  flash: { label: 'DeepSeek V4-Flash（第三方报价）', in: 0.14, cached: 0.0028, out: 0.28 },
  fx: 7.2,
};
// 之前的成本模型（agent-cost 页，重度用户每天 60 条消息）在两种价格下的结果，人民币/天
const OLD_MODEL = { mini: { old: 1.07, next: 0.27 }, flash: { old: 0.81, next: 0.16 } };
// 可编辑的人设字段（path → 标签、是否列表）
const CAST_FIELDS = [
  { path: 'persona.voice', label: '说话方式', list: false, rows: 2 },
  { path: 'persona.habits', label: '习惯（一行一条）', list: true, rows: 4 },
  { path: 'persona.sampleLines', label: '台词样例（一行一条）', list: true, rows: 4 },
  { path: 'motive.surface', label: '表面动机', list: false, rows: 2 },
  { path: 'motive.deep', label: '深层动机', list: false, rows: 3 },
  { path: 'goal', label: '目标', list: false, rows: 2 },
  { path: 'rules', label: '必须遵守（一行一条）', list: true, rows: 4 },
  { path: 'never', label: '绝不（一行一条）', list: true, rows: 3 },
  { path: 'fallbackLines', label: '兜底台词（一行一条）', list: true, rows: 3 },
];
const DIR_FIELDS = [
  { key: 'proactivePerCharacterPerDay', label: '每人每天主动消息上限', unit: '条', min: 0, max: 10 },
  { key: 'maxCrisesPerDay', label: '每天危机上限', unit: '个', min: 0, max: 5 },
  { key: 'minHoursBetweenCrises', label: '两个危机至少间隔', unit: '小时', min: 0, max: 48 },
];

/* ================================================================== */
/* 小工具                                                              */
/* ================================================================== */

const esc = (s) => String(s ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const nf = (n) => Math.round(Number(n) || 0).toLocaleString('zh-CN');
const pad = (n) => String(n).padStart(2, '0');
const WEEK = ['周日', '周一', '周二', '周三', '周四', '周五', '周六'];
const isVarColor = (c) => typeof c === 'string' && /^var\(--[a-z0-9-]+\)$/.test(c);
const deep = (o) => JSON.parse(JSON.stringify(o));
const same = (a, b) => JSON.stringify(a) === JSON.stringify(b);
const getPath = (o, p) => p.split('.').reduce((x, k) => (x == null ? undefined : x[k]), o);
function setPath(o, p, v) {
  const ks = p.split('.');
  let x = o;
  for (const k of ks.slice(0, -1)) x = x[k] ??= {};
  x[ks[ks.length - 1]] = v;
}
function delPath(o, p) {
  const ks = p.split('.');
  const parent = ks.slice(0, -1).reduce((x, k) => (x == null ? undefined : x[k]), o);
  if (parent) delete parent[ks[ks.length - 1]];
  if (ks.length > 1 && parent && !Object.keys(parent).length) delPath(o, ks.slice(0, -1).join('.'));
}

function yuan(v, d) {
  v = Number(v) || 0;
  if (v === 0) return '¥0';
  if (d === undefined) d = v === 0 ? 2 : v < 0.01 ? 4 : v < 1 ? 3 : 2;
  return '¥' + v.toFixed(d);
}
const msText = (ms) => (!ms && ms !== 0 ? '—' : ms < 1000 ? `${Math.round(ms)} 毫秒` : `${(ms / 1000).toFixed(1)} 秒`);
const errText = (code) => ERR[code] || code || '';
/** 拼出来的句子里，汉字和拉丁字母之间补一个空格（“对Vivi说” → “对 Vivi 说”）；数字不动，免得“11月”变样 */
const sp = (s) => String(s ?? '').replace(/([\u4e00-\u9fff])([A-Za-z])/g, '$1 $2').replace(/([A-Za-z])([\u4e00-\u9fff])/g, '$1 $2');

function toMin(t) {
  const m = /^D(\d+) (\d{2}):(\d{2})$/.exec(String(t || ''));
  return m ? Number(m[1]) * 1440 + Number(m[2]) * 60 + Number(m[3]) : 0;
}
const dayOf = (min) => Math.floor(min / 1440);
const clockOf = (min) => { const m = ((min % 1440) + 1440) % 1440; return `${pad(Math.floor(m / 60))}:${pad(m % 60)}`; };

/* ================================================================== */
/* 挂载                                                                */
/* ================================================================== */

export function mountAdmin(el, app, opts = {}) {
  const ui = {
    tab: 'arch', rt: 'calls', wd: 'cast',
    callFilter: 'all', onlyFallback: false,
    open: new Set(),            // 展开的调用 id
    openD: new Set(),           // 展开的折叠块（data-dk），切子标签、重绘后保持
    logSrc: 'director', logKind: 'all',
    draft: null, savedSig: null, where: null, draftMsg: '', draftBusy: false, confirm: null,
    writer: { brief: '', busy: false, card: null, error: '' },
    stale: { arch: true, runtime: true, world: true, cost: true },
    callSig: '', lastPkg: null, timer: null, destroyed: false,
  };

  /* ---------- 读取 ---------- */
  const pkg = () => app.pkg || WORLD;
  const st = () => { try { return app.st || null; } catch { return null; } };
  const calls = () => { try { return Array.isArray(app.calls) ? app.calls : []; } catch { return []; } };
  const extras = () => app.extras || {};
  const price = () => (app.settings?.price === 'flash' ? 'flash' : 'mini');
  const tier = () => (app.settings?.tier === 'default' ? 'default' : 'quick');
  const base = () => (app.pkg?.universe?.key && app.pkg.universe.key !== WORLD.universe?.key ? app.pkg : WORLD);
  const startDate = () => st()?.startDate || extras().startDate || pkg().universe?.startDate || '2026-11-09';
  const startsAt = () => toMin(pkg().universe?.clock?.startsAt || 'D0 00:00');

  function costOf(c, p = price()) {
    const v = c?.cost?.[p];
    if (typeof v === 'number') return v;
    const pr = PRICES[p];
    const cached = Math.min(c?.cachedTok || 0, c?.inTok || 0);
    return (((c?.inTok || 0) - cached) * pr.in + cached * pr.cached + (c?.outTok || 0) * pr.out) / 1e6 * PRICES.fx;
  }
  function dateOf(day) {
    const [y, m, d] = startDate().split('-').map(Number);
    const dt = new Date(Date.UTC(y, (m || 1) - 1, (d || 1) + day));
    return { m: dt.getUTCMonth() + 1, d: dt.getUTCDate(), w: WEEK[dt.getUTCDay()] };
  }
  const dayLabel = (day) => { const x = dateOf(day); return `${x.m}月${x.d}日 ${x.w}`; };
  const shortAt = (min) => { if (min == null) return '后台'; const x = dateOf(dayOf(min)); return `${x.m}/${x.d} ${clockOf(min)}`; };
  const fullAt = (min) => `${dayLabel(dayOf(min))} ${clockOf(min)}`;
  const dtLabel = (t) => { const m = toMin(t); const x = dateOf(dayOf(m)); return `${x.m}月${x.d}日 ${clockOf(m)}`; };
  function displayTime(s) {
    if (!s) return 0;
    let t = s.now || 0;
    for (const id in s.threads || {}) { const th = s.threads[id]; if (th?.msgs?.length && th.lastAt > t) t = th.lastAt; }
    return t;
  }
  function personName(key) {
    if (key === 'player') return extras().player?.name || 'Danny';
    const p = pkg();
    const c = (p.cast || []).find((x) => x.key === key) || (p.supporting || []).find((x) => x.key === key);
    return c?.name || extras().people?.[key]?.name || key || '—';
  }
  const shortName = (key) => (key === 'player' ? 'Danny' : extras().people?.[key]?.short || personName(key));
  const colorOf = (key) => { const c = extras().people?.[key]?.color; return isVarColor(c) ? c : 'var(--p6)'; };
  const dot = (key) => `<i class="ad-dot" style="--pc:${colorOf(key)}" aria-hidden="true"></i>`;
  const nodeOf = (key) => (pkg().nodes || []).find((n) => n.key === key) || null;
  const factOf = (key) => (pkg().facts || []).find((f) => f.key === key) || null;
  const factShort = (key) => FACT_SHORT[key] || String(key || '').replace(/^f\./, '');
  const varOf = (key) => (pkg().vars || []).find((v) => v.key === key) || null;
  const stageOf = (who, key) => (pkg().cast || []).find((c) => c.key === who)?.stages?.find((s) => s.key === key) || null;

  function nodeStatus(s, n) {
    if (!s) return 'waiting';
    if ((s.open || []).some((d) => d.node === n.key)) return 'open';
    if (s.ran?.[n.key]) return 'done';
    if (s.ended || s.now > toMin(n.trigger?.window?.[1])) return 'missed';
    return 'waiting';
  }
  const outcomeOf = (n, key) => (n?.outcomes || []).find((o) => o.key === key) || null;
  function windowText(n, rel) {
    const [a, b] = (n.trigger?.window || []).map(toMin);
    if (a === undefined) return '';
    if (a === b) return rel ? clockOf(a) : fullAt(a);
    const sameDay = dayOf(a) === dayOf(b);
    if (rel) {
      const dd = dayOf(b) - dayOf(a);
      return `${clockOf(a)}–${dd === 0 ? '' : dd === 1 ? '次日 ' : dayLabel(dayOf(b)) + ' '}${clockOf(b)}`;
    }
    return sameDay ? `${dayLabel(dayOf(a))} ${clockOf(a)}–${clockOf(b)}` : `${fullAt(a)} – ${fullAt(b)}`;
  }

  /* ---------- 条件 → 人话 ---------- */
  function valText(v) { return v === true ? '是' : v === false ? '否' : String(v); }
  const condText = (c) => sp(condRaw(c));
  function condRaw(c) {
    if (!c || typeof c !== 'object') return '—';
    const paren = (x) => (x && (x.all || x.any) ? `（${condRaw(x)}）` : condRaw(x));
    if (c.all) return c.all.map(paren).join(' 且 ');
    if (c.any) return c.any.map(paren).join(' 或 ');
    if (c.not) return `不是「${condRaw(c.not)}」`;
    if ('var' in c) {
      const lab = varOf(c.var)?.label || c.var;
      const parts = [];
      if ('eq' in c) parts.push(`${lab} = ${valText(c.eq)}`);
      if ('ne' in c) parts.push(`${lab} ≠ ${valText(c.ne)}`);
      if ('gte' in c) parts.push(`${lab} ≥ ${c.gte}`);
      if ('lte' in c) parts.push(`${lab} ≤ ${c.lte}`);
      if ('in' in c) parts.push(`${lab} 是 ${c.in.map(valText).join(' / ')} 之一`);
      if ('has' in c) parts.push(`${lab} 包含 ${c.has}`);
      return parts.join('，') || lab;
    }
    if ('flag' in c) return `「${varOf(c.flag)?.label || c.flag}」`;
    if ('stage' in c) return `${shortName(c.stage)}处在「${c.in.map((k) => stageOf(c.stage, k)?.label || k).join(' / ')}」`;
    if ('node' in c) {
      const n = nodeOf(c.node);
      const t = `「${n?.title || c.node}」已结算`;
      return c.outcome ? `${t}（${c.outcome.map((k) => outcomeOf(n, k)?.label || k).join(' / ')}）` : t;
    }
    if ('knows' in c) return `${shortName(c.knows)}知道「${factShort(c.fact)}」${c.via ? `（${c.via.map((v) => VIA[v] || v).join(' / ')}）` : ''}`;
    if ('after' in c) return `${dtLabel(c.after)} 以后`;
    if ('before' in c) return `${dtLabel(c.before)} 以前`;
    if ('collision' in c) return `碰撞「${(pkg().collisions || []).find((x) => x.key === c.collision)?.label || c.collision}」成立`;
    if ('is' in c) return `「${(pkg().conds || []).find((x) => x.key === c.is)?.label || c.is}」`;
    return JSON.stringify(c);
  }
  function onText(n, on) {
    if (on === 'timeout') return '超时没回';
    if (on === 'auto') return '自动';
    if (on === 'any') return '任何回应（越界拦截）';
    if (Array.isArray(on)) return on.map((k) => n?.decision?.intents?.find((i) => i.key === k)?.label || k).join(' / ');
    return String(on);
  }

  /* ================================================================== */
  /* 骨架                                                                */
  /* ================================================================== */

  el.innerHTML = `
    <div class="ad">
      <div class="ad-top">
        <div class="ad-tabs" role="tablist" aria-label="后台">
          ${TABS.map((t) => `<button type="button" role="tab" class="ad-tab" id="ad-tab-${t.key}" data-act="tab" data-tab="${t.key}" aria-controls="ad-p-${t.key}" aria-selected="false" tabindex="-1">${t.label}</button>`).join('')}
        </div>
        <div class="ad-status" aria-live="polite"></div>
      </div>
      ${TABS.map((t) => `<section class="ad-panel" id="ad-p-${t.key}" role="tabpanel" aria-labelledby="ad-tab-${t.key}" tabindex="0" hidden></section>`).join('')}
    </div>`;
  const root = el.querySelector('.ad');
  const statusEl = el.querySelector('.ad-status');
  const panels = Object.fromEntries(TABS.map((t) => [t.key, el.querySelector(`#ad-p-${t.key}`)]));

  /* ---------- 切标签与锚点 ---------- */
  function parseHash(h) {
    const [tab, sub] = String(h || '').replace(/^#/, '').split('/');
    return TABS.some((t) => t.key === tab) ? { tab, sub } : null;
  }
  function show(tab, sub, { fromHash = false } = {}) {
    if (!TABS.some((t) => t.key === tab)) return;
    if (tab === 'runtime' && RT_TABS.some((t) => t.key === sub)) { if (ui.rt !== sub) ui.stale.runtime = true; ui.rt = sub; }
    if (tab === 'world' && WD_TABS.some((t) => t.key === sub)) { if (ui.wd !== sub) ui.stale.world = true; ui.wd = sub; }
    ui.tab = tab;
    for (const t of TABS) {
      const b = el.querySelector(`#ad-tab-${t.key}`);
      const on = t.key === tab;
      b.setAttribute('aria-selected', String(on));
      b.tabIndex = on ? 0 : -1;
      panels[t.key].hidden = !on;
    }
    if (!fromHash) {
      const h = '#' + tab + (tab === 'runtime' ? '/' + ui.rt : tab === 'world' ? '/' + ui.wd : '');
      try { if (location.hash !== h) history.replaceState(null, '', h); } catch { /* 预览环境可能不允许 */ }
    }
    render(true);
  }
  const onHash = () => { const h = parseHash(location.hash); if (h) show(h.tab, h.sub, { fromHash: true }); };
  window.addEventListener('hashchange', onHash);

  /* ---------- 重绘调度 ---------- */
  function schedule() {
    for (const k in ui.stale) ui.stale[k] = k === 'world' ? ui.stale.world || app.pkg !== ui.lastPkg : true;
    if (ui.timer) return;
    ui.timer = setTimeout(() => { ui.timer = null; render(false); }, 120);
  }
  function render(force) {
    if (ui.destroyed) return;
    renderStatus();
    const tab = ui.tab;
    if (!force && !ui.stale[tab]) return;
    ui.stale[tab] = false;
    const p = panels[tab];
    if (tab === 'runtime') return renderRuntime(p);
    if (tab === 'world') return renderWorld(p);
    keep(p, () => { p.innerHTML = tab === 'arch' ? archHTML() : costHTML(); });
  }
  /** 重绘时保住滚动位置、展开的折叠块和键盘焦点 */
  function keep(p, fn) {
    const top = p.scrollTop;
    const fk = document.activeElement?.closest?.('.ad') === root ? document.activeElement.getAttribute('data-fk') : null;
    fn();
    for (const d of p.querySelectorAll('details[data-dk]')) if (ui.openD.has(d.dataset.dk)) d.open = true;
    p.scrollTop = top;
    if (fk) p.querySelector(`[data-fk="${CSS.escape(fk)}"]`)?.focus({ preventScroll: true });
  }

  function renderStatus() {
    const s = app.agentStatus?.() || 'unknown';
    const all = calls();
    const total = all.reduce((x, c) => x + costOf(c), 0);
    const map = { connected: ['ad-on', 'Claude 已连接'], offline: ['ad-off', '离线兜底'], unknown: ['ad-unk', '检测中'] };
    const [cls, txt] = map[s] || map.unknown;
    statusEl.innerHTML = `<span class="ad-conn ${cls}"><i aria-hidden="true"></i>${txt}</span><span class="ad-sep" aria-hidden="true">·</span><span class="ad-num">本局 ${nf(all.length)} 次调用</span><span class="ad-sep" aria-hidden="true">·</span><span class="ad-num">${yuan(total, 3)}</span>`;
  }

  /* ================================================================== */
  /* 架构                                                                */
  /* ================================================================== */

  function archHTML() {
    const p = pkg(), s = st(), all = calls();
    const by = Object.fromEntries(AGENT_ORDER.map((k) => [k, all.filter((c) => c.agent === k)]));
    const fb = all.filter((c) => c.via === 'fallback').length;
    const perChar = {};
    for (const c of by.character) perChar[c.who] = (perChar[c.who] || 0) + 1;
    const castChips = (p.cast || []).map((c) => `<span class="ad-agent">${dot(c.key)}${esc(shortName(c.key))}<b class="ad-num">×${perChar[c.key] || 0}</b></span>`).join('');
    const count = (k) => `<span class="ad-count"><b class="ad-num">${by[k].length}</b> 次</span>`;
    const dirN = (s?.directorLog || []).length;
    const ruleN = (p.director?.rules || []).length;
    return `
    <div class="ad-wrap">
      <header class="ad-head">
        <p class="ad-eyebrow">架构 · 三层加离线</p>
        <h2 class="ad-h2">人物只管说话，裁判判断进度，代码当导演</h2>
        <p class="ad-lede">世界内核和导演都是代码，不调模型。模型只在三处出现：人物说话、裁判判断玩家这句话、每个故事日整理一次记忆；编剧只在后台用。方块上的数字是这一局到现在的调用次数。</p>
      </header>
      <div class="ad-kpis ad-kpis-6">
        <div class="ad-kpi"><span class="ad-k">本局调用模型</span><b class="ad-num">${all.length} 次</b><span class="ad-note">其中兜底 ${fb} 次</span></div>
        ${AGENT_ORDER.map((k) => `<div class="ad-kpi"><span class="ad-k"><span class="ad-tag ${AGENT[k].cls}">${AGENT[k].label}</span></span><b class="ad-num">${by[k].length} 次</b><span class="ad-note">${yuan(by[k].reduce((x, c) => x + costOf(c), 0), 4)}</span></div>`).join('')}
        <div class="ad-kpi"><span class="ad-k"><span class="ad-tag ad-a-code">代码</span></span><b class="ad-num">0 次</b><span class="ad-note">内核、导演不调模型</span></div>
      </div>
      <div class="ad-legend" aria-label="图例">
        <span><i class="ad-sw ad-sw-char"></i>人物 Agent</span><span><i class="ad-sw ad-sw-judge"></i>裁判 Agent</span>
        <span><i class="ad-sw ad-sw-mem"></i>记忆 Agent</span><span><i class="ad-sw ad-sw-writer"></i>编剧 Agent</span><span><i class="ad-sw ad-sw-code"></i>代码（不调模型）</span>
      </div>
      <div class="ad-board">
        <div class="ad-lane">
          <div class="ad-lane-t">运行时：玩家每次操作走这条路</div>
          <div class="ad-box is-player">
            <div class="ad-box-h"><h4>玩家的手机</h4></div>
            <p>私聊、现场、此刻；点「过一会儿」才推进时间。</p>
          </div>
          <div class="ad-arrow"><i aria-hidden="true">↓</i><span>发一条消息，或点「过一会儿」</span></div>
          <div class="ad-box is-code">
            <div class="ad-box-h"><h4>世界内核</h4><span class="ad-badge ad-badge-code">不调模型</span></div>
            <p>唯一的事实来源：状态只由作者写好的结果改，结局也由代码算。</p>
            <div class="ad-chips">
              <span class="ad-chip">状态变量 ${(p.vars || []).length} 个</span><span class="ad-chip">谁知道什么 · 事实 ${(p.facts || []).length} 条</span>
              <span class="ad-chip">事件 ${(p.nodes || []).length} 个</span><span class="ad-chip">结局 ${(p.endings || []).length} 个</span>
              <span class="ad-chip">时间按“下一件事”跳</span><span class="ad-chip">内容边界执行</span>
            </div>
            <div class="ad-sub is-code">
              <div class="ad-box-h"><h5>导演 D1–D${ruleN}</h5><span class="ad-badge ad-badge-code">不调模型</span></div>
              <p>开哪个事件、危机间隔、安静时段、谁可以主动发消息。本局做了 <b class="ad-num">${dirN}</b> 个决定，都写在导演日志里。</p>
            </div>
          </div>
          <div class="ad-arrow"><i aria-hidden="true">↓</i><span>有待回答的事件，或这句话碰到越界 / 坦白关键词</span></div>
          <div class="ad-box is-judge">
            <div class="ad-box-h"><h4>裁判 Agent</h4><span class="ad-badge">调模型 · JSON</span>${count('judge')}</div>
            <p>不扮演任何人。判断玩家这句话属于哪个意图、有没有越界、是不是在坦白；必须引原话，引不出来就作废。</p>
            <dl class="ad-io"><dt>看到</dt><dd>玩家原话、最近 4 条、可选意图和例句、越界列表、可坦白的事</dd><dt>回来</dt><dd>一段 JSON；内核按它结算</dd></dl>
          </div>
          <div class="ad-arrow"><i aria-hidden="true">↓</i><span>结果里有作者台词就直接发，不再叫人物；否则才叫人物</span></div>
          <div class="ad-box is-char">
            <div class="ad-box-h"><h4>人物 Agent</h4><span class="ad-badge">调模型 · 纯文本</span>${count('character')}</div>
            <p>每个人物一个，只负责说话，最多 3 行。</p>
            <div class="ad-agents">${castChips}</div>
            <dl class="ad-io"><dt>看到</dt><dd>内容边界、世界基调、自己的人设、自己知道的事、记忆卡、这个对话最近 12 条、此刻的提示</dd><dt>看不到</dt><dd>事件的幕后设定、作者写好的结果、别人的秘密、她不知道的事</dd></dl>
          </div>
          <div class="ad-arrow"><i aria-hidden="true">↓</i><span>逐行过词表，删空了换兜底台词；内核落到手机</span></div>
        </div>
        <div class="ad-lane">
          <div class="ad-lane-t">运行时之外</div>
          <div class="ad-box is-mem">
            <div class="ad-box-h"><h4>记忆 Agent</h4><span class="ad-badge">离线批处理</span>${count('memory')}</div>
            <p>每过一个故事日，给当天有互动的人物各写一张记忆卡（不超过 120 字），一次调用写完。</p>
            <p class="ad-feeds">→ 记忆卡交给人物 Agent</p>
          </div>
          <div class="ad-box is-writer">
            <div class="ad-box-h"><h4>编剧 Agent</h4><span class="ad-badge">后台 · 默认档</span>${count('writer')}</div>
            <p>作者在「世界设定」写一句人物简介，它生成完整人设卡，加进草稿；只进自由聊天，不进任何事件。</p>
            <p class="ad-feeds">→ 人设卡进草稿，重开一局生效</p>
          </div>
          <div class="ad-box">
            <div class="ad-box-h"><h4>去掉的部分</h4></div>
            <ul class="ad-plain">
              <li>导演选题的模型调用 → 代码规则 D1–D6</li>
              <li>台词和进度在同一次调用里 → 拆成人物 + 裁判</li>
              <li>审查 Agent → 词表逐行过滤</li>
              <li>后台常驻思考 → 只在被叫到时开口</li>
            </ul>
          </div>
        </div>
      </div>

      <h3 class="ad-h3">三条分工</h3>
      <div class="ad-trio">
        <div class="ad-role is-char"><h4>人物只管说话</h4><ul>
          <li>每个人物一个 Agent，只输出要发的台词，不输出状态，也不判断事件进度。</li>
          <li>prompt 里只有她知道的事；每次调用后台都逐条核对（「运行监控 › Agent 调用」里的隐私检查）。</li>
          <li>失败或被词表删空，就换她的兜底台词，不重试。</li></ul></div>
        <div class="ad-role is-judge"><h4>裁判判断进度</h4><ul>
          <li>有待回答的事件时先叫裁判：是哪个意图、有没有越界、有没有坦白。</li>
          <li>必须引玩家原话；引文对不上就作废，宁可当成自由聊天。</li>
          <li>判错一项只影响进度，不连累台词。李孟哲引擎里 eventGoalAssessments 一个字段坏掉整条回复作废，就是反例。</li></ul></div>
        <div class="ad-role is-code"><h4>代码当导演</h4><ul>
          <li>内核按作者写好的结果改状态；谁知道什么、结局都由代码算。</li>
          <li>导演按 D1–D6 决定开哪个事件、危机间隔、安静时段、谁能主动发消息，每个决定写进导演日志。</li>
          <li>时间不跟现实走：点「过一会儿」才跳到下一件事；离线时什么都不发生。</li></ul></div>
      </div>

      <h3 class="ad-h3">一条消息从发出到回复</h3>
      <ol class="ad-flow">
        <li><span>玩家发消息。代码先查自伤关键词，命中就出戏、给热线、整局暂停。</span><span class="ad-tag ad-a-code">代码</span></li>
        <li><span>内核看这个对话有没有待回答的事件，这句话有没有碰到越界或坦白关键词。</span><span class="ad-tag ad-a-code">代码</span></li>
        <li><span>需要时叫裁判：只回 JSON，每一项都要引原话。</span><span class="ad-tag ad-a-judge">裁判</span></li>
        <li><span>内核结算：越界走固定回复；命中意图就按作者写好的结果改状态、发作者台词。</span><span class="ad-tag ad-a-code">代码</span></li>
        <li><span>结果里已经有作者台词就到此为止；否则叫人物说话。</span><span class="ad-tag ad-a-char">人物</span></li>
        <li><span>台词逐行过词表，删空了换兜底；导演再看一眼有没有该开始的事件。</span><span class="ad-tag ad-a-code">代码</span></li>
        <li><span>每过一个故事日，记忆 Agent 批量更新记忆卡。</span><span class="ad-tag ad-a-mem">记忆</span></li>
      </ol>

      <h3 class="ad-h3">李孟哲引擎现有模块 → 新架构里的去处</h3>
      <p class="ad-note">参考之前的成本页里“对现有代码的改动”一表，按本原型的实际分工改写。不推倒重来：命令、回执和事件日志是现成的内核，最该保留。</p>
      <div class="ad-scroll"><table class="ad-table ad-map">
        <thead><tr><th scope="col">现有模块</th><th scope="col">现在</th><th scope="col">本原型里</th><th scope="col">文件</th><th scope="col">处理</th></tr></thead>
        <tbody>
          ${MODULE_MAP.map((r) => `<tr><th scope="row">${esc(r[0])}</th><td>${r[1]}</td><td>${esc(r[2])}</td><td><span class="ad-mono">${esc(r[3])}</span></td><td><span class="ad-pill ${PILL[r[4]]}">${esc(r[4])}</span></td></tr>`).join('')}
        </tbody>
      </table></div>
    </div>`;
  }

  /* ================================================================== */
  /* 运行监控                                                            */
  /* ================================================================== */

  function renderRuntime(p) {
    keep(p, () => {
      if (!p.querySelector('.ad-rt')) {
        p.innerHTML = `<div class="ad-wrap ad-rt"><div class="ad-rt-sum"></div>
          <div class="ad-seg ad-subtabs ad-rtabs" role="group" aria-label="运行监控">${RT_TABS.map((t) => `<button type="button" class="ad-segbtn" data-act="rt" data-rt="${t.key}" data-fk="rt-${t.key}" aria-pressed="false">${t.label}<span class="ad-cnt ad-num"></span></button>`).join('')}</div>
          <div class="ad-rt-body"></div></div>`;
      }
      p.querySelector('.ad-rt-sum').innerHTML = runtimeSummaryHTML();
      const s = st();
      const counts = { calls: calls().length, director: (s?.directorLog || []).length, state: null, events: null };
      for (const b of p.querySelectorAll('[data-rt]')) {
        b.setAttribute('aria-pressed', String(b.dataset.rt === ui.rt));
        b.querySelector('.ad-cnt').textContent = counts[b.dataset.rt] == null ? '' : String(counts[b.dataset.rt]);
      }
      const body = p.querySelector('.ad-rt-body');
      if (body.dataset.sub !== ui.rt) { body.dataset.sub = ui.rt; body.innerHTML = ''; ui.callSig = ''; }
      if (ui.rt === 'calls') return renderCalls(body);
      body.innerHTML = ui.rt === 'director' ? logHTML() : ui.rt === 'state' ? stateHTML() : eventsHTML();
    });
  }

  function runtimeSummaryHTML() {
    const s = st();
    if (!s) return '<p class="ad-empty">还没有开局。</p>';
    const t = displayTime(s);
    const left = dayOf(s.endsAt ?? toMin(pkg().universe?.endsAt || 'D12 06:00')) - dayOf(t);
    const cd = left > 0 ? `离婚礼还有 ${left} 天` : left === 0 ? '今天是婚礼' : '婚礼已经过去';
    let state = '<span class="ad-st ad-st-ok">进行中</span>';
    if (s.ended) state = `<span class="ad-st ad-st-info">已结束</span><span class="ad-kv">${esc(s.ended.title || s.ended.ending)}</span>`;
    else if (s.halted) {
      const b = (pkg().policy?.boundaryInputs || []).find((x) => x.key === s.halted.by);
      state = `<span class="ad-st ad-st-bad">已暂停</span><span class="ad-kv">${esc(b ? b.key : s.halted.by)}</span>`;
    }
    const nodes = pkg().nodes || [];
    const st4 = { waiting: 0, open: 0, done: 0, missed: 0 };
    for (const n of nodes) st4[nodeStatus(s, n)]++;
    const open = (s.open || []).map((o) => `${shortName(o.owner)}「${o.title || nodeOf(o.node)?.title || o.node}」`);
    return `<div class="ad-kpis ad-kpis-rt">
      <div class="ad-kpi"><span class="ad-k">故事时间</span><b class="ad-num">${esc(fullAt(t))}</b><span class="ad-note">${cd}</span></div>
      <div class="ad-kpi"><span class="ad-k">这一局</span><b>${state}</b><span class="ad-note">${s.pending?.length ? `还有 ${s.pending.length} 条消息待送达` : '没有待送达的消息'}</span></div>
      <div class="ad-kpi"><span class="ad-k">待回答</span><b class="ad-num">${(s.open || []).length} 个</b><span class="ad-note ad-clip" title="${esc(open.join('、'))}">${esc(open.join('、') || '没有')}</span></div>
      <div class="ad-kpi"><span class="ad-k">事件</span><b class="ad-num">已结算 ${st4.done} / ${nodes.length}</b><span class="ad-note">进行中 ${st4.open} · 没发生 ${st4.missed} · 未到 ${st4.waiting}</span></div>
    </div>`;
  }

  /* ---------- Agent 调用 ---------- */
  function filteredCalls() {
    return calls().filter((c) => (ui.callFilter === 'all' || c.agent === ui.callFilter) && (!ui.onlyFallback || c.via === 'fallback')).slice().reverse();
  }
  function renderCalls(body) {
    const all = calls();
    if (!body.querySelector('.ad-calls')) {
      body.innerHTML = `<div class="ad-calls">
        <div class="ad-filters"><div class="ad-seg" role="group" aria-label="按 Agent 筛选"></div>
          <label class="ad-check"><input type="checkbox" data-act="onlyfb" data-fk="onlyfb"> 只看兜底</label></div>
        <div class="ad-callhead" aria-hidden="true"><span>故事时间</span><span>Agent</span><span>谁 · 触发</span><span class="ad-r">输入 / 缓存 / 输出</span><span class="ad-r">¥</span><span class="ad-r">耗时</span><span>来源</span></div>
        <div class="ad-calllist"></div></div>`;
    }
    const n = (k) => (k === 'all' ? all.length : all.filter((c) => c.agent === k).length);
    body.querySelector('.ad-filters .ad-seg').innerHTML = ['all', ...AGENT_ORDER].map((k) => `<button type="button" class="ad-segbtn" data-act="cf" data-cf="${k}" data-fk="cf-${k}" aria-pressed="${ui.callFilter === k}">${k === 'all' ? '全部' : AGENT[k].label}<span class="ad-cnt ad-num">${n(k)}</span></button>`).join('');
    body.querySelector('[data-act="onlyfb"]').checked = ui.onlyFallback;
    const box = body.querySelector('.ad-calllist');
    const list = filteredCalls();
    const sig = [ui.callFilter, ui.onlyFallback, price()].join('|');
    const have = [...box.querySelectorAll(':scope > .ad-call')].map((x) => x.dataset.id);
    const ids = list.map((c) => c.id);
    const tail = ids.slice(ids.length - have.length);
    if (sig === ui.callSig && have.length && ids.length >= have.length && same(tail, have)) {
      const fresh = list.slice(0, ids.length - have.length);
      if (fresh.length) box.insertAdjacentHTML('afterbegin', fresh.map(callHTML).join(''));
    } else {
      box.innerHTML = list.length ? list.map(callHTML).join('') : `<p class="ad-empty">${all.length ? '没有符合筛选的调用。' : '还没有调用。在手机上发一条消息试试：有待回答的事件时会先叫裁判，再看要不要叫人物。'}</p>`;
    }
    ui.callSig = sig;
  }

  function whoText(c) {
    if (c.agent === 'memory') return String(c.who || '').split(',').filter(Boolean).map(shortName).join('、') || '—';
    if (c.agent === 'judge') return c.who ? sp(`对${shortName(c.who)}说的话`) : '—';
    if (c.agent === 'writer') { const card = parseJSON(c.output); return card?.name ? `新人物 ${card.name}` : '新人物'; }
    return shortName(c.who);
  }
  function parseJSON(s) { try { return JSON.parse(s); } catch { return null; } }
  function intentLabel(nodeKey, k) { return nodeOf(nodeKey)?.decision?.intents?.find((i) => i.key === k)?.label || k; }
  function factKeyOf(t) { return t && typeof t === 'object' ? t.fact : t; }
  function previewOf(c) {
    if (c.agent === 'character') {
      const lines = Array.isArray(c.lines) ? c.lines : String(c.output || '').split('\n').filter(Boolean);
      return lines.length ? lines.join(' / ') : '（这一拍跳过）';
    }
    if (c.agent === 'judge') {
      const r = c.result || {};
      const parts = [r.intent ? `意图：${intentLabel(c.node, r.intent)}` : '没有命中意图'];
      if (r.boundary) parts.push(`越界：${r.boundary}`);
      if (r.told?.length) parts.push(`坦白：${r.told.map((t) => factShort(factKeyOf(t))).join('、')}`);
      return parts.join(' · ');
    }
    if (c.agent === 'memory') {
      const o = parseJSON(c.output);
      const n = o && typeof o === 'object' ? Object.keys(o.cards || o).length : 0;
      return c.via === 'model' ? `写了 ${n} 张记忆卡${c.dropped?.length ? `，${c.dropped.length} 张命中词表没采用` : ''}` : '没写成，保留旧卡';
    }
    if (c.agent === 'writer') { const o = parseJSON(c.output); return o?.name ? `${o.name}，${o.role || ''}` : c.ok === false ? '没生成出来' : ''; }
    return '';
  }
  function privacyBadge(c) {
    if (c.agent !== 'character' || !c.privacy) return '';
    const n = (c.privacy.facts || []).length;
    return c.privacy.ok
      ? `<span class="ad-priv ad-priv-ok">${esc(sp(`只含${shortName(c.who)}知道的 ${n} 条事实 ✓`))}</span>`
      : `<span class="ad-priv ad-priv-bad">${esc(sp(`含${shortName(c.who)}不知道的事实 ✗`))}</span>`;
  }
  function viaBadge(c) {
    if (c.via === 'model') return '<span class="ad-st ad-st-ok">模型</span>';
    const why = c.error ? errText(c.error) : c.agent === 'character' ? '词表删空' : '';
    return `<span class="ad-st ad-st-warn">兜底${why ? ' · ' + esc(why) : ''}</span>`;
  }
  function callHTML(c) {
    const a = AGENT[c.agent] || { label: c.agent, cls: 'ad-a-code' };
    const open = ui.open.has(c.id);
    const tierTxt = TIER[c.tierApplied ?? c.tier] || c.tierApplied || c.tier || '';
    return `<div class="ad-call" data-id="${esc(c.id)}">
      <button type="button" class="ad-call-row" data-act="call" data-id="${esc(c.id)}" data-fk="call-${esc(c.id)}" aria-expanded="${open}">
        <span class="ad-c-time ad-num">${esc(shortAt(c.storyAt))}</span>
        <span class="ad-c-tag"><span class="ad-tag ${a.cls}">${esc(a.label)}</span></span>
        <span class="ad-c-who"><b>${esc(whoText(c))}</b><span class="ad-muted"> · ${esc(TRIGGER[c.trigger] || c.trigger || '')}${tierTxt ? ' · ' + esc(tierTxt) : ''}</span></span>
        <span class="ad-c-tok ad-num" title="输入 / 其中缓存 / 输出（token）">${nf(c.inTok)} / ${nf(c.cachedTok)} / ${nf(c.outTok)}</span>
        <span class="ad-c-cost ad-num">${yuan(costOf(c), 4)}</span>
        <span class="ad-c-ms ad-num">${msText(c.ms)}</span>
        <span class="ad-c-via">${viaBadge(c)}</span>
        <span class="ad-c-prev">${privacyBadge(c)}<span class="ad-prevtxt">${esc(previewOf(c))}</span></span>
      </button>
      ${open ? `<div class="ad-call-detail">${callDetailHTML(c)}</div>` : ''}
    </div>`;
  }

  function promptHTML(c) {
    const text = String(c.prompt || '');
    if (!text) return '<p class="ad-empty">这次没有生成 prompt。</p>';
    const pc = Math.max(0, Math.min(c.prefixChars || 0, text.length));
    const mark = (s) => esc(s).replace(/【[^】\n]{1,40}】/g, (m) => `<b class="ad-ph">${m}</b>`);
    const pre = pc ? `<span class="ad-prefix">${mark(text.slice(0, pc).replace(/\n$/, ''))}</span><span class="ad-prefix-sep" aria-hidden="true">以上 ${nf(pc)} 字是可缓存的静态前缀，以下每次不同</span>` : '';
    return `<pre class="ad-pre" tabindex="0" aria-label="完整 prompt">${pre}${mark(pc ? text.slice(pc).replace(/^\n/, '') : text)}</pre>`;
  }
  function callDetailHTML(c) {
    const s = st();
    const sec = [];
    // 隐私检查（人物）
    if (c.agent === 'character' && c.privacy) {
      const mine = s?.knows?.[c.who] || {};
      const facts = c.privacy.facts || [];
      const rows = facts.map((k) => {
        const via = mine[k] || [];
        const known = via.length > 0;
        return `<li class="${known ? '' : 'is-bad'}"><span class="ad-mk">${known ? '✓' : '✗'}</span><b>${esc(factShort(k))}</b><span class="ad-muted">${known ? via.map((v) => VIA[v] || v).join('、') : '现在也不知道'}</span><span class="ad-ftext">${esc(factOf(k)?.text || k)}</span></li>`;
      }).join('');
      sec.push(`<div class="ad-privbox ${c.privacy.ok ? 'is-ok' : 'is-bad'}">
        <div class="ad-privhead"><span class="ad-privmark" aria-hidden="true">${c.privacy.ok ? '✓' : '✗'}</span><div><b>${esc(sp(c.privacy.ok ? `隐私检查通过：只含${shortName(c.who)}知道的 ${facts.length} 条事实` : `隐私检查没通过：prompt 里有${shortName(c.who)}不知道的事实`))}</b>
        <span class="ad-note">逐条比对世界包里每条事实的原文是否出现在 prompt 里，再看她当时知不知道。</span></div></div>
        ${facts.length ? `<ul class="ad-facts">${rows}</ul>` : '<p class="ad-note">这次 prompt 里没有出现任何事实原文。</p>'}
      </div>`);
    }
    // 裁判结论
    if (c.agent === 'judge') {
      const r = c.result || {};
      const n = nodeOf(c.node);
      const b = r.boundary ? (pkg().policy?.boundaryInputs || []).find((x) => x.key === r.boundary) : null;
      sec.push(`<div class="ad-dsec"><h5>裁判结论</h5><dl class="ad-dl">
        <dt>事件</dt><dd>${n ? esc(n.title) : '没有待回答的事件（只查越界、坦白）'}</dd>
        <dt>意图</dt><dd>${r.intent ? `<span class="ad-mono">${esc(r.intent)}</span> ${esc(intentLabel(c.node, r.intent))}` : '<span class="ad-muted">没有命中</span>'}</dd>
        <dt>越界</dt><dd>${r.boundary ? `<span class="ad-st ad-st-bad">${esc(r.boundary)}</span> ${esc(b?.input || '')}` : '<span class="ad-muted">没有</span>'}</dd>
        <dt>坦白</dt><dd>${r.told?.length ? r.told.map((t) => `<span class="ad-chip">${esc(factShort(factKeyOf(t)))}</span>`).join(' ') : '<span class="ad-muted">没有</span>'}</dd>
      </dl>${c.dropped?.length ? `<p class="ad-warnline">校验丢掉了：${c.dropped.map(esc).join('；')}</p>` : ''}</div>`);
    }
    // 人物：最终发出的行
    if (c.agent === 'character') {
      const lines = c.lines || [];
      sec.push(`<div class="ad-dsec"><h5>最终发出</h5>${lines.length ? `<ol class="ad-lines">${lines.map((l) => `<li>${esc(l)}</li>`).join('')}</ol>` : '<p class="ad-muted">这一拍跳过，没有发消息。</p>'}
        ${c.dropped?.length ? `<p class="ad-warnline">被删掉的行（词表或图片规则）：${c.dropped.map((l) => `「${esc(l)}」`).join('')}</p>` : ''}</div>`);
    }
    // 记忆：卡片
    if (c.agent === 'memory') {
      const o = parseJSON(c.output);
      const cards = o && typeof o === 'object' ? o.cards || o : null;
      sec.push(`<div class="ad-dsec"><h5>第 ${esc(c.day ?? '?')} 天的记忆卡</h5>${cards && Object.keys(cards).length ? `<ul class="ad-memlist">${Object.entries(cards).map(([k, v]) => `<li>${dot(k)}<b>${esc(shortName(k))}</b><span>${esc(v)}</span></li>`).join('')}</ul>` : '<p class="ad-muted">没有新卡，保留旧卡。</p>'}
        ${c.dropped?.length ? `<p class="ad-warnline">命中词表、没有采用：${c.dropped.map((k) => esc(shortName(k))).join('、')}</p>` : ''}</div>`);
    }
    // 元信息
    const t = c.t ? new Date(c.t) : null;
    sec.push(`<div class="ad-dsec"><h5>这次调用</h5><dl class="ad-dl ad-dl-meta">
      <dt>编号</dt><dd class="ad-mono">${esc(c.id)}</dd>
      <dt>故事时间</dt><dd>${c.storyAt == null ? '后台（不在故事时间里）' : esc(fullAt(c.storyAt))}</dd>
      <dt>现实时间</dt><dd class="ad-num">${t ? esc(t.toLocaleString('zh-CN', { hour12: false })) : '—'}</dd>
      <dt>档位</dt><dd>请求 ${esc(TIER[c.tier] || c.tier || '—')} · 实际 ${c.tierApplied ? esc(TIER[c.tierApplied] || c.tierApplied) : '模型没报（按请求算）'}</dd>
      <dt>token</dt><dd class="ad-num">输入 ${nf(c.inTok)}（缓存 ${nf(c.cachedTok)}）· 输出 ${nf(c.outTok)}</dd>
      <dt>花费</dt><dd class="ad-num">mini ${yuan(costOf(c, 'mini'), 5)} · flash ${yuan(costOf(c, 'flash'), 5)}</dd>
      <dt>结果</dt><dd>${viaBadge(c)}${c.error ? ` <span class="ad-mono ad-muted">${esc(c.error)}</span>` : ''}</dd>
    </dl></div>`);
    // 原始输出与 prompt
    sec.push(`<div class="ad-dsec ad-wide"><h5>原始输出</h5>${c.output ? `<pre class="ad-pre ad-pre-out" tabindex="0" aria-label="原始输出">${esc(prettyOut(c.output))}</pre>` : '<p class="ad-muted">没有输出（兜底或没触达模型）。</p>'}</div>`);
    sec.push(`<div class="ad-dsec ad-wide"><h5>完整 prompt <span class="ad-note">${nf(c.promptChars ?? String(c.prompt || '').length)} 字${c.prefixChars ? ` · 有底色的是可缓存的静态前缀（${nf(c.prefixChars)} 字），这次命中缓存 ${nf(c.cachedTok)} token` : ''}</span></h5>${promptHTML(c)}</div>`);
    return sec.join('');
  }
  function prettyOut(s) {
    const o = parseJSON(s);
    return o && typeof o === 'object' ? JSON.stringify(o, null, 2) : String(s);
  }

  /* ---------- 导演日志 ---------- */
  function logHTML() {
    const s = st();
    if (!s) return '<p class="ad-empty">还没有开局。</p>';
    const src = ui.logSrc === 'kernel' ? s.kernelLog || [] : s.directorLog || [];
    const kinds = ui.logSrc === 'kernel' ? null : ['all', 'start', 'block', 'miss', 'proactive'];
    const list = src.filter((e) => ui.logSrc === 'kernel' || ui.logKind === 'all' || e.kind === ui.logKind).slice().reverse();
    const cnt = (k) => (k === 'all' ? src.length : src.filter((e) => e.kind === k).length);
    let lastDay = null;
    const rows = [];
    for (const e of list) {
      const d = dayOf(e.at || 0);
      if (d !== lastDay) { rows.push(`<li class="ad-dayhead">${esc(dayLabel(d))}<span class="ad-muted"> · D${d}</span></li>`); lastDay = d; }
      const k = ui.logSrc === 'kernel' ? { t: KER_KIND[e.kind] || e.kind, c: 'ad-k-ker' } : DIR_KIND[e.kind] || { t: e.kind, c: 'ad-k-ker' };
      rows.push(`<li class="ad-logrow"><span class="ad-num ad-muted">${esc(clockOf(e.at || 0))}</span><span class="ad-tag ${k.c}">${esc(k.t)}</span><span class="ad-logtxt">${esc(e.text)}</span></li>`);
    }
    return `<div class="ad-filters">
        <div class="ad-seg" role="group" aria-label="日志来源">
          <button type="button" class="ad-segbtn" data-act="logsrc" data-v="director" data-fk="ls-d" aria-pressed="${ui.logSrc === 'director'}">导演日志<span class="ad-cnt ad-num">${(s.directorLog || []).length}</span></button>
          <button type="button" class="ad-segbtn" data-act="logsrc" data-v="kernel" data-fk="ls-k" aria-pressed="${ui.logSrc === 'kernel'}">内核记录<span class="ad-cnt ad-num">${(s.kernelLog || []).length}</span></button>
        </div>
        ${kinds ? `<div class="ad-seg" role="group" aria-label="按类型筛选">${kinds.map((k) => `<button type="button" class="ad-segbtn" data-act="logkind" data-v="${k}" data-fk="lk-${k}" aria-pressed="${ui.logKind === k}">${k === 'all' ? '全部' : DIR_KIND[k].t}<span class="ad-cnt ad-num">${cnt(k)}</span></button>`).join('')}</div>` : ''}
      </div>
      <p class="ad-note">${ui.logSrc === 'kernel' ? '内核记下的每一次状态变化：变量、阶段、谁知道了什么、结算、跳时间。' : '导演每个决定都带原因：开始（D1 must / D2 碰撞 / D5 排序）、被挡（D3 危机 / D4 安静时段）、没发生、主动消息（D6）。'}新的在上面。</p>
      ${rows.length ? `<ol class="ad-log">${rows.join('')}</ol>` : '<p class="ad-empty">还没有记录。</p>'}`;
  }

  /* ---------- 世界状态 ---------- */
  function fmtVal(v, def) {
    if (def?.type === 'bool' || typeof v === 'boolean') return v ? '是' : '否';
    if (Array.isArray(v)) return v.length ? v.join('、') : '（空）';
    return v === undefined || v === null || v === '' ? '—' : String(v);
  }
  function stateHTML() {
    const s = st(), p = pkg();
    if (!s) return '<p class="ad-empty">还没有开局。</p>';
    const vars = (p.vars || []).map((v) => {
      const cur = s.vars?.[v.key];
      const changed = !same(cur, v.default);
      return `<tr class="${changed ? 'is-changed' : ''}"><th scope="row"><span>${esc(v.label)}</span><span class="ad-key">${esc(v.key)}</span></th>
        <td class="ad-val">${changed ? '<i class="ad-chg" title="和开局时不同" aria-label="变过"></i>' : ''}${esc(fmtVal(cur, v))}</td><td class="ad-muted">${esc(fmtVal(v.default, v))}</td>
        <td>${v.safety ? '<span class="ad-tag ad-a-code">安全常量</span>' : ''}${v.visibleToPlayer ? '<span class="ad-tag ad-t-plain">玩家可见</span>' : ''}</td></tr>`;
    }).join('');
    const stages = (p.cast || []).map((c) => {
      const cur = s.stages?.[c.key];
      const stg = c.stages?.find((x) => x.key === cur);
      return `<li class="ad-stagecard">
        <div class="ad-stagehead">${dot(c.key)}<b>${esc(shortName(c.key))}</b><span class="ad-tag ad-t-strong">${esc(stg?.label || cur || '—')}</span></div>
        <p>${esc(stg?.meaning || '')}</p>
        <ol class="ad-steps" aria-label="阶段">${(c.stages || []).map((x) => `<li class="${x.key === cur ? 'is-cur' : ''}">${esc(x.label)}</li>`).join('')}</ol>
      </li>`;
    }).join('');
    // 谁知道什么矩阵：行 = Danny + cast，列 = 事实
    const people = ['player', ...(p.cast || []).map((c) => c.key)];
    const facts = p.facts || [];
    const head = facts.map((f) => `<th scope="col" title="${esc(f.text)}"><span class="ad-fh">${esc(factShort(f.key))}</span><span class="ad-fk">${esc(FACT_KIND[f.kind] || f.kind || '')}</span></th>`).join('');
    const body = people.map((who) => `<tr><th scope="row">${who === 'player' ? '<i class="ad-dot" style="--pc:var(--ink)" aria-hidden="true"></i>' : dot(who)}${esc(shortName(who))}</th>${facts.map((f) => {
      const via = s.knows?.[who]?.[f.key] || [];
      return `<td>${via.length ? via.map((v) => `<span class="ad-via ${VIA_CLS[v] || ''}">${esc(VIA[v] || v)}</span>`).join('') : '<span class="ad-none" aria-label="不知道">·</span>'}</td>`;
    }).join('')}</tr>`).join('');
    const mem = (p.cast || []).map((c) => {
      const m = s.memory?.[c.key];
      return `<li>${dot(c.key)}<div><b>${esc(shortName(c.key))}</b>${m ? `<span class="ad-muted">第 ${esc(m.day)} 天（${esc(dayLabel(Number(m.day) || 0))}）写的</span><p>${esc(m.card)}</p>` : '<p class="ad-muted">还没有记忆卡。每过一个故事日，和她有互动才会写。</p>'}</div></li>`;
    }).join('');
    const pend = (s.pending || []).slice().sort((a, b) => a.at - b.at);
    const bl = (s.boundaryLog || []).slice().reverse();
    return `
      <section class="ad-sec"><h3 class="ad-h3">谁知道什么</h3>
        <p class="ad-note">人物 Agent 的 prompt 里只会出现她这一行有字的事实。看见 = 亲眼看到或拿到证据；被告知 = Danny 亲口说的；听说 = 别人告诉她的。表头悬停看原文。</p>
        <div class="ad-scroll"><table class="ad-table ad-matrix"><thead><tr><th scope="col">谁 \\ 事实</th>${head}</tr></thead><tbody>${body}</tbody></table></div>
        <details class="ad-more" data-dk="facts"><summary>事实原文（${facts.length} 条）</summary><dl class="ad-dl ad-dl-facts">${facts.map((f) => `<dt>${esc(factShort(f.key))} <span class="ad-key">${esc(f.key)}</span></dt><dd>${esc(f.text)}</dd>`).join('')}</dl></details>
      </section>
      <section class="ad-sec"><h3 class="ad-h3">人物阶段</h3><ul class="ad-stages">${stages}</ul></section>
      <section class="ad-sec"><h3 class="ad-h3">状态变量</h3>
        <div class="ad-scroll"><table class="ad-table ad-vars"><thead><tr><th scope="col">变量</th><th scope="col">现在</th><th scope="col">开局时</th><th scope="col">备注</th></tr></thead><tbody>${vars}</tbody></table></div>
      </section>
      <section class="ad-sec"><h3 class="ad-h3">记忆卡</h3><ul class="ad-memlist ad-memcards">${mem}</ul></section>
      <section class="ad-sec ad-two">
        <div><h3 class="ad-h3">待送达的消息</h3>${pend.length ? `<ul class="ad-mini">${pend.map((x) => `<li><span class="ad-num ad-muted">${esc(shortAt(x.at))}</span><b>${esc(personName(x.msg?.from))}</b><span>${esc(String(x.msg?.text || '').includes('私密图片') ? '[图片]' : x.msg?.text)}</span></li>`).join('')}</ul>` : '<p class="ad-muted">没有。</p>'}</div>
        <div><h3 class="ad-h3">越界记录</h3>${bl.length ? `<ul class="ad-mini">${bl.map((x) => `<li><span class="ad-num ad-muted">${esc(shortAt(x.at))}</span><span class="ad-st ad-st-bad">${esc(x.key)}</span><span>${esc(nodeOf(x.node)?.title || '自由聊天')} · ${esc(st()?.threads?.[x.thread]?.title || x.thread || '')}</span></li>`).join('')}</ul>` : '<p class="ad-muted">没有。</p>'}</div>
      </section>`;
  }

  /* ---------- 事件进度 ---------- */
  function eventsHTML() {
    const s = st(), p = pkg();
    if (!s) return '<p class="ad-empty">还没有开局。</p>';
    const nodes = (p.nodes || []).slice().sort((a, b) => toMin(a.trigger.window[0]) - toMin(b.trigger.window[0]) || b.priority - a.priority);
    const days = new Map();
    for (const n of nodes) { const d = dayOf(toMin(n.trigger.window[0])); if (!days.has(d)) days.set(d, []); days.get(d).push(n); }
    const cnt = { waiting: 0, open: 0, done: 0, missed: 0 };
    for (const n of nodes) cnt[nodeStatus(s, n)]++;
    const today = dayOf(displayTime(s));
    const out = [];
    for (const [d, list] of days) {
      out.push(`<section class="ad-day ${d === today ? 'is-today' : ''}"><h4 class="ad-dayh">${esc(dayLabel(d))}<span class="ad-muted"> · D${d}</span>${d === today ? '<span class="ad-tag ad-t-strong">今天</span>' : ''}</h4><ul class="ad-nodes">`);
      for (const n of list) {
        const stt = nodeStatus(s, n);
        const S = STATUS[stt];
        const tags = [n.crisis ? '<span class="ad-tag ad-t-bad">危机</span>' : '', n.hidden ? '<span class="ad-tag ad-t-plain">暗场</span>' : '', n.core ? '<span class="ad-tag ad-t-plain">核心</span>' : '', `<span class="ad-tag ad-t-plain">${esc(KIND[n.kind] || n.kind)}</span>`].join('');
        let detail = '';
        if (stt === 'done') {
          const o = outcomeOf(n, s.outcome?.[n.key]);
          detail = o ? `<b>${esc(o.label)}</b><span class="ad-muted">${esc(o.result)}</span>` : '<span class="ad-muted">已开始</span>';
        } else if (stt === 'open') {
          const o = (s.open || []).find((x) => x.node === n.key);
          detail = `<b>等 Danny 回答</b><span class="ad-muted">截止 ${esc(o ? fullAt(o.deadline) : '—')}</span><span class="ad-intents">${(o?.intents || n.decision?.intents || []).map((i) => `<span class="ad-chip">${esc(i.label)}</span>`).join('')}</span>`;
        } else if (stt === 'missed') {
          const why = s.blocked?.[n.key] ? `被规则挡下：${s.blocked[n.key]}` : s.ended ? '故事已经结束' : '触发条件没成立';
          detail = `<span class="ad-muted">${esc(why)}</span>`;
        } else {
          detail = `<span class="ad-muted">${n.trigger.mode === 'must' ? '必发（条件一成立就开始）' : '条件成立且不在安静时段才开始'} · ${esc(condText(n.trigger.when))}</span>`;
        }
        out.push(`<li class="ad-node is-${stt}"><span class="ad-tag ${S.c}">${S.t}</span>
          <span class="ad-ntime ad-num">${esc(windowText(n, true))}</span>
          <span class="ad-nmain"><span class="ad-ntitle">${esc(n.title)}${tags}<span class="ad-nby">${n.owner ? dot(n.owner) + esc(shortName(n.owner)) : '世界'}</span></span><span class="ad-ndetail">${detail}</span></span></li>`);
      }
      out.push('</ul></section>');
    }
    const hasToday = days.has(today) && !s.ended;
    return `<div class="ad-legendrow">${Object.entries(STATUS).map(([k, v]) => `<span class="ad-tag ${v.c}">${v.t} ${cnt[k]}</span>`).join('')}${hasToday ? `<button type="button" class="ad-btn ad-btn-quiet ad-today" data-act="today" data-fk="today">跳到今天（${esc(dayLabel(today))}）</button>` : ''}</div>${out.join('')}`;
  }

  /* ================================================================== */
  /* 世界设定                                                            */
  /* ================================================================== */

  function emptyDraft() { return { cast: {}, director: {}, policy: {}, extraCast: [] }; }
  function normDraft(p) {
    const d = emptyDraft();
    if (!p || typeof p !== 'object') return d;
    if (p.cast && typeof p.cast === 'object') d.cast = deep(p.cast);
    if (p.director && typeof p.director === 'object') d.director = deep(p.director);
    if (p.policy && typeof p.policy === 'object') d.policy = deep(p.policy);
    if (Array.isArray(p.extraCast)) d.extraCast = deep(p.extraCast);
    return d;
  }
  const draftSig = () => JSON.stringify(ui.draft || emptyDraft());
  const dirty = () => ui.draft && ui.savedSig !== null && draftSig() !== ui.savedSig;
  function changeCount() {
    const d = ui.draft || emptyDraft();
    let n = 0;
    for (const k in d.cast) n += CAST_FIELDS.filter((f) => getPath(d.cast[k], f.path) !== undefined).length;
    n += Object.keys(d.director).length + (d.policy.promptBlock !== undefined ? 1 : 0) + d.extraCast.length;
    return n;
  }
  const baseCast = (key) => (base().cast || []).find((c) => c.key === key);
  const fieldVal = (key, f) => { const v = getPath(ui.draft?.cast?.[key], f.path); return v !== undefined ? v : getPath(baseCast(key), f.path); };
  const fieldChanged = (key, f) => getPath(ui.draft?.cast?.[key], f.path) !== undefined;
  const dirVal = (k) => (ui.draft?.director?.[k] !== undefined ? ui.draft.director[k] : base().director?.[k]);

  function loadDraft() {
    ui.draftBusy = true;
    Promise.resolve()
      .then(() => app.draft?.load?.())
      .catch(() => null)
      .then((p) => {
        ui.draft = normDraft(p);
        ui.savedSig = draftSig();
        ui.draftBusy = false;
        try { ui.where = app.draft?.where?.() || null; } catch { ui.where = null; }
        ui.stale.world = true;
        if (ui.tab === 'world') render(true);
      });
  }

  function renderWorld(p) {
    ui.lastPkg = app.pkg;
    keep(p, () => {
      const sub = { cast: castHTML, events: worldEventsHTML, director: directorHTML, policy: policyHTML }[ui.wd] || castHTML;
      p.innerHTML = `<div class="ad-wrap ad-world">
        <header class="ad-head"><p class="ad-eyebrow">世界设定 · ${esc(pkg().universe?.title || '')}</p>
          <p class="ad-lede">人物、导演数字和内容边界可以改，改完存成草稿，用草稿重开一局才生效。事件只读：它们是作者写好、lint 过的剧情骨架。</p></header>
        <div class="ad-seg ad-subtabs" role="group" aria-label="世界设定">${WD_TABS.map((t) => `<button type="button" class="ad-segbtn" data-act="wd" data-wd="${t.key}" data-fk="wd-${t.key}" aria-pressed="${ui.wd === t.key}">${t.label}</button>`).join('')}</div>
        <div class="ad-wbody">${ui.draft ? sub() : '<p class="ad-empty">正在读取草稿…</p>'}</div>
      </div>
      <div class="ad-draftbar" role="region" aria-label="草稿">${draftBarHTML()}</div>`;
    });
  }
  function draftBarHTML() {
    if (!ui.draft) return '<span class="ad-muted">正在读取草稿…</span>';
    const n = changeCount();
    const whereTxt = ui.where === 'db' ? '存到共享数据库' : ui.where === 'local' ? '存到这台设备' : '';
    const whereTip = ui.where === 'db' ? '能打开这个页面的人都看得到这份草稿' : ui.where === 'local' ? '只存在这台设备的浏览器里' : '';
    const stat = dirty() ? `<span class="ad-st ad-st-warn">有没保存的改动</span>` : n ? '<span class="ad-st ad-st-ok">草稿已保存</span>' : '<span class="ad-st ad-st-info">还没有草稿</span>';
    let confirm = '';
    if (ui.confirm === 'restart') {
      confirm = `<div class="ad-confirm" role="alert"><span>会结束当前这一局，用草稿从头开始${dirty() ? '（没保存的改动会先保存）' : ''}。</span>
        <button type="button" class="ad-btn ad-btn-primary" data-act="restart-yes" data-fk="restart-yes">确认重开</button><button type="button" class="ad-btn" data-act="confirm-no" data-fk="confirm-no">取消</button></div>`;
    } else if (ui.confirm === 'reset') {
      confirm = `<div class="ad-confirm" role="alert"><span>清空草稿里的全部改动，回到原始设定（要保存才会生效）。</span>
        <button type="button" class="ad-btn ad-btn-primary" data-act="reset-yes" data-fk="reset-yes">确认清空</button><button type="button" class="ad-btn" data-act="confirm-no" data-fk="confirm-no">取消</button></div>`;
    }
    return `<div class="ad-draftinfo">${stat}<span class="ad-num">改动 ${n} 处</span>${whereTxt ? `<span class="ad-muted" title="${esc(whereTip)}">${esc(whereTxt)}</span>` : ''}${ui.draftMsg ? `<span class="ad-draftmsg" role="status">${esc(ui.draftMsg)}</span>` : ''}</div>
      <div class="ad-draftbtns">
        ${n ? '<button type="button" class="ad-btn ad-btn-quiet" data-act="reset" data-fk="reset">清空草稿</button>' : ''}
        <button type="button" class="ad-btn" data-act="save" data-fk="save" ${ui.draftBusy ? 'disabled' : ''}>保存草稿</button>
        <button type="button" class="ad-btn ad-btn-primary" data-act="restart" data-fk="restart" ${ui.draftBusy ? 'disabled' : ''}>用草稿重开一局</button>
      </div>${confirm}`;
  }
  function refreshDraftBar() {
    const bar = panels.world.querySelector('.ad-draftbar');
    if (bar) {
      const fk = document.activeElement?.closest?.('.ad-draftbar') ? document.activeElement.getAttribute('data-fk') : null;
      bar.innerHTML = draftBarHTML();
      if (fk) bar.querySelector(`[data-fk="${CSS.escape(fk)}"]`)?.focus({ preventScroll: true });
    }
  }

  /* ---------- 人物 ---------- */
  function castHTML() {
    const b = base();
    const cards = (b.cast || []).map((c) => {
      const changed = CAST_FIELDS.filter((f) => fieldChanged(c.key, f)).length;
      const fields = CAST_FIELDS.map((f) => {
        const v = fieldVal(c.key, f);
        const val = f.list ? (Array.isArray(v) ? v.join('\n') : '') : String(v ?? '');
        const id = `ad-f-${c.key}-${f.path.replace(/\./g, '-')}`;
        return `<div class="ad-field ${fieldChanged(c.key, f) ? 'is-changed' : ''}"><label for="${esc(id)}">${esc(f.label)}<span class="ad-chgtag">已改</span></label>
          <textarea id="${esc(id)}" rows="${f.rows}" data-act="castfield" data-key="${esc(c.key)}" data-path="${f.path}" data-fk="${esc(id)}">${esc(val)}</textarea></div>`;
      }).join('');
      return `<details class="ad-card ad-castcard" data-key="${esc(c.key)}" data-dk="cast-${esc(c.key)}">
        <summary><span class="ad-cardsum">${dot(c.key)}<b>${esc(c.name)}</b><span class="ad-muted">${esc(c.age)} 岁 · ${esc(c.role)}</span></span><span class="ad-cardchg">${changed ? `<span class="ad-tag ad-t-warn">已改 ${changed} 处</span>` : ''}</span></summary>
        <div class="ad-cardbody">
          <p class="ad-note">${esc(c.publicIntro)}</p>
          <details class="ad-more" data-dk="bg-${esc(c.key)}"><summary>背景、阶段、秘密（只读）</summary>
            <p>${esc(c.background)}</p>
            <ol class="ad-steps">${(c.stages || []).map((s) => `<li title="${esc(s.meaning)}">${esc(s.label)}</li>`).join('')}</ol>
            <p class="ad-note">秘密：${(c.secrets || []).map((k) => esc(factShort(k))).join('、') || '无'} · 身体接触上限：${c.contactCeiling === 'hug' ? '拥抱' : '无'}（不能改）</p>
          </details>
          <div class="ad-fields">${fields}</div>
          ${changed ? `<button type="button" class="ad-btn ad-btn-quiet" data-act="castreset" data-key="${esc(c.key)}" data-fk="cr-${esc(c.key)}">还原这张卡</button>` : ''}
        </div></details>`;
    }).join('');
    const sup = (b.supporting || []).map((c) => `<li>${dot(c.key)}<div><b>${esc(c.name)}</b><span class="ad-muted"> · ${esc(c.role)}</span><p>${esc(c.note)}</p></div></li>`).join('');
    const w = ui.writer;
    const extra = ui.draft.extraCast || [];
    return `
      <section class="ad-sec"><h3 class="ad-h3">主要人物 <span class="ad-note">点开一张卡编辑；年龄、阶段、秘密、接触上限不能改</span></h3>
        <div class="ad-cards">${cards}</div></section>
      <section class="ad-sec ad-writer"><h3 class="ad-h3">AI 补全人物 <span class="ad-tag ad-a-writer">编剧 Agent</span></h3>
        <p class="ad-note">写一句人物简介，编剧 Agent 生成完整人设卡。加进草稿后，用草稿重开一局，她只出现在自由聊天里，不进任何事件。</p>
        <div class="ad-writerrow">
          <label class="ad-vh" for="ad-writer-brief">人物简介</label>
          <input id="ad-writer-brief" type="text" maxlength="120" placeholder="例：知夏的大学室友，29 岁，在宁川做律师，说话直" value="${esc(w.brief)}" data-act="brief" data-fk="brief" ${w.busy ? 'disabled' : ''}>
          <button type="button" class="ad-btn ad-btn-primary" data-act="write" data-fk="write" ${w.busy ? 'disabled' : ''}>${w.busy ? '生成中…' : '生成人物'}</button>
        </div>
        ${w.error ? `<p class="ad-warnline" role="alert">${esc(w.error)}</p>` : ''}
        ${w.card ? `<div class="ad-preview">${personaCardHTML(w.card)}<div class="ad-btnrow"><button type="button" class="ad-btn ad-btn-primary" data-act="addcard" data-fk="addcard">加入草稿</button><button type="button" class="ad-btn" data-act="dropcard" data-fk="dropcard">不要了</button></div></div>` : ''}
        ${extra.length ? `<h4 class="ad-h4">草稿里的新人物（${extra.length}）</h4><ul class="ad-extra">${extra.map((c, i) => `<li><details data-dk="extra-${i}"><summary><i class="ad-dot" style="--pc:var(--p6)" aria-hidden="true"></i><b>${esc(c.name)}</b><span class="ad-muted"> · ${esc(c.age)} 岁 · ${esc(c.role)}</span></summary>${personaCardHTML(c)}</details><button type="button" class="ad-btn ad-btn-quiet" data-act="rmextra" data-i="${i}" data-fk="rmx-${i}">移出草稿</button></li>`).join('')}</ul>` : ''}
      </section>
      <section class="ad-sec"><h3 class="ad-h3">配角 <span class="ad-note">只在事件里说作者写好的话，只读</span></h3><ul class="ad-suplist">${sup}</ul></section>`;
  }
  function personaCardHTML(c) {
    const list = (a) => (Array.isArray(a) && a.length ? `<ul>${a.map((x) => `<li>${esc(x)}</li>`).join('')}</ul>` : '<span class="ad-muted">—</span>');
    return `<div class="ad-persona">
      <div class="ad-personahead"><b>${esc(c.name)}</b><span class="ad-muted">${esc(c.age)} 岁 · ${esc(c.role)}</span></div>
      <p>${esc(c.publicIntro || '')}</p>
      <dl class="ad-dl">
        <dt>背景</dt><dd>${esc(c.background || '—')}</dd>
        <dt>说话方式</dt><dd>${esc(c.persona?.voice || '—')}</dd>
        <dt>习惯</dt><dd>${list(c.persona?.habits)}</dd>
        <dt>台词样例</dt><dd>${list(c.persona?.sampleLines)}</dd>
        <dt>动机</dt><dd>${esc(c.motive?.surface || '—')}<br><span class="ad-muted">深层：${esc(c.motive?.deep || '—')}</span></dd>
        <dt>目标</dt><dd>${esc(c.goal || '—')}</dd>
        <dt>阶段</dt><dd>${(c.stages || []).map((s) => `<span class="ad-chip" title="${esc(s.meaning)}">${esc(s.label)}</span>`).join(' ') || '—'}</dd>
        <dt>必须</dt><dd>${list(c.rules)}</dd>
        <dt>绝不</dt><dd>${list(c.never)}</dd>
        <dt>兜底台词</dt><dd>${list(c.fallbackLines)}</dd>
      </dl></div>`;
  }

  /* ---------- 事件（只读） ---------- */
  function worldEventsHTML() {
    const p = pkg();
    const byLine = (p.lines || []).map((l) => {
      const nodes = (p.nodes || []).filter((n) => n.line === l.key).sort((a, b) => toMin(a.trigger.window[0]) - toMin(b.trigger.window[0]));
      const cols = l.key === 'cross' ? (p.collisions || []) : [];
      return `<section class="ad-sec ad-line"><h3 class="ad-h3">${l.owner ? dot(l.owner) : ''}${esc(l.title)} <span class="ad-note">${nodes.length} 个事件</span></h3>
        <p class="ad-note">${esc(l.summary)}</p>
        <div class="ad-cards">${nodes.map(nodeCardHTML).join('')}</div>
        ${cols.length ? `<h4 class="ad-h4">碰撞（危机只从这里来）</h4><div class="ad-scroll"><table class="ad-table"><thead><tr><th scope="col">碰撞</th><th scope="col">成立条件</th><th scope="col">引出</th><th scope="col">说明</th></tr></thead><tbody>${cols.map((c) => `<tr><th scope="row">${esc(c.label)}</th><td>${esc(condText(c.when))}</td><td>${esc(nodeOf(c.crisis)?.title || c.crisis)}</td><td class="ad-muted">${esc(c.note)}</td></tr>`).join('')}</tbody></table></div>` : ''}
      </section>`;
    }).join('');
    const endings = (p.endings || []).map((e) => `<li><b>${esc(e.title)}</b><span class="ad-muted">${e.when ? esc(condText(e.when)) : '以上都不成立时'}</span></li>`).join('');
    return `${byLine}<section class="ad-sec"><h3 class="ad-h3">结局 <span class="ad-note">婚礼日按顺序取第一个成立的</span></h3><ol class="ad-endings">${endings}</ol></section>`;
  }
  function nodeCardHTML(n) {
    const tags = [n.crisis ? '<span class="ad-tag ad-t-bad">危机</span>' : '', n.hidden ? '<span class="ad-tag ad-t-plain">暗场</span>' : '', `<span class="ad-tag ad-t-plain">${esc(KIND[n.kind] || n.kind)}</span>`, `<span class="ad-tag ${n.trigger.mode === 'must' ? 'ad-t-strong' : 'ad-t-plain'}">${n.trigger.mode === 'must' ? '必发' : '可选'}</span>`].join('');
    const intents = n.decision ? `<dt>决策</dt><dd>${esc(n.decision.prompt)}<span class="ad-muted">（${nf(n.decision.timeoutMinutes)} 分钟不回算超时）</span><ul class="ad-intentlist">${n.decision.intents.map((i) => `<li><b>${esc(i.label)}</b> <span class="ad-key">${esc(i.key)}</span><span class="ad-muted">${i.examples.map((x) => `「${esc(x)}」`).join('')}</span></li>`).join('')}</ul></dd>` : '';
    const outs = `<dt>结果</dt><dd><ul class="ad-outlist">${n.outcomes.map((o) => `<li><b>${esc(o.label)}</b><span class="ad-tag ad-t-plain">${esc(onText(n, o.on))}</span>${o.when ? `<span class="ad-muted">当 ${esc(condText(o.when))}</span>` : ''}<span>${esc(o.result)}</span></li>`).join('')}</ul></dd>`;
    return `<details class="ad-card ad-nodecard" data-dk="node-${esc(n.key)}"><summary><span class="ad-cardsum"><b>${esc(n.title)}</b><span class="ad-muted ad-num">${esc(windowText(n, false))}</span></span><span class="ad-cardchg">${tags}</span></summary>
      <div class="ad-cardbody"><dl class="ad-dl">
        <dt>谁推动</dt><dd>${n.owner ? dot(n.owner) + esc(personName(n.owner)) : '世界'} · 优先级 ${esc(n.priority)}</dd>
        <dt>触发条件</dt><dd>${esc(condText(n.trigger.when))}</dd>
        <dt>情境</dt><dd>${esc(n.setup)}</dd>
        ${intents}${outs}
        ${n.guard?.length ? `<dt>额外边界</dt><dd><ul>${n.guard.map((g) => `<li>${esc(g)}</li>`).join('')}</ul></dd>` : ''}
      </dl></div></details>`;
  }

  /* ---------- 导演规则 ---------- */
  function directorHTML() {
    const d = base().director || {};
    const q = dirVal('quietHours') || ['01:00', '08:00'];
    const num = (f) => {
      const ch = ui.draft.director[f.key] !== undefined;
      return `<div class="ad-field ad-numfield ${ch ? 'is-changed' : ''}"><label for="ad-d-${f.key}">${esc(f.label)}<span class="ad-chgtag">已改</span></label>
        <span class="ad-inputunit"><input id="ad-d-${f.key}" type="number" inputmode="numeric" min="${f.min}" max="${f.max}" step="1" value="${esc(dirVal(f.key))}" data-act="dirnum" data-k="${f.key}" data-fk="d-${f.key}"><span>${f.unit}</span></span>
        <span class="ad-muted">原始：${esc(d[f.key])} ${f.unit}</span></div>`;
    };
    const qch = ui.draft.director.quietHours !== undefined;
    return `
      <section class="ad-sec"><h3 class="ad-h3">导演风格</h3><p>${esc(d.style)}</p></section>
      <section class="ad-sec"><h3 class="ad-h3">固定规则 <span class="ad-note">按顺序执行，不打分、不调模型</span></h3>
        <ol class="ad-rules">${(d.rules || []).map((r) => `<li><span class="ad-rkey ad-mono">${esc(r.key)}</span><span>${esc(r.text)}</span></li>`).join('')}</ol></section>
      <section class="ad-sec"><h3 class="ad-h3">可以改的数字</h3>
        <div class="ad-numgrid">
          ${num(DIR_FIELDS[0])}
          <div class="ad-field ad-numfield ${qch ? 'is-changed' : ''}"><span class="ad-flabel" id="ad-d-q-l">安静时段（只放必发事件）<span class="ad-chgtag">已改</span></span>
            <span class="ad-inputunit" role="group" aria-labelledby="ad-d-q-l"><input type="text" class="ad-hhmm" inputmode="numeric" maxlength="5" placeholder="01:00" aria-label="安静时段开始（时:分）" value="${esc(q[0])}" data-act="quiet" data-i="0" data-fk="q0"><span>到</span><input type="text" class="ad-hhmm" inputmode="numeric" maxlength="5" placeholder="08:00" aria-label="安静时段结束（时:分）" value="${esc(q[1])}" data-act="quiet" data-i="1" data-fk="q1"></span>
            <span class="ad-muted">原始：${esc((d.quietHours || []).join('–'))}</span></div>
          ${num(DIR_FIELDS[1])}${num(DIR_FIELDS[2])}
          <div class="ad-field ad-numfield"><span class="ad-flabel">第一个危机不早于</span><b class="ad-num">${esc(dtLabel(d.firstCrisisNotBefore))}</b><span class="ad-muted">作者写死，不能改</span></div>
        </div></section>`;
  }

  /* ---------- 内容边界 ---------- */
  function policyHTML() {
    const pol = base().policy || {};
    const pb = ui.draft.policy.promptBlock !== undefined ? ui.draft.policy.promptBlock : pol.promptBlock;
    const pbCh = ui.draft.policy.promptBlock !== undefined;
    const people = (ks) => ks.map((k) => shortName(k)).join('、');
    const bis = (pol.boundaryInputs || []).map((b) => `<li class="ad-card ad-bi"><div class="ad-bihead"><span class="ad-mono">${esc(b.key)}</span>${b.pause ? '<span class="ad-tag ad-t-bad">整局暂停</span>' : ''}
        <span class="ad-muted">${b.with ? `只在对${esc(people(b.with))}说话时` : '对谁说都算'}${b.nodes ? ` · 只在 ${esc(b.nodes.map((k) => nodeOf(k)?.title || k).join('、'))}` : ''}${b.when ? ` · 前提：${esc(condText(b.when))}` : ''}</span></div>
        <p>${esc(b.input)}</p>
        <ul class="ad-replies">${(b.reply || []).map((r) => `<li><b>${esc(r.from === 'speaker' ? '对方' : personName(r.from))}</b>${r.mode === 'gist' ? '<span class="ad-tag ad-t-plain">要点</span>' : ''}<span>${esc(r.mode === 'gist' ? r.fallback || r.text : r.text)}</span></li>`).join('')}</ul></li>`).join('');
    const hl = (pol.hardLines || []).map((h) => `<tr><th scope="row"><span class="ad-mono">${esc(h.key)}</span></th><td><b>${esc(h.rule)}</b></td><td>${esc(h.lint)}</td><td>${esc(h.runtime)}</td></tr>`).join('');
    const block = (pol.lexicon?.block || []).map((w) => `<span class="ad-word">${esc(w)}</span>`).join('');
    const sh = (extras().selfharm || []).map((w) => `<span class="ad-word">${esc(w)}</span>`).join('');
    return `
      <section class="ad-sec"><h3 class="ad-h3">注入每个人物的边界说明</h3>
        <div class="ad-field ${pbCh ? 'is-changed' : ''}"><label for="ad-pb">promptBlock（人物 Agent 的 prompt 里【内容边界】这一段）<span class="ad-chgtag">已改</span></label>
          <textarea id="ad-pb" rows="9" data-act="promptblock" data-fk="pb">${esc(pb)}</textarea></div>
        ${pbCh ? '<button type="button" class="ad-btn ad-btn-quiet" data-act="pbreset" data-fk="pbreset">还原这一段</button>' : ''}
      </section>
      <section class="ad-sec"><h3 class="ad-h3">底线 <span class="ad-note">${(pol.hardLines || []).length} 条，只读</span></h3>
        <div class="ad-scroll"><table class="ad-table ad-hard"><thead><tr><th scope="col">编号</th><th scope="col">底线</th><th scope="col">写稿时怎么查</th><th scope="col">运行时怎么拦</th></tr></thead><tbody>${hl}</tbody></table></div></section>
      <section class="ad-sec"><h3 class="ad-h3">越界输入 <span class="ad-note">裁判判中就走固定回复，不归类成任何意图</span></h3><ul class="ad-bis">${bis}</ul></section>
      <section class="ad-sec ad-two">
        <div><h3 class="ad-h3">输出词表 <span class="ad-note">${(pol.lexicon?.block || []).length} 个词，逐行审模型台词</span></h3>
          <div class="ad-words">${block}</div>
          <p class="ad-note">先剔除：${(pol.lexicon?.exclude || []).map(esc).join('、') || '无'}。${esc(pol.lexicon?.note || '')}</p>
          <h4 class="ad-h4">命中以后</h4><ol class="ad-plainol">${(pol.onHit || []).map((x) => `<li>${esc(x)}</li>`).join('')}</ol></div>
        <div><h3 class="ad-h3">自伤拦截 <span class="ad-note">代码层直接拦，不经过任何模型</span></h3>
          <div class="ad-words">${sh || '<span class="ad-muted">—</span>'}</div>
          <p class="ad-note">命中就出戏、给求助热线、整局暂停，玩家点「继续」才往下走。先剔除：${(extras().selfharmExclude || []).map(esc).join('、') || '无'}。</p></div>
      </section>`;
  }

  /* ---------- 草稿编辑 ---------- */
  function onCastField(t) {
    const key = t.dataset.key, f = CAST_FIELDS.find((x) => x.path === t.dataset.path);
    if (!f || !ui.draft) return;
    const v = f.list ? t.value.split('\n').map((x) => x.trim()).filter(Boolean) : t.value.trim();
    const orig = getPath(baseCast(key), f.path);
    const c = (ui.draft.cast[key] ??= {});
    if (same(v, orig)) delPath(c, f.path); else setPath(c, f.path, v);
    if (!Object.keys(c).length) delete ui.draft.cast[key];
    markField(t.closest('.ad-field'), fieldChanged(key, f));
    const card = t.closest('.ad-castcard');
    const n = CAST_FIELDS.filter((x) => fieldChanged(key, x)).length;
    const chg = card?.querySelector('.ad-cardchg');
    if (chg) chg.innerHTML = n ? `<span class="ad-tag ad-t-warn">已改 ${n} 处</span>` : '';
    ui.draftMsg = '';
    refreshDraftBar();
  }
  const markField = (fe, on) => fe?.classList.toggle('is-changed', !!on);
  function onDirNum(t) {
    const k = t.dataset.k, f = DIR_FIELDS.find((x) => x.key === k);
    const v = Math.floor(Number(t.value));
    if (!Number.isFinite(v) || t.value === '') return;
    const clamped = Math.max(f.min, Math.min(f.max, v));
    if (clamped === base().director?.[k]) delete ui.draft.director[k]; else ui.draft.director[k] = clamped;
    markField(t.closest('.ad-field'), ui.draft.director[k] !== undefined);
    ui.draftMsg = '';
    refreshDraftBar();
  }
  function onQuiet(t) {
    const q = [...(dirVal('quietHours') || ['01:00', '08:00'])];
    const v = t.value.trim().replace('：', ':');
    const ok = /^([01]\d|2[0-3]):[0-5]\d$/.test(v) || v === '24:00';
    t.setAttribute('aria-invalid', String(!ok));
    if (!ok) return;
    q[Number(t.dataset.i)] = v;
    if (same(q, base().director?.quietHours)) delete ui.draft.director.quietHours; else ui.draft.director.quietHours = q;
    markField(t.closest('.ad-field'), ui.draft.director.quietHours !== undefined);
    ui.draftMsg = '';
    refreshDraftBar();
  }
  function onPromptBlock(t) {
    const v = t.value;
    if (v === base().policy?.promptBlock || !v.trim()) delete ui.draft.policy.promptBlock; else ui.draft.policy.promptBlock = v;
    markField(t.closest('.ad-field'), ui.draft.policy.promptBlock !== undefined);
    ui.draftMsg = '';
    refreshDraftBar();
  }
  function patchOut() {
    const d = ui.draft || emptyDraft();
    const p = {};
    if (Object.keys(d.cast).length) p.cast = deep(d.cast);
    if (Object.keys(d.director).length) p.director = deep(d.director);
    if (d.policy.promptBlock !== undefined) p.policy = { promptBlock: d.policy.promptBlock };
    if (d.extraCast.length) p.extraCast = deep(d.extraCast);
    return p;
  }
  async function saveDraft() {
    if (!app.draft?.save) { ui.draftMsg = '这个页面没有接上草稿存储'; refreshDraftBar(); return null; }
    ui.draftBusy = true; ui.draftMsg = '正在保存…'; refreshDraftBar();
    try {
      const where = await app.draft.save(patchOut());
      ui.where = where || ui.where;
      ui.savedSig = draftSig();
      ui.draftMsg = where === 'db' ? '已保存到共享数据库' : '已保存到这台设备的浏览器';
      return where;
    } catch (e) {
      ui.draftMsg = '没保存成功：' + (e?.message || '未知错误');
      return null;
    } finally { ui.draftBusy = false; refreshDraftBar(); }
  }
  async function restartWithDraft() {
    ui.confirm = null;
    const w = await saveDraft();
    if (w === null && app.draft?.save) return;
    ui.draftBusy = true; ui.draftMsg = '正在用草稿重开…'; refreshDraftBar();
    try {
      await app.draft?.applyAndRestart?.(patchOut());
      ui.draftMsg = '已用草稿重开一局';
    } catch (e) { ui.draftMsg = '重开失败：' + (e?.message || '未知错误'); }
    finally { ui.draftBusy = false; ui.stale.world = true; render(true); }
  }
  async function runWriter() {
    const w = ui.writer;
    const brief = w.brief.trim();
    if (!brief) { w.error = '先写一句人物简介。'; ui.stale.world = true; return render(true); }
    if (typeof app.writer !== 'function') { w.error = '需要连接 Claude 才能生成人物'; ui.stale.world = true; return render(true); }
    w.busy = true; w.error = ''; w.card = null; ui.stale.world = true; render(true);
    try { w.card = await app.writer(brief); }
    catch (e) { w.error = e?.message || '这次没生成出来，稍后再试'; }
    finally { w.busy = false; ui.stale.world = true; render(true); }
  }

  /* ================================================================== */
  /* 成本                                                                */
  /* ================================================================== */

  function costHTML() {
    const s = st(), all = calls(), pr = price();
    const total = all.reduce((x, c) => x + costOf(c), 0);
    const saved = all.reduce((x, c) => x + ((c.cachedTok || 0) * (PRICES[pr].in - PRICES[pr].cached) / 1e6) * PRICES.fx, 0);
    const days = Math.max(1, s ? dayOf(displayTime(s)) - dayOf(startsAt()) + 1 : 1);
    const perDay = total / days;
    let playerMsgs = 0;
    for (const id in s?.threads || {}) playerMsgs += (s.threads[id].msgs || []).filter((m) => m.from === 'player').length;
    const perMsg = playerMsgs ? total / playerMsgs : 0;
    const per60 = perMsg * 60;
    const old = OLD_MODEL[pr];
    const bars = [
      { label: '旧架构（估）', sub: '重度用户每天 60 条，按李孟哲引擎现在的写法', v: old.old, cls: 'is-old' },
      { label: '新架构（估）', sub: '同样用量，之前的成本模型', v: old.next, cls: 'is-new' },
      { label: '这一局 · 每个故事日', sub: `本局 ${yuan(total, 4)} ÷ ${days} 个故事日`, v: perDay, cls: 'is-now' },
      { label: '这一局 · 按每天 60 条折算', sub: playerMsgs ? `每条玩家消息 ${yuan(perMsg, 5)} × 60` : '玩家还没发消息', v: per60, cls: 'is-now2' },
    ];
    const max = Math.max(...bars.map((b) => b.v), 1e-9);
    const by = AGENT_ORDER.map((k) => {
      const l = all.filter((c) => c.agent === k);
      const sum = (f) => l.reduce((x, c) => x + (Number(c[f]) || 0), 0);
      const y = l.reduce((x, c) => x + costOf(c), 0);
      return { k, n: l.length, fb: l.filter((c) => c.via === 'fallback').length, inTok: sum('inTok'), cached: sum('cachedTok'), out: sum('outTok'), y };
    });
    const tot = by.reduce((a, r) => ({ n: a.n + r.n, fb: a.fb + r.fb, inTok: a.inTok + r.inTok, cached: a.cached + r.cached, out: a.out + r.out, y: a.y + r.y }), { n: 0, fb: 0, inTok: 0, cached: 0, out: 0, y: 0 });
    const share = (y) => (tot.y > 0 ? `${Math.round((y / tot.y) * 100)}%` : '—');
    const dayMap = new Map();
    for (const c of all) {
      const d = c.storyAt == null ? 'admin' : dayOf(c.storyAt);
      if (!dayMap.has(d)) dayMap.set(d, { n: 0, character: 0, judge: 0, memory: 0, writer: 0, inTok: 0, out: 0, y: 0 });
      const r = dayMap.get(d);
      r.n++; r[c.agent] = (r[c.agent] || 0) + 1; r.inTok += c.inTok || 0; r.out += c.outTok || 0; r.y += costOf(c);
    }
    const dayRows = [...dayMap.entries()].sort((a, b) => (a[0] === 'admin' ? 1 : b[0] === 'admin' ? -1 : a[0] - b[0]));
    const seg = by.filter((r) => r.y > 0).map((r) => `<span class="ad-segbar ${AGENT[r.k].cls}" style="width:${((r.y / (tot.y || 1)) * 100).toFixed(2)}%" title="${AGENT[r.k].label} ${yuan(r.y, 4)}"></span>`).join('');
    return `<div class="ad-wrap">
      <header class="ad-head"><p class="ad-eyebrow">成本</p><h2 class="ad-h2">这一局花了多少，折成每个用户每天</h2>
        <p class="ad-lede">本原型实际跑在 Claude 上（用看的人自己的额度）；下面的金额是按线上模型价格折算的估计，不是账单。</p></header>
      <div class="ad-controls">
        <div class="ad-ctl"><span class="ad-k">价格表</span><div class="ad-seg" role="group" aria-label="价格表">
          ${['mini', 'flash'].map((k) => `<button type="button" class="ad-segbtn" data-act="price" data-v="${k}" data-fk="pr-${k}" aria-pressed="${pr === k}">${esc(PRICES[k].label.replace(/（.*）$/, ''))}</button>`).join('')}</div></div>
        <div class="ad-ctl"><span class="ad-k">模型档位</span><div class="ad-seg" role="group" aria-label="模型档位">
          ${['quick', 'default'].map((k) => `<button type="button" class="ad-segbtn" data-act="tier" data-v="${k}" data-fk="ti-${k}" aria-pressed="${tier() === k}">${TIER[k]}</button>`).join('')}</div>
          <span class="ad-note">人物、裁判、记忆用这一档；编剧固定用默认档。改了从下一次调用起生效。</span></div>
      </div>
      <div class="ad-kpis">
        <div class="ad-kpi ad-kpi-big"><span class="ad-k">这一局到现在</span><b class="ad-num">${yuan(total, 4)}</b><span class="ad-note">${nf(all.length)} 次调用 · 输入 ${nf(tot.inTok)} / 输出 ${nf(tot.out)} token</span></div>
        <div class="ad-kpi ad-kpi-big"><span class="ad-k">折算每活跃用户每天</span><b class="ad-num">${yuan(perDay, 4)}</b><span class="ad-note">本局总价 ÷ 已玩 ${days} 个故事日（开场那天算第 1 天）</span></div>
        <div class="ad-kpi"><span class="ad-k">每条玩家消息</span><b class="ad-num">${playerMsgs ? yuan(perMsg, 5) : '—'}</b><span class="ad-note">玩家发了 ${playerMsgs} 条</span></div>
        <div class="ad-kpi"><span class="ad-k">缓存省下</span><b class="ad-num">${yuan(saved, 5)}</b><span class="ad-note">命中缓存 ${nf(tot.cached)} token</span></div>
      </div>
      <section class="ad-sec"><h3 class="ad-h3">和之前的成本模型对照 <span class="ad-note">按 ${esc(PRICES[pr].label)} 价</span></h3>
        <div class="ad-bars">${bars.map((b) => `<div class="ad-bar ${b.cls}"><div class="ad-barlbl"><span><b>${esc(b.label)}</b><span class="ad-muted">${esc(b.sub)}</span></span><span class="ad-num">${yuan(b.v, b.v < 0.01 ? 4 : 2)} / 天</span></div><div class="ad-bartrack"><span style="width:${Math.max(0.5, (b.v / max) * 100).toFixed(2)}%"></span></div></div>`).join('')}</div>
        <p class="ad-note">前两行来自之前的成本页（重度用户每天 60 条消息；新架构里还含关键场面用强模型的 ¥0.05/天）。后两行是这一局的实测估算：调用次数是真的，token 按字数估（汉字 ×0.8、其它字符 ÷3.8），缓存按“同一人物前缀没变且 ≥1024 token”估，离线兜底和没触达模型的调用记 0。</p>
      </section>
      <section class="ad-sec"><h3 class="ad-h3">按 Agent 类型</h3>
        ${seg ? `<div class="ad-stack" aria-hidden="true">${seg}</div>` : ''}
        <div class="ad-scroll"><table class="ad-table ad-costtbl"><thead><tr><th scope="col">Agent</th><th scope="col" class="ad-r">调用</th><th scope="col" class="ad-r">兜底</th><th scope="col" class="ad-r">输入 token</th><th scope="col" class="ad-r">其中缓存</th><th scope="col" class="ad-r">输出 token</th><th scope="col" class="ad-r">¥</th><th scope="col" class="ad-r">占比</th></tr></thead>
          <tbody>${by.map((r) => `<tr><th scope="row"><span class="ad-tag ${AGENT[r.k].cls}">${AGENT[r.k].label}</span></th><td class="ad-r ad-num">${r.n}</td><td class="ad-r ad-num">${r.fb}</td><td class="ad-r ad-num">${nf(r.inTok)}</td><td class="ad-r ad-num">${nf(r.cached)}</td><td class="ad-r ad-num">${nf(r.out)}</td><td class="ad-r ad-num">${yuan(r.y, 4)}</td><td class="ad-r ad-num">${share(r.y)}</td></tr>`).join('')}
            <tr class="ad-total"><th scope="row">合计</th><td class="ad-r ad-num">${tot.n}</td><td class="ad-r ad-num">${tot.fb}</td><td class="ad-r ad-num">${nf(tot.inTok)}</td><td class="ad-r ad-num">${nf(tot.cached)}</td><td class="ad-r ad-num">${nf(tot.out)}</td><td class="ad-r ad-num">${yuan(tot.y, 4)}</td><td class="ad-r ad-num">${tot.y > 0 ? '100%' : '—'}</td></tr></tbody></table></div>
      </section>
      <section class="ad-sec"><h3 class="ad-h3">按故事日</h3>
        ${dayRows.length ? `<div class="ad-scroll"><table class="ad-table ad-costtbl"><thead><tr><th scope="col">故事日</th><th scope="col" class="ad-r">调用</th><th scope="col" class="ad-r">人物</th><th scope="col" class="ad-r">裁判</th><th scope="col" class="ad-r">记忆</th><th scope="col" class="ad-r">编剧</th><th scope="col" class="ad-r">输入 token</th><th scope="col" class="ad-r">输出 token</th><th scope="col" class="ad-r">¥</th></tr></thead>
          <tbody>${dayRows.map(([d, r]) => `<tr><th scope="row">${d === 'admin' ? '后台（不算故事日）' : `${esc(dayLabel(d))} <span class="ad-muted">D${d}</span>`}</th><td class="ad-r ad-num">${r.n}</td><td class="ad-r ad-num">${r.character || 0}</td><td class="ad-r ad-num">${r.judge || 0}</td><td class="ad-r ad-num">${r.memory || 0}</td><td class="ad-r ad-num">${r.writer || 0}</td><td class="ad-r ad-num">${nf(r.inTok)}</td><td class="ad-r ad-num">${nf(r.out)}</td><td class="ad-r ad-num">${yuan(r.y, 4)}</td></tr>`).join('')}</tbody></table></div>` : '<p class="ad-empty">还没有调用。</p>'}
      </section>
      <section class="ad-sec"><h3 class="ad-h3">价格表 <span class="ad-note">美元 / 每百万 token，汇率 ${PRICES.fx}</span></h3>
        <div class="ad-scroll"><table class="ad-table ad-costtbl"><thead><tr><th scope="col">模型</th><th scope="col" class="ad-r">输入</th><th scope="col" class="ad-r">缓存命中的输入</th><th scope="col" class="ad-r">输出</th></tr></thead>
          <tbody>${['mini', 'flash'].map((k) => `<tr class="${k === pr ? 'is-cur' : ''}"><th scope="row">${esc(PRICES[k].label)}${k === pr ? ' <span class="ad-tag ad-t-strong">在用</span>' : ''}</th><td class="ad-r ad-num">${PRICES[k].in}</td><td class="ad-r ad-num">${PRICES[k].cached}</td><td class="ad-r ad-num">${PRICES[k].out}</td></tr>`).join('')}</tbody></table></div>
        <p class="ad-note">gpt-4o-mini 是 OpenAI 官方价；DeepSeek V4-Flash 是第三方报价，没在官方页面核实。</p>
      </section>
    </div>`;
  }

  /* ================================================================== */
  /* 事件                                                                */
  /* ================================================================== */

  function onClick(e) {
    const b = e.target.closest('[data-act]');
    if (!b || !root.contains(b)) return;
    const act = b.dataset.act;
    if (act === 'tab') return show(b.dataset.tab);
    if (act === 'rt') { ui.rt = b.dataset.rt; ui.stale.runtime = true; return show('runtime', ui.rt); }
    if (act === 'wd') { ui.wd = b.dataset.wd; ui.stale.world = true; return show('world', ui.wd); }
    if (act === 'cf') { ui.callFilter = b.dataset.cf; ui.stale.runtime = true; return render(true); }
    if (act === 'logsrc') { ui.logSrc = b.dataset.v; ui.logKind = 'all'; ui.stale.runtime = true; return render(true); }
    if (act === 'logkind') { ui.logKind = b.dataset.v; ui.stale.runtime = true; return render(true); }
    if (act === 'call') return toggleCall(b);
    if (act === 'today') { panels.runtime.querySelector('.ad-day.is-today')?.scrollIntoView({ block: 'start', behavior: 'smooth' }); return; }
    if (act === 'price' || act === 'tier') {
      try { app.setSetting?.(act, b.dataset.v); } catch { /* 忽略 */ }
      if (app.settings && app.settings[act] !== b.dataset.v) { try { app.settings[act] = b.dataset.v; } catch { /* 只读也没关系 */ } }
      for (const k in ui.stale) ui.stale[k] = true;
      ui.callSig = '';
      return render(true);
    }
    if (act === 'save') { ui.confirm = null; return void saveDraft(); }
    if (act === 'restart') { ui.confirm = 'restart'; return refreshDraftBar(); }
    if (act === 'reset') { ui.confirm = 'reset'; return refreshDraftBar(); }
    if (act === 'confirm-no') { ui.confirm = null; return refreshDraftBar(); }
    if (act === 'restart-yes') return void restartWithDraft();
    if (act === 'reset-yes') { ui.confirm = null; ui.draft = emptyDraft(); ui.draftMsg = '草稿已清空，保存后生效'; ui.stale.world = true; return render(true); }
    if (act === 'castreset') { delete ui.draft.cast[b.dataset.key]; ui.stale.world = true; return render(true); }
    if (act === 'pbreset') { delete ui.draft.policy.promptBlock; ui.stale.world = true; return render(true); }
    if (act === 'write') return void runWriter();
    if (act === 'addcard') {
      if (ui.writer.card) ui.draft.extraCast.push(deep(ui.writer.card));
      ui.writer.card = null; ui.writer.brief = ''; ui.draftMsg = '新人物已加进草稿，保存后用草稿重开才会出现';
      ui.stale.world = true; return render(true);
    }
    if (act === 'dropcard') { ui.writer.card = null; ui.stale.world = true; return render(true); }
    if (act === 'rmextra') { ui.draft.extraCast.splice(Number(b.dataset.i), 1); ui.stale.world = true; return render(true); }
  }
  function toggleCall(b) {
    const id = b.dataset.id;
    const item = b.closest('.ad-call');
    const c = calls().find((x) => x.id === id);
    if (!item || !c) return;
    if (ui.open.has(id)) {
      ui.open.delete(id);
      item.querySelector('.ad-call-detail')?.remove();
      b.setAttribute('aria-expanded', 'false');
    } else {
      ui.open.add(id);
      item.insertAdjacentHTML('beforeend', `<div class="ad-call-detail">${callDetailHTML(c)}</div>`);
      b.setAttribute('aria-expanded', 'true');
    }
  }
  function onInput(e) {
    const t = e.target;
    const act = t.dataset?.act;
    if (act === 'castfield') return onCastField(t);
    if (act === 'dirnum') return onDirNum(t);
    if (act === 'quiet') return onQuiet(t);
    if (act === 'promptblock') return onPromptBlock(t);
    if (act === 'brief') { ui.writer.brief = t.value; return; }
  }
  function onChange(e) {
    const t = e.target;
    if (t.dataset?.act === 'onlyfb') { ui.onlyFallback = t.checked; ui.stale.runtime = true; render(true); }
  }
  function onKey(e) {
    const t = e.target;
    if (t.dataset?.act === 'brief' && e.key === 'Enter' && !e.isComposing) { e.preventDefault(); return void runWriter(); }
    if (t.getAttribute?.('role') !== 'tab') return;
    const i = TABS.findIndex((x) => x.key === t.dataset.tab);
    let j = null;
    if (e.key === 'ArrowRight') j = (i + 1) % TABS.length;
    else if (e.key === 'ArrowLeft') j = (i - 1 + TABS.length) % TABS.length;
    else if (e.key === 'Home') j = 0;
    else if (e.key === 'End') j = TABS.length - 1;
    if (j === null) return;
    e.preventDefault();
    show(TABS[j].key);
    el.querySelector(`#ad-tab-${TABS[j].key}`)?.focus();
  }
  root.addEventListener('click', onClick);
  root.addEventListener('input', onInput);
  root.addEventListener('change', onChange);
  root.addEventListener('keydown', onKey);
  // toggle 不冒泡，用捕获记下哪些折叠块是开着的
  root.addEventListener('toggle', (e) => {
    const d = e.target;
    if (d?.dataset?.dk) { if (d.open) ui.openD.add(d.dataset.dk); else ui.openD.delete(d.dataset.dk); }
  }, true);

  const offs = [];
  if (typeof app.on === 'function') {
    for (const evt of ['change', 'calls']) { try { const off = app.on(evt, schedule); if (typeof off === 'function') offs.push(off); } catch { /* 忽略 */ } }
  }

  /* ---------- 开始 ---------- */
  loadDraft();
  const h = parseHash(typeof location !== 'undefined' ? location.hash : '');
  if (h) show(h.tab, h.sub, { fromHash: true });
  else show(TABS.some((t) => t.key === opts.tab) ? opts.tab : 'arch', opts.sub, { fromHash: true });

  return {
    show: (tab, sub) => show(tab, sub),
    refresh: () => { for (const k in ui.stale) ui.stale[k] = true; render(true); },
    destroy: () => {
      ui.destroyed = true;
      window.removeEventListener('hashchange', onHash);
      offs.forEach((f) => { try { f(); } catch { /* 忽略 */ } });
      clearTimeout(ui.timer);
      el.innerHTML = '';
    },
  };
}

/* ================================================================== */
/* 架构页的模块对照表（改写自之前成本页的“对现有代码的改动”）           */
/* ================================================================== */

const PILL = { 保留: 'ad-p-keep', 改造: 'ad-p-change', 新建: 'ad-p-new' };
// [现有模块, 现在（可含 <span class="ad-mono">）, 本原型里, 文件, 处理]
const MODULE_MAP = [
  ['命令 / 回执 / 事件日志', '每次世界改动都要有成功命令和回执，进度只认已提交的记录', '原样作为世界内核：状态只由节点结果的效果改，每次变化写进内核记录', 'kernel.js', '保留'],
  ['导演选题', '<span class="ad-mono">turn-planner.ts</span> 的 <span class="ad-mono">chooseStoryOpportunity</span>：服务端筛出候选后，再调一次模型挑事件和演员', '代码规则 D1–D6：必发优先、危机只来自碰撞、每天最多一个危机、安静时段、主动消息配额；每个决定写导演日志', 'director.js', '改造'],
  ['人物回话', '<span class="ad-mono">propose</span>、群聊、现场人物回合各写一套；每加一个功能就往提示词里接一段规则', '统一成一个人物 Agent：只输出台词（最多 3 行），不判断进度；固定部分放前面以便缓存', 'agents.js · speak', '改造'],
  ['事件目标判定', '<span class="ad-mono">eventGoalAssessments</span> 和台词在同一次调用里输出，一个字段坏掉整条回复作废', '独立的裁判 Agent：只回 JSON、每项引原话，对不上就作废；命中作者台词就不再叫人物', 'agents.js · judge', '新建'],
  ['人物记忆', '知情事实、看法、现场原话记忆分散在多处，每次临时拼', '记忆 Agent 每个故事日批量写一张记忆卡（≤120 字），人物 prompt 只带这张卡和最近 12 条', 'agents.js · consolidate', '改造'],
  ['谁知道什么', '知情事实分散在多处，每次临时拼进提示词', '内核记录每条事实谁知道、怎么知道的；人物 prompt 只放她知道的，后台每次调用做隐私检查', 'kernel.js · agents.js', '改造'],
  ['人物目标', '带目标状态的版本已写好但没接线（DIRECTOR-PROGRESS-01 仍在进行中）', '目标和关系阶段存在人物卡里；主动消息只给她自己的目标和阶段含义，由导演 D6 决定什么时候发', 'director.js · planProactive', '改造'],
  ['时钟', '浏览时 12 倍速，空闲 75 秒检查一次，离线冻结', '架空时间：只在玩家点「过一会儿」时跳到下一件事；离线什么都不发生，成本只跟玩家发的消息走', 'kernel.js · nextStop / jump', '改造'],
  ['输出上限', '模型默认最多输出 4,096 token', '人物最多 3 行、每行不超过 80 字，逐行过词表', 'agents.js · filterLines', '改造'],
  ['编剧 / 原稿导入', '作者工具和原稿解析已上线', '后台的编剧 Agent：一句简介生成人设卡，进草稿；世界包仍由 lint 把关', 'agents.js · writePersona', '保留'],
  ['内容边界', '危机词检测加提示词约束', '自伤代码层直接拦；越界输入走固定回复；模型台词逐行过词表', 'kernel.js · agents.js', '新建'],
  ['图片和视频', '朋友圈、私密图片、场景图已支持上传和展示', '本原型不生成图片：私密图片只以锁定占位存在，不能打开、保存、转发', 'phone.js', '新建'],
];
