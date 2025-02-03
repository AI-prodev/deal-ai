export interface IRound {
  _id: string;
  fbCampaignId: string;
  campaignId: string;
  budget: number;
  sequence: number;
  billingEvent: string;
  optimizationGoal: string;
  testAdSetId: any;
  controlAdSetId: any;
  testAdSets: IAdset;
  controlAdSets: IAdset;
  isActive: boolean;
}

export interface IAdset {
  insights: any;
  imageUrl: string | undefined;
  ads: any;
  name: string;
  daily_budget: number;
  status: string;
}
