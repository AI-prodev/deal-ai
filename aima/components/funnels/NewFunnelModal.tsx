import React from "react";
import { ErrorMessage, Field, Form, Formik } from "formik";
import * as Yup from "yup";
import Modal from "@/components/Modal";
import "tippy.js/dist/tippy.css";
import { showErrorToast, showSuccessToast } from "@/utils/toast";
import { createFunnelApi } from "@/store/features/projectApi";
import { IProject } from "@/interfaces/IProject";
import { FunnelType } from "@/enums/funnel-type.enum";
import clsx from "clsx";

interface NewFunnelModalProps {
  isLightMode?: boolean;
  project: IProject | null;
  isOpen: boolean;
  onRequestClose: () => void;
  onFunnelCreated: () => void;
  type: FunnelType;
}

const validationSchema = Yup.object().shape({
  projectId: Yup.string().required("Project ID is required"),
  title: Yup.string().required("Title is required"),
});

const NewFunnelModal: React.FC<NewFunnelModalProps> = ({
  isLightMode = false,
  project,
  isOpen,
  onRequestClose,
  onFunnelCreated,
  type,
}) => {
  const [createFunnel] = createFunnelApi.useCreateFunnelMutation();
  let name = "Website";

  const stopPropagation = (event: any) => {
    event.stopPropagation();
  };

  if (type === FunnelType.ULTRA_FAST_FUNNEL) {
    name = "Funnel";
  }

  return (
    <Modal
      isOpen={isOpen}
      onRequestClose={onRequestClose}
      customClassName={clsx("", {
        "!bg-white": isLightMode,
        "!bg-[#1b2e4b]": !isLightMode,
      })}
    >
      <div>
        <h2
          className={clsx("mb-4 text-lg font-bold", {
            "text-black": isLightMode,
            "text-white": !isLightMode,
          })}
        >
          New {name}
        </h2>
        <Formik
          initialValues={{
            title: "",
            projectId: project ? project._id : "default",
          }}
          validationSchema={validationSchema}
          onSubmit={async (values, { setSubmitting, setErrors }) => {
            try {
              const data = await createFunnel({
                ...values,
                type,
              }).unwrap();

              onFunnelCreated();
              if (data) {
                await showSuccessToast({
                  title: `${name} created successsfully`,
                });
              }
              onRequestClose();
            } catch (error) {
              console.error(error);
              //@ts-ignore
              showErrorToast(
                //@ts-ignore
                error && error.data.error
                  ? //@ts-ignore
                    error.data.error
                  : error
              );
            } finally {
              setSubmitting(false);
            }
          }}
        >
          {({ isSubmitting, touched, errors }) => (
            <Form>
              <div className="space-y-4">
                <div
                  className={touched.title && errors.title ? "has-error" : ""}
                >
                  <label
                    htmlFor="title"
                    className={clsx("", {
                      "text-black": isLightMode,
                      "text-white": !isLightMode,
                    })}
                  >
                    Title
                  </label>
                  <Field
                    name="title"
                    type="text"
                    id="title"
                    className={clsx("form-input", {
                      "!bg-white !text-[#333333]": isLightMode,
                    })}
                  />
                  <ErrorMessage
                    name="title"
                    component="div"
                    className="mt-1 text-danger"
                  />
                </div>
              </div>
              <div className="mt-4 flex justify-end">
                <button
                  type="button"
                  onClick={onRequestClose}
                  className="mr-2 rounded border border-primary px-4 py-2 text-primary"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="rounded bg-primary px-4 py-2 text-white"
                >
                  {isSubmitting ? "Creating..." : `Create ${name}`}
                </button>
              </div>
            </Form>
          )}
        </Formik>
      </div>
    </Modal>
  );
};

export default NewFunnelModal;
