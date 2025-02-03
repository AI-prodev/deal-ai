import { IPage } from "@/interfaces/IPage";
import React, {
  Dispatch,
  SetStateAction,
  useEffect,
  useMemo,
  useState,
} from "react";
import NewPageModal from "./NewPageModal";
import { createPageApi } from "@/store/features/pageApi";
import { IFunnel } from "@/interfaces/IFunnel";
import { IProject } from "@/interfaces/IProject";
import FunnelPageCard from "./FunnelPageCard";
import {
  Active,
  DndContext,
  DragOverlay,
  DropAnimation,
  KeyboardSensor,
  PointerSensor,
  defaultDropAnimationSideEffects,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import {
  SortableContext,
  arrayMove,
  sortableKeyboardCoordinates,
  rectSortingStrategy,
} from "@dnd-kit/sortable";
import { createFunnelApi } from "@/store/features/projectApi";
import { useRouter } from "next/router";
import { FunnelType } from "@/enums/funnel-type.enum";
import clsx from "clsx";
import { showSuccessToast } from "@/utils/toast";

const dropAnimationConfig: DropAnimation = {
  sideEffects: defaultDropAnimationSideEffects({
    styles: {
      active: {
        opacity: "0.4",
      },
    },
  }),
};

const FunnelPanelLeft = ({
  isLightMode = false,
  pages,
  funnel,
  project,
  selectedPage,
  setSelectedPage,
}: {
  isLightMode?: boolean;
  pages: IPage[];
  funnel: IFunnel;
  project: IProject | undefined;
  selectedPage: IPage | null;
  setSelectedPage: Dispatch<SetStateAction<any>>;
}) => {
  const router = useRouter();
  const [isNewPageModalOpen, setIsNewPageModalOpen] = useState(false);
  let type = FunnelType.ULTRA_FAST_WEBSITE;

  switch (
    router.query.type as
      | "websites"
      | "funnels"
      | "easy-websites"
      | "simple-websites"
  ) {
    case "websites":
      type = FunnelType.ULTRA_FAST_WEBSITE;
      break;
    case "easy-websites":
      type = FunnelType.EASY_WEBSITES;
      break;
    case "funnels":
      type = FunnelType.ULTRA_FAST_FUNNEL;
      break;
    case "simple-websites":
      type = FunnelType.SIMPLE_WEBSITES;
      break;
    default:
      type = FunnelType.ULTRA_FAST_WEBSITE;
      break;
  }

  const { refetch: refetchPages } = createPageApi.useGetFunnelPagesQuery(
    { funnelId: funnel._id },
    { skip: !funnel._id }
  );
  const { refetch: refetchMenu } = createFunnelApi.useGetFunnelMenuQuery(
    { funnelId: funnel._id },
    { skip: !funnel._id }
  );
  const [updateFunnelSteps] = createFunnelApi.useUpdateFunnelStepsMutation();
  const [updateFunnelMenu] = createFunnelApi.useUpdateFunnelMenuMutation();
  const [active, setActive] = useState<Active | null>(null);
  const [orderedPages, setOrderedPages] = useState<IPage[] | []>(pages);
  const [orderedMenu, setOrderedMenu] = useState<IPage[] | []>(
    funnel.menu || []
  );
  const [creatingPage, setCreatingPage] = useState(false);

  const handlePageCreated = async () => {
    setCreatingPage(true);
    const result = await refetchPages();
    const updatedPages = result.data;

    if (updatedPages) {
      if (
        [FunnelType.ULTRA_FAST_FUNNEL, FunnelType.EASY_WEBSITES].includes(type)
      ) {
        setSelectedPage(updatedPages[updatedPages.length - 1]);
      } else if (
        [FunnelType.ULTRA_FAST_WEBSITE, FunnelType.SIMPLE_WEBSITES].includes(
          type
        )
      ) {
        // Find the new page
        const newPage = updatedPages[updatedPages.length - 1];
        // Add to a menu
        setOrderedMenu([...orderedMenu, newPage]);
        // Update the menu
        await onMenuReorder([
          ...orderedMenu.map(page => page._id),
          newPage._id,
        ]);
        // Set the new page as selected
        setSelectedPage(newPage);
      }
    }
    setCreatingPage(false);
  };

  const handleNewPageModalClose = () => {
    setIsNewPageModalOpen(false);
  };

  const handleNewPageModalOpen = () => {
    setIsNewPageModalOpen(true);
  };

  useEffect(() => {
    if (
      [FunnelType.ULTRA_FAST_WEBSITE, FunnelType.SIMPLE_WEBSITES].includes(type)
    ) {
      setOrderedPages(pages);
      if (pages.length === orderedPages.length) {
        setSelectedPage(
          orderedMenu[orderedMenu.length - 1] || pages[0] || null
        );
      } else {
        if (!creatingPage) {
          refetchMenu().then(data => {
            setOrderedMenu(data.data);
            if (data.data?.length) {
              setSelectedPage(data.data[data.data?.length - 1]);
            } else if (orderedPages?.length > 0 && pages?.length > 0) {
              setSelectedPage(orderedPages[0] || null);
            } else {
              setSelectedPage(null);
            }
          });
        }
      }
    } else {
      setOrderedPages(pages);
      setSelectedPage(pages[0] || null);
    }
  }, [pages]);

  useEffect(() => {
    setOrderedMenu(orderedMenu);
  }, [orderedMenu]);

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

  async function onMenuReorder(ids: string[]) {
    await updateFunnelMenu({ funnelId: funnel._id, pageIds: ids });
  }

  const handleDragEnd = async ({ active, over }: any) => {
    if (active && over) {
      if (active.id.startsWith("page_") && over.id.startsWith("menu_")) {
        // Page to menu
        const activeIndex = orderedPages.findIndex(
          ({ _id }) => `page_${_id}` === active.id
        );
        const newOrderedMenu = [...orderedMenu, orderedPages[activeIndex]];
        const newOrderedPages = orderedPages.filter(
          (_, i) => i !== activeIndex
        );
        setOrderedMenu(newOrderedMenu);
        setOrderedPages(newOrderedPages);
        await onMenuReorder(newOrderedMenu.map(om => om._id));
      } else if (active.id.startsWith("menu_") && over.id.startsWith("page_")) {
        // Menu to page
        const activeIndex = orderedMenu.findIndex(
          ({ _id }) => `menu_${_id}` === active.id
        );
        const newOrderedMenu = orderedMenu.filter((_, i) => i !== activeIndex);
        setOrderedMenu(newOrderedMenu);
        setOrderedPages([
          ...orderedPages.filter(
            i => orderedMenu.findIndex(({ _id }) => _id === i._id) === -1
          ),
          orderedMenu[activeIndex],
        ]);
        await onMenuReorder(newOrderedMenu.map(om => om._id));
      } else if (active.id.startsWith("menu_") && over.id.startsWith("menu_")) {
        // Menu to menu
        const activeIndex = orderedMenu.findIndex(
          ({ _id }) => `menu_${_id}` === active.id
        );
        const overIndex = orderedMenu.findIndex(
          ({ _id }) => `menu_${_id}` === over.id
        );

        const newOrderedMenu = arrayMove(orderedMenu, activeIndex, overIndex);
        setOrderedMenu(newOrderedMenu);
        await onMenuReorder(newOrderedMenu.map(page => page._id));
      } else if (active.id.startsWith("page_") && over.id.startsWith("page_")) {
        // Page to page
        const activeIndex = orderedPages.findIndex(
          ({ _id }) => `page_${_id}` === active.id
        );
        const overIndex = orderedPages.findIndex(
          ({ _id }) => `page_${_id}` === over.id
        );

        const newOrderedPages = arrayMove(orderedPages, activeIndex, overIndex);
        setOrderedPages(newOrderedPages);
        await onReorder(newOrderedPages.map(page => page._id));
      }
    } else if (active && !over) {
      if (active.id.startsWith("menu_")) {
        // Menu to empty
        const activeIndex = orderedMenu.findIndex(
          ({ _id }) => `menu_${_id}` === active.id
        );
        const newOrderedMenu = orderedMenu.filter((_, i) => i !== activeIndex);
        setOrderedMenu(newOrderedMenu);
        setOrderedPages([
          ...orderedPages.filter(
            i => orderedMenu.findIndex(({ _id }) => _id === i._id) === -1
          ),
          orderedMenu[activeIndex],
        ]);
        await onMenuReorder(newOrderedMenu.map(om => om._id));
      } else if (active.id.startsWith("page_")) {
        // Page to empty
        const activeIndex = orderedPages.findIndex(
          ({ _id }) => `page_${_id}` === active.id
        );
        setOrderedMenu([...orderedMenu, orderedPages[activeIndex]]);
        setOrderedPages(orderedPages.filter((_, i) => i !== activeIndex));
        await onMenuReorder([orderedPages[activeIndex]._id]);
      }
    } else {
      console.error("No handled case");
    }
    setActive(null);
    showSuccessToast({
      title: "Menu updated successfully",
      showCloseButton: false,
    });
  };

  return (
    <>
      <DndContext
        sensors={sensors}
        onDragStart={({ active }) => {
          setActive(active);
        }}
        onDragEnd={handleDragEnd}
        onDragCancel={() => {
          setActive(null);
        }}
      >
        {[FunnelType.ULTRA_FAST_WEBSITE, FunnelType.SIMPLE_WEBSITES].includes(
          type
        ) && (
          <>
            <h5
              className={clsx(
                "mt-5 mb-3 text-xl font-semibold overflow-hidden whitespace-nowrap overflow-ellipsis",
                {
                  "text-black": isLightMode,
                }
              )}
            >
              Menu
            </h5>
            <SortableContext
              items={orderedMenu?.map(m => `menu_${m._id}`) || []}
              strategy={rectSortingStrategy}
            >
              {orderedMenu.length > 0 ? (
                <div
                  className={
                    "border-green-600 border-2 rounded p-2 pb-0 min-h-16"
                  }
                >
                  <div className="grid grid-cols-1 max-w-[780px]">
                    {orderedMenu?.map(mu => (
                      <FunnelPageCard
                        key={`menu_${mu._id}`}
                        isLightMode={isLightMode}
                        page={mu}
                        type={"menu"}
                        selectedPage={selectedPage}
                        setSelectedPage={setSelectedPage}
                      />
                    ))}
                  </div>
                </div>
              ) : (
                <div
                  className={
                    "flex items-center justify-center text-xs font-semibold text-gray-400 border-green-600 border-2 rounded p-2 min-h-16"
                  }
                >
                  Drag and drop pages here to add to menu
                </div>
              )}
            </SortableContext>
          </>
        )}

        <h5
          className={clsx(
            "mt-5 mb-3 text-xl font-semibold overflow-hidden whitespace-nowrap overflow-ellipsis",
            {
              "text-black": isLightMode,
            }
          )}
        >
          {type !== FunnelType.ULTRA_FAST_FUNNEL
            ? "Other Pages"
            : "Funnel Steps"}
        </h5>
        <SortableContext
          items={orderedPages.map(page => `page_${page._id}`)}
          strategy={rectSortingStrategy}
        >
          {[FunnelType.ULTRA_FAST_WEBSITE, FunnelType.SIMPLE_WEBSITES].includes(
            type
          ) ? (
            orderedPages.filter(
              i => orderedMenu.findIndex(({ _id }) => _id === i._id) === -1
            ).length > 0 ? (
              <div className="grid grid-cols-1 max-w-[780px]">
                {orderedPages
                  .filter(
                    i =>
                      orderedMenu.findIndex(({ _id }) => _id === i._id) === -1
                  )
                  .map(page => (
                    <FunnelPageCard
                      key={`page_${page._id}`}
                      isLightMode={isLightMode}
                      page={page}
                      type={"page"}
                      selectedPage={selectedPage}
                      setSelectedPage={setSelectedPage}
                    />
                  ))}
              </div>
            ) : (
              <div
                className={clsx(
                  "flex items-center justify-center text-xs font-semibold border-white-600 border-2 rounded p-2 min-h-16",
                  {
                    "text-black": isLightMode,
                    "text-gray-400": !isLightMode,
                  }
                )}
              >
                Drag and drop pages here to remove from menu
              </div>
            )
          ) : orderedPages.length > 0 ? (
            <div className="grid grid-cols-1 max-w-[780px]">
              {orderedPages.map(page => (
                <FunnelPageCard
                  key={`page_${page._id}`}
                  isLightMode={isLightMode}
                  page={page}
                  type={"page"}
                  selectedPage={selectedPage}
                  setSelectedPage={setSelectedPage}
                />
              ))}
            </div>
          ) : (
            <div
              className={clsx(
                "flex items-center justify-center text-xs font-semibold border-white-600 border-2 rounded p-2 min-h-16",
                {
                  "text-black": isLightMode,
                  "text-gray-400": !isLightMode,
                }
              )}
            >
              Drag and drop steps here to reorder
            </div>
          )}
        </SortableContext>

        <DragOverlay dropAnimation={dropAnimationConfig}>
          {activeItem && (
            <FunnelPageCard
              key={activeItem._id}
              isLightMode={isLightMode}
              page={activeItem}
              type={activeItem._id.split("_")[0] as "menu" | "page"}
              selectedPage={selectedPage}
              setSelectedPage={setSelectedPage}
            />
          )}
        </DragOverlay>
      </DndContext>

      <div className="mt-3 flex justify-start">
        <button
          onClick={handleNewPageModalOpen}
          className="rounded bg-primary px-4 py-2 text-white"
        >
          + New {type !== FunnelType.ULTRA_FAST_FUNNEL ? "Page" : "Funnel Step"}
        </button>
      </div>
      <NewPageModal
        isLightMode={isLightMode}
        isOpen={isNewPageModalOpen}
        onRequestClose={handleNewPageModalClose}
        onPageCreated={handlePageCreated}
        project={project}
        funnel={funnel}
        type={type}
      />
    </>
  );
};

export default FunnelPanelLeft;
