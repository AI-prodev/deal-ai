import React from "react";
import { IIntegrationStripeAccounts } from "@/interfaces/IIntegrations";
import IntegrationStripeCard from "./IntegrationStripeCard";

const IntegrationStripeList: React.FC<{
  accounts: IIntegrationStripeAccounts[];
}> = ({ accounts }) => (
  <div className="mb-5 mt-6 flex flex-col max-w-[522px]">
    {accounts.map(account => (
      <IntegrationStripeCard key={account._id} account={account.data} />
    ))}
  </div>
);

export default IntegrationStripeList;
