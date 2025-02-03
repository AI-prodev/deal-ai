import { useEffect, useState } from "react";
import { useStripe, useElements, CardElement } from "@stripe/react-stripe-js";
import Modal from "@/components/Modal";
import { useSession } from "next-auth/react";
import { createDomainApi } from "@/store/features/domainApi";

interface CheckoutFormProps {
  isOpenForm: boolean;
  setOpenForm: any;
  setPaid: any;
  paid: boolean;
  setSubID: any;
  setIsProcessing: any;
  isProcessing: boolean;
}

const CheckoutForm: React.FC<CheckoutFormProps> = ({
  isOpenForm,
  setOpenForm,
  paid,
  setPaid,
  setSubID,
  setIsProcessing,
  isProcessing,
}) => {
  const domain = localStorage.getItem("domain");
  const { data: session } = useSession();
  const stripe = useStripe();
  const elements = useElements();
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [createNewSubscription] =
    createDomainApi.useCreateNewSubscriptionMutation();
  const { data: getPrice } = createDomainApi.useGetPriceQuery(
    { domain: domain || "" },
    { skip: !domain }
  );
  const handleSubmit = async (e: any) => {
    e.preventDefault();

    if (!stripe || !elements) return;

    setIsProcessing(true);

    // Collect payment details using CardElement
    const cardElement = elements.getElement(CardElement);

    if (!cardElement) {
      setIsProcessing(false);
      setErrorMessage("Card element not found");
      return;
    }

    try {
      const { paymentMethod, error } = await stripe.createPaymentMethod({
        type: "card",
        card: cardElement,
      });

      if (error) {
        setErrorMessage(error.message || "An error occurred");
        setIsProcessing(false);
        return;
      }

      // Send the paymentMethod ID to your server
      await handlePaymentMethod(paymentMethod?.id || "");
    } catch (error: any) {
      setErrorMessage(error.message || "An error occurred");
    }
  };

  const handlePaymentMethod = async (paymentMethod: string) => {
    const email = session?.user.email ?? "";
    try {
      const response = await createNewSubscription({
        email: email,
        payment_method: paymentMethod,
        domain: domain || "",
      });
      if ("data" in response) {
        setPaid(domain);
        setSubID(response.data.subscriptionId);
      }
      if ("error" in response) {
        setOpenForm(!isOpenForm);
        setIsProcessing(false);
      }
      localStorage.removeItem("domain");
    } catch (error: any) {
      setErrorMessage(error.message || "An error occurred");
    }
  };

  const handleClose = () => {
    setOpenForm(!isOpenForm);
    localStorage.removeItem("domain");
  };

  const formatPriceWithCents = (amount: any) => {
    const dollars = Math.floor(amount / 100);
    const cents = amount % 100;

    return `$${dollars}.${cents.toString().padStart(2, "0")}`;
  };

  return (
    <Modal isOpen={isOpenForm} onRequestClose={handleClose}>
      <form id="payment-form" onSubmit={handleSubmit}>
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
      </form>
      <div className="flex justify-end gap-4">
        <button
          type="button"
          onClick={handleClose}
          className="mt-10 rounded border border-primary px-4 py-2 text-primary"
        >
          Cancel
        </button>
        <button
          form="payment-form"
          disabled={isProcessing}
          id="submit"
          className="mt-10 rounded-lg bg-primary px-4 py-2"
        >
          <span className="text-white">
            {getPrice && (
              <span className="text-white">
                {isProcessing
                  ? "Processing... "
                  : formatPriceWithCents(getPrice)}
              </span>
            )}
          </span>
        </button>
      </div>
      {errorMessage && <div id="payment-message">{errorMessage}</div>}
    </Modal>
  );
};

export default CheckoutForm;
