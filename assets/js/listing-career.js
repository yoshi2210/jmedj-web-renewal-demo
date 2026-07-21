/* 求人・物件一覧 v2 — ?tab=properties 対応、地域ファセット */
(function () {
  var data = null;
  var currentType = new URLSearchParams(location.search).get("tab") === "properties"
    ? "properties" : "jobs";

  function activeRegions() {
    return Array.prototype.slice.call(document.querySelectorAll(".f-region:checked"))
      .map(function (el) { return el.value; });
  }

  function buildRegionFacets(items) {
    var el = document.getElementById("regionFacets");
    el.innerHTML = "";
    Array.from(new Set(items.map(function (i) { return i.region; }))).sort()
      .forEach(function (region) {
        var label = document.createElement("label");
        label.className = "facet-option";
        var input = document.createElement("input");
        input.type = "checkbox";
        input.className = "f-region";
        input.value = region;
        input.checked = true;
        input.addEventListener("change", render);
        label.appendChild(input);
        label.appendChild(document.createTextNode(" " + region));
        el.appendChild(label);
      });
  }

  function syncTabs() {
    document.querySelectorAll("#careerTabs .tab-btn").forEach(function (b) {
      var active = b.getAttribute("data-type") === currentType;
      b.classList.toggle("active", active);
      b.setAttribute("aria-selected", String(active));
    });
  }

  function render() {
    var items = data[currentType];
    var regions = activeRegions();
    var filtered = items.filter(function (i) { return regions.indexOf(i.region) !== -1; });

    document.getElementById("listingCount").textContent =
      filtered.length + "件の" + (currentType === "jobs" ? "求人情報" : "物件情報");
    var grid = document.getElementById("listingGrid");
    var empty = document.getElementById("listingEmpty");
    grid.style.display = filtered.length ? "grid" : "none";
    empty.style.display = filtered.length ? "none" : "block";
    grid.innerHTML = "";
    filtered.forEach(function (item) { grid.appendChild(jmedjCard(item)); });
  }

  document.getElementById("careerTabs").addEventListener("click", function (e) {
    var btn = e.target.closest(".tab-btn");
    if (!btn) return;
    currentType = btn.getAttribute("data-type");
    history.replaceState(null, "",
      "career.html" + (currentType === "properties" ? "?tab=properties" : ""));
    syncTabs();
    buildRegionFacets(data[currentType]);
    render();
  });

  document.getElementById("resetFacets").addEventListener("click", function () {
    document.querySelectorAll(".f-region").forEach(function (el) { el.checked = true; });
    render();
  });

  jmedjLoadContent(function (d) {
    data = d;
    syncTabs();
    buildRegionFacets(data[currentType]);
    render();
  });
})();
