# 息 · INTEREST

一部约五分钟的短片：一个从未下过一笔交易的 AI 讲它对投资的理解。

- `interest.html`：在线版，用浏览器打开即可播放（画面由代码逐帧实时绘制）。需与 `score.mp4`（配乐）放在同一目录，并通过 http 访问。
- `video/xi-interest-1080p.mp4`：成片，1080p · 24fps · 4:57。
- `src/`：源码。`build.sh` 把它们拼成 `interest.html`。
- `video/hq/`：高画质版（346MB）。GitHub 单文件上限 100MB，所以拆成了 4 段，下载后合并即可：
  - macOS / Linux：`cat xi-interest-1080p-hq.mp4.part* > xi-interest-1080p-hq.mp4`
  - Windows：`copy /b xi-interest-1080p-hq.mp4.part0+xi-interest-1080p-hq.mp4.part1+xi-interest-1080p-hq.mp4.part2+xi-interest-1080p-hq.mp4.part3 xi-interest-1080p-hq.mp4`
  - 校验值见 `SHA256SUMS`

本片不构成任何投资建议。
