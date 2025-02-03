import React from "react";
import { IIntegrationStripeAccountsInfo } from "@/interfaces/IIntegrations";
import { showErrorToast, showSuccessToast } from "@/utils/toast";
import { useDeleteStripeAccountMutation } from "@/store/features/integrationsApi";

const IntegrationStripeCard: React.FC<{
  account: IIntegrationStripeAccountsInfo;
}> = ({ account }) => {
  const [deleteAccount] = useDeleteStripeAccountMutation();
  const handleDelete = async (id: string) => {
    const confirmation = prompt(
      `Are you sure you want to remove this account? Doing so will cause products in funnels that use this account to be non-purchasable. Type REMOVE to confirm.`
    );
    if (!confirmation) {
      return;
    }
    if (confirmation !== "REMOVE") {
      alert("You must type REMOVE to continue.");
      return;
    }
    try {
      await deleteAccount(id);
      showSuccessToast({ title: "Account deleted successfully" });
    } catch (e) {
      showErrorToast("Something went wrong. Please try again.");
    }
  };

  return (
    <div className="flex mb-5 items-center justify-center">
      <div className="w-full rounded border border-white-light bg-white shadow-[4px_6px_10px_-3px_#bfc9d4] dark:border-[#1b2e4b] dark:bg-[#191e3a] dark:shadow-none">
        <div className="py-1 px-6 flex flex-col md:flex-row justify-between items-center">
          <div className="flex items-center">
            <h5 className="ml-3 text-lg font-semibold text-[#3b3f5c] dark:text-white-light">
              {account.accountId}
            </h5>
          </div>
          <div className="text-white-dark mt-2 sm:mt-0 flex">
            <span
              className={`badge whitespace-nowrap ${
                account.completed ? "bg-primary" : "bg-danger"
              }`}
            >
              {account.completed ? "Enabled" : "Restricted"}
            </span>
          </div>
        </div>
      </div>
      <button
        type="button"
        className="mx-2 w-[32px] h-[32px] flex items-center justify-center rounded-full bg-red-500 p-2  text-white hover:bg-red-600 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2"
        aria-label="Remove field"
        onClick={() => handleDelete(account.accountId)}
      >
        <svg
          className="h-5 w-5"
          fill="none"
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth="2"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path d="M6 18L18 6M6 6l12 12"></path>
        </svg>
      </button>
    </div>
  );
};

export default IntegrationStripeCard;
