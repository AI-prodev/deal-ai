import React, { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { showSuccessToast, showErrorToast } from "@/utils/toast";
import { createDomainApi } from "@/store/features/domainApi";
import { FetchBaseQueryError } from "@reduxjs/toolkit/query/react";
import { SerializedError } from "@reduxjs/toolkit";

interface StripeButtonProps {
  setOpenForm: React.Dispatch<React.SetStateAction<boolean>>;
  isOpenForm: boolean;
  onRequestClose: () => void;
  handleModalClose: () => void;
  setPaid: any;
  paid: boolean;
  domain: string;
  setSubID: any;
  isProcessing: boolean;
  setIsProcessing: (isProcessing: boolean) => void;
}

const StripeButton: React.FC<StripeButtonProps> = ({
  domain,
  setOpenForm,
  paid,
  setPaid,
  isOpenForm,
  onRequestClose,
  handleModalClose,
  setSubID,
  isProcessing,
  setIsProcessing,
}) => {
  const { data: session } = useSession();
  const [error, setError] = useState("");
  const [createSubscription] = createDomainApi.useCreateSubscriptionMutation();
  const { data: getPrice } = createDomainApi.useGetPriceQuery({ domain });

  const payHandler = async () => {
    try {
      setIsProcessing(true);
      const token = session?.token || "";
      const userEmail = session?.user.email || "";
      const response = await createSubscription({
        token: token,
        domain: domain,
        email: userEmail,
      });
      if ("data" in response) {
        handleSuccess(response);
      } else if ("error" in response) {
        handleError(response);
      }
    } catch (error) {
      setError("Error creating subscription");
      setIsProcessing(false);
    }
  };

  const handleSuccess = (response: any) => {
    const subscriptionId = response.data.subscriptionId;
    setPaid(domain);
    setSubID(subscriptionId);
  };

  const handleError = (response: any) => {
    const errorStatus = (response.error as { status?: number })?.status;

    if (errorStatus === 404) {
      handle404Error();
    } else if ("error" in response) {
      const errorData = (response.error as { data?: any })?.data;
      handleOtherError(errorData.error);
    }
  };

  const handle404Error = () => {
    localStorage.setItem("domain", domain);
    setIsProcessing(false);
    setOpenForm(!isOpenForm);
    onRequestClose();
    handleModalClose();
  };

  const handleOtherError = (errorData: any) => {
    setIsProcessing(false);
    onRequestClose();
    handleModalClose();
    showErrorToast(errorData);
  };

  const formatPriceWithCents = (amount: any) => {
    const dollars = Math.floor(amount / 100);
    const cents = amount % 100;

    return `$${dollars}.${cents.toString().padStart(2, "0")} / year`;
  };

  return (
    <>
      {getPrice && (
        <button
          disabled={isProcessing}
          onClick={payHandler}
          className="rounded bg-primary px-4 py-2 text-white"
        >
          <span className="text-white">
            {isProcessing ? "Processing... " : formatPriceWithCents(getPrice)}
          </span>
        </button>
      )}
      {error && <div>{error}</div>}
    </>
  );
};

export default StripeButton;
