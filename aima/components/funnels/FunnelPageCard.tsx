import React, { Dispatch, SetStateAction } from "react";
import type { CSSProperties } from "react";
import { IPage } from "@/interfaces/IPage";
import { ThreeBarsSVG } from "@/components/icons/SVGData";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import clsx from "clsx";

const FunnelPageCard = ({
  isLightMode = false,
  page,
  type,
  selectedPage,
  setSelectedPage,
}: {
  isLightMode?: boolean;
  page: IPage;
  type: "menu" | "page";
  selectedPage: IPage | null;
  setSelectedPage: Dispatch<SetStateAction<any>>;
}) => {
  const {
    attributes,
    isDragging,
    listeners,
    setNodeRef,
    transform,
    transition,
  } = useSortable({ id: `${type}_${page._id}` });

  const style: CSSProperties = {
    opacity: isDragging ? 0.4 : undefined,
    transform: CSS.Translate.toString(transform),
    transition,
  };

  return (
    <div
      className={clsx("w-full rounded border p-4 mb-2 mr-2 cursor-pointer", {
        "bg-white-light text-black":
          selectedPage?._id === page._id && isLightMode,
        "bg-white text-[#3b3f5c]":
          (selectedPage?._id !== page._id && isLightMode) ||
          (selectedPage?._id === page._id && !isLightMode),
        "bg-[#191e3a] text-white-light":
          selectedPage?._id !== page._id && !isLightMode,
        "shadow-[4px_6px_10px_-3px_#bfc9d4] border-white-light": isLightMode,
        "shadow-none border-[#1b2e4b]": !isLightMode,
      })}
      onClick={() => setSelectedPage(page)}
      ref={setNodeRef}
      style={style}
    >
      <div className="flex items-center">
        <div
          {...attributes}
          {...listeners}
          ref={setNodeRef}
          className="cursor-grab"
        >
          <ThreeBarsSVG />
        </div>
        <h5 className="ml-3 text-xl font-semibold overflow-hidden whitespace-nowrap overflow-ellipsis">
          {page.title || page.funnelStep || ""}
        </h5>
      </div>
    </div>
  );
};

export default FunnelPageCard;
