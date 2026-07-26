/* 動画詳細 v9 — 章、資料、講師、関連商品まで視聴前に評価可能にする */
(function () {
  var id = new URLSearchParams(location.search).get("id") || "v1";

  jmedjLoadContent(function (data) {
    var all = data.videos;
    var item = all.find(function (i) { return i.id === id; }) || all[0];

    document.title = item.title + " | 日本医事新報社(刷新モックv2)";

    var media = document.getElementById("videoMedia");
    if (media) {
      var cover = jmedjCover(item);
      cover.removeAttribute("aria-hidden");
      cover.tabIndex = -1;
      media.appendChild(cover);
    }

    var chipEl = document.getElementById("videoChip");
    chipEl.textContent = item.category;
    chipEl.href = "videos.html";
    document.getElementById("videoTitle").textContent = item.title;
    var desc = document.getElementById("videoDesc");
    desc.textContent = item.desc;
    var official = jmedjOfficialLink(item, "公式サイトで動画を見る ↗");
    if (official) {
      var actions = document.createElement("div");
      actions.className = "detail-actions";
      actions.appendChild(official);
      desc.insertAdjacentElement("afterend", actions);
    }

    var meta = document.getElementById("videoMeta");
    [item.clinicalArea || item.category, item.topic, item.author, item.date]
      .filter(Boolean).forEach(function (t) {
      var span = document.createElement("span");
      span.textContent = t;
      meta.appendChild(span);
    });

    var chapterTitles = [
      "この講義で扱う臨床上の問い",
      "判断に必要な基礎と評価",
      "症例で確認する実践ポイント",
      "まとめ・次に参照する資料"
    ];
    var chapters = document.getElementById("videoChapters");
    chapterTitles.forEach(function (title, index) {
      var li = document.createElement("li");
      var number = document.createElement("span");
      var text = document.createElement("span");
      var time = document.createElement("time");
      number.textContent = String(index + 1).padStart(2, "0");
      text.textContent = title;
      time.textContent = ["00:00", "04:20", "11:40", "18:10"][index];
      li.appendChild(number); li.appendChild(text); li.appendChild(time);
      chapters.appendChild(li);
    });
    jmedjFillFacts("videoFacts", [
      ["講師", item.author || "公式ページで確認"],
      ["診療領域", item.clinicalArea || item.category],
      ["テーマ", item.topic || item.category],
      ["公開日", item.date ? item.date.replace(/-/g, "/") : ""],
      ["動画時間", item.duration || "約20分"],
      ["資料", "要点PDFあり（提案）"]
    ]);

    var breadcrumb = document.getElementById("breadcrumb");
    breadcrumb.appendChild(document.createTextNode(" > " + item.title));

    var related = jmedjRelated(all, item, 4);
    var grid = document.getElementById("relatedGrid");
    jmedjSetGridMode(grid, related);
    if (!related.length) {
      var p = document.createElement("p");
      p.className = "meta";
      p.textContent = "同じテーマの動画は現在ありません。";
      grid.appendChild(p);
    } else {
      related.forEach(function (r) { grid.appendChild(jmedjCard(r)); });
    }
    var cross = jmedjRelated(data.books.concat(data.ebooks), item, 4);
    jmedjRenderGrid("crossRelatedGrid", cross, 4);
  });
})();
