(function () {
  var items = [];

  function activeFormats() {
    return Array.prototype.slice.call(document.querySelectorAll(".f-format:checked")).map(function (el) { return el.value; });
  }
  function activeCategories() {
    return Array.prototype.slice.call(document.querySelectorAll(".f-category:checked")).map(function (el) { return el.value; });
  }

  function buildCategoryFacets() {
    var cats = Array.from(new Set(items.map(function (i) { return i.category; }))).sort();
    var el = document.getElementById("categoryFacets");
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
      el.appendChild(label);
    });
  }

  function render() {
    var formats = activeFormats();
    var cats = activeCategories();
    var sort = document.getElementById("sortSelect").value;

    var filtered = items.filter(function (i) {
      return formats.indexOf(i.format) !== -1 && cats.indexOf(i.category) !== -1;
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
    filtered.forEach(function (item) {
      var card = jmedjCard(item);
      card.style.cursor = "pointer";
      card.addEventListener("click", function () { location.href = "product.html?id=" + item.id; });
      grid.appendChild(card);
    });
  }

  document.querySelectorAll(".f-format").forEach(function (el) { el.addEventListener("change", render); });
  document.getElementById("sortSelect").addEventListener("change", render);
  document.getElementById("resetFacets").addEventListener("click", function () {
    document.querySelectorAll(".f-format, .f-category").forEach(function (el) { el.checked = true; });
    render();
  });

  jmedjLoadContent(function (data) {
    items = data.books.concat(data.ebooks);
    buildCategoryFacets();
    render();
  });
})();
