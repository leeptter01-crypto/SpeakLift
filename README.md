# SpeakLift

SpeakLift is a bilingual speaking-practice app for English and Cantonese beginners.

## Current App

- Product files: `D:\SpeakLift`
- Web entry: `dist/index.html`
- Published site: `https://speaklift-yi-20260923.johnleebob.chatgpt.site`
- Account mode: local username and password, independent from ChatGPT login
- Practice data: stored per account on the current device
- Password storage: salted hash in browser storage; use a backend before handling real multi-device user accounts

## Features

- English, Cantonese, and mixed practice modes
- Listen-and-repeat practice with browser speech synthesis
- Speech recognition feedback when the browser supports it
- Cantonese Jyutping prompts
- Role-play dialogue drills
- Searchable phrase library
- Local progress tracking by account
- PWA install support for mobile and desktop browsers
- Windows desktop app launcher

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
