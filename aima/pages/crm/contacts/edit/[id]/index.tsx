import React, { useEffect, useState } from "react";
import CreateContactForm from "@/components/crm/contacts/createContactForm/CreateContactForm";
import AddListToContactModal from "@/components/crm/contacts/addListToContactModal/AddListToContactModal";
import { Formik, Form, Field } from "formik";
import * as Yup from "yup";
import {
  useUpdateContactMutation,
  useGetOneContactQuery,
  useDeleteUserContactMutation,
} from "@/store/features/contactApi";
import LoadingAnimation from "@/components/LoadingAnimation";
import { useRouter } from "next/router";
import { useParams } from "next/navigation";
import { useListListsQuery } from "@/store/features/listApi";
import { ILists } from "@/interfaces/Ilists";
import Dropdown from "@/components/Dropdown";
import {
  CONTACT_INITIAL_VALUES,
  SUBSCRIBER_COPY,
} from "@/components/crm/constants";
import { Switch } from "@headlessui/react";
import clsx from "clsx";
import { showErrorToast, showSuccessToast } from "@/utils/toast";
import CRMHeader from "@/components/crm/CRMHeader";
import LoadingSpinner from "@/components/LoadingSpinner";
import { IContactFormValues } from "@/interfaces/IContact";

const UpdateContact = () => {
  const [isEditMode, setIsEditMode] = useState(false);
  const [defaultValues, setDefaultValues] = useState(CONTACT_INITIAL_VALUES);
  const [updateContact, { isLoading: isUpdateContactLoading }] =
    useUpdateContactMutation();
  const [deleteContact, { isLoading: isDeleteContactLoading }] =
    useDeleteUserContactMutation();
  const [openModal, setOpenModal] = useState<boolean>(false);
  const { push, query } = useRouter();
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
  });
  const params = useParams();
  const contactId = params?.id as string;
  const { data, isFetching, refetch } = useGetOneContactQuery(
    { contactId },
    { skip: !contactId }
  );
  const { data: lists, isLoading: listLoading } = useListListsQuery({
    page: 1,
    limit: 50,
  });
  const options = lists?.results?.map((item: ILists) => ({
    value: item._id,
    label: item.title,
  }));
  const createdOn = data?.createdAt
    ? new Intl.DateTimeFormat("en-US", {
        year: "numeric",
        month: "long",
        day: "numeric",
      }).format(new Date(data?.createdAt))
    : "N/A";
  const [isSubscribed, setIsSubscribed] = useState(data?.unsubscribed ?? false);
  const unsubscribedOrResubscribed = isSubscribed
    ? SUBSCRIBER_COPY.unsubscribedOrResubscribed.unsubscribed
    : SUBSCRIBER_COPY.unsubscribedOrResubscribed.subscribed;
  const isLoading =
    isFetching || listLoading || isDeleteContactLoading || !contactId;
  const isDisabledUpdateContactButton = isUpdateContactLoading || !isEditMode;

  const handleChangeSubscribe = async (value: boolean): Promise<void> => {
    await updateContact({ id: contactId, data: { unsubscribed: value } })
      .then((res: any) => {
        if (res.error) {
          showErrorToast(
            res.error?.data?.error || value
              ? "Failed to unsubscribe"
              : "Failed to subscribe"
          );
          return;
        }

        setIsSubscribed(value);
        showSuccessToast({
          title: value
            ? "Unsubscribed successfully"
            : "Subscribed successfully",
        });
      })
      .catch(() => {
        showErrorToast(value ? "Failed to unsubscribe" : "Failed to subscribe");
      });
  };

  useEffect(() => {
    if (data) {
      setDefaultValues({
        firstName: data?.firstName || "",
        lastName: data?.lastName || "",
        email: data?.email || "",
        phoneNumber: data?.phoneNumber || "",
        addressFullName: data?.address?.addressFullName || "",
        addressStreet: data?.address?.addressStreet || "",
        addressApartment: data?.address?.addressApartment || "",
        addressCity: data?.address?.addressCity || "",
        addressState: data?.address?.addressState || "",
        addressCountry: data?.address?.addressCountry || "",
        addressZipCode: data?.address?.addressZipCode || "",
        shippingAddressFullName:
          data?.shippingAddress?.shippingAddressFullName || "",
        shippingAddressStreet:
          data?.shippingAddress?.shippingAddressStreet || "",
        shippingAddressApartment:
          data?.shippingAddress?.shippingAddressApartment || "",
        shippingAddressCity: data?.shippingAddress?.shippingAddressCity || "",
        shippingAddressState: data?.shippingAddress?.shippingAddressState || "",
        shippingAddressCountry:
          data?.shippingAddress?.shippingAddressState || "",
        shippingAddressZipCode:
          data?.shippingAddress?.shippingAddressZipCode || "",
        ip: data?.ip || "",
      });
      setIsSubscribed(data?.unsubscribed ?? false);
    }
  }, [data]);

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
      await updateContact({ id: params.id as string, data: body });
      await refetch();
    } catch (e) {
      console.error(e);
    }
  };

  const handleOpenModal = () => setOpenModal(true);

  const handleDeleteContact = async (contactId: string) => {
    try {
      if (confirm("Are you sure?")) {
        await deleteContact(contactId);
        await push("/crm/contacts");
      }
    } catch (error) {
      console.error(`error: ${error}`);
    }
  };

  const navigateToListsPage = () =>
    push(`/crm/contacts/edit/${query?.id}/lists`);
  const navigateToPurchasesPage = () =>
    push(`/crm/contacts/edit/${query?.id}/purchases`);
  const toggleIsEditMode = () => setIsEditMode(prev => !prev);

  return (
    <div className="flex flex-col gap-5 max-w-[780px]">
      <CRMHeader />
      <AddListToContactModal
        options={options}
        contactId={params?.id as string}
        isOpen={openModal}
        setOpenModal={setOpenModal}
        refetch={refetch}
      />
      {isLoading ? (
        <div className="w-full text-center mt-4 h-full">
          <LoadingAnimation />
        </div>
      ) : (
        <>
          <div>
            <p className="text-2xl font-bold text-primary">
              {data?.firstName} {data?.lastName}
            </p>
            <div className="flex items-start flex-col sm:flex-row sm:items-center">
              <p className="text-base">
                Created on: <span className="text-primary">{createdOn}</span>
              </p>
              <div className="flex items-center">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth="1.5"
                  stroke="currentColor"
                  className="w-4 h-4 ml-0 sm:ml-3 mr-1"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M21.75 6.75v10.5a2.25 2.25 0 0 1-2.25 2.25h-15a2.25 2.25 0 0 1-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0 0 19.5 4.5h-15a2.25 2.25 0 0 0-2.25 2.25m19.5 0v.243a2.25 2.25 0 0 1-1.07 1.916l-7.5 4.615a2.25 2.25 0 0 1-2.36 0L3.32 8.91a2.25 2.25 0 0 1-1.07-1.916V6.75"
                  />
                </svg>
                <p className="text-base">{data?.email}</p>
              </div>
            </div>
            <div className="inline-flex items-center mt-1">
              <Switch
                id="subscribe"
                name="subscribe"
                checked={isSubscribed}
                onChange={handleChangeSubscribe}
                className={clsx(
                  "relative inline-flex h-6 w-11 items-center rounded-full",
                  {
                    "bg-primary": !isSubscribed,
                    "bg-gray-500": isSubscribed,
                  }
                )}
              >
                <span
                  className={clsx(
                    "inline-block h-4 w-4 transform rounded-full bg-white transition",
                    {
                      "translate-x-6": !isSubscribed,
                      "translate-x-1": isSubscribed,
                    }
                  )}
                />
              </Switch>
              <label htmlFor="subscribe" className="ml-2 mb-0">
                {unsubscribedOrResubscribed}
              </label>
            </div>
          </div>
          <hr className="border border-[#ebedf2] font-semibold dark:border-[#191e3a]" />
          <div className="flex items-center gap-10">
            <div>
              <p className="text-xl">Purchases</p>
              <p
                className="w-fit text-primary text-2xl font-bold mt-2 mx-auto cursor-pointer"
                onClick={navigateToPurchasesPage}
              >
                {data?.numOfPurchases}
              </p>
            </div>
            <div>
              <p className="text-xl">Lists</p>
              <p
                className="w-fit text-primary text-2xl font-bold mt-2 mx-auto cursor-pointer"
                onClick={navigateToListsPage}
              >
                {data?.numOfLists}
              </p>
            </div>
          </div>
          <hr className="border border-[#ebedf2] font-semibold dark:border-[#191e3a]" />
          <div className="w-full flex justify-end mt-5">
            <div className="dropdown">
              <Dropdown
                offset={[0, 5]}
                placement="bottom-start"
                button={
                  <button
                    type="button"
                    className="rounded bg-primary px-4 py-2 text-white"
                  >
                    Manage Contact
                  </button>
                }
              >
                <ul>
                  <li>
                    <button type="button" onClick={handleOpenModal}>
                      Add to list
                    </button>
                  </li>
                  <li>
                    <button type="button" onClick={toggleIsEditMode}>
                      Edit
                    </button>
                  </li>
                  <li>
                    <button
                      type="button"
                      onClick={() => handleDeleteContact(query.id as string)}
                    >
                      Delete
                    </button>
                  </li>
                </ul>
              </Dropdown>
            </div>
          </div>
          <Formik
            key={JSON.stringify(defaultValues)}
            initialValues={defaultValues}
            validationSchema={ContactFormValidation}
            onSubmit={values => {
              submit(values);
            }}
          >
            {({ errors, touched }) => (
              <Form>
                <div className="w-full flex flex-col sm:flex-row gap-4 sm:gap-2">
                  <div className="w-full flex-columnn">
                    <label htmlFor="firstName">FIRST NAME</label>
                    <Field
                      id="firstName"
                      type="text"
                      name="firstName"
                      className="form-input disabled:opacity-70"
                      placeholder="Enter First Name"
                      disabled={!isEditMode}
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
                      className="form-input disabled:opacity-70"
                      placeholder="Enter Last Name"
                      disabled={!isEditMode}
                    />
                    {touched.lastName && errors.lastName && (
                      <div className="mt-1 text-danger">{errors.lastName}</div>
                    )}
                  </div>
                  <div className="w-full flex-columnn">
                    <label htmlFor="ip">IP</label>
                    <Field
                      id="ip"
                      type="text"
                      name="ip"
                      className="form-input disabled:opacity-70"
                      disabled
                    />
                  </div>
                </div>
                <div className="w-full flex flex-col sm:flex-row gap-4 sm:gap-2 mt-5">
                  <div className="w-full flex-columnn">
                    <label htmlFor="email">EMAIL ADDRESS</label>
                    <Field
                      id="email"
                      type="text"
                      name="email"
                      className="form-input disabled:opacity-70"
                      placeholder="Enter Email"
                      disabled={!isEditMode}
                    />
                    {touched.email && errors.email && (
                      <div className="mt-1 text-danger">{errors.email}</div>
                    )}
                  </div>
                  <div className="w-full flex-columnn">
                    <label htmlFor="phoneNumber">PHONE NUMBER</label>
                    <div className="flex">
                      <div
                        className={clsx(
                          "flex items-center justify-center border border-white-light bg-[#eee] px-3 font-semibold ltr:rounded-l-md ltr:border-r-0 rtl:rounded-r-md rtl:border-l-0 dark:border-[#17263c] dark:bg-[#1b2e4b]",
                          {
                            "opacity-70": !isEditMode,
                          }
                        )}
                      >
                        ☎
                      </div>
                      <Field
                        name="phoneNumber"
                        type="text"
                        id="phoneNumber"
                        className="form-input ltr:rounded-l-none rtl:rounded-r-none disabled:opacity-70"
                        placeholder="Enter Phone Number"
                        disabled={!isEditMode}
                      />
                    </div>
                    {touched.phoneNumber && errors.phoneNumber && (
                      <div className="mt-1 text-danger">
                        {errors.phoneNumber}
                      </div>
                    )}
                  </div>
                </div>
                <CreateContactForm
                  type="address"
                  title="ADDRESS"
                  isDisabled={!isEditMode}
                />
                <CreateContactForm
                  type="shippingAddress"
                  title="SHIPPING ADDRESS"
                  isDisabled={!isEditMode}
                />
                <div className="w-full flex justify-end mt-5">
                  <button
                    className="w-40 rounded bg-primary px-4 py-2 text-white disabled:opacity-70"
                    disabled={isDisabledUpdateContactButton}
                  >
                    {isUpdateContactLoading ? (
                      <LoadingSpinner />
                    ) : (
                      "Update Contact"
                    )}
                  </button>
                </div>
              </Form>
            )}
          </Formik>
        </>
      )}
    </div>
  );
};

export default UpdateContact;
