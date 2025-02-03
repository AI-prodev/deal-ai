import React, { useEffect, useState } from "react";
import type { CSSProperties } from "react";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
// import { format } from 'date-fns'
import Link from "next/link";
import { getSession } from "next-auth/react";
import { IFunnel } from "@/interfaces/IFunnel";
import { IProject } from "@/interfaces/IProject";
import { IPage } from "@/interfaces/IPage";
import { createPageApi } from "@/store/features/pageApi";
import {
  ArrowTopRightSVG,
  EyeSVG,
  GearSVG,
  PencilSquareSVG,
  ThreeBarsSVG,
  TrashSVG,
} from "@/components/icons/SVGData";
import PageSettingsModal from "./PageSettingsModal";

const PageCard = ({
  project,
  funnel,
  page,
  onUpdate,
}: {
  project: IProject | undefined;
  funnel: IFunnel;
  page: IPage;
  onUpdate: () => void;
}) => {
  const { refetch: refetchPages } = createPageApi.useGetFunnelPagesQuery({
    funnelId: funnel._id,
  });

  const [isPageSettingsModalOpen, setIsPageSettingsModalOpen] = useState(false);

  const {
    attributes,
    isDragging,
    listeners,
    setNodeRef,
    transform,
    transition,
  } = useSortable({ id: page._id });

  const style: CSSProperties = {
    opacity: isDragging ? 0.4 : undefined,
    transform: CSS.Translate.toString(transform),
    transition,
  };

  const handlePageSettingsModalClose = () => {
    setIsPageSettingsModalOpen(false);
  };

  const handlePageSettingsModalOpen = () => {
    setIsPageSettingsModalOpen(true);
  };

  useEffect(() => {
    getSession().then(session => {
      if (session?.token) {
        localStorage.setItem("sessionToken", session.token);
      }
    });
  }, []);

  return (
    <>
      <PageSettingsModal
        isOpen={isPageSettingsModalOpen}
        onRequestClose={handlePageSettingsModalClose}
        onPageSettingsUpdated={refetchPages}
        page={page}
      />
      <div
        className="w-full rounded border border-white-light bg-white shadow-[4px_6px_10px_-3px_#bfc9d4] dark:border-[#1b2e4b] dark:bg-[#191e3a] dark:shadow-none"
        ref={setNodeRef}
        style={style}
      >
        <div className="py-4 px-6 flex flex-col md:flex-row justify-between items-center">
          <div className="flex items-center">
            <div
              {...attributes}
              {...listeners}
              ref={setNodeRef}
              className="cursor-grab"
            >
              <ThreeBarsSVG />
            </div>
            <h5 className="ml-3 text-xl font-semibold text-[#3b3f5c] dark:text-white-light">
              {page.title || page.funnelStep || ""}
            </h5>
          </div>
          <div className="flex justify-end items-center mt-4 sm:mt-0">
            <div className="ml-4 text-white-dark">
              <Link
                href={`/pages/editor.htm?v=5&project=${project ? project._id : "default"}&funnel=${funnel._id}&page=${page._id}&api=${encodeURIComponent(process.env.NEXT_PUBLIC_BASEURL || "")}`}
                className="flex items-center"
              >
                <PencilSquareSVG />
                <div className="ml-2">Edit Page</div>
              </Link>
            </div>
            <div className="ml-4 text-white-dark">
              <Link
                href={`${process.env.NEXT_PUBLIC_BASEURL}/preview/${funnel._id}/${page.path || ""}`}
                target="_blank"
                className="flex items-center"
              >
                <ArrowTopRightSVG />
                <div className="ml-2">View</div>
              </Link>
            </div>
            <div
              className="ml-4 text-white-dark cursor-pointer flex items-center"
              onClick={handlePageSettingsModalOpen}
            >
              <GearSVG />
              <div className="ml-2">Settings</div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default PageCard;
