CREATE TABLE IF NOT EXISTS adoption_guide_sections (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  highlight TEXT NOT NULL,
  body TEXT NOT NULL,
  sort_order INTEGER NOT NULL DEFAULT 0
);

CREATE TABLE IF NOT EXISTS page_copies (
  id TEXT PRIMARY KEY,
  page_key TEXT NOT NULL,
  field_key TEXT NOT NULL,
  label TEXT NOT NULL,
  value TEXT NOT NULL,
  sort_order INTEGER NOT NULL DEFAULT 0
);

CREATE TABLE IF NOT EXISTS analytics_events (
  id TEXT PRIMARY KEY,
  event_type TEXT NOT NULL,
  page_path TEXT NOT NULL,
  status TEXT,
  source TEXT,
  detail_json TEXT,
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_analytics_events_type_created_at
  ON analytics_events (event_type, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_analytics_events_page_path_created_at
  ON analytics_events (page_path, created_at DESC);

INSERT OR REPLACE INTO adoption_guide_sections (
  id,
  title,
  highlight,
  body,
  sort_order
) VALUES
  ('prepare-home', '先準備好居住與照護環境', '領養前', '確認家人已取得共識、居住空間允許飼養，並先規劃食物、睡眠、散步與醫療預算。把生活節奏想清楚，會讓毛孩更快適應新家。', 1),
  ('learn-pet', '先認識毛孩，再送出申請', '申請前', '每隻毛孩都有自己的個性與需求。請先閱讀詳情頁的描述、標籤與故事，再決定是否適合你的家庭與生活方式。', 2),
  ('match-process', '申請後會經過面談與配對', '流程中', '送出申請後，合作單位會依毛孩狀況與申請內容進行比對，有些案件也可能安排電話訪談、見面互動或家訪。', 3),
  ('after-adoption', '領養後的 30 天最重要', '帶回家', '新環境可能讓毛孩緊張，建議先給牠安靜角落與固定作息。若出現適應問題，請保留飲食、排泄與互動紀錄，方便後續追蹤。', 4);

INSERT OR REPLACE INTO page_copies (
  id,
  page_key,
  field_key,
  label,
  value,
  sort_order
) VALUES
  ('home-hero-badge', 'home', 'home-hero-badge', '首頁英雄區徽章', '已有 12,847 隻毛孩找到新家', 1),
  ('home-hero-title-line1', 'home', 'home-hero-title-line1', '首頁英雄區第一行', '給牠們一個', 2),
  ('home-hero-title-highlight', 'home', 'home-hero-title-highlight', '首頁英雄區強調字', '溫暖的家', 3),
  ('home-hero-description', 'home', 'home-hero-description', '首頁英雄區說明', '每一隻毛孩都值得被愛。在這裡，你可以找到最適合你的毛孩夥伴，一起創造美好的回憶。', 4),
  ('home-hero-primary-cta', 'home', 'home-hero-primary-cta', '首頁主按鈕', '開始尋找毛孩', 5),
  ('home-hero-secondary-cta', 'home', 'home-hero-secondary-cta', '首頁次按鈕', '我想提供中途', 6),
  ('home-featured-pets-eyebrow', 'home', 'home-featured-pets-eyebrow', '首頁毛孩區標籤', 'Featured Pets', 7),
  ('home-featured-pets-title', 'home', 'home-featured-pets-title', '首頁毛孩區標題', '等待愛的毛孩們', 8),
  ('home-featured-pets-description', 'home', 'home-featured-pets-description', '首頁毛孩區說明', '每一隻都有獨特的故事，等待與你相遇', 9),
  ('home-how-it-works-eyebrow', 'home', 'home-how-it-works-eyebrow', '首頁流程區標籤', 'How It Works', 10),
  ('home-how-it-works-title', 'home', 'home-how-it-works-title', '首頁流程區標題', '簡單四步驟，開始領養', 11),
  ('home-how-it-works-description', 'home', 'home-how-it-works-description', '首頁流程區說明', '我們讓領養過程變得簡單又安心', 12),
  ('home-stories-eyebrow', 'home', 'home-stories-eyebrow', '首頁故事區標籤', 'Stories', 13),
  ('home-stories-title', 'home', 'home-stories-title', '首頁故事區標題', '溫馨的相遇故事', 14),
  ('home-stories-description', 'home', 'home-stories-description', '首頁故事區說明', '看看這些幸福的家庭如何與毛孩相遇', 15),
  ('home-shelters-eyebrow', 'home', 'home-shelters-eyebrow', '首頁合作夥伴區標籤', 'Partners', 16),
  ('home-shelters-title', 'home', 'home-shelters-title', '首頁合作夥伴區標題', '我們的合作夥伴', 17),
  ('home-shelters-description', 'home', 'home-shelters-description', '首頁合作夥伴區說明', '與全台收容所和中途之家合作，資料會從 D1 同步讀取。', 18),
  ('home-cta-title', 'home', 'home-cta-title', '首頁 CTA 標題', '準備好迎接新家人了嗎？', 19),
  ('home-cta-description', 'home', 'home-cta-description', '首頁 CTA 說明', '現在就開始尋找你的毛孩夥伴，給牠一個充滿愛的家', 20),
  ('home-cta-note', 'home', 'home-cta-note', '首頁 CTA 提醒', '💡 領養前建議：請確保你已準備好照顧毛孩一輩子的責任與承諾', 21),
  ('home-cta-primary-button', 'home', 'home-cta-primary-button', '首頁 CTA 主按鈕', '開始領養旅程', 22),
  ('home-cta-secondary-button', 'home', 'home-cta-secondary-button', '首頁 CTA 次按鈕', '了解更多資訊', 23),
  ('apply-hero-eyebrow', 'apply', 'apply-hero-eyebrow', '申請頁標籤', 'Apply', 1),
  ('apply-hero-title', 'apply', 'apply-hero-title', '申請頁標題', '領養 / 中途申請', 2),
  ('apply-hero-description', 'apply', 'apply-hero-description', '申請頁說明', '選擇你想認識的毛孩，填寫資料後直接送出申請。', 3),
  ('apply-member-title', 'apply', 'apply-member-title', '會員卡標題', '會員快速帶入', 4),
  ('apply-member-message', 'apply', 'apply-member-message', '會員卡說明', '如果你已登入，我們會自動帶入姓名與 Email，讓申請更快一點。', 5),
  ('apply-form-title', 'apply', 'apply-form-title', '申請表單標題', '申請資訊', 6),
  ('apply-form-description', 'apply', 'apply-form-description', '申請表單說明', '請先選擇毛孩，再填寫聯絡方式與簡短說明，我們會把資料送進 D1。', 7),
  ('apply-submit-button', 'apply', 'apply-submit-button', '申請表單送出按鈕', '送出申請', 8);
