# SpeakLift

SpeakLift is a bilingual speaking-practice app for English and Cantonese beginners.

## Current App

- Product files: `D:\SpeakLift`
- Web entry: `dist/index.html`
- Published site: `https://speaklift-yi-20260923.johnleebob.chatgpt.site`
- Account mode: email, phone, or common social account identifier plus password; independent from ChatGPT login
- Practice data: stored per account on the current device
- Password storage: salted hash in browser storage; use a backend before handling real multi-device user accounts or real third-party OAuth

## Features

- English, Cantonese, and mixed practice modes
- Email, phone, WeChat, QQ, Weibo, Douyin, Xiaohongshu, Google, Apple, Facebook, X, and LinkedIn style account identifiers
- Listen-and-repeat practice with browser speech synthesis
- Speech recognition feedback when the browser supports it
- Cantonese Jyutping prompts
- Original TOEFL-style 21-day curriculum connecting vocabulary, phrases, grammar, and full sentences
- 95% read-aloud match threshold before a TOEFL stage is treated as passed
- Review queue that accumulates any line below 95% for one-time consolidation later
- Role-play dialogue drills
- Searchable phrase library
- Local progress tracking by account
- PWA install support for mobile and desktop browsers
- Windows desktop app launcher

## TOEFL Content Note

The built-in TOEFL plan is an original practice framework inspired by common academic-speaking needs. It does not copy proprietary entries, examples, or excerpts from 《TOEFL核心词汇21天突破修订李笑来》. If you have licensed excerpts, they can be imported later as a private content pack.

## Run As Desktop App On Windows

Double-click:

```text
D:\SpeakLift\SpeakLift-Desktop.cmd
```

The launcher starts a local server and opens SpeakLift in an app-style browser window.

## GitHub Sync

Once a GitHub repository URL is available, run:

```powershell
powershell -ExecutionPolicy Bypass -File D:\SpeakLift\scripts\Sync-GitHub.ps1 -GitHubRepoUrl "https://github.com/<owner>/<repo>.git"
```

If the repository is private or requires authentication, sign in through Git credential manager or use the GitHub plugin.
