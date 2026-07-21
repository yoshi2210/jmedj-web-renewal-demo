(function () {
  var params = new URLSearchParams(location.search);
  var id = params.get("id") || "a1";

  jmedjLoadContent(function (data) {
    var all = data.articles;
    var item = all.find(function (i) { return i.id === id; }) || all[0];

    document.title = item.title + " | メディカルパートナー(刷新モック)";
    document.getElementById("articleBadge").textContent = item.series || item.badge;
    document.getElementById("articleTitle").textContent = item.title;
    document.getElementById("articleDesc").textContent = item.desc;

    var meta = document.getElementById("articleMeta");
    [item.author, item.category, item.date].filter(Boolean).forEach(function (t) {
      var span = document.createElement("span");
      span.textContent = t;
      meta.appendChild(span);
    });

    var breadcrumb = document.getElementById("breadcrumb");
    var catLink = document.createElement("a");
    catLink.href = "#";
    catLink.textContent = item.category;
    breadcrumb.appendChild(document.createTextNode(" > "));
    breadcrumb.appendChild(catLink);
    breadcrumb.appendChild(document.createTextNode(" > " + item.title));

    document.getElementById("relatedHeading").textContent = "同じ診療科(" + item.category + ")の記事";

    var related = all.filter(function (i) { return i.category === item.category && i.id !== item.id; });
    var grid = document.getElementById("relatedGrid");
    if (related.length === 0) {
      var p = document.createElement("p");
      p.style.fontSize = "13px";
      p.style.color = "var(--color-ink-soft)";
      p.textContent = "同じ診療科の記事は現在ありません。";
      grid.appendChild(p);
    } else {
      related.forEach(function (r) {
        var card = jmedjCard(r);
        card.style.cursor = "pointer";
        card.addEventListener("click", function () { location.href = "article.html?id=" + r.id; });
        grid.appendChild(card);
      });
    }
  });
})();
