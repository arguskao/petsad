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

- `/api/auth/me` 讀取登入中的會員
- `/api/auth/register` 建立會員並寄出臨時密碼 Email
- `/api/auth/login` 建立 session
- `/api/auth/logout` 撤銷 session
- `/api/pets` 讀取 D1 `paws`
- `/api/pets/:id` 讀取 D1 `paws`
- `/api/stories` 讀取 D1 `paws`
- `/api/faqs` 讀取 D1 `paws`
- `/api/shelters` 讀取 D1 `paws`
- `/api/adoption-guide` 讀取 D1 `paws`
- `/api/site-copies` 讀取 D1 `paws`
- `/api/favorites` 會優先讀取會員 session，未登入時再以匿名 `clientId` 讀寫 D1 `paws`
- `/api/analytics/events` 寫入 D1 `paws`
- `/api/admin/summary` 讀取 D1 `paws`
- `/api/admin/adoptions` 讀取 D1 `paws`
- `/api/admin/adoptions/:id` 讀取單筆申請
- `/api/admin/pets` 讀取 D1 `paws`
- `/api/admin/pets/:id` 讀取單筆毛孩
- `/api/admin/stories` 讀取 D1 `paws` 的成功故事
- `/api/admin/stories/:id` 讀取與更新單筆成功故事
- `/api/admin/faqs` 讀取 D1 `paws` 的常見問題
- `/api/admin/faqs/:id` 讀取與更新單筆常見問題
- `/api/admin/adoption-guide` 讀取與更新 D1 `paws` 的領養須知
- `/api/admin/site-copies` 讀取與更新 D1 `paws` 的頁面文案
- `/api/admin/analytics` 讀取 D1 `paws` 的事件匯總
- `/api/admin/shelters` 讀取與更新 D1 `paws`
- `/api/admin/favorites` 讀取 D1 `paws`
- `/api/admin/pets/:id` 更新毛孩資料
- `/api/admin/adoptions/:id` 更新申請狀態
- `/api/admin/shelters/:id` 更新收容所資料
- `/api/adoptions` 寫入 `adoption_requests`

如果 D1 不可用，部分 API 會回退到本地靜態資料，避免開發時整站卡死。

## 現有頁面分工

- `/`：首頁
- `/pets`：寵物列表
- `/pets/:id`：寵物詳情
- `/stories`：成功故事
- `/faq`：常見問題
- `/adoption-guide`：領養須知
- `/shelters`：合作夥伴
- `/apply`：領養申請
- `/apply/success`：申請送出結果頁
- `/auth/login`：會員登入
- `/auth/register`：會員註冊
- `/member`：會員最小版頁面
- `/favorites`：收藏清單
- `/admin`：最小版管理後台
- `/admin/pets`：毛孩管理入口
- `/admin/stories`：成功故事內容管理
- `/admin/faqs`：常見問題內容管理
- `/admin/adoption-guide`：領養須知內容管理
- `/admin/site-copies`：頁面文案管理
- `/admin/analytics`：監控與分析
- `/admin/adoptions`：單筆申請詳情與審核頁

收藏清單目前採會員 session 優先；登入後會自動合併舊匿名收藏到會員帳號，未登入時仍維持匿名 `clientId` 與 localStorage 同步，可直接在頁面清空整份清單。
收藏頁也支援搜尋與排序，方便在收藏數量增加後快速定位毛孩。
會員中心入口保留在導覽列與會員頁，首頁已移除額外會員提示卡。
收容所前台與首頁改讀 D1 API，後台可直接編輯收容所名稱、聯絡資訊、排序與待領養數量。
成功故事頁與首頁成功故事區會讀取 `/api/stories`，後台可從 `/admin/stories` 編輯標題、引言、作者、日期、頭像字與排序。
常見問題頁會讀取 `/api/faqs`，後台可從 `/admin/faqs` 編輯分類、問題、答案與排序。
領養須知頁會讀取 `/api/adoption-guide`，後台可從 `/admin/adoption-guide` 編輯每個區塊的標題、標籤、內容與排序。
首頁與申請頁會讀取 `/api/site-copies` 來套用可調整文案，後台可從 `/admin/site-copies` 編輯首頁 hero、CTA 與申請表單說明。
申請頁會在會員登入時自動帶入姓名與 Email，減少重複輸入。
BaseLayout 會記錄 page view 與錯誤事件，申請表單也會送出 form submit 事件，供 `/admin/analytics` 觀看。

管理後台目前已能從列表進入單筆申請詳情，直接核准、拒絕或改回待處理；也能從毛孩與收容所管理入口查看與編輯目前資料。之後再補更完整的驗證與管理能力。
毛孩管理也支援切換 `available`、`hidden`、`adopted` 狀態，前台列表只顯示 `available` 的毛孩。
毛孩管理第一版也已支援新增毛孩，封面圖已可直接上傳圖片並回填網址欄位，原本的網址欄位也還保留作為備援。
收容所管理也已可從後台查看與編輯，並同步反映到前台的合作夥伴頁與首頁。
會員最小版已可註冊、登入、登出，並透過 session cookie 讀取目前登入狀態。
註冊 Email 目前透過 MailChannels Email API 發送，正式站需設定 `MAILCHANNELS_API_KEY`、`MAIL_FROM_ADDRESS`、`MAIL_FROM_NAME`。
由於 MailChannels 需要在寄件網域上設定 SPF 與 `_mailchannels` TXT，正式寄信實務上要用你自己的網域，不能直接用 `pages.dev` 當寄件網域。
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

收藏紀錄，現階段會員 session 優先；未登入時以匿名 `clientId` 同步 localStorage，登入後可自動合併到會員帳號。

## 下一階段的擴充重點

- 會員系統最小版
- 收藏功能會員化
- 申請查詢
- 後台管理
- 圖片上傳
- 成功故事內容管理
- 常見問題內容管理
- SEO 與監控

## 簡短結論

這個專案現在的主線很清楚：

1. Astro 負責頁面
2. Hono + Pages Functions 負責 API
3. D1 `paws` 負責資料
4. `todo.md` 負責路線圖
