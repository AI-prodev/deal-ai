import React from "react";
import DomainCard from "./DomainCard";
import { IDomain } from "@/interfaces/IDomain";

const DomainList = ({
  domains,
  onChange,
}: {
  domains: IDomain[];
  onChange: () => void;
}) => {
  return (
    <div className="mb-5 mt-6 grid gap-4 grid-cols-1 max-w-[780px]">
      {domains.map(domain => (
        <DomainCard key={domain._id} domain={domain} onChange={onChange} />
      ))}
    </div>
  );
};

export default DomainList;
