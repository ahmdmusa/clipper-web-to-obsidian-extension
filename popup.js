// ================================================
// Clipper — Web to Obsidian  |  popup.js v1.0
// by Ahmed Musa · github.com/ahmdmusa/
// ================================================

// ──────────────────────────────────────────────
// STATE
// ──────────────────────────────────────────────
const S = {
  lang:   "ar",
  theme:  "dark",
  folder: "Obsidian Clipper",
  opts:   { images: true, comments: true, likes: true, thread: false }
};

// ──────────────────────────────────────────────
// TRANSLATIONS
// ──────────────────────────────────────────────
const TR = {
  ar: {
    appSub:       "Web to Obsidian",
    siteLabel:    "الموقع:",
    unknown:      "غير معروف",
    optsLabel:    "خيارات الحفظ",
    oImg:         "صورة البوست",    oImgD:    "og:image",
    oCmt:         "التعليقات",      oCmtD:    "كل الردود",
    oLike:        "التفاعل",        oLikeD:   "likes / views",
    oThrd:        "الثريد",         oThrdD:   "كل الثريد",
    clipBtn:      "📎 Clip",
    loading:      "⏳ جاري الاستخراج...",
    back:         "→ رجوع",
    stitle:       "الإعدادات",
    themeL:       "المظهر",
    dark:         "داكن",
    light:        "فاتح",
    langL:        "اللغة",
    folderL:      "مجلد الحفظ",
    folderNote:   "📁 مسار داخل مجلد التحميلات في Firefox\n\nللحفظ في Obsidian مباشرةً:\nFirefox → Settings → Downloads\n← اختار مجلد Obsidian Vault",
    folderPH:     "Obsidian Clipper",
    folderSave:   "حفظ",
    folderOK:     "✓ تم الحفظ",
    aboutL:       "عن التطبيق",
    aboutDesc:    "احفظ أي صفحة ويب، بوست، أو تغريدة كملف Markdown جاهز لـ Obsidian — مع التعليقات والصور والـ metadata.",
    devRole:      "فكرة وتطوير",
    repoLink:     "الكود المصدري · الإبلاغ عن مشاكل",
    supportedSites:"المواقع المدعومة",
    ok:           "✅ تم الحفظ",
    errConn:      "❌ تعذر الاتصال.\n\nاضغط F5 لإعادة تحميل الصفحة ثم حاول مجدداً.",
    errTimeout:   "❌ استغرق الاستخراج وقتاً طويلاً — حاول مرة أخرى.",
    errGeneral:   "❌ خطأ:",
    // Markdown labels
    mdContent:    "المحتوى",
    mdThread:     "الثريد",
    mdComments:   "التعليقات",
    mdSource:     "المصدر",
    mdAuthor:     "الكاتب",
    mdPublished:  "النشر",
    mdClipped:    "الحفظ",
    mdAnon:       "مجهول",
    mdFooter:     "تم الحفظ بواسطة Clipper — Web to Obsidian",
    mdBy:         "فكرة وتطوير:",
    mdImg:        "صورة",
    mdMore:       "تغريدة إضافية",
  },
  en: {
    appSub:       "Web to Obsidian",
    siteLabel:    "Site:",
    unknown:      "Unknown",
    optsLabel:    "Clip Options",
    oImg:         "Post Image",     oImgD:    "og:image",
    oCmt:         "Comments",       oCmtD:    "all replies",
    oLike:        "Engagement",     oLikeD:   "likes / views",
    oThrd:        "Thread",         oThrdD:   "full thread",
    clipBtn:      "📎 Clip",
    loading:      "⏳ Extracting...",
    back:         "← Back",
    stitle:       "Settings",
    themeL:       "Theme",
    dark:         "Dark",
    light:        "Light",
    langL:        "Language",
    folderL:      "Save Folder",
    folderNote:   "📁 Path inside Firefox's Downloads folder\n\nTo save directly into Obsidian:\nFirefox → Settings → Downloads\n← Choose your Obsidian Vault folder",
    folderPH:     "Obsidian Clipper",
    folderSave:   "Save",
    folderOK:     "✓ Saved",
    aboutL:       "About",
    aboutDesc:    "Clip any web page, post, or thread into clean Obsidian-ready Markdown — with comments, images, and metadata.",
    devRole:      "Creator & Developer",
    repoLink:     "Source Code · Report Issues",
    supportedSites:"Supported Sites",
    ok:           "✅ Saved",
    errConn:      "❌ Could not connect.\n\nPress F5 to reload the page, then try again.",
    errTimeout:   "❌ Extraction timed out — please try again.",
    errGeneral:   "❌ Error:",
    mdContent:    "Content",
    mdThread:     "Thread",
    mdComments:   "Comments",
    mdSource:     "Source",
    mdAuthor:     "Author",
    mdPublished:  "Published",
    mdClipped:    "Clipped",
    mdAnon:       "Anonymous",
    mdFooter:     "Clipped by Clipper — Web to Obsidian",
    mdBy:         "by",
    mdImg:        "image",
    mdMore:       "more",
  }
};

const t = k => (TR[S.lang] || TR.ar)[k] || k;

// ──────────────────────────────────────────────
// STORAGE
// ──────────────────────────────────────────────
async function loadState() {
  try {
    const r = await browser.storage.local.get("clipper_v1");
    if (!r.clipper_v1) return;
    const d = r.clipper_v1;
    if (d.lang)              S.lang   = d.lang;
    if (d.theme)             S.theme  = d.theme;
    if (d.folder !== undefined) S.folder = d.folder;
    if (d.opts)              Object.assign(S.opts, d.opts);
  } catch(e) { console.warn(e); }
}

async function saveState() {
  try {
    await browser.storage.local.set({ clipper_v1: {
      lang: S.lang, theme: S.theme, folder: S.folder, opts: { ...S.opts }
    }});
  } catch(e) { console.warn(e); }
}

// ──────────────────────────────────────────────
// APPLY STATE → DOM
// ──────────────────────────────────────────────
function applyTheme() {
  document.documentElement.setAttribute("data-theme", S.theme);
}

function applyLang() {
  document.documentElement.lang = S.lang;
  document.documentElement.dir  = S.lang === "ar" ? "rtl" : "ltr";
}

function applyLabels() {
  const set = (id, key) => {
    const el = document.getElementById(id);
    if (el) el.textContent = t(key);
  };
  set("l-appSub",       "appSub");
  set("l-siteLabel",    "siteLabel");
  set("l-optsLabel",    "optsLabel");
  set("l-oImg",         "oImg");       set("l-oImgD",  "oImgD");
  set("l-oCmt",         "oCmt");       set("l-oCmtD",  "oCmtD");
  set("l-oLike",        "oLike");      set("l-oLikeD", "oLikeD");
  set("l-oThrd",        "oThrd");      set("l-oThrdD", "oThrdD");
  set("clipBtn",        "clipBtn");
  set("l-back",         "back");
  set("l-stitle",       "stitle");
  set("l-themeL",       "themeL");
  set("l-dark",         "dark");
  set("l-light",        "light");
  set("l-langL",        "langL");
  set("l-folderL",      "folderL");
  set("l-folderNote",   "folderNote");
  set("l-aboutL",       "aboutL");
  set("l-aboutDesc",    "aboutDesc");
  set("l-devRole",      "devRole");
  set("l-repoLink",     "repoLink");
  set("l-supportedSites","supportedSites");

  const fi = document.getElementById("folderInput");
  if (fi) fi.placeholder = t("folderPH");

  const fsb = document.getElementById("folderSaveBtn");
  if (fsb) fsb.textContent = t("folderSave");
}

function applyToggles() {
  const map = { tImg:"images", tCmt:"comments", tLike:"likes", tThrd:"thread" };
  for (const [id, key] of Object.entries(map)) {
    const el = document.getElementById(id);
    if (!el) continue;
    el.checked = S.opts[key];
    el.closest(".opt")?.classList.toggle("on", S.opts[key]);
  }
}

function applyPills() {
  document.querySelectorAll(".theme-pill").forEach(p =>
    p.classList.toggle("sel", p.dataset.v === S.theme));
  document.querySelectorAll(".lang-pill").forEach(p =>
    p.classList.toggle("sel", p.dataset.v === S.lang));
}

function applyFolder() {
  const fi = document.getElementById("folderInput");
  if (fi) fi.value = S.folder;
  updateFolderPreview(S.folder);
}

function updateFolderPreview(v) {
  const el = document.getElementById("folderPreview");
  if (!el) return;
  el.textContent = v
    ? `📂 [Downloads]/${v.replace(/\\/g,"/").replace(/\/$/,"")}/clip….md`
    : "📂 [Downloads]/clip….md";
}

function renderAll() {
  applyTheme();
  applyLang();
  applyLabels();
  applyToggles();
  applyPills();
  applyFolder();
}

// ──────────────────────────────────────────────
// PANELS
// ──────────────────────────────────────────────
const openSettings = () => document.getElementById("track").classList.add("at-settings");
const closeSettings= () => document.getElementById("track").classList.remove("at-settings");

// ──────────────────────────────────────────────
// STATUS
// ──────────────────────────────────────────────
function setStatus(msg, cls) {
  const el = document.getElementById("status");
  el.textContent = msg;
  el.className   = "status " + cls;
  el.style.display = "block";
}
function clearStatus() {
  document.getElementById("status").style.display = "none";
}

// ──────────────────────────────────────────────
// FILENAME — date + first line of post
// ──────────────────────────────────────────────
function makeFilename(data) {
  let dateStr = "";
  if (data.date) {
    try {
      const d = new Date(data.date);
      if (!isNaN(d.getTime())) dateStr = d.toISOString().split("T")[0];
    } catch(_) {}
  }
  if (!dateStr) dateStr = new Date().toISOString().split("T")[0];

  const firstLine = (data.body || data.title || "clip")
    .split("\n").map(l => l.trim()).find(l => l.length > 3) || "clip";

  const slug = firstLine
    .replace(/[<>:"/\\|?*#\[\]]/g, " ")
    .replace(/\s+/g, "_")
    .substring(0, 50)
    .replace(/[_\s]+$/, "");

  const name = `${dateStr}_${slug}.md`;
  if (S.folder) {
    const f = S.folder.trim().replace(/^\/|\/$/g,"").replace(/\\/g,"/");
    return `${f}/${name}`;
  }
  return name;
}

// ──────────────────────────────────────────────
// MARKDOWN BUILDER — content first, metadata last
// ──────────────────────────────────────────────
function buildMd(data) {
  const now     = new Date();
  const dateStr = now.toISOString().split("T")[0];
  const timeStr = now.toTimeString().substring(0, 5);

  // ── FRONTMATTER ────────────────────────────
  let md = "---\n";
  md += `title: "${(data.title||"").replace(/"/g,"'")}"\n`;
  md += `source: ${data.siteLabel || data.domain}\n`;
  if (data.author)         md += `author: "${data.author}"\n`;
  if (data.date)           md += `date: "${data.date}"\n`;
  md += `clipped: "${dateStr} ${timeStr}"\n`;
  md += `url: "${data.url}"\n`;
  md += `tags: [clip, ${data.site || "web"}]\n`;
  if (data.comments?.length) md += `comments: ${data.comments.length}\n`;
  md += "---\n\n";

  // ── AUTHOR LINE ────────────────────────────
  if (data.author) {
    md += `**${data.author}**`;
    if (data.handle) md += ` · \`${data.handle}\``;
    if (data.date)   md += ` · ${data.date}`;
    md += "\n\n";
  }

  // ── POST BODY ──────────────────────────────
  if (data.body) {
    const isSocial = ["twitter","facebook"].includes(data.site);
    if (isSocial) {
      data.body.split("\n").forEach(line => {
        md += line.trim() ? `> ${line}\n` : ">\n";
      });
      md += "\n";
    } else {
      md += data.body + "\n\n";
    }
  }

  // ── HERO IMAGE ─────────────────────────────
  if (S.opts.images && data.heroImg) {
    md += `\n![${data.title || t("mdImg")}](${data.heroImg})\n\n`;
  }

  // ── THREAD ────────────────────────────────
  if (S.opts.thread && data.thread?.length) {
    md += `\n---\n\n### 🧵 ${t("mdThread")} (${data.thread.length} ${t("mdMore")})\n\n`;
    data.thread.forEach((tw, i) => {
      md += `**${i + 2}.** ${tw.text}\n\n`;
    });
  }

  // ── ENGAGEMENT ────────────────────────────
  if (S.opts.likes) {
    const parts = [];
    if (data.likes    && data.likes    !== "—") parts.push(`❤️ ${data.likes}`);
    if (data.retweets && data.retweets !== "—") parts.push(`🔁 ${data.retweets}`);
    if (data.replyCnt && data.replyCnt !== "—") parts.push(`💬 ${data.replyCnt}`);
    if (parts.length) md += `\n${parts.join("  ·  ")}\n`;
  }

  // ── COMMENTS ──────────────────────────────
  if (S.opts.comments && data.comments?.length) {
    md += `\n---\n\n## 💬 ${t("mdComments")} (${data.comments.length})\n\n`;
    data.comments.forEach(c => {
      const who    = c.author || t("mdAnon");
      const indent = "  ".repeat(c.depth || 0);
      const likeStr = c.likes ? `  · 👍 ${c.likes}` : "";
      md += `${indent}> **${who}**${likeStr}\n`;
      c.text.split("\n").filter(l => l.trim()).forEach(line => {
        md += `${indent}> ${line}\n`;
      });
      md += `${indent}>\n\n`;
    });
  }

  // ── METADATA (bottom) ─────────────────────
  md += `\n---\n\n`;
  md += `| ${t("mdSource")} | [${data.siteLabel}](${data.url}) |\n`;
  md += `|---|---|\n`;
  if (data.author) md += `| ${t("mdAuthor")} | ${data.author}${data.handle ? " · " + data.handle : ""} |\n`;
  if (data.date)   md += `| ${t("mdPublished")} | ${data.date} |\n`;
  md += `| ${t("mdClipped")} | ${dateStr} ${timeStr} |\n`;
  md += `\n*${t("mdFooter")} · ${t("mdBy")} [Ahmed Musa](https://github.com/ahmdmusa/)*\n`;

  return md;
}

// ──────────────────────────────────────────────
// DOWNLOAD
// ──────────────────────────────────────────────
function downloadMd(content, filename) {
  return new Promise((res, rej) => {
    const blob = new Blob([content], { type: "text/markdown;charset=utf-8" });
    const url  = URL.createObjectURL(blob);
    browser.downloads.download({ url, filename, saveAs: false })
      .then(() => { setTimeout(() => URL.revokeObjectURL(url), 8000); res(filename); })
      .catch(rej);
  });
}

// ──────────────────────────────────────────────
// SITE LABEL
// ──────────────────────────────────────────────
function getSiteLabel(url) {
  try {
    const h = new URL(url).hostname.replace("www.", "");
    if (h.includes("twitter.com") || h.includes("x.com")) return "Twitter / X 🐦";
    if (h.includes("facebook.com"))    return "Facebook 📘";
    if (h.includes("reddit.com"))      return "Reddit 🟠";
    if (h.includes("youtube.com"))     return "YouTube 📺";
    if (h.includes("ycombinator.com")) return "Hacker News 🟧";
    return h + " 📄";
  } catch { return "—"; }
}

// ──────────────────────────────────────────────
// INIT
// ──────────────────────────────────────────────
document.addEventListener("DOMContentLoaded", async () => {
  await loadState();
  renderAll();

  // Site name indicator
  try {
    const [tab] = await browser.tabs.query({ active: true, currentWindow: true });
    document.getElementById("siteName").textContent = getSiteLabel(tab.url);
  } catch {
    document.getElementById("siteName").textContent = t("unknown");
  }

  // ── Toggles ──
  const toggleMap = { tImg:"images", tCmt:"comments", tLike:"likes", tThrd:"thread" };
  for (const [id, key] of Object.entries(toggleMap)) {
    document.getElementById(id)?.addEventListener("change", e => {
      S.opts[key] = e.target.checked;
      e.target.closest(".opt")?.classList.toggle("on", e.target.checked);
      saveState();
    });
  }

  // ── Settings nav ──
  document.getElementById("openSettings")?.addEventListener("click", openSettings);
  document.getElementById("backBtn")?.addEventListener("click", closeSettings);

  // ── Theme pills ──
  document.querySelectorAll(".theme-pill").forEach(p => p.addEventListener("click", () => {
    S.theme = p.dataset.v;
    applyTheme();
    applyPills();
    saveState();
  }));

  // ── Language pills ──
  document.querySelectorAll(".lang-pill").forEach(p => p.addEventListener("click", () => {
    S.lang = p.dataset.v;
    applyLang();
    applyLabels();
    applyPills();
    saveState();
  }));

  // ── Folder ──
  document.getElementById("folderInput")?.addEventListener("input", e => {
    updateFolderPreview(e.target.value);
  });

  function doSaveFolder() {
    S.folder = document.getElementById("folderInput")?.value.trim() || "Obsidian Clipper";
    saveState();
    applyFolder();
    const ok = document.getElementById("folderOK");
    if (ok) {
      ok.textContent  = t("folderOK");
      ok.style.opacity = "1";
      setTimeout(() => { ok.style.opacity = "0"; }, 2000);
    }
  }
  document.getElementById("folderSaveBtn")?.addEventListener("click", doSaveFolder);
  document.getElementById("folderInput")?.addEventListener("keydown", e => {
    if (e.key === "Enter") doSaveFolder();
  });

  // ── CLIP button ──
  document.getElementById("clipBtn")?.addEventListener("click", async () => {
    const btn = document.getElementById("clipBtn");
    btn.disabled = true;
    btn.textContent = t("loading");
    clearStatus();
    document.getElementById("preview").style.display = "none";

    try {
      const [tab] = await browser.tabs.query({ active: true, currentWindow: true });
      const url   = tab.url || "";

      if (!url || url.startsWith("about:") || url.startsWith("moz-extension:")) {
        setStatus("❌ " + (S.lang === "ar" ? "هذه الصفحة غير مدعومة." : "This page is not supported."), "err");
        return;
      }

      const isFB = url.includes("facebook.com");

      async function sendClip() {
        return browser.tabs.sendMessage(tab.id, { action: "clip", opts: S.opts });
      }

      let data;
      try {
        data = await Promise.race([
          sendClip(),
          new Promise((_, rej) => setTimeout(() => rej(new Error("timeout")), isFB ? 25000 : 6000))
        ]);
      } catch (e1) {
        const isConn = /receiving end|Could not establish|connection/i.test(e1.message || "");
        if (isConn) {
          try { await browser.tabs.executeScript(tab.id, { file: "content.js", runAt: "document_idle" }); } catch(_) {}
          await new Promise(r => setTimeout(r, 400));
          try {
            data = await Promise.race([
              sendClip(),
              new Promise((_, rej) => setTimeout(() => rej(new Error("timeout")), isFB ? 25000 : 6000))
            ]);
          } catch (e2) {
            setStatus(t("errConn"), "err");
            return;
          }
        } else {
          setStatus((e1.message||"").includes("timeout") ? t("errTimeout") : t("errGeneral") + " " + e1.message, "err");
          return;
        }
      }

      if (!data)      { setStatus("❌ No response from page.", "err"); return; }
      if (data.error) { setStatus(data.error, "err"); return; }

      const markdown = buildMd(data);
      const filename = makeFilename(data);
      await downloadMd(markdown, filename);

      setStatus(`${t("ok")}\n${filename}`, "ok");

      const pre = document.getElementById("preview");
      pre.textContent = [
        `📄 ${filename}`,
        `💬 ${data.comments?.length || 0} ${S.lang === "ar" ? "تعليق" : "comments"}`,
        data.thread?.length ? `🧵 ${data.thread.length}` : null,
      ].filter(Boolean).join("\n");
      pre.style.display = "block";

    } catch(e) {
      setStatus("❌ " + (e?.message || "Unknown error"), "err");
    } finally {
      btn.disabled = false;
      btn.textContent = t("clipBtn");
    }
  });
});
