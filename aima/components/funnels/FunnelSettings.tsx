import { IProject } from "@/interfaces/IProject";
import { createFunnelApi } from "@/store/features/projectApi";
import { useRouter } from "next/router";
import React, { useCallback, useMemo, useState } from "react";
import FunnelWebhooks from "./FunnelWebhooks";
import { IFunnel } from "@/interfaces/IFunnel";
import FunnelDomain from "./FunnelDomain";
import FunnelFavicon from "./FunnelFavicon";
import { Form, Formik, FormikProps } from "formik";
import { FieldWithLabel } from "../marketingHooks/FieldWithLabel";
import * as Yup from "yup";
import { showErrorToast, showSuccessToast } from "@/utils/toast";
import {
  ArchiveSVG,
  ArrowTopRightSVG,
  CopySVG,
  ShareSVG,
} from "@/components/icons/SVGData";
import Link from "next/link";
import { createPageApi } from "@/store/features/pageApi";
import Modal from "../Modal";
import { FunnelType } from "@/enums/funnel-type.enum";
import Head from "next/head";
import { useSession } from "next-auth/react";
import clsx from "clsx";

interface FormValues {
  title: string;
}

const FormValidation = Yup.object().shape({
  title: Yup.string().required("Please enter a name"),
});

const FunnelSettings = ({
  isLightMode = false,
  funnel,
  project,
}: {
  isLightMode?: boolean;
  funnel: IFunnel;
  project: IProject | undefined;
}) => {
  const { data: session } = useSession();
  const router = useRouter();
  let type = FunnelType.ULTRA_FAST_WEBSITE;

  switch (
    router.query.type as
      | "websites"
      | "funnels"
      | "easy-websites"
      | "simple-websites"
  ) {
    case "websites":
      type = FunnelType.ULTRA_FAST_WEBSITE;
      break;
    case "easy-websites":
      type = FunnelType.EASY_WEBSITES;
      break;
    case "funnels":
      type = FunnelType.ULTRA_FAST_FUNNEL;
      break;
    case "simple-websites":
      type = FunnelType.SIMPLE_WEBSITES;
      break;
    default:
      type = FunnelType.ULTRA_FAST_WEBSITE;
      break;
  }

  const [isLoading, setIsLoading] = useState(false);
  const [isCloning, setIsCloning] = useState(false);
  const { refetch: refetchFunnels } = createFunnelApi.useGetProjectFunnelsQuery(
    {
      projectId: project ? project._id : "default",
      type,
    }
  );
  const [cloneFunnel] = createFunnelApi.useCloneFunnelMutation();
  const [queryPageRequest] = createPageApi.useQueryPageRequestMutation();
  const [endRequest] = createPageApi.useEndPageRequestMutation();

  const { refetch: refetchFunnel } = createFunnelApi.useGetFunnelQuery(
    { funnelId: funnel._id },
    { skip: !funnel }
  );
  // const [deleteFunnel] = createFunnelApi.useDeleteFunnelMutation();
  const [archiveFunnel] = createFunnelApi.useArchiveFunnelMutation();

  const [updateFunnelTitle] = createFunnelApi.useUpdateFunnelTitleMutation();

  const { firstName, lastName } = useMemo(() => {
    if (!session) {
      return { firstName: "", lastName: "" };
    }
    return { firstName: "", lastName: "" };
  }, [session]);

  const submitForm = async (values: FormValues) => {
    setIsLoading(true);
    const submissionData = {
      ...values,
    };

    try {
      const data = await updateFunnelTitle({
        funnelId: funnel._id,
        title: submissionData.title,
      }).unwrap();

      await refetchFunnel();

      if (data) {
        refetchFunnels();
        setIsLoading(false);
        showSuccessToast({ title: "Name Saved" });
      }
    } catch (error) {
      setIsLoading(false);
      console.error("Failed to save name", error);
    }
  };

  const handleArchiveFunnel = useCallback(async () => {
    if (!funnel) {
      return;
    }
    if (!confirm(`Are you sure you want to archive "${funnel.title}"?`)) {
      return;
    }

    await archiveFunnel({ funnelId: funnel._id });
    await refetchFunnels();

    if (project) {
      router.push(`/projects/${project._id}`);
    } else {
      let url = `/websites`;

      if (type === FunnelType.EASY_WEBSITES) {
        url = `/easy-websites`;
      } else if (type === FunnelType.ULTRA_FAST_FUNNEL) {
        url = `/funnels`;
      } else if (type === FunnelType.SIMPLE_WEBSITES) {
        url = "/simple-websites";
      }
      router.push(url);
    }
  }, [funnel]);

  let formikRef: { current: FormikProps<FormValues> | null } = {
    current: null,
  };

  const scrollToFirstError = (errors: any) => {
    console.error("Errors:", errors);
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

  const trackProgress = async (token: string) => {
    let delay = 2000;
    try {
      let completed = false;
      while (!completed) {
        const statusResult: any = await queryPageRequest({ token });
        if (statusResult.data.status === "completed") {
          await endRequest({ token });
          completed = true;
        } else if (statusResult.data.status === "error") {
          showErrorToast("Error analyzing website! Please try again.");
          completed = true;
        }
        await new Promise(resolve => setTimeout(resolve, delay));
      }
    } catch (error) {
      console.error(error);
    }
  };

  const handleCloneFunnel = async () => {
    if (!confirm("Are you sure you want to clone this funnel?")) {
      return;
    }
    setIsCloning(true);
    await cloneFunnel({ funnelId: funnel._id })
      .unwrap()
      .then(async token => {
        try {
          if (token) {
            await trackProgress(token);
            setIsCloning(false);
          }
        } catch (error) {
          showErrorToast("Error starting web request. Please try again.");
          console.error("Error starting web request:", error);
        }
      });

    const updatedFunnel = await refetchFunnel();
    if (updatedFunnel.data) {
      showSuccessToast({
        title: `${type !== FunnelType.ULTRA_FAST_FUNNEL ? "Website" : "Funnel"} cloned successfully`,
      });
      let url = `/websites`;

      if (type === FunnelType.EASY_WEBSITES) {
        url = `/easy-websites`;
      } else if (type === FunnelType.ULTRA_FAST_FUNNEL) {
        url = `/funnels`;
      } else if (type === FunnelType.SIMPLE_WEBSITES) {
        url = `/simple-websites`;
      }
      router.push(url);
    }
  };

  const handleShareFunnel = async () => {
    navigator.clipboard.writeText(
      `${
        process.env.NEXT_PUBLIC_SHARE_URL || process.env.NEXT_PUBLIC_BASEURL
      }/s/${funnel._id}`
    );
    showSuccessToast({ title: "Share URL copied to clipboard" });
  };

  return (
    <div className="ml-8">
      <Head>
        <script
          type="module"
          src="https://cdn.zapier.com/packages/partner-sdk/v0/zapier-elements/zapier-elements.esm.js"
        ></script>
        <link
          rel="stylesheet"
          href="https://cdn.zapier.com/packages/partner-sdk/v0/zapier-elements/zapier-elements.css"
        />
      </Head>
      <Modal isOpen={isCloning} onRequestClose={() => {}}>
        <p className="text-white">Cloning...</p>
      </Modal>
      <div className="mt-3 pt-2">
        <h2
          className={clsx("mt-2 text-2xl font-bold", {
            "text-black": isLightMode,
          })}
        >
          Settings
        </h2>
      </div>
      <div
        className={clsx("mt-6 w-full max-w-lg", {
          "text-black": isLightMode,
        })}
      >
        <h2 className="text-xl font-bold">Domain</h2>
      </div>
      <div className="mt-4 w-full max-w-lg">
        <FunnelDomain funnel={funnel} type={type} isLightMode={isLightMode} />
      </div>

      <div className="mt-8 w-full max-w-lg">
        <h2
          className={clsx("text-xl font-bold", {
            "text-black": isLightMode,
          })}
        >
          Favicon
        </h2>
      </div>
      <FunnelFavicon isLightMode={isLightMode} funnel={funnel} />

      <div className="mt-8 w-full max-w-lg">
        <h2
          className={clsx("text-xl font-bold", {
            "text-black": isLightMode,
          })}
        >
          Zapier
        </h2>
      </div>
      <div className="mt-4 w-full max-w-lg">
        <h2
          className={clsx("", {
            "text-black": isLightMode,
            "text-white": !isLightMode,
          })}
        >
          With Zapier, you can create automated workflows that can streamline
          your business. Each Zap acts as a template for repetitive tasks.
        </h2>
      </div>
      <div className="mt-4 w-full max-w-lg">
        <zapier-zap-templates
          sign-up-email={session?.user.email || ""}
          sign-up-first-name={firstName || ""}
          sign-up-last-name={lastName || ""}
          client-id="17vcbL7fu6IoKzIJsq9NEaU0m0MJUZbYkSbC1F9N"
          theme={isLightMode ? "light" : "dark"}
          ids="1665563,1665565,1665567,1665571,1665573,1665576,1665578,1665580,1665584,1665586"
          limit={5}
          use-this-zap="show"
        />
      </div>
      <div className="mt-8 w-full max-w-lg">
        <h2
          className={clsx("text-xl font-bold", {
            "text-black": isLightMode,
          })}
        >
          Webhooks
        </h2>
      </div>
      <div className="mt-4 w-full max-w-lg">
        <h2
          className={clsx("text-xl font-bold", {
            "text-black": isLightMode,
            "text-white": !isLightMode,
          })}
        >
          Use webhooks to send data to an external system.{" "}
          {type !== FunnelType.ULTRA_FAST_FUNNEL ? "Website" : "Funnel"}{" "}
          Webhooks are triggered when a visitor submits a form on your webpage.
        </h2>
      </div>
      <div className="mt-3 w-full max-w-lg">
        <h2
          className={clsx("flex items-center justify-start", {
            "text-black": isLightMode,
            "text-white": !isLightMode,
          })}
        >
          For more information see our&nbsp;
          <Link
            href="https://help.deal.ai/en/articles/8741017-adding-zapier-or-a-webhook-to-a-funnel"
            target="_blank"
            className="underline"
          >
            webhook documentation
          </Link>
          <Link
            href="https://help.deal.ai/en/articles/8741017-adding-zapier-or-a-webhook-to-a-funnel"
            target="_blank"
            className="scale-75 underline"
          >
            <ArrowTopRightSVG />
          </Link>
        </h2>
      </div>
      <div className="mt-1 w-full max-w-lg">
        <FunnelWebhooks isLightMode={isLightMode} funnel={funnel} />
      </div>

      {/* <div className="mt-6 w-1/2">
        <h2 className="text-xl font-bold">Product Info</h2>
      </div>
      <div className="mt-4 w-1/2">
        <FunnelHooks funnel={funnel} />
      </div> */}
      <div className="mt-8 w-full max-w-lg">
        <div>
          <h2
            className={clsx("text-xl font-bold", {
              "text-black": isLightMode,
            })}
          >
            Other
          </h2>
        </div>
        <div className="mt-4">
          <Formik
            initialValues={{
              title: funnel.title || "",
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
                  name="title"
                  label={`${type !== FunnelType.ULTRA_FAST_FUNNEL ? "Website" : "Funnel"} Name`}
                  component="input"
                  id="title"
                  isLightMode={isLightMode}
                  className={clsx("form-input whitespace-pre-wrap", {
                    "!bg-white !text-[#333333]": isLightMode,
                  })}
                  rows={1}
                />
                <button
                  disabled={isLoading}
                  type="submit"
                  className="btn btn-primary !my-6 "
                >
                  Save
                </button>
              </Form>
            )}
          </Formik>
        </div>
        <div className="mt-2">
          <hr
            className={clsx("border font-semibold", {
              "border-[#ebedf2]": isLightMode,
              "border-[#191e3a]": !isLightMode,
            })}
          />
        </div>
        <div className="mt-6 flex justify-end space-x-2">
          <button
            type="button"
            onClick={handleCloneFunnel}
            className="flex items-center rounded border border-primary px-2 py-2 text-primary"
          >
            <div className="scale-75">
              <CopySVG />
            </div>
            <div className="mr-1">
              Clone{" "}
              {type !== FunnelType.ULTRA_FAST_FUNNEL ? "Website" : "Funnel"}
            </div>
          </button>
          <button
            onClick={handleArchiveFunnel}
            className="flex items-center rounded border border-danger px-2 py-2 text-danger"
          >
            <div className="scale-75">
              <ArchiveSVG />
            </div>
            <div className="mr-1">
              Archive{" "}
              {type !== FunnelType.ULTRA_FAST_FUNNEL ? "Website" : "Funnel"}
            </div>
          </button>
        </div>
        <div className="mt-6 flex justify-end">
          <button
            type="button"
            onClick={handleShareFunnel}
            className="flex items-center rounded px-2 py-2 text-emerald-500"
          >
            <div className="scale-75">
              <ShareSVG />
            </div>
            <div className="ml-1">
              Copy{" "}
              {type !== FunnelType.ULTRA_FAST_FUNNEL ? "Website" : "Funnel"}{" "}
              Share URL
            </div>
          </button>
        </div>
      </div>
    </div>
  );
};

export default FunnelSettings;
