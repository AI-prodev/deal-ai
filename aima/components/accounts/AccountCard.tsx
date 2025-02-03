import { format } from "date-fns";
import Link from "next/link";
import React, { useState } from "react";
import { GlobeSVG, QuestionSVG, TrashSVG } from "@/components/icons/SVGData";
import { createDomainApi } from "@/store/features/domainApi";
import DomainInstructionsModal from "./DomainInstructionsModal";
import { IAccount } from "@/interfaces/IAccount";
import {
  useDeleteAccountMutation,
  useGetAccountsQuery,
  useUpdateAccountMutation,
} from "@/store/features/accountApi";

const AccountCard = ({ account }: { account: IAccount }) => {
  const [updateAccount, { isSuccess }] = useUpdateAccountMutation();

  const [deleteAccount] = useDeleteAccountMutation();

  const getAccountsQuery = useGetAccountsQuery();

  const handleCheckboxChange = async (businessId: string, status: boolean) => {
    // Implement your logic to handle checkbox changes here
    // For example, add/remove business from the selectedBusinesses array

    await updateAccount({ _id: businessId, isActive: !status });

    // If the update is successful, refetch the getAccounts query
    getAccountsQuery.refetch();
  };

  const handleDeleteAccount = async () => {
    if (!confirm("Are you sure you want to remove this Account?")) {
      return;
    }

    await deleteAccount({ accountId: account._id });

    // If the update is successful, refetch the getAccounts query
    getAccountsQuery.refetch();
  };

  return (
    <>
      <div className="w-full rounded border border-white-light bg-white shadow-[4px_6px_10px_-3px_#bfc9d4] dark:border-[#1b2e4b] dark:bg-[#191e3a] dark:shadow-none">
        <div className="py-4 px-6 flex flex-col md:flex-row justify-between items-center">
          <div className="flex items-center">
            <div
              className={`flex h-14 w-14 items-center justify-center  rounded-md object-cover text-lg text-white ${"bg-green-500"}`}
            >
              {account?.name?.slice(0, 1)}
            </div>
            <h5 className="ml-3 text-xl font-semibold text-[#3b3f5c] dark:text-white-light">
              {account.name}
            </h5>
          </div>

          <Link
            href=""
            className="ml-6 flex items-center"
            onClick={e => {
              handleDeleteAccount();
              e.preventDefault();
            }}
          >
            <TrashSVG />
            <div className="ml-2">Remove</div>
          </Link>
        </div>

        <div className="text-white-dark mt-2 sm:mt-0 flex-column items-end justify-end w-100 py-2">
          {account?.businesses?.map(business => (
            <div
              key={business?.name}
              className="flex items-center justify-start w-6/12 ml-16 py-2"
            >
              <input
                type="checkbox"
                checked={business?.isActive}
                onChange={() =>
                  handleCheckboxChange(business?._id, business?.isActive)
                }
              />

              <h5 className="ml-3 text-lg font-semibold text-[#3b3f5c] dark:text-white-light">
                {business?.name}
              </h5>
            </div>
          ))}
        </div>
      </div>
    </>
  );
};

export default AccountCard;
