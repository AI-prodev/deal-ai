import { format } from "date-fns";
import Link from "next/link";
import React, { useState } from "react";
import { GlobeSVG, QuestionSVG, TrashSVG } from "@/components/icons/SVGData";
import { IDomain } from "@/interfaces/IDomain";
import { createDomainApi } from "@/store/features/domainApi";
import DomainInstructionsModal from "./DomainInstructionsModal";
import { useSession } from "next-auth/react";

const DomainCard = ({
  domain,
  onChange,
}: {
  domain: IDomain;
  onChange: () => void;
}) => {
  const [deleteDomain] = createDomainApi.useDeleteDomainMutation();
  const [autoRenew, setAutoRenew] = useState(domain.autoRenew);
  const [isDomainInstructionsOpen, setIsDomainInstructionsOpen] =
    useState(false);
  const [autoRenewQuery] = createDomainApi.useAutoRenewMutation();
  const [cancelSubscription] = createDomainApi.useCancelSubscriptionMutation();
  const { data: session } = useSession();

  const handleDomainInstructionsClose = () => {
    setIsDomainInstructionsOpen(false);
  };

  const handleDomainInstructionsOpen = () => {
    setIsDomainInstructionsOpen(true);
  };

  const handleDelete = async () => {
    if (!confirm("Are you sure you want to remove this domain?")) {
      return;
    }
    await deleteDomain({ domainId: domain._id });
    onChange();
  };

  const handleUpdate = async (id: any, autoRenew: any) => {
    const domainId = id;

    try {
      const response = await autoRenewQuery({ domainId, autoRenew });

      if ("error" in response) {
        console.error("Fetch error:", response.error);
      } else {
        if (response.data && response.data.error) {
          throw new Error(`Error in response data: ${response.data.error}`);
        }
      }
    } catch (error: any) {
      console.error("Error:", error.message || "An error occurred");
    }
  };

  const handleAutoRenewChange = async () => {
    const newAutoRenewValue = !autoRenew;
    const token = session?.token || "";
    setAutoRenew(newAutoRenewValue);
    await cancelSubscription({
      domain: domain._id,
      token: token,
      isRenew: newAutoRenewValue,
      domainName: domain.domain,
    });
    await handleUpdate(domain._id, newAutoRenewValue);
  };

  return (
    <>
      <div className="w-full rounded border border-white-light bg-white shadow-[4px_6px_10px_-3px_#bfc9d4] dark:border-[#1b2e4b] dark:bg-[#191e3a] dark:shadow-none">
        <div className="flex flex-col items-center justify-between py-4 px-6 md:flex-row">
          <div className="flex items-center">
            <GlobeSVG />
            <h5 className="ml-3 text-xl font-semibold text-[#3b3f5c] dark:text-white-light">
              {domain.domain}
            </h5>
          </div>
          <div className="mt-2 flex text-white-dark items-center sm:mt-0">
            <Link
              href=""
              className="flex items-center"
              onClick={e => {
                handleDomainInstructionsOpen();
                e.preventDefault();
              }}
            >
              <QuestionSVG />
              <div className="ml-2">Instructions</div>
            </Link>
            {domain.external && (
              <Link
                href=""
                className="ml-2 flex items-center mb-0"
                onClick={e => {
                  handleDelete();
                  e.preventDefault();
                }}
              >
                <TrashSVG />
                <div className="ml-2">Remove</div>
              </Link>
            )}
            {!domain.external && (
              <label className="relative ml-6 inline-flex cursor-pointer items-center mb-0">
                <input
                  type="checkbox"
                  checked={autoRenew}
                  onChange={handleAutoRenewChange}
                  className="peer sr-only"
                />
                <div className="after:start-[2px] peer h-6 w-11 rounded-full bg-gray-200 after:absolute after:top-[2px] after:h-5 after:w-5 after:rounded-full after:border after:border-gray-300 after:bg-white after:transition-all after:content-[''] peer-checked:bg-blue-600 peer-checked:after:translate-x-full peer-checked:after:border-white peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rtl:peer-checked:after:-translate-x-full dark:border-gray-600 dark:bg-gray-700 dark:peer-focus:ring-blue-800"></div>
                <span className="ms-3 ml-2 text-sm font-medium text-gray-900 dark:text-gray-300">
                  Auto renew
                </span>
              </label>
            )}
            {!domain.external && (
              <Link key={domain._id} href={`/domains/${domain._id}`}>
                <button className="ml-4">Edit</button>
              </Link>
            )}
          </div>
        </div>
      </div>
      <DomainInstructionsModal
        domain={domain}
        isOpen={isDomainInstructionsOpen}
        onRequestClose={handleDomainInstructionsClose}
      />
    </>
  );
};

export default DomainCard;
