export interface IBusiness {
  _id: string;
  accountId: string;
  businessId: string;
  name: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  __v: number;
}

export interface IAccount {
  _id: string;
  email?: string;
  user?: string;
  accessToken?: string;
  name?: string;
  facebookId?: string;
  csrfToken?: string;
  businesses?: IBusiness[];
}
