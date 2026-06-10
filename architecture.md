# PawsHome 長期擴充架構

這個專案目前是靜態首頁，但如果目標是長期擴充，我建議直接往「內容頁 + API + 資料層分離」的方向走。

目前已經先建立一版 Astro v6 骨架，讓首頁可以逐步從 `public/` 遷移到 `src/`。

## 建議技術棧

- 前端框架：Astro
- 靜態託管：Cloudflare Pages
- API 層：Pages Functions
- API 框架：Hono
- 資料庫：Cloudflare D1
- 圖片儲存：Cloudflare R2
- 快取 / 短期狀態：Cloudflare KV
- 表單防護：Turnstile

## 為什麼這樣配

- Astro 很適合內容型網站和 landing page
- Cloudflare Pages 很適合 Git 驅動部署
- Hono 在 Pages Functions 裡很好切 API 路由
- D1 足夠承接寵物資料、申請紀錄、合作夥伴資料
- R2 很適合存寵物照片和媒體檔案
- KV 可以先拿來做快取、設定值、短期狀態

## 資料與職責切分

### 前端負責

- 首頁展示
- 搜尋與篩選
- 寵物詳情頁
- 申請表單
- 收藏清單
- SEO 與分享標籤

### API 負責

- 讀取寵物資料
- 建立和更新領養申請
- 收藏與取消收藏
- 收容所資料查詢
- 後台管理所需操作

### 資料層負責

- D1：寵物、申請、會員、收容所
- R2：照片、證件、附件
- KV：快取、會話片段、功能旗標

## 建議資料夾結構

```txt
.
├── public/
│   ├── images/
│   └── favicon/
├── src/
│   ├── components/
│   ├── layouts/
│   ├── pages/
│   │   ├── index.astro
│   │   ├── pets/
│   │   │   └── [id].astro
│   │   ├── stories.astro
│   │   └── shelters.astro
│   ├── data/
│   │   ├── pets.ts
│   │   ├── shelters.ts
│   │   └── stories.ts
│   └── styles/
│       └── global.css
├── functions/
│   └── api/
│       ├── pets.ts
│       ├── adoptions.ts
│       └── favorites.ts
├── migrations/
└── wrangler.toml
```

## 現有內容對應

把現在的靜態首頁拆進 Astro 時，可以先這樣對應：

- `src/pages/index.astro`
  - 首頁主內容
  - Hero
  - 搜尋預覽
  - 精選毛孩
  - 領養流程
  - 成功故事
  - 合作夥伴
  - CTA

- `src/pages/pets/index.astro`
  - 寵物列表頁
  - 搜尋結果頁

- `src/pages/pets/[id].astro`
  - 單一寵物詳情頁

- `src/pages/stories.astro`
  - 成功故事列表

- `src/pages/shelters.astro`
  - 合作夥伴列表

- `src/components/Header.astro`
  - 導覽列
  - Logo
  - 行動按鈕

- `src/components/PetCard.astro`
  - 毛孩卡片
  - 愛心收藏按鈕
  - 標籤與基本資料

- `src/components/StoryCard.astro`
  - 成功故事卡片

- `src/components/ShelterCard.astro`
  - 收容所卡片

- `src/components/SectionHeader.astro`
  - 區塊標題與說明文

- `src/components/Footer.astro`
  - 頁尾導覽
  - 社群連結

- `src/components/SearchBar.astro`
  - 類型
  - 年齡
  - 體型
  - 地區

## 互動邏輯怎麼放

- Astro 頁面負責輸出結構與資料
- 需要互動的部分再拆成小型 island 或獨立前端腳本
- 目前這些互動先保留：
  - 平滑捲動
  - 收藏愛心
  - 搜尋通知
  - 滾動時的動態效果
  - logo 彩蛋

## 最小可行遷移

先不要一次重寫全部，最小可行遷移可以分三步：

1. 先建立 Astro 專案骨架與首頁
2. 把現有首頁區塊搬到 `index.astro` 與共用元件
3. 再補 `/pets/[id]`、`/pets`、API 與資料庫

## 路由規劃

- `/`：首頁
- `/pets`：寵物列表
- `/pets/:id`：寵物詳情
- `/stories`：成功故事
- `/shelters`：合作夥伴
- `/apply`：領養申請
- `/api/pets`：寵物 API
- `/api/adoptions`：申請 API
- `/api/favorites`：收藏 API

> 過渡期間，Astro 靜態站會先產出 `/api/pets.json` 和 `/api/pets/[id].json`；正式的 `/api/pets` 會留給 Pages Functions 接手。

## 開發順序

### Phase 1：先把內容與頁面拆開

- 把首頁資料抽成 `src/data`
- 把樣式整理成全域 CSS
- 把首頁切成 Astro 頁面
- 保留目前的視覺風格

### Phase 2：把靜態頁變成動態頁

- 做寵物列表頁
- 做寵物詳情頁
- 做搜尋與篩選
- 做收藏功能

### Phase 3：補 API

- 建立 `GET /api/pets`
- 建立 `GET /api/pets/:id`
- 建立 `POST /api/adoptions`
- 建立收藏的新增與移除

### Phase 4：補資料庫

- 先定 D1 schema
- 再補 migration
- 再接 API 查詢
- 最後接管理流程

### Phase 5：做營運能力

- 登入與會員
- 後台管理
- 內容管理
- 圖片上傳
- 審核流程

## 這個架構的好處

- 內容頁和 API 不會互相打架
- 靜態頁可以保留 Cloudflare Pages 的速度
- 之後要加功能時，不需要重寫整個網站
- 可以先小步快跑，再慢慢長成平台

## 目前最推薦的下一步

1. 建立 Astro 專案骨架
2. 把現在的首頁搬到 `src/pages/index.astro`
3. 把寵物資料移到 `src/data/pets.ts`
4. 建立第一個 Pages Function API
5. 再決定要不要加 D1 schema
