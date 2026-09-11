/* 菁华教育网课平台 —— 内容数据层
 * 所有课程、师资、评价数据集中在此文件，方便后续替换为真实内容或接口。
 */
(function () {
  "use strict";

  const STAGES = ["小学", "初中", "高中", "考研", "留学"];
  const SUBJECTS = ["数学", "语文", "英语", "物理", "化学", "日语"];

  const teachers = [
    {
      id: "yujieting",
      name: "于杰庭",
      avatar: "于",
      school: "上海交通大学 · 日语语言文学（辅修数学与应用数学）",
      title: "高考数学 / 中考数学主讲",
      tagline: "把压轴题讲成套路，把套路讲成直觉。",
      intro:
        "五年高中数学与高考数学一对一教学经验，累计授课 600 余课时。擅长把解析几何、函数导数等抽象模块拆成可复用的解题流程，学员平均提分 21 分。",
      tags: ["高考数学", "解析几何", "函数导数"],
      rating: 4.9,
      hours: 612,
      students: 1860,
      hue: ["#0b6b5b", "#15a884"]
    },
    {
      id: "linqinghe",
      name: "林清和",
      avatar: "林",
      school: "华东师范大学 · 数学教育硕士",
      title: "初中数学教研组长",
      tagline: "几何不是靠灵感，是靠看得见的辅助线。",
      intro:
        "长期负责初中数学竞赛与中考冲刺课程研发，主讲几何证明与函数综合两大板块，带过 12 届毕业班，熟悉上海、江苏、浙江三地考纲差异。",
      tags: ["中考数学", "平面几何", "函数综合"],
      rating: 4.8,
      hours: 880,
      students: 2410,
      hue: ["#3a2a6b", "#7a63c9"]
    },
    {
      id: "suwenqing",
      name: "苏文清",
      avatar: "苏",
      school: "复旦大学 · 中国语言文学系",
      title: "语文 / 小学思维主讲",
      tagline: "先把题目读明白，答案就写完一半。",
      intro:
        "从事语文阅读与写作教学九年，主编校内阅读讲义三册。课堂节奏稳、示范多，尤其擅长把作文素材整理成可随时调用的模块。",
      tags: ["古诗文", "作文素材", "小学思维"],
      rating: 4.9,
      hours: 1040,
      students: 3120,
      hue: ["#7a1f1f", "#c9564f"]
    },
    {
      id: "guxiaolan",
      name: "顾晓岚",
      avatar: "顾",
      school: "早稻田大学 · 日本语教育学",
      title: "日语学科负责人",
      tagline: "零基础到 N3，只需要一条清晰的路线。",
      intro:
        "日语教学八年，N1 满分。课程按「语音—语法骨架—阅读速度」三段推进，高考日语学员平均分 118 分，零基础学员最快 8 个月达到 N3。",
      tags: ["高考日语", "JLPT", "五十音"],
      rating: 5.0,
      hours: 1260,
      students: 2740,
      hue: ["#8a1f3d", "#d9527a"]
    },
    {
      id: "lumingyuan",
      name: "陆铭远",
      avatar: "陆",
      school: "上海外国语大学 · 英语语言文学",
      title: "英语 / 雅思主讲",
      tagline: "长难句拆开了，阅读就是送分题。",
      intro:
        "雅思总分 8.5，写作 8.0。主讲阅读精读与写作逻辑训练，主张「结构先行、语料随后」，帮助学员把模板变成真正能写的句子。",
      tags: ["雅思写作", "长难句", "阅读精读"],
      rating: 4.8,
      hours: 720,
      students: 1680,
      hue: ["#0f3f6b", "#3f7fbf"]
    },
    {
      id: "hanzhuo",
      name: "韩卓",
      avatar: "韩",
      school: "同济大学 · 物理学",
      title: "物理 / 化学主讲",
      tagline: "物理题只有三个问题：对象、过程、方程。",
      intro:
        "高中物理教龄七年，擅长用模型化的方式重组力学体系，把「受力分析—过程分解—方程求解」固化为可迁移的解题习惯。",
      tags: ["力学模型", "化学方程式", "实验探究"],
      rating: 4.9,
      hours: 940,
      students: 2090,
      hue: ["#0d4a4a", "#20a09a"]
    }
  ];

  const rawCourses = [
    {
      id: "g-jiexi",
      title: "高考数学 · 解析几何专题突破",
      sub: "直线与圆、椭圆、双曲线、抛物线四大模块，一次讲透压轴题的通用套路。",
      teacher: "yujieting",
      stage: "高中",
      subject: "数学",
      level: "进阶",
      price: 699,
      original: 1099,
      hours: 21,
      students: 3287,
      rating: 4.9,
      ratingCount: 812,
      hue: ["#0b6b5b", "#15a884"],
      glyph: "解",
      formula: "e = c / a",
      hot: true,
      tags: ["高考", "压轴题", "一轮复习"],
      highlights: [
        "12 类圆锥曲线题型模板，见到题目直接对号入座",
        "每题配「思路预判 → 设参 → 运算化简 → 检验」四步板书",
        "附赠 2010—2025 年高考解析几何真题分册（含详解）",
        "每周一次直播答疑，作业逐题批改"
      ],
      desc:
        "解析几何是高考数学区分度最高的一题，也是多数同学「会做但做不完」的失分区。本课程不堆题量，而是把近十五年高考真题归纳为 12 类标准题型，逐类讲清楚设参方式、运算路径和检验习惯。完成课程后，你能在 12 分钟内稳定完成一道压轴级别的解析几何大题。",
      chapters: [
        { t: "第 1 章 坐标系与直线方程", free: true },
        { t: "第 2 章 圆与直线、圆与圆的位置关系" },
        { t: "第 3 章 椭圆的标准方程与几何性质" },
        { t: "第 4 章 双曲线与抛物线" },
        { t: "第 5 章 弦长、面积与定点定值问题" },
        { t: "第 6 章 最值与范围问题的代数化处理" },
        { t: "第 7 章 真题串讲：近五年压轴题实战" }
      ]
    },
    {
      id: "g-daoshu",
      title: "高考数学 · 函数与导数压轴 20 讲",
      sub: "从单调性、极值到零点与恒成立，把导数大题拆成 20 个可训练的小动作。",
      teacher: "yujieting",
      stage: "高中",
      subject: "数学",
      level: "进阶",
      price: 749,
      original: 1199,
      hours: 24,
      students: 2914,
      rating: 4.9,
      ratingCount: 706,
      hue: ["#124a7a", "#2b8ccc"],
      glyph: "导",
      formula: "f′(x) ≥ 0",
      hot: true,
      tags: ["高考", "导数", "压轴题"],
      highlights: [
        "20 讲对应 20 个可单独训练的动作，卡在哪补哪",
        "分类讨论的边界如何找：三种信号，一眼定位",
        "含参不等式恒成立的四条标准路线",
        "每讲配分层作业：基础 6 题 + 提升 3 题"
      ],
      desc:
        "导数大题难在「不知道从哪一步下手」。课程把整类问题拆解成求导、判号、构造、放缩、分类五个环节，每个环节单独训练。学完之后，你不会再对着题目发呆，而是知道先做什么、第二步做什么、什么时候该放弃某条路。",
      chapters: [
        { t: "第 1 章 导数运算与几何意义", free: true },
        { t: "第 2 章 单调性与含参讨论" },
        { t: "第 3 章 极值、最值与端点效应" },
        { t: "第 4 章 函数零点与图像交点" },
        { t: "第 5 章 不等式证明：构函数与放缩" },
        { t: "第 6 章 双变量与极值点偏移" },
        { t: "第 7 章 真题实战与时间分配策略" }
      ]
    },
    {
      id: "c-ercifunc",
      title: "上海中考数学 · 二次函数与几何综合",
      sub: "24 题专项：动点、面积、相似与存在性问题的标准解法。",
      teacher: "yujieting",
      stage: "初中",
      subject: "数学",
      level: "进阶",
      price: 599,
      original: 899,
      hours: 18,
      students: 2431,
      rating: 4.9,
      ratingCount: 588,
      hue: ["#7a3b1f", "#d08a3f"],
      glyph: "函",
      formula: "y = ax² + bx + c",
      hot: true,
      tags: ["上海中考", "二次函数", "几何综合"],
      highlights: [
        "专为上海中考 24 题设计，贴合本地命题风格",
        "动点问题的「设参—列式—求范围」固定三步",
        "存在性问题的分类不重不漏检查清单",
        "2015—2025 上海一模二模 24 题全整理"
      ],
      desc:
        "上海中考第 24 题几乎是二次函数与几何的混合题，分值高、节奏紧。课程按「图像性质 → 动点表达 → 面积与相似 → 存在性讨论」四层递进，每一层都给出可照抄的书写格式，帮助你在考场上少想、多写、拿满分。",
      chapters: [
        { t: "第 1 章 二次函数图像与系数关系", free: true },
        { t: "第 2 章 抛物线与直线的交点问题" },
        { t: "第 3 章 动点与线段长度的函数表达" },
        { t: "第 4 章 面积最值与割补法" },
        { t: "第 5 章 相似与直角三角形存在性" },
        { t: "第 6 章 上海各区一模二模 24 题串讲" }
      ]
    },
    {
      id: "c-jihe",
      title: "初中数学 · 几何辅助线全攻略",
      sub: "把「想不到辅助线」变成「按条件选辅助线」的判断流程。",
      teacher: "linqinghe",
      stage: "初中",
      subject: "数学",
      level: "进阶",
      price: 549,
      original: 799,
      hours: 16,
      students: 3602,
      rating: 4.8,
      ratingCount: 913,
      hue: ["#3a2a6b", "#7a63c9"],
      glyph: "辅",
      formula: "倍长中线 · 截长补短",
      new: true,
      tags: ["平面几何", "辅助线", "证明题"],
      highlights: [
        "38 种常见图形的辅助线选择表，一张图查完",
        "中点、角平分线、垂直、平行四类信号条件全解析",
        "每讲配手写板书，画图过程同步呈现",
        "作业按难度分层，基础薄弱也能跟上"
      ],
      desc:
        "几何证明的分水岭不在公式，而在辅助线。课程把辅助线从「灵感」还原为「判断」：看到中点想倍长，看到角平分线想对称，看到共点线段想旋转。38 个图形模型逐一演示，配合 120 道典型例题训练条件反射。",
      chapters: [
        { t: "第 1 章 三角形全等的基本模型", free: true },
        { t: "第 2 章 中点问题的五条辅助线" },
        { t: "第 3 章 角平分线与对称变换" },
        { t: "第 4 章 旋转与手拉手模型" },
        { t: "第 5 章 四边形与特殊平行线" },
        { t: "第 6 章 圆中的辅助线与圆的证明" }
      ]
    },
    {
      id: "p-siwei",
      title: "小学数学思维启蒙 · 从算术到代数",
      sub: "用 40 个生活情境，让孩子第一次真正理解「未知数」。",
      teacher: "suwenqing",
      stage: "小学",
      subject: "数学",
      level: "入门",
      price: 399,
      original: 599,
      hours: 12,
      students: 4180,
      rating: 4.9,
      ratingCount: 1204,
      hue: ["#a4531f", "#e6a33c"],
      glyph: "思",
      formula: "□ + 7 = 12",
      tags: ["小学奥数", "思维启蒙", "方程入门"],
      highlights: [
        "不讲公式，先用生活情境建立数量感",
        "画图、列表、倒推三大工具的循序训练",
        "每节课 8 分钟动画 + 12 分钟练习节奏",
        "配套家长指导手册，辅导不吼不催"
      ],
      desc:
        "三四年级是从算术走向代数的关键窗口。课程用 40 个贴近生活的情境题，让孩子先学会「把不知道的东西记下来」，再学会「把它当成已知的来算」。不刷题、不背套路，重点是把思维工具交到孩子手上。",
      chapters: [
        { t: "第 1 章 数量感的建立", free: true },
        { t: "第 2 章 画图解决问题" },
        { t: "第 3 章 列表与有序思考" },
        { t: "第 4 章 倒推与还原" },
        { t: "第 5 章 第一次遇见未知数" },
        { t: "第 6 章 简易方程应用入门" }
      ]
    },
    {
      id: "g-jp",
      title: "高考日语 · 零基础到 N3 全阶课程",
      sub: "语音、语法骨架、阅读速度三阶段推进，8 个月走完高考日语全程。",
      teacher: "guxiaolan",
      stage: "高中",
      subject: "日语",
      level: "全阶",
      price: 899,
      original: 1499,
      hours: 48,
      students: 2156,
      rating: 5.0,
      ratingCount: 664,
      hue: ["#8a1f3d", "#d9527a"],
      glyph: "日",
      formula: "あいうえお",
      hot: true,
      tags: ["高考日语", "零基础", "JLPT N3"],
      highlights: [
        "48 小时完整体系，从五十音一路到 N3 语法",
        "语法按「接续方式」归类，记一条会用一片",
        "高考日语作文模板 12 篇 + 听力精听训练",
        "每月一次阶段测评，给出下一阶段学习清单"
      ],
      desc:
        "高考日语的优势是词汇量要求低、题型固定，但前提是语法骨架要立得住。课程把 N5—N3 的三百多条语法按接续方式重新分组，配合高考真题语料训练，让你在读懂句子的同时，也能写出得分的作文。",
      chapters: [
        { t: "第 1 章 五十音与发音规则", free: true },
        { t: "第 2 章 名词句与形容词句" },
        { t: "第 3 章 动词变形全体系" },
        { t: "第 4 章 助词使用精讲" },
        { t: "第 5 章 高考日语语法条目精讲" },
        { t: "第 6 章 阅读理解与长句拆解" },
        { t: "第 7 章 听力精听与真题速练" },
        { t: "第 8 章 作文模板与实战批改" }
      ]
    },
    {
      id: "jp-n5",
      title: "日语五十音到 N5 入门 · 8 周速成",
      sub: "零基础友好，每天 30 分钟，八周建立完整日语发音与基础句型。",
      teacher: "guxiaolan",
      stage: "留学",
      subject: "日语",
      level: "入门",
      price: 299,
      original: 499,
      hours: 10,
      students: 1742,
      rating: 4.8,
      ratingCount: 421,
      hue: ["#1f5f7a", "#41a3bd"],
      glyph: "音",
      formula: "は を に で",
      new: true,
      tags: ["零基础", "五十音", "JLPT N5"],
      highlights: [
        "五十音两周记牢的记忆卡片法",
        "每天 30 分钟的学习计划，可执行不拖延",
        "配套朗读音频，跟读纠音",
        "结课可参加 N5 模拟测评"
      ],
      desc:
        "很多同学卡在五十音就放弃了。课程用记忆卡片 + 手写练习 + 跟读音频三重方式，把平假名、片假名、浊音拗音在两周内解决，随后进入基本句型，八周结束能独立完成日常问候、点餐、问路等场景对话。",
      chapters: [
        { t: "第 1 章 平假名速记", free: true },
        { t: "第 2 章 片假名与浊音拗音" },
        { t: "第 3 章 基本句型与判断句" },
        { t: "第 4 章 日常场景会话" },
        { t: "第 5 章 N5 词汇与句型冲刺" }
      ]
    },
    {
      id: "g-eng",
      title: "高中英语 · 长难句拆解与阅读精读",
      sub: "把 60 个高频句式练成肌肉记忆，阅读不再靠语感硬猜。",
      teacher: "lumingyuan",
      stage: "高中",
      subject: "英语",
      level: "进阶",
      price: 629,
      original: 949,
      hours: 20,
      students: 2687,
      rating: 4.8,
      ratingCount: 574,
      hue: ["#0f3f6b", "#3f7fbf"],
      glyph: "读",
      formula: "主 + 谓 + 宾 + 定从",
      tags: ["高考英语", "长难句", "阅读理解"],
      highlights: [
        "60 个高频句式，逐个练到条件反射",
        "阅读精读四步法：定位、分层、同义替换、排除",
        "七选五与完形的专项策略",
        "配套语料库，可反复精听精读"
      ],
      desc:
        "阅读读不快，通常不是词汇量的问题，而是句子结构没看清。课程用「找主干、切从句、还原插入语」的方法，把长句压回简单句。60 个句式训练完成后，你的阅读速度通常能提升三分之一。",
      chapters: [
        { t: "第 1 章 句子主干识别", free: true },
        { t: "第 2 章 三大从句的切分" },
        { t: "第 3 章 非谓语与插入语" },
        { t: "第 4 章 阅读精读四步法" },
        { t: "第 5 章 七选五与完形专项" },
        { t: "第 6 章 高考真题实战" }
      ]
    },
    {
      id: "ielts",
      title: "雅思写作 6.5 → 7.5 提分训练营",
      sub: "12 篇范文精讲，把模板改造成真正属于你的句子。",
      teacher: "lumingyuan",
      stage: "留学",
      subject: "英语",
      level: "进阶",
      price: 899,
      original: 1399,
      hours: 22,
      students: 1146,
      rating: 4.8,
      ratingCount: 268,
      hue: ["#6b2a8a", "#a86ad0"],
      glyph: "写",
      formula: "Task 2 · 250 words",
      tags: ["雅思", "写作", "Task 1 & 2"],
      highlights: [
        "Task 1 图表描述的分类写法与常用句式",
        "Task 2 四类题型的论证结构模板",
        "12 篇高分范文逐句拆解，附批改旁注",
        "提供两次作文人工批改机会"
      ],
      desc:
        "写作卡在 6.5 分，问题往往出在论证展开不够、语言重复。课程先用结构解决「写什么」，再用语料解决「怎么写」，最后用批改解决「写得好不好」。目标是通过 22 小时的系统训练稳定拿到 7 分以上。",
      chapters: [
        { t: "第 1 章 评分标准逐条拆解", free: true },
        { t: "第 2 章 Task 1 图表与流程图" },
        { t: "第 3 章 Task 2 四类题型结构" },
        { t: "第 4 章 论证展开与例证技巧" },
        { t: "第 5 章 高分语料与同义替换" },
        { t: "第 6 章 范文精讲与实战批改" }
      ]
    },
    {
      id: "g-phy",
      title: "高中物理 · 力学模型与解题体系",
      sub: "受力分析、过程分解、方程求解——把力学变成三步流程。",
      teacher: "hanzhuo",
      stage: "高中",
      subject: "物理",
      level: "进阶",
      price: 649,
      original: 999,
      hours: 22,
      students: 1932,
      rating: 4.9,
      ratingCount: 447,
      hue: ["#0d4a4a", "#20a09a"],
      glyph: "力",
      formula: "F = m·a",
      tags: ["力学", "受力分析", "模型解题"],
      highlights: [
        "24 个力学模型，涵盖滑块、传送带、板块、绳杆",
        "受力分析检查清单，杜绝漏力多力",
        "图像法与能量法结合，解题速度翻倍",
        "每章配模型串联训练与错题复盘"
      ],
      desc:
        "力学题看起来千变万化，其实是 24 个模型的组合。课程带你按「先确定研究对象、再分解过程、最后列方程」的固定流程走一遍，把每类模型的关键条件和易错点讲透。学完后，你能在读完题的瞬间判断出该用哪条路线。",
      chapters: [
        { t: "第 1 章 受力分析与正交分解", free: true },
        { t: "第 2 章 直线运动与图像问题" },
        { t: "第 3 章 牛顿运动定律与连接体" },
        { t: "第 4 章 传送带与板块模型" },
        { t: "第 5 章 圆周运动与万有引力" },
        { t: "第 6 章 动能定理与能量守恒" }
      ]
    },
    {
      id: "c-chem",
      title: "初中化学 · 方程式与实验探究",
      sub: "化学方程式不再是死记硬背，用反应规律一次推出一整串。",
      teacher: "hanzhuo",
      stage: "初中",
      subject: "化学",
      level: "入门",
      price: 499,
      original: 749,
      hours: 15,
      students: 2210,
      rating: 4.8,
      ratingCount: 496,
      hue: ["#5a3a12", "#b98a2e"],
      glyph: "化",
      formula: "2H₂ + O₂ → 2H₂O",
      tags: ["化学方程式", "实验探究", "中考化学"],
      highlights: [
        "六大反应类型 + 置换规律，方程式成串记忆",
        "实验探究题的答题模板与规范表述",
        "常见实验装置与操作注意事项全图鉴",
        "中考化学真题分类精练"
      ],
      desc:
        "初中化学的知识点不算多，但方程式和实验探究最容易丢分。课程先梳理反应规律，让方程式能自己推导出来；再针对探究题，给出从假设、设计、现象到结论的完整答题模板，减少无谓失分。",
      chapters: [
        { t: "第 1 章 物质的构成与化学用语", free: true },
        { t: "第 2 章 反应类型与方程式书写" },
        { t: "第 3 章 常见气体的制备与检验" },
        { t: "第 4 章 实验探究题的答题模板" },
        { t: "第 5 章 中考真题分类精练" }
      ]
    },
    {
      id: "g-chi",
      title: "高考语文 · 古诗文阅读与作文素材",
      sub: "读懂文言文，写活议论文：两条主线同时推进。",
      teacher: "suwenqing",
      stage: "高中",
      subject: "语文",
      level: "进阶",
      price: 579,
      original: 849,
      hours: 19,
      students: 2456,
      rating: 4.9,
      ratingCount: 612,
      hue: ["#7a1f1f", "#c9564f"],
      glyph: "文",
      formula: "之乎者也 · 起承转合",
      tags: ["高考语文", "文言文", "议论文"],
      highlights: [
        "120 个高频实词虚词，按考频排序精讲",
        "文言文翻译的「留删换调补」五步法",
        "议论文素材 12 个专题，每专题 6 个可用论据",
        "作文结构六种开头与三种收束方式"
      ],
      desc:
        "语文提分慢，多半是因为复习没有抓手。课程把古诗文阅读拆成实词、句式、断句、翻译四步；把作文拆成审题、立意、结构、素材四步。每一步都有可练习的动作和可复用的素材，让语文复习第一次变得具体。",
      chapters: [
        { t: "第 1 章 高频实词与虚词精讲", free: true },
        { t: "第 2 章 特殊句式与断句方法" },
        { t: "第 3 章 文言文翻译五步法" },
        { t: "第 4 章 古诗词鉴赏的答题框架" },
        { t: "第 5 章 议论文结构与论证" },
        { t: "第 6 章 作文素材十二专题" }
      ]
    }
  ];

  /* —— 由章节生成课时列表 —— */
  const lessonPattern = ["核心考点精讲", "典型例题精讲", "方法与技巧归纳", "易错点辨析", "课后作业讲评"];

  function buildLessons(chapters) {
    const out = [];
    chapters.forEach((ch, ci) => {
      const count = 4 + (ci % 2);
      for (let li = 0; li < count; li++) {
        const base = lessonPattern[li % lessonPattern.length];
        const round = li >= lessonPattern.length ? `（补充 ${Math.floor(li / lessonPattern.length) + 1}）` : "";
        out.push({
          id: `${ci + 1}-${li + 1}`,
          chapter: ci,
          title: `${base}${round}`,
          minutes: 16 + ((ci * 7 + li * 11) % 26),
          free: ci === 0 && li === 0
        });
      }
    });
    return out;
  }

  const courseReviews = [
    { name: "陈**", text: "讲得非常清楚，以前看到解析几何直接跳过，现在敢动笔了。", stars: 5 },
    { name: "李**", text: "板书过程完整，跟着写一遍就懂，作业批改也很细。", stars: 5 },
    { name: "王**", text: "节奏刚好，不会赶，难点会反复强调。强烈推荐。", stars: 5 },
    { name: "周**", text: "性价比很高，配套资料整理得很用心，省了我很多时间。", stars: 5 },
    { name: "赵**", text: "内容扎实，就是练习题有点多，需要安排好时间跟完。", stars: 4 }
  ];

  const courses = rawCourses.map((c) => {
    const lessons = buildLessons(c.chapters);
    const teacher = teachers.find((t) => t.id === c.teacher);
    const reviewCount = 3 + (c.students % 3);
    const reviews = [];
    for (let i = 0; i < reviewCount; i++) {
      const base = courseReviews[(i + c.title.length) % courseReviews.length];
      reviews.push(Object.assign({}, base, { date: `2026-0${(i % 8) + 1}-${10 + ((i * 3) % 18)}` }));
    }
    return Object.assign({}, c, {
      teacherName: teacher.name,
      teacherTitle: teacher.title,
      lessons,
      lessonCount: lessons.length,
      reviews
    });
  });

  const categories = [
    { stage: "小学", desc: "思维启蒙 · 基础打牢", glyph: "小", hue: ["#a4531f", "#e6a33c"] },
    { stage: "初中", desc: "中考冲刺 · 学科同步", glyph: "初", hue: ["#3a2a6b", "#7a63c9"] },
    { stage: "高中", desc: "高考体系 · 专题突破", glyph: "高", hue: ["#0b6b5b", "#15a884"] },
    { stage: "留学", desc: "雅思 · 日语 · 申请", glyph: "留", hue: ["#0f3f6b", "#3f7fbf"] }
  ];

  const lives = [
    { title: "解析几何压轴题 · 每周精讲", teacher: "于杰庭", time: "每周三 19:30", enroll: 1240, hue: ["#0b6b5b", "#15a884"] },
    { title: "高考日语语法答疑室", teacher: "顾晓岚", time: "每周六 20:00", enroll: 860, hue: ["#8a1f3d", "#d9527a"] },
    { title: "雅思写作批改公开课", teacher: "陆铭远", time: "每周日 15:00", enroll: 530, hue: ["#6b2a8a", "#a86ad0"] }
  ];

  const siteReviews = [
    {
      name: "张女士 · 高三家长",
      text: "孩子原来数学一直在 105 分左右，跟着于老师上了三个月解析几何专题，一模考了 128。最难得的是他现在愿意主动做题了。",
      hue: ["#0b6b5b", "#15a884"],
      avatar: "张"
    },
    {
      name: "林同学 · 高二在读",
      text: "日语课从五十音开始跟，八个月做到了 N3 的真题，语法讲得特别有条理，不用死记。",
      hue: ["#8a1f3d", "#d9527a"],
      avatar: "林"
    },
    {
      name: "王先生 · 初三家长",
      text: "平台的课程进度表很实用，我能看到孩子学到哪一章、做了多少题，心里有底。",
      hue: ["#3a2a6b", "#7a63c9"],
      avatar: "王"
    }
  ];

  const stats = [
    { num: "12,800+", label: "在册学员" },
    { num: "320+", label: "精品课程" },
    { num: "46", label: "授课名师" },
    { num: "98.6%", label: "课程好评率" }
  ];

  window.JH_DATA = {
    STAGES,
    SUBJECTS,
    teachers,
    courses,
    categories,
    lives,
    siteReviews,
    stats
  };
})();
