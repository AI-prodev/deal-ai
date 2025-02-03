import React from "react";
import {
  useCheckEmailSubscribeStatusQuery,
  useUpdateEmailSubscribeStatusMutation,
} from "@/store/features/broadcastApi";
import { useRouter } from "next/router";
import LoadingAnimation from "@/components/LoadingAnimation";
import LoadingSpinner from "@/components/LoadingSpinner";
import Error from "@/components/crm/Error";
import { showErrorToast, showSuccessToast } from "@/utils/toast";
import BlankLayout from "@/components/Layouts/BlankLayout";
import Footer from "@/components/Layouts/Footer";
import { SUBSCRIBER_COPY } from "@/components/crm/constants";

const Unsubscribe = () => {
  const { query } = useRouter();
  const contactId = query?.contactId as string;

  const {
    data,
    isLoading: isCheckEmailSubscribeStatusLoading,
    error,
  } = useCheckEmailSubscribeStatusQuery({ contactId }, { skip: !contactId });
  const [
    updateEmailSubscribeStatus,
    { isLoading: isUpdateEmailSubscribeStatusLoading },
  ] = useUpdateEmailSubscribeStatusMutation();

  const isLoading = isCheckEmailSubscribeStatusLoading || !contactId;
  const isSubscribed = data?.unsubscribed ?? false;
  const unsubscribedOrSubscribed = isSubscribed
    ? SUBSCRIBER_COPY.unsubscribeOrResubscribe.unsubscribed
    : SUBSCRIBER_COPY.unsubscribeOrResubscribe.subscribed;
  const subscribeMessageCopy = isSubscribed
    ? SUBSCRIBER_COPY.message.unsubscribed
    : SUBSCRIBER_COPY.message.subscribed;

  const toggleUnsubscribe = (): void => {
    updateEmailSubscribeStatus({
      contactId,
      unsubscribed: !isSubscribed,
    })
      .then((res: any) => {
        if (res.error) {
          showErrorToast(
            res.error?.data?.error || isSubscribed
              ? "Failed to resubscribe"
              : "Failed to unsubscribe"
          );
          return;
        }

        showSuccessToast({
          title: isSubscribed
            ? "Resubscribed successfully"
            : "Unsubscribed successfully",
        });
      })
      .catch(() => {
        showErrorToast(
          isSubscribed ? "Failed to resubscribe" : "Failed to unsubscribe"
        );
      });
  };

  return (
    <>
      <div className="p-6">
        {isLoading ? (
          <LoadingAnimation className="max-w-[9rem] !block mx-auto" />
        ) : // prettier-ignore
        //@ts-ignore
        error ? <Error message={error?.data?.error || "Something went wrong, please try again"}/> : (
            <>
              <h2 className="text-2xl font-bold mb-4.5">{unsubscribedOrSubscribed}</h2>
              <p className="text-base mb-1">{subscribeMessageCopy}</p>
              <p className="text-base">Your request will be processed within 48 hours.</p>
              <button
                className="min-w-[200px] rounded bg-primary px-10 py-2 text-white mt-4.5 disabled:bg-opacity-70"
                disabled={isUpdateEmailSubscribeStatusLoading}
                onClick={toggleUnsubscribe}
              >
                {!isUpdateEmailSubscribeStatusLoading && unsubscribedOrSubscribed}
                {isUpdateEmailSubscribeStatusLoading && <LoadingSpinner/>}
              </button>
            </>
          )}
      </div>
      <div className="absolute bottom-0 main-containter w-full">
        <div className="main-content">
          <Footer />
        </div>
      </div>
    </>
  );
};

Unsubscribe.getLayout = (page: any) => {
  return <BlankLayout>{page}</BlankLayout>;
};

export default Unsubscribe;
