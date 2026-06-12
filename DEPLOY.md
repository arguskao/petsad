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

## Demo 資料同步

如果你要把 demo 毛孩資料與範例申請同步到資料庫，可以用這些指令：

```bash
npm run seed:demo:local
```

這會更新本機 D1，適合在開發時反覆重置測試資料。

如果要同步到遠端 D1，使用：

```bash
npm run seed:demo:remote
```

遠端版本會把 demo 毛孩的 `coverImageUrl` 一起補上，並同步範例申請資料。

## Google 登入設定

正式會員登入改用 Google OAuth，不需要再處理寄驗證信。

正式站至少要補這些設定：

1. `GOOGLE_CLIENT_ID`
2. `GOOGLE_CLIENT_SECRET`
3. Google Cloud Console OAuth 2.0 redirect URI：`https://你的網域/api/auth/google/callback`

這兩個值建議放在 Cloudflare Pages 專案的 `Settings > Variables and Secrets`，正式環境與 Preview 環境分開設定。

如果你要在本機測試 Google 登入，記得也把本機 redirect URI 加進 OAuth client，例如：

- `http://localhost:4321/api/auth/google/callback`

本機如果要模擬 Pages Functions + 環境變數，可以用 `wrangler pages dev` 並加上 `--binding=GOOGLE_CLIENT_ID=...`、`--binding=GOOGLE_CLIENT_SECRET=...`。

如果你還有保留舊的 Email 註冊流程，`/api/auth/register` 仍會依賴 MailChannels 與寄件網域驗證，但正式會員主線已改成 Google 登入。

## 部署前檢查清單

上線前先確認這些項目：

- [ ] `GOOGLE_CLIENT_ID` 與 `GOOGLE_CLIENT_SECRET` 已在正式環境設定好
- [ ] Google Cloud Console 已加入正式站 callback URI：`https://你的網域/api/auth/google/callback`
- [ ] `npm run build` 已通過
- [ ] `npm run dev:pages` 可在本機完成 Google 登入
- [ ] `ADMIN_EMAIL_ALLOWLIST` 已設定完成，如果需要測後台權限

## 五分鐘快速檢查

如果你只想先快速確認最重要的項目，照這五條看：

- [ ] `GOOGLE_CLIENT_ID` 已設定在 Cloudflare Pages 的正式環境
- [ ] `GOOGLE_CLIENT_SECRET` 已設定在 Cloudflare Pages 的正式環境
- [ ] Google Cloud Console 已加入正式站 callback URI：`https://你的網域/api/auth/google/callback`
- [ ] `npm run build` 已通過
- [ ] `npm run dev:pages` 已能在本機打開 `/auth/login` 並順利導向 Google
- [ ] `ADMIN_EMAIL_ALLOWLIST` 已設定完成，如果需要測後台權限

## `wrangler.toml` 與 Pages 設定分工

目前這個專案的 `wrangler.toml` 主要負責正式路線會共用的基礎綁定：

- `pages_build_output_dir`
- `d1_databases`
- `r2_buckets`

Google OAuth 這類秘密值，請一律放在 Pages 的 Variables and Secrets，正式環境與 Preview 環境分開設定。

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
- Google OAuth 登入設定

## 補充

- 目前正式建置輸出是 `dist/`
- `npm run dev` 是 Astro 開發模式
- `npm run dev:pages` 是模擬 Pages 入口的方式
