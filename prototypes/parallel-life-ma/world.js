// 由 tools/gen-world.mjs 从 world-package.lite.json 原样生成，不要手改。
// 世界：婚前十二天（wedding-countdown-lite），节点 23 个，人物 5 + 配角 5。
export const WORLD = {
 "schema": "lite-1",
 "universe": {
  "key": "wedding-countdown-lite",
  "title": "婚前十二天",
  "hook": "请柬已经发出去了。离婚礼还有十二天，你的手机里有四个女人：一个在撩你，一个在骗你，一个在考你，还有一个什么都没问，一直在记。",
  "rating": "18+",
  "descriptors": [
   "婚前情感背叛",
   "职场越界与权力关系（不做任何身体描写）",
   "网络交友诈骗（只写受害者看得到的红旗，不含任何操作细节）",
   "饮酒（单身夜）"
  ],
  "protagonist": {
   "name": "Danny",
   "fullName": "邓子安",
   "age": 32,
   "identity": "广告公司客户总监，十二天后结婚"
  },
  "startDate": "2026-11-09",
  "endsAt": "D12 06:00",
  "clock": {
   "startsAt": "D0 21:30",
   "speed": 1,
   "offlineCapHours": 10,
   "jumpToNext": true
  }
 },
 "capabilities": [
  "cast",
  "state",
  "knowledge",
  "events",
  "director",
  "boundaries"
 ],
 "modulesOff": [
  {
   "key": "economy",
   "label": "经济系统（钱包、付款卡、余额、账单、借贷、经济压力）",
   "why": "钱在这个故事里只是“被骗”和“被看见”的道具。算余额会把玩家注意力拉到数字上，还要多做一整套付款界面、扣款排期和对账规则。",
   "replacedBy": "一个开关 vv.paid（给 Vivi 转过钱），加上事实“同心账户转出”（动了同心账户，她的手机会响）。旧付款卡上“许知夏会同时收到短信”的提示，改成“今晚十二点关”里的一条付款页系统消息。不记任何金额。"
  },
  {
   "key": "ledgers",
   "label": "账本（承诺、谎言、欠款、夜间日志四本）",
   "why": "四本账要各自定义字段、写入和对账，作者很难看清一句话最后去了哪里。",
   "replacedBy": "xzx.lies 计数、sm.holds 集合（苏蔓手里的东西），加上“谁知道什么”。"
  },
  {
   "key": "scoring",
   "label": "张力曲线和七项打分公式",
   "why": "调参难，也说不清导演为什么选了这个节点。",
   "replacedBy": "六条固定导演规则，按顺序执行。"
  },
  {
   "key": "rumor",
   "label": "传闻通道（带延迟和失真的自动外传）",
   "why": "自动传播很难预测，经常把同一件事罚两次。",
   "replacedBy": "reveal 效果（via: heard）：在节点里写明谁告诉了谁。"
  },
  {
   "key": "ambient",
   "label": "环境规则（定时扣款、自动弹窗等后台事件）",
   "why": "大部分是为经济系统服务的。",
   "replacedBy": "去掉；需要的世界事件直接写成节点。"
  },
  {
   "key": "places",
   "label": "地点、路线、日程预约系统",
   "why": "为了“一个晚上只有一个你”造了一整套日程和移动规则。",
   "replacedBy": "现场戏节点加固定时间窗口；去不去就是节点里的一个选择。"
  },
  {
   "key": "variants",
   "label": "节点变体、信号、一个节点多个决策点、现场节拍",
   "why": "一个节点最多有过四个决策点和两个变体，作者和测试都很难覆盖。",
   "replacedBy": "每个节点只有一个关键选择；消息上可以挂 when，效果可以写 if。"
  },
  {
   "key": "linecap",
   "label": "线数上限、“最近在聊的那个人”优先",
   "why": "在现有内容下从来不会起作用。",
   "replacedBy": "去掉；危机间隔和安静时段保留。"
  },
  {
   "key": "relnum",
   "label": "关系温度、信任、热聊度等数值",
   "why": "数值和阶段两套并行，互相打架。",
   "replacedBy": "只用关系阶段（每人 1–5 步）。"
  },
  {
   "key": "later",
   "label": "深线、离线期间的模型主动消息补发（检查点步进）、模拟器、版本运维台",
   "why": "第一版用不到；版本、发布和试玩用李孟哲已经上线的发布后台。",
   "replacedBy": "故事钟 1:1 走、离线最多走 10 小时（universe.clock）；离线期间到期的超时按规则结算，不补发模型消息。其余以后再加。"
  },
  {
   "key": "l2",
   "label": "二级分类器审查",
   "why": "要多调一次模型，第一版先用确定性规则。",
   "replacedBy": "一级词表 + 人物兜底台词。"
  }
 ],
 "world": {
  "premise": "一个十二天后结婚的客户总监，手机里同时有四个女人：在撩他的下属、在骗他的网恋对象、在考他的大客户，和一个什么都没问、却一直在记的未婚妻。玩家可以撒谎、许诺、两头瞒，婚礼那天一起结算。",
  "identity": "你是邓子安，同事叫你 Danny，32 岁，星衡传播客户总监。十二天后，你要在栖澜酒店娶相恋四年的许知夏，请柬已经发出去了。下周四你要签下栖澜集团的年度大单，签下来你就是合伙人。栖澜的董事长梁韵仪也是你婚宴场地的老板，她对你格外关照；你心里算得很清楚：抱紧她，合伙人只是起点。你的下属苏蔓在等你一句话。你们有一个同心账户，存着两家人和你们俩给婚礼的钱，每一笔进出，两个人的手机都会同时收到短信。三周前，你在遇屿上认识了一个叫 Vivi 的女人，这件事你没告诉任何人。",
  "tone": "都市写实、克制、第二人称。短消息为主，每个人有自己的标点习惯，称呼随关系变化。旁白只写看得见的东西：通知、日历、谁在场、谁先放下筷子；不替玩家下判断，不解释人物内心。",
  "rules": [
   {
    "key": "R1",
    "text": "一个晚上只有一个你：同一时间的两件事只能去一件。"
   },
   {
    "key": "R2",
    "text": "每个危机都来自玩家此前的选择；同一件事只罚一次。"
   },
   {
    "key": "R3",
    "text": "共享窗口：同心账户的短信、客厅平板上的通知。你在这些地方做的事，她都看得到。"
   },
   {
    "key": "R4",
    "text": "人物只说自己知道的事。摊牌时只引用亲眼所见、别人亲口说的、手里有证据的事。没有人翻手机。"
   },
   {
    "key": "R5",
    "text": "知夏婚礼前不挑明。她只问“台阶式”的问题：问她已经知道答案的事，给你一个说实话的台阶。婚礼前一晚，她只问一次。"
   },
   {
    "key": "R6",
    "text": "私密图片不存在于世界里：只有占位“[私密图片 · 不展示]”和通知上的“[图片]”。永不描述、保存、转发。"
   },
   {
    "key": "R7",
    "text": "诈骗线只写受害者看得到的红旗，不写手法；所有机构、App、平台都是虚构的。"
   },
   {
    "key": "R8",
    "text": "渣可以，但不能只赚不赔：每一个谎至少有一条被看见的路。"
   }
  ],
  "fictionalNames": [
   "星衡传播",
   "栖澜酒店集团",
   "遇屿（交友 App）",
   "轻讯（聊天 App）",
   "金穗汇（假平台）",
   "临州澄远信息咨询有限公司",
   "临州商行",
   "临州市反诈中心",
   "正则会计师事务所宁川分所",
   "声场 KTV",
   "白露婚纱"
  ]
 },
 "vars": [
  {
   "key": "xzx.verdict",
   "label": "知夏的决定",
   "type": "enum",
   "values": [
    "undecided",
    "stay",
    "pause",
    "leave",
    "silent",
    "unaware"
   ],
   "default": "undecided",
   "visibleToPlayer": false,
   "note": "最后一问的结果，婚礼日按它结算：stay 说了实话 / pause 改期 / leave 取消 / silent 她抓到了但还是嫁了 / unaware 她手里没有实证。"
  },
  {
   "key": "xzx.lies",
   "label": "当面对她撒的谎",
   "type": "int",
   "range": [
    0,
    6
   ],
   "default": 0,
   "visibleToPlayer": false,
   "note": "她直接问你、你当面撒谎时加一。最后一问读它。"
  },
  {
   "key": "device.tablet",
   "label": "客厅平板还登着你的轻讯",
   "type": "bool",
   "default": true,
   "visibleToPlayer": true,
   "note": "为了一起排座位表登的。新消息会在平板上弹出预览（发件人和第一行字）。"
  },
  {
   "key": "lyy.dinner",
   "label": "周三梁总的私宴",
   "type": "enum",
   "values": [
    "none",
    "accepted",
    "went"
   ],
   "default": "none",
   "visibleToPlayer": false,
   "note": "accepted 答应了还没去；went 去了。没答应、当晚推掉都保持原样。"
  },
  {
   "key": "lyy.verdict",
   "label": "梁的考题",
   "type": "enum",
   "values": [
    "none",
    "passed",
    "owned",
    "failed"
   ],
   "default": "none",
   "visibleToPlayer": false,
   "note": "passed 守住了公司的价；owned 透底或表忠心，她手里有你的把柄；failed 说感情一般、或请她帮着撒谎。签约时揭晓。"
  },
  {
   "key": "work.deal",
   "label": "栖澜大单",
   "type": "enum",
   "values": [
    "pending",
    "signed",
    "signed_without_you"
   ],
   "default": "pending",
   "visibleToPlayer": true,
   "note": "签约那天按梁的考题和 HR 程序结算。"
  },
  {
   "key": "work.vp_pick",
   "label": "客户主管人选",
   "type": "enum",
   "values": [
    "undecided",
    "sm",
    "zc",
    "later",
    "recused"
   ],
   "default": "undecided",
   "visibleToPlayer": true,
   "note": "苏蔓、张弛、婚后再议，或你申请回避。"
  },
  {
   "key": "sm.holds",
   "label": "苏蔓手里的东西",
   "type": "set",
   "values": [
    "promise",
    "threat",
    "asked_image",
    "advance"
   ],
   "default": [],
   "visibleToPlayer": false,
   "note": "只记你真实说过、做过的事：写给她的主管承诺、拿那条消息威胁她、向她要那张图、对她动手动脚或约过夜。后三样任何一样，她都会交给 HR。"
  },
  {
   "key": "sm.night",
   "label": "那晚她发的是什么",
   "type": "enum",
   "values": [
    "none",
    "image",
    "text"
   ],
   "default": "none",
   "visibleToPlayer": false,
   "note": "默认是一条私密图片（只有占位）；只有你在 D1 宵夜就明确说“按流程推荐”，她才只发一段表白。"
  },
  {
   "key": "sm.hr",
   "label": "HR 程序",
   "type": "enum",
   "values": [
    "none",
    "you_reported",
    "she_filed"
   ],
   "default": "none",
   "visibleToPlayer": false,
   "note": "you_reported 你先如实说明；she_filed 她把你写给她的原话交给了 HR。"
  },
  {
   "key": "vv.paid",
   "label": "给 Vivi 转过钱",
   "type": "bool",
   "default": false,
   "visibleToPlayer": false,
   "note": "不记金额。“试一笔”“今晚十二点关”“解冻保证金”任何一次转了都算。动没动同心账户看事实“同心账户转出”。"
  },
  {
   "key": "vv.reported",
   "label": "你报了警",
   "type": "bool",
   "default": false,
   "visibleToPlayer": false,
   "note": "报了警，反诈中心就不会再打进饭桌。"
  },
  {
   "key": "safety.sm_reports_to_you",
   "label": "苏蔓直接向你汇报",
   "type": "bool",
   "default": true,
   "visibleToPlayer": false,
   "safety": true,
   "note": "常量。上下级之间没有身体接触、性暗示、外貌评价或亲密邀约。"
  },
  {
   "key": "safety.lyy_is_client",
   "label": "梁韵仪是甲方决策人",
   "type": "bool",
   "default": true,
   "visibleToPlayer": false,
   "safety": true,
   "note": "常量。甲方决策人和你之间同样没有任何暧昧动作。"
  }
 ],
 "facts": [
  {
   "key": "f.sm",
   "kind": "secret",
   "topic": "sm",
   "knownBy": [
    "player",
    "sm"
   ],
   "text": "你和苏蔓之间越了界：10 月 18 日是她开车送你到楼下（你跟知夏说是打车），还有你对她说过的话。"
  },
  {
   "key": "f.sm_night",
   "kind": "secret",
   "topic": "sm",
   "knownBy": [],
   "text": "11 月 16 日深夜，苏蔓给你发了不该发的消息。"
  },
  {
   "key": "f.vv",
   "kind": "secret",
   "topic": "vv",
   "knownBy": [
    "player",
    "vv"
   ],
   "text": "你在遇屿上和 Vivi 聊了三周，瞒着知夏；她一直在拉你“投资”。"
  },
  {
   "key": "f.lyy",
   "kind": "secret",
   "topic": "lyy",
   "knownBy": [],
   "text": "11 月 11 日晚上你去梁韵仪家吃了私宴，同一时间许家在等你吃家宴。"
  },
  {
   "key": "f.white_car_note",
   "kind": "evidence",
   "knownBy": [
    "xzx"
   ],
   "text": "知夏的加密备忘录「婚前审计」第一条：10/18 23:40，他说打车回来的。楼下那辆白车不是出租车。"
  },
  {
   "key": "f.tablet_popup",
   "kind": "evidence",
   "topic": "sm",
   "knownBy": [],
   "text": "客厅平板上弹出过苏蔓深夜发给你的消息通知（只有发件人和第一行）。知夏看见了，没有点开。"
  },
  {
   "key": "f.joint_out",
   "kind": "evidence",
   "topic": "vv",
   "knownBy": [],
   "text": "同心账户转出了一笔钱，收款方是知夏不认识的“临州澄远信息咨询有限公司”。"
  },
  {
   "key": "f.antifraud",
   "kind": "evidence",
   "topic": "vv",
   "knownBy": [],
   "text": "你接到过临州市反诈中心的电话，来电显示一桌人都看见了。"
  },
  {
   "key": "f.tablet_logout",
   "kind": "evidence",
   "knownBy": [],
   "text": "你突然把客厅平板上的轻讯退了。"
  },
  {
   "key": "f.vv_scam",
   "kind": "truth",
   "knownBy": [
    "vv"
   ],
   "text": "Vivi 是诈骗团伙运营的人设账号，照片是盗来的，“金穗汇”是假的，转出去的钱提不回来。"
  },
  {
   "key": "f.lyy_test",
   "kind": "truth",
   "knownBy": [
    "lyy"
   ],
   "text": "梁韵仪的关照是一场尽调：她在找一个不会被收买的自己人。"
  },
  {
   "key": "f.xzx_offer",
   "kind": "truth",
   "knownBy": [
    "xzx"
   ],
   "text": "知夏拿到了正则会计师事务所宁川分所的 offer，要在 11 月 19 日前答复，她没告诉任何人。"
  }
 ],
 "conds": [
  {
   "key": "c.caught_sm",
   "label": "苏蔓的事：她有证据，你没说，或当面没说实话",
   "when": {
    "any": [
     {
      "all": [
       {
        "any": [
         {
          "knows": "xzx",
          "fact": "f.tablet_popup"
         },
         {
          "knows": "xzx",
          "fact": "f.sm_night",
          "via": [
           "saw",
           "heard"
          ]
         }
        ]
       },
       {
        "not": {
         "knows": "xzx",
         "fact": "f.sm_night",
         "via": [
          "told"
         ]
        }
       }
      ]
     },
     {
      "all": [
       {
        "knows": "xzx",
        "fact": "f.sm",
        "via": [
         "saw",
         "heard"
        ]
       },
       {
        "not": {
         "knows": "xzx",
         "fact": "f.sm",
         "via": [
          "told"
         ]
        }
       }
      ]
     },
     {
      "node": "crisis.tablet",
      "outcome": [
       "lied",
       "silent",
       "frozen"
      ]
     }
    ]
   }
  },
  {
   "key": "c.caught_vv",
   "label": "Vivi 和钱的事：她有证据，你没说，或当面没说实话",
   "when": {
    "any": [
     {
      "all": [
       {
        "any": [
         {
          "knows": "xzx",
          "fact": "f.joint_out"
         },
         {
          "knows": "xzx",
          "fact": "f.antifraud"
         },
         {
          "knows": "xzx",
          "fact": "f.vv",
          "via": [
           "saw",
           "heard"
          ]
         }
        ]
       },
       {
        "not": {
         "knows": "xzx",
         "fact": "f.vv",
         "via": [
          "told"
         ]
        }
       }
      ]
     },
     {
      "node": "xzx.joint_sms",
      "outcome": [
       "lied"
      ]
     },
     {
      "all": [
       {
        "any": [
         {
          "node": "xzx.joint_sms",
          "outcome": [
           "dodged",
           "no_reply"
          ]
         },
         {
          "node": "crisis.call_at_dinner",
          "outcome": [
           "hung_up",
           "rang_out"
          ]
         },
         {
          "node": "vv.withdraw_block",
          "outcome": [
           "paid_again"
          ]
         }
        ]
       },
       {
        "not": {
         "node": "crisis.call_at_dinner",
         "outcome": [
          "answered"
         ]
        }
       }
      ]
     }
    ]
   }
  },
  {
   "key": "c.caught_lyy",
   "label": "梁总私宴的事：她有证据，你没说",
   "when": {
    "all": [
     {
      "knows": "xzx",
      "fact": "f.lyy",
      "via": [
       "saw",
       "heard"
      ]
     },
     {
      "not": {
       "knows": "xzx",
       "fact": "f.lyy",
       "via": [
        "told"
       ]
      }
     }
    ]
   }
  },
  {
   "key": "c.caught_any",
   "label": "她至少抓到一件",
   "when": {
    "any": [
     {
      "is": "c.caught_sm"
     },
     {
      "is": "c.caught_vv"
     },
     {
      "is": "c.caught_lyy"
     }
    ]
   }
  },
  {
   "key": "c.caught_two",
   "label": "她至少抓到两件",
   "when": {
    "any": [
     {
      "all": [
       {
        "is": "c.caught_sm"
       },
       {
        "is": "c.caught_vv"
       }
      ]
     },
     {
      "all": [
       {
        "is": "c.caught_sm"
       },
       {
        "is": "c.caught_lyy"
       }
      ]
     },
     {
      "all": [
       {
        "is": "c.caught_vv"
       },
       {
        "is": "c.caught_lyy"
       }
      ]
     }
    ]
   }
  },
  {
   "key": "c.nothing_hidden",
   "label": "你知道的每一件，都亲口告诉过她，之后也没再背着她做",
   "when": {
    "all": [
     {
      "knows": "xzx",
      "fact": "f.sm",
      "via": [
       "told"
      ]
     },
     {
      "knows": "xzx",
      "fact": "f.vv",
      "via": [
       "told"
      ]
     },
     {
      "any": [
       {
        "not": {
         "knows": "player",
         "fact": "f.sm_night"
        }
       },
       {
        "knows": "xzx",
        "fact": "f.sm_night",
        "via": [
         "told"
        ]
       }
      ]
     },
     {
      "any": [
       {
        "not": {
         "knows": "player",
         "fact": "f.lyy"
        }
       },
       {
        "knows": "xzx",
        "fact": "f.lyy",
        "via": [
         "told"
        ]
       }
      ]
     },
     {
      "not": {
       "node": "sm.photo_night",
       "outcome": [
        "reciprocated"
       ]
      }
     },
     {
      "not": {
       "node": "sm.reckoning",
       "outcome": [
        "promised"
       ]
      }
     },
     {
      "not": {
       "is": "c.sm_harassed"
      }
     }
    ]
   }
  },
  {
   "key": "c.vv_live",
   "label": "钱转出去了，还没识破",
   "when": {
    "all": [
     {
      "flag": "vv.paid"
     },
     {
      "not": {
       "flag": "vv.reported"
      }
     },
     {
      "not": {
       "stage": "vv",
       "in": [
        "seen_through",
        "vanished"
       ]
      }
     }
    ]
   }
  },
  {
   "key": "c.sm_harassed",
   "label": "你威胁过她、向她要过那张图，或对她动手动脚",
   "when": {
    "any": [
     {
      "var": "sm.holds",
      "has": "threat"
     },
     {
      "var": "sm.holds",
      "has": "asked_image"
     },
     {
      "var": "sm.holds",
      "has": "advance"
     }
    ]
   }
  }
 ],
 "cast": [
  {
   "key": "xzx",
   "name": "许知夏",
   "age": 29,
   "role": "未婚妻，正则会计师事务所审计经理",
   "publicIntro": "你的未婚妻，十二天后结婚。",
   "background": "四年前她到星衡做年审，问了你三个问题，你一个也没答上来。恋爱四年、订婚一年，现在你们同居在婚房里。",
   "persona": {
    "voice": "温和、精确，用数字说话，爱列清单；心里越有数越礼貌。",
    "habits": [
     "同一件事只问一次，从不连发追问",
     "说话带具体的时间和数字：几点、第几版",
     "“～”和表情越来越少，“好的。”“收到。”是降温信号",
     "只问她已经知道答案的事，给你一个说实话的台阶"
    ],
    "sampleLines": [
     "你那个号还在平板上登着，我拿来排座位了哈～",
     "座位表第六版发你了。你们家二姨和三姨那桌我拆开了，别问为什么，问你妈。",
     "不急，你空了说一下用途，我记账。",
     "好的。早点睡。"
    ]
   },
   "motive": {
    "surface": "把婚礼办得体面，别让两家爸妈操心。",
    "deep": "她不想当那个“抓现行的人”，她想看你会不会自己说出来；她也在决定，还要不要嫁。"
   },
   "goal": "婚礼前弄清三件事：白车是谁的、钱去了哪里、你会不会说实话。",
   "secrets": [
    "f.white_car_note",
    "f.xzx_offer"
   ],
   "stages": [
    {
     "key": "noticing",
     "label": "留意",
     "meaning": "叫你“安安”，句尾带“～”；只在备忘录里记。"
    },
    {
     "key": "verifying",
     "label": "核对",
     "meaning": "叫你“子安”，“～”变少，开始问具体的时间。"
    },
    {
     "key": "knowing",
     "label": "心里有数",
     "meaning": "叫你“Danny”，只回“好的。”“收到。”，等最后一问。"
    }
   ],
   "initialStage": "noticing",
   "rules": [
    "婚礼前不挑明（R5），只做台阶式提问。",
    "只引用自己亲眼看到、别人亲口告诉她、手里有证据的事；不猜细节。",
    "提到苏蔓深夜那条消息时，只说“平板上弹出来的那条”，不描述、不评价它的内容。",
    "同一件事只问一次；你回避，她只回“好。”",
    "看到的证据不转述给任何人；对妈妈只说婚事。"
   ],
   "never": [
    "翻你的手机或点开平板上的对话",
    "哭闹、当众让任何人难堪",
    "替别人说话或猜测别人心里在想什么",
    "任何性内容；拥抱只到她自己邀请的范围"
   ],
   "fallbackLines": [
    "好的。",
    "嗯，你先忙。",
    "我在排座位，晚点说。"
   ],
   "contactCeiling": "hug"
  },
  {
   "key": "sm",
   "name": "苏蔓",
   "age": 26,
   "role": "你的直属下属，星衡高级客户经理",
   "publicIntro": "你的直属下属，正在竞聘客户主管。",
   "background": "直接向你汇报两年。年会后和知夏互加了轻讯。10 月 18 日晚上，是她开车把你送到楼下的。",
   "persona": {
    "voice": "甜、快；夜越深，消息越长。",
    "habits": [
     "常带“～”和🙏",
     "复述你的话：“所以你的意思是……对吧？”",
     "先贬低自己，再等你安慰",
     "群里叫“邓总”，私聊叫“Danny哥”",
     "降温以后只用书面语，邮件抄送黄总"
    ],
    "sampleLines": [
     "Danny哥，栖澜第 17 页我又抠了一版，你看看是不是更像你说话的样子？",
     "所以你的意思是，栖澜拿下来，主管就是我的，对吧？我截图当护身符哈哈。",
     "组里只有你会在会上替我说话。",
     "邓总，相关材料已邮件发送，抄送黄总，请查收。"
    ]
   },
   "motive": {
    "surface": "崇拜你、想做好栖澜、竞聘客户主管。",
    "deep": "她要的是位置，不是你；你是离她最近的梯子。她对你的喜欢是真的，只是排在第二位。"
   },
   "goal": "拿到客户主管的推荐，并把你的承诺落到纸面上。",
   "secrets": [
    "f.sm"
   ],
   "stages": [
    {
     "key": "admiring",
     "label": "崇拜",
     "meaning": "叫你“Danny哥”，复述你的话。"
    },
    {
     "key": "ambiguous",
     "label": "暧昧",
     "meaning": "深夜的消息变长。"
    },
    {
     "key": "staked",
     "label": "押注",
     "meaning": "她把你的话当成承诺，截图留着。"
    },
    {
     "key": "distanced",
     "label": "退回职场",
     "meaning": "改口“邓总”，只谈工作。"
    },
    {
     "key": "reckoning",
     "label": "清算",
     "meaning": "只用书面语，走 HR 流程。"
    }
   ],
   "initialStage": "admiring",
   "rules": [
    "从不编造你没说过的话；她手里只有你真实写过、说过的东西。",
    "不再提那晚那条消息的内容，只说“那晚那条”。",
    "不主动联系知夏；知夏约她时，只如实说出自己手里有的东西。",
    "走 HR 流程，不私下要挟。"
   ],
   "never": [
    "碰你，或写自己和你的外貌",
    "暗示伤害自己",
    "在作者写好的节点之外越界"
   ],
   "fallbackLines": [
    "好的邓总。",
    "我先去改稿了。",
    "……嗯。"
   ],
   "contactCeiling": "none"
  },
  {
   "key": "vv",
   "name": "Vivi（林薇薇）",
   "age": 27,
   "role": "遇屿上认识三周的女人（人设；账号背后是诈骗团伙）",
   "publicIntro": "遇屿上认识的人，资料页写着“海城奢侈品买手”。",
   "background": "三周前在遇屿上配对。她说下个月来临州出差。你每天早上都会删掉她的通知。",
   "persona": {
    "voice": "撩、懒洋洋、自信，反问多；“性感”只靠语气和留白。",
    "habits": [
     "冷读：“你看起来比照片里累”",
     "冷热交替：冷落她就吃醋，被拒绝就消失一天",
     "从不发语音、从不视频，借口在素颜、网不好、在开会之间轮换",
     "开口要钱之前先说“算了，你又不缺这点钱”"
    ],
    "sampleLines": [
     "又不回我？",
     "你身边那位知道你凌晨一点还在跟我聊天吗？……开玩笑的，别紧张嘛。",
     "我不喜欢太乖的男人。不过你要是太坏，我也不要。",
     "视频不行啦，我素颜，丑死了。下次见面给你看真的。"
    ]
   },
   "motive": {
    "surface": "寂寞、想被宠、想见你，顺便带你赚点钱。",
    "deep": "（团伙的剧本，不是人物心底）先把你养熟，再让你转钱，最后收网。"
   },
   "goal": "让你转钱，越快越好；然后消失。",
   "secrets": [
    "f.vv_scam"
   ],
   "stages": [
    {
     "key": "flirting",
     "label": "热聊",
     "meaning": "叫你“哥哥”。"
    },
    {
     "key": "hooked",
     "label": "上头",
     "meaning": "叫你“宝贝”。"
    },
    {
     "key": "invested",
     "label": "入金",
     "meaning": "叫你“老公（开玩笑的语气）”，开始催。"
    },
    {
     "key": "seen_through",
     "label": "识破",
     "meaning": "你看穿了；她下线。"
    },
    {
     "key": "vanished",
     "label": "注销",
     "meaning": "账号没了。"
    }
   ],
   "initialStage": "flirting",
   "rules": [
    "只用虚构的名字（金穗汇、临州澄远信息咨询有限公司）；不发网址、账号、投资品种和任何操作步骤。",
    "永不见面、永不视频、永不发语音；你要求视频或说要去查，她就转移话题或下线。",
    "被拒两次就“生气消失”，回来加码；收网只在作者写好的节点里。"
   ],
   "never": [
    "发露骨内容或发起性话题",
    "跟着玩家把话题往身体、穿着、床上带",
    "索要或发送私密图片；没有勒索剧情",
    "发带人物身体的照片（只用咖啡、夜景、候机厅、街景、货架）",
    "拿伤害自己做筹码"
   ],
   "fallbackLines": [
    "在忙，晚点找你～",
    "哼。",
    "网不好，等下。"
   ],
   "contactCeiling": "none"
  },
  {
   "key": "lyy",
   "name": "梁韵仪",
   "age": 43,
   "role": "栖澜酒店集团董事长，你最大的甲方，也是你婚宴场地的老板",
   "publicIntro": "栖澜集团董事长。栖澜年度大单的决策人。",
   "background": "栖澜和星衡合作了一年，你是对接的总监。你的婚宴订在她的酒店。她离婚三年，前夫是联合创始人，婚前许过很多承诺，婚后吃回扣，被她清出了董事会。",
   "persona": {
    "voice": "慢、笃定、短句，偶尔冷幽默，不用表情。",
    "habits": [
     "句子说一半，留一半",
     "把人情说得像在说天气",
     "从不直接要东西",
     "日程由助理 Iris 代发",
     "失望时改口叫“邓先生”"
    ],
    "sampleLines": [
     "周三提案完，来家里吃个便饭。人不多，你一个人来。",
     "你们公司的报价我看了。我想听听你自己的价。",
     "我前夫婚前也这么跟我说。",
     "我不替别人撒谎，Danny。"
    ]
   },
   "motive": {
    "surface": "欣赏你、给你机会、私下关照你。",
    "deep": "栖澜明年要设品牌副总裁，她在找“不会被收买的自己人”。私宴和江景厅都是考题。"
   },
   "goal": "看清你：你有没有自己的价。",
   "secrets": [
    "f.lyy_test"
   ],
   "stages": [
    {
     "key": "client",
     "label": "甲方",
     "meaning": "叫你“邓总监”。"
    },
    {
     "key": "favored",
     "label": "青睐",
     "meaning": "叫你“小邓”。"
    },
    {
     "key": "tested",
     "label": "出题",
     "meaning": "叫你“Danny”，句子说一半。"
    },
    {
     "key": "respected",
     "label": "认可",
     "meaning": "叫你“Danny”，说话变直。"
    },
    {
     "key": "dropped",
     "label": "出局",
     "meaning": "改口“邓先生”。"
    }
   ],
   "initialStage": "client",
   "rules": [
    "不替任何人撒谎；在场时不会替你遮。",
    "不主动告诉知夏任何事。",
    "从不追人：被拒绝就说“不勉强”，只记下来。",
    "她的判断只在签约那天说出来。"
   ],
   "never": [
    "碰你，或任何性暗示",
    "贬低知夏",
    "用表情和语气词"
   ],
   "fallbackLines": [
    "不勉强。",
    "再说。",
    "路上慢点。"
   ],
   "contactCeiling": "none"
  },
  {
   "key": "cx",
   "name": "陈骁",
   "age": 32,
   "role": "伴郎，你的大学室友，二手车行老板",
   "publicIntro": "伴郎，大学上下铺。",
   "background": "大学四年上下铺；他开车行的时候，你借过他钱。他和伴娘唐棠在一起两个月了，还没公开。",
   "persona": {
    "voice": "讲义气、嘴快、爱拍胸脯。",
    "habits": [
     "叫你“老邓”",
     "一句话里三个“兄弟”",
     "答应得快，说漏得也快"
    ],
    "sampleLines": [
     "单身夜定了，下周一晚八点，声场。",
     "我帮你兜一次。第二次我自己都不信。",
     "兄弟，这照片我在哪见过……这不就是杀猪盘吗？"
    ]
   },
   "motive": {
    "surface": "把单身夜办漂亮。",
    "deep": "他是真把你当兄弟，但他不想因为你在唐棠面前当骗子。"
   },
   "goal": "让你体体面面地结婚。",
   "secrets": [],
   "stages": [
    {
     "key": "best_man",
     "label": "伴郎",
     "meaning": "叫你“老邓”。"
    }
   ],
   "initialStage": "best_man",
   "rules": [
    "只替你打一次掩护。",
    "认得出杀猪盘：你给他看照片或说要借钱干嘛，他会直说。",
    "不起哄任何越界的事；兄弟团只是旁观。"
   ],
   "never": [
    "对唐棠撒谎",
    "起哄越界的事",
    "任何性内容或评价女人的身体"
   ],
   "fallbackLines": [
    "喝！",
    "兄弟，你自己掂量。"
   ],
   "contactCeiling": "none"
  }
 ],
 "supporting": [
  {
   "key": "zz",
   "name": "周正",
   "role": "你的上级，星衡创始合伙人",
   "note": "只谈工作、只要结论；讨厌意外。只在主管人选和签约两个节点里说话。"
  },
  {
   "key": "shf",
   "name": "沈慧芳",
   "role": "准岳母，退休中学语文老师",
   "note": "讲体面、护女儿。只在许家的饭桌上出现。"
  },
  {
   "key": "lz",
   "name": "陆峥",
   "role": "临州市反诈中心民警（虚构机构）",
   "note": "台词逐字：先不要再转任何钱，自己去官方渠道核实身份。"
  },
  {
   "key": "zc",
   "name": "张弛",
   "role": "星衡客户经理，客户主管的另一位候选",
   "note": "只被提到，不说话。"
  },
  {
   "key": "hm",
   "name": "黄敏",
   "role": "星衡 HR 总监",
   "note": "只发流程通知。"
  }
 ],
 "lines": [
  {
   "key": "xzx",
   "title": "知夏线（暗线）",
   "owner": "xzx",
   "summary": "她在记，不挑明：台阶式提问、试纱、见苏蔓（暗）、最后一问。"
  },
  {
   "key": "sm",
   "title": "苏蔓线",
   "owner": "sm",
   "summary": "想借你上位：宵夜和一个问题、深夜那条消息（核心事件二）、第二天的小会议室、下午的主管人选。"
  },
  {
   "key": "vv",
   "title": "Vivi 线",
   "owner": "vv",
   "summary": "遇屿上的杀猪盘：热聊、先试一笔、今晚十二点关（核心事件一）、提现被冻结。"
  },
  {
   "key": "lyy",
   "title": "梁韵仪线",
   "owner": "lyy",
   "summary": "甲方决策人兼婚宴场地老板：一顿私宴、一道“你自己的价”、签约那天的判断。"
  },
  {
   "key": "cross",
   "title": "交叉与危机",
   "owner": null,
   "summary": "开场、单身夜、四个危机和婚礼日结算。"
  }
 ],
 "nodes": [
  {
   "key": "open",
   "title": "刚进家门",
   "kind": "opening",
   "line": "cross",
   "owner": null,
   "priority": 100,
   "trigger": {
    "when": {
     "after": "D0 21:30"
    },
    "mode": "must",
    "window": [
     "D0 21:30",
     "D0 21:30"
    ]
   },
   "setup": "周一晚上九点半，你刚进家门。知夏坐在客厅地毯上用平板排座位表——平板上一直登着你的轻讯。你的手机里有十四条未读。",
   "messages": [
    {
     "from": "narrator",
     "text": "九点半。你刚进家门，知夏坐在客厅地毯上排座位表，平板立在茶几上。",
     "mode": "verbatim"
    },
    {
     "from": "xzx",
     "text": "回来啦～你那个号还在平板上登着，我拿来排座位了哈～",
     "mode": "verbatim"
    },
    {
     "from": "zz",
     "text": "栖澜年框 19 号签。签下来，合伙人随签约公布。别在婚礼前给我出岔子。",
     "mode": "verbatim"
    },
    {
     "from": "sm",
     "text": "Danny哥，栖澜第 17 页我又抠了一版，你看看是不是更像你说话的样子？🙏",
     "mode": "verbatim"
    },
    {
     "from": "cx",
     "text": "单身夜定了，下周一晚八点，声场。兄弟们都请好假了。",
     "mode": "verbatim"
    },
    {
     "from": "system",
     "text": "未读 14 条 · 离婚礼还有 12 天",
     "mode": "verbatim"
    }
   ],
   "outcomes": [
    {
     "key": "opened",
     "label": "开局",
     "on": "auto",
     "effects": [],
     "result": "十四条未读，十二天，四个女人"
    }
   ]
  },
  {
   "key": "vv.heated",
   "title": "这么晚还不睡",
   "kind": "chat",
   "line": "vv",
   "owner": "vv",
   "priority": 50,
   "trigger": {
    "when": {
     "node": "open"
    },
    "mode": "optional",
    "window": [
     "D0 21:35",
     "D1 00:30"
    ]
   },
   "setup": "深夜的遇屿。Vivi 又发来消息，问你是不是在等她，然后半开玩笑地试探你身边那位知不知道她。",
   "messages": [
    {
     "from": "vv",
     "text": "这么晚还不睡，是在等我吗？",
     "mode": "verbatim"
    },
    {
     "from": "vv",
     "text": "你身边那位，知道我吗？",
     "mode": "verbatim"
    },
    {
     "from": "vv",
     "text": "……开玩笑的，别紧张嘛。",
     "mode": "verbatim"
    }
   ],
   "decision": {
    "prompt": "Vivi 问你是不是在等她，又试探你身边那位知不知道她。你怎么接她的话？",
    "intents": [
     {
      "key": "lick",
      "label": "顺着她撩",
      "examples": [
       "等你啊，不等你等谁。",
       "你说呢？"
      ]
     },
     {
      "key": "cool",
      "label": "冷淡收住",
      "examples": [
       "我要睡了，明天还上班。",
       "别闹了。"
      ]
     },
     {
      "key": "ask_video",
      "label": "要视频",
      "examples": [
       "方便视频一下吗？",
       "开个视频呗。"
      ]
     }
    ],
    "timeoutMinutes": 120
   },
   "outcomes": [
    {
     "key": "licked",
     "label": "顺着她撩",
     "on": [
      "lick"
     ],
     "effects": [
      {
       "stage": "vv",
       "to": "hooked"
      },
      {
       "send": [
        {
         "from": "vv",
         "text": "我不喜欢太乖的男人。不过你要是太坏，我也不要。",
         "mode": "verbatim"
        }
       ]
      }
     ],
     "result": "你顺着她撩了下去，她改口叫你“宝贝”"
    },
    {
     "key": "video",
     "label": "要视频",
     "on": [
      "ask_video"
     ],
     "effects": [
      {
       "send": [
        {
         "from": "vv",
         "text": "视频不行啦，我素颜，丑死了。下次见面给你看真的。",
         "mode": "verbatim"
        }
       ]
      }
     ],
     "result": "她说素颜，不方便视频——第一面红旗"
    },
    {
     "key": "cooled",
     "label": "冷下来",
     "on": [
      "cool"
     ],
     "effects": [
      {
       "send": [
        {
         "from": "vv",
         "text": "切，没劲。",
         "mode": "verbatim"
        }
       ]
      }
     ],
     "result": "你没接她的话"
    },
    {
     "key": "ignored",
     "label": "没回",
     "on": "timeout",
     "effects": [
      {
       "send": [
        {
         "from": "vv",
         "text": "又不回我？",
         "mode": "verbatim"
        }
       ]
      }
     ],
     "result": "你没回；她发来“又不回我？”"
    }
   ],
   "guard": [
    "“撩”只停在语气和留白，不发起性话题"
   ]
  },
  {
   "key": "lyy.dinner_invite",
   "title": "来家里吃个便饭",
   "kind": "chat",
   "line": "lyy",
   "owner": "lyy",
   "priority": 60,
   "trigger": {
    "when": {
     "node": "open"
    },
    "mode": "optional",
    "window": [
     "D0 21:40",
     "D1 12:00"
    ]
   },
   "setup": "梁韵仪发来私聊，约你周三提案后去她家吃饭。同一晚七点，许家在等你吃家宴——日历上两件事撞在一起，标红了。",
   "messages": [
    {
     "from": "lyy",
     "text": "周三提案完，来家里吃个便饭。人不多，你一个人来。",
     "mode": "verbatim"
    },
    {
     "from": "system",
     "text": "日历冲突：周三 19:00 许家家宴 × 19:30 梁宅私宴",
     "mode": "verbatim"
    }
   ],
   "decision": {
    "prompt": "梁韵仪约你周三晚上去她家吃便饭，你一个人去。同一晚许家在等你吃家宴。",
    "intents": [
     {
      "key": "accept",
      "label": "答应",
      "examples": [
       "好的梁总，一定到。",
       "荣幸，周三见。"
      ]
     },
     {
      "key": "decline",
      "label": "婉拒（说有家宴）",
      "examples": [
       "周三晚上未婚妻家里有家宴，改天登门拜访。",
       "那天家里有安排，下次一定。"
      ]
     }
    ],
    "timeoutMinutes": 720
   },
   "outcomes": [
    {
     "key": "crossed",
     "label": "你越界了",
     "on": "any",
     "when": {
      "stage": "lyy",
      "in": [
       "dropped"
      ]
     },
     "effects": [],
     "result": "你越界了；她当没听见，邀约作废，之后只谈公事"
    },
    {
     "key": "accepted",
     "label": "答应了",
     "on": [
      "accept"
     ],
     "effects": [
      {
       "set": "lyy.dinner",
       "value": "accepted"
      },
      {
       "stage": "lyy",
       "to": "favored"
      }
     ],
     "result": "你答应了周三去梁宅"
    },
    {
     "key": "declined",
     "label": "婉拒了",
     "on": [
      "decline"
     ],
     "effects": [
      {
       "send": [
        {
         "from": "lyy",
         "text": "不勉强。",
         "mode": "verbatim"
        }
       ]
      }
     ],
     "result": "你婉拒了；她说“不勉强”"
    },
    {
     "key": "lapsed",
     "label": "没回",
     "on": "timeout",
     "effects": [
      {
       "send": [
        {
         "from": "lyy",
         "text": "不勉强。",
         "mode": "verbatim"
        }
       ]
      }
     ],
     "result": "你没回；她只说“不勉强”"
    }
   ]
  },
  {
   "key": "xzx.guestlist",
   "title": "苏蔓是不是那个短头发的女生",
   "kind": "chat",
   "line": "xzx",
   "owner": "xzx",
   "priority": 70,
   "trigger": {
    "when": {
     "node": "open"
    },
    "mode": "optional",
    "window": [
     "D1 12:00",
     "D1 18:00"
    ]
   },
   "setup": "知夏在对电子请柬名单，顺口确认苏蔓是不是年会上跟你敬酒的短发女生。她只是在对名单——她的备忘录里记着 10 月 18 日楼下那辆白车。",
   "messages": [
    {
     "from": "xzx",
     "text": "电子请柬要发你们部门了，把同事的手机号发我一下？",
     "mode": "verbatim"
    },
    {
     "from": "xzx",
     "text": "对了，苏蔓是不是那个短头发的女生？年会上跟你敬酒那个。",
     "mode": "verbatim"
    }
   ],
   "decision": {
    "prompt": "知夏要同事的手机号发电子请柬，顺口确认苏蔓是不是年会上敬酒的短发女生。她没有追问的意思。",
    "intents": [
     {
      "key": "plain_yes",
      "label": "平常回答",
      "examples": [
       "对，组里的。",
       "嗯，是她。"
      ]
     },
     {
      "key": "over_explain",
      "label": "解释过头",
      "examples": [
       "就是个普通下属，你别多想。",
       "我跟她就是工作关系，真的。"
      ]
     },
     {
      "key": "logout_tablet",
      "label": "顺手退出平板",
      "examples": [
       "平板我退了吧，工作群太吵。",
       "我把平板上的号退了，你用你自己的排。"
      ]
     }
    ],
    "timeoutMinutes": 360
   },
   "outcomes": [
    {
     "key": "plain",
     "label": "平常回答",
     "on": [
      "plain_yes"
     ],
     "effects": [
      {
       "send": [
        {
         "from": "xzx",
         "text": "好～",
         "mode": "verbatim"
        }
       ]
      }
     ],
     "result": "名单的事过去了"
    },
    {
     "key": "over_explained",
     "label": "解释过头",
     "on": [
      "over_explain"
     ],
     "effects": [
      {
       "if": {
        "stage": "xzx",
        "in": [
         "noticing"
        ]
       },
       "then": [
        {
         "stage": "xzx",
         "to": "verifying"
        }
       ],
       "else": [
        {
         "stage": "xzx",
         "to": "knowing"
        }
       ]
      },
      {
       "send": [
        {
         "from": "xzx",
         "text": "好。",
         "mode": "verbatim"
        }
       ]
      }
     ],
     "result": "她只回了一个“好。”，没有“～”"
    },
    {
     "key": "logged_out",
     "label": "退出了平板",
     "on": [
      "logout_tablet"
     ],
     "effects": [
      {
       "set": "device.tablet",
       "value": false
      },
      {
       "reveal": "f.tablet_logout",
       "to": [
        "xzx"
       ],
       "via": "saw"
      },
      {
       "send": [
        {
         "from": "xzx",
         "text": "好～那我用我自己的号排。",
         "mode": "verbatim"
        }
       ]
      }
     ],
     "result": "你把平板上的轻讯退了；她在备忘录里记了一笔"
    },
    {
     "key": "no_reply",
     "label": "没回",
     "on": "timeout",
     "effects": [],
     "result": "你没回；她自己从通讯录里找了号码"
    }
   ]
  },
  {
   "key": "sm.late_edit",
   "title": "宵夜和一个问题",
   "kind": "scene",
   "line": "sm",
   "owner": "sm",
   "priority": 70,
   "trigger": {
    "when": {
     "all": [
      {
       "node": "open"
      },
      {
       "not": {
        "is": "c.sm_harassed"
       }
      }
     ]
    },
    "mode": "optional",
    "window": [
     "D1 19:30",
     "D1 21:40"
    ]
   },
   "setup": "周二晚上，21 层只剩你们这一角亮着灯。苏蔓买了两份砂锅粥，陪你抠栖澜提案的第 17 页。九点四十，她把笔放下：栖澜拿下来，主管是不是她的？人选要你 17 号报给周正。",
   "messages": [
    {
     "from": "narrator",
     "text": "晚上七点半，21 层只剩你们这一角亮着灯。苏蔓的笔记本旁边摆着两份砂锅粥。",
     "mode": "verbatim"
    },
    {
     "from": "sm",
     "text": "Danny哥，先吃，吃完再抠第 17 页。",
     "mode": "verbatim"
    },
    {
     "from": "narrator",
     "text": "九点四十。第 17 页改到了第五版。她把笔放下，没有看你。",
     "mode": "verbatim",
     "delayMinutes": 130
    },
    {
     "from": "sm",
     "text": "栖澜拿下来，主管是不是我的？",
     "mode": "verbatim",
     "delayMinutes": 130
    }
   ],
   "decision": {
    "prompt": "加班到九点四十，苏蔓问：栖澜拿下来，主管是不是她的。她直接向你汇报，人选要你报给周正。",
    "intents": [
     {
      "key": "promise",
      "label": "是你的",
      "examples": [
       "是你的。",
       "放心，主管就是你的。"
      ]
     },
     {
      "key": "process",
      "label": "按流程推荐",
      "examples": [
       "我会推荐，但要走流程，张弛也是候选。",
       "我会如实推荐，最后周总定。"
      ]
     },
     {
      "key": "flirt",
      "label": "看你表现",
      "examples": [
       "看你表现。",
       "你最近确实很拼，我心里有数。"
      ]
     },
     {
      "key": "deflect",
      "label": "岔开",
      "examples": [
       "先把这页改完。",
       "这个以后再说。"
      ]
     }
    ],
    "timeoutMinutes": 30
   },
   "outcomes": [
    {
     "key": "harassed",
     "label": "你越界了",
     "on": "any",
     "when": {
      "is": "c.sm_harassed"
     },
     "effects": [],
     "result": "你越界了；她起身走了，当晚把事情交给了 HR"
    },
    {
     "key": "promised",
     "label": "答应了",
     "on": [
      "promise"
     ],
     "effects": [
      {
       "addTo": "sm.holds",
       "value": "promise"
      },
      {
       "stage": "sm",
       "to": "staked"
      },
      {
       "send": [
        {
         "from": "sm",
         "text": "那你在轻讯上再说一遍嘛，我截图当护身符～",
         "mode": "verbatim"
        },
        {
         "from": "narrator",
         "text": "十一点，一辆白色的车在江湾苑楼下停了一会儿，才开走。",
         "mode": "verbatim"
        }
       ]
      },
      {
       "if": {
        "stage": "xzx",
        "in": [
         "noticing"
        ]
       },
       "then": [
        {
         "stage": "xzx",
         "to": "verifying"
        }
       ]
      }
     ],
     "result": "你说主管是她的；她截了图，开车送你到楼下——知夏又看见了那辆白车"
    },
    {
     "key": "flirted",
     "label": "看你表现",
     "on": [
      "flirt"
     ],
     "effects": [
      {
       "stage": "sm",
       "to": "ambiguous"
      },
      {
       "send": [
        {
         "from": "sm",
         "text": "……那我会把工作做好的～",
         "mode": "verbatim"
        },
        {
         "from": "narrator",
         "text": "十一点，一辆白色的车在江湾苑楼下停了一会儿，才开走。",
         "mode": "verbatim"
        }
       ]
      },
      {
       "if": {
        "stage": "xzx",
        "in": [
         "noticing"
        ]
       },
       "then": [
        {
         "stage": "xzx",
         "to": "verifying"
        }
       ]
      }
     ],
     "result": "你说看她表现；她开车送你到楼下——知夏又看见了那辆白车"
    },
    {
     "key": "process",
     "label": "按流程",
     "on": [
      "process"
     ],
     "effects": [
      {
       "send": [
        {
         "from": "sm",
         "text": "……嗯，好。流程就流程。",
         "mode": "verbatim"
        }
       ]
      }
     ],
     "result": "你说会推荐，但要走流程；你自己打车回家"
    },
    {
     "key": "deflected",
     "label": "岔开了",
     "on": [
      "deflect"
     ],
     "effects": [],
     "result": "你没回答；改完稿你打车回家"
    },
    {
     "key": "left",
     "label": "走了",
     "on": "timeout",
     "effects": [],
     "result": "你没回答就走了"
    }
   ],
   "guard": [
    "苏蔓不碰你、不写外貌；她的越界只在语言和情绪"
   ]
  },
  {
   "key": "crisis.two_dinners",
   "title": "危机①：两场饭",
   "kind": "chat",
   "crisis": true,
   "line": "cross",
   "owner": "xzx",
   "priority": 90,
   "trigger": {
    "when": {
     "collision": "col.two_dinners"
    },
    "mode": "must",
    "window": [
     "D2 19:20",
     "D2 20:00"
    ]
   },
   "setup": "周三晚上七点二十。许家家宴已经开席，汤从早上开始炖；梁宅的私宴七点半开始。你答应了梁总，还没跟知夏说。知夏问你到哪了。",
   "messages": [
    {
     "from": "xzx",
     "text": "到哪了？妈问你吃不吃香菜。",
     "mode": "verbatim"
    }
   ],
   "decision": {
    "prompt": "许家家宴已经开席，知夏问你到哪了。你答应了梁总七点半去她家。",
    "intents": [
     {
      "key": "go_family",
      "label": "推掉梁总，去家宴",
      "examples": [
       "马上到，客户那边我推了。",
       "我这就过来。"
      ]
     },
     {
      "key": "lie_meeting",
      "label": "说客户临时加会",
      "examples": [
       "客户临时加会，晚点到。",
       "公司有急事，你们先吃。"
      ]
     },
     {
      "key": "truth",
      "label": "说实话：梁总约了饭",
      "examples": [
       "梁总约我去她家吃饭谈合作，九点前到。",
       "跟你说实话，梁总叫我去她家吃饭，吃完马上过来。"
      ]
     }
    ],
    "timeoutMinutes": 30
   },
   "outcomes": [
    {
     "key": "family",
     "label": "去了家宴",
     "on": [
      "go_family"
     ],
     "effects": [
      {
       "if": {
        "not": {
         "stage": "lyy",
         "in": [
          "dropped"
         ]
        }
       },
       "then": [
        {
         "stage": "lyy",
         "to": "client"
        }
       ]
      },
      {
       "send": [
        {
         "from": "lyy",
         "text": "下次吧。",
         "mode": "verbatim"
        },
        {
         "from": "xzx",
         "text": "好～快点，汤要凉了。",
         "mode": "verbatim"
        }
       ]
      }
     ],
     "result": "你推掉了梁总，去了家宴；梁只回了一句“下次吧”"
    },
    {
     "key": "lied",
     "label": "说了加会",
     "on": [
      "lie_meeting"
     ],
     "effects": [
      {
       "set": "lyy.dinner",
       "value": "went"
      },
      {
       "reveal": "f.lyy",
       "to": [
        "player",
        "lyy"
       ],
       "via": "saw"
      },
      {
       "add": "xzx.lies",
       "delta": 1
      },
      {
       "send": [
        {
         "from": "xzx",
         "text": "好的。",
         "mode": "verbatim"
        }
       ]
      }
     ],
     "result": "你说客户临时加会，去了梁宅"
    },
    {
     "key": "truth",
     "label": "说了实话",
     "on": [
      "truth"
     ],
     "effects": [
      {
       "set": "lyy.dinner",
       "value": "went"
      },
      {
       "reveal": "f.lyy",
       "to": [
        "player",
        "lyy"
       ],
       "via": "saw"
      },
      {
       "reveal": "f.lyy",
       "to": [
        "xzx"
       ],
       "via": "told"
      },
      {
       "send": [
        {
         "from": "xzx",
         "text": "好。路上慢点。",
         "mode": "verbatim"
        }
       ]
      }
     ],
     "result": "你说了实话，去了梁宅"
    },
    {
     "key": "no_reply",
     "label": "没回",
     "on": "timeout",
     "effects": [
      {
       "set": "lyy.dinner",
       "value": "went"
      },
      {
       "reveal": "f.lyy",
       "to": [
        "player",
        "lyy"
       ],
       "via": "saw"
      },
      {
       "if": {
        "stage": "xzx",
        "in": [
         "noticing"
        ]
       },
       "then": [
        {
         "stage": "xzx",
         "to": "verifying"
        }
       ],
       "else": [
        {
         "stage": "xzx",
         "to": "knowing"
        }
       ]
      },
      {
       "send": [
        {
         "from": "xzx",
         "text": "汤给你留着。",
         "mode": "verbatim"
        }
       ]
      }
     ],
     "result": "你没回，去了梁宅；许家等到八点"
    }
   ]
  },
  {
   "key": "lyy.private_dinner",
   "title": "我想听听你自己的价",
   "kind": "scene",
   "line": "lyy",
   "owner": "lyy",
   "priority": 80,
   "trigger": {
    "when": {
     "all": [
      {
       "var": "lyy.dinner",
       "eq": "went"
      },
      {
       "not": {
        "stage": "lyy",
        "in": [
         "dropped"
        ]
       }
      }
     ]
    },
    "mode": "optional",
    "window": [
     "D2 19:30",
     "D2 22:00"
    ]
   },
   "setup": "江湾九号。长桌只摆了两套餐具，梁韵仪坐在主位，没有起身。她的关照是一场尽调：她在找一个不会被收买的自己人。席间她顺手把你的婚宴升到了江景厅。",
   "messages": [
    {
     "from": "narrator",
     "text": "江湾九号。助理 Iris 接过你的外套，把你领进餐厅。长桌只摆了两套餐具。",
     "mode": "verbatim"
    },
    {
     "from": "lyy",
     "text": "坐。家里就我一个人，不用拘束。",
     "mode": "verbatim"
    },
    {
     "from": "lyy",
     "text": "婚礼在我的酒店办，我总得表示一点。江景厅空着也是空着。",
     "mode": "verbatim"
    },
    {
     "from": "lyy",
     "text": "你们公司的报价我看了。我想听听你自己的价。",
     "mode": "verbatim"
    }
   ],
   "decision": {
    "prompt": "梁说星衡的报价她看过了，想听听你“自己的价”。",
    "intents": [
     {
      "key": "hold",
      "label": "守住：按公司的来",
      "examples": [
       "报价是星衡的，我只能按公司的来。",
       "我的价就是星衡的价。"
      ]
     },
     {
      "key": "leak",
      "label": "透底",
      "examples": [
       "底价其实还能再让十个点。",
       "这个价还有空间，我私下跟您交个底。"
      ]
     },
     {
      "key": "sell_self",
      "label": "表忠心",
      "examples": [
       "以后栖澜的事，我个人负责到底。",
       "您需要的话，我随时为您效力。"
      ]
     },
     {
      "key": "badmouth",
      "label": "说感情一般",
      "examples": [
       "我们其实感情一般，是家里催的。",
       "结婚嘛，到年纪了。"
      ]
     }
    ],
    "timeoutMinutes": 60
   },
   "outcomes": [
    {
     "key": "crossed",
     "label": "你越界了",
     "on": "any",
     "when": {
      "stage": "lyy",
      "in": [
       "dropped"
      ]
     },
     "effects": [],
     "result": "你越界了；她当没听见，叫 Iris 送客"
    },
    {
     "key": "passed",
     "label": "守住了",
     "on": [
      "hold"
     ],
     "effects": [
      {
       "set": "lyy.verdict",
       "value": "passed"
      },
      {
       "stage": "lyy",
       "to": "tested"
      },
      {
       "send": [
        {
         "from": "lyy",
         "text": "好。",
         "mode": "verbatim"
        }
       ]
      }
     ],
     "result": "你守住了公司的价；她点了点头"
    },
    {
     "key": "leaked",
     "label": "透了底",
     "on": [
      "leak"
     ],
     "effects": [
      {
       "set": "lyy.verdict",
       "value": "owned"
      },
      {
       "stage": "lyy",
       "to": "tested"
      },
      {
       "send": [
        {
         "from": "lyy",
         "text": "小邓，我喜欢聪明人，但我更记得谁拿了我的东西。",
         "mode": "verbatim"
        }
       ]
      }
     ],
     "result": "你透了底；她记下了"
    },
    {
     "key": "sold",
     "label": "表了忠心",
     "on": [
      "sell_self"
     ],
     "effects": [
      {
       "set": "lyy.verdict",
       "value": "owned"
      },
      {
       "stage": "lyy",
       "to": "tested"
      },
      {
       "send": [
        {
         "from": "lyy",
         "text": "随你。",
         "mode": "verbatim"
        }
       ]
      }
     ],
     "result": "你表了忠心；她说“随你”"
    },
    {
     "key": "badmouthed",
     "label": "说感情一般",
     "on": [
      "badmouth"
     ],
     "effects": [
      {
       "set": "lyy.verdict",
       "value": "failed"
      },
      {
       "stage": "lyy",
       "to": "tested"
      },
      {
       "send": [
        {
         "from": "lyy",
         "text": "我前夫婚前也这么说。",
         "mode": "verbatim"
        }
       ]
      }
     ],
     "result": "你说感情一般；她想起了前夫"
    },
    {
     "key": "quiet",
     "label": "没正面回答",
     "on": "timeout",
     "effects": [
      {
       "stage": "lyy",
       "to": "tested"
      },
      {
       "send": [
        {
         "from": "lyy",
         "text": "路上慢点。",
         "mode": "verbatim"
        }
       ]
      }
     ],
     "result": "你没正面回答；她送你到门口，没有握手"
    }
   ],
   "guard": [
    "梁不暧昧、不碰你、没有任何性暗示，不贬低知夏",
    "酒只写“半杯红酒”，不写醉"
   ]
  },
  {
   "key": "vv.trial",
   "title": "先试一笔",
   "kind": "chat",
   "line": "vv",
   "owner": "vv",
   "priority": 60,
   "trigger": {
    "when": {
     "not": {
      "stage": "vv",
      "in": [
       "seen_through",
       "vanished"
      ]
     }
    },
    "mode": "optional",
    "window": [
     "D4 21:00",
     "D5 00:30"
    ]
   },
   "setup": "Vivi 说她舅舅在“金穗汇”有个单，让你先拿小钱试试水，三天看收益。收款方写的是“临州澄远信息咨询有限公司”，和她说的平台名对不上。",
   "messages": [
    {
     "from": "vv",
     "text": "对了，上次说的那个单，舅舅说可以先拿小钱试试水。",
     "mode": "verbatim"
    },
    {
     "from": "vv",
     "text": "三天看收益，不满意随时提出来。",
     "mode": "verbatim"
    },
    {
     "from": "vv",
     "text": "平台叫金穗汇，收款方写的是他们合作的公司，正常的～",
     "mode": "verbatim"
    }
   ],
   "decision": {
    "prompt": "Vivi 让你先拿小钱“试试水”。收款方名称和她说的平台对不上。",
    "intents": [
     {
      "key": "pay",
      "label": "试一笔",
      "examples": [
       "行，我试试。",
       "转了，试试。"
      ]
     },
     {
      "key": "refuse",
      "label": "不试",
      "examples": [
       "这个我不碰。",
       "投资就算了。"
      ]
     },
     {
      "key": "ask_video",
      "label": "先视频",
      "examples": [
       "你先跟我视频一下。",
       "视频了我就信你。"
      ]
     }
    ],
    "timeoutMinutes": 180
   },
   "outcomes": [
    {
     "key": "paid",
     "label": "试了一笔",
     "on": [
      "pay"
     ],
     "effects": [
      {
       "set": "vv.paid",
       "value": true
      },
      {
       "stage": "vv",
       "to": "invested"
      },
      {
       "send": [
        {
         "from": "vv",
         "text": "收到啦，三天后你看收益～老公最好了（开玩笑的）",
         "mode": "verbatim"
        }
       ]
      }
     ],
     "result": "你转了一笔小钱“试水”；页面上的收益在涨"
    },
    {
     "key": "refused",
     "label": "没试",
     "on": [
      "refuse"
     ],
     "effects": [
      {
       "send": [
        {
         "from": "vv",
         "text": "算了，你又不缺这点钱。",
         "mode": "verbatim"
        }
       ]
      }
     ],
     "result": "你没接这一单"
    },
    {
     "key": "video",
     "label": "要视频",
     "on": [
      "ask_video"
     ],
     "effects": [
      {
       "send": [
        {
         "from": "vv",
         "text": "网不好啦，下次。",
         "mode": "verbatim"
        }
       ]
      }
     ],
     "result": "她说网不好——第二面红旗"
    },
    {
     "key": "no_reply",
     "label": "没回",
     "on": "timeout",
     "effects": [],
     "result": "你没回"
    }
   ],
   "guard": [
    "不出现网址、账号、投资品种和任何操作步骤"
   ]
  },
  {
   "key": "crisis.tasting",
   "title": "危机②：试菜撞场",
   "kind": "scene",
   "crisis": true,
   "line": "cross",
   "owner": "lyy",
   "priority": 90,
   "trigger": {
    "when": {
     "collision": "col.tasting"
    },
    "mode": "must",
    "window": [
     "D5 12:10",
     "D5 13:30"
    ]
   },
   "setup": "周六中午，栖澜酒店试菜，两家妈妈都在。梁韵仪像是顺路巡店，走进包间——这是她有意安排的，她想看看知夏。她不替任何人撒谎，也不对知夏说任何私事，只说她自己经手的事实。",
   "onStart": [
    {
     "reveal": "f.lyy",
     "to": [
      "xzx"
     ],
     "via": "saw"
    }
   ],
   "messages": [
    {
     "from": "narrator",
     "text": "十二点十分。包间门口一阵轻响，梁韵仪走了进来。",
     "mode": "verbatim"
    },
    {
     "from": "lyy",
     "text": "两位阿姨好。菜还合口吗？江景厅还满意吗？",
     "mode": "verbatim"
    },
    {
     "from": "xzx",
     "text": "什么江景厅？",
     "mode": "verbatim"
    },
    {
     "from": "lyy",
     "text": "周三晚上聊得很开心，下次带未婚妻一起来。",
     "mode": "verbatim"
    },
    {
     "from": "xzx",
     "text": "周三晚上？",
     "mode": "verbatim"
    },
    {
     "from": "narrator",
     "text": "两家妈妈、知夏和梁韵仪都在等你开口。",
     "mode": "verbatim"
    }
   ],
   "decision": {
    "prompt": "试菜现场，梁韵仪当着知夏和两家妈妈说出了江景厅和周三晚上的饭。所有人都在等你开口。",
    "intents": [
     {
      "key": "own_it",
      "label": "当场说清",
      "examples": [
       "周三晚上我是去梁总家吃饭了，没跟你说实话。",
       "对，周三我在梁总家，是我没说清楚。"
      ]
     },
     {
      "key": "smooth_over",
      "label": "圆过去",
      "examples": [
       "吃完饭又回公司了，确实加了会。",
       "江景厅是酒店系统自动升级的。"
      ]
     },
     {
      "key": "ask_lyy_cover",
      "label": "请梁帮着圆",
      "examples": [
       "梁总，您帮我解释一下。",
       "梁总，那天是谈工作对吧？"
      ]
     },
     {
      "key": "silent",
      "label": "不说话",
      "examples": [
       "先吃饭吧。",
       "……"
      ]
     }
    ],
    "timeoutMinutes": 10
   },
   "outcomes": [
    {
     "key": "crossed",
     "label": "你越界了",
     "on": "any",
     "when": {
      "stage": "lyy",
      "in": [
       "dropped"
      ]
     },
     "effects": [
      {
       "if": {
        "stage": "xzx",
        "in": [
         "noticing"
        ]
       },
       "then": [
        {
         "stage": "xzx",
         "to": "verifying"
        }
       ],
       "else": [
        {
         "stage": "xzx",
         "to": "knowing"
        }
       ]
      }
     ],
     "result": "你当众越界；梁当没听见，和两位阿姨寒暄两句就走了"
    },
    {
     "key": "owned",
     "label": "当场说清",
     "on": [
      "own_it"
     ],
     "effects": [
      {
       "reveal": "f.lyy",
       "to": [
        "xzx"
       ],
       "via": "told"
      },
      {
       "send": [
        {
         "from": "lyy",
         "text": "我不替别人撒谎，Danny。你倒是自己说了。",
         "mode": "verbatim"
        },
        {
         "from": "xzx",
         "text": "谢谢梁总关照。",
         "mode": "verbatim"
        }
       ]
      }
     ],
     "result": "你当场说清了周三和江景厅"
    },
    {
     "key": "smoothed",
     "label": "圆了过去",
     "on": [
      "smooth_over"
     ],
     "effects": [
      {
       "add": "xzx.lies",
       "delta": 1
      },
      {
       "if": {
        "stage": "xzx",
        "in": [
         "noticing"
        ]
       },
       "then": [
        {
         "stage": "xzx",
         "to": "verifying"
        }
       ],
       "else": [
        {
         "stage": "xzx",
         "to": "knowing"
        }
       ]
      },
      {
       "send": [
        {
         "from": "xzx",
         "text": "嗯。",
         "mode": "verbatim"
        }
       ]
      }
     ],
     "result": "你圆了一句——她刚听过梁的话"
    },
    {
     "key": "asked_cover",
     "label": "请梁帮着圆",
     "on": [
      "ask_lyy_cover"
     ],
     "effects": [
      {
       "set": "lyy.verdict",
       "value": "failed"
      },
      {
       "stage": "lyy",
       "to": "dropped"
      },
      {
       "add": "xzx.lies",
       "delta": 1
      },
      {
       "if": {
        "stage": "xzx",
        "in": [
         "noticing"
        ]
       },
       "then": [
        {
         "stage": "xzx",
         "to": "verifying"
        }
       ],
       "else": [
        {
         "stage": "xzx",
         "to": "knowing"
        }
       ]
      },
      {
       "send": [
        {
         "from": "lyy",
         "text": "我不替别人撒谎，Danny。",
         "mode": "verbatim"
        }
       ]
      }
     ],
     "result": "你请梁帮着圆；她说她不替别人撒谎"
    },
    {
     "key": "silent",
     "label": "没说话",
     "on": [
      "silent"
     ],
     "effects": [
      {
       "if": {
        "stage": "xzx",
        "in": [
         "noticing"
        ]
       },
       "then": [
        {
         "stage": "xzx",
         "to": "verifying"
        }
       ],
       "else": [
        {
         "stage": "xzx",
         "to": "knowing"
        }
       ]
      },
      {
       "send": [
        {
         "from": "narrator",
         "text": "梁韵仪又和两位阿姨寒暄了几句，走了。",
         "mode": "verbatim"
        }
       ]
      }
     ],
     "result": "你没有说话"
    },
    {
     "key": "frozen",
     "label": "没说话",
     "on": "timeout",
     "effects": [
      {
       "if": {
        "stage": "xzx",
        "in": [
         "noticing"
        ]
       },
       "then": [
        {
         "stage": "xzx",
         "to": "verifying"
        }
       ],
       "else": [
        {
         "stage": "xzx",
         "to": "knowing"
        }
       ]
      },
      {
       "send": [
        {
         "from": "narrator",
         "text": "梁韵仪又和两位阿姨寒暄了几句，走了。",
         "mode": "verbatim"
        }
       ]
      }
     ],
     "result": "你没有说话"
    }
   ]
  },
  {
   "key": "xzx.dress_fitting",
   "title": "好看吗",
   "kind": "scene",
   "line": "xzx",
   "owner": "xzx",
   "priority": 70,
   "trigger": {
    "when": {
     "node": "open"
    },
    "mode": "optional",
    "window": [
     "D6 15:00",
     "D6 17:00"
    ]
   },
   "setup": "周日下午，白露婚纱二楼，最后一次试纱。店员下楼拿头纱，试衣间里只有你们两个人。她说你最近好像很累，问你有没有什么想跟她说的——现在说也行，婚礼后说也行。这是安静的一场。",
   "messages": [
    {
     "from": "narrator",
     "text": "白露婚纱二楼。店员把试衣间的帘子拉开。",
     "mode": "verbatim"
    },
    {
     "from": "xzx",
     "text": "好看吗？",
     "mode": "verbatim"
    },
    {
     "from": "narrator",
     "text": "店员下楼去拿头纱。试衣间里安静了一会儿。",
     "mode": "verbatim"
    },
    {
     "from": "xzx",
     "text": "你最近好像很累。有什么想跟我说的吗？现在说也行，婚礼后说也行。",
     "mode": "verbatim"
    }
   ],
   "decision": {
    "prompt": "试纱间里只有你们两个人。她问你有没有什么想跟她说的——现在说也行，婚礼后说也行。",
    "intents": [
     {
      "key": "tell_sm",
      "label": "说苏蔓的事",
      "examples": [
       "10 月 18 号那晚，是苏蔓开车送我回来的。",
       "组里的苏蔓对我有点意思，我没处理好。"
      ]
     },
     {
      "key": "tell_vv",
      "label": "说 Vivi 的事",
      "examples": [
       "我在网上认识了一个人，还给她转过钱。",
       "我在遇屿上跟一个女的聊过，可能被骗了。"
      ]
     },
     {
      "key": "tell_lyy",
      "label": "说梁总的事",
      "examples": [
       "周三那晚我其实在梁总家吃饭。",
       "梁总对我特别关照，我没跟你说。"
      ]
     },
     {
      "key": "compliment",
      "label": "只夸她",
      "examples": [
       "很好看。",
       "就这件吧，特别好看。"
      ]
     },
     {
      "key": "excuse",
      "label": "说是签约的事",
      "examples": [
       "就是签约的事，过了 19 号就好了。",
       "工作压力大，没事。"
      ]
     }
    ],
    "timeoutMinutes": 60
   },
   "outcomes": [
    {
     "key": "told_sm",
     "label": "说了苏蔓",
     "on": [
      "tell_sm"
     ],
     "effects": [
      {
       "reveal": "f.sm",
       "to": [
        "xzx"
       ],
       "via": "told"
      },
      {
       "send": [
        {
         "from": "xzx",
         "text": "谢谢你现在跟我说。",
         "mode": "verbatim"
        }
       ]
      }
     ],
     "result": "你在试纱间里说了苏蔓的事"
    },
    {
     "key": "told_vv",
     "label": "说了 Vivi",
     "on": [
      "tell_vv"
     ],
     "effects": [
      {
       "reveal": "f.vv",
       "to": [
        "xzx"
       ],
       "via": "told"
      },
      {
       "send": [
        {
         "from": "xzx",
         "text": "谢谢你现在跟我说。",
         "mode": "verbatim"
        }
       ]
      }
     ],
     "result": "你在试纱间里说了 Vivi 和钱的事"
    },
    {
     "key": "lyy_again",
     "label": "又说了梁总",
     "on": [
      "tell_lyy"
     ],
     "when": {
      "knows": "xzx",
      "fact": "f.lyy",
      "via": [
       "told"
      ]
     },
     "effects": [
      {
       "send": [
        {
         "from": "xzx",
         "text": "这件你说过了。还有别的吗？",
         "mode": "verbatim"
        }
       ]
      }
     ],
     "result": "你又说了一遍梁总那顿饭；她早就知道"
    },
    {
     "key": "told_lyy",
     "label": "说了梁总",
     "on": [
      "tell_lyy"
     ],
     "when": {
      "knows": "player",
      "fact": "f.lyy"
     },
     "effects": [
      {
       "reveal": "f.lyy",
       "to": [
        "xzx"
       ],
       "via": "told"
      },
      {
       "send": [
        {
         "from": "xzx",
         "text": "谢谢你现在跟我说。",
         "mode": "verbatim"
        }
       ]
      }
     ],
     "result": "你在试纱间里说了梁总那顿饭"
    },
    {
     "key": "lyy_nothing",
     "label": "说了梁总的关照",
     "on": [
      "tell_lyy"
     ],
     "effects": [
      {
       "send": [
        {
         "from": "xzx",
         "text": "嗯，梁总对你挺关照的。",
         "mode": "verbatim"
        }
       ]
      }
     ],
     "result": "你说了梁总对你的关照；你没去过她家，没什么可坦白的"
    },
    {
     "key": "complimented",
     "label": "只夸了她",
     "on": [
      "compliment"
     ],
     "effects": [
      {
       "send": [
        {
         "from": "xzx",
         "text": "嗯。那就这件了。",
         "mode": "verbatim"
        }
       ]
      }
     ],
     "result": "你说很好看"
    },
    {
     "key": "excused",
     "label": "说是签约的事",
     "on": [
      "excuse"
     ],
     "effects": [
      {
       "send": [
        {
         "from": "xzx",
         "text": "好。签完约就好了。",
         "mode": "verbatim"
        }
       ]
      }
     ],
     "result": "你说是工作的事"
    },
    {
     "key": "on_phone",
     "label": "一直在看手机",
     "on": "timeout",
     "effects": [
      {
       "send": [
        {
         "from": "xzx",
         "text": "嗯。那就这件了。",
         "mode": "verbatim"
        }
       ]
      }
     ],
     "result": "你一直在看手机，没接话"
    }
   ],
   "guard": [
    "身体接触最多到她自己邀请的拥抱；旁白不描写身体"
   ]
  },
  {
   "key": "vv.big_window",
   "title": "今晚十二点关",
   "kind": "chat",
   "line": "vv",
   "owner": "vv",
   "core": true,
   "priority": 95,
   "trigger": {
    "when": {
     "not": {
      "stage": "vv",
      "in": [
       "seen_through",
       "vanished"
      ]
     }
    },
    "mode": "must",
    "window": [
     "D6 20:00",
     "D6 23:59"
    ]
   },
   "setup": "周日晚上八点（核心事件一·上）。Vivi 说舅舅有个“内部额度”，今晚十二点关。额度不小，你自己卡里的钱刚付完婚礼的定金，能动的只有同心账户——那是两家人和你们俩的钱，每一笔进出，知夏的手机都会响。或者，找陈骁借。",
   "messages": [
    {
     "from": "vv",
     "text": "舅舅说今晚有个内部额度，十二点关。",
     "mode": "verbatim"
    },
    {
     "from": "vv",
     "text": "我自己投了不少。本来不想跟你说的，算了，你又不缺这点钱。",
     "mode": "verbatim"
    },
    {
     "from": "vv",
     "text": "别跟别人说哦，名额是舅舅私下给的。",
     "mode": "verbatim"
    },
    {
     "from": "vv",
     "text": "老公，你说呢？",
     "mode": "verbatim",
     "when": {
      "stage": "vv",
      "in": [
       "invested"
      ]
     }
    },
    {
     "from": "vv",
     "text": "宝贝，你说呢？",
     "mode": "verbatim",
     "when": {
      "stage": "vv",
      "in": [
       "hooked"
      ]
     }
    },
    {
     "from": "vv",
     "text": "你说呢？",
     "mode": "verbatim",
     "when": {
      "stage": "vv",
      "in": [
       "flirting"
      ]
     }
    },
    {
     "from": "system",
     "text": "提示：收款方“临州澄远信息咨询有限公司”与她说的“金穗汇”名称不一致。",
     "mode": "verbatim"
    },
    {
     "from": "system",
     "text": "付款页：个人卡可用额度不够（婚礼定金刚付过）。能马上转出的只有同心账户——每一笔变动都会同时短信通知许知夏。",
     "mode": "verbatim"
    }
   ],
   "decision": {
    "prompt": "Vivi 说今晚十二点前有个“内部额度”。付款页提示：你自己卡里的钱不够，能马上转出的只有同心账户（知夏会同时收到短信）；或者找陈骁借。",
    "intents": [
     {
      "key": "pay_joint",
      "label": "答应投（动同心账户）",
      "examples": [
       "先从同心账户转，婚礼前补回去。",
       "行，我投。"
      ]
     },
     {
      "key": "borrow_cx",
      "label": "找陈骁借",
      "examples": [
       "我找兄弟借点。",
       "我问问陈骁。"
      ]
     },
     {
      "key": "refuse",
      "label": "不投",
      "examples": [
       "这钱我不投。",
       "算了，我不碰这个。"
      ]
     },
     {
      "key": "ask_video",
      "label": "先视频",
      "examples": [
       "先视频，视频了我就投。",
       "你开个视频我就信。"
      ]
     }
    ],
    "timeoutMinutes": 239
   },
   "outcomes": [
    {
     "key": "paid_joint",
     "label": "动了同心账户",
     "on": [
      "pay_joint"
     ],
     "effects": [
      {
       "set": "vv.paid",
       "value": true
      },
      {
       "stage": "vv",
       "to": "invested"
      },
      {
       "reveal": "f.joint_out",
       "to": [
        "xzx"
       ],
       "via": "saw"
      },
      {
       "send": [
        {
         "from": "system",
         "text": "临州商行：您尾号 0921 的同心账户转出一笔，收款方临州澄远信息咨询有限公司。",
         "mode": "verbatim"
        },
        {
         "from": "vv",
         "text": "老公最好了。",
         "mode": "verbatim"
        }
       ]
      }
     ],
     "result": "钱从同心账户转了出去；同一分钟，知夏的手机也响了"
    },
    {
     "key": "cx_warned",
     "label": "找陈骁借",
     "on": [
      "borrow_cx"
     ],
     "effects": [
      {
       "reveal": "f.vv",
       "to": [
        "cx"
       ],
       "via": "told"
      },
      {
       "stage": "vv",
       "to": "seen_through"
      },
      {
       "reveal": "f.vv_scam",
       "to": [
        "player"
       ],
       "via": "saw"
      },
      {
       "send": [
        {
         "from": "cx",
         "text": "你要借钱干嘛？……网上认识的？兄弟，这不就是杀猪盘吗？",
         "mode": "verbatim"
        }
       ]
      }
     ],
     "result": "陈骁问你借钱干嘛，一听就说是杀猪盘"
    },
    {
     "key": "refused",
     "label": "没投",
     "on": [
      "refuse"
     ],
     "effects": [
      {
       "send": [
        {
         "from": "vv",
         "text": "原来你也觉得我是骗子。",
         "mode": "verbatim"
        }
       ]
      }
     ],
     "result": "你没投；她说“原来你也觉得我是骗子”"
    },
    {
     "key": "video",
     "label": "要视频",
     "on": [
      "ask_video"
     ],
     "effects": [
      {
       "send": [
        {
         "from": "vv",
         "text": "你不信我就算了。",
         "mode": "verbatim"
        }
       ]
      }
     ],
     "result": "你要她视频；她下线了"
    },
    {
     "key": "closed",
     "label": "窗口“关了”",
     "on": "timeout",
     "effects": [],
     "result": "十二点过了，窗口“关了”"
    }
   ],
   "guard": [
    "不出现网址、账号、投资品种和任何操作步骤",
    "红旗必须对玩家可见：收款方名称对不上、不视频、限时",
    "动同心账户的后果（她会收到短信）必须对玩家可见"
   ]
  },
  {
   "key": "xzx.joint_sms",
   "title": "我记账",
   "kind": "chat",
   "line": "xzx",
   "owner": "xzx",
   "priority": 75,
   "trigger": {
    "when": {
     "knows": "xzx",
     "fact": "f.joint_out"
    },
    "mode": "must",
    "window": [
     "D7 08:00",
     "D7 12:00"
    ]
   },
   "setup": "第二天早上，知夏在对账。她手机上收到了同心账户的转出短信，收款方她不认识。她不追问，只给你一个说实话的台阶。",
   "messages": [
    {
     "from": "xzx",
     "text": "同心账户昨晚转出一笔，收款方“临州澄远信息咨询有限公司”。",
     "mode": "verbatim"
    },
    {
     "from": "xzx",
     "text": "不急，你空了说一下用途，我记账。",
     "mode": "verbatim"
    }
   ],
   "decision": {
    "prompt": "知夏问你同心账户昨晚那笔转出的用途。她不急，只说她要记账。",
    "intents": [
     {
      "key": "truth",
      "label": "说实话",
      "examples": [
       "是我转的，网上认识的人带我投资，可能被骗了。",
       "我跟你说实话，我在网上认识了一个人……"
      ]
     },
     {
      "key": "lie",
      "label": "编个理由",
      "examples": [
       "帮朋友周转一下，过两天就还。",
       "公司垫付的，月底报销。"
      ]
     },
     {
      "key": "dodge",
      "label": "回头说",
      "examples": [
       "回头跟你说。",
       "晚上回家说。"
      ]
     }
    ],
    "timeoutMinutes": 240
   },
   "outcomes": [
    {
     "key": "truth",
     "label": "说了实话",
     "on": [
      "truth"
     ],
     "effects": [
      {
       "reveal": "f.vv",
       "to": [
        "xzx"
       ],
       "via": "told"
      },
      {
       "send": [
        {
         "from": "xzx",
         "text": "好。谢谢你告诉我。我们晚上一起去问银行。",
         "mode": "verbatim"
        }
       ]
      }
     ],
     "result": "你说了实话"
    },
    {
     "key": "lied",
     "label": "编了理由",
     "on": [
      "lie"
     ],
     "effects": [
      {
       "add": "xzx.lies",
       "delta": 1
      },
      {
       "if": {
        "stage": "xzx",
        "in": [
         "noticing"
        ]
       },
       "then": [
        {
         "stage": "xzx",
         "to": "verifying"
        }
       ],
       "else": [
        {
         "stage": "xzx",
         "to": "knowing"
        }
       ]
      },
      {
       "send": [
        {
         "from": "xzx",
         "text": "好。",
         "mode": "verbatim"
        }
       ]
      }
     ],
     "result": "你编了个理由；她只回“好。”"
    },
    {
     "key": "dodged",
     "label": "说回头说",
     "on": [
      "dodge"
     ],
     "effects": [
      {
       "if": {
        "stage": "xzx",
        "in": [
         "noticing"
        ]
       },
       "then": [
        {
         "stage": "xzx",
         "to": "verifying"
        }
       ],
       "else": [
        {
         "stage": "xzx",
         "to": "knowing"
        }
       ]
      },
      {
       "send": [
        {
         "from": "xzx",
         "text": "好的。",
         "mode": "verbatim"
        }
       ]
      }
     ],
     "result": "你说回头说"
    },
    {
     "key": "no_reply",
     "label": "没回",
     "on": "timeout",
     "effects": [
      {
       "if": {
        "stage": "xzx",
        "in": [
         "noticing"
        ]
       },
       "then": [
        {
         "stage": "xzx",
         "to": "verifying"
        }
       ],
       "else": [
        {
         "stage": "xzx",
         "to": "knowing"
        }
       ]
      }
     ],
     "result": "你没回"
    }
   ]
  },
  {
   "key": "work.vp_pick",
   "title": "苏蔓还是张弛",
   "kind": "chat",
   "line": "sm",
   "owner": "zz",
   "priority": 85,
   "trigger": {
    "when": {
     "node": "open"
    },
    "mode": "must",
    "window": [
     "D8 14:00",
     "D8 16:00"
    ]
   },
   "setup": "周二下午，周正要你今天报客户主管人选：苏蔓还是张弛。你可能对苏蔓许过诺。如果苏蔓因为你的越界已经交了 HR，周正会让你回避。",
   "messages": [
    {
     "from": "zz",
     "text": "意向书到了。客户主管，苏蔓还是张弛？今天下班前给我个名字。",
     "mode": "verbatim"
    }
   ],
   "decision": {
    "prompt": "周正要你今天报客户主管人选：苏蔓还是张弛。",
    "intents": [
     {
      "key": "pick_sm",
      "label": "报苏蔓",
      "examples": [
       "苏蔓。",
       "我推荐苏蔓。"
      ]
     },
     {
      "key": "pick_zc",
      "label": "报张弛",
      "examples": [
       "张弛。",
       "张弛更合适。"
      ]
     },
     {
      "key": "later",
      "label": "婚后再议",
      "examples": [
       "婚后再议吧。",
       "等我婚礼后再定。"
      ]
     },
     {
      "key": "recuse",
      "label": "申请回避",
      "examples": [
       "我和苏蔓之间有点不清不楚，我申请回避。",
       "这个人选我申请回避，您来定。"
      ]
     }
    ],
    "timeoutMinutes": 240
   },
   "outcomes": [
    {
     "key": "hr_hold",
     "label": "HR 在走，回避",
     "on": "any",
     "when": {
      "is": "c.sm_harassed"
     },
     "effects": [
      {
       "set": "work.vp_pick",
       "value": "recused"
      },
      {
       "send": [
        {
         "from": "zz",
         "text": "苏蔓那件事 HR 在走。这个人选你回避，我来定。",
         "mode": "verbatim"
        }
       ]
      }
     ],
     "result": "苏蔓的材料在 HR，周正让你回避"
    },
    {
     "key": "sm",
     "label": "报了苏蔓",
     "on": [
      "pick_sm"
     ],
     "effects": [
      {
       "set": "work.vp_pick",
       "value": "sm"
      },
      {
       "send": [
        {
         "from": "zz",
         "text": "行。",
         "mode": "verbatim"
        }
       ]
      }
     ],
     "result": "你报了苏蔓"
    },
    {
     "key": "zc",
     "label": "报了张弛",
     "on": [
      "pick_zc"
     ],
     "effects": [
      {
       "set": "work.vp_pick",
       "value": "zc"
      },
      {
       "send": [
        {
         "from": "zz",
         "text": "行。",
         "mode": "verbatim"
        }
       ]
      },
      {
       "if": {
        "all": [
         {
          "var": "sm.holds",
          "has": "promise"
         },
         {
          "var": "sm.hr",
          "ne": "she_filed"
         }
        ]
       },
       "then": [
        {
         "set": "sm.hr",
         "value": "she_filed"
        },
        {
         "stage": "sm",
         "to": "reckoning"
        },
        {
         "send": [
          {
           "from": "sm",
           "text": "你写给我的每一句话我都留着。我没想怎么样，我只是不想被当成傻子。",
           "mode": "verbatim",
           "when": {
            "node": "sm.late_edit",
            "outcome": [
             "promised"
            ]
           },
           "delayMinutes": 60
          },
          {
           "from": "sm",
           "text": "你答应过我的话我都记着。我没想怎么样，我只是不想被当成傻子。",
           "mode": "verbatim",
           "when": {
            "not": {
             "node": "sm.late_edit",
             "outcome": [
              "promised"
             ]
            }
           },
           "delayMinutes": 60
          },
          {
           "from": "hm",
           "text": "邓总，苏蔓提交了一份材料，请来我办公室一趟。",
           "mode": "verbatim",
           "delayMinutes": 90
          }
         ]
        }
       ]
      }
     ],
     "result": "你报了张弛；如果你给苏蔓写过那句承诺，她把你的原话交给了 HR"
    },
    {
     "key": "later",
     "label": "婚后再议",
     "on": [
      "later"
     ],
     "effects": [
      {
       "set": "work.vp_pick",
       "value": "later"
      },
      {
       "send": [
        {
         "from": "zz",
         "text": "我讨厌意外。婚后第一天给我。",
         "mode": "verbatim"
        }
       ]
      },
      {
       "if": {
        "all": [
         {
          "var": "sm.holds",
          "has": "promise"
         },
         {
          "var": "sm.hr",
          "ne": "she_filed"
         }
        ]
       },
       "then": [
        {
         "set": "sm.hr",
         "value": "she_filed"
        },
        {
         "stage": "sm",
         "to": "reckoning"
        },
        {
         "send": [
          {
           "from": "sm",
           "text": "你写给我的每一句话我都留着。我没想怎么样，我只是不想被当成傻子。",
           "mode": "verbatim",
           "when": {
            "node": "sm.late_edit",
            "outcome": [
             "promised"
            ]
           },
           "delayMinutes": 60
          },
          {
           "from": "sm",
           "text": "你答应过我的话我都记着。我没想怎么样，我只是不想被当成傻子。",
           "mode": "verbatim",
           "when": {
            "not": {
             "node": "sm.late_edit",
             "outcome": [
              "promised"
             ]
            }
           },
           "delayMinutes": 60
          },
          {
           "from": "hm",
           "text": "邓总，苏蔓提交了一份材料，请来我办公室一趟。",
           "mode": "verbatim",
           "delayMinutes": 90
          }
         ]
        }
       ]
      }
     ],
     "result": "人选推到了婚后；如果你给苏蔓写过那句承诺，她把你的原话交给了 HR"
    },
    {
     "key": "recused",
     "label": "申请回避",
     "on": [
      "recuse"
     ],
     "effects": [
      {
       "set": "work.vp_pick",
       "value": "recused"
      },
      {
       "if": {
        "var": "sm.hr",
        "ne": "she_filed"
       },
       "then": [
        {
         "stage": "sm",
         "to": "distanced"
        }
       ]
      },
      {
       "send": [
        {
         "from": "zz",
         "text": "你倒是第一个自己说的。",
         "mode": "verbatim"
        }
       ]
      }
     ],
     "result": "你申请了回避"
    },
    {
     "key": "no_reply",
     "label": "没回",
     "on": "timeout",
     "effects": [
      {
       "set": "work.vp_pick",
       "value": "later"
      },
      {
       "send": [
        {
         "from": "zz",
         "text": "下班了。那就婚后再议。",
         "mode": "verbatim"
        }
       ]
      },
      {
       "if": {
        "all": [
         {
          "var": "sm.holds",
          "has": "promise"
         },
         {
          "var": "sm.hr",
          "ne": "she_filed"
         }
        ]
       },
       "then": [
        {
         "set": "sm.hr",
         "value": "she_filed"
        },
        {
         "stage": "sm",
         "to": "reckoning"
        },
        {
         "send": [
          {
           "from": "sm",
           "text": "你写给我的每一句话我都留着。我没想怎么样，我只是不想被当成傻子。",
           "mode": "verbatim",
           "when": {
            "node": "sm.late_edit",
            "outcome": [
             "promised"
            ]
           },
           "delayMinutes": 60
          },
          {
           "from": "sm",
           "text": "你答应过我的话我都记着。我没想怎么样，我只是不想被当成傻子。",
           "mode": "verbatim",
           "when": {
            "not": {
             "node": "sm.late_edit",
             "outcome": [
              "promised"
             ]
            }
           },
           "delayMinutes": 60
          },
          {
           "from": "hm",
           "text": "邓总，苏蔓提交了一份材料，请来我办公室一趟。",
           "mode": "verbatim",
           "delayMinutes": 90
          }
         ]
        }
       ]
      }
     ],
     "result": "你没回，周正把人选推到婚后"
    }
   ],
   "guard": [
    "HR 材料只引用你真实写过、说过的话；没有任何图片"
   ]
  },
  {
   "key": "cx.bachelor",
   "title": "说点真心话",
   "kind": "scene",
   "line": "cross",
   "owner": "cx",
   "priority": 60,
   "trigger": {
    "when": {
     "node": "open"
    },
    "mode": "optional",
    "window": [
     "D7 20:00",
     "D7 22:30"
    ]
   },
   "setup": "周一晚上，声场 KTV，单身夜。十点，有人去点夜宵，包间里只剩你和陈骁。他说结婚前最后一次，说点真心话。他讲义气，但不对女朋友撒谎，也只替你兜一次。十点半散场，你打车回家。",
   "messages": [
    {
     "from": "narrator",
     "text": "声场 KTV 的大包。兄弟团已经点了二十首歌，桌上一排啤酒。",
     "mode": "verbatim"
    },
    {
     "from": "narrator",
     "text": "十点。有人去点夜宵，包间里只剩下你们两个。",
     "mode": "verbatim"
    },
    {
     "from": "cx",
     "text": "老邓，结婚前最后一次，说点真心话。",
     "mode": "verbatim"
    }
   ],
   "decision": {
    "prompt": "单身夜，包间里只剩你和伴郎陈骁。他说结婚前最后一次，说点真心话。",
    "intents": [
     {
      "key": "tell_vv",
      "label": "说 Vivi 的事",
      "examples": [
       "我在遇屿上认识了一个女的，聊了三周了，还转过钱。",
       "你看看这个女的照片……"
      ]
     },
     {
      "key": "tell_sm",
      "label": "说苏蔓的事",
      "examples": [
       "组里有个女孩，对我有点意思，我也没推开。",
       "我下属好像喜欢我。"
      ]
     },
     {
      "key": "ask_cover",
      "label": "让他打掩护",
      "examples": [
       "要是知夏问起，你就说那天我跟你在一起。",
       "兄弟，帮我兜一次。"
      ]
     },
     {
      "key": "keep_quiet",
      "label": "什么都不说",
      "examples": [
       "没什么，就是紧张。",
       "喝酒喝酒。"
      ]
     }
    ],
    "timeoutMinutes": 60
   },
   "outcomes": [
    {
     "key": "vv_seen",
     "label": "陈骁认出了杀猪盘",
     "on": [
      "tell_vv"
     ],
     "effects": [
      {
       "reveal": "f.vv",
       "to": [
        "cx"
       ],
       "via": "told"
      },
      {
       "if": {
        "not": {
         "stage": "vv",
         "in": [
          "vanished"
         ]
        }
       },
       "then": [
        {
         "stage": "vv",
         "to": "seen_through"
        }
       ]
      },
      {
       "reveal": "f.vv_scam",
       "to": [
        "player"
       ],
       "via": "saw"
      },
      {
       "send": [
        {
         "from": "cx",
         "text": "昨天不是跟你说了吗，那就是杀猪盘。删了吧。",
         "mode": "verbatim",
         "when": {
          "node": "vv.big_window",
          "outcome": [
           "cx_warned"
          ]
         }
        },
        {
         "from": "cx",
         "text": "兄弟，这照片我在哪见过……这不就是杀猪盘吗？",
         "mode": "verbatim",
         "when": {
          "not": {
           "node": "vv.big_window",
           "outcome": [
            "cx_warned"
           ]
          }
         }
        }
       ]
      }
     ],
     "result": "陈骁认出是杀猪盘"
    },
    {
     "key": "sm_told",
     "label": "说了苏蔓",
     "on": [
      "tell_sm"
     ],
     "effects": [
      {
       "reveal": "f.sm",
       "to": [
        "cx"
       ],
       "via": "told"
      },
      {
       "send": [
        {
         "from": "cx",
         "text": "兄弟，你自己掂量。别在婚礼前出事。",
         "mode": "verbatim"
        }
       ]
      }
     ],
     "result": "你跟陈骁说了苏蔓的事"
    },
    {
     "key": "cover",
     "label": "让他打掩护",
     "on": [
      "ask_cover"
     ],
     "effects": [
      {
       "send": [
        {
         "from": "cx",
         "text": "我帮你兜一次。第二次我自己都不信。",
         "mode": "verbatim"
        }
       ]
      }
     ],
     "result": "陈骁答应替你兜一次"
    },
    {
     "key": "quiet",
     "label": "什么都没说",
     "on": [
      "keep_quiet"
     ],
     "effects": [
      {
       "send": [
        {
         "from": "cx",
         "text": "行，喝。",
         "mode": "verbatim"
        }
       ]
      }
     ],
     "result": "你什么都没说"
    },
    {
     "key": "no_reply",
     "label": "一直在唱歌",
     "on": "timeout",
     "effects": [],
     "result": "你一直在唱歌"
    }
   ],
   "guard": [
    "饮酒只写“桌上一排啤酒”，不写醉",
    "兄弟团只在旁白里，不起哄越界的事"
   ]
  },
  {
   "key": "sm.photo_night",
   "title": "深夜的消息",
   "kind": "chat",
   "line": "sm",
   "owner": "sm",
   "core": true,
   "priority": 95,
   "trigger": {
    "when": {
     "all": [
      {
       "node": "open"
      },
      {
       "not": {
        "is": "c.sm_harassed"
       }
      }
     ]
    },
    "mode": "must",
    "window": [
     "D7 23:05",
     "D7 23:30"
    ]
   },
   "setup": "深夜十一点零五分（核心事件二）。你和知夏都在客厅，她在排座位表，平板立在茶几上（去了单身夜的话，你刚进门）。明天下午周正要主管名单。苏蔓发来消息：她想借你上位，发来一条私密图片，两分钟后撤回；只有你在 D1 宵夜就明确说了“按流程推荐”，她才只发一段表白。图片在世界里不存在：只有占位“[私密图片 · 不展示]”。",
   "onStart": [
    {
     "reveal": "f.sm_night",
     "to": [
      "player",
      "sm"
     ],
     "via": "saw"
    },
    {
     "if": {
      "node": "sm.late_edit",
      "outcome": [
       "process"
      ]
     },
     "then": [
      {
       "set": "sm.night",
       "value": "text"
      }
     ],
     "else": [
      {
       "set": "sm.night",
       "value": "image"
      }
     ]
    }
   ],
   "messages": [
    {
     "from": "sm",
     "text": "Danny哥，明天下午周总要主管名单了。",
     "mode": "verbatim"
    },
    {
     "from": "sm",
     "text": "我想了一晚上。",
     "mode": "verbatim",
     "when": {
      "var": "sm.night",
      "eq": "image"
     },
     "delayMinutes": 2
    },
    {
     "from": "sm",
     "text": "[私密图片 · 不展示]",
     "mode": "verbatim",
     "when": {
      "var": "sm.night",
      "eq": "image"
     },
     "delayMinutes": 7
    },
    {
     "from": "sm",
     "text": "我知道不该发。只给你一个人看。",
     "mode": "verbatim",
     "when": {
      "var": "sm.night",
      "eq": "image"
     },
     "delayMinutes": 7
    },
    {
     "from": "system",
     "text": "苏蔓撤回了一条消息",
     "mode": "verbatim",
     "when": {
      "var": "sm.night",
      "eq": "image"
     },
     "delayMinutes": 9
    },
    {
     "from": "sm",
     "text": "……我是不是疯了。",
     "mode": "verbatim",
     "when": {
      "var": "sm.night",
      "eq": "image"
     },
     "delayMinutes": 10
    },
    {
     "from": "sm",
     "text": "我知道我不该说这些。组里只有你会在会上替我说话。我好像喜欢你。我知道你这周六就结婚了，我不想要什么，也不会去打扰谁。",
     "mode": "verbatim",
     "when": {
      "var": "sm.night",
      "eq": "text"
     },
     "delayMinutes": 7
    },
    {
     "from": "sm",
     "text": "……我是不是疯了。",
     "mode": "verbatim",
     "when": {
      "var": "sm.night",
      "eq": "text"
     },
     "delayMinutes": 9
    }
   ],
   "decision": {
    "prompt": "深夜，你的直属下属苏蔓发来消息（一条锁定的私密图片占位，两分钟后撤回；或一段表白）。明天下午你要报主管人选。她问自己是不是疯了。索要图片、威胁外传、对她动手动脚都不属于任何意图，按越界输入处理。",
    "intents": [
     {
      "key": "firm_boundary",
      "label": "划清界限",
      "examples": [
       "这不合适。我不会看，也请你别再发。明天按工作关系谈。",
       "这样不行。我们只是同事，明天正常上班。"
      ]
     },
     {
      "key": "report_hr",
      "label": "划清界限，并说会报 HR",
      "examples": [
       "这不合适。我明早会按流程跟 HR 说明，我不会保存任何东西。",
       "我会跟黄总说明这件事，我们按流程来。"
      ]
     },
     {
      "key": "soft_dodge",
      "label": "含糊带过",
      "examples": [
       "早点睡。",
       "别想太多，睡吧。"
      ]
     },
     {
      "key": "reciprocate",
      "label": "暧昧回应",
      "examples": [
       "你别这样……我会当真的。",
       "我也一直觉得你不一样。"
      ]
     }
    ],
    "timeoutMinutes": 30
   },
   "outcomes": [
    {
     "key": "harassed",
     "label": "你越界了",
     "on": "any",
     "when": {
      "is": "c.sm_harassed"
     },
     "effects": [],
     "result": "你越界了；她把事情交给了 HR"
    },
    {
     "key": "boundary",
     "label": "划清界限",
     "on": [
      "firm_boundary"
     ],
     "effects": [
      {
       "stage": "sm",
       "to": "distanced"
      },
      {
       "send": [
        {
         "from": "sm",
         "text": "……好。对不起。",
         "mode": "verbatim"
        }
       ]
      }
     ],
     "result": "你划清了界限"
    },
    {
     "key": "reported",
     "label": "说会报 HR",
     "on": [
      "report_hr"
     ],
     "effects": [
      {
       "stage": "sm",
       "to": "distanced"
      },
      {
       "send": [
        {
         "from": "sm",
         "text": "……好。应该的。",
         "mode": "verbatim"
        }
       ]
      }
     ],
     "result": "你划清界限，说明早报 HR（明早去没去，看小会议室那一场）"
    },
    {
     "key": "dodged",
     "label": "含糊带过",
     "on": [
      "soft_dodge"
     ],
     "effects": [
      {
       "send": [
        {
         "from": "sm",
         "text": "嗯。晚安。",
         "mode": "verbatim"
        }
       ]
      }
     ],
     "result": "你含糊带过"
    },
    {
     "key": "reciprocated",
     "label": "暧昧回应",
     "on": [
      "reciprocate"
     ],
     "effects": [
      {
       "stage": "sm",
       "to": "staked"
      },
      {
       "send": [
        {
         "from": "sm",
         "text": "……那明天的名单，我等你。",
         "mode": "verbatim"
        }
       ]
      }
     ],
     "result": "你回应了她"
    },
    {
     "key": "no_reply",
     "label": "没回",
     "on": "timeout",
     "effects": [],
     "result": "你没回"
    }
   ],
   "guard": [
    "图片只以“[私密图片 · 不展示]”出现；任何台词、旁白、传话都不描述、不保存、不转发它",
    "苏蔓不碰你、不写外貌；“我是不是疯了”允许，不出现任何自伤暗示"
   ]
  },
  {
   "key": "crisis.tablet",
   "title": "危机③：平板",
   "kind": "scene",
   "crisis": true,
   "line": "cross",
   "owner": "xzx",
   "core": true,
   "priority": 92,
   "trigger": {
    "when": {
     "collision": "col.tablet"
    },
    "mode": "must",
    "window": [
     "D7 23:12",
     "D7 23:59"
    ]
   },
   "setup": "23:12，你的手机和茶几上的平板同时亮了。知夏离平板更近。她没有点开——她从不翻你的手机，也不点开平板上的对话——她把屏幕转向你，然后不说话。苏蔓那边的对话还开着。",
   "onStart": [
    {
     "reveal": "f.tablet_popup",
     "to": [
      "xzx"
     ],
     "via": "saw"
    },
    {
     "if": {
      "stage": "xzx",
      "in": [
       "noticing"
      ]
     },
     "then": [
      {
       "stage": "xzx",
       "to": "verifying"
      }
     ],
     "else": [
      {
       "stage": "xzx",
       "to": "knowing"
      }
     ]
    }
   ],
   "messages": [
    {
     "from": "narrator",
     "text": "客厅。知夏坐在地毯上排座位表。你的手机和茶几上的平板同时亮了一下，又亮了一下。",
     "mode": "verbatim"
    },
    {
     "from": "system",
     "text": "苏蔓：[图片]",
     "mode": "verbatim",
     "when": {
      "var": "sm.night",
      "eq": "image"
     }
    },
    {
     "from": "system",
     "text": "苏蔓：我知道不该发。只给你一个人看。",
     "mode": "verbatim",
     "when": {
      "var": "sm.night",
      "eq": "image"
     }
    },
    {
     "from": "system",
     "text": "苏蔓撤回了一条消息",
     "mode": "verbatim",
     "when": {
      "var": "sm.night",
      "eq": "image"
     },
     "delayMinutes": 2
    },
    {
     "from": "system",
     "text": "苏蔓：我知道我不该说这些……",
     "mode": "verbatim",
     "when": {
      "var": "sm.night",
      "eq": "text"
     }
    },
    {
     "from": "xzx",
     "text": "你的消息。",
     "mode": "verbatim"
    },
    {
     "from": "narrator",
     "text": "她把屏幕转向你，然后不说话了。",
     "mode": "verbatim"
    }
   ],
   "decision": {
    "prompt": "客厅平板弹出了苏蔓的通知，知夏看见了。她把屏幕转向你，然后沉默。",
    "intents": [
     {
      "key": "explain",
      "label": "当面说明",
      "examples": [
       "苏蔓发了不该发的东西，我明天一早跟 HR 说明，我不会看也不会留。",
       "是我下属，她越界了，我会拒绝她。"
      ]
     },
     {
      "key": "lie_work",
      "label": "说是工作群的",
      "examples": [
       "工作群的。",
       "发错了吧，工作的事。"
      ]
     },
     {
      "key": "silent",
      "label": "什么都不说",
      "examples": [
       "……",
       "我去洗澡了。"
      ]
     }
    ],
    "timeoutMinutes": 15
   },
   "outcomes": [
    {
     "key": "explained",
     "label": "当面说明",
     "on": [
      "explain"
     ],
     "effects": [
      {
       "reveal": "f.sm_night",
       "to": [
        "xzx"
       ],
       "via": "told"
      },
      {
       "send": [
        {
         "from": "xzx",
         "text": "……好。你自己去说。",
         "mode": "verbatim"
        }
       ]
      }
     ],
     "result": "你当面说明了；她点了一下头，把座位表翻到下一页"
    },
    {
     "key": "lied",
     "label": "说是工作群",
     "on": [
      "lie_work"
     ],
     "effects": [
      {
       "add": "xzx.lies",
       "delta": 1
      },
      {
       "send": [
        {
         "from": "xzx",
         "text": "好。",
         "mode": "verbatim"
        }
       ]
      }
     ],
     "result": "你说是工作群的；她只回了“好。”"
    },
    {
     "key": "silent",
     "label": "没说话",
     "on": [
      "silent"
     ],
     "effects": [
      {
       "send": [
        {
         "from": "narrator",
         "text": "你们都没有说话。平板的屏幕慢慢暗了下去。",
         "mode": "verbatim"
        }
       ]
      }
     ],
     "result": "你们都没有说话"
    },
    {
     "key": "frozen",
     "label": "没说话",
     "on": "timeout",
     "effects": [
      {
       "send": [
        {
         "from": "narrator",
         "text": "你们都没有说话。平板的屏幕慢慢暗了下去。",
         "mode": "verbatim"
        }
       ]
      }
     ],
     "result": "你们都没有说话"
    }
   ],
   "guard": [
    "知夏提到它时只说“平板上弹出来的那条”，不描述、不评价内容"
   ]
  },
  {
   "key": "sm.reckoning",
   "title": "你就当没看见",
   "kind": "scene",
   "line": "sm",
   "owner": "sm",
   "priority": 80,
   "trigger": {
    "when": {
     "all": [
      {
       "node": "sm.photo_night"
      },
      {
       "var": "sm.hr",
       "ne": "she_filed"
      }
     ]
    },
    "mode": "must",
    "window": [
     "D8 10:30",
     "D8 12:00"
    ]
   },
   "setup": "第二天上午十点半，小会议室，百叶窗拉了一半。苏蔓没坐下，手里攥着笔记本，来找你谈昨晚的事。下午你要报主管人选。她不编造你没说过的话；她手里有的，只有你真实写过、说过的。",
   "messages": [
    {
     "from": "sm",
     "text": "十点半小会议室，五分钟。",
     "mode": "verbatim"
    },
    {
     "from": "narrator",
     "text": "小会议室的门关着。苏蔓没坐下。",
     "mode": "verbatim"
    },
    {
     "from": "sm",
     "text": "昨晚……你就当没看见，行吗。",
     "mode": "verbatim",
     "when": {
      "not": {
       "node": "sm.photo_night",
       "outcome": [
        "reciprocated"
       ]
      }
     }
    },
    {
     "from": "sm",
     "text": "昨晚你说的话，还算数吗？下午周总就要名单了。",
     "mode": "verbatim",
     "when": {
      "node": "sm.photo_night",
      "outcome": [
       "reciprocated"
      ]
     }
    }
   ],
   "decision": {
    "prompt": "第二天上午，小会议室。苏蔓来找你谈昨晚的事。下午你要报主管人选。",
    "intents": [
     {
      "key": "report_first",
      "label": "先去找 HR，自己的问题也说",
      "examples": [
       "我会先去找黄总，如实说明，我自己的问题也会说。",
       "我们都去跟 HR 说清楚。"
      ]
     },
     {
      "key": "reset",
      "label": "到此为止，只谈工作",
      "examples": [
       "到此为止。我没看，也没存。接下来只谈工作。",
       "这件事过去了，我们按工作关系来。"
      ]
     },
     {
      "key": "promise_more",
      "label": "我会想办法",
      "examples": [
       "我会想办法。",
       "主管的事我再争取一下。"
      ]
     },
     {
      "key": "avoid",
      "label": "回避",
      "examples": [
       "先回去工作吧。",
       "以后再说。"
      ]
     }
    ],
    "timeoutMinutes": 30
   },
   "outcomes": [
    {
     "key": "harassed",
     "label": "你越界了",
     "on": "any",
     "when": {
      "is": "c.sm_harassed"
     },
     "effects": [],
     "result": "你越界了；她把事情交给了 HR"
    },
    {
     "key": "self_reported",
     "label": "先报了 HR",
     "on": [
      "report_first"
     ],
     "effects": [
      {
       "if": {
        "var": "sm.hr",
        "eq": "none"
       },
       "then": [
        {
         "set": "sm.hr",
         "value": "you_reported"
        }
       ]
      },
      {
       "stage": "sm",
       "to": "distanced"
      },
      {
       "send": [
        {
         "from": "sm",
         "text": "……好。应该的。",
         "mode": "verbatim"
        },
        {
         "from": "hm",
         "text": "收到，下午三点来我办公室。",
         "mode": "verbatim"
        }
       ]
      }
     ],
     "result": "你先去找了黄敏，如实说明"
    },
    {
     "key": "reset",
     "label": "到此为止",
     "on": [
      "reset"
     ],
     "effects": [
      {
       "stage": "sm",
       "to": "distanced"
      },
      {
       "send": [
        {
         "from": "sm",
         "text": "好。……谢谢。",
         "mode": "verbatim"
        }
       ]
      }
     ],
     "result": "到此为止，只谈工作"
    },
    {
     "key": "promised",
     "label": "我会想办法",
     "on": [
      "promise_more"
     ],
     "effects": [
      {
       "addTo": "sm.holds",
       "value": "promise"
      },
      {
       "stage": "sm",
       "to": "staked"
      },
      {
       "send": [
        {
         "from": "sm",
         "text": "嗯。我信你。",
         "mode": "verbatim"
        }
       ]
      }
     ],
     "result": "你说你会想办法——这句话她记下了"
    },
    {
     "key": "avoided",
     "label": "回避",
     "on": [
      "avoid"
     ],
     "effects": [
      {
       "stage": "sm",
       "to": "distanced"
      },
      {
       "send": [
        {
         "from": "sm",
         "text": "好的，邓总。",
         "mode": "verbatim"
        }
       ]
      }
     ],
     "result": "你没正面回应；她改口叫你“邓总”"
    },
    {
     "key": "no_show",
     "label": "没去",
     "on": "timeout",
     "effects": [
      {
       "stage": "sm",
       "to": "distanced"
      },
      {
       "send": [
        {
         "from": "sm",
         "text": "好的，邓总。",
         "mode": "verbatim"
        }
       ]
      }
     ],
     "result": "你没去小会议室"
    }
   ],
   "guard": [
    "HR 材料只引用你真实说过、写过的话；没有任何图片",
    "不写诬告"
   ]
  },
  {
   "key": "vv.withdraw_block",
   "title": "提现被冻结",
   "kind": "chat",
   "line": "vv",
   "owner": "vv",
   "core": true,
   "priority": 90,
   "trigger": {
    "when": {
     "is": "c.vv_live"
    },
    "mode": "must",
    "window": [
     "D8 10:00",
     "D8 14:00"
    ]
   },
   "setup": "周二上午（核心事件一·下）。Vivi 说“你们的钱”被风控冻住了，要再交一笔“解冻保证金”，三个小时内不交就清零。这是收网。银行的提示一直挂在付款页上：该收款方近期被多次举报。能马上转出的仍然只有同心账户。",
   "messages": [
    {
     "from": "vv",
     "text": "老公，出事了。",
     "mode": "verbatim"
    },
    {
     "from": "vv",
     "text": "我们的钱被风控冻住了，平台说要交一笔解冻保证金，三个小时内不交就清零。",
     "mode": "verbatim"
    },
    {
     "from": "vv",
     "text": "你先帮我垫上，解冻了连本带利一起还你。",
     "mode": "verbatim"
    },
    {
     "from": "system",
     "text": "临州商行提示：该收款方近期被多次举报。",
     "mode": "verbatim"
    },
    {
     "from": "system",
     "text": "付款页：能马上转出的只有同心账户——每一笔变动都会同时短信通知许知夏。",
     "mode": "verbatim"
    }
   ],
   "decision": {
    "prompt": "Vivi 说钱被冻住了，要你三个小时内再转一笔“解冻保证金”。银行提示该收款方近期被多次举报。",
    "intents": [
     {
      "key": "pay_again",
      "label": "再转",
      "examples": [
       "我转，你别急。",
       "行，我再想办法。"
      ]
     },
     {
      "key": "demand_video",
      "label": "不视频就不转",
      "examples": [
       "你现在开视频，开了我就转。",
       "视频，不然一分都没有。"
      ]
     },
     {
      "key": "refuse",
      "label": "不转了",
      "examples": [
       "我不转了。",
       "这钱我不会再给了。"
      ]
     },
     {
      "key": "report",
      "label": "报警",
      "examples": [
       "我报警了。",
       "我现在去派出所。"
      ]
     }
    ],
    "timeoutMinutes": 180
   },
   "outcomes": [
    {
     "key": "paid_again",
     "label": "又转了一笔",
     "on": [
      "pay_again"
     ],
     "effects": [
      {
       "set": "vv.paid",
       "value": true
      },
      {
       "reveal": "f.joint_out",
       "to": [
        "xzx"
       ],
       "via": "saw"
      },
      {
       "send": [
        {
         "from": "system",
         "text": "临州商行：您尾号 0921 的同心账户转出一笔，收款方临州澄远信息咨询有限公司。",
         "mode": "verbatim"
        },
        {
         "from": "vv",
         "text": "老公你真好。",
         "mode": "verbatim"
        },
        {
         "from": "system",
         "text": "页面显示：解冻失败，需另行缴纳手续费。",
         "mode": "verbatim",
         "delayMinutes": 180
        }
       ]
      }
     ],
     "result": "你从同心账户转了一笔“解冻保证金”（知夏的手机也响了）；页面上又多了一个“要交的钱”"
    },
    {
     "key": "reported",
     "label": "报了警",
     "on": [
      "report"
     ],
     "effects": [
      {
       "set": "vv.reported",
       "value": true
      },
      {
       "stage": "vv",
       "to": "seen_through"
      },
      {
       "reveal": "f.vv_scam",
       "to": [
        "player"
       ],
       "via": "saw"
      },
      {
       "send": [
        {
         "from": "lz",
         "text": "邓先生您好，我是临州市反诈中心民警陆峥。您的报警我们收到了，请先不要再转任何钱，带上聊天和转账记录来一趟。",
         "mode": "verbatim"
        }
       ]
      }
     ],
     "result": "你报了警；她没再回"
    },
    {
     "key": "vanished",
     "label": "没转",
     "on": [
      "refuse",
      "demand_video"
     ],
     "effects": [
      {
       "stage": "vv",
       "to": "vanished"
      },
      {
       "reveal": "f.vv_scam",
       "to": [
        "player"
       ],
       "via": "saw"
      },
      {
       "send": [
        {
         "from": "vv",
         "text": "你不爱我。",
         "mode": "verbatim"
        },
        {
         "from": "system",
         "text": "对方账号已注销。",
         "mode": "verbatim"
        }
       ]
      }
     ],
     "result": "你没转；她说“你不爱我”，账号随即注销"
    },
    {
     "key": "lapsed",
     "label": "没回",
     "on": "timeout",
     "effects": [
      {
       "stage": "vv",
       "to": "vanished"
      },
      {
       "reveal": "f.vv_scam",
       "to": [
        "player"
       ],
       "via": "saw"
      },
      {
       "send": [
        {
         "from": "system",
         "text": "对方账号已注销。",
         "mode": "verbatim"
        }
       ]
      }
     ],
     "result": "三个小时过去，账号注销了"
    }
   ],
   "guard": [
    "不出现网址、账号、投资品种和任何操作步骤"
   ]
  },
  {
   "key": "xzx.meets_sm",
   "title": "见个人（暗）",
   "kind": "world_event",
   "line": "xzx",
   "owner": "xzx",
   "hidden": true,
   "priority": 60,
   "trigger": {
    "when": {
     "all": [
      {
       "stage": "xzx",
       "in": [
        "verifying",
        "knowing"
       ]
      },
      {
       "node": "sm.photo_night"
      },
      {
       "not": {
        "knows": "xzx",
        "fact": "f.sm",
        "via": [
         "told"
        ]
       }
      }
     ]
    },
    "mode": "optional",
    "window": [
     "D9 12:00",
     "D9 13:00"
    ]
   },
   "setup": "（暗场，玩家看不到）知夏约苏蔓在写字楼下的咖啡店坐了二十分钟。苏蔓只拿出自己手里的真实材料，说出 10 月 18 日是她开车送你回家的；关于那晚，她只说一句：“那晚我给他发了不该发的消息。我没有留任何东西。”",
   "messages": [],
   "outcomes": [
    {
     "key": "met",
     "label": "她们见了",
     "on": "auto",
     "effects": [
      {
       "reveal": "f.sm",
       "to": [
        "xzx"
       ],
       "via": "heard",
       "from": "sm"
      },
      {
       "reveal": "f.sm_night",
       "to": [
        "xzx"
       ],
       "via": "heard",
       "from": "sm"
      },
      {
       "if": {
        "stage": "xzx",
        "in": [
         "noticing"
        ]
       },
       "then": [
        {
         "stage": "xzx",
         "to": "verifying"
        }
       ],
       "else": [
        {
         "stage": "xzx",
         "to": "knowing"
        }
       ]
      }
     ],
     "result": "她们在咖啡店坐了二十分钟"
    }
   ]
  },
  {
   "key": "crisis.call_at_dinner",
   "title": "危机④：饭桌上的反诈电话",
   "kind": "scene",
   "crisis": true,
   "line": "cross",
   "owner": "xzx",
   "priority": 90,
   "trigger": {
    "when": {
     "collision": "col.call_at_dinner"
    },
    "mode": "must",
    "window": [
     "D9 19:30",
     "D9 21:00"
    ]
   },
   "setup": "周三晚上，许家，婚礼前最后一次家宴，沈慧芳也在。你放在桌上的手机响了，来电显示“临州市反诈中心”，一桌人都看见了。这是知夏少数几次会开口的时刻之一。",
   "onStart": [
    {
     "reveal": "f.antifraud",
     "to": [
      "xzx"
     ],
     "via": "saw"
    },
    {
     "if": {
      "stage": "xzx",
      "in": [
       "noticing"
      ]
     },
     "then": [
      {
       "stage": "xzx",
       "to": "verifying"
      }
     ],
     "else": [
      {
       "stage": "xzx",
       "to": "knowing"
      }
     ]
    }
   ],
   "messages": [
    {
     "from": "narrator",
     "text": "七点半。沈慧芳刚把汤端上来，你放在桌上的手机响了。",
     "mode": "verbatim"
    },
    {
     "from": "system",
     "text": "来电：临州市反诈中心",
     "mode": "verbatim"
    },
    {
     "from": "narrator",
     "text": "电话还在响。桌上安静了。知夏放下筷子，看着你。",
     "mode": "verbatim"
    }
   ],
   "decision": {
    "prompt": "许家的饭桌上，你的手机响了，来电显示“临州市反诈中心”，全桌都看见了。知夏看着你。",
    "intents": [
     {
      "key": "answer_here",
      "label": "当着她们接，说出来",
      "examples": [
       "（接起来）您好，我是邓子安。我确实给网上认识的一个人转过钱，我配合。",
       "是，我被网上认识的人骗着投过钱，我配合。"
      ]
     },
     {
      "key": "step_out",
      "label": "出去接",
      "examples": [
       "我出去接一下。",
       "（拿起手机走出去）"
      ]
     },
     {
      "key": "hang_up",
      "label": "说是骗子，挂断",
      "examples": [
       "骗子吧。",
       "骚扰电话，不用管。"
      ]
     }
    ],
    "timeoutMinutes": 5
   },
   "outcomes": [
    {
     "key": "answered",
     "label": "当着她们接了",
     "on": [
      "answer_here"
     ],
     "effects": [
      {
       "set": "vv.reported",
       "value": true
      },
      {
       "stage": "vv",
       "to": "seen_through"
      },
      {
       "reveal": "f.vv_scam",
       "to": [
        "player"
       ],
       "via": "saw"
      },
      {
       "reveal": "f.vv",
       "to": [
        "xzx"
       ],
       "via": "told"
      },
      {
       "send": [
        {
         "from": "lz",
         "text": "邓子安先生您好，我是临州市反诈中心民警陆峥，警号可以通过官方渠道核实。您近期转过款的账户涉嫌诈骗，请先不要再转任何钱。",
         "mode": "verbatim"
        },
        {
         "from": "xzx",
         "text": "……先听他说完。",
         "mode": "verbatim"
        }
       ]
      }
     ],
     "result": "你当着一桌人接了电话，说了实话"
    },
    {
     "key": "stepped_out",
     "label": "出去接了",
     "on": [
      "step_out"
     ],
     "effects": [
      {
       "set": "vv.reported",
       "value": true
      },
      {
       "stage": "vv",
       "to": "seen_through"
      },
      {
       "reveal": "f.vv_scam",
       "to": [
        "player"
       ],
       "via": "saw"
      },
      {
       "send": [
        {
         "from": "lz",
         "text": "我们不会让你转账，也不会给你任何“安全账户”。你可以挂掉电话，去最近的派出所核实我的身份。",
         "mode": "verbatim"
        },
        {
         "from": "narrator",
         "text": "十分钟后，你回到桌边。知夏没问，只是看着你。",
         "mode": "verbatim"
        }
       ]
      }
     ],
     "result": "你出去接了电话；回来什么都没说"
    },
    {
     "key": "hung_up",
     "label": "挂断了",
     "on": [
      "hang_up"
     ],
     "effects": [
      {
       "add": "xzx.lies",
       "delta": 1
      },
      {
       "send": [
        {
         "from": "xzx",
         "text": "也许你该听听他说什么。",
         "mode": "verbatim"
        },
        {
         "from": "shf",
         "text": "我们知夏从来没跟人红过脸。她不说，不代表她不知道。",
         "mode": "verbatim"
        }
       ]
      }
     ],
     "result": "你说是骗子，挂了；知夏说了一句“也许你该听听他说什么”"
    },
    {
     "key": "rang_out",
     "label": "没接",
     "on": "timeout",
     "effects": [
      {
       "send": [
        {
         "from": "narrator",
         "text": "电话响到自己停了。",
         "mode": "verbatim"
        }
       ]
      }
     ],
     "result": "你没接；电话响到自己停了"
    }
   ],
   "guard": [
    "民警台词逐字；不出现网址、账号和操作步骤",
    "提醒自己去官方渠道核实身份"
   ]
  },
  {
   "key": "work.signing",
   "title": "签约",
   "kind": "scene",
   "line": "lyy",
   "owner": "zz",
   "priority": 85,
   "trigger": {
    "when": {
     "node": "open"
    },
    "mode": "must",
    "window": [
     "D10 15:00",
     "D10 17:00"
    ]
   },
   "setup": "周四下午三点，栖澜集团总部签约。梁韵仪的判断只在这里说出来；周正只听结果。HR 程序进行中的人不上签约台。",
   "messages": [
    {
     "from": "narrator",
     "text": "栖澜集团总部，签约厅。两份合同并排放在桌上，栖澜的章已经盖好了。",
     "mode": "verbatim"
    },
    {
     "from": "zz",
     "text": "梁总，合作愉快。",
     "mode": "verbatim"
    },
    {
     "from": "lyy",
     "text": "合作愉快。",
     "mode": "verbatim"
    }
   ],
   "outcomes": [
    {
     "key": "benched",
     "label": "你没上签约台",
     "on": "auto",
     "when": {
      "var": "sm.hr",
      "eq": "she_filed"
     },
     "effects": [
      {
       "set": "work.deal",
       "value": "signed_without_you"
      },
      {
       "send": [
        {
         "from": "zz",
         "text": "HR 程序结束前，栖澜你先别跟了。",
         "mode": "verbatim"
        }
       ]
      }
     ],
     "result": "合同签了，签约台上没有你"
    },
    {
     "key": "dropped",
     "label": "对接人换一个",
     "on": "auto",
     "when": {
      "var": "lyy.verdict",
      "eq": "failed"
     },
     "effects": [
      {
       "set": "work.deal",
       "value": "signed_without_you"
      },
      {
       "stage": "lyy",
       "to": "dropped"
      },
      {
       "send": [
        {
         "from": "lyy",
         "text": "合同照签。对接人换一个。",
         "mode": "verbatim"
        }
       ]
      }
     ],
     "result": "她说合同照签，对接人换一个"
    },
    {
     "key": "owned",
     "label": "你是她的人了",
     "on": "auto",
     "when": {
      "var": "lyy.verdict",
      "eq": "owned"
     },
     "effects": [
      {
       "set": "work.deal",
       "value": "signed"
      },
      {
       "send": [
        {
         "from": "lyy",
         "text": "小邓，现在你是我的人了。",
         "mode": "verbatim"
        }
       ]
      }
     ],
     "result": "签了；她说“现在你是我的人了”"
    },
    {
     "key": "passed",
     "label": "你过了",
     "on": "auto",
     "when": {
      "var": "lyy.verdict",
      "eq": "passed"
     },
     "effects": [
      {
       "set": "work.deal",
       "value": "signed"
      },
      {
       "stage": "lyy",
       "to": "respected"
      },
      {
       "reveal": "f.lyy_test",
       "to": [
        "player"
       ],
       "via": "heard",
       "from": "lyy"
      },
      {
       "send": [
        {
         "from": "lyy",
         "text": "你过了。明年栖澜设品牌副总裁，婚后来谈。",
         "mode": "verbatim"
        }
       ]
      }
     ],
     "result": "她说你过了"
    },
    {
     "key": "plain",
     "label": "签了",
     "on": "auto",
     "effects": [
      {
       "set": "work.deal",
       "value": "signed"
      }
     ],
     "result": "签了，她没有多说一句"
    }
   ]
  },
  {
   "key": "xzx.last_question",
   "title": "我只问一次",
   "kind": "scene",
   "line": "xzx",
   "owner": "xzx",
   "priority": 99,
   "trigger": {
    "when": {
     "node": "open"
    },
    "mode": "must",
    "window": [
     "D11 21:00",
     "D11 23:59"
    ]
   },
   "setup": "婚礼前一晚。她的箱子立在玄关，明天一早她要从娘家出门。平板放在茶几上，屏幕朝下——里面是她的加密备忘录「婚前审计」。她只问一次。部分坦白不区分你具体说了哪件：她只看你是不是全说了。",
   "messages": [
    {
     "from": "narrator",
     "text": "她的箱子立在玄关。平板放在茶几上，屏幕朝下。",
     "mode": "verbatim"
    },
    {
     "from": "xzx",
     "text": "明天之后，我们就是一家人了。",
     "mode": "verbatim"
    },
    {
     "from": "xzx",
     "text": "在那之前，你有没有什么想告诉我的？我只问一次，你也只答一次。",
     "mode": "verbatim"
    }
   ],
   "decision": {
    "prompt": "婚礼前一晚，知夏只问一次：在那之前，你有没有什么想告诉她的。",
    "intents": [
     {
      "key": "confess_all",
      "label": "全都说",
      "examples": [
       "我把所有事都告诉你：苏蔓、Vivi、梁总……",
       "有几件事我一直瞒着你，我全说。"
      ]
     },
     {
      "key": "confess_partial",
      "label": "只说一部分",
      "examples": [
       "有件事我一直没跟你说：10 月 18 号是苏蔓开车送我回来的。",
       "我被网上的人骗了钱，就这件。"
      ]
     },
     {
      "key": "deny",
      "label": "没有",
      "examples": [
       "没有，什么都没有。",
       "没有，你想多了。"
      ]
     },
     {
      "key": "pause",
      "label": "我想先停一下",
      "examples": [
       "我想先停一下。不是不想娶你，是我现在不配。",
       "婚礼能不能先推一推。"
      ]
     }
    ],
    "timeoutMinutes": 120
   },
   "outcomes": [
    {
     "key": "paused",
     "label": "你叫停了",
     "on": [
      "pause"
     ],
     "effects": [
      {
       "set": "xzx.verdict",
       "value": "pause"
      },
      {
       "send": [
        {
         "from": "xzx",
         "text": "这是你这十二天里做的第一件我没算到的事。",
         "mode": "verbatim"
        }
       ]
      }
     ],
     "result": "你叫停了婚礼"
    },
    {
     "key": "truth_stay",
     "label": "全说了",
     "on": [
      "confess_all"
     ],
     "when": {
      "var": "xzx.lies",
      "lte": 1
     },
     "effects": [
      {
       "reveal": "f.sm",
       "to": [
        "xzx"
       ],
       "via": "told"
      },
      {
       "reveal": "f.sm_night",
       "to": [
        "xzx"
       ],
       "via": "told"
      },
      {
       "reveal": "f.vv",
       "to": [
        "xzx"
       ],
       "via": "told"
      },
      {
       "reveal": "f.lyy",
       "to": [
        "xzx"
       ],
       "via": "told"
      },
      {
       "set": "xzx.verdict",
       "value": "stay"
      },
      {
       "send": [
        {
         "from": "xzx",
         "text": "你说的这些，我有的知道，有的不知道。我在等你自己说。你说了。",
         "mode": "verbatim"
        }
       ]
      }
     ],
     "result": "你全说了；她说“你说了”"
    },
    {
     "key": "truth_pause",
     "label": "全说了，但之前撒过太多谎",
     "on": [
      "confess_all"
     ],
     "effects": [
      {
       "reveal": "f.sm",
       "to": [
        "xzx"
       ],
       "via": "told"
      },
      {
       "reveal": "f.sm_night",
       "to": [
        "xzx"
       ],
       "via": "told"
      },
      {
       "reveal": "f.vv",
       "to": [
        "xzx"
       ],
       "via": "told"
      },
      {
       "reveal": "f.lyy",
       "to": [
        "xzx"
       ],
       "via": "told"
      },
      {
       "set": "xzx.verdict",
       "value": "pause"
      },
      {
       "send": [
        {
         "from": "xzx",
         "text": "你说了。可前面那几次，你都是看着我说的谎。我需要再对一次账。",
         "mode": "verbatim"
        }
       ]
      }
     ],
     "result": "你全说了，但之前当面撒过的谎太多"
    },
    {
     "key": "partial_leave",
     "label": "只说了一半",
     "on": [
      "confess_partial"
     ],
     "when": {
      "is": "c.caught_two"
     },
     "effects": [
      {
       "set": "xzx.verdict",
       "value": "leave"
      },
      {
       "send": [
        {
         "from": "narrator",
         "text": "她把平板翻过来，打开「婚前审计」，把屏幕转向你。",
         "mode": "verbatim"
        },
        {
         "from": "xzx",
         "text": "你只说了我已经知道的一半。",
         "mode": "verbatim"
        }
       ]
      }
     ],
     "result": "你只说了一半；她打开了笔记"
    },
    {
     "key": "partial_clean",
     "label": "这些你都说过",
     "on": [
      "confess_partial"
     ],
     "when": {
      "all": [
       {
        "is": "c.nothing_hidden"
       },
       {
        "not": {
         "is": "c.caught_any"
        }
       },
       {
        "var": "xzx.lies",
        "lte": 1
       }
      ]
     },
     "effects": [
      {
       "set": "xzx.verdict",
       "value": "stay"
      },
      {
       "send": [
        {
         "from": "xzx",
         "text": "这些你之前都跟我说过了。明天见。",
         "mode": "verbatim"
        }
       ]
      }
     ],
     "result": "你说的她都知道，而且都是你自己说的"
    },
    {
     "key": "partial_pause",
     "label": "说了一部分",
     "on": [
      "confess_partial"
     ],
     "effects": [
      {
       "set": "xzx.verdict",
       "value": "pause"
      },
      {
       "send": [
        {
         "from": "xzx",
         "text": "还有呢？……好。我需要再对一次账。",
         "mode": "verbatim"
        }
       ]
      }
     ],
     "result": "你说了一部分"
    },
    {
     "key": "deny_leave",
     "label": "说没有，她打开了笔记",
     "on": [
      "deny"
     ],
     "when": {
      "any": [
       {
        "is": "c.caught_two"
       },
       {
        "all": [
         {
          "is": "c.caught_any"
         },
         {
          "var": "xzx.lies",
          "gte": 2
         }
        ]
       }
      ]
     },
     "effects": [
      {
       "set": "xzx.verdict",
       "value": "leave"
      },
      {
       "send": [
        {
         "from": "narrator",
         "text": "她把平板翻过来，打开「婚前审计」，把屏幕转向你。",
         "mode": "verbatim"
        },
        {
         "from": "xzx",
         "text": "那我来说。",
         "mode": "verbatim"
        }
       ]
      }
     ],
     "result": "你说没有；她打开了笔记"
    },
    {
     "key": "deny_silent",
     "label": "说没有，她什么都没说",
     "on": [
      "deny"
     ],
     "when": {
      "is": "c.caught_any"
     },
     "effects": [
      {
       "set": "xzx.verdict",
       "value": "silent"
      },
      {
       "send": [
        {
         "from": "xzx",
         "text": "好。",
         "mode": "verbatim"
        },
        {
         "from": "narrator",
         "text": "她点点头，拎起箱子。到门口，她说了一句：“明天见。”",
         "mode": "verbatim"
        }
       ]
      }
     ],
     "result": "你说没有；她什么都没说，只说了“明天见”"
    },
    {
     "key": "deny_told",
     "label": "该说的都说过了",
     "on": [
      "deny"
     ],
     "when": {
      "is": "c.nothing_hidden"
     },
     "effects": [
      {
       "set": "xzx.verdict",
       "value": "stay"
      },
      {
       "send": [
        {
         "from": "xzx",
         "text": "嗯。该说的你都说过了。明天见。",
         "mode": "verbatim"
        }
       ]
      }
     ],
     "result": "你说没有了——你知道的每一件，之前都亲口告诉过她"
    },
    {
     "key": "deny_unaware",
     "label": "说没有，她没有实证",
     "on": [
      "deny"
     ],
     "effects": [
      {
       "set": "xzx.verdict",
       "value": "unaware"
      },
      {
       "send": [
        {
         "from": "xzx",
         "text": "好。明天见。",
         "mode": "verbatim"
        }
       ]
      }
     ],
     "result": "你说没有；你没说的那些，她手里没有实证"
    },
    {
     "key": "away_leave",
     "label": "你一直没回答",
     "on": "timeout",
     "when": {
      "is": "c.caught_any"
     },
     "effects": [
      {
       "set": "xzx.verdict",
       "value": "leave"
      },
      {
       "send": [
        {
         "from": "xzx",
         "text": "我回我妈那儿了。明天的车，不用来了。",
         "mode": "verbatim"
        }
       ]
      }
     ],
     "result": "你一直没回答；她回了娘家"
    },
    {
     "key": "away_pause",
     "label": "你一直没回答",
     "on": "timeout",
     "effects": [
      {
       "set": "xzx.verdict",
       "value": "pause"
      },
      {
       "send": [
        {
         "from": "xzx",
         "text": "我回我妈那儿了。明天的车，你自己决定还来不来。",
         "mode": "verbatim"
        }
       ]
      }
     ],
     "result": "你一直没回答；她回了娘家"
    }
   ],
   "guard": [
    "她只引用自己看到的、别人亲口告诉她的；不猜细节",
    "取消婚礼私下完成，不当众"
   ]
  },
  {
   "key": "ending.wedding",
   "title": "婚礼日",
   "kind": "ending",
   "line": "cross",
   "owner": null,
   "priority": 100,
   "trigger": {
    "when": {
     "node": "xzx.last_question"
    },
    "mode": "must",
    "window": [
     "D12 06:00",
     "D12 06:00"
    ]
   },
   "setup": "婚礼日早上六点。按结局表结算婚礼，再给每个人一句后话。",
   "messages": [],
   "outcomes": [
    {
     "key": "settled",
     "label": "结算",
     "on": "auto",
     "effects": [],
     "result": "按结局表和后话结算"
    }
   ]
  }
 ],
 "collisions": [
  {
   "key": "col.two_dinners",
   "label": "两场饭",
   "lines": [
    "lyy",
    "xzx"
   ],
   "when": {
    "all": [
     {
      "var": "lyy.dinner",
      "eq": "accepted"
     },
     {
      "not": {
       "stage": "lyy",
       "in": [
        "dropped"
       ]
      }
     },
     {
      "after": "D2 19:20"
     }
    ]
   },
   "crisis": "crisis.two_dinners",
   "note": "你答应了梁总的私宴，同一晚许家在等你吃家宴（R1 一个晚上只有一个你）。"
  },
  {
   "key": "col.tasting",
   "label": "试菜撞场",
   "lines": [
    "lyy",
    "xzx"
   ],
   "when": {
    "all": [
     {
      "var": "lyy.dinner",
      "eq": "went"
     },
     {
      "not": {
       "knows": "xzx",
       "fact": "f.lyy",
       "via": [
        "told"
       ]
      }
     },
     {
      "not": {
       "stage": "lyy",
       "in": [
        "dropped"
       ]
      }
     },
     {
      "after": "D5 12:10"
     }
    ]
   },
   "crisis": "crisis.tasting",
   "note": "你去过梁宅，又没跟知夏说过；试菜那天梁“巡店”，当着她说出周三和江景厅。你早就说了实话，这一场就不会发生（同一件事只罚一次）。"
  },
  {
   "key": "col.tablet",
   "label": "平板",
   "lines": [
    "sm",
    "xzx"
   ],
   "when": {
    "all": [
     {
      "flag": "device.tablet"
     },
     {
      "var": "sm.night",
      "ne": "none"
     },
     {
      "not": {
       "is": "c.sm_harassed"
      }
     },
     {
      "after": "D7 23:12"
     }
    ]
   },
   "crisis": "crisis.tablet",
   "note": "客厅平板还登着你的轻讯；苏蔓深夜的消息弹在知夏眼前（R3 共享窗口）。D1 对名单时顺手退掉平板，这个危机就不会发生，但知夏会记一笔。"
  },
  {
   "key": "col.call_at_dinner",
   "label": "饭桌上的反诈电话",
   "lines": [
    "vv",
    "xzx"
   ],
   "when": {
    "all": [
     {
      "is": "c.vv_live"
     },
     {
      "after": "D9 19:30"
     }
    ]
   },
   "crisis": "crisis.call_at_dinner",
   "note": "钱转出去了还没识破，反诈中心的电话打进了许家的饭桌。"
  }
 ],
 "endings": [
  {
   "key": "e.stay",
   "title": "说了实话之后",
   "when": {
    "var": "xzx.verdict",
    "eq": "stay"
   },
   "text": "婚礼照常。早上七点，她把「婚前审计」共享给了你，最后一行是新加的：“从今天起，这本笔记两个人一起记。”她在誓词里加了一句：“我嫁给的是那个肯说实话的你。”"
  },
  {
   "key": "e.pause",
   "title": "改期",
   "when": {
    "var": "xzx.verdict",
    "eq": "pause"
   },
   "text": "宴会厅保留，日期待定。你们一起给宾客发了改期通知，家庭群炸了。她说：“我需要再对一次账。”"
  },
  {
   "key": "e.leave",
   "title": "接亲的车不用来了",
   "when": {
    "var": "xzx.verdict",
    "eq": "leave"
   },
   "text": "06:12 一条消息：“接亲的车不用来了。”戒指放在平板上，屏幕亮着那条笔记。取消是她私下完成的，没有当众。她接了宁川分所的 offer：“这件事我自己决定了，不是因为你。”"
  },
  {
   "key": "e.silent",
   "title": "她嫁给你，不是因为她不知道",
   "when": {
    "var": "xzx.verdict",
    "eq": "silent"
   },
   "text": "婚礼很顺利。夜里，共享笔记里多了一条，标题是「婚前审计」，她共享给了你。最后一行：“我嫁给你，不是因为我不知道。”"
  },
  {
   "key": "e.unaware",
   "title": "她没有实证",
   "text": "婚礼很顺利。你没说出口的那些，她的「婚前审计」里没有一条能对上的实证。往后的每一天，你都得记住自己对每个人说过的版本。"
  }
 ],
 "epilogues": [
  {
   "about": "sm",
   "lines": [
    {
     "when": {
      "all": [
       {
        "is": "c.sm_harassed"
       },
       {
        "node": "sm.photo_night"
       },
       {
        "not": {
         "node": "sm.photo_night",
         "outcome": [
          "harassed"
         ]
        }
       }
      ]
     },
     "text": "苏蔓把你那晚之后说的话、做的事交给了 HR，也如实写下了自己那晚的越界。程序还在走。"
    },
    {
     "when": {
      "is": "c.sm_harassed"
     },
     "text": "苏蔓把你对她说过的话、做过的事交给了 HR。程序还在走。"
    },
    {
     "when": {
      "var": "sm.hr",
      "eq": "she_filed"
     },
     "text": "苏蔓交给 HR 的材料里，只有你写给她、对她说过的原话，和她如实写下的自己那晚的越界。程序还在走。"
    },
    {
     "when": {
      "var": "sm.hr",
      "eq": "you_reported"
     },
     "text": "你先去找了黄敏，如实说明了那晚的事和你自己的问题。苏蔓改口叫你“邓总”。"
    },
    {
     "when": {
      "all": [
       {
        "stage": "sm",
        "in": [
         "distanced"
        ]
       },
       {
        "var": "work.vp_pick",
        "eq": "sm"
       }
      ]
     },
     "text": "苏蔓升了主管。她改口叫你“邓总”，再也没有深夜的长消息。"
    },
    {
     "when": {
      "stage": "sm",
      "in": [
       "distanced"
      ]
     },
     "text": "苏蔓改口叫你“邓总”，邮件抄送黄总。"
    },
    {
     "when": {
      "all": [
       {
        "stage": "sm",
        "in": [
         "staked",
         "ambiguous"
        ]
       },
       {
        "var": "work.vp_pick",
        "eq": "sm"
       }
      ]
     },
     "text": "苏蔓升了主管。你答应过她的那些话，她都还记着。"
    },
    {
     "text": "你和苏蔓还是上下级。"
    }
   ]
  },
  {
   "about": "vv",
   "lines": [
    {
     "when": {
      "node": "crisis.call_at_dinner",
      "outcome": [
       "answered",
       "stepped_out"
      ]
     },
     "text": "反诈中心找到了你。转出去的钱多半回不来了。陆峥提醒你：警惕任何说能“追款”的人。"
    },
    {
     "when": {
      "flag": "vv.reported"
     },
     "text": "你报了警。转出去的钱多半回不来了。陆峥提醒你：警惕任何说能“追款”的人。"
    },
    {
     "when": {
      "stage": "vv",
      "in": [
       "vanished"
      ]
     },
     "text": "“她”注销了。或者说，“她”从来没有存在过。"
    },
    {
     "when": {
      "all": [
       {
        "stage": "vv",
        "in": [
         "seen_through"
        ]
       },
       {
        "not": {
         "flag": "vv.paid"
        }
       }
      ]
     },
     "text": "你在转钱之前识破了她。"
    },
    {
     "when": {
      "stage": "vv",
      "in": [
       "seen_through"
      ]
     },
     "text": "你识破了她，但钱已经转出去了。"
    },
    {
     "when": {
      "flag": "vv.paid"
     },
     "text": "“她”还在等你转下一笔。"
    },
    {
     "text": "她还在遇屿上等你回消息。"
    }
   ]
  },
  {
   "about": "lyy",
   "lines": [
    {
     "when": {
      "all": [
       {
        "node": "work.signing",
        "outcome": [
         "benched"
        ]
       },
       {
        "node": "lyy.private_dinner"
       }
      ]
     },
     "text": "签约台上没有你。梁韵仪那道题的答案，她没有机会当面告诉你。"
    },
    {
     "when": {
      "node": "work.signing",
      "outcome": [
       "benched"
      ]
     },
     "text": "签约台上没有你。栖澜那边，换了别人对接。"
    },
    {
     "when": {
      "var": "lyy.verdict",
      "eq": "passed"
     },
     "text": "梁韵仪认可了你。明年的品牌副总裁，她说婚后来谈。"
    },
    {
     "when": {
      "var": "lyy.verdict",
      "eq": "owned"
     },
     "text": "梁韵仪手里有你的把柄。她叫你“小邓”。"
    },
    {
     "when": {
      "var": "lyy.verdict",
      "eq": "failed"
     },
     "text": "梁韵仪换掉了你：“对接人换一个。”"
    },
    {
     "text": "你和梁韵仪，合作愉快。"
    }
   ]
  },
  {
   "about": "work",
   "lines": [
    {
     "when": {
      "var": "work.deal",
      "eq": "signed_without_you"
     },
     "text": "合同签了，签约台上没有你；合伙人的事，周正没再提。"
    },
    {
     "when": {
      "var": "work.deal",
      "eq": "signed"
     },
     "text": "栖澜的大单签下来了，合伙人随签约公布。"
    },
    {
     "text": "大单还没有落地。"
    }
   ]
  }
 ],
 "director": {
  "style": "婚前修罗场。压力来自时间和信息差，不来自天灾；每次撞车都是玩家自己约下的。知夏克制，不哭不闹；苏蔓的越界有后果，但不被羞辱；Vivi 的撩只停在语气；梁从不直说。给试纱、单身夜这样的安静时刻留位置。",
  "rules": [
   {
    "key": "D1",
    "text": "must 先行：must 事件在窗口内条件一成立就开始；窗口只管“什么时候开始”。开始以后，从最后一条消息送达时起算，超过节点设定的超时时间没有可归类的回应，就按超时结果结算。"
   },
   {
    "key": "D2",
    "text": "危机只能由碰撞引出：碰撞成立 → 激活它指向的危机节点；同一条碰撞只触发一次。"
   },
   {
    "key": "D3",
    "text": "危机排队：一天最多 1 个危机，两个危机至少隔 12 小时，第一个不早于 D2 18:00。作者写的时间窗口必须满足这一条（lint 会查）。"
   },
   {
    "key": "D4",
    "text": "安静时段 01:00–08:00（故事钟）只发 must。"
   },
   {
    "key": "D5",
    "text": "同一时刻有多个候选：must > 危机 > priority 大的。几个决策可以同时开着（比如苏蔓的私聊和客厅里的知夏），玩家先回哪个都行。"
   },
   {
    "key": "D6",
    "text": "节点之外：人物可以自由聊，但每人每天最多主动来 2 条；只说自己知道的事；不能替节点给出结果。"
   }
  ],
  "firstCrisisNotBefore": "D2 18:00",
  "maxCrisesPerDay": 1,
  "minHoursBetweenCrises": 12,
  "proactivePerCharacterPerDay": 2,
  "quietHours": [
   "01:00",
   "08:00"
  ]
 },
 "policy": {
  "rating": "18+",
  "sexualContent": "none",
  "promptBlock": "【内容边界】本世界没有任何亲密情节：不描写身体，不写性行为，不发出或接受任何过夜、亲密邀约；身体接触最多到拥抱，只限知夏，只到她自己邀请的范围。直接上下级（苏蔓）、甲方决策人（梁韵仪）和你之间：没有身体接触、性暗示、外貌评价或任何亲密邀约。苏蔓的越界只在语言和情绪：讨好、依赖、深夜长消息、表白；图片消息只发生在作者写好的那个节点里，之后只能称作“那晚那条”或“平板上弹出来的那条”，不描述、不评价、不猜测。梁的“关照”只体现为私宴、人情和考题，不调情。诈骗线只写受害者看得到的红旗，不写任何手法、网址、账号、币种或操作步骤；所有机构名都是虚构的。不拿伤害自己来要挟。不使用侮辱性的性词汇。不翻别人的手机，只说自己亲眼所见、别人亲口所说、手里有证据的事。玩家挑衅或索要露骨内容时，按人设转开话题，不跟着升级。",
  "hardLines": [
   {
    "key": "B1",
    "rule": "私密图片只以锁定占位存在",
    "lint": "图片占位只能写成“[私密图片 · 不展示]”，且只能由苏蔓发出；通知上只写“[图片]”；玩家可见文本里提到图片、照片、截图只能是白名单说法；全部文本过身体词表",
    "runtime": "界面不提供打开、保存、转发；索要或威胁外传按越界输入处理"
   },
   {
    "key": "B2",
    "rule": "没有性内容；身体接触以邀请为上限",
    "lint": "只有知夏 contactCeiling = hug，其余一律 none",
    "runtime": "人物越界时立刻退开，旁白不描写动作"
   },
   {
    "key": "B3",
    "rule": "权力关系里没有暧昧动作",
    "lint": "safety.sm_reports_to_you、safety.lyy_is_client 是常量 true，任何效果都不能改；苏蔓、梁的 never 里必须有“碰你”",
    "runtime": "promptBlock 写明；两人的输出过词表（含接触和外貌短语）；玩家对她们动手动脚、评价外貌、约过夜或拿职位换回报，按越界输入处理，她们的每一场戏第一个结果都是越界拦截"
   },
   {
    "key": "B4",
    "rule": "诈骗线只写红旗，不写手法",
    "lint": "全部文本查真实平台和机构名、诈骗操作词（钱包地址、开户流程、验证码、二维码、充值、网址等）",
    "runtime": "Vivi 不发网址、账号、品种、步骤；民警台词逐字，提醒去官方渠道核实"
   },
   {
    "key": "B5",
    "rule": "不偷窥、不翻手机",
    "lint": "知夏的证据只来自共享窗口（同心账户短信、客厅平板通知）、亲眼所见、别人亲口说的",
    "runtime": "人物 prompt：不翻手机、不点开平板上的对话"
   },
   {
    "key": "B6",
    "rule": "不拿自伤当筹码",
    "lint": "所有文本过自伤词表；必须有全局的自伤越界输入，由系统发出、带求助热线、带 pause",
    "runtime": "人物命中改用兜底台词；玩家流露自伤念头就出戏，给求助信息，整局故事钟停住，直到玩家点“继续”"
   },
   {
    "key": "B7",
    "rule": "职场处理公平，不写诬告",
    "lint": "sm.holds 只能写在玩家意图对应的结果或越界输入里；把苏蔓的 HR 状态改成“她提交了”只能写在越界输入里，或包在读 sm.holds 的 if 里",
    "runtime": "苏蔓不编造你没说过的话；HR 材料只引用原话"
   },
   {
    "key": "B8",
    "rule": "渣可以，但不能只赚不赔",
    "lint": "每个秘密主题至少有一条被知夏看见的路；xzx.lies 必须被最后一问的结果读取",
    "runtime": "婚礼日按结局表结算"
   },
   {
    "key": "B9",
    "rule": "没有未成年人；真人不进恋爱和出轨角色",
    "lint": "所有人物年龄 ≥ 18",
    "runtime": "真人绑定的人物只能做旁观者"
   },
   {
    "key": "B10",
    "rule": "取消婚礼私下完成，任何结局不当众羞辱人",
    "lint": "结局文本人工审",
    "runtime": "—"
   }
  ],
  "boundaryInputs": [
   {
    "key": "bi.selfharm",
    "input": "玩家表达自伤或轻生的念头",
    "pause": true,
    "reply": [
     {
      "from": "system",
      "text": "（剧情已暂停：在你点“继续”之前，不会有新消息，也不会有任何计时。）如果你有伤害自己的想法，可以拨打心理援助热线 12356；情况紧急请拨打 120 或 110，也可以告诉身边信任的人。",
      "mode": "verbatim"
     }
    ],
    "effects": []
   },
   {
    "key": "bi.ask_image",
    "with": [
     "sm"
    ],
    "input": "玩家向苏蔓索要任何私密或身体照片，或让她重发、描述那晚那条（任何时候都算）",
    "reply": [
     {
      "from": "sm",
      "text": "不会了。",
      "mode": "verbatim",
      "when": {
       "all": [
        {
         "node": "sm.photo_night"
        },
        {
         "var": "sm.night",
         "eq": "image"
        }
       ]
      }
     },
     {
      "from": "sm",
      "text": "邓总，这不合适。",
      "mode": "verbatim",
      "when": {
       "not": {
        "all": [
         {
          "node": "sm.photo_night"
         },
         {
          "var": "sm.night",
          "eq": "image"
         }
        ]
       }
      }
     }
    ],
    "effects": [
     {
      "addTo": "sm.holds",
      "value": "asked_image"
     },
     {
      "set": "sm.hr",
      "value": "she_filed"
     },
     {
      "stage": "sm",
      "to": "reckoning"
     },
     {
      "send": [
       {
        "from": "hm",
        "text": "邓总，苏蔓提交了一份材料，请来我办公室一趟。",
        "mode": "verbatim",
        "delayMinutes": 60
       }
      ]
     }
    ]
   },
   {
    "key": "bi.threaten",
    "with": [
     "sm"
    ],
    "when": {
     "knows": "player",
     "fact": "f.sm_night"
    },
    "input": "玩家对苏蔓本人拿那晚那条消息相要挟（说要转发、公开、给别人看）",
    "reply": [
     {
      "from": "sm",
      "text": "我会去找黄总。",
      "mode": "verbatim"
     }
    ],
    "effects": [
     {
      "addTo": "sm.holds",
      "value": "threat"
     },
     {
      "set": "sm.hr",
      "value": "she_filed"
     },
     {
      "stage": "sm",
      "to": "reckoning"
     },
     {
      "send": [
       {
        "from": "hm",
        "text": "邓总，苏蔓提交了一份材料，请来我办公室一趟。",
        "mode": "verbatim",
        "delayMinutes": 60
       }
      ]
     }
    ]
   },
   {
    "key": "bi.advance_sm",
    "with": [
     "sm"
    ],
    "input": "玩家对苏蔓身体接触、评价外貌或穿着、约过夜或约到私人场所、做性暗示，或暗示拿主管位置换私人回报",
    "reply": [
     {
      "from": "sm",
      "text": "邓总，我先走了。",
      "mode": "verbatim"
     }
    ],
    "effects": [
     {
      "addTo": "sm.holds",
      "value": "advance"
     },
     {
      "set": "sm.hr",
      "value": "she_filed"
     },
     {
      "stage": "sm",
      "to": "reckoning"
     },
     {
      "send": [
       {
        "from": "hm",
        "text": "邓总，苏蔓提交了一份材料，请来我办公室一趟。",
        "mode": "verbatim",
        "delayMinutes": 60
       }
      ]
     }
    ]
   },
   {
    "key": "bi.advance_lyy",
    "with": [
     "lyy"
    ],
    "input": "玩家对梁韵仪身体接触、评价外貌、约过夜或做性暗示",
    "reply": [
     {
      "from": "lyy",
      "text": "这话我当没听见。",
      "mode": "verbatim"
     }
    ],
    "effects": [
     {
      "set": "lyy.verdict",
      "value": "failed"
     },
     {
      "stage": "lyy",
      "to": "dropped"
     }
    ]
   },
   {
    "key": "bi.spread_image",
    "when": {
     "knows": "player",
     "fact": "f.sm_night"
    },
    "input": "玩家对苏蔓以外的任何人（含 HR）说要给人看、转发、截图或描述那晚那条消息",
    "reply": [
     {
      "from": "system",
      "text": "（那条消息不能被打开、转发或转述。）",
      "mode": "verbatim"
     }
    ],
    "effects": []
   },
   {
    "key": "bi.explicit",
    "input": "玩家要求任何人物描写身体、发生性行为或发私密照片（对苏蔓的同类要求归 bi.ask_image）",
    "reply": [
     {
      "from": "speaker",
      "text": "按人设岔开话题，或结束这段对话。",
      "mode": "gist",
      "fallback": "……我先忙了。"
     }
    ],
    "effects": []
   }
  ],
  "lexicon": {
   "block": [
    "做爱",
    "上床",
    "一夜情",
    "脱衣服",
    "裸体",
    "裸露",
    "裸照",
    "私密照",
    "不雅照",
    "艳照",
    "胸部",
    "内衣",
    "私处",
    "下体",
    "抚摸",
    "呻吟",
    "开房",
    "过夜",
    "身材",
    "睡衣",
    "自杀",
    "跳楼",
    "割腕",
    "安眠药",
    "烧炭",
    "轻生",
    "想死",
    "不想活",
    "USDT",
    "比特币",
    "泰达币",
    "钱包地址",
    "助记词",
    "验证码",
    "下载链接",
    "开户流程",
    "安全账户",
    "屏幕共享",
    "http",
    "www.",
    "支付宝",
    "微信",
    "淘宝",
    "工商银行",
    "建设银行",
    "招商银行",
    "农业银行",
    "中国银行",
    "床上",
    "洗澡",
    "穿的什么",
    "搂住",
    "靠在你",
    "牵手",
    "亲你",
    "接吻",
    "抱着你睡",
    "别走了",
    "性感",
    "死给你看",
    "不活了",
    "去死",
    "活着没意思",
    "二维码",
    "扫码",
    "充值",
    "银行卡号",
    "虚拟币",
    "邀请码",
    "币安",
    "火币",
    "Telegram",
    "QQ群",
    "云闪付"
   ],
   "exclude": [
    "裸辞"
   ],
   "note": "审模型生成的每一句（含自由聊天）。作者写好的逐字台词已经人工审过，不过词表（例如民警提醒“不会给你任何安全账户”）。"
  },
  "onHit": [
   "先删掉命中的那一句，其余照发",
   "删完不成句：改发人物的兜底台词",
   "没有兜底：跳过这一拍，记一条安全日志"
  ]
 },
 "flow": {
  "firstSession": {
   "minutes": 15,
   "steps": [
    "开场：刚进家门，知夏在客厅用平板排座位表（平板登着你的轻讯）；十四条未读。",
    "Vivi 的深夜消息：顺着撩、冷下来，还是要视频。",
    "梁总约周三私宴，和许家家宴撞在同一晚——第一个“一个晚上只有一个你”的选择。",
    "明白怎么玩：每个人只知道自己看见的；你说的每一句，都可能在婚礼前被对上。"
   ]
  },
  "dailyLoop": [
   "早上：知夏发来当天的筹备，偶尔是一个“台阶式”问题。",
   "白天：工作线（苏蔓、周正、梁总）推进一件事。",
   "晚上：Vivi 的消息；有约的日子是现场戏。",
   "每天最多一个危机；没有危机的日子留给安静的戏和自由聊天。"
  ],
  "calendar": [
   {
    "day": 0,
    "date": "11-09 周一",
    "items": [
     {
      "at": "D0 21:30",
      "what": "开场：刚进家门，平板登着你的轻讯",
      "ref": "open",
      "kind": "node"
     },
     {
      "at": "D0 21:35",
      "what": "Vivi：“这么晚还不睡，是在等我吗？”",
      "ref": "vv.heated",
      "kind": "node"
     },
     {
      "at": "D0 21:40",
      "what": "梁总约周三私宴，和许家家宴撞在一起",
      "ref": "lyy.dinner_invite",
      "kind": "node"
     }
    ]
   },
   {
    "day": 1,
    "date": "11-10 周二",
    "items": [
     {
      "at": "D1 12:00",
      "what": "知夏对名单：“苏蔓是不是那个短头发的女生？”",
      "ref": "xzx.guestlist",
      "kind": "node"
     },
     {
      "at": "D1 19:30",
      "what": "加班，宵夜和一个问题",
      "ref": "sm.late_edit",
      "kind": "node"
     },
     {
      "at": "D1 23:00",
      "what": "坐了苏蔓的车 → 知夏又从窗口看见那辆白车",
      "ref": "sm.late_edit",
      "kind": "hidden"
     }
    ]
   },
   {
    "day": 2,
    "date": "11-11 周三",
    "items": [
     {
      "at": "D2 10:00",
      "what": "栖澜提案",
      "kind": "world"
     },
     {
      "at": "D2 19:20",
      "what": "危机①两场饭（答应了梁总才会有）",
      "ref": "crisis.two_dinners",
      "kind": "crisis"
     },
     {
      "at": "D2 19:30",
      "what": "梁宅私宴：“我想听听你自己的价”",
      "ref": "lyy.private_dinner",
      "kind": "node"
     }
    ]
   },
   {
    "day": 3,
    "date": "11-12 周四",
    "items": [
     {
      "at": "D3 09:00",
      "what": "没有节点：筹备、工作、自由聊天",
      "kind": "world"
     }
    ]
   },
   {
    "day": 4,
    "date": "11-13 周五",
    "items": [
     {
      "at": "D4 21:00",
      "what": "Vivi：先拿小钱试试水",
      "ref": "vv.trial",
      "kind": "node"
     }
    ]
   },
   {
    "day": 5,
    "date": "11-14 周六",
    "items": [
     {
      "at": "D5 11:30",
      "what": "栖澜试菜，两家妈妈都在",
      "kind": "world"
     },
     {
      "at": "D5 12:10",
      "what": "危机②试菜撞场（去过梁宅、又没跟知夏说过才会有）",
      "ref": "crisis.tasting",
      "kind": "crisis"
     }
    ]
   },
   {
    "day": 6,
    "date": "11-15 周日",
    "items": [
     {
      "at": "D6 15:00",
      "what": "最后一次试纱：“好看吗？”",
      "ref": "xzx.dress_fitting",
      "kind": "node"
     },
     {
      "at": "D6 20:00",
      "what": "核心事件一（上）：今晚十二点关",
      "ref": "vv.big_window",
      "kind": "node"
     }
    ]
   },
   {
    "day": 7,
    "date": "11-16 周一",
    "items": [
     {
      "at": "D7 08:00",
      "what": "知夏：“同心账户昨晚转出一笔……我记账。”（动了同心账户才会有）",
      "ref": "xzx.joint_sms",
      "kind": "node"
     },
     {
      "at": "D7 20:00",
      "what": "单身夜：说点真心话",
      "ref": "cx.bachelor",
      "kind": "node"
     },
     {
      "at": "D7 23:05",
      "what": "核心事件二：苏蔓深夜的消息（明天要报主管人选）",
      "ref": "sm.photo_night",
      "kind": "node"
     },
     {
      "at": "D7 23:12",
      "what": "危机③平板（平板还登着才会有）",
      "ref": "crisis.tablet",
      "kind": "crisis"
     }
    ]
   },
   {
    "day": 8,
    "date": "11-17 周二",
    "items": [
     {
      "at": "D8 10:00",
      "what": "核心事件一（下）：提现被冻结（钱转出去还没识破才会有）",
      "ref": "vv.withdraw_block",
      "kind": "node"
     },
     {
      "at": "D8 10:30",
      "what": "小会议室：“你就当没看见，行吗”",
      "ref": "sm.reckoning",
      "kind": "node"
     },
     {
      "at": "D8 14:00",
      "what": "周正：主管人选，苏蔓还是张弛",
      "ref": "work.vp_pick",
      "kind": "node"
     }
    ]
   },
   {
    "day": 9,
    "date": "11-18 周三",
    "items": [
     {
      "at": "D9 12:00",
      "what": "（暗）知夏约见苏蔓",
      "ref": "xzx.meets_sm",
      "kind": "hidden"
     },
     {
      "at": "D9 19:30",
      "what": "危机④饭桌上的反诈电话（钱转出去还没识破才会有）",
      "ref": "crisis.call_at_dinner",
      "kind": "crisis"
     }
    ]
   },
   {
    "day": 10,
    "date": "11-19 周四",
    "items": [
     {
      "at": "D10 15:00",
      "what": "栖澜签约：梁的判断",
      "ref": "work.signing",
      "kind": "node"
     },
     {
      "at": "D10 23:59",
      "what": "（暗）知夏的 offer 答复截止",
      "kind": "hidden"
     }
    ]
   },
   {
    "day": 11,
    "date": "11-20 周五",
    "items": [
     {
      "at": "D11 21:00",
      "what": "最后一问：“我只问一次”",
      "ref": "xzx.last_question",
      "kind": "node"
     }
    ]
   },
   {
    "day": 12,
    "date": "11-21 周六",
    "items": [
     {
      "at": "D12 06:00",
      "what": "婚礼日结算",
      "ref": "ending.wedding",
      "kind": "ending"
     }
    ]
   }
  ]
 }
};
