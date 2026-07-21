# jmedj サイト刷新提案 — 公開デモ(v2)

日本医事新報社(https://www.jmedj.co.jp/)のUI/UX刷新提案の**公開デモ**。GitHub Pages 配信。

- **公開サイト**: https://yoshi2210.github.io/jmedj-web-renewal-demo/
- **設計批判とv2原則(現行サイト+v1モックへの批判)**: [docs/11_design_critique_and_v2_principles.md](docs/11_design_critique_and_v2_principles.md)
- **設計思想 / Before/After**: [docs/08_design_philosophy_and_before_after.md](docs/08_design_philosophy_and_before_after.md)

## v2 の要点

検索ファースト(サジェスト+ライブ検索+件数タブ)、モバイルはボトムタブ+ドロワーでナビが消えない、死にリンクゼロ(会社概要/FAQ/お問い合わせ/お知らせ/サイトマップ/カートを実ページ化)、和紙×明朝×朱の編集ヘリテージ、スケルトン/空状態、a11y(スキップリンク/44pxタップ/focus-visible/reduced-motion)。全16ページ。

## 免責

- 公開ページのみを通常ブラウジングで分析した独自提案であり、同社の公式サイトではありません。
- 脆弱性診断・非公開領域アクセス等の侵入的テストは行っていません([docs/05_security_and_compliance_scope.md](docs/05_security_and_compliance_scope.md))。
- 表示データはデモ用サンプルで、本文コンテンツの複製ではありません。
- 詳細な分析ドキュメント一式は別の private リポジトリで管理。本 public リポジトリは配信用ミラーです。

## ローカルで見る

```bash
python -m http.server 8000
# http://localhost:8000/index.html
```
