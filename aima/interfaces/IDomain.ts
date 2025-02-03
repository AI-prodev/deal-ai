export interface IDomain {
  _id: string;
  user: string;
  domain: string;
  createdAt: string;
  autoRenew: boolean;
  external: boolean;
}
