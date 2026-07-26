/* 商品詳細 v9 — 購買情報、内容評価、他形式への回遊を一画面でつなぐ */
(function () {
  var id = new URLSearchParams(location.search).get("id") || "b1";

  jmedjLoadI18n(function () {
    jmedjLoadContent(function (data) {
      var all = data.books.concat(data.ebooks);
      var item = all.find(function (i) { return i.id === id; }) || all[0];

      document.title = item.title + " | 日本医事新報社(刷新モックv2)";

      var root = document.getElementById("detailRoot");
      root.innerHTML = "";

      var media = document.createElement("div");
      media.className = "detail-media";
      var cover = jmedjCover(item);
      cover.removeAttribute("aria-hidden");
      cover.tabIndex = -1;
      media.appendChild(cover);
      root.appendChild(media);

      var body = document.createElement("div");
      body.className = "detail-body";

      var chip = document.createElement("a");
      chip.className = "card-chip";
      chip.href = jmedjChipHrefFor(item);
      chip.textContent = item.format + " / " + item.category;
      body.appendChild(chip);

      var h1 = document.createElement("h1");
      h1.textContent = item.title;
      body.appendChild(h1);

      var meta = document.createElement("div");
      meta.className = "detail-meta";
      [item.author, item.date].filter(Boolean).forEach(function (t) {
        var span = document.createElement("span");
        span.textContent = t;
        meta.appendChild(span);
      });
      body.appendChild(meta);

      var price = document.createElement("div");
      price.className = "detail-price";
      price.textContent = typeof item.price === "number" ? "¥" + item.price.toLocaleString() : "価格は公式ページで確認";
      var small = document.createElement("small");
      small.textContent = "(税込)";
      price.appendChild(small);
      body.appendChild(price);

      var desc = document.createElement("p");
      desc.className = "detail-desc";
      desc.textContent = item.desc;
      body.appendChild(desc);

      var actions = document.createElement("div");
      actions.className = "detail-actions";
      var buy = document.createElement("a");
      buy.className = "btn-primary";
      buy.href = "cart.html";
      buy.textContent = jmedjT("cta.addToCart");
      var sample = document.createElement("button");
      sample.type = "button";
      sample.className = "btn-secondary";
      sample.textContent = item.format === "電子" ? "試し読み" : "在庫を確認";
      actions.appendChild(buy);
      actions.appendChild(sample);
      var official = jmedjOfficialLink(item, "公式の商品ページで確認 ↗");
      if (official) actions.appendChild(official);
      body.appendChild(actions);

      root.appendChild(body);

      jmedjFillList("productKeyPoints", [
        (item.clinicalArea || "臨床") + "領域の要点を、診療場面から逆引きできます",
        "判断の根拠と実践手順を、章単位で確認できます",
        "関連する記事・動画へ進み、刊行後の更新情報も追えます"
      ]);
      jmedjFillList("productToc", [
        "第1章　よく遭遇する症候・所見の整理",
        "第2章　鑑別と検査を組み立てる",
        "第3章　治療・フォローアップの実際",
        "付録　診療で使えるチェックリスト"
      ]);
      jmedjFillFacts("productFacts", [
        ["媒体", item.format || item.contentType],
        ["診療領域", item.clinicalArea || item.category],
        ["刊行日", item.date ? item.date.replace(/-/g, "/") : ""],
        ["著者・編集", item.author || "公式ページで確認"],
        ["商品区分", item.contentType || item.category],
        ["データ出典", item.sourceUrl ? "公開商品情報" : "提案用サンプル"]
      ]);

      var breadcrumb = document.getElementById("breadcrumb");
      var current = document.createElement("span");
      current.textContent = item.title;
      breadcrumb.appendChild(document.createTextNode(" > "));
      breadcrumb.appendChild(current);

      var related = jmedjRelated(all, item, 4);
      var grid = document.getElementById("relatedGrid");
      jmedjSetGridMode(grid, related);
      if (!related.length) {
        var p = document.createElement("p");
        p.className = "meta";
        p.textContent = "同じジャンルの関連出版物は現在ありません。";
        grid.appendChild(p);
      } else {
        related.forEach(function (r) { grid.appendChild(jmedjCard(r)); });
      }

      var cross = jmedjRelated(data.articles.concat(data.videos), item, 4);
      jmedjRenderGrid("crossRelatedGrid", cross, 4);
    });
  });
})();
