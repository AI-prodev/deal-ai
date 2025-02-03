// MarketingForms.tsx
import { Field, Form, Formik, FormikProps } from "formik";
import React, { useRef, useState } from "react";
import * as Yup from "yup";
import { showSuccessToast } from "@/utils/toast";
import { createFunnelApi } from "@/store/features/projectApi";
import { IFunnel } from "@/interfaces/IFunnel";
import Modal from "../Modal";
import { useDisclosure } from "@mantine/hooks";
import clsx from "clsx";

interface FormValues {
  favicon?: File | null;
}

const initialFormValues: FormValues = {
  favicon: null,
};

const getName = (url?: string) => {
  if (!url) return undefined;
  return url?.split(`/`).pop();
};

const FunnelFavicon = ({
  funnel,
  isLightMode = false,
}: {
  funnel: IFunnel;
  isLightMode?: boolean;
}) => {
  const { refetch: refetchFunnels } = createFunnelApi.useGetFunnelQuery(
    {
      funnelId: funnel._id,
    },
    { skip: !funnel }
  );
  const [isLoading, setIsLoading] = useState(false);
  const [isDeleteModalOpen, deleteModalHandler] = useDisclosure(false);

  const FormValidation = Yup.object().shape({
    favicon: Yup.mixed().required("Favicon is Required"),
  });
  // let formikRef: { current: FormikProps<FormValues> | null } = {
  //   current: null,
  // };

  const formikRef = useRef<FormikProps<FormValues>>(null);

  const [updateFunnelFavicon] =
    createFunnelApi.useUpdateFunnelFaviconMutation();
  const [deleteFunnelFavicon] =
    createFunnelApi.useDeleteFunnelFaviconMutation();

  const submitForm = async (values: FormValues) => {
    setIsLoading(true);

    try {
      const formData = new FormData();
      // formikRef?.current?.setFieldValue("favicon", null)
      values?.favicon && formData.append("file", values.favicon);
      const data = await updateFunnelFavicon({
        funnelId: funnel._id,
        formData,
      }).unwrap();

      if (data) {
        formikRef?.current?.resetForm();
        refetchFunnels();
        showSuccessToast({ title: "Favicon Updated" });
      }
    } catch (error) {
      console.error("Failed to save Favicon", error);
    } finally {
      setIsLoading(false);
    }
  };

  const deleteFavicon = async () => {
    setIsLoading(true);
    try {
      const data = await deleteFunnelFavicon({
        funnelId: funnel._id,
      }).unwrap();

      if (data) {
        formikRef?.current?.resetForm();
        refetchFunnels();
        deleteModalHandler.close();
        showSuccessToast({ title: "Favicon Deleted" });
      }
    } catch (error) {
      console.error("Failed to delete Favicon", error);
    } finally {
      setIsLoading(false);
    }
  };

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

  return (
    <>
      <div className="mt-4 w-full max-w-lg">
        <Formik
          initialValues={initialFormValues}
          // innerRef={(formikInstance) => {
          //   if (formikInstance?.errors && formikInstance.isSubmitting) {
          //     scrollToFirstError(formikInstance.errors);
          //   }
          //   formikRef.current = formikInstance;
          // }}

          innerRef={formikRef}
          validationSchema={FormValidation}
          onSubmit={submitForm}
        >
          {({ values, setFieldValue }) => (
            <Form
              className={clsx("", {
                "text-black": isLightMode,
                "text-white": !isLightMode,
              })}
            >
              {!!(values?.favicon || funnel?.faviconUrl) && (
                <div className="mb-4">
                  <img
                    src={
                      values?.favicon
                        ? URL.createObjectURL(values.favicon)
                        : funnel.faviconUrl
                    }
                    alt="favicon"
                    width={32}
                  />
                </div>
              )}

              <div className="flex w-full items-center gap-2">
                <Field
                  value={
                    values?.favicon?.name || getName(funnel?.faviconUrl) || ""
                  }
                  type="text"
                  className={clsx("form-input whitespace-pre-wrap", {
                    "!bg-white !text-[#333333]": isLightMode,
                  })}
                  placeholder="*.png, *.jpg"
                  disabled
                />

                <input
                  name="favicon"
                  id="favicon"
                  type="file"
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                    setFieldValue("favicon", e.target.files?.[0])
                  }
                  value={""}
                  multiple={false}
                  className="hidden"
                  accept="image/*"
                />

                {!values.favicon ? (
                  <label
                    htmlFor="favicon"
                    className="m-0 flex items-center justify-center rounded-full bg-blue-500 p-2 text-white hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                    aria-label="Add Favicon"
                  >
                    <svg
                      className="h-4 w-4"
                      fill="none"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path d="M12 4v16m8-8H4"></path>
                    </svg>
                  </label>
                ) : (
                  <button
                    type="button"
                    onClick={() => setFieldValue("favicon", null)}
                    className="m-0 flex items-center justify-center rounded-full bg-red-500 p-2 text-white hover:bg-red-600 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2"
                    aria-label="Remove Favicon"
                  >
                    <svg
                      className="h-4 w-4"
                      fill="none"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path d="M6 18L18 6M6 6l12 12"></path>
                    </svg>
                  </button>
                )}
              </div>

              <div className="mt-4 flex items-center gap-4">
                <button
                  disabled={isLoading || !values.favicon}
                  type="submit"
                  className="btn btn-primary"
                >
                  Save
                </button>

                <button
                  disabled={isLoading || !funnel.faviconUrl}
                  type="button"
                  className="btn btn-danger"
                  onClick={deleteModalHandler.open}
                >
                  Delete
                </button>
              </div>
            </Form>
          )}
        </Formik>
      </div>

      <Modal
        isOpen={isDeleteModalOpen}
        onRequestClose={deleteModalHandler.close}
      >
        <p className="text-lg font-bold text-white">
          Are you sure you want to remove the favicon?
        </p>

        <div className="mt-6 flex items-center justify-end gap-4">
          <button
            disabled={isLoading}
            className="btn btn-primary"
            onClick={deleteModalHandler.close}
          >
            Cancel
          </button>

          <button
            disabled={isLoading}
            className="btn btn-danger"
            onClick={deleteFavicon}
          >
            Delete
          </button>
        </div>
      </Modal>
    </>
  );
};

export default FunnelFavicon;
