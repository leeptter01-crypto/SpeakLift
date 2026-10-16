# Learning Layout and Progress Research

Reviewed: 2026-10-16. Scope: the existing SpeakLift app, not a replica of another product.

The user's earlier task, "调研网站使用方法", concerned REA. This update follows that task's evidence-first approach: identify the actual product, examine specific features, record uncertainty, then implement and test independently. The existing SpeakLift JavaScript source is available, so binary reverse engineering is unnecessary. No claim is made that third-party server logic was recovered.

## Reference Evidence

| Source | What the official page documents | Adaptation in SpeakLift |
| --- | --- | --- |
| [Duolingo learning-path design](https://blog.duolingo.com/new-duolingo-home-screen-design/) | Small ordered units, practice woven into the path, revisiting completed lessons | A separate lesson path with current, completed, deferred, and locked states; functions such as the phrase library no longer count as lesson steps |
| [Busuu vocabulary review](https://help.busuu.com/hc/en-us/articles/16941990776593-How-can-I-review-my-vocabulary) | A dedicated review surface and different vocabulary review activities | Separate pending and scheduled review lists, independent from browsing new content |
| [Busuu spaced repetition](https://www.busuu.com/en/languages/spaced-repetition) | Revisiting learned material over spaced intervals | Explicit next-review dates after successful speaking practice |

These observations come from public official documentation, not an authenticated trial of paid features. The precise 1/3/7/14-day intervals are SpeakLift product rules, not a claim to reproduce either company's algorithm or an individually optimized memory model.

## Implemented Decisions

- Each sentence follows vocabulary -> listening dictation -> speaking. Each stage has its own screen state and persisted completion. Listening success cannot replace speaking success.
- Chinese glosses stay hidden until tapped. Listening initially hides the target sentence, with an explicit answer reveal.
- Recognition pauses after 6 seconds with no final result, even if the browser never sends its end event. Navigation discards stale recognition callbacks.
- A passed step waits for Continue. Refresh preserves this gate and does not jump ahead.
- Low scores or explicit deferrals join the review queue; they do not count as completions. Review runs use a snapshot so queue removals cannot skip entries.
- Daily targets count unique completed sentences, including review, not button clicks or invented practice minutes. Repeating one sentence on one day cannot inflate progress.
- The viewport has one primary exercise. Desktop uses a side path; mobile collapses course settings and path. White and neutral surfaces use restrained green, blue, warm yellow, and coral accents. Reduced-motion preferences are respected. No claim is made that a color alone guarantees motivation or retention.
- Existing account storage and old completion/history data are preserved. Legacy completion records are explicitly labeled, since the old app mixed dictation and speaking.

## Validation and Limits

Node tests cover prerequisites, the 95 threshold, daily deduplication, review dates, deferred unlocking, legacy migration, and local-date streak calculations. Browser checks cover the full lesson flow, refreshing both Continue gates, timeout without an end event, review/phrase-library transitions, completion states, and responsive layouts at 1440, 390, and 320 pixels. Speech events are simulated for repeatable integration tests; this does not validate a physical microphone or acoustic pronunciation quality.

The app remains a device-local PWA. Email/SMS delivery, real Google OAuth, and multi-device account synchronization are outside this layout/progression update and remain unimplemented.
