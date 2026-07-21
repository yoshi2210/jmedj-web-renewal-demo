(function () {
  var items = [];

  function activeSeries() {
    return Array.prototype.slice.call(document.querySelectorAll(".f-series:checked")).map(function (el) { return el.value; });
  }
  function activeCategories() {
    return Array.prototype.slice.call(document.querySelectorAll(".f-category:checked")).map(function (el) { return el.value; });
  }

  function buildFacets() {
    var seriesList = Array.from(new Set(items.map(function (i) { return i.series; }))).sort();
    var seriesEl = document.getElementById("seriesFacets");
    seriesList.forEach(function (s) {
      var label = document.createElement("label");
      label.className = "facet-option";
      var input = document.createElement("input");
      input.type = "checkbox";
      input.className = "f-series";
      input.value = s;
      input.checked = true;
      input.addEventListener("change", render);
      label.appendChild(input);
      label.appendChild(document.createTextNode(" " + s));
      seriesEl.appendChild(label);
    });

    var cats = Array.from(new Set(items.map(function (i) { return i.category; }))).sort();
    var catEl = document.getElementById("categoryFacets");
    cats.forEach(function (cat) {
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
      catEl.appendChild(label);
    });
  }

  function render() {
    var series = activeSeries();
    var cats = activeCategories();
    var filtered = items.filter(function (i) {
      return series.indexOf(i.series) !== -1 && cats.indexOf(i.category) !== -1;
    });

    document.getElementById("listingCount").textContent = filtered.length + "件の記事";
    var grid = document.getElementById("listingGrid");
    var empty = document.getElementById("listingEmpty");
    grid.style.display = filtered.length ? "grid" : "none";
    empty.style.display = filtered.length ? "none" : "block";
    grid.innerHTML = "";
    filtered.forEach(function (item) {
      var card = jmedjCard(item);
      card.style.cursor = "pointer";
      card.addEventListener("click", function () { location.href = "article.html?id=" + item.id; });
      grid.appendChild(card);
    });
  }

  document.getElementById("resetFacets").addEventListener("click", function () {
    document.querySelectorAll(".f-series, .f-category").forEach(function (el) { el.checked = true; });
    render();
  });

  jmedjLoadContent(function (data) {
    items = data.articles;
    buildFacets();
    render();
  });
})();
