import React, { useEffect, useState } from "react";
import PerfectScrollbar from "react-perfect-scrollbar";
import { Formik, Form } from "formik";
import Modal from "@/components/Modal";
import Currency from "@/components/Currency";
import {
  useGetAccountProductsQuery,
  useGetConnectedStripeAccountsQuery,
} from "@/store/features/integrationsApi";
import { showErrorToast, showSuccessToast } from "@/utils/toast";
import { createPageApi } from "@/store/features/pageApi";
import { IAddProducts } from "@/interfaces/IIntegrations";
import clsx from "clsx";

interface NewProductModalProps {
  isOpen: boolean;
  pageId: string;
  onRequestClose: () => void;
  onAddProduct: () => void;
  isLightMode?: boolean;
}

interface FormValues {
  productIds: Omit<IAddProducts, "id">[];
}

const initialValues: FormValues = {
  productIds: [],
};

const NewProductModal: React.FC<NewProductModalProps> = ({
  isOpen,
  pageId,
  onRequestClose,
  onAddProduct,
  isLightMode = false,
}) => {
  const [step, setStep] = useState<number>(1);
  const [accountId, setAccountId] = useState<string | null>(null);
  const [id, setId] = useState<string | null>(null);

  const { data: accounts = [], isFetching } =
    useGetConnectedStripeAccountsQuery(undefined, { skip: !isOpen });
  const { data: products } = useGetAccountProductsQuery(id ?? undefined, {
    skip: !id,
  });
  const [addProducts] = createPageApi.useAddProductsMutation();

  useEffect(() => {
    setStep(1);
    setAccountId(null);
  }, [isOpen]);

  const handleChooseAccount = (uid: string, accId: string) => () => {
    if (accId !== id) {
      setId(uid);
      setAccountId(accId);
    }
  };

  const handleCheckboxChange = (
    product: Omit<IAddProducts, "productId">,
    values: FormValues,
    setFieldValue: any
  ) => {
    const productEntry = {
      productId: product.id,
      priceId: product.priceId,
      type: product.type,
    };
    const currentProductIds = values.productIds;
    const isProductSelected = currentProductIds.some(
      p => p.productId === product.id
    );

    setFieldValue(
      "productIds",
      isProductSelected
        ? currentProductIds.filter(p => p.productId !== product.id)
        : [...currentProductIds, productEntry]
    );
  };

  const handleSaveProducts = async (values: FormValues) => {
    try {
      const res = await addProducts({
        id: accountId,
        pageId,
        productIds: values.productIds,
      }).unwrap();
      showSuccessToast({ title: res.message });
      onAddProduct();
    } catch (e) {
      showErrorToast("Something went wrong. Please try again.");
    } finally {
      onRequestClose();
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
            New Product Step
          </h2>
        </div>
        <Formik
          initialValues={initialValues}
          onSubmit={values => handleSaveProducts(values)}
        >
          {({ values, setFieldValue }) => (
            <Form className="grid grid-rows-[1fr_auto] overflow-hidden">
              <div className="h-full grid grid-rows-[auto_1fr] overflow-hidden">
                {step === 1 && (
                  <div className="space-y-4 overflow-auto">
                    <PerfectScrollbar>
                      {isFetching && (
                        <div
                          className={clsx("m-4", {
                            "text-black": isLightMode,
                            "text-white": !isLightMode,
                          })}
                        >
                          Loading...
                        </div>
                      )}
                      <div className="mb-5 mt-6 grid gap-4 grid-cols-1 max-w-[480px]">
                        {accounts.map(account => (
                          <div
                            className={clsx("w-full rounded border", {
                              "!border-primary text-primary":
                                account._id === id,
                              "border-white-light bg-white shadow-[4px_6px_10px_-3px_#bfc9d4]":
                                isLightMode,
                              "shadow-none border-[#1b2e4b] bg-[#191e3a]":
                                !isLightMode,
                            })}
                            key={account._id}
                            onClick={handleChooseAccount(
                              account._id,
                              account.data.accountId
                            )}
                          >
                            <div className="py-4 px-6 flex flex-col md:flex-row justify-between items-center">
                              <div className="flex items-center">
                                <h5
                                  className={clsx(
                                    "ml-3 text-xl font-semibold",
                                    {
                                      "text-[#3b3f5c]": isLightMode,
                                      "text-white-light": !isLightMode,
                                    }
                                  )}
                                >
                                  {account.data.accountId}
                                </h5>
                              </div>
                              <div
                                className={clsx(
                                  "text-white-dark mt-2 sm:mt-0 flex",
                                  {
                                    "text-[#3b3f5c]": isLightMode,
                                    "text-white-dark": !isLightMode,
                                  }
                                )}
                              >
                                <span
                                  className={`badge whitespace-nowrap ${
                                    account.data.completed
                                      ? "bg-primary"
                                      : "bg-danger"
                                  }`}
                                >
                                  {account.data.completed
                                    ? "Enabled"
                                    : "Restricted"}
                                </span>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </PerfectScrollbar>
                  </div>
                )}
                {step === 2 && (
                  <div className="space-y-4 inset-0 z-10 overflow-y-auto ">
                    <PerfectScrollbar>
                      <div className="mb-5 mt-6 grid gap-4 grid-cols-1">
                        {!products?.data?.length && (
                          <p
                            className={clsx(
                              "mb-0 cursor-pointer ml-3 text-xl font-semibold",
                              {
                                "text-[#3b3f5c]": isLightMode,
                                "text-white-light": !isLightMode,
                              }
                            )}
                          >
                            Products not found
                          </p>
                        )}
                        {!!products?.data?.length &&
                          products.data.map(product => (
                            <label
                              key={product.id}
                              htmlFor={product.id}
                              className={clsx(
                                "cursor-pointer w-full rounded border",
                                {
                                  "border-white-light bg-white shadow-[4px_6px_10px_-3px_#bfc9d4]":
                                    isLightMode,
                                  "border-[#1b2e4b] bg-[#191e3a] shadow-none":
                                    !isLightMode,
                                }
                              )}
                            >
                              <div className="py-4 px-6 flex flex-col md:flex-row justify-between items-center">
                                <div className="flex items-center justify-between w-full">
                                  <div className="flex items-center">
                                    <input
                                      id={product.id}
                                      type="checkbox"
                                      className="form-checkbox"
                                      checked={values.productIds.some(
                                        p => p.priceId === product.id
                                      )}
                                      onChange={() =>
                                        handleCheckboxChange(
                                          {
                                            id: product.product.id,
                                            priceId: product.id,
                                            type: product.type,
                                          },
                                          values,
                                          setFieldValue
                                        )
                                      }
                                    />
                                    <p
                                      className={clsx(
                                        "mb-0 cursor-pointer ml-3 text-xl font-semibold",
                                        {
                                          "text-[#3b3f5c]": isLightMode,
                                          "text-white-light": !isLightMode,
                                        }
                                      )}
                                    >
                                      {product?.product?.name}
                                    </p>
                                  </div>
                                  <div className="flex justify-between">
                                    <p
                                      className={clsx(
                                        "mb-0 cursor-pointer ml-3 text-xl font-semibold",
                                        {
                                          "text-[#3b3f5c]": isLightMode,
                                          "text-white-light": !isLightMode,
                                        }
                                      )}
                                    >
                                      <Currency
                                        value={product?.unit_amount}
                                        currency={product?.currency}
                                      />
                                      {product?.recurring?.interval && (
                                        <span>
                                          {" "}
                                          / {product?.recurring?.interval}
                                        </span>
                                      )}
                                    </p>
                                  </div>
                                </div>
                              </div>
                            </label>
                          ))}
                      </div>
                    </PerfectScrollbar>
                  </div>
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
                <div>
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
                      className="rounded bg-primary px-4 py-2 text-white disabled:cursor-not-allowed disabled:opacity-60"
                      disabled={!accountId}
                      onClick={e => {
                        e.preventDefault();
                        setStep(2);
                      }}
                    >
                      Next
                    </button>
                  )}
                  {step === 2 && (
                    <button
                      className="rounded bg-primary px-4 py-2 text-white disabled:cursor-not-allowed disabled:opacity-60"
                      type="submit"
                      disabled={
                        !products?.data?.length || !values.productIds.length
                      }
                    >
                      Save
                    </button>
                  )}
                </div>
              </div>
            </Form>
          )}
        </Formik>
      </div>
    </Modal>
  );
};

export default NewProductModal;
