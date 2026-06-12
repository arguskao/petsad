export type PetSpecies = 'dog' | 'cat' | 'other';
export type PetAgeGroup = 'young' | 'adult' | 'senior';
export type PetSizeGroup = 'small' | 'medium' | 'large';
export type PetLocationKey = 'taipei' | 'newtaipei' | 'taoyuan' | 'taichung' | 'tainan' | 'kaohsiung';
export type PetStatus = 'available' | 'hidden' | 'adopted';

export interface Pet {
  id: string;
  name: string;
  species: PetSpecies;
  gender: 'male' | 'female';
  age: string;
  ageGroup: PetAgeGroup;
  size: string;
  sizeGroup: PetSizeGroup;
  location: string;
  locationKey: PetLocationKey;
  emoji: string;
  coverImageUrl?: string;
  status?: PetStatus;
  badge?: {
    label: string;
    tone: 'urgent' | 'new' | 'default';
  };
  description: string;
  tags: string[];
  story: string;
}

export const pets: Pet[] = [
  {
    id: 'xiaohuang',
    name: '小黃',
    species: 'dog',
    gender: 'male',
    age: '2 歲',
    ageGroup: 'adult',
    size: '中型犬',
    sizeGroup: 'medium',
    location: '台北市',
    locationKey: 'taipei',
    emoji: '🐕',
    coverImageUrl: '/mock-data/pets/xiaohuang.png',
    badge: { label: '急需領養', tone: 'urgent' },
    description: '個性溫和親人，喜歡散步和玩球，適合有院子的家庭。',
    tags: ['親人', '活潑', '已結紮'],
    story: '小黃原本被救援時很膽小，現在已經學會安心地靠近人。',
  },
  {
    id: 'mimi',
    name: '咪咪',
    species: 'cat',
    gender: 'female',
    age: '1 歲',
    ageGroup: 'adult',
    size: '小型貓',
    sizeGroup: 'small',
    location: '新北市',
    locationKey: 'newtaipei',
    emoji: '🐈',
    coverImageUrl: '/mock-data/pets/mimi.png',
    description: '安靜乖巧，喜歡曬太陽和被摸摸，適合公寓飼養。',
    tags: ['安靜', '獨立', '已結紮'],
    story: '咪咪最喜歡窗邊的位置，會安靜陪伴每一個回家的晚上。',
  },
  {
    id: 'lucky',
    name: 'Lucky',
    species: 'dog',
    gender: 'male',
    age: '5 歲',
    ageGroup: 'adult',
    size: '大型犬',
    sizeGroup: 'large',
    location: '桃園市',
    locationKey: 'taoyuan',
    emoji: '🐕‍🦺',
    coverImageUrl: '/mock-data/pets/lucky.png',
    description: '忠誠可靠，已訓練良好，適合有經驗的飼主。',
    tags: ['忠誠', '聰明', '已訓練'],
    story: 'Lucky 曾經流浪很久，現在只想找一個能陪他散步的家。',
  },
  {
    id: 'chengzi',
    name: '橘子',
    species: 'cat',
    gender: 'male',
    age: '3 個月',
    ageGroup: 'young',
    size: '幼貓',
    sizeGroup: 'small',
    location: '台中市',
    locationKey: 'taichung',
    emoji: '🐱',
    coverImageUrl: '/mock-data/pets/chengzi.png',
    badge: { label: '新到', tone: 'new' },
    description: '活潑好動的小橘貓，充滿好奇心，等待第一個家。',
    tags: ['活潑', '好奇', '健康'],
    story: '橘子總是第一個跑來探索新事物，是一團可愛的小火球。',
  },
  {
    id: 'nori',
    name: '諾里',
    species: 'cat',
    gender: 'female',
    age: '2 歲',
    ageGroup: 'adult',
    size: '小型貓',
    sizeGroup: 'small',
    location: '新北市',
    locationKey: 'newtaipei',
    emoji: '🐈‍⬛',
    coverImageUrl: '/mock-data/pets/nori.png',
    description: '個性穩定又安靜，熟悉之後會主動靠近，是很適合陪伴型家庭的貓咪。',
    tags: ['親人', '安靜', '已結紮'],
    story: '諾里第一次見面會先觀察很久，但熟悉後會安靜窩在身邊。',
  },
  {
    id: 'puff',
    name: '泡芙',
    species: 'dog',
    gender: 'female',
    age: '4 歲',
    ageGroup: 'adult',
    size: '小型犬',
    sizeGroup: 'small',
    location: '台南市',
    locationKey: 'tainan',
    emoji: '🐩',
    coverImageUrl: '/mock-data/pets/puff.png',
    badge: { label: '新到', tone: 'new' },
    description: '活潑黏人，對散步和零食都很有反應，適合想要陪伴感很強的家庭。',
    tags: ['黏人', '活潑', '已訓練'],
    story: '泡芙總是開心地跟著人走來走去，是家裡的可愛小跟班。',
  },
  {
    id: 'aban',
    name: '阿斑',
    species: 'cat',
    gender: 'male',
    age: '7 歲',
    ageGroup: 'senior',
    size: '小型貓',
    sizeGroup: 'small',
    location: '高雄市',
    locationKey: 'kaohsiung',
    emoji: '🐱',
    coverImageUrl: '/mock-data/pets/aban.png',
    badge: { label: '熟齡優先', tone: 'urgent' },
    description: '沉穩安靜，喜歡固定作息與熟悉環境，適合節奏穩定、喜歡陪伴的家庭。',
    tags: ['穩定', '親人', '熟齡'],
    story: '阿斑很懂得享受日光和午睡，最喜歡安靜地待在熟悉角落。',
  },
];
