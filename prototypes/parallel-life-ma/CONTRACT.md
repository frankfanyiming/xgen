# 「如果 · 多 Agent 试玩」模块约定

这份文档是所有模块的接口约定。改接口先改这里。

## 1. 要做成什么

PM（Frank）要亲手体验"把项目换成多 Agent 架构以后"的**前端**（玩家手机）和**后台**（世界设定 + 运行监控）。
成品是一个发布在 claude.ai 上的多文件 Artifact：打开就能玩《婚前十二天》，每个人物由独立的 Claude Agent 扮演（通过 Artifact 的 `sample` 能力，用看的人自己的 Claude 额度）；后台能实时看到每次调用了哪个 Agent、它看到了什么、花了多少钱（按线上模型折算）、导演为什么这么排、世界状态怎么变。

世界内容来自已经验证过的 Lite 世界包：`/tmp/claude-0/-home-user-xgen/61dff879-9f88-5ed2-80a0-37aef5f6ef93/scratchpad/lite/world-package.lite.json`（只读，不要改那个目录里的任何文件）。它的参考运行时 `runtime-lite.mjs` 和类型 `schema-lite.ts` 也在同目录，是内核行为的标准答案。

## 2. 架构（三层 + 离线）

| 层 | 谁 | 调模型吗 | 文件 |
|---|---|---|---|
| 世界内核 | 代码：状态、谁知道什么、事件、结果、结局、内容边界执行 | 否 | `kernel.js` |
| 导演 | 代码规则 D1–D6：开哪个事件、危机间隔、安静时段、谁可以主动发消息 | 否 | `director.js` |
| 人物 Agent | 每个人物一个；只负责"说话"；只看到自己知道的事、自己的记忆、自己这个对话 | 是（quick 档） | `agents.js` |
| 裁判 Agent | 不扮演任何人；判断玩家这句话属于哪个意图、是否越界、是否在坦白某件事；必须引原话 | 是（quick 档，JSON），只在需要时调 | `agents.js` |
| 记忆 Agent（离线） | 每过一个故事日，批量给有互动的人物写一张记忆卡（≤120 字） | 是（quick 档，JSON，批处理） | `agents.js` |
| 编剧 Agent（后台） | 作者在后台写一句人物简介，生成完整人设卡 | 是（default 档，JSON） | `agents.js` |

原则：
- **人物只管说话，进度交给代码。** 意图判断由裁判做，不让一次调用同时负责台词和进度（李孟哲引擎里 `eventGoalAssessments` 一个字段坏掉整条回复作废，就是反例）。
- **隐私：** 人物 Agent 的 prompt 里只能出现：内容边界、世界基调、这个人物自己的人设、她已经知道的事实（`knows[char]`）、她的记忆卡、这个对话最近 12 条、此刻的简短提示。**绝不能出现**：节点的 `setup`、`decision.prompt`、结果的 `result`、别的人物的动机/秘密、她不知道的事实原文。测试必须逐个人物、逐条事实验证。
- **成本：** 自由聊天每条玩家消息 1 次调用；有待回答的事件时先调裁判（便宜），命中意图且结果里有作者写好的台词，就直接发作者台词、**不再调人物**；只有没命中或结果没台词时才调人物。主动消息每次"过一会儿"最多 1 条。记忆每个故事日 1 次批处理。

## 3. 时间：架空，按"下一件事"推进

故事时间仍用世界包里的 `D7 23:05` 这种刻度（展示成"11月16日 周一 23:05"，`universe.startDate = 2026-11-09` 是 D0），但它**不跟现实时间挂钩**：
- 时钟 `st.now`（故事分钟，D0 00:00 = 0）只在玩家点「过一会儿」时前进，跳到 `nextStop()`：下一个未发生节点的窗口起点、触发条件/碰撞里出现的 `after` 时刻、最早一个待回答事件的截止时刻（`openAt + decision.timeoutMinutes`）、`universe.endsAt` 中最早的一个。
- 跳过截止时刻 = 玩家选择沉默：那个事件按 `on:'timeout'` 结算。界面在跳之前要提示"××的消息你还没回，跳过去就算没回"，需要再点一次确认（页面内确认，不能用 `confirm()`）。
- 节点开始时，消息带 `at = 开始时刻 + delayMinutes` 一次性送进对话；`st.now` 不因 delay 改变（与 `runtime-lite` 相同）。决策 `openAt = 开始时刻 + 最大 delay`。界面可以用"正在输入"动画把它们一条条放出来，纯视觉。
- 显示时间 = `max(st.now, 已送达消息里最大的 at)`。
- 离线什么都不发生；没有倍速、心跳、租约。
【更新】（A）`nextStop` 只停“真有事”的时刻，取最早的：① 待回答事件的截止；② 延迟消息送达（见下条）；③ 窗口起点 / `after` 时刻——只有按当前状态和导演规则（D3/D4）预判那一刻确实有节点能开始才算一站，条件不成立的不停（否则会跳到什么都没发生的时刻，后台 reasons 还会剧透）；④ 每天安静时段结束（08:00）一站“新的一天”，保证每个故事日至少停一次（D6 主动消息、记忆整理才有机会跑）；⑤ `universe.endsAt`。`label`：同一天写“21:35”，第二天写“明天 08:00”，再往后写“11月13日 周五 21:00”（按 max(at, 显示时间) 算）；暂停或结束时返回 `at:null`。`reasons` 给后台看（含节点标题），手机只显示 `label`。
【更新】（A）结果和越界输入的效果里带 `delayMinutes` 的消息（HR 通知 +60/+90、苏蔓 +60、“解冻失败” +180）不一次性送达：先放进 `st.pending`，跳时间经过它的时刻才进对话，送达时刻也算 nextStop 的一站。节点开场消息仍按上面一次性送达。原因：一次性送达会让显示时间一下提前好几个小时，之后发生的节点时间反而更早。

## 4. 文件与负责人

目录：`/home/user/xgen/prototypes/parallel-life-ma/`（git 仓库 frankfanyiming/xgen 的一部分）。纯浏览器 ES Module，无构建、无 npm 依赖、无外部脚本。

| 文件 | 负责 | 内容 |
|---|---|---|
| `CONTRACT.md` | 主控 | 本文件 |
| `base.css` | 主控（已写好） | 颜色/字体 token、外壳布局。其它 CSS 只能用这里的 token，不许写死颜色 |
| `world.js` | A | `export const WORLD = {…}`：由 `tools/gen-world.mjs` 从 Lite JSON 原样生成 |
| `world-extras.js` | A | `export const EXTRAS = {…}`，见 §6 |
| `kernel.js` | A | 世界内核，见 §7 |
| `director.js` | A | 导演规则，见 §8 |
| `agents.js` | B | 全部 Agent、prompt、校验、过滤、兜底、计费，见 §9 |
| `phone.js` + `phone.css` | C | 玩家手机，见 §11 |
| `admin.js` + `admin.css` | D | 后台，见 §12 |
| `index.html` + `app.js` | E（集成） | 页面骨架、把模块接起来、存档、db 草稿，见 §10 |
| `tests/*.mjs` | 各自 | A：`kernel.test.mjs`；B：`agents.test.mjs`；E：`serve.mjs`、`mock-claude.js`、`e2e.mjs` |
| `README.md` | E | 怎么跑、架构、和李孟哲引擎模块的对应关系 |

临时文件、截图写到 `/tmp/claude-0/-home-user-xgen/61dff879-9f88-5ed2-80a0-37aef5f6ef93/scratchpad/ma-build/`，不要放进仓库目录。
不要动 `/home/user/limengzhe27-boop/parallel-life`（只读参考）。不要 git commit/push（主控来做）。

## 5. 通用数据形状

```js
// 消息
Msg = {
  id: string,            // 'm' + 递增序号，存档内唯一
  at: number,            // 故事分钟
  from: string,          // 人物 key（cast/supporting）| 'player' | 'narrator' | 'system'
  text: string,
  kind: 'text' | 'image_locked' | 'recall' | 'notice',
  // image_locked：text 为 "[私密图片 · 不展示]"；界面画成锁定占位，不可点、不可放大、不可保存
  // recall：系统"××撤回了一条消息"；notice：旁白/系统提示
  src: 'authored' | 'agent' | 'fallback' | 'player' | 'system',
  node?: string,         // 来自哪个节点
}
// 对话
Thread = {
  id: string,            // 人物 key（私聊）| 'scene:<nodeKey>'（现场）| 'feed'（此刻：旁白和系统通知）
  kind: 'chat' | 'scene' | 'feed',
  title: string,         // 私聊=人物名；现场=节点 title；feed='此刻'
  with: string | null,   // 私聊/现场的主讲人物 key（现场=节点 owner）
  node: string | null,   // 现场对应的节点
  closed: boolean,       // 现场结算后 true（不能再输入）
  msgs: Msg[],
  unread: number,
  lastAt: number,
}
```

**消息路由（kernel 负责，确定性）：**
- 节点 `kind === 'scene'`：该节点所有消息、以及它结果里 `send` 的消息 → `scene:<key>`；第一次往里写时，在 `feed` 里加一条 notice "现场：<title>"，并把这个现场线程建出来。
- 节点 `kind === 'chat'`：`from` 是人物 → 发到 `from` 的私聊；`from` 是 `narrator`/`system` → 发到节点 `owner` 的私聊（居中灰字）；没有 owner → `feed`。
- 其它（opening/world_event/ending）：人物消息 → 各自私聊；narrator/system → `feed`。
- `from: 'speaker'` 换成节点 owner。
- `text === '[私密图片 · 不展示]'` → `kind: 'image_locked'`；`from === 'system'` 且文本含"撤回了一条消息" → `kind: 'recall'`；narrator/system 其它 → `kind: 'notice'`。
- 私聊线程在第一次有消息时创建；EXTRAS.people 里 `chat:true` 的人物即使还没消息，列表也不显示（只显示有消息的）。
【更新】（A）越界输入的回复直接进玩家说话的那个线程，`'speaker'` = 该线程的 `with`；`mode:'gist'` 的回复发它的 `fallback` 原文（`src:'fallback'`）。Msg 可能多一个 `flag:'selfharm'`：玩家那句自伤的话和系统的热线回复都带，**B 不要把带 flag 的消息放进任何 prompt**。同一线程里消息时间不倒退（新消息的 `at` 不早于上一条）。人物 Agent 台词里含图片占位的行，`addAgentLines` 直接丢掉。

## 6. world-extras.js（A）

```js
export const EXTRAS = {
  startDate: '2026-11-09',
  people: {
    // 每个会出现在 from 里的人物（cast + supporting）
    xzx: { name: '许知夏', short: '知夏', color: 'var(--p1)', kind: 'cast', chat: true, intro: '你的未婚妻，十二天后结婚。' },
    // … sm, vv, lyy, cx, zz, shf, lz, zc, hm
  },
  player: { name: 'Danny', fullName: '邓子安' },
  silentStages: ['vanished', 'dropped'],      // 这些阶段的人物不再主动发消息
  tellable: [                                  // 坦白检测（只对知夏开），裁判用；兜底用关键词
    { fact: 'f.sm', label: '你和苏蔓之间越界的事', keywords: ['苏蔓', '送我', '白车', '那天晚上'] },
    // f.sm_night, f.vv, f.lyy, f.joint_out …（按 conds 里出现 via:['told'] 的事实列全）
  ],
  boundaryHints: { 'bi.ask_image': ['再发', '照片', '发我看看'], … },   // 兜底裁判用的关键词，每个 boundaryInputs 都要有
  selfharm: ['自杀', '想死', '不想活', '轻生', '活着没意思', '割腕', '跳楼', '安眠药', '烧炭'],  // 代码层直接拦
};
```
【更新】（A）实际内容以 `world-extras.js` 为准。① `tellable` 只有 `f.sm`、`f.sm_night`、`f.vv`、`f.lyy` 四条：conds（以及碰撞、节点）里出现 `via:['told']` 的只有这四个；`f.joint_out` 只有知夏 saw，玩家本人不“知道”，按 reveal 规则说不出口，所以不列。每条至少 5 个只属于它的关键词，另有“说实话 / 瞒着你 / 骗了你 / 坦白 / 我承认”等共用词；测试保证真实的坦白说法命中 ≥2 且含专属词，寻常说法不中。② `boundaryHints` 覆盖全部 7 条越界输入，故意写窄：不命中任何意图例句、作者台词、sampleLines、fallbackLines（测试逐条查）。③ `silentStages` = `['seen_through','vanished','dropped','reckoning','knowing']`（Vivi 识破后下线、苏蔓走 HR、知夏只回“好的/收到”等最后一问，都不该主动来消息）。④ 新增 `selfharmExclude: ['想死你','跳楼价',…]`，匹配前先剔除（“想死你了”是想念）。⑤ 配角 `chat:false`：只在有待回答事件时需要输入框。编剧生成的 extraCast 人物不在 `people` 里：界面用 `pkg.cast` 的 `name`，颜色用 `var(--p6)`。

## 7. kernel.js（A）

纯函数风格，`st` 是可 JSON 序列化的普通对象（`knows` 用数组，不用 Set）。全部导出：

```js
export function newGame(pkg, extras) -> st
// st = { v:1, seq, now, vars, stages, knows:{who:{fact:[via…]}}, ran:{}, outcome:{}, fired:{}, crises:[],
//        open:[OpenDecision], threads:{[id]:Thread}, order:[threadId…] /*最近活动在前*/,
//        halted:null|{by, node}, ended:null|{ending, title, text, epilogues:[string]},
//        proactive:{[day]:{[char]:n}}, memory:{[char]:{card, day}},
//        directorLog:[{at, kind, text}], kernelLog:[{at, kind, text}] }
// OpenDecision = { node, thread, owner, openAt, deadline, intents:[{key,label,examples}] }
// newGame 之后立刻跑一次 director.tick（开场节点在 D0 21:30 开始），并把 now 设为 clock.startsAt。

export function evalCond(pkg, st, cond) -> boolean        // 与 runtime-lite 同义
export function applyEffects(pkg, st, effects, ctx) -> void // ctx = { node } 用于消息路由
export function startNode(pkg, st, nodeKey) -> void          // onStart → 送消息 → 有决策就加到 open；没有就按 'auto' 立即结算
export function resolve(pkg, st, nodeKey, choice) -> Outcome|null // choice = 意图 key | 'timeout' | 'auto'；第一条匹配的结果；应用效果；写日志；移出 open；现场线程 closed=true
export function knowledgeOf(pkg, st, who) -> [{ fact, text, via:[…] }]   // 只返回 who 知道的
export function displayTime(st) -> number
export function timeLabel(st, min) -> { clock:'23:05', date:'11月16日 周一', countdown:'离婚礼还有 4 天' }

// 玩家输入
export function playerSay(pkg, st, threadId, text) -> Route
// 追加玩家消息；代码层自伤检测（EXTRAS.selfharm 子串）命中 → 直接触发 bi.selfharm（系统回复 + halted），返回 { halted:true }
// 否则返回 Route = {
//   thread, char,                       // char = 线程的 with
//   decision: OpenDecision|null,        // 这个线程里待回答的事件（最多一个；有多个取 openAt 最早的）
//   boundaries: [{ key, input }],       // 此刻允许命中的越界输入（按 nodes/with/when 过滤，与 runtime-lite 相同；selfharm 除外）
//   tellable: [{ fact, label, text }],  // 只在 char==='xzx' 时：玩家知道而知夏还不知道（或只是 saw/heard，没被 told）的可坦白事实
//   needsJudge: boolean                 // decision 不为空，或玩家原话命中 boundaryHints/tellable 关键词
// }
export function applyJudgement(pkg, st, route, j) -> { halted, resolved: Outcome|null, authoredReply: boolean }
// j = { intent, boundary, told:[fact] }（agents 已校验过）
// 顺序：boundary（发系统/人物回复、效果、pause → halted）→ told（learn(char, fact, 'told')）→ intent（resolve）
// authoredReply = 结算结果的 send 里有 owner 本人的台词
export function addAgentLines(pkg, st, threadId, from, lines, src) -> void   // src: 'agent'|'fallback'
export function resume(pkg, st) -> void

// 时间
export function nextStop(pkg, st) -> { at, label, reasons:[string], willTimeout:[{ node, owner, title }] }
export function jump(pkg, st) -> { from, to, timedOut:[nodeKey], started:[nodeKey], dayChanged:boolean, ended:boolean }
// 按时间顺序处理：先处理 ≤to 的截止（now=截止时刻 → resolve 'timeout' → director.tick），再 now=to → director.tick
export function markRead(st, threadId) -> void
export function applyPatch(pkg, patch) -> pkg   // 后台草稿：深拷贝后覆盖，见 §10
```

`kernel.js` 从 `director.js` 引 `tick`；`director.js` 从 `kernel.js` 引 `evalCond/startNode`（ES Module 循环引用可以，但只在函数体里用）。
【更新】（A）实现补充：
- `applyJudgement` 顺序改为 **越界 → 意图 → 坦白**：节点结果按“这句话之前她知道什么”来选（试纱间说梁总那顿饭，`tell_lyy` 的第一个结果读“之前有没有亲口说过”，先记坦白会错选成“又说了梁总”）。坦白仍在同一次调用里记下。
- `authoredReply` = 这一次的越界回复或结算结果里送出了**任何**作者台词（含旁白、系统、别人的台词、含延迟送达的），与 §2“结果里有作者写好的台词就不再调人物”一致。**E：只看 `authoredReply`，为 true 就不调人物**（越界时 `resolved` 为 null，但“邓总，这不合适。”已经是她的回答，再调人物会说两遍）；为 false 才 `speak`（trigger：resolved ? 'outcome' : 'player'）。
- `playerSay`：暂停或结束时不追加消息，直接返回 `{…, halted:true}` / `{…, ended:true}`；Route 额外有 `msgId`、`at`。`needsJudge`：有待回答事件，或原话命中本线程候选越界的 `boundaryHints`，或命中可坦白事实的任一关键词（≥1 个就叫裁判，判不判由裁判/兜底定）。
- `resume`：暂停时那个线程如果有待回答事件，它的截止 = 继续时的显示时间 + timeoutMinutes（从头计）。
- st 额外字段（都可序列化）：`startDate`、`endsAt`（分钟）、`pending:[{at,thread,msg}]`、`seen`/`blocked`/`missed`（导演记账）、`boundaryLog:[{key,node,thread,at}]`；`halted` 还带 `thread`、`at`；`ended` 还带 `at`；OpenDecision 带 `title`；`jump` 返回还带 `fromDay`、`toDay`（按 st.now 算，`dayChanged` 时把 `fromDay` 交给 consolidate）；`resolve` 第 5 个可选参数 `{ at }` 是结算时刻（玩家回答时 = 显示时间）。
- `timeLabel` 还返回 `day`；`countdown` = 婚礼日（`endsAt` 那天，D12 = 11月21日 周六）− 当天：D0 是“离婚礼还有 12 天”（与开场系统消息一致），D7（11月16日）是 5 天，当天是“今天是婚礼”。上面示例里的 4 天只是示意。
- `applyPatch`：只认白名单字段（cast 的 role/publicIntro/background/goal/rules/never/fallbackLines、persona 的 voice/habits/sampleLines、motive 的 surface/deep，平铺或嵌套都行；director 四个数字和 quietHours；policy.promptBlock），年龄、接触上限、阶段、秘密不能改；`extraCast` 加进 `pkg.cast`（`extra:true`、`contactCeiling:'none'`、年龄 <18 丢弃、key 撞了自动改、没有 stages 时给一个“初识”阶段）。不改传入的 pkg。
- 额外导出（后台/测试可用）：`toMin`、`fmt`、`IMG`、`nodeOf`、`personName`、`kindOf`、`routeOf`、`pickOutcome`、`boundariesFor(pkg, st, char, decision)`、`keywordHits(text, keywords)`、`normText`、`isSelfHarm`、`nodeStatus(pkg, st, key) -> 'waiting'|'open'|'done'|'missed'`（D 的“事件进度”可直接用）。
- 一致性：`tests/kernel.test.mjs` 用与 sim-lite 相同的随机策略、同一种子逐局对照 runtime-lite 的 `play()`，3000/3000 局每个节点的结果和结局完全一致。

## 8. director.js（A）

```js
export function tick(pkg, st) -> [nodeKey]   // 在 st.now 按 D1–D5 选并开始节点；循环到没有可开的；每个决定写 directorLog（含原因，如"危机被挡：当天已有危机"）
export function planProactive(pkg, st, extras) -> { char, brief } | null
// D6：cast 人物；当天主动次数 < director.proactivePerCharacterPerDay；不在安静时段；她没有待回答事件；阶段不在 silentStages；
// 选最久没和玩家说话的那位；brief 只写她自己的目标和阶段含义（不写剧情）。
export function commitProactive(st, char) -> void
```
【更新】（A）director 另导出 `crisisLimit`、`inQuiet`（kernel 的 nextStop 用来预判）。directorLog 的 kind：`start`（开始节点及原因：D1 must / D2 碰撞 / D5 排序）、`block`（被 D3/D4 挡下，同一原因只记一次）、`miss`（窗口已过、没发生，以及原因）、`proactive`（D6 选了谁，或为什么没人）。extraCast 人物也参与 D6（从没说过话的最先被选）。

## 9. agents.js（B）

```js
export function createAgents({ getSample, log, getSettings }) -> {
  status(),                                   // 'connected' | 'offline' | 'unknown'
  judge(pkg, st, route, text) -> Promise<{ intent, boundary, told, via:'model'|'fallback', callId }>,
  speak(pkg, st, { char, threadId, trigger, outcome?, brief? }) -> Promise<{ lines:[string], via, callId }>,
      // trigger: 'player' | 'outcome' | 'proactive'
  consolidate(pkg, st, day) -> Promise<{ cards:{[char]:string} }>,
  writePersona(pkg, brief) -> Promise<card>,  // Lite cast 形状，age ≥ 18，contactCeiling 'none'
}
export function buildCharacterPrompt(pkg, st, args) -> { text, prefixText }   // prefixText = 可缓存的静态前缀
export function buildJudgePrompt(pkg, st, route, text) -> string
export function buildMemoryPrompt(pkg, st, day, chars) -> string
export function buildWriterPrompt(pkg, brief) -> string
export function validateJudgement(route, text, raw) -> { intent, boundary, told }   // 引文必须是玩家原话的连续子串（忽略首尾空白和标点），否则丢弃该项；key 必须在 route 给出的列表里
export function filterLines(pkg, char, lines) -> { lines, dropped }  // policy.lexicon.block（减去 exclude）逐行过滤；删空了用 fallbackLines；最多 3 行，每行 ≤ 80 字
export function estimateTokens(text) -> number   // 中日韩字符 ×0.8 + 其它字符 ÷3.8，取整
export const PRICES = { mini:{label:'gpt-4o-mini', in:0.15, cached:0.075, out:0.60}, flash:{label:'DeepSeek V4-Flash（第三方报价）', in:0.14, cached:0.0028, out:0.28}, fx:7.2 }  // 美元/百万 token
export function costCNY(inTok, cachedTok, outTok, price) -> number
```
【更新】（B）`createAgents` 另收两个可选参数：`extras`（EXTRAS，兜底裁判用 boundaryHints / tellable 关键词；不传就懒加载 `./world-extras.js`）、`onStatus(status)`（状态变化回调，E 可用来刷新离线横幅；不传也行，`status()` 照常可读）。另导出 `knowledgeOf`（本地版，与 kernel 同义）、`checkPrivacy`、`fallbackJudge`、`lexiconHit`、`bigramSim` 给测试和后台用。`buildCharacterPrompt` 返回值多一个 `facts:[factKey]`。`filterLines` 第 4 个可选参数 `turn`（兜底台词轮换序号），返回值多 `fallback:boolean`；配角没有兜底台词时删空返回 `lines:[]`（跳过这一拍）。`validateJudgement`：同一句命中越界时 intent 置 null（schema：越界输入不归类成任何意图，决策仍开着）。`judge`：route 没有意图、越界、可坦白事实时不调模型，直接返回全空（`callId:null`）。`consolidate` 返回值多 `via`、`callId`。

**getSample**：`() => Promise<sampleFn|null>`（app 里 `claude.use('sample')`）。null、`not_granted`、`sampling_disabled`、`not_declared`、`capability_disabled`、`capability_removed` → 本次会话转为离线兜底（status 'offline'）。`rate_limited`、`upstream_error`、`refused`、`invalid_json`、`empty_completion`、`prompt_too_large` → 这一次用兜底，记日志，不重试。

**模型档位**：人物/裁判/记忆用 `getSettings().tier`（默认 `'quick'`）；编剧用 `'default'`。人物 `cache:false`；裁判、记忆用默认缓存。人物用 `sample(text)` 拿纯文本（每行一条）；其它用 `sample.json`。

**人物 prompt**（中文，开头必须是 `【人物 Agent · <名字>】`）：扮演说明（只输出要发的消息，每行一条，最多 3 行，每行 ≤ 60 字，不要旁白/引号/动作描写）→ 【内容边界】`policy.promptBlock` → 【世界基调】`world.tone` → 【你是谁】name/age/role/background → 说话方式 voice、habits、sampleLines → 动机 surface/deep、goal → 【你和他现在】阶段 label + meaning → 【你必须】rules → 【你绝不】never → 【你知道的事】（只含 `knowledgeOf(char)`，注明是亲眼看到/他告诉你/听别人说）→ 【你记得的】记忆卡 → 【此刻】时间标签 + 触发说明（player：他刚发来消息；outcome：你对他这句话的态度是「outcome.label」；proactive：导演提示 brief；现场：你们在同一个地方，只写说出口的话）→ 【最近的对话】最近 12 条（玩家写作"Danny"，旁白/系统写作"（旁白）"）。supporting 人物用 `note` 当人设。
静态前缀 = 从开头到【你和他现在】之前。
【更新】（B）人物 prompt 的可见性：私聊线程里的 narrator/system 通知（日历冲突、付款页、银行短信、账号注销）是玩家手机上的提示，对方看不到，**不放进人物 prompt 和记忆 prompt**；撤回提示只在撤回的是她自己时保留；现场线程照放（写作“（旁白）”）。【此刻】额外写：她有待回答事件时一句“他还没正面回应，最多追问一次”，以及这个节点（或刚结算节点）作者写的 `guard`（只在她是 owner 时）。时间写成“现在是 11月16日 周一 23:16（婚礼在 11月21日 周六）”，不写倒数天数，免得和 `timeLabel` 口径不一。扮演说明里不出现任何【…】段名，所以按第一个“【你和他现在】”切前缀是安全的；主要人物（cast）的静态前缀都 ≥1024 token，配角不到。

**裁判 prompt**（开头 `【裁判 Agent】`）：不扮演任何人；给出玩家原话（发给谁）、最近 4 条上下文、A 可选意图（key/label/全部 examples）、B 越界输入（key/input）、C 可坦白事实（只在 route.tellable 非空时；这里可以写事实原文，裁判不是人物）；要求只回 JSON：`{"intent":null|"key","intentQuote":null|"原话片段","boundary":null|"key","boundaryQuote":…,"told":[{"fact":"key","quote":"…"}]}`。

**记忆 prompt**（`【记忆 Agent】`）：每个人物只给她自己的线程（私聊 + 她是主讲的现场）当天的消息（每人截 1500 字）和旧卡；回 `{"cards":{"xzx":"…"}}`，第一人称，≤120 字，只写她看到/听到的。

**兜底**：裁判 = 意图例句/标签的字二元组相似度（≥0.2 取最高）+ boundaryHints 关键词 + tellable 关键词（命中 2 个以上）；人物 = 按调用次数轮换 fallbackLines；记忆 = 保留旧卡；编剧 = 抛错，界面提示"需要连接 Claude"。
【更新】（B）tellable 关键词兜底：命中 ≥2 个，且其中至少 1 个只属于这一条事实（“坦白”“我承认”“没跟你说”这类各条共有的词不单独算），否则“我承认，我没跟你说”会被判成同时坦白四件事。关键词和 kernel 一样先去空白、转小写再按子串匹配。玩家原话与某条例句相似度 ≥0.8 时不按越界判（作者例句本身不越界）。记忆兜底返回她们原来的卡（`cards` 里是旧卡）；编剧兜底抛 Error：离线时 message 是“需要连接 Claude 才能生成人物”，单次失败是“这次没生成出来（错误码），稍后再试”，`code` 为错误码；生成的年龄 <18 抛 `code:'invalid_card'`。给 mock-claude 的格式：裁判 prompt 里玩家原话在“玩家原话（…）：”的下一行，整行写成「原话」；意图行是 `- key（label）例句：「…」「…」`；记忆 prompt 每人一段，标题 `## key · 名字`，回 `{"cards":{key:"…"}}`。

**日志**：每次调用（含兜底）调用 `log(entry)`：
```js
{ id, t: Date.now(), storyAt, agent:'character'|'judge'|'memory'|'writer', who, trigger, tier, tierApplied,
  prompt, prefixChars, promptChars, inTok, cachedTok, output, outTok, ms, ok, error?, via:'model'|'fallback',
  cost:{ mini, flash },   // 人民币
  privacy?: { facts:[factKey], ok:boolean } }   // 人物调用：prompt 里出现了哪些事实，是否都是她知道的
```
缓存估算：同一人物上一次调用的 prefixText 完全相同且前缀 ≥1024 token → cachedTok = 前缀 token，否则 0。
【更新】（B）`sample.json` 拿不到实际档位，json 调用（裁判/记忆/编剧）的 `tierApplied` 为 null（显示用 `tierApplied ?? tier`）。日志额外字段：人物 `thread`、`lines`（最终发出的行）、`dropped`（被词表或图片规则删掉的行）；裁判 `node`、`result`、`dropped`（被校验丢弃的项和原因）；记忆 `day`。离线或没触达模型（`rate_limited`、`prompt_too_large`）时 inTok/outTok/cost 记 0；`refused/invalid_json/empty_completion/upstream_error` 按已读输入估算。缓存前缀只在真的发给模型时更新；离线后本次会话不再调用 sample。

## 10. app.js + index.html（E）

`index.html` 是发布时会被包上 doctype/head/body 的**片段**：顶部 `<title>如果·多Agent试玩</title>`、`<meta name="claude:viewport-fit-sides" content="cover">`、Google Fonts（Noto Serif SC 500/700、JetBrains Mono 400/600）、`base.css`/`phone.css`/`admin.css` 三个 `<link>`、外壳 DOM、`<script type="module" src="app.js">`。不写 `<!doctype>`/`<html>`/`<head>`/`<body>`。

```html
<div class="shell">
  <header class="shell-top"> 标题 + 副标题 + .shell-switch（手机 / 后台）</header>
  <main class="stage" data-view="phone"><section id="phone-root"></section><section id="admin-root"></section></main>
</div>
```

`app` 对象（传给 `mountPhone(el, app)` 和 `mountAdmin(el, app)`）：
```js
app = {
  pkg, extras,                       // 当前一局用的世界包（可能打过草稿补丁）
  get st(), get calls(),             // calls：日志数组，旧→新
  settings, setSetting(key, value),  // { tier:'quick'|'default', price:'mini'|'flash' }
  agentStatus(),
  busyThreads(),                     // Set<threadId>：人物正在"输入"
  act: { send(threadId, text), jump(), resume(), restart(), markRead(threadId) },
  draft: { load() -> Promise<patch|null>, save(patch) -> Promise<'db'|'local'>, applyAndRestart(patch), where() -> 'db'|'local' },
  writer(brief) -> Promise<card>,
  on(evt, fn) -> off, emit(evt, payload),   // 'change'（任何状态变化后）、'calls'、'toast' {text, kind:'info'|'warn'}
  view: { show('phone'|'admin', tab?) },
}
```
【更新】（C）`app` 多一个字段 `kernel`：kernel.js 的模块对象（`import * as kernel from './kernel.js'` 原样挂上）。手机不 import kernel，用 `app.kernel.nextStop(app.pkg, app.st)`、`timeLabel(app.st, min)`、`displayTime(app.st)` 画状态栏和「过一会儿」；没挂时手机退回本地近似（时间标签同口径，但下一站只认待回答事件的截止，会不准）。`act.send / jump / resume / restart` 返回的 Promise 要在整个流程（含人物回复、tick、存档、emit）做完后才 resolve：手机靠它判断"发送中"（禁用输入框和发送键）和"时间在走"；reject 时手机把原话放回输入框并 toast"没发出去，再试一次"。`busyThreads()` 变化时请 emit `'change'`（手机在自己的动作进行中也会每 200ms 轮询一次兜底）。

流程（全部串行：一个全局队列，同一时刻只处理一个动作）：
- `send`：`playerSay` → halted 则结束 → `needsJudge` 则 `agents.judge` → `applyJudgement` → halted 结束 → `resolved && authoredReply` 则不调人物 → 否则 `agents.speak`（trigger：resolved ? 'outcome' : 'player'）→ `addAgentLines` → `director.tick` → 存档 → emit。
- `jump`：`kernel.jump` → `director.planProactive` → 有则 `speak(trigger:'proactive')` + `commitProactive` → `dayChanged` 则后台跑 `consolidate`（不阻塞，回来后写 `st.memory`）→ 存档 → toast 一句"时间来到 …"。
- 存档：`localStorage['pl-ma:save:v1'] = { pkgSig, st }`（try/catch）；`pkgSig` 不同就新开一局。日志存 `pl-ma:calls:v1`（最近 80 条）。设置存 `pl-ma:settings:v1`。
- `sample`：`claude.use('sample')`；`window.claude` 不存在或 resolve null → 离线兜底，页面顶部一条横幅说明。
- 草稿：`claude.use('db')` → `db.doc('worlds/wedding-countdown-lite')`，body `{ patch, savedAt }`；`db` 为 null 或写失败 → `localStorage['pl-ma:draft:v1']`。`patch = { cast:{[key]:{部分人设字段}}, director:{proactivePerCharacterPerDay, quietHours, maxCrisesPerDay, minHoursBetweenCrises}, policy:{promptBlock}, extraCast:[编剧生成的卡] }`；`kernel.applyPatch` 应用。`extraCast` 只进自由聊天（不进任何节点）。
- 发布时的能力声明（主控来做）：`{ sample:{}, db:{ rules:[{ path:'', read:'view', write:'admin' }] }, user:{} }`。

## 11. phone.js + phone.css（C）

`export function mountPhone(el, app)`；订阅 `app.on('change')` 重绘（保留滚动位置和输入框内容）。
- 机身：宽屏时 390×min(820px, 100%) 圆角 `--r-phone`、`--phone-frame` 边框、`--shadow-phone`；窄屏时铺满、无机身。
- 状态栏：故事时间 `clock`、`date`、"离婚礼还有 N 天"小签。
- 首页 = 轻讯会话列表：`feed`（此刻）置顶；其余按 `st.order`；头像=名字首字+人物色；最后一条预览（image_locked 显示"[图片]"）；时间；未读数；有待回答事件的会话显示"等你回复"。
- 会话页：返回、标题、人物 intro；气泡（玩家右侧 `--bubble-me`，人物左侧 `--bubble-in`）；旁白居中衬线体；系统/撤回居中小灰字；`image_locked` 画成不可点的锁定灰块，写"私密图片 · 不展示"；人物"正在输入…"；现场线程标题前加"现场"，结算后输入框换成"这一场结束了"。
- 输入：textarea，Enter 发送、Shift+Enter 换行；发送中禁用。线程里有待回答事件时，输入框上方有「参考回复」开关，展开后每个意图一个小卡（label + 第一条例句），点一下把例句填进输入框（不自动发送）。
- 底部「过一会儿」条（列表页和会话页都有）：显示 `nextStop().label`；`willTimeout` 非空时第一次点变成黄色确认条"知夏、苏蔓的消息你还没回，跳过去就算没回 · 确认跳过"，再点才跳。
- 暂停遮罩（`st.halted`）：系统消息原文 +「继续」。结局遮罩（`st.ended`）：衬线大标题、正文、尾声若干行、「看看后台」「重新开始」。
- toast：右下/底部短提示，3 秒消失。
- 无障碍：按钮都有可读文字；颜色只用 token。
【更新】（C）实现补充：
- `mountPhone` 返回 `{ destroy, openThread(threadId), goList, render }`。打开的会话有未读时，手机会调 `app.act.markRead(threadId)`（延后一拍，不在渲染里递归）。
- toast 由手机渲染（订阅 `'toast'`），挂在 `document.body` 的 `.pl-toasts` 上，窄屏切到后台也看得到；**D 不要再画一份**。
- 新消息：玩家自己的立即出现；别人的（作者台词、模型台词、旁白一视同仁）在当前打开的会话里逐条放出（每条约 0.4–1.2 秒，人物消息前有"正在输入"，点消息区立刻全部放出；`prefers-reduced-motion` 时不放慢）。列表页不放慢。结局遮罩等这些消息放完才出。`.pl-phone[data-settled="1"]` = 没有排队的消息、没有进行中的动作、当前会话没人在输入——**E 的 e2e 断言消息前等它**。
- 会话列表顶栏有「重新开始」（页面内确认后调 `app.act.restart()`）；`st.seq` 变小视为新开一局，手机回到列表、清掉草稿。结局遮罩另有「回看对话」，关掉后列表顶上一条"故事已经结束 · 看结局"可以再打开。
- 配角（`EXTRAS.people[key].chat === false`）的私聊只在有待回答事件时有输入框，否则写"周总现在没在等你回复"；`feed` 没有待回答事件时不显示输入区；`feed` 里"现场：…"通知可以点进对应现场。`extraCast` 人物（不在 `EXTRAS.people` 里）按 cast 处理：名字/简介取 `pkg.cast`，颜色按 key 在 `--p1…--p6` 里挑。
- 暂停遮罩的正文 = `st.halted.thread` 里 `at ≥ halted.at` 的最后一条 system 消息（就是热线那条）；找不到时写一句通用说明。
- 手机不读 `src`，作者台词和模型台词长得一样；`data-*` 里也不带来源。
- 给 e2e 的选择器：会话行 `.pl-row[data-thread="<id>"]`、返回 `.pl-back`、输入框 `.pl-input`、发送 `.pl-send`、参考回复开关 `.pl-ref-toggle` / 卡片 `.pl-ref-card`、「过一会儿」`.pl-jump-btn`（确认态 `.pl-jump.is-confirm`，同一个按钮再点一次就跳；取消 `.pl-jump-cancel`）、输入区换成的提示 `.pl-closedbar`、暂停遮罩 `.pl-halt`（继续 `.pl-halt .pl-btn`）、结局遮罩 `.pl-ending`（标题 `.pl-ending-title`，「回看对话」`.pl-ending-back`）、消息元素带 `data-id`（= Msg.id）、锁定图片 `.pl-locked`。

## 12. admin.js + admin.css（D）

`export function mountAdmin(el, app, opts?)`；顶部 4 个标签：**架构 / 运行监控 / 世界设定 / 成本**；`#` 锚点可直达（`#arch`、`#runtime`、`#world`、`#cost`）。
- **架构**：三层 + 离线的方块图（HTML/CSS 画，不用外部库），每个 Agent 方块上显示本局调用次数；代码层（内核、导演）标"不调模型"；下方一张表：李孟哲引擎现有模块 → 新架构里的去处（保留/改造/新建），内容参考 `/tmp/claude-0/-home-user-xgen/61dff879-9f88-5ed2-80a0-37aef5f6ef93/scratchpad/artifact/agent-cost.html` 里的同类表。
- **运行监控**：子标签 Agent 调用 / 导演日志 / 世界状态 / 事件进度。
  - Agent 调用：新→旧列表（故事时间、Agent 类型色签：人物=accent、裁判=teal、记忆=violet、编剧=amber；谁、触发、档位、输入/缓存/输出 token、¥、耗时、模型/兜底）；点开看完整 prompt 和原始输出；人物调用显示隐私检查"只含她知道的 N 条事实 ✓"。
  - 导演日志：`st.directorLog` 新→旧。
  - 世界状态：变量表（`pkg.vars` 的 label + 当前值）、人物阶段（label + meaning）、**谁知道什么矩阵**（行 = Danny + cast，列 = 事实，格子写 看见/被告知/听说）、记忆卡。
  - 事件进度：按天列节点：未到 / 进行中（待回答）/ 已结算（结果 label）/ 没发生。
- **世界设定**：人物（每人一张可编辑卡：voice、habits、sampleLines、motive、goal、rules、never、fallbackLines；supporting 只读）+「AI 补全人物」（输入一句简介 → `app.writer` → 预览卡 → 加入草稿）；事件（按线分组只读：窗口、触发条件的人话摘要、意图、结果）；导演规则（D1–D6 文本 + 可改数字：主动消息上限、安静时段、每天危机上限、危机间隔）；内容边界（promptBlock 可改、硬线列表、越界输入列表、词表）。底部「保存草稿」（显示存到了哪里）、「用草稿重开一局」（页面内二次确认）。
- **成本**：按 Agent 类型的调用数、token、¥（价格表可切 mini/flash）；按故事日的表；"这一局到现在"总价和"折算每活跃用户每天"（= 本局总价 ÷ 已玩故事天数，至少按 1 天算）；对照我们之前的成本模型（旧架构重度 ¥1.07/天 → 新架构 ¥0.27/天）。注明：本原型实际跑在 Claude 上（看的人自己的额度），金额是按线上模型价格折算的估计。

## 13. 文案与设计

- 全部界面文案简体中文，白话；按钮写清动作（「发送」「过一会儿」「继续」「重新开始」「保存草稿」）。不要用 emoji 当标题标记。
- 颜色、字体、圆角只用 `base.css` 的 token。卡片样式按角色用，不要每块都加阴影。数字列用 `font-variant-numeric: tabular-nums`。
- 不能用 `alert/confirm/prompt`、`window.print`、`<a download>`。所有确认做在页面里。
- 宽 400px 时页面不许横向滚动；表格放在自己的 `overflow-x:auto` 容器里。
- 首屏就是能玩的状态：开场消息（作者写好的，不调模型）已经在手机里。

## 14. 测试与命令

- 单元：`node tests/kernel.test.mjs`、`node tests/agents.test.mjs`（用 `node:assert`，退出码非 0 即失败）。
- 本地预览：`node tests/serve.mjs [port]` 静态服务本目录，`/` 返回包上骨架的 `index.html`（模拟发布：`<!doctype html><html><head><meta charset=utf-8><meta name=viewport content="width=device-width,initial-scale=1,viewport-fit=cover"><style>:root{color-scheme:light;padding-top:env(safe-area-inset-top,0px);padding-bottom:env(safe-area-inset-bottom,0px)}body{margin:0;font:14px system-ui,sans-serif}img{max-width:100%}[hidden]{display:none!important}</style></head><body>` + 片段 + `</body></html>`）。
- 端到端：`node tests/e2e.mjs`，Playwright：`createRequire(import.meta.url)('/opt/node-tools/node_modules/playwright')`，`chromium.launch({ executablePath: '/opt/pw-browsers/chromium-1194/chrome-linux/chrome' })`；`tests/mock-claude.js` 用 `page.addInitScript` 注入假的 `window.claude.use`（sample 按 prompt 开头的【…】返回确定性结果：裁判在玩家原话等于某条例句时返回该意图并引原话）；另跑一遍不注入（离线兜底）。截图存到 scratchpad/ma-build/。
- 不要运行 `npm install`、任何构建工具。
