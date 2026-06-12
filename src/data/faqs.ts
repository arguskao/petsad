export interface Faq {
  id: string;
  category: string;
  question: string;
  answer: string;
  sortOrder?: number;
}

export const faqs: Faq[] = [
  {
    id: 'adoption-requirements',
    category: '領養資格',
    question: '我需要符合哪些條件才能領養？',
    answer: '請先確認居住環境允許飼養、家人已取得共識，並願意負擔日常照護、醫療與陪伴責任。送出申請後，收容所會依毛孩狀況與家庭條件進行配對。',
    sortOrder: 1,
  },
  {
    id: 'adoption-fee',
    category: '費用',
    question: '領養需要付費嗎？',
    answer: '平台不收取媒合費。部分合作單位可能會酌收晶片、疫苗、結紮或醫療相關費用，實際金額會在面談或申請回覆時說明。',
    sortOrder: 2,
  },
  {
    id: 'home-visit',
    category: '流程',
    question: '送出申請後一定會家訪嗎？',
    answer: '不一定。是否家訪會依合作單位流程、毛孩需求與申請資料判斷。有些情況會以電話訪談、視訊或補充照片替代。',
    sortOrder: 3,
  },
  {
    id: 'meet-before-adoption',
    category: '流程',
    question: '可以先和毛孩見面再決定嗎？',
    answer: '可以。多數合作單位會安排見面或互動時間，讓你了解毛孩個性，也讓照護者確認雙方是否適合。',
    sortOrder: 4,
  },
  {
    id: 'after-adoption-support',
    category: '照護',
    question: '領養後如果遇到適應問題怎麼辦？',
    answer: '你可以先聯繫原合作單位或平台窗口。我們建議先記錄毛孩的飲食、作息、互動與問題發生情境，方便照護者協助判斷。',
    sortOrder: 5,
  },
];
