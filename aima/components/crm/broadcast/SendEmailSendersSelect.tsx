import React from "react";
import dynamic from "next/dynamic";
import { PropsValue } from "react-select";
import { useGetEmailSendersQuery } from "@/store/features/broadcastApi";
import type { IOption } from "@/interfaces/IBroadcast";
const Select = dynamic(() => import("react-select").then(mod => mod.default), {
  ssr: false,
  loading: () => null,
});

interface ISendEmailSendersSelectProps {
  value: PropsValue<any>;
  setFieldValue: (field: string, value: any, shouldValidate?: boolean) => void;
  error: any;
  sendGridAccountId: string;
}

const SendEmailSendersSelect = ({
  value,
  setFieldValue,
  error,
  sendGridAccountId,
}: ISendEmailSendersSelectProps) => {
  const {
    data: emailSenders,
    isFetching,
    isLoading,
  } = useGetEmailSendersQuery(
    { sendGridAccountId },
    { skip: !sendGridAccountId }
  );

  const sendersOptions = emailSenders?.map(item => ({
    value: item?.from?.email,
    label: `${item?.from?.email} ${item?.verified?.status ? "" : "(unverified)"}`,
    from: item?.from,
    verified: item?.verified?.status,
  }));

  const handleChangeSelect = (option: any): void => {
    setFieldValue("from", option?.from);
    setFieldValue("verified", option?.verified);
    setFieldValue("sender", option ? option.value : "");
  };

  return (
    <div className="custom-select custom-select-fields-bg">
      <Select
        name="sender"
        value={sendersOptions?.find(
          (option: IOption) => option?.value === value
        )}
        onChange={handleChangeSelect}
        isDisabled={!sendGridAccountId || isFetching || isLoading}
        isLoading={isFetching || isLoading}
        options={sendersOptions ?? []}
        isSearchable={false}
        isClearable
        maxMenuHeight={250}
        placeholder="Select sender"
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

export default SendEmailSendersSelect;
