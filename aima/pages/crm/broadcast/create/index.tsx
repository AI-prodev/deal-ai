import React from "react";
import SendEmail from "@/components/crm/broadcast/SendEmail";
import {
  CRMBroadcastType,
  SendEmailErrorType,
  SendEmailMode,
} from "@/components/crm/constants";
import { useGetIntegrationsQuery } from "@/store/features/integrationsApi";
import BroadcastTabsWrapper from "@/components/crm/broadcast/BroadcastTabsWrapper";
import { useGetBusinessDetailsQuery } from "@/store/features/profileApi";

const Create = () => {
  const { data: accounts, isFetching: isGetIntegrationsFetching } =
    useGetIntegrationsQuery("sendgrid");
  const { data: businessDetails, isFetching: isGetBusinessDetailsFetching } =
    useGetBusinessDetailsQuery({});

  const { businessAddress, businessName } = businessDetails || {};
  const { addressStreet, addressZipCode, addressCountry } =
    businessAddress || {};

  const hasBusinessAddress =
    businessName && addressStreet && addressZipCode && addressCountry;
  const hasBusinessAddressError =
    !hasBusinessAddress && !isGetBusinessDetailsFetching;

  const sendGridApiKeyError =
    !accounts?.length &&
    !isGetIntegrationsFetching &&
    SendEmailErrorType.SEND_GRID_API_KEY;
  const businessDetailsError =
    hasBusinessAddressError && SendEmailErrorType.BUSINESS_DETAILS;

  return (
    <BroadcastTabsWrapper
      activeTab={CRMBroadcastType.CREATE}
      sendGridApiKeyError={sendGridApiKeyError}
      businessDetailsError={businessDetailsError}
    >
      <SendEmail mode={SendEmailMode.CREATE} />
    </BroadcastTabsWrapper>
  );
};

export default Create;
