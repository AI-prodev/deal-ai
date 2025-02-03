import AppButton from "@/components/appstore/AppButton";
import { createProfileAPI } from "@/store/features/profileApi";
import { useSession } from "next-auth/react";
import React, { useEffect, useState } from "react";
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  rectSortingStrategy,
} from "@dnd-kit/sortable";
import SortableItem from "./SortableItem";
import ParticlesAnimation from "@/components/ParticlesAnimation";

import { useDispatch } from "react-redux";
import { setPageTitle } from "@/store/themeConfigSlice";
import Head from "next/head";

const AiApp: React.FC = () => {
  const dispatch = useDispatch();

  const { data: myApps, refetch: refetchMyApps } =
    createProfileAPI.useGetMyAppsQuery();
  const [reorderApps] = createProfileAPI.useReorderAppsMutation();

  const { data: session } = useSession();
  const userRoles = session?.user?.roles || [];

  const [isEditMode, setIsEditMode] = useState(false);
  const [items, setItems] = useState(() => myApps?.map(app => app._id) || []);
  const [sortedApps, setSortedApps] = useState(myApps || []);

  useEffect(() => {
    if (myApps) {
      setItems(
        myApps
          .filter(({ roles }) => roles.some(role => userRoles.includes(role)))
          .filter(
            app =>
              (app.isUnreleased !== true ||
                process.env.NEXT_PUBLIC_HIDE_UNRELEASED !== "true") &&
              !app.isForced
          )
          .map(a => a._id)
      );
      setSortedApps(
        myApps
          .filter(({ roles }) => roles.some(role => userRoles.includes(role)))
          .filter(
            app =>
              (app.isUnreleased !== true ||
                process.env.NEXT_PUBLIC_HIDE_UNRELEASED !== "true") &&
              !app.isForced
          )
      );
    }
  }, [myApps]);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 2,
        delay: 250,
        tolerance: 5,
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    if (active.id !== over?.id) {
      setItems(items => {
        const oldIndex = items.indexOf(active.id as string);
        const newIndex = items.indexOf(over ? (over.id as string) : "");

        setSortedApps(prev => {
          const updatedSortedApps = arrayMove(prev, oldIndex, newIndex);
          reorderApps({ appIds: updatedSortedApps.map(a => a._id) });
          return updatedSortedApps;
        });
        return arrayMove(items, oldIndex, newIndex);
      });
    }
  };

  return (
    <>
      <Head>
        <title>Home Screen</title>
      </Head>
      <div className="relative -m-6 ai-app-container">
        <div
          className="min-h-screen bg-cover bg-center p-4 md:p-6 content-container opacity-90"
          style={{
            backgroundImage: "url('/assets/Purple-background.webp')",
          }}
          onClick={() => setIsEditMode(false)}
        >
          <ParticlesAnimation />
          <DndContext
            sensors={sensors}
            collisionDetection={closestCenter}
            onDragEnd={handleDragEnd}
          >
            <div className="md:flex md:flex-row-reverse">
              {sortedApps.length > 0 && (
                <div className="mb-3 md:mb-0 mt-3 flex md:block justify-end  ">
                  <a
                    href=""
                    onClick={e => {
                      e.preventDefault();
                      e.stopPropagation();
                      setIsEditMode(!isEditMode);
                    }}
                    className={`rounded btn btn-primary py-1 px-4 text-sm font-semibold text-white`}
                  >
                    {isEditMode ? "Done" : "Edit"}
                  </a>
                </div>
              )}

              <SortableContext
                items={items}
                disabled={{ draggable: !isEditMode }}
                strategy={rectSortingStrategy}
              >
                <div className="mb-5 px-2 grid grid-cols-2 md:flex md:flex-wrap w-full">
                  {sortedApps.map(app => (
                    <SortableItem key={app._id} id={app._id}>
                      <div className="flex flex-col items-center justify-center w-full md:w-auto mb-8 md:mb-0">
                        <AppButton
                          app={app}
                          isEditMode={isEditMode}
                          appChanged={refetchMyApps}
                        />
                      </div>
                    </SortableItem>
                  ))}
                </div>
              </SortableContext>
            </div>
            <div className="mb-5 px-2 grid grid-cols-2 md:flex md:flex-wrap w-full">
              {(myApps || [])
                .filter(({ roles }) =>
                  roles.some(role => userRoles.includes(role))
                )
                .filter(
                  app =>
                    (app.isUnreleased !== true ||
                      process.env.NEXT_PUBLIC_HIDE_UNRELEASED !== "true") &&
                    app.isForced
                )
                .filter(app => app.title !== "Reset")
                .map(app => (
                  <div
                    key={app._id}
                    className="flex flex-col items-center justify-center w-full md:w-auto mb-8 md:mb-0"
                  >
                    <AppButton
                      app={app}
                      isEditMode={false}
                      appChanged={refetchMyApps}
                    />
                  </div>
                ))}
            </div>
          </DndContext>
        </div>
      </div>
    </>
  );
};

export default AiApp;
