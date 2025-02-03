import {
  IAssistSettings,
  ITicket,
  TicketStatusEnum,
} from "@/interfaces/ITicket";
import clsx from "clsx";
import React from "react";

const Item = ({
  name,
  value,
  className,
}: {
  name: string;
  value?: string;
  className?: string;
}) => {
  return (
    <div className="flex items-center text-black">
      <span className="w-2/5 text-sm font-semibold">{name}</span>
      <span
        className={clsx(
          "w-3/5",
          "text-xs",
          "font-medium",
          "break-words",
          Array.isArray(className) ? className : [className]
        )}
      >
        {value}
      </span>
    </div>
  );
};

interface RightMenuProps {
  ticket: Omit<ITicket, "messages"> | null;
  settings?: IAssistSettings;
  open: boolean;
  onClose: VoidFunction;
}

const RightMenu = ({ ticket, settings, open, onClose }: RightMenuProps) => {
  const { _id, status, visitor } = ticket || {};
  return (
    <div
      className={clsx(
        "h-full transition-all duration-300 bg-white shadow-3xl absolute lg:static right-0 flex flex-col gap-4 pb-6",
        { "w-0": !open },
        { "w-full md:w-[35%] lg:[500px]": open }
      )}
    >
      <div
        className={`${open ? "flex" : "hidden"} items-center justify-between gap-2 py-4 px-4 min-h-16 border-b-[2.5px] border-b-[#ebedf2]`}
      >
        <span className="font-bold text-black text-lg">Details</span>
        <span
          onClick={onClose}
          className="border w-6 h-6 cursor-pointer rounded-full flex items-center justify-center"
        >
          <img alt={"close"} src={"/assets/assist/close.svg"} />
        </span>
      </div>
      <div
        className={`${open ? "flex" : "hidden"} flex-col px-4 gap-8 divide-y-2 overflow-y-auto overflow-x-hidden`}
      >
        <div className="flex flex-col gap-4">
          <h1 className="text-black font-bold">CONVERSATION ATTRIBUTES</h1>
          <Item name={"ID"} value={_id} />
          <Item
            name={"Status"}
            value={status}
            className={`font-[800] ${status === TicketStatusEnum.CLOSED ? "text-danger" : "text-success"}`}
          />
          <Item name={"Site Name"} value={settings?.name} />
          <Item name={"Site URL"} value={settings?.url} />
        </div>

        <div className="flex flex-col gap-4 pt-4">
          <h1 className="text-black font-bold">VISITOR DATA</h1>

          <Item name={"ID"} value={visitor?._id} />
          <Item name={"Name"} value={visitor?.name} />
          <Item name={"Email"} value={visitor?.email} />
          <Item name={"Language"} value={visitor?.language} />
          <Item name={"Location"} value={visitor?.location} />
        </div>
      </div>
    </div>
  );
};

export default RightMenu;
