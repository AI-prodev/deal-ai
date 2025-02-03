import React from "react";
import { ErrorMessage, Field, Form, Formik } from "formik";
import LoadingSpinner from "@/components/LoadingSpinner";
import clsx from "clsx";
import type { BusinessDetailsFormValues } from "@/components/profile/interfaces";
import {
  useGetBusinessDetailsQuery,
  useUpdateBusinessDetailsMutation,
} from "@/store/features/profileApi";
import { showErrorToast, showSuccessToast } from "@/utils/toast";

const BusinessDetails = () => {
  const { data: businessDetails, isLoading: isGetBusinessDetailsLoading } =
    useGetBusinessDetailsQuery({});
  const [updateBusinessDetails, { isLoading: isUpdateBusinessDetailsLoading }] =
    useUpdateBusinessDetailsMutation();

  const { businessAddress, businessName } = businessDetails || {};
  const {
    addressFullName,
    addressStreet,
    addressApartment,
    addressCity,
    addressState,
    addressCountry,
    addressZipCode,
  } = businessAddress || {};

  const isLoading =
    isUpdateBusinessDetailsLoading || isGetBusinessDetailsLoading;

  const handleInitialValues = () => ({
    businessName: businessName ?? "",
    businessAddress: {
      addressFullName: addressFullName ?? "",
      addressStreet: addressStreet ?? "",
      addressApartment: addressApartment ?? "",
      addressCity: addressCity ?? "",
      addressState: addressState ?? "",
      addressCountry: addressCountry ?? "",
      addressZipCode: addressZipCode ?? "",
    },
  });

  const handleSubmit = async (values: BusinessDetailsFormValues) => {
    updateBusinessDetails(values)
      .then((res: any) => {
        if (res.error) {
          showErrorToast(
            res.error?.data?.error || "Failed to update business details"
          );
          return;
        }

        showSuccessToast({
          title: "Business details updated successfully",
        });
      })
      .catch(() => {
        showErrorToast("Failed to update business details");
      });
  };

  return (
    <div className="mt-10">
      <h5 className="mb-4 text-xl font-semibold text-[#3b3f5c] dark:text-white-light">
        Business Details
      </h5>
      <Formik
        initialValues={handleInitialValues()}
        enableReinitialize
        onSubmit={handleSubmit}
      >
        {({ errors, touched }) => (
          <Form className="space-y-5">
            <div
              className={clsx("", {
                "has-error": touched.businessName && errors.businessName,
              })}
            >
              <label htmlFor="businessName">Business Name</label>
              <Field
                id="businessName"
                type="text"
                name="businessName"
                className="form-input"
              />
              <ErrorMessage
                name="businessName"
                component="div"
                className="mt-1 text-danger"
              />
            </div>
            <div
              className={clsx("", {
                "has-error":
                  touched?.businessAddress?.addressFullName &&
                  errors?.businessAddress?.addressFullName,
              })}
            >
              <label htmlFor="addressFullName">Full Name</label>
              <Field
                id="addressFullName"
                type="text"
                name="businessAddress.addressFullName"
                className="form-input"
              />
              <ErrorMessage
                name="businessAddress.addressFullName"
                component="div"
                className="mt-1 text-danger"
              />
            </div>
            <div className="w-full flex flex-col sm:flex-row gap-5">
              <div
                className={clsx("w-full flex-column", {
                  "has-error":
                    touched?.businessAddress?.addressStreet &&
                    errors?.businessAddress?.addressStreet,
                })}
              >
                <label htmlFor="addressStreet">Street</label>
                <Field
                  id="addressStreet"
                  type="text"
                  name="businessAddress.addressStreet"
                  className="form-input"
                />
                <ErrorMessage
                  name="businessAddress.addressStreet"
                  component="div"
                  className="mt-1 text-danger"
                />
              </div>
              <div
                className={clsx("w-full flex-column", {
                  "has-error":
                    touched?.businessAddress?.addressApartment &&
                    errors?.businessAddress?.addressApartment,
                })}
              >
                <label htmlFor="addressApartment">Apartment/Suite</label>
                <Field
                  id="addressApartment"
                  type="text"
                  name="businessAddress.addressApartment"
                  className="form-input"
                />
                <ErrorMessage
                  name="businessAddress.addressApartment"
                  component="div"
                  className="mt-1 text-danger"
                />
              </div>
            </div>
            <div className="w-full flex flex-col sm:flex-row gap-5">
              <div
                className={clsx("w-full flex-column", {
                  "has-error":
                    touched?.businessAddress?.addressCity &&
                    errors?.businessAddress?.addressCity,
                })}
              >
                <label htmlFor="addressCity">City</label>
                <Field
                  id="addressCity"
                  type="text"
                  name="businessAddress.addressCity"
                  className="form-input"
                />
                <ErrorMessage
                  name="businessAddress.addressCity"
                  component="div"
                  className="mt-1 text-danger"
                />
              </div>
              <div
                className={clsx("w-full flex-column", {
                  "has-error":
                    touched?.businessAddress?.addressState &&
                    errors?.businessAddress?.addressState,
                })}
              >
                <label htmlFor="addressState">State</label>
                <Field
                  id="addressState"
                  type="text"
                  name="businessAddress.addressState"
                  className="form-input"
                />
                <ErrorMessage
                  name="businessAddress.addressState"
                  component="div"
                  className="mt-1 text-danger"
                />
              </div>
              <div
                className={clsx("w-full flex-column", {
                  "has-error":
                    touched?.businessAddress?.addressCountry &&
                    errors?.businessAddress?.addressCountry,
                })}
              >
                <label htmlFor="addressCountry">Country</label>
                <Field
                  id="addressCountry"
                  type="text"
                  name="businessAddress.addressCountry"
                  className="form-input"
                />
                <ErrorMessage
                  name="businessAddress.addressCountry"
                  component="div"
                  className="mt-1 text-danger"
                />
              </div>
              <div
                className={clsx("w-full flex-column", {
                  "has-error":
                    touched?.businessAddress?.addressZipCode &&
                    errors?.businessAddress?.addressZipCode,
                })}
              >
                <label htmlFor="addressZipCode">ZIP/PIN code</label>
                <Field
                  id="addressZipCode"
                  type="text"
                  name="businessAddress.addressZipCode"
                  className="form-input"
                />
                <ErrorMessage
                  name="businessAddress.addressZipCode"
                  component="div"
                  className="mt-1 text-danger"
                />
              </div>
            </div>
            <button
              className="w-56 btn btn-primary disabled:bg-opacity-70"
              disabled={isLoading}
              type="submit"
            >
              {isLoading ? <LoadingSpinner /> : "Update Business Details"}
            </button>
          </Form>
        )}
      </Formik>
    </div>
  );
};

export default BusinessDetails;
