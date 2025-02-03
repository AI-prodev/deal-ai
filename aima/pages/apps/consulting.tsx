import React, { useRef, useState, useEffect } from "react";
import { Formik, Field, Form, ErrorMessage, FormikHelpers } from "formik";
import * as Yup from "yup";

import { GetServerSideProps, GetServerSidePropsContext } from "next";
import { getSession } from "next-auth/react";
import withAuth from "@/helpers/withAuth";
import LoadingAnimation from "@/components/LoadingAnimation";
import Link from "next/link";
import { showErrorToastTimer, showSuccessToast } from "@/utils/toast";
import { createProfileAPI } from "@/store/features/profileApi";
import { ALL_ROLES } from "@/utils/roles";

const FormSchema = Yup.object().shape({
  firstName: Yup.string().required("First Name is required"),
  lastName: Yup.string().required("Last Name is required"),
  email: Yup.string().email("Invalid email").required("Email is required"),
  message: Yup.string().required("Message is required"),
});

interface FormValues {
  firstName: string;
  lastName: string;
  email: string;
  message: string;
}

const initialValues: FormValues = {
  firstName: "",
  lastName: "",
  email: "",
  message: "",
};

type FormProps = {};
const MyForm = ({}: FormProps) => {
  const formikRef = useRef(null);

  const [formValues, setFormValues] = useState<FormValues>(initialValues);
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
    if (profile) {
      setFormValues({
        ...formValues,
        firstName: profile.fields.firstName || "",
        lastName: profile.fields.lastName || "",
        email: profile.user.email || "",
      });
    }
  }, [profile]);

  function buildQueryString(obj: FormValues) {
    return Object.keys(obj)
      .map(key => {
        const typedKey = key as keyof FormValues;
        return (
          encodeURIComponent(key) + "=" + encodeURIComponent(obj[typedKey])
        );
      })
      .join("&");
  }

  const onSubmit = async (
    values: FormValues,
    helpers: FormikHelpers<FormValues>
  ) => {
    const { setSubmitting } = helpers;
    const queryString = buildQueryString(values);

    try {
      const proxyUrl = "https://cors-anywhere.herokuapp.com/";
      const webhookUrl =
        "https://hooks.zapier.com/hooks/catch/14242389/3z89dud/?" + queryString;

      const response = await fetch(webhookUrl);

      if (!response.ok) {
        showErrorToastTimer({ title: "Network response was not ok" });
        throw new Error("Network response was not ok");
      }

      showSuccessToast({ title: "Form submitted successfully" });

      setSubmitting(false);
    } catch (error) {
      console.error("Error:", error);
      showErrorToastTimer({
        title: "Something went wrong, please try again",
      });
      setSubmitting(false);
    }
  };

  if (isLoading) {
    return <LoadingAnimation />;
  }
  const appName = "Hire our Team for Consulting";
  return (
    <>
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
            <p className="pb-5">
              Hire our consulting team for help with buying or selling a
              business.
            </p>
            <Formik
              initialValues={formValues}
              validationSchema={FormSchema}
              onSubmit={onSubmit}
              innerRef={formikRef}
              enableReinitialize
            >
              {({ errors, touched, submitCount }) => (
                <Form className="space-y-5">
                  <div
                    className={
                      touched.firstName && errors.firstName
                        ? "has-error"
                        : touched.firstName
                          ? "has-success"
                          : ""
                    }
                  >
                    <label htmlFor="firstName">First Name</label>
                    <Field
                      id="firstName"
                      name="firstName"
                      className="form-input"
                    />
                    <ErrorMessage
                      name="firstName"
                      component="div"
                      className="mt-1 text-danger"
                    />
                  </div>

                  <div
                    className={
                      touched.lastName && errors.lastName
                        ? "has-error"
                        : touched.lastName
                          ? "has-success"
                          : ""
                    }
                  >
                    <label htmlFor="lastName">Last Name</label>
                    <Field
                      id="lastName"
                      name="lastName"
                      className="form-input"
                    />
                    <ErrorMessage
                      name="lastName"
                      component="div"
                      className="mt-1 text-danger"
                    />
                  </div>

                  <div
                    className={
                      touched.email && errors.email
                        ? "has-error"
                        : touched.email
                          ? "has-success"
                          : ""
                    }
                  >
                    <label htmlFor="email">Email</label>
                    <div className="flex">
                      <div className="flex items-center justify-center border border-white-light bg-[#eee] px-3 font-semibold ltr:rounded-l-md ltr:border-r-0 rtl:rounded-r-md rtl:border-l-0 dark:border-[#17263c] dark:bg-[#1b2e4b]">
                        @
                      </div>
                      <Field
                        id="email"
                        name="email"
                        className="form-input ltr:rounded-l-none rtl:rounded-r-none"
                        disabled={formValues && formValues.email}
                      />
                    </div>
                    <ErrorMessage
                      name="email"
                      component="div"
                      className="mt-1 text-danger"
                    />
                  </div>

                  <div
                    className={
                      touched.message && errors.message
                        ? "has-error"
                        : touched.message
                          ? "has-success"
                          : ""
                    }
                  >
                    <label htmlFor="message">Your Request</label>
                    <Field
                      as="textarea"
                      id="message"
                      name="message"
                      placeholder="Briefly describe what you need help with..."
                      className="form-input"
                    />
                    <ErrorMessage
                      name="message"
                      component="div"
                      className="mt-1 text-danger"
                    />
                  </div>

                  <button type="submit" className="btn btn-primary !mt-6">
                    Send
                  </button>
                </Form>
              )}
            </Formik>
          </div>
        </div>
      </div>
    </>
  );
};

export default withAuth(MyForm, ALL_ROLES);
