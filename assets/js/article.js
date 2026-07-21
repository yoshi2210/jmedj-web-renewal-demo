/* 記事詳細 v2 */
(function () {
  var id = new URLSearchParams(location.search).get("id") || "a1";

  jmedjLoadContent(function (data) {
    var all = data.articles;
    var item = all.find(function (i) { return i.id === id; }) || all[0];

    document.title = item.title + " | 日本医事新報社(刷新モックv2)";

    var chipEl = document.getElementById("articleChip");
    chipEl.textContent = item.series + " / " + item.category;
    chipEl.href = "articles.html";
    document.getElementById("articleTitle").textContent = item.title;
    document.getElementById("articleDesc").textContent = item.desc;

    var meta = document.getElementById("articleMeta");
    [item.author, item.date].filter(Boolean).forEach(function (t) {
      var span = document.createElement("span");
      span.textContent = t;
      meta.appendChild(span);
    });

    var breadcrumb = document.getElementById("breadcrumb");
    var catLink = document.createElement("a");
    catLink.href = "articles.html";
    catLink.textContent = item.category;
    breadcrumb.appendChild(document.createTextNode(" > "));
    breadcrumb.appendChild(catLink);
    breadcrumb.appendChild(document.createTextNode(" > " + item.title));

    document.getElementById("relatedHeading").textContent =
      "同じ診療科(" + item.category + ")の記事";

    var related = all.filter(function (i) {
      return i.category === item.category && i.id !== item.id;
    });
    var grid = document.getElementById("relatedGrid");
    if (!related.length) {
      var p = document.createElement("p");
      p.className = "meta";
      p.textContent = "同じ診療科の記事は現在ありません。記事一覧から他の診療科もご覧いただけます。";
      grid.appendChild(p);
    } else {
      related.forEach(function (r) { grid.appendChild(jmedjCard(r)); });
    }
  });
})();
