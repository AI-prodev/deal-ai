import React, { useEffect, useState, useMemo } from "react";
import {
  defaultDropAnimationSideEffects,
  DndContext,
  DragOverlay,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import type { Active, DropAnimation } from "@dnd-kit/core";
import {
  SortableContext,
  arrayMove,
  sortableKeyboardCoordinates,
} from "@dnd-kit/sortable";
import { IFunnel } from "@/interfaces/IFunnel";
import { IProject } from "@/interfaces/IProject";
import { IPage } from "@/interfaces/IPage";
import { createFunnelApi } from "@/store/features/projectApi";
// import FunnelCard from './FunnelCard'
import PageCard from "./PageCard";

const dropAnimationConfig: DropAnimation = {
  sideEffects: defaultDropAnimationSideEffects({
    styles: {
      active: {
        opacity: "0.4",
      },
    },
  }),
};

const PageList = ({
  pages,
  funnel,
  project,
  onUpdate,
}: {
  pages: IPage[];
  funnel: IFunnel;
  project: IProject | undefined;
  onUpdate: () => void;
}) => {
  const [updateFunnelSteps] = createFunnelApi.useUpdateFunnelStepsMutation();

  const [orderedPages, setOrderedPages] = useState(pages);

  useEffect(() => {
    setOrderedPages(pages);
  }, [pages]);

  const [active, setActive] = useState<Active | null>(null);
  const activeItem = useMemo(
    () => orderedPages.find(item => item._id === active?.id),
    [active, orderedPages]
  );
  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  async function onReorder(ids: string[]) {
    await updateFunnelSteps({ funnelId: funnel._id, ids });
  }

  return (
    <DndContext
      sensors={sensors}
      onDragStart={({ active }) => {
        setActive(active);
      }}
      onDragEnd={({ active, over }) => {
        if (over && active.id !== over?.id) {
          const activeIndex = orderedPages.findIndex(
            ({ _id }) => _id === active.id
          );
          const overIndex = orderedPages.findIndex(
            ({ _id }) => _id === over.id
          );

          const newOrderedPages = arrayMove(
            orderedPages,
            activeIndex,
            overIndex
          );
          setOrderedPages(newOrderedPages);
          onReorder(newOrderedPages.map(page => page._id));
        }
        setActive(null);
      }}
      onDragCancel={() => {
        setActive(null);
      }}
    >
      <SortableContext items={orderedPages.map(page => page._id)}>
        <div className="mb-5 mt-6 grid gap-4 grid-cols-1 max-w-[780px]">
          {orderedPages.map((page, i) => (
            <PageCard
              key={page._id}
              project={project}
              funnel={funnel}
              page={page}
              onUpdate={onUpdate}
            />
          ))}
        </div>
      </SortableContext>

      <DragOverlay dropAnimation={dropAnimationConfig}>
        {activeItem && (
          <PageCard
            key={activeItem._id}
            project={project}
            funnel={funnel}
            page={activeItem}
            onUpdate={onUpdate}
          />
        )}
      </DragOverlay>
    </DndContext>
  );
};

export default PageList;
