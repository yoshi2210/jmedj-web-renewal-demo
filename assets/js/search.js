/* 検索結果ページ v2 — ライブ検索・件数つきタブ・スケルトン・空状態
   docs/11 原則1(検索ファースト)・原則5(状態デザイン)の実装 */

(function () {
  var input = document.getElementById("globalSearchInput");
  var resultsEl = document.getElementById("resultsState");
  if (!resultsEl) return;

  var loadingEl = document.getElementById("loadingState");
  var emptyEl = document.getElementById("emptyState");
  var countEl = document.getElementById("resultsCount");
  var titleEl = document.getElementById("resultsTitle");
  var tabsEl = document.getElementById("tabs");
  var sortEl = document.getElementById("sortSelect");

  var POPULAR = ["糖尿病", "診療報酬改定", "感染症", "リウマチ", "呼吸器"];
  var ZONES = ["all", "books", "articles", "videos", "career"];

  var allItems = null; /* null = 読み込み中 */
  var state = {
    query: new URLSearchParams(location.search).get("q") || "",
    zone: "all",
    sort: "relevance",
    force: null /* デモ用強制状態: "loading" | "empty" | null */
  };
  if (input) input.value = state.query;

  function zoneOf(item) {
    if (item.zone === "books" || item.zone === "ebooks") return "books";
    if (item.zone === "jobs" || item.zone === "properties") return "career";
    return item.zone;
  }

  function score(item, lower) {
    var title = item.title.toLowerCase();
    if (title.indexOf(lower) !== -1) return 2;
    var rest = ((item.category || "") + " " + (item.author || "") + " " + item.meta).toLowerCase();
    if (rest.indexOf(lower) !== -1) return 1;
    return 0;
  }

  function matches(zone) {
    var lower = state.query.trim().toLowerCase();
    return allItems
      .map(function (item) {
        return { item: item, s: lower ? score(item, lower) : 1 };
      })
      .filter(function (r) {
        if (r.s === 0) return false;
        return zone === "all" || zoneOf(r.item) === zone;
      })
      .sort(function (a, b) {
        if (state.sort === "new") return (b.item.date || "").localeCompare(a.item.date || "");
        return b.s - a.s;
      })
      .map(function (r) { return r.item; });
  }

  function show(which) {
    loadingEl.style.display = which === "loading" ? "block" : "none";
    resultsEl.style.display = which === "results" ? "grid" : "none";
    emptyEl.style.display = which === "empty" ? "block" : "none";
  }

  function syncUrl() {
    var qs = state.query ? "?q=" + encodeURIComponent(state.query) : "";
    history.replaceState(null, "", "search-results.html" + qs);
  }

  function render() {
    titleEl.textContent = state.query
      ? "「" + state.query + "」の検索結果"
      : "サイト内検索";

    if (state.force === "loading" || allItems === null) {
      jmedjRenderSkeleton(resultsEl, 8);
      resultsEl.style.display = "grid";
      loadingEl.style.display = "block";
      emptyEl.style.display = "none";
      countEl.textContent = "";
      return;
    }

    /* タブ件数は常にライブ計算 */
    ZONES.forEach(function (z) {
      var btn = tabsEl.querySelector('[data-zone="' + z + '"] .count');
      if (btn) btn.textContent = matches(z).length;
    });

    var filtered = state.force === "empty" ? [] : matches(state.zone);

    if (!filtered.length) {
      show("empty");
      countEl.textContent = "";
      document.getElementById("emptyTitle").textContent =
        jmedjT("search.noResultTitle", { query: state.query || "(未入力)" });
      document.getElementById("emptyHint").textContent = jmedjT("search.noResultHint");
      return;
    }

    show("results");
    countEl.textContent = filtered.length === 1
      ? jmedjT("search.resultsFoundOne")
      : filtered.length + jmedjT("search.resultsFound");
    resultsEl.innerHTML = "";
    filtered.forEach(function (item) {
      resultsEl.appendChild(jmedjCard(item));
    });
  }

  /* --- イベント --- */

  if (input) {
    var live = jmedjDebounce(function () {
      state.query = input.value.trim();
      state.force = null;
      syncUrl();
      render();
    }, 200);
    input.addEventListener("input", live);

    var form = input.closest("form");
    if (form) {
      form.addEventListener("submit", function (e) {
        e.preventDefault(); /* このページではライブ更新(遷移しない) */
        state.query = input.value.trim();
        state.force = null;
        syncUrl();
        render();
      });
    }
  }

  tabsEl.addEventListener("click", function (e) {
    var btn = e.target.closest(".tab-btn");
    if (!btn) return;
    tabsEl.querySelectorAll(".tab-btn").forEach(function (b) {
      b.classList.remove("active");
      b.setAttribute("aria-selected", "false");
    });
    btn.classList.add("active");
    btn.setAttribute("aria-selected", "true");
    state.zone = btn.getAttribute("data-zone");
    render();
  });

  if (sortEl) {
    sortEl.addEventListener("change", function () {
      state.sort = sortEl.value;
      render();
    });
  }

  /* 空状態からの再検索チップ */
  document.getElementById("emptyChips").addEventListener("click", function (e) {
    var chip = e.target.closest(".chip");
    if (!chip) return;
    state.query = chip.textContent;
    state.force = null;
    if (input) input.value = state.query;
    syncUrl();
    render();
  });

  /* デモ用: 状態の強制切り替え(ステークホルダー向け標本) */
  var demoBar = document.querySelector(".demo-toolbar");
  if (demoBar) {
    demoBar.addEventListener("click", function (e) {
      var btn = e.target.closest("button[data-state]");
      if (!btn) return;
      demoBar.querySelectorAll("button").forEach(function (b) {
        b.classList.remove("active");
        b.setAttribute("aria-pressed", "false");
      });
      btn.classList.add("active");
      btn.setAttribute("aria-pressed", "true");
      var s = btn.getAttribute("data-state");
      state.force = s === "results" ? null : s;
      render();
    });
  }

  /* --- 初期化: i18n → データ(それまでスケルトン) --- */

  var chipsBox = document.getElementById("emptyChips");
  POPULAR.forEach(function (kw) {
    var chip = document.createElement("button");
    chip.type = "button";
    chip.className = "chip";
    chip.textContent = kw;
    chipsBox.appendChild(chip);
  });

  render(); /* データ未着 → スケルトン表示 */

  jmedjLoadI18n(function () {
    document.getElementById("loadingText").textContent = jmedjT("search.loading");
    jmedjLoadContent(function (data) {
      allItems = jmedjAllItems(data);
      render();
    });
  });
})();
