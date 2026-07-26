/* 求人・医療物件詳細 v9 — 一覧だけだったサービス領域にも比較・問い合わせ導線を用意 */
(function () {
  var id = new URLSearchParams(location.search).get("id") || "";

  jmedjLoadContent(function (data) {
    var all = data.jobs.concat(data.properties);
    var item = all.find(function (candidate) { return candidate.id === id; }) || all[0];
    var isJob = item.zone === "jobs";
    var kind = isJob ? "医師求人" : "医療物件";

    document.title = item.title + " | " + kind + " | 日本医事新報社(刷新モックv9)";
    document.getElementById("careerChip").textContent = kind;
    document.getElementById("careerTitle").textContent = item.title;
    document.getElementById("careerLead").textContent = item.desc;
    document.getElementById("careerPointsTitle").textContent =
      isJob ? "応募前に見るポイント" : "開業検討で見るポイント";
    document.getElementById("careerDetailTitle").textContent =
      isJob ? "勤務・施設条件" : "立地・契約条件";

    jmedjFillList("careerKeyPoints", isJob ? [
      (item.region || "募集地域") + "の勤務先。雇用形態と勤務時間を先に比較できます",
      "業務内容、当直、設備など応募判断に必要な項目を一画面に集約",
      "募集状況を公式情報で確認してから問い合わせへ進めます"
    ] : [
      (item.region || "対象地域") + "の物件。用途、アクセス、面積を先に比較できます",
      "賃料・保証金・入居時期など開業判断の条件を一画面に集約",
      "適する診療科と周辺環境を確認して問い合わせへ進めます"
    ]);

    jmedjFillFacts("careerFacts", isJob ? [
      ["地域", item.region],
      ["雇用形態", item.employment || "公式ページで確認"],
      ["診療領域", item.clinicalArea || "全科共通"],
      ["施設種別", "医療機関・介護施設"],
      ["掲載状況", "募集中（公式ページ要確認）"],
      ["情報区分", "医師求人"]
    ] : [
      ["地域", item.region],
      ["物件用途", item.usage || "医療テナント"],
      ["適する診療科", item.clinicalArea || "公式ページで確認"],
      ["交通", "最寄駅・幹線道路からのアクセスを確認"],
      ["掲載状況", "募集中（公式ページ要確認）"],
      ["情報区分", "医療物件"]
    ]);

    jmedjFillFacts("careerConditions", isJob ? [
      ["業務内容", "外来・病棟管理（提案用表示例）"],
      ["勤務日数", "週4〜5日（提案用表示例）"],
      ["勤務時間", "日勤中心。詳細は公式情報で確認"],
      ["当直・オンコール", "相談可能"],
      ["給与・待遇", "経験・勤務条件により決定"],
      ["設備・体制", "施設概要と診療体制を問い合わせ時に確認"]
    ] : [
      ["立地", "駅・生活動線からのアクセスを比較"],
      ["面積", "区画ごとに公式情報で確認"],
      ["賃料・共益費", "問い合わせ時に最新条件を確認"],
      ["保証金・契約", "契約条件は公式情報で確認"],
      ["入居時期", "相談可能"],
      ["設備", "駐車場・エレベーター・看板条件を確認"]
    ]);

    var official = jmedjOfficialLink(item, "公式情報で募集状況を確認 ↗");
    if (official) document.getElementById("careerOfficial").appendChild(official);
    document.getElementById("breadcrumb").appendChild(
      document.createTextNode(" > " + item.title)
    );

    var sameType = isJob ? data.jobs : data.properties;
    var related = jmedjRelated(sameType, item, 4);
    document.getElementById("careerRelatedHeading").textContent =
      (item.region || "条件") + "で比較できる" + (isJob ? "求人" : "物件");
    jmedjRenderGrid("relatedGrid", related, 4);
  });
})();
