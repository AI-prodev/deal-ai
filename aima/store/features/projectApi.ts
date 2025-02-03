import { IFunnel } from "@/interfaces/IFunnel";
import { IProject } from "@/interfaces/IProject";
import { baseUrl } from "@/utils/baseUrl";
import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import { getSession } from "next-auth/react";
import { FunnelType } from "@/enums/funnel-type.enum";

const customBaseQuery = fetchBaseQuery({
  baseUrl: baseUrl,
  prepareHeaders: async headers => {
    const session = await getSession();
    if (session && session.token) {
      headers.set("Authorization", `Bearer ${session.token}`);
    }
    return headers;
  },
});

export const createProjectApi = createApi({
  reducerPath: "projectApi",
  baseQuery: customBaseQuery,
  endpoints: builder => ({
    getMyProjects: builder.query<IProject[], {}>({
      query: ({}) => ({
        url: `/projects/me`,
        method: "GET",
      }),
    }),
    getProject: builder.query<IProject, { projectId: string }>({
      query: ({ projectId }) => ({
        url: `/projects/${projectId || "default"}`,
        method: "GET",
      }),
    }),
    createProject: builder.mutation<any, { title: string }>({
      query: ({ title }) => ({
        url: `/projects`,
        method: "POST",
        body: {
          title,
        },
      }),
    }),
    deleteProject: builder.mutation<any, { projectId: string }>({
      query: ({ projectId }) => ({
        url: `/projects/${projectId}`,
        method: "DELETE",
      }),
    }),
  }),
});

export const createFunnelApi = createApi({
  reducerPath: "funnelApi",
  baseQuery: customBaseQuery,
  endpoints: builder => ({
    getProjectFunnels: builder.query<
      IFunnel[],
      { projectId: string; type: FunnelType; archived?: boolean }
    >({
      query: ({ projectId, type, archived }) => ({
        url: `/funnels/${projectId}/project?type=${type}&archived=${archived}`,
        method: "GET",
      }),
    }),
    getFunnel: builder.query<IFunnel, { funnelId: string }>({
      query: ({ funnelId }) => ({
        url: `/funnels/${funnelId}`,
        method: "GET",
      }),
    }),
    createFunnel: builder.mutation<
      any,
      { title: string; projectId: string; type: FunnelType }
    >({
      query: ({ title, projectId, type }) => ({
        url: `/funnels`,
        method: "POST",
        body: {
          projectId,
          title,
          ...(type && type !== FunnelType.ULTRA_FAST_FUNNEL && { type }),
        },
      }),
    }),
    createFunnelWithAI: builder.mutation<
      any,
      {
        businessName: string;
        prompt: any;
        projectId: string;
        type: FunnelType;
      }
    >({
      query: ({ businessName, projectId, prompt, type }) => ({
        url: `/funnels-with-ai`,
        method: "POST",
        body: {
          projectId,
          title: businessName,
          prompt,
          ...(type && type !== FunnelType.ULTRA_FAST_FUNNEL && { type }),
        },
      }),
    }),
    cloneFunnel: builder.mutation<any, { funnelId: string }>({
      query: ({ funnelId }) => ({
        url: `/funnels/clone`,
        method: "POST",
        body: {
          funnelId,
        },
      }),
    }),
    importFunnel: builder.mutation<
      any,
      { funnelId: string; projectId: string }
    >({
      query: ({ funnelId, projectId }) => ({
        url: `/funnels/import`,
        method: "POST",
        body: {
          funnelId,
          projectId,
        },
      }),
    }),
    updateFunnelSettings: builder.mutation<
      any,
      {
        funnelId: string;
        settings: {
          businessName?: string;
          businessDescription?: string;
          tone?: string;
          toneAdditionalInfo?: string;
          aggressiveness?: number;
          hookCreative?: number;
          targetAudience?: string;
        };
      }
    >({
      query: ({ funnelId, settings }) => ({
        url: `/funnels/${funnelId}/settings`,
        method: "PATCH",
        body: {
          ...settings,
        },
      }),
    }),
    updateFunnelTitle: builder.mutation<
      any,
      {
        funnelId: string;
        title: string;
      }
    >({
      query: ({ funnelId, title }) => ({
        url: `/funnels/${funnelId}/title`,
        method: "PATCH",
        body: {
          title,
        },
      }),
    }),
    updateFunnelDomain: builder.mutation<
      any,
      {
        funnelId: string;
        domainId: string | undefined;
      }
    >({
      query: ({ funnelId, domainId }) => ({
        url: `/funnels/${funnelId}/domain`,
        method: "PATCH",
        body: {
          domainId,
        },
      }),
    }),
    updateFunnelWebhook: builder.mutation<
      any,
      {
        funnelId: string;
        webhooks: string[];
      }
    >({
      query: ({ funnelId, webhooks }) => ({
        url: `/funnels/${funnelId}/webhook`,
        method: "PATCH",
        body: {
          webhooks,
        },
      }),
    }),
    updateFunnelFavicon: builder.mutation<
      any,
      {
        funnelId: string;
        formData: FormData;
      }
    >({
      query: ({ funnelId, formData }) => ({
        url: `/funnels/${funnelId}/favicon`,
        method: "PATCH",
        body: formData,
      }),
    }),
    deleteFunnelFavicon: builder.mutation<
      any,
      {
        funnelId: string;
      }
    >({
      query: ({ funnelId }) => ({
        url: `/funnels/${funnelId}/favicon`,
        method: "DELETE",
      }),
    }),
    deleteFunnel: builder.mutation<any, { funnelId: string }>({
      query: ({ funnelId }) => ({
        url: `/funnels/${funnelId}`,
        method: "DELETE",
      }),
    }),
    archiveFunnel: builder.mutation<any, { funnelId: string }>({
      query: ({ funnelId }) => ({
        url: `/funnels/${funnelId}/archive`,
        method: "PATCH",
      }),
    }),
    restoreFunnel: builder.mutation<any, { funnelId: string }>({
      query: ({ funnelId }) => ({
        url: `/funnels/${funnelId}/restore`,
        method: "PATCH",
      }),
    }),
    updateFunnelSteps: builder.mutation<
      any,
      {
        funnelId: string;
        ids: string[];
      }
    >({
      query: ({ funnelId, ids }) => ({
        url: `/funnels/${funnelId}/reorder`,
        method: "PATCH",
        body: ids,
      }),
    }),
    getFunnelMenu: builder.query<
      any,
      {
        funnelId: string;
      }
    >({
      query: ({ funnelId }) => ({
        url: `/funnels/${funnelId}/menus`,
        method: "GET",
      }),
    }),
    updateFunnelMenu: builder.mutation<
      any,
      { funnelId: string; pageIds: string[] }
    >({
      query: ({ funnelId, pageIds }) => ({
        url: `/funnels/${funnelId}/menu`,
        method: "PATCH",
        body: {
          pageIds,
        },
      }),
    }),
    listFunnelStats: builder.query({
      query: ({ funnelId, page = 1, limit = 10, sort, filters = {} }) => {
        let params = new URLSearchParams();
        params.append("page", String(page));
        params.append("limit", String(limit));
        // if (sort) {
        //   params.append("sort", sort);
        // }
        for (const key in filters) {
          if (Object.prototype.hasOwnProperty.call(filters, key)) {
            params.append(key, filters[key]);
          }
        }
        return {
          url: `/funnels/${funnelId}/stats?${params.toString()}`,
        };
      },
    }),
  }),
});
