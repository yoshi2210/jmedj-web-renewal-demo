(function () {
  var data = null;
  var currentType = "jobs";

  function activeRegions() {
    return Array.prototype.slice.call(document.querySelectorAll(".f-region:checked")).map(function (el) { return el.value; });
  }

  function buildRegionFacets(items) {
    var el = document.getElementById("regionFacets");
    el.innerHTML = "";
    var regions = Array.from(new Set(items.map(function (i) { return i.region; }))).sort();
    regions.forEach(function (region) {
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

  function render() {
    var items = data[currentType];
    var regions = activeRegions();
    var filtered = items.filter(function (i) { return regions.indexOf(i.region) !== -1; });

    document.getElementById("listingCount").textContent = filtered.length + "件の" + (currentType === "jobs" ? "求人情報" : "物件情報");
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
    document.querySelectorAll("#careerTabs .tab-btn").forEach(function (b) {
      b.classList.remove("active");
      b.setAttribute("aria-selected", "false");
    });
    btn.classList.add("active");
    btn.setAttribute("aria-selected", "true");
    currentType = btn.getAttribute("data-type");
    buildRegionFacets(data[currentType]);
    render();
  });

  document.getElementById("resetFacets").addEventListener("click", function () {
    document.querySelectorAll(".f-region").forEach(function (el) { el.checked = true; });
    render();
  });

  jmedjLoadContent(function (d) {
    data = d;
    buildRegionFacets(data[currentType]);
    render();
  });
})();
