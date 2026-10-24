const { chromium } = require('playwright');
const assert = require('node:assert/strict');
const fs = require('node:fs/promises');
const base = process.env.SPEAKLIFT_TEST_URL || 'http://127.0.0.1:4186';
const key = 'email:speech@speaklift.test';
const statsKey = `speaklift.stats.${key}`;
const target = 'I will send you the update before five.';

(async () => {
  await fs.mkdir('test-results', { recursive: true });
  const browser = await chromium.launch({ headless: true, channel: process.env.SPEAKLIFT_BROWSER || 'msedge' });
  try {
    const context = await browser.newContext({ viewport: { width: 1440, height: 1000 }, serviceWorkers: 'block', reducedMotion: 'reduce' });
    await context.addInitScript(require('./capture-fixture.cjs'));
    await context.addInitScript(({ key }) => {
      localStorage.setItem('speaklift.accounts', JSON.stringify({ [key]: { displayName: '语音测试', method: 'email' } }));
      sessionStorage.setItem('speaklift.sessionUser', key);
      window.speechEngines = [];
      window.SpeechRecognition = class {
        start() { window.testRecognition = this; window.speechEngines.push(this); }
        stop() {
          this.stopped = true;
          if (window.finalTextOnStop) this.onresult?.({ results: [Object.assign([{ transcript: window.finalTextOnStop }], { isFinal: true })] });
          if (!window.hangEnd) this.onend?.();
        }
        abort() { this.aborted = true; }
      };
      window.speechSynthesis.speak = () => {};
    }, { key });
    const page = await context.newPage();
    const errors = [];
    page.on('pageerror', error => errors.push(error.message));
    await page.clock.install();
    await page.goto(base);
    async function resetLesson() {
      await page.evaluate(k => {
        localStorage.setItem(k, JSON.stringify({
          attempts: 0, mastered: [], reviewQueue: [], history: [],
          learning: { version: 1, records: { 'work-en': { learn: true, listen: true, speak: false } },
            cursor: { mode: 'scene', language: 'english', level: 'work', scenario: 'all', lessonId: 'work-en', phase: 'speak' } },
        }));
      }, statsKey);
      await page.reload();
      await page.locator('#recordButton').waitFor({ state: 'visible' });
    }
    const attempts = () => page.evaluate(k => JSON.parse(localStorage.getItem(k)).attempts, statsKey);
    await resetLesson();
    await page.locator('#recordButton').click();
    assert.equal(await page.locator('#listenButton').isDisabled(), true);
    await page.evaluate(() => window.testRecognition.onspeechstart());
    await page.clock.runFor(7000);
    assert.equal(await page.locator('#recordButtonLabel').textContent(), '结束跟读');
    await page.evaluate(() => window.testRecognition.onresult({ results: [[{ transcript: 'I will send you' }]] }));
    assert.equal(await attempts(), 0);
    await page.screenshot({ path: 'test-results/desktop-continuous-speech.png', fullPage: true });
    for (const width of [390, 320]) {
      await page.setViewportSize({ width, height: 844 });
      assert.equal(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth), true);
      await page.screenshot({ path: `test-results/mobile-${width}-continuous-speech.png`, fullPage: true });
    }
    await page.clock.runFor(3000);
    await page.evaluate(() => {
      window.testRecognition.onspeechend();
      window.testRecognition.onresult({ results: [[{ transcript: 'I will send you the update' }]] });
    });
    await page.clock.runFor(2000);
    assert.equal(await attempts(), 0);
    await page.evaluate(text => {
      window.testRecognition.onspeechstart();
      window.testRecognition.onresult({ results: [[{ transcript: 'I will send you the update before fine' }]] });
      window.finalTextOnStop = text;
      window.testRecognition.onspeechend();
    }, target);
    await page.clock.runFor(2500);
    assert.equal(await page.locator('#scoreValue').textContent(), '100%');
    assert.equal(await attempts(), 1);
    assert.equal(await page.locator('#continuePanel').isVisible(), true);
    assert.equal(await page.locator('#lineTitle').textContent(), '工作沟通');
    await page.locator('#continueButton').click();
    assert.notEqual(await page.locator('#lineTitle').textContent(), '工作沟通');

    // The engine may disconnect; the same click still collects the rest of the sentence.
    await resetLesson();
    await page.locator('#recordButton').click();
    await page.evaluate(() => {
      window.testRecognition.onresult({ results: [[{ transcript: 'I will send you' }]] });
      window.testRecognition.onend();
    });
    await page.clock.runFor(300);
    assert.equal(await page.evaluate(() => window.speechEngines.length), 2);
    await page.evaluate(() => window.testRecognition.onresult({ results: [[{ transcript: 'the update before five.' }]] }));
    await page.clock.runFor(2500);
    assert.equal(await page.locator('#scoreValue').textContent(), '100%');
    assert.equal(await attempts(), 1);

    // A complete final sentence ends immediately, even without speechend.
    await resetLesson();
    await page.locator('#recordButton').click();
    await page.evaluate(text => {
      window.testRecognition.onspeechstart();
      window.testRecognition.onresult({ results: [Object.assign([{ transcript: text }], { isFinal: true })] });
    }, target);
    assert.equal(await page.locator('#continuePanel').isVisible(), true);
    assert.equal(await attempts(), 1);

    // Recognition failure never interrupts recording or grades the attempt.
    await resetLesson();
    await page.locator('#recordButton').click();
    await page.clock.runFor(12000);
    assert.equal(await page.locator('#recordButtonLabel').textContent(), '结束跟读');
    await page.clock.runFor(18000);
    assert.equal(await page.locator('#recordButtonLabel').textContent(), '重新跟读');
    assert.equal(await attempts(), 0);
    await page.locator('#recordButton').click();
    await page.evaluate(() => window.testRecognition.onerror({ error: 'network' }));
    await page.clock.runFor(1000);
    await page.evaluate(() => window.testRecognition.onerror({ error: 'network' }));
    assert.match(await page.locator('#transcript').textContent(), /录音仍在继续/);
    assert.equal(await page.evaluate(() => window.testRecorder.state), 'recording');
    await page.locator('#recordButton').click();
    assert.equal(await page.locator('#recordingPlayback').isVisible(), true);
    assert.equal(await page.locator('#localRecordButton').count(), 0);
    assert.equal(await page.locator('#copyPracticeLink').count(), 0);
    assert.match(await page.locator('#transcript').textContent(), /本次未计分/);
    assert.equal(await page.evaluate(() => window.captureCount), 2);
    await page.evaluate(() => { window.denyCapture = true; });
    await page.locator('#recordButton').click();
    assert.match(await page.locator('#transcript').textContent(), /麦克风未获授权/);
    await page.evaluate(() => { window.denyCapture = false; });
    assert.equal(await attempts(), 0);

    // Returning to another view cancels capture and cannot submit a delayed result.
    await page.locator('#recordButton').click();
    await page.evaluate(() => { window.staleResult = window.testRecognition.onresult; });
    await page.locator('.topnav [data-view="phrases"]').click();
    await page.evaluate(text => window.staleResult({ results: [[{ transcript: text }]] }), target);
    await page.clock.runFor(60000);
    assert.equal(await attempts(), 0);
    assert.equal(await page.evaluate(() => window.testRecognition.aborted), true);

    // A hung engine is stopped at 30 seconds and scored once after the bounded flush.
    await resetLesson();
    await page.locator('#recordButton').click();
    await page.evaluate(text => {
      window.hangEnd = true;
      window.testRecognition.onspeechstart();
      window.testRecognition.onresult({ results: [[{ transcript: text }]] });
    }, target);
    await page.clock.runFor(30000);
    assert.equal(await page.evaluate(() => window.testRecognition.stopped), true);
    assert.equal(await page.locator('#recordButtonLabel').textContent(), '正在处理…');
    await page.clock.runFor(1500);
    assert.equal(await page.locator('#continuePanel').isVisible(), true);
    assert.equal(await attempts(), 1);
    assert.deepEqual(errors, []);
    console.log('PASS: one-click long speech, partial transcript, final flush, automatic scoring, reconnection, silence, 30-second cap, permission errors, cancellation, 1440/390/320 layouts. Microphone mocked.');
    await context.close();
  } finally { await browser.close(); }
})().catch(error => { console.error(error); process.exitCode = 1; });
