import React, { useEffect, useState } from "react";
import { ErrorMessage, Field, Form, Formik } from "formik";
import * as Yup from "yup";
import Modal from "@/components/Modal";
import "tippy.js/dist/tippy.css";
import { showErrorToast, showSuccessToast } from "@/utils/toast";
import { IProject } from "@/interfaces/IProject";
import { IFunnel } from "@/interfaces/IFunnel";
import { createPageApi, CreatePageParamsType } from "@/store/features/pageApi";
import { randomString } from "@/helpers/random";
import { EyeSVG, PlusSVG } from "@/components/icons/SVGData";
import Link from "next/link";
import LoadingAnimation from "../LoadingAnimation";
import { isValidUrl } from "@/helpers/url";
import { STEP_TEMPLATES } from "@/utils/data/FunnelStepTemplates";
import { FunnelType } from "@/enums/funnel-type.enum";
import { ELEGANT_WEBSITE_STEP_TEMPLATES } from "@/utils/data/SmartWebsiteStepTemplates";
import clsx from "clsx";

interface NewPageModalProps {
  isLightMode?: boolean;
  project: IProject | undefined;
  funnel: IFunnel;
  isOpen: boolean;
  onRequestClose: () => void;
  onPageCreated: () => void;
  type: FunnelType;
}

const validationSchema = Yup.object().shape({
  projectId: Yup.string(),
  funnelId: Yup.string().required("Funnel ID is required"),
  title: Yup.string().required("Title is required"),
  path: Yup.string(),
  templateContentUrl: Yup.string()
    .required("URL is required")
    .test("isValidUrl", "URL should start with http:// or https://", value =>
      isValidUrl(value)
    ),
  templateJsonUrl: Yup.string().test("isValidUrl", "URL is not valid", value =>
    isValidUrl(value)
  ),
  confirm: Yup.boolean(),
});

const NewPageModal: React.FC<NewPageModalProps> = ({
  isLightMode = false,
  project,
  funnel,
  isOpen,
  onRequestClose,
  onPageCreated,
  type,
}) => {
  const [step, setStep] = useState(1);
  const [tab, setTab] = useState("template");
  const [isSubmitting, setSubmitting] = useState(false);
  const [isTemplate, setIsTemplate] = useState(false);
  const [showTemplateOptions, setShowTemplateOptions] = useState(-1);
  // const [createPage] = createPageApi.useCreatePageMutation();

  const [startPageRequest] = createPageApi.useStartPageRequestMutation();
  const [queryPageRequest] = createPageApi.useQueryPageRequestMutation();
  const [endRequest] = createPageApi.useEndPageRequestMutation();
  const steps =
    type === FunnelType.SIMPLE_WEBSITES
      ? ELEGANT_WEBSITE_STEP_TEMPLATES
      : STEP_TEMPLATES;

  useEffect(() => {
    setStep(1);
  }, [isOpen]);

  const handleEndResponse = (data: any) => {
    onPageCreated();
    if (data) {
      showSuccessToast({ title: "Page created successfully" });
    }
    onRequestClose();
  };

  const trackProgress = async (token: string, values: CreatePageParamsType) => {
    let completed = false;
    let delay = 2000;
    const maxDelay = 30000;
    setIsTemplate(!!values.isTemplate);
    setSubmitting(true);

    while (!completed) {
      try {
        const statusResult: any = await queryPageRequest({ token });
        if (statusResult.data.status === "completed") {
          completed = true;

          const endResult = await endRequest({ token });
          handleEndResponse(endResult);
          setSubmitting(false);
          localStorage.removeItem("createPageToken");
        } else if (statusResult.data.status === "error") {
          completed = true;
          showErrorToast("Error analyzing website! Please try again.");
          localStorage.removeItem("createPageToken");
          setSubmitting(false);
        } else {
          delay = Math.min(delay * 1.5, maxDelay);
        }
      } catch (error) {
        setSubmitting(false);
        completed = true;
        localStorage.removeItem("createPageToken");
      }

      await new Promise(resolve => setTimeout(resolve, delay));
    }

    setSubmitting(false);
  };

  const handleCreatePage = async (values: CreatePageParamsType) => {
    try {
      const startResponse: any = await startPageRequest({
        input: values,
      });
      if (startResponse.data.token) {
        localStorage.setItem("createPageToken", startResponse.data.token);
        trackProgress(startResponse.data.token, values);
      }
    } catch (error) {
      showErrorToast("Error starting web request. Please try again.");
      console.error("Error starting web request:", error);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onRequestClose={onRequestClose}
      customClassName={clsx("big-modal", {
        "!bg-white": isLightMode,
        "!bg-[#1b2e4b]": !isLightMode,
      })}
    >
      <div className="grid grid-rows-[auto_1fr] h-full">
        <div>
          <h2
            className={clsx("mb-4 text-lg font-bold", {
              "text-black": isLightMode,
              "text-white": !isLightMode,
            })}
          >
            New{" "}
            {type !== FunnelType.ULTRA_FAST_FUNNEL
              ? "Website Page"
              : "Funnel Step"}
          </h2>
        </div>
        <Formik
          initialValues={{
            title: "",
            projectId: project ? project._id : "default",
            funnelId: funnel._id,
            path: randomString(10),
            confirm: false,
            templateContentUrl: "",
            templateJsonUrl: "",
          }}
          validationSchema={validationSchema}
          onSubmit={values => handleCreatePage(values)}
        >
          {({ touched, errors, values }) => (
            <>
              <Form className="grid grid-rows-[1fr_auto] overflow-hidden">
                <div className="h-full grid grid-rows-[auto_1fr] overflow-hidden">
                  {step === 1 && (
                    <>
                      <div className="space-y-4">
                        <div
                          className={
                            touched.title && errors.title ? "has-error" : ""
                          }
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
                      <div className="mt-4">
                        <div
                          className={
                            touched.path && errors.path ? "has-error" : ""
                          }
                        >
                          <label
                            htmlFor="title"
                            className={clsx("", {
                              "text-black": isLightMode,
                              "text-white": !isLightMode,
                            })}
                          >
                            Path
                          </label>
                          <Field
                            name="path"
                            type="text"
                            id="path"
                            className={clsx("form-input", {
                              "!bg-white !text-[#333333]": isLightMode,
                            })}
                          />
                          <ErrorMessage
                            name="path"
                            component="div"
                            className="mt-1 text-danger"
                          />
                        </div>
                      </div>
                    </>
                  )}
                  {step === 2 && (
                    <>
                      <ul className="whitespace-nowrap font-semibold border-b dark:border-white-dark mb-4">
                        <li className="inline-block">
                          <button
                            type="button"
                            onClick={() => setTab("template")}
                            className={clsx(
                              "flex gap-2 border-b border-transparent pb-2 px-2",
                              {
                                "!border-white !text-white":
                                  tab === "template" && !isLightMode,
                                "!border-black !text-black":
                                  tab === "template" && isLightMode,
                                "text-[#888ea8] hover:border-black hover:text-black":
                                  isLightMode,
                                "text-[#888ea8] hover:border-white hover:text-white":
                                  !isLightMode,
                              }
                            )}
                          >
                            Choose a template
                          </button>
                        </li>
                        {type !== FunnelType.SIMPLE_WEBSITES && (
                          <li className="inline-block">
                            <button
                              type="button"
                              onClick={() => setTab("import")}
                              className={clsx(
                                "flex gap-2 border-b border-transparent pb-2 px-2",
                                {
                                  "!border-white !text-white":
                                    tab === "import" && !isLightMode,
                                  "!border-black !text-black":
                                    tab === "import" && isLightMode,
                                  "text-[#888ea8] hover:border-black hover:text-black":
                                    isLightMode,
                                  "text-[#888ea8] hover:border-white hover:text-white":
                                    !isLightMode,
                                }
                              )}
                            >
                              Import from URL
                            </button>
                          </li>
                        )}
                      </ul>

                      {tab === "template" && (
                        <div className="grid grid-cols-3 gap-2 overflow-y-scroll flex-grow">
                          {steps.map((template, i) => (
                            <div
                              key={i}
                              className={`relative h-60 bg-cover`}
                              style={{
                                backgroundImage:
                                  "url(" + template.thumbnailUrl + ")",
                                backgroundSize: "cover",
                                backgroundPosition: "top center",
                                backgroundRepeat: "no-repeat",
                              }}
                              onMouseEnter={() => setShowTemplateOptions(i)}
                              onMouseLeave={() => setShowTemplateOptions(-1)}
                            >
                              {showTemplateOptions === i && (
                                <div className="absolute inset-0 flex justify-center items-center bg-blue-500 bg-opacity-50 flex-col">
                                  <button
                                    type="button"
                                    onClick={async () =>
                                      handleCreatePage({
                                        ...values,
                                        templateContentUrl: template.contentUrl,
                                        templateJsonUrl: template.jsonUrl,
                                        extraHead: template.extraHead,
                                        extraBody: template.extraBody,
                                        isTemplate: true,
                                      })
                                    }
                                    disabled={isSubmitting}
                                    className="flex justify-center items-center border rounded bg-primary px-4 py-2 text-white opacity-90 hover:opacity-100"
                                  >
                                    <PlusSVG />
                                    <div className="ml-2">Select Template</div>
                                  </button>
                                  <Link
                                    href={template.contentUrl}
                                    rel="noopener noreferrer"
                                    target="_blank"
                                    className="flex justify-center items-center border rounded mt-4 bg-secondary px-4 py-2 text-white opacity-90 hover:opacity-100"
                                  >
                                    <EyeSVG />
                                    <div className="ml-2">Preview</div>
                                  </Link>
                                </div>
                              )}
                            </div>
                          ))}
                        </div>
                      )}
                      {tab === "import" && (
                        <div className="space-y-4">
                          <div
                            className={
                              touched.templateContentUrl &&
                              errors.templateContentUrl
                                ? "has-error"
                                : ""
                            }
                          >
                            <Field
                              name="templateContentUrl"
                              type="text"
                              id="templateContentUrl"
                              className={clsx("form-input", {
                                "!bg-white !text-[#333333]": isLightMode,
                              })}
                              autoComplete="off"
                              placeholder="https://yourwebsite.com"
                            />
                            <ErrorMessage
                              name="templateContentUrl"
                              component="div"
                              className="mt-1 text-danger"
                            />
                          </div>
                          <label>
                            <Field
                              name="confirm"
                              type="checkbox"
                              id="confirm"
                            />
                            <span
                              className={clsx("ml-2", {
                                "text-black": isLightMode,
                                "text-white": !isLightMode,
                              })}
                            >
                              I confirm that this page either belongs to me or I
                              have permission to use these assets.
                            </span>
                          </label>
                          <button
                            type="submit"
                            className="rounded bg-primary px-4 py-2 text-white"
                            disabled={isSubmitting || !values.confirm}
                            onClick={async () => {
                              await handleCreatePage({
                                ...values,
                                isTemplate: false,
                              });
                            }}
                          >
                            Create Page
                          </button>
                        </div>
                      )}
                    </>
                  )}
                </div>

                <div
                  className={`mt-4 flex ${step === 1 ? "justify-end" : "justify-between"}`}
                >
                  {step === 2 && (
                    <button
                      type="button"
                      className="rounded border border-primary px-4 py-2 text-primary"
                      onClick={e => {
                        setStep(1);
                        e.preventDefault();
                      }}
                    >
                      Back
                    </button>
                  )}
                  <button
                    type="button"
                    onClick={onRequestClose}
                    className="mr-2 rounded border border-primary px-4 py-2 text-primary"
                  >
                    Cancel
                  </button>
                  {step === 1 && (
                    <button
                      type="button"
                      className="rounded bg-primary px-4 py-2 text-white"
                      onClick={e => {
                        e.preventDefault();
                        if (!errors.title && !errors.path) setStep(2);
                      }}
                    >
                      Next
                    </button>
                  )}
                </div>
              </Form>
              {isSubmitting && (
                <div
                  className={clsx(
                    "fixed inset-0 flex flex-col items-center justify-center z-50",
                    {
                      "bg-white text-black": isLightMode,
                      "bg-[#191e3a] text-white": !isLightMode,
                    }
                  )}
                >
                  <LoadingAnimation className="max-w-[9rem]" />
                  {isTemplate ? (
                    <h5 className="text-lg font-semibold">Creating Page...</h5>
                  ) : (
                    <>
                      <h5 className="text-lg font-semibold">
                        Downloading URL...
                      </h5>
                      <h5
                        className={clsx("text-sm mt-3", {
                          "text-black": isLightMode,
                          "text-gray-400": !isLightMode,
                        })}
                      >
                        Please be patient. This can take a minute or two.
                      </h5>
                    </>
                  )}
                </div>
              )}
            </>
          )}
        </Formik>
      </div>
    </Modal>
  );
};

export default NewPageModal;
