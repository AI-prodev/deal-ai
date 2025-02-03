import React, { Fragment, useState, useEffect } from "react";
import { useRouter } from "next/router";

import * as Yup from "yup";
import { Field, Form, Formik, FormikProps } from "formik";

import { useSpring, animated } from "react-spring";
import useMeasure from "react-use-measure";
import { baseUrl } from "@/utils/baseUrl";
import { retryToast } from "@/utils/toast";
import Swal from "sweetalert2";
import customFetch from "@/utils/customFetch";

interface NewTonFormProps {
  setReady: (ready: boolean) => void;
  setLoading: (loaading: boolean) => void;
  setBusinessDetails: (detail: any) => void;

  token: string;
  setProgress: (progress: any) => void;
  setToken: (token: string) => void;
  jwtToken: any;
  progress: number;
  setResults: (result: any) => void;
  setModal1: (modal: boolean) => void;
}

interface FormValues {
  businessName: string;
  entityName: string;
  entityType: string;
  businessDescription: string;
  purchaseType: boolean;
  includedAssets: string;
  ownershipStructure: string;
  ownerNamesAndPercentages: string;
  knownLiabilities: boolean;
  liabilities: string;
}

const FormValidation = Yup.object().shape({
  businessName: Yup.string().required("Please enter the business name"),
  entityName: Yup.string().optional(),
  entityType: Yup.string().optional(),
  businessDescription: Yup.string().required(
    "Please enter the business description"
  ),
});

const NewTonForm: React.FC<NewTonFormProps> = ({
  setBusinessDetails,
  setLoading,
  setProgress,
  setReady,
  setToken,
  token,
  jwtToken,
  progress,
  setModal1,
  setResults,
}) => {
  const router = useRouter();
  const [hasEntity, setHasEntity] = useState(false);
  const [purchaseType, setPurchaseType] = useState(false);
  const [ownershipStructureKnown, setOwnershipStructureKnown] = useState(false);
  const [liabilitiesKnown, setLiabilitiesKnown] = useState(false);

  const showMessage1 = () => {
    const toast = Swal.mixin({
      toast: true,
      position: "top-start",
      showConfirmButton: false,
      timer: 3000,
    });

    toast.fire({
      icon: "success",
      title: "Connecting to API",
      padding: "10px 20px",
    });
  };

  const showMessage2 = () => {
    const toast = Swal.mixin({
      toast: true,
      position: "top-start",
      showConfirmButton: false,
      timer: 3000,
    });

    toast.fire({
      title: "Building checklist (this may take up to 3 minutes)",
      padding: "10px 20px",
    });
  };

  const submitForm = async (values: FormValues) => {
    setReady(false);
    setLoading(true);
    setBusinessDetails({ ...values, token });

    setProgress((progress: number) => progress - progress + 1);

    const maxRetries = 5;
    let retryCount = 0;
    let success = false;

    while (!success && ++retryCount <= maxRetries) {
      try {
        const response = await customFetch(`${baseUrl}/newton`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${jwtToken}`,
          },
          body: JSON.stringify(values),
        });

        const data = await response.json();

        setToken(data.token);

        setTimeout(async () => updateProgress(data.token, true), 100);
        setTimeout(() => showMessage1(), 1000);
        setTimeout(() => showMessage2(), 5000);

        success = true;
      } catch (err) {
        console.error(err);
        retryToast("warning", retryCount);
        await new Promise(res => setTimeout(res, 3000));
      }
    }
  };

  const updateProgress = async (tok: string, newFire: boolean) => {
    if (newFire) {
      setProgress((progress: number) => progress - progress + 1);
    } else {
      if (progress < 12) setProgress((progress: number) => progress + 1);
    }

    const maxRetries = 5;
    let retryCount = 0;
    let success = false;
    while (!success && ++retryCount <= maxRetries) {
      try {
        const response = await customFetch(`${baseUrl}/queryRequest/${tok}`, {
          headers: {
            Authorization: `Bearer ${jwtToken}`,
          },
        });
        const data = await response.json();

        if (data.progress !== undefined) {
          setTimeout(
            () => updateProgress(tok, false),
            Math.floor(Math.random() * (15000 - 10000 + 1) + 10000)
          );

          return;
        }

        if (data?.status === "error") {
          console.error("error");

          setModal1(true);

          return;
        }

        if (data?.status === "completed") {
          const response = await customFetch(`${baseUrl}/endRequest/${tok}`, {
            headers: {
              Authorization: `Bearer ${jwtToken}`,
            },
          });
          const data = await response.json();

          if (!data.response) {
            console.error("error");

            setModal1(true);

            return;
          }

          const theResponse = data.response;

          if (!theResponse.result) {
            console.error("error");

            setModal1(true);

            return;
          }

          const result = theResponse.result;

          if (!result) {
            console.error("error");

            setModal1(true);

            return;
          }

          setResults(result);
          setLoading(false);
          setReady(true);

          try {
            window.scrollTo(0, 0);
          } catch (e) {}
        }

        success = true;
      } catch (err) {
        console.error(err);
        retryToast("warning", retryCount);
        await new Promise(res => setTimeout(res, 3000));
      }
    }
  };

  const [ref, { height }] = useMeasure();
  const [ref2, { height: height2 }] = useMeasure();
  const [ref3, { height: height3 }] = useMeasure();
  const [ref4, { height: height4 }] = useMeasure();

  let formikRef: { current: FormikProps<FormValues> | null } = {
    current: null,
  };

  useEffect(() => {
    if (formikRef.current && router.query.business) {
      const {
        name: businessName = "",
        about: businessDescription = "",
        entityName: businessEntityName = "",
        entityType: businessEntityType = "",
        ownershipStructure: businessOwnershipStructure = "",
        liabilities: businessLiabilities = "",
        platformBusiness: isPlatformBusiness = false,
        assetsIncluded: includedAssets = "",
        sellerContinuity: hasSellerContinuity = false,
      } = JSON.parse(router.query.business as string);

      if (businessEntityName) {
        setHasEntity(true);
      }

      if (includedAssets) {
        setPurchaseType(true);
      }

      if (businessOwnershipStructure) {
        setOwnershipStructureKnown(true);
      }

      if (businessLiabilities) {
        setLiabilitiesKnown(true);
      }

      formikRef.current.setValues((prevState: FormValues) => ({
        ...prevState,
        businessName: businessName || prevState.businessName,
        businessDescription:
          businessDescription || prevState.businessDescription,
        entityName: businessEntityName || prevState.entityName,
        entityType: businessEntityType || prevState.entityType,
        ownershipStructure:
          businessOwnershipStructure || prevState.ownershipStructure,
        liabilities: businessLiabilities || prevState.liabilities,
        // platformBusiness: isPlatformBusiness || prevState.platformBusiness,
        includedAssets: includedAssets || prevState.includedAssets,
        // sellerContinuity: hasSellerContinuity || prevState.sellerContinuity,
      }));
    }
  }, [router.query]);

  const accordionAnimation = useSpring({
    height: hasEntity ? `${height}px` : "0px",
    opacity: hasEntity ? 1 : 0,
    config: { tension: 500, friction: 52 },
  });

  const accordionAnimation2 = useSpring({
    height: purchaseType ? `${height2}px` : "0px",
    opacity: purchaseType ? 1 : 0,
    config: { tension: 500, friction: 52 },
  });

  const accordionAnimation3 = useSpring({
    height: ownershipStructureKnown ? `${height3}px` : "0px",
    opacity: ownershipStructureKnown ? 1 : 0,
    config: { tension: 500, friction: 52 },
  });

  const accordionAnimation4 = useSpring({
    height: liabilitiesKnown ? `${height4}px` : "0px",
    opacity: liabilitiesKnown ? 1 : 0,
    config: { tension: 500, friction: 52 },
  });
  return (
    <>
      {" "}
      <Formik
        initialValues={{
          businessName: "",
          entityName: "",
          entityType: "",
          businessDescription: "",
          purchaseType: false,
          includedAssets: "",
          ownershipStructure: "",
          ownerNamesAndPercentages: "",
          knownLiabilities: false,
          liabilities: "",
        }}
        innerRef={formikInstance => (formikRef.current = formikInstance)}
        validationSchema={FormValidation}
        onSubmit={submitForm}
      >
        {({ errors, submitCount, touched, values, setFieldValue }) => (
          <Form className="space-y-5">
            <div
              className={
                submitCount
                  ? errors.businessName
                    ? "has-error"
                    : "has-success"
                  : ""
              }
            >
              <label htmlFor="businessName">Business Name</label>
              <div className="flex">
                <Field
                  name="businessName"
                  type="text"
                  id="businessName"
                  className="form-input "
                />
              </div>
              {submitCount ? (
                errors.businessName ? (
                  <div className="mt-1 text-danger">{errors.businessName}</div>
                ) : (
                  <div className="mt-1 text-success">Looks Good!</div>
                )
              ) : (
                ""
              )}
            </div>

            <label htmlFor="hasEntity">Does the business have an entity?</label>
            <div className="flex items-center">
              <span>No</span>
              <label className="relative ml-2 mr-2 h-6 w-12">
                <input
                  type="checkbox"
                  className="custom_switch peer absolute z-10 h-full w-full cursor-pointer opacity-0"
                  id="hasEntity"
                  checked={hasEntity}
                  onChange={e => setHasEntity(e.target.checked)}
                />
                <span className="block h-full rounded-full bg-[#ebedf2] before:absolute before:left-1 before:bottom-1 before:h-4 before:w-4 before:rounded-full before:bg-white before:transition-all before:duration-300 peer-checked:bg-primary peer-checked:before:left-7 dark:bg-dark dark:before:bg-white-dark dark:peer-checked:before:bg-white"></span>
              </label>
              <span>Yes</span>
            </div>

            <animated.div
              style={{
                ...accordionAnimation,
                overflow: "hidden",
              }}
            >
              <div ref={ref}>
                <div
                  className={
                    submitCount
                      ? errors.entityName
                        ? "has-error"
                        : "has-success"
                      : ""
                  }
                >
                  <label htmlFor="entityName">
                    Name of the Business Entity
                  </label>
                  <div className="flex">
                    <Field
                      name="entityName"
                      type="text"
                      id="entityName"
                      className="form-input "
                    />
                  </div>
                  {submitCount ? (
                    errors.entityName ? (
                      <div className="mt-1 text-danger">
                        {errors.entityName}
                      </div>
                    ) : (
                      <div className="mt-1 text-success">Looks Good!</div>
                    )
                  ) : (
                    ""
                  )}
                </div>

                <div
                  className={
                    submitCount
                      ? errors.entityType
                        ? "has-error"
                        : "has-success"
                      : ""
                  }
                >
                  <label htmlFor="entityType">
                    Entity Type and Jurisdiction
                  </label>
                  <div className="flex">
                    <Field
                      name="entityType"
                      type="text"
                      id="entityType"
                      className="form-input "
                    />
                  </div>
                  {submitCount ? (
                    errors.entityType ? (
                      <div className="mt-1 text-danger">
                        {errors.entityType}
                      </div>
                    ) : (
                      <div className="mt-1 text-success">Looks Good!</div>
                    )
                  ) : (
                    ""
                  )}
                </div>
              </div>
            </animated.div>

            <div
              className={
                submitCount
                  ? errors.businessDescription
                    ? "has-error"
                    : "has-success"
                  : ""
              }
            >
              <label htmlFor="businessDescription">Business Description</label>
              <div className="flex">
                <Field
                  name="businessDescription"
                  type="textarea"
                  as="textarea"
                  id="businessDescription"
                  className="form-input whitespace-pre-wrap "
                  rows={8}
                  style={{ height: "450px" }}
                />
              </div>
              {submitCount ? (
                errors.businessDescription ? (
                  <div className="mt-1 text-danger">
                    {errors.businessDescription}
                  </div>
                ) : (
                  <div className="mt-1 text-success">Looks Good!</div>
                )
              ) : (
                ""
              )}
            </div>

            <label htmlFor="purchaseType">Type of Purchase</label>
            <div className="flex items-center">
              <span>Entity Purchase</span>
              <label className="relative ml-2 mr-2 h-6 w-12">
                <input
                  type="checkbox"
                  className="custom_switch peer absolute z-10 h-full w-full cursor-pointer opacity-0"
                  id="purchaseType"
                  checked={purchaseType}
                  onChange={e => setPurchaseType(e.target.checked)}
                />
                <span className="block h-full rounded-full bg-[#ebedf2] before:absolute before:left-1 before:bottom-1 before:h-4 before:w-4 before:rounded-full before:bg-white before:transition-all before:duration-300 peer-checked:bg-primary peer-checked:before:left-7 dark:bg-dark dark:before:bg-white-dark dark:peer-checked:before:bg-white"></span>
              </label>
              <span>Asset Purchase</span>
            </div>

            <animated.div
              style={{
                ...accordionAnimation2,
                overflow: "hidden",
              }}
            >
              <div ref={ref2}>
                <div
                  className={
                    submitCount
                      ? errors.includedAssets
                        ? "has-error"
                        : "has-success"
                      : ""
                  }
                >
                  <label htmlFor="includedAssets">
                    What Specific Assets are Being Bought?
                  </label>
                  <div className="flex">
                    <Field
                      name="includedAssets"
                      type="textarea"
                      id="includedAssets"
                      className="form-input "
                      as="textarea"
                    />
                  </div>
                  {submitCount ? (
                    errors.includedAssets ? (
                      <div className="mt-1 text-danger">
                        {errors.includedAssets}
                      </div>
                    ) : (
                      <div className="mt-1 text-success">Looks Good!</div>
                    )
                  ) : (
                    ""
                  )}
                </div>
              </div>
            </animated.div>

            <label htmlFor="ownershipStructure">
              Is the Ownership Structure Known?
            </label>
            <div className="flex items-center">
              <span>No</span>
              <label className="relative ml-2 mr-2 h-6 w-12">
                <input
                  type="checkbox"
                  className="custom_switch peer absolute z-10 h-full w-full cursor-pointer opacity-0"
                  id="ownershipStructureKnown"
                  checked={ownershipStructureKnown}
                  onChange={e => setOwnershipStructureKnown(e.target.checked)}
                />
                <span className="block h-full rounded-full bg-[#ebedf2] before:absolute before:left-1 before:bottom-1 before:h-4 before:w-4 before:rounded-full before:bg-white before:transition-all before:duration-300 peer-checked:bg-primary peer-checked:before:left-7 dark:bg-dark dark:before:bg-white-dark dark:peer-checked:before:bg-white"></span>
              </label>
              <span>Yes</span>
            </div>

            <animated.div
              style={{
                ...accordionAnimation3,
                overflow: "hidden",
              }}
            >
              <div ref={ref3}>
                <div
                  className={
                    submitCount
                      ? errors.ownershipStructure
                        ? "has-error"
                        : "has-success"
                      : ""
                  }
                >
                  <label htmlFor="includedAssets">
                    Your Understanding of the Ownership Structure
                  </label>
                  <div className="flex">
                    <Field
                      name="ownershipStructure"
                      type="textarea"
                      id="ownershipStructure"
                      className="form-input "
                      as="textarea"
                    />
                  </div>
                  {submitCount ? (
                    errors.ownershipStructure ? (
                      <div className="mt-1 text-danger">
                        {errors.ownershipStructure}
                      </div>
                    ) : (
                      <div className="mt-1 text-success">Looks Good!</div>
                    )
                  ) : (
                    ""
                  )}
                </div>

                <div
                  className={
                    submitCount
                      ? errors.ownerNamesAndPercentages
                        ? "has-error"
                        : "has-success"
                      : ""
                  }
                >
                  <label htmlFor="includedAssets">
                    Top 5 Owners and Percentage Ownership
                  </label>
                  <div className="flex">
                    <Field
                      name="ownerNamesAndPercentages"
                      type="textarea"
                      id="ownerNamesAndPercentages"
                      className="form-input "
                      as="textarea"
                    />
                  </div>
                  {submitCount ? (
                    errors.ownerNamesAndPercentages ? (
                      <div className="mt-1 text-danger">
                        {errors.ownerNamesAndPercentages}
                      </div>
                    ) : (
                      <div className="mt-1 text-success">Looks Good!</div>
                    )
                  ) : (
                    ""
                  )}
                </div>
              </div>
            </animated.div>

            <label htmlFor="liabilitiesKnown">
              Are the Current Liabilities Known?
            </label>
            <div className="flex items-center">
              <span>No</span>
              <label className="relative ml-2 mr-2 h-6 w-12">
                <input
                  type="checkbox"
                  className="custom_switch peer absolute z-10 h-full w-full cursor-pointer opacity-0"
                  id="liabilitiesKnown"
                  checked={liabilitiesKnown}
                  onChange={e => setLiabilitiesKnown(e.target.checked)}
                />
                <span className="block h-full rounded-full bg-[#ebedf2] before:absolute before:left-1 before:bottom-1 before:h-4 before:w-4 before:rounded-full before:bg-white before:transition-all before:duration-300 peer-checked:bg-primary peer-checked:before:left-7 dark:bg-dark dark:before:bg-white-dark dark:peer-checked:before:bg-white"></span>
              </label>
              <span>Yes</span>
            </div>

            <animated.div
              style={{
                ...accordionAnimation4,
                overflow: "hidden",
              }}
            >
              <div ref={ref4}>
                <div
                  className={
                    submitCount
                      ? errors.liabilities
                        ? "has-error"
                        : "has-success"
                      : ""
                  }
                >
                  <label htmlFor="liabilities">
                    Your Understanding of the Liabilities
                  </label>
                  <div className="flex">
                    <Field
                      name="liabilities"
                      type="textarea"
                      id="liabilities"
                      className="form-input "
                      as="textarea"
                    />
                  </div>
                  {submitCount ? (
                    errors.liabilities ? (
                      <div className="mt-1 text-danger">
                        {errors.liabilities}
                      </div>
                    ) : (
                      <div className="mt-1 text-success">Looks Good!</div>
                    )
                  ) : (
                    ""
                  )}
                </div>
              </div>
            </animated.div>

            <button type="submit" className="btn btn-primary !mt-6">
              Create Due Diligence Checklist
            </button>
          </Form>
        )}
      </Formik>
    </>
  );
};

export default NewTonForm;
