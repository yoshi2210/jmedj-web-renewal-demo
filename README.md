# jmedj サイト刷新提案 — 公開デモ(v3)

日本医事新報社(https://www.jmedj.co.jp/)のUI/UX刷新提案の**公開デモ**。GitHub Pages 配信。

- **公開サイト**: https://yoshi2210.github.io/jmedj-web-renewal-demo/
- **設計批判と原則(現行サイト+モックへの批判/改訂履歴)**: [docs/11_design_critique_and_v2_principles.md](docs/11_design_critique_and_v2_principles.md)
- **設計思想 / Before/After**: [docs/08_design_philosophy_and_before_after.md](docs/08_design_philosophy_and_before_after.md)

## v3 の要点

- **クリーン・メディカル**: 白ベース+メディカルティール+ネイビー。モダンな日本語ゴシック(Zen Kaku Gothic New)。清潔・信頼・現代的。
- **検索を情報構造の頂点に**: モバイルはボトムナビ**中央の「さがす」FAB**、デスクトップはグローバルナビ先頭、トップは「まず、さがす。」を主役に。カテゴリは検索の補助。
- サジェスト+ライブ検索+件数タブ、死にリンクゼロ(会社概要/FAQ/お問い合わせ/お知らせ/サイトマップ/カート実装済み)、スケルトン/空状態、a11y(スキップリンク/44pxタップ/focus-visible/reduced-motion)。全16ページ。

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
