export interface ISales {
  _id: string;
  amount: number;
  customer: string;
  pageId: string;
  product: string;
  transaction: string;
  type: "one_time" | "recurring";
  interval: "month" | "year";
  createdAt: Date;
}

export interface ISalesParams {
  funnelId: string;
  page: number;
  limit: number;
  sort: string;
  filters: any;
}
