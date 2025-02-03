import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import { getSession } from "next-auth/react";

const baseUrl = process.env.NEXT_PUBLIC_BASEURL || "http://localhost:3000";

const customBaseQuery = fetchBaseQuery({
  baseUrl: baseUrl,
  prepareHeaders: async headers => {
    const session = await getSession();
    if (session?.token) {
      headers.set("Authorization", `Bearer ${session.token}`);
    }
    return headers;
  },
});

export const appsProjectApi = createApi({
  reducerPath: "appsProjectApi",
  baseQuery: customBaseQuery,
  endpoints: builder => ({
    migrateDataToAppsProject: builder.mutation<any, { applications: any[] }>({
      query: ({ applications }) => ({
        url: `/apps-project/migrate`,
        method: "POST",
        body: { applications },
      }),
    }),
    loadDefaultAppsProject: builder.query<any, string>({
      query: () => `/apps-project/default/`,
    }),
    updateAppsProject: builder.mutation<
      any,
      { projectId: string; name: string; applications?: any[] }
    >({
      query: ({ projectId, applications, name }) => ({
        url: `/apps-project/update/${projectId}`,
        method: "PUT",
        body: { name },
      }),
    }),
    createAppsProject: builder.mutation<
      any,
      { name: string; applications: any[] }
    >({
      query: body => ({
        url: `/apps-project/create`,
        method: "POST",
        body,
      }),
    }),
    listAllAppsProjects: builder.query<any, string>({
      query: () => `/apps-project/list/`,
    }),
    updateSpecificAppsProject: builder.mutation<
      any,
      { projectId: string; applications: any[] }
    >({
      query: ({ projectId, applications }) => ({
        url: `/apps-project/update-specific/${projectId}`,
        method: "PUT",
        body: { applications },
      }),
    }),
    updateSpecificAppsProjectContentItmes: builder.mutation<
      any,
      { projectId: string; applications: any[] }
    >({
      query: ({ projectId, applications }) => ({
        url: `/apps-project/update-specific-contentItems/${projectId}`,
        method: "PUT",
        body: { applications },
      }),
    }),
    getSpecifcAppsPojectAppName: builder.query<
      any,
      { projectId: string; appName: string }
    >({
      query: ({ projectId, appName }) =>
        `/apps-project/list/${projectId}/${appName}`,
    }),

    deleteSpecificCreation: builder.mutation<
      any,
      {
        projectId: string;
        appName: string;
        generationNumber: number;
        creationId: string;
      }
    >({
      query: ({ projectId, appName, generationNumber, creationId }) => ({
        url: `/apps-project/${projectId}/${appName}/${generationNumber}/${creationId}`,
        method: "DELETE",
      }),
    }),

    deleteSpecificGeneration: builder.mutation<
      any,
      {
        projectId: string;
        appName: string;
        generationNumber: number;
      }
    >({
      query: ({ projectId, appName, generationNumber }) => ({
        url: `/apps-project/${projectId}/${appName}/${generationNumber}`,
        method: "DELETE",
      }),
    }),
    deleteAppsProject: builder.mutation<any, { projectId: string }>({
      query: ({ projectId }) => ({
        url: `/apps-project/${projectId}`,
        method: "DELETE",
      }),
    }),
    //update form values
    updateApplicationFormValues: builder.mutation<
      any,
      {
        projectId: string;
        appName: string;
        formValues: any;
        sharedFormValues: any;
      }
    >({
      query: ({ projectId, appName, formValues, sharedFormValues }) => ({
        url: `/apps-project/${projectId}/${appName}/update-form-values`,
        method: "PUT",
        body: { formValues, sharedFormValues },
      }),
    }),
    //get latest benefits-stack
    getBenefitStackWithHighestGeneration: builder.query<
      any,
      { projectId: string }
    >({
      query: ({ projectId }) =>
        `/apps-project/${projectId}/benefit-stack/high-gen`,
    }),
  }),
});

export const {
  useMigrateDataToAppsProjectMutation,
  useLoadDefaultAppsProjectQuery,
  useUpdateAppsProjectMutation,
  useCreateAppsProjectMutation,
  useListAllAppsProjectsQuery,
  useUpdateSpecificAppsProjectMutation,
  useGetSpecifcAppsPojectAppNameQuery,
  useDeleteSpecificCreationMutation,
  useDeleteSpecificGenerationMutation,
  useUpdateSpecificAppsProjectContentItmesMutation,
  useDeleteAppsProjectMutation,
  useUpdateApplicationFormValuesMutation,
  useGetBenefitStackWithHighestGenerationQuery,
} = appsProjectApi;
