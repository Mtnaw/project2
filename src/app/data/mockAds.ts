export type Ad = {
  id: string;
  title: string;
  description: string;
  img: string;
  video?: string;
  additionalImages?: string[];
  additionalVideos?: string[];
  category: string;
  price: number;
  contact: string;
  supplierName: string;
  email: string;
  startDate: string;
  endDate: string;
  views: number;
  approved: boolean;
  history?: { date: string; action: string; user: string }[];
};

export const mockAds: Ad[] = [

];