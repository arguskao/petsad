# PawsHome Architecture

這份文件用來描述目前專案的結構與擴充方向。  
如果你想看接下來要做什麼，讀 [todo.md](/Users/user/Documents/Code2/HTML/paws/todo.md)。

## 現在的架構

- 前端：Astro v6
- 部署：Cloudflare Pages
- API：Cloudflare Pages Functions
- API 框架：Hono
- 資料庫：Cloudflare D1
- D1 binding：`paws`

目前的設計原則是：

- 靜態內容交給 Astro
- 動態資料交給 API
- 共享資料集中在 D1
- 前端只負責顯示與互動

## 已落地的資料流

- `/api/pets` 讀取 D1 `paws`
- `/api/pets/:id` 讀取 D1 `paws`
- `/api/stories` 讀取 D1 `paws`
- `/api/shelters` 讀取 D1 `paws`
- `/api/favorites` 讀取與寫入 D1 `paws`
- `/api/admin/summary` 讀取 D1 `paws`
- `/api/admin/adoptions` 讀取 D1 `paws`
- `/api/admin/adoptions/:id` 讀取單筆申請
- `/api/admin/pets` 讀取 D1 `paws`
- `/api/admin/pets/:id` 讀取單筆毛孩
- `/api/admin/favorites` 讀取 D1 `paws`
- `/api/admin/pets/:id` 更新毛孩資料
- `/api/admin/adoptions/:id` 更新申請狀態
- `/api/adoptions` 寫入 `adoption_requests`

如果 D1 不可用，部分 API 會回退到本地靜態資料，避免開發時整站卡死。

## 現有頁面分工

- `/`：首頁
- `/pets`：寵物列表
- `/pets/:id`：寵物詳情
- `/stories`：成功故事
- `/shelters`：合作夥伴
- `/apply`：領養申請
- `/apply/success`：申請送出結果頁
- `/favorites`：收藏清單
- `/admin`：最小版管理後台
- `/admin/pets`：毛孩管理入口
- `/admin/adoptions`：單筆申請詳情與審核頁

收藏清單目前使用匿名 `clientId` 連 localStorage 與 D1 同步，可直接在頁面清空整份清單。
收藏頁也支援搜尋與排序，方便在收藏數量增加後快速定位毛孩。

管理後台目前是讀取型的最小版本，先提供申請與收藏的總覽與最近紀錄，之後再補驗證與編輯能力。
現在也能從列表進入單筆申請詳情，直接核准、拒絕或改回待處理，並從毛孩管理入口查看、編輯目前資料與單筆毛孩詳情。
毛孩管理也支援切換 `available`、`hidden`、`adopted` 狀態，前台列表只顯示 `available` 的毛孩。
`BaseLayout` 也已補好可配置的 canonical、社群圖與 `noindex`，後台頁會預設避免被搜尋引擎收錄。

## 前端結構

```txt
src/
├── components/
├── data/
├── layouts/
├── lib/
├── pages/
└── styles/
```

### `src/data/`

放靜態 fallback 資料與型別。

### `src/lib/`

放資料查詢、轉換、篩選與共用邏輯。

### `src/pages/`

放實際頁面與路由。

### `functions/api/`

放 Pages Functions API 路由。

## 資料表

### `pets`

毛孩基本資料、標籤、排序與顯示欄位。
目前也包含 `status`，用來區分 `available`、`hidden`、`adopted`。

### `stories`

成功領養故事。

### `shelters`

合作夥伴與收容所資料。

### `adoption_requests`

領養申請紀錄。

### `favorites`

收藏紀錄，現階段先用匿名 `clientId` 同步 localStorage 收藏。

## 下一階段的擴充重點

- 收藏功能
- 申請查詢
- 後台管理
- 會員系統
- 圖片上傳
- SEO 與監控

## 簡短結論

這個專案現在的主線很清楚：

1. Astro 負責頁面
2. Hono + Pages Functions 負責 API
3. D1 `paws` 負責資料
4. `todo.md` 負責路線圖
