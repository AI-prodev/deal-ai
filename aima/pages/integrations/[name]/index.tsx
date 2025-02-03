import React from "react";
import IntegrationTabs, {
  IntegrationType,
} from "@/components/integrations/IntegrationTabs";
import { useRouter } from "next/router";
import Head from "next/head";

const Integrations: React.FC = () => {
  const router = useRouter();
  const name = (router.query.name as string) || IntegrationType.STRIPE;

  return (
    <>
      <Head>
        <title>Integrations</title>
      </Head>
      <div className="p-3">
        <h2 className="text-2xl font-bold">Integrations</h2>
        <IntegrationTabs activeTab={name.toUpperCase()} />
      </div>
    </>
  );
};

export default Integrations;
