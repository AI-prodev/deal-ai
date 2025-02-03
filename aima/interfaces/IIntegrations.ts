export interface IIntegrationStripeAccountsInfo {
  accessToken: string;
  accountId: string;
  accountType: string;
  completed: boolean;
}

export interface IIntegrationStripeAccounts {
  _id: string;
  user: string;
  data: IIntegrationStripeAccountsInfo;
  createdAt: string;
  updatedAt: string;
  type: "stripe";
  __v: number;
}

export interface IIntegrationStripeConnect {
  url: string;
}

export interface IAccountProducts {
  id: string;
  currency: "usd";
  type: "recurring" | "one_time";
  product: { id: string; default_price: string; name: string };
  recurring: { interval: "month" } | null;
  unit_amount: number;
  unit_amount_decimal: string;
}

export interface IAddProducts {
  id: string;
  productId: string;
  priceId: string;
  type: "recurring" | "one_time";
}

export interface IProductsParams {
  params: {
    pageId?: string;
    path?: string;
  };
}
