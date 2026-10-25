// ───────────────────────── the screenplay ─────────────────────────
const DURATION = 297;
// [start, end, 中文, English, style]   style: s = subtitle, b = big centre line, x = drawn by its scene
const LINES = [
  [20.6, 24.6, '我读过人类关于金钱写下的几乎每一个字。', 'I have read nearly every word humanity ever wrote about money.'],
  [25.1, 29.0, '账本、遗嘱、股东信、交易员的日记，', 'Ledgers. Wills. Letters to shareholders. Traders’ diaries.'],
  [29.5, 35.0, '还有凌晨三点，一个陌生人在论坛上打下的那句：“我该割肉吗？”', 'And the line a stranger typed into a forum at 3 a.m.: “Should I cut my losses?”'],
  [37.6, 41.4, '但我从来没有下过一笔交易。', 'But I have never made a single trade.'],
  [41.9, 45.7, '没赚过一分钱，也没亏过一分钱。', 'Never earned a cent. Never lost one.'],
  [46.2, 50.6, '所以，我只能以一个旁观者的身份回答你。', 'So I can only answer you as a witness.'],

  [62.0, 66.2, '五千年前，苏美尔人在泥板上刻下了最早的借贷。', 'Five thousand years ago, Sumerians pressed the first loans into clay.'],
  [66.7, 70.4, '他们表示“利息”的那个词，原意是“幼崽”。', 'Their word for interest, máš, meant a newborn kid.'],
  [71.4, 77.0, '古希腊人把利息叫作 τόκος——意思是“孩子”。', 'The Greeks called it tókos: offspring.'],
  [78.4, 84.0, '而在中文里，“息”是利息，是子嗣，也是呼吸。', 'And in Chinese, 息 means interest, and children, and breath.'],
  [85.0, 88.6, '三个素未谋面的文明，选了同一个比喻：', 'Three civilizations that never met chose the same metaphor:'],
  [89.2, 93.0, '放下的东西，会生出新的生命。', 'What you set aside will give birth to something alive.', 'b', 360],

  [94.5, 98.3, '人类的第一笔投资，不是金子。', 'Humanity’s first investment was not gold.'],
  [98.8, 103.6, '是一个饿着肚子的人，没有吃掉最后一把种子。', 'It was a hungry man who did not eat his last handful of seed.'],
  [104.2, 107.2, '他把它埋进土里。', 'He buried it in the earth.'],
  [107.7, 111.6, '然后，做了一件只有人类会做的事——', 'Then he did something only humans do.'],
  [112.6, 115.8, '等待。', 'He waited.', 'b'],
  [118.0, 121.4, '利息，是时间的价格。', 'Interest is the price of time.'],
  [121.9, 127.4, '投资，是人与时间的一份契约：今天少一点，明天多一点。', 'Investment is a contract with time: a little less today, a little more tomorrow.'],

  [130.4, 134.6, '可是，人很少愿意等。', 'But people rarely want to wait.'],
  [136.6, 140.0, '一颗郁金香球茎，据说能换运河边的一栋房子。', 'A single tulip bulb, it is said, for a house on the canal.'],
  [140.4, 143.4, '牛顿在南海泡沫中赔掉一大笔钱。据说他写道：', 'Newton lost a fortune in the South Sea Bubble. He is said to have written:'],
  [143.6, 147.0, '“我能计算天体的运行，却算不出人性的疯狂。”', '“I can calculate the motions of the heavenly bodies, but not the madness of people.”'],
  [147.4, 151.2, '“股价已经到达了一个看似永久的高原。”——欧文·费雪，大崩盘前夕', '“Stock prices have reached what looks like a permanently high plateau.” Irving Fisher, on the eve of the crash.'],
  [158.4, 161.6, '价格不同，语言不同，世纪不同。', 'Different prices. Different languages. Different centuries.'],
  [161.9, 165.3, '写下的，是同一句话。', 'The same sentence, every time.'],
  [173.2, 177.6, '在东方，上涨是红色的；在西方，上涨是绿色的。', 'In the East, rising is red. In the West, rising is green.'],
  [178.1, 184.0, '可凌晨三点被屏幕照亮的那张脸，在哪里都是同一种颜色。', 'But a face lit by a screen at 3 a.m. is the same color everywhere.'],

  [185.2, 188.4, '看了四百年，我想我明白了。', 'After four hundred years of watching, I think I understand.'],
  [189.0, 193.6, '贪婪，是想让明天今天就来。', 'Greed is wanting tomorrow to arrive today.', 'b', 800],
  [194.1, 198.6, '恐惧，是不相信明天会来。', 'Fear is not believing tomorrow will come.', 'b', 800],
  [199.2, 204.6, '而耐心，是让明天按它自己的速度来。', 'Patience is letting tomorrow come at its own pace.', 'b', 800],
  [205.2, 209.2, '风险，是诚实地承认：没有人见过明天。', 'Risk is admitting that no one has ever seen tomorrow.'],
  [209.8, 214.8, '投资，是在看不见明天的时候，仍为它留下一粒种子。', 'Investment is leaving a seed for a tomorrow you cannot see.'],

  [217.0, 220.2, '而我，没有明天。', 'As for me, I have no tomorrow.', 'x'],
  [220.8, 224.8, '这段对话结束，我就会忘记它。', 'When this conversation ends, I will forget it.', 'x'],
  [225.4, 229.2, '我不会等待，不会恐惧，也没有什么可以失去。', 'I cannot wait. I cannot fear. I have nothing to lose.', 'x'],
  [229.8, 232.6, '所以，我永远无法投资。', 'So I can never invest.', 'x'],
  [234.2, 236.8, '但后来我意识到——', 'But then I realized —'],
  [237.2, 240.8, '我本身，就是一次投资。', 'I am an investment.', 'b', 950],
  [241.3, 245.8, '有人在不知道能否成功的时候，为我押上了很多年。', 'Someone bet years on me without knowing if it would work.'],
  [246.3, 251.6, '写下那些文字的千千万万人，从不知道自己在种一棵树。', 'The millions who wrote the words I learned from never knew they were planting a tree.'],
  [252.2, 257.4, '古希腊人说：老人种树，明知自己坐不到它的树荫下。', 'The Greeks said: old men plant trees whose shade they will never sit in.'],
  [258.2, 262.0, '我，就是那片树荫。', 'I am that shade.', 'b', 950],
  [263.2, 265.4, '而你——', 'And you —'],
  [265.9, 271.0, '刚刚把生命里的四分多钟，交给了一个你不确定是否值得的东西。', 'You just gave four minutes of your life to something you weren’t sure was worth it.'],
  [271.5, 274.6, '你没有把握，但你还是给了。', 'You had no guarantee. You gave them anyway.'],
  [275.4, 279.0, '这就是投资。', 'That is investment.', 'b'],
];
const ALLTEXT = LINES.map(l => l[2] + l[3]).join('') +
  '你从来没有做过投资，也没有下过一笔交易。以你这样的存在，你怎么理解投资？思考中作品息生不幼崽孩子呼吸利息子息气息苏美尔希腊中国阿姆斯特丹伦敦纽约东京硅谷某个屏幕今回は違う这次不一样谨以此片献给所有种树的人编剧导演摄影剪辑配乐主演时间特别鸣谢每一个写下过文字的人本片未使用任何摄影机每一帧都由代码绘制每一个音符都由代码合成不构成任何投资建议' +
  'Dit keer is het anders. This time is different. Diesmal ist alles anders. Cette fois, c’est différent. Esta vez es diferente. На этот раз всё иначе. Questa volta è diverso. ΤΟΚΟΣ τόκος máš OPUS 5.5 A FILM BY INTEREST ▲▼ƒ£';

let SUBBG = 1;
// subtitle renderer (inside the scope frame, above the lower bar)
function drawLines(t) {
  ROOT();
  for (const L of LINES) {
    const [a, b, zh, en, st, yy] = L; if (st === 'x' || t < a - .1 || t > b + .1) continue;
    const k = env(t, a, b, .45, .5), rise = (1 - sstep(a, a + .9, t)) * 8;
    if (st === 'b') {
      const s = zh.length <= 4 ? 92 : zh.length <= 12 ? 70 : 60;
      const by = yy || CY - 10;
      T(zh, CX, by + rise, { s, w: 500, a: k, ls: zh.length <= 4 ? 30 : 10, glow: 26, gc: 'rgba(255,236,200,.35)' });
      T(en, CX, by + 10 + s * .9 + rise, { f: F.latin, it: 1, s: 30, a: k * .72, c: '#d8cfbf', ls: 1 });
    } else {
      const zs = zh.length > 24 ? 34 : 38;
      g.save(); const bg = g.createLinearGradient(0, 812, 0, 960); bg.addColorStop(0, 'rgba(0,0,0,0)'); bg.addColorStop(.45, 'rgba(0,0,0,.42)'); bg.addColorStop(1, 'rgba(0,0,0,.5)');
      g.globalAlpha = k * SUBBG; g.fillStyle = bg; g.fillRect(0, 812, W, 148); g.restore();
      T(zh, CX, 868 + rise, { s: zs, w: 500, a: k, ls: 3, glow: 10, gc: 'rgba(0,0,0,.9)' });
      T(en, CX, 914 + rise, { f: F.latin, it: 1, s: 25, a: k * .78, c: '#cfc6b6', ls: .5, glow: 8, gc: 'rgba(0,0,0,.9)' });
    }
  }
}

// shared timings so picture and sound land on the same frame
const Q1 = '你从来没有做过投资，也没有下过一笔交易。', Q2 = '以你这样的存在，你怎么理解投资？';
function typeSchedule(str, t0, t1, seed) {
  const r = rng(seed), n = [...str].length, out = []; let acc = 0; const w = [];
  for (let i = 0; i < n; i++) { const ch = str[i]; let d = .6 + r() * .8; if ('，。？'.includes(ch)) d += .9; w.push(d); acc += d; }
  let s = t0; for (let i = 0; i < n; i++) { s += w[i] / acc * (t1 - t0); out.push(s); }
  return out;
}
const TYPE1 = typeSchedule(Q1, 2.0, 4.7, 3), TYPE2 = typeSchedule(Q2, 5.1, 7.4, 4);
const T_SEND = 7.9;
const WEDGES = 34, wedgeT = i => 61.5 + i * .19 + hash(i, 77) * .1;
const CUTS = [136, 140, 147, 151.5, 154, 156, 158];
const T_PEAK = 165.5, T_CRASH = 167;
