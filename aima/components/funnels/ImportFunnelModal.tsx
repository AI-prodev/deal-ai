import React from "react";
import { ErrorMessage, Field, Form, Formik } from "formik";
import * as Yup from "yup";
import Modal from "@/components/Modal";
import "tippy.js/dist/tippy.css";
import { showErrorToast, showSuccessToast } from "@/utils/toast";
import { createFunnelApi } from "@/store/features/projectApi";
import { IProject } from "@/interfaces/IProject";
import { createPageApi } from "@/store/features/pageApi";
import { FunnelType } from "@/enums/funnel-type.enum";
import clsx from "clsx";

interface ImportFunnelModalProps {
  isLightMode?: boolean;
  project: IProject | null;
  isOpen: boolean;
  onRequestClose: () => void;
  onFunnelImported: () => void;
  type: FunnelType;
}

const validationSchema = Yup.object().shape({
  shareUrl: Yup.string().required("Share URL is required"),
});

const ImportFunnelModal: React.FC<ImportFunnelModalProps> = ({
  isLightMode = false,
  project,
  isOpen,
  onRequestClose,
  onFunnelImported,
  type,
}) => {
  const [importFunnel] = createFunnelApi.useImportFunnelMutation();
  const [queryPageRequest] = createPageApi.useQueryPageRequestMutation();
  const [endRequest] = createPageApi.useEndPageRequestMutation();
  let name = "Website";

  const stopPropagation = (event: any) => {
    event.stopPropagation();
  };

  if (type === FunnelType.ULTRA_FAST_FUNNEL) {
    name = "Funnel";
  }

  const trackProgress = async (token: string) => {
    let delay = 2000;
    try {
      let completed = false;
      let error = false;
      while (!completed) {
        const statusResult: any = await queryPageRequest({ token });
        if (statusResult.data.status === "completed") {
          await endRequest({ token });
          completed = true;
        } else if (statusResult.data.status === "error") {
          showErrorToast("Error analyzing website! Please try again.");
          completed = true;
          error = true;
        }
        await new Promise(resolve => setTimeout(resolve, delay));
      }
      if (!error) showSuccessToast({ title: `${name} imported successfully` });
    } catch (error) {
      console.error(error);
    }
  };

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
          Import {name}
        </h2>
        <Formik
          initialValues={{
            shareUrl: "",
          }}
          validationSchema={validationSchema}
          onSubmit={async (values, { setSubmitting, setErrors }) => {
            try {
              const sharedFunnel = {
                funnelId: values.shareUrl.split("/s/")[1],
                projectId: project ? project._id : "default",
                type,
              };
              await importFunnel(sharedFunnel)
                .unwrap()
                .then(async token => {
                  try {
                    if (token) {
                      await trackProgress(token);
                    }
                  } catch (error) {
                    showErrorToast(
                      "Error starting web request. Please try again."
                    );
                    console.error("Error starting web request:", error);
                  }
                  onRequestClose();
                  onFunnelImported();
                });
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
                  className={
                    touched.shareUrl && errors.shareUrl ? "has-error" : ""
                  }
                >
                  <label
                    htmlFor="shareUrl"
                    className={clsx("", {
                      "text-black": isLightMode,
                      "text-white": !isLightMode,
                    })}
                  >
                    Share URL
                  </label>
                  <Field
                    name="shareUrl"
                    type="text"
                    id="shareUrl"
                    placeholder="https://share.deal.ai/s/6589d2177f72180abd5a6fe8"
                    className={clsx("form-input", {
                      "!bg-white !text-[#333333]": isLightMode,
                    })}
                  />
                  <ErrorMessage
                    name="shareUrl"
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
                  {isSubmitting ? "Importing..." : `Import ${name}`}
                </button>
              </div>
            </Form>
          )}
        </Formik>
      </div>
    </Modal>
  );
};

export default ImportFunnelModal;
