import React from "react";
import { Formik, Form, Field, ErrorMessage } from "formik";
import * as Yup from "yup";
import { useRouter } from "next/router";

interface FormValues {
  thesis: string;
  relevance?: string;
  trends?: string;
}

const initialValues: FormValues = {
  thesis: "",
  relevance: "",
  trends: "",
};

const validationSchema = Yup.object({
  thesis: Yup.string().required("Thesis is required"),
  relevance: Yup.string(),
  trends: Yup.string(),
});

interface ApolloFormProps {
  land?: boolean;
}

const ApolloForm = ({ land }: ApolloFormProps) => {
  const router = useRouter();
  const onSubmit = (values: FormValues) => {
    const queryData = {
      thesis: values.thesis,
      me: values.relevance,
      trends: values.trends,
    };

    const thesisJson = JSON.stringify(queryData);
    const path = land ? "/apps/apollo-land" : "/apps/apollo";
    router.replace({
      pathname: path,
      query: {
        thesis: thesisJson,
      },
    });
  };

  return (
    <Formik
      initialValues={initialValues}
      validationSchema={validationSchema}
      onSubmit={onSubmit}
    >
      {({ submitCount, errors }) => (
        <Form>
          <div
            className={
              submitCount && errors.thesis ? "has-error" : "has-success"
            }
          >
            <label htmlFor="thesis">Thesis</label>
            <div className="flex">
              <Field
                name="thesis"
                type="textarea"
                id="thesis"
                className="form-input"
                as="textarea"
              />
            </div>
            {submitCount ? (
              errors.thesis ? (
                <div className="mt-1 text-danger">{errors.thesis}</div>
              ) : (
                <div className="mt-1 text-success">Looks Good!</div>
              )
            ) : (
              ""
            )}
          </div>

          <div className="mt-5">
            <label htmlFor="relevance">My Situation (Optional)</label>
            <div className="flex">
              <Field
                name="relevance"
                type="textarea"
                id="relevance"
                className="form-input"
                as="textarea"
              />
            </div>
          </div>

          <div className="mt-5">
            <label htmlFor="trends">Relevant Trends (Optional)</label>
            <div className="flex">
              <Field
                name="trends"
                type="textarea"
                id="trends"
                className="form-input"
                as="textarea"
              />
            </div>
          </div>

          <button type="submit" className="btn btn-primary mt-6">
            Find {land ? "Commercial Property" : "Businesses"}
          </button>
        </Form>
      )}
    </Formik>
  );
};

export default ApolloForm;
