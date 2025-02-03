// MarketingForms.tsx
import { Field, Form, Formik, FormikProps } from "formik";
import React, { useEffect, useState } from "react";
import { FieldWithLabel } from "../marketingHooks/FieldWithLabel"; // make sure to import the new component
import {
  useStartPageGeneratorRequestMutation,
  useQueryPageGeneratorRequestMutation,
  useEndPageGeneratorRequestMutation,
} from "@/store/features/pageGeneratorApi";
import LoadingAnimation from "../LoadingAnimation";
import { ThesisBuildingProgress } from "../ThesisBuildingProgress";
import * as Yup from "yup";
import { showErrorToastTimer } from "@/utils/toast";
import "tippy.js/dist/tippy.css";
import { PageData } from "@/pages/apps/page-generator";
import { IFunnel } from "@/interfaces/IFunnel";
import { IProject } from "@/interfaces/IProject";
import { useRouter } from "next/router";
import { createPageApi } from "@/store/features/pageApi";

interface FormValues {
  businessDescription: string;
}

const FormValidation = Yup.object().shape({
  businessDescription: Yup.string().required(
    "Please enter the business description"
  ),
});

// Type for the props is empty in this case, but it's set up if needed in future
const PageGeneratorForms = ({
  pageData,
  setPageData,
  funnel,
  project,
}: {
  pageData: PageData[];
  setPageData: React.Dispatch<React.SetStateAction<PageData[]>>;
  funnel?: IFunnel;
  project?: IProject;
}) => {
  const [remainingTime, setRemainingTime] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [generationCount, setGenerationCount] = useState(0);
  const router = useRouter();
  const { refetch: refetchPages } = createPageApi.useGetFunnelPagesQuery({
    funnelId: funnel ? funnel._id : "unknown",
  });

  let formikRef: { current: FormikProps<FormValues> | null } = {
    current: null,
  };

  const minutes = Math.floor(remainingTime / 60);
  const seconds = remainingTime % 60;

  const [startPageGeneratorRequest, { isLoading: isStarting }] =
    useStartPageGeneratorRequestMutation();
  const [queryPageGeneratorRequest] = useQueryPageGeneratorRequestMutation();
  const [endPageGeneratorRequest] = useEndPageGeneratorRequestMutation();

  const submitForm = async (values: FormValues) => {
    setRemainingTime(180);
    try {
      const request = {
        input: values,
        title: "Welcome",
      } as any;
      if (project && funnel) {
        request.projectId = project._id;
        request.funnelId = funnel._id;
      }
      const startResult = await startPageGeneratorRequest(request).unwrap();
      if (startResult.token) {
        trackProgress(startResult.token);
      }
      // Log the result here
    } catch (error) {
      console.error("Failed to create page", error);
    }
  };

  const trackProgress = async (token: string) => {
    let completed = false;
    let delay = 2000;
    const maxDelay = 30000;

    while (!completed) {
      try {
        const statusResult = await queryPageGeneratorRequest({
          token,
        }).unwrap();

        if (statusResult.status === "completed") {
          completed = true;
          const endResult = await endPageGeneratorRequest({
            token,
          }).unwrap();

          //@ts-ignore
          if (endResult && endResult.response) {
            const newGeneration = {
              id: endResult.response.pageId,
            } as PageData;
            setPageData((prevPageData: PageData[]) => [
              newGeneration,
              ...prevPageData,
            ]);
            setGenerationCount(generationCount + 1);
            setIsLoading(false);

            if (project && funnel) {
              await refetchPages();
              router.push(`/projects/${project._id}/funnels/${funnel._id}`);
            }
          }
        } else if (statusResult.status === "error") {
          setIsLoading(false);
          completed = true;
          showErrorToastTimer({ title: "Error generating page" });
        } else {
          delay = Math.min(delay * 1.5, maxDelay);
          setIsLoading(true);
        }

        await new Promise(res => setTimeout(res, delay));
      } catch (error) {
        console.error("Error tracking progress:", error);
        setIsLoading(false);
        completed = true;
        break;
      }
    }
  };

  useEffect(() => {
    if (!pageData && isLoading) {
      const timer = setInterval(() => {
        if (remainingTime == 0) return;
        setRemainingTime(prevTime => prevTime - 1);
      }, 1000);

      return () => {
        clearInterval(timer);
      };
    }
  }, [pageData, isLoading]);

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
      <Formik
        initialValues={{
          businessDescription: "",
        }}
        innerRef={formikInstance => {
          if (formikInstance?.errors && formikInstance.isSubmitting) {
            scrollToFirstError(formikInstance.errors);
          }
          formikRef.current = formikInstance;
        }}
        validationSchema={FormValidation}
        onSubmit={submitForm}
      >
        {({ errors, submitCount, touched, values, setFieldValue }) => (
          <Form className="space-y-5 text-white">
            <FieldWithLabel
              name="businessDescription"
              label="Business Description"
              component="textarea"
              id="businessDescription"
              className="form-input whitespace-pre-wrap"
              rows={8}
              style={{ height: "180px" }}
              tooltipContent="Business Description: Briefly outlines the functionality and utility of a product or service, avoiding promotional language."
            />
            {submitCount
              ? errors.businessDescription && (
                  <div className="mt-1 text-danger">
                    {errors.businessDescription}
                  </div>
                )
              : ""}

            {isLoading ? (
              <ThesisBuildingProgress
                minutes={minutes}
                seconds={seconds}
                title="Creating page..."
                progressCss={
                  "bg-primary h-4 rounded-full w-12/12 animated-progress"
                }
              />
            ) : (
              <button
                disabled={isLoading}
                type="submit"
                className="btn btn-primary !mt-6 w-full"
              >
                {pageData && pageData.length >= 1
                  ? "Create More Pages"
                  : "Create Page"}
              </button>
            )}
          </Form>
        )}
      </Formik>
    </>
  );
};

export default PageGeneratorForms;
