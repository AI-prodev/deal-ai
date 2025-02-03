import React, { useRef, useState, useEffect } from "react";
import { Formik, Field, Form, ErrorMessage, FormikHelpers } from "formik";
import * as Yup from "yup";
import withAuth from "@/helpers/withAuth";
import LoadingAnimation from "@/components/LoadingAnimation";
import Link from "next/link";
import { showErrorToastTimer, showSuccessToast } from "@/utils/toast";
import { createProfileAPI } from "@/store/features/profileApi";
import { ALL_ROLES } from "@/utils/roles";
import { FEEDBACK_TYPES } from "@/utils/data/others";

interface FormValues {
  firstName: string;
  lastName: string;
  email: string;
  feedbackType: string;
  feedback: string;
  whyGood: string;
  businessOrProduct: string;
}

const initialValues: FormValues = {
  firstName: "",
  lastName: "",
  email: "",
  feedbackType: FEEDBACK_TYPES[0],
  feedback: "",
  whyGood: "",
  businessOrProduct: "",
};

const FormSchema = Yup.object().shape({
  firstName: Yup.string().required("First Name is required"),
  lastName: Yup.string().required("Last Name is required"),
  email: Yup.string().email("Invalid email").required("Email is required"),

  feedbackType: Yup.string().required("Feedback Type is required"),
  feedback: Yup.string().required("Feedback is required"),
  whyGood: Yup.string().optional(),
  businessOrProduct: Yup.string().optional(),
});

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
      const webhookUrl =
        "https://hooks.zapier.com/hooks/catch/14242389/3kybaqu/?" + queryString;

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
  const appName = "Feedback";
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
        <img
          className="w-full max-w-3xl rounded-md object-cover"
          src="/assets/images/feedback_banner.jpeg"
          alt="Hook, line, and winner. Submit your best marketing copy and get a chance to win $200 every week."
        />
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          <div className="panel">
            <Formik
              initialValues={formValues}
              validationSchema={FormSchema}
              onSubmit={onSubmit}
              innerRef={formikRef}
              enableReinitialize
            >
              {({ errors, touched, submitCount, isSubmitting }) => (
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

                  <div className="form-group">
                    <label htmlFor="feedbackType">
                      What type of great example have you seen?
                    </label>
                    <Field
                      as="select"
                      name="feedbackType"
                      className="form-control form-select"
                    >
                      {FEEDBACK_TYPES.map(type => (
                        <option key={type} value={type}>
                          {type}
                        </option>
                      ))}
                    </Field>
                    <ErrorMessage
                      name="feedbackType"
                      component="div"
                      className="has-error"
                    />
                  </div>

                  <div className="form-group">
                    <label htmlFor="feedback">
                      What's the great example of marketing copy?
                    </label>
                    <Field
                      as="textarea"
                      id="feedback"
                      name="feedback"
                      className="form-input"
                      rows={5}
                    />
                    <ErrorMessage
                      name="feedback"
                      component="div"
                      className="has-error text-danger"
                    />
                  </div>

                  <div className="form-group">
                    <label htmlFor="businessOrProduct">
                      What business or product is it for?
                    </label>
                    <Field
                      as="textarea"
                      id="businessOrProduct"
                      name="businessOrProduct"
                      className="form-input"
                      rows={1}
                    />
                    <ErrorMessage
                      name="businessOrProduct"
                      component="div"
                      className="has-error text-danger"
                    />
                  </div>

                  <div className="form-group">
                    <label htmlFor="whyGood">Why is it so good?</label>
                    <Field
                      as="textarea"
                      id="whyGood"
                      name="whyGood"
                      className="form-input"
                      rows={1}
                    />
                    <ErrorMessage
                      name="whyGood"
                      component="div"
                      className="has-error text-danger"
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="btn btn-primary !mt-6"
                  >
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
