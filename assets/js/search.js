(function () {
  var params = new URLSearchParams(location.search);
  var query = params.get("q") || "糖尿病";
  document.getElementById("searchInput").value = query;
  document.getElementById("resultsTitle").textContent = '「' + query + '」の検索結果';

  document.getElementById("searchForm").addEventListener("submit", function (e) {
    e.preventDefault();
    var q = document.getElementById("searchInput").value;
    location.href = "search-results.html?q=" + encodeURIComponent(q);
  });

  var allItems = [];
  var currentZone = "all";
  var currentState = "results";

  function zoneToDisplay(item) {
    if (item.zone === "books" || item.zone === "ebooks") return "books";
    if (item.zone === "jobs" || item.zone === "properties") return "career";
    return item.zone;
  }

  function matchesQuery(item, q) {
    if (!q) return true;
    var hay = (item.title + " " + item.meta).toLowerCase();
    return hay.indexOf(q.toLowerCase()) !== -1 || q.length <= 2;
  }

  function render() {
    var loadingEl = document.getElementById("loadingState");
    var resultsEl = document.getElementById("resultsState");
    var emptyEl = document.getElementById("emptyState");
    var countEl = document.getElementById("resultsCount");

    loadingEl.style.display = currentState === "loading" ? "block" : "none";
    resultsEl.style.display = currentState === "results" ? "grid" : "none";
    emptyEl.style.display = currentState === "empty" ? "block" : "none";

    if (currentState !== "results") {
      countEl.textContent = "";
      return;
    }

    var filtered = allItems.filter(function (item) {
      var zoneOk = currentZone === "all" || zoneToDisplay(item) === currentZone;
      return zoneOk && matchesQuery(item, query);
    });

    countEl.textContent = filtered.length === 1
      ? jmedjT("search.resultsFoundOne")
      : filtered.length + jmedjT("search.resultsFound");
    resultsEl.innerHTML = "";
    filtered.forEach(function (item) {
      var card = jmedjCard(item);
      var href = null;
      if (item.zone === "books" || item.zone === "ebooks") href = "product.html?id=" + item.id;
      else if (item.zone === "articles") href = "article.html?id=" + item.id;
      else if (item.zone === "jobs" || item.zone === "properties") href = "career.html";
      if (href) {
        card.style.cursor = "pointer";
        card.addEventListener("click", function () { location.href = href; });
      }
      resultsEl.appendChild(card);
    });
  }

  document.getElementById("tabs").addEventListener("click", function (e) {
    var btn = e.target.closest(".tab-btn");
    if (!btn) return;
    document.querySelectorAll(".tab-btn").forEach(function (b) {
      b.classList.remove("active");
      b.setAttribute("aria-selected", "false");
    });
    btn.classList.add("active");
    btn.setAttribute("aria-selected", "true");
    currentZone = btn.getAttribute("data-zone");
    render();
  });

  document.querySelector(".demo-toolbar").addEventListener("click", function (e) {
    var btn = e.target.closest("button[data-state]");
    if (!btn) return;
    document.querySelectorAll(".demo-toolbar button").forEach(function (b) {
      b.classList.remove("active");
      b.setAttribute("aria-pressed", "false");
    });
    btn.classList.add("active");
    btn.setAttribute("aria-pressed", "true");
    currentState = btn.getAttribute("data-state");
    render();
  });

  jmedjLoadI18n(function () {
    document.getElementById("loadingText").textContent = jmedjT("search.loading");
    document.getElementById("emptyTitle").textContent = jmedjT("search.noResultTitle", { query: query });
    document.getElementById("emptyHint").textContent = jmedjT("search.noResultHint");
    document.querySelector('[data-zone="all"]').textContent = jmedjT("tabs.all");
    document.querySelector('[data-zone="books"]').textContent = jmedjT("tabs.books");
    document.querySelector('[data-zone="articles"]').textContent = jmedjT("tabs.articles");
    document.querySelector('[data-zone="videos"]').textContent = jmedjT("tabs.videos");
    document.querySelector('[data-zone="career"]').textContent = jmedjT("tabs.career");
  });

  jmedjLoadContent(function (data) {
    allItems = [].concat(data.books, data.ebooks, data.articles, data.videos, data.jobs, data.properties);
    render();
  });
})();
