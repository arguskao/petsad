這東西很棒
https://github.com/nextlevelbuilder/ui-ux-pro-max-skill
從這裡可以發揮

# PawsHome - 寵物領養平台 Landing Page

溫馨感人的寵物領養平台著陸頁，使用溫暖色調與動態互動效果，使用 Cloudflare Pages 部署。

目前專案正在從純靜態 `public/` 版本，遷移到 Astro v6 架構。新的頁面骨架在 `src/`，舊版靜態檔案會暫時保留作為參考。

## 功能特色

- 🐾 溫暖親切的視覺設計
- 💝 動態寵物卡片展示
- 🔍 智慧搜尋篩選預覽
- 📖 感人的成功領養故事
- 🏥 收容所合作夥伴展示
- 📱 完全響應式設計
- ⚡ 極速載入（Cloudflare Edge）
- 🎨 豐富的互動動畫
- 🔧 易於客製化

## 設計特色

### 溫暖色調
- 主色：珊瑚紅 (#FF6B6B)
- 輔色：溫暖橙 (#FFB84D)
- 點綴色：青綠色 (#4ECDC4)
- 背景：溫暖米色系

### 動態互動
- 懸浮動畫的寵物卡片
- 愛心收藏功能
- 漂浮的腳印裝飾
- 平滑滾動與淡入效果
- 數字計數動畫

### 情感設計
- 可愛的 Emoji 圖示
- 溫馨的文案與故事
- 親切的圓角設計
- 柔和的陰影效果

## 專案結構

```
.
├── astro.config.mjs    # Astro 設定
├── public/             # 舊版靜態首頁（過渡參考）
├── src/
│   ├── components/     # 可重用元件
│   ├── data/           # 寵物 / 故事 / 合作夥伴資料
│   ├── layouts/        # 共用版型
│   ├── pages/          # Astro 頁面
│   └── styles/         # 全域樣式
├── static/             # Astro publicDir（過渡時保持空目錄）
├── package.json
├── tsconfig.json
└── wrangler.toml       # Cloudflare 設定
```

## 頁面區塊

1. **Hero 區**：主視覺 + 統計數據 + 漂浮腳印
2. **搜尋預覽**：快速篩選功能展示
3. **精選寵物**：動態寵物卡片網格（含愛心收藏）
4. **領養流程**：簡單四步驟說明
5. **成功故事**：溫馨的領養故事分享
6. **合作夥伴**：收容所與中途之家
7. **CTA 區**：強力的領養呼籲
8. **Footer**：完整的頁尾資訊

## 快速開始

### 1. 安裝依賴

```bash
npm install
```

### 2. 本地開發

```bash
npm run dev
```

預設會啟動 Astro v6 開發伺服器。

如果你要驗證完整的 Cloudflare Pages + Functions 流程：

```bash
npm run build:astro
npm run dev:pages
```

### 3. 部署到 Cloudflare Pages

```bash
npm run deploy
```

Astro 版本與正式 API 路線已經是預設路徑；如果你要先看靜態舊版：

```bash
npm run deploy:legacy
```

## 客製化指南

### 修改品牌資訊

舊版靜態頁可以在 `public/index.html` 裡修改；Astro 版建議優先改這些檔案：
- `src/data/site.ts`：網站名稱、標題、描述、導覽列
- `src/pages/index.astro`：首頁文案與區塊內容
- `src/components/Header.astro` / `src/components/Footer.astro`：導覽與頁尾
- `src/layouts/BaseLayout.astro`：meta 標籤與共用 `<head>`

### 調整顏色主題

舊版靜態頁在 `public/styles.css`；Astro 版請改 `src/styles/global.css` 的 `:root` 區塊：

```css
:root {
    --primary: #FF6B6B;        /* 主色（珊瑚紅）*/
    --secondary: #FFB84D;      /* 輔色（溫暖橙）*/
    --accent: #4ECDC4;         /* 點綴色（青綠）*/
    --warm-bg: #FFF5F0;        /* 溫暖背景 */
}
```

### 添加真實寵物照片

替換 `.pet-emoji` 佔位符：
1. 在 `public/images/pets/` 目錄添加寵物照片，或改放到 Astro 的 `static/`
2. 修改 `src/components/PetCard.astro` 的 `.pet-placeholder`
3. 如果要改成真實照片，優先把資料放進 `src/data/pets.ts`
4. 建議使用 WebP 格式以優化載入速度

### 連接 D1 資料庫

這個專案已經先建立 Cloudflare D1 `paws`，並且在 `wrangler.toml` 綁定成同名 `paws` binding。

如果你有新增 migration，記得套用到遠端資料庫：

```bash
npx -y wrangler@4.92.0 d1 migrations apply paws --remote
```

本地開發如果要模擬 D1，也可以用 Pages dev 搭配 `--d1` 綁定。

### 連接後端 API

在前端中連接你的寵物 API：

```javascript
// 搜尋寵物
async function searchPets(filters) {
    const response = await fetch('/api/pets/search', {
        method: 'POST',
        body: JSON.stringify(filters)
    });
    return await response.json();
}

// 收藏寵物
async function favoritePet(petId) {
    const response = await fetch(`/api/pets/${petId}/favorite`, {
        method: 'POST'
    });
    return await response.json();
}
```

### 連接後端 API

在前端互動事件處理器中添加你的 API 呼叫：

```javascript
button.addEventListener('click', async (e) => {
    // 替換為你的 API endpoint
    const response = await fetch('/api/signup', {
        method: 'POST',
        body: JSON.stringify({ email: userEmail })
    });
});
```

## 進階功能

### 添加 Cloudflare Functions

在 `functions/` 目錄建立 API endpoints：

```typescript
// functions/api/contact.ts
import { Hono } from 'hono'

const app = new Hono()

app.post('/api/contact', async (c) => {
    const body = await c.req.json()
    // 處理聯絡表單
    return c.json({ success: true })
})

export default app
```

### 整合分析工具

在 `public/index.html` 的 `<head>` 中添加：

```html
<!-- Google Analytics -->
<script async src="https://www.googletagmanager.com/gtag/js?id=GA_MEASUREMENT_ID"></script>

<!-- Cloudflare Web Analytics -->
<script defer src='https://static.cloudflareinsights.com/beacon.min.js' 
        data-cf-beacon='{"token": "YOUR_TOKEN"}'></script>
```

## 效能優化

- 所有靜態資源透過 Cloudflare CDN 分發
- CSS 和 JS 已優化，無需額外打包
- 圖片建議使用 WebP 格式
- 啟用 Cloudflare 的自動壓縮和快取

## SEO 優化建議

1. 更新 meta 標籤（已包含基礎設定）
2. 添加 Open Graph 標籤用於社群分享
3. 建立 `robots.txt` 和 `sitemap.xml`
4. 使用語意化 HTML 標籤
5. 確保所有圖片都有 alt 屬性

## 瀏覽器支援

- Chrome（最新版）
- Firefox（最新版）
- Safari（最新版）
- Edge（最新版）

## 授權

MIT License

## 技術支援

如有問題，請查看：
- [Cloudflare Pages 文件](https://developers.cloudflare.com/pages/)
- [Hono 文件](https://hono.dev/)
# petsad
