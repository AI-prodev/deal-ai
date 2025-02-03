import React, { Dispatch, SetStateAction } from "react";
import { IFunnel } from "@/interfaces/IFunnel";
import { IProject } from "@/interfaces/IProject";
// import { IPage } from "@/interfaces/IPage";
import { createPageApi } from "@/store/features/pageApi";
// import AppCard from "../AppCard";
import FunnelPages from "./FunnelPages";
// import PageCard from "./PageCard";
// import PageList from "./PageList";

const FunnelHome = ({
  funnel,
  project,
  toggleFunnelTabs,
}: {
  funnel: IFunnel;
  project: IProject | undefined;
  toggleFunnelTabs: Dispatch<SetStateAction<any>>;
}) => {
  const { data: pages, refetch: refetchPages } =
    createPageApi.useGetFunnelPagesQuery({ funnelId: funnel._id });

  if (!pages) {
    return <></>;
  }
  const benefitStackUrl = `/apps/benefit-stack?funnelId=${funnel._id}`;
  const magicHooksUrl = `/apps/magic-hooks?funnelId=${funnel._id}`;

  return (
    <div className="grid gap-4 md:grid-cols-1">
      {/* <PageList
        funnel={funnel}
        project={project}
        pages={pages}
        onUpdate={refetchPages}
      /> */}
      <FunnelPages
        funnel={funnel}
        project={project}
        pages={pages}
        onUpdate={refetchPages}
        toggleFunnelTabs={toggleFunnelTabs}
      />
      {/* <div className="mt-2 flex justify-start">
        <button
          onClick={handleNewPateModalOpen}
          className="rounded bg-primary px-4 py-2 text-white"
        >
          + New Page
        </button>
      </div> */}
      {/* <div className="flex flex-wrap gap-4">
        <AppCard
          href={`/projects/${project._id}/funnels/${funnel._id}/pages/new`}
          image="/assets/images/page_generator.png"
          name="Page Generator 🪄"
          unreleased={true}
        />
        <AppCard
          href={magicHooksUrl}
          image="/assets/images/magic-hooks.png"
          name="Magic Hooks 🪝"
        />
        <AppCard
          href={benefitStackUrl}
          image="/assets/images/magic-benefit-stacks.png"
          name="Benefit Stacks 📈"
        />
        <AppCard
          href="/apps/bonus-stack"
          image="/assets/images/bonus-stack.png"
          name="Bonus Stacks ✨"
          unreleased={true}
        />
        <AppCard
          href="/apps/faq"
          image="/assets/images/faq.png"
          name="FAQs ❓"
          unreleased={true}
        />
      </div> */}
    </div>
  );
};

export default FunnelHome;
