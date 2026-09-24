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
- Game-like level flow: one learning page at a time, with a "continue" gate after passing a speaking or dictation task
- Speech recognition pauses after a short no-speech timeout, so the learner can tap again to continue
- Calmer green-blue visual system with coral completion feedback and lightweight level animations
- Listen-and-repeat practice with browser speech synthesis
- Slow listening, 3-repeat loop listening, and dictation-assisted listening practice
- Speech recognition feedback when the browser supports it
- Cantonese Jyutping prompts
- Original TOEFL-style 21-day curriculum connecting vocabulary, auxiliary words, phrases, grammar, written expression, and full sentences
- English written expression under each speaking prompt, with Chinese meanings hidden until the learner taps the English sentence, word, or phrase
- 95% read-aloud match threshold before a TOEFL stage is treated as passed
- Review queue that accumulates any line below 95% for one-time consolidation later
- Role-play dialogue drills
- Searchable phrase library
- Local progress tracking by account
- PWA install support for mobile and desktop browsers
- Windows desktop app launcher

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
