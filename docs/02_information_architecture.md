# 情報設計(IA)再設計

## 1. 現状のIA(観測ベース)

```
jmedj.co.jp (トップ)
├─ カート / 会員登録 / ログイン            ← ヘッダー右上、事業横断で共通
├─ ドロワーメニュー(135リンク、フラット)
│   ├─ お知らせ(手動連番スラッグが混在)
│   ├─ 出版物EC
│   │   ├─ 紙で探す → /collections/all, paper-new, paper-comingsoon, paper-inrevision, paper-errata-list, paper-jmedmook, paper-magazine
│   │   └─ 電子で探す → /collections/all-ebook, ebook-new, ebook-jmedmook, ebook-comingsoon
│   ├─ Web医事新報(記事) → /blogs/product (?view=new/special/series の3分岐のみ)
│   │   └─ 個別記事が直接ナビに列挙される(product_28873 等)
│   ├─ 医事新報チャンネル(動画) → /blogs/movie
│   │   └─ 個別動画が直接ナビに列挙される
│   ├─ 求人情報(dr9navi-recruit) → /blogs/dr9navi-recruit
│   │   └─ 個別求人が直接ナビに列挙される
│   ├─ 物件情報(dr9navi-estate) → /blogs/dr9navi-estate
│   │   └─ 個別物件が直接ナビに列挙される
│   └─ 会社情報・legal → /pages/company, company-info, anv100, faq, inquiry, reprint,
│       journal-regular, adinfo, ad-banner-form, dr9navi-ad-info, recruit_frommay2023,
│       privacy-policy, transactions, terms
└─ 検索(Algolia、英語文言混在、SSRは空ループ)
```

**問題の本質**: 情報自体は網羅的に存在するが、「訪問目的(買いたい/読みたい/観たい/転職・開業したい)」でグルーピングされておらず、更新頻度の高い個別コンテンツ(記事・求人・物件)がそのままナビの構成要素になっている。これはナビゲーションと「新着一覧」の役割が未分離であることが根本原因。

## 2. 提案する新IA

事業を **4つのゾーン** に明確化し、ドロワー(またはメガメニュー)の第一階層は常にゾーン名+ゾーンごとの主要導線のみとする。個別記事・個別求人・個別物件はナビからは外し、各ゾームのトップページ内の「一覧・絞り込みUI」に委譲する。

```
jmedj.co.jp (トップ)
├─ グローバルヘッダー(全ゾーン共通)
│   ├─ ロゴ / ゾーンメガメニュー / 検索(日本語ローカライズ・全ゾーン横断)
│   └─ アカウント(ログイン / 会員登録 / マイページ / カート)
│
├─ Zone A: 出版物ストア  /shop
│   ├─ /shop/books            紙の書籍
│   ├─ /shop/ebooks           電子コンテンツ
│   ├─ /shop/magazines        週刊日本医事新報・jmedmook
│   ├─ /shop/new               新刊・近刊(紙・電子横断)
│   └─ /shop/errata            正誤・改訂情報
│
├─ Zone B: Web医事新報(記事メディア)  /articles
│   ├─ /articles/category/{診療科}   診療科別一覧(新設)
│   ├─ /articles/series              連載・コーナー一覧
│   ├─ /articles/feature             特集一覧
│   └─ /articles/{slug}              個別記事(ナビには出さない)
│
├─ Zone C: 医事新報チャンネル(動画)  /videos
│   ├─ /videos/category/{テーマ}
│   └─ /videos/{slug}
│
├─ Zone D: 医師のための求人・物件(ドクター求NAVI)  /career
│   │   ※ サブブランドとして視覚的にも分離(現行のdr9navi命名を踏襲しつつ表記統一)
│   ├─ /career/jobs             求人情報(地域・診療科・雇用形態で絞り込み)
│   └─ /career/properties        医療物件情報(地域・用途で絞り込み)
│
├─ 会社情報・お知らせ  /company, /news
│   ├─ /news                    お知らせ一覧(全お知らせをここに集約、個別ページは /news/{yyyy}/{slug})
│   ├─ /company                 会社概要・沿革
│   └─ /company/legal            プライバシーポリシー・特商法表示・利用規約
│
└─ マイページ(ログイン後)  /account
    ├─ /account/orders          購入履歴(紙・電子)
    ├─ /account/library         電子コンテンツ閲覧
    └─ /account/applications     応募・問い合わせ履歴(求人・物件)
```

### 設計判断の要点

- **「ナビ」と「一覧・検索」を分離する**: 個別記事・求人・物件はメガメニューに列挙しない。メガメニューは常に固定の少数導線のみとし、動的コンテンツは各ゾームトップのカード一覧+絞り込みUIに任せる(01章 課題3・6への対応)。
- **検索はゾーン横断のグローバル機能として1つに統一**: 現状の「検索」機能はEC商品中心の作りに見えるため、記事・動画・求人・物件も含めた統合検索とし、結果画面ではゾーン別タブ(出版物/記事/動画/求人・物件)で結果を分けて表示する。
- **Zone Dは表記とURLを統一しつつサブブランドとして視覚分離**: 医師求人・医療物件は一般読者向けコンテンツと購買層が異なるため、色調やロゴ添字などで「同じ会社が運営する別サービス」であることを視覚的に示す(ドメインは統一しユーザーの混乱とmyshopify.com露出問題(01章課題4)を同時に解消)。

## 3. URL移行マッピング表(抜粋)

| 現行URL | 新URL案 | 備考 |
|---|---|---|
| `/collections/all` | `/shop/books` | |
| `/collections/all-ebook` | `/shop/ebooks` | |
| `/collections/paper-magazine` | `/shop/magazines` | |
| `/collections/paper-new`, `/collections/ebook-new` | `/shop/new` | 紙・電子を横断した新着タブに統合 |
| `/collections/paper-errata-list` | `/shop/errata` | |
| `/blogs/product` | `/articles` | |
| `/blogs/product/product_28873` | `/articles/{診療科スラッグ}/{意味のあるslug}` | 数値IDのみのURLを廃止 |
| `/blogs/movie` | `/videos` | |
| `/blogs/dr9navi-recruit` | `/career/jobs` | |
| `/blogs/dr9navi-estate` | `/career/properties` | |
| `https://jmedj.myshopify.com/pages/corporate...` | `/news/{yyyy}/{slug}` | 生ドメイン露出を解消、日付+意味のあるslugに統一 |
| `/pages/corporate202660703` | `/news/2026/{slug}` | 手動連番スラッグを廃止 |
| `/pages/company`, `/pages/company-info`, `/pages/anv100` | `/company`(概要・沿革をタブ/アンカーで統合) | ページ分散を解消 |

移行時は旧URLから新URLへの301リダイレクトを全件マッピングし、外部被リンク・検索エンジンのインデックスを保全する(実施はリニューアル本番切替時、[03章 手順9]で扱う)。
