/* 商品詳細 v2 */
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
      price.textContent = "¥" + item.price.toLocaleString();
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
      body.appendChild(actions);

      root.appendChild(body);

      var breadcrumb = document.getElementById("breadcrumb");
      var current = document.createElement("span");
      current.textContent = item.title;
      breadcrumb.appendChild(document.createTextNode(" > "));
      breadcrumb.appendChild(current);

      var related = all.filter(function (i) {
        return i.category === item.category && i.id !== item.id;
      }).slice(0, 4);
      var grid = document.getElementById("relatedGrid");
      if (!related.length) {
        var p = document.createElement("p");
        p.className = "meta";
        p.textContent = "同じジャンルの関連出版物は現在ありません。";
        grid.appendChild(p);
      } else {
        related.forEach(function (r) { grid.appendChild(jmedjCard(r)); });
      }
    });
  });
})();
