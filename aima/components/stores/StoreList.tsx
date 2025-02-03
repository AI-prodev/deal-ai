import React from "react";
import StoreCard from "./StoreCard";
import { IStore } from "@/interfaces/IStore";

interface Props {
  stores: IStore[];
}

const StoreList = ({ stores }: Props) => {
  return (
    <div className="grid gap-4 grid-cols-1 max-w-[780px]">
      {stores.map(store => (
        <StoreCard key={store._id} store={store} />
      ))}
    </div>
  );
};

export default StoreList;
