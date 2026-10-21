# SpeakLift

SpeakLift is a bilingual speaking-practice app for English and Cantonese beginners.

## Current App

- Product files: `D:\SpeakLift`
- Web entry: `dist/index.html`
- Published site: `https://speaklift-yi-20260923.johnleebob.chatgpt.site`
- Account mode: email, phone, or Google account identifier plus password; independent from ChatGPT login
- Registration safety: new accounts must pass a 6-digit verification code step
- Practice data: stored per account on the current device
- Password storage: salted hash in browser storage; use a backend before handling real multi-device user accounts or real third-party OAuth

## Features

- English, Cantonese, and mixed practice modes
- Email, phone, and Google account identifiers
- Local 6-digit verification code check during registration
- Three-step lesson flow: vocabulary, listening dictation, then speaking; explicit Continue after each scored step
- One-click continuous speech recognition: stop on a confirmed complete sentence, after a 2.5-second pause, at a 30-second capture limit, or when the learner taps Finish; pause after 12 seconds with no speech
- Focused desktop lesson workspace and compact mobile steps, with a separate learning path and review screen
- Listen-and-repeat practice with browser speech synthesis
- Slow listening, 3-repeat loop listening, and dictation-assisted listening practice
- Speech recognition feedback when the browser supports it
- Cantonese Jyutping prompts
- Original TOEFL-style 21-day curriculum connecting vocabulary, auxiliary words, phrases, grammar, written expression, and full sentences
- English written expression under each speaking prompt, with Chinese meanings hidden until the learner taps the English sentence, word, or phrase
- 95% read-aloud match threshold before a TOEFL stage is treated as passed
- Review queue that accumulates lines below 95%, plus 1/3/7/14-day review intervals after successful later reviews
- Role-play dialogue drills
- Searchable phrase library
- Local progress tracking by account
- PWA install support for mobile and desktop browsers
- Windows desktop app launcher

## Progress Model (v8)

Listening and speaking have separate completion records. Dictation cannot complete a speaking lesson. Speaking requires the earlier vocabulary and listening steps, and a transcript match of at least 95%. The score compares recognized text; it is not acoustic pronunciation assessment. Browsers without speech recognition can defer a lesson, but typed text cannot stand in for a verified speaking result.

The app saves the current course, sentence, step, and Continue gate per local account. Deferred sentences remain pending and do not increase the completed count. Review sessions use a fixed list so removing a passed item cannot skip the next one. Empty reviews and finished courses show an explicit completion state instead of silently loading unrelated content.

Daily goals are 3, 5, or 8 distinct passed sentences. Repeating the same sentence on the same local calendar day does not increase the daily count or extend its review interval. Streaks include yesterday until today's practice is complete. Existing v7 completions and history are retained; legacy completions are labeled separately because v7 did not distinguish listening from speaking.

## Checks

```text
node --test tests/learning.test.mjs tests/speech.test.mjs
node --check dist/app.js
node tests/browser.cjs
node tests/speech-browser.cjs
```

The browser test requires Playwright and a local static server at `http://127.0.0.1:4186`; `SPEAKLIFT_TEST_URL` and `SPEAKLIFT_BROWSER` may override the URL and browser channel (default: msedge). It uses an isolated local test account and a mocked speech engine, including an engine that never emits `onend`. Screenshots are saved under ignored `test-results/`. Actual microphone capture and device-specific recognition still need a real-device check.

See `docs/learning-layout-research.md` for reference findings and implementation choices. Lucide 0.468.0 is vendored in `dist/icons.js`; its license is retained alongside it.

## Continuous Speech (v12)

`dist/speech.mjs` manages one bounded listening attempt across browser recognition connections. It replaces interim hypotheses with each cumulative result snapshot instead of appending duplicate text. Brief engine disconnects reconnect within the original deadline. A network failure before speech retries once; permission failures and mid-sentence network failures stop without a score. Navigating away, hiding the page, or logging out cancels capture and ignores delayed callbacks.

Automatic or manual completion calls `stop()` to request the final transcript, then allows at most 1.5 seconds for final delivery before cleaning up. Native speech-start/end events keep a sentence open while speech is active; browsers without these events use transcript inactivity as a fallback. A score is submitted once per attempt, and passing still requires the explicit Continue action. Empty recognition does not count as a failed lesson. Sample audio buttons are disabled during microphone capture.

The UI shows connecting until the recognition engine signals readiness. The observed live failure was a browser recognition service network error, not a disabled button. Retrying does not guarantee that this external service is reachable. On failure, the user can explicitly choose local recording/playback or copy the practice link. No additional cloud recognition provider is configured.

`dist/recording.mjs` uses MediaRecorder for playback only. Audio remains in page memory, is never uploaded, and cannot pass a lesson or change its score. Recording stops at 30 seconds; permission waiting and finalization are bounded at 15 seconds and 1.5 seconds. Leaving the lesson, switching tabs, or logging out cancels capture, stops tracks, and discards the audio. Late permission responses are discarded too.

Run `node --test tests/learning.test.mjs tests/speech.test.mjs tests/recording.test.mjs` for the 26 lifecycle/progression tests. Browser recovery flows were checked using mocked speech and recording devices in an isolated local test account at desktop, 390px, and 320px widths. These checks do not certify real microphone capture or third-party service availability.

API references: [Web Speech API](https://webaudio.github.io/web-speech-api/) and [MediaStream Recording](https://www.w3.org/TR/mediastream-recording/).

The implementation follows the [Web Speech API specification](https://webaudio.github.io/web-speech-api/) for continuous/interim results and stop-versus-abort behavior. Recognition accuracy and event timing remain browser/provider dependent; the automated tests use a mock and do not verify physical microphone capture.

## TOEFL Content Note

The built-in TOEFL plan is an original practice framework inspired by common academic-speaking needs. It does not copy proprietary entries, examples, or excerpts from 《TOEFL核心词汇21天突破修订李笑来》. If you have licensed excerpts, they can be imported later as a private content pack.

## Verification Code Note

The current static app demonstrates the verification flow locally: it generates a 6-digit code on the device and requires that code before registration succeeds. Real email/SMS delivery needs a backend and provider such as email OTP or SMS OTP before handling real users across devices.

## Run As Desktop App On Windows

Double-click:

```text
D:\SpeakLift\SpeakLift-Desktop.cmd
```

The launcher starts a local server and opens SpeakLift in an app-style browser window.

## GitHub Sync

Current GitHub repository:

```text
https://github.com/vlipnjohn7-coder/SpeakLift
```

To sync from this computer with normal Git credentials, run:

```powershell
powershell -ExecutionPolicy Bypass -File D:\SpeakLift\scripts\Sync-GitHub.ps1
```

If the repository is private or requires authentication, sign in through Git credential manager or use the GitHub plugin.
