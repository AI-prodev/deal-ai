import PageGeneratorForms from "@/components/pageGenerator/Forms";
import withAuth from "@/helpers/withAuth";
import { USER_ROLES } from "@/utils/roles";
import React, { useEffect, useState } from "react";
import { PageResults } from "@/components/pageGenerator/PageResults";
import { format } from "date-fns";
import Link from "next/link";
import { useRouter } from "next/router";
import { BuildingSVG, GlobeSVG } from "@/components/apollo/Svg/SvgData";
import DomainList from "@/components/domains/DomainList";
import { createDomainApi } from "@/store/features/domainApi";
import NewDomainModal from "@/components/domains/NewDomainModal";
import RegisterDomainModal from "@/components/domains/RegisterDomainModal";
import { showErrorToast, showSuccessToast } from "@/utils/toast";
import { Elements } from "@stripe/react-stripe-js";
import { loadStripe } from "@stripe/stripe-js";
import CheckoutForm from "@/components/domains/CheckoutForm";
import { useSession } from "next-auth/react";
import { useDispatch } from "react-redux";
import { setPageTitle } from "@/store/themeConfigSlice";

type Props = {};

const Domains = (props: Props) => {
  const dispatch = useDispatch();

  useEffect(() => {
    dispatch(setPageTitle("Domains"));
  }, [dispatch]);

  const [isNewDomainModalOpen, setIsNewDomainModalOpen] = useState(false);
  const [isRegisterDomainModalOpen, setIsRegisterDomainModalOpen] =
    useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [domainInfo, setDomainInfo] = useState<any | null>(null);
  const [notAvailable, seIsAvailable] = useState(false);
  const [isExists, setIsExists] = useState(false);
  const [isOpenForm, setOpenForm] = useState(false);
  const [paid, setPaid] = useState<any>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [subID, setSubID] = useState("");
  const [stripePromise, setStripePromise] = useState<any | null>(null);
  const { data: dnToken } = createDomainApi.useGetTokenQuery({});
  const [createDomain] = createDomainApi.useCreateDomainMutation();
  const [registerDomains] = createDomainApi.useRegisterDomainMutation();
  const { data: domains, refetch: refetchDomains } =
    createDomainApi.useGetMyDomainsQuery({});
  const { data: session } = useSession();

  const handleNewDomainModalClose = () => {
    setIsNewDomainModalOpen(false);
  };

  const handleNewDomainModalOpen = () => {
    setIsNewDomainModalOpen(true);
  };

  const handleRegisterDomainModalOpen = () => {
    seIsAvailable(true);
    setIsExists(true);
    setIsRegisterDomainModalOpen(true);
  };

  useEffect(() => {
    const initializeStripe = async () => {
      if (dnToken?.PublishableKey) {
        const stripeInstance = await loadStripe(dnToken.PublishableKey);
        setStripePromise(stripeInstance);
      }
    };
    initializeStripe();
  }, [dnToken?.PublishableKey]);

  useEffect(() => {
    const registerDomain = async (domain: any) => {
      try {
        setIsLoading(true);
        const token = session?.token || "";
        const response = await registerDomains({ domain, token });

        if ("data" in response) {
          if (response.data) {
            const addDomain = async (domainName: any) => {
              setIsLoading(false);
              await createDomain({
                domain: domainName,
                external: false,
                subscriptionId: subID,
              }).unwrap();
              const message = "Domain Added successfully";
              showSuccessToast({ title: message });
              refetchDomains();
            };
            addDomain(domain);
            setIsProcessing(false);
            setOpenForm(false);
            setIsRegisterDomainModalOpen(false);
            setDomainInfo("");
          } else {
            setIsLoading(false);
            showErrorToast(response.data);
          }
        } else if ("error" in response) {
          if (response.error) {
          } else {
            setIsLoading(false);
            showErrorToast(response.error);
          }
        }
      } catch (error) {
        setIsLoading(false);
        console.error("Error fetching domain availability:", error);
      }
    };

    if (paid) {
      registerDomain(paid);
    }
  }, [paid]);

  if (!domains) {
    return <></>;
  }

  return (
    <>
      <div className="p-3">
        <div className="my-3 flex items-center pt-2">
          <GlobeSVG />
          <h2 className="ml-3 text-2xl font-bold">Domains</h2>
        </div>
        <NewDomainModal
          isOpen={isNewDomainModalOpen}
          onRequestClose={handleNewDomainModalClose}
          onDomainCreated={refetchDomains}
        />
        <RegisterDomainModal
          setIsProcessing={setIsProcessing}
          isProcessing={isProcessing}
          setPaid={setPaid}
          setSubID={setSubID}
          paid={paid}
          isOpenForm={isOpenForm}
          setOpenForm={setOpenForm}
          notAvailable={notAvailable}
          seIsAvailable={seIsAvailable}
          isExists={isExists}
          setIsExists={setIsExists}
          isOpen={isRegisterDomainModalOpen}
          onRequestClose={() => setIsRegisterDomainModalOpen(false)}
          onDomainCreated={refetchDomains}
          setDomainInfo={setDomainInfo}
          domainInfo={domainInfo}
        />
        <DomainList domains={domains} onChange={refetchDomains} />
        <div className="mt-6 flex justify-start gap-4">
          <button
            onClick={handleNewDomainModalOpen}
            className="rounded bg-primary px-4 py-2 text-white"
          >
            + Add Existing Domain
          </button>
          <button
            onClick={handleRegisterDomainModalOpen}
            className="rounded bg-primary px-4 py-2 text-white"
          >
            + Register New Domain
          </button>
          {/* <Payment/> */}
        </div>
      </div>
      {isOpenForm && (
        <Elements stripe={stripePromise}>
          <CheckoutForm
            setIsProcessing={setIsProcessing}
            isProcessing={isProcessing}
            setSubID={setSubID}
            isOpenForm={isOpenForm}
            setOpenForm={setOpenForm}
            setPaid={setPaid}
            paid={paid}
          />
        </Elements>
      )}
    </>
  );
};

export default withAuth(Domains, USER_ROLES, "ai-platform");
