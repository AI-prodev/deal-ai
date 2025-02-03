import React from "react";
import { Field } from "formik";

interface CreateContactFormPropsTypes {
  title: string;
  type: string;
  isDisabled?: boolean;
}

const CreateContactForm = ({
  title,
  type,
  isDisabled = false,
}: CreateContactFormPropsTypes) => {
  return (
    <div className="mt-5">
      <h2 className="text-xl sm:text-2xl font-bold mb-5">{title}</h2>
      <div className="flex flex-col gap-4">
        <div>
          <label htmlFor="fullName">FULL NAME</label>
          <Field
            id="fullName"
            type="text"
            name={`${type}FullName`}
            className="form-input disabled:opacity-70"
            placeholder="Enter Full Name"
            disabled={isDisabled}
          />
        </div>
        <div className="w-full flex flex-col sm:flex-row gap-4 sm:gap-2">
          <div className="w-full flex-columnn">
            <label htmlFor="street">STREET</label>
            <Field
              id="street"
              type="text"
              name={`${type}Street`}
              className="form-input disabled:opacity-70"
              placeholder="Enter Street"
              disabled={isDisabled}
            />
          </div>
          <div className="w-full flex-columnn">
            <label htmlFor="apartment">APARTMENT/SUITE</label>
            <Field
              id="apartment"
              type="text"
              name={`${type}Apartment`}
              className="form-input disabled:opacity-70"
              placeholder="Enter Apartment"
              disabled={isDisabled}
            />
          </div>
        </div>
        <div className="w-full flex flex-col sm:flex-row gap-4 sm:gap-2">
          <div className="w-full flex-columnn">
            <label htmlFor="city">CITY</label>
            <Field
              id="city"
              type="text"
              name={`${type}City`}
              className="form-input disabled:opacity-70"
              placeholder="Enter City"
              disabled={isDisabled}
            />
          </div>
          <div className="w-full flex-columnn">
            <label htmlFor="state">STATE</label>
            <Field
              id="state"
              type="text"
              name={`${type}State`}
              className="form-input disabled:opacity-70"
              placeholder="Enter State"
              disabled={isDisabled}
            />
          </div>
          <div className="w-full flex-columnn">
            <label htmlFor="country">COUNTRY</label>
            <Field
              id="country"
              type="text"
              name={`${type}Country`}
              className="form-input disabled:opacity-70"
              placeholder="Enter Country"
              disabled={isDisabled}
            />
          </div>
          <div className="w-full flex-columnn">
            <label htmlFor="zipPinCode">ZIP/PIN CODE</label>
            <Field
              id="zipPinCode"
              type="text"
              name={`${type}ZipCode`}
              className="form-input disabled:opacity-70"
              placeholder="Enter Code"
              disabled={isDisabled}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default CreateContactForm;
