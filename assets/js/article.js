/* 記事詳細 v9 — 要点、構造、信頼情報、次に読む内容を明示 */
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
    var desc = document.getElementById("articleDesc");
    desc.textContent = item.desc;
    var official = jmedjOfficialLink(item, "公式サイトで本文を読む ↗");
    if (official) {
      var actions = document.createElement("div");
      actions.className = "detail-actions";
      actions.appendChild(official);
      desc.insertAdjacentElement("afterend", actions);
    }

    var meta = document.getElementById("articleMeta");
    [item.clinicalArea || item.category, item.editorialFormat, item.author, item.date]
      .filter(Boolean).forEach(function (t) {
      var span = document.createElement("span");
      span.textContent = t;
      meta.appendChild(span);
    });

    jmedjFillList("articleKeyPoints", [
      (item.clinicalArea || item.category || "この領域") + "で見落としやすい判断点を整理",
      "診察・検査・対応を、実際の順序で確認",
      "公開日と著者、関連資料を同じ画面で追跡"
    ]);
    jmedjFillList("articleToc", [
      "臨床上の問いと結論",
      "診断・評価で確認するポイント",
      "治療・説明時の注意点",
      "参考文献と関連コンテンツ"
    ]);
    jmedjFillFacts("articleFacts", [
      ["診療領域", item.clinicalArea || item.category],
      ["記事形式", item.editorialFormat || item.series],
      ["公開日", item.date ? item.date.replace(/-/g, "/") : ""],
      ["著者", item.author || "公式ページで確認"],
      ["更新方針", "改訂時は更新日を表示"],
      ["出典", item.sourceUrl ? "公開記事メタデータ" : "提案用サンプル"]
    ]);

    var breadcrumb = document.getElementById("breadcrumb");
    var catLink = document.createElement("a");
    catLink.href = "articles.html";
    catLink.textContent = item.category;
    breadcrumb.appendChild(document.createTextNode(" > "));
    breadcrumb.appendChild(catLink);
    breadcrumb.appendChild(document.createTextNode(" > " + item.title));

    document.getElementById("relatedHeading").textContent =
      "同じ診療科(" + item.category + ")の記事";

    var related = jmedjRelated(all, item, 4);
    var grid = document.getElementById("relatedGrid");
    jmedjSetGridMode(grid, related);
    if (!related.length) {
      var p = document.createElement("p");
      p.className = "meta";
      p.textContent = "同じ診療科の記事は現在ありません。記事一覧から他の診療科もご覧いただけます。";
      grid.appendChild(p);
    } else {
      related.forEach(function (r) { grid.appendChild(jmedjCard(r)); });
    }

    var cross = jmedjRelated(data.books.concat(data.ebooks, data.videos), item, 4);
    jmedjRenderGrid("crossRelatedGrid", cross, 4);
  });
})();
