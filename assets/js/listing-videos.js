/* 動画一覧 v2 — テーマファセット(v1で欠落していたゾーンの一覧を補完) */
(function () {
  var items = [];

  function checked() {
    return Array.prototype.slice.call(document.querySelectorAll(".f-category:checked"))
      .map(function (el) { return el.value; });
  }

  function buildFacets() {
    var el = document.getElementById("categoryFacets");
    Array.from(new Set(items.map(function (i) { return i.category; }))).sort()
      .forEach(function (cat) {
        var label = document.createElement("label");
        label.className = "facet-option";
        var input = document.createElement("input");
        input.type = "checkbox";
        input.className = "f-category";
        input.value = cat;
        input.checked = true;
        input.addEventListener("change", render);
        label.appendChild(input);
        label.appendChild(document.createTextNode(" " + cat));
        el.appendChild(label);
      });
  }

  function render() {
    var cats = checked();
    var filtered = items.filter(function (i) { return cats.indexOf(i.category) !== -1; });

    document.getElementById("listingCount").textContent = filtered.length + "件の動画";
    var grid = document.getElementById("listingGrid");
    var empty = document.getElementById("listingEmpty");
    grid.style.display = filtered.length ? "grid" : "none";
    empty.style.display = filtered.length ? "none" : "block";
    grid.innerHTML = "";
    filtered.forEach(function (item) { grid.appendChild(jmedjCard(item)); });
  }

  document.getElementById("resetFacets").addEventListener("click", function () {
    document.querySelectorAll(".f-category").forEach(function (el) { el.checked = true; });
    render();
  });

  jmedjLoadContent(function (data) {
    items = data.videos;
    buildFacets();
    render();
  });
})();
