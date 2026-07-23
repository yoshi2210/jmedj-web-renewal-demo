/* 動画詳細 v2(v1では動画ゾーンに詳細ページが存在しなかった) */
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
    document.getElementById("videoDesc").textContent = item.desc;

    var meta = document.getElementById("videoMeta");
    [item.author, item.date].filter(Boolean).forEach(function (t) {
      var span = document.createElement("span");
      span.textContent = t;
      meta.appendChild(span);
    });

    var breadcrumb = document.getElementById("breadcrumb");
    breadcrumb.appendChild(document.createTextNode(" > " + item.title));

    var related = all.filter(function (i) {
      return i.category === item.category && i.id !== item.id;
    });
    var grid = document.getElementById("relatedGrid");
    if (!related.length) {
      var p = document.createElement("p");
      p.className = "meta";
      p.textContent = "同じテーマの動画は現在ありません。";
      grid.appendChild(p);
    } else {
      related.forEach(function (r) { grid.appendChild(jmedjCard(r)); });
    }
  });
})();
