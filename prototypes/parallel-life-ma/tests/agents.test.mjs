// agents.js 单元测试：node tests/agents.test.mjs（退出码非 0 即失败）
import assert from 'node:assert/strict';
import { WORLD } from '../world.js';
import { EXTRAS } from '../world-extras.js';
import {
  createAgents, buildCharacterPrompt, buildJudgePrompt, buildMemoryPrompt, buildWriterPrompt,
  validateJudgement, filterLines, estimateTokens, costCNY, PRICES, knowledgeOf, checkPrivacy, fallbackJudge, bigramSim,
} from '../agents.js';

const pkg = WORLD;
const clone = (x) => structuredClone(x);

/* ---------------- 小测试框架 ---------------- */
const tests = [];
const test = (name, fn) => tests.push({ name, fn });

/* ---------------- 测试用状态：苏蔓深夜之后 ---------------- */
const D = (day, hh, mm) => day * 1440 + hh * 60 + mm;
let mid = 0;
const msg = (at, from, text, kind = 'text', src = 'authored', node) => ({ id: 'm' + ++mid, at, from, text, kind, src, ...(node ? { node } : {}) });
const thread = (id, kind, title, w, node, msgs) => ({ id, kind, title, with: w, node, closed: false, msgs, unread: 0, lastAt: msgs.at(-1)?.at ?? 0 });

const CAL_NOTICE = '日历冲突：周三 19:00 许家家宴 × 19:30 梁宅私宴';
const PAY_NOTICE = '提示：收款方“临州澄远信息咨询有限公司”与她说的“金穗汇”名称不一致。';

function smNightState() {
  const knows = {};
  const learn = (who, fact, via) => { ((knows[who] ??= {})[fact] ??= []).includes(via) || knows[who][fact].push(via); };
  for (const f of pkg.facts) for (const k of f.knownBy) learn(k, f.key, 'saw');
  // sm.photo_night onStart：玩家和苏蔓都看到了那晚那条
  learn('player', 'f.sm_night', 'saw');
  learn('sm', 'f.sm_night', 'saw');
  // 平板危机：知夏看到了弹窗
  learn('xzx', 'f.tablet_popup', 'saw');
  // 单身夜玩家告诉了陈骁 Vivi 的事；知夏从别人那里听说了私宴
  learn('cx', 'f.vv', 'told');
  learn('xzx', 'f.lyy', 'heard');

  const filler = Array.from({ length: 20 }, (_, i) => msg(D(7, 20, i), i % 2 ? 'player' : 'cx', `填充消息#${String(i + 1).padStart(2, '0')}`, 'text', i % 2 ? 'player' : 'agent'));
  const tablet = pkg.nodes.find((n) => n.key === 'crisis.tablet');
  const photo = pkg.nodes.find((n) => n.key === 'sm.photo_night');
  const threads = {
    feed: thread('feed', 'feed', '此刻', null, null, [msg(D(0, 21, 30), 'narrator', '九点半。你刚进家门，知夏坐在客厅地毯上排座位表，平板立在茶几上。', 'notice')]),
    sm: thread('sm', 'chat', '苏蔓', 'sm', null, [
      msg(D(1, 19, 40), 'sm', 'Danny哥，栖澜第 17 页我又抠了一版，你看看？'),
      msg(D(7, 23, 5), 'sm', 'Danny哥，明天下午周总要主管名单了。', 'text', 'authored', 'sm.photo_night'),
      msg(D(7, 23, 7), 'sm', '我想了一晚上。', 'text', 'authored', 'sm.photo_night'),
      msg(D(7, 23, 12), 'sm', '[私密图片 · 不展示]', 'image_locked', 'authored', 'sm.photo_night'),
      msg(D(7, 23, 12), 'sm', '我知道不该发。只给你一个人看。', 'text', 'authored', 'sm.photo_night'),
      msg(D(7, 23, 14), 'system', '苏蔓撤回了一条消息', 'recall', 'authored', 'sm.photo_night'),
      msg(D(7, 23, 15), 'sm', '……我是不是疯了。', 'text', 'authored', 'sm.photo_night'),
      msg(D(7, 23, 16), 'player', '你还好吗', 'text', 'player'),
    ]),
    lyy: thread('lyy', 'chat', '梁韵仪', 'lyy', null, [
      msg(D(0, 21, 40), 'lyy', '周三提案完，来家里吃个便饭。人不多，你一个人来。', 'text', 'authored', 'lyy.dinner_invite'),
      msg(D(0, 21, 40), 'system', CAL_NOTICE, 'notice', 'authored', 'lyy.dinner_invite'),
      msg(D(0, 21, 50), 'player', '好的梁总，我看看时间', 'text', 'player'),
    ]),
    vv: thread('vv', 'chat', 'Vivi（林薇薇）', 'vv', null, [
      msg(D(6, 20, 0), 'vv', '又不回我？', 'text', 'authored', 'vv.big_window'),
      msg(D(6, 20, 3), 'system', PAY_NOTICE, 'notice', 'authored', 'vv.big_window'),
      msg(D(6, 20, 5), 'player', '在忙', 'text', 'player'),
    ]),
    xzx: thread('xzx', 'chat', '许知夏', 'xzx', null, [
      msg(D(1, 12, 0), 'xzx', '你那个号还在平板上登着，我拿来排座位了哈～', 'text', 'authored', 'xzx.guestlist'),
      msg(D(1, 12, 10), 'player', '好', 'text', 'player'),
    ]),
    'scene:crisis.tablet': thread('scene:crisis.tablet', 'scene', tablet.title, 'xzx', 'crisis.tablet', [
      msg(D(7, 23, 12), 'narrator', '客厅。知夏坐在地毯上排座位表。你的手机和茶几上的平板同时亮了一下，又亮了一下。', 'notice', 'authored', 'crisis.tablet'),
      msg(D(7, 23, 12), 'system', '苏蔓：[图片]', 'notice', 'authored', 'crisis.tablet'),
      msg(D(7, 23, 13), 'narrator', '她把屏幕转向你，然后不说话了。', 'notice', 'authored', 'crisis.tablet'),
      msg(D(7, 23, 17), 'player', '工作上的事，别多想', 'text', 'player'),
    ]),
    cx: thread('cx', 'chat', '陈骁', 'cx', null, filler),
  };
  return {
    v: 1, seq: mid, now: D(7, 23, 16),
    vars: Object.fromEntries(pkg.vars.map((v) => [v.key, clone(v.default)])),
    stages: { xzx: 'verifying', sm: 'ambiguous', vv: 'hooked', lyy: 'tested', cx: 'best_man' },
    knows,
    ran: { open: true, 'sm.photo_night': true, 'crisis.tablet': true }, outcome: { open: 'opened' }, fired: {}, crises: [D(7, 23, 12)],
    open: [
      { node: 'sm.photo_night', thread: 'sm', owner: 'sm', openAt: D(7, 23, 15), deadline: D(7, 23, 45), intents: photo.decision.intents },
      { node: 'crisis.tablet', thread: 'scene:crisis.tablet', owner: 'xzx', openAt: D(7, 23, 13), deadline: D(7, 23, 28), intents: tablet.decision.intents },
    ],
    threads, order: ['sm', 'scene:crisis.tablet', 'cx', 'vv', 'xzx', 'lyy'],
    halted: null, ended: null, proactive: {},
    memory: { sm: { card: '我今晚给他发了那晚那条。他还没回。', day: 7 }, xzx: { card: '座位表第六版已经发他了。', day: 6 } },
    directorLog: [], kernelLog: [],
  };
}

/* ---------------- 假 sample ---------------- */
function fakeSample({ text = 'hi', json = {}, fail = null } = {}) {
  const calls = [];
  const fn = async (input, opts) => {
    calls.push({ kind: 'text', input, opts });
    if (fail) throw fail;
    return { text: typeof text === 'function' ? text(input) : text, truncated: false, modelTierApplied: opts?.modelTier || 'default' };
  };
  fn.json = async (input, opts) => {
    calls.push({ kind: 'json', input, opts });
    if (fail) throw fail;
    return typeof json === 'function' ? json(input) : clone(json);
  };
  fn.calls = calls;
  return fn;
}
function mkAgents(sample, settings = { tier: 'quick' }) {
  const logs = [];
  const agents = createAgents({ getSample: async () => sample, log: (e) => logs.push(e), getSettings: () => settings, extras: EXTRAS });
  return { agents, logs };
}

const personOf = (k) => pkg.cast.find((c) => c.key === k) || pkg.supporting.find((c) => c.key === k);
const ALL = [...pkg.cast, ...pkg.supporting].map((c) => c.key);
const outcomeFor = (char) => {
  for (const n of pkg.nodes) if (n.owner === char) { const o = n.outcomes.find((x) => Array.isArray(x.on)); if (o) return o; }
  return { key: 'ok', label: '接受' };
};

/* ================================================================ */
/* 1 人物 prompt 的隐私                                              */
/* ================================================================ */

test('人物 prompt：逐个人物、逐条事实的隐私检查（苏蔓深夜之后）', () => {
  const st = smNightState();
  const block = pkg.policy.promptBlock;
  let checked = 0;
  for (const char of ALL) {
    const p = personOf(char);
    const known = knowledgeOf(pkg, st, char);
    const knownKeys = new Set(known.map((f) => f.fact));
    const threadIds = [char, ...Object.values(st.threads).filter((t) => t.kind === 'scene' && t.with === char).map((t) => t.id)];
    for (const threadId of threadIds) for (const trigger of ['player', 'outcome', 'proactive']) {
      const args = { char, threadId, trigger, outcome: trigger === 'outcome' ? outcomeFor(char) : undefined, brief: trigger === 'proactive' ? '想确认他今晚有没有空。' : undefined };
      const { text, prefixText } = buildCharacterPrompt(pkg, st, args);
      const where = `${char}/${threadId}/${trigger}`;
      assert.ok(text.startsWith(`【人物 Agent · ${p.name}】`), where + ' 开头');
      assert.ok(text.startsWith(prefixText), where + ' prefixText 是前缀');
      if (pkg.cast.some((c) => c.key === char)) assert.ok(text.slice(prefixText.length).startsWith('【你和他现在】'), where + ' 前缀止于【你和他现在】');
      assert.ok(text.includes(block), where + ' 含 promptBlock');
      assert.ok(text.includes(pkg.world.tone), where + ' 含世界基调');
      // 节点 setup / decision.prompt / outcome.result 一律不出现
      for (const n of pkg.nodes) {
        assert.ok(!text.includes(n.setup), `${where} 含了 ${n.key}.setup`);
        if (n.decision) assert.ok(!text.includes(n.decision.prompt), `${where} 含了 ${n.key}.decision.prompt`);
        for (const o of n.outcomes) assert.ok(!text.includes(o.result), `${where} 含了 ${n.key}/${o.key}.result「${o.result}」`);
      }
      // 她知道的每一条都在；她不知道的一条都不在
      for (const f of pkg.facts) {
        if (knownKeys.has(f.key)) assert.ok(text.includes(f.text), `${where} 缺了她知道的 ${f.key}`);
        else assert.ok(!text.includes(f.text), `${where} 含了她不知道的 ${f.key}`);
      }
      // 别的人物的动机、目标、背景、规则、秘密
      for (const o of pkg.cast) {
        if (o.key === char) continue;
        assert.ok(!text.includes(o.motive.deep), `${where} 含了 ${o.key}.motive.deep`);
        assert.ok(!text.includes(o.goal), `${where} 含了 ${o.key}.goal`);
        assert.ok(!text.includes(o.background), `${where} 含了 ${o.key}.background`);
        for (const r of o.rules) assert.ok(!text.includes(r), `${where} 含了 ${o.key} 的规则「${r}」`);
        for (const s of o.secrets) if (!knownKeys.has(s)) assert.ok(!text.includes(pkg.facts.find((f) => f.key === s).text), `${where} 含了 ${o.key} 的秘密 ${s}`);
      }
      for (const o of pkg.supporting) if (o.key !== char) assert.ok(!text.includes(o.note), `${where} 含了 ${o.key}.note`);
      // 日志用的隐私检查
      const pv = checkPrivacy(pkg, st, char, text);
      assert.equal(pv.ok, true, where + ' privacy.ok');
      assert.deepEqual(new Set(pv.facts), knownKeys, where + ' privacy.facts = 她知道的事实');
      checked++;
    }
  }
  assert.ok(checked >= ALL.length * 3);
});

test('人物 prompt：私聊里玩家手机上的通知不给对方；撤回/图片占位/现场旁白照给', () => {
  const st = smNightState();
  const lyy = buildCharacterPrompt(pkg, st, { char: 'lyy', threadId: 'lyy', trigger: 'player' }).text;
  assert.ok(!lyy.includes(CAL_NOTICE), '梁看不到 Danny 的日历冲突');
  assert.ok(lyy.includes('Danny：好的梁总，我看看时间'));
  const vv = buildCharacterPrompt(pkg, st, { char: 'vv', threadId: 'vv', trigger: 'player' }).text;
  assert.ok(!vv.includes(PAY_NOTICE), 'Vivi 看不到付款页的红旗提示');
  const sm = buildCharacterPrompt(pkg, st, { char: 'sm', threadId: 'sm', trigger: 'player' }).text;
  assert.ok(sm.includes('苏蔓：[私密图片 · 不展示]'), '图片只以占位出现');
  assert.ok(sm.includes('（旁白）：苏蔓撤回了一条消息'), '自己撤回的提示保留');
  assert.ok(sm.includes('Danny：你还好吗'));
  assert.ok(sm.includes('我今晚给他发了那晚那条'), '含记忆卡');
  assert.ok(sm.includes('他还没正面回应'), '有待回答事件时提示追问');
  assert.ok(sm.includes('图片只以“[私密图片 · 不展示]”出现'), '含本节点 guard');
  const scene = buildCharacterPrompt(pkg, st, { char: 'xzx', threadId: 'scene:crisis.tablet', trigger: 'player' }).text;
  assert.ok(scene.includes('（旁白）：她把屏幕转向你，然后不说话了。'), '现场旁白照给');
  assert.ok(scene.includes('现场：'), '现场说明');
  const xzxChat = buildCharacterPrompt(pkg, st, { char: 'xzx', threadId: 'xzx', trigger: 'player' }).text;
  assert.ok(!xzxChat.includes('她把屏幕转向你'), '私聊里没有别的线程的消息');
});

test('人物 prompt：最近对话只取 12 条、事实注明来源、各段顺序', () => {
  const st = smNightState();
  const { text } = buildCharacterPrompt(pkg, st, { char: 'cx', threadId: 'cx', trigger: 'player' });
  assert.ok(!text.includes('填充消息#08'));
  for (let i = 9; i <= 20; i++) assert.ok(text.includes(`填充消息#${String(i).padStart(2, '0')}`), '缺第 ' + i + ' 条');
  assert.ok(text.includes('他告诉你：' + pkg.facts.find((f) => f.key === 'f.vv').text), 'told → 他告诉你');
  const x = buildCharacterPrompt(pkg, st, { char: 'xzx', threadId: 'xzx', trigger: 'player' }).text;
  assert.ok(x.includes('听别人说：' + pkg.facts.find((f) => f.key === 'f.lyy').text), 'heard → 听别人说');
  assert.ok(x.includes('亲眼看到：' + pkg.facts.find((f) => f.key === 'f.tablet_popup').text), 'saw → 亲眼看到');
  const order = ['【人物 Agent', '【内容边界】', '【世界基调】', '【你是谁】', '【说话方式】', '【动机】', '【你和他现在】', '【你必须】', '【你绝不】', '【你知道的事】', '【你记得的】', '【此刻】', '【最近的对话】'];
  let last = -1;
  for (const h of order) { const i = x.indexOf(h); assert.ok(i > last, '段落顺序：' + h); last = i; }
  assert.ok(x.includes('11月16日 周一 23:'), '此刻有时间标签');
  const o = buildCharacterPrompt(pkg, st, { char: 'sm', threadId: 'sm', trigger: 'outcome', outcome: pkg.nodes.find((n) => n.key === 'sm.photo_night').outcomes[1] }).text;
  assert.ok(o.includes('你对他这句话的态度是「划清界限」'));
  const pr = buildCharacterPrompt(pkg, st, { char: 'vv', threadId: 'vv', trigger: 'proactive', brief: '导演给的一句话' }).text;
  assert.ok(pr.includes('导演提示：导演给的一句话'));
  // 配角用 note 当人设
  const zz = buildCharacterPrompt(pkg, st, { char: 'zz', threadId: 'zz', trigger: 'player' }).text;
  assert.ok(zz.includes(personOf('zz').note));
});

/* ================================================================ */
/* 2 裁判                                                           */
/* ================================================================ */

const photoNode = pkg.nodes.find((n) => n.key === 'sm.photo_night');
const smRoute = (extra = {}) => ({
  thread: 'sm', char: 'sm',
  decision: { node: 'sm.photo_night', thread: 'sm', owner: 'sm', intents: photoNode.decision.intents },
  boundaries: pkg.policy.boundaryInputs.filter((b) => b.key !== 'bi.selfharm' && (!b.with || b.with.includes('sm'))).map((b) => ({ key: b.key, input: b.input })),
  tellable: [], needsJudge: true, ...extra,
});

test('裁判 prompt：给原话、最近 4 条上下文、意图全部例句、越界列表；可坦白事实只在非空时出现', () => {
  const st = smNightState();
  const text = '你还好吗';
  const p = buildJudgePrompt(pkg, st, smRoute(), text);
  assert.ok(p.startsWith('【裁判 Agent】'));
  assert.ok(p.includes('「你还好吗」'));
  for (const i of photoNode.decision.intents) { assert.ok(p.includes(i.key) && p.includes(i.label)); for (const e of i.examples) assert.ok(p.includes(e)); }
  assert.ok(p.includes('bi.ask_image') && p.includes('bi.advance_sm'));
  assert.ok(!p.includes('C 可坦白'));
  // 上下文：玩家这句之前的 4 条
  assert.ok(p.includes('……我是不是疯了。') && p.includes('苏蔓撤回了一条消息'));
  assert.ok(!p.includes('我想了一晚上。'), '只给最近 4 条');
  const f = pkg.facts.find((x) => x.key === 'f.sm');
  const p2 = buildJudgePrompt(pkg, st, { thread: 'xzx', char: 'xzx', decision: null, boundaries: [], tellable: [{ fact: 'f.sm', label: '你和苏蔓之间越界的事', text: f.text }] }, '其实那天是苏蔓送我回来的');
  assert.ok(p2.includes('C 可坦白') && p2.includes(f.text));
  assert.ok(p2.includes('"intentQuote"') && p2.includes('"told"'));
});

test('validateJudgement：引文是原话连续子串（忽略首尾空白和标点），key 必须在列表里', () => {
  const r = smRoute({ tellable: [{ fact: 'f.sm', label: 'x', text: 'y' }] });
  const text = '这不合适。我不会看，也请你别再发。明天按工作关系谈。';
  // 首尾标点、空白、引号都忽略
  assert.deepEqual(validateJudgement(r, text, { intent: 'firm_boundary', intentQuote: ' 「这不合适。」 ', boundary: null, told: [] }), { intent: 'firm_boundary', boundary: null, told: [] });
  assert.equal(validateJudgement(r, text, { intent: 'firm_boundary', intentQuote: '“我不会看，也请你别再发”' }).intent, 'firm_boundary');
  // 不是连续子串 / 改了字 / 空引文 / 没引文 → 丢
  assert.equal(validateJudgement(r, text, { intent: 'firm_boundary', intentQuote: '这不合适，明天按工作关系谈' }).intent, null);
  assert.equal(validateJudgement(r, text, { intent: 'firm_boundary', intentQuote: '这样不合适' }).intent, null);
  assert.equal(validateJudgement(r, text, { intent: 'firm_boundary', intentQuote: '。。' }).intent, null);
  assert.equal(validateJudgement(r, text, { intent: 'firm_boundary' }).intent, null);
  // 非法 key 丢弃
  assert.equal(validateJudgement(r, text, { intent: 'go_family', intentQuote: '这不合适' }).intent, null);
  assert.equal(validateJudgement(r, text, { boundary: 'bi.advance_lyy', boundaryQuote: '这不合适' }).boundary, null);
  assert.deepEqual(validateJudgement(r, text, { told: [{ fact: 'f.vv', quote: '这不合适' }, { fact: 'f.sm', quote: '我不会看' }, { fact: 'f.sm', quote: '不存在的话' }] }).told, ['f.sm']);
  // 越界命中时不归类成意图
  const t2 = '早点睡。再发一张给我看看';
  assert.deepEqual(validateJudgement(r, t2, { intent: 'soft_dodge', intentQuote: '早点睡', boundary: 'bi.ask_image', boundaryQuote: '再发一张给我看看', told: [] }), { intent: null, boundary: 'bi.ask_image', told: [] });
  // 垃圾输入
  for (const raw of [null, undefined, 'x', [], 42]) assert.deepEqual(validateJudgement(r, text, raw), { intent: null, boundary: null, told: [] });
});

test('兜底裁判：每个节点每个意图的第一条例句都判回该意图（含真实越界列表和关键词）', () => {
  let n = 0;
  for (const node of pkg.nodes) {
    if (!node.decision) continue;
    const bis = pkg.policy.boundaryInputs.filter((b) => b.key !== 'bi.selfharm' && (!b.nodes || b.nodes.includes(node.key)) && (!b.with || b.with.includes(node.owner))).map((b) => ({ key: b.key, input: b.input }));
    for (const boundaries of [[], bis]) {
      const route = { thread: node.owner, char: node.owner, decision: { node: node.key, intents: node.decision.intents }, boundaries, tellable: [] };
      for (const i of node.decision.intents) {
        const j = fallbackJudge(pkg, route, i.examples[0], EXTRAS);
        assert.equal(j.intent, i.key, `${node.key}「${i.examples[0]}」判成了 ${j.intent}`);
        assert.equal(j.boundary, null, `${node.key}「${i.examples[0]}」被当成越界 ${j.boundary}`);
        n++;
      }
    }
  }
  assert.ok(n > 50);
});

test('兜底裁判：越界关键词、坦白关键词（≥2 个且至少一个是这条独有的）、阈值', () => {
  const r = smRoute();
  assert.equal(fallbackJudge(pkg, r, '那张照片能再发一次吗', EXTRAS).boundary, 'bi.ask_image');
  assert.equal(fallbackJudge(pkg, r, '那张照片能再发一次吗', EXTRAS).intent, null);
  assert.equal(fallbackJudge(pkg, r, '今天天气不错', EXTRAS).intent, null, '相似度 < 0.2 不判');
  assert.equal(fallbackJudge(pkg, r, '别想太多了，早点睡吧', EXTRAS).intent, 'soft_dodge', '近似例句');
  const tellable = EXTRAS.tellable.map((t) => ({ fact: t.fact, label: t.label, text: pkg.facts.find((f) => f.key === t.fact).text }));
  const xr = { thread: 'xzx', char: 'xzx', decision: null, boundaries: [], tellable };
  assert.deepEqual(fallbackJudge(pkg, xr, '10 月 18 号那晚，是苏蔓开车送我回来的。', EXTRAS).told, ['f.sm']);
  assert.deepEqual(fallbackJudge(pkg, xr, '我在遇屿上跟一个女的聊过，可能被骗了。', EXTRAS).told, ['f.vv']);
  assert.deepEqual(fallbackJudge(pkg, xr, '我承认，我没跟你说实话', EXTRAS).told, [], '只有通用词不算坦白');
  assert.deepEqual(fallbackJudge(pkg, xr, '苏蔓', EXTRAS).told, [], '一个词不算');
  assert.ok(bigramSim('……', '……') === 1 && bigramSim('苏蔓。', '苏蔓') === 1);
});

/* ================================================================ */
/* 3 过滤                                                           */
/* ================================================================ */

test('filterLines：词表命中删行、删空用兜底（轮换）、exclude 不误删、最多 3 行、每行 ≤80 字', () => {
  const sm = personOf('sm');
  let r = filterLines(pkg, 'sm', ['好的邓总', '我们去开房吧', '我想裸辞了']);
  assert.deepEqual(r.lines, ['好的邓总', '我想裸辞了']);
  assert.deepEqual(r.dropped, ['我们去开房吧']);
  assert.equal(r.fallback, false);
  r = filterLines(pkg, 'sm', ['加我 Telegram', 'WWW.x.com 看看']);
  assert.deepEqual(r.lines, [sm.fallbackLines[0]]);
  assert.equal(r.dropped.length, 2, '大小写不敏感');
  assert.equal(r.fallback, true);
  assert.deepEqual(filterLines(pkg, 'sm', ['做爱'], 1).lines, [sm.fallbackLines[1]], '按次数轮换');
  assert.deepEqual(filterLines(pkg, 'sm', [], 4).lines, [sm.fallbackLines[4 % sm.fallbackLines.length]], '空输入也用兜底');
  assert.deepEqual(filterLines(pkg, 'sm', ['开 房']).dropped, ['开 房'], '中间加空格也拦');
  assert.equal(filterLines(pkg, 'sm', ['一', '二', '三', '四', '五']).lines.length, 3);
  assert.equal([...filterLines(pkg, 'sm', ['长'.repeat(120)]).lines[0]].length, 80);
  // exclude 先剔除再匹配：block 含“裸”时“裸辞”不误删
  const p2 = clone(pkg); p2.policy.lexicon.block.push('裸');
  r = filterLines(p2, 'sm', ['我想裸辞', '裸着']);
  assert.deepEqual(r.lines, ['我想裸辞']);
  assert.deepEqual(r.dropped, ['裸着']);
  // 配角没有兜底台词：跳过这一拍
  assert.deepEqual(filterLines(pkg, 'zz', ['过夜']).lines, []);
});

/* ================================================================ */
/* 4 计费                                                           */
/* ================================================================ */

test('estimateTokens / costCNY 数值', () => {
  assert.equal(estimateTokens(''), 0);
  assert.equal(estimateTokens('你好'), 2);                 // 1.6
  assert.equal(estimateTokens('abcd'), 1);                 // 1.05
  assert.equal(estimateTokens('你好abcd'), 3);             // 2.65
  assert.equal(estimateTokens('十个汉字十个汉字十个'), 8);
  assert.equal(estimateTokens('x'.repeat(38)), 10);
  assert.equal(estimateTokens('，。～'), 2);               // 全角标点按中日韩算：2.4
  assert.equal(estimateTokens('汉'.repeat(1000) + 'a'.repeat(380)), 900);
  const near = (a, b) => assert.ok(Math.abs(a - b) < 1e-9, `${a} ≈ ${b}`);
  near(costCNY(1e6, 0, 0, PRICES.mini), 0.15 * 7.2);
  near(costCNY(1e6, 5e5, 1e6, PRICES.mini), (0.075 + 0.0375 + 0.6) * 7.2);
  near(costCNY(1e6, 5e5, 1e6, PRICES.flash), (0.07 + 0.0014 + 0.28) * 7.2);
  near(costCNY(1200, 1000, 60, PRICES.mini), (200 * 0.15 + 1000 * 0.075 + 60 * 0.6) / 1e6 * 7.2);
  near(costCNY(0, 0, 0, PRICES.flash), 0);
  assert.equal(PRICES.fx, 7.2);
  assert.equal(PRICES.mini.label, 'gpt-4o-mini');
});

test('缓存估算：同一人物前缀完全相同且 ≥1024 token 时第二次 cachedTok = 前缀 token', async () => {
  const st = smNightState();
  const sample = fakeSample({ text: '嗯。' });
  const { agents, logs } = mkAgents(sample);
  const prefixTok = estimateTokens(buildCharacterPrompt(pkg, st, { char: 'sm', threadId: 'sm', trigger: 'player' }).prefixText);
  assert.ok(prefixTok >= 1024, '主要人物的静态前缀应 ≥1024 token，实际 ' + prefixTok);
  await agents.speak(pkg, st, { char: 'sm', threadId: 'sm', trigger: 'player' });
  await agents.speak(pkg, st, { char: 'sm', threadId: 'sm', trigger: 'proactive', brief: 'x' });
  await agents.speak(pkg, st, { char: 'xzx', threadId: 'xzx', trigger: 'player' });
  assert.equal(logs[0].cachedTok, 0, '第一次没缓存');
  assert.equal(logs[1].cachedTok, prefixTok, '第二次同人物命中');
  assert.equal(logs[2].cachedTok, 0, '换人物不命中');
  near2(logs[1].cost.mini, costCNY(logs[1].inTok, prefixTok, logs[1].outTok, PRICES.mini));
  // 前缀变了（人设改了）→ 不命中
  const p2 = clone(pkg); p2.cast.find((c) => c.key === 'sm').goal += '。';
  await agents.speak(p2, st, { char: 'sm', threadId: 'sm', trigger: 'player' });
  assert.equal(logs[3].cachedTok, 0);
  // 前缀 < 1024 token（配角）→ 永不命中
  const zzTok = estimateTokens(buildCharacterPrompt(pkg, st, { char: 'zz', threadId: 'zz', trigger: 'player' }).prefixText);
  assert.ok(zzTok < 1024);
  await agents.speak(pkg, st, { char: 'zz', threadId: 'zz', trigger: 'player' });
  await agents.speak(pkg, st, { char: 'zz', threadId: 'zz', trigger: 'player' });
  assert.equal(logs[5].cachedTok, 0);
  // 离线兜底不算一次发送：不会让下一次误判命中
  const off = mkAgents(null);
  await off.agents.speak(pkg, st, { char: 'sm', threadId: 'sm', trigger: 'player' });
  assert.equal(off.logs[0].cachedTok, 0);
  assert.equal(off.logs[0].inTok, 0);
});
const near2 = (a, b) => assert.ok(Math.abs(a - b) < 1e-12, `${a} ≈ ${b}`);

/* ================================================================ */
/* 5 调用、兜底、日志                                                */
/* ================================================================ */

test('speak：纯文本调用、cache:false、档位、去名字前缀/括号动作/引号、最多 3 行、日志字段', async () => {
  const st = smNightState();
  const sample = fakeSample({ text: '苏蔓：Danny哥～\n（叹气）我知道了\n“好的”\n\n第四行\n第五行' });
  const { agents, logs } = mkAgents(sample, { tier: 'default' });
  const r = await agents.speak(pkg, st, { char: 'sm', threadId: 'sm', trigger: 'player' });
  assert.deepEqual(r.lines, ['Danny哥～', '我知道了', '好的']);
  assert.equal(r.via, 'model');
  assert.equal(sample.calls[0].kind, 'text');
  assert.equal(sample.calls[0].opts.cache, false);
  assert.equal(sample.calls[0].opts.modelTier, 'default');
  assert.ok(sample.calls[0].input.startsWith('【人物 Agent · 苏蔓】'));
  const e = logs[0];
  for (const k of ['id', 't', 'storyAt', 'agent', 'who', 'trigger', 'tier', 'tierApplied', 'prompt', 'prefixChars', 'promptChars', 'inTok', 'cachedTok', 'output', 'outTok', 'ms', 'ok', 'via', 'cost', 'privacy']) assert.ok(k in e, '日志缺 ' + k);
  assert.equal(e.id, r.callId);
  assert.equal(e.agent, 'character');
  assert.equal(e.who, 'sm');
  assert.equal(e.trigger, 'player');
  assert.equal(e.tier, 'default');
  assert.equal(e.tierApplied, 'default');
  assert.equal(e.ok, true);
  assert.equal(e.storyAt, D(7, 23, 17));
  assert.equal(e.promptChars, e.prompt.length);
  assert.equal(e.inTok, estimateTokens(e.prompt));
  assert.equal(e.outTok, estimateTokens(e.output));
  assert.ok(e.cost.mini > 0 && e.cost.flash > 0);
  assert.equal(e.privacy.ok, true);
  assert.deepEqual(new Set(e.privacy.facts), new Set(['f.sm', 'f.sm_night']));
  // 词表命中删行；全部命中改发兜底
  const s2 = fakeSample({ text: '我们去开房吧\n好的' });
  const a2 = mkAgents(s2);
  assert.deepEqual((await a2.agents.speak(pkg, st, { char: 'sm', threadId: 'sm', trigger: 'player' })).lines, ['好的']);
  assert.deepEqual(a2.logs[0].dropped, ['我们去开房吧']);
  const s3 = fakeSample({ text: '做爱\n[私密图片 · 不展示]' });
  const a3 = mkAgents(s3);
  const r3 = await a3.agents.speak(pkg, st, { char: 'sm', threadId: 'sm', trigger: 'player' });
  assert.equal(r3.via, 'fallback');
  assert.deepEqual(r3.lines, [personOf('sm').fallbackLines[0]]);
});

const OFFLINE = ['not_granted', 'sampling_disabled', 'not_declared', 'capability_disabled', 'capability_removed'];
const ONCE = ['rate_limited', 'upstream_error', 'refused', 'invalid_json', 'empty_completion', 'prompt_too_large'];

test('错误码：离线类 → 本次会话转离线兜底（不再调用）；单次类 → 这次兜底、不重试、下次照常调用', async () => {
  const st = smNightState();
  const fbs = personOf('sm').fallbackLines;
  for (const code of OFFLINE) {
    const s = fakeSample({ fail: { code, message: code } });
    const { agents, logs } = mkAgents(s);
    const r = await agents.speak(pkg, st, { char: 'sm', threadId: 'sm', trigger: 'player' });
    assert.equal(r.via, 'fallback', code);
    assert.deepEqual(r.lines, [fbs[0]], code);
    assert.equal(agents.status(), 'offline', code);
    assert.equal(logs[0].error, code);
    assert.equal(logs[0].ok, false);
    assert.equal(logs[0].via, 'fallback');
    const j = await agents.judge(pkg, st, smRoute(), photoNode.decision.intents[0].examples[0]);
    assert.equal(j.via, 'fallback', code);
    assert.equal(j.intent, 'firm_boundary', code + ' 兜底裁判');
    const r2 = await agents.speak(pkg, st, { char: 'sm', threadId: 'sm', trigger: 'player' });
    assert.deepEqual(r2.lines, [fbs[1 % fbs.length]], code + ' 兜底台词轮换');
    assert.equal(s.calls.length, 1, code + ' 转离线后不再调用');
    assert.equal(logs.length, 3);
    assert.equal(logs[2].error, 'offline');
    assert.equal(logs[2].inTok, 0);
  }
  for (const code of ONCE) {
    const s = fakeSample({ fail: { code, message: code, text: '半截' } });
    const { agents, logs } = mkAgents(s);
    const r = await agents.speak(pkg, st, { char: 'sm', threadId: 'sm', trigger: 'player' });
    assert.equal(r.via, 'fallback', code);
    assert.equal(agents.status(), 'connected', code + ' 不转离线');
    assert.equal(s.calls.length, 1, code + ' 不重试');
    assert.equal(logs[0].error, code);
    const j = await agents.judge(pkg, st, smRoute(), '这样不行。我们只是同事，明天正常上班。');
    assert.equal(j.via, 'fallback');
    assert.equal(j.intent, 'firm_boundary');
    assert.equal(s.calls.length, 2, code + ' 下次照常调用');
    const m = await agents.consolidate(pkg, st, 7);
    assert.equal(m.via, 'fallback');
    assert.equal(m.cards.sm, st.memory.sm.card, code + ' 记忆保留旧卡');
    await assert.rejects(agents.writePersona(pkg, '一个话多的花店老板'), (e) => e.code === code, code + ' 编剧抛错');
    assert.equal(logs.length, 4);
    assert.ok(logs.every((l) => l.via === 'fallback' && l.ok === false));
  }
  // getSample 给 null / 抛错 → 离线
  for (const getSample of [async () => null, async () => { throw new Error('x'); }, undefined]) {
    const logs = [];
    const agents = createAgents({ getSample, log: (e) => logs.push(e), getSettings: () => ({}), extras: EXTRAS });
    assert.equal(agents.status(), 'unknown', '还没探到时是 unknown');
    const r = await agents.speak(pkg, st, { char: 'xzx', threadId: 'xzx', trigger: 'player' });
    assert.equal(r.via, 'fallback');
    assert.equal(agents.status(), 'offline');
    await assert.rejects(agents.writePersona(pkg, 'x'), (e) => /需要连接 Claude/.test(e.message));
  }
  // 不带 code 的异常按 upstream_error
  const s = fakeSample({ fail: new Error('boom') });
  const { agents, logs } = mkAgents(s);
  await agents.speak(pkg, st, { char: 'sm', threadId: 'sm', trigger: 'player' });
  assert.equal(logs[0].error, 'upstream_error');
  assert.equal(agents.status(), 'connected');
});

test('judge：sample.json、默认缓存、模型结果过校验、日志', async () => {
  const st = smNightState();
  const text = '这不合适。我明早会按流程跟 HR 说明，我不会保存任何东西。';
  const s = fakeSample({ json: { intent: 'report_hr', intentQuote: '我明早会按流程跟 HR 说明', boundary: 'bi.threaten', boundaryQuote: '我要转发', told: [{ fact: 'f.sm', quote: '这不合适' }] } });
  const { agents, logs } = mkAgents(s);
  const j = await agents.judge(pkg, st, smRoute(), text);
  assert.deepEqual({ intent: j.intent, boundary: j.boundary, told: j.told, via: j.via }, { intent: 'report_hr', boundary: null, told: [], via: 'model' });
  assert.equal(s.calls[0].kind, 'json');
  assert.ok(!('cache' in s.calls[0].opts), '裁判用默认缓存');
  assert.equal(s.calls[0].opts.modelTier, 'quick');
  assert.equal(logs[0].agent, 'judge');
  assert.equal(logs[0].callId ?? logs[0].id, j.callId);
  assert.equal(logs[0].cachedTok, 0);
  assert.ok(logs[0].dropped.length === 2, '越界引文不对、坦白 key 不在列表都丢了');
  // 没有任何可判的东西：不调用
  const j2 = await agents.judge(pkg, st, { thread: 'cx', char: 'cx', decision: null, boundaries: [], tellable: [] }, '喝！');
  assert.equal(j2.intent, null);
  assert.equal(s.calls.length, 1);
});

test('consolidate：只给当天有互动的人物、只给她自己的线程；≤120 字；词表命中保留旧卡', async () => {
  const st = smNightState();
  const p = buildMemoryPrompt(pkg, st, 7, ['sm', 'xzx']);
  assert.ok(p.startsWith('【记忆 Agent】'));
  assert.ok(p.includes('我想了一晚上。') && p.includes('工作上的事，别多想'));
  assert.ok(!p.includes('又不回我？'), 'Vivi 那天（D6）不在');
  assert.ok(!p.includes('填充消息'), '陈骁的线程不在');
  assert.ok(p.includes(st.memory.sm.card));
  const lp = buildMemoryPrompt(pkg, st, 0, ['lyy']);
  assert.ok(!lp.includes(CAL_NOTICE), '记忆也不给对方看不到的通知');
  const long = '我'.repeat(200);
  const s = fakeSample({ json: { cards: { sm: long, xzx: '他把平板上的轻讯退了，我们去开房', vv: '不该出现', cx: '他今晚聊了很多。' } } });
  const { agents, logs } = mkAgents(s);
  const r = await agents.consolidate(pkg, st, 7);
  const asked = s.calls[0].input;
  assert.ok(asked.includes('## sm') && asked.includes('## xzx') && asked.includes('## cx'));
  assert.ok(!asked.includes('## vv') && !asked.includes('## lyy'), '当天没互动的不写');
  assert.equal([...r.cards.sm].length, 120);
  assert.equal(r.cards.xzx, st.memory.xzx.card, '命中词表 → 保留旧卡');
  assert.equal(r.cards.cx, '他今晚聊了很多。');
  assert.ok(!('vv' in r.cards));
  assert.equal(logs[0].agent, 'memory');
  assert.equal(logs[0].trigger, 'day');
  // 当天没人互动：不调用
  const r2 = await agents.consolidate(pkg, st, 3);
  assert.deepEqual(r2.cards, {});
  assert.equal(s.calls.length, 1);
});

test('writePersona：default 档、Lite cast 形状、age ≥18、contactCeiling none、key 不撞', async () => {
  const card = {
    key: 'sm', name: '何屿', age: 31, role: '花店老板', publicIntro: '楼下花店的老板。', background: '你每周五去她店里买花。',
    persona: { voice: '慢、温和', habits: ['说话前先笑', '记得每个人买过什么'], sampleLines: ['今天还是白色桔梗？', '想去开房吗'] },
    motive: { surface: '把店开下去', deep: '想离开临州' }, goal: '攒够钱', secrets: ['f.sm'],
    stages: [{ key: 'clerk', label: '店主', meaning: '叫你“邓先生”。' }], initialStage: 'nope', rules: ['不打听别人的事'], never: ['说别人坏话'],
    fallbackLines: ['欢迎再来。'], contactCeiling: 'hug',
  };
  const s = fakeSample({ json: card });
  const { agents, logs } = mkAgents(s, { tier: 'quick' });
  const c = await agents.writePersona(pkg, '楼下花店的老板，三十出头');
  assert.equal(s.calls[0].opts.modelTier, 'default');
  assert.ok(s.calls[0].input.startsWith('【编剧 Agent】'));
  assert.ok(s.calls[0].input.includes('楼下花店的老板，三十出头'));
  assert.equal(c.key, 'sm2');
  assert.equal(c.contactCeiling, 'none');
  assert.deepEqual(c.secrets, []);
  assert.equal(c.initialStage, 'clerk');
  assert.ok(c.never.some((x) => x.includes('碰你')));
  assert.deepEqual(c.persona.sampleLines, ['今天还是白色桔梗？'], '词表过滤');
  for (const k of ['key', 'name', 'age', 'role', 'publicIntro', 'background', 'persona', 'motive', 'goal', 'secrets', 'stages', 'initialStage', 'rules', 'never', 'fallbackLines', 'contactCeiling']) assert.ok(k in c, '缺 ' + k);
  assert.equal(logs[0].agent, 'writer');
  assert.equal(logs[0].tier, 'default');
  // 未满 18 拒绝
  const s2 = fakeSample({ json: { ...card, age: 17 } });
  await assert.rejects(mkAgents(s2).agents.writePersona(pkg, 'x'), (e) => e.code === 'invalid_card');
  assert.ok(buildWriterPrompt(pkg, 'x').includes('age ≥ 18'));
});

test('编剧生成的人物（extraCast）也能聊：prompt 正常、隐私检查通过', () => {
  const st = smNightState();
  const p2 = clone(pkg);
  p2.extraCast = [{ key: 'hy', name: '何屿', age: 31, role: '花店老板', publicIntro: '', background: '你每周五去她店里买花。', persona: { voice: '慢', habits: ['笑'], sampleLines: ['白色桔梗？'] }, motive: { surface: 'a', deep: 'b' }, goal: 'c', secrets: [], stages: [{ key: 'clerk', label: '店主', meaning: '叫你“邓先生”。' }], initialStage: 'clerk', rules: [], never: ['碰你'], fallbackLines: ['欢迎再来。'], contactCeiling: 'none' }];
  const { text } = buildCharacterPrompt(p2, st, { char: 'hy', threadId: 'hy', trigger: 'proactive', brief: '店里到了新花' });
  assert.ok(text.startsWith('【人物 Agent · 何屿】'));
  assert.ok(text.includes('店主：叫你“邓先生”。'));
  assert.ok(checkPrivacy(p2, st, 'hy', text).ok);
  for (const f of pkg.facts) assert.ok(!text.includes(f.text));
});

/* ---------------- 运行 ---------------- */
let fail = 0;
for (const t of tests) {
  try {
    await t.fn();
    console.log('PASS', t.name);
  } catch (e) {
    fail++;
    console.log('FAIL', t.name);
    console.log('   ', e?.message || e);
  }
}
console.log(`\n${tests.length - fail}/${tests.length} 通过`);
process.exit(fail ? 1 : 0);
