# PawsHome 後續開發 TODO

這份清單的目標，是把目前的靜態宣傳頁，逐步做成一個可以真的使用的寵物領養平台。

如果你要走長期擴充路線，先看同層的 [architecture.md](/Users/user/Documents/Code2/HTML/paws/architecture.md)。

## 架構方向：Astro v6

這個專案接下來會以 Astro v6 為主，搭配 Cloudflare Pages、Pages Functions、Hono、D1、R2、KV。

### 遷移原則

- 先保留目前首頁內容與視覺
- 先拆資料，再拆頁面
- 先做內容頁與列表頁，再做會員與後台
- 先讓功能可用，再優化體驗與結構

### 遷移順序

1. 建立 Astro v6 專案骨架
2. 把首頁搬到 `src/pages/index.astro`
3. 把目前的靜態資源整理到 `public/`
4. 把重複區塊拆成 `src/components/`
5. 把資料移到 `src/data/`
6. 再補 `functions/api/*`
7. 最後接 D1 / R2 / KV

### 目前進度

- 已建立 `astro.config.mjs`
- 已建立 `src/layouts/`、`src/components/`、`src/data/`、`src/pages/`
- 已新增首頁、列表頁、詳情頁、故事頁、合作夥伴頁、申請頁骨架
- 已保留舊版 `public/` 作為過渡參考
- 已通過 `pnpm run build:astro`
- 已完成列表頁篩選、寵物詳情頁與過渡 API

### 先做哪幾個檔案

- `src/pages/index.astro`
- `src/components/Header.astro`
- `src/components/Footer.astro`
- `src/components/PetCard.astro`
- `src/components/SectionHeader.astro`
- `src/data/pets.ts`
- `src/data/stories.ts`
- `src/data/shelters.ts`
- `src/styles/global.css`

## 先做的事

- [ ] 確認產品定位
  - 是「領養資訊入口」還是「完整媒合平台」
  - 先決定是否需要登入、收藏、申請表單、後台管理
- [ ] 決定資料來源
  - 先用假資料 JSON
  - 或直接接後端 API / 資料庫
- [ ] 定義首頁的主要轉換目標
  - 點擊開始領養
  - 搜尋毛孩
  - 收藏寵物
  - 提交領養意願

## Astro v6 遷移 TODO

- [x] 建立 Astro v6 專案骨架
  - 已建立等效的 Astro v6 骨架與設定
  - 已保留 Cloudflare Pages 的部署方向
  - 已確認 TypeScript 與 Astro build 可正常運作
- [x] 搬移目前首頁內容
  - Hero 區
  - 搜尋預覽
  - 精選毛孩
  - 領養流程
  - 成功故事
  - 合作夥伴
  - CTA 與 Footer
- [x] 拆出可重用元件
  - `Header`
  - `Button`
  - `PetCard`
  - `StoryCard`
  - `ShelterCard`
  - `SectionHeader`
- [x] 把資料抽離成模組
  - `pets`
  - `stories`
  - `shelters`
  - `navigation`
  - `site config`
- [x] 整理全域樣式
  - 色彩變數
  - 字級系統
  - 間距系統
  - 按鈕樣式
  - 卡片樣式
- [x] 保留互動效果
  - 平滑捲動
  - 收藏愛心
  - 通知提示
  - 滾動動畫
  - 彩蛋效果
- [x] 建立列表與詳情頁
  - `/pets`
  - `/pets/[id]`
  - `/stories`
  - `/shelters`
- [x] 建立 API 路由
  - Astro 過渡版先用 `/api/pets.json` 與 `/api/pets/[id].json`
  - 之後改由 Pages Functions 提供正式 `/api/pets`
  - `GET /api/pets`
  - `GET /api/pets/:id`
  - `POST /api/adoptions`
  - `POST /api/favorites`
- [ ] 接上資料庫
  - 先設計 D1 schema
  - 再寫 migration
  - 再串 API
  - 最後才做管理後台
- [ ] 檢查部署設定
  - Cloudflare Pages build output
  - `wrangler.toml`
  - preview / production 環境變數
  - SEO 與社群分享標籤

## 第一階段：把靜態頁變成可用頁面

- [ ] 把目前的假資料整理成獨立資料檔
  - 寵物資料
  - 收容所資料
  - 成功故事
- [ ] 讓搜尋區真的有篩選效果
  - 類型
  - 年齡
  - 體型
  - 地區
- [ ] 讓「了解更多」能進入寵物詳情頁
  - 顯示照片
  - 基本資料
  - 個性描述
  - 領養條件
- [ ] 讓收藏功能有持久化
  - 先存在 localStorage
  - 之後再接會員帳號
- [ ] 補上基本表單
  - 領養申請
  - 聯絡我們
  - 提供中途

## 第二階段：建立後端與資料流

- [ ] 建立寵物資料 API
  - `GET /api/pets`
  - `GET /api/pets/:id`
  - `GET /api/pets/search`
- [ ] 建立收藏 API
  - `POST /api/pets/:id/favorite`
  - `DELETE /api/pets/:id/favorite`
- [ ] 建立申請流程 API
  - 送出領養申請
  - 查詢申請狀態
  - 後台審核
- [ ] 建立收容所資料 API
  - 列出合作夥伴
  - 顯示各收容所待領養數量

## 第三階段：做成完整產品

- [ ] 新增會員系統
  - 註冊
  - 登入
  - 個人收藏清單
  - 申請紀錄
- [ ] 新增寵物上架流程
  - 收容所或管理員可新增寵物
  - 上傳照片
  - 編輯狀態
  - 下架已領養寵物
- [ ] 新增後台管理
  - 審核領養申請
  - 管理毛孩資料
  - 管理合作機構
  - 管理內容文案

## 第四階段：提升體驗與可信度

- [ ] 補齊 SEO
  - `title`
  - `description`
  - Open Graph
  - Twitter Card
  - sitemap
  - robots.txt
- [ ] 補齊無障礙
  - 按鈕與連結的語意
  - keyboard 操作
  - focus 樣式
  - 替代文字
- [ ] 補齊效能
  - 壓縮圖片
  - 減少不必要動畫
  - 延遲載入非首屏內容
- [ ] 補齊真實資訊
  - 領養流程說明
  - 常見問題
  - 領養須知
  - 聯絡方式

## 第五階段：部署與維護

- [ ] 確認 Cloudflare Pages 設定
  - `wrangler.toml`
  - build 輸出資料夾
  - preview / production 環境
- [ ] 建立測試清單
  - 桌機版
  - 手機版
  - Safari / Chrome / Firefox
- [ ] 加上基本監控
  - 錯誤追蹤
  - 使用分析
  - 表單送出成功率

## 建議的實作順序

1. 先把搜尋和詳情頁做出來，讓網站「能用」。
2. 再把收藏與申請流程接起來，讓網站「能完成動作」。
3. 接著做登入、後台、上架流程，讓平台「能營運」。
4. 最後補 SEO、無障礙、效能和監控，讓產品「能長期維持」。

## 目前這個專案最適合的下一步

- [ ] 先建立 Astro v6 專案骨架
- [ ] 先搬首頁到 `src/pages/index.astro`
- [ ] 先做 `PetCard` 和 `SectionHeader` 這兩個共用元件
- [ ] 先把 `pets` 資料抽出來
- [ ] 再做 `/pets/[id]` 詳情頁與搜尋篩選
