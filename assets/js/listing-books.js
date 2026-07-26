/* 出版物一覧 v7 — 媒体と診療領域を独立して絞り込む */
(function () {
  var items = [];
  var params = new URLSearchParams(location.search);

  function selected(cls) {
    return Array.prototype.slice.call(document.querySelectorAll(cls + ":checked"))
      .map(function (el) { return el.value; });
  }

  function matches(selectedValues, itemValue) {
    return selectedValues.length === 0 || selectedValues.indexOf(itemValue) !== -1;
  }

  function buildClinicalAreaFacets() {
    var areas = Array.from(new Set(items.map(function (item) { return item.clinicalArea; }))).sort();
    var el = document.getElementById("clinicalAreaFacets");
    areas.forEach(function (area) {
      var label = document.createElement("label");
      label.className = "facet-option";
      var input = document.createElement("input");
      input.type = "checkbox";
      input.className = "f-clinical-area";
      input.value = area;
      input.addEventListener("change", render);
      label.appendChild(input);
      label.appendChild(document.createTextNode(" " + area));
      el.appendChild(label);
    });
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
    var formats = selected(".f-format");
    var areas = selected(".f-clinical-area");
    var sort = document.getElementById("sortSelect").value;
    var filtered = items.filter(function (item) {
      return matches(formats, item.format) && matches(areas, item.clinicalArea);
    });
    if (sort === "new") filtered.sort(function (a, b) { return b.date.localeCompare(a.date); });
    if (sort === "price-asc") filtered.sort(function (a, b) { return a.price - b.price; });
    if (sort === "price-desc") filtered.sort(function (a, b) { return b.price - a.price; });

    document.getElementById("listingCount").textContent = filtered.length + "件の出版物";
    var grid = document.getElementById("listingGrid");
    var empty = document.getElementById("listingEmpty");
    grid.style.display = filtered.length ? "grid" : "none";
    empty.style.display = filtered.length ? "none" : "block";
    grid.innerHTML = "";
    jmedjSetGridMode(grid, filtered);
    filtered.forEach(function (item) { grid.appendChild(jmedjCard(item)); });
    renderSelectedFilters();
  }

  document.querySelectorAll(".f-format").forEach(function (el) {
    el.addEventListener("change", render);
  });
  document.getElementById("sortSelect").addEventListener("change", render);
  document.getElementById("resetFacets").addEventListener("click", function () {
    document.querySelectorAll(".facet-panel input:checked").forEach(function (el) {
      el.checked = false;
    });
    render();
  });

  jmedjLoadContent(function (data) {
    items = data.books.concat(data.ebooks);
    buildClinicalAreaFacets();
    var format = params.get("format");
    if (format) {
      document.querySelectorAll(".f-format").forEach(function (el) {
        el.checked = el.value === format;
      });
    }
    if (params.get("sort") === "new") document.getElementById("sortSelect").value = "new";
    render();
  });
})();
