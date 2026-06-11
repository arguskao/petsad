export interface Shelter {
  id: string;
  icon: string;
  name: string;
  description: string;
  location: string;
  availablePets: number;
  contactName: string;
  contactPhone: string;
  contactEmail: string;
}

export const shelters: Shelter[] = [
  {
    id: 'taipei-animal-home',
    icon: '🏥',
    name: '台北市動物之家',
    description: '專業的照護團隊，提供完善的醫療服務',
    location: '台北市',
    availablePets: 328,
    contactName: '台北動保中心',
    contactPhone: '02-1234-5678',
    contactEmail: 'adopt@taipei-animal-home.tw',
  },
  {
    id: 'loving-foster-home',
    icon: '❤️',
    name: '愛心中途之家',
    description: '由志工經營，給予毛孩家庭般的溫暖',
    location: '新北市',
    availablePets: 156,
    contactName: '愛心中途志工組',
    contactPhone: '02-2345-6789',
    contactEmail: 'foster@loving-foster-home.tw',
  },
  {
    id: 'stray-association',
    icon: '🌟',
    name: '浪浪別哭協會',
    description: '致力於流浪動物救援與送養',
    location: '桃園市',
    availablePets: 203,
    contactName: '送養服務窗口',
    contactPhone: '03-3456-7890',
    contactEmail: 'adopt@stray-association.tw',
  },
  {
    id: 'happy-fur-home',
    icon: '🏡',
    name: '幸福毛孩中途',
    description: '提供安全舒適的中途環境',
    location: '台中市',
    availablePets: 189,
    contactName: '幸福毛孩客服',
    contactPhone: '04-4567-8901',
    contactEmail: 'hello@happy-fur-home.tw',
  },
];
