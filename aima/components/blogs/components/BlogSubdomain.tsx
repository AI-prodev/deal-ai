import { Formik, Form, Field, ErrorMessage, FormikHelpers } from "formik";

interface BlogTitleInputProps {
  domain: string;
  touched?: boolean;
  error?: string;
}

export const BlogSubdomain = ({
  domain,
  touched,
  error,
}: BlogTitleInputProps) => {
  return (
    <div className={touched && error ? "has-error" : ""}>
      <label htmlFor="subdomain" className="text-white">
        Subdomain
      </label>
      <div className="flex items-center gap-2 form-input">
        <Field
          name="subdomain"
          type="text"
          id="subdomain"
          className="form-input border-0 p-0"
        />
        <span>.{domain}</span>
      </div>
      <ErrorMessage
        name="subdomain"
        component="div"
        className="mt-1 text-danger"
      />
    </div>
  );
};
