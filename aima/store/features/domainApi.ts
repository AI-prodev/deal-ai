import { IDomain } from "@/interfaces/IDomain";
import { baseUrl } from "@/utils/baseUrl";
import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import { getSession } from "next-auth/react";

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

export type DomainRecord = {
  type?: number;
  dnsType: string;
  name: string;
  target?: string;
  strings?: string[];
  priority?: number;
  ttl?: number;
  isSet?: "loading" | "yes" | "no";
};

export const createDomainApi = createApi({
  reducerPath: "domainApi",
  baseQuery: customBaseQuery,
  endpoints: builder => ({
    getMyDomains: builder.query<IDomain[], {}>({
      query: ({}) => ({
        url: `/domains/me`,
        method: "GET",
      }),
    }),
    getDomain: builder.query<IDomain, { domainId: string }>({
      query: ({ domainId }) => ({
        url: `/domains/${domainId}`,
        method: "GET",
      }),
    }),
    checkDomainRecords: builder.query<DomainRecord[], { domainId: string }>({
      query: ({ domainId }) => ({
        url: `/domains/${domainId}/check`,
        method: "GET",
      }),
    }),
    getPrice: builder.query<any, { domain: string }>({
      query: ({ domain }) => ({
        url: `/price?domain=${encodeURIComponent(domain)}`,
        method: "GET",
      }),
    }),
    getToken: builder.query<any, {}>({
      query: ({}) => ({
        url: `/config`,
        method: "GET",
      }),
    }),
    autoRenew: builder.mutation<any, { domainId: string; autoRenew: boolean }>({
      query: ({ domainId, autoRenew }) => ({
        url: `/domains/${domainId}`,
        method: "POST",
        body: {
          autoRenew,
        },
      }),
    }),
    registerDomain: builder.mutation<any, { domain: string; token: string }>({
      query: ({ domain, token }) => ({
        url: `/domains/register/${domain}`,
        method: "POST",
        body: {
          domain,
        },
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      }),
    }),
    createNewSubscription: builder.mutation<
      any,
      { email: string; payment_method: string; domain: string }
    >({
      query: ({ email, payment_method, domain }) => ({
        url: `/newSubscription`,
        method: "POST",
        body: {
          email,
          payment_method,
          domain,
        },
      }),
    }),
    createSubscription: builder.mutation<
      any,
      { token: string; domain: string; email: string }
    >({
      query: ({ token, domain, email }) => ({
        url: `/subscription`,
        method: "POST",
        body: {
          domain,
          email,
        },
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      }),
    }),
    createDomain: builder.mutation<
      any,
      { domain: string; external: boolean; subscriptionId?: string }
    >({
      query: ({ domain, external, subscriptionId }) => ({
        url: `/domains`,
        method: "POST",
        body: {
          domain,
          external,
          subscriptionId,
        },
      }),
    }),
    deleteDomain: builder.mutation<any, { domainId: string }>({
      query: ({ domainId }) => ({
        url: `/domains/${domainId}`,
        method: "DELETE",
      }),
    }),
    cancelSubscription: builder.mutation<
      any,
      {
        domain: string;
        token: string;
        isRenew: boolean;
        domainName: string;
      }
    >({
      query: ({ domain, token, isRenew, domainName }) => ({
        url: `/renew`,
        method: "POST",
        body: {
          domain,
          isRenew,
          domainName,
        },
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      }),
    }),
    checkDomain: builder.mutation<any, { token: string; domainName: string }>({
      query: ({ token, domainName }) => ({
        url: `/domains/check/${domainName}`,
        method: "POST",
        body: {
          domainName,
        },
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      }),
    }),
    getZone: builder.mutation<any, { domainName: any; token: string }>({
      query: ({ domainName, token }) => ({
        url: `/domains/zone/${domainName}`,
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      }),
    }),
    deleteZone: builder.mutation<
      any,
      { domain: any; record: number; token: string }
    >({
      query: ({ domain, record, token }) => ({
        url: `/domains/zone/${record}/${domain}`,
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      }),
    }),
    addZone: builder.mutation<
      any,
      {
        domainName: any;
        name: string;
        type: string;
        content: string;
        token: string;
      }
    >({
      query: ({ domainName, name, type, content, token }) => ({
        url: `/domains/zone/${domainName}`,
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: {
          domainName,
          name,
          type,
          content,
        },
      }),
    }),
    EditZone: builder.mutation<
      any,
      {
        zone_id: any;
        id: string;
        name: string;
        content: string;
        token: string;
      }
    >({
      query: ({ zone_id, name, id, content, token }) => ({
        url: `/domains/${zone_id}/${id}`,
        method: "PATCH",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: {
          name,
          content,
        },
      }),
    }),
  }),
});
