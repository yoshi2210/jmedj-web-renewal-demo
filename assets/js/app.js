/* jmedj 刷新モック v2 — 共通スクリプト
   ドロワー / メガメニュー / 検索サジェスト / カード生成 / i18n / データ取得 */

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

/* ---------- カード v2
   UI言語の統一(docs/11 原則4):
   - チップ(カテゴリ)= タップでそのゾーンの一覧へ(場所変化を明示)
   - タイトル = 詳細ページへの実リンク(a11y: JSクリックでなく<a>)
   - フッター = 価格 or 「詳しく見る →」 ---------- */

function jmedjHrefFor(item) {
  if (item.zone === "books" || item.zone === "ebooks") return "product.html?id=" + item.id;
  if (item.zone === "articles") return "article.html?id=" + item.id;
  if (item.zone === "videos") return "video.html?id=" + item.id;
  return "career.html" + (item.zone === "properties" ? "?tab=properties" : "");
}

function jmedjChipHrefFor(item) {
  if (item.zone === "books" || item.zone === "ebooks") return "shop-books.html";
  if (item.zone === "articles") return "articles.html";
  if (item.zone === "videos") return "videos.html";
  return "career.html" + (item.zone === "properties" ? "?tab=properties" : "");
}

function jmedjChipLabelFor(item) {
  return item.category || item.region || item.badge;
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

  var chip = document.createElement("a");
  chip.className = "card-chip";
  chip.href = jmedjChipHrefFor(item);
  chip.textContent = jmedjChipLabelFor(item);
  body.appendChild(chip);

  var h3 = document.createElement("h3");
  var titleLink = document.createElement("a");
  titleLink.href = jmedjHrefFor(item);
  titleLink.textContent = item.title;
  h3.appendChild(titleLink);
  body.appendChild(h3);

  var metaBits = [item.author, item.date].filter(Boolean);
  if (metaBits.length) {
    var meta = document.createElement("p");
    meta.className = "meta";
    meta.textContent = metaBits.join(" ・ ");
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
  cta.textContent = "詳しく見る →";
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

/* ---------- メガメニュー(デスクトップ) ---------- */

(function () {
  document.addEventListener("click", function (e) {
    var btn = e.target.closest(".zone-nav-btn");
    var openItems = document.querySelectorAll(".zone-nav-item.open");
    if (btn) {
      var item = btn.closest(".zone-nav-item");
      var wasOpen = item.classList.contains("open");
      openItems.forEach(function (el) {
        el.classList.remove("open");
        el.querySelector(".zone-nav-btn").setAttribute("aria-expanded", "false");
      });
      if (!wasOpen) {
        item.classList.add("open");
        btn.setAttribute("aria-expanded", "true");
      }
      return;
    }
    if (!e.target.closest(".mega-panel")) {
      openItems.forEach(function (el) {
        el.classList.remove("open");
        el.querySelector(".zone-nav-btn").setAttribute("aria-expanded", "false");
      });
    }
  });

  document.addEventListener("keydown", function (e) {
    if (e.key !== "Escape") return;
    document.querySelectorAll(".zone-nav-item.open").forEach(function (el) {
      el.classList.remove("open");
      el.querySelector(".zone-nav-btn").setAttribute("aria-expanded", "false");
    });
  });
})();

/* ---------- モバイルドロワー ---------- */

(function () {
  var toggle = document.getElementById("navToggle");
  var drawer = document.getElementById("mobileDrawer");
  if (!toggle || !drawer) return;

  function setOpen(open) {
    drawer.hidden = !open;
    toggle.setAttribute("aria-expanded", String(open));
    toggle.setAttribute("aria-label", open ? "メニューを閉じる" : "メニューを開く");
    document.body.classList.toggle("drawer-open", open);
  }

  toggle.addEventListener("click", function () {
    setOpen(drawer.hidden);
  });
  drawer.addEventListener("click", function (e) {
    if (e.target === drawer) setOpen(false); /* 背景タップで閉じる */
  });
  document.addEventListener("keydown", function (e) {
    if (e.key === "Escape" && !drawer.hidden) setOpen(false);
  });
})();

/* ---------- 検索サジェスト(全ページ共通ヘッダー)
   - 入力中: タイトル候補(ゾーン色ドット)+「◯◯でサイト内検索」
   - 空フォーカス: 最近の検索(localStorage, 最大5件)
   - キーボード: ↑↓で移動 / Enterで決定 / Escで閉じる ---------- */

(function () {
  var input = document.getElementById("globalSearchInput");
  var panel = document.getElementById("suggestPanel");
  if (!input || !panel) return;

  var RECENT_KEY = "jmedj_recent_searches";
  var activeIndex = -1;

  function getRecent() {
    try { return JSON.parse(localStorage.getItem(RECENT_KEY) || "[]"); }
    catch (e) { return []; }
  }
  function saveRecent(q) {
    if (!q) return;
    var list = getRecent().filter(function (x) { return x !== q; });
    list.unshift(q);
    try { localStorage.setItem(RECENT_KEY, JSON.stringify(list.slice(0, 5))); }
    catch (e) { /* private mode等では保存しない */ }
  }

  function close() {
    panel.hidden = true;
    panel.innerHTML = "";
    input.setAttribute("aria-expanded", "false");
    activeIndex = -1;
  }

  function addItem(opts) {
    var el = document.createElement("div");
    el.className = "suggest-item" + (opts.go ? " suggest-go" : "");
    el.setAttribute("role", "option");
    el.setAttribute("aria-selected", "false");
    if (opts.zone) el.setAttribute("data-zone", opts.zone);
    if (!opts.go) {
      var dot = document.createElement("span");
      dot.className = "dot";
      dot.setAttribute("aria-hidden", "true");
      el.appendChild(dot);
    }
    var span = document.createElement("span");
    span.className = "s-title";
    span.textContent = opts.label;
    el.appendChild(span);
    el.addEventListener("mousedown", function (e) {
      e.preventDefault(); /* blurより先に遷移を確定させる */
      opts.action();
    });
    panel.appendChild(el);
  }

  function goSearch(q) {
    saveRecent(q);
    location.href = "search-results.html?q=" + encodeURIComponent(q);
  }

  function renderRecent() {
    var recent = getRecent();
    if (!recent.length) { close(); return; }
    panel.innerHTML = "";
    var label = document.createElement("p");
    label.className = "suggest-label";
    label.textContent = "最近の検索";
    panel.appendChild(label);
    recent.forEach(function (q) {
      addItem({ label: q, action: function () { goSearch(q); } });
    });
    panel.hidden = false;
    input.setAttribute("aria-expanded", "true");
  }

  function renderSuggestions(q) {
    jmedjLoadContent(function (data) {
      var lower = q.toLowerCase();
      var hits = jmedjAllItems(data).filter(function (item) {
        return (item.title + " " + (item.category || "") + " " + (item.author || ""))
          .toLowerCase().indexOf(lower) !== -1;
      }).slice(0, 6);

      panel.innerHTML = "";
      hits.forEach(function (item) {
        addItem({
          label: item.title,
          zone: item.zone,
          action: function () { location.href = jmedjHrefFor(item); }
        });
      });
      addItem({
        label: "「" + q + "」でサイト内検索 →",
        go: true,
        action: function () { goSearch(q); }
      });
      panel.hidden = false;
      input.setAttribute("aria-expanded", "true");
      activeIndex = -1;
    });
  }

  var onInput = jmedjDebounce(function () {
    var q = input.value.trim();
    if (q) renderSuggestions(q); else renderRecent();
  }, 150);

  input.addEventListener("input", onInput);
  input.addEventListener("focus", function () {
    if (!input.value.trim()) renderRecent();
  });
  input.addEventListener("blur", function () {
    setTimeout(close, 120);
  });

  input.addEventListener("keydown", function (e) {
    var items = panel.querySelectorAll(".suggest-item");
    if (e.key === "Escape") { close(); return; }
    if (!items.length) return;
    if (e.key === "ArrowDown" || e.key === "ArrowUp") {
      e.preventDefault();
      activeIndex = e.key === "ArrowDown"
        ? (activeIndex + 1) % items.length
        : (activeIndex - 1 + items.length) % items.length;
      items.forEach(function (el, i) {
        el.setAttribute("aria-selected", String(i === activeIndex));
      });
    } else if (e.key === "Enter" && activeIndex >= 0) {
      e.preventDefault();
      items[activeIndex].dispatchEvent(new MouseEvent("mousedown"));
    }
  });

  /* フォーム送信(Enter)時も履歴に保存 */
  var form = input.closest("form");
  if (form) {
    form.addEventListener("submit", function () {
      saveRecent(input.value.trim());
    });
  }
})();
