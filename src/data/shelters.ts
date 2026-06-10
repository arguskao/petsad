export interface Shelter {
  id: string;
  icon: string;
  name: string;
  description: string;
  location: string;
  availablePets: number;
}

export const shelters: Shelter[] = [
  {
    id: 'taipei-animal-home',
    icon: '🏥',
    name: '台北市動物之家',
    description: '專業的照護團隊，提供完善的醫療服務',
    location: '台北市',
    availablePets: 328,
  },
  {
    id: 'loving-foster-home',
    icon: '❤️',
    name: '愛心中途之家',
    description: '由志工經營，給予毛孩家庭般的溫暖',
    location: '新北市',
    availablePets: 156,
  },
  {
    id: 'stray-association',
    icon: '🌟',
    name: '浪浪別哭協會',
    description: '致力於流浪動物救援與送養',
    location: '桃園市',
    availablePets: 203,
  },
  {
    id: 'happy-fur-home',
    icon: '🏡',
    name: '幸福毛孩中途',
    description: '提供安全舒適的中途環境',
    location: '台中市',
    availablePets: 189,
  },
];

