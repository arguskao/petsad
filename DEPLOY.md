# 部署指南

這份文件只描述目前正式路線：Cloudflare Pages + Pages Functions + D1。
如果你只是想看舊版靜態頁面，可以使用 `npm run deploy:legacy`，但那不是正式平台路線。

## 正式部署流程

### 1. 安裝依賴

```bash
npm install
```

### 2. 建置專案

```bash
npm run build
```

### 3. 部署到 Cloudflare Pages

```bash
npm run deploy
```

`package.json` 目前的正式部署腳本會把 `dist/` 推到 Cloudflare Pages。

## D1 Migration

如果你有更新資料表結構，先套用 migration 到遠端 D1：

```bash
npx -y wrangler@4.92.0 d1 migrations apply paws --remote
```

本機測試若要套用 migration，可以使用本專案現有的 Wrangler 指令流程。

## 會員寄信設定

會員註冊目前會透過 MailChannels Email API 寄出臨時密碼。

正式站要能寄信，至少要補這些設定：

1. `MAILCHANNELS_API_KEY`
2. `MAIL_FROM_ADDRESS`
3. `MAIL_FROM_NAME`
4. 寄件網域 SPF：`include:relay.mailchannels.net`
5. 寄件網域 `_mailchannels` TXT 授權紀錄

`MAIL_FROM_ADDRESS` 請使用你自己的正式網域信箱，例如 `hello@yourdomain.com`。  
不要直接使用 `pages.dev` 當寄件地址，因為無法完成 MailChannels 所需的網域驗證。

## 舊版靜態頁面

舊版靜態首頁仍保留在 `public/`，只適合拿來看歷史版本或作為參考。

如果你要部署舊版靜態頁面：

```bash
npm run deploy:legacy
```

這條路線不包含現在的會員、收藏、後台與 D1 API。

## 非正式路線說明

目前這個專案的正式架構依賴 Cloudflare Pages Functions 與 D1，因此不建議把完整站點直接搬到 GitHub Pages、Vercel 或 Netlify。

如果你要換平台，會需要另外處理：

- API 路由的執行環境
- D1 的資料存取替代方案
- 會員 session 與收藏同步流程
- MailChannels 寄信設定

## 補充

- 目前正式建置輸出是 `dist/`
- `npm run dev` 是 Astro 開發模式
- `npm run dev:pages` 是模擬 Pages 入口的方式
