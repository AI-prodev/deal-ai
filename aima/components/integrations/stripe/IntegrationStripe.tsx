import React from "react";
import IntegrationStripeList from "@/components/integrations/stripe/IntegrationStripeList";
import {
  useCreateStripeConnectMutation,
  useGetConnectedStripeAccountsQuery,
} from "@/store/features/integrationsApi";
import { showErrorToast } from "@/utils/toast";

const IntegrationStripe = () => {
  const [connectStripe] = useCreateStripeConnectMutation();
  const { data: accounts, isFetching } = useGetConnectedStripeAccountsQuery();

  const handleConnectStripe = async () => {
    try {
      const { url } = await connectStripe().unwrap();
      if (url) {
        window.open(url, "_self");
      }
    } catch (e) {
      showErrorToast("Integration Error");
    }
  };

  if (isFetching) {
    return <div className="m-4">Loading...</div>;
  }

  return (
    <div>
      <div className="mt-4 w-full max-w-lg">
        <h2 className="text-white">Connect your stripe account.</h2>
      </div>
      {!!accounts?.length && <IntegrationStripeList accounts={accounts} />}
      <div className="mt-6 flex justify-start">
        <button
          className="rounded bg-primary px-4 py-2 text-white"
          onClick={handleConnectStripe}
        >
          + Connect with Stripe
        </button>
      </div>
    </div>
  );
};

export default IntegrationStripe;
