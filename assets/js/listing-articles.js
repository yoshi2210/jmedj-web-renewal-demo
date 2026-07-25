/* 記事一覧 v7 — 診療領域・テーマ・記事形式を独立した分類軸として扱う */
(function () {
  var items = [];

  function selected(cls) {
    return Array.prototype.slice.call(document.querySelectorAll(cls + ":checked"))
      .map(function (el) { return el.value; });
  }

  function buildFacet(containerId, cls, values) {
    var el = document.getElementById(containerId);
    values.forEach(function (value) {
      var label = document.createElement("label");
      label.className = "facet-option";
      var input = document.createElement("input");
      input.type = "checkbox";
      input.className = cls;
      input.value = value;
      input.addEventListener("change", render);
      label.appendChild(input);
      label.appendChild(document.createTextNode(" " + value));
      el.appendChild(label);
    });
  }

  function matches(selectedValues, itemValue) {
    return selectedValues.length === 0 || selectedValues.indexOf(itemValue) !== -1;
  }

  function renderSelectedFilters() {
    var box = document.getElementById("activeFilters");
    box.innerHTML = "";
    document.querySelectorAll(".facet-panel input:checked").forEach(function (input) {
      var button = document.createElement("button");
      button.type = "button";
      button.className = "filter-chip";
      button.textContent = input.value + " ×";
      button.setAttribute("aria-label", input.value + "の絞り込みを解除");
      button.addEventListener("click", function () {
        input.checked = false;
        render();
      });
      box.appendChild(button);
    });
  }

  function render() {
    var areas = selected(".f-clinical-area");
    var topics = selected(".f-topic");
    var formats = selected(".f-editorial-format");
    var filtered = items.filter(function (item) {
      return matches(areas, item.clinicalArea) &&
        matches(topics, item.topic) &&
        matches(formats, item.editorialFormat);
    });

    document.getElementById("listingCount").textContent = filtered.length + "件の記事";
    var grid = document.getElementById("listingGrid");
    var empty = document.getElementById("listingEmpty");
    grid.style.display = filtered.length ? "grid" : "none";
    empty.style.display = filtered.length ? "none" : "block";
    grid.innerHTML = "";
    filtered.forEach(function (item) { grid.appendChild(jmedjCard(item)); });
    renderSelectedFilters();
  }

  document.getElementById("resetFacets").addEventListener("click", function () {
    document.querySelectorAll(".facet-panel input:checked").forEach(function (el) {
      el.checked = false;
    });
    render();
  });

  jmedjLoadContent(function (data) {
    items = data.articles;
    buildFacet("clinicalAreaFacets", "f-clinical-area",
      Array.from(new Set(items.map(function (item) { return item.clinicalArea; }))).sort());
    buildFacet("topicFacets", "f-topic",
      Array.from(new Set(items.map(function (item) { return item.topic; }))).sort());
    buildFacet("editorialFormatFacets", "f-editorial-format",
      Array.from(new Set(items.map(function (item) { return item.editorialFormat; }))).sort());
    render();
  });
})();
