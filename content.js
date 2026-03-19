// ================================================
// Clipper — Web to Obsidian  |  content.js v10
// by Ahmed Musa · github.com/ahmdmusa/
// ================================================
(function () {
  if (window.__clipperReady) return;
  window.__clipperReady = true;

  const SITE = (() => {
    const h = location.hostname.replace("www.", "");
    if (h.includes("twitter.com") || h.includes("x.com")) return "twitter";
    if (h.includes("facebook.com")) return "facebook";
    if (h.includes("reddit.com"))   return "reddit";
    return "generic";
  })();

  const meta = n =>
    (document.querySelector(`meta[property="${n}"]`) ||
     document.querySelector(`meta[name="${n}"]`))?.content?.trim() || "";

  function parseLikes(s) {
    if (!s) return 0;
    const m = s.replace(/,/g,"").trim().match(/([\d.]+)\s*([KkMm]?)/);
    if (!m) return 0;
    return Math.round(parseFloat(m[1]) * ({k:1000,K:1000,m:1e6,M:1e6}[m[2]]||1));
  }

  function trivial(t) {
    if (!t?.trim()) return true;
    return (t.trim().match(/[\u0600-\u06FF\w]{2,}/g)||[]).length < 2;
  }

  const sleep = ms => new Promise(r => setTimeout(r, ms));

  // ── Best image for the post ─────────────────
  // Tries multiple sources in priority order
  function getHeroImage(root) {
    // 1. og:image / twitter:image meta (works on full pages)
    const ogImg = meta("og:image") || meta("twitter:image");
    if (ogImg) return ogImg;

    // 2. First large <img> inside the post root that isn't a tiny icon/avatar
    if (root) {
      const imgs = [...root.querySelectorAll("img")];
      for (const img of imgs) {
        const src = img.src || img.dataset?.src || img.dataset?.lazySrc || "";
        if (!src || src.startsWith("data:")) continue;
        // Skip tiny images (avatars, icons)
        const w = img.naturalWidth || img.width || img.getAttribute("width") || 0;
        const h = img.naturalHeight || img.height || img.getAttribute("height") || 0;
        if (w && h && (w < 100 || h < 100)) continue;
        // Skip profile pictures / avatars (common URL patterns)
        if (/profile|avatar|icon|emoji|sticker/i.test(src)) continue;
        return src;
      }
    }

    // 3. Any large img on the whole page
    const allImgs = [...document.querySelectorAll("img")]
      .filter(img => {
        const src = img.src || "";
        if (!src || src.startsWith("data:")) return false;
        if (/profile|avatar|icon|emoji|sticker/i.test(src)) return false;
        const w = img.naturalWidth || parseInt(img.getAttribute("width") || "0");
        const h = img.naturalHeight || parseInt(img.getAttribute("height") || "0");
        // prefer images wider than 200px
        return w > 200 || (!w && !h);
      })
      .sort((a, b) => {
        const wa = a.naturalWidth || 0, wb = b.naturalWidth || 0;
        return wb - wa;
      });
    return allImgs[0]?.src || "";
  }

  // ════════════════════════════════════════════
  // FACEBOOK — async: expand all, then extract
  // ════════════════════════════════════════════
  async function doFacebook(opts) {

    // ── Find root scope ──────────────────────
    let root = document.body;
    const dialogs = [...document.querySelectorAll('[role="dialog"]')]
      .filter(d => d.innerText.trim().length > 100);
    if (dialogs.length) root = dialogs[dialogs.length - 1];
    else root = document.querySelector('[role="main"]') || document.body;

    // ── Post body ────────────────────────────
    let body = "";
    for (const sel of [
      '[data-ad-comet-preview="message"]',
      '[data-ad-preview="message"]',
      'div[data-testid="post_message"]',
      'div[class*="userContent"]',
    ]) {
      const el = root.querySelector(sel);
      if (el?.innerText?.trim().length > 5) { body = el.innerText.trim(); break; }
    }
    if (!body) {
      const best = [...root.querySelectorAll('div[dir="auto"]')]
        .map(el => ({ el, len: el.innerText?.trim().length||0 }))
        .sort((a,b) => b.len - a.len)[0];
      body = best?.el.innerText?.trim() || "";
    }
    if (!body) return {
      error: "⚠️ لم يتم العثور على نص البوست.\nتأكد أن البوست ظاهر ثم اضغط Clip."
    };

    // ── EXPAND ALL COMMENTS ──────────────────
    if (opts.comments) {

      // Step 1: Switch to "All comments" sort
      try {
        const sortWords = ["most relevant","الأكثر صلة","newest","الأحدث","top comments","أهم التعليقات"];
        for (const btn of root.querySelectorAll('[role="button"]')) {
          const txt = btn.innerText?.trim().toLowerCase();
          if (sortWords.some(w => txt.startsWith(w))) {
            btn.click();
            await sleep(600);
            for (const item of document.querySelectorAll('[role="menuitem"],[role="option"],[role="radio"],[role="listitem"]')) {
              const t = item.innerText?.trim().toLowerCase();
              if (t.includes("all comment") || t.includes("كل التعليق") || t.includes("spam")) {
                item.click();
                await sleep(1500);
                break;
              }
            }
            break;
          }
        }
      } catch(_) {}

      // Step 2: Scroll down root to trigger lazy load
      const scrollTarget = root === document.body ? window : root;
      let lastCount = 0;
      for (let pass = 0; pass < 8; pass++) {
        if (scrollTarget === window) {
          window.scrollTo(0, document.body.scrollHeight);
        } else {
          root.scrollTop = root.scrollHeight;
        }
        await sleep(500);

        // Count current text blocks — stop if nothing new loaded
        const now = root.querySelectorAll('div[dir="auto"]').length;
        if (pass > 1 && now === lastCount) break;
        lastCount = now;
      }
      // Scroll back to top
      if (scrollTarget === window) window.scrollTo(0, 0);
      else root.scrollTop = 0;
      await sleep(300);

      // Step 3: Click all "View more comments" buttons repeatedly
      let tries = 0;
      while (tries < 20) {
        let clicked = false;
        for (const btn of root.querySelectorAll('[role="button"]')) {
          const txt = btn.innerText?.trim().toLowerCase();
          if (
            txt.includes("view more comment") ||
            txt.includes("عرض المزيد من التعليقات") ||
            txt.includes("المزيد من التعليقات") ||
            /^\d+\s*(more\s*)?(comments?|تعليقات?)/.test(txt)
          ) {
            btn.click();
            clicked = true;
            await sleep(700);
            break;
          }
        }
        if (!clicked) break;
        tries++;
      }

      // Step 4: Click ALL "View X replies" buttons (for every comment)
      let rTries = 0;
      while (rTries < 60) {
        let clicked = false;
        for (const btn of root.querySelectorAll('[role="button"]')) {
          const txt = btn.innerText?.trim().toLowerCase();
          if (
            (txt.includes("repl") || txt.includes("رد") || txt.includes("ردود")) &&
            (txt.includes("view") || txt.includes("more") || txt.includes("اعرض") || /^\d/.test(txt))
          ) {
            btn.click();
            clicked = true;
            await sleep(500);
            break;
          }
        }
        if (!clicked) break;
        rTries++;
      }

      await sleep(400);
    }

    // ── Author / date / image / likes ────────
    let author = "";
    for (const sel of ["h2 strong a","h3 strong a","strong > a","h2 a","h3 a"]) {
      const el = root.querySelector(sel);
      if (el?.innerText?.trim()) { author = el.innerText.trim(); break; }
    }
    if (!author) author = meta("og:title")?.split(/[-|]/)?.[0]?.trim() || "";

    let date = "";
    const abbrEl = root.querySelector('abbr[data-utime]') || document.querySelector('abbr[data-utime]');
    if (abbrEl) {
      date = abbrEl.title || "";
      if (!date) {
        const ut = abbrEl.getAttribute("data-utime");
        if (ut) date = new Date(parseInt(ut)*1000)
          .toLocaleDateString("en-GB",{year:"numeric",month:"long",day:"numeric"});
      }
    }

    const heroImg = opts.images ? getHeroImage(root) : "";

    let likes = "";
    if (opts.likes) {
      const el = root.querySelector('[aria-label*="reaction"],[aria-label*="Like"]');
      if (el) likes = el.innerText?.trim() || el.getAttribute("aria-label")?.match(/\d[\d,.]*/)?.[0] || "";
    }

    // ── COLLECT ALL COMMENTS ─────────────────
    // Sweep every dir=auto text block, skip post body + UI strings
    const comments = [];
    if (opts.comments) {
      const seen = new Set();
      const bodySnippet = body.substring(0, 40);
      seen.add(bodySnippet);

      const UI_SKIP = /^(like|reply|comment|share|send|see translation|follow|unfollow|ردّ|إعجاب|تعليق|مشاركة|ترجمة|متابعة|report|hide|more|المزيد)$/i;

      for (const textEl of root.querySelectorAll('div[dir="auto"],span[dir="auto"]')) {
        const txt = textEl.innerText?.trim();
        if (!txt || trivial(txt)) continue;
        if (txt.includes(bodySnippet)) continue;
        if (seen.has(txt)) continue;
        if (UI_SKIP.test(txt)) continue;
        if (/^\d+[hmdwys]$/.test(txt)) continue;   // "2h", "3d"…
        if (/^[\d,]+$/.test(txt)) continue;          // pure numbers
        if (txt.length > 3000) continue;             // too long = not a comment

        seen.add(txt);

        // Author: walk up DOM, find a link that looks like a name
        let cAuthor = "";
        let node = textEl.parentElement;
        for (let i = 0; i < 8 && node && node !== root; i++, node = node.parentElement) {
          for (const a of node.querySelectorAll('a')) {
            const t = a.innerText?.trim();
            if (t && t.length > 1 && t.length < 80
              && !t.includes("http")
              && !/^\d/.test(t)
              && t !== txt.substring(0, t.length)) {
              cAuthor = t;
              break;
            }
          }
          if (cAuthor) break;
        }

        // Likes: walk up DOM
        let cLikes = "";
        let ln = textEl.parentElement;
        for (let i = 0; i < 6 && ln && ln !== root; i++, ln = ln.parentElement) {
          const lEl = ln.querySelector('[aria-label*="reaction"],[aria-label*=" like"],[aria-label*="Like"]');
          if (lEl) {
            cLikes = lEl.innerText?.trim()
              || lEl.getAttribute("aria-label")?.match(/\d[\d,.]*/)?.[0] || "";
            break;
          }
        }

        // Depth via ancestor role=article count
        let depth = 0;
        let dp = textEl.parentElement;
        while (dp && dp !== root && depth < 4) {
          if (dp.getAttribute?.("role") === "article") depth++;
          dp = dp.parentElement;
        }

        comments.push({
          author: cAuthor || "Anonymous",
          text: txt,
          likes: cLikes,
          likesNum: parseLikes(cLikes),
          depth: Math.min(depth, 3),
        });
      }

      // Sort: highest likes×3 + longest text first
      comments.sort((a,b) => (b.likesNum*3+b.text.length) - (a.likesNum*3+a.text.length));
      comments.forEach(c => delete c.likesNum);
    }

    return {
      site:"facebook", icon:"📘", siteLabel:"Facebook",
      title: meta("og:title") || `${author} — ${body.substring(0,60)}`,
      author, handle:"", date,
      url:location.href, domain:"facebook.com",
      body, heroImg, likes,
      retweets:null,
      replyCnt:comments.length ? String(comments.length) : null,
      thread:[], comments,
    };
  }

  // ════════════════════════════════════════════
  // TWITTER / X
  // ════════════════════════════════════════════
  function doTwitter(opts) {
    const arts = [...document.querySelectorAll('article[data-testid="tweet"]')];
    if (!arts.length) return { error: "⚠️ افتح التغريدة في صفحتها المباشرة." };
    const main   = arts[0];
    const unEl   = main.querySelector('[data-testid="User-Name"]');
    const author = unEl?.querySelectorAll("span")[0]?.innerText?.trim() || "";
    const handle = "@"+(unEl?.querySelector("a")?.pathname?.replace("/","") || "");
    const date   = main.querySelector("time")?.title || "";
    const body   = main.querySelector('[data-testid="tweetText"]')?.innerText?.trim() || "";
    const heroImg = opts.images ? getHeroImage(null) : "";
    const stat = tid => main.querySelector(
      `[data-testid="${tid}"] span[data-testid="app-text-transition-container"]`
    )?.innerText?.trim() || "";

    const thread = [];
    if (opts.thread) {
      for (let i=1; i<arts.length; i++) {
        const h2 = arts[i].querySelector('[data-testid="User-Name"] a')?.pathname?.replace("/","") || "";
        if (h2 && "@"+h2 !== handle) break;
        const t = arts[i].querySelector('[data-testid="tweetText"]')?.innerText?.trim();
        if (t) thread.push({ author, handle, text:t });
      }
    }
    const rawReplies = [];
    if (opts.comments) {
      for (let i=1+thread.length; i<arts.length; i++) {
        const txt = arts[i].querySelector('[data-testid="tweetText"]')?.innerText?.trim();
        if (!txt || trivial(txt)) continue;
        const rN = arts[i].querySelector('[data-testid="User-Name"] span')?.innerText?.trim() || "";
        const rH = "@"+(arts[i].querySelector('[data-testid="User-Name"] a')?.pathname?.replace("/","") || "");
        const rL = arts[i].querySelector('[data-testid="like"] span[data-testid="app-text-transition-container"]')?.innerText?.trim() || "";
        rawReplies.push({ author:rN, handle:rH, text:txt, likes:rL, likesNum:parseLikes(rL), depth:0 });
      }
    }
    const comments = rawReplies
      .sort((a,b) => (b.likesNum*3+b.text.length)-(a.likesNum*3+a.text.length))
      .map(({likesNum,...r}) => r);

    return {
      site:"twitter", icon:"🐦", siteLabel:"Twitter / X",
      title:`${author} (${handle})`, author, handle, date,
      url:location.href, domain:location.hostname,
      body, heroImg,
      likes:    opts.likes ? stat("like")    : "",
      retweets: opts.likes ? stat("retweet") : "",
      replyCnt: opts.likes ? stat("reply")   : "",
      thread, comments,
    };
  }

  // ════════════════════════════════════════════
  // GENERIC
  // ════════════════════════════════════════════
  function doGeneric(opts) {
    const title  = meta("og:title") || document.querySelector("h1")?.innerText?.trim() || document.title;
    const author = meta("author") || document.querySelector('[rel="author"],.byline,[class*="author-name"]')?.innerText?.trim() || "";
    const date   = meta("article:published_time") || document.querySelector("time[datetime]")?.getAttribute("datetime") || "";
    const heroImg = opts.images ? getHeroImage(null) : "";
    function sc(el) {
      let s=0;
      const tag=el.tagName.toLowerCase(), cls=((el.className||"")+" "+(el.id||"")).toLowerCase();
      if(tag==="article")s+=30; if(tag==="main")s+=25;
      if(/article|content|post|entry|prose|story/.test(cls))s+=20;
      if(/sidebar|nav|footer|header|ad|comment|share|widget/.test(cls))s-=30;
      s+=Math.min(el.querySelectorAll("p").length*3,30);
      s+=Math.min((el.innerText||"").length/80,25);
      return s;
    }
    let node = document.querySelector("article")||document.querySelector("main");
    if (!node||(node.innerText||"").trim().length<150) {
      node=[...document.querySelectorAll("div,section,article,main")]
        .filter(el=>(el.innerText||"").trim().length>300)
        .sort((a,b)=>sc(b)-sc(a))[0]||document.body;
    }
    const SKIP=new Set(["script","style","noscript","nav","header","footer","aside","svg","button","form","iframe"]);
    function toMd(el){
      let out="";
      function w(n){
        if(!n)return;
        if(n.nodeType===3){out+=n.textContent;return;}
        const tag=n.tagName?.toLowerCase();
        if(!tag||SKIP.has(tag))return;
        switch(tag){
          case"h1":out+=`\n# ${n.innerText.trim()}\n\n`;return;
          case"h2":out+=`\n## ${n.innerText.trim()}\n\n`;return;
          case"h3":out+=`\n### ${n.innerText.trim()}\n\n`;return;
          case"p":{const t=n.innerText.trim();if(t)out+=t+"\n\n";return;}
          case"ul":n.querySelectorAll(":scope > li").forEach(li=>{out+=`- ${li.innerText.trim().replace(/\n+/g," ")}\n`});out+="\n";return;
          case"ol":let c=1;n.querySelectorAll(":scope > li").forEach(li=>{out+=`${c++}. ${li.innerText.trim().replace(/\n+/g," ")}\n`});out+="\n";return;
          case"blockquote":n.innerText.trim().split("\n").forEach(l=>{out+=`> ${l}\n`});out+="\n";return;
          case"pre":case"code":out+=`\`\`\`\n${n.innerText.trim()}\n\`\`\`\n\n`;return;
          case"a":{const h=n.href,t=n.innerText.trim();if(h&&t)out+=`[${t}](${h})`;else out+=t;return;}
          case"strong":case"b":out+=`**${n.innerText.trim()}**`;return;
          case"em":case"i":out+=`_${n.innerText.trim()}_`;return;
          default:n.childNodes.forEach(w);
        }
      }
      w(el);
      return out.replace(/\n{3,}/g,"\n\n").trim();
    }
    const clone=node.cloneNode(true);
    clone.querySelectorAll("script,style,noscript,nav,header,footer,aside,iframe,[class*='ad-'],[class*='sidebar'],[class*='comment'],[class*='share']").forEach(el=>el.remove());
    const body=toMd(clone);
    const comments=[];
    if(opts.comments){
      const seen=new Set();
      for(const sel of[".comment-body",".comment-content","[class*='comment-body']",".post-message"]){
        document.querySelectorAll(sel).forEach(el=>{
          const t=el.innerText?.trim();
          if(!t||trivial(t)||seen.has(t))return;
          seen.add(t);
          const par=el.closest('[class*="comment"],article');
          const who=par?.querySelector('[class*="author"],cite,.author')?.innerText?.trim()||"";
          comments.push({author:who,text:t,likes:"",depth:0});
        });
        if(comments.length)break;
      }
    }
    return {
      site:"generic",icon:"📄",siteLabel:location.hostname,
      title,author,handle:"",date,url:location.href,domain:location.hostname,
      body,heroImg,likes:null,retweets:null,replyCnt:null,thread:[],comments,
    };
  }

  // ════════════════════════════════════════════
  // MESSAGE LISTENER
  // ════════════════════════════════════════════
  browser.runtime.onMessage.addListener((msg, _s, send) => {
    if (msg.action === "ping") { send({ ok: true }); return; }
    if (msg.action !== "clip") return;
    const opts = msg.opts || {};
    try {
      if (SITE === "facebook") {
        doFacebook(opts).then(send).catch(e => send({ error: "خطأ: "+e.message }));
        return true; // keep channel open for async
      }
      const map = { twitter:doTwitter, generic:doGeneric };
      send((map[SITE]||doGeneric)(opts));
    } catch(e) {
      send({ error: "خطأ: "+e.message });
    }
  });

})();
