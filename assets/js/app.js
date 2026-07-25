/* jmedj 刷新モック v7 — 共通スクリプト
   ドロワー / カード生成 / i18n / データ取得 */

/* ---------- ユーティリティ ---------- */

function jmedjDebounce(fn, ms) {
  var t = null;
  return function () {
    var args = arguments, self = this;
    clearTimeout(t);
    t = setTimeout(function () { fn.apply(self, args); }, ms);
  };
}

/* ---------- データ取得(キャッシュつき) ---------- */

var _jmedjContent = null;
var _jmedjContentWaiters = [];

function jmedjLoadContent(onReady) {
  if (_jmedjContent) { onReady(_jmedjContent); return; }
  _jmedjContentWaiters.push(onReady);
  if (_jmedjContentWaiters.length > 1) return;
  fetch("data/sample-content.json")
    .then(function (res) { return res.json(); })
    .then(function (data) {
      _jmedjContent = data;
      _jmedjContentWaiters.forEach(function (cb) { cb(data); });
      _jmedjContentWaiters = [];
    })
    .catch(function (err) {
      console.error("sample-content.json の読み込みに失敗しました", err);
    });
}

function jmedjAllItems(data) {
  return [].concat(data.books, data.ebooks, data.articles, data.videos, data.jobs, data.properties);
}

/* ---------- i18n(未翻訳キーは [[key]] で可視化、英語へ逃がさない) ---------- */

var _jmedjI18n = null;

function jmedjLoadI18n(onReady) {
  if (_jmedjI18n) { onReady(_jmedjI18n); return; }
  fetch("data/i18n.ja.json")
    .then(function (res) { return res.json(); })
    .then(function (data) { _jmedjI18n = data; onReady(data); })
    .catch(function (err) { console.error("i18n.ja.json の読み込みに失敗しました", err); });
}

function jmedjT(key, vars) {
  var dict = _jmedjI18n || {};
  var template = dict[key];
  if (template === undefined) return "[[" + key + "]]";
  if (!vars) return template;
  return template.replace(/\{(\w+)\}/g, function (_, name) {
    return Object.prototype.hasOwnProperty.call(vars, name) ? vars[name] : "{" + name + "}";
  });
}

/* ---------- カード
   種別ラベルはメタデータとして静的表示し、操作要素に見せない。 ---------- */

function jmedjHrefFor(item) {
  if (item.zone === "books" || item.zone === "ebooks") return "product.html?id=" + item.id;
  if (item.zone === "articles") return "article.html?id=" + item.id;
  if (item.zone === "videos") return "video.html?id=" + item.id;
  return "career.html" + (item.zone === "properties" ? "?tab=properties" : "");
}

function jmedjChipLabelFor(item) {
  return item.contentType || item.badge || (item.zone === "jobs" ? "求人" : "物件");
}

function jmedjCtaFor(item) {
  if (item.zone === "jobs") return "募集を見る →";
  if (item.zone === "properties") return "物件を見る →";
  if (item.zone === "videos") return "動画を見る →";
  if (item.zone === "articles") return "記事を読む →";
  return "詳細を見る →";
}

function jmedjDateLabelFor(item) {
  if (!item.date) return "";
  if (item.zone === "books" || item.zone === "ebooks") return "刊行";
  if (item.zone === "videos") return "公開";
  return "掲載";
}

function jmedjCardMetaFor(item) {
  var bits = [];
  if (item.clinicalArea) bits.push(item.clinicalArea);
  if (item.zone === "articles" && item.editorialFormat) bits.push(item.editorialFormat);
  if (item.zone === "videos" && item.topic) bits.push(item.topic);
  if ((item.zone === "jobs" || item.zone === "properties") && item.employment) bits.push(item.employment);
  if ((item.zone === "jobs" || item.zone === "properties") && item.region) bits.push(item.region);
  if (item.author) bits.push(item.author);
  return bits;
}

function jmedjCoverKind(item) {
  if (item.zone === "books" || item.zone === "ebooks") return "book";
  if (item.zone === "articles") return "article";
  if (item.zone === "videos") return "video";
  return "geo";
}

/* 生成カバー(実表紙は複製せず、メタ情報から決定論的に描く装飾ビジュアル)
   docs/12_visual_discovery_and_benchmark.md の方針。
   a11y: 装飾リンクとして aria-hidden + tabindex=-1(見出しリンク/CTAが唯一の到達経路) */
function jmedjCover(item) {
  function mk(tag, cls, text) {
    var e = document.createElement(tag);
    if (cls) e.className = cls;
    if (text != null) e.textContent = text;
    return e;
  }

  var kind = jmedjCoverKind(item);
  var cover = document.createElement("a");
  cover.className = "cover cover-" + kind;
  cover.setAttribute("data-zone", item.zone);
  cover.href = jmedjHrefFor(item);
  cover.setAttribute("aria-hidden", "true");
  cover.tabIndex = -1;

  if (kind === "book") {
    cover.appendChild(mk("span", "cover-spine"));
    cover.appendChild(mk("span", "cover-label", item.format === "電子" ? "電子版" : "日本医事新報社"));
    cover.appendChild(mk("span", "cover-title", item.title));
    if (item.author) cover.appendChild(mk("span", "cover-author", item.author));
  } else if (kind === "article") {
    cover.appendChild(mk("span", "cover-series", item.series || "記事"));
    cover.appendChild(mk("span", "cover-cat", item.category || ""));
  } else if (kind === "video") {
    if (item.category) cover.appendChild(mk("span", "cover-vlabel", item.category));
    cover.appendChild(mk("span", "cover-play"));
    cover.appendChild(mk("span", "cover-dur", item.duration || "—:—"));
  } else {
    cover.appendChild(mk("span", "cover-pin"));
    cover.appendChild(mk("span", "cover-region", item.region || ""));
    cover.appendChild(mk("span", "cover-kind", item.zone === "jobs" ? "求人" : "物件"));
  }
  return cover;
}

function jmedjCard(item) {
  var el = document.createElement("article");
  el.className = "card";
  el.setAttribute("data-zone", item.zone);

  el.appendChild(jmedjCover(item));

  var body = document.createElement("div");
  body.className = "card-body";

  var chip = document.createElement("span");
  chip.className = "card-chip";
  chip.textContent = jmedjChipLabelFor(item);
  body.appendChild(chip);

  var h3 = document.createElement("h3");
  var titleLink = document.createElement("a");
  titleLink.href = jmedjHrefFor(item);
  titleLink.textContent = item.title;
  h3.appendChild(titleLink);
  body.appendChild(h3);

  var metaBits = jmedjCardMetaFor(item);
  if (metaBits.length || item.date) {
    var meta = document.createElement("p");
    meta.className = "meta";
    if (metaBits.length) meta.appendChild(document.createTextNode(metaBits.join(" ・ ")));
    if (item.date) {
      var date = document.createElement("time");
      date.dateTime = item.date;
      date.textContent = jmedjDateLabelFor(item) + " " + item.date.replace(/-/g, "/");
      if (metaBits.length) meta.appendChild(document.createTextNode("　"));
      meta.appendChild(date);
    }
    body.appendChild(meta);
  }

  var foot = document.createElement("div");
  foot.className = "card-foot";
  if (typeof item.price === "number") {
    var price = document.createElement("span");
    price.className = "card-price";
    price.textContent = "¥" + item.price.toLocaleString();
    var tax = document.createElement("small");
    tax.textContent = "(税込)";
    price.appendChild(tax);
    foot.appendChild(price);
  } else {
    foot.appendChild(document.createElement("span"));
  }
  var cta = document.createElement("a");
  cta.className = "card-cta";
  cta.href = jmedjHrefFor(item);
  cta.textContent = jmedjCtaFor(item);
  foot.appendChild(cta);
  body.appendChild(foot);

  el.appendChild(body);
  return el;
}

function jmedjRenderGrid(containerId, items, limit) {
  var el = document.getElementById(containerId);
  if (!el) return;
  el.innerHTML = "";
  items.slice(0, limit || items.length).forEach(function (item) {
    el.appendChild(jmedjCard(item));
  });
}

function jmedjRenderSkeleton(container, count) {
  container.innerHTML = "";
  for (var i = 0; i < count; i++) {
    var sk = document.createElement("div");
    sk.className = "skeleton-card";
    sk.setAttribute("aria-hidden", "true");
    ["w40", "w90", "w70"].forEach(function (w) {
      var line = document.createElement("span");
      line.className = "sk-line " + w;
      sk.appendChild(line);
    });
    container.appendChild(sk);
  }
}

/* ---------- モバイルドロワー ---------- */

(function () {
  var toggle = document.getElementById("navToggle");
  var drawer = document.getElementById("mobileDrawer");
  if (!toggle || !drawer) return;

  var lastFocused = null;
  drawer.setAttribute("role", "dialog");
  drawer.setAttribute("aria-modal", "true");
  drawer.setAttribute("aria-label", "サイトメニュー");
  var close = document.createElement("button");
  close.type = "button";
  close.className = "drawer-close";
  close.setAttribute("aria-label", "メニューを閉じる");
  close.textContent = "閉じる";
  drawer.querySelector(".drawer-inner").insertBefore(close, drawer.querySelector(".drawer-inner").firstChild);

  function focusableItems() {
    return Array.prototype.slice.call(drawer.querySelectorAll('a[href], button:not([disabled]), summary'));
  }

  function setOpen(open) {
    if (open) lastFocused = document.activeElement;
    drawer.hidden = !open;
    toggle.setAttribute("aria-expanded", String(open));
    toggle.setAttribute("aria-label", open ? "メニューを閉じる" : "メニューを開く");
    document.body.classList.toggle("drawer-open", open);
    if (open) {
      window.setTimeout(function () { close.focus(); }, 0);
    } else if (lastFocused) {
      lastFocused.focus();
      lastFocused = null;
    }
  }

  toggle.addEventListener("click", function () {
    setOpen(drawer.hidden);
  });
  drawer.addEventListener("click", function (e) {
    if (e.target === drawer) setOpen(false); /* 背景タップで閉じる */
  });
  close.addEventListener("click", function () { setOpen(false); });
  document.addEventListener("keydown", function (e) {
    if (e.key === "Escape" && !drawer.hidden) setOpen(false);
    if (e.key !== "Tab" || drawer.hidden) return;
    var items = focusableItems();
    if (!items.length) return;
    var first = items[0], last = items[items.length - 1];
    if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
    else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
  });
})();
