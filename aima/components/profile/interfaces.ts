export interface BusinessDetailsFormValues {
  businessName: string;
  businessAddress: {
    addressFullName: string;
    addressStreet: string;
    addressApartment: string;
    addressCity: string;
    addressState: string;
    addressCountry: string;
    addressZipCode: string;
  };
}
