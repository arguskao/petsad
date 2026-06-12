# PawsHome Roadmap

這份文件的目標，是把目前的 PawsHome 從靜態展示，逐步做成一個可長期擴充的寵物領養平台。

如果你要先看系統怎麼拆，先讀同層的 [architecture.md](/Users/user/Documents/Code2/HTML/paws/architecture.md)。

## 方向

- 前端：Astro v6
- API：Cloudflare Pages Functions + Hono
- 資料庫：Cloudflare D1
- 資料綁定：`paws`
- 之後擴充：R2、KV、Turnstile、會員與後台

## 現況

- Astro v6 骨架已完成
- `src/pages/`、`src/components/`、`src/data/`、`functions/api/` 都已建立
- `wrangler.toml` 已綁定 D1 `paws`
- `migrations/0001_init.sql` 已建立並套用到遠端
- `migrations/0002_add_pet_status.sql` 已建立並套用到遠端
- `/api/pets`、`/api/pets/:id`、`/api/stories`、`/api/shelters` 已可用
- `/api/faqs` 已可用
- `/api/favorites` 已可用
- `/api/admin/summary`、`/api/admin/adoptions`、`/api/admin/favorites` 已可用
- `/api/admin/adoptions/:id` 已可用
- `/api/admin/pets/:id` 已可用
- `/api/admin/pets` 已可用
- `/api/admin/stories`、`/api/admin/stories/:id` 已可用
- `/api/admin/faqs`、`/api/admin/faqs/:id` 已可用
- `/api/adoption-guide` 已可用
- `/api/site-copies` 已可用
- `/api/analytics/events` 已可用
- `/api/admin/adoption-guide`、`/api/admin/adoption-guide/:id` 已可用
- `/api/admin/site-copies`、`/api/admin/site-copies/:id` 已可用
- `/api/admin/analytics` 已可用
- `/api/auth/me`、`/api/auth/register`、`/api/auth/login`、`/api/auth/logout` 已可用
- `/api/auth/register` 已改成姓名 + Email 註冊，並串接 MailChannels Email API
- `POST /api/adoptions` 已寫入 `adoption_requests`
- 收藏已可會員同步，登入後會自動合併匿名收藏，未登入時仍保留匿名 localStorage 與 D1 同步
- `/pets` 頁已直接改成讀 `/api/pets`
- `/pets/[id]` 頁已直接讀 `/api/pets/:id`
- `/apply` 頁已接上申請流程，送出後會導到結果頁
- `/auth/login`、`/auth/register`、`/member` 已建立
- `/faq` 已建立，並會讀取 D1 FAQ 資料
- `/adoption-guide` 已建立，並會讀取 D1 領養須知資料
- 註冊流程已改成由 Email 寄送臨時密碼
- 正式站寄信仍需完成 `MAILCHANNELS_API_KEY`、`MAIL_FROM_ADDRESS` 與寄件網域 DNS 設定
- `/favorites` 頁已可查看收藏清單
- `/favorites` 頁已可清空收藏
- `/favorites` 頁已可搜尋與排序收藏
- 首頁、列表頁與導覽列已顯示收藏數量提示
- 導覽列與會員頁已保留會員入口，首頁已移除多餘會員提示卡
- `/shelters`、`/admin/shelters` 已接上 D1 收容所資料管理
- `shelters` 已補聯絡資訊欄位，前台與後台會同步讀取
- `/apply` 已可依登入會員自動帶入姓名與 Email
- `/admin` 最小版管理後台已建立，且後台頁已設定 `noindex`
- `/admin` 已可核准 / 拒絕申請
- `/admin/pets` 已可查看毛孩清單
- `/admin/pets` 已可查看單筆毛孩詳情
- `/admin/pets` 已可新增毛孩，上架流程第一版可用，封面圖已支援網址與圖片上傳
- `/admin/pets` 已可編輯毛孩資料
- `/admin/pets` 已可下架 / 標記已領養 / 恢復上架
- `/admin/stories` 已可查看與編輯成功故事內容
- `/admin/faqs` 已可查看與編輯常見問題內容
- `/admin/adoption-guide` 已可查看與編輯領養須知內容
- `/admin/site-copies` 已可查看與編輯頁面文案
- `/admin/analytics` 已可查看頁面使用、錯誤與申請事件
- `/admin/adoptions` 已可查看單筆申請詳情
- `pnpm run build` 已通過

## 已完成

- [x] 建立 Astro v6 專案骨架
- [x] 搬移首頁內容到 Astro 頁面
- [x] 拆出共用元件
- [x] 把內容資料整理成 `src/data/`
- [x] 建立 `/pets`、`/pets/[id]`、`/stories`、`/shelters`、`/apply`
- [x] 建立 Pages Functions API
- [x] 接上 D1 `paws`
- [x] 建立 migration 並套用遠端
- [x] 讓 `/pets` 直接吃 API
- [x] 讓 `/pets/[id]` 直接吃 API
- [x] 讓 `/apply` 可以送出領養申請
- [x] 讓收藏先可持久化
  - localStorage 已可保存收藏狀態
  - 已同步到 D1 `favorites`
- [x] 建立 `/favorites` 頁
  - 可查看匿名收藏清單
  - 可從列表回到毛孩詳情
- [x] 建立 `/admin` 頁
  - 可查看最小版統計
  - 可看最近申請與最近收藏
- [x] 建立申請詳情頁
  - 可查看單筆申請完整內容
  - 可從列表切入
  - 可直接核准、拒絕、改回待處理
- [x] 申請審核操作
  - 可核准申請
  - 可拒絕申請
  - 可改回待處理

## 近期目標

這一段是接下來最值得做、也最能直接增加產品完成度的工作。

- [x] 會員系統最小版
  - 註冊 / 登入 / 登出
  - session 或 token 的身分識別
  - 先保留匿名收藏資料，之後再做遷移
- [x] 把收藏功能接成會員版
  - 登入後收藏會綁到會員 session
  - 舊匿名收藏會自動合併到會員帳號
  - 未登入時仍保留匿名 localStorage 與 D1 同步
  - 收藏清單頁會依身分載入對應收藏
- [x] 補齊申請流程的使用體驗
  - 已補成功頁
  - 已補基本驗證與送出後導向
  - 申請編號會帶到結果頁
- [x] 讓 `/pets`、`/pets/[id]` 與 `/apply` 的 UI 更一致
  - 共用更完整的資料顯示區塊
  - 提高在手機上的可讀性
- [x] 會員入口整合
  - 導覽列保留會員中心入口
  - 首頁已移除多餘會員提示卡
- [x] 收容所資料管理
  - 收容所前台改成讀 D1 API
  - 後台可檢視與編輯收容所資料
  - 補上聯絡資訊欄位
- [x] 申請流程的小升級
  - 會員登入時會自動帶入姓名與 Email
  - 讓申請表單更快完成
- [x] 補齊部署設定
  - 已把 `BaseLayout` 做成可配置 canonical / image / noindex
  - admin 頁已避免被搜尋引擎收錄
  - 公開頁之後可逐頁補 canonical 與社群圖
- [ ] 完成會員寄信正式設定
  - 先記錄，之後再處理
  - 目前正式站註冊會因缺少寄信設定而回 `503`
  - 設定 `MAILCHANNELS_API_KEY`
  - 設定 `MAIL_FROM_ADDRESS` / `MAIL_FROM_NAME`
  - 在自有網域補上 SPF 與 `_mailchannels` TXT
  - 補完後再重新測試 `/api/auth/register`

## 中期目標

這一段是把網站從「能用」推進到「能營運」。

- [x] 建立收藏 API
  - `GET /api/favorites`
  - `POST /api/favorites`
  - `DELETE /api/favorites`
- [x] 建立管理後台 API
  - `GET /api/admin/summary`
  - `GET /api/admin/adoptions`
  - `GET /api/admin/adoptions/:id`
  - `GET /api/admin/pets`
  - `GET /api/admin/favorites`
  - `GET /api/admin/pets/:id`
  - `PATCH /api/admin/pets/:id`
  - `PATCH /api/admin/adoptions/:id`
- [x] 建立申請查詢 API
  - 可查單筆申請詳情
  - 可追蹤審核流程
- [x] 建立後台最小版本
  - 下架已領養毛孩
  - 後續再補更多編輯與審核能力
- [x] 建立毛孩管理入口
  - 可查看毛孩清單
  - 可查看單筆毛孩詳情
  - 可編輯毛孩資料
  - 可切換毛孩狀態
  - 可從後台切到前台毛孩頁
  - 可直接前往申請表單
- [x] 建立收容所資料管理
  - 列出合作夥伴
  - 顯示可領養數量
  - 維護聯絡資訊

## 長期目標

這一段是平台化之後才做的事。

- [x] 寵物上架流程
  - 已支援圖片上傳
  - 已支援狀態管理
  - 已支援編輯與下架
- [ ] 更完整的內容管理
- [x] 成功故事
- [x] 常見問題
  - [x] 領養須知
  - [x] 頁面文案管理
- [x] 監控與分析
  - [x] 錯誤追蹤
  - [x] 使用分析
  - [x] 表單送出成功率

## 只記錄

這一段是目前先放著，不代表接下來一定立刻做。

- 寵物上架流程
- 更完整的內容管理
- 監控與分析
- 收容所資料管理
- 後台最小版本
- 寵物、故事、收容所全面移到 D1
- 申請流程改成更完整狀態機
- 後台逐步擴充成正式管理系統

## 技術債與待決策

- [ ] 寵物、故事、收容所要不要全面移到 D1
- [ ] 申請流程要先維持寫入 + 審核，還是改成更完整狀態機
- [ ] 後台要不要逐步擴充成正式管理系統

## 下一週優先順序

1. 先完成會員寄信正式設定
   - 設定 `MAILCHANNELS_API_KEY`
   - 設定 `MAIL_FROM_ADDRESS` / `MAIL_FROM_NAME`
   - 補 SPF 與 `_mailchannels` TXT
   - 再重測 `/api/auth/register`
2. 再決定資料與流程的兩個核心方向
   - `pets`、`stories`、`shelters` 已先維持 D1 為資料來源，fallback 只保留給開發 / 離線
   - 申請流程先維持 `pending / approved / rejected`，並把狀態規則收斂成共用定義
3. 接著補更完整的內容管理範圍
   - 讓更多頁面文案與內容區塊可由後台維護
   - 先挑最常改、最影響營運的區塊
4. 最後再擴充正式管理系統
   - 規劃更完整的後台權限與操作流程
   - 把目前的最小版後台逐步平台化
