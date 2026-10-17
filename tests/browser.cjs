const { chromium } = require('playwright');
const assert = require('node:assert/strict');
const fs = require('node:fs/promises');
const base = process.env.SPEAKLIFT_TEST_URL || 'http://127.0.0.1:4186';
const key = 'email:qa@speaklift.test';
const statsKey = `speaklift.stats.${key}`;

(async () => {
  await fs.mkdir('test-results', { recursive: true });
  const browser = await chromium.launch({ headless: true, channel: process.env.SPEAKLIFT_BROWSER || 'msedge' });
  try {
    const context = await browser.newContext({ viewport: { width: 1440, height: 1000 }, serviceWorkers: 'block', reducedMotion: 'reduce' });
    await context.addInitScript(({ key }) => {
      localStorage.setItem('speaklift.accounts', JSON.stringify({ [key]: { displayName: '测试学习者', method: 'email', identifier: 'qa@speaklift.test' } }));
      sessionStorage.setItem('speaklift.sessionUser', key);
      window.SpeechRecognition = class {
        start() { window.testRecognition = this; }
        abort() {} // Intentionally omit onend to reproduce stalled engines.
      };
      window.speechSynthesis.speak = () => {};
    }, { key });
    const page = await context.newPage();
    const errors = [];
    page.on('pageerror', error => errors.push(error.message));
    await page.goto(base);
    await page.locator('#vocabularyStage').waitFor({ state: 'visible' });
    assert.equal(await page.locator('[data-path="intro-en"]').isDisabled(), true);
    assert.equal(await page.locator('[data-vocab="0"] span').textContent(), '中文释义');
    await page.locator('[data-vocab="0"]').click();
    assert.equal(await page.locator('[data-vocab="0"] span').textContent(), '你好');
    await page.screenshot({ path: 'test-results/desktop-learn.png', fullPage: true });
    await page.locator('#learnContinueButton').click();
    assert.equal(await page.locator('#phraseStage').isVisible(), false);
    await page.locator('#dictationInput').fill('wrong answer');
    await page.locator('#checkDictationButton').click();
    assert.equal(await page.locator('#continuePanel').isVisible(), false);
    let stats = await page.evaluate(k => JSON.parse(localStorage.getItem(k)), statsKey);
    assert.equal(stats.reviewQueue.length, 1);
    await page.locator('#dictationInput').fill('Hello, nice to meet you.');
    await page.locator('#checkDictationButton').click();
    assert.equal(await page.locator('#continuePanel').isVisible(), true);
    stats = await page.evaluate(k => JSON.parse(localStorage.getItem(k)), statsKey);
    assert.equal(stats.learning.records['hello-en'].speak, false);
    await page.reload();
    await page.locator('#continuePanel').waitFor({ state: 'visible' });
    assert.equal(await page.locator('#lineTitle').textContent(), '打招呼');
    await page.locator('#continueButton').click();
    await page.locator('#recordButton').click();
    await page.waitForFunction(() => document.querySelector('#recordButtonLabel').textContent === '继续跟读', { timeout: 8000 });
    assert.equal(await page.locator('#recordButton').isDisabled(), false);
    await page.locator('#recordButton').click();
    await page.evaluate(() => window.testRecognition.onresult({ results: [[{ transcript: 'Hello, nice to meet you.' }]] }));
    await page.locator('#continuePanel').waitFor({ state: 'visible' });
    assert.equal(await page.locator('#lineTitle').textContent(), '打招呼');
    stats = await page.evaluate(k => JSON.parse(localStorage.getItem(k)), statsKey);
    assert.equal(stats.mastered.includes('hello-en'), true);
    assert.equal(stats.reviewQueue.length, 0);
    assert.equal(Object.values(stats.learning.daily)[0].length, 1);
    assert.equal(await page.locator('#pathCount').textContent(), '1 / 4');
    assert.equal(await page.locator('[data-path="hello-en"] small').textContent(), '已过关');
    await page.screenshot({ path: 'test-results/desktop-pass.png', fullPage: true });
    await page.reload();
    await page.locator('#continuePanel').waitFor({ state: 'visible' });
    await page.locator('#continueButton').click();
    assert.equal(await page.locator('#lineTitle').textContent(), '自我介绍');
    await page.locator('#nextLineButton').click();
    assert.equal(await page.locator('#lineTitle').textContent(), '天气寒暄');
    await page.locator('.topnav [data-view="review"]').click();
    await page.locator('#beginReviewButton').click();
    assert.equal(await page.locator('#lineTitle').textContent(), '自我介绍');
    await page.locator('#nextLineButton').click();
    assert.equal(await page.locator('#sessionComplete').isVisible(), true);
    assert.equal(await page.locator('#trainerCard').isVisible(), false);
    // Empty review must not silently load an unrelated TOEFL lesson.
    await page.evaluate(k => {
      const stats = JSON.parse(localStorage.getItem(k));
      stats.reviewQueue = [];
      for (const r of Object.values(stats.learning.records)) r.due = '2099-01-01';
      stats.learning.cursor = { mode: 'review', reviewIds: [], done: true };
      localStorage.setItem(k, JSON.stringify(stats));
    }, statsKey);
    await page.reload();
    await page.locator('#sessionComplete').waitFor({ state: 'visible' });
    assert.match(await page.locator('#sessionCompleteTitle').textContent(), /没有待复习/);
    // A phrase-library selection exits review mode.
    await page.locator('.topnav [data-view="phrases"]').click();
    assert.equal(await page.locator('.phrase-card').count(), 0);
    await page.screenshot({ path: 'test-results/desktop-library-collapsed.png', fullPage: true });
    await page.setViewportSize({ width: 390, height: 844 });
    await page.screenshot({ path: 'test-results/mobile-library-collapsed.png', fullPage: true });
    await page.setViewportSize({ width: 1440, height: 1000 });
    await page.locator('[data-filter="english"]').click();
    assert.equal(await page.locator('.phrase-card').count(), 0);
    await page.locator('#phraseSearch').fill('the');
    assert.equal(await page.locator('.phrase-card').count(), 3);
    const firstResult = await page.locator('.phrase-card strong').first().textContent();
    await page.locator('#phraseNext').click();
    assert.notEqual(await page.locator('.phrase-card strong').first().textContent(), firstResult);
    await page.locator('#phraseSearch').fill('');
    assert.equal(await page.locator('.phrase-card').count(), 0);
    assert.equal(await page.locator('#phrasePagination').isVisible(), false);
    await page.locator('#phraseSearch').fill('zzzz-no-match');
    assert.equal(await page.locator('#phraseStatus').textContent(), '没有找到匹配的句子');
    await page.locator('#phraseSearch').fill('weather');
    await page.locator('[data-practice="weather-en"]').click();
    assert.equal(await page.locator('#lineTitle').textContent(), '天气寒暄');
    await page.locator('#learnContinueButton').click();
    for (const width of [390, 320]) {
      await page.setViewportSize({ width, height: 844 });
      await page.reload();
      await page.locator('#dictationBox').waitFor({ state: 'visible' });
      assert.equal(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth), true);
      await page.screenshot({ path: `test-results/mobile-${width}-listen.png`, fullPage: true });
      await page.locator('.topnav [data-view="progress"]').click();
      assert.equal(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth), true);
      await page.screenshot({ path: `test-results/mobile-${width}-progress.png`, fullPage: true });
      await page.locator('.topnav [data-view="practice"]').click();
    }
    // Passing the first item must not skip the second when the queue shrinks.
    await page.evaluate(k => {
      const stats = JSON.parse(localStorage.getItem(k));
      stats.learning.records = Object.fromEntries(['hello-en', 'intro-en'].map(id => [id, { learn: true, listen: true, speak: false, deferred: true }]));
      stats.reviewQueue = [{ id: 'hello-en' }, { id: 'intro-en' }];
      stats.learning.cursor = { mode: 'review', reviewIds: ['hello-en', 'intro-en'], lessonId: 'hello-en', phase: 'speak' };
      localStorage.setItem(k, JSON.stringify(stats));
    }, statsKey);
    await page.reload();
    await page.locator('#recordButton').click();
    await page.evaluate(() => window.testRecognition.onresult({ results: [[{ transcript: 'Hello, nice to meet you.' }]] }));
    await page.locator('#continueButton').click();
    assert.equal(await page.locator('#lineTitle').textContent(), '自我介绍');
    await page.locator('#recordButton').click();
    await page.evaluate(() => { window.staleCallback = window.testRecognition.onresult; });
    await page.locator('.topnav [data-view="progress"]').click();
    const before = await page.evaluate(k => JSON.parse(localStorage.getItem(k)).attempts, statsKey);
    await page.evaluate(() => window.staleCallback({ results: [[{ transcript: 'My name is Yi. I am learning English.' }]] }));
    assert.equal(await page.evaluate(k => JSON.parse(localStorage.getItem(k)).attempts, statsKey), before);
    // Library practice is a single-lesson detour, preserving the course and draft across reloads.
    await page.evaluate(k => {
      const stats = JSON.parse(localStorage.getItem(k));
      stats.learning.records['intro-en'] = { learn: true, listen: false, speak: false };
      stats.learning.cursor = { mode: 'scene', language: 'english', level: 'starter', scenario: 'all', lessonId: 'intro-en', phase: 'listen', draft: 'My name is' };
      localStorage.setItem(k, JSON.stringify(stats));
    }, statsKey);
    await page.reload();
    assert.equal(await page.locator('#dictationInput').inputValue(), 'My name is');
    await page.locator('#dictationInput').fill('My name is Yi.');
    await page.reload();
    assert.equal(await page.locator('#dictationInput').inputValue(), 'My name is Yi.');
    const originalCursor = await page.evaluate(k => JSON.parse(localStorage.getItem(k)).learning.cursor, statsKey);
    await page.locator('.topnav [data-view="phrases"]').click();
    assert.equal(await page.locator('.phrase-card').count(), 0);
    await page.locator('#phraseSearch').fill('latte');
    await page.locator('[data-practice="coffee-en"]').click();
    assert.equal(await page.locator('#libraryPracticeBar').isVisible(), true);
    assert.equal(await page.locator('.coach-panel').isVisible(), false);
    assert.equal(await page.locator('#lineTitle').textContent(), '点咖啡');
    await page.setViewportSize({ width: 1440, height: 1000 });
    await page.screenshot({ path: 'test-results/desktop-library-practice.png', fullPage: true });
    await page.locator('#learnContinueButton').click();
    await page.locator('#dictationInput').fill('Could I have');
    await page.reload();
    assert.equal(await page.locator('#dictationInput').inputValue(), 'Could I have');
    for (const width of [390, 320]) {
      await page.setViewportSize({ width, height: 844 });
      assert.equal(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth), true);
      await page.screenshot({ path: `test-results/mobile-${width}-library-practice.png`, fullPage: true });
    }
    await page.locator('#returnToCourseButton').click();
    assert.equal(await page.locator('#lineTitle').textContent(), '自我介绍');
    assert.equal(await page.locator('#dictationInput').inputValue(), 'My name is Yi.');
    assert.equal(await page.locator('#libraryPracticeBar').isVisible(), false);
    assert.deepEqual(await page.evaluate(k => JSON.parse(localStorage.getItem(k)).learning.cursor, statsKey), originalCursor);
    await page.locator('.topnav [data-view="phrases"]').click();
    await page.locator('#phraseSearch').fill('latte');
    await page.locator('[data-practice="coffee-en"]').click();
    // Choosing another library item must not replace the original bookmark.
    await page.locator('.topnav [data-view="phrases"]').click();
    assert.equal(await page.locator('.phrase-card').count(), 0);
    await page.locator('#phraseSearch').fill('weather');
    await page.locator('[data-practice="weather-en"]').click();
    await page.locator('#nextLineButton').click();
    assert.equal(await page.locator('#lineTitle').textContent(), '自我介绍');
    assert.equal(await page.locator('#dictationInput').inputValue(), 'My name is Yi.');
    await page.locator('.topnav [data-view="phrases"]').click();
    await page.locator('#phraseSearch').fill('latte');
    await page.locator('[data-practice="coffee-en"]').click();
    await page.locator('#dictationInput').fill('Could I have a hot latte, please?');
    await page.locator('#checkDictationButton').click();
    await page.locator('#continueButton').click();
    await page.locator('#recordButton').click();
    await page.evaluate(() => window.testRecognition.onresult({ results: [[{ transcript: 'Could I have a hot latte, please?' }]] }));
    assert.equal(await page.locator('#continueText').textContent(), '本句已过，继续原来的课程。');
    await page.reload();
    await page.locator('#continueButton').click();
    assert.equal(await page.locator('#lineTitle').textContent(), '自我介绍');
    assert.equal(await page.locator('#dictationInput').inputValue(), 'My name is Yi.');
    assert.equal(await page.evaluate(k => JSON.parse(localStorage.getItem(k)).learning.records['coffee-en'].speak, statsKey), true);
    // A paused Continue gate in a review queue also survives a TOEFL library detour.
    await page.evaluate(k => {
      const stats = JSON.parse(localStorage.getItem(k));
      stats.learning.cursor = { mode: 'review', reviewIds: ['hello-en', 'intro-en'], lessonId: 'hello-en', phase: 'speak', gate: true };
      localStorage.setItem(k, JSON.stringify(stats));
    }, statsKey);
    await page.reload();
    await page.locator('.topnav [data-view="phrases"]').click();
    await page.locator('#phraseSearch').fill('analysis');
    await page.locator('[data-practice^="toefl-"]').first().click();
    assert.equal(await page.locator('#libraryPracticeBar').isVisible(), true);
    await page.reload();
    await page.locator('#returnToCourseButton').click();
    assert.equal(await page.locator('#lineTitle').textContent(), '打招呼');
    assert.equal(await page.locator('#continuePanel').isVisible(), true);
    await page.locator('#continueButton').click();
    assert.equal(await page.locator('#lineTitle').textContent(), '自我介绍');
    // The final TOEFL stage ends the course instead of cycling to day 21 stage 1.
    await page.evaluate(k => {
      const stats = JSON.parse(localStorage.getItem(k));
      stats.learning.records['toefl-21-2'] = { learn: true, listen: true, speak: true, due: '2099-01-01' };
      stats.learning.cursor = { mode: 'toefl', lessonId: 'toefl-21-2', phase: 'speak', gate: true };
      localStorage.setItem(k, JSON.stringify(stats));
    }, statsKey);
    await page.reload();
    await page.locator('#continueButton').click();
    assert.equal(await page.locator('#sessionComplete').isVisible(), true);
    assert.deepEqual(errors, []);
    console.log('PASS: vocabulary, hidden meanings, listen/speak separation, refresh gates, 6-second timeout, Continue, review queue, empty state, library return/drafts/refresh, 1440/390/320 layouts. Speech engine mocked; no real microphone verified.');
    await context.close();
  } finally { await browser.close(); }
})().catch(error => { console.error(error); process.exitCode = 1; });
