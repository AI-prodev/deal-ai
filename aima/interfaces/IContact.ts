export interface IContact {
  _id: string;
  ip: string;
  firstName: string;
  lastName: string;
  email: string;
  createdAt: string;
}

export interface IContacts {
  _id?: string;
  firstName?: string;
  lastName?: string;
  email?: string;
  phoneNumber?: string;
  createdAt?: Date;
  ip?: string;
  unsubscribed?: boolean;
  address?: {
    addressFullName?: string;
    addressStreet?: string;
    addressApartment?: string;
    addressCity?: string;
    addressState?: string;
    addressCountry?: string;
    addressZipCode?: string;
  };
  shippingAddress?: {
    shippingAddressFullName?: string;
    shippingAddressStreet?: string;
    shippingAddressApartment?: string;
    shippingAddressCity?: string;
    shippingAddressState?: string;
    shippingAddressCountry?: string;
    shippingAddressZipCode?: string;
  };
  numOfLists?: number;
  numOfPurchases?: number;
}

export interface IContactsParams {
  page?: number;
  limit?: number;
  sort?: string;
  filters?: any;
}

export interface IAddListToContactOption {
  label: string;
  value: string;
}

export interface IContactFormValues {
  firstName: string;
  lastName: string;
  email: string;
  phoneNumber?: string;
  addressFullName: string;
  addressStreet: string;
  addressApartment: string;
  addressCity: string;
  addressState: string;
  addressCountry: string;
  addressZipCode: string;
  shippingAddressFullName: string;
  shippingAddressStreet: string;
  shippingAddressApartment: string;
  shippingAddressCity: string;
  shippingAddressState: string;
  shippingAddressCountry: string;
  shippingAddressZipCode: string;
  confirm?: boolean;
  ip?: string;
}
