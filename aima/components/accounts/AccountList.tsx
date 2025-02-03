import React from "react";
import DomainCard from "./AccountCard";
import { IAccount } from "@/interfaces/IAccount";
import AccountCard from "./AccountCard";

const AccountList = ({ accounts }: { accounts: IAccount[] }) => {
  return (
    <div className="mb-5 mt-6 grid gap-4 grid-cols-1 max-w-[780px]">
      {accounts &&
        accounts?.map(account => (
          <AccountCard key={account._id} account={account} />
        ))}
    </div>
  );
};

export default AccountList;
