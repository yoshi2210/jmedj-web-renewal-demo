/* 記事一覧 v2 — 連載区分・診療科ファセット */
(function () {
  var items = [];

  function checked(cls) {
    return Array.prototype.slice.call(document.querySelectorAll(cls + ":checked"))
      .map(function (el) { return el.value; });
  }

  function buildFacet(containerId, cls, values) {
    var el = document.getElementById(containerId);
    values.forEach(function (v) {
      var label = document.createElement("label");
      label.className = "facet-option";
      var input = document.createElement("input");
      input.type = "checkbox";
      input.className = cls;
      input.value = v;
      input.checked = true;
      input.addEventListener("change", render);
      label.appendChild(input);
      label.appendChild(document.createTextNode(" " + v));
      el.appendChild(label);
    });
  }

  function render() {
    var series = checked(".f-series");
    var cats = checked(".f-category");
    var filtered = items.filter(function (i) {
      return series.indexOf(i.series) !== -1 && cats.indexOf(i.category) !== -1;
    });

    document.getElementById("listingCount").textContent = filtered.length + "件の記事";
    var grid = document.getElementById("listingGrid");
    var empty = document.getElementById("listingEmpty");
    grid.style.display = filtered.length ? "grid" : "none";
    empty.style.display = filtered.length ? "none" : "block";
    grid.innerHTML = "";
    filtered.forEach(function (item) { grid.appendChild(jmedjCard(item)); });
  }

  document.getElementById("resetFacets").addEventListener("click", function () {
    document.querySelectorAll(".f-series, .f-category").forEach(function (el) { el.checked = true; });
    render();
  });

  jmedjLoadContent(function (data) {
    items = data.articles;
    buildFacet("seriesFacets", "f-series",
      Array.from(new Set(items.map(function (i) { return i.series; }))).sort());
    buildFacet("categoryFacets", "f-category",
      Array.from(new Set(items.map(function (i) { return i.category; }))).sort());
    render();
  });
})();
