import { useEffect, useState } from "react";
import {
  useMigrateDataToAppsProjectMutation,
  useLoadDefaultAppsProjectQuery,
  useGetSpecifcAppsPojectAppNameQuery,
} from "@/store/features/appsProjectApi";
import { debounce } from "lodash";

interface ContentItem {
  name: string;
  contentId: string;
}
interface Generation {
  generationNumber?: number;
  hooks: any[];
}

interface Application {
  appName: string;
  generations?: any[];
  creations?: any[];
  contentItems?: ContentItem[];
}

interface DefaultProjectData {
  _id: string;
  applications: Application[];
}

const useDataMigration = (
  tokenKey: string,
  appName: string,
  useGenerations: boolean = true,
  isTokenKeyGen: boolean = true,
  isContentItems: boolean = false
) => {
  const tokenKeyGen = isContentItems
    ? `${tokenKey}`
    : isTokenKeyGen
      ? `${tokenKey}Generations`
      : tokenKey;
  const [migrateDataToAppsProject] = useMigrateDataToAppsProjectMutation();
  const {
    data: defaultProjectData,
    isLoading: isDefaultProjectLoading,
    refetch: refetchDefaultProject,
  } = useLoadDefaultAppsProjectQuery("") as {
    data: DefaultProjectData;
    isLoading: boolean;
    refetch: () => void;
  };

  const {
    data: appData,
    refetch: refetchAppData,
    isLoading: isAppDataLoading,
  } = useGetSpecifcAppsPojectAppNameQuery(
    {
      projectId: defaultProjectData?._id as string,

      appName: appName,
    },
    { skip: !defaultProjectData?._id }
  );

  const [isMigrationNeeded, setIsMigrationNeeded] = useState(false);
  const [isMigrationSuccess, setIsMigrationSuccess] = useState(false);
  const checkForMigration = (
    localData: Generation[] | ContentItem[],
    backendData: DefaultProjectData
  ): boolean => {
    if (localData.length <= 0) {
      return false;
    }

    if (!backendData || backendData?.applications?.length === 0) {
      return true;
    }

    const backendIds = new Set(
      isContentItems
        ? backendData.applications.flatMap(app =>
            app.contentItems?.map(item => item.contentId)
          )
        : backendData.applications.flatMap(app =>
            useGenerations
              ? app.generations?.flatMap(gen =>
                  gen.creations.map((creation: any) => creation._id)
                )
              : app.creations || []
          )
    );

    const checkforMigrate = localData.some((generation: any) =>
      isContentItems
        ? !backendIds.has(generation.id as any)
        : appName.includes("idea")
          ? !backendIds.has(generation.id)
          : generation.hooks.some((hook: any) => !backendIds.has(hook.id))
    );
    return checkforMigrate;
  };

  const formatDataForMigration = (
    localData: Generation[] | ContentItem[]
  ): Application[] => {
    if (isContentItems) {
      const ensureImageArray = (item: any) => {
        if (item.image && !Array.isArray(item.image)) {
          item.image = { content: [item.image] };
        }
        return item;
      };

      return [
        {
          appName,
          contentItems: (localData as ContentItem[]).map(ensureImageArray),
        },
      ];
    } else {
      if (useGenerations) {
        return [
          {
            appName,
            generations: localData.map((generation: any, index: number) => ({
              generationNumber: index + 1,
              creations: appName.includes("idea")
                ? { _id: generation?.id }
                : generation.hooks.map((hook: any) => ({
                    _id: hook.id,
                  })),
            })),
          },
        ];
      } else {
        return [
          {
            appName,
            creations: localData.flatMap((generation: any) =>
              generation.hooks.map((hook: any) => ({
                _id: hook.id,
              }))
            ),
          },
        ];
      }
    }
  };

  useEffect(() => {
    const migrateIfNeeded = debounce(async () => {
      setIsMigrationSuccess(false);
      // const savedData: Generation[] = JSON.parse(
      //   localStorage.getItem(tokenKeyGen) || "[]",
      // );

      const savedData: Generation[] | ContentItem[] = JSON.parse(
        localStorage.getItem(
          `${tokenKey}${isContentItems ? "" : "Generations"}`
        ) || "[]"
      );
      if (isDefaultProjectLoading) return;

      const needsMigration = checkForMigration(savedData, defaultProjectData);

      if (needsMigration) {
        setIsMigrationNeeded(true);
        const formattedData = formatDataForMigration(savedData);

        if (formattedData.length > 0) {
          const data = await migrateDataToAppsProject({
            applications: formattedData,
          }).unwrap();
          if (data && data.success === true) {
            setIsMigrationSuccess(true);

            localStorage.removeItem(tokenKeyGen);
            setIsMigrationNeeded(false);
          }
        } else {
          setIsMigrationNeeded(false);
        }
      } else {
        setIsMigrationNeeded(false);
      }

      if (appData) {
        refetchAppData();
      }
    }, 2000);

    migrateIfNeeded();
    return () => migrateIfNeeded.cancel();
  }, [
    tokenKey,
    migrateDataToAppsProject,
    defaultProjectData,
    isDefaultProjectLoading,

    refetchAppData,
  ]);

  return { isMigrationNeeded, isTokenKeyGen, isMigrationSuccess };
};

export default useDataMigration;
