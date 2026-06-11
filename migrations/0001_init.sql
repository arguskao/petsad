CREATE TABLE IF NOT EXISTS pets (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  species TEXT NOT NULL CHECK (species IN ('dog', 'cat', 'other')),
  gender TEXT NOT NULL CHECK (gender IN ('male', 'female')),
  age TEXT NOT NULL,
  age_group TEXT NOT NULL CHECK (age_group IN ('young', 'adult', 'senior')),
  size TEXT NOT NULL,
  size_group TEXT NOT NULL CHECK (size_group IN ('small', 'medium', 'large')),
  location TEXT NOT NULL,
  location_key TEXT NOT NULL CHECK (location_key IN ('taipei', 'newtaipei', 'taoyuan', 'taichung', 'tainan', 'kaohsiung')),
  emoji TEXT NOT NULL,
  badge_label TEXT,
  badge_tone TEXT CHECK (badge_tone IN ('urgent', 'new', 'default')),
  description TEXT NOT NULL,
  story TEXT NOT NULL,
  tags_json TEXT NOT NULL,
  sort_order INTEGER NOT NULL DEFAULT 0
);

CREATE TABLE IF NOT EXISTS stories (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  quote TEXT NOT NULL,
  author TEXT NOT NULL,
  date TEXT NOT NULL,
  avatar TEXT NOT NULL,
  emoji TEXT NOT NULL,
  sort_order INTEGER NOT NULL DEFAULT 0
);

CREATE TABLE IF NOT EXISTS shelters (
  id TEXT PRIMARY KEY,
  icon TEXT NOT NULL,
  name TEXT NOT NULL,
  description TEXT NOT NULL,
  location TEXT NOT NULL,
  available_pets INTEGER NOT NULL,
  sort_order INTEGER NOT NULL DEFAULT 0
);

CREATE TABLE IF NOT EXISTS adoption_requests (
  id TEXT PRIMARY KEY,
  pet_id TEXT NOT NULL,
  full_name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT NOT NULL,
  note TEXT,
  status TEXT NOT NULL DEFAULT 'pending',
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (pet_id) REFERENCES pets(id)
);

CREATE TABLE IF NOT EXISTS favorites (
  id TEXT PRIMARY KEY,
  pet_id TEXT NOT NULL,
  user_id TEXT,
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (pet_id) REFERENCES pets(id)
);

INSERT OR REPLACE INTO pets (
  id,
  name,
  species,
  gender,
  age,
  age_group,
  size,
  size_group,
  location,
  location_key,
  emoji,
  badge_label,
  badge_tone,
  description,
  story,
  tags_json,
  sort_order
) VALUES
  ('xiaohuang', '小黃', 'dog', 'male', '2 歲', 'adult', '中型犬', 'medium', '台北市', 'taipei', '🐕', '急需領養', 'urgent', '個性溫和親人，喜歡散步和玩球，適合有院子的家庭。', '小黃原本被救援時很膽小，現在已經學會安心地靠近人。', '["親人","活潑","已結紮"]', 1),
  ('mimi', '咪咪', 'cat', 'female', '1 歲', 'adult', '小型貓', 'small', '新北市', 'newtaipei', '🐈', NULL, NULL, '安靜乖巧，喜歡曬太陽和被摸摸，適合公寓飼養。', '咪咪最喜歡窗邊的位置，會安靜陪伴每一個回家的晚上。', '["安靜","獨立","已結紮"]', 2),
  ('lucky', 'Lucky', 'dog', 'male', '5 歲', 'adult', '大型犬', 'large', '桃園市', 'taoyuan', '🐕‍🦺', NULL, NULL, '忠誠可靠，已訓練良好，適合有經驗的飼主。', 'Lucky 曾經流浪很久，現在只想找一個能陪他散步的家。', '["忠誠","聰明","已訓練"]', 3),
  ('chengzi', '橘子', 'cat', 'male', '3 個月', 'young', '幼貓', 'small', '台中市', 'taichung', '🐱', '新到', 'new', '活潑好動的小橘貓，充滿好奇心，等待第一個家。', '橘子總是第一個跑來探索新事物，是一團可愛的小火球。', '["活潑","好奇","健康"]', 4);

INSERT OR REPLACE INTO stories (
  id,
  title,
  quote,
  author,
  date,
  avatar,
  emoji,
  sort_order
) VALUES
  ('max', 'Max 找到了他的家人', 'Max 來到我們家後，整個家都充滿了歡笑。他不只是寵物，更是我們的家人。', '王小明', '領養於 2024 年 3 月', '王', '🐕❤️👨‍👩‍👧', 1),
  ('luna', 'Luna 的第二次機會', 'Luna 剛來時很害羞，但現在她是我最好的夥伴。每天下班回家看到她，所有疲憊都消失了。', '李美玲', '領養於 2024 年 1 月', '李', '🐈❤️👩', 2),
  ('bobby', '老年犬 Bobby 的幸福晚年', '很多人不願意領養老狗，但 Bobby 給我們帶來了無比的溫暖。他安靜、懂事，是最完美的陪伴。', '陳先生夫婦', '領養於 2023 年 11 月', '陳', '🐕‍🦺❤️👴👵', 3);

INSERT OR REPLACE INTO shelters (
  id,
  icon,
  name,
  description,
  location,
  available_pets,
  sort_order
) VALUES
  ('taipei-animal-home', '🏥', '台北市動物之家', '專業的照護團隊，提供完善的醫療服務', '台北市', 328, 1),
  ('loving-foster-home', '❤️', '愛心中途之家', '由志工經營，給予毛孩家庭般的溫暖', '新北市', 156, 2),
  ('stray-association', '🌟', '浪浪別哭協會', '致力於流浪動物救援與送養', '桃園市', 203, 3),
  ('happy-fur-home', '🏡', '幸福毛孩中途', '提供安全舒適的中途環境', '台中市', 189, 4);
