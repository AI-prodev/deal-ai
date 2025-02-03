import React from "react";
import Link from "next/link";
import Currency from "@/components/Currency";
import { createPageApi } from "@/store/features/pageApi";
import { showErrorToast, showSuccessToast } from "@/utils/toast";
import { IAccountProducts } from "@/interfaces/IIntegrations";
import { TrashSVG } from "@/components/icons/SVGData";
import clsx from "clsx";

const FunnelProductCard: React.FC<{
  product: IAccountProducts;
  pageId: string;
  onChange: () => void;
  isLightMode?: boolean;
}> = ({ product, pageId, onChange, isLightMode = false }) => {
  const [deleteProduct] = createPageApi.useDeleteProductMutation();
  const handleDelete = async () => {
    if (!confirm("Are you sure you want to remove this product?")) {
      return;
    }
    try {
      const res = await deleteProduct({ pageId, priceId: product.id });
      if ("data" in res) {
        showSuccessToast({ title: res?.data?.message });
        onChange();
      }
    } catch (e) {
      showErrorToast("Something went wrong. Please try again.");
    }
  };

  return (
    <>
      <div
        className={clsx("w-full rounded border", {
          "border-white-light bg-white shadow-[4px_6px_10px_-3px_#bfc9d4]":
            isLightMode,
          "border-[#1b2e4b] bg-[#191e3a] shadow-none": !isLightMode,
        })}
      >
        <div className="py-4 px-6 flex flex-col md:flex-row justify-between items-center">
          <div className="flex items-center">
            <h5
              className={clsx("ml-3 text-xl font-semibold", {
                "text-[#3b3f5c]": isLightMode,
                "text-white-light": !isLightMode,
              })}
            >
              {product?.product.name}
            </h5>
          </div>
          <div
            className={clsx("mt-2 sm:mt-0 flex", {
              "text-[#3b3f5c]": isLightMode,
              "text-white-dark": !isLightMode,
            })}
          >
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
                <span> / {product?.recurring?.interval}</span>
              )}
            </p>
            <Link
              href=""
              className="ml-6 flex items-center"
              onClick={e => {
                handleDelete();
                e.preventDefault();
              }}
            >
              <TrashSVG />
              <div className="ml-2">Remove</div>
            </Link>
          </div>
        </div>
      </div>
    </>
  );
};

export default FunnelProductCard;
