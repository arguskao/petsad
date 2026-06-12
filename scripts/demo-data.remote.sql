UPDATE pets
SET cover_image_url = '/mock-data/pets/xiaohuang.png'
WHERE id = 'xiaohuang';

UPDATE pets
SET cover_image_url = '/mock-data/pets/mimi.png'
WHERE id = 'mimi';

UPDATE pets
SET cover_image_url = '/mock-data/pets/lucky.png'
WHERE id = 'lucky';

UPDATE pets
SET cover_image_url = '/mock-data/pets/chengzi.png'
WHERE id = 'chengzi';

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
  sort_order,
  status,
  cover_image_url
) VALUES
  (
    'nori',
    '諾里',
    'cat',
    'female',
    '2 歲',
    'adult',
    '小型貓',
    'small',
    '新北市',
    'newtaipei',
    '🐈‍⬛',
    NULL,
    NULL,
    '個性穩定又安靜，熟悉之後會主動靠近，是很適合陪伴型家庭的貓咪。',
    '諾里第一次見面會先觀察很久，但熟悉後會安靜窩在身邊。',
    '["親人","安靜","已結紮"]',
    5,
    'available',
    '/mock-data/pets/nori.png'
  ),
  (
    'puff',
    '泡芙',
    'dog',
    'female',
    '4 歲',
    'adult',
    '小型犬',
    'small',
    '台南市',
    'tainan',
    '🐩',
    '新到',
    'new',
    '活潑黏人，對散步和零食都很有反應，適合想要陪伴感很強的家庭。',
    '泡芙總是開心地跟著人走來走去，是家裡的可愛小跟班。',
    '["黏人","活潑","已訓練"]',
    6,
    'available',
    '/mock-data/pets/puff.png'
  ),
  (
    'aban',
    '阿斑',
    'cat',
    'male',
    '7 歲',
    'senior',
    '小型貓',
    'small',
    '高雄市',
    'kaohsiung',
    '🐱',
    '熟齡優先',
    'urgent',
    '沉穩安靜，喜歡固定作息與熟悉環境，適合節奏穩定、喜歡陪伴的家庭。',
    '阿斑很懂得享受日光和午睡，最喜歡安靜地待在熟悉角落。',
    '["穩定","親人","熟齡"]',
    7,
    'available',
    '/mock-data/pets/aban.png'
  );

DELETE FROM adoption_requests;

INSERT OR REPLACE INTO adoption_requests (
  id,
  pet_id,
  full_name,
  email,
  phone,
  note,
  status,
  created_at,
  updated_at
) VALUES
  (
    'demo-adoption-001',
    'xiaohuang',
    '林怡君',
    'yijun@example.com',
    '0912-345-678',
    '家裡有前院，平常晚上會帶散步，希望先安排見面認識。',
    'pending',
    '2026-06-10 09:00:00',
    '2026-06-10 09:00:00'
  ),
  (
    'demo-adoption-002',
    'mimi',
    '陳志豪',
    'chihhao@example.com',
    '0988-123-456',
    '已準備好貓砂盆、跳台和固定作息，想找一隻安靜陪伴的貓。',
    'approved',
    '2026-06-09 14:20:00',
    '2026-06-11 10:15:00'
  ),
  (
    'demo-adoption-003',
    'lucky',
    '王小美',
    'xiaomei@example.com',
    '0977-222-333',
    '家裡有養大型犬經驗，希望先了解 Lucky 的散步與訓練需求。',
    'rejected',
    '2026-06-08 18:45:00',
    '2026-06-09 09:10:00'
  ),
  (
    'demo-adoption-004',
    'chengzi',
    '張涵婷',
    'ht@example.com',
    '0922-456-789',
    '家中成員都已同意領養，想先安排一次互動看看橘子的個性。',
    'pending',
    '2026-06-12 11:30:00',
    '2026-06-12 11:30:00'
  ),
  (
    'demo-adoption-005',
    'nori',
    '黃語晴',
    'yuqing@example.com',
    '0933-888-111',
    '住家環境安靜，平常會在家工作，希望找一隻喜歡陪在旁邊的貓。',
    'pending',
    '2026-06-12 12:10:00',
    '2026-06-12 12:10:00'
  ),
  (
    'demo-adoption-006',
    'puff',
    '林子傑',
    'zijie@example.com',
    '0909-555-222',
    '家裡已經準備好牽繩、睡墊和零食，想先了解泡芙的散步習慣。',
    'approved',
    '2026-06-11 16:05:00',
    '2026-06-12 08:25:00'
  ),
  (
    'demo-adoption-007',
    'aban',
    '周怡婷',
    'yiting@example.com',
    '0966-444-777',
    '想領養熟齡貓，家中沒有其他寵物，也希望先安排一次互動。',
    'pending',
    '2026-06-12 13:40:00',
    '2026-06-12 13:40:00'
  );
