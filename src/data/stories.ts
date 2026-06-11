export interface Story {
  id: string;
  title: string;
  quote: string;
  author: string;
  date: string;
  avatar: string;
  emoji: string;
  sortOrder?: number;
}

export const stories: Story[] = [
  {
    id: 'max',
    title: 'Max 找到了他的家人',
    quote: 'Max 來到我們家後，整個家都充滿了歡笑。他不只是寵物，更是我們的家人。',
    author: '王小明',
    date: '領養於 2024 年 3 月',
    avatar: '王',
    emoji: '🐕❤️👨‍👩‍👧',
  },
  {
    id: 'luna',
    title: 'Luna 的第二次機會',
    quote: 'Luna 剛來時很害羞，但現在她是我最好的夥伴。每天下班回家看到她，所有疲憊都消失了。',
    author: '李美玲',
    date: '領養於 2024 年 1 月',
    avatar: '李',
    emoji: '🐈❤️👩',
  },
  {
    id: 'bobby',
    title: '老年犬 Bobby 的幸福晚年',
    quote: '很多人不願意領養老狗，但 Bobby 給我們帶來了無比的溫暖。他安靜、懂事，是最完美的陪伴。',
    author: '陳先生夫婦',
    date: '領養於 2023 年 11 月',
    avatar: '陳',
    emoji: '🐕‍🦺❤️👴👵',
  },
];
