# jmedj サイト刷新提案 — 公開デモ(v4)

日本医事新報社(https://www.jmedj.co.jp/)のUI/UX刷新提案の**公開デモ**。GitHub Pages 配信。

- **公開サイト**: https://yoshi2210.github.io/jmedj-web-renewal-demo/
- **現代サービスとの比較評価 / ビジュアル探索方針**: [docs/12_visual_discovery_and_benchmark.md](docs/12_visual_discovery_and_benchmark.md)
- **設計批判と原則(改訂履歴)**: [docs/11_design_critique_and_v2_principles.md](docs/11_design_critique_and_v2_principles.md)

## v4 の要点

- **サムネで探せる**: 全カード(トップ/検索/一覧/関連/詳細)に生成カバー(書影・記事カバー・動画サムネ+再生+尺・求人/物件の地図ピン)。実表紙は複製せず、メタ情報から決定論的に生成。
- v3から継続: クリーン・メディカル配色、検索を情報構造の頂点(中央FAB/ナビ先頭/トップ主役)、ライブ検索+サジェスト+件数タブ、死にリンクゼロ、a11y。全16ページ。

## 免責

- 公開ページのみを通常ブラウジングで分析した独自提案であり、同社の公式サイトではありません。
- 脆弱性診断・非公開領域アクセス等の侵入的テストは行っていません。
- 表示データ・カバーはデモ用の生成物で、本文・実表紙の複製ではありません。
- 詳細な分析ドキュメント一式は別の private リポジトリで管理。本 public リポジトリは配信用ミラーです。

## ローカルで見る

```bash
python -m http.server 8000
# http://localhost:8000/index.html
```
