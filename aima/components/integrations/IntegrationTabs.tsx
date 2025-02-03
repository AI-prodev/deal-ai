import IntegrationStripe from "@/components/integrations/stripe/IntegrationStripe";
import IntegrationSendgrid from "@/components/integrations/sendgrid/IntegrationSendgrid";
import Tabs from "@/components/Tabs";
import React from "react";
import { SendgridSVG, StripeSVG } from "@/components/icons/SVGData";

export enum IntegrationType {
  "STRIPE" = "STRIPE",
  "SENDGRID" = "SENDGRID",
}

const tabs = [
  {
    title: "Stripe",
    url: "/integrations/stripe",
    type: IntegrationType.STRIPE,
    icon: StripeSVG,
  },
  {
    title: "SendGrid",
    url: "/integrations/sendgrid",
    type: IntegrationType.SENDGRID,
    icon: SendgridSVG,
  },
];

interface Props {
  activeTab: string;
}

const IntegrationTabs: React.FC<Props> = ({ activeTab }) => {
  return (
    <>
      <div className="mt-4">
        <Tabs items={tabs} activeTab={activeTab} />
      </div>
      <div className="mt-4">
        {activeTab === IntegrationType.STRIPE ? <IntegrationStripe /> : null}
        {activeTab === IntegrationType.SENDGRID ? (
          <IntegrationSendgrid />
        ) : null}
      </div>
    </>
  );
};

export default IntegrationTabs;
