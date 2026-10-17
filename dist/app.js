import { PHASES, dateKey, daysAfter, normalizeLearning, recordFor, nextPhase, passListening, passSpeaking, deferLesson, dueIds, isUnlocked, streakDays } from "./learning.mjs?v=8";

const lessons = [
  {
    id: "hello-en",
    language: "english",
    scenario: "hello",
    scenarioName: "打招呼",
    level: "starter",
    line: "Hello, nice to meet you.",
    romanization: "heh-loh, nice tuh meet yoo",
    meaning: "你好，很高兴认识你。",
    keywords: ["hello", "meet"],
  },
  {
    id: "intro-en",
    language: "english",
    scenario: "intro",
    scenarioName: "自我介绍",
    level: "starter",
    line: "My name is Yi. I am learning English.",
    romanization: "my naym iz Yi. eye am lur-ning ing-glish",
    meaning: "我叫 Yi。我正在学英语。",
    keywords: ["name", "learning", "English"],
  },
  {
    id: "coffee-en",
    language: "english",
    scenario: "coffee",
    scenarioName: "点咖啡",
    level: "daily",
    line: "Could I have a hot latte, please?",
    romanization: "kood eye hav uh hot laa-tay, pleez",
    meaning: "请给我一杯热拿铁。",
    keywords: ["latte", "please"],
  },
  {
    id: "direction-en",
    language: "english",
    scenario: "direction",
    scenarioName: "问路",
    level: "daily",
    line: "Excuse me, how do I get to the metro station?",
    romanization: "ik-skyoos mee, how doo eye get tuh the meh-troh stay-shun",
    meaning: "不好意思，请问地铁站怎么走？",
    keywords: ["metro", "station"],
  },
  {
    id: "work-en",
    language: "english",
    scenario: "work",
    scenarioName: "工作沟通",
    level: "work",
    line: "I will send you the update before five.",
    romanization: "eye will send yoo the up-dayt bih-for five",
    meaning: "我会在五点前把进展发给你。",
    keywords: ["send", "update", "five"],
  },
  {
    id: "weather-en",
    language: "english",
    scenario: "weather",
    scenarioName: "天气寒暄",
    level: "starter",
    line: "The weather is nice today.",
    romanization: "the weh-thur iz nice tuh-day",
    meaning: "今天天气很好。",
    keywords: ["weather", "nice", "today"],
  },
  {
    id: "help-en",
    language: "english",
    scenario: "help",
    scenarioName: "请求帮助",
    level: "starter",
    line: "Could you help me with this word?",
    romanization: "kood yoo help mee with this werd",
    meaning: "你能帮我看一下这个单词吗？",
    keywords: ["help", "word"],
  },
  {
    id: "schedule-en",
    language: "english",
    scenario: "schedule",
    scenarioName: "安排时间",
    level: "daily",
    line: "I am available after three this afternoon.",
    romanization: "eye am uh-vay-luh-bul af-ter three this af-ter-noon",
    meaning: "我今天下午三点以后有空。",
    keywords: ["available", "afternoon"],
  },
  {
    id: "restaurant-en",
    language: "english",
    scenario: "restaurant",
    scenarioName: "餐厅点餐",
    level: "daily",
    line: "I would like the chicken set, please.",
    romanization: "eye wood like the chik-in set, pleez",
    meaning: "我想要鸡肉套餐，谢谢。",
    keywords: ["chicken", "set", "please"],
  },
  {
    id: "opinion-en",
    language: "english",
    scenario: "opinion",
    scenarioName: "表达观点",
    level: "work",
    line: "In my opinion, this plan is practical.",
    romanization: "in my uh-pin-yun, this plan iz prak-ti-kul",
    meaning: "在我看来，这个计划很实际。",
    keywords: ["opinion", "plan", "practical"],
  },
  {
    id: "clarify-en",
    language: "english",
    scenario: "clarify",
    scenarioName: "确认信息",
    level: "work",
    line: "Could you clarify the main point again?",
    romanization: "kood yoo kla-ri-fy the main point uh-gen",
    meaning: "你能再说明一下重点吗？",
    keywords: ["clarify", "main", "point"],
  },
  {
    id: "hello-yue",
    language: "cantonese",
    scenario: "hello",
    scenarioName: "打招呼",
    level: "starter",
    line: "你好，好高兴认识你。",
    romanization: "nei5 hou2, hou2 gou1 hing3 jing6 sik1 nei5",
    meaning: "你好，很高兴认识你。",
    keywords: ["你好", "认识"],
  },
  {
    id: "intro-yue",
    language: "cantonese",
    scenario: "intro",
    scenarioName: "自我介绍",
    level: "starter",
    line: "我叫 Yi，我学紧广东话。",
    romanization: "ngo5 giu3 Yi, ngo5 hok6 gan2 gwong2 dung1 waa2",
    meaning: "我叫 Yi，我正在学粤语。",
    keywords: ["我叫", "广东话"],
  },
  {
    id: "coffee-yue",
    language: "cantonese",
    scenario: "coffee",
    scenarioName: "点咖啡",
    level: "daily",
    line: "唔该，我想要一杯热 latte。",
    romanization: "m4 goi1, ngo5 soeng2 jiu3 jat1 bui1 jit6 latte",
    meaning: "麻烦你，我想要一杯热拿铁。",
    keywords: ["唔该", "latte"],
  },
  {
    id: "direction-yue",
    language: "cantonese",
    scenario: "direction",
    scenarioName: "问路",
    level: "daily",
    line: "唔好意思，地铁站点去呀？",
    romanization: "m4 hou2 ji3 si1, dei6 tit3 zaam6 dim2 heoi3 aa3",
    meaning: "不好意思，地铁站怎么走？",
    keywords: ["地铁站", "点去"],
  },
  {
    id: "work-yue",
    language: "cantonese",
    scenario: "work",
    scenarioName: "工作沟通",
    level: "work",
    line: "我五点前会发个 update 畀你。",
    romanization: "ngo5 ng5 dim2 cin4 wui5 faat3 go3 update bei2 nei5",
    meaning: "我五点前会把进展发给你。",
    keywords: ["五点", "update", "畀你"],
  },
  {
    id: "weather-yue",
    language: "cantonese",
    scenario: "weather",
    scenarioName: "天气寒暄",
    level: "starter",
    line: "今日天气几好。",
    romanization: "gam1 jat6 tin1 hei3 gei2 hou2",
    meaning: "今天天气挺好。",
    keywords: ["天气", "几好"],
  },
  {
    id: "help-yue",
    language: "cantonese",
    scenario: "help",
    scenarioName: "请求帮助",
    level: "starter",
    line: "可唔可以帮我睇下呢个字？",
    romanization: "ho2 m4 ho2 ji5 bong1 ngo5 tai2 haa5 ni1 go3 zi6",
    meaning: "可不可以帮我看一下这个字？",
    keywords: ["帮我", "呢个字"],
  },
  {
    id: "schedule-yue",
    language: "cantonese",
    scenario: "schedule",
    scenarioName: "安排时间",
    level: "daily",
    line: "我今日下昼三点后得闲。",
    romanization: "ngo5 gam1 jat6 haa6 zau3 saam1 dim2 hau6 dak1 haan4",
    meaning: "我今天下午三点以后有空。",
    keywords: ["下昼", "得闲"],
  },
  {
    id: "clarify-yue",
    language: "cantonese",
    scenario: "clarify",
    scenarioName: "确认信息",
    level: "work",
    line: "可唔可以再讲清楚重点？",
    romanization: "ho2 m4 ho2 ji5 zoi3 gong2 cing1 co2 zung6 dim2",
    meaning: "可不可以再讲清楚重点？",
    keywords: ["讲清楚", "重点"],
  },
];

const dialogues = [
  {
    id: "first-meeting",
    label: "第一次见面",
    language: "english",
    coach: "Hi, I am Alex. What is your name?",
    hint: "My name is Yi. Nice to meet you.",
    meaning: "我叫 Yi，很高兴认识你。",
  },
  {
    id: "cafe",
    label: "咖啡店",
    language: "english",
    coach: "Good morning. What would you like?",
    hint: "Could I have a hot latte, please?",
    meaning: "请给我一杯热拿铁。",
  },
  {
    id: "mtr",
    label: "香港问路",
    language: "cantonese",
    coach: "你想去边度呀？",
    hint: "唔好意思，我想去地铁站。",
    meaning: "不好意思，我想去地铁站。",
  },
  {
    id: "work-update",
    label: "同步进展",
    language: "mixed",
    coach: "Can you send me the update today?",
    hint: "Yes, I will send it before five. 我五点前发畀你。",
    meaning: "可以，我会在五点前发给你。",
  },
];

const PASS_SCORE = 95;
const SPEECH_TIMEOUT_MS = 6000;
const QUESTS = [
  { id: "practice", title: "开口练习" },
  { id: "review", title: "复习" },
  { id: "curriculum", title: "词汇连接" },
  { id: "dialogue", title: "对话反应" },
  { id: "phrases", title: "句库补给" },
  { id: "progress", title: "进度奖励" },
];

const registerMethods = {
  email: { label: "邮箱", placeholder: "name@example.com" },
  phone: { label: "手机号", placeholder: "13800138000" },
  google: { label: "Google 账号", placeholder: "yourname@gmail.com" },
};

const toeflPlan = [
  ["analysis", "分析", "cause and effect", "名词化表达", "Careful analysis can reveal the cause and effect behind a policy."],
  ["assume", "假设", "assume responsibility", "宾语从句", "Researchers assume that the sample represents the wider population."],
  ["benefit", "益处", "long-term benefit", "让步从句", "Although the cost is high, the long-term benefit is clear."],
  ["contrast", "对比", "in contrast to", "比较结构", "In contrast to the first theory, the second one explains the exception."],
  ["decline", "下降", "a steady decline", "趋势描述", "The chart shows a steady decline in the number of native species."],
  ["evidence", "证据", "supporting evidence", "定语从句", "The evidence that supports this claim comes from several field studies."],
  ["factor", "因素", "a major factor", "原因表达", "Climate is a major factor that affects migration patterns."],
  ["hypothesis", "假设", "test a hypothesis", "目的状语", "The team designed an experiment to test a hypothesis."],
  ["illustrate", "说明", "illustrate a point", "举例结构", "This example illustrates why memory is shaped by context."],
  ["justify", "证明合理", "justify a decision", "情态动词", "The professor must justify the decision with reliable data."],
  ["maintain", "维持", "maintain balance", "并列结构", "Wetlands store water and maintain balance in the ecosystem."],
  ["obtain", "获得", "obtain information", "被动语态", "Accurate information can be obtained through repeated observation."],
  ["predict", "预测", "predict an outcome", "条件句", "If the temperature rises, scientists can predict a different outcome."],
  ["relevant", "相关的", "relevant detail", "主系表", "Only relevant details are useful in a short academic response."],
  ["significant", "显著的", "a significant change", "强调结构", "The most significant change occurred after the new method was used."],
  ["theory", "理论", "challenge a theory", "转折连接", "The new data challenges a theory, but it does not replace it."],
  ["variable", "变量", "control a variable", "不定式", "Scientists control a variable to make the comparison fair."],
  ["adapt", "适应", "adapt to change", "结果状语", "Plants adapt to change so that they can survive in dry regions."],
  ["complex", "复杂的", "a complex process", "解释结构", "Language learning is a complex process because it combines memory and use."],
  ["derive", "获得、源于", "derive from evidence", "介词短语", "A strong conclusion should derive from evidence rather than opinion."],
  ["establish", "建立", "establish a pattern", "总结表达", "After several examples, the speaker can establish a clear pattern."],
].map(([word, meaning, phrase, grammar, sentence], index) => ({
  day: index + 1,
  theme: `Day ${index + 1}`,
  word,
  meaning,
  phrase,
  grammar,
  sentence,
  prompt: `Use ${word} and ${phrase} to answer in one complete sentence.`,
  relatedWords: [
    ["analyze", "cause", "result"],
    ["assumption", "responsible", "sample"],
    ["advantage", "cost", "outcome"],
    ["compare", "exception", "difference"],
    ["decrease", "trend", "species"],
    ["support", "claim", "reliable"],
    ["influence", "migration", "pattern"],
    ["experiment", "test", "method"],
    ["example", "context", "memory"],
    ["reason", "data", "decision"],
    ["balance", "ecosystem", "store"],
    ["accurate", "observe", "source"],
    ["forecast", "condition", "temperature"],
    ["useful", "detail", "response"],
    ["major", "occur", "method"],
    ["challenge", "replace", "data"],
    ["control", "comparison", "fair"],
    ["survive", "region", "change"],
    ["combine", "process", "memory"],
    ["conclusion", "evidence", "opinion"],
    ["clear", "speaker", "example"],
  ][index],
  keywords: [word, ...phrase.split(" ").filter((part) => part.length > 2)],
}));

toeflPlan.forEach((day) => {
  day.keywords = [...new Set([...day.keywords, ...day.relatedWords])];
});

const toeflStages = ["词汇到词组", "语法到句子", "口语输出"];

const state = {
  lineIndex: 0,
  dialogueIndex: 0,
  phraseFilter: "all",
  phrasePage: 0,
  studyMode: "scene",
  toeflDay: 1,
  toeflStage: 0,
  recognition: null,
  recognitionTimer: null,
  recognitionHadResult: false,
  recognitionTimedOut: false,
  recognitionManualStop: false,
  recognizing: false,
  awaitingContinue: false,
  lessonId: null,
  libraryReturn: null,
  phase: "learn",
  reviewIds: [],
  reviewFilter: "due",
  sessionDone: false,
  speechRun: 0,
  playbackRun: 0,
  currentUser: null,
  authMode: "login",
  currentView: "practice",
  deferredInstallPrompt: null,
  productReady: false,
  stats: null,
};

const els = {
  authScreen: document.querySelector("#authScreen"),
  authForm: document.querySelector("#authForm"),
  authMethod: document.querySelector("#authMethod"),
  authUsername: document.querySelector("#authUsername"),
  authIdentifierLabel: document.querySelector("#authIdentifierLabel"),
  authDisplayName: document.querySelector("#authDisplayName"),
  authDisplayNameWrap: document.querySelector("#authDisplayNameWrap"),
  authCode: document.querySelector("#authCode"),
  authCodeWrap: document.querySelector("#authCodeWrap"),
  sendCodeButton: document.querySelector("#sendCodeButton"),
  authPassword: document.querySelector("#authPassword"),
  authSubmitButton: document.querySelector("#authSubmitButton"),
  authModeButton: document.querySelector("#authModeButton"),
  authMessage: document.querySelector("#authMessage"),
  accountName: document.querySelector("#accountName"),
  installAppButton: document.querySelector("#installAppButton"),
  logoutButton: document.querySelector("#logoutButton"),
  topnavButtons: document.querySelectorAll(".topnav [data-view]"),
  questPages: document.querySelectorAll(".quest-page"),
  questName: document.querySelector("#questName"),
  questProgressText: document.querySelector("#questProgressText"),
  questDots: document.querySelector("#questDots"),
  minuteBar: document.querySelector("#minuteBar"),
  practiceTitle: document.querySelector("#practice-title"),
  studyModeSelect: document.querySelector("#studyModeSelect"),
  languageSelect: document.querySelector("#languageSelect"),
  scenarioSelect: document.querySelector("#scenarioSelect"),
  levelSelect: document.querySelector("#levelSelect"),
  scenarioTag: document.querySelector("#scenarioTag"),
  lineTitle: document.querySelector("#lineTitle"),
  targetLine: document.querySelector("#targetLine"),
  romanization: document.querySelector("#romanization"),
  writtenExpression: document.querySelector("#writtenExpression"),
  meaning: document.querySelector("#meaning"),
  meaningHint: document.querySelector("#meaningHint"),
  listenButton: document.querySelector("#listenButton"),
  slowListenButton: document.querySelector("#slowListenButton"),
  loopListenButton: document.querySelector("#loopListenButton"),
  dictationButton: document.querySelector("#dictationButton"),
  dictationBox: document.querySelector("#dictationBox"),
  dictationInput: document.querySelector("#dictationInput"),
  checkDictationButton: document.querySelector("#checkDictationButton"),
  listeningHint: document.querySelector("#listeningHint"),
  recordButton: document.querySelector("#recordButton"),
  recordButtonLabel: document.querySelector("#recordButtonLabel"),
  masteredButton: document.querySelector("#masteredButton"),
  nextLineButton: document.querySelector("#nextLineButton"),
  transcript: document.querySelector("#transcript"),
  scoreValue: document.querySelector("#scoreValue"),
  continuePanel: document.querySelector("#continuePanel"),
  continueText: document.querySelector("#continueText"),
  continueButton: document.querySelector("#continueButton"),
  stageBridgeText: document.querySelector("#stageBridgeText"),
  startReviewButton: document.querySelector("#startReviewButton"),
  toeflDaySelect: document.querySelector("#toeflDaySelect"),
  toeflStageSelect: document.querySelector("#toeflStageSelect"),
  toeflFocus: document.querySelector("#toeflFocus"),
  reviewQueueTitle: document.querySelector("#reviewQueueTitle"),
  reviewQueueText: document.querySelector("#reviewQueueText"),
  reviewQueueList: document.querySelector("#reviewQueueList"),
  chatWindow: document.querySelector("#chatWindow"),
  customReply: document.querySelector("#customReply"),
  suggestReplyButton: document.querySelector("#suggestReplyButton"),
  nextDialogueButton: document.querySelector("#nextDialogueButton"),
  phraseSearch: document.querySelector("#phraseSearch"),
  phraseList: document.querySelector("#phraseList"),
  streakDays: document.querySelector("#streakDays"),
  masteredCount: document.querySelector("#masteredCount"),
  attemptCount: document.querySelector("#attemptCount"),
  historyList: document.querySelector("#historyList"),
  toast: document.querySelector("#toast"),
  waveCanvas: document.querySelector("#waveCanvas"),
};

const SpeechRecognition =
  window.SpeechRecognition || window.webkitSpeechRecognition || null;

const ACCOUNT_KEY = "speaklift.accounts";
const SESSION_KEY = "speaklift.sessionUser";
const LEGACY_STATS_KEY = "speaklift.stats";
const VERIFICATION_TTL_MS = 10 * 60 * 1000;
const verificationState = {
  key: null,
  code: null,
  expiresAt: 0,
};

function loadStats() {
  const fallback = {
    mastered: [],
    attempts: 0,
    minutesByDate: {},
    history: [],
    bestScores: {},
    reviewQueue: [],
    stageProgress: {
      day: 1,
      stage: 0,
      completed: {},
    },
  };

  if (!state.currentUser) return fallback;

  try {
    return {
      ...fallback,
      ...JSON.parse(localStorage.getItem(statsKey()) || "{}"),
    };
  } catch {
    return fallback;
  }
}

function saveStats() {
  if (!state.currentUser || !state.stats) return;
  localStorage.setItem(statsKey(), JSON.stringify(state.stats));
}

function statsKey(username = state.currentUser) {
  return `speaklift.stats.${username}`;
}

function readAccounts() {
  try {
    return JSON.parse(localStorage.getItem(ACCOUNT_KEY) || "{}");
  } catch {
    return {};
  }
}

function writeAccounts(accounts) {
  localStorage.setItem(ACCOUNT_KEY, JSON.stringify(accounts));
}

function normalizeIdentifier(value, method = els.authMethod.value) {
  const trimmed = value.trim();
  if (method === "phone") return trimmed.replace(/[^\d+]/g, "");
  return trimmed.toLowerCase();
}

function accountKey(method, identifier) {
  return `${method}:${normalizeIdentifier(identifier, method)}`;
}

function validateIdentifier(method, identifier) {
  if (method === "email" || method === "google") {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(identifier);
  }
  if (method === "phone") {
    return /^\+?\d{6,20}$/.test(identifier);
  }
  return identifier.length >= 2;
}

function methodLabel(method) {
  return registerMethods[method]?.label || "账号";
}

function formatAccountName(account, key = state.currentUser) {
  const fallback = key?.includes(":") ? key.split(":").slice(1).join(":") : key;
  if (!account) return fallback || "已登录";
  if (account.displayName) return account.displayName;
  if (account.identifier) return `${methodLabel(account.method)} ${account.identifier}`;
  return fallback || account.username || "已登录";
}

function updateAuthMethodUi() {
  const method = els.authMethod.value;
  const meta = registerMethods[method] || registerMethods.email;
  els.authIdentifierLabel.textContent = meta.label;
  els.authUsername.placeholder = meta.placeholder;
  resetVerification();
}

function resetVerification() {
  verificationState.key = null;
  verificationState.code = null;
  verificationState.expiresAt = 0;
  if (els.authCode) els.authCode.value = "";
}

function generateVerificationCode() {
  return String(Math.floor(100000 + Math.random() * 900000));
}

function sendVerificationCode() {
  const method = els.authMethod.value;
  const identifier = normalizeIdentifier(els.authUsername.value, method);
  if (!validateIdentifier(method, identifier)) {
    els.authMessage.textContent = `${methodLabel(method)}格式不正确，先检查账号。`;
    return;
  }

  verificationState.key = accountKey(method, identifier);
  verificationState.code = generateVerificationCode();
  verificationState.expiresAt = Date.now() + VERIFICATION_TTL_MS;
  els.authMessage.textContent = `验证码已发送到 ${methodLabel(method)}。本机演示验证码：${verificationState.code}，10 分钟内有效。`;
  showToast("验证码已生成，请填写后再注册。");
}

function hasValidVerification(key) {
  return verificationState.key === key
    && verificationState.code === els.authCode.value.trim()
    && Date.now() < verificationState.expiresAt;
}

function randomSalt() {
  const bytes = new Uint8Array(16);
  if (globalThis.crypto?.getRandomValues) {
    globalThis.crypto.getRandomValues(bytes);
  } else {
    bytes.forEach((_, index) => {
      bytes[index] = Math.floor(Math.random() * 256);
    });
  }
  return Array.from(bytes, (byte) => byte.toString(16).padStart(2, "0")).join("");
}

async function hashPassword(password, salt) {
  const data = new TextEncoder().encode(`${salt}:${password}`);
  if (globalThis.crypto?.subtle) {
    const digest = await globalThis.crypto.subtle.digest("SHA-256", data);
    return Array.from(new Uint8Array(digest), (byte) => byte.toString(16).padStart(2, "0")).join("");
  }

  let hash = 2166136261;
  data.forEach((byte) => {
    hash ^= byte;
    hash = Math.imul(hash, 16777619);
  });
  return `local-${(hash >>> 0).toString(16).padStart(8, "0")}`;
}

function setAuthMode(mode) {
  state.authMode = mode;
  const isRegister = mode === "register";
  els.authSubmitButton.textContent = isRegister ? "注册并进入" : "登录";
  els.authModeButton.textContent = isRegister ? "已有账号登录" : "新用户注册";
  els.authPassword.autocomplete = isRegister ? "new-password" : "current-password";
  els.authDisplayNameWrap.hidden = !isRegister;
  els.authDisplayNameWrap.style.display = isRegister ? "grid" : "none";
  els.authCodeWrap.hidden = !isRegister;
  els.authCodeWrap.style.display = isRegister ? "grid" : "none";
  els.authMessage.textContent = "";
  resetVerification();
}

async function handleAuthSubmit(event) {
  event.preventDefault();
  const method = els.authMethod.value;
  const identifier = normalizeIdentifier(els.authUsername.value, method);
  const key = accountKey(method, identifier);
  const password = els.authPassword.value;
  if (!validateIdentifier(method, identifier) || password.length < 6) {
    els.authMessage.textContent = `${methodLabel(method)}格式不正确，密码至少 6 位。`;
    return;
  }

  const accounts = readAccounts();
  if (state.authMode === "register") {
    if (accounts[key]) {
      els.authMessage.textContent = "这个账号已经存在，直接登录即可。";
      return;
    }

    if (!hasValidVerification(key)) {
      els.authMessage.textContent = "请先发送并填写正确的 6 位验证码。";
      return;
    }

    const salt = randomSalt();
    accounts[key] = {
      method,
      identifier,
      displayName: els.authDisplayName.value.trim() || identifier,
      salt,
      passwordHash: await hashPassword(password, salt),
      createdAt: Date.now(),
      verifiedAt: Date.now(),
    };
    writeAccounts(accounts);
    migrateLegacyStats(key);
    unlockApp(key);
    showToast("账号已创建，开始今天的练习。");
    return;
  }

  const account = accounts[key];
  if (!account || account.passwordHash !== (await hashPassword(password, account.salt))) {
    els.authMessage.textContent = "账号或密码不正确。";
    return;
  }

  unlockApp(key);
}

function migrateLegacyStats(username) {
  if (localStorage.getItem(statsKey(username)) || !localStorage.getItem(LEGACY_STATS_KEY)) return;
  localStorage.setItem(statsKey(username), localStorage.getItem(LEGACY_STATS_KEY));
}

function unlockApp(key) {
  state.currentUser = key;
  sessionStorage.setItem(SESSION_KEY, key);
  state.stats = normalizeStats(loadStats());
  const account = readAccounts()[key];
  els.accountName.textContent = formatAccountName(account, key);
  state.toeflDay = state.stats.stageProgress?.day || 1;
  state.toeflStage = state.stats.stageProgress?.stage || 0;
  document.body.classList.remove("auth-locked");
  initProduct();
}

function normalizeStats(stats) {
  return {
    ...stats,
    mastered: stats.mastered || [],
    attempts: stats.attempts || 0,
    minutesByDate: stats.minutesByDate || {},
    history: stats.history || [],
    bestScores: stats.bestScores || {},
    reviewQueue: stats.reviewQueue || [],
    learning: normalizeLearning(stats.learning, stats.mastered || []),
    stageProgress: {
      day: stats.stageProgress?.day || 1,
      stage: stats.stageProgress?.stage || 0,
      completed: stats.stageProgress?.completed || {},
    },
  };
}

function logout() {
  stopRecognition();
  saveStats();
  state.currentUser = null;
  state.stats = null;
  sessionStorage.removeItem(SESSION_KEY);
  els.accountName.textContent = "未登录";
  els.authPassword.value = "";
  setAuthMode("login");
  document.body.classList.add("auth-locked");
  cancelPlayback();
}

function restoreSession() {
  const key = sessionStorage.getItem(SESSION_KEY);
  if (key && readAccounts()[key]) {
    unlockApp(key);
    return;
  }
  document.body.classList.add("auth-locked");
  els.authUsername.focus();
}

function todayKey() {
  return dateKey();
}

function activeLessons() {
  const lang = els.languageSelect.value;
  const level = els.levelSelect.value;
  const scenario = els.scenarioSelect.value;
  return lessons.filter((lesson) => {
    const languageMatch = lang === "mixed" || lesson.language === lang;
    const levelMatch = lesson.level === level;
    const scenarioMatch = scenario === "all" || lesson.scenario === scenario;
    return languageMatch && levelMatch && scenarioMatch;
  });
}

function currentLesson() {
  if (state.sessionDone) return null;
  return courseLessons().find(lesson => lesson.id === state.lessonId) || null;
}

function currentLevelNumber() {
  return Math.max(0, courseLessons().findIndex(lesson => lesson.id === state.lessonId)) + 1;
}

function buildToeflLesson(dayNumber, stageIndex) {
  const day = toeflPlan[Math.max(0, Math.min(toeflPlan.length - 1, dayNumber - 1))];
  const stage = Math.max(0, Math.min(toeflStages.length - 1, Number(stageIndex) || 0));
  const stageLines = [
    `The word ${day.word} often appears in academic speaking.`,
    day.sentence,
    `I think ${day.word} is important. For example, ${day.sentence.charAt(0).toLowerCase() + day.sentence.slice(1)}`,
  ];
  const writtenLines = [
    `Written expression: ${day.word} can be used to explain ${day.phrase}.`,
    `Written expression: ${day.sentence}`,
    `Expression: ${day.phrase}`,
  ];
  const stageMeanings = [
    `${day.word}: ${day.meaning}；词组：${day.phrase}`,
    `语法：${day.grammar}；把词组放进完整学术句。`,
    `我认为 ${day.word} 很重要。下面用一个例子展开。`,
  ];
  return {
    id: `toefl-${day.day}-${stage}`,
    source: "toefl",
    day: day.day,
    stage,
    language: "english",
    scenario: "toefl",
    scenarioName: `TOEFL Day ${day.day}`,
    level: "work",
    line: stageLines[stage],
    written: writtenLines[stage],
    romanization: `${day.word} / ${day.phrase}`,
    meaning: stageMeanings[stage],
    keywords: day.keywords,
  };
}

function findLesson(id) {
  const match = /^toefl-(\d+)-(\d)$/.exec(id || "");
  if (match && Number(match[1]) >= 1 && Number(match[1]) <= 21 && Number(match[2]) <= 2) {
    return buildToeflLesson(Number(match[1]), Number(match[2]));
  }
  return lessons.find(lesson => lesson.id === id) || null;
}

function courseLessons() {
  if (state.libraryReturn) return [findLesson(state.lessonId)].filter(Boolean);
  if (state.studyMode === "toefl") return toeflPlan.flatMap(day => [0, 1, 2].map(stage => buildToeflLesson(day.day, stage)));
  if (state.studyMode === "review") return state.reviewIds.map(findLesson).filter(Boolean);
  return activeLessons();
}

function reviewDue() {
  return dueIds(state.stats.learning, state.stats.reviewQueue).filter(findLesson);
}

function icons() {
  window.lucide?.createIcons();
}

function captureCursor() {
  return {
    mode: state.studyMode, language: els.languageSelect.value, level: els.levelSelect.value,
    scenario: els.scenarioSelect.value, lessonId: state.lessonId, phase: state.phase,
    gate: state.awaitingContinue, reviewIds: state.reviewIds, done: state.sessionDone,
    draft: state.phase === "listen" ? els.dictationInput.value : "",
    toeflDay: state.toeflDay, toeflStage: state.toeflStage,
  };
}

function persistCursor() {
  state.stats.learning.cursor = { ...captureCursor(), libraryReturn: state.libraryReturn };
  saveStats();
}

function restoreCursor(cursor) {
  state.studyMode = ["scene", "toefl", "review"].includes(cursor?.mode) ? cursor.mode : "scene";
  els.languageSelect.value = cursor?.language || "english";
  els.levelSelect.value = cursor?.level || "starter";
  els.scenarioSelect.value = cursor?.scenario || "all";
  state.toeflDay = cursor?.toeflDay || 1;
  state.toeflStage = cursor?.toeflStage || 0;
  state.reviewIds = (cursor?.reviewIds || []).filter(findLesson);
  state.lessonId = cursor?.lessonId || null;
  state.sessionDone = Boolean(cursor?.done);
  state.phase = PHASES.includes(cursor?.phase) ? cursor.phase : "learn";
  state.awaitingContinue = Boolean(cursor?.gate && state.stats.learning.records[state.lessonId]?.[state.phase]);
  if (cursor && (state.sessionDone || currentLesson())) renderLesson({ draft: cursor.draft || "" });
  else beginCourse();
}

function beginLibraryPractice(lesson) {
  // Keep the original course bookmark even when another library sentence is chosen.
  state.libraryReturn ||= captureCursor();
  state.studyMode = lesson.source === "toefl" ? "toefl" : "scene";
  selectLesson(lesson);
  showQuestView("practice");
}

function returnToCourse() {
  if (!state.libraryReturn) return;
  const cursor = state.libraryReturn;
  state.libraryReturn = null;
  stopRecognition();
  cancelPlayback();
  restoreCursor(cursor);
  showQuestView("practice");
}

function selectLesson(lesson) {
  stopRecognition();
  cancelPlayback();
  state.lessonId = lesson?.id || null;
  state.sessionDone = !lesson;
  state.awaitingContinue = false;
  state.phase = lesson ? nextPhase(state.stats.learning.records[lesson.id]) : "learn";
  renderLesson();
}

function beginCourse() {
  state.libraryReturn = null;
  state.sessionDone = false;
  const pool = courseLessons();
  selectLesson(pool.find(lesson => {
    const record = state.stats.learning.records[lesson.id];
    return !record?.speak && !record?.deferred;
  }));
}

function beginReview() {
  state.libraryReturn = null;
  state.studyMode = "review";
  state.reviewIds = reviewDue();
  selectLesson(courseLessons()[0]);
  showQuestView("practice");
}

function advanceLesson() {
  if (state.libraryReturn) {
    returnToCourse();
    return;
  }
  const pool = courseLessons();
  const index = pool.findIndex(lesson => lesson.id === state.lessonId);
  selectLesson(pool[index + 1] || null);
}

const sceneVocabulary = {
  hello: [["hello", "你好"], ["nice to meet you", "很高兴认识你"]],
  intro: [["my name", "我的名字"], ["learning", "正在学习"]],
  coffee: [["a hot latte", "一杯热拿铁"], ["Could I have…?", "我可以要……吗？"]],
  direction: [["excuse me", "不好意思；劳驾"], ["metro station", "地铁站"]],
  work: [["send an update", "发送最新进展"], ["before five", "五点以前"]],
  weather: [["weather", "天气"], ["today", "今天"]],
  help: [["help me", "帮助我"], ["word", "单词"]],
  schedule: [["available", "有空的"], ["this afternoon", "今天下午"]],
  restaurant: [["I would like…", "我想要……"], ["chicken set", "鸡肉套餐"]],
  opinion: [["in my opinion", "在我看来"], ["practical", "实际的；可行的"]],
  clarify: [["clarify", "澄清；说明"], ["main point", "重点"]],
};

function vocabularyFor(lesson) {
  if (lesson.source === "toefl") {
    const day = toeflPlan[lesson.day - 1];
    const meanings = ["因果", "承担责任", "长期益处", "与……相比", "持续下降", "支持性证据", "一个主要因素", "检验假设", "说明一个观点", "证明决定合理", "维持平衡", "获得信息", "预测结果", "相关细节", "显著变化", "挑战理论", "控制变量", "适应变化", "复杂的过程", "源自证据", "建立规律"];
    return [[day.word, day.meaning], [day.phrase, meanings[lesson.day - 1]]];
  }
  if (lesson.language === "cantonese") return [[lesson.line, lesson.meaning]];
  return sceneVocabulary[lesson.scenario] || [[lesson.line, lesson.meaning]];
}

function renderPath() {
  const pool = courseLessons();
  const learning = state.stats.learning;
  const completed = pool.filter(lesson => learning.records[lesson.id]?.speak).length;
  const ids = pool.map(lesson => lesson.id);
  document.querySelector("#pathCount").textContent = `${completed} / ${pool.length}`;
  document.querySelector("#pathSummary").textContent = `已完成 ${completed} 句 · 共 ${pool.length} 句`;
  document.querySelector("#courseLabel").textContent = state.studyMode === "toefl" ? "TOEFL · 21 天" : state.studyMode === "review" ? "本轮复习" : `${els.languageSelect.selectedOptions[0].textContent} · ${els.levelSelect.selectedOptions[0].textContent}`;
  document.querySelector("#learningPath").innerHTML = pool.map((lesson, index) => {
    const record = learning.records[lesson.id];
    const current = lesson.id === state.lessonId && !state.sessionDone;
    const unlocked = state.studyMode === "review" || isUnlocked(ids, index, learning) || record?.speak || current;
    const status = record?.deferred ? "待巩固" : record?.speak ? (record.legacy ? "旧版已完成" : "已过关") : current ? "正在学习" : unlocked ? "待开始" : "未解锁";
    const symbol = record?.deferred ? "rotate-ccw" : record?.speak ? "check" : unlocked ? null : "lock";
    return `<li><button type="button" data-path="${lesson.id}" class="path-item ${current ? "current" : record?.deferred ? "pending" : record?.speak ? "passed" : ""}" ${unlocked ? "" : "disabled"} ${current ? 'aria-current="step"' : ""}><span class="path-node">${symbol ? `<i data-lucide="${symbol}"></i>` : index + 1}</span><span><strong>${escapeHtml(lesson.source === "toefl" ? `Day ${lesson.day} · ${toeflStages[lesson.stage]}` : lesson.scenarioName)}</strong><small>${status}</small></span></button></li>`;
  }).join("");
  icons();
}

function renderReview() {
  const due = reviewDue();
  const learning = state.stats.learning;
  const scheduled = Object.keys(learning.records).filter(id => learning.records[id].due > todayKey() && findLesson(id))
    .sort((a, b) => learning.records[a].due.localeCompare(learning.records[b].due));
  const items = state.reviewFilter === "due" ? due : scheduled;
  document.querySelector("#dueCount").textContent = due.length;
  document.querySelector("#dueSummary").textContent = due.length ? "未达标的内容优先，再回顾到期的句子。" : scheduled.length ? `下一次复习：${learning.records[scheduled[0]].due}` : "完成第一句后，会在这里安排复习。";
  document.querySelector("#beginReviewButton").disabled = due.length === 0;
  document.querySelector("#reviewBadge").hidden = !due.length;
  document.querySelector("#reviewBadge").textContent = due.length;
  document.querySelector("#reviewList").innerHTML = items.length ? items.map(id => {
    const lesson = findLesson(id);
    const record = learning.records[id];
    const pending = state.stats.reviewQueue.some(item => item.id === id) || record?.deferred;
    return `<article class="review-row"><div><strong>${escapeHtml(lesson.line)}</strong><p>${escapeHtml(lesson.scenarioName)} · ${pending ? "待巩固" : `复习日期 ${record?.due}`} · 跟读最佳 ${record?.bestSpeaking || "--"}%</p></div><button type="button" class="icon-button" data-review-id="${id}" title="练习这句" aria-label="练习这句"><i data-lucide="play"></i></button></article>`;
  }).join("") : `<div class="empty-state"><i data-lucide="circle-check"></i><strong>${state.reviewFilter === "due" ? "今天的复习已完成" : "还没有安排"}</strong><p>${state.reviewFilter === "due" ? "可以继续学习，也可以安心休息。" : "过关后会安排第 1、3、7、14 天间隔的复习。"}</p></div>`;
  icons();
}

function populateScenarios() {
  const options = [
    ["all", "全部场景"],
    ...Array.from(new Map(lessons.map((lesson) => [lesson.scenario, lesson.scenarioName]))),
  ];
  els.scenarioSelect.innerHTML = options
    .map(([value, label]) => `<option value="${value}">${label}</option>`)
    .join("");
  els.toeflDaySelect.innerHTML = toeflPlan
    .map((day) => `<option value="${day.day}">Day ${day.day} · ${day.word}</option>`)
    .join("");
}

function showQuestView(viewId, options = {}) {
  const nextView = QUESTS.some((quest) => quest.id === viewId) ? viewId : "practice";
  if (nextView === "phrases" && state.currentView !== "phrases") {
    els.phraseSearch.value = "";
    state.phrasePage = 0;
    renderPhrases();
  }
  if (nextView !== state.currentView) {
    stopRecognition();
    cancelPlayback();
  }
  state.currentView = nextView;
  els.questPages.forEach((page) => {
    const active = page.dataset.view === nextView;
    page.classList.toggle("active", active);
    page.hidden = !active;
  });
  els.topnavButtons.forEach((button) => {
    const active = button.dataset.view === nextView;
    button.classList.toggle("active", active);
    button.setAttribute("aria-current", active ? "page" : "false");
  });
  renderQuestHud();
  if (nextView === "review") renderReview();
  if (options.scroll !== false) {
    document.querySelector(".quest-main").scrollIntoView({ behavior: "smooth", block: "start" });
  }
}

function renderQuestHud() {
  const questIndex = Math.max(0, QUESTS.findIndex((quest) => quest.id === state.currentView));
  const quest = QUESTS[questIndex] || QUESTS[0];
  const learning = state.stats.learning;
  const count = learning.daily[todayKey()]?.length || 0;
  els.questName.textContent = state.currentView === "practice" ? (state.libraryReturn ? "句库练习" : state.studyMode === "review" ? "复习，也是在前进" : "让开口，成为日常") : quest.title;
  els.questProgressText.textContent = `今日完成 ${count} / ${learning.goal} 句`;
  els.questDots.innerHTML = Array.from({ length: learning.goal }, (_, index) => `<span class="${index < count ? "done" : ""}"></span>`)
    .join("");
}

function playLevelAdvance(message) {
  document.body.classList.remove("level-complete");
  window.requestAnimationFrame(() => {
    document.body.classList.add("level-complete");
    window.setTimeout(() => document.body.classList.remove("level-complete"), 900);
  });
  showToast(message);
  renderQuestHud();
}

function setRecordButtonText(text) {
  els.recordButtonLabel.textContent = text;
}

function clearRecognitionTimer() {
  window.clearTimeout(state.recognitionTimer);
  state.recognitionTimer = null;
}

function stopRecognition() {
  state.speechRun += 1;
  clearRecognitionTimer();
  const recognition = state.recognition;
  state.recognition = null;
  state.recognizing = false;
  els.recordButton.classList.remove("is-recording");
  setRecordButtonText("开始跟读");
  if (recognition) {
    recognition.onresult = recognition.onerror = recognition.onend = null;
    try { recognition.abort(); } catch { /* The browser may have already stopped. */ }
  }
}

function setPracticeControlsPaused(paused) {
  [
    els.listenButton,
    els.slowListenButton,
    els.loopListenButton,
    els.dictationButton,
    els.checkDictationButton,
    els.recordButton,
    els.masteredButton,
    els.nextLineButton,
  ].forEach((control) => {
    control.disabled = paused;
  });
  els.dictationInput.disabled = paused;
}

function showContinueGate(message) {
  state.awaitingContinue = true;
  setPracticeControlsPaused(true);
  els.continueText.textContent = state.libraryReturn && state.phase === "speak" ? "本句已过，继续原来的课程。" : message;
  els.continuePanel.hidden = false;
  els.dictationBox.hidden = true;
  document.querySelector(".action-row").hidden = true;
  document.querySelector(".listening-tools").hidden = true;
  const completedStep = document.querySelector("#lessonStepper .current");
  if (completedStep) {
    completedStep.className = "done";
    completedStep.querySelector("b").innerHTML = '<i data-lucide="check"></i>';
    icons();
  }
  document.querySelector("#continueLabel").textContent = state.phase === "listen" ? "听辨完成" : "本关已过";
  persistCursor();
  els.continueButton.focus();
  playLevelAdvance(state.phase === "listen" ? "听辨通过，接下来开口说。" : "本关已过，点击继续。");
}

function continueToNextLevel() {
  if (!state.awaitingContinue) return;
  state.awaitingContinue = false;
  if (state.phase === "listen") {
    state.phase = "speak";
    renderLesson();
  } else {
    advanceLesson();
  }
}

function renderLesson({ draft = "" } = {}) {
  stopRecognition();
  document.querySelector("#practice").classList.toggle("single-practice", Boolean(state.libraryReturn));
  document.querySelector(".coach-panel").hidden = Boolean(state.libraryReturn);
  document.querySelector("#libraryPracticeBar").hidden = !state.libraryReturn;
  const lesson = currentLesson();
  document.querySelector("#trainerCard").hidden = !lesson;
  document.querySelector("#sessionComplete").hidden = Boolean(lesson);
  if (!lesson) {
    const pool = courseLessons();
    const completed = pool.filter(item => state.stats.learning.records[item.id]?.speak).length;
    document.querySelector("#sessionCompleteTitle").textContent = pool.length ? "这一组，练完了" : state.studyMode === "review" ? "今天没有待复习内容" : "这个组合还没有课程";
    document.querySelector("#sessionCompleteText").textContent = pool.length ? `${completed} / ${pool.length} 句已过关。${reviewDue().length ? `还有 ${reviewDue().length} 项等待巩固。` : "下次复习已安排，明天再进一步。"}` : "可以选择其他课程，或回顾已经学过的句子。";
    document.querySelector("#restartCourseButton").disabled = !pool.length;
    renderPath();
    renderStats();
    persistCursor();
    return;
  }
  const levelNumber = currentLevelNumber();
  const phase = state.phase;
  document.querySelector("#trainerCard").dataset.phase = phase;
  els.practiceTitle.textContent = state.studyMode === "review" ? "本轮复习" : "今天的学习";
  els.scenarioTag.textContent = lesson.source === "toefl"
    ? `TOEFL · Day ${lesson.day} · ${toeflStages[lesson.stage]}`
    : `${lesson.language === "cantonese" ? "粤语" : "英语"} · ${state.libraryReturn ? "单句练习" : `第 ${levelNumber} 关`}`;
  els.lineTitle.textContent = lesson.source === "toefl" ? toeflPlan[lesson.day - 1].word : lesson.scenarioName;
  els.targetLine.textContent = lesson.line;
  els.romanization.textContent = lesson.romanization;
  els.writtenExpression.textContent = lesson.source === "toefl" ? toeflPlan[lesson.day - 1].phrase : "";
  els.meaning.textContent = lesson.meaning;
  setMeaningVisible(false);
  els.transcript.textContent = phase === "listen" ? "听完后写下这句话。" : "准备好了，就说出这句话。";
  els.scoreValue.textContent = "--";
  els.dictationBox.hidden = phase !== "listen" || state.awaitingContinue;
  els.dictationInput.value = draft;
  els.continuePanel.hidden = !state.awaitingContinue;
  setPracticeControlsPaused(state.awaitingContinue);
  setRecordButtonText("开始跟读");
  els.listeningHint.textContent = phase === "listen" ? "听写匹配达到 95%，再进入跟读。" : "每次识别 6 秒，可随时重新开始。";
  document.querySelector("#vocabularyStage").hidden = phase !== "learn";
  document.querySelector("#listeningPrompt").hidden = phase !== "listen";
  document.querySelector("#phraseStage").hidden = phase !== "speak";
  document.querySelector(".wave-card").hidden = phase !== "speak";
  document.querySelector(".listening-tools").hidden = phase === "learn" || state.awaitingContinue;
  document.querySelector(".action-row").hidden = phase === "learn" || state.awaitingContinue;
  document.querySelector(".feedback-panel").hidden = !state.awaitingContinue;
  document.querySelector("#speechNote").hidden = phase !== "speak";
  els.recordButton.hidden = phase !== "speak";
  els.dictationButton.hidden = true;
  document.querySelector("#revealAnswerButton").textContent = "查看原句";
  document.querySelector("#lessonStepper").innerHTML = ["认词", "听辨", "跟读"].map((label, index) => {
    const current = PHASES.indexOf(phase);
    const done = index < current || (index === current && state.awaitingContinue);
    return `<li class="${done ? "done" : index === current ? "current" : ""}" ${index === current ? 'aria-current="step"' : ""}><b>${done ? '<i data-lucide="check"></i>' : index + 1}</b>${label}</li>`;
  }).join("");
  document.querySelector("#vocabularyItems").innerHTML = vocabularyFor(lesson).map(([word, meaning], index) => `<div class="word-row"><button type="button" class="word-meaning" data-vocab="${index}" aria-expanded="false"><strong>${escapeHtml(word)}</strong><span data-gloss="${escapeHtml(meaning)}">中文释义</span></button><button type="button" class="icon-button" data-word-audio="${index}" aria-label="朗读 ${escapeHtml(word)}" title="朗读"><i data-lucide="volume-2"></i></button></div>`).join("");
  if (state.awaitingContinue) {
    els.continueText.textContent = phase === "listen" ? "听辨已通过，下一步：跟读。" : state.libraryReturn ? "本句已过，继续原来的课程。" : `本关已过。下次复习：${state.stats.learning.records[lesson.id]?.due || "明天"}`;
    document.querySelector("#continueLabel").textContent = phase === "listen" ? "听辨完成" : "本关已过";
  }
  drawWave(lesson.line.length);
  renderCurriculum();
  renderQuestHud();
  renderPath();
  persistCursor();
}

function setMeaningVisible(visible) {
  els.meaning.hidden = !visible;
  els.meaningHint.textContent = visible
    ? "收起释义"
    : "中文释义";
  els.targetLine.setAttribute("aria-expanded", String(visible));
}

function toggleMeaning() {
  setMeaningVisible(els.meaning.hidden);
}

function renderDialogue(showHint = false) {
  const item = dialogues[state.dialogueIndex % dialogues.length];
  const messages = [
    `<div class="message coach"><span>${item.label}</span>${item.coach}</div>`,
  ];

  const custom = els.customReply.value.trim();
  if (custom) {
    messages.push(`<div class="message user"><span>你的回答</span>${escapeHtml(custom)}</div>`);
  }

  if (showHint) {
    messages.push(
      `<div class="message"><span>建议表达</span>${item.hint}<br><small>${item.meaning}</small></div>`,
    );
  }

  els.chatWindow.innerHTML = messages.join("");
}

function renderPhrases() {
  const query = els.phraseSearch.value.trim().toLowerCase();
  const status = document.querySelector("#phraseStatus");
  const pagination = document.querySelector("#phrasePagination");
  els.phraseList.hidden = !query;
  pagination.hidden = true;
  if (!query) {
    els.phraseList.replaceChildren();
    status.textContent = "";
    return;
  }
  const curriculumLessons = toeflPlan.flatMap((day) => [0, 1, 2].map((stage) => buildToeflLesson(day.day, stage)));
  const cards = [...lessons, ...curriculumLessons].filter((lesson) => {
    const filterMatch =
      state.phraseFilter === "all" || lesson.language === state.phraseFilter || (state.phraseFilter === "english" && lesson.source === "toefl");
    const text = `${lesson.line} ${lesson.romanization} ${lesson.meaning} ${lesson.scenarioName}`.toLowerCase();
    return filterMatch && text.includes(query);
  });

  const pageSize = 3;
  const pageCount = Math.ceil(cards.length / pageSize);
  state.phrasePage = Math.min(state.phrasePage, Math.max(0, pageCount - 1));
  status.textContent = cards.length ? `找到 ${cards.length} 句` : "没有找到匹配的句子";
  pagination.hidden = pageCount <= 1;
  document.querySelector("#phrasePageLabel").textContent = `${state.phrasePage + 1} / ${pageCount}`;
  document.querySelector("#phrasePrevious").disabled = state.phrasePage === 0;
  document.querySelector("#phraseNext").disabled = state.phrasePage >= pageCount - 1;
  els.phraseList.innerHTML = cards.slice(state.phrasePage * pageSize, (state.phrasePage + 1) * pageSize)
    .map(
      (lesson) => `
        <article class="phrase-card">
          <span class="small-label">${lesson.source === "toefl" ? "TOEFL" : lesson.language === "cantonese" ? "粤语" : "英语"} · ${lesson.scenarioName}</span>
          <strong data-reveal-meaning role="button" tabindex="0">${lesson.line}</strong>
          <p>${lesson.romanization}</p>
          <p class="meaning" hidden>${lesson.meaning}</p>
          <button type="button" data-practice="${lesson.id}">练这句</button>
        </article>
      `,
    )
    .join("");
}

function renderStats() {
  const learning = state.stats.learning;
  const today = learning.daily[todayKey()]?.length || 0;
  const masteredCount = Object.values(learning.records).filter(record => record.speak).length;
  const streak = calculateStreak();
  document.querySelector("#dailyCompleted").textContent = `${today} / ${learning.goal} 句`;
  document.querySelector("#dailyGoalSelect").value = String(learning.goal);
  els.minuteBar.style.width = `${Math.min(100, (today / learning.goal) * 100)}%`;
  els.streakDays.textContent = `${streak} 天`;
  els.masteredCount.textContent = `${masteredCount} 句`;
  els.attemptCount.textContent = `${state.stats.attempts} 次`;

  const history = state.stats.history.slice(0, 6);
  els.historyList.innerHTML = history.length
    ? history
        .map(
          (entry) =>
            `<li><span>${escapeHtml(entry.text)}</span><time>${new Date(entry.time).toLocaleDateString("zh-CN")}</time></li>`,
        )
        .join("")
    : "<li><span>今天完成第一句，就会出现在这里。</span><time>待开始</time></li>";
  renderCurriculum();
  renderQuestHud();
  renderReview();
  renderPath();
  document.querySelector("#weekStrip").innerHTML = Array.from({ length: 7 }, (_, index) => {
    const key = daysAfter(todayKey(), index - 6);
    const count = learning.daily[key]?.length || 0;
    return `<div class="week-day ${count ? "done" : ""} ${index === 6 ? "today" : ""}"><span>${index === 6 ? "今天" : key.slice(5).replace("-", "/")}</span><b>${count ? `${count} 句` : "—"}</b></div>`;
  }).join("");
}

function renderCurriculum() {
  if (!state.stats) return;
  const day = toeflPlan[state.toeflDay - 1] || toeflPlan[0];
  els.toeflDaySelect.value = String(state.toeflDay);
  els.toeflStageSelect.value = String(state.toeflStage);
  els.studyModeSelect.value = state.studyMode;
  els.toeflFocus.innerHTML = [
    ["词汇", day.word, day.meaning],
    ["词组", day.phrase, "先把词组说稳，再放入句子。"],
    ["辅助词", day.relatedWords.join(" / "), "听力里遇到相近表达时，也要能抓住关键词。"],
    ["语法", day.grammar, "语法不是单独背，直接连到目标句。"],
    ["句子", day.sentence, "95 分后点继续进入下一阶段。"],
  ]
    .map(([label, title, text]) => `
      <div class="focus-item">
        <span>${label}</span>
        <strong data-reveal-meaning role="button" tabindex="0">${title}</strong>
        <p class="meaning" hidden>${text}</p>
      </div>
    `)
    .join("");

  const queue = state.stats.reviewQueue || [];
  els.reviewQueueTitle.textContent = `巩固队列 ${queue.length} 项`;
  els.reviewQueueText.textContent = queue.length
    ? "下次进入巩固模式，会按加入顺序一次性处理。每项仍需 95 分。"
    : "低于 95 分的跟读会自动累积，下次可一次性巩固。";
  els.reviewQueueList.innerHTML = queue.length
    ? queue.slice(0, 5).map((item) => `
      <div class="queue-item">
        <span>最佳 ${item.bestScore || 0}% · ${item.attempts || 1} 次</span>
        <strong>${item.title}</strong>
        <p>${item.line}</p>
      </div>
    `).join("")
    : `<div class="queue-item"><span>清空</span><strong>暂时没有需要巩固的句子</strong><p>继续练，低于 ${PASS_SCORE}% 的句子会出现在这里。</p></div>`;

  const due = reviewDue().length;
  els.stageBridgeText.textContent = due ? `${due} 项等待复习` : "今日没有到期复习";
}

function calculateStreak() {
  return streakDays(state.stats.learning.daily);
}

function cancelPlayback() {
  state.playbackRun += 1;
  window.speechSynthesis?.cancel();
}

function speak(text, language, options = {}) {
  if (!("speechSynthesis" in window)) {
    showToast("这个浏览器不支持朗读，可以先自己按拼读提示练。");
    return;
  }

  cancelPlayback();
  const run = state.playbackRun;
  const repeat = Math.max(1, options.repeat || 1);
  const baseRate = language === "cantonese" ? 0.82 : 0.88;
  const rate = options.slow ? baseRate * 0.72 : baseRate;
  const speakOnce = (count) => {
    if (run !== state.playbackRun || !state.currentUser) return;
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = language === "cantonese" ? "yue-HK" : "en-US";
    utterance.rate = rate;
    utterance.pitch = 1;
    utterance.onend = () => {
      if (count < repeat) {
        window.setTimeout(() => speakOnce(count + 1), 360);
      } else {
        drawWave(text.length);
      }
    };
    window.speechSynthesis.speak(utterance);
  };
  speakOnce(1);
  drawWave(text.length, true);
}

function startDictation() {
  if (state.awaitingContinue) {
    showToast("本关已经过关，点击“继续”进入下一关。");
    return;
  }
  const lesson = currentLesson();
  if (!lesson) return;
  els.dictationBox.hidden = false;
  els.dictationInput.value = "";
  els.dictationInput.focus();
  els.listeningHint.textContent = "听写模式：先听，不看中文；写完后检查和原句的相似度。";
  speak(lesson.line, lesson.language, { slow: true, repeat: 2 });
}

function checkDictation() {
  const lesson = currentLesson();
  if (!lesson || state.phase !== "listen") return;
  const typed = els.dictationInput.value.trim();
  if (!typed) {
    showToast("先写下你听到的内容，再检查。");
    return;
  }
  if (state.awaitingContinue) {
    showToast("本关已经过关，点击“继续”进入下一关。");
    return;
  }
  const score = scoreTranscript(typed, lesson);
  document.querySelector(".feedback-panel").hidden = false;
  els.transcript.textContent = `听写：${typed}`;
  els.scoreValue.textContent = `${score}%`;
  state.stats.bestScores = state.stats.bestScores || {};
  state.stats.bestScores[lesson.id] = Math.max(state.stats.bestScores[lesson.id] || 0, score);
  state.stats.attempts += 1;
  state.stats.history.unshift({
    text: `听写 ${lesson.line}`,
    score,
    time: Date.now(),
  });
  state.stats.history = state.stats.history.slice(0, 12);
  if (passListening(state.stats.learning, lesson.id, score)) {
    saveStats();
    renderStats();
    showContinueGate("听辨通过。点击继续，开口说这句话。");
  } else {
    queueForReview(lesson, score);
    saveStats();
    renderStats();
    showToast(`听写 ${score}%，已加入巩固队列。`);
  }
}

function startRecognition() {
  const lesson = currentLesson();
  if (!lesson || state.phase !== "speak") return;
  document.querySelector(".feedback-panel").hidden = false;
  if (state.awaitingContinue) {
    showToast("本关已经过关，点击“继续”进入下一关。");
    return;
  }
  if (!SpeechRecognition) {
    recordFallback(lesson);
    return;
  }

  if (state.recognizing) {
    stopRecognition();
    setRecordButtonText("继续跟读");
    els.transcript.textContent = "已暂停，再按一次继续跟读。";
    return;
  }

  cancelPlayback();
  const recognition = new SpeechRecognition();
  state.recognition = recognition;
  const run = ++state.speechRun;
  const isCurrent = () => run === state.speechRun && state.currentUser && currentLesson()?.id === lesson.id;
  recognition.lang = lesson.language === "cantonese" ? "yue-HK" : "en-US";
  recognition.interimResults = false;
  recognition.maxAlternatives = 1;
  recognition.continuous = false;
  state.recognizing = true;
  state.recognitionHadResult = false;
  state.recognitionTimedOut = false;
  state.recognitionManualStop = false;
  els.recordButton.classList.add("is-recording");
  setRecordButtonText("正在听...");
  els.transcript.textContent = `请在 ${Math.round(SPEECH_TIMEOUT_MS / 1000)} 秒内说出屏幕上的句子。`;
  drawWave(lesson.line.length, true);
  state.recognitionTimer = window.setTimeout(() => {
    if (!isCurrent() || !state.recognizing) return;
    stopRecognition();
    setRecordButtonText("继续跟读");
    els.transcript.textContent = `这次没有识别到语音，已暂停。再按“继续跟读”重新开始。`;
    showToast("没有识别到，已暂停。");
    drawWave(lesson.line.length);
  }, SPEECH_TIMEOUT_MS);

  recognition.onresult = (event) => {
    if (!isCurrent()) return;
    const transcript = event.results?.[0]?.[0]?.transcript;
    stopRecognition();
    if (!transcript) return;
    evaluateSpeech(transcript, lesson);
  };

  recognition.onerror = (event) => {
    if (!isCurrent()) return;
    stopRecognition();
    setRecordButtonText("继续跟读");
    els.transcript.textContent = event.error === "not-allowed" ? "麦克风未获授权，请在浏览器设置中允许麦克风后重试。" : "没有听清楚，已暂停。再按“继续跟读”重新开始。";
  };

  recognition.onend = () => {
    if (!isCurrent()) return;
    stopRecognition();
    setRecordButtonText("继续跟读");
    els.transcript.textContent = "识别已暂停，再按一次继续跟读。";
    drawWave(lesson.line.length);
  };

  try {
    recognition.start();
  } catch {
    stopRecognition();
    setRecordButtonText("继续跟读");
    els.transcript.textContent = "语音识别没有启动成功，再按一次试试。";
  }
}

function recordFallback(lesson) {
  els.transcript.textContent = "此浏览器暂不支持语音识别。可以暂存巩固，换支持语音识别的浏览器后继续。";
  showToast("语音识别暂不可用，学习进度已保留。");
}

function evaluateSpeech(transcript, lesson) {
  if (!state.currentUser || currentLesson()?.id !== lesson.id || state.phase !== "speak") return;
  if (state.awaitingContinue) {
    showToast("本关已经过关，点击“继续”进入下一关。");
    return;
  }
  const score = scoreTranscript(transcript, lesson);
  document.querySelector(".feedback-panel").hidden = false;
  els.transcript.textContent = transcript;
  els.scoreValue.textContent = `${score}%`;
  state.stats.attempts += 1;
  state.stats.bestScores = state.stats.bestScores || {};
  state.stats.bestScores[lesson.id] = Math.max(state.stats.bestScores[lesson.id] || 0, score);
  state.stats.history.unshift({
    text: `${score >= PASS_SCORE ? "过关" : "待巩固"} ${score}%：${lesson.line}`,
    time: Date.now(),
  });
  state.stats.history = state.stats.history.slice(0, 12);
  if (passSpeaking(state.stats.learning, lesson.id, score)) {
    clearReviewItem(lesson.id);
    markLessonPassed(lesson);
  } else {
    queueForReview(lesson, score);
  }
  saveStats();
  renderStats();
  if (score >= PASS_SCORE) {
    showContinueGate(`${score}% 过关。下次复习：${state.stats.learning.records[lesson.id].due}`);
  } else {
    renderCurriculum();
  }

  if (score >= PASS_SCORE) {
    return;
  } else {
    showToast(`当前 ${score}%，已加入巩固队列。`);
  }
}

function scoreTranscript(transcript, lesson) {
  const expected = normalize(lesson.line);
  const spoken = normalize(transcript);
  if (!spoken) return 0;

  if (expected === spoken) return 100;

  const expectedParts = expected.split(" ").filter(Boolean);
  const spokenParts = spoken.split(" ").filter(Boolean);
  const keywordHits = lesson.keywords.filter((word) =>
    transcript.toLowerCase().includes(word.toLowerCase()),
  ).length;
  const overlap = expectedParts.filter((part) => spokenParts.includes(part)).length;
  const phraseScore = expectedParts.length ? overlap / expectedParts.length : 0;
  const keywordScore = lesson.keywords.length ? keywordHits / lesson.keywords.length : 0;
  const distanceScore = 1 - levenshtein(expected, spoken) / Math.max(expected.length, spoken.length, 1);
  return Math.round(Math.min(1, distanceScore * 0.72 + phraseScore * 0.18 + keywordScore * 0.1) * 100);
}

function normalize(value) {
  return value
    .toLowerCase()
    .replace(/[.,?!，。？！、]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function levenshtein(a, b) {
  const previous = Array.from({ length: b.length + 1 }, (_, index) => index);
  const current = new Array(b.length + 1);
  for (let i = 1; i <= a.length; i += 1) {
    current[0] = i;
    for (let j = 1; j <= b.length; j += 1) {
      current[j] = Math.min(
        previous[j] + 1,
        current[j - 1] + 1,
        previous[j - 1] + (a[i - 1] === b[j - 1] ? 0 : 1),
      );
    }
    previous.splice(0, previous.length, ...current);
  }
  return previous[b.length];
}

function queueForReview(lesson, score) {
  deferLesson(state.stats.learning, lesson.id);
  state.stats.reviewQueue = state.stats.reviewQueue || [];
  const existing = state.stats.reviewQueue.find((item) => item.id === lesson.id);
  if (existing) {
    existing.bestScore = Math.max(existing.bestScore || 0, score);
    existing.attempts = (existing.attempts || 0) + 1;
    existing.lastTried = Date.now();
    return;
  }

  state.stats.reviewQueue.push({
    id: lesson.id,
    source: lesson.source || "scene",
    day: lesson.day || null,
    stage: Number.isInteger(lesson.stage) ? lesson.stage : null,
    title: lesson.scenarioName,
    line: lesson.line,
    bestScore: score,
    attempts: 1,
    addedAt: Date.now(),
    lastTried: Date.now(),
  });
}

function clearReviewItem(lessonId) {
  state.stats.reviewQueue = (state.stats.reviewQueue || []).filter((item) => item.id !== lessonId);
}

function markLessonPassed(lesson) {
  if (!state.stats.mastered.includes(lesson.id)) {
    state.stats.mastered.push(lesson.id);
  }

  if (lesson.source !== "toefl") return;

  state.stats.stageProgress = state.stats.stageProgress || { day: 1, stage: 0, completed: {} };
  state.stats.stageProgress.completed[lesson.id] = {
    passedAt: Date.now(),
    bestScore: state.stats.bestScores?.[lesson.id] || PASS_SCORE,
  };

}

function markMastered() {
  const lesson = currentLesson();
  if (!lesson || state.awaitingContinue) return;
  queueForReview(lesson, state.stats.bestScores?.[lesson.id] || 0);
  state.stats.history.unshift({
    text: `暂存巩固：${lesson.line}`,
    time: Date.now(),
  });
  state.stats.history = state.stats.history.slice(0, 12);
  saveStats();
  renderStats();
  renderPhrases();
  showToast("已加入巩固队列，下次统一处理。");
  advanceLesson();
}

function drawWave(seed = 12, active = false) {
  const canvas = els.waveCanvas;
  const ctx = canvas.getContext("2d");
  const width = canvas.width;
  const height = canvas.height;
  ctx.clearRect(0, 0, width, height);
  ctx.fillStyle = "#f4fbf8";
  ctx.fillRect(0, 0, width, height);

  ctx.strokeStyle = "rgba(19, 95, 99, 0.12)";
  ctx.lineWidth = 1;
  for (let x = 0; x < width; x += 48) {
    ctx.beginPath();
    ctx.moveTo(x, 0);
    ctx.lineTo(x, height);
    ctx.stroke();
  }

  const bars = 38;
  const gap = 8;
  const barWidth = (width - gap * (bars - 1)) / bars;
  for (let index = 0; index < bars; index += 1) {
    const rhythm = Math.sin((index + seed) * 0.78) * 0.5 + 0.5;
    const accent = index % 5 === 0 ? 1.18 : 1;
    const barHeight = (24 + rhythm * 92 * accent) * (active ? 1.08 : 0.72);
    const x = index * (barWidth + gap);
    const y = height / 2 - barHeight / 2;
    ctx.fillStyle = index % 5 === 0 ? "#df5d45" : "#135f63";
    roundRect(ctx, x, y, Math.max(4, barWidth), barHeight, 6);
    ctx.fill();
  }

}

function roundRect(ctx, x, y, width, height, radius) {
  const r = Math.min(radius, width / 2, height / 2);
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.arcTo(x + width, y, x + width, y + height, r);
  ctx.arcTo(x + width, y + height, x, y + height, r);
  ctx.arcTo(x, y + height, x, y, r);
  ctx.arcTo(x, y, x + width, y, r);
  ctx.closePath();
}

function showToast(message) {
  els.toast.textContent = message;
  els.toast.classList.add("show");
  window.clearTimeout(showToast.timer);
  showToast.timer = window.setTimeout(() => els.toast.classList.remove("show"), 2600);
}

function escapeHtml(value) {
  return value.replace(/[&<>"']/g, (char) => {
    const map = {
      "&": "&amp;",
      "<": "&lt;",
      ">": "&gt;",
      '"': "&quot;",
      "'": "&#039;",
    };
    return map[char];
  });
}

function toggleInlineMeaning(trigger) {
  const card = trigger.closest(".focus-item, .phrase-card");
  const meaning = card?.querySelector(".meaning");
  if (!meaning) return false;
  meaning.hidden = !meaning.hidden;
  return true;
}

function bindRevealTrigger(element, callback) {
  element.addEventListener("click", callback);
  element.addEventListener("keydown", (event) => {
    if (event.key !== "Enter" && event.key !== " ") return;
    event.preventDefault();
    callback();
  });
}

function bindEvents() {
  els.topnavButtons.forEach((button) => {
    button.addEventListener("click", () => showQuestView(button.dataset.view));
  });

  [els.languageSelect, els.scenarioSelect, els.levelSelect].forEach((control) => {
    control.addEventListener("change", () => {
      state.studyMode = "scene";
      beginCourse();
    });
  });

  els.studyModeSelect.addEventListener("change", () => {
    state.studyMode = els.studyModeSelect.value;
    if (state.studyMode === "review") beginReview();
    else beginCourse();
  });

  els.toeflDaySelect.addEventListener("change", () => {
    state.toeflDay = Number(els.toeflDaySelect.value);
    renderCurriculum();
  });

  els.toeflStageSelect.addEventListener("change", () => {
    state.toeflStage = Number(els.toeflStageSelect.value);
    renderCurriculum();
  });

  els.startReviewButton.addEventListener("click", beginReview);

  els.nextLineButton.addEventListener("click", () => {
    markMastered();
  });

  els.listenButton.addEventListener("click", () => {
    const lesson = currentLesson();
    if (!lesson) return;
    speak(lesson.line, lesson.language);
  });

  els.slowListenButton.addEventListener("click", () => {
    const lesson = currentLesson();
    if (!lesson) return;
    els.listeningHint.textContent = "慢速听一遍，注意重音、停顿和结尾音。";
    speak(lesson.line, lesson.language, { slow: true });
  });

  els.loopListenButton.addEventListener("click", () => {
    const lesson = currentLesson();
    if (!lesson) return;
    els.listeningHint.textContent = "循环 3 遍：第一遍听意思，第二遍听关键词，第三遍准备跟读。";
    speak(lesson.line, lesson.language, { slow: true, repeat: 3 });
  });

  els.dictationButton.addEventListener("click", startDictation);
  els.checkDictationButton.addEventListener("click", checkDictation);
  els.continueButton.addEventListener("click", continueToNextLevel);
  document.querySelector("#returnToCourseButton").addEventListener("click", returnToCourse);
  els.dictationInput.addEventListener("input", persistCursor);
  document.querySelector("#learnContinueButton").addEventListener("click", () => {
    const lesson = currentLesson();
    if (!lesson || state.phase !== "learn") return;
    recordFor(state.stats.learning, lesson.id).learn = true;
    state.phase = "listen";
    renderLesson();
  });
  document.querySelector("#vocabularyItems").addEventListener("click", event => {
    const lesson = currentLesson();
    if (!lesson) return;
    const word = event.target.closest("[data-vocab]");
    if (word) {
      const expanded = word.getAttribute("aria-expanded") !== "true";
      word.setAttribute("aria-expanded", String(expanded));
      const gloss = word.querySelector("span");
      gloss.textContent = expanded ? gloss.dataset.gloss : "中文释义";
    }
    const audio = event.target.closest("[data-word-audio]");
    if (audio) speak(vocabularyFor(lesson)[Number(audio.dataset.wordAudio)][0], lesson.language);
  });
  document.querySelector("#revealAnswerButton").addEventListener("click", () => {
    const phrase = document.querySelector("#phraseStage");
    phrase.hidden = !phrase.hidden;
    document.querySelector("#revealAnswerButton").textContent = phrase.hidden ? "查看原句" : "收起原句";
  });
  document.querySelector("#learningPath").addEventListener("click", event => {
    const button = event.target.closest("[data-path]");
    if (!button || button.disabled) return;
    selectLesson(findLesson(button.dataset.path));
  });
  document.querySelector("#beginReviewButton").addEventListener("click", beginReview);
  document.querySelector("#sessionReviewButton").addEventListener("click", () => showQuestView("review"));
  document.querySelector("#restartCourseButton").addEventListener("click", () => selectLesson(courseLessons()[0]));
  document.querySelector("#reviewList").addEventListener("click", event => {
    const button = event.target.closest("[data-review-id]");
    if (!button) return;
    state.libraryReturn = null;
    state.studyMode = "review";
    state.reviewIds = [button.dataset.reviewId];
    selectLesson(findLesson(button.dataset.reviewId));
    showQuestView("practice");
  });
  document.querySelectorAll("[data-review-filter]").forEach(button => button.addEventListener("click", () => {
    state.reviewFilter = button.dataset.reviewFilter;
    document.querySelectorAll("[data-review-filter]").forEach(item => item.classList.toggle("active", item === button));
    renderReview();
  }));
  document.querySelector("#dailyGoalSelect").addEventListener("change", event => {
    state.stats.learning.goal = Number(event.target.value);
    saveStats();
    renderStats();
  });
  document.querySelector("#startToeflButton").addEventListener("click", () => {
    state.libraryReturn = null;
    state.studyMode = "toefl";
    selectLesson(buildToeflLesson(state.toeflDay, state.toeflStage));
    showQuestView("practice");
  });
  document.addEventListener("visibilitychange", () => {
    if (document.hidden) {
      stopRecognition();
      cancelPlayback();
    }
  });

  [els.targetLine, els.romanization, els.writtenExpression].forEach((element) => {
    bindRevealTrigger(element, toggleMeaning);
  });

  els.recordButton.addEventListener("click", startRecognition);
  els.masteredButton.addEventListener("click", markMastered);

  els.suggestReplyButton.addEventListener("click", () => renderDialogue(true));
  els.nextDialogueButton.addEventListener("click", () => {
    state.dialogueIndex += 1;
    els.customReply.value = "";
    renderDialogue(false);
  });
  els.customReply.addEventListener("input", () => renderDialogue(false));
  els.phraseSearch.addEventListener("input", () => {
    state.phrasePage = 0;
    renderPhrases();
  });
  document.querySelector("#phrasePrevious").addEventListener("click", () => {
    state.phrasePage = Math.max(0, state.phrasePage - 1);
    renderPhrases();
  });
  document.querySelector("#phraseNext").addEventListener("click", () => {
    state.phrasePage += 1;
    renderPhrases();
  });

  els.toeflFocus.addEventListener("click", (event) => {
    const trigger = event.target.closest("[data-reveal-meaning]");
    if (trigger) toggleInlineMeaning(trigger);
  });

  els.toeflFocus.addEventListener("keydown", (event) => {
    if (event.key !== "Enter" && event.key !== " ") return;
    const trigger = event.target.closest("[data-reveal-meaning]");
    if (!trigger) return;
    event.preventDefault();
    toggleInlineMeaning(trigger);
  });

  document.querySelectorAll(".segmented button").forEach((button) => {
    button.addEventListener("click", () => {
      document.querySelectorAll(".segmented button").forEach((item) => item.classList.remove("active"));
      button.classList.add("active");
      state.phraseFilter = button.dataset.filter;
      state.phrasePage = 0;
      renderPhrases();
    });
  });

  els.phraseList.addEventListener("click", (event) => {
    const meaningTrigger = event.target.closest("[data-reveal-meaning]");
    if (meaningTrigger) {
      toggleInlineMeaning(meaningTrigger);
      return;
    }

    const button = event.target.closest("[data-practice]");
    if (!button) return;
    const lesson = findLesson(button.dataset.practice);
    if (!lesson) return;
    beginLibraryPractice(lesson);
  });

  els.phraseList.addEventListener("keydown", (event) => {
    if (event.key !== "Enter" && event.key !== " ") return;
    const trigger = event.target.closest("[data-reveal-meaning]");
    if (!trigger) return;
    event.preventDefault();
    toggleInlineMeaning(trigger);
  });
}

function syncStageProgress() {
  state.stats.stageProgress = state.stats.stageProgress || { day: 1, stage: 0, completed: {} };
  state.stats.stageProgress.day = state.toeflDay;
  state.stats.stageProgress.stage = state.toeflStage;
  saveStats();
}

function bindAuthEvents() {
  els.authForm.addEventListener("submit", handleAuthSubmit);
  els.authMethod.addEventListener("change", updateAuthMethodUi);
  els.authUsername.addEventListener("input", resetVerification);
  els.authCode.addEventListener("input", () => {
    els.authCode.value = els.authCode.value.replace(/\D/g, "").slice(0, 6);
  });
  els.sendCodeButton.addEventListener("click", sendVerificationCode);
  els.authModeButton.addEventListener("click", () => {
    setAuthMode(state.authMode === "login" ? "register" : "login");
  });
  els.logoutButton.addEventListener("click", logout);
  els.installAppButton.addEventListener("click", installApp);

  window.addEventListener("beforeinstallprompt", (event) => {
    event.preventDefault();
    state.deferredInstallPrompt = event;
  });

  window.addEventListener("appinstalled", () => {
    state.deferredInstallPrompt = null;
    showToast("SpeakLift 已安装。");
  });
}

async function installApp() {
  if (window.matchMedia("(display-mode: standalone)").matches || navigator.standalone) {
    showToast("当前已经是 App 模式。");
    return;
  }

  if (state.deferredInstallPrompt) {
    state.deferredInstallPrompt.prompt();
    const choice = await state.deferredInstallPrompt.userChoice;
    state.deferredInstallPrompt = null;
    showToast(choice.outcome === "accepted" ? "已开始安装。" : "已取消安装。");
    return;
  }

  showToast("电脑端可用浏览器地址栏的安装图标；手机端用浏览器菜单添加到主屏幕。");
}

function registerServiceWorker() {
  if ("serviceWorker" in navigator) {
    navigator.serviceWorker.register("./sw.js").catch(() => {
      /* Offline support is a convenience, not a blocker for practice. */
    });
  }
}

function initProduct() {
  if (!state.productReady) {
    populateScenarios();
    bindEvents();
    state.productReady = true;
  }
  const cursor = state.stats.learning.cursor;
  state.currentView = "practice";
  state.libraryReturn = cursor?.libraryReturn || null;
  restoreCursor(cursor);
  document.querySelector(".path-details").open = !window.matchMedia("(max-width: 720px)").matches;
  renderDialogue();
  renderPhrases();
  renderStats();
  showQuestView(state.currentView, { scroll: false });
}

function init() {
  icons();
  updateAuthMethodUi();
  setAuthMode("login");
  bindAuthEvents();
  registerServiceWorker();
  restoreSession();
}

init();
