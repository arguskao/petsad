# 部署指南

## 部署到 GitHub Pages

### 步驟 1：建立 GitHub Repository

1. 在 GitHub 上建立新的 repository
2. 將本地專案推送到 GitHub：

```bash
git init
git add .
git commit -m "Initial commit: PawsHome pet adoption platform"
git branch -M main
git remote add origin https://github.com/你的使用者名稱/你的repo名稱.git
git push -u origin main
```

### 步驟 2：啟用 GitHub Pages

1. 進入你的 GitHub repository
2. 點擊 **Settings** > **Pages**
3. 在 **Source** 選擇 **GitHub Actions**
4. 完成！你的網站會自動部署

### 步驟 3：訪問你的網站

部署完成後，你的網站會在：
```
https://你的使用者名稱.github.io/你的repo名稱/
```

## 部署到 Cloudflare Pages

### 方法 1：使用 Wrangler CLI

```bash
# 安裝依賴
pnpm install

# 部署到 Cloudflare Pages
pnpm deploy
```

### 方法 2：透過 Cloudflare Dashboard

1. 登入 [Cloudflare Dashboard](https://dash.cloudflare.com/)
2. 進入 **Pages** > **Create a project**
3. 連接你的 GitHub repository
4. 設定建置配置：
   - **Build command**: 留空
   - **Build output directory**: `public`
5. 點擊 **Save and Deploy**

## 部署到 Vercel

```bash
# 安裝 Vercel CLI
npm i -g vercel

# 部署
vercel --prod
```

設定：
- **Framework Preset**: Other
- **Build Command**: 留空
- **Output Directory**: `public`

## 部署到 Netlify

### 方法 1：拖放部署

1. 訪問 [Netlify Drop](https://app.netlify.com/drop)
2. 直接拖放 `public` 資料夾

### 方法 2：Git 整合

1. 登入 [Netlify](https://app.netlify.com/)
2. 點擊 **Add new site** > **Import an existing project**
3. 連接你的 GitHub repository
4. 設定建置配置：
   - **Build command**: 留空
   - **Publish directory**: `public`
5. 點擊 **Deploy site**

## 自訂網域

### GitHub Pages

1. 在 repository 的 **Settings** > **Pages**
2. 在 **Custom domain** 輸入你的網域
3. 在你的 DNS 設定中添加 CNAME 記錄

### Cloudflare Pages

1. 在 Cloudflare Pages 專案設定中
2. 點擊 **Custom domains**
3. 添加你的網域

## 環境變數設定

如果你需要連接後端 API，在各平台設定環境變數：

### GitHub Pages
在 `.github/workflows/deploy.yml` 中添加：
```yaml
env:
  API_URL: ${{ secrets.API_URL }}
```

### Cloudflare Pages
在 Dashboard 的 **Settings** > **Environment variables** 添加

### Vercel/Netlify
在專案設定的 **Environment variables** 區域添加

## 更新網站

只需要推送新的 commit 到 GitHub：

```bash
git add .
git commit -m "Update content"
git push
```

GitHub Actions 會自動重新部署你的網站！

## 疑難排解

### 樣式或 JS 沒有載入

如果部署後樣式沒有正確載入，可能是路徑問題。

在 `public/index.html` 中，確保資源路徑正確：

```html
<!-- 如果部署在子目錄，使用相對路徑 -->
<link rel="stylesheet" href="./styles.css">
<script src="./script.js"></script>

<!-- 或使用絕對路徑 -->
<link rel="stylesheet" href="/styles.css">
<script src="/script.js"></script>
```

### GitHub Pages 404 錯誤

確保：
1. `public` 資料夾包含 `index.html`
2. GitHub Actions workflow 正確設定
3. Pages 設定中選擇了 **GitHub Actions** 作為 source

## 效能優化建議

部署前可以做的優化：

1. **壓縮圖片**：使用 WebP 格式
2. **最小化 CSS/JS**：使用建置工具
3. **啟用快取**：在 Cloudflare 或 CDN 設定
4. **使用 CDN**：加速全球訪問

## 監控與分析

### Google Analytics

在 `public/index.html` 的 `<head>` 中添加：

```html
<!-- Google Analytics -->
<script async src="https://www.googletagmanager.com/gtag/js?id=GA_MEASUREMENT_ID"></script>
<script>
  window.dataLayer = window.dataLayer || [];
  function gtag(){dataLayer.push(arguments);}
  gtag('js', new Date());
  gtag('config', 'GA_MEASUREMENT_ID');
</script>
```

### Cloudflare Web Analytics

在 Cloudflare Pages 設定中啟用 Web Analytics，無需修改程式碼。
