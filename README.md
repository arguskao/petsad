# PawsHome - 寵物領養平台

PawsHome 是一個使用 Astro v6、Cloudflare Pages Functions 與 D1 打造的寵物領養平台。
目前主線已從舊版靜態頁面，移轉到 `src/` 底下的正式頁面與 API；舊版靜態首頁仍保留在 `public/` 作為參考。

## 目前功能

- 首頁、寵物列表、寵物詳情、成功故事、合作夥伴、申請表單
- 會員註冊 / 登入 / 登出
- 收藏清單與會員同步
- 會員登入後首頁快速入口
- 申請表單自動帶入會員姓名與 Email
- 收容所前台與後台管理
- 管理後台的申請、毛孩與收容所維護

## 技術堆疊

- 前端：Astro v6
- API：Cloudflare Pages Functions + Hono
- 資料庫：Cloudflare D1
- 綁定名稱：`paws`

## 專案結構

```txt
.
├── public/             # 舊版靜態首頁與參考資源
├── src/
│   ├── components/
│   ├── data/
│   ├── layouts/
│   ├── lib/
│   ├── pages/
│   └── styles/
├── functions/api/      # Pages Functions API
├── migrations/         # D1 migrations
├── package.json
├── astro.config.mjs
└── wrangler.toml
```

## 快速開始

### 安裝依賴

```bash
npm install
```

### 本地開發

```bash
npm run dev
```

如果你要模擬完整的 Cloudflare Pages + API 流程，先建置再啟動 Pages dev：

```bash
npm run build
npm run dev:pages
```

### 正式部署

```bash
npm run build
npm run deploy
```

如果你只是想看舊版靜態頁面，可使用：

```bash
npm run deploy:legacy
```

## 主要頁面

- `/`：首頁
- `/pets`：寵物列表
- `/pets/:id`：寵物詳情
- `/stories`：成功故事
- `/shelters`：合作夥伴
- `/apply`：領養申請
- `/apply/success`：申請結果頁
- `/auth/login`：會員登入
- `/auth/register`：會員註冊
- `/member`：會員中心
- `/favorites`：收藏清單
- `/admin`：管理後台
- `/admin/pets`：毛孩管理
- `/admin/adoptions`：申請審核
- `/admin/shelters`：收容所管理

## API 參考

以下是目前前端實際會使用的主要路由：

- `GET /api/auth/me`
- `POST /api/auth/register`
- `POST /api/auth/login`
- `POST /api/auth/logout`
- `PATCH /api/auth/password`
- `GET /api/pets`
- `GET /api/pets/:id`
- `GET /api/stories`
- `GET /api/shelters`
- `GET /api/favorites`
- `POST /api/favorites`
- `DELETE /api/favorites`
- `POST /api/favorites/merge`
- `POST /api/adoptions`
- `GET /api/admin/summary`
- `GET /api/admin/adoptions`
- `GET /api/admin/adoptions/:id`
- `PATCH /api/admin/adoptions/:id`
- `GET /api/admin/pets`
- `GET /api/admin/pets/:id`
- `PATCH /api/admin/pets/:id`
- `GET /api/admin/shelters`
- `PATCH /api/admin/shelters/:id`
- `GET /api/admin/favorites`

## D1 與資料更新

這個專案已經綁定 Cloudflare D1 `paws`。

如果你有更新 migration，先套用到遠端資料庫：

```bash
npx -y wrangler@4.92.0 d1 migrations apply paws --remote
```

本機開發若要同步 D1，可先跑建置，再用 `npm run dev:pages`。

## 會員寄信設定

會員註冊目前會透過 MailChannels Email API 寄出臨時密碼。

正式站至少要設定：

- `MAILCHANNELS_API_KEY`
- `MAIL_FROM_ADDRESS`
- `MAIL_FROM_NAME`
- 寄件網域 SPF：`include:relay.mailchannels.net`
- 寄件網域 `_mailchannels` TXT 授權紀錄

`MAIL_FROM_ADDRESS` 請使用你自己的正式網域信箱，例如 `hello@yourdomain.com`。  
不要直接使用 `pages.dev` 當寄件地址，因為無法完成 MailChannels 所需的網域驗證。

## 客製化

- `src/data/site.ts`：網站名稱、標題、描述與導覽
- `src/pages/index.astro`：首頁內容
- `src/components/Header.astro` / `src/components/Footer.astro`：導覽與頁尾
- `src/layouts/BaseLayout.astro`：canonical、社群圖與 `noindex`
- `src/styles/global.css`：全域樣式

## 備註

- `public/` 保留的是舊版靜態首頁參考，不是目前正式路線
- 目前正式部署路線是 Cloudflare Pages + D1 + Pages Functions
