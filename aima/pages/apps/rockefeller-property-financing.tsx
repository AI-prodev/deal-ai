import Link from "next/link";
import { useEffect, useMemo, useRef, useState } from "react";

import * as Yup from "yup";
import { Field, Form, Formik, FormikProps } from "formik";
import Swal from "sweetalert2";
import { useRouter } from "next/router";
import { useFormikContext } from "formik";
import { GetServerSideProps, GetServerSidePropsContext } from "next";
import withAuth from "@/helpers/withAuth";
import { useAuth } from "@/helpers/useAuth";
import { getSession, useSession } from "next-auth/react";

import LoadingAnimation from "@/components/LoadingAnimation";
import { createProfileAPI } from "@/store/features/profileApi";
import { BUYER_ROLES } from "@/utils/roles";
import Head from "next/head";

interface FormValues {
  firstName: string;
  lastName: string;
  email: string;
  city: string;
  state: string;
  zip: string;
  phone: string;
  homeowner: boolean;
  agree: boolean;
  income: string;
  credit: string;
  budget: string;
  cash: string;
  currentBusiness: boolean;
  currentBusinessDescription: string;
  targetPropertyName: string;
  targetPropertyUrl: string;
  targetPropertyLocation: string;
  targetPropertyDescription: string;
  targetPropertyCost: string;
  targetPropertyAcres: string;
  targetPropertyRelevance: string;
}

const scrollToFirstError = (errors: any) => {
  const firstErrorKey = Object.keys(errors)[0];
  if (firstErrorKey) {
    const errorElement = document.querySelector(`[name=${firstErrorKey}]`);
    if (errorElement) {
      const topOffset = 100;
      const elementPosition = errorElement.getBoundingClientRect().top;
      window.scrollBy({
        top: elementPosition - topOffset,
        behavior: "smooth",
      });
    }
  }
};

function buildQueryString(obj: FormValues) {
  return Object.keys(obj)
    .map(key => {
      const typedKey = key as keyof FormValues;
      const value =
        typeof obj[typedKey] === "boolean"
          ? obj[typedKey]
            ? "yes"
            : "no"
          : obj[typedKey];
      return (
        encodeURIComponent(key) + "=" + encodeURIComponent(value as string)
      );
    })
    .join("&");
}

const FormValidation = Yup.object().shape({
  firstName: Yup.string().required("Please enter your first name"),
  lastName: Yup.string().required("Please enter your last name"),
  email: Yup.string()
    .email("Invalid email")
    .required("Please enter your email"),
  city: Yup.string().required("Please enter your city"),
  state: Yup.string().required("Please enter your  state / province"),
  // .lowercase()
  // .matches(
  //   /^(?:ala(?:(?:bam|sk)a)|american samoa|arizona|arkansas|(?:^(?!baja )california)|colorado|connecticut|delaware|district of columbia|florida|georgia|guam|hawaii|idaho|illinois|indiana|iowa|kansas|kentucky|louisiana|maine|maryland|massachusetts|michigan|minnesota|miss(?:(?:issipp|our)i)|montana|nebraska|nevada|new (?:hampshire|jersey|mexico|york)|north (?:(?:carolin|dakot)a)|ohio|oklahoma|oregon|pennsylvania|puerto rico|rhode island|south (?:(?:carolin|dakot)a)|tennessee|texas|utah|vermont|virgin(?:ia| island(s?))|washington|west virginia|wisconsin|wyoming|a[klrsz]|c[aot]|d[ce]|fl|g[au]|hi|i[adln]|k[sy]|la|m[adeinost]|n[cdehjmvy]|o[hkr]|p[ar]|ri|s[cd]|t[nx]|ut|v[ait]|w[aivy])$/,
  //   "Must be a valid state",
  // )
  zip: Yup.string().required("Please enter your  ZIP / Postcode"),
  // .matches(/^[0-9]+$/, "Must be only digits")
  // .min(5, "Must be exactly 5 digits")
  // .max(5, "Must be exactly 5 digits"),
  phone: Yup.string()
    .required("Please enter your phone number")
    .matches(/\(?\d{3}\)?-? *\d{3}-? *-?\d{4}/, "Must be a valid phone number"),
  homeowner: Yup.bool().optional(),
  income: Yup.number().required("Please enter your income").min(1),
  credit: Yup.number()
    .required("Please enter your credit score")
    .min(300, "Minimum score is 300")
    .max(850, "Maximum score is 850"),
  budget: Yup.number().required("Please enter your budget").min(1),
  cash: Yup.number().required("Please enter your available cash").min(1),
  agree: Yup.bool().oneOf([true], "You must agree before submitting."),
  currentBusiness: Yup.bool().optional(),
  currentBusinessDescription: Yup.string().optional(),
  targetPropertyName: Yup.string().required("Enter the name of the business"),
  targetPropertyUrl: Yup.string().optional(),
  targetPropertyLocation: Yup.string().optional(),
  targetPropertyDescription: Yup.string().optional(),
  targetPropertyCost: Yup.string().optional(),
  targetPropertyAcres: Yup.string().optional(),
  targetPropertyRelevance: Yup.string().optional(),
});
type WizardsProps = {
  jwtToken: string;
};
const Wizards = ({ jwtToken }: WizardsProps) => {
  const appName = "Commercial Property Financing";
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [submitFailed, setSubmitFailed] = useState(false);

  const { data: session } = useSession();

  const submitForm = async (values: FormValues) => {
    setSubmitFailed(false);
    setIsSubmitting(true);
    const valuesCopy = JSON.parse(JSON.stringify(values));

    const queryValue = values;

    delete valuesCopy.targetPropertyName;
    delete valuesCopy.targetPropertyUrl;
    delete valuesCopy.targetPropertyLocation;
    delete valuesCopy.targetPropertyDescription;
    delete valuesCopy.targetPropertyCost;
    delete valuesCopy.targetPropertyAcres;
    delete valuesCopy.targetPropertyRelevance;

    localStorage.setItem("formikValues", JSON.stringify(valuesCopy));
    values.agree = values.agree ? true : false;
    values.homeowner = values.homeowner ? true : false;
    values.currentBusiness = values.currentBusiness ? true : false;

    const queryString = buildQueryString(queryValue);

    // Send the GET request with the form values as query string parameters
    const url =
      "https://hooks.zapier.com/hooks/catch/14242389/3t0w32b?" + queryString;

    try {
      const response = await fetch(url);

      if (!response.ok) {
        throw new Error("Network response was not ok");
      }

      const data = await response.json();
      setSubmitSuccess(true);
      setIsSubmitting(false);
      const toast = Swal.mixin({
        toast: true,
        position: "top",
        showConfirmButton: false,
        timer: 3000,
      });
      toast.fire({
        icon: "success",
        title: "Form submitted successfully",
        padding: "10px 20px",
      });
    } catch (error) {
      setSubmitFailed(true);
      setIsSubmitting(false);
      console.error("Error:", error);
    }
  };

  const [isMounted, setIsMounted] = useState(false);
  useEffect(() => {
    setIsMounted(true);
  });

  const router = useRouter();

  const emptyFormValues = {
    firstName: "",
    lastName: "",
    email: "",
    city: "",
    state: "",
    zip: "",
    phone: "",
    homeowner: true,
    income: "",
    credit: "",
    budget: "",
    cash: "",
    currentBusiness: true,
    currentBusinessDescription: "",
    targetPropertyName: "",
    targetPropertyUrl: "",

    targetPropertyLocation: "",
    targetPropertyDescription: "",
    targetPropertyCost: "",
    targetPropertyAcres: "",
    targetPropertyRelevance: "",
    agree: false,
  };

  const loadSavedValues = () => {
    if (typeof window === "undefined") {
      return emptyFormValues;
    }

    const savedValues = localStorage.getItem("formikValues");
    const initialValues = savedValues
      ? JSON.parse(savedValues)
      : emptyFormValues;

    return initialValues;
  };

  const [initialValues, setInitialValues] = useState(loadSavedValues());

  let formikRef: { current: FormikProps<FormValues> | null } = {
    current: null,
  };

  const profileApiClient = createProfileAPI;

  const {
    //@ts-ignore
    data: profile,
    //@ts-ignore
    isLoading,
    //@ts-ignore
    refetch,
  } = profileApiClient.useGetProfileQuery() ?? {};

  useEffect(() => {
    if (profile && profile.fields) {
      setInitialValues({
        ...initialValues,
        firstName: profile.fields.firstName || "",
        lastName: profile.fields.lastName || "",
        email: profile.user.email || "",
        city: profile.fields.city || "",
        state: profile.fields.state || "",
        zip: profile.fields.zip || "",
        phone: profile.fields.phone || "",
        profileImage: profile.profileImage || "",
        homeowner: profile.fields.homeowner || "",
        income: profile.fields.income || "",
        credit: profile.fields.credit || "",
        budget: profile.fields.budget || "",
        cash: profile.fields.cash || "",
        currentBusiness: profile.fields.currentBusiness || "",
        currentBusinessDescription:
          profile.fields.currentBusinessDescription || "",
      });
    }
  }, [profile]);

  useEffect(() => {
    if (router.query.property) {
      const {
        url: targetPropertyUrl = "",
        about: targetPropertyDescription = "",
        name: targetPropertyName = "",
        price: targetPropertyCost = "",
        location: targetPropertyLocation = "",
        acres: targetPropertyAcres = "",
        rationale: targetPropertyRelevance = "",
      } = JSON.parse(router.query.property as string);

      setInitialValues({
        ...initialValues,
        targetPropertyName: targetPropertyName || "",
        targetPropertyUrl: targetPropertyUrl || "",
        targetPropertyLocation: targetPropertyLocation || "",
        targetPropertyDescription: targetPropertyDescription || "",
        targetPropertyCost: targetPropertyCost || "",
        targetPropertyAcres: targetPropertyAcres || "",
        targetPropertyRelevance: targetPropertyRelevance || "",
      });
    }
  }, [router.query]);

  const FormikLogger = () => {
    const { values } = useFormikContext();
    const prevValuesRef = useRef(values);

    useEffect(() => {
      const prevValues = prevValuesRef.current;
      const valuesChanged =
        JSON.stringify(prevValues) !== JSON.stringify(values);

      if (valuesChanged && (submitSuccess || submitFailed)) {
        setSubmitSuccess(false);
        setSubmitFailed(false);
      }

      prevValuesRef.current = values;
    }, [JSON.stringify(values), submitSuccess, submitFailed]);

    // You can return null if you don't want to render anything
    return null;
  };

  if (isLoading) {
    return <LoadingAnimation />;
  }

  return (
    <>
      <Head>
        <title>{appName}</title>
      </Head>
      <div>
        <ul className="flex space-x-2 rtl:space-x-reverse">
          <li>
            <Link href="#" className="text-primary hover:underline">
              Apps
            </Link>
          </li>
          <li className="before:content-['/'] ltr:before:mr-2 rtl:before:ml-2">
            <span>{appName}</span>
          </li>
        </ul>
        <div className="space-y-8 pt-5">
          {/* <h4 className="badge mb-0 inline-block bg-primary text-base hover:top-0">
          Alpha Build - deal.ai Team Use Only
        </h4> */}
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
            <div className="panel">
              <div className="mb-5 flex items-center justify-between">
                <h5 className="text-lg font-semibold dark:text-white-light">
                  {appName}
                </h5>
              </div>
              <Formik
                key={JSON.stringify(initialValues)}
                initialValues={initialValues}
                validationSchema={FormValidation}
                onSubmit={submitForm}
                innerRef={formikInstance => {
                  if (formikInstance?.errors) {
                    scrollToFirstError(formikInstance.errors);
                  }
                  formikRef.current = formikInstance;
                }}
              >
                {({ errors, submitCount, touched, values }) => (
                  <Form className="space-y-5">
                    <h5 className="mb-4 text-xl font-semibold text-[#3b3f5c] dark:text-white-light">
                      About You
                    </h5>
                    <div className="grid grid-cols-1 gap-5 md:grid-cols-3">
                      <div
                        className={
                          submitCount
                            ? errors.firstName
                              ? "has-error"
                              : "has-success"
                            : ""
                        }
                      >
                        <label htmlFor="firstName">First Name </label>
                        <Field
                          name="firstName"
                          type="text"
                          id="firstName"
                          className="form-input"
                        />

                        {submitCount ? (
                          errors.firstName ? (
                            <div className="mt-1 text-danger">
                              {errors.firstName}
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
                            ? errors.lastName
                              ? "has-error"
                              : "has-success"
                            : ""
                        }
                      >
                        <label htmlFor="fullName">Last Name </label>
                        <Field
                          name="lastName"
                          type="text"
                          id="lastName"
                          className="form-input"
                        />

                        {submitCount ? (
                          errors.lastName ? (
                            <div className="mt-1 text-danger">
                              {errors.lastName}
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
                            ? errors.email
                              ? "has-error"
                              : "has-success"
                            : ""
                        }
                      >
                        <label htmlFor="email">Email</label>
                        <div className="flex">
                          <div className="flex items-center justify-center border border-white-light bg-[#eee] px-3 font-semibold ltr:rounded-l-md ltr:border-r-0 rtl:rounded-r-md rtl:border-l-0 dark:border-[#17263c] dark:bg-[#1b2e4b]">
                            @
                          </div>
                          <Field
                            name="email"
                            type="text"
                            id="email"
                            className="form-input ltr:rounded-l-none rtl:rounded-r-none"
                          />
                        </div>
                        {submitCount ? (
                          errors.email ? (
                            <div className="mt-1 text-danger">
                              {errors.email}
                            </div>
                          ) : (
                            <div className="mt-1 text-success">Looks Good!</div>
                          )
                        ) : (
                          ""
                        )}
                      </div>
                    </div>
                    <div className="grid grid-cols-1 gap-5 md:grid-cols-4">
                      <div
                        className={`md:col-span-2 ${
                          submitCount
                            ? errors.city
                              ? "has-error"
                              : "has-success"
                            : ""
                        }`}
                      >
                        <label htmlFor="customeCity">City</label>
                        <Field
                          name="city"
                          type="text"
                          id="city"
                          className="form-input"
                        />

                        {submitCount ? (
                          errors.city ? (
                            <div className="mt-1 text-danger">
                              {errors.city}
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
                            ? errors.state
                              ? "has-error"
                              : "has-success"
                            : ""
                        }
                      >
                        <label htmlFor="customeState">State / Province</label>
                        <Field
                          name="state"
                          type="text"
                          id="customeState"
                          className="form-input"
                        />
                        {submitCount ? (
                          errors.state ? (
                            <div className="mt-1 text-danger">
                              {errors.state}
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
                            ? errors.zip
                              ? "has-error"
                              : "has-success"
                            : ""
                        }
                      >
                        <label htmlFor="customeZip">ZIP / Postcode</label>
                        <Field
                          name="zip"
                          type="text"
                          id="customeZip"
                          className="form-input"
                        />
                        {submitCount ? (
                          errors.zip ? (
                            <div className="mt-1 text-danger">{errors.zip}</div>
                          ) : (
                            <div className="mt-1 text-success">Looks Good!</div>
                          )
                        ) : (
                          ""
                        )}
                      </div>
                    </div>

                    <div
                      className={
                        submitCount
                          ? errors.phone
                            ? "has-error"
                            : "has-success"
                          : ""
                      }
                    >
                      <label htmlFor="phone">Phone</label>
                      <div className="flex">
                        <div className="flex items-center justify-center border border-white-light bg-[#eee] px-3 font-semibold ltr:rounded-l-md ltr:border-r-0 rtl:rounded-r-md rtl:border-l-0 dark:border-[#17263c] dark:bg-[#1b2e4b]">
                          ☎
                        </div>
                        <Field
                          name="phone"
                          type="text"
                          id="phone"
                          className="form-input ltr:rounded-l-none rtl:rounded-r-none"
                        />
                      </div>
                      {submitCount ? (
                        errors.phone ? (
                          <div className="mt-1 text-danger">{errors.phone}</div>
                        ) : (
                          <div className="mt-1 text-success">Looks Good!</div>
                        )
                      ) : (
                        ""
                      )}
                    </div>

                    <h5 className="mb-4 text-xl font-semibold text-[#3b3f5c] dark:text-white-light">
                      Your Situation
                    </h5>

                    <div
                      className={
                        submitCount
                          ? errors.homeowner
                            ? "has-error"
                            : "has-success"
                          : ""
                      }
                    >
                      <div className="flex">
                        <Field
                          name="homeowner"
                          id="homeowner"
                          type="checkbox"
                          className="form-checkbox"
                        />
                        {values.homeowner}
                        <label
                          htmlFor="homeowner"
                          className="font-semibold text-white-dark"
                        >
                          I am a homeowner
                        </label>
                      </div>
                      {submitCount ? (
                        errors.homeowner ? (
                          <div className="mt-1 text-danger">{errors.agree}</div>
                        ) : (
                          ""
                        )
                      ) : (
                        ""
                      )}
                    </div>

                    <div className="grid grid-cols-1 gap-5 md:grid-cols-3">
                      <div
                        className={
                          submitCount
                            ? errors.income
                              ? "has-error"
                              : "has-success"
                            : ""
                        }
                      >
                        <label htmlFor="income">Annual Income</label>
                        <div className="flex">
                          <div className="flex items-center justify-center border border-white-light bg-[#eee] px-3 font-semibold ltr:rounded-l-md ltr:border-r-0 rtl:rounded-r-md rtl:border-l-0 dark:border-[#17263c] dark:bg-[#1b2e4b]">
                            $
                          </div>
                          <Field
                            name="income"
                            type="text"
                            id="income"
                            className="form-input ltr:rounded-l-none rtl:rounded-r-none"
                          />
                        </div>
                        {submitCount ? (
                          errors.income ? (
                            <div className="mt-1 text-danger">
                              {errors.income}
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
                            ? errors.credit
                              ? "has-error"
                              : "has-success"
                            : ""
                        }
                      >
                        <label htmlFor="credit">Credit Score</label>
                        <div className="flex">
                          <Field
                            name="credit"
                            type="text"
                            id="credit"
                            className="form-input"
                          />
                        </div>
                        {submitCount ? (
                          errors.credit ? (
                            <div className="mt-1 text-danger">
                              {errors.credit}
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
                            ? errors.budget
                              ? "has-error"
                              : "has-success"
                            : ""
                        }
                      >
                        <label htmlFor="income">Budget</label>
                        <div className="flex">
                          <div className="flex items-center justify-center border border-white-light bg-[#eee] px-3 font-semibold ltr:rounded-l-md ltr:border-r-0 rtl:rounded-r-md rtl:border-l-0 dark:border-[#17263c] dark:bg-[#1b2e4b]">
                            $
                          </div>
                          <Field
                            name="budget"
                            type="text"
                            id="budget"
                            className="form-input ltr:rounded-l-none rtl:rounded-r-none"
                          />
                        </div>
                        {submitCount ? (
                          errors.budget ? (
                            <div className="mt-1 text-danger">
                              {errors.budget}
                            </div>
                          ) : (
                            <div className="mt-1 text-success">Looks Good!</div>
                          )
                        ) : (
                          ""
                        )}
                      </div>
                    </div>

                    <div
                      className={
                        submitCount
                          ? errors.cash
                            ? "has-error"
                            : "has-success"
                          : ""
                      }
                    >
                      <label htmlFor="cash">Cash Available</label>
                      <div className="flex">
                        <div className="flex items-center justify-center border border-white-light bg-[#eee] px-3 font-semibold ltr:rounded-l-md ltr:border-r-0 rtl:rounded-r-md rtl:border-l-0 dark:border-[#17263c] dark:bg-[#1b2e4b]">
                          $
                        </div>
                        <Field
                          name="cash"
                          type="text"
                          id="cash"
                          className="form-input ltr:rounded-l-none rtl:rounded-r-none"
                        />
                      </div>
                      {submitCount ? (
                        errors.cash ? (
                          <div className="mt-1 text-danger">{errors.cash}</div>
                        ) : (
                          <div className="mt-1 text-success">Looks Good!</div>
                        )
                      ) : (
                        ""
                      )}
                    </div>

                    <h5 className="mb-4 text-xl font-semibold text-[#3b3f5c] dark:text-white-light">
                      Your Current Business(es)
                    </h5>

                    <div
                      className={
                        submitCount
                          ? errors.currentBusiness
                            ? "has-error"
                            : "has-success"
                          : ""
                      }
                    >
                      <div className="flex">
                        <Field
                          name="currentBusiness"
                          id="currentBusiness"
                          type="checkbox"
                          className="form-checkbox"
                        />
                        {values.currentBusiness}
                        <label
                          htmlFor="currentBusiness"
                          className="font-semibold text-white-dark"
                        >
                          I currently own one or more businesses
                        </label>
                      </div>
                      {submitCount ? (
                        errors.currentBusiness ? (
                          <div className="mt-1 text-danger">
                            {errors.currentBusiness}
                          </div>
                        ) : (
                          ""
                        )
                      ) : (
                        ""
                      )}
                    </div>

                    <div
                      className={
                        submitCount
                          ? errors.currentBusinessDescription
                            ? "has-error"
                            : "has-success"
                          : ""
                      }
                    >
                      <label htmlFor="currentBusinessDescription">
                        Description of Current Businesses (if owner)
                      </label>
                      <div className="flex">
                        <Field
                          name="currentBusinessDescription"
                          type="textarea"
                          id="currentBusinessDescription"
                          className="form-input"
                          as="textarea"
                          style={{ height: "300px" }}
                        />
                      </div>
                      {submitCount ? (
                        errors.currentBusinessDescription ? (
                          <div className="mt-1 text-danger">
                            {errors.currentBusinessDescription}
                          </div>
                        ) : (
                          <div className="mt-1 text-success">Looks Good!</div>
                        )
                      ) : (
                        ""
                      )}
                    </div>

                    <h5 className="mb-4 text-xl font-semibold text-[#3b3f5c] dark:text-white-light">
                      About the Target Property
                    </h5>

                    <div
                      className={
                        submitCount
                          ? errors.targetPropertyName
                            ? "has-error"
                            : "has-success"
                          : ""
                      }
                    >
                      <label htmlFor="targetPropertyName">Property Name</label>
                      <div className="flex">
                        <Field
                          name="targetPropertyName"
                          type="textarea"
                          id="targetPropertyName"
                          className="form-input"
                          as="textarea"
                        />
                      </div>
                      {submitCount ? (
                        errors.targetPropertyName ? (
                          <div className="mt-1 text-danger">
                            {errors.targetPropertyName}
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
                          ? errors.targetPropertyUrl
                            ? "has-error"
                            : "has-success"
                          : ""
                      }
                    >
                      <label htmlFor="targetPropertyUrl">Property Link</label>
                      <div className="flex">
                        <Field
                          name="targetPropertyUrl"
                          type="textarea"
                          id="targetPropertyUrl"
                          className="form-input"
                          as="textarea"
                        />
                      </div>
                      {submitCount ? (
                        errors.targetPropertyUrl ? (
                          <div className="mt-1 text-danger">
                            {errors.targetPropertyUrl}
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
                          ? errors.targetPropertyUrl
                            ? "has-error"
                            : "has-success"
                          : ""
                      }
                    >
                      <label htmlFor="targetPropertyLocation">
                        Property Location
                      </label>
                      <div className="flex">
                        <Field
                          name="targetPropertyLocation"
                          type="textarea"
                          id="targetPropertyLocation"
                          className="form-input"
                          as="textarea"
                        />
                      </div>
                      {submitCount ? (
                        errors.targetPropertyLocation ? (
                          <div className="mt-1 text-danger">
                            {errors.targetPropertyLocation}
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
                          ? errors.targetPropertyDescription
                            ? "has-error"
                            : "has-success"
                          : ""
                      }
                    >
                      <label htmlFor="targetPropertyDescription">
                        Property Description
                      </label>
                      <div className="flex">
                        <Field
                          name="targetPropertyDescription"
                          type="textarea"
                          id="targetPropertyDescription"
                          className="form-input"
                          as="textarea"
                          style={{ height: "300px" }}
                        />
                      </div>
                      {submitCount ? (
                        errors.targetPropertyDescription ? (
                          <div className="mt-1 text-danger">
                            {errors.targetPropertyDescription}
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
                          ? errors.targetPropertyCost
                            ? "has-error"
                            : "has-success"
                          : ""
                      }
                    >
                      <label htmlFor="targetPropertyCost">Property Cost</label>
                      <div className="flex">
                        <Field
                          name="targetPropertyCost"
                          type="textarea"
                          id="targetPropertyCost"
                          className="form-input"
                          as="textarea"
                        />
                      </div>
                      {submitCount ? (
                        errors.targetPropertyCost ? (
                          <div className="mt-1 text-danger">
                            {errors.targetPropertyCost}
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
                          ? errors.targetPropertyAcres
                            ? "has-error"
                            : "has-success"
                          : ""
                      }
                    >
                      <label htmlFor="targetPropertyAcres">
                        Property Acres
                      </label>
                      <div className="flex">
                        <Field
                          name="targetPropertyAcres"
                          type="textarea"
                          id="targetPropertyAcres"
                          className="form-input"
                          as="textarea"
                        />
                      </div>
                      {submitCount ? (
                        errors.targetPropertyAcres ? (
                          <div className="mt-1 text-danger">
                            {errors.targetPropertyAcres}
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
                          ? errors.targetPropertyRelevance
                            ? "has-error"
                            : "has-success"
                          : ""
                      }
                    >
                      <label htmlFor="targetPropertyRelevance">Relevance</label>
                      <div className="flex">
                        <Field
                          name="targetPropertyRelevance"
                          type="textarea"
                          id="targetPropertyRelevance"
                          className="form-input"
                          as="textarea"
                          style={{ height: "200px" }}
                        />
                      </div>
                      {submitCount ? (
                        errors.targetPropertyRelevance ? (
                          <div className="mt-1 text-danger">
                            {errors.targetPropertyRelevance}
                          </div>
                        ) : (
                          <div className="mt-1 text-success">Looks Good!</div>
                        )
                      ) : (
                        ""
                      )}
                    </div>

                    <h5 className="mb-4 text-xl font-semibold text-[#3b3f5c] dark:text-white-light">
                      Terms and Conditions
                    </h5>

                    <div
                      className={
                        submitCount
                          ? errors.agree
                            ? "has-error"
                            : "has-success"
                          : ""
                      }
                    >
                      <div className="flex">
                        <Field
                          name="agree"
                          id="agree"
                          type="checkbox"
                          className="form-checkbox"
                        />
                        {/* {values.agree} */}
                        <label
                          htmlFor="agree"
                          className="font-semibold text-white-dark"
                        >
                          Agree to{" "}
                          <a
                            href="https://home.deal.ai/terms-of-service"
                            target="_blank"
                            rel="noopener noreferrer"
                            className=" underline"
                          >
                            terms and conditions
                          </a>
                        </label>
                      </div>
                      {submitCount ? (
                        errors.agree ? (
                          <div className="mt-1 text-danger">{errors.agree}</div>
                        ) : (
                          ""
                        )
                      ) : (
                        ""
                      )}
                    </div>
                    <button
                      type="submit"
                      className={`btn btn-primary !mt-6 ${
                        submitFailed
                          ? "btn-danger"
                          : submitSuccess
                            ? "btn-success"
                            : ""
                      }`}
                      disabled={isSubmitting || submitSuccess}
                    >
                      {isSubmitting ? (
                        "Submitting..."
                      ) : submitSuccess ? (
                        <>
                          <span className="mr-2">✓</span> Application sent
                        </>
                      ) : submitFailed ? (
                        "Please Retry"
                      ) : (
                        "Apply for Property Finance"
                      )}
                    </button>

                    <FormikLogger />
                  </Form>
                )}
              </Formik>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default withAuth(Wizards, BUYER_ROLES);
