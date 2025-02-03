"use client";

import { PropsValue } from "react-select";
const Select = dynamic(() => import("react-select").then(mod => mod.default), {
  ssr: false,
  loading: () => null,
});
import React, { FC } from "react";
import { useListListsQuery } from "@/store/features/listApi";
import type { ILists } from "@/interfaces/Ilists";
import type { IOption } from "@/interfaces/IBroadcast";
import dynamic from "next/dynamic";

interface ISendEmailListsSelectProps {
  value: PropsValue<IOption>;
  setFieldValue: (field: string, value: any, shouldValidate?: boolean) => void;
  error: any;
}

const SendEmailListsSelect: FC<ISendEmailListsSelectProps> = ({
  value,
  setFieldValue,
  error,
}) => {
  const { data: lists } = useListListsQuery({});

  const listsOptions = lists?.results?.map((item: ILists) => ({
    value: item._id,
    label: item.title,
    numContacts: item.numContacts,
  }));

  const handleChangeSelect = (option: any): void => {
    setFieldValue(
      "sumListsContacts",
      option?.reduce(
        (total: number, item: Omit<ILists, "createdAt">) =>
          total + item.numContacts,
        0
      )
    );
    setFieldValue("lists", option);
  };

  return (
    <div className="custom-select custom-select-fields-bg">
      <Select
        name="lists"
        value={value}
        onChange={handleChangeSelect}
        isMulti
        options={[
          { label: "All Contacts", value: "All Contacts" },
          ...(listsOptions ?? []),
        ]}
        isSearchable={false}
        isClearable
        maxMenuHeight={250}
        menuPortalTarget={typeof window !== "undefined" ? document.body : null}
        placeholder="Select lists"
        menuPlacement="bottom"
        styles={{
          menuPortal: base => ({ ...base, zIndex: 9999 }),
          menu: provided => ({
            ...provided,
            backgroundColor: "#121e32",
            color: "#808080",
          }),
        }}
      />
      {error && <div className="mt-1 text-danger">{error}</div>}
    </div>
  );
};

export default SendEmailListsSelect;
