import React, { useEffect, useState } from "react";
import Modal from "@/components/Modal";
import { createStripeApi } from "@/store/features/stripeApi";
import { CloseSVG, ShopThickSVG } from "./icons/SVGData";
import { CardElement, useStripe, useElements } from "@stripe/react-stripe-js";

interface Props {
  isOpen: boolean;
  priceId: string;
  productId: string;
  onSuccess: () => void;
  onCancel: () => void;
}

export const formatPriceWithCents = (
  amount: number,
  type: string,
  recurring?: { interval: string }
) => {
  const dollars = Math.floor(amount / 100);
  const cents = amount % 100;

  let result = `$${dollars}.${cents.toString().padStart(2, "0")}`;
  if (cents == 0) {
    result = `$${dollars}`;
  }

  if (type === "recurring" && recurring) {
    result += ` / ${recurring.interval}`;
  }

  return result;
};

const UnlockAccessModal: React.FC<Props> = ({
  isOpen,
  productId,
  priceId,
  onSuccess,
  onCancel,
}) => {
  const [error, setError] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);
  const stripe = useStripe();
  const elements = useElements();
  const { data: price } = createStripeApi.useGetPriceQuery({ priceId });
  const { data: product } = createStripeApi.useGetProductQuery({ productId });
  const [purchase] = createStripeApi.usePurchaseMutation();

  const handlePurchase = async () => {
    setIsProcessing(true);

    try {
      let paymentMethodId = "";

      if (error) {
        const cardElement = elements?.getElement(CardElement);
        if (!cardElement || !stripe) {
          return;
        }
        const { paymentMethod, error } = await stripe?.createPaymentMethod({
          type: "card",
          card: cardElement,
        });
        if (error) {
          setError(error.message || "Something went wrong");
          return;
        }
        paymentMethodId = paymentMethod.id;
        setError("");
      }

      const result = await purchase({ priceId, paymentMethodId });
      // eslint-disable-next-line no-console
      console.log("result=", result);
      if ("data" in result && result.data.error) {
        throw result.data.error;
      }

      onSuccess();
    } catch (err) {
      console.error("err=", err);
      setError(err as string);
    } finally {
      setIsProcessing(false);
    }
  };

  if (!price || !product) {
    return (
      <Modal isOpen={isOpen} onRequestClose={onCancel}>
        <div className="h-24"></div>
      </Modal>
    );
  }

  return (
    <Modal isOpen={isOpen} onRequestClose={onCancel}>
      <div className="relative">
        <div
          className="absolute top-0 right-0 md:top-1 md:right-2 text-white cursor-pointer"
          onClick={onCancel}
        >
          <CloseSVG />
        </div>
        <h2 className="mb-4 text-lg font-bold text-white">Unlock Access</h2>

        <div className="mt-4 flex flex-col gap-4">
          {error && (
            <>
              <div className="bg-primary rounded px-4 py-1.5">
                <p className="text-white text-sm">
                  There was a problem with your purchase. Please try again with
                  a new card.
                </p>
              </div>
              <div className="border rounded px-2 py-4 border-gray-500">
                <CardElement
                  options={{
                    style: {
                      base: {
                        fontSize: "16px",
                        color: "#fff",
                        "::placeholder": {
                          color: "#aab7c4",
                        },
                      },
                      invalid: {
                        color: "#9e2146",
                      },
                    },
                  }}
                />
              </div>
            </>
          )}
          {/* <h3 className="text-lg font-bold text-white">{product.name}</h3> */}
          <div className="flex flex-col md:flex-row items-center justify-between rounded-md bg-white p-2 form-input">
            <div className="flex items-center gap-2 mb-2 md:mb-0">
              <div style={{ position: "relative", top: "-1px" }}>
                <ShopThickSVG />
              </div>
              <p className="text-lg text-white">{product.name}</p>
            </div>
            <div>
              <button
                disabled={isProcessing}
                onClick={handlePurchase}
                className="rounded bg-primary px-4 py-2 text-white"
              >
                {isProcessing
                  ? "Processing... "
                  : formatPriceWithCents(
                      price.unit_amount,
                      price.type,
                      price.recurring
                    )}
              </button>
            </div>
          </div>
        </div>
      </div>
    </Modal>
  );
};

export default UnlockAccessModal;
