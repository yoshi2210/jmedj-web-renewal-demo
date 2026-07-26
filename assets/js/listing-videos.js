/* 動画一覧 v9 — 診療領域とテーマを混ぜず、未選択を「すべて」とする */
(function () {
  var items = [];

  function checked(selector) {
    return Array.prototype.slice.call(document.querySelectorAll(selector + ":checked"))
      .map(function (el) { return el.value; });
  }

  function buildFacet(containerId, className, values) {
    var el = document.getElementById(containerId);
    el.innerHTML = "";
    Array.from(new Set(values.filter(Boolean))).sort()
      .forEach(function (value) {
        var label = document.createElement("label");
        label.className = "facet-option";
        var input = document.createElement("input");
        input.type = "checkbox";
        input.className = className;
        input.value = value;
        input.addEventListener("change", render);
        label.appendChild(input);
        label.appendChild(document.createTextNode(" " + value));
        el.appendChild(label);
      });
  }

  function render() {
    var areas = checked(".f-video-area");
    var topics = checked(".f-video-topic");
    var filtered = items.filter(function (i) {
      return (!areas.length || areas.indexOf(i.clinicalArea || i.category) !== -1) &&
        (!topics.length || topics.indexOf(i.topic || i.category) !== -1);
    });

    document.getElementById("listingCount").textContent = filtered.length + "件の動画";
    var grid = document.getElementById("listingGrid");
    var empty = document.getElementById("listingEmpty");
    grid.style.display = filtered.length ? "grid" : "none";
    empty.style.display = filtered.length ? "none" : "block";
    grid.innerHTML = "";
    jmedjSetGridMode(grid, filtered);
    filtered.forEach(function (item) { grid.appendChild(jmedjCard(item)); });
  }

  document.getElementById("resetFacets").addEventListener("click", function () {
    document.querySelectorAll(".f-video-area, .f-video-topic").forEach(function (el) {
      el.checked = false;
    });
    render();
  });

  jmedjLoadContent(function (data) {
    items = data.videos;
    buildFacet("clinicalAreaFacets", "f-video-area",
      items.map(function (i) { return i.clinicalArea || i.category; }));
    buildFacet("topicFacets", "f-video-topic",
      items.map(function (i) { return i.topic || i.category; }));
    render();
  });
})();
