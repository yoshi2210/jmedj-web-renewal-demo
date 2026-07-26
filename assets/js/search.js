/* 検索結果ページ v9 — 一致理由・診療領域・コンテンツ種別を分けて提示 */
(function () {
  var input = document.getElementById("searchPageInput");
  var resultsEl = document.getElementById("resultsState");
  if (!resultsEl) return;

  var loadingEl = document.getElementById("loadingState");
  var emptyEl = document.getElementById("emptyState");
  var countEl = document.getElementById("resultsCount");
  var titleEl = document.getElementById("resultsTitle");
  var scopesEl = document.getElementById("scopeFilters");
  var sortEl = document.getElementById("sortSelect");
  var clinicalWrap = document.getElementById("clinicalFilter");
  var clinicalEl = document.getElementById("clinicalAreaFilters");
  var POPULAR = ["糖尿病", "診療報酬改定", "感染症", "リウマチ", "呼吸器"];
  var ZONES = ["content", "books", "articles", "videos", "career"];
  var allItems = null;
  var state = {
    query: new URLSearchParams(location.search).get("q") || "",
    zone: "content",
    clinicalArea: "",
    sort: "relevance",
    force: null
  };
  if (input) input.value = state.query;

  function zoneOf(item) {
    if (item.zone === "books" || item.zone === "ebooks") return "books";
    if (item.zone === "jobs" || item.zone === "properties") return "career";
    return item.zone;
  }

  function rank(item, lower) {
    if (!lower) return { score: 1, reason: "全件表示" };
    var title = (item.title || "").toLowerCase();
    if (title.indexOf(lower) !== -1) return { score: 4, reason: "タイトルに一致" };
    var area = (item.clinicalArea || item.category || "").toLowerCase();
    if (area.indexOf(lower) !== -1) return { score: 3, reason: "診療領域に一致" };
    var topic = [item.topic, item.editorialFormat, item.series].filter(Boolean).join(" ").toLowerCase();
    if (topic.indexOf(lower) !== -1) return { score: 2, reason: "テーマ・連載に一致" };
    var rest = [item.author, item.meta, item.desc, (item.tags || []).join(" ")]
      .filter(Boolean).join(" ").toLowerCase();
    if (rest.indexOf(lower) !== -1) return { score: 1, reason: "著者・概要に一致" };
    return { score: 0, reason: "" };
  }

  function ranked(zone, ignoreClinical) {
    var lower = state.query.trim().toLowerCase();
    return allItems.map(function (item) {
      var result = rank(item, lower);
      return { item: item, score: result.score, reason: result.reason };
    }).filter(function (result) {
      if (!result.score) return false;
      if (zone === "content" && zoneOf(result.item) === "career") return false;
      if (zone !== "content" && zoneOf(result.item) !== zone) return false;
      return ignoreClinical || !state.clinicalArea ||
        (result.item.clinicalArea || result.item.category) === state.clinicalArea;
    }).sort(function (a, b) {
      if (state.sort === "new") {
        return (b.item.date || "").localeCompare(a.item.date || "");
      }
      return b.score - a.score || (b.item.date || "").localeCompare(a.item.date || "");
    });
  }

  function show(which) {
    loadingEl.style.display = which === "loading" ? "block" : "none";
    resultsEl.style.display = which === "results" ? "grid" : "none";
    emptyEl.style.display = which === "empty" ? "block" : "none";
  }

  function syncUrl() {
    var params = new URLSearchParams();
    if (state.query) params.set("q", state.query);
    var query = params.toString();
    history.replaceState(null, "", "search-results.html" + (query ? "?" + query : ""));
  }

  function renderClinicalFacets() {
    var options = ranked(state.zone, true)
      .map(function (r) { return r.item.clinicalArea || r.item.category; })
      .filter(Boolean);
    options = Array.from(new Set(options)).sort();
    clinicalEl.innerHTML = "";
    clinicalWrap.hidden = state.zone === "career" || !options.length;
    if (clinicalWrap.hidden) {
      state.clinicalArea = "";
      return;
    }
    var all = document.createElement("button");
    all.type = "button";
    all.className = "filter-chip" + (!state.clinicalArea ? " active" : "");
    all.dataset.area = "";
    all.textContent = "すべて";
    clinicalEl.appendChild(all);
    options.forEach(function (area) {
      var button = document.createElement("button");
      button.type = "button";
      button.className = "filter-chip" + (state.clinicalArea === area ? " active" : "");
      button.dataset.area = area;
      button.textContent = area;
      clinicalEl.appendChild(button);
    });
  }

  function resultCard(result) {
    var card = jmedjCard(result.item);
    card.classList.add("search-result");
    var reason = document.createElement("span");
    reason.className = "match-reason";
    reason.textContent = result.reason;
    var body = card.querySelector(".card-body");
    var chip = body.querySelector(".card-chip");
    chip.insertAdjacentElement("afterend", reason);
    return card;
  }

  function render() {
    titleEl.textContent = state.query ? "「" + state.query + "」の検索結果" : "横断検索";
    if (state.force === "loading" || allItems === null) {
      jmedjRenderSkeleton(resultsEl, 6);
      resultsEl.style.display = "grid";
      loadingEl.style.display = "block";
      emptyEl.style.display = "none";
      countEl.textContent = "";
      return;
    }

    ZONES.forEach(function (zone) {
      var count = scopesEl.querySelector('[data-zone="' + zone + '"] .count');
      if (count) count.textContent = ranked(zone, true).length;
    });
    renderClinicalFacets();
    var filtered = state.force === "empty" ? [] : ranked(state.zone, false);

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
    resultsEl.classList.add("grid-mixed");
    filtered.forEach(function (result) { resultsEl.appendChild(resultCard(result)); });
  }

  if (input) {
    var live = jmedjDebounce(function () {
      state.query = input.value.trim();
      state.clinicalArea = "";
      state.force = null;
      syncUrl();
      render();
    }, 200);
    input.addEventListener("input", live);
    input.closest("form").addEventListener("submit", function (event) {
      event.preventDefault();
      state.query = input.value.trim();
      state.clinicalArea = "";
      state.force = null;
      syncUrl();
      render();
    });
  }

  scopesEl.addEventListener("click", function (event) {
    var button = event.target.closest(".scope-btn");
    if (!button) return;
    scopesEl.querySelectorAll(".scope-btn").forEach(function (item) {
      item.classList.remove("active");
      item.setAttribute("aria-pressed", "false");
    });
    button.classList.add("active");
    button.setAttribute("aria-pressed", "true");
    state.zone = button.dataset.zone;
    state.clinicalArea = "";
    render();
  });

  clinicalEl.addEventListener("click", function (event) {
    var button = event.target.closest("[data-area]");
    if (!button) return;
    state.clinicalArea = button.dataset.area;
    render();
  });

  if (sortEl) {
    sortEl.addEventListener("change", function () {
      state.sort = sortEl.value;
      render();
    });
  }

  document.getElementById("emptyChips").addEventListener("click", function (event) {
    var chip = event.target.closest(".chip");
    if (!chip) return;
    state.query = chip.textContent;
    state.clinicalArea = "";
    state.force = null;
    if (input) input.value = state.query;
    syncUrl();
    render();
  });

  var demoBar = document.querySelector(".demo-toolbar");
  if (demoBar) {
    demoBar.addEventListener("click", function (event) {
      var button = event.target.closest("button[data-state]");
      if (!button) return;
      demoBar.querySelectorAll("button").forEach(function (item) {
        item.classList.remove("active");
        item.setAttribute("aria-pressed", "false");
      });
      button.classList.add("active");
      button.setAttribute("aria-pressed", "true");
      state.force = button.dataset.state === "results" ? null : button.dataset.state;
      render();
    });
  }

  var chipsBox = document.getElementById("emptyChips");
  POPULAR.forEach(function (keyword) {
    var chip = document.createElement("button");
    chip.type = "button";
    chip.className = "chip";
    chip.textContent = keyword;
    chipsBox.appendChild(chip);
  });

  render();
  jmedjLoadI18n(function () {
    document.getElementById("loadingText").textContent = jmedjT("search.loading");
    jmedjLoadContent(function (data) {
      /* 少数の最新キャッシュだけでは検索語の標本が不足するため、
         提案用カタログを追加する。ID重複は最新キャッシュを優先する。 */
      fetch("data/sample-content.json")
        .then(function (response) { return response.ok ? response.json() : null; })
        .catch(function () { return null; })
        .then(function (sample) {
          var combined = jmedjAllItems(data);
          var ids = new Set(combined.map(function (item) { return item.id; }));
          if (sample) {
            jmedjAllItems(sample).forEach(function (item) {
              if (!ids.has(item.id)) combined.push(item);
            });
          }
          allItems = combined;
          render();
        });
    });
  });
})();
