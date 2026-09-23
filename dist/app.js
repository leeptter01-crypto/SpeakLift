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

const state = {
  lineIndex: 0,
  dialogueIndex: 0,
  phraseFilter: "all",
  recognition: null,
  recognizing: false,
  currentUser: null,
  authMode: "login",
  deferredInstallPrompt: null,
  productReady: false,
  stats: null,
};

const els = {
  authScreen: document.querySelector("#authScreen"),
  authForm: document.querySelector("#authForm"),
  authUsername: document.querySelector("#authUsername"),
  authPassword: document.querySelector("#authPassword"),
  authSubmitButton: document.querySelector("#authSubmitButton"),
  authModeButton: document.querySelector("#authModeButton"),
  authMessage: document.querySelector("#authMessage"),
  accountName: document.querySelector("#accountName"),
  installAppButton: document.querySelector("#installAppButton"),
  logoutButton: document.querySelector("#logoutButton"),
  todayMinutes: document.querySelector("#todayMinutes"),
  minuteBar: document.querySelector("#minuteBar"),
  languageSelect: document.querySelector("#languageSelect"),
  scenarioSelect: document.querySelector("#scenarioSelect"),
  levelSelect: document.querySelector("#levelSelect"),
  scenarioTag: document.querySelector("#scenarioTag"),
  lineTitle: document.querySelector("#lineTitle"),
  targetLine: document.querySelector("#targetLine"),
  romanization: document.querySelector("#romanization"),
  meaning: document.querySelector("#meaning"),
  listenButton: document.querySelector("#listenButton"),
  recordButton: document.querySelector("#recordButton"),
  masteredButton: document.querySelector("#masteredButton"),
  nextLineButton: document.querySelector("#nextLineButton"),
  transcript: document.querySelector("#transcript"),
  scoreValue: document.querySelector("#scoreValue"),
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

function loadStats() {
  const fallback = {
    mastered: [],
    attempts: 0,
    minutesByDate: {},
    history: [],
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

function normalizeUsername(value) {
  return value.trim().toLowerCase().replace(/\s+/g, "-");
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
  els.authMessage.textContent = "";
}

async function handleAuthSubmit(event) {
  event.preventDefault();
  const username = normalizeUsername(els.authUsername.value);
  const password = els.authPassword.value;
  if (username.length < 2 || password.length < 6) {
    els.authMessage.textContent = "账号至少 2 位，密码至少 6 位。";
    return;
  }

  const accounts = readAccounts();
  if (state.authMode === "register") {
    if (accounts[username]) {
      els.authMessage.textContent = "这个账号已经存在，直接登录即可。";
      return;
    }

    const salt = randomSalt();
    accounts[username] = {
      salt,
      passwordHash: await hashPassword(password, salt),
      createdAt: Date.now(),
    };
    writeAccounts(accounts);
    migrateLegacyStats(username);
    unlockApp(username);
    showToast("账号已创建，开始今天的练习。");
    return;
  }

  const account = accounts[username];
  if (!account || account.passwordHash !== (await hashPassword(password, account.salt))) {
    els.authMessage.textContent = "账号或密码不正确。";
    return;
  }

  unlockApp(username);
}

function migrateLegacyStats(username) {
  if (localStorage.getItem(statsKey(username)) || !localStorage.getItem(LEGACY_STATS_KEY)) return;
  localStorage.setItem(statsKey(username), localStorage.getItem(LEGACY_STATS_KEY));
}

function unlockApp(username) {
  state.currentUser = username;
  sessionStorage.setItem(SESSION_KEY, username);
  state.stats = loadStats();
  els.accountName.textContent = username;
  document.body.classList.remove("auth-locked");
  initProduct();
}

function logout() {
  saveStats();
  state.currentUser = null;
  state.stats = null;
  sessionStorage.removeItem(SESSION_KEY);
  els.accountName.textContent = "未登录";
  els.authPassword.value = "";
  setAuthMode("login");
  document.body.classList.add("auth-locked");
  window.speechSynthesis?.cancel();
}

function restoreSession() {
  const username = sessionStorage.getItem(SESSION_KEY);
  if (username && readAccounts()[username]) {
    unlockApp(username);
    return;
  }
  document.body.classList.add("auth-locked");
  els.authUsername.focus();
}

function todayKey() {
  return new Date().toISOString().slice(0, 10);
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
  const filtered = activeLessons();
  if (!filtered.length) return lessons[0];
  return filtered[state.lineIndex % filtered.length];
}

function populateScenarios() {
  const options = [
    ["all", "全部场景"],
    ...Array.from(new Map(lessons.map((lesson) => [lesson.scenario, lesson.scenarioName]))),
  ];
  els.scenarioSelect.innerHTML = options
    .map(([value, label]) => `<option value="${value}">${label}</option>`)
    .join("");
}

function renderLesson() {
  const lesson = currentLesson();
  els.scenarioTag.textContent =
    lesson.language === "cantonese" ? "粤语 · " + lesson.level : "英语 · " + lesson.level;
  els.lineTitle.textContent = lesson.scenarioName;
  els.targetLine.textContent = lesson.line;
  els.romanization.textContent = lesson.romanization;
  els.meaning.textContent = lesson.meaning;
  els.transcript.textContent = "点击“开始跟读”，说完后会看到反馈。";
  els.scoreValue.textContent = "--";
  drawWave(lesson.line.length);
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
  const cards = lessons.filter((lesson) => {
    const filterMatch =
      state.phraseFilter === "all" || lesson.language === state.phraseFilter;
    const text = `${lesson.line} ${lesson.romanization} ${lesson.meaning} ${lesson.scenarioName}`.toLowerCase();
    return filterMatch && text.includes(query);
  });

  els.phraseList.innerHTML = cards
    .map(
      (lesson) => `
        <article class="phrase-card">
          <span class="small-label">${lesson.language === "cantonese" ? "粤语" : "英语"} · ${lesson.scenarioName}</span>
          <strong>${lesson.line}</strong>
          <p>${lesson.romanization}</p>
          <p>${lesson.meaning}</p>
          <button type="button" data-practice="${lesson.id}">练这句</button>
        </article>
      `,
    )
    .join("");
}

function renderStats() {
  const today = state.stats.minutesByDate[todayKey()] || 0;
  const masteredCount = state.stats.mastered.length;
  const streak = calculateStreak();
  els.todayMinutes.textContent = today;
  els.minuteBar.style.width = `${Math.min(100, (today / 15) * 100)}%`;
  els.streakDays.textContent = `${streak} 天`;
  els.masteredCount.textContent = `${masteredCount} 句`;
  els.attemptCount.textContent = `${state.stats.attempts} 次`;

  const history = state.stats.history.slice(0, 6);
  els.historyList.innerHTML = history.length
    ? history
        .map(
          (entry) =>
            `<li><span>${entry.text}</span><time>${new Date(entry.time).toLocaleDateString("zh-CN")}</time></li>`,
        )
        .join("")
    : "<li><span>今天完成第一句，就会出现在这里。</span><time>待开始</time></li>";
}

function calculateStreak() {
  let streak = 0;
  const date = new Date();
  while (streak < 90) {
    const key = date.toISOString().slice(0, 10);
    if (!state.stats.minutesByDate[key]) break;
    streak += 1;
    date.setDate(date.getDate() - 1);
  }
  return streak;
}

function speak(text, language) {
  if (!("speechSynthesis" in window)) {
    showToast("这个浏览器不支持朗读，可以先自己按拼读提示练。");
    return;
  }

  window.speechSynthesis.cancel();
  const utterance = new SpeechSynthesisUtterance(text);
  utterance.lang = language === "cantonese" ? "yue-HK" : "en-US";
  utterance.rate = language === "cantonese" ? 0.82 : 0.88;
  utterance.pitch = 1;
  window.speechSynthesis.speak(utterance);
  drawWave(text.length, true);
}

function startRecognition() {
  const lesson = currentLesson();
  if (!SpeechRecognition) {
    recordFallback(lesson);
    return;
  }

  if (state.recognizing) {
    state.recognition.stop();
    return;
  }

  state.recognition = new SpeechRecognition();
  state.recognition.lang = lesson.language === "cantonese" ? "yue-HK" : "en-US";
  state.recognition.interimResults = false;
  state.recognition.maxAlternatives = 1;
  state.recognizing = true;
  els.recordButton.classList.add("is-recording");
  els.recordButton.lastChild.textContent = " 正在听...";
  els.transcript.textContent = "请说出屏幕上的句子。";
  drawWave(lesson.line.length, true);

  state.recognition.onresult = (event) => {
    const transcript = event.results[0][0].transcript;
    evaluateSpeech(transcript, lesson);
  };

  state.recognition.onerror = () => {
    showToast("没有听清楚。换个安静环境，或用“我会说了”记录一次练习。");
  };

  state.recognition.onend = () => {
    state.recognizing = false;
    els.recordButton.classList.remove("is-recording");
    els.recordButton.lastChild.textContent = " 开始跟读";
    drawWave(lesson.line.length);
  };

  state.recognition.start();
}

function recordFallback(lesson) {
  const typed = window.prompt("这个浏览器暂时不能语音识别。你可以输入自己刚才说的内容来做匹配：", "");
  if (typed) evaluateSpeech(typed, lesson);
}

function evaluateSpeech(transcript, lesson) {
  const score = scoreTranscript(transcript, lesson);
  els.transcript.textContent = transcript;
  els.scoreValue.textContent = `${score}%`;
  addPracticeMinute(1);
  state.stats.attempts += 1;
  state.stats.history.unshift({
    text: `${lesson.scenarioName}：${lesson.line}`,
    time: Date.now(),
  });
  state.stats.history = state.stats.history.slice(0, 12);
  saveStats();
  renderStats();

  if (score >= 72) {
    showToast("很不错，这句已经能用于真实交流了。");
  } else {
    showToast("先放慢速度，再抓关键词和句尾。");
  }
}

function scoreTranscript(transcript, lesson) {
  const expected = normalize(lesson.line);
  const spoken = normalize(transcript);
  if (!spoken) return 0;

  const expectedParts = expected.split(" ").filter(Boolean);
  const spokenParts = spoken.split(" ").filter(Boolean);
  const keywordHits = lesson.keywords.filter((word) =>
    transcript.toLowerCase().includes(word.toLowerCase()),
  ).length;
  const overlap = expectedParts.filter((part) => spokenParts.includes(part)).length;
  const phraseScore = expectedParts.length ? overlap / expectedParts.length : 0;
  const keywordScore = lesson.keywords.length ? keywordHits / lesson.keywords.length : 0;
  return Math.round(Math.min(1, phraseScore * 0.68 + keywordScore * 0.32) * 100);
}

function normalize(value) {
  return value
    .toLowerCase()
    .replace(/[.,?!，。？！、]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function markMastered() {
  const lesson = currentLesson();
  if (!state.stats.mastered.includes(lesson.id)) {
    state.stats.mastered.push(lesson.id);
  }
  addPracticeMinute(1);
  state.stats.history.unshift({
    text: `掌握：${lesson.line}`,
    time: Date.now(),
  });
  state.stats.history = state.stats.history.slice(0, 12);
  saveStats();
  renderStats();
  renderPhrases();
  showToast("已记录。明天再复习一次，记得更牢。");
}

function addPracticeMinute(minutes) {
  const key = todayKey();
  state.stats.minutesByDate[key] = (state.stats.minutesByDate[key] || 0) + minutes;
}

function drawWave(seed = 12, active = false) {
  const canvas = els.waveCanvas;
  const ctx = canvas.getContext("2d");
  const width = canvas.width;
  const height = canvas.height;
  ctx.clearRect(0, 0, width, height);
  ctx.fillStyle = "#fffaf0";
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

  ctx.fillStyle = "rgba(23, 50, 52, 0.55)";
  ctx.font = "700 15px Inter, sans-serif";
  ctx.fillText(active ? "正在练习节奏" : "听一句，再跟一句", 18, height - 18);
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

function bindEvents() {
  [els.languageSelect, els.scenarioSelect, els.levelSelect].forEach((control) => {
    control.addEventListener("change", () => {
      state.lineIndex = 0;
      renderLesson();
    });
  });

  els.nextLineButton.addEventListener("click", () => {
    state.lineIndex += 1;
    renderLesson();
  });

  els.listenButton.addEventListener("click", () => {
    const lesson = currentLesson();
    speak(lesson.line, lesson.language);
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
  els.phraseSearch.addEventListener("input", renderPhrases);

  document.querySelectorAll(".segmented button").forEach((button) => {
    button.addEventListener("click", () => {
      document.querySelectorAll(".segmented button").forEach((item) => item.classList.remove("active"));
      button.classList.add("active");
      state.phraseFilter = button.dataset.filter;
      renderPhrases();
    });
  });

  els.phraseList.addEventListener("click", (event) => {
    const button = event.target.closest("[data-practice]");
    if (!button) return;
    const lesson = lessons.find((item) => item.id === button.dataset.practice);
    if (!lesson) return;
    els.languageSelect.value = lesson.language;
    els.levelSelect.value = lesson.level;
    els.scenarioSelect.value = lesson.scenario;
    state.lineIndex = activeLessons().findIndex((item) => item.id === lesson.id);
    renderLesson();
    document.querySelector("#practice").scrollIntoView({ behavior: "smooth" });
  });
}

function bindAuthEvents() {
  els.authForm.addEventListener("submit", handleAuthSubmit);
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
  renderLesson();
  renderDialogue();
  renderPhrases();
  renderStats();
}

function init() {
  setAuthMode("login");
  bindAuthEvents();
  registerServiceWorker();
  restoreSession();
}

init();
