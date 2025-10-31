export type Ad = {
  id: string;
  title: string;
  description: string;
  img: string;
  video?: string;
  category: string;
  price: number;
  contact: string;
  supplierName: string;
  email: string;
  startDate: string;
  endDate: string;
  views: number;
  approved: boolean;
};

export const mockAds: Ad[] = [

];