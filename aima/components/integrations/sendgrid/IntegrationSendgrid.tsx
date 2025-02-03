import { useGetIntegrationsQuery } from "@/store/features/integrationsApi";
import IntegrationSendgridCard from "@/components/integrations/sendgrid/IntegrationSendgridCard";

export type SendgridAccountType = {
  _id: string;
  type: "sendgrid";
  data: {
    apiKey: string;
    email: string;
    first_name: string;
    last_name: string;
    state?: string;
    city?: string;
    company?: string;
    country?: string;
    phone?: string;
  };
};

const IntegrationSendgrid = () => {
  const { data: accounts, isFetching } = useGetIntegrationsQuery("sendgrid");

  return (
    <div>
      {accounts?.map((account: SendgridAccountType) => (
        <IntegrationSendgridCard
          account={account}
          isFetching={isFetching}
          key={account._id}
        />
      ))}
      <IntegrationSendgridCard account={null} isFetching={isFetching} />
    </div>
  );
};

export default IntegrationSendgrid;
