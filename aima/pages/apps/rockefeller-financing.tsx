import Link from "next/link";
import { useEffect, useMemo, useRef, useState } from "react";
import { useDispatch } from "react-redux";

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
import { set } from "lodash";
import { Switch } from "@headlessui/react";
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
  targetBusinessName: string;
  targetBusinessUrl: string;
  targetBusinessDescription: string;
  targetBusinessCost: string;
  targetBusinessRelevance: string;
  letterOfIntrest: boolean;
}

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
  // ),
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
  targetBusinessName: Yup.string().required("Enter the name of the business"),
  targetBusinessUrl: Yup.string().optional(),
  targetBusinessDescription: Yup.string().optional(),
  targetBusinessCost: Yup.string().optional(),
  targetBusinessRelevance: Yup.string().optional(),
});
type WizardsProps = {
  jwtToken: string;
};

const Wizards = ({ jwtToken }: WizardsProps) => {
  const appName = "Business Financing";
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [submitFailed, setSubmitFailed] = useState(false);
  const dispatch = useDispatch();

  const { data: session } = useSession();

  const submitForm = async (values: FormValues) => {
    setSubmitFailed(false);
    setIsSubmitting(true);
    const valuesCopy = JSON.parse(JSON.stringify(values));

    delete valuesCopy.targetBusinessName;
    delete valuesCopy.targetBusinessUrl;
    delete valuesCopy.targetBusinessDescription;
    delete valuesCopy.targetBusinessCost;
    delete valuesCopy.targetBusinessRelevance;
    delete valuesCopy.letterOfIntrest;

    localStorage.setItem("formikValues", JSON.stringify(valuesCopy));
    values.agree = values.agree ? true : false;
    values.homeowner = values.homeowner ? true : false;
    values.currentBusiness = values.currentBusiness ? true : false;
    values.letterOfIntrest = values.letterOfIntrest ? true : false;

    const queryString = await buildQueryString(values);

    // Send the GET request with the form values as query string parameters
    const url =
      "https://hooks.zapier.com/hooks/catch/14242389/3u55bml?" + queryString;

    try {
      const response = await fetch(url);

      if (!response.ok) {
        throw new Error("Network response was not ok");
      }

      const data = await response.json();

      const toast = Swal.mixin({
        toast: true,
        position: "top",
        showConfirmButton: false,
        timer: 3000,
      });

      setSubmitSuccess(true);
      setIsSubmitting(false);
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

  const router = useRouter();

  const emptyFormValues = {
    firstName: "",
    lastName: "",
    email: "",
    city: "",
    state: "",
    zip: "",
    phone: "",
    homeowner: false,
    income: "",
    credit: "",
    budget: "",
    cash: "",
    currentBusiness: false,
    currentBusinessDescription: "",
    targetBusinessName: "",
    targetBusinessUrl: "",
    targetBusinessDescription: "",
    targetBusinessCost: "",
    targetBusinessRelevance: "",
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
    if (router.query.business) {
      const {
        url: targetBusinessUrl = "",
        about: targetBusinessDescription = "",
        name: targetBusinessName = "",
        price: targetBusinessCost = "",
        rationale: targetBusinessRelevance = "",
      } = JSON.parse(router.query.business as string);

      setInitialValues({
        ...initialValues,
        targetBusinessName: targetBusinessName || "",
        targetBusinessUrl: targetBusinessUrl || "",
        targetBusinessDescription: targetBusinessDescription || "",
        targetBusinessCost: targetBusinessCost || "",
        targetBusinessRelevance: targetBusinessRelevance || "",
      });
    }
  }, [router.query]);

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
  const convertToBoolean = (value: boolean | "yes" | "no"): boolean => {
    if (value === "yes") return true;
    if (value === "no") return false;
    return value;
  };
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
                {({ errors, submitCount, touched, values, setFieldValue }) => (
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
                      About the Target Business
                    </h5>

                    <div
                      className={
                        submitCount
                          ? errors.targetBusinessName
                            ? "has-error"
                            : "has-success"
                          : ""
                      }
                    >
                      <label htmlFor="targetBusinessName">Business Name</label>
                      <div className="flex">
                        <Field
                          name="targetBusinessName"
                          type="textarea"
                          id="targetBusinessName"
                          className="form-input"
                          as="textarea"
                        />
                      </div>
                      {submitCount ? (
                        errors.targetBusinessName ? (
                          <div className="mt-1 text-danger">
                            {errors.targetBusinessName}
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
                          ? errors.targetBusinessUrl
                            ? "has-error"
                            : "has-success"
                          : ""
                      }
                    >
                      <label htmlFor="targetBusinessUrl">Business Link</label>
                      <div className="flex">
                        <Field
                          name="targetBusinessUrl"
                          type="textarea"
                          id="targetBusinessUrl"
                          className="form-input"
                          as="textarea"
                        />
                      </div>
                      {submitCount ? (
                        errors.targetBusinessUrl ? (
                          <div className="mt-1 text-danger">
                            {errors.targetBusinessUrl}
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
                          ? errors.targetBusinessDescription
                            ? "has-error"
                            : "has-success"
                          : ""
                      }
                    >
                      <label htmlFor="targetBusinessDescription">
                        Business Description
                      </label>
                      <div className="flex">
                        <Field
                          name="targetBusinessDescription"
                          type="textarea"
                          id="targetBusinessDescription"
                          className="form-input"
                          as="textarea"
                          style={{ height: "300px" }}
                        />
                      </div>
                      {submitCount ? (
                        errors.targetBusinessDescription ? (
                          <div className="mt-1 text-danger">
                            {errors.targetBusinessDescription}
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
                          ? errors.targetBusinessCost
                            ? "has-error"
                            : "has-success"
                          : ""
                      }
                    >
                      <label htmlFor="targetBusinessCost">Business Cost</label>
                      <div className="flex">
                        <Field
                          name="targetBusinessCost"
                          type="textarea"
                          id="targetBusinessCost"
                          className="form-input"
                          as="textarea"
                        />
                      </div>
                      {submitCount ? (
                        errors.targetBusinessCost ? (
                          <div className="mt-1 text-danger">
                            {errors.targetBusinessCost}
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
                        touched.letterOfIntrest
                          ? errors.letterOfIntrest
                            ? "has-error"
                            : "has-success"
                          : ""
                      }
                    >
                      <label
                        htmlFor="letterOfIntrest"
                        className="font-semibold text-white-dark"
                      >
                        LOI signed?
                      </label>
                      <div className="inline-flex items-center">
                        <span className="mr-2">No</span>
                        <Switch
                          name="letterOfIntrest"
                          checked={convertToBoolean(values.letterOfIntrest)}
                          onChange={() =>
                            setFieldValue(
                              "letterOfIntrest",
                              convertToBoolean(!values.letterOfIntrest)
                            )
                          }
                          className={`${
                            convertToBoolean(values.letterOfIntrest)
                              ? "bg-blue-600"
                              : "bg-gray-500"
                          } relative my-2 inline-flex h-6 w-11 items-center rounded-full`}
                        >
                          <span className="sr-only">LOI signed?</span>
                          <span
                            className={`${
                              convertToBoolean(values.letterOfIntrest)
                                ? "translate-x-6"
                                : "translate-x-1"
                            } inline-block h-4 w-4 transform rounded-full bg-white transition`}
                          />
                        </Switch>
                        <span className="ml-2">Yes</span>
                      </div>
                      {touched.letterOfIntrest && errors.letterOfIntrest ? (
                        <div className="mt-1 text-danger">
                          {errors.letterOfIntrest}
                        </div>
                      ) : null}
                    </div>

                    <div
                      className={
                        submitCount
                          ? errors.targetBusinessRelevance
                            ? "has-error"
                            : "has-success"
                          : ""
                      }
                    >
                      <label htmlFor="targetBusinessRelevance">Relevance</label>
                      <div className="flex">
                        <Field
                          name="targetBusinessRelevance"
                          type="textarea"
                          id="targetBusinessRelevance"
                          className="form-input"
                          as="textarea"
                          style={{ height: "200px" }}
                        />
                      </div>
                      {submitCount ? (
                        errors.targetBusinessRelevance ? (
                          <div className="mt-1 text-danger">
                            {errors.targetBusinessRelevance}
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
                        "Apply for Business Finance"
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
