export interface ILists {
  _id: string;
  title: string;
  numContacts: number;
  subscribedContactsCount: number;
  createdAt: Date;
}

export interface IListsParams {
  page: number;
  limit: number;
  sort: string;
  filters: any;
}
