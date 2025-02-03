export interface ICampaign {
  title: string;
  user: string; // Assuming 'user' is a required field based on your response
  budget: number;
  targetURL: string;
  displayLink: string;
  page: {
    facebook: string;
    instagram: string;
  };
  callToAction: string;
  headline: string;
  targeting: {
    minAge: number;
    maxAge: number;
    gender: string;
    country: string;
  };
  _id: string;
  createdAt: string;
  fbCampaignId: string;
  currentRound: number;
  adAccountId: string;
  billingEvent: string;
  optimizationGoal: string;
  data: {
    error: { status: any };
  };
  pageId: string;

  // Additional fields from the response
  Business: {
    _id: string;
    accountId: string;
    businessId: string;
    name: string;
    isActive: boolean;
    createdAt: string;
    updatedAt: string;
    __v: number;
  };
  businessDetails: {
    businessId(businessId: any, accessToken: string): unknown;
    name: string;
    accountDetails: {
      _id: string;
      email: string;
      user: string;
      accessToken: string;
      name: string;
      facebookId: string;
      isDeleted: boolean;
      updatedAt: string;
    };
  };
}

export interface ICampaignAsset {
  _id?: string;
  campaign: any;
  user?: string;
  scrollStopper?: {
    url: string;
    additionalData?: any;
  };
  magicHook?: {
    input: any;
    output: any;
    additionalData?: any;
  };
  createdAt?: Date;
  updatedAt?: Date;
}
