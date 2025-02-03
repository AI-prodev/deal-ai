import React, { useEffect, useState } from "react";
import { Formik, Form, Field, ErrorMessage, FormikProps } from "formik";
import * as Yup from "yup";
import { useSpring, animated } from "react-spring";

import Modal from "@/components/Modal";
import LoadingSpinner from "@/pages/components/loadingSpinner";
import useMeasure from "react-use-measure";
import { allowedCountries, popularCountries } from "@/utils/data/Countries";
import { showErrorToastTimer, showSuccessToast } from "@/utils/toast";
import { propertyTypeList } from "@/utils/data/others";
import { ICommercialSeller } from "@/interfaces/ICommercialSeller";
import {
  useCreatePropertySellerMutation,
  useGetPropertySellerByIdQuery,
  useUpdatePropertySellerMutation,
} from "@/store/features/propertySellerApi";
import LoadingSkeleton from "./LoadingSkeleton";

interface ErrorResponse {
  error: string;
}

const initialValues: ICommercialSeller = {
  propertyName: "",
  propertyDescription: "",
  propertyType: "",
  listingPrice: 0,
  country: "",
  state: "",
  zip: "",
  location: "",
  acres: 0,
};

const validationSchema = Yup.object({
  propertyName: Yup.string().required("Property name is required"),
  propertyDescription: Yup.string().required(
    "Property description is required"
  ),
  propertyType: Yup.string().required("Property type is required"),
  listingPrice: Yup.number()
    .required("Listing price is required")
    .positive("Price must be more than 0"),
  country: Yup.string().required("Country is required"),
  state: Yup.string().notRequired(),
  zip: Yup.string().notRequired(),
  location: Yup.string().required("Property location is required"),
  acres: Yup.number().notRequired().positive("Acres must be more than 0"),
});

interface PropertySellFormProps {
  mode: "create" | "edit" | "show";
  isOpen: boolean;
  showOnly?: boolean;
  onRequestClose: () => void;
  selectedPropertySeller?: {
    id: string;
  };
  onRefetch?: () => void;
  isBrokerShow?: boolean;
}

const PropertySellForm: React.FC<PropertySellFormProps> = ({
  mode,
  isOpen,
  onRequestClose,
  selectedPropertySeller,
  onRefetch,
  showOnly,
  isBrokerShow,
}: PropertySellFormProps) => {
  const [formMode, setFormMode] = useState(mode);

  const [createPropertySeller, { isLoading: isCreating, error: createError }] =
    useCreatePropertySellerMutation();
  const [updatePropertySeller, { isLoading: isUpdating }] =
    useUpdatePropertySellerMutation();
  const {
    data: sellerData,
    isFetching: isFetching,
    error: getErrorMessage,
    refetch,
  } = useGetPropertySellerByIdQuery(
    selectedPropertySeller?.id ? selectedPropertySeller?.id : "",
    {
      skip: formMode == "create",
    }
  );

  useEffect(() => {
    if (formMode !== "create") {
      setFormMode(mode);
    }
  }, [selectedPropertySeller?.id]);

  const [formValues, setFormValues] =
    useState<ICommercialSeller>(initialValues);
  let formikRef: { current: FormikProps<ICommercialSeller> | null } = {
    current: null,
  };

  useEffect(() => {
    if (formMode !== "create" && sellerData?.sellers) {
      // refetch();

      setFormValues(sellerData?.sellers);
    }
  }, [sellerData, formMode]);

  const onSubmit = async (values: ICommercialSeller) => {
    if (selectedPropertySeller && formMode === "edit") {
      await updatePropertySeller({
        id: selectedPropertySeller.id,
        data: values,
      });
      refetch();
      onRefetch && onRefetch();
      onRequestClose();
    }

    if (formMode === "create") {
      await createPropertySeller(values);

      if (!isCreating && !createError) {
        onRefetch && onRefetch();
        onRequestClose();
      }
    }
  };

  if (createError) {
    console.error("An error occurred:", createError);

    if (
      typeof createError === "object" &&
      createError !== null &&
      "data" in createError &&
      typeof createError.data === "object" &&
      createError.data !== null &&
      "error" in createError.data
    ) {
      const errorData = createError.data as { error: string };
      showErrorToastTimer({
        title: `An error occurred: ${errorData.error}`,
      });
    } else if (
      typeof createError === "object" &&
      createError !== null &&
      "error" in createError
    ) {
      const serializedError = createError as { error: string };
      showErrorToastTimer({
        title: `An error occurred: ${serializedError.error}`,
      });
    } else {
      showErrorToastTimer({
        title: `An error occurred; please try again`,
      });
    }
  }

  return (
    <div className=" bg-white">
      <Modal
        isOpen={isOpen}
        onRequestClose={onRequestClose}
        customClassName="  min-w-[880px] max-h-[600px] "
      >
        <div className="flex items-center justify-between ">
          <div></div>
          <button
            type="button"
            className="text-white-dark hover:text-dark"
            onClick={onRequestClose}
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <line x1="18" y1="6" x2="6" y2="18"></line>
              <line x1="6" y1="6" x2="18" y2="18"></line>
            </svg>
          </button>
        </div>
        {formMode !== "create" && isFetching ? (
          <h1 className="text-white">
            <LoadingSkeleton skeletonCount={6} />
          </h1>
        ) : (
          <div>
            {formMode !== "create" && getErrorMessage ? (
              <>
                {
                  //@ts-ignore
                  getErrorMessage?.status == 500 ? (
                    <h2 className="mb-4 text-center text-xl font-bold text-white">
                      Business Not Found
                    </h2>
                  ) : (
                    <h2 className="mb-4 text-center text-xl font-bold text-white">
                      Something Went Wrong! Please Try Again
                    </h2>
                  )
                }
              </>
            ) : (
              <>
                {" "}
                {formMode && (
                  <div>
                    <h2 className="mb-4 text-xl font-bold text-white">
                      {formMode === "create"
                        ? "Sell Property"
                        : ` Property  Details for ${formValues.propertyName}`}
                    </h2>
                  </div>
                )}
                <Formik
                  key={JSON.stringify(formValues)}
                  initialValues={formValues}
                  validationSchema={validationSchema}
                  onSubmit={onSubmit}
                  innerRef={formikInstance =>
                    (formikRef.current = formikInstance)
                  }
                  validateOnMount
                >
                  {({
                    values,
                    isSubmitting,
                    setFieldValue,
                    submitCount,
                    errors,
                  }) => (
                    <Form>
                      <div className="mb-4">
                        {values.propertyName && formMode === "show" && (
                          <>
                            <label
                              htmlFor="propertyName"
                              className="mb-2 block text-sm font-bold text-white"
                            >
                              Property Name
                            </label>
                            <div className="form-input">
                              {values.propertyName}
                            </div>
                          </>
                        )}{" "}
                        {formMode !== "show" && (
                          <>
                            <label
                              htmlFor="propertyName"
                              className="mb-2 block text-sm font-bold text-white"
                            >
                              Property Name
                            </label>
                            <Field
                              type="text"
                              id="propertyName"
                              name="propertyName"
                              className="form-input"
                            />
                          </>
                        )}
                        <ErrorMessage
                          name="propertyName"
                          component="div"
                          className="mt-2 text-xs italic text-red-500"
                        />
                      </div>
                      <div className="mb-4">
                        {values.propertyDescription && formMode === "show" && (
                          <>
                            <label
                              htmlFor="description"
                              className="mb-2 block text-sm font-bold text-white"
                            >
                              Description
                            </label>
                            <div className="form-input whitespace-pre-wrap">
                              {values.propertyDescription}
                            </div>
                          </>
                        )}
                        {formMode !== "show" && (
                          <>
                            <label
                              htmlFor="description"
                              className="mb-2 block text-sm font-bold text-white"
                            >
                              Description
                            </label>
                            <Field
                              type="text"
                              as="textarea"
                              rows={8}
                              id="propertyDescription"
                              name="propertyDescription"
                              disabled={showOnly}
                              className="form-input whitespace-pre-wrap"
                            />
                          </>
                        )}
                        <ErrorMessage
                          name="propertyDescription"
                          component="div"
                          className="mt-2 text-xs italic text-red-500"
                        />
                      </div>
                      <div className="mb-4">
                        {values.propertyType && formMode === "show" && (
                          <>
                            <label
                              htmlFor="propertyType"
                              className="mb-2 block text-sm font-bold text-white"
                            >
                              Sector
                            </label>
                            <div className="form-input">
                              {values.propertyType}
                            </div>
                          </>
                        )}{" "}
                        {formMode !== "show" && (
                          <>
                            <label
                              htmlFor="propertyType"
                              className="mb-2 block text-sm font-bold text-white"
                            >
                              Property Type
                            </label>
                            <Field
                              as="select"
                              id="propertyType"
                              name="propertyType"
                              className="form-select mt-1 block w-full"
                              // disabled={formMode === "show"}
                            >
                              <option value="">Select Property Type</option>
                              {propertyTypeList.map(propertyType => (
                                <option key={propertyType} value={propertyType}>
                                  {propertyType}
                                </option>
                              ))}
                            </Field>
                          </>
                        )}
                        <ErrorMessage
                          name="propertyType"
                          component="div"
                          className="mt-2 text-xs italic text-red-500"
                        />
                      </div>
                      <div className="mb-4">
                        {values.listingPrice !== undefined &&
                          values.listingPrice > 0 &&
                          formMode === "show" && (
                            <>
                              <label
                                htmlFor="listingPrice"
                                className="mb-2 block text-sm font-bold text-white"
                              >
                                Listing Price
                              </label>
                              <div className="form-input">
                                {values.listingPrice}
                              </div>
                            </>
                          )}{" "}
                        {formMode !== "show" && (
                          <>
                            <label
                              htmlFor="listingPrice"
                              className="mb-2 block text-sm font-bold text-white"
                            >
                              Listing Price
                            </label>
                            <Field
                              type="number"
                              id="listingPrice"
                              name="listingPrice"
                              className="form-input"
                              // disabled={formMode === "show"}
                            />
                          </>
                        )}
                        <ErrorMessage
                          name="listingPrice"
                          component="div"
                          className="mt-2 text-xs italic text-red-500"
                        />
                      </div>
                      <div className="mb-4">
                        {values.country && formMode === "show" && (
                          <>
                            <label
                              htmlFor="country"
                              className="mb-2 block text-sm font-bold text-white"
                            >
                              Country
                            </label>
                            <div className="form-input">{values.country}</div>
                          </>
                        )}{" "}
                        {formMode !== "show" && (
                          <>
                            <label
                              htmlFor="country"
                              className="mb-2 block text-sm font-bold text-white"
                            >
                              Country
                            </label>
                            <Field
                              as="select"
                              id="country"
                              name="country"
                              className="form-select mt-1 block w-full"
                              // disabled={formMode === "show"}
                            >
                              <option value="">Select country</option>
                              <optgroup label="Popular Countries">
                                <option value="United States">
                                  United States
                                </option>
                                {popularCountries
                                  .filter(
                                    country => country.name !== "United States"
                                  )
                                  .sort((a, b) => a.name.localeCompare(b.name))
                                  .map(country => (
                                    <option
                                      key={country.code}
                                      value={country.name}
                                    >
                                      {country.name}
                                    </option>
                                  ))}
                              </optgroup>
                              <optgroup label="All Countries">
                                {allowedCountries
                                  .filter(
                                    country =>
                                      !popularCountries.find(
                                        pc => pc.code === country.code
                                      )
                                  )
                                  .sort((a, b) => a.name.localeCompare(b.name))
                                  .map(country => (
                                    <option
                                      key={country.code}
                                      value={country.name}
                                    >
                                      {country.name}
                                    </option>
                                  ))}
                              </optgroup>
                            </Field>
                          </>
                        )}
                        <ErrorMessage
                          name="country"
                          component="div"
                          className="mt-2 text-xs italic text-red-500"
                        />
                      </div>

                      <div className="mb-4">
                        {values.location && formMode === "show" && (
                          <>
                            <label
                              htmlFor="state"
                              className="mb-2 block text-sm font-bold text-white"
                            >
                              Property Location
                            </label>
                            <div className="form-input">{values.location}</div>
                          </>
                        )}
                        {formMode !== "show" && (
                          <>
                            <label
                              htmlFor="location"
                              className="mb-2 block text-sm font-bold text-white"
                            >
                              Property Location
                            </label>
                            <Field
                              type="text"
                              id="location"
                              name="location"
                              // disabled={formMode === "show"}
                              className="form-input"
                            />
                          </>
                        )}
                        <ErrorMessage
                          name="location"
                          component="div"
                          className="mt-2 text-xs italic text-red-500"
                        />
                      </div>
                      <div className="mb-4">
                        {values.state && formMode === "show" && (
                          <>
                            <label
                              htmlFor="state"
                              className="mb-2 block text-sm font-bold text-white"
                            >
                              State / Region
                            </label>
                            <div className="form-input">{values.state}</div>
                          </>
                        )}
                        {formMode !== "show" && (
                          <>
                            <label
                              htmlFor="state"
                              className="mb-2 block text-sm font-bold text-white"
                            >
                              State / Region
                            </label>
                            <Field
                              type="text"
                              id="state"
                              name="state"
                              // disabled={formMode === "show"}
                              className="form-input"
                            />
                          </>
                        )}
                      </div>
                      <div className="mb-4">
                        {values.zip && formMode === "show" && (
                          <>
                            <label
                              htmlFor="zip"
                              className="mb-2 block text-sm font-bold text-white"
                            >
                              ZIP / Postal Code
                            </label>
                            <div className="form-input">{values.zip}</div>
                          </>
                        )}
                        {formMode !== "show" && (
                          <>
                            <label
                              htmlFor="zip"
                              className="mb-2 block text-sm font-bold text-white"
                            >
                              ZIP / Postal Code
                            </label>
                            <Field
                              type="text"
                              id="zip"
                              name="zip"
                              // disabled={formMode === "show"}
                              className="form-input"
                            />
                          </>
                        )}
                      </div>
                      <div className="mb-4">
                        {values.acres !== undefined &&
                          values.acres > 0 &&
                          formMode === "show" && (
                            <>
                              <label
                                htmlFor="acres"
                                className="mb-2 block text-sm font-bold text-white"
                              >
                                Acres
                              </label>
                              <div className="form-input">{values.acres}</div>
                            </>
                          )}
                        {formMode !== "show" && (
                          <>
                            <label
                              htmlFor="acres"
                              className="mb-2 block text-sm font-bold text-white"
                            >
                              Acres
                            </label>
                            <Field
                              type="number"
                              id="acres"
                              name="acres"
                              // disabled={formMode === "show"}
                              className="form-input"
                            />
                          </>
                        )}
                        <ErrorMessage
                          name="acres"
                          component="div"
                          className="mt-2 text-xs italic text-red-500"
                        />
                      </div>

                      {formMode === "show" &&
                        values.userId &&
                        typeof values.userId !== "string" && (
                          <div className="mb-4 rounded-lg p-4 text-gray-200 shadow-md">
                            <p className="text-center text-xl">
                              Contact {values.userId.firstName}
                              &nbsp;
                              {values.userId.lastName}
                              <a
                                href={`mailto:${values.userId.email}`}
                                className="px-2 text-blue-500"
                              >
                                {values.userId.email}
                              </a>
                              more information about this property.
                            </p>
                          </div>
                        )}

                      {formMode !== "show" && (
                        <>
                          <button
                            type="button"
                            onClick={onRequestClose}
                            className="mr-2 rounded border border-primary px-4 py-2 text-primary"
                          >
                            Cancel
                          </button>
                          <button
                            type="submit"
                            className="focus:shadow-outline rounded bg-blue-500 py-2 px-4 font-bold text-white hover:bg-blue-700 focus:outline-none"
                            disabled={isSubmitting}
                          >
                            {isCreating && <LoadingSpinner isLoading />}
                            {isUpdating && <LoadingSpinner isLoading />}
                            {isSubmitting ? "Submitting..." : "Submit"}
                          </button>
                        </>
                      )}
                    </Form>
                  )}
                </Formik>
                {formMode === "show" && (
                  <>
                    {showOnly ? (
                      <>
                        <button
                          type="button"
                          onClick={onRequestClose}
                          className="mr-2 rounded border border-primary px-4 py-2 text-primary"
                        >
                          Close
                        </button>

                        {isBrokerShow && (
                          <>
                            {sellerData?.sellers._id && (
                              <button
                                type="button"
                                onClick={() => {
                                  const url = `${window.location.origin}/apps/broker-property?detail=${sellerData?.sellers?._id}`;
                                  navigator.clipboard.writeText(url);
                                  showSuccessToast({
                                    title: `Link ${url} Copied to Clipboard`,
                                    timer: 10000,
                                  });
                                }}
                                className="mr-2 rounded border border-primary px-4 py-2 text-primary"
                              >
                                Share to Broker
                              </button>
                            )}
                          </>
                        )}
                      </>
                    ) : (
                      <>
                        {" "}
                        <button
                          type="button"
                          onClick={onRequestClose}
                          className="mr-2 rounded border border-primary px-4 py-2 text-primary"
                        >
                          Cancel
                        </button>
                        <button
                          type="button"
                          className="focus:shadow-outline rounded bg-blue-500 py-2 px-4 font-bold text-white hover:bg-blue-700 focus:outline-none"
                          // disabled={isSubmitting && formMode === "show"}
                          onClick={() => {
                            setFormMode("edit");
                          }}
                        >
                          {isCreating && <LoadingSpinner isLoading />}
                          {isUpdating && <LoadingSpinner isLoading />}
                          Edit
                        </button>{" "}
                      </>
                    )}
                  </>
                )}
              </>
            )}
          </div>
        )}
      </Modal>
    </div>
  );
};

export default PropertySellForm;
