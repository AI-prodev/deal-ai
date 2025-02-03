import React from "react";
import CreateContactForm from "@/components/crm/contacts/createContactForm/CreateContactForm";
import { Formik, Form, Field } from "formik";
import * as Yup from "yup";
import { useCreateContactMutation } from "@/store/features/contactApi";
import LoadingSpinner from "@/components/LoadingSpinner";
import { useRouter } from "next/router";
import CRMHeader from "@/components/crm/CRMHeader";
import { CONTACT_INITIAL_VALUES } from "@/components/crm/constants";
import type { IContactFormValues } from "@/interfaces/IContact";

const AddContact = () => {
  const [createContact, { isLoading }] = useCreateContactMutation();
  const { push } = useRouter();
  const ContactFormValidation = Yup.object().shape({
    firstName: Yup.string().required("Please enter your first name"),
    lastName: Yup.string().required("Please enter your last name"),
    email: Yup.string()
      .email("Invalid email")
      .required("Please enter your email"),
    phoneNumber: Yup.string()
      .optional()
      .matches(
        /\(?\d{3}\)?-? *\d{3}-? *-?\d{4}/,
        "Must be a valid phone number"
      ),
    confirm: Yup.boolean().required("This field is required"),
  });

  const submit = async (values: IContactFormValues) => {
    try {
      const body = {
        firstName: values.firstName,
        lastName: values.lastName,
        email: values.email,
        phoneNumber: values.phoneNumber,
        address: {
          addressFullName: values.addressFullName,
          addressStreet: values.addressStreet,
          addressApartment: values.addressApartment,
          addressCity: values.addressCity,
          addressState: values.addressState,
          addressCountry: values.addressCountry,
          addressZipCode: values.addressZipCode,
        },
        shippingAddress: {
          shippingAddressFullName: values.shippingAddressFullName,
          shippingAddressStreet: values.shippingAddressStreet,
          shippingAddressApartment: values.shippingAddressApartment,
          shippingAddressCity: values.shippingAddressCity,
          shippingAddressState: values.shippingAddressState,
          shippingAddressCountry: values.shippingAddressCountry,
          shippingAddressZipCode: values.shippingAddressZipCode,
        },
      };
      await createContact(body);
      push("/crm/contacts");
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <div className="flex flex-col gap-5 max-w-[780px]">
      <CRMHeader />
      <Formik
        initialValues={CONTACT_INITIAL_VALUES}
        validationSchema={ContactFormValidation}
        onSubmit={values => {
          submit(values);
        }}
      >
        {({ errors, touched, values }) => (
          <Form>
            <div className="w-full flex flex-col sm:flex-row gap-4 sm:gap-2">
              <div className="w-full flex-columnn">
                <label htmlFor="firstName">FIRST NAME</label>
                <Field
                  id="firstName"
                  type="text"
                  name="firstName"
                  className="form-input"
                  placeholder="Enter First Name"
                />
                {touched.firstName && errors.firstName && (
                  <div className="mt-1 text-danger">{errors.firstName}</div>
                )}
              </div>
              <div className="w-full flex-columnn">
                <label htmlFor="lastName">LAST NAME</label>
                <Field
                  id="lasttName"
                  type="text"
                  name="lastName"
                  className="form-input"
                  placeholder="Enter Last Name"
                />
                {touched.lastName && errors.lastName && (
                  <div className="mt-1 text-danger">{errors.lastName}</div>
                )}
              </div>
            </div>
            <div className="w-full flex flex-col sm:flex-row gap-4 sm:gap-2 mt-5">
              <div className="w-full flex-columnn">
                <label htmlFor="email">EMAIL ADDRESS</label>
                <Field
                  id="email"
                  type="text"
                  name="email"
                  className="form-input"
                  placeholder="Enter Email"
                />
                {touched.email && errors.email && (
                  <div className="mt-1 text-danger">{errors.email}</div>
                )}
              </div>
              <div className="w-full flex-columnn">
                <label htmlFor="phoneNumber">PHONE NUMBER</label>
                <div className="flex">
                  <div className="flex items-center justify-center border border-white-light bg-[#eee] px-3 font-semibold ltr:rounded-l-md ltr:border-r-0 rtl:rounded-r-md rtl:border-l-0 dark:border-[#17263c] dark:bg-[#1b2e4b]">
                    ☎
                  </div>
                  <Field
                    name="phoneNumber"
                    type="text"
                    id="phoneNumber"
                    className="form-input ltr:rounded-l-none rtl:rounded-r-none"
                    placeholder="Enter Phone Number"
                  />
                </div>
                {touched.phoneNumber && errors.phoneNumber && (
                  <div className="mt-1 text-danger">{errors.phoneNumber}</div>
                )}
              </div>
            </div>
            <CreateContactForm type={"address"} title={"ADDRESS"} />
            <CreateContactForm
              type={"shippingAddress"}
              title={"SHIPPING ADDRESS"}
            />
            <div className="flex items-start mt-4">
              <Field
                name="confirm"
                id="confirm"
                type="checkbox"
                className="form-checkbox"
              />
              <label htmlFor="confirm" className="text-sm">
                I confirm that this contact is over 18 and has given permission
                to receive marketing communications from me.
              </label>
              {touched.confirm && errors.confirm && (
                <div className="mt-1 text-danger">{errors.confirm}</div>
              )}
            </div>
            <div className="w-full flex justify-end mt-5">
              <button
                className="w-40 rounded bg-primary px-4 py-2 text-white disabled:opacity-70"
                disabled={!values?.confirm}
              >
                {isLoading ? <LoadingSpinner /> : "Add Contact"}
              </button>
            </div>
          </Form>
        )}
      </Formik>
    </div>
  );
};

export default AddContact;
