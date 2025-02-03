export interface IStore {
  _id: string;
  name: string;
  createdAt: string;
  updatedAt: string;
}

export interface IStoreSave {
  storeId: string;
  domain: string;
}
