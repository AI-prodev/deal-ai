import SubscriptionManager from "@/components/settings/SubscriptionManager";
import { useAdminApiClient } from "@/hooks/useAdminApiClient";
import React from "react";

type Props = {};

const Settings = (props: Props) => {
  const { useGetStripePortalUrlsQuery } = useAdminApiClient("");

  const {
    data: subscriptionsData,
    error,
    isLoading,
    isFetching,
  } = useGetStripePortalUrlsQuery("");

  return (
    <div className="container mx-auto  p-4">
      <SubscriptionManager
        subscriptions={subscriptionsData}
        isLoading={isLoading}
        error={error}
      />
    </div>
  );
};

export default Settings;
