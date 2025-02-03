import React, { Dispatch, SetStateAction, useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/router";
import { ErrorMessage, Field, Form, Formik } from "formik";
import * as Yup from "yup";
import { IFunnel } from "@/interfaces/IFunnel";
import { IPage } from "@/interfaces/IPage";
import { IProject } from "@/interfaces/IProject";
import { createPageApi } from "@/store/features/pageApi";
import { showErrorToast, showSuccessToast } from "@/utils/toast";
import {
  ArrowTopRightSVG,
  CopySVG,
  GearSVG,
  HomeSVG,
  PageSVG,
  PencilSquareSVG,
  RecycleSVG,
  ShopSVG,
  TrashSVG,
  WrenchSVG,
} from "@/components/icons/SVGData";
import { formatVersionDate } from "@/helpers/date";
import NewProductModal from "./NewProductModal";
import FunnelProductsList from "./FunnelProductsList";
import { useGetConnectedStripeAccountsQuery } from "@/store/features/integrationsApi";
import { FunnelType } from "@/enums/funnel-type.enum";
import clsx from "clsx";

interface IProps {
  isLightMode?: boolean;
  page: IPage | null;
  funnel: IFunnel;
  project: IProject | undefined;
  setSelectedPage: Dispatch<SetStateAction<any>>;
  toggleFunnelTabs: Dispatch<SetStateAction<any>>;
}

const FunnelPanelRight = ({
  isLightMode = false,
  page,
  funnel,
  project,
  setSelectedPage,
  toggleFunnelTabs,
}: IProps) => {
  const [tabs, setTabs] = useState<string>("overview");
  const toggleTabs = (name: string) => {
    setTabs(name);
  };

  useEffect(() => {
    setTabs("overview");
  }, [page]);

  if (!page) {
    return <></>;
  }

  return (
    <>
      <div
        className={clsx("flex items-center justify-between border-b", {
          "border-[#ebedf2]": isLightMode,
          "border-[#191e3a]": !isLightMode,
        })}
      >
        <h5
          className={clsx("text-lg font-semibold", {
            "text-black": isLightMode,
            "text-white-light": !isLightMode,
          })}
        >
          {page.title || page.funnelStep || ""}
        </h5>
        <ul className="overflow-y-auto whitespace-nowrap font-semibold text-end flex items-center">
          <li className="inline-block">
            <button
              onClick={() => toggleTabs("overview")}
              className={clsx("flex gap-2 border-b border-transparent p-4", {
                "bg-white-light text-black": tabs === "overview" && isLightMode,
                "!bg-[#191e3a] hover:bg-[#191e3a] text-white":
                  tabs === "overview" && !isLightMode,
                "text-black hover:bg-white-light":
                  tabs !== "overview" && isLightMode,
                "text-white hover:bg-[#191e3a]":
                  tabs !== "overview" && !isLightMode,
              })}
            >
              <HomeSVG />
              Overview
            </button>
          </li>
          {funnel.type !== FunnelType.SIMPLE_WEBSITES && (
            <li className="inline-block">
              <button
                onClick={() => toggleTabs("products")}
                className={clsx("flex gap-2 border-b border-transparent p-4", {
                  "bg-white-light text-black":
                    tabs === "products" && isLightMode,
                  "!bg-[#191e3a] text-white":
                    tabs === "products" && !isLightMode,
                  "text-black hover:bg-white-light":
                    tabs !== "products" && isLightMode,
                  "text-white hover:bg-[#191e3a]":
                    tabs !== "products" && !isLightMode,
                })}
              >
                <ShopSVG />
                Products
              </button>
            </li>
          )}
          <li className="inline-block">
            <button
              onClick={() => toggleTabs("settings")}
              className={clsx("flex gap-2 border-b border-transparent p-4", {
                "bg-white-light text-black": tabs === "settings" && isLightMode,
                "!bg-[#191e3a] text-white": tabs === "settings" && !isLightMode,
                "text-black hover:bg-white-light":
                  tabs !== "settings" && isLightMode,
                "text-white hover:bg-[#191e3a]":
                  tabs !== "settings" && !isLightMode,
              })}
            >
              <WrenchSVG />
              Publishing
            </button>
          </li>
        </ul>
      </div>

      <div className="max-w-2xl">
        {tabs === "overview" && (
          <FunnelOverview
            isLightMode={isLightMode}
            page={page}
            funnel={funnel}
            project={project}
            setSelectedPage={setSelectedPage}
            onPageSettings={() => toggleTabs("settings")}
            toggleFunnelTabs={toggleFunnelTabs}
          />
        )}
        {tabs === "settings" && (
          <PageSettings
            isLightMode={isLightMode}
            page={page}
            funnel={funnel}
            setSelectedPage={setSelectedPage}
            setTabs={setTabs}
          />
        )}
        {tabs === "products" && (
          <Products pageId={page._id} isLightMode={isLightMode} />
        )}
      </div>
    </>
  );
};

export default FunnelPanelRight;

interface OverviewProps extends IProps {
  isLightMode?: boolean;
  page: IPage;
  onPageSettings: () => void;
}
const FunnelOverview = ({
  isLightMode = false,
  page,
  funnel,
  project,
  onPageSettings,
  toggleFunnelTabs,
}: OverviewProps) => {
  const previewUrl = `${process.env.NEXT_PUBLIC_PREVIEW_URL}/p/${funnel._id}/${page.path || ""}`;

  let productionUrl = previewUrl;
  if (funnel.domain) {
    productionUrl = `https://${funnel.domain.domain}/${page.path || ""}`;
  }

  let editorSuffix = "";
  let funnelTypeSuffix = "";

  switch (funnel?.type) {
    case FunnelType.EASY_WEBSITES:
      editorSuffix = "/easy-websites/edit?";
      funnelTypeSuffix = "&type=easy-websites";
      break;
    case FunnelType.SIMPLE_WEBSITES:
      editorSuffix = "/simple-websites/edit?";
      funnelTypeSuffix = "&type=simple-websites";
      break;
    case FunnelType.ULTRA_FAST_WEBSITE:
      funnelTypeSuffix = "&type=website";
      editorSuffix = "/pages/editor.htm?v=5&";
      break;
    default:
      editorSuffix = "/pages/editor.htm?v=5&";
      break;
  }

  const editorUrl =
    funnel?.type === FunnelType.SIMPLE_WEBSITES
      ? `/simple-websites/edit/${page._id}?funnel=${funnel._id}&pagePath=${page.path || ""}`
      : `${editorSuffix}project=${project ? project._id : "default"}&funnel=${funnel._id}${funnelTypeSuffix}&page=${page._id}&api=${encodeURIComponent(process.env.NEXT_PUBLIC_BASEURL || "")}`;

  return (
    <>
      <div className="flex items-stretch justify-between border border-[#1b2e4b] rounded mt-3 p-0">
        <button
          className={clsx("p-2 flex justify-center", {
            "text-black": isLightMode,
          })}
          onClick={onPageSettings}
        >
          <GearSVG />
        </button>
        <input
          type="text"
          className={clsx("p-2 w-full focus:outline-none m-0", {
            "bg-white text-[#3b3f5c]": isLightMode,
            "bg-[#191e3a] text-white": !isLightMode,
          })}
          value={productionUrl}
          disabled
        />
        <Link
          href={productionUrl}
          target="_blank"
          className={clsx("p-2 cursor-pointer", {
            "text-black": isLightMode,
          })}
        >
          <ArrowTopRightSVG />
        </Link>
      </div>
      {!funnel.domain && (
        <div className="flex justify-end mt-1 pr-2">
          <Link
            href=""
            onClick={e => {
              toggleFunnelTabs("settings");
              e.preventDefault();
            }}
            className="underline text-blue-500"
          >
            + Add a domain
          </Link>
        </div>
      )}
      <div className={`${funnel.domain ? "mt-4" : "mt-0"}`}>
        <div
          className="relative w-64 h-64 border border-[#1b2e4b] rounded"
          style={{
            backgroundImage: page.thumbnailUrl
              ? "url(" + page.thumbnailUrl
              : undefined,
            backgroundSize: "cover",
            backgroundPosition: "center center",
            backgroundRepeat: "no-repeat",
          }}
        >
          {!page.thumbnailUrl && (
            <div className="absolute inset-0 flex justify-center items-center">
              <PageSVG />
            </div>
          )}
          <div className="absolute bottom-0 left-0 w-full grid grid-cols-4 gap-1 p-1">
            <Link
              className="col-span-2	flex justify-center items-center rounded bg-primary px-3 py-2 text-white"
              href={editorUrl}
            >
              <PencilSquareSVG />
              <div className="ml-2">Edit Page</div>
            </Link>
            <Link
              href={previewUrl}
              target="_blank"
              className="rounded bg-primary px-3 py-2 text-white flex justify-center"
            >
              <ArrowTopRightSVG />
            </Link>
            <button
              className="rounded bg-primary px-3 py-2 text-white flex justify-center"
              onClick={onPageSettings}
            >
              <GearSVG />
            </button>
          </div>
        </div>
      </div>
    </>
  );
};

interface PageSettingsProps {
  isLightMode?: boolean;
  page: IPage;
  funnel: IFunnel;
  setSelectedPage: Dispatch<SetStateAction<any>>;
  setTabs: Dispatch<SetStateAction<any>>;
}

const validationSchema = Yup.object().shape({
  pageId: Yup.string().required("Page ID is required"),
  title: Yup.string().required("Title is required"),
  path: Yup.string(),
});

const PageSettings = ({
  isLightMode = false,
  page,
  funnel,
  setSelectedPage,
  setTabs,
}: PageSettingsProps) => {
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

  const { refetch: refetchPages } = createPageApi.useGetFunnelPagesQuery({
    funnelId: funnel._id,
  });
  const [updatePageSettings] = createPageApi.useUpdatePageSettingsMutation();
  const [deletePage] = createPageApi.useDeletePageMutation();
  const [restorePageVersion] = createPageApi.useRestorePageVersionMutation();
  const [clonePage] = createPageApi.useClonePageMutation();

  const handleDelete = async () => {
    if (
      !confirm(
        `Are you sure you want to delete this ${type !== FunnelType.ULTRA_FAST_FUNNEL ? "page" : "step"}?`
      )
    ) {
      return;
    }
    await deletePage({ pageId: page._id, funnelId: funnel._id });

    await refetchPages();
    setSelectedPage(null);
  };

  const handleRestoreVersion = async (versionId: string) => {
    if (!confirm("Are you sure you want to restore this version?")) {
      return;
    }
    await restorePageVersion({ pageId: page._id, versionId });

    await refetchPages();
    setSelectedPage(page);
    setTabs("overview");
    showSuccessToast({
      title: `${type !== FunnelType.ULTRA_FAST_FUNNEL ? "Page" : "Step"} version restored`,
    });
  };

  const handleCloneStep = async () => {
    if (
      !confirm(
        `Are you sure you want to clone this ${type !== FunnelType.ULTRA_FAST_FUNNEL ? "page" : "step"}?`
      )
    ) {
      return;
    }
    await clonePage({ pageId: page._id });

    const newPages = await refetchPages();
    if (newPages.data) {
      setSelectedPage(newPages.data[newPages.data.length - 1]);
      setTabs("overview");
      showSuccessToast({
        title: `${type !== FunnelType.ULTRA_FAST_FUNNEL ? "Page" : "Step"} cloned successfully`,
      });
    }
  };

  return (
    <div className="max-w-xl">
      <Formik
        initialValues={{
          title: page.title,
          pageId: page._id,
          path: page.path,
        }}
        validationSchema={validationSchema}
        onSubmit={async (values, { setSubmitting, setErrors }) => {
          try {
            const data = await updatePageSettings(values).unwrap();

            refetchPages();
            if (data) {
              showSuccessToast({ title: data.message });
            }
          } catch (error) {
            console.error(error);
            //@ts-ignore
            showErrorToast(
              //@ts-ignore
              error && error.data.error ? error.data.error : error
            );
          } finally {
            setSubmitting(false);
          }
        }}
      >
        {({ isSubmitting, touched, errors }) => (
          <Form>
            <div className="space-y-4 mt-5">
              <div className={touched.title && errors.title ? "has-error" : ""}>
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
              <div className={touched.path && errors.path ? "has-error" : ""}>
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
            <div className="mt-6">
              <button
                type="submit"
                disabled={isSubmitting}
                className="rounded bg-primary px-4 py-2 text-white"
              >
                {isSubmitting ? "Saving..." : "Save Settings"}
              </button>
            </div>
          </Form>
        )}
      </Formik>
      <div className="mt-8">
        <h5
          className={clsx("text-lg font-semibold", {
            "text-black": isLightMode,
            "text-white-light": !isLightMode,
          })}
        >
          Version History (Last 30 Saves)
        </h5>
        <div
          className={clsx(
            "table-responsive my-5 h-64 border rounded font-semibold overflow-auto",
            {
              "border-[#ebedf2]": isLightMode,
              "border-[#191e3a]": !isLightMode,
            }
          )}
        >
          {(!page.versions || page.versions.length < 1) && (
            <div
              className={clsx("mt-4 w-full text-center text-md font-semibold", {
                "text-black": isLightMode,
              })}
            >
              No old versions
            </div>
          )}
          <table>
            <tbody>
              {page.versions
                ?.filter(v => !!v.updatedAt)
                .map(version => {
                  const previewUrl = `${process.env.NEXT_PUBLIC_BASEURL}/p/version/${funnel._id}/${version._id}/${page.path || ""}`;

                  return (
                    <tr key={version._id}>
                      <td className="flex justify-between items-center flex-col md:flex-row">
                        <div
                          className={clsx("whitespace-nowrap", {
                            "text-black": isLightMode,
                          })}
                        >
                          {formatVersionDate(new Date(version.updatedAt!))}
                        </div>
                        <div className="flex items-center">
                          <Link
                            href={previewUrl}
                            target="_blank"
                            className="flex items-center badge whitespace-nowrap bg-secondary cursor-pointer pr-3"
                          >
                            <div className="scale-75">
                              <ArrowTopRightSVG />
                            </div>
                            <div className="ml-2">Preview</div>
                          </Link>
                          <div
                            className="ml-2 flex items-center badge whitespace-nowrap bg-primary cursor-pointer pr-3"
                            onClick={() => handleRestoreVersion(version._id)}
                          >
                            <div className="scale-75">
                              <RecycleSVG />
                            </div>
                            <div className="ml-2">Restore</div>
                          </div>
                        </div>
                      </td>
                    </tr>
                  );
                })}
            </tbody>
          </table>
        </div>
      </div>
      <div className="mt-8 flex justify-end">
        <button
          type="button"
          onClick={handleCloneStep}
          className="rounded border border-primary px-2 py-2 text-primary flex items-center"
        >
          <div className="scale-75">
            <CopySVG />
          </div>
          <div className="mr-1">
            Clone{" "}
            {type !== FunnelType.ULTRA_FAST_FUNNEL
              ? "Website Page"
              : "Funnel Step"}
          </div>
        </button>
        <button
          type="button"
          onClick={handleDelete}
          className="ml-4 rounded border border-danger px-2 py-2 text-danger flex items-center"
        >
          <div className="scale-75">
            <TrashSVG />
          </div>
          <div className="mr-1">
            Delete{" "}
            {type !== FunnelType.ULTRA_FAST_FUNNEL
              ? "Website Page"
              : "Funnel Step"}
          </div>
        </button>
      </div>
    </div>
  );
};

const Products: React.FC<{ pageId: string; isLightMode?: boolean }> = ({
  pageId,
  isLightMode = false,
}) => {
  const [isNewProductModalOpen, setIsNewProductModalOpen] =
    useState<boolean>(false);

  const { push } = useRouter();
  const { data: accounts } = useGetConnectedStripeAccountsQuery();
  const {
    data: products,
    isFetching,
    refetch: refetchProducts,
  } = createPageApi.useGetSavedProductsQuery(
    { params: { pageId } },
    { skip: !(!!pageId && accounts && accounts?.length > 0) }
  );

  const handleNewProductModalOpen = () => {
    setIsNewProductModalOpen(true);
  };

  const handleNewProductModalClose = () => {
    setIsNewProductModalOpen(false);
  };

  return (
    <>
      <div className="space-y-4">
        {isFetching && (
          <div
            className={clsx("m-4", {
              "text-black": isLightMode,
            })}
          >
            Loading...
          </div>
        )}
      </div>
      {!!products?.result?.length && (
        <FunnelProductsList
          isLightMode={isLightMode}
          products={products.result}
          pageId={pageId}
          onChange={refetchProducts}
        />
      )}
      <div className="mt-6 flex justify-start">
        {!!accounts?.length && (
          <button
            className="rounded bg-primary px-4 py-2 text-white"
            onClick={handleNewProductModalOpen}
          >
            + New Product
          </button>
        )}
        {!accounts?.length && (
          <button
            onClick={() => push("/integrations/stripe")}
            className="btn btn-primary !my-6"
          >
            Add Stripe Account First
          </button>
        )}
        <NewProductModal
          isLightMode={isLightMode}
          isOpen={isNewProductModalOpen}
          pageId={pageId}
          onRequestClose={handleNewProductModalClose}
          onAddProduct={refetchProducts}
        />
      </div>
    </>
  );
};
