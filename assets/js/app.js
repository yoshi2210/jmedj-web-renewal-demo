// 共通: メガメニューの開閉、ゾーンカードの描画
(function () {
  document.querySelectorAll(".zone-nav-item").forEach(function (item) {
    var btn = item.querySelector(".zone-nav-btn");
    if (!btn) return;
    btn.addEventListener("click", function () {
      var isOpen = item.classList.contains("open");
      document.querySelectorAll(".zone-nav-item.open").forEach(function (el) {
        el.classList.remove("open");
        var b = el.querySelector(".zone-nav-btn");
        if (b) b.setAttribute("aria-expanded", "false");
      });
      if (!isOpen) {
        item.classList.add("open");
        btn.setAttribute("aria-expanded", "true");
      }
    });
  });

  document.addEventListener("click", function (e) {
    if (!e.target.closest(".zone-nav-item")) {
      document.querySelectorAll(".zone-nav-item.open").forEach(function (el) {
        el.classList.remove("open");
        var b = el.querySelector(".zone-nav-btn");
        if (b) b.setAttribute("aria-expanded", "false");
      });
    }
  });

  document.addEventListener("keydown", function (e) {
    if (e.key === "Escape") {
      document.querySelectorAll(".zone-nav-item.open").forEach(function (el) {
        el.classList.remove("open");
      });
    }
  });
})();

function jmedjCard(item) {
  var el = document.createElement("article");
  el.className = "card";
  el.setAttribute("data-zone", item.zone);

  var badge = document.createElement("span");
  badge.className = "badge";
  badge.textContent = item.badge;

  var h3 = document.createElement("h3");
  h3.textContent = item.title;

  var meta = document.createElement("p");
  meta.className = "meta";
  meta.textContent = item.meta;

  var cta = document.createElement("span");
  cta.className = "cta";
  cta.textContent = (item.ctaLabel || "詳しく見る") + " →";

  el.appendChild(badge);
  el.appendChild(h3);
  el.appendChild(meta);
  el.appendChild(cta);
  return el;
}

function jmedjRenderGrid(containerId, items, limit) {
  var el = document.getElementById(containerId);
  if (!el) return;
  el.innerHTML = "";
  items.slice(0, limit || items.length).forEach(function (item) {
    el.appendChild(jmedjCard(item));
  });
}

function jmedjLoadContent(onReady) {
  fetch("data/sample-content.json")
    .then(function (res) { return res.json(); })
    .then(onReady)
    .catch(function (err) {
      console.error("sample-content.json の読み込みに失敗しました", err);
    });
}

// i18n: 文言はハードコードせず必ずこの経由で取得する。
// docs/01_current_site_audit.md 課題1(英語文言の混在)の再発防止のため、
// キーが見つからない場合はサイレントに英語へフォールバックさせず、
// 欠落キーがひと目でわかるよう "[[key]]" 形式で表示する。
var _jmedjI18n = null;

function jmedjLoadI18n(onReady) {
  if (_jmedjI18n) { onReady(_jmedjI18n); return; }
  fetch("data/i18n.ja.json")
    .then(function (res) { return res.json(); })
    .then(function (data) {
      _jmedjI18n = data;
      onReady(data);
    })
    .catch(function (err) {
      console.error("i18n.ja.json の読み込みに失敗しました", err);
    });
}

function jmedjT(key, vars) {
  var dict = _jmedjI18n || {};
  var template = dict[key];
  if (template === undefined) return "[[" + key + "]]";
  if (!vars) return template;
  return template.replace(/\{(\w+)\}/g, function (_, name) {
    return Object.prototype.hasOwnProperty.call(vars, name) ? vars[name] : "{" + name + "}";
  });
}
