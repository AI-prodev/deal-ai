import { DefaultProjectData } from "@/interfaces/IAppProject";
import {
  useGetSpecifcAppsPojectAppNameQuery,
  useLoadDefaultAppsProjectQuery,
  useUpdateApplicationFormValuesMutation,
} from "@/store/features/appsProjectApi";
import { useState, useEffect } from "react";

export const useHandleFormServer = (
  projectId: string,
  appName: string,
  localStorageFromValues: string,
  initValue: any,
  sharedFieldsToPersist: (keyof typeof initValue)[],
  formFieldsToPersist: (keyof typeof initValue)[]
) => {
  const [formValues, setFormValues] = useState<any>(initValue);
  const [updateFormValues, { isLoading: isUpdating }] =
    useUpdateApplicationFormValuesMutation();

  const separateFormValues = (values: any) => {
    const sharedValues = {} as any;
    const formValues = {} as any;
    Object.keys(values).forEach(key => {
      if (sharedFieldsToPersist.includes(key)) {
        sharedValues[key] = values[key];
      } else if (formFieldsToPersist.includes(key)) {
        formValues[key] = values[key];
      }
    });
    return { sharedValues, formValues };
  };

  const {
    data: defaultProjectData,
    refetch: refetchDefaultProject,
    isLoading: isDefaultProjectLoading,
  } = useLoadDefaultAppsProjectQuery("") as {
    data: DefaultProjectData;
    refetch: () => void;
    isLoading: boolean;
  };

  const {
    data: appData,
    refetch: refetchAppData,
    isLoading: isAppDataLoading,
  } = useGetSpecifcAppsPojectAppNameQuery(
    {
      projectId: projectId,

      appName: appName,
    },
    { skip: !projectId }
  );

  useEffect(() => {
    setFormValues(initValue);
    if (!isAppDataLoading && projectId) {
      refetchAppData();
    }
  }, [projectId]);

  useEffect(() => {
    if (appData && appData.formValues === null) {
      setFormValues(initValue);
    }

    if (appData && (appData.formValues || appData?.sharedFormValues)) {
      const combinedValues = {
        ...initValue,
        ...(appData?.sharedFormValues || {}),
        ...(appData?.formValues || {}),
      };

      setFormValues(combinedValues);
    }
  }, [appData]);

  useEffect(() => {
    const loadAndClearLocalStorage = async () => {
      const sharedValuesLocal = localStorage.getItem("sharedFormValues");
      const formValuesLocal = localStorage.getItem(localStorageFromValues);

      if (
        appData &&
        appData.formValues === null &&
        defaultProjectData?._id &&
        formValuesLocal &&
        sharedValuesLocal
      ) {
        const combinedValues = {
          ...(sharedValuesLocal ? JSON.parse(sharedValuesLocal) : {}),
          ...(formValuesLocal ? JSON.parse(formValuesLocal) : {}),
        };
        const { sharedValues, formValues } = separateFormValues(combinedValues);

        setFormValues(combinedValues);

        try {
          await updateFormValues({
            projectId: defaultProjectData._id,
            appName,
            formValues: formValues,
            sharedFormValues: sharedValues,
          }).unwrap();

          // localStorage.removeItem('sharedFormValues');
          localStorage.removeItem(localStorageFromValues);
        } catch (error) {
          console.error(
            "Failed to update form values from localStorage:",
            error
          );
        }
      }
    };

    loadAndClearLocalStorage();
  }, [projectId, appName, updateFormValues, appData]);

  const manuallyUpdateFormValues = async (values: object) => {
    const { sharedValues, formValues } = separateFormValues(values);

    try {
      await updateFormValues({
        projectId,
        appName,
        formValues: formValues,
        sharedFormValues: sharedValues,
      }).unwrap();

      // setFormValues(values);
    } catch (error) {
      console.error("Failed to manually update form values:", error);
    }
  };

  return {
    formValues,
    setFormValues,
    manuallyUpdateFormValues,
    isUpdating,
  };
};
