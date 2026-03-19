# 📎 Clipper — Web to Obsidian

> Clip any web page, post, or thread into clean **Obsidian-ready Markdown** — with all comments, images, and metadata.

[![Firefox Add-on](https://img.shields.io/badge/Firefox-Add--on-FF7139?logo=firefox-browser&logoColor=white)](https://addons.mozilla.org/firefox/addon/clipper-to-obsidian/)
[![License: MIT](https://img.shields.io/badge/License-MIT-7c5cfc.svg)](LICENSE)
[![Made by Ahmed Musa](https://img.shields.io/badge/by-Ahmed%20Musa-a78bfa)](https://github.com/ahmdmusa/)

---

## ✨ Features

- **📘 Facebook** — post body + all comments & replies
- **🐦 Twitter / X** — tweets, threads, and replies  
- **🟠 Reddit** — posts and comment threads
- **📄 Any website** — articles and blog posts

**What gets saved:**
- Post text as Markdown blockquotes
- Hero image URL (og:image)
- All comments sorted by likes + length
- Engagement stats (likes, retweets, replies)
- Clean frontmatter with date, author, source URL, tags

**File output:**
```
2026-03-15_السلام_عليكم_سؤال.md
```

---

## 📥 Installation

**From Firefox Add-ons (recommended):**

👉 [Install from addons.mozilla.org](https://addons.mozilla.org/firefox/addon/clipper-to-obsidian/)

**Manual install (developer mode):**
1. Download `clipper-web-to-obsidian.zip` from [Releases](../../releases)
2. Open Firefox → `about:debugging#/runtime/this-firefox`
3. Click **Load Temporary Add-on**
4. Select the `.zip` file

---

## 🚀 How to Use

1. Open any Facebook post, tweet, or web article
2. Click the **📎 Clipper** icon in your toolbar
3. Toggle options (comments, images, engagement, thread)
4. Click **Clip**
5. File saves to your Downloads folder (or Obsidian Vault directly)

**To save directly into Obsidian:**
```
Firefox → Settings → General → Downloads
→ Browse → select your Obsidian Vault folder
```
Then leave the folder field in settings empty.

---

## ⚙️ Settings

| Setting | Description |
|---------|-------------|
| 🌙 / ☀️ Theme | Dark or Light mode |
| 🇸🇦 / 🇬🇧 Language | Arabic or English UI |
| 📁 Save Folder | Subfolder inside Downloads |

---

## 📄 Markdown Output Example

```markdown
---
title: "السلام عليكم سؤال في المعضلة الأزلية"
source: Facebook
author: Anonymous member
date: "15 March 2026"
clipped: "2026-03-15 14:30"
url: "https://facebook.com/..."
tags: [clip, facebook]
comments: 143
---

**Anonymous member** · 15 March 2026

> السلام عليكم سؤال في المعضلة الأزلية...

---

## 💬 التعليقات (143)

> **Anonymous member 336**  · 👍 12
> 40 - 45k
> Also make sure that you ask about the annual raise...

```

---

## 🔒 Privacy

- **No data collection** — everything stays on your device
- **No network requests** — the extension never contacts any server
- **No account required** — works out of the box

---

## 🗂️ File Structure

```
clipper-web-to-obsidian/
├── manifest.json    # Extension config
├── content.js       # Page content extractor
├── popup.html       # Extension UI
├── popup.js         # UI logic + Markdown builder
├── icon-*.png       # Icons (16, 32, 48, 96, 128px)
└── README.md
```

---

## 🤝 Contributing

Issues and PRs are welcome!

1. Fork the repo
2. Make your changes
3. Test in Firefox via `about:debugging`
4. Submit a PR

---

## 📬 Support

- **Bugs / Feature requests:** [Open an Issue](../../issues)
- **Email:** a-inbox+support@outlook.com

---

## 👨‍💻 Author

**Ahmed Musa** · [github.com/ahmdmusa](https://github.com/ahmdmusa/)

---

## 📜 License

MIT License — see [LICENSE](LICENSE) for details.
