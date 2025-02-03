"use client";

import { Field, Form, Formik } from "formik";
import { useGetIntegrationsQuery } from "@/store/features/integrationsApi";
import {
  SEND_EMAIL_INITIAL_VALUES,
  SendEmailMode,
  SendEmailStatus,
  SendEmailTabsType,
} from "@/components/crm/constants";
import SendEmailListsSelect from "@/components/crm/broadcast/SendEmailListsSelect";
import React, { FC } from "react";
import * as Yup from "yup";
import {
  IOption,
  ISendEmailFormValues,
  SendEmailBody,
} from "@/interfaces/IBroadcast";
import dynamic from "next/dynamic";
import { useRouter } from "next/router";
import {
  useGetEmailQuery,
  useSendEmailMutation,
} from "@/store/features/broadcastApi";
import { showErrorToast, showSuccessToast } from "@/utils/toast";
import type { ILists } from "@/interfaces/Ilists";
import LoadingSpinner from "@/components/LoadingSpinner";
import clsx from "clsx";
import SendEmailSendersSelect from "@/components/crm/broadcast/SendEmailSendersSelect";
import { useGetBusinessDetailsQuery } from "@/store/features/profileApi";

const Select = dynamic(() => import("react-select").then(mod => mod.default), {
  ssr: false,
  loading: () => null,
});
const TextEditor = dynamic(() => import("@/components/TextEditor"), {
  ssr: false,
});

interface ISendEmailCreateProps {
  mode: SendEmailMode;
  handleChangeTab: (tab: SendEmailTabsType) => void;
  setSendEmailData: (arg: ISendEmailFormValues) => void;
}

const SendEmailCreate: FC<ISendEmailCreateProps> = ({
  handleChangeTab,
  setSendEmailData,
  mode,
}) => {
  const { query } = useRouter();
  const emailId = query?.id as string;
  const { data: email } = useGetEmailQuery({ emailId }, { skip: !emailId });
  const { data: sendGridAccounts, isFetching: isGetIntegrationsFetching } =
    useGetIntegrationsQuery("sendgrid");
  const { data: businessDetails, isFetching: isGetBusinessDetailsFetching } =
    useGetBusinessDetailsQuery({});

  const sendGridAccountsOptions = sendGridAccounts?.map((account: any) => ({
    label: `${account?.data?.first_name} ${account?.data?.last_name} <${account?.data?.email}>`,
    value: account?._id,
  }));

  const { businessAddress, businessName } = businessDetails || {};
  const { addressStreet, addressZipCode, addressCountry } =
    businessAddress || {};

  const hasBusinessAddress =
    businessName && addressStreet && addressZipCode && addressCountry;
  const hasSendGridAccounts = sendGridAccounts?.length;

  const hasSendGridError = !hasSendGridAccounts && !isGetIntegrationsFetching;
  const hasBusinessAddressError =
    !hasBusinessAddress && !isGetBusinessDetailsFetching;
  const hasError = hasSendGridError || hasBusinessAddressError;

  const { push } = useRouter();
  const [saveDraft, { isLoading: isSaveDraftLoading }] = useSendEmailMutation();

  const formValidation = Yup.object().shape({
    lists: Yup.array()
      .min(1, "At least one lists is required")
      .of(
        Yup.object().shape({
          label: Yup.string().required(),
          value: Yup.string().required(),
        })
      ),
    sendgridAccount: Yup.string().required(
      "At least one SendGrid account is required"
    ),
    sender: Yup.string().required("At least one sender is required"),
    subject: Yup.string().required("Please enter your subject"),
    html: Yup.string().required("Message is required"),
    title: Yup.string().required("Please enter your title"),
  });

  const handleClickSaveDraft = async (
    values: ISendEmailFormValues,
    validateForm: any,
    setTouched: any
  ) => {
    await validateForm().then((errors: any) => {
      const possibleErrors = Object.keys(errors);
      if (possibleErrors.length === 0) {
        validateForm().then(async () => {
          setTouched({});
          if (values) {
            const body: SendEmailBody = {
              ...values,
              lists: values?.lists?.map(list => list?.value),
              status: SendEmailStatus.draft,
              scheduledAt: null,
            };

            await saveDraft(body)
              .then((res: any) => {
                if (res.error) {
                  showErrorToast(
                    res.error?.data?.error || "Failed to save draft"
                  );
                  return;
                }

                showSuccessToast({
                  title: "Email draft saved successfully",
                });
                push("/crm/broadcast/drafts");
              })
              .catch(() => {
                showErrorToast("Failed to save draft");
              });
          }
        });

        return;
      }

      setTouched(errors);
    });
  };

  const handleCanProceed = (verified: boolean): boolean =>
    !(hasError || (!hasError && !verified));

  const submit = async (values: ISendEmailFormValues): Promise<void> => {
    setSendEmailData(values);
    handleChangeTab(SendEmailTabsType.SCHEDULE);
  };

  const handleInitialValues = () => {
    return email
      ? {
          lists:
            email?.lists?.length > 0
              ? email?.lists?.map((item: ILists) => ({
                  value: item._id,
                  label: item.title,
                  numContacts: item.subscribedContactsCount,
                }))
              : [{ value: "All Contacts", label: "All Contacts" }],
          sendgridAccount: email?.sendgridAccount
            ? email?.sendgridAccount?._id
            : "",
          sender: email?.from?.email ?? "",
          verified: Boolean(email?.from?.email),
          from: email?.from,
          subject: email?.subject ?? "",
          html: email?.html ?? "",
          title: email?.title ?? "",
          sumListsContacts: email
            ? email?.lists?.reduce(
                (total, item) => total + item?.subscribedContactsCount,
                0
              )
            : 0,
        }
      : SEND_EMAIL_INITIAL_VALUES;
  };

  return (
    <Formik
      key={JSON.stringify(SEND_EMAIL_INITIAL_VALUES)}
      initialValues={handleInitialValues()}
      enableReinitialize={Boolean(email)}
      validationSchema={formValidation}
      onSubmit={values => {
        submit(values);
      }}
    >
      {({
        errors,
        touched,
        values,
        setFieldValue,
        validateForm,
        setTouched,
      }: any) => (
        <Form>
          <div className="flex flex-col gap-4">
            <div className="w-full flex-columnn">
              <Field
                type="text"
                name="title"
                className="form-input"
                placeholder="Enter Title"
              />
              {touched.title && errors.title && (
                <div className="mt-1 text-danger">{errors.title}</div>
              )}
            </div>
            <SendEmailListsSelect
              value={values.lists}
              setFieldValue={setFieldValue}
              error={touched.lists && errors.lists ? errors.lists : null}
            />
            <div className="custom-select custom-select-fields-bg">
              <Select
                name="sendgridAccount"
                value={sendGridAccountsOptions?.find(
                  (option: IOption) => option.value === values.sendgridAccount
                )}
                onChange={(option: any) =>
                  setFieldValue("sendgridAccount", option ? option.value : "")
                }
                options={sendGridAccountsOptions}
                isSearchable={false}
                isClearable
                maxMenuHeight={250}
                placeholder="Select SendGrid Account"
                menuPlacement="bottom"
                styles={{
                  menuPortal: base => ({
                    ...base,
                    zIndex: 9999,
                  }),
                  menu: provided => ({
                    ...provided,
                    backgroundColor: "#121e32",
                    color: "#808080",
                  }),
                }}
              />
              {touched.sendgridAccount && errors.sendgridAccount && (
                <div className="mt-1 text-danger">{errors.sendgridAccount}</div>
              )}
            </div>
            <SendEmailSendersSelect
              value={values.sender}
              sendGridAccountId={values.sendgridAccount}
              setFieldValue={setFieldValue}
              error={touched.sender && errors.sender ? errors.sender : null}
            />

            <div className="w-full flex-columnn">
              <Field
                type="text"
                name="subject"
                className="form-input"
                placeholder="Email Subject"
              />
              {touched.subject && errors.subject && (
                <div className="mt-1 text-danger">{errors.subject}</div>
              )}
            </div>
            <TextEditor name="html" />
            <div
              className={clsx("flex", {
                "justify-between": mode === SendEmailMode.CREATE,
                "justify-end": mode === SendEmailMode.EDIT,
              })}
            >
              {mode === SendEmailMode.CREATE && (
                <button
                  className="rounded bg-primary px-4 py-2 text-white disabled:bg-opacity-70 min-w-36"
                  type="button"
                  onClick={() => {
                    handleClickSaveDraft(values, validateForm, setTouched);
                  }}
                  disabled={isSaveDraftLoading}
                >
                  {isSaveDraftLoading ? <LoadingSpinner /> : "Save Draft"}
                </button>
              )}
              <button
                className="rounded bg-primary px-10 py-2 text-white disabled:opacity-70"
                type="submit"
                disabled={!handleCanProceed(values?.verified)}
              >
                Next
              </button>
            </div>
          </div>
        </Form>
      )}
    </Formik>
  );
};
export default SendEmailCreate;
