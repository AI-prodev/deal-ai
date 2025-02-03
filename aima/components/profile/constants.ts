import type { BusinessDetailsFormValues } from "@/components/profile/interfaces";

export const BUSINESS_DETAILS_INITIAL_VALUES: BusinessDetailsFormValues = {
  businessName: "",
  businessAddress: {
    addressFullName: "",
    addressStreet: "",
    addressApartment: "",
    addressCity: "",
    addressState: "",
    addressCountry: "",
    addressZipCode: "",
  },
};
