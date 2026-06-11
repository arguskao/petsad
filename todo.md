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
- `/api/favorites` 已可用
- `/api/admin/summary`、`/api/admin/adoptions`、`/api/admin/favorites` 已可用
- `/api/admin/adoptions/:id` 已可用
- `/api/admin/pets/:id` 已可用
- `/api/admin/pets` 已可用
- `POST /api/adoptions` 已寫入 `adoption_requests`
- 收藏先走 localStorage，並同步到 `POST/DELETE /api/favorites`
- `/pets` 頁已直接改成讀 `/api/pets`
- `/pets/[id]` 頁已直接讀 `/api/pets/:id`
- `/apply` 頁已接上申請流程，送出後會導到結果頁
- `/favorites` 頁已可查看收藏清單
- `/favorites` 頁已可清空收藏
- `/favorites` 頁已可搜尋與排序收藏
- 首頁、列表頁與導覽列已顯示收藏數量提示
- `/admin` 最小版管理後台已建立，且後台頁已設定 `noindex`
- `/admin` 已可核准 / 拒絕申請
- `/admin/pets` 已可查看毛孩清單
- `/admin/pets` 已可查看單筆毛孩詳情
- `/admin/pets` 已可編輯毛孩資料
- `/admin/pets` 已可下架 / 標記已領養 / 恢復上架
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

- [ ] 把收藏功能接成會員版
  - 目前已完成 localStorage 與 D1 同步
  - 下一步再接會員資料表
  - 再補收藏清單頁
- [x] 補齊申請流程的使用體驗
  - 已補成功頁
  - 已補基本驗證與送出後導向
  - 申請編號會帶到結果頁
- [x] 讓 `/pets`、`/pets/[id]` 與 `/apply` 的 UI 更一致
  - 共用更完整的資料顯示區塊
  - 提高在手機上的可讀性
- [x] 補齊部署設定
  - 已把 `BaseLayout` 做成可配置 canonical / image / noindex
  - admin 頁已避免被搜尋引擎收錄
  - 公開頁之後可逐頁補 canonical 與社群圖

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
- [ ] 建立收容所資料管理
  - 列出合作夥伴
  - 顯示可領養數量
  - 維護聯絡資訊

## 長期目標

這一段是平台化之後才做的事。

- [ ] 會員系統
  - 註冊
  - 登入
  - 個人收藏清單
  - 申請紀錄
- [ ] 寵物上架流程
  - 圖片上傳
  - 狀態管理
  - 編輯與下架
- [ ] 更完整的內容管理
  - 成功故事
  - 常見問題
  - 領養須知
  - 頁面文案管理
- [ ] 監控與分析
  - 錯誤追蹤
  - 使用分析
  - 表單送出成功率

## 只記錄

這一段是目前先放著，不代表接下來一定立刻做。

- 會員系統
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

## 建議順序

1. 先把收藏功能補起來
2. 再把申請流程做完整
3. 接著做後台最小版本
4. 最後補會員、SEO、監控與營運工具
