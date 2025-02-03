import { Formik, Form, Field, ErrorMessage, FormikHelpers } from "formik";

interface BlogTitleInputProps {
  touched?: boolean;
  error?: string;
}

// TODO: make this component as reusable common component!
export const TitleInput = ({ touched, error }: BlogTitleInputProps) => {
  return (
    <div className={touched && error ? "has-error" : ""}>
      <label htmlFor="title" className="text-white">
        Title
      </label>
      <Field name="title" type="text" id="title" className="form-input" />
      <ErrorMessage name="title" component="div" className="mt-1 text-danger" />
    </div>
  );
};
