# jmedj サイト刷新提案 — 公開デモ

これは日本医事新報社(https://www.jmedj.co.jp/)のUI/UX刷新提案の**公開デモ**です。GitHub Pages で配信しています。

- **公開サイト(デモ)**: GitHub Pages の URL(リポジトリの Settings > Pages 参照)
- **設計思想と Before/After**: [docs/08_design_philosophy_and_before_after.md](docs/08_design_philosophy_and_before_after.md)
- **現状監査(証跡付き)**: [docs/01_current_site_audit.md](docs/01_current_site_audit.md)

## 位置づけ・免責

- 本デモは日本医事新報社の**公開ページのみ**を通常のブラウジングで分析した独自の提案であり、同社の公式サイトではありません。
- 脆弱性診断・非公開領域へのアクセス等の侵入的なテストは**一切行っていません**([docs/05_security_and_compliance_scope.md](docs/05_security_and_compliance_scope.md))。
- 表示データは公開タイトル等を元にしたデモ用サンプルで、本文コンテンツの複製ではありません。
- 詳細な分析ドキュメント一式は別の private リポジトリで管理しています。本 public リポジトリは配信用のミラーです。

## ローカルで見る

```bash
python -m http.server 8000
# http://localhost:8000/index.html
```
